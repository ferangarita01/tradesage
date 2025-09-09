// src/ai/openrouter.ts
import OpenAI from "openai";

export const openrouter = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY!, // defínelo en Vercel
  baseURL: "https://openrouter.ai/api/v1",
  defaultHeaders: {
    "HTTP-Referer": process.env.SITE_URL ?? "http://localhost:3000",
    "X-Title": process.env.APP_NAME ?? "Tradesage",
  },
});