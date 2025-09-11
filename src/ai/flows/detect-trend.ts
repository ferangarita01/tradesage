// src/ai/flows/detect-trend.ts

import type { Candle } from "./preprocess-data";

// === Helpers ===
function sma(values: number[], period: number): number {
  if (values.length < period) return NaN;
  const slice = values.slice(-period);
  return slice.reduce((a, b) => a + b, 0) / period;
}

// Detecta tendencia usando EMA/SMA comparando ventanas
export function detectTrend(
  candles: Candle[],
  shortPeriod = 10,
  longPeriod = 30
): "bullish" | "bearish" | "sideways" {
  const closes = candles.map(c => c.close);
  if (closes.length < longPeriod) return "sideways";

  const short = sma(closes, shortPeriod);
  const long = sma(closes, longPeriod);

  if (short > long * 1.01) return "bullish";
  if (short < long * 0.99) return "bearish";
  return "sideways";
}

// Ejemplo de wrapper: retorna JSON reutilizable
export function detectTrendSummary(candles: Candle[]) {
  const trend = detectTrend(candles);
  return {
    trend,
    last_close: candles[candles.length - 1].close
  };
}