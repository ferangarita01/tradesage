
"use client";

import * as React from "react";
import { createChart, type IChartApi, type ISeriesApi, type UTCTimestamp, LineStyle } from 'lightweight-charts';
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
  const chartContainerRef = React.useRef<HTMLDivElement>(null);
  const chartRef = React.useRef<{ chart: IChartApi | null }>({ chart: null });
  const candlestickSeriesRef = React.useRef<ISeriesApi<'Candlestick'> | null>(null);
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
  
  React.useEffect(() => {
    if (!chartContainerRef.current) return;

    const chartOptions = {
        layout: {
            background: { color: theme === 'dark' ? '#151924' : '#FFFFFF' },
            textColor: theme === 'dark' ? '#D1D4DC' : '#191919',
        },
        grid: {
            vertLines: { color: theme === 'dark' ? '#2A2A2A' : '#E1E1E1' },
            horzLines: { color: theme === 'dark' ? '#2A2A2A' : '#E1E1E1' },
        },
        timeScale: {
            timeVisible: true,
            secondsVisible: false,
        },
        width: chartContainerRef.current.clientWidth,
        height: chartContainerRef.current.clientHeight,
    };

    // Create chart instance only once
    if (!chartRef.current.chart) {
        chartRef.current.chart = createChart(chartContainerRef.current, chartOptions);
        candlestickSeriesRef.current = chartRef.current.chart.addCandlestickSeries({
            upColor: '#26a69a',
            downColor: '#ef5350',
            borderDownColor: '#ef5350',
            borderUpColor: '#26a69a',
            wickDownColor: '#ef5350',
            wickUpColor: '#26a69a',
        });
    } else {
        chartRef.current.chart.applyOptions(chartOptions);
    }
    
    // Resize observer
    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current.chart) {
        chartRef.current.chart.resize(
          chartContainerRef.current.clientWidth,
          chartContainerRef.current.clientHeight
        );
      }
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(chartContainerRef.current);

    return () => {
      resizeObserver.disconnect();
    };

  }, [theme]); // Only re-run if theme changes

  React.useEffect(() => {
    if (!candlestickSeriesRef.current) return;

    const chartData = candles.map(c => ({
      time: c.time as UTCTimestamp,
      open: c.open,
      high: c.high,
      low: c.low,
      close: c.close,
    }));

    candlestickSeriesRef.current.setData(chartData);
    chartRef.current.chart?.timeScale().fitContent();

  }, [candles]); // Re-run only when candles data changes

  React.useEffect(() => {
      if (!candlestickSeriesRef.current) return;

      // Clear previous pattern lines
      const currentLines = candlestickSeriesRef.current.priceLines();
      currentLines.forEach(line => candlestickSeriesRef.current?.removePriceLine(line));

      // Draw new patterns
      patterns.forEach((pattern) => {
          if ((pattern.type === 'support' || pattern.type === 'resistance') && pattern.points.length > 0) {
              const price = pattern.points[0].price;
              candlestickSeriesRef.current?.createPriceLine({
                  price: price,
                  color: 'hsl(var(--accent))',
                  lineWidth: 2,
                  lineStyle: LineStyle.Dashed,
                  axisLabelVisible: true,
                  title: pattern.name,
              });
          }
      });
  }, [patterns]); // Re-run only when patterns change

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

  if (loading && !candles.length) {
    return (
      <div className="w-full h-[400px] flex items-center justify-center bg-card border rounded-lg">
        <div className="flex items-center gap-2 text-muted-foreground">
          <RefreshCw className="w-4 h-4 animate-spin" />
          Loading {symbol.replace('USDT', '/USDT')} chart...
        </div>
      </div>
    );
  }

  if (error && !candles.length) {
    return (
      <div className="w-full h-[400px] flex flex-col items-center justify-center bg-card border rounded-lg p-6">
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
    <div className="w-full h-[60vh] relative">
       <div className="absolute top-2 right-2 z-10 p-2">
         <Button
            onClick={handleDetectPatterns}
            variant="outline"
            size="sm"
            disabled={patternsLoading}
          >
            <BrainCircuit className={`mr-2 h-4 w-4 ${patternsLoading ? 'animate-spin' : ''}`} />
            {patternsLoading ? 'Analyzing...' : 'Detect Patterns'}
          </Button>
       </div>
       <div ref={chartContainerRef} className="w-full h-full rounded-lg" />
    </div>
  );
}
