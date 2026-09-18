# Hero como escena guiada por scroll — especificación técnica
> Borrador para aprobación. 2026-08-30. NO implementado.
> Rige bajo MASTER.md (ACTIVE). Cristal cerrado: `iridescence 0.45` + eje lila.

---

## 1. EXPERIENCE THESIS

**Una sola escena continua en la que el gato conduce al visitante desde la marca
hasta un proyecto real, usando el cristal como umbral.**

El argumento comercial no lo carga el copy: lo carga el **mecanismo**. Un
arquitecto que hace scroll y ve un objeto reaccionar y abrirse hacia un proyecto
construido está viendo, literalmente, la demostración del servicio — "convierto
tu espacio en experiencia digital" — sin que nadie se lo diga.

Tres restricciones que definen la tesis:

- **Es UNA escena, no siete animaciones.** Un solo timeline, un solo progreso
  0→1. Si el usuario se detiene a la mitad, queda a la mitad; si sube, retrocede.
- **La escena termina entregando, no impresionando.** El éxito no es que digan
  "qué bonito", es que lleguen a Selected Work con la pregunta "¿esto lo puedo
  tener para mi proyecto?".
- **La narrativa debe sobrevivir sin WebGL.** Ver §7.

---

## 2. SCROLL STORYBOARD — 7 beats

Progreso continuo `0..1` sobre una sección pegajosa. Los beats son *zonas*, no
saltos: todo interpola. Un solo `progresoDe(section)` alimenta a todos los
subsistemas (patrón ya probado en `useGatoScrub.ts`, rama luna).

| # | Rango | Gato | Cristal | Texto | Composición | Transición |
|---|---|---|---|---|---|---|
| **0 · ENTRADA** | 0.00–0.08 | Sentado de frente, quieto. Cola viva | Lejos, pequeño, girando lento | Titular completo, peso máximo | Tipografía manda; cristal es atmósfera | El primer scroll despierta al gato |
| **1 · DESPERTAR** | 0.08–0.22 | Gira a perfil y arranca a caminar | Empieza a crecer y a acercarse | Titular sube y pierde opacidad | Se reparte el peso | El gato entra al tercio central |
| **2 · APROXIMACIÓN** | 0.22–0.42 | Camina; el paso marca el ritmo | Crece; la iridiscencia se agita al acercarse el gato | Titular fuera; una línea de contexto entra abajo | El cristal toma el centro | Distancia gato-cristal < umbral |
| **3 · CONTACTO** | 0.42–0.55 | Se detiene, se estira, **toca** | Reacciona: pulso desde el punto de contacto | Sin texto. Silencio | Los dos protagonizan | El pulso alcanza el borde del cristal |
| **4 · RESPUESTA** | 0.55–0.68 | Retrocede medio paso, se sienta a mirar | Se reorganiza: deja de ser objeto y empieza a ser superficie | Sin texto | El cristal ocupa el centro óptico | La superficie empieza a mostrar algo dentro |
| **5 · UMBRAL** | 0.68–0.85 | Silueta pequeña, de espaldas, mirando adentro | **Es portal**: dentro se ve MH Interior, aún distorsionado | Sin texto | El interior del cristal es el sujeto | El marco del cristal sale de cuadro |
| **6 · REVELACIÓN** | 0.85–0.96 | Sale de cuadro por el borde | Ya no existe como objeto: su interior ES el viewport | Nombre del proyecto entra, discreto | MH Interior ocupa todo | El proyecto se asienta |
| **7 · ENTREGA** | 0.96–1.00 | — | — | Rótulo del caso | La composición ya es la primera carta de la baraja | Suelta el scroll a `BarajaCasos` |

**Regla de continuidad:** ningún beat tiene animación propia con duración
propia. Todo se deriva del progreso. La única excepción son los *loops* de vida
(cola, respiración, deriva de la atmósfera), que corren en su propio tiempo.

---

## 3. CHARACTER SYSTEM

### Qué conserva de la identidad
La silueta monocroma llena (`fill: currentColor`), las orejas triangulares de
punta redondeada, la proporción cabeza/cuerpo, y la cola como elemento vivo
independiente. El gato de Castillo se reconoce por **silueta**, no por detalle.
Eso además lo hace barato de animar y legible a 40px en el sello.

### Qué le falta y es bloqueante
El asset actual **solo existe de frente y sentado**. La escena pide caminar,
detenerse, estirarse, tocar y mirar. Se necesita un **sistema**, no un dibujo.

### Estructura propuesta: rig de piezas separadas en un solo SVG
Un SVG con partes nombradas y transformables de forma independiente:

| Pieza | Por qué separada |
|---|---|
| `cabeza` (+ orejas como hijos) | Gira para mirar; las orejas se inclinan en el contacto |
| `cuerpo` | Ancla; respira con una escala mínima |
| `pata-del-frente` / `pata-de-atrás` | El paso y el estirarse a tocar |
| `cola` | Ya existe como path propio; se conserva |
| `ojo` (opcional, un solo punto) | Único detalle interior; permite el parpadeo y la dirección de la mirada |

Cada pieza con su `transform-origin` declarado. Todo sigue siendo un archivo,
sin dependencias, animable por CSS o GSAP indistintamente.

### Vistas necesarias
1. **Perfil** (nueva, la crítica) — caminar, aproximarse, tocar.
2. **Frontal sentado** (existe) — beat 0 y el sello.
3. **Tres cuartos trasero** (nueva) — beat 5, mirando hacia el portal.

### Poses necesarias
Sentado quieto · paso A · paso B · detenido alerta · estirarse a tocar ·
retroceder · sentado de espaldas. Siete estados; los intermedios se interpolan.

### Regla dura
**El diseño del personaje lo define Alejandro.** Higgsfield puede explorar
*cómo se mueve*, nunca *cómo se ve*. El asset final se dibuja como vector propio.

---

## 4. CRYSTAL SYSTEM

Configuración **cerrada, no se re-investiga**: `iridescence 0.45`, luces
`#f6f2ff` `#cdbcff` `#a78bfa` `#5b4a96`, geometría, cámara y material actuales.

Lo que cambia no es su aspecto sino su **rol**, que pasa por cuatro estados:

1. **Atmósfera** (beats 0-1) — lejano, gira solo, es fondo con presencia.
2. **Objeto reactivo** (2-3) — responde a la proximidad y al contacto del gato.
   Único parámetro nuevo: un `uPulso` que viaja desde el punto de contacto.
3. **Superficie** (4-5) — la cámara se acerca hasta que el cristal deja de
   leerse como objeto y pasa a leerse como plano.
4. **Umbral** (5-6) — su interior ES la ventana al proyecto.

**El cristal nunca se rompe.** Romperlo sería la metáfora contraria: Castillo
no destruye el objeto del arquitecto, lo atraviesa.

---

## 5. PORTAL — tres mecanismos

### A · Refracción real (el cristal como lente)
El material ya refracta lo que tiene detrás (`background={CRYSTAL_BG}`). Se
sustituye ese color por un **render target** que dibuja el proyecto. El
resultado: MH Interior se ve *dentro* del vidrio, distorsionado por su propia
física, y al acercar la cámara el marco sale de cuadro.

- **Causalidad:** máxima. No es un efecto encima, es lo que el objeto hace.
- **Coste:** medio-alto. Un render target extra = segunda pasada de render.
- **Performance:** el cristal ya es lo más caro de la página; duplicar pasada
  en el beat 5 es el punto de riesgo.
- **Compatibilidad:** nativa con R3F/drei ya instalados.
- **Talón de Aquiles:** no existe en móvil.

### B · Máscara que se expande desde la silueta ⭐ RECOMENDADO
Al llegar al beat 5, la silueta del cristal se convierte en una **máscara** que
se expande hasta llenar el viewport, revelando debajo la sección del proyecto.

- **Causalidad:** alta si la forma de la máscara es la del cristal.
- **Coste:** bajo. `clip-path` / `mask-image` + transform. Sin WebGL.
- **Performance:** compositor puro. Es la única que no toca el hilo principal.
- **Compatibilidad:** DOM/CSS. **Idéntica en móvil y escritorio.**
- **Talón de Aquiles:** el empalme 3D→2D tiene que ser invisible.

### C · Secuencia pre-renderizada en Blender
Renderizar la transformación completa en Cycles y escrubear fotogramas WebP.

- **Causalidad:** total — se puede dirigir cuadro a cuadro.
- **Coste:** alto en producción, nulo en runtime.
- **Performance:** excelente si se dosifica la carga.
- **Compatibilidad:** es el pipeline ya validado (Vanity, Villa, Mari V2).
- **Talón de Aquiles:** no reacciona. El gato no puede tocarlo "de verdad".

### Recomendación: **B como columna vertebral, A como enriquecimiento de escritorio**

La razón es estructural, no estética: **el cristal WebGL no existe en móvil**, y
una narrativa cuya pieza central desaparece para la mitad del tráfico no es una
narrativa, es un adorno de escritorio.

Entonces: la transición **se construye con B**, que funciona igual en los dos
lados. Sobre eso, en escritorio, **A** enriquece los beats 4-5 haciendo que el
proyecto ya se insinúe *dentro* del vidrio antes de que la máscara abra. Si A
falla o el dispositivo es débil, B sigue contando la misma historia.

**C se reserva** para el momento en que exista presupuesto de producción; es la
ruta de mayor calidad final y encaja con el pipeline del BRAIN, pero mata la
interacción causal del beat 3, que es el corazón de la escena.

---

## 6. WORK REVEAL

El proyecto no entra: **ya estaba ahí**, detrás del umbral.

1. En el beat 5 el interior del cristal muestra un fragmento de MH Interior —
   suficiente para intrigar, no para leerse.
2. La máscara se expande **desde la silueta del cristal**, no desde un borde.
3. Al llenar el viewport, lo que queda encuadrado **ya es la primera carta de
   la baraja**, en su posición y proporción finales.
4. El rótulo del caso entra después, cuando la imagen ya se asentó.
5. El scroll se suelta: a partir de ahí manda `BarajaCasos`.

La costura con Selected Work es el punto crítico. El acordeón actual replica
`vanity.llc/work` y espera cartas en lista; hay que hacer que la primera carta
**nazca** del portal en vez de aparecer. Ver riesgo R-3.

---

## 7. TECHNICAL ARCHITECTURE

Todo lo necesario ya está en el bundle: **GSAP 3.15 · Lenis 1.3.25 · three
0.185 · R3F 9.6 · drei 10.7**. No entra ninguna dependencia nueva.

| Capa | Herramienta | Por qué |
|---|---|---|
| Progreso del scroll | **Lenis + `progresoDe()`** | Ya existe y es inmune a saltos |
| Timeline maestro | **Una sola fuente de progreso 0..1** | Un `useSyncExternalStore` o un contexto que publica `p`; cada subsistema lee, nadie orquesta a otro |
| Gato | **SVG + GSAP** (o CSS vars) | Vector propio, animable por piezas, pesa nada |
| Trayecto del gato | **`useGatoScrub` portado de luna** | Resuelto: puntos interpolados, flip de dirección, caminar/parar |
| Cristal | **R3F, solo escritorio** | Se mantiene el gate actual |
| Portal | **CSS `clip-path`/`mask` + transform** | Compositor, universal |
| Proyecto revelado | **`next/image` sobre WebP/AVIF** | Los PNG actuales pesan hasta 1 MB |
| Texto | **DOM, siempre presente** | Nunca dentro del canvas: SEO y lectores de pantalla |

**Principio de arquitectura:** el canvas nunca es dueño de la narrativa. El
scroll manda sobre el DOM, y el WebGL es una capa opcional que *escucha* el
mismo progreso.

---

## 8. REQUIRED ASSETS

| Asset | Estado | Nota |
|---|---|---|
| Gato de perfil, con piezas separadas | ❌ Por diseñar | **Bloqueante del beat 1 en adelante** |
| Gato tres cuartos trasero | ❌ Por diseñar | Beat 5 |
| Gato frontal sentado | ✅ Existe | `CatMascot.tsx` |
| Siete poses del rig | ❌ Por definir | Derivadas del rig, no dibujos nuevos |
| Fotograma de MH para el interior del cristal | ⚠️ Deriva de los existentes | Recorte, no captura nueva |
| Imagen del reveal | ⚠️ Existe en PNG pesado | `shot-1-hero.png` pesa 1.056 KB → convertir a AVIF/WebP |
| Máscara con la silueta del cristal | ❌ Por producir | Se extrae del render actual |
| Fotograma de respaldo del cristal (móvil) | ❌ Por producir | Un WebP estático del cristal para el tier sin WebGL |

⚠️ `shot-1-hero.png` figura como imagen rota en pendientes previos. **Verificar
antes de construir sobre ella.**

---

## 9. HIGGSFIELD — dónde aporta y dónde no

| Uso | ¿Aporta algo que el stack no da? | Veredicto |
|---|---|---|
| **Acting del gato** — cómo se detiene, se estira, duda antes de tocar | **Sí.** El timing de un personaje es lo más difícil de acertar a mano, y es exactamente lo que un modelo de video sí sabe. Se usa como **referencia de tiempos**, y las poses se redibujan a vector | ✅ Recomendado |
| **Previs de cámara** del beat 4-5 | **Sí.** Probar el acercamiento hasta que el objeto se vuelve superficie es caro de iterar en código | ✅ Recomendado |
| Diseño del personaje | No. Y viola la regla del asset propio | ❌ Prohibido |
| Generar el cristal | No. El cristal existe y está cerrado | ❌ |
| Generar el reveal de MH | No. Es un proyecto real; generarlo sería inventar trabajo | ⛔ Nunca |

---

## 10. PERFORMANCE / ACCESSIBILITY

- **LCP:** el titular es el LCP y es DOM puro. Ni el cristal ni el gato pueden
  bloquearlo. El canvas sigue con carga diferida y `ssr:false`.
- **Móvil:** sin WebGL, como hoy. La escena corre con gato SVG + máscara CSS +
  fotograma estático del cristal. **La narrativa completa se conserva**; lo que
  se pierde es la refracción viva.
- **`prefers-reduced-motion`:** la escena colapsa a estados, no a movimiento —
  el usuario ve el titular, el proyecto y el acceso a Work, sin recorrido. No se
  esconde contenido: se quita el trayecto.
- **Sin JS:** el hero renderiza titular + párrafo + CTAs + la primera carta.
  Todo el contenido sobrevive.
- **WCAG AA:** el texto nunca vive dentro del canvas. El gato y el cristal son
  `aria-hidden`. La secuencia no puede ser el único camino a Selected Work —
  el enlace directo se mantiene.
- **Carga progresiva:** el fotograma del proyecto se precarga al entrar al beat
  3, no antes.

---

## 11. RISKS

| # | Riesgo | Mitigación |
|---|---|---|
| **R-1** | **El gato queda infantil** y choca con "dark luxury editorial". Un personaje caminando es lo más fácil de convertir en caricatura | El gato es SILUETA, nunca dibujo animado. Sin cara, sin expresión facial más allá de un punto. La dignidad la da la sobriedad |
| **R-2** | **La escena tapa el negocio.** El visitante disfruta y no llega a contactar | Medir con la analítica ya instalada: si el scroll a Work o los envíos del formulario BAJAN respecto a la línea base, la escena se recorta |
| **R-3** | **La costura con `BarajaCasos` se ve.** El acordeón espera cartas en lista | Prototipar la costura ANTES que el resto. Si no se puede hacer invisible, cambia el diseño del beat 7 |
| **R-4** | **Scroll secuestrado.** Una escena larga que no deja pasar | La sección tiene altura acotada y el usuario siempre puede saltar. Nunca `scroll-jacking` real |
| **R-5** | **Alcance.** Esto es semanas, no días, y compite con la regla 50/50 | Ver §13: se construye por etapas, cada una publicable sola |
| **R-6** | **El cristal a pantalla completa mata el rendimiento** en el beat 5 | Es la razón por la que el portal es CSS (B) y no depende del render target (A) |

---

## 12. OPEN QUESTIONS — necesitan decisión de Alejandro

1. **¿Cuánto scroll puede durar la escena?** ¿Dos pantallas, cuatro? Define
   cuántos beats caben y si el visitante impaciente llega a Work.
2. **¿El gato camina sobre algo?** ¿Suelo implícito, línea, nada? Define la
   composición de todos los beats.
3. **¿La escena aparece siempre o una vez por sesión** (como el sello)? Un
   visitante que vuelve tres veces puede odiarla a la tercera.
4. **¿MH Interior es el reveal definitivo** o es el primero de una rotación
   cuando haya más casos?
5. **¿Qué pasa con `/luna`?** El brief del gato y la luna sigue ACTIVE en el
   decision log. Esta escena es otra dirección para el mismo hero. **Hay que
   marcar una como SUPERSEDED** o quedan dos contratos vivos para lo mismo.
6. **¿Quién dibuja el gato de perfil?** Es el bloqueante #1 y es trabajo de
   diseño, no de código.

---

## 13. RECOMMENDED IMPLEMENTATION ORDER

Cada etapa es publicable por sí sola. Si el proyecto se detiene en cualquier
punto, lo construido sigue en pie y mejora el sitio.

| Etapa | Qué | Por qué en este orden |
|---|---|---|
| **0** | **Prototipar la costura del beat 7** (portal → primera carta) con un rectángulo de color en vez del cristal | Es el riesgo más alto y el más barato de probar. Si no se puede hacer invisible, todo lo demás cambia. **No se dibuja un solo gato antes de esto** |
| **1** | **Gato de perfil + rig** | Bloqueante de todo lo narrativo. Es diseño, corre en paralelo a la etapa 0 |
| **2** | **Portar `useGatoScrub` y montar los beats 0-2** (entrada, despertar, aproximación) sin cristal reactivo | Ya está resuelto en la rama luna. Entrega valor visible rápido |
| **3** | **Beat 3-4: contacto y respuesta del cristal** | Primer trabajo nuevo de WebGL. Solo escritorio |
| **4** | **Portal (mecanismo B) + reveal de MH** | Une la escena con el negocio |
| **5** | **Enriquecimiento A (refracción real) solo escritorio** | Opcional. Se hace si 0-4 quedaron sólidos |
| **6** | **Tier móvil y reduced-motion completos** | No al final por descuido: al final porque hasta acá no se sabía qué degradar |

**Antes de la etapa 0 hay que cerrar la pregunta 5 de §12.** Construir esto con
el brief de luna todavía ACTIVE es garantizar que uno de los dos se bote.
