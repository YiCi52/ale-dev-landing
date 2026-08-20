# Villa Savoye — planta del piso nobile · FUENTE ÚNICA DE VERDAD

> Levantada el 20-ago-2026 del **dibujo original de Le Corbusier** (plancha de los tres
> niveles, vía ArchEyes). Este documento manda sobre el código: si `villaModel.ts` y esto
> no coinciden, el que está mal es el código.
>
> **Por qué existe**: los primeros dos días se construyó geometría primero y se le
> retrofiteó una planta después. Cada capa peleaba con la anterior — el recorrido
> atravesaba muros, los muebles caían donde pasaba la cámara, y dos ambientes quedaron
> vacíos sin que nadie lo notara. El orden correcto está al final, en **MÉTODO**.

## 1. Sistema de referencia

Ejes de three.js: **X crece al ESTE · Z crece al SUR · Y es altura**. Origen en el centro
de la huella. Cotas en metros.

| Dato | Valor | Origen |
|---|---|---|
| Huella | **19.0 × 21.25 m** | trama 4×4 de 4.75 + voladizos de 1.125 en un eje |
| Trama estructural | 4.75 m | documentada (sistema Dom-ino) |
| X | −9.5 … +9.5 | |
| Z | −10.625 … +10.625 | |
| Piso del nobile | Y = 3.625 | se conserva del modelo actual |
| Altura libre | ~2.9 m (muros de Y=3.60 a Y=6.55) | se conserva |
| Espesor de muro interior | 0.15 | |
| Espesor de fachada | 0.19 | ladrillo 0.16 + revoque |

**Verificación de la lectura**: midiendo el dibujo contra la trama, el edificio da el mismo
factor de escala en las dos direcciones (59.4 px/m), y la SALLE resulta de **83.6 m²**
contra los ~86 m² documentados. Un 3% de error sobre un escaneo de 30 px/m: la lectura
proporcional es fiable. **Las cotas escritas del dibujo NO son legibles a esta resolución** —
todo lo de abajo es lectura proporcional, no transcripción. Si aparece un plano acotado
mejor, este documento se corrige.

## 2. Los recintos

Coordenadas del **rectángulo interior** de cada uno, en el sistema del modelo.

| Recinto | X desde … hasta | Z desde … hasta | Área aprox. |
|---|---|---|---|
| **SALLE** (salón) | −4.79 … +9.50 | +4.78 … +10.63 | 83.6 m² |
| **CUISINE + OFFICE** | −9.50 … −4.79 | +4.78 … +10.63 | 27.6 m² |
| **TERRASSE** (jardín suspendido, a cielo abierto) | +0.10 … +9.50 | −4.83 … +4.78 | 90 m² |
| **ABRI** (kiosco cubierto) | +4.47 … +9.50 | −10.63 … −4.83 | 29 m² |
| **BOUDOIR** | +1.36 … +4.47 | −10.63 … −4.83 | 18 m² |
| **RAMPA** (banda que sube) | −1.50 … +0.10 | −7.00 … +4.78 | — |
| **CHAMBRE 1** (esquina) | −9.50 … −5.12 | −10.63 … −4.99 | 24.7 m² |
| **CHAMBRE 2** | −5.12 … +1.36 | −10.63 … −6.17 | 28.9 m² |
| **NÚCLEO HÚMEDO** (bains · toilette · wc) | −5.12 … −1.50 | −6.17 … −0.28 | 21.3 m² |
| **CHAMBRE 3** | −9.50 … −5.12 | −4.99 … +1.92 | 30.3 m² |
| **TERRASSE DE SERVICIO** (abierta) | −9.50 … −5.12 | +1.92 … +4.78 | 12.5 m² |

**Los cuatro núcleos húmedos** de la casa real caben dentro del NÚCLEO HÚMEDO más el baño
de Madame, que se resuelve como subdivisión interna de esa bolsa. No se modelan como cuatro
recintos independientes: **desde el recorrido no se ven** (ver §4).

## 3. Adyacencias que dan carácter (no son detalle: son el proyecto)

- La **SALLE abre a la TERRASSE** por el panel corredizo — es el gesto central de la casa.
  Va en Z = +4.78, entre X = +0.10 y +9.50. Sin ese panel la casa no es la casa.
- La **CUISINE toca la SALLE** por su lado oeste, con el office de filtro.
- La **RAMPA** sube por la banda central y desemboca junto a la terraza, no dentro del salón.
- El **BOUDOIR** mira al ABRI; los dos forman el remate norte.
- Los **CHAMBRES envuelven el cuadrante noroeste**, con el núcleo húmedo hacia adentro.

## 4. Visibilidad — qué se modela con detalle y qué no

Medido sobre el recorrido anterior: **cocina y dormitorios tuvieron 0% de visibilidad** en
toda la promenade. La regla que sale de ahí:

- **Se ve** ⇒ geometría y muebles cuidados: SALLE, TERRASSE, la rampa, el paso a la cocina.
- **No se ve** ⇒ solo el volumen y el muro, sin muebles descargados. Un mueble que nadie
  mira cuesta kilobytes y no aporta.
- La excepción es el **desarme**, donde se ve la placa entera desde afuera: ahí lo que
  importa son los MUROS, no lo que hay dentro.

## 5. Lo que hay que rehacer con esta planta

1. `villaModel.ts` — huella 19.0 × 21.25 y los muros de §2. Hoy es un cuadrado de 20.
2. `promenadeRig.ts` — el recorrido entero. La curva actual se trazó sobre la planta vieja.
3. `muebles.ts` — el amoblado ya resuelto por ambientes se recalcula sobre los recintos nuevos.
4. `check-villa-tour.mjs` y `check-villa-muebles.mjs` — los AABB salen de §2.
5. El bake se rehace al final, cuando la geometría esté congelada.

---

# MÉTODO — el orden correcto, para el próximo proyecto

> Escrito el 20-ago-2026 después de perder dos días construyendo al revés. Aplica a
> cualquier edificio real que se quiera hacer interactivo — el siguiente es una estructura
> japonesa.

**0. Conseguir el dibujo ANTES de escribir código.** Plano acotado, secciones, y las
medidas de la trama. Si no aparece un plano fiable, ese es el proyecto: conseguirlo. Nada
de "empiezo con cajas y después ajusto" — ajustar después es rehacer.

**1. Escribir el documento de planta** (esto, un `PLANTA.md`). Recintos con coordenadas,
adyacencias, y la verificación de que la lectura cierra contra un dato independiente
(acá: el área de la salle contra la fuente). **El documento manda sobre el código.**

**2. Decidir qué se ve y qué no** antes de modelar. Ahorra la mitad del trabajo y evita
amoblar cuartos que nadie visita.

**3. Muros y volumen.** Solo entonces. Y se congela.

**4. El recorrido, sobre la planta terminada.** Con verificador automático desde el primer
waypoint, y que el verificador mire **muros Y muebles** — el nuestro solo miraba muros y por
eso daba "0 colisiones" mientras la cámara atravesaba media casa.

**5. Los muebles, con holgura calculada contra el recorrido ya fijo.** Y verificando la
ESCALA real del asset: una "planta" de Poly Haven resultó medir 17 × 27 cm y se leía como
basura flotando en un salón de 10 × 13 m.

**6. Luz y materiales al final**, cuando nada más se va a mover.

**La regla que resume todo**: cada capa se apoya en la anterior, así que una capa que
cambia obliga a rehacer las de arriba. Por eso el orden no es burocracia — es lo que
decide si el proyecto converge o gira en círculos.
