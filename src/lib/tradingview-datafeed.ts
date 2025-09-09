import { IBasicDataFeed, LibrarySymbolInfo, ResolutionString, PeriodParams } from 'public/charting_library/datafeed-api';

class TradingViewDatafeed implements IBasicDataFeed {
  onReady(callback: (configurationData: any) => void): void {
    setTimeout(() => {
      callback({
        exchanges: [
          { value: 'Binance', name: 'Binance', desc: 'Binance Exchange' },
        ],
        symbols_types: [
          { name: 'crypto', value: 'crypto' }
        ],
        supported_resolutions: ['1', '5', '15', '30', '60', '240', '1D'],
        supports_marks: false,
        supports_timescale_marks: false,
        supports_time: true,
      });
    }, 0);
  }

  searchSymbols(
    userInput: string,
    exchange: string,
    symbolType: string,
    onResult: (symbols: any[]) => void
  ): void {
    // Símbolos populares para búsqueda
    const symbols = [
      { symbol: 'BTCUSDT', full_name: 'Bitcoin/USDT', description: 'Bitcoin vs USDT', exchange: 'Binance', type: 'crypto' },
      { symbol: 'ETHUSDT', full_name: 'Ethereum/USDT', description: 'Ethereum vs USDT', exchange: 'Binance', type: 'crypto' },
      { symbol: 'ADAUSDT', full_name: 'Cardano/USDT', description: 'Cardano vs USDT', exchange: 'Binance', type: 'crypto' },
    ];
    
    const filtered = symbols.filter(s => 
      s.symbol.toLowerCase().includes(userInput.toLowerCase()) ||
      s.description.toLowerCase().includes(userInput.toLowerCase())
    );
    
    onResult(filtered);
  }

  resolveSymbol(
    symbolName: string,
    onResolve: (symbolInfo: LibrarySymbolInfo) => void,
    onError: (error: any) => void
  ): void {
    const symbolInfo: LibrarySymbolInfo = {
      ticker: symbolName,
      name: symbolName,
      description: symbolName.replace('USDT', '/USDT'),
      type: 'crypto',
      session: '24x7',
      timezone: 'Etc/UTC',
      exchange: 'Binance',
      minmov: 1,
      pricescale: 100,
      has_intraday: true,
      has_weekly_and_monthly: false,
      supported_resolutions: ['1', '5', '15', '30', '60', '240', '1D'] as ResolutionString[],
      volume_precision: 2,
      data_status: 'streaming',
    };

    setTimeout(() => onResolve(symbolInfo), 0);
  }

  getBars(
    symbolInfo: LibrarySymbolInfo,
    resolution: ResolutionString,
    periodParams: PeriodParams,
    onResult: (bars: any[], meta: any) => void,
    onError: (error: any) => void
  ): void {
    const { from, to, firstDataRequest } = periodParams;
    
    // Convertir resolución TradingView a intervalo de tu API
    const intervalMap: Record<string, string> = {
      '1': '1m',
      '5': '5m',
      '15': '15m',
      '30': '30m',
      '60': '1h',
      '240': '4h',
      '1D': '1d',
    };

    const interval = intervalMap[resolution] || '1m';
    const limit = firstDataRequest ? 1000 : 100;

    // Llamar a tu API existente
    fetch(`/api/prices?symbol=${symbolInfo.ticker}&interval=${interval}&limit=${limit}`)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(data => {
        if (data.error) throw new Error(data.error);
        
        const bars = data.candles
          .filter((candle: any) => candle.time >= from * 1000 && candle.time <= to * 1000)
          .map((candle: any) => ({
            time: candle.time,
            low: candle.low || candle.close,
            high: candle.high || candle.close,
            open: candle.open || candle.close,
            close: candle.close,
            volume: candle.volume || 0,
          }));

        onResult(bars, { noData: bars.length === 0 });
      })
      .catch(error => {
        console.error('TradingView datafeed error:', error);
        onError(error.message);
      });
  }

  subscribeBars(
    symbolInfo: LibrarySymbolInfo,
    resolution: ResolutionString,
    onTick: (bar: any) => void,
    listenerGuid: string,
    onResetCacheNeededCallback: () => void
  ): void {
    // Implementar WebSocket o polling para datos en tiempo real
    // Por ahora, polling cada 30 segundos
    const interval = setInterval(() => {
      this.getBars(
        symbolInfo,
        resolution,
        { from: Date.now() / 1000 - 3600, to: Date.now() / 1000, firstDataRequest: false },
        (bars) => {
          if (bars.length > 0) {
            onTick(bars[bars.length - 1]);
          }
        },
        (error) => console.error('Real-time update error:', error)
      );
    }, 30000);

    // Guardar el interval para poder limpiarlo después
    (this as any)[`interval_${listenerGuid}`] = interval;
  }

  unsubscribeBars(listenerGuid: string): void {
    const interval = (this as any)[`interval_${listenerGuid}`];
    if (interval) {
      clearInterval(interval);
      delete (this as any)[`interval_${listenerGuid}`];
    }
  }
}

export default TradingViewDatafeed;
