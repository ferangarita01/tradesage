'use server';

import {model} from '@genkit-ai/compat-oai';
import {googleAI} from '@genkit-ai/googleai';

// Mistral‑7B Instruct (gratis OSS)
export const mistralLLM = model('mistralai/mistral-7b-instruct');

// LLaMA‑2 13B Chat
export const llamaLLM = model('meta-llama/llama-2-13b-chat');

// Yi‑34B Chat
export const yiLLM = model('01-ai/yi-34b-chat');

// GPT‑4o Mini (si quieres usarlo un día por OpenRouter)
export const gptLLM = model('openai/gpt-4o-mini');
