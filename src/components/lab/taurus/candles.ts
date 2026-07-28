/** Una vela OHLC. `up` = cierre por encima de apertura. */
export type Candle = {
  open: number;
  high: number;
  low: number;
  close: number;
  up: boolean;
};

const VOLATILITY = 5.2;
const WICK_SPREAD = 3.4;

/** Random walk determinista-ish: cada vela abre donde cerró la anterior. */
export function nextCandle(previousClose: number): Candle {
  const open = previousClose;
  const drift = (Math.random() - 0.48) * VOLATILITY;
  const close = Math.max(8, open + drift);
  const high = Math.max(open, close) + Math.random() * WICK_SPREAD;
  const low = Math.min(open, close) - Math.random() * WICK_SPREAD;

  return { open, high, low, close, up: close >= open };
}

/** Semilla inicial de velas para que el gráfico no arranque vacío. */
export function seedCandles(count: number, start = 100): Candle[] {
  const candles: Candle[] = [];
  let close = start;

  for (let index = 0; index < count; index += 1) {
    const candle = nextCandle(close);
    candles.push(candle);
    close = candle.close;
  }

  return candles;
}
