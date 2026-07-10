-- Tabla de leads del form de contacto (ale-dev-landing / Castillo Studio).
-- APLICADA en el proyecto Supabase `ale-dev-landing` (avzbltscilqcojtvwljp)
-- el 2026-07-10 vía MCP. Versionada acá para historial/restauración.
-- Espejo del contactSchema (src/lib/contact-schema.ts) + campos de auditoría
-- que inserta src/app/actions/contact.ts.

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  nombre text not null check (char_length(nombre) >= 2),
  email text not null check (position('@' in email) > 1),
  whatsapp text,
  tipo_proyecto text not null check (tipo_proyecto in ('landing', 'webapp', 'migration', 'other')),
  mensaje text not null check (char_length(mensaje) between 20 and 2000),
  source text not null default 'landing',
  user_agent text,
  consentimiento_at timestamptz not null,
  created_at timestamptz not null default now()
);

alter table public.leads enable row level security;

-- anon solo INSERTA. Lectura únicamente desde el dashboard (rol service).
create policy "leads_insert_anon"
  on public.leads
  for insert
  to anon
  with check (true);
