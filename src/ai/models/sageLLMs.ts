// src/ai/models/sageLLMs.ts

// Mistral‑7B Instruct (gratis OSS ✅ versión estable v0.2)
const mistralLLM = 'mistralai/mistral-7b-instruct-v0.2';

// LLaMA‑2 13B Chat
const llamaLLM = 'meta-llama/llama-2-13b-chat';

// Yi‑34B Chat
const yiLLM = '01-ai/yi-34b-chat';

// GPT‑4o Mini (OpenRouter, puede tener costo)
const gptLLM = 'openai/gpt-4o-mini';

export const modelsMap = {
  mistral: mistralLLM,
  llama: llamaLLM,
  yi: yiLLM,
  gpt: gptLLM,
};
