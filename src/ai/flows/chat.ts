
'use server';

/**
 * @fileOverview A simple chat flow for CryptoSage.
 *
 * - chat - A function that handles the chat process.
 * - ChatInput - The input type for the chat function.
 * - ChatOutput - The return type for the chat function.
 */

import {generate} from 'genkit/generate';
import {defineTool, Tool} from 'genkit/tool';
import {z} from 'genkit/zod';
import {
  mistralLLM,
  llamaLLM,
  yiLLM,
  gptLLM,
} from '@/ai/models/sageLLMs';

const modelsMap: Record<string, any> = {
  mistral: mistralLLM,
  llama: llamaLLM,
  yi: yiLLM,
  gpt: gptLLM,
};

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
  model: z.string().optional().default('mistral'),
});
export type ChatInput = z.infer<typeof ChatInputSchema>;

const ChatOutputSchema = z.object({
  response: z.string().describe("The chat bot's response."),
});
export type ChatOutput = z.infer<typeof ChatOutputSchema>;

export async function chat(input: ChatInput): Promise<ChatOutput> {
  return chatFlow(input);
}

const getMarketDataTool: Tool = defineTool(
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
        .describe(
          'The interval for the candles, e.g., 1m, 5m, 1h, 1d. Defaults to 15m.'
        ),
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

import {flow} from 'genkit/flow';

const chatFlow = flow(
  {
    name: 'chatFlow',
    inputSchema: ChatInputSchema,
    outputSchema: ChatOutputSchema,
  },
  async (input: ChatInput) => {
    const {message, history, model = 'mistral'} = input;
    const modelToUse = modelsMap[model] || mistralLLM;

    const result = await generate({
      model: modelToUse,
      prompt: message,
      history: history,
      tools: [getMarketDataTool],
      output: {
        schema: z.object({
          response: z.string(),
        }),
      },
    });

    const output = result.output();

    return {
      response:
        output?.response || 'I am sorry, I could not generate a response.',
    };
  }
);
