"use client";
import { useEffect, useState } from "react";

type Candle = {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

export function usePrices(symbol: string = "BTCUSDT", interval: string = "1m") {
  const [candles, setCandles] = useState<Candle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const res = await fetch(`/api/prices?symbol=${symbol}&interval=${interval}&limit=200`);
      const data = await res.json();
      setCandles(data.candles ?? []);
      setLoading(false);
    }
    load();

    // Auto-refresh cada 30s
    const id = setInterval(load, 30000);
    return () => clearInterval(id);
  }, [symbol, interval]);

  return { candles, loading };
}