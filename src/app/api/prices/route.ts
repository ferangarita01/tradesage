// src/app/api/prices/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const symbol = (searchParams.get("symbol") ?? "bitcoin").toLowerCase();
  const interval = searchParams.get("interval") ?? "1m";

  try {
    // CoinGecko solo soporta "days" y "interval"
    const url = `https://api.coingecko.com/api/v3/coins/${symbol}/market_chart?vs_currency=usd&days=1&interval=minute`;
    const res = await fetch(url);

    if (!res.ok) {
      return NextResponse.json({ error: `CoinGecko error ${res.status}` }, { status: res.status });
    }

    const data = await res.json();

    // La respuesta es [{timestamp, price}]
    const candles = data.prices.map((d: [number, number]) => ({
      time: d[0],
      close: d[1],
    }));

    return NextResponse.json({ symbol, interval, candles });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}