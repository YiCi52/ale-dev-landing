"use client";

import { useEffect, useRef } from "react";

/**
 * Atmósfera líquida del hero — "mar negro" iridiscente que reacciona al cursor.
 * Blobs oscuros con matices iridiscentes (crystal: cálido + violeta + teal) que
 * fluyen hacia el puntero con lag, dando sensación de líquido. La máscara inferior
 * funde el efecto al negro para que no haya corte con la siguiente sección.
 * Canvas 2D, cero deps. Reduced-motion: queda estático y sin reacción al cursor.
 */
export function HeroAtmosphere() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const parent = canvas?.parentElement;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !parent || !ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let w = 0;
    let h = 0;

    // Paleta "mar negro" + iridiscencia crystal
    const cols: Array<[number, number, number]> = [
      [206, 150, 96], // ámbar cálido
      [150, 120, 210], // violeta iridiscente
      [96, 170, 185], // teal frío
      [188, 120, 155], // magenta apagado
    ];

    const blobs = Array.from({ length: 5 }, (_, i) => ({
      x: Math.random(),
      y: Math.random(),
      bx: Math.random(),
      by: Math.random(),
      r: 0.32 + Math.random() * 0.3,
      dx: (Math.random() - 0.5) * 0.00005,
      dy: (Math.random() - 0.5) * 0.00005,
      c: cols[i % cols.length],
      a: 0.16 + Math.random() * 0.1,
      ph: Math.random() * 6.28,
    }));

    const pointer = { tx: 0.5, ty: 0.4, x: 0.5, y: 0.4, active: false };
    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointer.tx = (e.clientX - rect.left) / rect.width;
      pointer.ty = (e.clientY - rect.top) / rect.height;
      pointer.active = true;
    };
    if (!reduce) window.addEventListener("pointermove", onMove, { passive: true });

    const size = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.width = parent.clientWidth * dpr;
      h = canvas.height = parent.clientHeight * dpr;
      canvas.style.width = `${parent.clientWidth}px`;
      canvas.style.height = `${parent.clientHeight}px`;
    };
    size();
    window.addEventListener("resize", size);

    let raf = 0;
    let visible = true;
    const render = (t: number) => {
      pointer.x += (pointer.tx - pointer.x) * 0.06;
      pointer.y += (pointer.ty - pointer.y) * 0.06;

      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = "lighter";

      for (const b of blobs) {
        b.bx += b.dx;
        b.by += b.dy;
        if (b.bx < -0.15 || b.bx > 1.15) b.dx *= -1;
        if (b.by < -0.15 || b.by > 1.15) b.dy *= -1;

        // Atracción al puntero según cercanía → el líquido fluye hacia el cursor
        const ddx = pointer.x - b.bx;
        const ddy = pointer.y - b.by;
        const dist = Math.hypot(ddx, ddy);
        const pull = pointer.active ? Math.max(0, 1 - dist / 0.65) * 0.14 : 0;
        const targetX = b.bx + ddx * pull;
        const targetY = b.by + ddy * pull;

        b.x += (targetX - b.x) * 0.05;
        b.y += (targetY - b.y) * 0.05;

        const pulse = 0.85 + Math.sin(t * 0.0002 + b.ph) * 0.15;
        const px = b.x * w;
        const py = b.y * h;
        const rad = b.r * Math.max(w, h) * pulse;
        const g = ctx.createRadialGradient(px, py, 0, px, py, rad);
        g.addColorStop(0, `rgba(${b.c[0]},${b.c[1]},${b.c[2]},${b.a})`);
        g.addColorStop(1, `rgba(${b.c[0]},${b.c[1]},${b.c[2]},0)`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(px, py, rad, 0, 6.2832);
        ctx.fill();
      }

      ctx.globalCompositeOperation = "source-over";
      if (!reduce && visible) raf = requestAnimationFrame(render);
      else raf = 0;
    };
    raf = requestAnimationFrame(render);

    // Pausa el loop cuando el hero sale del viewport (perf, sobre todo mobile)
    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible && !reduce && !raf) raf = requestAnimationFrame(render);
      },
      { rootMargin: "50px" },
    );
    io.observe(canvas);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener("resize", size);
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10 h-full w-full"
      style={{
        maskImage: "linear-gradient(to bottom, #000 55%, transparent 90%)",
        WebkitMaskImage: "linear-gradient(to bottom, #000 55%, transparent 90%)",
      }}
    />
  );
}
