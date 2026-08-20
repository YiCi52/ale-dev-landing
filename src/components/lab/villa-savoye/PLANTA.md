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

---

# MATERIA Y COLOR — leído de las fotos reales (20-ago-2026)

> Fuente: fotografías del interior en ArchEyes + la elevación original de la Fondation
> Le Corbusier (lámina **FLC 19704**). Alejandro señaló que la página tenía "desde los
> muebles hasta las plantas" y tenía razón: esto no se deduce de un plano.

## ⚠️ LA CASA NO ES BLANCA POR DENTRO

Es el hallazgo que más cambia la pieza, y cuesta casi nada: son colores de material.
Le Corbusier aplicó **polychromie architecturale** en el nobile:

- **Muro del salón: ROSA TERRACOTA**, un paño entero. No un acento: la pared completa.
- **Otro paño AZUL/turquesa** junto a la vidriera.
- **Piso de baldosa OCRE claro** en el área principal — ya corregido en el modelo —
  y un **cambio a baldosa CAFÉ OSCURO** cerca del vidrio, como umbral. Son dos
  materiales de piso, no uno.
- Cielorraso claro, y una **viga/ducto pintado de NEGRO** que cruza en diagonal.

Hoy el modelo es hueso y blanco en todo. Pintar esos dos paños es la mejora de mayor
retorno por hora de todo el proyecto.

## Los muebles reales (y por qué los nuestros están mal)

Las fotos muestran **mobiliario de Le Corbusier/Perriand**, no piezas mid-century de madera:

- **LC4** — la chaise longue negra de cuero con estructura cromada. Es LA pieza.
- **LC2** — sillones cúbicos de cuero **cognac / rojo óxido** con marco de tubo cromado.
  En las fotos hay dos o tres en una sala enorme: **la densidad correcta es muy baja**.
- Bajo la cinta de ventanas corre un **radiador de rejilla horizontal a todo lo largo**.
  Ese detalle solo lee "esta casa" de inmediato y es geometría barata.

Nuestro `mid_century_lounge_chair` y el `dining_table` con mantel a cuadros no tienen
nada que ver. **Buscar LC2/LC4 en Sketchfab CC0** antes de seguir con Poly Haven.

## La terraza

- **Jardineras de HORMIGÓN blanco, empotradas** — no cajones de madera rústicos.
  Con arbustos bajos tipo lavanda.
- **Pavimento de losas grandes de hormigón** en retícula, distinto del piso interior.
- La rampa exterior con **baranda de tubo metálico delgado, horizontal**.

## Un detalle de estructura que sí verifiqué

Un **piloti redondo queda DENTRO de la línea del vidrio** de la vidriera al jardín: la
columna atraviesa el plano acristalado en vez de esconderse en un muro. Es la fachada
libre hecha visible, y hoy no lo tenemos.

**La cinta de ventanas está BIEN**: 1.20 m de alto sobre antepecho de 0.55, lo que da
~37% de la banda — coincide con la proporción medida en la elevación FLC 19704.
(Corrige un dato erróneo que circuló en el análisis del 19-ago, donde se dijo 0.30 m.)

## La planta baja — resuelto con el plano original (20-ago)

Pasé por dos lecturas equivocadas antes de mirar el documento bueno: primero dije "no es
un cilindro" (falso), después "cilindro Y plano en lados opuestos" (impreciso). **El plano
del rez-de-chaussée de la misma lámina lo zanja:**

- El vestíbulo es una **HERRADURA acristalada** — un arco de más de 180° que arranca al
  oeste, barre por el sur y sube por el este. Sigue el radio de giro del automóvil, con
  **tres autos dibujados dentro del arco**. Es la forma dominante del nivel, no un detalle.
- El único bloque de **muros rectos** es el de servicio, arrinconado en la esquina noroeste:
  **LINGERIE · dos CHAMBRE · WC**. Eso es lo que se ve como fachada plana con persiana en
  las fotos de aproximación, con la curva perdiéndose por los dos extremos.
- La **rampa** cruza el centro y la **escalera helicoidal** queda al oeste del vestíbulo.

⇒ En planta: **herradura acristalada + un bloque rectangular de servicio en una esquina.**
Las dos cosas conviven, pero la que manda es la curva.

**Qué corregir en el modelo**: hoy es un tambor de radio **4.3** — el arco real es bastante
mayor (barre más de la mitad del ancho de la huella) y es una **U abierta** donde encuentra
el bloque de servicio, no un cilindro cerrado con una muesca. Y falta el bloque recto.

**Qué NO tocar**: el tambor acristalado con montantes verticales, el verde (`VERDE_RDC`
0x3f5c48) y la carpintería café de la cinta. Los tres verificados contra fotos.

**Por qué la duda era legítima** (y vale para la pieza): la planta baja está **retranqueada
y pintada de verde oscuro**, así que desde lejos desaparece detrás de los pilotis y la caja
blanca parece flotar sola. Ese es justamente el efecto que buscaba Le Corbusier — si en
nuestro modelo el nivel bajo se ve demasiado, perdemos el gesto.

## 6b. TERCER NIVEL — solárium y cubierta (leído 20-ago, tras la regla de Alejandro)

> **Casi construyo sin haber mirado este plano.** La lámina trae TRES niveles y yo solo
> había abierto dos. Ver L-027: contar los niveles y confirmar un plano por cada uno ANTES
> de modelar.

- **SOLÁRIUM**: no es "toda la cubierta". Es un recinto pavimentado **acotado por una
  pantalla curva** que barre desde el oeste. Tiene límites, no es un plano libre.
- **HAY DOS PANTALLAS CURVAS**: la del solárium y una segunda al sureste. ✅ El modelo YA
  las tiene (`sol1` r=4.6 y `sol2` r=3.1) — lo afirmé al revés sin mirar el código, otra
  vez el mismo error de asegurar sin verificar. Solo hay que reubicarlas sobre la planta nueva.
- **DOS "VIDE"** (vacíos): huecos reales en la losa de cubierta que dejan ver la terraza de
  abajo — uno grande al este y otro menor al oeste. Nuestro recorte de techo corresponde
  al grande; **el pequeño no existe en el modelo**.
- La **rampa** remata arriba con su propio cerramiento, y la **escalera helicoidal**
  desemboca junto al solárium.
- Cuadraditos sueltos rotulados "L." repartidos por la cubierta: luminarias o maceteros.

## 7. Verificación contra fotos — paso formal, no opcional

La lección detrás de este error: los tres hallazgos de hoy (la casa no es blanca, los
muebles son LC, la planta baja no es un cilindro) **no salieron del plano**. Salieron de
mirar fotos, y salieron porque Alejandro insistió, no porque el proceso las buscara.

**Se agrega como paso 3b del MÉTODO**: con el volumen levantado y antes de seguir, comparar
el modelo contra fotos **de cada fachada y de cada ambiente visible**, elemento por elemento
— forma en planta, color, material, carpintería, mobiliario, vegetación. Lista escrita, no
vistazo. Es más barato mirar diez fotos que rehacer una capa.
