
'use server';

import { z } from "zod";
import { modelsMap } from "@/ai/models/sageLLMs";
import { analyzeChart } from "./analyze-chart-patterns";
import { ai } from "../genkit";

const CandleSchema = z.object({
  time: z.string(),
  price: z.number(),
});

const ChatInputSchema = z.object({
  message: z.string(),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string(),
      })
    )
    .optional(),
  assetName: z.string().optional(),
  candles: z.array(CandleSchema).optional(),
  model: z.string().optional().default("openai"),
});
export type ChatInput = z.infer<typeof ChatInputSchema>;

const ChatOutputSchema = z.object({
  response: z.string(),
});
export type ChatOutput = z.infer<typeof ChatOutputSchema>;


export async function chat(input: ChatInput): Promise<ChatOutput> {
  const { message, history = [], model = "mistral", assetName, candles } = input;

  const modelKey = model as keyof typeof modelsMap;
  let modelToUse = modelsMap[modelKey] || modelsMap.mistral;

  const isGptModel = modelToUse.startsWith("openai/");

  let apiUrl = "https://openrouter.ai/api/v1/chat/completions";
  let apiKey = process.env.OPENROUTER_API_KEY;

  if (isGptModel) {
    apiUrl = "https://api.openai.com/v1/chat/completions";
    apiKey = process.env.OPENAI_API_KEY;
    modelToUse = modelToUse.replace("openai/", ""); // OpenAI API no quiere el prefijo
  }


  if (!apiKey) {
      const errorMsg = isGptModel
        ? "La clave OPENAI_API_KEY no está configurada."
        : "La clave OPENROUTER_API_KEY no está configurada.";
      console.error(`❌ ${errorMsg}`);
      return { response: `Error: ${errorMsg}` };
  }


  // Si el usuario pregunta sobre el gráfico, primero usa la herramienta
  if (assetName && candles && (message.toLowerCase().includes('chart') || message.toLowerCase().includes('gráfico'))) {
    try {
        const analysisResult = await analyzeChart({ assetName, candles });
        const analysisText = `Análisis para ${assetName}: ${analysisResult.analysisResult} (Confianza: ${analysisResult.confidenceLevel.toFixed(2)})`;
        // Preparamos un mensaje del sistema con el análisis para la conversación
         const systemMessage = {
             role: "assistant",
             content: `Aquí tienes un análisis del gráfico actual antes de que respondas: ${analysisText}`
         };

        const messages = [
            ...history.map(h => ({ role: h.role, content: h.content })),
            systemMessage,
            { role: "user", content: message }
        ];

         const res = await fetch(apiUrl, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${apiKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: modelToUse,
                messages: messages,
            }),
        });

        if (!res.ok) {
            console.error("API request failed:", await res.text());
            return { response: "Lo siento, no pude conectar con la IA para el análisis." };
        }
        const data = await res.json();
        const responseText = data?.choices?.[0]?.message?.content ?? "No pude generar una respuesta tras el análisis.";
        return { response: responseText };


    } catch(e) {
        console.error("Error al analizar el gráfico con la herramienta", e);
        return { response: "Hubo un error al intentar analizar el gráfico." };
    }
  }


  // Flujo normal de chat si no se pide análisis
  const messages = [
    ...history.map((h) => ({
      role: h.role,
      content: h.content,
    })),
    { role: "user", content: message },
  ];

  const res = await fetch(apiUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: modelToUse,
      messages,
    }),
  });

  if (!res.ok) {
    console.error("API request failed:", await res.text());
    return { response: "Lo siento, no pude conectar con la IA." };
  }

  const data = await res.json();
  const responseText =
    data?.choices?.[0]?.message?.content ??
    "Lo siento, no pude generar una respuesta.";

  return { response: responseText };
}
