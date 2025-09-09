
'use server';

import {genkit} from 'genkit';
import {openai} from '@genkit-ai/openai';

export const ai = genkit({
  plugins: [
    openai({
      apiKey: process.env.OPENROUTER_API_KEY,
      baseUrl: 'https://openrouter.ai/api/v1',
    }),
  ],
});
