import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/*
  Cliente de Supabase SOLO para el servidor (auditoría cyber-neo 23-oct, CN-001). Inserta los leads con la llave
  secreta (`SUPABASE_SECRET_KEY`, nunca con prefijo NEXT_PUBLIC_), para que la llave pública del navegador deje de
  poder escribir en `leads` y nadie pueda saltarse el formulario (límite, honeypot, validación, consentimiento).
  Mientras la llave secreta no esté cargada en Vercel, usa la pública y lo avisa en el log: así el formulario no se
  cae en la transición. Cuando ya esté cargada, se quita el INSERT de anon en la base.
*/
if (typeof window !== "undefined") {
  throw new Error("supabase-server solo se puede importar en el servidor");
}

let cliente: SupabaseClient | null = null;

export function supabaseServidor(): SupabaseClient {
  if (cliente) return cliente;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secreta = process.env.SUPABASE_SECRET_KEY;
  const publica = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || (!secreta && !publica)) {
    throw new Error("Faltan variables de Supabase: NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SECRET_KEY");
  }
  if (!secreta) {
    console.warn("[supabase-server] SUPABASE_SECRET_KEY ausente: se usa la llave pública (cargarla en Vercel)");
  }
  cliente = createClient(url, (secreta ?? publica) as string, { auth: { persistSession: false } });
  return cliente;
}
