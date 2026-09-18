# Hero — blueprint visual

> 2026-09-07. Cruza el video de referencia con el mapa de estados.
> Rige sobre `SPEC-hero-estados.md` (arquitectura) y `SPEC-hero-escena.md` (tesis).
> **No implementado.** Es la diana, no el código.

---

## 0. LA REFERENCIA, REGISTRADA

`~/Downloads/WhatsApp Video 2026-08-13 at 15.14.48 (3).mp4` — compilado de
**@seanaiux**, *"animations to make a 30k website"*, 25 s, vertical.
Copia original en `~/CastilloStudio/clientes/mari-mhinterior/referencias-v2/`.

Dos segmentos nos importan. Se anotan aquí porque este archivo se perdió una vez
y costó media sesión encontrarlo.

### Mecánica A · PARTICLE TRANSFORMATION `t 11.0 → 13.0`

Un terrón de azúcar, entero y pequeño, sobre una página limpia. Al avanzar el
scroll sus bordes se deshacen, estalla en una nube de granos cristalinos, y la
cámara **termina dentro** de lo que el objeto estaba hecho. Al final ya no hay
objeto: hay un paisaje de material a contraluz, y el texto vuelve.

**El principio:** las partículas no salen del objeto — **son** el objeto. Y la
desintegración es también una aproximación: la escala se invierte y la cosa se
convierte en lugar.

### Mecánica B · SPACE TRANSITION `t 13.3 → 16.8`

Una rendija oscura sobre negro. Se abre en un estallido de luz sobreexpuesto que
destruye el detalle. La luz cede, y lo que queda es un **iris** azul, fibroso,
con pupila oscura. El iris deja de ser objeto y pasa a ser la imagen de fondo de
una web normal. La interfaz se ensambla encima. El titular completa.

**El principio:** no se atraviesa nada. **El objeto se abre y tú llegas.** Y el
espectáculo resuelve en calma y utilidad — que es exactamente la tesis del hero:
*la escena termina entregando, no impresionando*.

### Lo que NO copiamos

- El azúcar y el ojo azul son de otras marcas. Copiamos la gramática, no el arte.
- El zoom continuo hacia el infinito: nuestro scroll tiene ocho beats, no uno.
- El estallido sobreexpuesto a pleno blanco: nuestra paleta es carbón y lila.
  El bloom se hace en lila, no en blanco puro.

---

## 1. LA IDEA CENTRAL

La referencia resuelve su portal con **un ojo**.

Lo único luminoso de nuestro gato es **un iris violeta con pupila vertical**. Ya
existe, ya está aprobado, ya está horneado en textura de 1024².

Así que el portal no es el cristal creciendo. Es esto:

> El gato toca el cristal. El cristal se deshace en su propia materia (mecánica A).
> Dentro de esa materia, lo que se re-forma es **un iris**. Su pupila vertical se
> abre (mecánica B) y eso es el umbral.

Por qué no es decoración:

Castillo vende que el trabajo del cliente **sea visto**. Si el umbral es un ojo,
el mecanismo carga el argumento comercial sin que nadie lo escriba. El gato mira,
se acerca, toca — y lo que se abre es su forma de ver.

Es la diferencia entre copiar la referencia y entenderla.

---

## 2. BEAT POR BEAT

| beat | `p` | gato | cristal / materia | atmósfera | texto |
|---|---|---|---|---|---|
| **0 ENTRADA** | 0.00–0.07 | sentado de frente, quieto, en el tercio izquierdo. No compite con el titular | un punto de luz lejano, arriba a la derecha. Casi nada | tres planos con niebla; el fondo apenas se mueve | titular, peso máximo |
| **1 DESPERTAR** | 0.07–0.20 | se levanta, gira a perfil | el punto crece despacio, sin llamar la atención | el plano medio empieza a desplazarse | titular cede |
| **2 CAMINATA** | 0.20–0.42 | camina; el paso marca el ritmo | ya es una forma facetada, aún lejos | paralaje pleno: el suelo pasa más rápido que el fondo | una línea de contexto |
| **3 ATENCIÓN** | 0.42–0.52 | se detiene, gira la cabeza | primera reacción: una lenta rotación se detiene, como si notara | la niebla se aclara entre los dos | silencio |
| **4 APROXIMACIÓN** | 0.52–0.64 | avanza; la nariz se adelanta | crece y baja a la línea de la nariz. La iridiscencia se agita | el aire entre gato y cristal se carga; primeras motas | silencio |
| **5 CONTACTO** | 0.64–0.77 | **nariz contra el borde** | **empieza la mecánica A** desde el punto tocado: las facetas se sueltan | las motas nacen del contacto, no antes | silencio |
| **6 RESPUESTA** | 0.77–0.89 | retrocede medio paso, se sienta a mirar | deja de ser objeto: la materia se reorganiza y **nos metemos dentro** | ya no hay fondo: estamos en el material | silencio |
| **7 UMBRAL** | 0.89–1.00 | silueta pequeña a contraluz, de espaldas | dentro de la materia se re-forma **el iris**; la pupila vertical se abre (mecánica B) | el bloom lila destruye el detalle un instante | rótulo del caso |

**Después de 1.00:** llegamos. La siguiente sección se ensambla encima, en calma.

---

## 3. LAS PARTÍCULAS TIENEN CAUSA

Nunca hay partículas ambientales. La cadena es:

```
proximidad (p 0.52→0.64)  →  el aire se carga: unas pocas motas, quietas
contacto   (p 0.64→0.77)  →  nacen DEL PUNTO tocado; el cristal las cede
respuesta  (p 0.77→0.89)  →  son la materia entera; la escala se invierte
umbral     (p 0.89→1.00)  →  se re-organizan en el iris
```

Todo derivado de `p`. Subir el scroll las devuelve al cristal. No hay emisor con
vida propia, no hay `play()`, no hay semilla aleatoria por fotograma.

---

## 4. REPARTO DE HERRAMIENTAS

### Blender — lo que exige consistencia entre fotogramas

- La **desintegración del cristal** (beats 5-6). Cell fracture + simulación,
  horneada. Es geometría con continuidad: a mano es imposible que las facetas se
  suelten igual dos veces.
- El **iris que se re-forma** y la apertura de la pupila (beat 7), usando la
  textura de iris ya aprobada.
- Cualquier movimiento de cámara que deba casar con los 120 fotogramas del gato.

### Higgsfield — dirección, atmósfera y timing. Salida = diana, nunca asset

- **Cómo se ve nuestro cristal al deshacerse.** ¿Esquirlas de vidrio? ¿Polvo
  violeta? ¿Luz? Esta es la pregunta más cara de responder a mano y la más
  barata de explorar generando. **Es la primera generación que vale la pena.**
- **Atmósfera de estar dentro del material** (beat 6).
- **Timing del contacto**: cuánto duda el gato antes de tocar.
- **El bloom de la pupila** (beat 7): cuánta luz, cuánto tiempo, qué color.

### Web — composición e interacción

- El único `p`, Lenis, `progresoDe`.
- Los 120 fotogramas del gato, anclados por la nariz.
- El cristal **vivo** en los beats 0-5.
- **El relevo**: cristal vivo → secuencia horneada de desintegración.
- La máscara final y el ensamblado de la sección siguiente.
- Texto, siempre DOM.

---

## 5. QUÉ SE CONSERVA Y QUÉ SE REHACE

| | |
|---|---|
| **Conservar** | arquitectura de un solo `p` · Lenis + `progresoDe` · 120 fotogramas del gato · anclaje por la nariz · el cristal vivo para 0-5 · los rangos del mapa de estados |
| **Rehacer** | beats 6 y 7 enteros (hoy son una máscara radial sobre un degradado) · la atmósfera, que es plana y necesita tres planos · ENTRADA, donde el gato queda de mancha tras el titular |
| **Construir** | partículas con causa · la desintegración · el iris-umbral · el relevo vivo→horneado |

---

## 6. EL RIESGO PRINCIPAL

**El relevo entre el cristal vivo y la secuencia horneada.**

Hasta `p 0.77` el cristal es R3F y reacciona al cursor. A partir de ahí tiene que
ser Blender, porque desintegrarse exige consistencia. Ese cambio de sistema tiene
que ser invisible.

Mitigación: que el relevo ocurra **cuando el bloom del contacto tapa la escena**.
Un fotograma de luz oculta el corte. Es el mismo truco que un corte de montaje
sobre un flash.

Si no se consigue, la alternativa es hornear el cristal desde el beat 4 y perder
la reacción al cursor en la aproximación. Sería una pérdida aceptable: en ese
tramo el visitante mira al gato, no al cursor.

---

## 7. LO QUE ESTE BLUEPRINT NO RESUELVE

- **Móvil.** El cristal vivo no existe ahí. La secuencia horneada sí. Habrá que
  decidir si el móvil ve una versión con menos beats o la misma sin R3F.
- **Peso.** Sumar una segunda secuencia horneada al 1,9 MB del gato exige medir
  antes de aceptar.
- **Longitud del scroll.** Ocho beats en 700svh puede quedarse corto ahora que
  los beats 6-7 tienen contenido real.
