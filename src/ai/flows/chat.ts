
'use server';

/**
 * @fileOverview TradeSage Chat Flow with chart analysis capabilities.
 */
import { z } from 'zod';
import { ai } from '../genkit';
import { modelsMap } from '@/ai/models/sageLLMs';
import { analyzeChart } from './analyze-chart-patterns';

const CandleSchema = z.object({
  time: z.string(),
  price: z.number(),
});

const ChatInputSchema = z.object({
  message: z.string().describe('The user\'s message.'),
  history: z
    .array(
      z.object({
        role: z.enum(['user', 'model']),
        content: z.array(z.object({ text: z.string() })),
      })
    )
    .optional()
    .describe('The conversation history.'),
  assetName: z.string().optional().describe('The current asset being viewed.'),
  candles: z
    .array(CandleSchema)
    .optional()
    .describe('The recent price data for the asset.'),
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
    tools: [analyzeChart],
  },
  async input => {
    const {
      message,
      history = [],
      assetName = 'the current asset',
      candles,
      model = 'mistral',
    } = input;
    const modelKey = model as keyof typeof modelsMap;
    const modelToUse = modelsMap[modelKey] || modelsMap.mistral;

    const candleDataInfo = candles
      ? `The user is currently viewing a chart for ${assetName} with the latest ${candles.length} price candles. You can use the analyzeChart tool to find trends or patterns.`
      : `The user is not currently viewing a chart.`;

    const systemPrompt = `You are TradeSage, an expert AI trading assistant. 
Be concise and helpful. 
Your primary function is to answer questions about trading and analyze cryptocurrency charts.
${candleDataInfo}
If the user asks for analysis, a diagnosis of the chart, or to identify patterns/trends, use the \`analyzeChart\` tool. You must provide both the assetName and the candles to the tool.
Do not make up information about prices or trends. Use the tools provided.`;

    const result = await ai.generate({
      model: modelToUse,
      system: systemPrompt,
      prompt: message,
      history: history,
      tools: [analyzeChart],
      toolConfig: {
        // Force the model to use our tool if it seems relevant.
        choice: 'auto',
      },
      config: {
        // Add a bit of temperature to make the conversation feel more natural
        temperature: 0.3,
      },
    });

    const text = result.text;
    const toolCalls = result.toolCalls;

    if (toolCalls.length > 0) {
      console.log(`Executing ${toolCalls.length} tool calls...`);
      const toolResult = await ai.runToolCalls(toolCalls);

      // Re-run generate with the tool results to get a final response
      const finalResult = await ai.generate({
        model: modelToUse,
        system: systemPrompt,
        prompt: message,
        history: [
          ...history,
          result.request.history[result.request.history.length - 1], // user message
          result.message, // model's tool call request
          ...toolResult.messages, // tool output
        ],
        tools: [analyzeChart],
      });
      return { response: finalResult.text ?? 'Tool executed, but no text response.' };
    }

    return { response: text ?? 'I could not generate a response.' };
  }
);
