// src/ai/models/sageLLMs.ts

// Mistral Small (última versión, rápida y gratuita en OpenRouter)
const mistralLLM = 'mistralai/mistral-small-latest';

// LLaMA-3 8B (la versión más nueva de Llama)
const llamaLLM = 'meta-llama/llama-3-8b-instruct';

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
