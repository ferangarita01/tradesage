import { NextRequest, NextResponse } from "next/server";

// Simple in-memory cache
const cache = new Map<string, { data: any; timestamp: number }>();
const ongoingRequests = new Map<string, Promise<any>>();
const CACHE_DURATION = 60 * 1000; // 60 seconds

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const symbol = searchParams.get("symbol") ?? "BTCUSDT";
  const interval = searchParams.get("interval") ?? "1m";
  const limit = searchParams.get("limit") ?? "100";
  const cacheKey = `${symbol}-${interval}-${limit}`;

  // Check cache first
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return NextResponse.json(cached.data);
  }

  // If a request for the same data is already in progress, wait for it to complete
  if (ongoingRequests.has(cacheKey)) {
    try {
      const data = await ongoingRequests.get(cacheKey);
      return NextResponse.json(data);
    } catch (err: any) {
      return NextResponse.json(
        { error: `Server error: ${err.message ?? err}` },
        { status: 500 }
      );
    }
  }

  const fetchPromise = (async () => {
    try {
      const url = `https://api.binance.us/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`;
      const res = await fetch(url);

      if (!res.ok) {
        const errorBody = await res.text();
        console.error(
          `Binance API error: ${res.status} ${res.statusText}`,
          errorBody
        );
        throw new Error(`Binance API error: ${res.status} ${res.statusText}`);
      }

      const data = await res.json();
      if (!Array.isArray(data)) {
        throw new Error("Invalid data format from Binance");
      }

      const candles = data.map((d: any) => ({
        time: d[0],
        open: parseFloat(d[1]),
        high: parseFloat(d[2]),
        low: parseFloat(d[3]),
        close: parseFloat(d[4]),
        volume: parseFloat(d[5]),
      }));

      const responseData = { symbol, interval, candles };
      cache.set(cacheKey, { data: responseData, timestamp: Date.now() });
      return responseData;
    } finally {
      // Clean up the ongoing request entry once the fetch is complete
      ongoingRequests.delete(cacheKey);
    }
  })();

  ongoingRequests.set(cacheKey, fetchPromise);

  try {
    const data = await fetchPromise;
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json(
      { error: `Server error: ${err.message ?? err}` },
      { status: 500 }
    );
  }
}
