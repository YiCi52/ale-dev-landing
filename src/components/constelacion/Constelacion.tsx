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

/* `dir` = hacia dónde sale el label desde el punto. Es lo que evita que dos
   nodos vecinos se pisen: cada uno escribe hacia AFUERA del núcleo. */
type Dir = "n" | "s" | "e" | "o";

type Capa = {
  n: string;
  name: string;
  x: number;
  y: number;
  dir: Dir;
  dot?: boolean;
  far?: boolean;
  copy: string;
  tag: string;
};

// Coordenadas en el espacio de diseño 1100×620. Núcleo en (550, 310).
const CAPAS: ReadonlyArray<Capa> = [
  // SUPERFICIE — arriba, labels hacia arriba
  { n: "01", name: "Front", x: 455, y: 105, dir: "n", dot: true, copy: "Lo que se ve: rápido, editorial y tuyo. Nada de pinta de plantilla.", tag: "Next.js · Lighthouse ≥95" },
  { n: "14", name: "Descubribilidad", x: 660, y: 92, dir: "n", far: true, copy: "Google te encuentra y tú mides qué funciona: schema, sitemap, métricas.", tag: "Schema · Sitemap · Analytics" },
  // BORDE — derecha, labels hacia la derecha
  { n: "02", name: "API", x: 800, y: 190, dir: "e", dot: true, copy: "Cada dato que entra se valida antes de tocarse. Nada pasa sin revisión.", tag: "Zod · Server Actions" },
  { n: "04", name: "Auth · RLS", x: 878, y: 268, dir: "e", far: true, copy: "Permisos a nivel de fila: la base de datos niega por defecto.", tag: "Políticas por fila" },
  { n: "08", name: "Seguridad", x: 892, y: 356, dir: "e", dot: true, copy: "Headers, CSP y formularios blindados contra bots y spam.", tag: "Headers · CSP · Honeypot" },
  { n: "09", name: "Rate limiting", x: 838, y: 442, dir: "e", far: true, copy: "Nadie puede inundarte el formulario: límite por IP en cada envío.", tag: "Límite por IP" },
  // DATOS — abajo, labels hacia abajo
  { n: "03", name: "Base de datos", x: 645, y: 500, dir: "s", dot: true, copy: "Cada fila tiene dueño. Nadie lee, edita ni borra lo que no es suyo.", tag: "Supabase · RLS insert-only" },
  { n: "13", name: "Backup", x: 772, y: 540, dir: "s", far: true, copy: "Copias automáticas: tu información puede volver de cualquier error.", tag: "Copias diarias" },
  { n: "10", name: "Caching · CDN", x: 492, y: 528, dir: "s", far: true, copy: "Lo estático se sirve desde el borde, cerca de quien visita.", tag: "CDN · Caché en el borde" },
  // OPERACIÓN — izquierda, labels hacia la izquierda
  { n: "06", name: "Cloud", x: 258, y: 172, dir: "o", far: true, copy: "Servicios gestionados: sin servidores que cuidar ni parchear.", tag: "Supabase gestionado" },
  { n: "05", name: "Hosting", x: 348, y: 252, dir: "o", dot: true, copy: "Infraestructura que no se cae un sábado por la noche.", tag: "Vercel · Edge" },
  { n: "11", name: "Scaling", x: 198, y: 322, dir: "o", far: true, copy: "Un pico de visitas no tumba nada: las conexiones se administran solas.", tag: "Connection pooler" },
  { n: "07", name: "CI · CD", x: 292, y: 396, dir: "o", dot: true, copy: "Cada cambio pasa pruebas antes de tocar producción.", tag: "GitHub Actions · Tests" },
  { n: "12", name: "Error tracking", x: 180, y: 462, dir: "o", copy: "Si algo falla a las 3am, me entero yo — antes de que lo note tu cliente.", tag: "Sentry · Alerta < 1 min" },
];

const ANCLAS = [
  { x: 550, y: 178 },
  { x: 706, y: 262 },
  { x: 604, y: 436 },
  { x: 404, y: 300 },
] as const;

// Las etiquetas de zona van a las ESQUINAS, donde no hay nodos que pisar.
const ZONAS = [
  { t: "Superficie", x: 550, y: 28 },
  { t: "Borde", x: 1010, y: 108 },
  { t: "Datos", x: 902, y: 598 },
  { t: "Operación", x: 96, y: 96 },
] as const;

// r = rama (para el stagger del draw-on) · o = opacidad · on = tramo lila
type Linea = { x1: number; y1: number; x2: number; y2: number; o: number; r: number; on?: boolean };

const LINEAS: ReadonlyArray<Linea> = [
  // núcleo → ancla de cada zona
  { x1: 550, y1: 288, x2: 550, y2: 190, o: 0.16, r: 0 },
  { x1: 572, y1: 300, x2: 694, y2: 266, o: 0.16, r: 1 },
  { x1: 558, y1: 332, x2: 600, y2: 424, o: 0.16, r: 2 },
  { x1: 528, y1: 314, x2: 416, y2: 302, o: 0.16, r: 3 },
  // SUPERFICIE
  { x1: 550, y1: 178, x2: 455, y2: 105, o: 0.22, r: 0 },
  { x1: 455, y1: 105, x2: 408, y2: 62, o: 0.12, r: 0 },
  { x1: 550, y1: 178, x2: 660, y2: 92, o: 0.22, r: 0 },
  { x1: 660, y1: 92, x2: 712, y2: 50, o: 0.12, r: 0 },
  // BORDE
  { x1: 706, y1: 262, x2: 800, y2: 190, o: 0.22, r: 1 },
  { x1: 800, y1: 190, x2: 878, y2: 268, o: 0.18, r: 1 },
  { x1: 878, y1: 268, x2: 892, y2: 356, o: 0.18, r: 1 },
  { x1: 892, y1: 356, x2: 838, y2: 442, o: 0.18, r: 1 },
  { x1: 706, y1: 262, x2: 892, y2: 356, o: 0.1, r: 1 },
  // DATOS
  { x1: 604, y1: 436, x2: 645, y2: 500, o: 0.22, r: 2 },
  { x1: 645, y1: 500, x2: 772, y2: 540, o: 0.18, r: 2 },
  { x1: 772, y1: 540, x2: 826, y2: 572, o: 0.12, r: 2 },
  { x1: 604, y1: 436, x2: 492, y2: 528, o: 0.22, r: 2 },
  { x1: 492, y1: 528, x2: 432, y2: 570, o: 0.12, r: 2 },
  // OPERACIÓN
  { x1: 404, y1: 300, x2: 348, y2: 252, o: 0.22, r: 3 },
  { x1: 348, y1: 252, x2: 258, y2: 172, o: 0.18, r: 3 },
  { x1: 258, y1: 172, x2: 202, y2: 128, o: 0.12, r: 3 },
  { x1: 404, y1: 300, x2: 292, y2: 396, o: 0.22, r: 3 },
  { x1: 292, y1: 396, x2: 198, y2: 322, o: 0.14, r: 3 },
  { x1: 292, y1: 396, x2: 180, y2: 462, o: 0.5, r: 3, on: true },
  { x1: 180, y1: 462, x2: 118, y2: 508, o: 0.12, r: 3 },
];

const PUNTAS = [
  { x: 408, y: 62 },
  { x: 712, y: 50 },
  { x: 202, y: 128 },
  { x: 826, y: 572 },
  { x: 432, y: 570 },
  { x: 118, y: 508 },
] as const;

// Satélites de acento lila (los "ticks" de la referencia, en nuestra paleta)
const SATELITES = [
  { x1: 800, y1: 190, x2: 816, y2: 168 },
  { x1: 645, y1: 500, x2: 663, y2: 484 },
  { x1: 348, y1: 252, x2: 332, y2: 232 },
  { x1: 455, y1: 105, x2: 438, y2: 86 },
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
              `cn-node--${c.dir}`,
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

        {/*
          La ficha se coloca en el lado OPUESTO al nodo activo: si señalas algo
          de Operación (izquierda), aparece a la derecha, y viceversa. Antes
          estaba clavada arriba a la derecha y quedaba lejos de lo que mirabas.
        */}
        <div
          className="cn-ficha"
          data-lado={capa.x > W / 2 ? "izq" : "der"}
          style={{ top: `clamp(2%, ${(capa.y / H) * 100 - 12}%, 62%)` }}
          role="status"
        >
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
