import { NextResponse, type NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";

/*
  Keepalive — Supabase free tier PAUSA proyectos tras ~7 días sin requests
  a la API (pasó el 2026-07: el form quedó muerto en producción hasta el
  restore manual). Vercel Cron (vercel.json) pega acá una vez al día; el
  select cuenta como actividad aunque RLS lo devuelva vacío.
*/
export async function GET(request: NextRequest) {
  /*
    Sin esta puerta el endpoint queda abierto: cualquiera con curl quema
    cuota de funciones de Vercel y del free tier de Supabase (medido: ~7,3 s
    por request). Vercel Cron manda esta cabecera automaticamente cuando
    CRON_SECRET existe en el proyecto; si la variable no esta definida, el
    endpoint se cierra en vez de quedar abierto (fail-closed).
  */
  const secreto = process.env.CRON_SECRET;
  if (!secreto || request.headers.get("authorization") !== `Bearer ${secreto}`) {
    return new NextResponse(null, { status: 401 });
  }

  const { error } = await supabase.from("leads").select("id").limit(1);
  // RLS insert-only: el select puede venir vacío o denegado — ambos cuentan
  // como request. Solo reportamos si la API no respondió en absoluto.
  return NextResponse.json({ ok: true, supabase: error ? error.code : "up" });
}
