// src/app/api/patterns/route.ts
import { NextRequest, NextResponse } from "next/server";
import { detectChartPatterns } from "@/ai/flows/detect-chart-patterns";

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

    // Validar que las velas tengan el formato OHLC correcto
    const validatedCandles = candles.map((candle, index) => {
      if (!candle.time || candle.open === undefined || candle.close === undefined) {
        throw new Error(`Invalid candle format at index ${index}. Expected OHLC format with time, open, high, low, close, volume`);
      }
      
      return {
        time: String(candle.time),
        open: Number(candle.open),
        high: Number(candle.high),
        low: Number(candle.low),
        close: Number(candle.close),
        volume: Number(candle.volume || 0)
      };
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

export async function GET(req: NextRequest) {
  return NextResponse.json({
    message: "Pattern detection API is ready",
    usage: "POST /api/patterns with { candles: [...], assetName: 'BTC' }",
    expectedFormat: "OHLC candles: { time, open, high, low, close, volume }"
  });
}