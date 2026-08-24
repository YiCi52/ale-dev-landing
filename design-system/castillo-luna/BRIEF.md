# BRIEF — "El gato y la luna" (rediseño narrativo del portafolio)

> Estado: **PENDIENTE DE APROBACIÓN de Alejandro** (L-025).
> Referencia estructural elegida por Alejandro: StringTune (string-tune.fiddle.digital,
> teardown 24-ago en el banco de referencias). Se copia la ESTRUCTURA, no el disfraz.
> Sucede a `castillo-v2/MASTER.md` en dirección visual del home; los tokens de las
> páginas interiores siguen bajo castillo-v2 hasta migrarlas.

## 1. El concepto en una frase

El logo animado que ya existe (luna → gato → C → nombre, `SelloCastillo`) deja de ser
un sello y se convierte en LA PÁGINA: el gato de Castillo camina un paisaje nocturno
mientras el scroll avanza, y **la luna crece en fases con el progreso** — luna nueva
al arrancar (la idea), luna llena al final (la entrega). El fondo es el vacío del
espacio en morado profundo; abajo, agua negra con el reflejo de la luna temblando.

Regla de estilo de mezcla: **gato = silueta vectorial plana** (el CatMascot que ya
existe, currentColor) sobre **atmósfera fotográfica** (luna/agua/nubes generadas con
nanobanana). El contraste silueta-contra-cielo es la firma visual.

## 2. Los beats (aprobados por Alejandro, 24-ago)

Escenario fijo (sticky stage) + scroll como timeline, técnica StringTune/RecorridoV2.
Fase lunar = fase del proceso:

| Beat | Fase lunar | Qué pasa en pantalla |
|---|---|---|
| 0 · Hero | Luna nueva (halo apenas) | Vacío morado + agua quieta. Wordmark CASTILLO gigante cortado abajo (patrón Zentro/StringTune). El gato entra caminando (su animación del sello, ampliada). |
| 1 · Idea | Creciente fina | "La idea" — texto con unblur letra a letra. El gato se sienta a mirar la luna. |
| 2 · Estructura | Cuarto | "La estructura" — retícula fina se dibuja en el cielo (líneas hairline). |
| 3 · Diseño | Gibosa | "El diseño" — el reflejo en el agua se enciende y ondula. |
| 4 · Experiencia | Casi llena | "La experiencia" — micro-interacciones demo (lo que sé hacer, mostrado no contado). |
| 5 · Entrega | **Luna llena** | Reflejo pleno como camino de luz. El gato camina sobre el reflejo hacia la luna → CTA. |

Después del acto narrativo, la página aterriza en contenido normal (scroll nativo):
**baraja de proyectos** (BarajaCasos, se conserva) → **servicios/proceso** →
**constelación de 14 capas** (se conserva, como CIERRE antes del form) → form → footer.

## 2b. Pantalla de carga (pedida por Alejandro, 24-ago — aprobado el concepto general)

El loader ES el sello: la animación luna → gato → C de `SelloCastillo` a una pasada
sobre el vacío morado, con etiqueta Geist Mono (`CASTILLO — BOGOTÁ ©2026`) y hairline
de progreso. Al salir, la luna del loader VIAJA a su posición en el hero (continuidad
espacial — el loader se convierte en la página, no desaparece).

Reglas duras: tope 1.2s aunque la carga real siga · solo primera visita de la sesión
(sessionStorage) · reduced-motion lo elimina · costo asumido: 2-3 pts de LCP solo en
primera visita.

## 3. Paleta — "Luna sobre el vacío"

Evolución de "Lila sobre carbón" (el lila madura a luz de luna). NO amarillo: la luna
es fría, alineada al blanco. Tokens propuestos:

| Token | Hex | Papel |
|---|---|---|
| `--luna-void` | `#0B0713` | Fondo base: morado-negro, el vacío |
| `--luna-void-deep` | `#060409` | Agua / zonas hundidas |
| `--luna-space` | `#171027` | Superficies elevadas, cards |
| `--luna-glow` | `#F5F2FF` | La luz de la luna: blanco-violeta. Texto principal |
| `--luna-halo` | `#CFC3FF` | Halo, acentos suaves, hover |
| `--luna-accent` | `#9F86FF` | Interactivo: links, CTA, focus ring (heredero del lila) |
| `--luna-muted` | `#8B819F` | Texto secundario (AA sobre void: ~7:1) |
| `--luna-line` | `rgba(207,195,255,0.14)` | Hairlines, bordes |

Contrastes verificados: glow/void ≈ 17:1 · accent/void ≈ 8:1 · muted/void ≈ 6.5:1.

## 4. Tipografía

**Se mantiene Geist + Geist Mono** (ya cargadas, cero bytes nuevos). La lección
StringTune/THEFIRSTTHELAST aplica: la masa viene de la ESCALA a peso normal, no del bold.
- Display: Geist 300–400, `clamp(3.5rem, 2rem + 10vw, 11rem)`, lh 0.92, tracking -0.02em
- Wordmark fantasma: Geist 400 a ~22vw, color `--luna-line`
- Etiquetas/beats: Geist Mono 0.72rem, uppercase, tracking 0.22em (la voz mono de StringTune)

## 5. Mecánica (sin WebGL — decisión aprobada: pre-render/CSS)

- **Escenario**: sticky top-0 h-svh + centinelas invisibles (patrón RecorridoV2, ya
  verificado en Playwright). Scroll nativo intacto. Barra de progreso hairline arriba.
- **La luna y sus fases**: UNA imagen de luna (nanobanana) + `mask-image` radial animada
  por CSS según el beat — las 6 fases salen de un solo asset, cero JS de render.
- **El reflejo**: imagen del camino de luz + shimmer con gradiente animado
  (`mask` + `translate` en loop lento). Compositor-friendly.
- **El gato**: CatMascot SVG (ya existe) — poses por beat vía CSS transforms +
  la caminata del sello reutilizada. NUNCA generado por IA (consistencia = vector propio).
- **Texto**: unblur letra a letra al estilo React Bits "Scroll Reveal" — implementación
  propia CSS-only (~30 líneas), sin traer gsap/motion de vuelta.
- **Suavizado**: Lenis (~4KB) — ÚNICA dependencia nueva propuesta. Alternativa: nada,
  scroll crudo (decisión de Alejandro).
- **reduced-motion**: la historia degrada a secciones estáticas con la luna llena fija.

## 6. Assets a generar (nanobanana / Google AI Studio — NO Higgsfield)

Todos sobre **fondo negro puro** para componer con `mix-blend-mode: screen` (sin
necesidad de transparencia). Prompts exactos en la sección 9 del mensaje de sesión
y duplicados aquí abajo. Lista:

1. `luna-llena.png` — 1:1, 2048px. La luna: blanco frío violeta, cráteres sutiles.
2. `reflejo-camino.png` — 9:16. Camino de luz de luna sobre agua negra, hacia el horizonte.
3. `agua-textura.png` — 16:9. Superficie de agua nocturna casi negra, ondas mínimas.
4. `nubes-1.png` / `nubes-2.png` — 21:9. Jirones de nubes nocturnas finas (2 capas parallax).
5. `estrellas.png` — 16:9. Campo de estrellas escaso, agrupación natural.
6. (opcional) `horizonte.png` — 21:9. Silueta de horizonte/colinas negro sobre morado.

## 7. Librerías evaluadas (propuesta a Alejandro)

| Pieza | Fuente | Veredicto |
|---|---|---|
| Scroll Reveal (unblur) | React Bits | Replicar CSS-only — el componente oficial trae dependencia de animación que acabamos de sacar del bundle |
| Split Text | React Bits | Ídem — CSS + spans, ya tenemos patrón propio |
| Staggered Menu | React Bits | CANDIDATO real vía CLI (`-JS-CSS` variant) para el menú overlay |
| Accordion Gallery | React Bits | Ya cubierto por BarajaCasos propia |
| Lenis | lenis (npm, ~4KB) | ÚNICA dep nueva propuesta — el suavizado del timeline |
| gsap / motion | — | NO vuelven. CSS-first (el propio lema de StringTune) |
| Backgrounds WebGL (Silk, Ripple…) | React Bits | Descartados: presupuesto de rendimiento (Lighthouse 92) |

## 8. Lo que se conserva del sitio actual

- **BarajaCasos** (la baraja, aunque haya 1 proyecto) — acto 2.
- **Constelación 14 capas** — cierre pre-form.
- **Las pestañas** (confirmado por Alejandro 24-ago): las secciones **Sobre mí ·
  Proyectos · Contacto** como navegación siempre visible en el header (chips estilo
  StringTune "Dev Guides / Skill Hub"). Saltan directo a su destino sin obligar a
  recorrer la historia; la historia es el home, no una cárcel.
- Form + Supabase + Make + analítica: intocables.
- SEO: la narrativa vive en el home; las rutas interiores no cambian.

## 9. Presupuesto de rendimiento

- Lighthouse mobile ≥ 92 (no regresión vs hoy).
- JS nuevo: ≤ 8KB (Lenis + timeline propio). Cero WebGL, cero gsap/motion.
- Imágenes: AVIF/WebP, luna precargada (es el LCP), resto lazy. Total assets ≤ 2.5MB.
- Todo el motion en transform/opacity/mask. reduced-motion completo.
