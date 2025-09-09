import { config } from 'dotenv';
config();

import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import openAI from '@genkit-ai/compat-oai';

const plugins = [googleAI()];

// OpenRouter plugin
if (process.env.OPENROUTER_API_KEY) {
  plugins.push(
    openAI('openrouter', {
      apiKey: process.env.OPENROUTER_API_KEY,
      baseUrl: 'https://openrouter.ai/api/v1',
    })
  );
}

// OpenAI plugin
if (process.env.OPENAI_API_KEY) {
  plugins.push(
    openAI('openai', {
      apiKey: process.env.OPENAI_API_KEY,
    })
  );
}

export const ai = genkit({
  plugins,
  logLevel: 'debug',
  enableTracingAndMetrics: true,
});
