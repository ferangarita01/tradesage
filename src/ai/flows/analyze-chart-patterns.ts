
'use server';

/**
 * @fileOverview An AI agent that analyzes cryptocurrency charts to identify patterns and trends.
 *
 * - analyzeChart - A Genkit tool that handles the chart analysis process.
 * - AnalyzeChartInput - The input type for the analyzeChart function.
 * - AnalyzeChartOutput - The return type for the analyzeChart function.
 */
import { z } from 'zod';
import { ai } from '../genkit';
import { modelsMap } from '../models/sageLLMs';

const CandleSchema = z.object({
  time: z.string(),
  price: z.number(),
});

const AnalyzeChartInputSchema = z.object({
  candles: z
    .array(CandleSchema)
    .describe('The historical price data for the asset.'),
  assetName: z.string().describe('The name of the cryptocurrency asset.'),
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


const analyzeChartPrompt = ai.definePrompt({
    name: 'analyzeChartPrompt',
    input: {schema: AnalyzeChartInputSchema},
    output: {schema: AnalyzeChartOutputSchema},
    prompt: `Analyze the following {{assetName}} price data for trend and pattern detection.
  Focus on technical analysis patterns like head and shoulders, triangles, channels, and overall trends.

  Candles (last 50 periods):
  {{{json candles}}}

  Provide a concise summary of your findings.`,
  });


const analyzeChartFlow = ai.defineFlow(
  {
    name: 'analyzeChartFlow',
    inputSchema: AnalyzeChartInputSchema,
    outputSchema: AnalyzeChartOutputSchema,
  },
  async (input) => {
    try {
        const {output} = await analyzeChartPrompt(input, { model: modelsMap.mistral });
        return output!;
    } catch (e) {
      console.error('Chart analysis failed:', e);
      return {
        analysisResult: 'AI analysis failed or no clear pattern was detected.',
        confidenceLevel: 0.0,
      };
    }
  }
);


export const analyzeChart = ai.defineTool(
  {
    name: 'analyzeChart',
    description:
      'Analyzes historical price data (candles) for a given asset to identify technical patterns or trends. Use this when the user asks for analysis, diagnosis, or to identify patterns on the chart.',
    inputSchema: AnalyzeChartInputSchema,
    outputSchema: AnalyzeChartOutputSchema,
  },
  async (input) => {
    console.log('Analyzing chart with tool using input:', input);
    return await analyzeChartFlow(input);
  }
);
