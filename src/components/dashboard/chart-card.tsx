"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TradingViewChart } from "./tradingview-chart";

export function ChartCard({ symbol = "BTCUSDT", interval = "1m" }: { symbol?: string; interval?: string }) {
  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <CardTitle>{symbol.replace("USDT", "/USDT")}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow p-4">
        <TradingViewChart 
          symbol={symbol} 
          interval={interval}
          theme="dark" 
        />
      </CardContent>
    </Card>
  );
}
