
"use client";

import * as React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { TradingViewChart } from "./tradingview-chart";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Candle, PricesError } from "@/hooks/usePrices";

const availableAssets: Record<string, string> = {
    BTCUSDT: "Bitcoin (BTC)",
    ETHUSDT: "Ethereum (ETH)",
    ADAUSDT: "Cardano (ADA)",
    BNBUSDT: "Binance Coin (BNB)",
    SOLUSDT: "Solana (SOL)",
    DOGEUSDT: "Dogecoin (DOGE)",
    MATICUSDT: "Polygon (MATIC)",
    AVAXUSDT: "Avalanche (AVAX)",
};

interface ChartCardProps {
  symbol?: string;
  onSymbolChange: (symbol: string) => void;
  interval?: string;
  candles: Candle[];
  loading?: boolean;
  error?: PricesError | null;
  refetch?: () => void;
  retryCount?: number;
}

export function ChartCard({
  symbol = "BTCUSDT",
  onSymbolChange,
  interval = "5m",
  candles,
  loading,
  error,
  refetch,
  retryCount,
}: ChartCardProps) {

  return (
    <Card className="flex flex-col h-full border-0 shadow-none">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <Select value={symbol} onValueChange={onSymbolChange}>
          <SelectTrigger className="w-[280px]">
            <SelectValue placeholder="Select an asset" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(availableAssets).map(([assetSymbol, assetName]) => (
                <SelectItem key={assetSymbol} value={assetSymbol}>{assetName}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="flex-grow p-0">
        <TradingViewChart 
            symbol={symbol} 
            interval={interval} 
            theme="dark" 
            candles={candles} 
            loading={loading}
            error={error}
            refetch={refetch}
            retryCount={retryCount}
        />
      </CardContent>
    </Card>
  );
}
