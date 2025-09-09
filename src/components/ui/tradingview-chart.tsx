'use client';

import { createChart, ColorType, IChartApi, ISeriesApi } from 'lightweight-charts';
import React, { useEffect, useRef, memo } from 'react';

interface ChartProps {
  data: {
    time: number;
    open: number;
    high: number;
    low: number;
    close: number;
  }[];
  initialHeight?: number;
}

const Chart: React.FC<ChartProps> = ({ data, initialHeight = 300 }) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    if (!chartRef.current) {
      chartRef.current = createChart(chartContainerRef.current, {
        width: chartContainerRef.current.clientWidth,
        height: initialHeight,
        layout: {
          background: { type: ColorType.Solid, color: 'transparent' },
          textColor: 'hsl(var(--muted-foreground))',
        },
        grid: {
          vertLines: {
            color: 'hsl(var(--border))',
          },
          horzLines: {
            color: 'hsl(var(--border))',
          },
        },
        timeScale: {
          timeVisible: true,
          secondsVisible: false,
        },
      });

      seriesRef.current = chartRef.current.addCandlestickSeries({
        upColor: 'hsl(var(--primary))',
        downColor: 'hsl(var(--destructive))',
        borderDownColor: 'hsl(var(--destructive))',
        borderUpColor: 'hsl(var(--primary))',
        wickDownColor: 'hsl(var(--destructive))',
        wickUpColor: 'hsl(var(--primary))',
      });
    }

    const handleResize = () => {
      if (chartRef.current && chartContainerRef.current) {
        chartRef.current.resize(chartContainerRef.current.clientWidth, initialHeight);
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [initialHeight]);

  useEffect(() => {
    if (seriesRef.current) {
        // time needs to be in seconds, not milliseconds. The API returns it in ms.
      const formattedData = data.map(candle => ({
          ...candle,
          time: candle.time / 1000
      }));
      seriesRef.current.setData(formattedData);
      chartRef.current?.timeScale().fitContent();
    }
  }, [data]);

  return <div ref={chartContainerRef} style={{ height: `${initialHeight}px`, width: '100%' }} />;
};

export default memo(Chart);
