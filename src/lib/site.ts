/*
  Identidad del sitio en UN solo lugar (capa 14 — descubribilidad).

  Antes la URL estaba escrita a mano en tres archivos (robots.ts, sitemap.ts y
  el metadataBase del layout). Eso hace que el día que exista dominio propio
  haya que acordarse de los tres, y el que se olvide deja un canonical
  apuntando al alias de Vercel — que es exactamente cómo Google termina
  indexando dos sitios distintos y repartiendo la autoridad entre ambos.

  CUANDO HAYA DOMINIO: definir NEXT_PUBLIC_SITE_URL en Vercel (Production) y
  no hay que tocar código. El fallback existe para desarrollo y para que un
  build sin la variable no genere URLs rotas (gotcha G-23: la env var puede
  no existir en prod y el fallback es lo que salva el canonical).
*/
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
  "https://ale-dev-landing.vercel.app";

/**
 * WhatsApp de contacto. Vive acá y no escrito a mano en cada componente
 * porque aparece en el formulario (salida de emergencia cuando el envío
 * falla), en el panel de éxito y en el footer: tres sitios que se
 * desincronizan solos. Formato internacional sin signos — wa.me lo exige.
 */
export const WHATSAPP_NUMBER = "573003519162";
export const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}`;
export const WHATSAPP_DISPLAY = "+57 300 351 9162";

export const SITE_NAME = "Castillo Studio";

export const FOUNDER_NAME = "Alejandro Díaz del Castillo";

/**
 * Perfiles públicos — alimentan `sameAs` del JSON-LD. Le dicen a Google y a los
 * motores de IA que estas identidades son la MISMA entidad.
 * Fuente: los enlaces reales del footer. No agregar perfiles sin verificar que
 * existan y sean de él: un `sameAs` a una cuenta ajena es una señal falsa.
 */
export const SOCIAL_PROFILES = [
  "https://github.com/YiCi52",
  "https://www.linkedin.com/in/alejandro-diaz-del-castillo",
] as const;

/** Caso publicado y verificable. */
export const CASE_MH_INTERIOR = "https://www.mhinterior.net";
