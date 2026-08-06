"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/*
  S5 + S6 — Dos efectos de @seanaiux:
  · "3D product animation": teclado macro construido SOLO con CSS 3D; el scrub
    lo inclina a isométrico, lo explota en capas y lo re-arma.
  · "Portal animation": una tarjeta vuela A TRAVÉS de un marco; el marco crece
    hasta tragarse el viewport y entrega la siguiente sección.
*/

const KEYS = Array.from({ length: 12 }, (_, i) => i);

export function GkProduct() {
  const productRef = useRef<HTMLElement>(null);
  const portalRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const product = productRef.current;
    const portal = portalRef.current;
    if (!product || !portal) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      const kbd = product.querySelector(".gk-kbd");
      const keys = product.querySelectorAll(".gk-key");
      const knob = product.querySelector(".gk-knob");
      const base = product.querySelector(".gk-kbd__base");
      const plate = product.querySelector(".gk-kbd__plate");
      const steps = product.querySelectorAll<HTMLElement>(".gk-product__step");

      gsap.set(kbd, { rotateX: 62, rotateY: 0, rotateZ: 0, scale: 0.92 });

      let lastStep = -1;
      const showStep = (i: number) => {
        if (i === lastStep) return;
        lastStep = i;
        steps.forEach((s, si) =>
          gsap.to(s, {
            opacity: si === i ? 1 : 0,
            y: si === i ? 0 : 8,
            duration: 0.25,
            overwrite: "auto",
          })
        );
      };

      // Desarme tipo dron: cada pieza toma su propio vector (z + deriva x/y +
      // giro), la cámara ORBITA durante la explosión y todo vuelve a su sitio.
      // El paso activo se deriva del PROGRESO del scrub (no de .call(), que al
      // escrubear en reversa dispara el label equivocado o no re-dispara).
      gsap
        .timeline({
          scrollTrigger: {
            trigger: product,
            start: "top top",
            end: "bottom bottom",
            scrub: 0.7,
            onUpdate: (self) => {
              const p = self.progress;
              showStep(p < 0.33 ? 0 : p < 0.72 ? 1 : 2);
            },
          },
        })
        // 01 — de cenital a isométrico
        .to(kbd, { rotateX: 24, rotateY: -26, rotateZ: 6, scale: 1, ease: "power2.inOut", duration: 2 })
        // 02 — explosión con órbita de cámara
        .to(kbd, { rotateY: 26, rotateX: 32, rotateZ: -4, scale: 1.08, ease: "power2.inOut", duration: 2.2 }, "explode")
        .to(base, { z: -140, rotateX: 9, ease: "power2.inOut", duration: 1.8 }, "explode")
        .to(plate, { z: -52, rotateX: 4, ease: "power2.inOut", duration: 1.8 }, "explode")
        .to(
          keys,
          {
            z: (i: number) => 92 + (i % 4) * 30,
            x: (i: number) => ((i % 3) - 1) * 30,
            y: (i: number) => (i % 2 === 0 ? 12 : -16),
            rotateX: -16,
            rotateZ: (i: number) => ((i % 3) - 1) * 8,
            stagger: { each: 0.05, from: "center" },
            ease: "power2.inOut",
            duration: 1.8,
          },
          "explode"
        )
        .to(knob, { z: 215, rotateZ: 230, ease: "power2.inOut", duration: 1.8 }, "explode")
        // pausa flotando: deriva sutil de las piezas separadas
        .to(keys, { y: "+=6", ease: "sine.inOut", duration: 0.5 }, "explode+=1.9")
        // 03 — re-armado + presentación
        .to([base, plate, knob], { z: 0, x: 0, y: 0, rotateX: 0, rotateZ: 0, ease: "power3.inOut", duration: 1.7 }, "join")
        .to(keys, { z: 0, x: 0, y: 0, rotateX: 0, rotateZ: 0, ease: "power3.inOut", duration: 1.7 }, "join")
        .to(kbd, { rotateX: 14, rotateY: 14, rotateZ: 0, scale: 1.06, ease: "power2.inOut", duration: 1.7 }, "join");

      showStep(0); // el primer label visible antes del primer tick de scroll

      // Portal
      const frame = portal.querySelector(".gk-portal__frame");
      const card = portal.querySelector(".gk-portal__card");
      const halves = portal.querySelectorAll(".gk-portal__title span");

      gsap.set(card, { z: -650, scale: 0.35, opacity: 0.4, rotateX: 22, rotateY: -10 });

      gsap
        .timeline({
          scrollTrigger: {
            trigger: portal,
            start: "top top",
            end: "bottom bottom",
            scrub: 0.7,
          },
        })
        .to(halves[0], { xPercent: -16, ease: "none" }, 0)
        .to(halves[1], { xPercent: 16, ease: "none" }, 0)
        .to(card, { z: 240, scale: 1.6, opacity: 1, rotateX: 0, rotateY: 6, ease: "power2.in", duration: 3 }, 0)
        .to(frame, { scale: 4.4, opacity: 0, ease: "power2.in", duration: 2 }, 1.4)
        .to(card, { z: 620, scale: 4, opacity: 0, ease: "power2.in", duration: 1.6 }, 2.4);
    });

    return () => ctx.revert();
  }, []);

  return (
    <>
      <section className="gk-product" ref={productRef} aria-label="Producto 3D con scrub (demo)">
        <div className="gk-product__sticky">
          <div className="gk-product__label">
            <span className="gk-eyebrow">producto ficticio · css 3d puro</span>
            <h2>Macropad L·9</h2>
          </div>
          <div className="gk-kbd">
            <div className="gk-kbd__base" aria-hidden />
            <div className="gk-kbd__plate" aria-hidden />
            <div className="gk-kbd__deck">
              {KEYS.map((k) => (
                <div
                  key={k}
                  className={
                    k === 3 ? "gk-key gk-key--accent" : k === 8 ? "gk-key gk-key--cyan" : "gk-key"
                  }
                />
              ))}
              <div className="gk-knob" />
            </div>
          </div>
          <span className="gk-product__step">01 — chasis</span>
          <span className="gk-product__step">02 — switches por capas</span>
          <span className="gk-product__step">03 — ensamblado</span>
        </div>
      </section>

      <section className="gk-portal" ref={portalRef} aria-label="Animación portal (demo)">
        <div className="gk-portal__sticky">
          <div className="gk-portal__title" aria-hidden>
            <span>
              Todo <em>listo</em>
            </span>
            <span>
              antes de <em>aterrizar</em>
            </span>
          </div>
          <div className="gk-portal__frame" />
          <div className="gk-portal__card">
            <i aria-hidden />
            <span>pase de abordar · demo</span>
          </div>
        </div>
      </section>
    </>
  );
}
