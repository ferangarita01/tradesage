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

type PricesError = {
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
      console.log(`🔄 Fetching ${symbol} candles (attempt ${retryCount + 1})...`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

      const res = await fetch(
        `/api/prices?symbol=${symbol}&interval=${interval}&limit=${limit}`,
        { 
          signal: controller.signal,
          headers: {
            'Cache-Control': 'no-cache'
          }
        }
      );

      clearTimeout(timeoutId);

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${res.status}: ${res.statusText}`);
      }

      const data = await res.json();

      if (data.error) {
        throw new Error(data.error);
      }

      if (!data.candles || !Array.isArray(data.candles)) {
        throw new Error('Invalid response format: missing candles array');
      }

      if (data.candles.length === 0) {
        throw new Error(`No price data available for ${symbol}`);
      }

      // Validate candle data structure
      const validCandles = data.candles.filter((candle: any) => 
        candle && 
        typeof candle.time === 'number' && 
        typeof candle.close === 'number' &&
        candle.time > 0 && 
        candle.close > 0
      );

      if (validCandles.length === 0) {
        throw new Error('No valid candle data received');
      }

      console.log(`✅ Loaded ${validCandles.length} valid candles for ${symbol}`);
      setCandles(validCandles);
      setLastUpdate(new Date());
      setRetryCount(0); // Reset retry count on success
      
    } catch (err: any) {
      const parsedError = parseError(err);
      console.error(`❌ Failed to fetch ${symbol} candles:`, parsedError);
      
      setError(parsedError);
      setCandles([]); // Clear stale data on error
      setRetryCount(prev => prev + 1);
    } finally {
      setLoading(false);
    }
  }, [symbol, interval, limit, retryCount, parseError]);

  // Auto-retry logic with exponential backoff
  useEffect(() => {
    if (error?.retryable && retryCount < 3) {
      const retryDelay = (error.retryAfter || 15) * Math.pow(2, retryCount - 1); // Exponential backoff
      console.log(`🔄 Auto-retry in ${retryDelay}s (attempt ${retryCount + 1}/3)`);
      
      const timeoutId = setTimeout(() => {
        load();
      }, retryDelay * 1000);

      return () => clearTimeout(timeoutId);
    }
  }, [error, retryCount, load]);

  // Initial load and periodic refresh
  useEffect(() => {
    load();
    
    // Refresh every 30 seconds (only if no error or error is retryable)
    const intervalId = setInterval(() => {
      if (!error || error.retryable) {
        load();
      }
    }, 30000);

    return () => clearInterval(intervalId);
  }, [symbol, interval, limit]); // Removed load from deps to prevent infinite loop

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