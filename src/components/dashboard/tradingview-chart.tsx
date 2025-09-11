
"use client";

import * as React from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { AlertCircle, WifiOff, Clock, RefreshCw, BrainCircuit } from 'lucide-react';
import { Button } from "@/components/ui/button";
import type { Candle, PricesError } from "@/hooks/usePrices";
import { usePatternDetection } from "@/hooks/usePatternDetection";
import type { Pattern } from "@/types/ai-types";

interface TradingViewChartProps {
  symbol?: string;
  interval?: string;
  theme?: 'light' | 'dark';
  candles: Candle[];
  loading?: boolean;
  error?: PricesError | null;
  refetch?: () => void;
  retryCount?: number;
}

export function TradingViewChart({
  symbol = 'BTCUSDT',
  theme = 'dark',
  candles,
  loading,
  error,
  refetch,
  retryCount,
}: TradingViewChartProps) {
  const { patterns, loading: patternsLoading, detectPatterns } = usePatternDetection();

  const handleDetectPatterns = () => {
    const chartCandles = candles.map(c => ({
      time: String(c.time),
      open: c.open,
      high: c.high,
      low: c.low,
      close: c.close,
      volume: c.volume
    }));
    detectPatterns({ candles: chartCandles, assetName: symbol });
  };
  
  const chartData = candles.map(c => ({
    time: new Date(c.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    price: c.close,
    fullTime: c.time, // Keep original timestamp for pattern matching
  }));

  const getErrorIcon = (errorType: string) => {
    switch (errorType) {
      case 'network': return <WifiOff className="w-5 h-5" />;
      case 'rate_limit': return <Clock className="w-5 h-5" />;
      case 'auth': return <AlertCircle className="w-5 h-5" />;
      default: return <AlertCircle className="w-5 h-5" />;
    }
  };

  const getErrorColor = (errorType: string) => {
    switch (errorType) {
      case 'network': return 'text-orange-500';
      case 'rate_limit': return 'text-yellow-500';
      case 'auth': return 'text-red-500';
      case 'server': return 'text-purple-500';
      default: return 'text-red-500';
    }
  };

  // Helper to find the index in chartData corresponding to a pattern timestamp
  const findDataIndex = (timestamp: string) => {
    return chartData.findIndex(d => d.fullTime === parseInt(timestamp, 10));
  };
  
  const renderPatternLines = () => {
    return patterns.map((pattern, index) => {
      if (pattern.type === 'support' || pattern.type === 'resistance') {
        // Render horizontal line for support/resistance
        const y = pattern.points[0].price;
        return <ReferenceLine key={`pattern-${index}`} y={y} label={pattern.name} stroke="hsl(var(--accent))" strokeDasharray="3 3" />;
      } else if (pattern.type === 'trendline' && pattern.points.length >= 2) {
        // Render a trendline between the two points
        const startIndex = findDataIndex(pattern.points[0].time);
        const endIndex = findDataIndex(pattern.points[1].time);
        
        if (startIndex === -1 || endIndex === -1) return null;

        const startPoint = { x: startIndex, y: pattern.points[0].price };
        const endPoint = { x: endIndex, y: pattern.points[1].price };
        
        return (
          <ReferenceLine
            key={`pattern-${index}`}
            segment={[{ x: startPoint.x, y: startPoint.y }, { x: endPoint.x, y: endPoint.y }]}
            stroke="hsl(var(--accent))"
            strokeWidth={2}
          />
        );
      }
      return null;
    });
  };

  if (loading && !candles.length) {
    return (
      <div className="w-full h-[400px] flex items-center justify-center bg-background border rounded-lg">
        <div className="flex items-center gap-2 text-muted-foreground">
          <RefreshCw className="w-4 h-4 animate-spin" />
          Loading {symbol.replace('USDT', '/USDT')} chart...
        </div>
      </div>
    );
  }

  if (error && !candles.length) {
    return (
      <div className="w-full h-[400px] flex flex-col items-center justify-center bg-background border rounded-lg p-6">
        <div className={`flex items-center gap-2 mb-4 ${getErrorColor(error.type)}`}>
          {getErrorIcon(error.type)}
          <span className="font-medium">Chart Error</span>
        </div>
        <div className="text-center mb-4 max-w-md">
          <p className="text-sm text-muted-foreground mb-2">{error.message}</p>
          {error.retryable && (retryCount ?? 0) > 0 && (
            <p className="text-xs text-muted-foreground">
              Auto-retry attempt {retryCount}/3
            </p>
          )}
          {!error.retryable && (
            <p className="text-xs text-yellow-600">
              Manual intervention required
            </p>
          )}
        </div>
        <Button
          onClick={refetch}
          variant="outline"
          size="sm"
          disabled={loading}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full h-[400px] relative">
       <div className="absolute top-0 right-0 z-10 p-2">
         <Button
            onClick={handleDetectPatterns}
            variant="outline"
            size="sm"
            disabled={patternsLoading}
          >
            <BrainCircuit className={`mr-2 h-4 w-4 ${patternsLoading ? 'animate-spin' : ''}`} />
            {patternsLoading ? 'Analizando...' : 'Analizar Patrones'}
          </Button>
       </div>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#2a2a2a' : '#e1e1e1'} />
          <XAxis dataKey="time" stroke={theme === 'dark' ? '#d1d4dc' : '#191919'} />
          <YAxis stroke={theme === 'dark' ? '#d1d4dc' : '#191919'} domain={['auto', 'auto']} />
          <Tooltip
            contentStyle={{
              backgroundColor: theme === 'dark' ? '#1e1e1e' : '#ffffff',
              borderColor: theme === 'dark' ? '#485c7b' : '#cccccc'
            }}
            labelStyle={{ color: theme === 'dark' ? '#d1d4dc' : '#191919' }}
          />
          <Legend />
          <Line type="monotone" dataKey="price" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
          {renderPatternLines()}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
