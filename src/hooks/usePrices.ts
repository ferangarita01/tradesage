
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
      const res = await fetch(
        `/api/prices?symbol=${symbol}&interval=${interval}&limit=${limit}`,
        { 
          headers: {
            'Cache-Control': 'no-cache'
          }
        }
      );

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${res.status}: ${res.statusText}`);
      }

      const data = await res.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setCandles(data.candles || []);
      setLastUpdate(new Date());
      setRetryCount(0); // Reset retry count on success
      
    } catch (err: any) {
      const parsedError = parseError(err);
      setError(parsedError);
      setCandles([]); // Clear stale data on error
      setRetryCount(prev => prev + 1);
    } finally {
      setLoading(false);
    }
  }, [symbol, interval, limit, parseError]);

  useEffect(() => {
    load();
    const intervalId = setInterval(load, 30000); // Refresh every 30 seconds
    return () => clearInterval(intervalId);
  }, [load]);

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
