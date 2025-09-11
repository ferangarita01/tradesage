import { RSI, MACD, EMA, BollingerBands } from "technicalindicators";
import type { Candle } from "./preprocess-data";

export interface IndicatorsSummary {
  rsi: number | null;
  macd: {
    signal: "bullish_crossover" | "bearish_crossover" | "neutral";
    histogram: number | null;
  };
  ema: {
    short: number | null;
    long: number | null;
  };
  bollinger: {
    upper: number | null;
    middle: number | null;
    lower: number | null;
    width: number | null;
  };
}

export function analyzeIndicators(candles: Candle[]): IndicatorsSummary {
  const closes = candles.map(c => c.close);

  // --- RSI
  const rsiValues = RSI.calculate({ values: closes, period: 14 });
  const rsi = rsiValues.length > 0 ? rsiValues[rsiValues.length - 1] : null;

  // --- MACD
  const macdValues = MACD.calculate({
    values: closes,
    fastPeriod: 12,
    slowPeriod: 26,
    signalPeriod: 9,
    SimpleMAOscillator: false,
    SimpleMASignal: false
  });

  let macdSignal: IndicatorsSummary["macd"]["signal"] = "neutral";
  let macdHistogram: number | null = null;

  if (macdValues.length > 0) {
    const macdLast = macdValues[macdValues.length - 1];
    if (macdLast?.MACD !== undefined && macdLast?.signal !== undefined) {
      if (macdLast.MACD > macdLast.signal) macdSignal = "bullish_crossover";
      if (macdLast.MACD < macdLast.signal) macdSignal = "bearish_crossover";
    }
    macdHistogram = macdLast?.histogram ?? null;
  }

  // --- EMA
  const shortEMAarr = EMA.calculate({ values: closes, period: 12 });
  const longEMAarr = EMA.calculate({ values: closes, period: 26 });
  const emaShort = shortEMAarr.length > 0 ? shortEMAarr[shortEMAarr.length - 1] : null;
  const emaLong = longEMAarr.length > 0 ? longEMAarr[longEMAarr.length - 1] : null;

  // --- Bollinger Bands
  const bbValues = BollingerBands.calculate({
    values: closes,
    period: 20,
    stdDev: 2
  });
  const bbLast = bbValues.length > 0 ? bbValues[bbValues.length - 1] : null;

  return {
    rsi,
    macd: {
      signal: macdSignal,
      histogram: macdHistogram
    },
    ema: {
      short: emaShort,
      long: emaLong
    },
    bollinger: {
      upper: bbLast?.upper ?? null,
      middle: bbLast?.middle ?? null,
      lower: bbLast?.lower ?? null,
      width: bbLast ? bbLast.upper - bbLast.lower : null
    }
  };
}