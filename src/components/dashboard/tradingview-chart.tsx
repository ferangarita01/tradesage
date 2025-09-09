"use client";

import * as React from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { usePrices } from '@/hooks/usePrices';
import { AlertCircle, WifiOff, Clock, RefreshCw } from 'lucide-react';
import { Button } from "@/components/ui/button";

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
  const { candles, loading, error, refetch, retryCount } = usePrices(symbol, interval, 200);

  const chartData = candles.map(c => ({
    time: new Date(c.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    price: c.close,
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
    <div className="w-full h-[400px]">
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
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
