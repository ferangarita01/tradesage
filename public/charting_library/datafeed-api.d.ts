export interface ChartingLibraryWidgetOptions {
	container: string | HTMLElement;
	datafeed: IBasicDataFeed | (IBasicDataFeed & IDatafeedQuotesApi & IDatafeedSymbolSearchApi);
	interval: ResolutionString;
	symbol?: string;
	autosize?: boolean;
	fullscreen?: boolean;
	library_path?: string;
	locale: LanguageCode;
	theme?: 'Light' | 'Dark';
	[key: string]: any;
  }

export interface IBasicDataFeed {
	onReady(callback: (configurationData: any) => void): void;
	searchSymbols(userInput: string, exchange: string, symbolType: string, onResult: (symbols: any[]) => void): void;
	resolveSymbol(symbolName: string, onResolve: (symbolInfo: LibrarySymbolInfo) => void, onError: (error: any) => void): void;
	getBars(symbolInfo: LibrarySymbolInfo, resolution: ResolutionString, periodParams: PeriodParams, onResult: (bars: any[], meta: any) => void, onError: (error: any) => void): void;
	subscribeBars(symbolInfo: LibrarySymbolInfo, resolution: ResolutionString, onTick: (bar: any) => void, listenerGuid: string, onResetCacheNeededCallback: () => void): void;
	unsubscribeBars(listenerGuid: string): void;
  }
  
  export interface IDatafeedQuotesApi {
	getQuotes(symbols: string[], onData: (data: any[]) => void, onError: (error: any) => void): void;
	subscribeQuotes(symbols: string[], fastSymbols: string[], onRealtimeCallback: (data: any[]) => void, listenerGUID: string): void;
	unsubscribeQuotes(listenerGUID: string): void;
  }
  
  export interface IDatafeedSymbolSearchApi {
	searchSymbols(userInput: string, exchange: string, symbolType: string, onResult: (symbols: any[]) => void): void;
  }

  export interface LibrarySymbolInfo {
	ticker: string;
	name: string;
	description: string;
	type: string;
	session: string;
	timezone: string;
	exchange: string;
	minmov: number;
	pricescale: number;
	has_intraday: boolean;
	has_weekly_and_monthly: boolean;
	supported_resolutions: ResolutionString[];
	volume_precision: number;
	data_status: string;
  }

  export type ResolutionString = string;
  export type LanguageCode = string;

  export interface PeriodParams {
	from: number;
	to: number;
	firstDataRequest: boolean;
  }
  
