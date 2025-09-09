
'use server';

import { z } from 'zod';
import { modelsMap } from '@/ai/models/sageLLMs';
import { ai } from '../genkit';

const ChatInputSchema = z.object({
  message: z.string(),
  history: z.array(
    z.object({
      role: z.enum(['user', 'model']),
      content: z.array(z.object({ text: z.string() })),
    })
  ),
  model: z.string().optional().default('mistral'),
});
export type ChatInput = z.infer<typeof ChatInputSchema>;

const ChatOutputSchema = z.object({
  response: z.string(),
});
export type ChatOutput = z.infer<typeof ChatOutputSchema>;

export async function chat(input: ChatInput): Promise<ChatOutput> {
  return chatFlow(input);
}

const chatFlow = ai.defineFlow(
  {
    name: 'chatFlow',
    inputSchema: ChatInputSchema,
    outputSchema: ChatOutputSchema,
  },
  async (input: ChatInput) => {
    const { message, history, model = 'mistral' } = input;
    const modelKey = model as keyof typeof modelsMap;
    const modelToUse = modelsMap[modelKey] || modelsMap.mistral;

    // ⚠️ Tu versión de ai.generate NO soporta "history" directamente
    // → concatenamos manually el historial al prompt
    const historyPrompt = history
      .map(h => `${h.role}: ${h.content.map(c => c.text).join(' ')}`)
      .join('\n');

    const finalPrompt = `${historyPrompt}\nuser: ${message}`;

    const result = await ai.generate({
      model: modelToUse,
      prompt: finalPrompt,
    });

    return {
      response: result.text ?? 'I could not generate a response.',
    };
  }
);
