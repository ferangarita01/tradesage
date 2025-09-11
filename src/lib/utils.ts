
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { UTCTimestamp } from "lightweight-charts";
import type { Candle } from "@/types/ai-types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function normalizeCandles(candles: Candle[]) {
  return candles.map((c) => ({
    time:
      typeof c.time === "string"
        ? (Date.parse(c.time) / 1000) as UTCTimestamp
        : (c.time as UTCTimestamp),
    open: c.open,
    high: c.high,
    low: c.low,
    close: c.close,
  }));
}
