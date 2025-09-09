
'use server';

import { z } from 'zod';
import { modelsMap } from '@/ai/models/sageLLMs';

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

/**
 * Sends a chat message directly to the OpenRouter API using fetch.
 * This approach bypasses Genkit for the chat functionality to ensure
 * robust handling of conversation history.
 */
export async function chat(input: ChatInput): Promise<ChatOutput> {
  const { message, history, model = 'mistral' } = input;
  const modelKey = model as keyof typeof modelsMap;
  const modelToUse = modelsMap[modelKey] || modelsMap.mistral;

  // Format the history for the OpenRouter API
  const messages = history.map(h => ({
    role: h.role,
    // The API expects content as a simple string, not an array of text objects
    content: h.content.map(c => c.text).join(' '),
  }));

  // Add the current user message
  messages.push({
    role: 'user',
    content: message,
  });

  try {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: modelToUse,
        messages: messages,
      }),
    });

    if (!res.ok) {
        const errorBody = await res.text();
        console.error("OpenRouter API Error:", res.status, errorBody);
        return { response: `API Error: ${res.status}. Please check the server logs.` };
    }

    const data = await res.json();
    const choice = data.choices?.[0]?.message?.content;

    if (!choice) {
        console.error("Invalid response structure from OpenRouter:", data);
        return { response: "Sorry, I received an invalid response from the AI." };
    }

    return { response: choice };

  } catch (error) {
    console.error("Failed to fetch from OpenRouter:", error);
    return { response: "Sorry, I'm having trouble connecting to the AI. Please try again later." };
  }
}
