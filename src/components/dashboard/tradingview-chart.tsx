'use client';

import { useEffect, useRef } from 'react';
import TradingViewDatafeed from '@/lib/tradingview-datafeed';
import { ChartingLibraryWidgetOptions } from 'public/charting_library/datafeed-api';

interface TradingViewChartProps {
  symbol?: string;
  interval?: string;
  theme?: 'Light' | 'Dark';
}

export function TradingViewChart({ 
  symbol = 'BTCUSDT', 
  interval = '1',
  theme = 'Dark' 
}: TradingViewChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const tvWidgetRef = useRef<any>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const script = document.createElement('script');
    script.src = 'https://unpkg.com/tradingview-charting-library@latest/charting_library.min.js';
    script.async = true;
    script.onload = () => {
        if (typeof (window as any).TradingView === 'undefined') {
            console.error('TradingView library not loaded');
            return;
        }

        const widgetOptions: ChartingLibraryWidgetOptions = {
            symbol: symbol,
            interval: interval as any,
            container: chartContainerRef.current as HTMLElement,
            datafeed: new TradingViewDatafeed(),
            library_path: '/charting_library/',
            locale: 'en',
            disabled_features: [
                'use_localstorage_for_settings',
                'volume_force_overlay',
                'create_volume_indicator_by_default'
            ],
            enabled_features: [
                'study_templates'
            ],
            charts_storage_url: 'https://saveload.tradingview.com',
            charts_storage_api_version: '1.1',
            client_id: 'tradingview.com',
            user_id: 'public_user_id',
            fullscreen: false,
            autosize: true,
            theme: theme,
        };

        const tvWidget = new (window as any).TradingView.widget(widgetOptions);
        tvWidgetRef.current = tvWidget;
    }

    document.body.appendChild(script);

    return () => {
        if (script.parentNode) {
            script.parentNode.removeChild(script);
        }
      if (tvWidgetRef.current) {
        tvWidgetRef.current.remove();
        tvWidgetRef.current = null;
      }
    };
  }, [symbol, interval, theme]);

  return (
    <div 
      ref={chartContainerRef} 
      className="w-full h-[600px] bg-background border rounded-lg"
      style={{ minHeight: '400px' }}
    />
  );
}
