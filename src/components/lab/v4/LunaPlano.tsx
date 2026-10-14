"use client";

import { useEffect, useRef, useState } from "react";

import { cubrir, type Datos } from "./agua/escena";
import { pintarEstrellas } from "./cielo/estrellas";
import type { MotorLuna } from "./luna/MotorLuna";
import { PlanoSvg } from "./luna/PlanoSvg";
import { ESTRATOS, RASGOS, TRAMOS, estadoDe, tramo } from "./luna/tiempos";
import { observarProgreso, sinMovimiento } from "./scroll";

/*
  La luna y su plano (Alejo, 14-oct; reemplaza la versión del polvo). Ver luna/tiempos.ts para el guion.
  Capas, de abajo arriba: noche · papel de cuarzo (se abre desde el borde de la luna) · luna 3D · plano en tinta
  (curvas de nivel reales de la NASA, scripts/v4/plano_luna.py) · llamadas y corte (SVG). Al final la luna vuelve
  a ser 3D, el cielo se vuelve azul de noche con estrellas (las mismas de la galería) y la luna sube al lugar exacto
  de la luna de la galería; entonces toda la sección se vuelve transparente y deja ver la galería, que la espera
  quieta debajo (RioLuna se monta 200svh por debajo de esta sección: ver su margen negativo).
*/
const MAPA = "/lab/v4/luna/luna-nasa-2k.jpg";

export function LunaPlano() {
  const seccion = useRef<HTMLElement>(null);
  const caja = useRef<HTMLDivElement>(null);
  const lienzo = useRef<HTMLCanvasElement>(null);
  const papel = useRef<HTMLDivElement>(null);
  const plano = useRef<HTMLImageElement>(null);
  const estrellas = useRef<HTMLCanvasElement>(null);
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
    let datos: Datos | null = null, cieloPintado = -1;
    fetch("/lab/v4/rio/datos.json").then((r) => r.json() as Promise<Datos>).then((d) => { datos = d; cieloPintado = -1; }).catch(() => undefined);
    /** La luna y el horizonte del primer cuadro de la galería, en pantalla (para terminar exactamente ahí). */
    const galeria = (w: number, h: number) => {
      const d = datos?.["1"], t = cubrir(w, h, 1920, 1080);
      if (!d?.luna || !d.luna_radio) return { destino: undefined, horizonte: 0.56 };
      return { destino: [...t.aPantalla(d.luna[0], d.luna[1]), t.alto(d.luna_radio)] as [number, number, number], horizonte: t.aPantalla(0, d.horizonte)[1] };
    };
    const pintarCielo = (alfa: number, w: number, h: number, horizonte: number) => {
      const c2 = estrellas.current, ctx = c2?.getContext("2d");
      if (!c2 || !ctx || Math.abs(alfa - cieloPintado) < 0.004) return;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      if (c2.width !== Math.round(w * dpr)) { c2.width = Math.round(w * dpr); c2.height = Math.round(h * dpr); }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      pintarEstrellas(ctx, (x, y) => [w / 2 + x * h, (horizonte - y) * h], h / 900, alfa);
      cieloPintado = alfa;
    };

    const tick = (ahora: number) => {
      raf = 0;
      const dt = Math.min(0.05, (ahora - antes) / 1000);
      antes = ahora;
      const w = k.clientWidth, h = k.clientHeight, g = galeria(w, h), e = estadoDe(p, w / Math.max(1, h), g.destino);
      const cx = e.x * w, cy = e.y * h, r = e.radio * h;
      if (papel.current) {
        // de ida el papel se abre desde el borde de la luna; de vuelta se desvanece entero (si se cerrara, dejaba un aro)
        const deVuelta = p >= TRAMOS.vuelve[0];
        papel.current.style.clipPath = deVuelta ? "none" : `circle(${(e.papel <= 0 ? 0 : r + Math.hypot(w, h) * e.papel ** 2).toFixed(1)}px at ${cx.toFixed(1)}px ${cy.toFixed(1)}px)`;
        papel.current.style.opacity = deVuelta ? String(e.papel) : "1";
      }
      if (plano.current) {
        Object.assign(plano.current.style, { left: `${cx - r}px`, top: `${cy - r}px`, width: `${2 * r}px`, height: `${2 * r}px`, opacity: String(e.plano) });
        // el plano se "dibuja" desde el centro hacia el borde mientras la foto se apaga
        plano.current.style.setProperty("--dibujo", `${(e.plano * 75).toFixed(1)}%`);
      }
      k.style.setProperty("--llamadas", e.llamadas.toFixed(4));
      k.style.setProperty("--corte", e.corte.toFixed(4));
      k.style.setProperty("--corte-etiquetas", tramo(e.corte, [0.45, 1]).toFixed(4));
      k.style.setProperty("--cielo", e.cielo.toFixed(4));
      k.style.opacity = String(1 - e.revelar);
      // las estrellas aparecen poco a poco, las primeras (las más brillantes) antes que las tenues
      pintarCielo(Math.min(1, e.cielo * 1.15), w, h, g.horizonte);
      k.style.setProperty("--titulo", e.papel.toFixed(4));
      k.style.setProperty("--pista", (1 - e.alinear).toFixed(4));
      // ya de frente, la luna no vuelve a girar (Alejo: "sin el movimiento 360")
      motor?.dibujar({ x: e.x, y: e.y, radio: e.radio, solida: 1 - e.plano, alinear: p > 0.3 ? 1 : e.alinear, aura: 1 - e.papel }, dt);
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
    <section ref={seccion} id="v4-luna" aria-labelledby="v4-luna-titulo" className="v4-luna relative z-10 h-[700vh]">
      <div ref={caja} className="v4-luna-caja sticky top-0 h-[100svh] overflow-hidden" style={{ background: "var(--piedra-950)" }}>
        <div className="v4-luna-cielo absolute inset-0" aria-hidden />
        <canvas ref={estrellas} className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden />
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
      </div>
    </section>
  );
}
