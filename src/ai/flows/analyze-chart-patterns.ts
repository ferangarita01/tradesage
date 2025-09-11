
'use server';

/**
 * @fileOverview An AI agent that analyzes cryptocurrency charts to identify patterns and trends.
 *
 * - analyzeChart - A Genkit tool that handles the chart analysis process.
 */
import {
  AnalyzeChartInput,
  AnalyzeChartInputSchema,
  AnalyzeChartOutput,
  AnalyzeChartOutputSchema,
} from '@/types/ai-types';
import {ai} from '../genkit';
import {modelsMap} from '../models/sageLLMs';

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
  async input => {
    try {
      const {output} = await analyzeChartPrompt(input, {
        model: modelsMap.mistral as any,
      });
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

export async function analyzeChart(
  input: AnalyzeChartInput
): Promise<AnalyzeChartOutput> {
  return await analyzeChartFlow(input);
}
