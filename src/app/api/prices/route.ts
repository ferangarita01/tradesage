// src/app/api/prices/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const symbol = searchParams.get("symbol") ?? "BTCUSDT";
  const limit = parseInt(searchParams.get("limit") ?? "100", 10);

  try {
    // Mapear tus símbolos tipo Binance → CoinGecko ids
    const symbolMap: Record<string, string> = {
      BTCUSDT: "bitcoin",
      ETHUSDT: "ethereum",
      ADAUSDT: "cardano",
      BNBUSDT: "binancecoin",
      SOLUSDT: "solana",
    };

    const coinId = symbolMap[symbol];
    if (!coinId) {
      return NextResponse.json({ error: `Symbol ${symbol} not supported` }, { status: 400 });
    }

    // 🎯 API PRO en vez de api.coingecko.com
    const url = `https://pro-api.coingecko.com/api/v3/coins/${coinId}/ohlc?vs_currency=usd&days=1`;

    const res = await fetch(url, {
      headers: {
        "x-cg-pro-api-key": process.env.COINGECKO_API_KEY!, // ⚠️ clave desde .env.local
      },
    });

    if (!res.ok) {
      const errorBody = await res.text();
      console.error(`CoinGecko PRO error: ${res.status} ${res.statusText}`, errorBody);
      return NextResponse.json(
        { error: `CoinGecko PRO error: ${res.status} ${res.statusText}` },
        { status: res.status }
      );
    }

    const data = await res.json();

    // CoinGecko PRO OHLC: [timestamp, open, high, low, close]
    if (!Array.isArray(data)) {
      console.error("Unexpected data format from CoinGecko PRO", data);
      return NextResponse.json(
        { error: "Unexpected data format from CoinGecko PRO" },
        { status: 502 }
      );
    }

    const candles = data.slice(-limit).map((d: any[]) => ({
      time: d[0],
      open: d[1],
      high: d[2],
      low: d[3],
      close: d[4],
      volume: 0, // solo en PRO plan avanzado viene volumen
    }));

    return NextResponse.json({ symbol, interval: "1m", candles });
  } catch (err: any) {
    console.error("API Error:", err);
    return NextResponse.json({ error: err.message || "Internal error" }, { status: 500 });
  }
}
