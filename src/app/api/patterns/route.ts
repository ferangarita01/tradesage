
// src/app/api/patterns/route.ts
import { NextRequest, NextResponse } from "next/server";
import { detectChartPatterns } from "@/ai/flows/detect-chart-patterns";
import { CandleSchema } from "@/types/ai-types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { candles, assetName = "Unknown Asset" } = body;

    // Validación básica
    if (!candles || !Array.isArray(candles) || candles.length === 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Missing or empty candles array" 
        },
        { status: 400 }
      );
    }

    const validatedCandles = candles.map((candle: any, index: number) => {
        const validation = CandleSchema.safeParse(candle);
        if (!validation.success) {
            console.error(`Invalid candle at index ${index}:`, validation.error.format());
            throw new Error(`Invalid candle format at index ${index}.`);
        }
        return validation.data;
    });

    console.log(`🔍 Analyzing ${validatedCandles.length} candles for ${assetName}`);

    // Llamar al flow de detección de patrones
    const result = await detectChartPatterns({ 
      candles: validatedCandles, 
      assetName 
    });

    console.log(`✅ Pattern detection completed. Found ${result.patterns?.length || 0} patterns`);

    return NextResponse.json({
      success: true,
      assetName,
      candleCount: validatedCandles.length,
      ...result
    });

  } catch (error: any) {
    console.error("❌ Pattern detection error:", error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || "Failed to analyze chart patterns",
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Pattern detection API is ready",
    usage: "POST /api/patterns with { candles: [...], assetName: 'BTC' }",
    expectedFormat: "OHLCV candle: { time: string, open: number, high: number, low: number, close: number, volume: number }"
  });
}

