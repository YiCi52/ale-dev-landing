import { NextResponse, type NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";

/*
  Keepalive — Supabase free tier PAUSA proyectos tras ~7 días sin actividad.
  Vercel Cron (vercel.json) pega acá una vez al día y la GitHub Action
  `supabase-keepalive.yml` toca la misma tabla cada 3 días, por si Vercel falla.

  ⚠️ POR QUÉ LEE `latido` Y NO `leads` (16-sep-2026):
  antes leía `leads`, pero anon no tiene SELECT sobre esa tabla. PostgREST
  respondía 401 (42501) y esta ruta lo daba por bueno, con el argumento de que
  "igual cuenta como request". No contaba: con el cron corriendo a diario,
  Supabase mandó igual el aviso de pausa. `latido` tiene una sola fila
  constante que anon puede leer, así que el keepalive recibe un 200 real.
  `leads` sigue cerrada. Cualquier error, o que falte la fila, es un FALLO.

  ⚠️ POR QUÉ DISTINGUE 503 DE 401 (9-sep-2026):
  la versión anterior devolvía 401 tanto si el secreto FALTABA como si estaba
  MAL. Como `CRON_SECRET` no estaba en Vercel, el cron se disparó durante dos
  meses contra una puerta que siempre decía que no. El proyecto se durmió y el
  formulario quedó muerto sin aviso, dos veces (2026-07 y 2026-09).

  Este proyecto NO tiene Sentry, así que el fallo tiene que verse DESDE AFUERA:
    503 + motivo   = mal configurado, el keepalive NO está corriendo
    401 (sin body) = configurado bien, pero esta petición no es del cron
    502 + motivo   = el cron entró pero Supabase no dio el latido
  `_system/verificar_salud.py` (corre al abrir sesión) lee estos códigos.

  Una protección que falla callada es un placebo.
*/

export const dynamic = "force-dynamic";

function fallo(motivo: string, status: number) {
  return NextResponse.json({ ok: false, motivo }, { status });
}

export async function GET(request: NextRequest) {
  const secreto = process.env.CRON_SECRET;

  /*
    Sin secreto el endpoint quedaría abierto a cualquiera con curl (medido:
    ~7,3 s por request, quema cuota de Vercel y de Supabase), así que sigue
    cerrado, pero DICE por qué.
  */
  if (!secreto) {
    return fallo(
      "CRON_SECRET ausente en Vercel — el keepalive NO está corriendo y el proyecto de Supabase se va a pausar",
      503,
    );
  }

  if (request.headers.get("authorization") !== `Bearer ${secreto}`) {
    return new NextResponse(null, { status: 401 });
  }

  try {
    const { data, error } = await supabase.from("latido").select("id").limit(1);

    if (error) {
      return fallo(
        `Supabase rechazó el latido (${error.code || "sin código"}): ${error.message}`,
        502,
      );
    }
    if (!data || data.length === 0) {
      return fallo("La tabla latido respondió sin su fila única — revisar la migración", 502);
    }
  } catch (e) {
    return fallo(`Supabase no respondió: ${e instanceof Error ? e.message : String(e)}`, 502);
  }

  return NextResponse.json({ ok: true });
}
