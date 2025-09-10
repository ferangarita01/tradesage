
"use server";

import { analyzeChart, type AnalyzeChartInput, type AnalyzeChartOutput } from "@/ai/flows/analyze-chart-patterns";
import { chat, type ChatInput, type ChatOutput } from "@/ai/flows/chat";

export async function getChartAnalysis(input: AnalyzeChartInput): Promise<AnalyzeChartOutput> {
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

export async function getChatResponse(input: ChatInput): Promise<ChatOutput> {
    "use server";
    try {
        const response = await chat(input);
        return response;
    } catch (error) {
        console.error("Error in getChatResponse:", error);
        return { response: "Sorry, I'm having trouble connecting to the AI. Please try again later." };
    }
}
