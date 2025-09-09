
'use server';

/**
 * @fileOverview An AI agent that analyzes cryptocurrency charts to identify patterns and trends.
 *
 * - analyzeChart - A function that handles the chart analysis process.
 * - AnalyzeChartInput - The input type for the analyzeChart function.
 * - AnalyzeChartOutput - The return type for the analyzeChart function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { chatComplete } from '@/ai/providers/chat';

const CandleSchema = z.object({
  time: z.string(),
  price: z.number(),
});

const AnalyzeChartInputSchema = z.object({
  candles: z.array(CandleSchema).describe("The historical price data for the asset."),
  assetName: z.string().describe('The name of the cryptocurrency asset.'),
  analysisType: z
    .enum(['trend', 'pattern'])
    .describe('The type of analysis to perform: trend or pattern.'),
});
export type AnalyzeChartInput = z.infer<typeof AnalyzeChartInputSchema>;

const AnalyzeChartOutputSchema = z.object({
  analysisResult: z.string().describe('The result of the chart analysis.'),
  confidenceLevel: z
    .number()
    .min(0)
    .max(1)
    .describe(
      'A number between 0 and 1 indicating the confidence level of the analysis result.'
    ),
});
export type AnalyzeChartOutput = z.infer<typeof AnalyzeChartOutputSchema>;

export async function analyzeChart(input: AnalyzeChartInput): Promise<AnalyzeChartOutput> {
  const userPrompt = `
Analyze the following ${input.assetName} price data for ${input.analysisType} detection.
Focus on technical analysis patterns like head and shoulders, triangles, channels, and overall trends.

Candles (last 50 periods):
${JSON.stringify(input.candles.slice(-50))}

Provide a concise summary of your findings.

Respond ONLY in valid JSON format with two keys: "analysisResult" (a string with your summary) and "confidenceLevel" (a number from 0.0 to 1.0).
`;

  try {
    const raw = await chatComplete({
      user: userPrompt,
      model: "openai/gpt-4o-mini", // via OpenRouter
      temperature: 0.1,
    });

    const parsed = AnalyzeChartOutputSchema.parse(JSON.parse(raw));
    return parsed;
  } catch (e) {
    console.error("Chart analysis failed:", e);
    // Return a default error response that matches the expected schema
    return { analysisResult: "AI analysis failed or no clear pattern was detected.", confidenceLevel: 0.0 };
  }
}

export const analyzeChartFlow = ai.defineFlow(
  {
    name: 'analyzeChartFlow',
    inputSchema: AnalyzeChartInputSchema,
    outputSchema: AnalyzeChartOutputSchema,
  },
  async (input) => {
    return await analyzeChart(input);
  }
);
