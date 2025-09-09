
'use server';

/**
 * @fileOverview Aggregates relevant news articles and information related to user-selected cryptocurrencies and stocks.
 *
 * - aggregateRelevantNews - A function that handles the news aggregation process.
 * - AggregateRelevantNewsInput - The input type for the aggregateRelevantNews function.
 * - AggregateRelevantNewsOutput - The return type for the aggregateRelevantNews function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { mistralLLM } from '../models/sageLLMs';

const AggregateRelevantNewsInputSchema = z.object({
  assets: z
    .array(z.string())
    .describe(
      'A list of cryptocurrency and stock symbols to search for news about.'
    ),
});
export type AggregateRelevantNewsInput = z.infer<
  typeof AggregateRelevantNewsInputSchema
>;

const AggregateRelevantNewsOutputSchema = z.object({
  newsItems: z.array(z.string()).describe('A list of relevant news articles.'),
  impactful: z
    .boolean()
    .describe('Whether or not the news will have an impact on prices'),
});
export type AggregateRelevantNewsOutput = z.infer<
  typeof AggregateRelevantNewsOutputSchema
>;

export async function aggregateRelevantNews(
  input: AggregateRelevantNewsInput
): Promise<AggregateRelevantNewsOutput> {
  return aggregateRelevantNewsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aggregateRelevantNewsPrompt',
  model: mistralLLM,
  input: {schema: AggregateRelevantNewsInputSchema},
  output: {schema: AggregateRelevantNewsOutputSchema},
  prompt: `You are an AI assistant specialized in financial markets and news analysis.
Your task is to aggregate relevant news articles for cryptocurrencies and stocks.
Only include news that could significantly impact asset prices.

Find and aggregate relevant news articles for these assets: {{assets}}.

Focus on:
- Market-moving events
- Regulatory changes
- Major partnerships or developments
- Technical breakthroughs
- Institutional adoption`,
});

const aggregateRelevantNewsFlow = ai.defineFlow(
  {
    name: 'aggregateRelevantNewsFlow',
    inputSchema: AggregateRelevantNewsInputSchema,
    outputSchema: AggregateRelevantNewsOutputSchema,
  },
  async input => {
    try {
      const {output} = await prompt(input);
      return output!;
    } catch (error) {
      console.error('Error in aggregateRelevantNewsFlow:', error);
      return {newsItems: [], impactful: false};
    }
  }
);
