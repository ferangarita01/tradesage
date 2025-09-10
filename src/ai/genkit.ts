import { genkit } from "genkit";
import { googleAI } from "@genkit-ai/googleai";
import openAI from "@genkit-ai/compat-oai";

export const ai = genkit({
  plugins: [
    googleAI(),
    openAI({
      apiKey: process.env.OPENAI_API_KEY || process.env.OPENROUTER_API_KEY,
      baseUrl: process.env.OPENAI_API_KEY
        ? "https://api.openai.com/v1"
        : "https://openrouter.ai/api/v1",
    }),
  ],
});