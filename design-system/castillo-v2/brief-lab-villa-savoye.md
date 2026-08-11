# Brief — Lab "Villa Savoye" (casas icónicas #1)

**Fecha:** 2026-08-11 · **Estado:** ✅ Dirección A «Purismo» APROBADA por Alejandro (11-ago, 12:5x pm)
**Qué es:** microsite cinematográfico de UNA casa icónica que se **desarma por capas con el scroll**.
Ficción declarada: homenaje de estudio a la Villa Savoye (Le Corbusier, Poissy, 1931). CTAs muertos,
crédito explícito al original. Dobla como demo vendible del formato "microsite por proyecto
insignia" (v25 del banco) para el nicho de arquitectos.

## Por qué la Villa Savoye
Los **5 puntos de la arquitectura moderna** de Le Corbusier SON el guion del desarme — no hay que
inventar narrativa:
1. **Pilotis** (la casa flota sobre columnas)
2. **Toit-terrasse** (la cubierta es jardín)
3. **Plan libre** (la estructura libera la planta)
4. **Fenêtre en longueur** (la ventana corrida)
5. **Façade libre** (la fachada no carga)

Cada punto = una capa que se separa del volumen con el scroll, con su texto corto.
Geometría simple (prismas blancos + cilindros) = alcanzable en 3D sin photoscan.

## Estructura (molde v25 + ensamblaje igloo.inc)
1. **Hero**: la casa completa, título gigante, lugar/año. Cinematográfico, sin UI ruidosa.
2. **El desarme** (scrub pineado): 5 secciones, una por punto. La capa se separa, se explica, vuelve.
   Referencia directa: el anillo de igloo.inc ensamblándose por piezas — aquí en reversa.
3. **Ficha** (tipo listing de v25): datos duros — m², año, materiales, estado (monumento) — con labels
   mono estilo cota de plano.
4. **Homenaje / por qué importa hoy**: 3-4 frases editoriales + declaración de ficción.
5. **Créditos**: lab de Castillo Studio, referencias, sin CTA comercial vivo.

## Técnica
- **La casa que se desarma = interacción del usuario ⇒ 3D VIVO justificado** (matiz v10-Ciao).
  Atmósfera (cielo, luz, grano) = CSS/pre-render, nunca WebGL.
- **Experimento img2threejs — presupuesto 1 intento (L-014):** imagen de referencia → modelo
  procedural solo-código. Si la geometría sale mal ⇒ **fallback al pipeline validado**: Blender
  (cajas + cilindros, la Savoye es primitivas) → secuencia de frames escrubeada (patrón GkCube ya
  en el repo).
- Lenis + GSAP/ScrollTrigger (stack de siempre) · reduced-motion: versión estática por capas.
- Mobile: el desarme funciona por scroll vertical nativo; DPR capeado según v10.

## Reset visual (obligatorio): nada de Geist ni lila de Castillo, nada de Cormorant de Mari.

### Dirección A — «Purismo» (blanco galería) ← recomendada
La casa es blanca; la página es el museo. Fondo hueso `#FAFAF7`, texto carbón `#1A1A18`,
**UN acento: verde inglés corbusiano `#3F5C48`** (de su Polychromie Architecturale).
Tipos: **Archivo** (display grotesk, caps, tracking apretado) + **Inter** (body) +
**IBM Plex Mono** (cotas, labels, números de capa).
Sensación: publicación de arquitectura + sala de museo. LIGHT MODE — se diferencia de todo
lo que Castillo ha hecho (todo ha sido dark) y del propio portafolio donde vivirá embebido.

### Dirección B — «Béton» (maqueta iluminada)
Carbón profundo `#141412`, la casa blanca flotando como maqueta de museo bajo un spot,
acento ocre `#A16207`. Mismos tipos que A. Más cerca del norte dark-luxury existente —
menos riesgo, menos diferenciación (se parece al portafolio que lo va a contener).

### Dirección C — «Polychromie» (la arriesgada)
Base blanca de A, pero **cada uno de los 5 puntos toma un color real de la Polychromie de
Le Corbusier** (azul cerúleo, ocre, verde inglés, terracota, gris hierro) como acento de su
sección — el scroll recorre la paleta del arquitecto. Más artística, más difícil de mantener
sobria; el riesgo es feria de colores si no se dosifica.

## Gates antes de llamarlo terminado
review-animations + emil-design-eng en el motion · impeccable/web-design-guidelines en QA ·
reduced-motion · Lighthouse ≥95 · ficción declarada visible.
