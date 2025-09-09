"use client";

import * as React from "react";
import { Line, LineChart, CartesianGrid, XAxis, YAxis, Tooltip as RechartsTooltip } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Button } from "@/components/ui/button";
import { Loader2, Zap, RefreshCw } from "lucide-react";
import { getChartAnalysis } from "@/app/actions";
import type { AnalyzeChartOutput } from "@/ai/flows/analyze-chart-patterns";
import { usePrices } from "@/hooks/usePrices";

const chartConfig = {
  price: {
    label: "Price",
    color: "hsl(var(--primary))",
  },
};

export function ChartCard({ symbol = "BTCUSDT", interval = "1m" }: { symbol?: string; interval?: string }) {
  const { candles, loading: isLoadingData, refetch: fetchPrices } = usePrices(symbol, interval);
  const [analysis, setAnalysis] = React.useState<AnalyzeChartOutput | null>(null);
  const [isLoadingAnalysis, setIsLoadingAnalysis] = React.useState(false);
  
  const chartData = React.useMemo(() => {
    return candles.map((candle) => ({
      time: new Date(candle.time).toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      price: candle.close,
    }));
  }, [candles]);

  const lastPrice = chartData.length > 0 ? chartData[chartData.length - 1].price : 0;

  const handleAnalysis = async () => {
    if (chartData.length === 0) return;
    setIsLoadingAnalysis(true);
    setAnalysis(null);

    try {
      const result = await getChartAnalysis({
        candles: chartData,
        assetName: symbol.replace("USDT", ""),
        analysisType: "pattern",
      });
      setAnalysis(result);
    } catch (error) {
      console.error("Analysis failed:", error);
      // You could add a toast notification here to inform the user.
    } finally {
      setIsLoadingAnalysis(false);
    }
  };

  const handleRefresh = () => {
    fetchPrices();
  };

  const formatPrice = (price: number) => {
    if (price >= 1000) {
      return `$${(price / 1000).toFixed(1)}k`;
    }
    return `$${price.toFixed(2)}`;
  };

  const displaySymbol = symbol.replace("USDT", "/USD");

  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              {displaySymbol}
              {lastPrice > 0 && (
                <span className="text-sm font-normal text-muted-foreground">
                  {formatPrice(lastPrice)}
                </span>
              )}
            </CardTitle>
            <CardDescription>
              Real-time price data • {interval} intervals
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={handleRefresh} 
              disabled={isLoadingData} 
              size="sm" 
              variant="ghost"
            >
              <RefreshCw className={`h-4 w-4 ${isLoadingData ? 'animate-spin' : ''}`} />
            </Button>
            <Button onClick={handleAnalysis} disabled={isLoadingAnalysis || isLoadingData || chartData.length === 0} size="sm" variant="outline">
              {isLoadingAnalysis ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Zap className="mr-2 h-4 w-4" />
              )}
              Analyze Pattern
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        {isLoadingData && chartData.length === 0 ? (
          <div className="h-[300px] w-full flex items-center justify-center">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading market data...
            </div>
          </div>
        ) : (
          <div className="h-[300px] w-full">
            <ChartContainer config={chartConfig} className="h-full w-full">
              <LineChart
                accessibilityLayer
                data={chartData}
                margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
              >
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis 
                  dataKey="time" 
                  tickLine={false} 
                  axisLine={false} 
                  tickMargin={8}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={formatPrice}
                  domain={['dataMin - 100', 'dataMax + 100']}
                />
                <RechartsTooltip 
                  content={<ChartTooltipContent />}
                  formatter={(value: any) => [formatPrice(value), "Price"]}
                />
                <Line
                  dataKey="price"
                  type="monotone"
                  stroke="var(--color-price)"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ChartContainer>
          </div>
        )}
      </CardContent>
      {analysis && (
        <CardFooter className="flex-col items-start gap-2 text-sm">
          <div className="font-semibold text-foreground">AI Analysis</div>
          <p className="text-muted-foreground">
            {analysis.analysisResult}
          </p>
          <div className="flex items-center gap-2">
            <span className="font-medium">Confidence:</span>
            <span
              className={`font-semibold ${
                analysis.confidenceLevel > 0.7
                  ? "text-green-500"
                  : analysis.confidenceLevel > 0.3
                  ? "text-yellow-500"
                  : "text-red-500"
              }`}
            >
              {(analysis.confidenceLevel * 100).toFixed(0)}%
            </span>
          </div>
        </CardFooter>
      )}
    </Card>
  );
}
