
'use server';

/**
 * TradeSage Chat Flow (directo a OpenRouter API)
 */

import { z } from "zod";

// Usa tu modelsMap como antes
import { modelsMap } from "@/ai/models/sageLLMs";

// Esquema de entrada
const ChatInputSchema = z.object({
  message: z.string(),
  history: z.array(
    z.object({
      role: z.enum(["user", "assistant"]), // OpenRouter usa "assistant" en vez de "model"
      content: z.string(),
    })
  ),
  model: z.string().optional().default("mistral"),
});
export type ChatInput = z.infer<typeof ChatInputSchema>;

// Esquema de salida
const ChatOutputSchema = z.object({
  response: z.string(),
});
export type ChatOutput = z.infer<typeof ChatOutputSchema>;

// Función principal del chat
export async function chat(input: ChatInput): Promise<ChatOutput> {
  const { message, history, model = "mistral" } = input;

  const modelKey = model as keyof typeof modelsMap;
  const modelToUse = modelsMap[modelKey] || modelsMap.mistral;

  // Construir el array de mensajes compatible con OpenRouter
  const messages = [
    ...history.map((h) => ({
      role: h.role,
      content: h.content,
    })),
    { role: "user", content: message },
  ];

  try {
    // Llamada directa al endpoint de OpenRouter
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`, // ✅ Asegúrate de tener configurada tu API key en Cloud Run
        "Content-Type": "application/json",
        },
        body: JSON.stringify({
        model: modelToUse,
        messages,
        }),
    });

    if (!res.ok) {
        const errorBody = await res.text();
        console.error("OpenRouter API Error:", res.status, errorBody);
        return { response: `API Error: ${res.status}. Please check the server logs.` };
    }

    const data = await res.json();
    const responseText =
        data?.choices?.[0]?.message?.content ??
        "Lo siento, no pude generar una respuesta.";

    return { response: responseText };
  } catch (error) {
    console.error("Failed to fetch from OpenRouter:", error);
    return { response: "Sorry, I'm having trouble connecting to the AI. Please try again later." };
  }
}
