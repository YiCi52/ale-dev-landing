"use client";

import { useEffect, useRef, useState } from "react";

import type { MotorLuna } from "./luna/MotorLuna";
import { PlanoSvg } from "./luna/PlanoSvg";
import { ESTRATOS, RASGOS, estadoDe, tramo } from "./luna/tiempos";
import { observarProgreso, sinMovimiento } from "./scroll";

/*
  La luna y su plano (Alejo, 14-oct; reemplaza la versión del polvo). Ver luna/tiempos.ts para el guion.
  Capas, de abajo arriba: noche · papel de cuarzo (se abre desde el borde de la luna) · luna 3D · plano en tinta
  (curvas de nivel reales de la NASA, scripts/v4/plano_luna.py) · llamadas y corte (SVG) · fundido final.
*/
const MAPA = "/lab/v4/luna/luna-nasa-2k.jpg";

export function LunaPlano() {
  const seccion = useRef<HTMLElement>(null);
  const caja = useRef<HTMLDivElement>(null);
  const lienzo = useRef<HTMLCanvasElement>(null);
  const papel = useRef<HTMLDivElement>(null);
  const plano = useRef<HTMLImageElement>(null);
  const [tam, setTam] = useState({ w: 1440, h: 900 });

  useEffect(() => {
    const medir = () => setTam({ w: window.innerWidth, h: window.innerHeight });
    medir();
    window.addEventListener("resize", medir);
    return () => window.removeEventListener("resize", medir);
  }, []);

  useEffect(() => {
    const el = seccion.current, c = lienzo.current, k = caja.current;
    if (!el || !c || !k || sinMovimiento()) return;
    let motor: MotorLuna | null = null, vivo = true, visible = false, raf = 0, p = 0, antes = performance.now();

    const tick = (ahora: number) => {
      raf = 0;
      const dt = Math.min(0.05, (ahora - antes) / 1000);
      antes = ahora;
      const w = k.clientWidth, h = k.clientHeight, e = estadoDe(p, w / Math.max(1, h));
      const cx = e.x * w, cy = e.y * h, r = e.radio * h;
      if (papel.current) papel.current.style.clipPath = `circle(${(e.papel <= 0 ? 0 : r + Math.hypot(w, h) * e.papel ** 2).toFixed(1)}px at ${cx.toFixed(1)}px ${cy.toFixed(1)}px)`;
      if (plano.current) {
        Object.assign(plano.current.style, { left: `${cx - r}px`, top: `${cy - r}px`, width: `${2 * r}px`, height: `${2 * r}px`, opacity: String(e.plano) });
        // el plano se "dibuja" desde el centro hacia el borde mientras la foto se apaga
        plano.current.style.setProperty("--dibujo", `${(e.plano * 75).toFixed(1)}%`);
      }
      k.style.setProperty("--llamadas", e.llamadas.toFixed(4));
      k.style.setProperty("--corte", e.corte.toFixed(4));
      k.style.setProperty("--corte-etiquetas", tramo(e.corte, [0.45, 1]).toFixed(4));
      k.style.setProperty("--noche", e.noche.toFixed(4));
      k.style.setProperty("--titulo", e.papel.toFixed(4));
      k.style.setProperty("--pista", (1 - e.alinear).toFixed(4));
      motor?.dibujar({ x: e.x, y: e.y, radio: e.radio, solida: 1 - e.plano, alinear: e.alinear, aura: 1 - e.papel }, dt);
      if (vivo && visible) raf = requestAnimationFrame(tick);
    };
    const pedir = () => { if (!raf && visible) raf = requestAnimationFrame(tick); };
    const obs = new IntersectionObserver(([en]) => { visible = en.isIntersecting; pedir(); }, { rootMargin: "100px" });
    obs.observe(el);
    const dejar = observarProgreso(el, (v) => { p = v; pedir(); });
    const alCambiar = () => { motor?.medir(); pedir(); };
    window.addEventListener("resize", alCambiar);
    import("./luna/MotorLuna").then((m) => {
      if (!vivo) return;
      motor = new m.MotorLuna(c, MAPA);
      motor.medir();
      pedir();
    }).catch(() => undefined);
    return () => {
      vivo = false;
      if (raf) cancelAnimationFrame(raf);
      obs.disconnect();
      dejar();
      window.removeEventListener("resize", alCambiar);
      motor?.destruir();
    };
  }, []);

  const e0 = estadoDe(0.5, tam.w / tam.h);
  const angosto = tam.w < 720;
  return (
    <section ref={seccion} id="v4-luna" aria-labelledby="v4-luna-titulo" className="v4-luna relative h-[700vh]">
      <div ref={caja} className="v4-luna-caja sticky top-0 h-[100svh] overflow-hidden" style={{ background: "var(--piedra-950)" }}>
        <div ref={papel} className="v4-papel absolute inset-0" aria-hidden />
        <canvas ref={lienzo} className="absolute inset-0 h-full w-full" style={{ touchAction: "pan-y" }} role="img" aria-label="La luna en 3D: arrástrala para girarla" />
        {/* eslint-disable-next-line @next/next/no-img-element -- dibujo en tinta que se multiplica sobre el papel */}
        <img ref={plano} src="/lab/v4/luna/plano-luna.webp" alt="" aria-hidden width={1800} height={1800} loading="lazy" className="v4-plano-img absolute opacity-0" />
        <PlanoSvg w={tam.w} h={tam.h} cx={e0.x * tam.w} cy={e0.y * tam.h} r={e0.radio * tam.h} angosto={angosto} />
        <p className="v4-mono v4-luna-pista absolute inset-x-0 bottom-10 text-center">Arrastra la luna para girarla</p>
        <div className="v4-luna-titulo absolute left-4 top-16 max-w-[30ch] sm:left-12 sm:top-24">
          <p className="v4-mono" style={{ color: "#6d6a63" }}>Plano de la superficie · cara visible</p>
          <h2 id="v4-luna-titulo" className="v4-display mt-3 text-[clamp(26px,3.6vw,56px)] leading-[1.02] sm:mt-4" style={{ color: "var(--piedra-950)" }}>
            Lo que hay debajo de la superficie
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed" style={{ color: "#3d3b37" }}>
            Un sitio se dibuja como una obra: primero el plano, después cada capa.
          </p>
        </div>
        {/* el texto real para lectores de pantalla y para movimiento reducido */}
        <div className="v4-luna-texto">
          <ul>{RASGOS.map((r) => <li key={r.nombre}>{r.nombre}</li>)}</ul>
          <ol>{ESTRATOS.map((e) => <li key={e.nombre}>{e.nombre}: {e.capas.join(", ")}</li>)}</ol>
        </div>
        <div className="v4-luna-noche pointer-events-none absolute inset-0" aria-hidden />
      </div>
    </section>
  );
}
