# Villa Savoye · pasada de fidelidad (29-sep-2026)

**Qué se comparó**
- **Las fotos del museo** (Archweb): las 78 interiores (S8) y 36 de las 56 exteriores (S9).
- **El plano**: todas las líneas de la capa de vidrio y de línea fina del DWG, nivel por nivel, contra lo construido.
- **Nueve vistas del modelo**, cada una con la cámara puesta en el ángulo aproximado de una foto clave. Los renders van adjuntos aparte y se llaman igual que la foto: `s8-58-salon-oeste`, `s9-13-terraza`, etc.

**Cómo leer las etiquetas**
- **Gravedad:** 🔴 alta (cambia la lectura de la casa), 🟠 media (se nota al mirar), 🟡 baja (es detalle).
- **Causa:**
  - **P**: plano mal leído.
  - **I**: interpretación mía que la foto contradice.
  - **F**: falta, no se había hecho.
  - **Fase**: le toca a una fase que todavía no llega.

---

## Resumen

La estructura está bien. La huella, los niveles, las alturas, las escaleras, la cubierta con el solárium, el vano de la terraza y el baño ya revisado coinciden con plano y fotos.

Los errores se concentran en tres cosas:
1. **La rampa del piso principal está encerrada entre dos muros de piso a techo.** En la casa real es abierta hacia el hall y tiene ventanas hacia la terraza.
2. **Colores de muro en el lugar equivocado.** El azul del salón y los azules del boudoir están mal ubicados.
3. **Piezas icónicas que faltan:** la chimenea del salón, las ventanas del bloque de servicio de la planta baja y el mesón bajo la ventana del salón.

El patrón es el mismo de la escalera: **el plano está cortado a 1 m de altura, así que un antepecho o un muro con ventana arriba se dibujan igual que un muro entero.** Lo leí como muro entero en varios sitios.

| # | Hallazgo | Grav. | Causa | Evidencia |
|---|---|---|---|---|
| 1 | Rampa del piso principal encerrada entre dos muros de piso a techo. En la real, hacia el hall es un **antepecho con pasamanos negro** y hacia la terraza es **antepecho + ventanas de barras horizontales** hasta el techo | 🔴 | P | Fotos S8 2, 3, 6, 20, 31, 45, 54, 71 · S9 15, 22, 24 · render `s8-20-rampa-n1` |
| 2 | **Azul del salón en el muro equivocado.** Va en el muro corto del fondo, lado cocina/comedor, que es el que tiene la puerta (x −4,65). Yo lo puse en un paño junto a la vidriera. El rosa del otro extremo está bien | 🔴 | I | Fotos S8 58, 75 + planta CMN ("azul junto al comedor") · render `s8-58-salon-oeste` |
| 3 | **Falta la chimenea del salón**: un bloque suelto de ladrillo con marco y tapa de concreto oscuro, junto a una columna cerca de la vidriera | 🔴 | F | Fotos S8 30, 34, 35, 36, 56, 57, 63, 64, 65 |
| 4 | **El bloque de servicio de la planta baja no tiene ventanas.** El verde lleva ventanas con marco de cuadrícula | 🔴 | P/F | Fotos S9 3, 4 · DWG nivel 0: 4 líneas de vidrio en x −6,35…−6,15 · render `s9-03-fachada` |
| 5 | **Boudoir: solo el muro de la puerta es azul**; los otros tres son blancos. Yo pinté los cuatro | 🟠 | I | Fotos S8 10, 51 · render `f3-boudoir` |
| 6 | **Cocina con azulejo hasta el techo.** En la foto el azulejo solo cubre el salpicadero, hasta unos 1,4 m; arriba el muro es blanco | 🟠 | I | Fotos S8 17, 19, 25 · render `s8-17-cocina` |
| 7 | **La ventana del kiosque que da afuera (lado 2) lleva vidrio.** Solo el lado este es vano abierto. Hoy los dos están abiertos | 🟠 | I | Fotos S9 18, 26 · render `s9-18-kiosque` |
| 8 | **Escalera: las huellas son oscuras** (gris-negro) con contrahuellas blancas. Hoy todo es blanco | 🟠 | F | Fotos S8 38, 41, 42 |
| 9 | **Mesón corrido bajo la ventana del salón**, con tapa oscura sobre los radiadores; es donde van los "placares bajo las ventanas" [S3]. Falta | 🟠 | F | Fotos S8 34, 58, 63 |
| 10 | **Pasillos del piso principal con piso oscuro** (gris). Yo elegí baldosa clara porque no había fuente, pero estas fotos sí lo muestran. El hall junto a la escalera sí es claro | 🟠 | I | Fotos S8 9, 15, 20, 31 (oscuro) · S8 54 (hall claro) |
| 11 | **Losas de la terraza demasiado blancas y limpias.** En la foto son grises, de concreto, con juntas marcadas | 🟠 | F | Fotos S9 8, 13, 14, 19, 30 · render `s9-13-terraza` |
| 12 | **Mesa de la terraza**: en la foto es un tablero blanco delgado sobre un apoyo delgado. La nuestra se lee como cajón | 🟠 | P | Fotos S9 13, 14, 19, 20, 28, 29, 30 |
| 13 | **Arbustos de las jardineras parecen piedras escarchadas** | 🟠 | F | Fotos S9 8, 13, 17 · render `s9-18-kiosque` |
| 14 | **Chimenea de la cubierta muy baja.** En la foto sobresale bastante por encima de las pantallas | 🟡 | I | Foto S9 27 · render `s9-27-solarium` |
| 15 | **Falta la banca/mesa corrida del solárium**, pegada a la pantalla curva | 🟡 | F | Foto S9 10 |
| 16 | **La vidriera del salón arranca en x 0,07 según el DWG**; la nuestra arranca en 1,40 | 🟡 | P | DWG nivel 1, capa de vidrio: línea en z 4,65/4,75 de x 0,07 a 9,30 |
| 17 | **Color de la carpintería de la ventana corrida**: por dentro se ve gris claro/blanca; la nuestra es café. Por fuera se ve oscura | 🟡 | ? | Fotos S8 23, 24, 27, 33, 62 contra S9 1, 3. Contradice PLANTA.md (café, fotos ArchEyes): **por confirmar** |
| 18 | **Suite con un muro rosa pálido** (el de la izquierda) | 🟡 | ? | Foto S8 5 · fuente escrita sin encontrar: **por confirmar** |

**Lo que ya es de fases que vienen** (no son errores de lo hecho):
- Muebles de la cocina (mesa central, mesones con azulejo, lavaplatos doble, gabinetes de puertas corredizas grises, pasaplatos). Fotos S8 17, 19, 22–25, 37, 39.
- Barandas de la rampa: negra por dentro, gris claro por fuera. Fotos S8 2, 3 · S9 7, 9.
- Los muebles fijos de los cuartos.
- **La luz.** El vestíbulo y la cocina salen casi negros (renders `s8-01-vestibulo` y `s8-17-cocina`), así que no se pudieron comparar bien. Eso es de la fase 5.

---

## Lo que coincide (no tocar)

- **Volumen:** huella 19 × 21,5, pilotis, alturas medidas, caja blanca sobre planta baja verde retranqueada (S9 1, 3, 23).
- **Vestíbulo:** herradura de vidrio con montantes oscuros apretados (S9 5).
- **Cubierta:** dos pantallas curvas con la ventana del solárium y la caja de la escalera (S9 27, 16).
- **Terraza:** vano sin vidrio con columnas delgadas del lado este, y kiosque techado (S9 13, 14, 17, 18, 26).
- **Salón:** rosa en el extremo del estar, luminaria lineal colgada, LC2 y LC4 de pony, LC6 de vidrio (S8 50, 56–60, 75).
- **Escalera:** exenta, banda helicoidal, centro abierto con baranda negra (S8 4, 11, 38, 49).
- **Baño de los padres**, ya revisado contra S8 7.
- **Pisos:** parqué en cuadros en dormitorios (S8 10, 12, 51); baldosa beige en el salón; baldosa tostada en la cocina (S8 17, 19).
- **Puertas:** gris-café lisas, sin marco (S8 10).

---

## Orden propuesto para corregir

1. **Rampa del piso principal** (#1): la corrección de más impacto, y la cámara del recorrido pasa por ahí.
2. **Colores**, en un solo paso: azul del salón (#2), boudoir (#5), cocina (#6) y pasillos (#10).
3. **Piezas que faltan:** chimenea del salón (#3), ventanas del bloque de servicio (#4), mesón del salón (#9).
4. **Kiosque, escalera y terraza:** vidrio del kiosque (#7), huellas oscuras (#8), losas (#11), mesa (#12), arbustos (#13).
5. **Detalles:** #14, #15 y #16.
6. **Para confirmar con Alejandro o más fuentes:** #17 y #18.

Cada corrección se verifica con un render desde el mismo ángulo de la foto antes de darla por hecha.

---

## #1 Rampa: estudio en curso (29-sep, madrugada). NO se tocó el modelo todavía (regla L-052)

**Evidencia revisada en grande**
- Fotos interiores S8 2, 20, 45, 71.
- Fotos exteriores S9 7, 15, 22, 24.
- Corte B-B del DWG (`dwglab-cortes.png`).

**Lo que ya es seguro**
- **La rampa del piso principal a la cubierta está abierta al cielo.** En el corte B-B no hay losa sobre el pozo, que es como está hoy el modelo.
- **Hacia la terraza no hay muro lleno.** Visto desde la terraza (S9 15, 22, 24 y corte B-B), el lado del pozo es:
  - una **banda blanca diagonal**, que es el canto del tramo más su antepecho;
  - **triángulos de vidrio con barras horizontales oscuras** por encima y por debajo de esa banda.
- **Un tramo es exterior** (S9 7): losetas en diagonal y baranda de tubos claros sobre un antepecho bajo de un lado. Del otro lado, paños de vidrio triangulares con marco blanco.
- **Desde el hall del piso principal** (S8 45) se mira a la rampa a través de un vidrio con barras horizontales sobre un antepecho.
- **Los tramos interiores de planta baja al piso principal** (S8 2, 20, 71) tienen piso oscuro y antepecho inclinado con pasamanos negro. El muro central tiene una abertura triangular sobre el antepecho, como ya está modelado.

**Lo que falta resolver antes de construir**
- **Cuál de los dos tramos del piso principal a la cubierta es exterior y cuál interior**, y dónde va la puerta entre los dos.
- El sentido de subida del modelo (tramo oeste hacia el fondo, tramo este de vuelta) no cierra con la foto S9 7 si el vidrio va en el muro central. Leído al pie de la letra, el tramo oeste tendría 1,46 m de altura libre bajo la cubierta al llegar al descanso, así que ese tramo no puede estar techado.
- **Siguiente paso:** leer la planta del nivel 2 del DWG en el pozo (líneas de vidrio y líneas diagonales de la capa 2, x 0,07…1,77) y el corte A-A juntos. Recién ahí construir:
  - vidrio con barras horizontales donde corresponda;
  - antepechos inclinados con pasamanos negro hacia el hall;
  - tramo exterior con baranda de tubos claros.

### #1 Rampa: RESUELTO (29-sep)
- **La pregunta la cerró el plano:** las líneas de recorrido del DWG van por x 0,59, giran en el arco del descanso y vuelven por x −0,67. Se sube primero por el tramo este (lado terraza) y se llega por el oeste (lado hall). En el modelo estaba al revés.
- **Muros laterales:** se reconstruyeron por nivel según las fotos (`villa_circulacion.muros_pozo`) y se quitaron, con booleana, las franjas llenas que venían de los rellenos del DWG.
- **Muro central del tramo exterior:** macizo hasta 10 cm sobre el tramo alto, con baranda de 4 tubos claros encima (S9 7).
- **Verificado** con los renders `s8-20-rampa-n1-v3` y `s9-24-rampa-ext-v2`. Desde la terraza se leen la banda diagonal, el vidrio con barras debajo y la baranda de tubos arriba, como en S9 15, 22 y 24.
- **Pendiente menor:** en el piso principal, el muro central remata en un arco (DWG z 3,1…3,9); hoy termina recto en z 2,5.

### #12 Mesa de la terraza: RESUELTO, y era otra cosa (29-sep)
- Lo que el DWG dibuja en x 2,6…4,9 · z −4,6…−2,4 **no es la mesa: es una jardinera en U** junto al muro del boudoir (S9 13, 17, 19). Ahora tiene 0,45 m de alto, tierra y arbustos, y sus piezas están fundidas en una sola.
- **La mesa real** (S9 13, 19, 29, 30) es un tablero blanco delgado sobre 4 patas delgadas, con el largo paralelo al muro del vano. La posición es interpretación, ±0,5 m.
- **Chequeo automático de uniones** (29-sep, a raíz de lo que vio Alejandro en las esquinas de la mesa). Se revisaron todos los tabiques y vidrios del piso principal, además de las franjas cortadas del pozo de la rampa:
  - 2 esquinas vacías en la jardinera → corregidas con la fusión;
  - rendijas de 5 a 10 cm entre los muros nuevos del pozo y el corte → corregidas;
  - 1 hueco de 11 cm junto a un vidrio del hall (x −4,93…−4,28, z 0,45) → **pendiente de ver con foto**; puede ser el marco de una puerta.
- **Regla nueva:** piezas que se tocan se FUNDEN (`villa_obra.unir`). Prolongarlas crea caras coplanares, que salen como rayas negras.

### Chequeo geométrico de TODA la obra (30-sep)
Alejandro preguntó si las esquinas vacías de la jardinera se repetían en otro lado. **El chequeo del 29 solo cubría el piso principal y el pozo de la rampa**, así que se armó uno para toda la casa: `scripts/villa_chequeo.py`, que se corre con `VILLA_CHEQUEO=1` y no renderiza. Revisa 183 piezas de obra y busca dos cosas:
- **ranuras**: caras que se miran entre sí a 2 mm–15 cm, descontando las que ya rellena una tercera pieza;
- **caras coplanares**: caras que miran hacia el mismo lado, en el mismo plano, y se solapan.

**Defectos reales encontrados y corregidos:**
- **Ranura de 1 cm en TODOS los encuentros de muro interior con fachada.** Las bandas medían 19 cm y los muros del DWG llegan a 20 cm. Ahora la envolvente es de 20 cm (`E_ENV`).
- **Rendija de cielo de 1 cm en todo el borde del techo.** La cubierta estaba retirada 23 cm y el remate 22 cm. Ahora llega a la banda.
- **Canto de la losa en el mismo plano que la cara exterior de la fachada**, en todo el perímetro, además con otro material (ocre). Ahora la losa llega a la cara interior de la banda.
- **Piso de la terraza metido 1,1 m en el pozo de la rampa y encimado al piso del hall** (arrancaba en x 0,18). Ahora ocupa el recinto real: x 1,40…9,30, de −4,60 a la vidriera.
- **Plataforma del baño 8 cm despegada del muro**; el piso del baño dejaba ver el parqué del cuarto. Las fotos S8 8 y S8 26 la muestran contra el muro.
- **Jardinera en U metida 15 cm dentro del muro**; los tramos sueltos, despegados 5–12 cm. Ahora tocan la cara del muro.
- **Brocal de la claraboya coplanar con el cielo raso y con el hueco.** Ahora el hueco de la losa incluye el brocal.
- **Dintel 1,8 cm corto contra la fachada oeste**: la ranura atravesaba el muro sobre la puerta. Ahora los dinteles se prolongan hasta la fachada si quedan a menos de 8 cm.

**Lo que queda y es intencional:**
- el vidrio de la cinta, retirado 9 cm de los muros interiores, como un vano real;
- los dinteles metidos 3 cm en las jambas: mismo material y mismas coordenadas de mundo, así que no se ve;
- caras tapadas contra la losa o el cielo raso.

**Hallazgo de fidelidad al pasar (para #11/#13):** en S9 8, 13 y 17 la terraza tiene UNA jardinera (la U del DWG) y la mesa. **Los tres tramos largos contra los muros (`mu_jardinera_*`) no aparecen en ninguna foto: fueron interpretación mía.** **Alejandro los quitó (30-sep).** **Corrección (30-sep):** la jardinera en U SÍ va donde la dibuja el DWG. En S9 27 está contra el muro, junto al kiosque. Mi lectura de S9 13 estaba confundida por el espejo (ver abajo).

### #13 Plantas: RESUELTO (30-sep)
- **Antes:** esferas con ruido ("piedras escarchadas").
- **Ahora:** modelos escaneados de Poly Haven (CC0), descargados con OK de Alejandro (5,4 MB): `shrub_04`, `grass_medium_02` y `periwinkle_plant`. El módulo es `scripts/villa_plantas.py`, reutilizable para los otros labs.
- Cada arbusto se ARMA con copias enlazadas de ramas reales sobre una cúpula, porque Poly Haven no tiene arbustos redondos enteros.
- Render `artefactos-bake/chequeo/plantas-cerca-v2`.
- **Pendiente:** el verde sale algo oliva frente a S9 8; se ajusta en la fase de luz.
- **El chequeo ahora también mide pilotis, vidrio curvo y montantes** (264 piezas). Las piezas curvas se revisaron con render: la herradura del vestíbulo contra la losa sale limpia.

### #2 Azul del salón: RESUELTO (30-sep)
- **Dónde va:** en la cara del muro del fondo que mira al salón (x −4,65), con la puerta y su dintel; el paño junto a la vidriera vuelve a blanco.
- **Tono:** medido en S8 58 contra el cielo raso contiguo: sRGB ~(115, 133, 154) → lineal (0,36, 0,45, 0,62). Antes era un azul verdoso más oscuro.
- **Render:** `s8-58-salon-oeste-v2`.
- La referencia "S8 75" de la tabla no abre por enlace directo; la evidencia es S8 58.

### ⚠️ EL MODELO ESTÁ EN ESPEJO (30-sep)
Lo muestran cuatro fotos. En todas, lo que la foto tiene a la derecha el modelo lo tiene a la izquierda:
- S8 58: la cinta de ventanas;
- S9 13: el muro rosa;
- S9 27: el vano del kiosque;
- S9 23: el sentido en que sube la rampa.

**Prueba:** el render desde el punto de S9 27 (`s9-27-kiosque-prueba`), volteado horizontalmente, reproduce la foto.

**Causa:** en `dwg-muros.json` los ejes quedaron así: *"z: lado 2 (arriba del plano) negativo"*. Invertir un solo eje al importar es un reflejo.

**Alcance:** todo lo construido es coherente entre sí; solo la mano está al revés. Por eso las lecturas de color y de posición relativas a cada recinto siguen valiendo.
