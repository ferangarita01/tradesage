
import { z } from "zod";

// --- Candle Schema (OHLC completo) ---
export const CandleSchema = z.object({
  time: z.union([z.number(), z.string()]),   // 🔥 acepta número y string
  open: z.number(),
  high: z.number(),
  low: z.number(),
  close: z.number(),
  volume: z.number(),
});
export type Candle = z.infer<typeof CandleSchema>;

// --- Types for analyze-chart-patterns.ts ---
export const AnalyzeChartInputSchema = z.object({
  candles: z
    .array(CandleSchema)
    .describe("The historical OHLCV data for the asset."),
  assetName: z.string().describe("The name of the cryptocurrency asset."),
});
export type AnalyzeChartInput = z.infer<typeof AnalyzeChartInputSchema>;

export const AnalyzeChartOutputSchema = z.object({
  analysisResult: z
    .string()
    .describe("The result of the chart analysis."),
  confidenceLevel: z
    .number()
    .min(0)
    .max(1)
    .describe("Confidence level between 0 and 1."),
});
export type AnalyzeChartOutput = z.infer<typeof AnalyzeChartOutputSchema>;

// --- Types for detect-chart-patterns.ts ---
export const DetectChartPatternsInputSchema = z.object({
  candles: z
    .array(CandleSchema)
    .describe("The historical OHLCV data for the asset."),
  assetName: z.string().describe("The name of the cryptocurrency asset."),
});
export type DetectChartPatternsInput = z.infer<
  typeof DetectChartPatternsInputSchema
>;

const PointSchema = z.object({
  time: z
    .string()
    .describe("Timestamp for a point in the pattern."),
  price: z.number().describe("The price at that point."),
});

export const PatternSchema = z.object({
  name: z
    .string()
    .describe("The name of the detected pattern (e.g., Head and Shoulders)."),
  type: z
    .enum(["trendline", "support", "resistance", "fibonacci", "other"])
    .describe("Pattern classification."),
  points: z
    .array(PointSchema)
    .min(2)
    .describe("Points defining the pattern, must exist in candles."),
});
export type Pattern = z.infer<typeof PatternSchema>;


export const DetectChartPatternsOutputSchema = z.object({
  patterns: z
    .array(PatternSchema)
    .describe("Detected drawable chart patterns."),
});
export type DetectChartPatternsOutput = z.infer<
  typeof DetectChartPatternsOutputSchema
>;

// --- Types for chat.ts ---
export const ChatInputSchema = z.object({
  history: z.array(z.any()),
  message: z.string(),
  assetName: z.string().optional(),
  candles: z.array(CandleSchema).optional(), // 🔥 ahora usa CandleSchema de OHLC
  model: z.string().optional(),
});
export type ChatInput = z.infer<typeof ChatInputSchema>;

export const ChatOutputSchema = z.object({
  response: z.string(),
});
export type ChatOutput = z.infer<typeof ChatOutputSchema>;
