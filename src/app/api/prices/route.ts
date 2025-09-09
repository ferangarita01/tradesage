import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const symbol = searchParams.get("symbol") ?? "BTCUSDT";
  const interval = searchParams.get("interval") ?? "1m";
  const limit = parseInt(searchParams.get("limit") ?? "100");

  try {
    // Mapear símbolos de Binance a CoinGecko
    const symbolMap: Record<string, string> = {
      'BTCUSDT': 'bitcoin',
      'ETHUSDT': 'ethereum',
      'ADAUSDT': 'cardano',
      'BNBUSDT': 'binancecoin',
      'SOLUSDT': 'solana',
    };

    const coinId = symbolMap[symbol] || 'bitcoin';
    const url = `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=usd&days=1&interval=minute`;
    
    const res = await fetch(url);
    
    if (!res.ok) {
      throw new Error(`CoinGecko API error: ${res.status}`);
    }

    const data = await res.json();
    
    if (!data.prices || !Array.isArray(data.prices)) {
      throw new Error('Invalid data format from CoinGecko');
    }

    // Convertir formato CoinGecko a formato esperado
    const candles = data.prices.slice(-limit).map((price: [number, number]) => ({
      time: price[0],
      open: price[1],
      high: price[1],
      low: price[1], 
      close: price[1],
      volume: 0, // CoinGecko free no incluye volumen en este endpoint
    }));

    return NextResponse.json({ symbol, interval, candles });
  } catch (err: any) {
    console.error('API Error:', err);
    return NextResponse.json(
      { error: err.message || 'Unknown error' }, 
      { status: 500 }
    );
  }
}
