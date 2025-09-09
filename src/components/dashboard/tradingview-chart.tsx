// src/components/dashboard/tradingview-chart.tsx
"use client";

import { useEffect, useRef } from 'react';
import { createChart, IChartApi, ISeriesApi, CandlestickData, Time } from 'lightweight-charts';
import { usePrices } from '@/hooks/usePrices';
import { Button } from '@/components/ui/button';
import { AlertCircle, Wifi, WifiOff, Clock, RefreshCw } from 'lucide-react';

interface TradingViewChartProps {
  symbol?: string;
  interval?: string;
  theme?: 'light' | 'dark';
}

export function TradingViewChart({ 
  symbol = 'BTCUSDT', 
  interval = '1m',
  theme = 'dark' 
}: TradingViewChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candlestickSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  
  const { candles, loading, error, lastUpdate, retryCount, refetch } = usePrices(symbol, interval, 100);

  // Create chart
  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 400,
      layout: {
        background: { color: theme === 'dark' ? '#1e1e1e' : '#ffffff' },
        textColor: theme === 'dark' ? '#d1d4dc' : '#191919',
      },
      grid: {
        vertLines: { color: theme === 'dark' ? '#2a2a2a' : '#e1e1e1' },
        horzLines: { color: theme === 'dark' ? '#2a2a2a' : '#e1e1e1' },
      },
      crosshair: { mode: 1 },
      rightPriceScale: { borderColor: theme === 'dark' ? '#485c7b' : '#cccccc' },
      timeScale: { 
        borderColor: theme === 'dark' ? '#485c7b' : '#cccccc',
        timeVisible: true,
        secondsVisible: false,
      },
    });

    const candlestickSeries = chart.addCandlestickSeries({
      upColor: '#26a69a',
      downColor: '#ef5350',
      borderVisible: false,
      wickUpColor: '#26a69a',
      wickDownColor: '#ef5350',
    });

    chartRef.current = chart;
    candlestickSeriesRef.current = candlestickSeries;

    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
        candlestickSeriesRef.current = null;
      }
    };
  }, [theme]);

  // Update chart data
  useEffect(() => {
    if (!candlestickSeriesRef.current || !candles.length) return;

    try {
      const chartData: CandlestickData[] = candles.map(candle => ({
        time: (candle.time / 1000) as Time,
        open: candle.open,
        high: candle.high,
        low: candle.low,
        close: candle.close,
      }));

      candlestickSeriesRef.current.setData(chartData);
      
      if (chartRef.current) {
        chartRef.current.timeScale().fitContent();
      }
    } catch (err) {
      console.error('Error updating chart data:', err);
    }
  }, [candles]);

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
          
          {error.retryable && retryCount > 0 && (
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
    <div className="w-full">
      {/* Status Bar */}
      <div className="flex items-center justify-between mb-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-4">
          <span>{symbol.replace('USDT', '/USDT')}</span>
          <span>{candles.length} candles</span>
          {lastUpdate && (
            <span className="flex items-center gap-1">
              <Wifi className="w-3 h-3" />
              Updated {lastUpdate.toLocaleTimeString()}
            </span>
          )}
        </div>
        
        {error && candles.length > 0 && (
          <div className={`flex items-center gap-1 ${getErrorColor(error.type)}`}>
            {getErrorIcon(error.type)}
            <span>Live updates paused</span>
          </div>
        )}
        
        {loading && candles.length > 0 && (
          <div className="flex items-center gap-1 text-blue-500">
            <RefreshCw className="w-3 h-3 animate-spin" />
            <span>Updating...</span>
          </div>
        )}
      </div>

      {/* Chart Container */}
      <div 
        ref={chartContainerRef} 
        className="w-full h-[400px] border rounded-lg"
      />
      
      {/* Error Banner (when chart has data but updates are failing) */}
      {error && candles.length > 0 && (
        <div className={`mt-2 p-2 rounded text-xs border ${
          error.type === 'rate_limit' ? 'bg-yellow-50 border-yellow-200 text-yellow-800' :
          error.type === 'network' ? 'bg-orange-50 border-orange-200 text-orange-800' :
          'bg-red-50 border-red-200 text-red-800'
        }`}>
          <div className="flex items-center justify-between">
            <span>{error.message}</span>
            <Button 
              onClick={refetch} 
              variant="ghost" 
              size="sm"
              className="h-6 px-2 text-xs"
            >
              Retry
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
