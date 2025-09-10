// ------------------------------
// Modelos a través de OpenRouter
// (se usan igual que en la doc de OpenRouter)
// ------------------------------
const mistralLLM = "mistralai/mistral-small-latest";
const llamaLLM   = "meta-llama/llama-3-8b-instruct";
const yiLLM      = "01-ai/yi-34b-chat";
const gptLLM     = "openai/gpt-4o-mini"; // ✅ válido en OpenRouter

// ------------------------------
// Modelos directos OpenAI (con OPENAI_API_KEY y api.openai.com)
// ------------------------------
const gpt35Turbo = "gpt-3.5-turbo";
const gpt4Turbo  = "gpt-4-turbo";
const gpt4o      = "gpt-4o";
const gpt4oMini  = "gpt-4o-mini";

// ------------------------------
// Export map unificado
// ------------------------------
export const modelsMap = {
  // OpenRouter
  mistral: mistralLLM,
  llama: llamaLLM,
  yi: yiLLM,
  gpt: gptLLM,

  // OpenAI direct
  gpt35: gpt35Turbo,
  gpt4: gpt4Turbo,
  gpt4o: gpt4o,
  gpt4oMini: gpt4oMini,
};