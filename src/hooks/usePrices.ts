
"use client";
import { useCallback, useEffect, useState } from "react";

export type Candle = {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

export type PricesError = {
  type: 'network' | 'api' | 'rate_limit' | 'auth' | 'server' | 'unknown';
  message: string;
  retryable: boolean;
  retryAfter?: number; // seconds to wait before retry
};

export function usePrices(
  symbol: string = "BTCUSDT",
  interval: string = "1m",
  limit: number = 100
) {
  const [candles, setCandles] = useState<Candle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<PricesError | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const parseError = useCallback((err: any, status?: number): PricesError => {
    const message = err.message || err.toString() || 'Unknown error';
    
    // Network errors
    if (message.includes('fetch') || message.includes('NetworkError')) {
      return {
        type: 'network',
        message: 'Network connection failed. Check your internet connection.',
        retryable: true,
        retryAfter: 10
      };
    }

    // HTTP status-based errors
    switch (status) {
      case 401:
        return {
          type: 'auth',
          message: 'API authentication failed. Check your CoinGecko API key.',
          retryable: false
        };
      
      case 429:
        return {
          type: 'rate_limit',
          message: 'Rate limit exceeded. Too many requests to CoinGecko API.',
          retryable: true,
          retryAfter: 60
        };
      
      case 500:
      case 502:
      case 503:
        return {
          type: 'server',
          message: 'CoinGecko server error. Service temporarily unavailable.',
          retryable: true,
          retryAfter: 30
        };
      
      case 400:
        return {
          type: 'api',
          message: `Invalid request: ${message}`,
          retryable: false
        };
      
      default:
        if (status && status >= 400) {
          return {
            type: 'api',
            message: `API error (${status}): ${message}`,
            retryable: status >= 500,
            retryAfter: status >= 500 ? 30 : undefined
          };
        }
    }

    // Generic errors
    return {
      type: 'unknown',
      message: `Unexpected error: ${message}`,
      retryable: true,
      retryAfter: 15
    };
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Fix: Use the correct Binance API endpoint for price data
      const res = await fetch(
        `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`
      );

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        // Use res.status when calling parseError for HTTP errors
        const parsedError = parseError(new Error(errorData.msg || `HTTP error ${res.status}`), res.status);
        throw parsedError;
      }

      const data: any[][] = await res.json();
      
      const formattedCandles: Candle[] = data.map(d => ({
        time: d[0],
        open: parseFloat(d[1]),
        high: parseFloat(d[2]),
        low: parseFloat(d[3]),
        close: parseFloat(d[4]),
        volume: parseFloat(d[5])
      }));
      
      setCandles(formattedCandles);
      setLastUpdate(new Date());
      setRetryCount(0); // Reset retry count on success
      
    } catch (err: any) {
      // If the error is already a PricesError, use it, otherwise parse it
      const parsedError = err.type ? err : parseError(err);
      setError(parsedError);
      setCandles([]); // Clear stale data on error
      if (parsedError.retryable) {
        setRetryCount(prev => prev + 1);
      }
    } finally {
      setLoading(false);
    }
  }, [symbol, interval, limit, parseError]);

  useEffect(() => {
    load();
    // Refresh every 30 seconds only if there's no error or if the error is retryable
    const canRefresh = !error || error.retryable;
    if (canRefresh) {
        const intervalId = setInterval(load, 30000); 
        return () => clearInterval(intervalId);
    }
  }, [load, error]);

  const manualRetry = useCallback(() => {
    setRetryCount(0);
    load();
  }, [load]);

  return { 
    candles, 
    loading, 
    error, 
    lastUpdate,
    retryCount,
    refetch: manualRetry 
  };
}
