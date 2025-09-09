"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { BitcoinIcon, EthereumIcon } from "@/components/icons";
import { Line, LineChart } from "recharts";
import { ChartContainer } from "@/components/ui/chart";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { usePrices } from "@/hooks/usePrices";

type Asset = {
  id: string;
  icon: JSX.Element;
  name: string;
  symbol: string;
  price?: string;
  change?: string;
  changeType?: "positive" | "negative";
  data?: { value: number }[];
};

const initialAssets: Asset[] = [
  {
    id: "bitcoin",
    icon: <BitcoinIcon className="w-8 h-8" />,
    name: "Bitcoin",
    symbol: "BTCUSDT",
  },
  {
    id: "ethereum",
    icon: <EthereumIcon className="w-8 h-8" />,
    name: "Ethereum",
    symbol: "ETHUSDT",
  },
  {
    id: "cardano",
    icon: <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center font-bold text-sm">ADA</div>,
    name: "Cardano",
    symbol: "ADAUSDT",
  },
];


function AssetPriceRow({ asset }: { asset: Asset }) {
  const { candles, loading, error } = usePrices(asset.symbol, "1m", 100);

  const latestPrice = candles.length > 0 ? candles[candles.length - 1].close : 0;
  const startPrice = candles.length > 0 ? candles[0].close : 0;
  const priceChange = latestPrice - startPrice;
  const percentageChange = startPrice > 0 ? (priceChange / startPrice) * 100 : 0;

  const changeType = percentageChange >= 0 ? "positive" : "negative";

  const chartData = candles.map(c => ({ value: c.close }));

  if (loading) {
    return (
      <TableRow>
        <TableCell className="p-2">
          {asset.icon}
        </TableCell>
        <TableCell className="p-2 font-medium">
          <div>{asset.name}</div>
          <div className="text-xs text-muted-foreground">{asset.symbol.replace("USDT", "")}</div>
        </TableCell>
        <TableCell className="p-2 w-[80px] h-[40px]">
          <Skeleton className="w-full h-full" />
        </TableCell>
        <TableCell className="p-2 text-right">
          <Skeleton className="h-5 w-20 mb-1" />
          <Skeleton className="h-4 w-12 ml-auto" />
        </TableCell>
      </TableRow>
    );
  }
  
  if (error || candles.length === 0) {
      return (
         <TableRow>
             <TableCell className="p-2">
                {asset.icon}
             </TableCell>
             <TableCell className="p-2 font-medium">
                <div>{asset.name}</div>
                <div className="text-xs text-muted-foreground">{asset.symbol.replace("USDT", "")}</div>
             </TableCell>
             <TableCell colSpan={2} className="p-2 text-right">
                 <Badge variant="outline" className="text-xs border-dashed text-muted-foreground">
                    Data unavailable
                 </Badge>
             </TableCell>
         </TableRow>
      )
  }

  return (
    <TableRow key={asset.symbol}>
      <TableCell className="p-2">
        {asset.icon}
      </TableCell>
      <TableCell className="p-2 font-medium">
        <div>{asset.name}</div>
        <div className="text-xs text-muted-foreground">{asset.symbol.replace("USDT", "")}</div>
      </TableCell>
      <TableCell className="p-2 w-[80px] h-[40px]">
        <ChartContainer config={{}} className="w-full h-full">
          <LineChart
            accessibilityLayer
            data={chartData}
            margin={{ top: 5, bottom: 5, left: 5, right: 5 }}
          >
            <Line
              dataKey="value"
              type="monotone"
              stroke={changeType === 'positive' ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))'}
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </TableCell>
      <TableCell className="p-2 text-right">
        <div>${latestPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
        <Badge variant="outline" className={`text-xs ${changeType === 'positive' ? 'text-green-500 border-green-500/50' : 'text-red-500 border-red-500/50'}`}>
          {percentageChange.toFixed(2)}%
        </Badge>
      </TableCell>
    </TableRow>
  )
}

export function AssetTrackerCard() {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>My Portfolio</CardTitle>
        <CardDescription>A quick look at your tracked assets.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableBody>
            {initialAssets.map((asset) => (
              <AssetPriceRow key={asset.id} asset={asset} />
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
