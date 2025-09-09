
'use server';

import { z } from "zod";
import { modelsMap } from "@/ai/models/sageLLMs";
import { analyzeChart } from "./analyze-chart-patterns";
import { ai } from "../genkit";

const MessageSchema = z.object({
  role: z.enum(["user", "assistant", "tool"]),
  content: z.string(),
});

const CandleSchema = z.object({
  time: z.string(),
  price: z.number(),
});

const ChatInputSchema = z.object({
  message: z.string(),
  history: z.array(MessageSchema).optional(),
  assetName: z.string().optional(),
  candles: z.array(CandleSchema).optional(),
  model: z.string().optional().default("mistral"),
});
export type ChatInput = z.infer<typeof ChatInputSchema>;

const ChatOutputSchema = z.object({
  response: z.string(),
});
export type ChatOutput = z.infer<typeof ChatOutputSchema>;

const chatFlow = ai.defineFlow(
  {
    name: 'chatFlow',
    inputSchema: ChatInputSchema,
    outputSchema: ChatOutputSchema,
  },
  async (input) => {
    const { message, history = [], model = "mistral", assetName, candles } = input;
    
    const modelKey = model as keyof typeof modelsMap;
    const modelToUse = modelsMap[modelKey] || modelsMap.mistral;
    
    const systemPrompt = `You are TradeSage, an AI assistant specializing in cryptocurrency analysis.
    If the user asks about the chart, technical analysis, patterns, or trends, you MUST use the 'analyzeChart' tool to get data-driven insights.
    Provide concise and helpful answers based on the tool's output. Do not make up analysis.
    The user is currently viewing the chart for: ${assetName || 'an unknown asset'}.`;
   
    try {
      const response = await ai.generate({
        model: modelToUse,
        prompt: {
          system: systemPrompt,
          messages: [
            ...history.map(h => ({ role: h.role, content: [{ text: h.content }] })),
            { role: "user", content: [{ text: message }] },
          ],
        },
        tools: [analyzeChart],
        toolChoice: 'auto',
        context: {
          assetName,
          candles,
        }
      });

      return { response: response.text };
    } catch (e: any) {
        console.error(`Error during AI generation with model ${modelToUse}:`, e);
        const errorMsg = e.message || 'An unknown error occurred.';
        return { response: `Sorry, something went wrong. ${errorMsg}` };
    }
  }
);

export async function chat(input: ChatInput): Promise<ChatOutput> {
  return chatFlow(input);
}
