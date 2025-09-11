
'use server';

import type {
  AnalyzeChartInput,
  AnalyzeChartOutput,
  ChatInput,
  ChatOutput,
  DetectChartPatternsInput,
  DetectChartPatternsOutput,
} from '@/types/ai-types';

import {analyzeChart} from '@/ai/flows/analyze-chart-patterns';
import {chat} from '@/ai/flows/chat';
import {detectChartPatterns} from '@/ai/flows/detect-chart-patterns';

export async function getChartAnalysis(
  input: AnalyzeChartInput
): Promise<AnalyzeChartOutput> {
  try {
    const analysis = await analyzeChart(input);
    return analysis;
  } catch (error) {
    console.error(error);
    // In a real app, you'd want more robust error handling
    throw new Error('Failed to analyze chart.');
  }
}

export async function getPatternAnalysis(
  input: DetectChartPatternsInput
): Promise<DetectChartPatternsOutput> {
  try {
    const analysis = await detectChartPatterns(input);
    return analysis;
  } catch (error) {
    console.error('Error in getPatternAnalysis:', error);
    return {patterns: []};
  }
}

export async function getChatResponse(input: ChatInput): Promise<ChatOutput> {
  try {
    const response = await chat(input);
    return response;
  } catch (error) {
    console.error('Error in getChatResponse:', error);
    return {
      response:
        "Sorry, I'm having trouble connecting to the AI. Please try again later.",
    };
  }
}
