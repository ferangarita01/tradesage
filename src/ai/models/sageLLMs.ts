// src/ai/models/sageLLMs.ts

// ------------------------------
// Modelos a través de OpenRouter
// ------------------------------
const mistralLLM = 'openrouter/mistralai/mistral-small-latest';
const llamaLLM = 'openrouter/meta-llama/llama-3-8b-instruct';
const yiLLM = 'openrouter/01-ai/yi-34b-chat';
const gptLLM = 'openrouter/openai/gpt-4o-mini';

// ------------------------------
// Modelos directos de OpenAI
// (usando la API oficial de OpenAI, con process.env.OPENAI_API_KEY)
// ------------------------------
const gpt4oMini = 'openai/gpt-4o-mini';

export const modelsMap = {
  // OpenRouter
  mistral: mistralLLM,
  llama: llamaLLM,
  yi: yiLLM,
  
  // OpenAI direct
  gpt: gpt4oMini,
};
