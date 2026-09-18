# GATO C — Especificación de producción del personaje
> Borrador para aprobación. 2026-08-30. NO implementado. El gato actual sigue en pie.
> Dirección aprobada: **abstracto geométrico facetado**, model sheet v2.0 (referencia
> conceptual, NO asset). Rige bajo MASTER.md y SPEC-hero-escena.md.

---

## 0. LA DECISIÓN QUE HAY QUE TOMAR PRIMERO

El model sheet son **renders 3D**: sombreado continuo, reflejos suaves, rim light.
Un SVG plano no llega ahí. Y hay una tensión estructural:

> **Facetado consistente** y **rig por piezas en 2D** se contradicen fuera de un
> rango corto. Al rotar una pata en SVG, sus facetas viajan como calcomanía: la
> forma deja de ser creíble porque el facetado promete una geometría 3D que el
> plano no sostiene.

Tres pipelines posibles:

| | Cómo | Fidelidad al sheet | Animación | Peso | Móvil |
|---|---|---|---|---|---|
| **A · SVG dibujado a mano** | Cada vista se ilustra facetada; el rig mueve piezas | Media — se lee más plano | Continua y libre | ~15-30 KB | ✅ |
| **B · 3D vivo (Three.js)** | Modelo low-poly en el navegador | Alta | Total | ~150 KB+ | ❌ No existe |
| **C · 3D como fuente, SVG cosechado** ⭐ | Se modela UNA vez en Blender; de ahí se exportan vistas y poses a SVG facetado | **Alta** — las facetas siempre correctas porque salen de geometría real | Por poses + interpolación acotada | ~20-40 KB | ✅ |

**Recomiendo C.** Modelar una vez resuelve el problema de coherencia del facetado
(ninguna faceta se inventa), mantiene el entregable como vector ligero que corre
en móvil, y encaja con el pipeline Blender ya validado en el BRAIN. El costo es
que la animación deja de ser 100% libre y pasa a ser **poses + interpolación**.

Todo lo que sigue asume **C**, y está escrito para que sirva igual si eliges A.

---

## 1. ANATOMÍA FINAL

Proporciones felinas reales, estilizadas. Unidad canónica: **C = largo de la
cabeza** (de nariz a nuca).

| Medida | Valor | Nota |
|---|---|---|
| Cabeza (largo) | 1,00 C | Referencia de todo |
| Cabeza (alto, sin orejas) | 0,80 C | Cuña, no esfera |
| Oreja (alto) | 0,55 C | Triángulo con punta apenas roma — ADN heredado del gato actual |
| Cuello | 0,45 C | Corto; permite girar la cabeza sin romper la silueta |
| Cuerpo (largo, hombro a cadera) | 2,40 C | |
| Cuerpo (alto en el pecho) | 1,05 C | Pecho más alto que cadera: da porte |
| Pata delantera | 1,70 C | |
| Pata trasera | 1,85 C | Más larga y con el quiebre del corvejón: es lo que hace felino el andar |
| Cola | 2,20 C | Tres segmentos decrecientes: 45% / 35% / 20% |
| **Alto total sentado** | **3,10 C** | Silueta del sello |
| **Largo total de perfil** | **4,00 C** (sin cola) | |

**Presupuesto de facetas:** 70-110 polígonos por vista. Menos de 70 se lee tosco;
más de 110 no aporta a las escalas de uso y engorda el archivo.

**Regla de las facetas:** grandes en el cuerpo, medianas en la cabeza, mínimas en
las patas. El detalle vive donde el ojo va — cabeza y lomo.

---

## 2. VISTAS

| Vista | Uso narrativo | Prioridad |
|---|---|---|
| **Perfil** (izquierda canónica; derecha por `scaleX(-1)`) | Beats 1-3: caminar, detenerse, tocar | 🔴 Bloqueante |
| **Frontal sentado** | Beat 0 y el sello | 🟡 Existe una versión; se rehace en el lenguaje nuevo |
| **3/4 trasero** | Beat 5: mirar hacia el portal | 🟠 |

**Solo tres vistas, y no se interpolan entre sí.** Pasar de perfil a 3/4 trasero
es un **corte**, cubierto por el momento narrativo (el gato se sienta y gira
mientras el cristal captura la atención). Interpolar vistas en 2D es justo donde
el facetado se rompe.

---

## 3. POSES

Ocho, agrupadas por vista. Cada una es un estado exportado; los intermedios se
interpolan solo dentro de su grupo.

| # | Pose | Vista | Función | Interpola con |
|---|---|---|---|---|
| 1 | **Sentado** | Frontal | Reposo del beat 0 | — (estado ancla) |
| 2 | **Caminar A** (contacto) | Perfil | Ciclo | 3 |
| 3 | **Caminar B** (suspensión) | Perfil | Ciclo | 2 |
| 4 | **Detenerse** | Perfil | Frena y alza la cabeza | 2, 3, 5 |
| 5 | **Estirarse** | Perfil | Prepara el contacto | 4, 6 |
| 6 | **Contacto con el cristal** | Perfil | Pata extendida, toca | 5, 7 |
| 7 | **Retroceso** | Perfil | Medio paso atrás | 6 |
| 8 | **Mirar el portal** | 3/4 trasero | Sentado de espaldas | — (estado ancla) |

**El ciclo de caminata son solo dos poses (2↔3).** Con interpolación y un bob
vertical mínimo alcanza; cuatro fases es sobre-producción para una silueta.

---

## 4. PIEZAS DEL RIG

Diez grupos. Cada uno es un `<g>` con `id` y `transform-origin` propio.

| Pieza | Hijos | Por qué separada |
|---|---|---|
| `cabeza` | `oreja-izq`, `oreja-der`, `ojo` | Gira para mirar; las orejas se orientan solas |
| `oreja-izq` / `oreja-der` | — | Se inclinan hacia atrás en el contacto (alerta) |
| `cuello` | — | Absorbe el giro de la cabeza sin quebrar el pecho |
| `cuerpo` | — | Ancla de todo; respiración por escala mínima |
| `pata-del-izq` / `pata-del-der` | — | Paso y extensión al tocar |
| `pata-tra-izq` / `pata-tra-der` | — | Paso e impulso |
| `cola-1` / `cola-2` / `cola-3` | encadenados | Latigazo con retardo: cada segmento sigue al anterior |

**La cola es el único elemento que se mueve fuera del scroll.** Es lo que
mantiene al gato vivo cuando está quieto. Ya existe ese principio en el gato
actual (`.cat-tail`) y se conserva.

---

## 5. TRANSFORM ORIGINS

Expresados en la unidad C, medidos desde el punto de anclaje de la pieza al padre.

| Pieza | Origin | Rango útil |
|---|---|---|
| `cabeza` | Base del cráneo, unión con el cuello | ±18° |
| `oreja-*` | Base de la oreja, donde nace del cráneo | ±25° |
| `cuello` | Unión con el pecho | ±12° |
| `cuerpo` | Centro de masa: 1,1 C detrás del pecho | escala 0,99-1,01 (respiración) |
| `pata-del-*` | Articulación del hombro | ±28° |
| `pata-tra-*` | Articulación de la cadera | ±32° |
| `cola-1` | Base, unión con la cadera | ±30° |
| `cola-2` | Extremo de `cola-1` | ±35° |
| `cola-3` | Extremo de `cola-2` | ±40° |

**Fuera de esos rangos el facetado se rompe** y hay que cambiar de pose exportada
en vez de seguir rotando. Los rangos son el contrato, no una sugerencia.

---

## 6. QUÉ COMPARTE ESTRUCTURA

- **Patas izquierda y derecha del mismo par**: misma geometría, distinto tono. La
  del lado lejano va un escalón más oscura — así se lee profundidad sin dibujar
  dos veces, y el archivo no crece.
- **Perfil izquierdo y derecho**: un solo asset, espejado con `scaleX(-1)`. El
  gato es simétrico a propósito para que esto sea gratis.
- **Cabeza entre perfil y 3/4 trasero**: NO se comparte. Son ángulos distintos y
  forzar la reutilización es exactamente donde el facetado delata el truco.
- **Los tres segmentos de cola**: misma forma, escalada al 100/75/50%.

---

## 7. SILUETA RECONOCIBLE — la escalera de simplificación

El sheet exige legibilidad de 192px a 16px. Un facetado de 90 polígonos a 16px es
ruido. Se resuelve con **tres niveles del mismo asset**, no con tres dibujos:

| Escala | Nivel | Qué se ve |
|---|---|---|
| ≥ 96px | **Completo** | Todas las facetas, rim light, sombra de contacto |
| 48-95px | **Reducido** | Facetas fusionadas por zona (~30 polígonos). Sin rim light |
| ≤ 32px | **Silueta** | Un solo path lleno. Sin facetas |

**El nivel silueta es el que define la identidad.** Si a 16px no se reconoce como
gato, el diseño falló, por bonito que sea a 192px. La prueba se hace primero en
silueta y después se le agregan facetas — nunca al revés.

Los tres invariantes que hacen al gato reconocible en silueta: **las dos cuñas de
las orejas**, **la línea del lomo que cae del pecho a la cadera**, y **la curva de
la cola**. Cualquier pose debe preservar los tres.

---

## 8. DISTINCIÓN MATERIAL FRENTE AL CRISTAL

El sheet lo pide y aquí se vuelve operativo. Son opuestos en cinco ejes:

| | GATO | CRISTAL |
|---|---|---|
| Comportamiento de la luz | **Absorbe** | Transmite y refracta |
| Base | Negro mate `#0B0B0F` | Translúcido |
| Iridiscencia | **Ninguna** | 0.45 |
| Tamaño de faceta | **Grandes, pocas** (70-110) | Pequeñas, muchas |
| Contraste entre aristas | **Bajo: ΔL ≤ 8%** entre facetas vecinas | Alto, con destellos |

**La regla dura:** *las aristas del gato nunca compiten con las del cristal.* En
la práctica significa que las facetas del gato se distinguen por sombra, no por
línea — **no hay `stroke` en el cuerpo**. El único lila que toca al gato es el
**rim light**, y solo para despegarlo del fondo: un borde de 1-2px en
`#5B4A96` a baja opacidad sobre el canto que mira a la luz.

Nunca colores claros en el cuerpo. `#F6F2FF` y `#CBBCFF` son del cristal.

---

## 9. QUÉ DEBE SER VECTOR PROPIO

**Todo el personaje.** El gato es marca, no decoración: vive en el sello, en el
favicon y en el hero. No puede depender de un servicio externo ni de una
generación irrepetible.

| Elemento | Formato | Dónde vive |
|---|---|---|
| Las 3 vistas × 8 poses | **SVG** (facetas como `<path>` con `fill`) | `src/components/ui/gato/` |
| Modelo fuente low-poly | `.blend` | `design-system/castillo-v2/gato-c/` |
| Niveles de simplificación | SVG, tres archivos por vista | junto a las vistas |
| Sombra de contacto | Elipse difusa, CSS | no es asset |

El `.blend` **se versiona en el repo**. Es la fuente de verdad: si mañana hace
falta una pose nueva, se exporta, no se redibuja.

---

## 10. REFERENCIAS DE MOVIMIENTO CON HIGGSFIELD — después, y acotado

Higgsfield **no dibuja el gato**. Sirve para responder preguntas de *timing* que
son caras de iterar a mano, y sus salidas se traducen a poses, nunca se importan.

| Qué generar | Qué pregunta responde | Por qué no lo da el stack |
|---|---|---|
| Un felino real caminando de perfil, cámara fija | ¿Cuántos cuadros dura un paso y cómo se reparte el peso? | El timing felino es lo más difícil de acertar por intuición |
| Un gato deteniéndose y alzando la cabeza | ¿Cuánto dura la duda antes de tocar? | Ese titubeo es el corazón del beat 3 |
| Un gato estirándose | ¿Cómo se encadenan lomo, hombro y pata? | Encadenamiento difícil de imaginar |
| Un gato sentándose y girando la cabeza | ¿Cómo se resuelve el corte perfil → 3/4 trasero? | Es la costura más frágil del personaje |

**Protocolo:** se generan como **referencia de video**, se extraen los cuadros
clave, se miden los tiempos, y las poses se **redibujan** sobre el modelo propio.
Nada de lo que salga de Higgsfield entra al repo.

---

## RIESGOS

| # | Riesgo | Mitigación |
|---|---|---|
| **G-1** | **El SVG se ve más plano que el sheet** y decepciona contra la referencia | Nombrarlo antes de dibujar: el sheet es dirección, no destino. Validar el primer perfil contra el sheet ANTES de producir las 8 poses |
| **G-2** | El facetado se rompe al animar | Los rangos del §5 son contrato. Fuera de rango se cambia de pose, no se sigue rotando |
| **G-3** | A 16px no se reconoce | Diseñar primero la silueta (§7) y agregar facetas después |
| **G-4** | Compite con el cristal | Las cinco reglas del §8, verificadas con los dos juntos en pantalla |
| **G-5** | Producir 3 vistas × 8 poses × 3 niveles es mucho trabajo | Se produce en orden narrativo: perfil caminando primero, y solo cuando ese funciona en la escena se hace el resto |

## ORDEN DE PRODUCCIÓN

1. **Modelo low-poly en Blender** — una sola malla, sin rig todavía
2. **Perfil, pose caminar A, nivel completo** — el asset de prueba
3. **Validarlo en la escena real** (etapa 0 ya construida, sustituyendo el círculo)
4. Si convence: caminar B + detenerse + los tres niveles del perfil
5. Estirarse, contacto, retroceso
6. Frontal sentado (y con él, el sello nuevo)
7. 3/4 trasero
8. Referencias Higgsfield para afinar tiempos — al final, no al principio

## PREGUNTAS ABIERTAS

1. **¿El gato tiene ojo visible?** El sheet lo insinúa. Un punto cambia mucho la
   personalidad: con ojo mira, sin ojo es una presencia. Afecta a las 3 vistas.
2. **¿El sello del header cambia también?** Hoy usa el gato viejo. Si cambia, hay
   que rehacer la secuencia animada del sello, que es trabajo aparte.
3. **¿Quién modela el `.blend`?** Es la primera pieza del orden de producción y
   requiere Blender, no código.
