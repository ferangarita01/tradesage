// src/ai/flows/analyze-chart-patterns.ts
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

const AnalyzeChartInputSchema = z.object({
  chartDataUri: z
    .string()
    .describe(
      "A chart of a cryptocurrency, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
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
    .describe(
      'A number between 0 and 1 indicating the confidence level of the analysis result.'
    ),
});
export type AnalyzeChartOutput = z.infer<typeof AnalyzeChartOutputSchema>;

export async function analyzeChart(input: AnalyzeChartInput): Promise<AnalyzeChartOutput> {
  return analyzeChartFlow(input);
}

const analyzeChartPrompt = ai.definePrompt({
  name: 'analyzeChartPrompt',
  input: {schema: AnalyzeChartInputSchema},
  output: {schema: AnalyzeChartOutputSchema},
  prompt: `You are an expert cryptocurrency chart analyst.

You will analyze the provided chart image of {{assetName}} to identify patterns and trends, based on the specified analysis type.

Analysis Type: {{analysisType}}
Chart Image: {{media url=chartDataUri}}

Based on the chart, provide a detailed analysis result and a confidence level (0-1) for the accuracy of the analysis.

Consider factors such as support and resistance levels, trend lines, chart patterns (e.g., head and shoulders, double top, etc.), and volume to generate the analysis.

Ensure that the analysisResult is a well-structured paragraph.

Confidence Level guidelines:
- Low (0-0.3): Indicate high uncertainty or weak signals.
- Medium (0.3-0.7): Moderate confidence in the identified patterns or trends.
- High (0.7-1): Strong confidence based on clear and well-defined chart formations.

`,
});

const analyzeChartFlow = ai.defineFlow(
  {
    name: 'analyzeChartFlow',
    inputSchema: AnalyzeChartInputSchema,
    outputSchema: AnalyzeChartOutputSchema,
  },
  async input => {
    const {output} = await analyzeChartPrompt(input);
    return output!;
  }
);
