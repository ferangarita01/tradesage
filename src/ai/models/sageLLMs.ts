
'use server';

import openAI from '@genkit-ai/compat-oai';

// Mistral‑7B Instruct (gratis OSS)
export const mistralLLM = openAI.model('mistralai/mistral-7b-instruct');

// LLaMA‑2 13B Chat
export const llamaLLM = openAI.model('meta-llama/llama-2-13b-chat');

// Yi‑34B Chat
export const yiLLM = openAI.model('01-ai/yi-34b-chat');

// GPT‑4o Mini (si quieres usarlo un día por OpenRouter)
export const gptLLM = openAI.model('openai/gpt-4o-mini');
