"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";

/*
  S2 + S3 — Los dos carruseles del reel de @avi_vashishta29:
  · Anillo curvo 3D con hover (segmentos rotados alrededor del eje Y; el hover
    pausa el giro y levanta la carta).
  · "Crazy carousel": nube de cartas dispersas en profundidad, arrastrable con
    inercia, con blips de sonido WebAudio al tocar cartas (opt-in, apagado por
    defecto — el audio arranca solo tras gesto del usuario).
  Arte: gradientes por carta (ejemplo vacío, sin assets).
*/

const RING_CARDS = [
  ["#2c4a44", "#79e0d2", "bruma"],
  ["#4a3a22", "#e8b64c", "duna"],
  ["#3d2530", "#d8544a", "brasa"],
  ["#22303f", "#7fb3e0", "niebla"],
  ["#2f3b2a", "#a9d47f", "musgo"],
  ["#40303f", "#cf9be0", "vino"],
  ["#413a2a", "#e0d27f", "trigo"],
  ["#24393b", "#7fe0c9", "marea"],
  ["#3b2b26", "#e09a7f", "arcilla"],
  ["#2b2b3b", "#9a9ae0", "noche"],
] as const;

const CLOUD_CARDS = [
  { x: -320, y: -140, z: -220, r: -9, hue: 168 },
  { x: 40, y: -190, z: -60, r: 6, hue: 42 },
  { x: 330, y: -120, z: -300, r: 12, hue: 6 },
  { x: -140, y: -40, z: 80, r: -4, hue: 200 },
  { x: 220, y: -10, z: 160, r: 8, hue: 84 },
  { x: -380, y: 60, z: -40, r: -14, hue: 280 },
  { x: 90, y: 90, z: -180, r: 3, hue: 24 },
  { x: 360, y: 120, z: 40, r: 10, hue: 152 },
  { x: -220, y: 170, z: 200, r: -7, hue: 60 },
  { x: -20, y: 220, z: -320, r: 5, hue: 210 },
  { x: 250, y: 230, z: -120, r: -11, hue: 330 },
  { x: -420, y: -220, z: -380, r: 15, hue: 96 },
  { x: 430, y: -240, z: -200, r: -6, hue: 186 },
  { x: 10, y: -60, z: 260, r: 2, hue: 258 },
] as const;

export function GkCarousels() {
  const ringRef = useRef<HTMLDivElement>(null);
  const cloudRef = useRef<HTMLDivElement>(null);
  const cloudInnerRef = useRef<HTMLDivElement>(null);
  const [soundOn, setSoundOn] = useState(false);
  const audioRef = useRef<AudioContext | null>(null);
  const soundOnRef = useRef(false);
  soundOnRef.current = soundOn;

  // Anillo: giro infinito, el hover lo pausa y saca la carta del cilindro.
  useEffect(() => {
    const ring = ringRef.current;
    if (!ring) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const spin = gsap.to(ring, {
      rotateY: "+=360",
      duration: 42,
      ease: "none",
      repeat: -1,
      paused: reduced,
    });

    const cards = Array.from(ring.children) as HTMLElement[];
    const enter = (card: HTMLElement, i: number) => () => {
      gsap.to(spin, { timeScale: 0, duration: 0.5 });
      gsap.to(card, {
        transform: `rotateY(${i * 36}deg) translateZ(500px) scale(1.07)`,
        duration: 0.45,
        ease: "power3.out",
      });
    };
    const leave = (card: HTMLElement, i: number) => () => {
      gsap.to(spin, { timeScale: 1, duration: 0.8 });
      gsap.to(card, {
        transform: `rotateY(${i * 36}deg) translateZ(420px) scale(1)`,
        duration: 0.5,
        ease: "power3.inOut",
      });
    };
    const offs = cards.map((card, i) => {
      const on = enter(card, i);
      const off = leave(card, i);
      card.addEventListener("pointerenter", on);
      card.addEventListener("pointerleave", off);
      return () => {
        card.removeEventListener("pointerenter", on);
        card.removeEventListener("pointerleave", off);
      };
    });

    return () => {
      offs.forEach((off) => off());
      spin.kill();
    };
  }, []);

  // Nube: arrastre horizontal con inercia (quickTo) + tilt por posición del cursor.
  useEffect(() => {
    const cloud = cloudRef.current;
    const inner = cloudInnerRef.current;
    if (!cloud || !inner) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    const rotTo = gsap.quickTo(inner, "rotationY", { duration: 1.1, ease: "power3.out" });
    const tiltTo = gsap.quickTo(inner, "rotationX", { duration: 1.1, ease: "power3.out" });
    let rot = 0;
    let dragging = false;
    let lastX = 0;

    const down = (e: PointerEvent) => {
      dragging = true;
      lastX = e.clientX;
    };
    const up = () => (dragging = false);
    const move = (e: PointerEvent) => {
      if (dragging) {
        rot += (e.clientX - lastX) * 0.25;
        lastX = e.clientX;
        rotTo(rot);
      }
      const rect = cloud.getBoundingClientRect();
      tiltTo(((e.clientY - rect.top) / rect.height - 0.5) * -10);
    };

    cloud.addEventListener("pointerdown", down);
    window.addEventListener("pointerup", up);
    cloud.addEventListener("pointermove", move);
    return () => {
      cloud.removeEventListener("pointerdown", down);
      window.removeEventListener("pointerup", up);
      cloud.removeEventListener("pointermove", move);
    };
  }, []);

  // Sonido: el AudioContext se crea/reanuda SOLO en el click del chip — un hover
  // no cuenta como gesto de usuario y el navegador lo dejaría suspendido (bug v1).
  const toggleSound = () => {
    setSoundOn((s) => {
      const next = !s;
      if (next) {
        const ctx = (audioRef.current ??= new AudioContext());
        if (ctx.state === "suspended") void ctx.resume();
        soundOnRef.current = true;
        window.setTimeout(() => blip(2), 80); // blip de confirmación inmediata
      }
      return next;
    });
  };

  // Blip corto por carta (pentatónica para que cualquier orden suene bien).
  const blip = (i: number) => {
    if (!soundOnRef.current) return;
    const ctx = audioRef.current;
    if (!ctx || ctx.state === "suspended") return;
    const scale = [0, 3, 5, 7, 10];
    const freq = 330 * Math.pow(2, scale[i % scale.length] / 12 + Math.floor(i / scale.length) / 2);
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.045, ctx.currentTime + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.28);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.3);
  };

  return (
    <>
      <section className="gk-ring-section" aria-label="Carrusel curvo (demo)">
        <span className="gk-giant" aria-hidden>
          PORTFOLIO
        </span>
        <div className="gk-section-head">
          <h2>Carrusel curvo</h2>
          <span className="gk-eyebrow">hover: pausa y acerca</span>
        </div>
        <div className="gk-ring-scene">
          <div className="gk-ring" ref={ringRef}>
            {RING_CARDS.map(([from, to, name], i) => (
              <figure
                key={name}
                className="gk-ring__card"
                style={{
                  background: `linear-gradient(160deg, ${from}, ${to})`,
                  transform: `rotateY(${i * 36}deg) translateZ(420px)`,
                }}
              >
                <span>
                  {String(i + 1).padStart(2, "0")} · {name}
                </span>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section className="gk-cloud-section" aria-label="Carrusel disperso (demo)">
        <div className="gk-section-head">
          <h2>Carrusel loco</h2>
          <button
            type="button"
            className="gk-sound-chip"
            data-on={soundOn}
            onClick={toggleSound}
          >
            sonido: {soundOn ? "on" : "off"}
          </button>
        </div>
        <div className="gk-cloud" ref={cloudRef}>
          <div className="gk-cloud__inner" ref={cloudInnerRef}>
            {CLOUD_CARDS.map((c, i) => (
              <figure
                key={i}
                className="gk-cloud__card"
                onPointerEnter={() => blip(i)}
                style={{
                  background: `linear-gradient(150deg, hsl(${c.hue} 38% 22%), hsl(${c.hue} 55% 48%))`,
                  transform: `translate3d(${c.x}px, ${c.y}px, ${c.z}px) rotate(${c.r}deg)`,
                }}
              >
                <span>clip {String(i + 1).padStart(2, "0")}</span>
              </figure>
            ))}
          </div>
        </div>
        <div className="gk-section-head">
          <span className="gk-eyebrow">arrastra horizontal · toca cartas con sonido on</span>
        </div>
      </section>
    </>
  );
}
