"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { useReducedMotion } from "@/hooks/use-reduced-motion";

type Slide = {
  id: string;
  index: string;
  client: string;
  title: string;
  tint: string;
  /** 0 = pegado al fondo, 1 = pegado al espectador. Define cuánto flota. */
  depth: number;
};

const SLIDES: readonly Slide[] = [
  {
    id: "kizuna",
    index: "01",
    client: "KizunaAI",
    title: "Hello, Fortnite",
    tint: "linear-gradient(150deg, #ff5fa2, #7c6cff 58%, #21123f)",
    depth: 0.9,
  },
  {
    id: "weargo",
    index: "02",
    client: "WEAR GO LAND",
    title: "Retail Playground",
    tint: "linear-gradient(150deg, #ffd166, #ff7d3b 55%, #3d1a08)",
    depth: 0.45,
  },
  {
    id: "radwimps",
    index: "03",
    client: "RADWIMPS",
    title: "Role Playing Music",
    tint: "linear-gradient(150deg, #4fd8ff, #2b5cff 55%, #061029)",
    depth: 1,
  },
  {
    id: "runformoney",
    index: "04",
    client: "run for money",
    title: "Created in Fortnite",
    tint: "linear-gradient(150deg, #9dffb0, #1fa97a 52%, #05261c)",
    depth: 0.3,
  },
  {
    id: "stella",
    index: "05",
    client: "stella",
    title: "Virtual Idol",
    tint: "linear-gradient(150deg, #ffc2e8, #b57bff 55%, #2a1140)",
    depth: 0.7,
  },
];

/** Cuánto se adelanta/retrasa cada tarjeta respecto del riel, en px. */
const PARALLAX_RANGE = 260;
/** Desplazamiento vertical del flotado, en px. */
const FLOAT_RANGE = 46;

export function AlcheHorizontal() {
  const isReducedMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track || isReducedMotion) return;

    gsap.registerPlugin(ScrollTrigger);

    const context = gsap.context(() => {
      const distance = () => track.scrollWidth - window.innerWidth;

      // El riel entero se desplaza a lo ancho mientras la sección queda pinneada.
      const tween = gsap.to(track, {
        x: () => -distance(),
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top top",
          // La distancia vertical iguala a la horizontal: el scroll se siente 1:1.
          end: () => `+=${distance()}`,
          pin: true,
          scrub: 1,
          invalidateOnRefresh: true,
          anticipatePin: 1,
        },
      });

      // Cada tarjeta se adelanta según su profundidad: las cercanas viajan más
      // que el riel y las lejanas se quedan atrás. Ahí nace la sensación de que
      // la imagen flota sobre un fondo distante.
      const cards = gsap.utils.toArray<HTMLElement>(".alche-slide");

      cards.forEach((card) => {
        const depth = Number(card.dataset.depth ?? 0.5);

        gsap.fromTo(
          card,
          { xPercent: 0, x: PARALLAX_RANGE * depth },
          {
            x: -PARALLAX_RANGE * depth,
            ease: "none",
            scrollTrigger: {
              containerAnimation: tween,
              trigger: card,
              start: "left right",
              end: "right left",
              scrub: true,
            },
          },
        );

        // Flotado vertical propio, desfasado por tarjeta: sin esto el riel se
        // lee como una tira rígida en vez de objetos suspendidos.
        gsap.to(card, {
          y: -FLOAT_RANGE * depth,
          duration: 3.2 + depth * 1.6,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
          delay: depth * 0.9,
        });
      });
    }, section);

    return () => context.revert();
  }, [isReducedMotion]);

  return (
    <section
      ref={sectionRef}
      className="alche-rail"
      aria-labelledby="alche-rail-title"
    >
      <div className="alche-rail__viewport">
        <div className="alche-rail__depth" aria-hidden>
          <span>SELECTED WORK — SELECTED WORK — SELECTED WORK —</span>
        </div>

        <h2 id="alche-rail-title" className="sr-only">
          Proyectos seleccionados
        </h2>

        <div ref={trackRef} className="alche-rail__track">
          {SLIDES.map((slide) => (
            <article
              key={slide.id}
              className="alche-slide"
              data-depth={slide.depth}
              style={{ "--slide-depth": slide.depth } as React.CSSProperties}
            >
              <div
                className="alche-slide__media"
                style={{ backgroundImage: slide.tint }}
              >
                <span className="alche-slide__index">{slide.index}</span>
              </div>
              <div className="alche-slide__meta">
                <h3>{slide.client}</h3>
                <p>{slide.title}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
