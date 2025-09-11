
// src/hooks/usePatternDetection.ts
import { useState, useCallback } from 'react';
import type { DetectChartPatternsInput, DetectChartPatternsOutput, Pattern } from '@/types/ai-types';

interface PatternDetectionResponse extends DetectChartPatternsOutput {
  success: boolean;
  assetName: string;
  candleCount: number;
}

export const usePatternDetection = () => {
  const [patterns, setPatterns] = useState<Pattern[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const detectPatterns = useCallback(async (input: DetectChartPatternsInput) => {
    if (!input.candles || input.candles.length === 0) {
      setError('No hay datos de velas para analizar');
      return;
    }

    setLoading(true);
    setError(null);
    setPatterns([]); // Clear previous patterns

    try {
      const response = await fetch('/api/patterns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`);
      }

      const data: PatternDetectionResponse = await response.json();
      
      if (data.success) {
        setPatterns(data.patterns);
        console.log(`✅ Detectados ${data.patterns.length} patrones en ${data.candleCount} velas para ${data.assetName}`);
      } else {
        throw new Error('La respuesta de la API no fue exitosa');
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
