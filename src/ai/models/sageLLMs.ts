
'use server';

import {openai} from '@genkit-ai/openai';

// Mistral‑7B Instruct (gratis OSS)
export const mistralLLM = openai.model('mistralai/mistral-7b-instruct-v0.2');

// LLaMA‑2 13B Chat
export const llamaLLM = openai.model('meta-llama/llama-2-13b-chat');

// Yi‑34B Chat
export const yiLLM = openai.model('01-ai/yi-34b-chat');

// GPT‑4o Mini (si quieres usarlo un día por OpenRouter)
export const gptLLM = openai.model('openai/gpt-4o-mini');
