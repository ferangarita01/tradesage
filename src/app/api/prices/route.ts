// src/app/api/prices/route.ts
import { NextRequest, NextResponse } from "next/server";

// --- Candle Aggregation Function ---
function aggregateCandles(prices: [number, number][], interval: string) {
  // Determine grouping size in minutes from interval string (e.g., "1m", "5m", "1h")
  let groupSize = 1; // Default to 1 minute
  if (interval.endsWith('m')) {
    groupSize = parseInt(interval.slice(0, -1), 10);
  } else if (interval.endsWith('h')) {
    groupSize = parseInt(interval.slice(0, -1), 10) * 60;
  }

  // If group size is 1 minute, we can just map the prices directly
  // (CoinGecko's free data is ~5min, but we treat it as the base unit)
  if (groupSize <= 1) {
    return prices.map(([time, price]) => ({
      time: time,
      open: price,
      high: price,
      low: price,
      close: price,
      volume: 0,
    }));
  }

  // For larger intervals, we aggregate into buckets
  const candles: any[] = [];
  let bucket: any = null;

  for (const [time, price] of prices) {
    // Calculate the start time of the bucket for the current price point
    const bucketTime = Math.floor(time / (groupSize * 60 * 1000)) * (groupSize * 60 * 1000);

    if (!bucket || bucket.time !== bucketTime) {
      if (bucket) {
        candles.push(bucket); // Push the completed bucket
      }
      // Start a new bucket
      bucket = {
        time: bucketTime,
        open: price,
        high: price,
        low: price,
        close: price,
        volume: 0,
      };
    } else {
      // Update the current bucket
      bucket.high = Math.max(bucket.high, price);
      bucket.low = Math.min(bucket.low, price);
      bucket.close = price;
    }
  }

  if (bucket) {
    candles.push(bucket); // Push the last bucket
  }

  return candles;
}

// --- CSV Export Function ---
function candlesToCSV(candles: any[]) {
  const header = "time,open,high,low,close,volume";
  const rows = candles.map(
    (c) => `${c.time},${c.open},${c.high},${c.low},${c.close},${c.volume}`
  );
  return [header, ...rows].join("\n");
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const symbol = searchParams.get("symbol") ?? "BTCUSDT";
  const interval = searchParams.get("interval") ?? "1m"; // e.g., "1m", "5m", "15m", "1h"
  const limit = parseInt(searchParams.get("limit") ?? "300", 10);
  const format = searchParams.get("format") ?? "json";

  try {
    const symbolMap: Record<string, string> = {
      BTCUSDT: "bitcoin",
      ETHUSDT: "ethereum",
      ADAUSDT: "cardano",
      BNBUSDT: "binancecoin",
      SOLUSDT: "solana",
      DOGEUSDT: "dogecoin",
      MATICUSDT: "matic-network",
      AVAXUSDT: "avalanche-2",
    };

    const coinId = symbolMap[symbol];
    if (!coinId) {
      return NextResponse.json(
        { error: `Symbol ${symbol} not supported. Available: ${Object.keys(symbolMap).join(", ")}` },
        { status: 400 }
      );
    }

    // ⚡️ ALWAYS fetch the highest resolution data for the last day from CoinGecko.
    // The `interval` parameter is NOT used here because the free /market_chart endpoint
    // does not support custom minute-based intervals. We fetch the raw data and aggregate it ourselves.
    const url = `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=usd&days=1`;
    const res = await fetch(url);

    if (!res.ok) {
      const errorText = await res.text().catch(() => "Unknown error");
      // The frontend expects a JSON error object
      return NextResponse.json(
        { error: `CoinGecko API error: ${res.status} ${res.statusText} - ${errorText}` },
        { status: res.status }
      );
    }

    const data = await res.json();
    if (!data.prices || !Array.isArray(data.prices)) {
      return NextResponse.json({ error: "Unexpected response format from CoinGecko" }, { status: 502 });
    }

    // --- Aggregate raw price data into OHLC candles based on the requested `interval` ---
    const candles = aggregateCandles(data.prices, interval).slice(-limit);

    // --- CSV export ---
    if (format === "csv") {
      const csv = candlesToCSV(candles);
      return new Response(csv, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="${symbol}_${interval}.csv"`,
        },
      });
    }

    // --- Respond with standard JSON ---
    return NextResponse.json({ symbol, interval, candles, source: "coingecko-public-agg" });

  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
