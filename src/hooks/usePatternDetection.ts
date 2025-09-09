// src/hooks/usePatternDetection.ts
import { useState, useCallback } from 'react';

interface CandleData {
  open: number;
  high: number;
  low: number;
  close: number;
  timestamp?: string;
}

interface PatternResult {
  pattern: string;
  range: [number, number];
  confidence: number;
  description: string;
  type: 'bullish' | 'bearish' | 'neutral';
}

interface PatternDetectionResponse {
  success: boolean;
  patterns: PatternResult[];
  totalCandles: number;
  timestamp: string;
}

export const usePatternDetection = () => {
  const [patterns, setPatterns] = useState<PatternResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const detectPatterns = useCallback(async (candles: CandleData[]) => {
    if (!candles || candles.length === 0) {
      setError('No hay datos de velas para analizar');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/patterns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ candles }),
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data: PatternDetectionResponse = await response.json();
      
      if (data.success) {
        setPatterns(data.patterns);
        console.log(`✅ Detectados ${data.patterns.length} patrones en ${data.totalCandles} velas`);
      } else {
        throw new Error('Error en la respuesta del servidor');
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      console.error('Error detectando patrones:', errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearPatterns = useCallback(() => {
    setPatterns([]);
    setError(null);
  }, []);

  return {
    patterns,
    loading,
    error,
    detectPatterns,
    clearPatterns,
  };
};