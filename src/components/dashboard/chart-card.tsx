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

const chartConfig = {
  price: {
    label: "Price",
    color: "hsl(var(--primary))",
  },
};

type Candle = {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

export function ChartCard({ symbol = "BTCUSDT", interval = "1m" }: { symbol?: string; interval?: string }) {
  const [chartData, setChartData] = React.useState<{ time: string; price: number }[]>([]);
  const [analysis, setAnalysis] = React.useState<AnalyzeChartOutput | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isLoadingData, setIsLoadingData] = React.useState(true);
  const [lastPrice, setLastPrice] = React.useState<number>(0);
  const chartRef = React.useRef<HTMLDivElement>(null);

  // Fetch real market data
  const fetchPrices = React.useCallback(async () => {
    try {
      const res = await fetch(`/api/prices?symbol=${symbol}&interval=${interval}&limit=100`);
      const data = await res.json();
      
      if (data.candles) {
        const formattedData = data.candles.map((candle: Candle) => ({
          time: new Date(candle.time).toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          }),
          price: candle.close,
        }));
        
        setChartData(formattedData);
        setLastPrice(formattedData[formattedData.length - 1]?.price || 0);
      }
    } catch (error) {
      console.error("Error fetching prices:", error);
    } finally {
      setIsLoadingData(false);
    }
  }, [symbol, interval]);

  // Initial load and auto-refresh
  React.useEffect(() => {
    fetchPrices();
    
    // Auto-refresh every 30 seconds for real-time updates
    const refreshInterval = setInterval(fetchPrices, 30000);
    
    return () => clearInterval(refreshInterval);
  }, [fetchPrices]);

  const handleAnalysis = async () => {
    if (!chartRef.current) return;
    setIsLoading(true);
    setAnalysis(null);

    try {
      const svgElement = chartRef.current.querySelector("svg");
      if (!svgElement) throw new Error("Chart SVG not found");

      svgElement.setAttribute("xmlns", "http://www.w3.org/2000/svg");
      const svgString = new XMLSerializer().serializeToString(svgElement);
      const dataUri = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgString)));

      const result = await getChartAnalysis({
        chartDataUri: dataUri,
        assetName: symbol.replace("USDT", ""),
        analysisType: "pattern",
      });
      setAnalysis(result);
    } catch (error) {
      console.error("Analysis failed:", error);
      // You could add a toast notification here to inform the user.
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    setIsLoadingData(true);
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
            <Button onClick={handleAnalysis} disabled={isLoading} size="sm" variant="outline">
              {isLoading ? (
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
        {isLoadingData ? (
          <div className="h-[300px] w-full flex items-center justify-center">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading market data...
            </div>
          </div>
        ) : (
          <div className="h-[300px] w-full" ref={chartRef}>
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