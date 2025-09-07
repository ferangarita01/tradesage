"use server";

import { analyzeChart, type AnalyzeChartInput } from "@/ai/flows/analyze-chart-patterns";
import { aggregateRelevantNews, type AggregateRelevantNewsInput } from "@/ai/flows/aggregate-relevant-news";

export async function getChartAnalysis(input: AnalyzeChartInput) {
  "use server";
  try {
    const analysis = await analyzeChart(input);
    return analysis;
  } catch (error) {
    console.error(error);
    // In a real app, you'd want more robust error handling
    throw new Error("Failed to analyze chart.");
  }
}

export async function getNews(input: AggregateRelevantNewsInput) {
  "use server";
  try {
    const news = await aggregateRelevantNews(input);
    return news;
  } catch (error) {
    console.error(error);
    // In a real app, you'd want more robust error handling
    // For now, return a mock response on failure to ensure UI doesn't break
    return {
        newsItems: ["AI news aggregation is currently unavailable. Please try again later."],
        impactful: false,
    }
  }
}
