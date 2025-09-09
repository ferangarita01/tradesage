
import {genkit} from 'genkit';
import {openai} from '@genkit-ai/openai';
import {googleAI} from '@genkit-ai/googleai';
import {mistralLLM, llamaLLM, yiLLM, gptLLM} from './models/sageLLMs';

export const ai = genkit({
  plugins: [
    // Configure the OpenAI plugin to work with OpenRouter
    openai({
      apiKey: process.env.OPENROUTER_API_KEY,
      baseUrl: 'https://openrouter.ai/api/v1',
    }),
    googleAI(),
  ],
  models: [mistralLLM, llamaLLM, yiLLM, gptLLM],
  // Log all errors and warnings to the console
  logLevel: 'debug',
});
