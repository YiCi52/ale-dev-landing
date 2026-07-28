"use client";

import { useEffect, useRef } from "react";

import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { type Candle, nextCandle, seedCandles } from "./candles";

const CANDLE_COUNT = 42;
const NEW_CANDLE_EVERY_MS = 900;
const COLOR_UP = "#f4f4f6";
const COLOR_DOWN = "#e5364b";

type Bounds = { min: number; max: number };

function priceBounds(candles: Candle[]): Bounds {
  let min = Infinity;
  let max = -Infinity;
  for (const candle of candles) {
    if (candle.low < min) min = candle.low;
    if (candle.high > max) max = candle.high;
  }
  const pad = (max - min) * 0.12 || 1;
  return { min: min - pad, max: max + pad };
}

/**
 * Terminal de velas del hero. Canvas 2D con random walk que agrega una vela
 * nueva cada ~0.9s y desplaza el buffer — da la sensación de "mercado en vivo"
 * sin ninguna dependencia externa (ni TradingView ni WebSocket).
 */
export function CandlestickChart({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isReducedMotion = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let candles = seedCandles(CANDLE_COUNT);
    let width = 0;
    let height = 0;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const draw = () => {
      const { min, max } = priceBounds(candles);
      const range = max - min || 1;
      const slot = width / candles.length;
      const bodyWidth = Math.max(2, slot * 0.56);
      const toY = (price: number) => height - ((price - min) / range) * height;

      ctx.clearRect(0, 0, width, height);

      // Rejilla tenue horizontal — vocabulario de terminal.
      ctx.strokeStyle = "rgba(255,255,255,0.05)";
      ctx.lineWidth = 1;
      for (let line = 1; line < 5; line += 1) {
        const y = (height / 5) * line;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      candles.forEach((candle, index) => {
        const cx = index * slot + slot / 2;
        const color = candle.up ? COLOR_UP : COLOR_DOWN;
        ctx.strokeStyle = color;
        ctx.fillStyle = color;

        // Mecha.
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(cx, toY(candle.high));
        ctx.lineTo(cx, toY(candle.low));
        ctx.stroke();

        // Cuerpo.
        const openY = toY(candle.open);
        const closeY = toY(candle.close);
        const top = Math.min(openY, closeY);
        const bodyHeight = Math.max(1.5, Math.abs(closeY - openY));
        ctx.fillRect(cx - bodyWidth / 2, top, bodyWidth, bodyHeight);
      });

      // Línea de último precio, punteada, cruzando todo el ancho.
      const last = candles[candles.length - 1];
      const lastY = toY(last.close);
      ctx.strokeStyle = "rgba(229,54,75,0.55)";
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(0, lastY);
      ctx.lineTo(width, lastY);
      ctx.stroke();
      ctx.setLineDash([]);
    };

    draw();

    if (isReducedMotion) {
      window.removeEventListener("resize", resize);
      return;
    }

    const tick = window.setInterval(() => {
      const last = candles[candles.length - 1];
      candles = [...candles.slice(1), nextCandle(last.close)];
      draw();
    }, NEW_CANDLE_EVERY_MS);

    return () => {
      window.clearInterval(tick);
      window.removeEventListener("resize", resize);
    };
  }, [isReducedMotion]);

  return <canvas ref={canvasRef} className={className} aria-hidden />;
}
