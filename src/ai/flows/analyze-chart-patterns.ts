
'use server';

/**
 * @fileOverview An AI agent that analyzes cryptocurrency charts to identify patterns and trends.
 *
 * - analyzeChart - A function that handles the chart analysis process.
 * - AnalyzeChartInput - The input type for the analyzeChart function.
 * - AnalyzeChartOutput - The return type for the analyzeChart function.
 */
import {generate} from 'genkit/generate';
import {prompt} from 'genkit/prompt';
import {flow} from 'genkit/flow';
import {z} from 'genkit/zod';
import { mistralLLM } from '../models/sageLLMs';

const CandleSchema = z.object({
  time: z.string(),
  price: z.number(),
});

const AnalyzeChartInputSchema = z.object({
  candles: z
    .array(CandleSchema)
    .describe('The historical price data for the asset.'),
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

export async function analyzeChart(
  input: AnalyzeChartInput
): Promise<AnalyzeChartOutput> {
  return analyzeChartFlow(input);
}

const analyzeChartPrompt = prompt({
  name: 'analyzeChartPrompt',
  model: mistralLLM,
  input: {schema: AnalyzeChartInputSchema},
  output: {schema: AnalyzeChartOutputSchema},
  prompt: `Analyze the following {{assetName}} price data for {{analysisType}} detection.
Focus on technical analysis patterns like head and shoulders, triangles, channels, and overall trends.

Candles (last 50 periods):
{{{json candles}}}

Provide a concise summary of your findings.`,
});

const analyzeChartFlow = flow(
  {
    name: 'analyzeChartFlow',
    inputSchema: AnalyzeChartInputSchema,
    outputSchema: AnalyzeChartOutputSchema,
  },
  async input => {
    try {
      const result = await generate({
        prompt: analyzeChartPrompt,
        model: mistralLLM,
        input,
      });
      return result.output()!;
    } catch (e) {
      console.error('Chart analysis failed:', e);
      // Return a default error response that matches the expected schema
      return {
        analysisResult: 'AI analysis failed or no clear pattern was detected.',
        confidenceLevel: 0.0,
      };
    }
  }
);
