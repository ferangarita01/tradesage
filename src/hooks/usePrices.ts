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
      if (!res.ok) {
        // If the API returns a non-200 status, log it and clear candles
        console.error(`API Error: ${res.status} ${res.statusText}`);
        setCandles([]);
        return; // Stop execution
      }
      const data = await res.json();
      if (data.candles) {
        setCandles(data.candles);
      } else {
        // If the response is OK but doesn't contain candles, clear the state
        console.error("Invalid data format received:", data);
        setCandles([]);
      }
    } catch (error) {
      console.error("Failed to fetch prices:", error);
      setCandles([]); // Clear candles on any fetch error
    } finally {
      setLoading(false);
    }
  }, [symbol, interval, limit]);

  useEffect(() => {
    load();

    const id = setInterval(load, 60000); // refresh every 60s
    return () => clearInterval(id);
  }, [load]);

  return { candles, loading, refetch: load };
}
