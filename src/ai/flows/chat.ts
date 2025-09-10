import OpenAI from "openai";

// Configuración del cliente OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Asegúrate de tener esta variable en tu .env
});

// Tipos para el chat
interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface ChatResponse {
  success: boolean;
  message?: string;
  error?: string;
}

// Función principal para chat con IA
export async function chatWithAI(
  userMessage: string,
  conversationHistory: ChatMessage[] = []
): Promise<ChatResponse> {
  try {
    // Construir el array de mensajes
    const messages: ChatMessage[] = [
      {
        role: "system",
        content: `Eres un asistente experto en análisis técnico y trading. 
        Ayudas a los usuarios a analizar gráficas financieras, identificar patrones de trading,
        y crear indicadores personalizados. Responde de manera clara y precisa.`
      },
      ...conversationHistory,
      {
        role: "user",
        content: userMessage
      }
    ];

    // Llamada a OpenAI API con manejo de errores y reintentos
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Puedes cambiar a gpt-4o, gpt-4.1, etc.
      messages: messages,
      max_tokens: 1000,
      temperature: 0.7,
    });

    const aiMessage = response.choices[0]?.message?.content;

    if (!aiMessage) {
      return {
        success: false,
        error: "No se recibió respuesta de la IA"
      };
    }

    return {
      success: true,
      message: aiMessage
    };

  } catch (error: any) {
    console.error("Error en chatWithAI:", error);
    
    // Manejo específico de errores de OpenAI
    if (error.status === 401) {
      return {
        success: false,
        error: "Error de autenticación: Verifica tu API key de OpenAI"
      };
    } else if (error.status === 429) {
      return {
        success: false,
        error: "Límite de rate excedido. Intenta de nuevo en unos momentos"
      };
    } else if (error.status === 500) {
      return {
        success: false,
        error: "Error del servidor de OpenAI. Intenta de nuevo más tarde"
      };
    }

    return {
      success: false,
      error: `Error de conexión: ${error.message || "Error desconocido"}`
    };
  }
}

// Función para análisis de patrones en gráficas
export async function analyzeChartPattern(
  chartDescription: string,
  timeframe: string = "1D"
): Promise<ChatResponse> {
  const prompt = `
  Analiza el siguiente patrón de gráfica de trading:
  
  Descripción: ${chartDescription}
  Timeframe: ${timeframe}
  
  Por favor proporciona:
  1. Identificación del patrón (si existe)
  2. Niveles de soporte y resistencia
  3. Posibles puntos de entrada y salida
  4. Gestión de riesgo recomendada
  5. Probabilidad de éxito del patrón
  `;

  return await chatWithAI(prompt);
}

// Función para generar código de indicadores personalizados
export async function generateCustomIndicator(
  indicatorDescription: string,
  platform: string = "TradingView"
): Promise<ChatResponse> {
  const prompt = `
  Genera el código para un indicador personalizado de trading:
  
  Descripción: ${indicatorDescription}
  Plataforma: ${platform}
  
  Por favor proporciona:
  1. Código completo del indicador
  2. Explicación de la lógica
  3. Parámetros configurables
  4. Instrucciones de instalación
  `;

  return await chatWithAI(prompt);
}

// Función con reintentos automáticos
export async function chatWithRetry(
  userMessage: string,
  maxRetries: number = 3,
  conversationHistory: ChatMessage[] = []
): Promise<ChatResponse> {
  let lastError: string = "";

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const result = await chatWithAI(userMessage, conversationHistory);
    
    if (result.success) {
      return result;
    }

    lastError = result.error || "Error desconocido";
    
    if (attempt < maxRetries) {
      // Esperar antes del siguiente intento (backoff exponencial)
      const delay = Math.pow(2, attempt) * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  return {
    success: false,
    error: `Falló después de ${maxRetries} intentos. Último error: ${lastError}`
  };
}

// Función para validar la configuración
export function validateOpenAIConfig(): boolean {
  if (!process.env.OPENAI_API_KEY) {
    console.error("❌ OPENAI_API_KEY no está configurada en las variables de entorno");
    return false;
  }
  
  if (!process.env.OPENAI_API_KEY.startsWith('sk-')) {
    console.error("❌ OPENAI_API_KEY no tiene el formato correcto");
    return false;
  }

  console.log("✅ Configuración de OpenAI validada correctamente");
  return true;
}

// ========================================
// COMPATIBILIDAD CON ACTIONS.TS
// ========================================

// Alias para compatibilidad con actions.ts
export const chat = chatWithAI;

// Tipo de input esperado por actions.ts
export type ChatInput = string;