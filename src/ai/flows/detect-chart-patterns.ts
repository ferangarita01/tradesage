'use server';

/**
 * @fileOverview An AI agent that detects drawable chart patterns from price data.
 *
 * - detectChartPatterns - A Genkit flow that identifies technical patterns and returns structured data for drawing.
 */
import {
  DetectChartPatternsInput,
  DetectChartPatternsInputSchema,
  DetectChartPatternsOutput,
  DetectChartPatternsOutputSchema,
} from '@/types/ai-types';
import {ai} from '../genkit';
import {modelsMap} from '../models/sageLLMs';

const detectChartPatternsPrompt = ai.definePrompt({
  name: 'detectChartPatternsPrompt',
  input: {schema: DetectChartPatternsInputSchema},
  output: {schema: DetectChartPatternsOutputSchema},
  prompt: `You are a world-class technical analysis expert for financial markets.
Your task is to identify up to 5 of the most significant, drawable patterns from the provided price data for {{assetName}}.

Focus on clear, objective patterns like:
- Trendlines (ascending, descending)
- Support and Resistance levels (horizontal lines)
- Channels (parallel trendlines)

For each pattern, you must provide a name, a type, and the exact points (time and price) from the input data that are required to draw it. A line needs at least two points.

Candles data (last 50 periods):
{{{json candles}}}

Respond ONLY with the JSON structure defined in the output schema. Do not add any extra commentary.
`,
});

const detectChartPatternsFlow = ai.defineFlow(
  {
    name: 'detectChartPatternsFlow',
    inputSchema: DetectChartPatternsInputSchema,
    outputSchema: DetectChartPatternsOutputSchema,
  },
  async input => {
    try {
      const {output} = await detectChartPatternsPrompt(input, {
        model: modelsMap.mistral as any,
      });
      return output!;
    } catch (e) {
      console.error('Pattern detection analysis failed:', e);
      return {
        patterns: [],
      };
    }
  }
);

export async function detectChartPatterns(
  input: DetectChartPatternsInput
): Promise<DetectChartPatternsOutput> {
  return await detectChartPatternsFlow(input);
}
