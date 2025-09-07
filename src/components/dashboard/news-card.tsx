"use client";

import * as React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Newspaper, Loader2 } from "lucide-react";
import { getNews } from "@/app/actions";
import type { AggregateRelevantNewsOutput } from "@/ai/flows/aggregate-relevant-news";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

const MOCK_NEWS = [
  "Global markets react to new inflation data.",
  "Tech giants announce breakthrough in quantum computing.",
  "Bitcoin halving event approaches, speculation rises.",
];

export function NewsCard() {
  const [news, setNews] = React.useState<AggregateRelevantNewsOutput | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  const handleFetchNews = async () => {
    setIsLoading(true);
    setNews(null);
    try {
      const result = await getNews({ assets: ["BTC", "ETH", "Stock Market"] });
      // The Genkit flow returns mock data, so we'll supplement it for a better demo
      result.newsItems = [...result.newsItems, ...MOCK_NEWS];
      setNews(result);
    } catch (error) {
      console.error("Failed to fetch news:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const newsItems = news?.newsItems || MOCK_NEWS;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
            <div>
                <CardTitle>Market News</CardTitle>
                <CardDescription>AI-curated news for your assets</CardDescription>
            </div>
            <Button onClick={handleFetchNews} disabled={isLoading} size="sm" variant="outline">
                {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                    <Newspaper className="mr-2 h-4 w-4" />
                )}
                Fetch News
            </Button>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-48">
          <div className="space-y-4">
            {newsItems.map((item, index) => (
              <div key={index}>
                <p className="text-sm text-foreground leading-snug">
                  {item}
                </p>
                {index < newsItems.length - 1 && <Separator className="mt-4" />}
              </div>
            ))}
             {isLoading && (
              <div className="absolute inset-0 bg-card/50 backdrop-blur-sm flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
