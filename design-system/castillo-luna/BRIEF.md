# BRIEF v2 — "El gato y la luna" (CONTRATO MAESTRO)

> Fuente de verdad: las 27 diapositivas de Alejandro (24-ago-2026, exportadas de Canva,
> copia local en el scratchpad de sesión) + el video de referencia de @seanaiux
> ("Animations to make a 30k website": Object Reveal, Portal, Space Transition,
> 3D Gallery, 4th Wall). Este archivo las destila; ante duda, mandan las slides.
> Método acordado: SECCIÓN POR SECCIÓN, cada una aprobada por Alejandro antes de seguir.
> Referencias de craft: StringTune (sobriedad en los bordes, elegante y tech) y
> Zentro (minimalismo, jerarquía tipográfica, espacio negativo — NO su composición
> ni branding).

## 1. Paleta v2 (slide 14 — EXACTA, sustituye a la v1)

| Rol | Hex | Uso |
|---|---|---|
| `--luna-void` (fondo) | `#030305` | Negro noche abisal con 2% de tinta violeta |
| `--luna-glow` (texto y luz) | `#F4F4F8` | Blanco frío/luna: títulos y brillo principal |
| `--luna-accent` (glow violeta) | `#7A66FF` (alt `#8B78FF`) | Tags, hover de links, crestas de luz del agua |
| `--luna-muted` (secundario) | `#71717A` | Menú superior y subtítulos |

Reglas de luz (slides 13/15): la luna NO quemada — glow integrado con blend screen +
atmósfera radial, nunca "parche recortado". Luz FOCALIZADA (foco fino), no regada.
Nav: rgba(255,255,255,0.7) → hover 1.0 con toque violeta. ESPACIO NEGATIVO: el centro
respira; "la luna y el título son los únicos reyes de la sección" — menos estrellas
brillantes en el centro.

## 2. Correcciones de HERO (slide 1)

- Header: PONER EL LOGO (el sello) + "CASTILLO STUDIO" más a la IZQUIERDA.
- Wordmark CASTILLO: pegado al borde inferior CON un poco de margen (ya no cortado)
  y CON GLASMORFISMO.
- Lo demás del hero v2 (titular compacto izq., luna derecha) le gustó en las slides.

## 3. La transición cielo→mar (slide 6 — reemplaza el mecanismo --post actual)

Scroll-driven en 2 etapas, tipo cámara:
1. Arriba: luna llena/protagónica ALTA en el cielo.
2. Al bajar: LA LUNA SALE DEL VIEWPORT POR ARRIBA mientras la "cámara" desciende
   hacia la superficie del agua.
3. Estado final: la luna física YA NO se ve; el agua ocupa TODO y solo queda el
   camino de luz vertical proyectado desde el horizonte, con destellos vibrantes.
El agua-total coincide con la llegada a PROYECTOS. "Mala transición del cielo al
mar" (slide 5) = la costura actual; debe ser continua, sin banda dura.

## 4. El agua y el cursor (slides 3-4 — spec de 4 fotogramas)

La pantalla es una piscina en calma; el cursor es la punta del dedo índice sumergida
1 cm:
- F1 Reposo: superficie oscura profunda, calma absoluta, luz estelar fría. SIN distorsión.
- F2 Contacto: al mover, UN anillo concéntrico perfecto donde está el cursor, sutil y
  brillante, refractando la luz fría.
- F3 Movimiento rápido: estela caótica de ondas entrelazadas; la luz se refracta en
  las crestas (patrones brillantes); el fondo se distorsiona agresivamente.
- F4 Desvanecimiento: damping — ondas bajas y anchas expandiéndose, el brillo muere,
  vuelta a la calma.
⇒ Es un simulador de ondas con DISTORSIÓN real de la superficie (height-field /
refracción), no anillos pintados ni humo. Guiño extra (slide 3): "cursor reactivo con
píxeles" — el glitch pixelado de StringTune le gusta como acento.

## 5. El gato (slide 2 — REDISEÑO COMPLETO)

- "El gato toca rediseñarlo por completo": la silueta actual no va.
- Su papel = el equivalente de la KATANA: el gato CAMINA POR LOS BORDES de la página
  (cruza/recorre los márgenes como la katana cruza StringTune), no plantado en la orilla.
- Sigue siendo dibujo propio (nunca IA), pero hay que rehacer el asset (SVG con poses/
  frames de caminata reales).

## 6. El reflejo de la luna (slides 5-7)

"El reflejo debe mejorar" / "se ve pero no como quiero" / "ni se ve" (según ronda):
el reflejo vive DENTRO del agua como luz que la superficie rompe — con la transición
de cámara (punto 3), el reflejo/camino se convierte en EL protagonista del fondo
cuando la luna ya salió de cuadro. Nada de discos calcados.

## 7. La constelación (slides 8-9 — REDISEÑO)

- "La constelación se pierde la idea" sobre el agua.
- Nueva forma: BENTO GRID estilo demos de StringTune (tarjetas con micro-demos /
  contenido vivo adentro), manteniendo el concepto 14 capas. Referencia visual:
  la grilla de features de string-tune (slide 9).

## 8. Sistema de interacción por contenido (slides 19-27 + video)

"El tipo de contenido determina el tipo de interacción" — NUNCA efectos porque sí:

| Contenido | Interacción (del video) |
|---|---|
| Hero | Hero Reveal (presentación inicial) |
| Entrada a proyecto | Portal (el proyecto aparece y ocupa la pantalla) |
| Fotografía | 4th Wall (profundidad + responde al cursor) |
| Galería | 3D Gallery (explorar imágenes en el espacio) |
| Información conceptual | Motion editorial (transición minimalista) |
| Detalles/materiales | Object Reveal (hover: posición+escala+perspectiva+iluminación, 600-900ms, ease-out, "emerge físicamente") |
| Cambio de proyecto / final | Space Transition (vuelves a la navegación) |

PORTAFOLIO ESCALABLE (slides 22, 25): funciona con 1 proyecto o con 20. Con UN
proyecto se le saca PROFUNDIDAD (Akanti/MacroLift como experiencia completa:
PORTFOLIO → HERO/IDENTITY → PROJECT 01 → ramas OVERVIEW(concept/materials/process)
y VISUAL(gallery/details/spatial) → PROJECT END → ABOUT/CONTACT), jamás tarjetas
vacías para aparentar volumen. Content-driven: los efectos no inventan contenido.

## 9. Motion language (slide 18) — toda animación cumple:

estado inicial → trigger → transformación → transición → estado final → respuesta.
Principios: 01 Depth (posicionado en un espacio, no en superficie plana) · 02
Continuity (conectar estados, no aparecer/desaparecer) · 03 Responsiveness (mouse,
scroll y navegación afectan la composición) · 04 Restraint (sofisticado, no excesivo)
· 05 Purpose (comunica o mejora la exploración).

## 10. Reglas de implementación y Definition of Done (slides 21, 23)

BEFORE: analizar repo/framework/estilos/componentes/assets, correr la página,
identificar qué ya funciona, no reemplazar arquitectura sin necesidad.
DURING: UNA interacción a la vez · componentes reutilizables · GPU-friendly
transforms (nada de top/left/width/height animados) · responsive · reduced-motion ·
cero dependencias innecesarias.
AFTER cada interacción: test desktop + mobile + hover/scroll/touch, consola limpia,
rendimiento, COMPARAR CONTRA LA REFERENCIA.
DONE = dirección del movimiento coincide con la referencia · profundidad se percibe ·
timing natural · easing no mecánico · trigger correcto · entrada/salida coherentes ·
sin estados muertos · no rompe responsive · sin errores · buen rendimiento · ayuda a
explorar · no distrae · se siente parte del diseño.

## 11. Criterios de éxito (slide 17)

Visual premium comparable a las referencias · jerarquía clara · animación con
propósito · cursor reactivo sin estorbar · scroll cinematográfico natural ·
experiencia equivalente en móvil · sin caídas de FPS · contraste/navegación
accesibles · código componentizado · el usuario siempre entiende dónde está.

## 12. Prioridades de trabajo (slide 16) y orden por secciones

Prioridad: 1 Identidad visual (composición/tipo/color/jerarquía/imágenes) → 2 UX
(nav/scroll/hover/responsive) → 3 Motion (parallax/transiciones/cursor/partículas/
atmósfera) → 4 Detalles (micro/iluminación/blur/secundarios).
Secciones acordadas: S1 hero → S-agua (cámara + ripple) → S-gato → S-proyectos
(portal/experiencia) → S-constelación (bento) → resto. Cada una con visto bueno de
Alejandro antes de avanzar.
