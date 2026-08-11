"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { Eyebrow, Heading, Section, Text } from "@/components/ui";
import DecryptedText from "@/components/DecryptedText";

import "./constelacion.css";

/*
  Sección "La Constelación" — brief 2a (mapa radial estilo @alassafi.ai con
  profundidad): núcleo de partículas = el sitio del cliente, 4 zonas radiando
  con las 14 capas como nodos. La estructura (líneas + nodos) es rígida; la
  profundidad viene del entorno: bokeh en primer plano y estrellas de campo en
  el fondo se mueven a velocidades distintas con el mouse.
  Brief: design-system/castillo-v2/brief-constelacion-14-capas.md
*/

type Capa = {
  n: string;
  name: string;
  x: number;
  y: number;
  dot?: boolean;
  far?: boolean;
  copy: string;
  tag: string;
};

// Coordenadas en el espacio de diseño 1100×620 (mismo del mockup aprobado).
const CAPAS: ReadonlyArray<Capa> = [
  { n: "01", name: "Front", x: 472, y: 100, dot: true, copy: "Lo que se ve: rápido, editorial y tuyo. Nada de pinta de plantilla.", tag: "Next.js · Lighthouse ≥95" },
  { n: "14", name: "Descubribilidad", x: 628, y: 92, far: true, copy: "Google te encuentra y tú mides qué funciona: schema, sitemap, métricas.", tag: "Schema · Sitemap · Analytics" },
  { n: "02", name: "API", x: 778, y: 224, dot: true, copy: "Cada dato que entra se valida antes de tocarse. Nada pasa sin revisión.", tag: "Zod · Server Actions" },
  { n: "04", name: "Auth · RLS", x: 862, y: 180, far: true, copy: "Permisos a nivel de fila: la base de datos niega por defecto.", tag: "Políticas por fila" },
  { n: "08", name: "Seguridad", x: 812, y: 296, dot: true, copy: "Headers, CSP y formularios blindados contra bots y spam.", tag: "Headers · CSP · Honeypot" },
  { n: "09", name: "Rate limiting", x: 900, y: 332, far: true, copy: "Nadie puede inundarte el formulario: límite por IP en cada envío.", tag: "Límite por IP" },
  { n: "03", name: "Base de datos", x: 655, y: 502, dot: true, copy: "Cada fila tiene dueño. Nadie lee, edita ni borra lo que no es suyo.", tag: "Supabase · RLS insert-only" },
  { n: "10", name: "Caching · CDN", x: 498, y: 512, far: true, copy: "Lo estático se sirve desde el borde, cerca de quien visita.", tag: "CDN · Caché en el borde" },
  { n: "13", name: "Backup", x: 712, y: 556, far: true, copy: "Copias automáticas: tu información puede volver de cualquier error.", tag: "Copias diarias" },
  { n: "05", name: "Hosting", x: 312, y: 290, dot: true, copy: "Infraestructura que no se cae un sábado por la noche.", tag: "Vercel · Edge" },
  { n: "06", name: "Cloud", x: 222, y: 252, far: true, copy: "Servicios gestionados: sin servidores que cuidar ni parchear.", tag: "Supabase gestionado" },
  { n: "07", name: "CI · CD", x: 306, y: 392, dot: true, copy: "Cada cambio pasa pruebas antes de tocar producción.", tag: "GitHub Actions · Tests" },
  { n: "11", name: "Scaling", x: 212, y: 428, far: true, copy: "Un pico de visitas no tumba nada: las conexiones se administran solas.", tag: "Connection pooler" },
  { n: "12", name: "Error tracking", x: 128, y: 380, copy: "Si algo falla a las 3am, me entero yo — antes de que lo note tu cliente.", tag: "Sentry · Alerta < 1 min" },
];

const ANCLAS = [
  { x: 550, y: 150 },
  { x: 688, y: 270 },
  { x: 583, y: 448 },
  { x: 400, y: 332 },
] as const;

const ZONAS = [
  { t: "Superficie", x: 550, y: 30 },
  { t: "Borde", x: 995, y: 248 },
  { t: "Datos", x: 862, y: 588 },
  { t: "Operación", x: 108, y: 168 },
] as const;

// r = rama (para el stagger del draw-on) · o = opacidad · on = tramo lila
type Linea = { x1: number; y1: number; x2: number; y2: number; o: number; r: number; on?: boolean };

const LINEAS: ReadonlyArray<Linea> = [
  { x1: 550, y1: 290, x2: 550, y2: 162, o: 0.16, r: 0 },
  { x1: 568, y1: 302, x2: 680, y2: 272, o: 0.16, r: 1 },
  { x1: 556, y1: 330, x2: 583, y2: 440, o: 0.16, r: 2 },
  { x1: 532, y1: 314, x2: 408, y2: 330, o: 0.16, r: 3 },
  { x1: 550, y1: 150, x2: 472, y2: 100, o: 0.22, r: 0 },
  { x1: 472, y1: 100, x2: 430, y2: 58, o: 0.14, r: 0 },
  { x1: 550, y1: 150, x2: 628, y2: 92, o: 0.22, r: 0 },
  { x1: 628, y1: 92, x2: 672, y2: 52, o: 0.14, r: 0 },
  { x1: 688, y1: 270, x2: 778, y2: 224, o: 0.22, r: 1 },
  { x1: 778, y1: 224, x2: 862, y2: 180, o: 0.18, r: 1 },
  { x1: 862, y1: 180, x2: 925, y2: 148, o: 0.12, r: 1 },
  { x1: 688, y1: 270, x2: 812, y2: 296, o: 0.22, r: 1 },
  { x1: 812, y1: 296, x2: 900, y2: 332, o: 0.18, r: 1 },
  { x1: 900, y1: 332, x2: 955, y2: 362, o: 0.12, r: 1 },
  { x1: 583, y1: 448, x2: 655, y2: 502, o: 0.22, r: 2 },
  { x1: 655, y1: 502, x2: 712, y2: 556, o: 0.18, r: 2 },
  { x1: 712, y1: 556, x2: 762, y2: 588, o: 0.12, r: 2 },
  { x1: 583, y1: 448, x2: 498, y2: 512, o: 0.22, r: 2 },
  { x1: 498, y1: 512, x2: 428, y2: 556, o: 0.14, r: 2 },
  { x1: 400, y1: 332, x2: 312, y2: 290, o: 0.22, r: 3 },
  { x1: 312, y1: 290, x2: 222, y2: 252, o: 0.18, r: 3 },
  { x1: 222, y1: 252, x2: 165, y2: 215, o: 0.12, r: 3 },
  { x1: 400, y1: 332, x2: 306, y2: 392, o: 0.22, r: 3 },
  { x1: 306, y1: 392, x2: 212, y2: 428, o: 0.18, r: 3 },
  { x1: 212, y1: 428, x2: 128, y2: 380, o: 0.5, r: 3, on: true },
  { x1: 128, y1: 380, x2: 72, y2: 350, o: 0.12, r: 3 },
];

const PUNTAS = [
  { x: 430, y: 58 },
  { x: 672, y: 52 },
  { x: 925, y: 148 },
  { x: 955, y: 362 },
  { x: 762, y: 588 },
  { x: 428, y: 556 },
  { x: 165, y: 215 },
  { x: 72, y: 350 },
] as const;

// Satélites de acento lila (los "ticks" del video, en nuestra paleta)
const SATELITES = [
  { x1: 778, y1: 224, x2: 793, y2: 203 },
  { x1: 655, y1: 502, x2: 673, y2: 487 },
  { x1: 312, y1: 290, x2: 298, y2: 270 },
  { x1: 472, y1: 100, x2: 456, y2: 82 },
] as const;

const CAMPO = [
  { l: 8, t: 14 },
  { l: 16, t: 70 },
  { l: 30, t: 22 },
  { l: 46, t: 86 },
  { l: 64, t: 12 },
  { l: 78, t: 74 },
  { l: 90, t: 30 },
  { l: 86, t: 88 },
] as const;

const CUMULO = [
  { l: 48, t: 46, s: 3, o: 1 },
  { l: 55, t: 52, s: 2, o: 0.7 },
  { l: 42, t: 55, s: 2, o: 0.6 },
  { l: 51, t: 38, s: 2, o: 0.8 },
  { l: 60, t: 44, s: 3, o: 0.55, lila: true },
  { l: 38, t: 42, s: 2, o: 0.5 },
  { l: 45, t: 62, s: 2, o: 0.65 },
  { l: 57, t: 60, s: 2, o: 0.5, lila: true },
  { l: 33, t: 50, s: 2, o: 0.4 },
  { l: 65, t: 52, s: 2, o: 0.45 },
  { l: 50, t: 30, s: 2, o: 0.5 },
  { l: 62, t: 34, s: 2, o: 0.35 },
  { l: 36, t: 32, s: 2, o: 0.4 },
  { l: 44, t: 72, s: 2, o: 0.35 },
  { l: 58, t: 74, s: 2, o: 0.3 },
  { l: 28, t: 60, s: 2, o: 0.3 },
  { l: 70, t: 42, s: 2, o: 0.3, lila: true },
  { l: 25, t: 40, s: 1, o: 0.4 },
  { l: 74, t: 58, s: 1, o: 0.35 },
  { l: 52, t: 20, s: 1, o: 0.3 },
] as const;

const W = 1100;
const H = 620;
const px = (x: number) => `${(x / W) * 100}%`;
const py = (y: number) => `${(y / H) * 100}%`;

export function Constelacion() {
  const stageRef = useRef<HTMLDivElement>(null);
  const farRef = useRef<HTMLDivElement>(null);
  const nearRef = useRef<HTMLDivElement>(null);
  const [activa, setActiva] = useState("12");

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return; // todo visible y quieto

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      // Draw-on: cada rama se dibuja al entrar en viewport, una sola vez.
      const lineas = stage.querySelectorAll<SVGLineElement>(".cn-draw");
      const resto = stage.querySelectorAll<HTMLElement>(".cn-node, .cn-zona, .cn-corelabel");
      lineas.forEach((l) => {
        const len = Math.hypot(
          Number(l.getAttribute("x2")) - Number(l.getAttribute("x1")),
          Number(l.getAttribute("y2")) - Number(l.getAttribute("y1"))
        );
        gsap.set(l, { strokeDasharray: len, strokeDashoffset: len });
      });
      gsap.set(resto, { autoAlpha: 0, y: 6 });

      ScrollTrigger.create({
        trigger: stage,
        start: "top 78%",
        once: true,
        onEnter: () => {
          lineas.forEach((l) => {
            const rama = Number(l.dataset.rama ?? 0);
            gsap.to(l, {
              strokeDashoffset: 0,
              duration: 0.9,
              ease: "power3.out",
              delay: rama * 0.12,
            });
          });
          gsap.to(resto, {
            autoAlpha: 1,
            y: 0,
            duration: 0.6,
            ease: "power3.out",
            stagger: 0.035,
            delay: 0.25,
          });
        },
      });
    }, stage);

    // Parallax de entorno: la estructura queda rígida; bokeh (cerca) y
    // estrellas de campo (lejos) se mueven a velocidades distintas.
    let offPointer: (() => void) | undefined;
    if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
      const farX = gsap.quickTo(farRef.current, "x", { duration: 0.9, ease: "power3.out" });
      const farY = gsap.quickTo(farRef.current, "y", { duration: 0.9, ease: "power3.out" });
      const nearX = gsap.quickTo(nearRef.current, "x", { duration: 0.7, ease: "power3.out" });
      const nearY = gsap.quickTo(nearRef.current, "y", { duration: 0.7, ease: "power3.out" });
      const move = (e: PointerEvent) => {
        const r = stage.getBoundingClientRect();
        const rx = (e.clientX - r.left) / r.width - 0.5;
        const ry = (e.clientY - r.top) / r.height - 0.5;
        farX(rx * -8);
        farY(ry * -6);
        nearX(rx * 22);
        nearY(ry * 16);
      };
      stage.addEventListener("pointermove", move);
      offPointer = () => stage.removeEventListener("pointermove", move);
    }

    return () => {
      offPointer?.();
      ctx.revert();
    };
  }, []);

  const capa = CAPAS.find((c) => c.n === activa) ?? CAPAS[13];

  return (
    <Section
      id="constelacion"
      containerSize="wide"
      className="border-t border-[color:var(--color-border)]"
    >
      <div className="max-w-xl">
        <Eyebrow pill>
          <DecryptedText text="La constelación" animateOn="view" sequential speed={45} />
        </Eyebrow>
        <Heading level="h2" className="mt-6">
          Un sitio no es una página.
          <br />
          <span className="text-[color:var(--color-accent)]">Son 14 capas.</span>
        </Heading>
        {/*
          Este párrafo NO describe el gráfico — el gráfico ya rotula el núcleo y las
          cuatro zonas. Dice lo único que el gráfico no puede decir: qué se lleva el
          cliente. Regla: si el texto bajo un título repite lo que ya se ve, sobra.
        */}
        <Text tone="muted" className="mt-4">
          La mayoría de sitios se entrega con la primera. Las otras trece son las que
          deciden si te llegan clientes, si te encuentran y si el trabajo sigue en pie
          dentro de dos años.
        </Text>
      </div>

      <div className="cn-stage" ref={stageRef} aria-label="Mapa de las 14 capas de una entrega">
        <div className="cn-plane" ref={farRef} aria-hidden>
          {CAMPO.map((f, i) => (
            <span
              key={i}
              className="cn-fieldstar"
              style={{ left: `${f.l}%`, top: `${f.t}%` }}
            />
          ))}
        </div>

        <svg className="cn-lines" viewBox={`0 0 ${W} ${H}`} fill="none" aria-hidden>
          {LINEAS.map((l, i) => (
            <line
              key={i}
              className="cn-draw"
              data-rama={l.r}
              x1={l.x1}
              y1={l.y1}
              x2={l.x2}
              y2={l.y2}
              stroke={l.on ? `oklch(71.5% 0.14 294 / ${l.o})` : `oklch(95% 0.007 85 / ${l.o})`}
              strokeWidth={l.on ? 1.2 : 1}
            />
          ))}
          {PUNTAS.map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r="2" fill="oklch(95% 0.007 85 / 0.5)" />
          ))}
          {SATELITES.map((s, i) => (
            <g key={i}>
              <line
                className="cn-draw"
                data-rama="4"
                x1={s.x1}
                y1={s.y1}
                x2={s.x2}
                y2={s.y2}
                stroke="oklch(71.5% 0.14 294 / 0.55)"
                strokeWidth="1"
              />
              <circle cx={s.x2} cy={s.y2 - 4} r="1.8" fill="oklch(71.5% 0.14 294 / 0.85)" />
            </g>
          ))}
        </svg>

        <div
          className="cn-coreglow"
          style={{ left: px(550), top: py(310), width: "27%", aspectRatio: "1" }}
          aria-hidden
        />
        <div
          className="cn-cluster"
          style={{ left: px(550), top: py(310), width: "18%", height: "24%" }}
          aria-hidden
        >
          {CUMULO.map((d, i) => (
            <span
              key={i}
              data-lila={"lila" in d && d.lila ? "" : undefined}
              style={{
                left: `${d.l}%`,
                top: `${d.t}%`,
                width: d.s,
                height: d.s,
                opacity: d.o,
              }}
            />
          ))}
        </div>
        <span className="cn-corelabel" style={{ left: px(550), top: py(398) }} aria-hidden>
          Tu sitio
        </span>

        {ANCLAS.map((a, i) => (
          <span
            key={i}
            className="cn-node cn-node--ancla"
            style={{ left: px(a.x), top: py(a.y) }}
            aria-hidden
          >
            <i>
              <b />
            </i>
          </span>
        ))}

        {CAPAS.map((c) => (
          <button
            key={c.n}
            type="button"
            className={[
              "cn-node",
              c.dot ? "cn-node--dot" : "",
              c.far ? "cn-node--far" : "",
            ].join(" ")}
            style={{ left: px(c.x), top: py(c.y) }}
            data-active={activa === c.n}
            aria-label={`Capa ${c.n} — ${c.name}`}
            onMouseEnter={() => setActiva(c.n)}
            onFocus={() => setActiva(c.n)}
            onClick={() => setActiva(c.n)}
          >
            <i>
              <b />
            </i>
            <span>
              / {c.n} {c.name}
            </span>
          </button>
        ))}

        {ZONAS.map((z) => (
          <span key={z.t} className="cn-zona" style={{ left: px(z.x), top: py(z.y) }}>
            {z.t}
            <u />
          </span>
        ))}

        <div className="cn-plane" ref={nearRef} aria-hidden>
          <div
            className="cn-bokeh"
            style={{
              left: "3%",
              top: "5%",
              width: "12%",
              aspectRatio: "1",
              background: "oklch(71.5% 0.14 294 / 0.09)",
              filter: "blur(16px)",
            }}
          />
          <div
            className="cn-bokeh"
            style={{
              left: "87%",
              top: "76%",
              width: "15%",
              aspectRatio: "1",
              background: "oklch(95% 0.007 85 / 0.06)",
              filter: "blur(20px)",
            }}
          />
          <div
            className="cn-bokeh"
            style={{
              left: "82%",
              top: "3%",
              width: "8%",
              aspectRatio: "1",
              background: "oklch(71.5% 0.14 294 / 0.07)",
              filter: "blur(12px)",
            }}
          />
        </div>

        <div className="cn-ficha" role="status">
          <div className="cn-ficha-inner" key={capa.n}>
            <h4>
              / {capa.n} — {capa.name}
            </h4>
            <p>{capa.copy}</p>
            <footer>{capa.tag}</footer>
          </div>
        </div>
      </div>
    </Section>
  );
}
