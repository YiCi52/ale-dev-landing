# Brief — Sección "La Constelación de las 14 capas"
> Dirección artística APROBADA por Alejandro 2026-08-06 (proceso L-025: brief antes de producir).
> Elegida: opción **2a** del doc de Claude Design
> (https://claude.ai/design/p/a1ba4ba3-f9b4-402c-a942-05aa5ea1fce4 — turno 2).
> Referencia madre: video de @alassafi.ai (mapa "second brain" radial; WhatsApp Video 2026-07-27),
> el mismo que originó la idea de constelación.

## Qué es
La sección del portafolio que muestra que cada entrega de Castillo Studio no es una página
sino un sistema de 14 capas — mapa radial con el sitio del cliente como núcleo.

## Composición (2a)
- **Núcleo**: cúmulo de partículas ("TU SITIO") con glow lila que respira. Sin WebGL.
- **4 zonas radiando** como constelaciones: SUPERFICIE (01 Front · 14 Descubribilidad),
  BORDE (02 API · 04 Auth/RLS · 08 Seguridad · 09 Rate limiting),
  DATOS (03 Base de datos · 10 Caching/CDN · 13 Backup),
  OPERACIÓN (05 Hosting · 06 Cloud · 07 CI/CD · 11 Scaling · 12 Error tracking).
- **Nodos**: anillos (borde hueso, punto interior) y puntos llenos; labels Geist Mono `/ NN NOMBRE`.
  Satélites de acento en lila (nunca rojo/dorado del video — manda MASTER.md).
- **Estructura 3D**: tres planos de profundidad — cercano (nítido, grande), lejano
  (blur 0.8px + opacidad 0.55), y bokeh en primer plano (manchas blur 12-20px).
- Labels de zona mono, tracking ancho, con tick de subrayado corto.
- Ficha de capa activa (card grafito #131318, hairline) conectada con línea punteada lila.

## Motion
- Parallax por PLANO al mouse (3 velocidades), gated `(hover: hover) and (pointer: fine)`.
- El núcleo respira (scale/glow sutil, CSS, loop lento).
- Las ramas se DIBUJAN al entrar en viewport (stroke-dashoffset, una vez, ease-out ≤1s).
- Hover/focus en nodo → su ficha. Interruptible (transiciones, no keyframes).
- `prefers-reduced-motion`: todo estático y visible, cero loops.
- rAF/loops con compuerta de visibilidad (lección de la auditoría del lab).

## Fuera de v1 (fase 2 opcional)
- Estado "zona enfocada" (2b: ghost word gigante + breadcrumb + zoom-through).
- Cualquier render Blender del núcleo.

## Contrato
Todo dentro de MASTER.md: carbón #0A0A0C · Lila Ion #A78BFA único acento · Geist + Geist Mono ·
labels `/ 01` · sin cyan · WCAG AA (contraste medido, teclado, reduced-motion).
