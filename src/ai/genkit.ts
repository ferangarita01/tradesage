
import {genkit} from 'genkit';
import {openai} from '@genkit-ai/openai';
import {googleAI} from '@genkit-ai/googleai';

export const ai = genkit({
  plugins: [
    // Configuramos el plugin de "openai" para apuntar a OpenRouter
    openai({
      apiKey: process.env.OPENROUTER_API_KEY, // 🔑 tu API key de OpenRouter
      baseUrl: 'https://openrouter.ai/api/v1', // 🚀 apuntamos a OpenRouter
    }),
    googleAI(),
  ],
  logLevel: 'debug',
});
