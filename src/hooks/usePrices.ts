"use client";
import { useCallback, useEffect, useState } from "react";

type Candle = {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

export function usePrices(symbol: string = "BTCUSDT", interval: string = "1m", limit: number = 100) {
  const [candles, setCandles] = useState<Candle[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/prices?symbol=${symbol}&interval=${interval}&limit=${limit}`);
      const data = await res.json();
      if (data.candles) {
        setCandles(data.candles);
      } else {
        setCandles([]); // Clear candles on error or invalid response
      }
    } catch (error) {
      console.error("Failed to fetch prices:", error);
      setCandles([]); // Clear candles on fetch error
    } finally {
      setLoading(false);
    }
  }, [symbol, interval, limit]);

  useEffect(() => {
    load();

    const id = setInterval(load, 30000); // refresh every 30s
    return () => clearInterval(id);
  }, [load]);

  return { candles, loading, refetch: load };
}
