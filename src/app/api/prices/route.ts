import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const symbol = searchParams.get("symbol") ?? "BTCUSDT";
  const interval = searchParams.get("interval") ?? "1m";
  const limit = searchParams.get("limit") ?? "100";

  try {
    const url = `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`;
    const res = await fetch(url, { next: { revalidate: 60 } }); // ISR cache
    const data = await res.json();

    // Map klines -> objeto más usable
    const candles = data.map((d: any) => ({
      time: d[0],
      open: parseFloat(d[1]),
      high: parseFloat(d[2]),
      low: parseFloat(d[3]),
      close: parseFloat(d[4]),
      volume: parseFloat(d[5]),
    }));

    return NextResponse.json({ symbol, interval, candles });
  } catch (err) {
    return NextResponse.json({ error: "Error fetching market data" }, { status: 500 });
  }
}
