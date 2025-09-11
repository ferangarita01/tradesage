'use server';

/**
 * @fileOverview An AI agent that detects drawable chart patterns from price data.
 *
 * - detectChartPatterns - A Genkit flow that identifies technical patterns and returns structured data for drawing.
 * - DetectChartPatternsInput - The input type for the flow.
 * - DetectChartPatternsOutput - The return type for the flow.
 */
import {z} from 'zod';
import {ai} from '../genkit';
import {modelsMap} from '../models/sageLLMs';

const CandleSchema = z.object({
  time: z.string(),
  price: z.number(),
});

export const DetectChartPatternsInputSchema = z.object({
  candles: z
    .array(CandleSchema)
    .describe('The historical price data for the asset.'),
  assetName: z.string().describe('The name of the cryptocurrency asset.'),
});
export type DetectChartPatternsInput = z.infer<
  typeof DetectChartPatternsInputSchema
>;

const PointSchema = z.object({
  time: z
    .string()
    .describe(
      'The timestamp for a point in the pattern, matching one from the input candles.'
    ),
  price: z.number().describe('The price at that point.'),
});

const PatternSchema = z.object({
  name: z
    .string()
    .describe(
      'The name of the detected pattern (e.g., "Uptrend Channel", "Resistance Line", "Head and Shoulders").'
    ),
  type: z
    .enum(['trendline', 'support', 'resistance', 'fibonacci', 'other'])
    .describe('The classification of the pattern.'),
  points: z
    .array(PointSchema)
    .min(2)
    .describe(
      'An array of two or more points that define the pattern shape. These points must correspond to actual points in the provided candle data.'
    ),
});

export const DetectChartPatternsOutputSchema = z.object({
  patterns: z
    .array(PatternSchema)
    .describe('An array of detected drawable patterns.'),
});
export type DetectChartPatternsOutput = z.infer<
  typeof DetectChartPatternsOutputSchema
>;

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
