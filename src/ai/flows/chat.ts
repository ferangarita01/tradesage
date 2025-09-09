
'use server';

import { z } from 'zod';
import { modelsMap } from '@/ai/models/sageLLMs';
import { ai } from '../genkit';
import { MessageData } from '@genkit-ai/core';

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

    // Convert history to the format expected by ai.chat
    const genkitHistory: MessageData[] = history.map(h => ({
      role: h.role,
      content: h.content,
    }));

    const result = await ai.chat({
      model: modelToUse,
      history: genkitHistory,
      prompt: message,
    });

    return {
      response: result.text ?? 'I could not generate a response.',
    };
  }
);
