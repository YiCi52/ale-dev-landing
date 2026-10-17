import type { Metadata } from "next";

import { ContactForm } from "@/components/form/ContactForm";
import { WHATSAPP_DISPLAY, WHATSAPP_URL } from "@/lib/site";

/*
  Hablemos (Alejo, 15-oct: "las pestañas que toda página tiene"). Usa el formulario que YA funciona en la página
  actual (Supabase con permisos de solo inserción, freno al spam, aviso al correo), con la piel v4 encima.
*/
export const metadata: Metadata = { title: "Hablemos · Castillo Studio", robots: { index: false, follow: false } };

export default function HablemosPage() {
  return (
    <main className="v4-pagina v4-piedra min-h-[100svh] px-4 pb-24 pt-32 sm:px-12">
      <div className="mx-auto grid max-w-[1240px] gap-14 lg:grid-cols-[5fr_7fr] lg:gap-24">
        <div className="lg:sticky lg:top-32 lg:self-start">
          <p className="v4-mono" style={{ color: "var(--veta-oro)" }}>Hablemos</p>
          <h1 className="v4-display mt-5 text-[clamp(44px,6vw,92px)] leading-[0.98]">Empecemos por quince minutos.</h1>
          <p className="mt-7 max-w-[42ch] text-lg leading-relaxed" style={{ color: "var(--cuarzo-200)" }}>
            Cuéntame de tu estudio y de la obra que quieres mostrar. Si encaja, te mando la propuesta en dos o tres días.
          </p>
          <dl className="mt-12 grid gap-5 border-t pt-8" style={{ borderColor: "var(--linea)" }}>
            <div>
              <dt className="v4-mono">WhatsApp</dt>
              <dd className="mt-1"><a className="v4-enlace" href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">{WHATSAPP_DISPLAY}</a></dd>
            </div>
            <div>
              <dt className="v4-mono">Respuesta</dt>
              <dd className="mt-1" style={{ color: "var(--cuarzo-200)" }}>El mismo día hábil</dd>
            </div>
          </dl>
        </div>
        <div className="v4-formulario">
          <ContactForm />
        </div>
      </div>
    </main>
  );
}
