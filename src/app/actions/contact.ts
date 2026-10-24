"use server";

import { headers } from "next/headers";
import { contactSchema, type ContactInput } from "@/lib/contact-schema";
import { checkRateLimit } from "@/lib/rate-limit";
import { supabaseServidor } from "@/lib/supabase-server";

type ActionResult =
  | { ok: true }
  | { ok: false; error: string };

export async function submitContact(input: ContactInput): Promise<ActionResult> {
  const parsed = contactSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Datos inválidos." };
  }

  if (parsed.data.honeypot && parsed.data.honeypot.length > 0) {
    return { ok: true };
  }

  const h = await headers();
  const userAgent = h.get("user-agent") ?? null;
  const forwardedFor = h.get("x-forwarded-for");
  const realIp = h.get("x-real-ip");
  const ip = forwardedFor?.split(",")[0]?.trim() ?? realIp ?? "unknown";

  const rate = checkRateLimit(`contact:${ip}`);
  if (!rate.ok) {
    return {
      ok: false,
      error: "Demasiados intentos desde tu red. Probá de nuevo en una hora.",
    };
  }

  const consentimientoAt = new Date().toISOString();
  const source = origenDe(h.get("referer"));

  const { error } = await supabaseServidor().from("leads").insert({
    nombre: parsed.data.nombre,
    email: parsed.data.email,
    whatsapp: parsed.data.whatsapp ?? null,
    tipo_proyecto: parsed.data.tipoProyecto,
    mensaje: parsed.data.mensaje,
    source,
    user_agent: userAgent,
    consentimiento_at: consentimientoAt,
  });

  if (error) {
    console.error("[submitContact] Supabase insert failed:", error.message);
    return { ok: false, error: "No pudimos guardar tu mensaje. Probá de nuevo." };
  }

  await notifyMakeWebhook({
    created_at: new Date().toISOString(),
    nombre: parsed.data.nombre,
    email: parsed.data.email,
    whatsapp: parsed.data.whatsapp ?? null,
    tipo_proyecto: parsed.data.tipoProyecto,
    mensaje: parsed.data.mensaje,
    source,
  });

  return { ok: true };
}

/* De qué página vino el lead (CN-010): las pruebas desde los labs no se mezclan con los leads de la home. */
function origenDe(referer: string | null): string {
  if (!referer) return "landing";
  try {
    const ruta = new URL(referer).pathname;
    if (ruta.startsWith("/lab/v5")) return "lab-v5";
    if (ruta.startsWith("/lab/v4")) return "lab-v4";
    if (ruta.startsWith("/lab")) return "lab";
  } catch {
    return "landing";
  }
  return "landing";
}

type WebhookPayload = {
  created_at: string;
  nombre: string;
  email: string;
  whatsapp: string | null;
  tipo_proyecto: string;
  mensaje: string;
  source: string;
};

async function notifyMakeWebhook(payload: WebhookPayload): Promise<void> {
  const url = process.env.MAKE_WEBHOOK_URL;
  if (!url) return;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    if (!res.ok) {
      console.error(
        "[submitContact] Make webhook returned non-2xx:",
        res.status,
      );
    }
  } catch (err) {
    console.error("[submitContact] Make webhook failed:", err);
  } finally {
    clearTimeout(timeout);
  }
}
