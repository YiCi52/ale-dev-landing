import type { Metadata } from "next";

import { ContactForm } from "@/components/form/ContactForm";
import { WHATSAPP_DISPLAY, WHATSAPP_URL } from "@/lib/site";
import { metaDe } from "@/components/lab/v5/meta";

/*
  Hablemos v5. Usa el formulario que YA funciona en la página
  actual (Supabase con permisos de solo inserción, freno al spam, aviso al correo), con la piel v5 encima.
*/
export const metadata: Metadata = metaDe("/hablemos", "es", "Hablemos", "Cuéntame de tu estudio y de la obra que quieres mostrar. Te respondo el mismo día hábil.");

export default function HablemosPage() {
  return (
    <div className="v5-gutter min-h-[100svh] pb-24 pt-32">
      <div className="mx-auto grid max-w-[1240px] gap-14 lg:grid-cols-[5fr_7fr] lg:gap-24">
        <div className="lg:sticky lg:top-32 lg:self-start">
          <p className="v5-mono" style={{ color: "var(--calido)" }}>Hablemos</p>
          <h1 className="v5-display mt-5 text-[clamp(44px,6vw,92px)] leading-[0.98]">Empecemos por quince minutos.</h1>
          <p className="mt-7 max-w-[42ch] text-lg leading-relaxed" style={{ color: "var(--luna-300)" }}>
            Cuéntame de tu estudio y de la obra que quieres mostrar. Si encaja, te mando la propuesta en 48 horas.
          </p>
          <dl className="mt-12 grid gap-5 border-t pt-8" style={{ borderColor: "var(--linea)" }}>
            <div>
              <dt className="v5-mono">WhatsApp</dt>
              <dd className="mt-1"><a className="v5-enlace" href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">{WHATSAPP_DISPLAY}<span className="sr-only"> (se abre en una pestaña nueva)</span></a></dd>
            </div>
            <div>
              <dt className="v5-mono">Respuesta</dt>
              <dd className="mt-1" style={{ color: "var(--luna-300)" }}>El mismo día hábil</dd>
            </div>
          </dl>
        </div>
        <div className="v5-formulario">
          <ContactForm />
        </div>
      </div>
    </div>
  );
}
