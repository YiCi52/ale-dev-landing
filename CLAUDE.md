@AGENTS.md

# Proyecto: landing personal de Alejandro Díaz del Castillo

Landing dev freelance. Sirve doble: portafolio + máquina de leads.

## Reglas duras
- ECC manda (`~/.claude/rules/ecc/`, especialmente `web/`, `typescript/`, `react/`). Si conflicto entre tu juicio y ECC, gana ECC.
- Anti-template policy: nada de pinta Tailwind/shadcn por defecto. Editorial dark luxury.
- Tests obligatorios al 80%+ (Vitest unit, Playwright E2E).
- Mobile-first. Lighthouse mobile ≥95.
- WCAG AA. Reduced-motion respetado.
- Archivos <800 líneas. Funciones <50.

## Stack
- Next.js 16 App Router + TypeScript (React 19)
- Tailwind v4 (sintaxis `@theme inline` en `src/app/globals.css`)
- Supabase (tabla `leads` con RLS insert-only)
- Vercel deploy
- Make webhook → WhatsApp + Gmail + Notion
- Fonts: **Geist + Geist Mono** (patrón "Modern Dark Cinema", validado contra ui-ux-pro-max 2026-08-01). `--font-serif` queda ALIASADO a Geist: deuda de migración declarada, se limpia sección a sección.

## Estructura
```
src/
├── app/                # Routes + globals.css con tokens
├── components/
│   ├── hero/
│   ├── servicios/
│   ├── proceso/
│   ├── sobre-mi/
│   ├── casos/
│   ├── form/
│   └── ui/             # Primitives (Button, Section, etc)
├── hooks/
├── lib/                # cn.ts + supabase client + utilidades
└── styles/             # tokens, typography, etc
```

## Antes de editar
- `AGENTS.md` avisa que Next 16 tiene breaking changes. Si dudas, lee `node_modules/next/dist/docs/`.
- No agregar features fuera del PRD: `.claude/PRPs/prds/landing-alejandro-dev.prd.md`
- No agregar deps sin avisar a Alejandro.

## Datos del cliente final (Alejandro)
- WhatsApp leads: 3003519162
- Email leads: addelcv@gmail.com
- GitHub: YiCi52
- Caso #1: MacroLift (https://flourishing-cranachan-4f54c2.netlify.app/)

## Decisiones cerradas
- Tono copy: tú colombiano profesional (sin "estimado" ni "parce")
- Tema: dark default, light toggle en Phase 6 (posterable)
- Sin e-commerce, sin blog

## Rediseño v2 — decisiones vigentes (2026-08-01)
- **Contrato visual**: `design-system/castillo-v2/MASTER.md` (paleta "Lila sobre carbón", aprobada). Leerlo ANTES de tocar estilos.
- **Posicionamiento (auditoría de competencia 2026-07-31)**: la competencia del nicho (Luciano Marchisio, Visual Bloom, Proyecto W) vende TODA la misma promesa — "una web que refleje tu trabajo". **Ninguno vende lo que pasa DESPUÉS de que llega el visitante.** Ese es el territorio de Castillo: captura, notificación, resumen, respaldo. El copy nunca debe caer en la promesa saturada.
- **Mercado**: Colombia arranca, **USA es el destino** — el copy NO se ancla solo a Bogotá y no usa jerga local (nada de "Bre-B" en superficie pública). Bilingüe ES/EN previsto (precedente: mhinterior.net); hoy ES, estructura preparada.
- Rama de trabajo: `redesign/portfolio-v2`.
