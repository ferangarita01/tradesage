
'use server';

import { z } from "zod";
import { modelsMap } from "@/ai/models/sageLLMs";
import { analyzeChart } from "./analyze-chart-patterns";
import { ai } from "../genkit";


const CandleSchema = z.object({
  time: z.string(),
  price: z.number(),
});

const ChatInputSchema = z.object({
  message: z.string(),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant", "tool"]),
        content: z.string(),
      })
    )
    .optional(),
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
    
    const isGptModel = model === 'gpt';
    const apiKey = isGptModel ? process.env.OPENAI_API_KEY : process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      const errorMsg = isGptModel
        ? "La clave OPENAI_API_KEY no está configurada."
        : "La clave OPENROUTER_API_KEY no está configurada.";
      console.error(`❌ ${errorMsg}`);
      return { response: `Error: ${errorMsg}` };
    }

    const modelKey = model as keyof typeof modelsMap;
    const modelToUse = modelsMap[modelKey] || modelsMap.mistral;

    const systemPrompt = `You are TradeSage, an AI assistant specializing in cryptocurrency analysis.
    If the user asks about the chart, technical analysis, patterns, or trends, you MUST use the 'analyzeChart' tool to get data-driven insights.
    Provide concise and helpful answers based on the tool's output. Do not make up analysis.
    The user is currently viewing the chart for: ${assetName || 'an unknown asset'}.`;
    
    // El modelo de IA a usar
    const llm = ai.model(modelToUse);
   
    // Ejecuta la generación de la respuesta con la herramienta de análisis de gráficos
    const response = await ai.generate({
      model: llm,
      prompt: {
        system: systemPrompt,
        messages: [
          ...history,
          { role: "user", content: message },
        ],
      },
      tools: [analyzeChart],
      toolChoice: 'auto',
      context: { // Proporciona el contexto para que las herramientas puedan usarlo
        assetName: assetName,
        candles: candles,
      },
    });

    return { response: response.text };
  }
);


export async function chat(input: ChatInput): Promise<ChatOutput> {
  return chatFlow(input);
}
