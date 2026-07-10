import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

/*
  Keepalive — Supabase free tier PAUSA proyectos tras ~7 días sin requests
  a la API (pasó el 2026-07: el form quedó muerto en producción hasta el
  restore manual). Vercel Cron (vercel.json) pega acá una vez al día; el
  select cuenta como actividad aunque RLS lo devuelva vacío.
*/
export async function GET() {
  const { error } = await supabase.from("leads").select("id").limit(1);
  // RLS insert-only: el select puede venir vacío o denegado — ambos cuentan
  // como request. Solo reportamos si la API no respondió en absoluto.
  return NextResponse.json({ ok: true, supabase: error ? error.code : "up" });
}
