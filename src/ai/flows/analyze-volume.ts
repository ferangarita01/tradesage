// src/ai/flows/analyze-volume.ts

import type { Candle } from "./preprocess-data";

export interface VolumeSummary {
  avgVolume: number | null;
  currentVolume: number | null;
  relativeVolume: number | null; // razón entre vol actual / vol promedio
  signal: "accumulation" | "distribution" | "neutral";
  spike: boolean; // true si el volumen actual es un "pico"
}

export function analyzeVolume(
  candles: Candle[],
  lookback: number = 20
): VolumeSummary {
  if (candles.length < lookback) {
    return {
      avgVolume: null,
      currentVolume: null,
      relativeVolume: null,
      signal: "neutral",
      spike: false,
    };
  }

  const recent = candles.slice(-lookback);
  const volumes = recent.map((c) => c.volume);
  const closes = recent.map((c) => c.close);

  const avgVolume = volumes.reduce((a, b) => a + b, 0) / volumes.length;
  const currentVolume = volumes[volumes.length - 1];
  const relativeVolume = avgVolume > 0 ? currentVolume / avgVolume : null;

  // Señal básica: acumulación = precio ↑ y volumen ↑ / distribución = precio ↓ y volumen ↑
  let signal: VolumeSummary["signal"] = "neutral";
  if (relativeVolume && relativeVolume > 1.3) {
    const priceChange = closes[closes.length - 1] - closes[0];
    if (priceChange > 0) signal = "accumulation";
    else if (priceChange < 0) signal = "distribution";
  }

  // Pico de volumen si es +60% del promedio
  const spike = relativeVolume !== null && relativeVolume > 1.6;

  return {
    avgVolume,
    currentVolume,
    relativeVolume,
    signal,
    spike,
  };
}