# Landing Alejandro Díaz del Castillo | Dev

## Problem Statement

Emprendedores, PYMEs y profesionales colombianos necesitan presencia digital pero quedan atrapados entre tres opciones malas: agencias caras (3M+ COP por landing), freelancers sin criterio que entregan plantillas Tailwind/Wix obvias, o no-code genérico. Sin un canal propio donde Alejandro pueda mostrar criterio + técnica + precio accesible, los leads cualificados nunca lo encuentran y él arranca su negocio freelance sin máquina de captura.

## Evidence

- **Asumido** — necesita validarse con primeros leads del form. Workana CO tiene cientos de devs cotizando landing pages con portfolios genéricos. Diferenciación visual = ventaja real.
- **Validado**: Alejandro ya tiene 1 caso real (MacroLift, proyecto de grado de undécimo, app de nutrición deportiva con perfil dinámico, tracking de macros/micros y centro educativo. Deploy vivo en `flourishing-cranachan-4f54c2.netlify.app`).
- **TBD** — testimonios reales o feedback de clientes potenciales (aún no hay).

## Proposed Solution

Landing personal en `Next.js 15 + Tailwind v4 + Supabase + Vercel` con dirección **editorial dark luxury** (Fraunces para títulos, Inter/Geist para body, paleta monocroma + blanco roto). Estructura: hero con promesa, servicios, proceso, sobre mí (toque personal), caso real (MacroLift), form Supabase que dispara automatización Make a WhatsApp + email + Notion. Toggle dark/light con dark default. Cumple ECC web/ anti-template, performance ≥95 mobile, WCAG AA.

## Key Hypothesis

Creemos que una landing con criterio visual visible (dark luxury editorial) + caso real (MacroLift) + form que captura datos estructurados generará leads más cualificados que un perfil genérico de freelancer en Workana. Lo sabremos cuando recibamos **3+ leads cualificados en los primeros 3 meses** post-lanzamiento. Cualificado = cliente llega con presupuesto rango, tipo de proyecto y plazo definidos en el form.

## Messaging Direction (refinada)

- **Promesa**: "Webs con criterio. Sin pinta de plantilla."
- **NO decir**: "0% IA" o "sin ayuda de IA" (contradice MacroLift hecho en Bolt).
- **SÍ decir**: "criterio", "decisiones", "diseño y arquitectura", "hechas con dirección, no con plantilla".
- **Diferenciador real**: Alejandro decide problema, diseño, arquitectura. Las herramientas son secundarias.

## What We're NOT Building

- E-commerce / payments — fuera de scope de servicios
- Blog — over-engineering v1
- Multi-idioma — solo español
- Sistema de cotización automática — cada proyecto se discute 1-1
- Login / panel cliente — landing pura
- Animaciones 3D / WebGL pesado — performance > flex
- Testimonios fake — honestidad

## Success Metrics

| Metric | Target | How Measured |
|--------|--------|--------------|
| Leads cualificados / mes | ≥1 en mes 1, ≥3 en mes 3 | Form submissions con presupuesto, tipo y plazo llenos |
| Lighthouse perf (mobile) | ≥95 | Lighthouse CI en cada deploy |
| LCP | <2.5s | Vercel Analytics |
| CLS | <0.1 | Vercel Analytics |
| Bounce rate | <60% | Vercel Analytics |
| Test coverage | ≥80% | Vitest coverage |

## Resolved Inputs (2026-06-14)

| Input | Value |
|---|---|
| Caso #1 | **MacroLift** (proyecto de grado, app de nutrición deportiva). URL: `https://flourishing-cranachan-4f54c2.netlify.app/` |
| Foto profesional | TBD — Alejandro provee |
| WhatsApp notificaciones | `3003519162` (personal) |
| Email notificaciones | `addelcv@gmail.com` (Gmail personal) |
| Cuenta Make | Lista. Falta crear scenario `lead → WhatsApp + Gmail + Notion` |
| LinkedIn | NO existe. Crear en paralelo con plantilla guiada |
| GitHub | NO existe (público). Crear en paralelo con plantilla README |
| Tono copy | Tú colombiano profesional (sin "estimado" ni "parce") |

## Open Questions (residuales)

- [ ] Año exacto del grado de undécimo (para etiquetar MacroLift)
- [ ] Tesis del grado: ¿problema concreto que la app resuelve? (para descripción del caso)
- [ ] ¿Foto profesional disponible o producimos una? (selfie limpia con luz natural sirve para v1)
- [ ] ¿Querés mantener URL Netlify de MacroLift o re-deployamos en Vercel bajo subdominio tuyo?

---

## Users & Context

**Primary User**
- **Who**: Dueño/a de negocio o emprendedor colombiano (25–45, segmento medio-alto) que descartó Wix porque "se ve igual a todo"
- **Current behavior**: pregunta en su red por referidos, mira Workana/Fiverr, recibe cotizaciones altas de agencias
- **Trigger**: lanzamiento de producto, rebrand, competencia hace algo mejor, cliente le dice "tu web está fea"
- **Success state**: cierra contrato con Alejandro porque vio el caso, entendió la promesa, y el form le hizo fácil escribirle

**Job to Be Done**
Cuando necesito una web para mi negocio que no se vea hecha a las carreras y que de verdad funcione, quiero contratar a un dev con criterio para no terminar pagando dos veces.

**Non-Users**
- Corporativos grandes (escala incompatible con 14h/sem)
- E-commerce con inventario físico (fuera de scope)
- Cazadores de gangas Fiverr
- Otros devs buscando empleo

---

## Solution Detail

### Core Capabilities (MoSCoW)

| Priority | Capability | Rationale |
|----------|------------|-----------|
| Must | Hero editorial con promesa + CTA al form | Primer impacto = todo |
| Must | Caso MacroLift con detalles + screenshots + link vivo | Credibilidad real |
| Must | Form Supabase con campos cualificadores | Filtra lead frío |
| Must | Automatización Make → WhatsApp + Gmail + Notion | Cero leads perdidos |
| Must | Fraunces + Inter, paleta monocroma + blanco roto | Diferenciador visual |
| Must | Mobile-first (320–1920) | Mayoría del tráfico mobile |
| Must | Lighthouse mobile ≥95 | "Convierten" exige perf |
| Must | WCAG AA | ECC + respeto al usuario |
| Should | Sección servicios con SÍ/NO explícito | Alinea expectativas |
| Should | Sección proceso transparente | Reduce fricción venta |
| Should | Sección sobre mí con foto + stack + hint humano | Confianza |
| Should | Toggle dark/light | Pedido del usuario; scope risk marcado |
| Should | Links a GitHub + LinkedIn en footer/sobre mí | Validación social |
| Could | Animaciones scroll compositor-friendly | Refuerza editorial |
| Could | OG image dinámica | CTR en WhatsApp/redes |
| Won't | Blog, multi-idioma, Calendly, cotizador, testimonios fake | Fuera de scope |

### MVP Scope

Hero + Servicios + Proceso + Sobre mí + Caso MacroLift + Form + Footer. Dark default + light toggle. Mobile-first. Deploy a `*.vercel.app`. Form end-to-end con 3 canales de notificación funcionando.

### User Flow

1. Llega vía link (WhatsApp, LinkedIn) o búsqueda → Hero impacta
2. Scroll: ve servicios → cómo trabaja → quién es → MacroLift
3. Llega al form o clickea CTA en cualquier sección
4. Llena form (5–7 campos cualificadores)
5. Submit → Supabase guarda → Make dispara → 3 canales notificados en <30s
6. Alejandro responde en <24h vía WhatsApp/email
7. Cierra deal vía llamada o chat, anticipo Bre-B antes de empezar

---

## Technical Approach

**Feasibility**: HIGH

**Architecture Notes**
- **Next.js 15 App Router**: Server Components por default; Client solo en theme toggle, form, scroll-trigger
- **Tailwind v4** con CSS custom properties para tokens según ECC `web/coding-style.md`
- **Supabase**: tabla `leads` con RLS estricto (insert-only anon, shape validada zod). Sin auth.
- **Make**: scenario `Supabase webhook → WhatsApp (3003519162) + Gmail (addelcv@gmail.com) + Notion DB`
- **Vercel**: deploy auto desde GitHub, env vars en dashboard, Analytics free
- **Playwright**: smoke E2E hero + form happy path en 320/768/1440
- **Vitest**: utilidades, validación zod, transforms
- **Tests ≥80%** (ECC `common/testing.md`)

**Technical Risks**

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Light + dark se traga capacidad de 14h/sem | Alta | Diseñar solo dark primero; light = Phase 6 posterable |
| Make sin scenario armado | Alta | Crear scenario en setup (Phase 1). Yo te guío paso a paso. |
| RLS mal config → spam | Media | Rate-limit edge + honeypot + zod estricto server-side |
| Fraunces + Inter > 200kb | Media | Subset latin + `font-display: swap` + preload Fraunces 700 |
| Animaciones bajan Lighthouse | Baja | Solo `transform`/`opacity` + IntersectionObserver + `prefers-reduced-motion` |
| Sin foto profesional → "Sobre mí" débil | Media | Bloquear Phase 4 hasta tener foto; alt: ilustración monocroma |
| MacroLift "Made in Bolt" contradice mensaje | Baja | Mensaje refinado: "criterio" en vez de "0% IA". Honesto y defendible. |
| LinkedIn/GitHub vacíos cuando lanza landing | Alta | Crear ambos en paralelo a Phase 3-4 con plantillas guiadas |

---

## Implementation Phases

| # | Phase | Description | Status | Parallel | Depends | PRP Plan |
|---|-------|-------------|--------|----------|---------|----------|
| 1 | Setup base | Next 15 + Tailwind v4 + Supabase + Vercel + Make scenario | pending | with 1b | - | - |
| 1b | Perfiles sociales | LinkedIn + GitHub con plantillas + foto profesional | pending | with 1 | - | - |
| 2 | Sistema de diseño | Fraunces+Inter, tokens monocroma, primitives, ThemeProvider | pending | - | 1 | - |
| 3 | Hero + Servicios + Proceso | 3 secciones estáticas editoriales | pending | with 4 | 2 | - |
| 4 | Sobre mí + Caso MacroLift | Secciones de credibilidad con datos reales | pending | with 3 | 2, 1b | - |
| 5 | Form + Supabase + Make | Tabla leads, RLS, validación, webhook 3 canales | pending | - | 1 | - |
| 6 | Light toggle | Tokens light, persistencia, contraste AA | pending | - | 3, 4 | - |
| 7 | Performance + a11y + tests | Lighthouse 95+, WCAG AA, Playwright, Vitest 80% | pending | - | 5, 6 | - |
| 8 | Deploy + OG + Analytics | Prod deploy, OG dinámica, Vercel Analytics | pending | - | 7 | - |

### Phase Details

**Phase 1 — Setup base**
- Goal: scaffold deployable + automatización lista
- Scope: repo git, Next 15 TS, Tailwind v4, Supabase project, Vercel project, env vars, **Make scenario** (Alejandro me guía con credenciales, yo armo flow)
- Success signal: `npm run dev` corre + deploy vacío 200 + scenario Make recibe test payload

**Phase 1b — Perfiles sociales (paralelo a 1)**
- Goal: LinkedIn + GitHub listos antes de Phase 4
- Scope: LinkedIn (headline + acerca de + experiencia básica + foto), GitHub (perfil público + README pro + 1-2 pinned repos)
- Success signal: ambos URLs públicos y presentables

**Phase 2 — Sistema de diseño**
- Goal: tokens + primitives antes de secciones
- Scope: `styles/tokens.css`, fuentes subset, ThemeProvider, primitives `components/ui/`
- Success signal: `/styleguide` muestra escala completa

**Phase 3 — Hero + Servicios + Proceso**
- Goal: 3 secciones de mensaje con composición editorial
- Scope: layout root, Hero, Servicios (SÍ/NO), Proceso, nav sticky
- Success signal: scroll sin CLS, mobile y desktop coherentes

**Phase 4 — Sobre mí + Caso MacroLift**
- Goal: secciones de credibilidad
- Scope: SobreMi con foto + bio + stack + hint humano. Caso MacroLift con problema, decisiones, screenshots, link vivo
- Success signal: ambas con datos definitivos, sin Lorem

**Phase 5 — Form + Supabase + Make**
- Goal: captura de leads end-to-end
- Scope: tabla `leads`, RLS, zod, RHF form, server action, webhook a Make existente, notificación 3 canales
- Success signal: lead de prueba dispara WhatsApp + email + Notion en <30s

**Phase 6 — Light toggle**
- Goal: soporte light con misma calidad
- Scope: tokens light, persistencia localStorage, audit contraste AA
- Success signal: ambos modos pasan visual + a11y

**Phase 7 — Performance + a11y + tests**
- Goal: cumplir budgets ECC
- Scope: Lighthouse 95+ mobile, image opt, font subset verificado, Playwright smoke, Vitest, ≥80%
- Success signal: CI verde

**Phase 8 — Deploy + OG + Analytics**
- Goal: producción
- Scope: deploy prod, OG dinámica con `next/og`, Vercel Analytics
- Success signal: `*.vercel.app` accesible, OG renderiza al compartir, primer lead de prueba registrado

### Parallelism Notes

- **1 + 1b en paralelo**: yo arranco código mientras vos hacés perfiles sociales con mis plantillas
- **3 + 4 en paralelo**: secciones independientes
- **5 (form)** puede arrancar tras Phase 1 — no necesita diseño completo
- **6 (light)** al final como red flag de scope

---

## Decisions Log

| Decision | Choice | Alternatives | Rationale |
|----------|--------|--------------|-----------|
| Stack | Next 15 + Tailwind v4 + Supabase + Vercel | WordPress, Astro, Remix | Memoria `freelance-stack-default`, MCPs conectados |
| Dirección visual | Editorial dark luxury | Brutalism, glass, swiss | Coherente con promesa |
| Tono | Tú CO profesional | Vos, usted | Amplio sin perder pro |
| Serif | Fraunces | EB Garamond, Cormorant, Instrument Serif | Variable, gratis, character editorial |
| Sans body | Inter o Geist | System UI | Pareo limpio |
| Color | Monocromo + blanco roto | Ámbar, eléctrico, verde | Editorial silencioso, envejece bien |
| Tema | Dark + light toggle | Dark only | Pedido del usuario; riesgo marcado |
| Contacto | Form Supabase + Make → WhatsApp+Gmail+Notion | Calendly, email solo | Captura + cero leak |
| Caso #1 | MacroLift (proyecto de grado real) | Placeholder, mockup | Honestidad + autoridad |
| Mensaje | "Webs con criterio. Sin pinta de plantilla." | "Sin IA", "Estilo propio" | Defendible con caso hecho en Bolt |
| Dominio | Subdominio Vercel free | Compra ya | Free; comprar tras caso #2 |
| Idioma | Solo español | EN/ES | Audiencia CO, scope mínimo |
| Cobro | Anticipo Bre-B | Pago contra entrega | Memoria `freelance-pricing` |

---

## Research Summary

**Market Context**
- Workana CO: cientos de devs con portfolios plantilla
- Estudios CO cobran 5M–15M COP por landing con criterio
- Diferenciación: criterio editorial + precio entre estudio y freelance plantilla

**Technical Context**
- Carpeta proyecto: `~/Downloads/ale-dev-landing/`
- MCPs Vercel/Supabase/Figma/Playwright conectados
- ECC `rules/ecc/web/` aplicado

**Caso #1 — MacroLift**
- URL: `https://flourishing-cranachan-4f54c2.netlify.app/`
- Tipo: App web React de nutrición deportiva
- Features: perfil deportivo configurable, tracking de macros/micros/vitaminas/minerales, registro de comidas (desayuno/almuerzo/cena), centro educativo
- Decisiones de Alejandro: dark + violeta/rosa, 3 tabs (Seguimiento / Comidas / Educación), perfil deportivo específico (e.g. Natación)
- Año: TBD (probablemente 2024-2025, último año de undécimo)
- Tesis: TBD — Alejandro debe confirmar el problema/hipótesis del proyecto académico

---

*Generated: 2026-06-14*
*Status: DRAFT — needs validation by Alejandro before `/prp-plan`*
