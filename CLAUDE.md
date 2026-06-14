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
- Fonts: Fraunces (display/serif) + Inter (sans body)

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
- Idioma: solo español
- Sin e-commerce, sin blog, sin multi-idioma
