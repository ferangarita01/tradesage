"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TradingViewChart } from "./tradingview-chart";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

export function ChartCard({ symbol = "BTCUSDT", interval = "1m" }: { symbol?: string; interval?: string }) {

  const handleExport = () => {
    window.open(`/api/prices?symbol=${symbol}&interval=${interval}&format=csv`);
  };

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{symbol.replace("USDT", "/USDT")}</CardTitle>
        <Button variant="outline" size="sm" onClick={handleExport}>
          <Download className="mr-2 h-4 w-4" />
          Exportar CSV
        </Button>
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
