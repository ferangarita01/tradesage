import { config } from 'dotenv';
config(); // Carga las variables de entorno desde .env

import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import openAI from '@genkit-ai/compat-oai';

// Asegúrate de que la clave de API de OpenAI se esté utilizando si está disponible.
const openAIApiKey = process.env.OPENAI_API_KEY;
const openRouterApiKey = process.env.OPENROUTER_API_KEY;

const plugins = [googleAI()];

if (openAIApiKey) {
  plugins.push(
    openAI({
      apiKey: openAIApiKey,
    })
  );
}

if (openRouterApiKey) {
  plugins.push(
    openAI({
      apiKey: openRouterApiKey,
      baseUrl: 'https://openrouter.ai/api/v1',
    })
  );
}


export const ai = genkit({
  plugins,
});
