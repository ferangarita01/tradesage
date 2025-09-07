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
import { Loader2, Zap } from "lucide-react";
import { getChartAnalysis } from "@/app/actions";
import type { AnalyzeChartOutput } from "@/ai/flows/analyze-chart-patterns";
import { MOCK_CHART_DATA } from "@/lib/data";

const chartConfig = {
  price: {
    label: "Price",
    color: "hsl(var(--primary))",
  },
};

export function ChartCard() {
  const [chartData, setChartData] = React.useState(MOCK_CHART_DATA);
  const [analysis, setAnalysis] = React.useState<AnalyzeChartOutput | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const chartRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setChartData((prevData) => {
        const lastDataPoint = prevData[prevData.length - 1];
        const newPrice =
          lastDataPoint.price + (Math.random() - 0.5) * 1000;
        const newTime = new Date(
          new Date(lastDataPoint.time).getTime() + 60000
        ).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        const newData = [
          ...prevData.slice(1),
          { time: newTime, price: Math.max(newPrice, 30000) },
        ];
        return newData;
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

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
        assetName: "Bitcoin",
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

  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>Bitcoin/USD</CardTitle>
            <CardDescription>Real-time price data</CardDescription>
          </div>
          <Button onClick={handleAnalysis} disabled={isLoading} size="sm" variant="outline">
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Zap className="mr-2 h-4 w-4" />
            )}
            Analyze Pattern
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="h-[300px] w-full" ref={chartRef}>
          <ChartContainer config={chartConfig} className="h-full w-full">
            <LineChart
              accessibilityLayer
              data={chartData}
              margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
            >
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis dataKey="time" tickLine={false} axisLine={false} tickMargin={8} />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => `$${(value as number / 1000)}k`}
              />
              <RechartsTooltip content={<ChartTooltipContent />} />
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
