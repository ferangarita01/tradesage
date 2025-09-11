// src/ai/flows/preprocess-data.ts

// 👇 Tipado de los datos de entrada
export interface Candle {
    timestamp: number; // epoch
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
  }
  
  export interface PreprocessedData {
    trend: "bullish" | "bearish" | "sideways";
    support_levels: number[];
    resistance_levels: number[];
    rsi: number;
    macd: {
      signal: "bullish_crossover" | "bearish_crossover" | "neutral";
      strength: "low" | "medium" | "high";
    };
    last_close: number;
  }
  
  // === Helpers técnicos mínimos ===
  
  // Media simple
  function sma(values: number[], period: number): number {
    if (values.length < period) return NaN;
    const slice = values.slice(-period);
    return slice.reduce((a, b) => a + b, 0) / period;
  }
  
  // RSI (simplificado)
  function rsi(values: number[], period = 14): number {
    if (values.length < period + 1) return NaN;
    let gains = 0, losses = 0;
    for (let i = values.length - period; i < values.length; i++) {
      const diff = values[i] - values[i - 1];
      if (diff >= 0) gains += diff;
      else losses -= diff;
    }
    const rs = gains / (losses || 1);
    return 100 - 100 / (1 + rs);
  }
  
  // MACD (12-26-9)
  function macd(values: number[]): { line: number; signal: number } {
    const ema = (arr: number[], period: number): number => {
      const k = 2 / (period + 1);
      return arr.reduce((prev, curr, i) => {
        return i === 0 ? curr : curr * k + prev * (1 - k);
      }, 0);
    };
    const macdLine = ema(values, 12) - ema(values, 26);
    const signalLine = ema(values, 9);
    return { line: macdLine, signal: signalLine };
  }
  
  // Soportes / resistencias básicos
  function supportResistance(candles: Candle[], lookback = 20): { supports: number[]; resistances: number[] } {
    const slice = candles.slice(-lookback);
    const lows = slice.map(c => c.low);
    const highs = slice.map(c => c.high);
    const support = Math.min(...lows);
    const resistance = Math.max(...highs);
    return { supports: [support], resistances: [resistance] };
  }
  
  // Tendencia básica (última EMA vs más larga)
  function detectTrend(closes: number[]): "bullish" | "bearish" | "sideways" {
    const shortEMA = sma(closes, 10);
    const longEMA = sma(closes, 30);
    if (shortEMA > longEMA * 1.01) return "bullish";
    if (shortEMA < longEMA * 0.99) return "bearish";
    return "sideways";
  }
  
  // === Preprocesador principal ===
  export function preprocessData(candles: Candle[]): PreprocessedData {
    const closes = candles.map(c => c.close);
  
    const trend = detectTrend(closes);
    const { supports, resistances } = supportResistance(candles);
    const rsiValue = rsi(closes);
    const { line, signal } = macd(closes);
  
    let macdSignal: PreprocessedData["macd"]["signal"] = "neutral";
    let macdStrength: PreprocessedData["macd"]["strength"] = "low";
  
    if (line > signal) macdSignal = "bullish_crossover";
    if (line < signal) macdSignal = "bearish_crossover";
  
    if (Math.abs(line - signal) > 10) macdStrength = "high";
    else if (Math.abs(line - signal) > 5) macdStrength = "medium";
  
    return {
      trend,
      support_levels: supports,
      resistance_levels: resistances,
      rsi: Math.round(rsiValue),
      macd: { signal: macdSignal, strength: macdStrength },
      last_close: closes[closes.length - 1]
    };
  }