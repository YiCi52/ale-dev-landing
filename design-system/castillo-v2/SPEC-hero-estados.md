# Hero — mapa de estados

> Borrador de trabajo. 2026-09-07. Sustituye al §3 de `SPEC-hero-escena.md`
> (que asumía un rig SVG dibujado a mano) porque el GATO C ya existe como
> modelo 3D riggeado y aprobado. El resto de aquel spec sigue vigente.

---

## 0. LA REGLA QUE NO SE ROMPE

Hay **un solo número**: `p ∈ [0,1]`, el progreso de la sección pegajosa.

```
p = progresoDe(section)     // ya existe, portado de la rama luna
```

Cada subsistema **lee** `p` y decide qué hacer. Ninguno le habla a otro.
Ninguno tiene tiempo propio ni duración propia. Si el visitante se detiene a
la mitad, todo queda a la mitad; si sube, todo retrocede.

La única excepción son los *loops de vida* —la deriva de la atmósfera, el
latido del cristal— que corren en su propio reloj porque no cuentan nada.

**Consecuencia práctica:** no hay "reproducir animación". No hay `play()`.
No hay estado interno que pueda desincronizarse. Un bug de sincronía es
imposible por construcción.

---

## 1. LOS OCHO ESTADOS

| # | nombre | rango de `p` | qué pasa |
|---|---|---|---|
| 0 | **ENTRADA** | 0.00 – 0.07 | El gato está sentado de frente, quieto. Nada se mueve salvo la cola. El titular manda. |
| 1 | **DESPERTAR** | 0.07 – 0.20 | Se levanta y gira a perfil. El titular empieza a ceder. |
| 2 | **CAMINATA** | 0.20 – 0.42 | Camina. El paso marca el ritmo de la escena. Entra una línea de contexto. |
| 3 | **ATENCIÓN** | 0.42 – 0.52 | Se detiene y gira la cabeza hacia el cristal. Primer momento sin texto. |
| 4 | **APROXIMACIÓN** | 0.52 – 0.64 | Se acerca. El cristal crece y su iridiscencia se agita. |
| 5 | **CONTACTO** | 0.64 – 0.77 | Se estira y toca. El cristal responde con un pulso desde el punto de contacto. |
| 6 | **RESPUESTA** | 0.77 – 0.89 | Retrocede medio paso. El cristal deja de ser objeto y empieza a ser superficie. |
| 7 | **UMBRAL** | 0.89 – 1.00 | El gato se sienta de espaldas, pequeño, mirando adentro. El cristal es portal: dentro se ve el proyecto. |

Los estados son **zonas, no saltos**. Todo interpola. El nombre existe para
hablar entre nosotros, no para que el código haga `if (estado === 3)`.

---

## 2. QUÉ HACE CADA SUBSISTEMA

### 2.1 Gato — secuencia horneada

**120 fotogramas** renderizados en Blender desde `GATOC-rig-v1-poses-v2.blend`,
con fondo transparente. Se dibujan en un `<canvas>` y el fotograma se elige
directamente de `p`:

```
frame = round(p × 119)
```

Patrón ya probado en `/lab/gatekeep` (cubo de hielo, 72 fotogramas):
esqueleto mientras baja el primero, respaldo al fotograma cargado más cercano
si el pedido aún no llegó, y estático bajo `prefers-reduced-motion`.

**Por qué horneado y no WebGL en vivo:** el facetado del GATO C solo es
correcto si sale de la geometría real. Un rig 2D lo haría viajar como
calcomanía, y un modelo vivo en el navegador cuesta 150 KB+ y no corre en
móvil. Horneando, las facetas siempre son correctas y el coste es una imagen.

**Cámara fija, gato en movimiento.** La cámara de Blender no se mueve en toda
la secuencia: quien se desplaza y gira es el gato, en el espacio del mundo.
La "evolución de cámara" que pide el guion la hace la página con transformes
CSS sobre el mismo `p`. Así el encuadre se puede reajustar sin volver a
renderizar 120 fotogramas.

### 2.2 Cristal / portal — vivo, no horneado

Sigue siendo `HeroCrystalMount` (el componente real, iridiscencia 0.45 + eje
lila). Lee `p` y deriva:

| magnitud | de `p` |
|---|---|
| escala y cercanía | crece de forma continua entre 0.07 y 0.77 |
| agitación de la iridiscencia | sube al acercarse el gato (0.52 – 0.64) |
| pulso de contacto | se dispara por proximidad a 0.70, no por un evento |
| transición objeto → superficie | 0.77 – 0.89 |
| apertura del portal | 0.89 – 1.00, máscara que crece desde la silueta |

**El pulso no es un evento.** Es una función de `p` con un pico en 0.70. Si el
visitante sube, el pulso se deshace. Un evento con `dispatch` se quedaría
disparado y rompería la reversibilidad.

### 2.3 Interacción gato ↔ portal

No hay colisión ni física. Hay **un número compartido**:

```
cercania(p) = suavizar(0, 1, (p - 0.52) / (0.64 - 0.52))   // 0 lejos, 1 tocando
```

El gato ya trae su parte horneada (se estira y toca en el fotograma correcto).
El cristal lee `cercania` y reacciona. Los dos derivan del mismo `p`, así que
están sincronizados sin hablarse. Eso es la "interacción".

### 2.4 Texto

DOM siempre, nunca dentro del canvas — SEO y lectores de pantalla.

| | aparece | desaparece |
|---|---|---|
| titular | 0.00 | 0.20 |
| línea de contexto | 0.24 | 0.42 |
| *(silencio)* | 0.42 | 0.89 |
| rótulo del caso | 0.92 | 1.00 |

El silencio entre 0.42 y 0.89 es deliberado: es el tramo donde la escena tiene
que sostenerse sola.

---

## 3. QUÉ ESTÁ HORNEADO Y QUÉ ESTÁ VIVO

| | horneado | vivo |
|---|---|---|
| gato | ✅ 120 fotogramas | |
| facetado y rim del gato | ✅ | |
| cristal | | ✅ R3F |
| atmósfera | | ✅ |
| composición (escala, posición) | | ✅ CSS sobre `p` |
| portal | | ✅ máscara CSS |
| texto | | ✅ DOM |

Regla: **se hornea lo que depende de la geometría; se deja vivo lo que depende
del encuadre.** Así iterar la puesta en escena no cuesta un render.

---

## 4. EL BEAT 7, RESUELTO POR PUESTA EN ESCENA

El sentado del GATO C solo se lee bien **de frente**; en perfil y en 3/4
trasero las patas traseras se abren. Está medido y documentado.

El beat 7 pide "silueta pequeña, de espaldas". Se resuelve sin volver a la
geometría:

1. **Tamaño.** A la escala del beat 7 el gato ocupa una fracción del alto de
   pantalla. Las patas dejan de ser legibles antes de ser un problema.
2. **Contraluz.** El gato queda contra el portal encendido: lo que se lee es
   el contorno, no la anatomía.
3. **Ángulo.** No de espaldas puras, sino unos 20° hacia el lado bueno.

Si aun así no convence, se recorta por composición. Nunca por cirugía.

---

## 5. LO QUE ESTE PROTOTIPO TIENE QUE DEMOSTRAR

No busca ser bonito. Busca responder tres preguntas:

1. ¿La secuencia **se siente como una sola escena** o como ocho animaciones
   pegadas?
2. ¿El gato **conduce** la atención hacia el cristal, o compiten?
3. ¿El scroll hacia arriba **deshace** la escena de forma creíble?

Si las tres son sí, se pule. Si alguna es no, se corrige el mapa antes de
escribir una línea de código de producción.

---

## 6. RIESGOS ANOTADOS

- **Peso.** 120 fotogramas con alfa. Hay que medirlo y decidir formato y
  resolución. Es el riesgo número uno del enfoque horneado.
- **Longitud del scroll.** Si la sección es muy larga, el visitante se cansa
  antes del portal. Si es corta, la escena se atropella.
- **Móvil.** El cristal ya está bajo gate de escritorio. Hay que decidir qué
  ve el móvil: ¿la secuencia del gato sin cristal, o una versión reducida?
- **El primer fotograma.** Hasta que baja, no hay gato. El esqueleto tiene que
  ser digno.
