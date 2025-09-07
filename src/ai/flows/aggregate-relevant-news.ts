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
  return aggregateRelevantNewsFlow(input);
}

const shouldIncludeTool = ai.defineTool({
  name: 'shouldIncludeTool',
  description: 'Determines if the provided article will affect the price of the asset',
  inputSchema: z.object({
    article: z.string().describe('The news article to analyze.'),
    asset: z.string().describe('The asset to analyze the article for'),
  }),
  outputSchema: z.boolean(),
}, async (input) => {
  // TODO: Implement the logic to determine if the article will affect the price of the asset
  // This could involve sentiment analysis, analysis of the article's content, etc.
  // For now, just return true
  return true;
});

const prompt = ai.definePrompt({
  name: 'aggregateRelevantNewsPrompt',
  input: {schema: AggregateRelevantNewsInputSchema},
  output: {schema: AggregateRelevantNewsOutputSchema},
  tools: [shouldIncludeTool],
  prompt: `You are an AI assistant tasked with aggregating relevant news articles for a list of cryptocurrencies and stocks.

  For each asset in the following list, search for relevant news articles and information. Use the shouldIncludeTool tool to determine if the article will affect the price of the asset. Only include impactful articles.

  Assets: {{{assets}}}
  `,
});

const aggregateRelevantNewsFlow = ai.defineFlow(
  {
    name: 'aggregateRelevantNewsFlow',
    inputSchema: AggregateRelevantNewsInputSchema,
    outputSchema: AggregateRelevantNewsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
