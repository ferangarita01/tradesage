'use server';

/**
 * @fileOverview A simple chat flow for CryptoSage.
 *
 * - chat - A function that handles the chat process.
 * - ChatInput - The input type for the chat function.
 * - ChatOutput - The return type for the chat function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { analyzeChartFlow } from './analyze-chart-patterns';
import { aggregateRelevantNewsFlow } from './aggregate-relevant-news';

const ChatInputSchema = z.object({
  message: z.string().describe('The user\'s message to the chat bot.'),
  history: z.array(z.object({
    role: z.enum(['user', 'model']),
    content: z.array(z.object({
        text: z.string()
    }))
  })).describe('The conversation history.'),
});
export type ChatInput = z.infer<typeof ChatInputSchema>;

const ChatOutputSchema = z.object({
  response: z.string().describe('The chat bot\'s response.'),
});
export type ChatOutput = z.infer<typeof ChatOutputSchema>;

export async function chat(input: ChatInput): Promise<ChatOutput> {
  return chatFlow(input);
}

const prompt = ai.definePrompt({
  name: 'chatPrompt',
  input: {schema: ChatInputSchema},
  output: {schema: ChatOutputSchema},
  tools: [analyzeChartFlow, aggregateRelevantNewsFlow],
  prompt: `You are a helpful AI assistant for an application called CryptoSage, which provides cryptocurrency and stock analysis tools.
Your name is Sage. Be friendly, concise, and helpful.

The user is asking for help. Here is the conversation history:
{{#each history}}
  {{#if (eq role 'user')}}User: {{content.[0].text}}{{/if}}
  {{#if (eq role 'model')}}Sage: {{content.[0].text}}{{/if}}
{{/each}}

User's new message: {{{message}}}

Provide your response. Use the available tools if necessary to answer the user's question.`,
});

const chatFlow = ai.defineFlow(
  {
    name: 'chatFlow',
    inputSchema: ChatInputSchema,
    outputSchema: ChatOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
