"use client";

import React from 'react';
import { usePatternDetection } from '@/hooks/usePatternDetection';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, TrendingUp, TrendingDown, Minus, Search, Trash2 } from 'lucide-react';

interface CandleData {
  open: number;
  high: number;
  low: number;
  close: number;
  timestamp?: string;
}

interface PatternDetectorProps {
  candles: CandleData[];
  onPatternsDetected?: (patterns: any[]) => void;
}

const PatternDetector: React.FC<PatternDetectorProps> = ({ 
  candles, 
  onPatternsDetected 
}) => {
  const { patterns, loading, error, detectPatterns, clearPatterns } = usePatternDetection();

  // ⏱️ Evita Hydration mismatch mostrando lastUpdated sólo en cliente
  const [lastUpdated, setLastUpdated] = React.useState<string>("");

  React.useEffect(() => {
    const updateTime = () => {
      setLastUpdated(new Date().toLocaleTimeString());
    };
    updateTime(); // inicial

    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleDetectPatterns = async () => {
    await detectPatterns(candles);
    if (onPatternsDetected) {
      onPatternsDetected(patterns);
    }
  };

  const getPatternVariant = (type: string) => {
    switch (type) {
      case 'bullish':
        return 'default';
      case 'bearish':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const getPatternIcon = (type: string) => {
    switch (type) {
      case 'bullish':
        return <TrendingUp className="h-4 w-4" />;
      case 'bearish':
        return <TrendingDown className="h-4 w-4" />;
      default:
        return <Minus className="h-4 w-4" />;
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence > 0.8) return 'text-green-600';
    if (confidence > 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            🤖 AI Pattern Detection
          </CardTitle>
          <div className="flex gap-2">
            <Button
              onClick={handleDetectPatterns}
              disabled={loading || !candles.length}
              size="sm"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analizando...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Detectar Patrones
                </>
              )}
            </Button>
            {patterns.length > 0 && (
              <Button
                onClick={clearPatterns}
                variant="outline"
                size="sm"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Limpiar
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {loading && (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                Analizando patrones en {candles.length} velas...
              </p>
            </div>
          </div>
        )}

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {!loading && patterns.length === 0 && !error && candles.length > 0 && (
          <div className="text-center py-8">
            <div className="text-4xl mb-2">📊</div>
            <p className="text-muted-foreground">
              No se detectaron patrones en los datos actuales
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Prueba con más datos históricos o diferentes timeframes
            </p>
          </div>
        )}

        {patterns.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">
                Patrones Detectados ({patterns.length})
              </h4>
            </div>
            
            {patterns.map((pattern, index) => (
              <div
                key={index}
                className="border rounded-lg p-4 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {getPatternIcon(pattern.type)}
                    <div>
                      <h5 className="font-semibold">{pattern.pattern}</h5>
                      <p className="text-sm text-muted-foreground mt-1">
                        {pattern.description}
                      </p>
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <Badge variant={getPatternVariant(pattern.type)}>
                      {pattern.type}
                    </Badge>
                    <div className="text-xs text-muted-foreground">
                      Rango: {pattern.range[0]} - {pattern.range[1]}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Confianza</span>
                    <span className={`text-sm font-medium ${getConfidenceColor(pattern.confidence)}`}>
                      {(pattern.confidence * 100).toFixed(1)}%
                    </span>
                  </div>
                  <Progress 
                    value={pattern.confidence * 100} 
                    className="h-2"
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {candles.length > 0 && lastUpdated && (
          <div className="mt-4 pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              📊 Analizando {candles.length} velas • Última actualización: {lastUpdated}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PatternDetector;