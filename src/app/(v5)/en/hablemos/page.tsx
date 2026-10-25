import type { Metadata } from "next";
import Link from "next/link";

import { WHATSAPP_DISPLAY, WHATSAPP_URL } from "@/lib/site";
import { metaDe } from "@/components/lab/v5/meta";

/*
  "Let's talk" in English. The inquiry form is Spanish-only for now (it feeds the same Supabase table and alerts), so
  this page leads with WhatsApp and says plainly that the form is in Spanish.
*/
export const metadata: Metadata = metaDe("/hablemos", "en", "Let’s talk", "Tell me about your studio and the work you want to show. I reply the same business day.");

export default function LetsTalk() {
  return (
    <div lang="en" className="v5-gutter min-h-[100svh] pb-24 pt-32">
      <div className="mx-auto grid max-w-[900px] gap-8">
        <p className="v5-mono" style={{ color: "var(--calido)" }}>Let’s talk</p>
        <h1 className="v5-display text-[clamp(44px,6vw,92px)]">Let’s start with fifteen minutes.</h1>
        <p className="v5-texto text-lg">Tell me about your studio and the work you want to show. If it is a fit, you get a written proposal in two or three days.</p>
        <div className="flex flex-wrap gap-3">
          <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="v5-boton v5-boton-luz">
            WhatsApp {WHATSAPP_DISPLAY}<span className="sr-only"> (opens in a new tab)</span>
          </a>
          <Link href="/hablemos" hrefLang="es" className="v5-boton v5-boton-linea">Use the form (Spanish)</Link>
        </div>
      </div>
    </div>
  );
}
