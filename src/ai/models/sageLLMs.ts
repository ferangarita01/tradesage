
'use server';

import {openai} from '@genkit-ai/openai';

// Modelo gratuito: Mistral-7B Instruct
export const mistralLLM = openai.model('mistralai/mistral-7b-instruct-v0.2');

// Modelo gratuito: LLaMA2-13B Chat
export const llamaLLM = openai.model('meta-llama/llama-2-13b-chat');

// Modelo gratuito grande: Yi-34B
export const yiLLM = openai.model('01-ai/yi-34b-chat');

// Ejemplo: usar también GPT-4o mini vía OpenRouter (si algún día quieres)
// ¡este sí puede tener costo según plan de OpenRouter!
export const gptLLM = openai.model('openai/gpt-4o-mini');
