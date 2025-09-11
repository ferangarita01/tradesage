
'use server';

/**
 * @fileoverview Defines the chat flow for the TradeSage application.
 * This file handles the main chat logic, including tool usage for chart analysis.
 */
import {ai} from '@/ai/genkit';
import {
  AnalyzeChartInputSchema,
  AnalyzeChartOutputSchema,
  ChatInput,
  ChatInputSchema,
  ChatOutput,
  ChatOutputSchema,
} from '@/types/ai-types';
import {analyzeChart as analyzeChartTool} from './analyze-chart-patterns';
import {z} from 'zod';
import {modelsMap} from '../models/sageLLMs';

const chatPrompt = ai.definePrompt({
  name: 'chatPrompt',
  tools: [analyzeChartTool],
  input: {schema: ChatInputSchema},
  output: {schema: z.any()},
  prompt: `You are TradeSage, an expert trading assistant. 
        Your role is to provide insightful analysis of financial charts and engage in helpful conversations about trading.
        If the user asks a question about the current chart, use the 'analyzeChart' tool to get technical analysis before answering.
        
        Current asset: {{assetName}}

        Conversation History:
        {{#each history}}
            {{#if (eq role 'user')}}
                User: {{content}}
            {{/if}}
            {{#if (eq role 'assistant')}}
                TradeSage: {{content}}
            {{/if}}
        {{/each}}

        User's new message: {{message}}
        `,
  system: `You are a helpful trading assistant. Analyze charts when asked.`,
});

export const chatFlow = ai.defineFlow(
  {
    name: 'chatFlow',
    inputSchema: ChatInputSchema,
    outputSchema: ChatOutputSchema,
  },
  async input => {
    const {history, message, assetName, candles, model} = input;

    // Determine which model to use, default to mistral
    const selectedModel = model ? (modelsMap as any)[model] : modelsMap.mistral;

    // Run the prompt with tools
    const runner = await chatPrompt(
      {...input},
      {model: selectedModel as any}
    );
    const response = await runner.run({
      context: {
        analyzeChart: {
          assetName,
          candles,
        },
      },
    });

    if (response.isDone()) {
      return {
        response:
          (response.output()?.content as string) ||
          'I am unable to respond at this moment.',
      };
    }

    // Default response if no specific action is taken
    return {
      response:
        "I'm not sure how to respond to that. Please try rephrasing your question.",
    };
  }
);

export async function chat(input: ChatInput): Promise<ChatOutput> {
  return await chatFlow(input);
}
