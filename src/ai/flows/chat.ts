
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
  model: z.string().optional().default("mistral"),
});
export type ChatInput = z.infer<typeof ChatInputSchema>;

const ChatOutputSchema = z.object({
  response: z.string(),
});
export type ChatOutput = z.infer<typeof ChatOutputSchema>;


const chatFlow = ai.defineFlow(
  {
    name: 'chatFlow',
    inputSchema: ChatInputSchema,
    outputSchema: ChatOutputSchema,
  },
  async (input) => {
    const { message, history = [], model = "mistral", assetName, candles } = input;
    const modelKey = model as keyof typeof modelsMap;
    const modelToUse = modelsMap[modelKey] || modelsMap.mistral;

    // Define el prompt del sistema con instrucciones claras sobre cuándo usar la herramienta
    const systemPrompt = `You are TradeSage, an AI assistant specializing in cryptocurrency analysis.
    If the user asks about the chart, technical analysis, patterns, or trends, you MUST use the 'analyzeChart' tool to get data-driven insights.
    Provide concise and helpful answers based on the tool's output. Do not make up analysis.
    The user is currently viewing the chart for: ${assetName || 'an unknown asset'}.`;

    // Prepara los mensajes para la IA, incluyendo el historial y el prompt del sistema
    const messages = [
        { role: "system", content: systemPrompt },
        ...history.map(h => ({ role: h.role as 'user' | 'assistant', content: h.content })),
        { role: "user", content: message },
    ];
    
    // Define el modelo y las herramientas a utilizar
    const llm = ai.model(modelToUse);
    const options = {
        tools: [analyzeChart],
        toolChoice: 'auto' as const,
    };

    // Ejecuta la llamada a la IA con el contexto de las velas si están disponibles
    // El contexto se pasa para que las herramientas lo puedan usar
    const response = await ai.generate({
        model: llm,
        prompt: { messages },
        context: {
            assetName,
            candles
        },
        ...options
    });
    

    const choice = response.choices[0];

    // Si la IA decide llamar a la herramienta
    if (choice.toolRequest) {
        console.log('Tool request detected:', choice.toolRequest);
        
        // Ejecuta la herramienta solicitada por la IA
        const toolResponse = await choice.toolRequest.run();
        
        // Vuelve a llamar a la IA con la respuesta de la herramienta para obtener una respuesta final en lenguaje natural
        const finalResponse = await ai.generate({
            model: llm,
            prompt: {
                messages: [
                    ...messages,
                    choice.message, // Incluye la solicitud de herramienta original de la IA
                    { role: 'tool', content: toolResponse } // Y la respuesta de la herramienta
                ]
            },
            ...options
        });

        return { response: finalResponse.text };
    }
    
    // Si la IA no usó una herramienta, simplemente devuelve su respuesta de texto
    return { response: choice.text };
  }
);


export async function chat(input: ChatInput): Promise<ChatOutput> {
  // Lógica para manejar diferentes modelos o APIs si es necesario.
  // Por ahora, usamos el flujo unificado de Genkit.

  const { message, history = [], model = "mistral", assetName, candles } = input;
  
  const isGptModel = model === 'gpt';
  let modelToUse = (model as keyof typeof modelsMap) || 'mistral';
  
  // Decide qué API Key usar
  const apiKey = isGptModel ? process.env.OPENAI_API_KEY : process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    const errorMsg = isGptModel
      ? "La clave OPENAI_API_KEY no está configurada."
      : "La clave OPENROUTER_API_KEY no está configurada.";
    console.error(`❌ ${errorMsg}`);
    return { response: `Error: ${errorMsg}` };
  }

  // Prepara los mensajes para la API
  const messages = [
    ...history.map(h => ({ role: h.role, content: h.content })),
    { role: "user", content: message }
  ];

  // Si el usuario pregunta sobre el gráfico y tenemos los datos, usamos el flujo con herramientas
  if (assetName && candles && (message.toLowerCase().includes('chart') || message.toLowerCase().includes('gráfico') || message.toLowerCase().includes('analiza'))) {
     console.log('Analysis request detected, using Genkit flow with tools...');
     return chatFlow(input);
  }

  // ---- Flujo de chat normal (sin análisis) usando fetch directo ----
  // Esto mantiene la funcionalidad de chat simple y rápida para preguntas generales.
  
  console.log('Simple chat request, using direct fetch...');
  const apiUrl = isGptModel ? "https://api.openai.com/v1/chat/completions" : "https://openrouter.ai/api/v1/chat/completions";
  const modelName = isGptModel ? modelsMap[modelToUse].replace('openai/', '') : modelsMap[modelToUse];

  const res = await fetch(apiUrl, {
    method: "POST",
    headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
    },
    body: JSON.stringify({
        model: modelName,
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
}
