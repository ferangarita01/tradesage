
import {genkit} from 'genkit';
import {openai} from '@genkit-ai/openai';
import {googleAI} from '@genkit-ai/googleai';

// Define the model to be used throughout the application
export const mistralModel = 'mistralai/mistral-7b-instruct-v0.2';

export const ai = genkit({
  plugins: [
    // Configure the OpenAI plugin to work with OpenRouter
    openai({
      apiKey: process.env.OPENROUTER_API_KEY,
      baseUrl: 'https://openrouter.ai/api/v1',
    }),
    googleAI(),
  ],
  // Log all errors and warnings to the console
  logLevel: 'debug',
});
