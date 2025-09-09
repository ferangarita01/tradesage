
'use server';

/**
 * @fileOverview Aggregates relevant news articles and information related to user-selected cryptocurrencies and stocks.
 *
 * - aggregateRelevantNews - A function that handles the news aggregation process.
 * - AggregateRelevantNewsInput - The input type for the aggregateRelevantNews function.
 * - AggregateRelevantNewsOutput - The return type for the aggregateRelevantNews function.
 */

import { chatComplete } from '@/ai/providers/chat';
import { z } from 'zod';

const AggregateRelevantNewsInputSchema = z.object({
  assets: z
    .array(z.string())
    .describe('A list of cryptocurrency and stock symbols to search for news about.'),
});
export type AggregateRelevantNewsInput = z.infer<typeof AggregateRelevantNewsInputSchema>;

const AggregateRelevantNewsOutputSchema = z.object({
  newsItems: z.array(z.string()).describe('A list of relevant news articles.'),
  impactful: z.boolean().describe('Whether or not the news will have an impact on prices'),
});
export type AggregateRelevantNewsOutput = z.infer<typeof AggregateRelevantNewsOutputSchema>;

export async function aggregateRelevantNews(input: AggregateRelevantNewsInput): Promise<AggregateRelevantNewsOutput> {
  const systemPrompt = `You are an AI assistant specialized in financial markets and news analysis.
Your task is to aggregate relevant news articles for cryptocurrencies and stocks.
Only include news that could significantly impact asset prices.`;

  const userPrompt = `Find and aggregate relevant news articles for these assets: ${input.assets.join(", ")}.

Focus on:
- Market-moving events
- Regulatory changes
- Major partnerships or developments
- Technical breakthroughs
- Institutional adoption

RESPOND ONLY in valid JSON format:
{
  "newsItems": ["news headline 1", "news headline 2", "..."],
  "impactful": true/false
}`;

  try {
    const raw = await chatComplete({
      system: systemPrompt,
      user: userPrompt,
      model: "openai/gpt-4o-mini",
      temperature: 0.2
    });

    const parsed = JSON.parse(raw);
    return AggregateRelevantNewsOutputSchema.parse(parsed);
  } catch (error) {
    console.error("Error in aggregateRelevantNewsWithOpenRouter:", error);
    return { newsItems: [], impactful: false };
  }
}
