
"use server";

import { analyzeChart, type AnalyzeChartInput } from "@/ai/flows/analyze-chart-patterns";
import { chat, type ChatInput } from "@/ai/flows/chat";

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

export async function getChatResponse(input: ChatInput) {
    "use server";
    try {
        const response = await chat(input);
        return response;
    } catch (error) {
        console.error(error);
        return { response: "Sorry, I'm having trouble connecting to the AI. Please try again later." };
    }
}
