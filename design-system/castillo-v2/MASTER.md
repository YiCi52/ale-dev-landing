# Castillo Studio v2 — Design System MASTER
> Contrato de dirección visual. Aprobado por Alejandro 2026-07-26 (moodboard)
> y validado contra ui-ux-pro-max (contraste lila 7.1:1 AA, pairing Sans+Mono
> "Modern Dark Cinema", patrón Portfolio-first). Fuentes de la dirección:
> norte sanjaya (sistema dark luxury) + Vanity (arquitectura portfolio-first)
> + video Animmaster (patrones WORK tileado/Swiper/badge circular).
> Las páginas NO improvisan sobre esto — cambios se discuten acá primero.

## Identidad en una frase
Dark luxury tech + editorial + un objeto 3D (cristal) como héroe, con LILA
como único acento. El trabajo adelante: portfolio-first.

## Paleta — "Lila sobre carbón"
| Token | Nombre | Hex ref | oklch |
|---|---|---|---|
| --color-bg | Negro Carbón | #0A0A0C | oklch(13.5% 0.005 285) |
| --color-bg-elevated | Grafito | #131318 | oklch(18% 0.008 285) |
| --color-fg | Hueso | #F2EFEA | oklch(95.5% 0.007 85) — cálido a propósito sobre base fría |
| --color-fg-muted | Bruma | #98959E | oklch(66% 0.01 300) |
| --color-fg-subtle | — | — | oklch(46% 0.012 295) |
| --color-border | Hairline | white/10% | oklch(100% 0 0 / 0.10) |
| --color-border-strong | — | white/16% | oklch(100% 0 0 / 0.16) |
| --color-accent | **Lila Ion** | #A78BFA | oklch(71.5% 0.14 294) — 7.1:1 sobre bg, AA para texto |
| --color-accent-muted | Violeta Profundo | #5B4A96 | oklch(45% 0.11 295) — SOLO superficies/gradientes, nunca texto |

Reglas de color: monocromo disciplinado; el color vive en el cristal 3D y en
chips/eyebrows/hovers. Cyan NO existe en v1 del rediseño. Violeta Profundo
jamás como texto (3.4:1, falla AA).

## Tipografía — Geist + Geist Mono (clase "Modern Dark Cinema")
- Display/body: **Geist** (única familia sans). Body 400 · headings 600
  tracking -0.5% · display 700 tracking -1.5%.
- Labels/eyebrows/índices: **Geist Mono** 500, MAYÚSCULA, tracking +12%,
  formato `/ 01`.
- Se retiran Fraunces, Inter y JetBrains Mono. `--font-serif` queda aliasado
  a Geist durante la migración (los componentes viejos no se rompen) y se
  limpia sección a sección.

## Arquitectura (7 secciones, portfolio-first)
1. Hero: claim corto + cristal refractando lila + trabajo asomando + pill "Bogotá · hora local"
2. Selected Work: fondo "WORK" tileado violeta-oscuro + ventana flotante Swiper effect:fade 800ms
3. /lab público (réplicas con preview vivo)
4. Caso MH Interior con métricas reales
5. Servicios con specs mono (/ 01 …)
6. Sobre mí (marca personal, IA + criterio)
7. Contacto (form + capas de producción)
Footer: cristal loop wireframe↔sólido + badge circular rotatorio "LET'S TALK".

## Motion
Lenis + reveal palabra-por-palabra en claims · scramble SOLO acento de
títulos · cristal escrubeado al scroll · Swiper crossfade 800ms · reveals
1000ms ease-out una vez (playbook) · prefers-reduced-motion SIEMPRE.
Glitch RGB: descartado (probar solo en /lab si acaso).

## Deuda declarada de migración
- Componentes v1 usan `font-serif` (era Fraunces): alias a Geist hasta
  rehacer cada sección.
- Paleta v1 era ámbar-cálida: secciones no migradas pueden verse tibias
  contra los tokens fríos nuevos — se migran en orden de arquitectura.
