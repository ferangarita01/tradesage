
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
import { mistralModel } from '../genkit';

const ChatInputSchema = z.object({
  message: z.string().describe("The user's message to the chat bot."),
  history: z
    .array(
      z.object({
        role: z.enum(['user', 'model']),
        content: z.array(
          z.object({
            text: z.string(),
          })
        ),
      })
    )
    .describe('The conversation history.'),
});
export type ChatInput = z.infer<typeof ChatInputSchema>;

const ChatOutputSchema = z.object({
  response: z.string().describe("The chat bot's response."),
});
export type ChatOutput = z.infer<typeof ChatOutputSchema>;

export async function chat(input: ChatInput): Promise<ChatOutput> {
  return chatFlow(input);
}

const getMarketDataTool = ai.defineTool(
  {
    name: 'getMarketData',
    description:
      'Get historical market data (candles) for a given asset symbol. Use this to analyze trends, prices, or perform technical analysis.',
    inputSchema: z.object({
      symbol: z
        .string()
        .describe('The asset symbol, e.g., BTCUSDT, ETHUSDT.'),
      interval: z
        .string()
        .optional()
        .describe('The interval for the candles, e.g., 1m, 5m, 1h, 1d. Defaults to 15m.'),
    }),
    outputSchema: z.object({
      candles: z
        .array(
          z.object({
            time: z.number(),
            open: z.number(),
            high: z.number(),
            low: z.number(),
            close: z.number(),
            volume: z.number(),
          })
        )
        .describe('An array of OHLCV candle data.'),
    }),
  },
  async ({symbol, interval = '15m'}) => {
    console.log(
      `Using tool to fetch market data for ${symbol} with interval ${interval}`
    );
    const response = await fetch(
      `http://localhost:9002/api/prices?symbol=${symbol}&interval=${interval}&limit=100`
    );
    if (!response.ok) {
      throw new Error(`Failed to fetch market data: ${response.statusText}`);
    }
    const data = await response.json();
    return {candles: data.candles};
  }
);

const prompt = ai.definePrompt({
  name: 'chatPrompt',
  model: mistralModel,
  input: {schema: ChatInputSchema},
  output: {schema: z.object({response: z.string()})},
  tools: [getMarketDataTool],
  prompt: `You are a helpful AI assistant for an application called CryptoSage, which provides cryptocurrency and stock analysis tools.
Your name is Sage. Be friendly, concise, and helpful.

The user is asking for help. Here is the conversation history:
{{#each history}}
  {{#if (eq role 'user')}}User: {{content.[0].text}}{{/if}}
  {{#if (eq role 'model')}}Sage: {{content.[0].text}}{{/if}}
{{/each}}

User's new message: {{{message}}}

To answer the user's question, you have access to one primary tool:
- \`getMarketData\`: Use this tool to get real-time and historical price data for assets like BTCUSDT, ETHUSDT, etc. This is your primary source for any price-related or chart analysis questions.

Think step-by-step. If the user asks about prices, trends, or to analyze a chart, you MUST use the \`getMarketData\` tool to fetch the data first. Once you have the data, you can analyze it to formulate your response.

If you use a tool, do not mention it in the response, just provide the final answer to the user based on the tool's output.`,
});

const chatFlow = ai.defineFlow(
  {
    name: 'chatFlow',
    inputSchema: ChatInputSchema,
    outputSchema: ChatOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return {
      response: output?.response || 'I am sorry, I could not generate a response.',
    };
  }
);
