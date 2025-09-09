import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import openAI from '@genkit-ai/compat-oai';

genkit({
  plugins: [
    googleAI(),
    openAI({
      apiKey: process.env.OPENROUTER_API_KEY,
      baseUrl: 'https://openrouter.ai/api/v1',
    }),
  ],
});
