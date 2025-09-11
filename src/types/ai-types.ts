import {z} from 'zod';

// Common Schemas
const CandleSchema = z.object({
  time: z.string(),
  price: z.number(),
});

// Types for analyze-chart-patterns.ts
export const AnalyzeChartInputSchema = z.object({
  candles: z
    .array(CandleSchema)
    .describe('The historical price data for the asset.'),
  assetName: z.string().describe('The name of the cryptocurrency asset.'),
});
export type AnalyzeChartInput = z.infer<typeof AnalyzeChartInputSchema>;

export const AnalyzeChartOutputSchema = z.object({
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

// Types for detect-chart-patterns.ts
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

// Types for chat.ts
export const ChatInputSchema = z.object({
  history: z.array(z.any()),
  message: z.string(),
  assetName: z.string().optional(),
  candles: z.array(z.any()).optional(),
  model: z.string().optional(),
});
export type ChatInput = z.infer<typeof ChatInputSchema>;

export const ChatOutputSchema = z.object({
  response: z.string(),
});
export type ChatOutput = z.infer<typeof ChatOutputSchema>;
