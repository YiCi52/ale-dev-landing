import type { Metadata } from "next";

import { GkHero } from "@/components/lab/gatekeep/GkHero";
import { GkCarousels } from "@/components/lab/gatekeep/GkCarousels";
import { GkGrid } from "@/components/lab/gatekeep/GkGrid";
import { GkProduct } from "@/components/lab/gatekeep/GkProduct";
import { GkSigns } from "@/components/lab/gatekeep/GkSigns";

import "./gatekeep.css";

/**
 * Lab "Gatekeep" — réplica de estudio de 8 efectos de portafolio premium.
 *
 * Género replicado (ficción declarada, ejemplo vacío, CTAs no funcionales):
 * · @avi_vashishta29 "Cool Devs Don't Gatekeep Pt.08": carrusel curvo con hover,
 *   carrusel disperso con sonido, grid editorial al scroll, poste de señales 3D
 *   con CTAs, collage glitch.
 * · @seanaiux "Animations to make a 30k website": transición espacial (zoom a
 *   través de la nebulosa), object reveal on hover, partículas rompiendo la
 *   cuarta pared, producto 3D con scrub, animación portal.
 *
 * Stack: CSS 3D + GSAP/ScrollTrigger + canvas 2D + WebAudio. Sin WebGL en vivo,
 * sin assets externos (todo el arte es gradiente generado). Respeta
 * prefers-reduced-motion dejando el contenido estático y visible.
 */

export const metadata: Metadata = {
  title: "Lab · Gatekeep — réplica de efectos",
  robots: { index: false, follow: false },
};

export default function GatekeepLabPage() {
  return (
    <main className="gk">
      <GkHero />
      <GkCarousels />
      <GkGrid />
      <GkProduct />
      <GkSigns />
    </main>
  );
}
