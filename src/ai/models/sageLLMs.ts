
'use server';

import {openai} from '@genkit-ai/openai';

// Opción OpenRouter con Mistral (gratis)
export const mistralLLM = openai.model('mistralai/mistral-7b-instruct-v0.2');

// Opción OpenRouter con LLaMA2 (gratis)
export const llamaLLM = openai.model('meta-llama/llama-2-13b-chat');

// Opción OpenRouter con Yi-34B (gratis OSS grande)
export const yiLLM = openai.model('01-ai/yi-34b-chat');

// Ejemplo de un modelo de pago “fallback”
export const gptLLM = openai.model('openai/gpt-4o-mini');
