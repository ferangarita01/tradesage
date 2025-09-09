// src/app/api/patterns/route.ts
import { NextRequest, NextResponse } from 'next/server';

interface CandleData {
  open: number;
  high: number;
  low: number;
  close: number;
  timestamp?: string;
}

interface PatternResult {
  pattern: string;
  range: [number, number];
  confidence: number;
  description: string;
  type: 'bullish' | 'bearish' | 'neutral';
}

// --- Utilidades para detectar máximos y mínimos locales ---
function localMaxima(data: number[], window: number = 2): number[] {
  const maxima: number[] = [];
  for (let i = window; i < data.length - window; i++) {
    let isMaxima = true;
    for (let j = i - window; j <= i + window; j++) {
      if (j !== i && data[j] >= data[i]) {
        isMaxima = false;
        break;
      }
    }
    if (isMaxima) maxima.push(i);
  }
  return maxima;
}

function localMinima(data: number[], window: number = 2): number[] {
  const minima: number[] = [];
  for (let i = window; i < data.length - window; i++) {
    let isMinima = true;
    for (let j = i - window; j <= i + window; j++) {
      if (j !== i && data[j] <= data[i]) {
        isMinima = false;
        break;
      }
    }
    if (isMinima) minima.push(i);
  }
  return minima;
}

// --- Detección de Head & Shoulders ---
function detectHeadAndShoulders(highs: number[]): PatternResult | null {
  const peaks = localMaxima(highs, 3);
  
  if (peaks.length >= 3) {
    for (let i = 0; i < peaks.length - 2; i++) {
      const [idx1, idx2, idx3] = [peaks[i], peaks[i + 1], peaks[i + 2]];
      const [p1, p2, p3] = [highs[idx1], highs[idx2], highs[idx3]];
      
      if (p2 > p1 && p2 > p3) {
        const shoulderDiff = Math.abs(p1 - p3) / Math.max(p1, p3);
        const headHeight = (p2 - Math.max(p1, p3)) / p2;
        
        if (shoulderDiff < 0.05 && headHeight > 0.02) {
          return {
            pattern: "Head & Shoulders",
            range: [idx1, idx3],
            confidence: Math.min(0.95, 0.7 + (1 - shoulderDiff) * 0.25),
            description: "Patrón bajista: cabeza con dos hombros similares",
            type: "bearish"
          };
        }
      }
    }
  }
  return null;
}

// --- Detección de Double Top ---
function detectDoubleTop(highs: number[]): PatternResult | null {
  const peaks = localMaxima(highs, 3);
  
  for (let i = 0; i < peaks.length - 1; i++) {
    const [idx1, idx2] = [peaks[i], peaks[i + 1]];
    const [p1, p2] = [highs[idx1], highs[idx2]];
    
    const priceDiff = Math.abs(p1 - p2) / Math.max(p1, p2);
    const distanceBetweenPeaks = idx2 - idx1;
    
    if (priceDiff < 0.03 && distanceBetweenPeaks > 5 && distanceBetweenPeaks < 50) {
      return {
        pattern: "Double Top",
        range: [idx1, idx2],
        confidence: Math.min(0.9, 0.6 + (1 - priceDiff) * 0.3),
        description: "Patrón bajista: dos máximos similares",
        type: "bearish"
      };
    }
  }
  return null;
}

// --- Detección de Double Bottom ---
function detectDoubleBottom(lows: number[]): PatternResult | null {
  const valleys = localMinima(lows, 3);
  
  for (let i = 0; i < valleys.length - 1; i++) {
    const [idx1, idx2] = [valleys[i], valleys[i + 1]];
    const [v1, v2] = [lows[idx1], lows[idx2]];
    
    const priceDiff = Math.abs(v1 - v2) / Math.min(v1, v2);
    const distanceBetweenValleys = idx2 - idx1;
    
    if (priceDiff < 0.03 && distanceBetweenValleys > 5 && distanceBetweenValleys < 50) {
      return {
        pattern: "Double Bottom",
        range: [idx1, idx2],
        confidence: Math.min(0.9, 0.6 + (1 - priceDiff) * 0.3),
        description: "Patrón alcista: dos mínimos similares",
        type: "bullish"
      };
    }
  }
  return null;
}

// --- Detección de Triángulo Ascendente ---
function detectAscendingTriangle(highs: number[], lows: number[]): PatternResult | null {
  if (highs.length < 20) return null;
  
  const recentHighs = highs.slice(-20);
  const recentLows = lows.slice(-20);
  
  const peaks = localMaxima(recentHighs, 2);
  if (peaks.length < 2) return null;
  
  const lastPeaks = peaks.slice(-3);
  const peakPrices = lastPeaks.map(i => recentHighs[i]);
  const resistanceLevel = peakPrices.reduce((a, b) => a + b) / peakPrices.length;
  
  const maxDeviation = Math.max(...peakPrices.map(p => Math.abs(p - resistanceLevel) / resistanceLevel));
  
  if (maxDeviation > 0.02) return null;
  
  const valleys = localMinima(recentLows, 2);
  if (valleys.length < 2) return null;
  
  const lastValleys = valleys.slice(-3);
  let ascendingTrend = true;
  
  for (let i = 1; i < lastValleys.length; i++) {
    if (recentLows[lastValleys[i]] <= recentLows[lastValleys[i - 1]]) {
      ascendingTrend = false;
      break;
    }
  }
  
  if (ascendingTrend) {
    return {
      pattern: "Ascending Triangle",
      range: [highs.length - 20, highs.length - 1],
      confidence: 0.8,
      description: "Patrón alcista: resistencia horizontal con soporte ascendente",
      type: "bullish"
    };
  }
  
  return null;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { candles } = body;
    
    if (!candles || !Array.isArray(candles)) {
      return NextResponse.json(
        { error: "Expected candles: Array<{open, high, low, close}>" },
        { status: 400 }
      );
    }

    const highs = candles.map((c: CandleData) => c.high);
    const lows = candles.map((c: CandleData) => c.low);
    
    const patterns: PatternResult[] = [];
    
    const headShoulders = detectHeadAndShoulders(highs);
    if (headShoulders) patterns.push(headShoulders);
    
    const doubleTop = detectDoubleTop(highs);
    if (doubleTop) patterns.push(doubleTop);
    
    const doubleBottom = detectDoubleBottom(lows);
    if (doubleBottom) patterns.push(doubleBottom);
    
    const ascendingTriangle = detectAscendingTriangle(highs, lows);
    if (ascendingTriangle) patterns.push(ascendingTriangle);
    
    return NextResponse.json({
      success: true,
      patterns,
      totalCandles: candles.length,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error("Pattern detection error:", error);
    return NextResponse.json(
      { error: "Internal server error during pattern detection" },
      { status: 500 }
    );
  }
}