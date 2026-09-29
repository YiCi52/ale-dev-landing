# PLAN DE OBRA — Villa Savoye como showroom recorrible

> Acordado con Alejandro el 27-sep-2026. Reemplaza el enfoque anterior (three.js en vivo →
> "sandbox de Roblox"; luego renders sueltos de Blender sin orden). Este documento es el
> contrato de CÓMO se construye; PLANTA.md es el de QUÉ hay en la casa.

## La ambición

- **TODA la casa recorrible**, y **habitada** como si alguien viviera ahí.
- **Réplica**, hasta las plantas. Nada se inventa: **cada objeto cita una fuente**
  (plano, foto histórica, documento). Sin fuente → no se pone, o se marca "sin fuente" y
  Alejandro decide (sobrio o "de época" declarado).
- Las listas de objetos (cortinas, alfombras, mesones…) son **ejemplos, no obligaciones**.
  Cocina: solo electrodomésticos de uso frecuente — los electrodomésticos no son decoración.

## Las fases, en orden de obra (no se salta ninguna, una por sesión)

| # | Fase | Entregable | Estado |
|---|---|---|---|
| 0 | Investigación | `expediente/`: una ficha por recinto + `fuentes.md` + guion de la promenade + `planos.md` | ✅ cerrada 27-sep |
| 1 | Planos | Los 3 niveles verificados contra los planos originales (PLANTA.md corregido) | ✅ cerrada 28-sep — muros en metros en `expediente/dwg-muros.json`; huella 19 × 21,5; orientación ⚠️ |
| 2 | Obra gris | Planta baja → nivel principal → cubierta, cada una verificada contra fotos | **en curso** — planta baja ✅ desde el DWG (`scripts/villa_obra.py`: 10 muros, 21 pilotis, vidrio curvo con montantes) · nivel principal ✅ (13 muros rellenos + 12 tabiques + 9 vidrios detectados de pares de líneas; rampa 2,6 m) · cubierta ✅ (5 muros del nivel 2: pantallas del solárium con su ventana sobre el eje de la rampa, caja de la escalera, antepechos de la rampa; losa con los huecos reales de terraza y rampa) · alturas MEDIDAS en fachada 1 + corte A-A (la caja estaba 70 cm alta) · caja de escalera techada · rampa ✅ (2 entrepisos, tramos lado a lado + descanso, muro central con remate inclinado) · escalera ✅ (en U con compensadas, NO caracol) · **obra gris cerrada** → fase 3 |
| 3 | Materia | Materiales y color por recinto | ✅ **cerrada 28-sep** — `scripts/villa_materia.py` (recintos del CMN, pisos, colores, vidrio, puertas medidas contra S8 10) |
| 4 | Habitado | Muebles, objetos, plantas — solo con evidencia | **en curso** (28-sep) — salón |
| 5 | Luz | Día y noche por recinto | parcial* |
| 6 | Recorrido | Guion de estaciones → tramos renderizados → vistas restringidas por estación | — |
| 7 | Web + interacción | Página, puntos con historia, hover de material | — |
| 8 | QA | Los mismos gates que un sitio de cliente | — |

\* Adelantado el 27-sep sin expediente (renders v7: sol, vidrio real, pasto 3D, salón con LC2/LC4,
terraza). **Se revisa contra el expediente** en su fase; no se da por bueno por verse bien.

## El recorrido (fase 6)

- **Estaciones + tramos guiados.** Cada scroll dispara un tramo pre-renderizado (3–4 s) que corre
  solo: el usuario decide **cuándo** avanzar, no la velocidad. Sin cortes: el último cuadro del
  tramo = la estación. Scroll arriba = tramo inverso (se renderiza aparte: el navegador no
  reproduce video al revés). Scrolls durante un tramo se ignoran.
- **Guion = la promenade architecturale** de Le Corbusier (a confirmar en fase 0): llegada en
  carro bajo los pilotis → vestíbulo → **rampa** → salón / terraza → rampa → solárium.
- **Vista restringida por estación**, no 360°: un arco de ~120–150° elegido (ej. desde la sala se
  mira a cocina y escalera, no a la ventana). Dirección de cámara. Resistencia suave en los bordes;
  al hacer scroll la vista vuelve al centro antes del tramo.
- Fuentes del recorrido (vale para cualquier lab): video del cliente → fotogramas · modelo 3D
  propio → Blender renderiza los tramos (la Villa) · IA (Higgsfield) si hay créditos y no hay modelo.
- Accesibilidad: teclado y botones avanzan; movimiento reducido → fundidos; la planta clicable es
  índice para saltar a cualquier recinto.

## La interacción (fase 7) — capa aparte, sirve para cualquier fuente de recorrido

- **Puntos con historia**, solo en elementos con carácter (no un sofá). Candidatos a confirmar en
  fase 0: lavamanos suelto del vestíbulo, baño principal con diván de azulejo, la rampa, la
  ventana corrida, el mesón de la cocina.
- **Hover de material**: por cada vista se renderiza una imagen de IDs de material alineada
  píxel a píxel; la página la lee y nombra el material bajo el cursor.

## Restricciones técnicas conocidas

- **Render**: ~20 tramos × 3 s × 24 fps ≈ 1.400 cuadros ≈ 12–16 h de máquina. Por lotes, de noche,
  piso por piso. SIEMPRE con `scripts/render-seguro.sh` (el 27-sep un render de pasto de 3,6 M
  hebras apagó el Mac de 8 GB; el vigilante mata Blender a los 4 GB).
- **Peso**: tramos + vistas no caben en `public/lab` (Vercel al tope). Decidir hosting (ej.
  Cloudflare R2) ANTES de la fase 6.
- **GPU Metal**: se cae (SIGABRT dentro de Cycles) con ~100 objetos sueltos iguales Y con n-gonos cóncavos grandes → piezas repetidas en una sola malla y prismas triangulados a mano (`tessellate_polygon`). `VILLA_CPU=1` fuerza CPU para aislar fallas; `VILLA_CAM=planta` = vista cenital de la planta baja para verificar contra el plano.
- **Ritmo**: tope de horas por semana; el outreach (DMs) no se sacrifica por el lab.

## Scripts

- `scripts/villa-blender.py` — la casa (geometría de PLANTA.md, luz, cámara, render).
  Variables: `VILLA_MODO` (dia|noche), `VILLA_CAM` (interior), `VILLA_MUESTRAS`, `VILLA_PCT`,
  `VILLA_PASTO_N` (0 = sin pasto), `VILLA_SOL_AZ`/`VILLA_SOL_EL`, `VILLA_OUT`.
- `scripts/villa_detalle.py` — pisos, muebles, terraza, pasto.
- `scripts/render-seguro.sh` — el único modo permitido de renderizar.

## Observaciones de Alejandro sobre los renders v7 (27-sep) — para las fases 3–5

1. **LC2: una varilla atraviesa el asiento.** Causa en `villa_detalle.py`: el marco superior de la jaula es un
   rectángulo cerrado a 0,62 m, así que su lado frontal cruza sobre el asiento. La LC2 real no tiene ese tramo
   (la jaula abraza brazos y respaldo, el frente queda abierto). Se corrige en la fase 4 (habitado).
2. **Vidrios con poco realismo.** Falta reflejo creíble, un tinte verdoso de canto y alguna imperfección;
   se trabaja en la fase 3 (materia).
3. **La textura de las paredes deja ver "recuadros" de render** (repetición del mosaico de la foto de revoque
   con proyección de caja). Fase 3: romper la repetición (escala mayor + mezcla con ruido a dos escalas).
4. **La sombra queda muy de lado** (sol a 34°, vista cenital de la planta baja, 28-sep). Fase 5: subir la elevación del sol (~45–50°).

## Cubierta (fase 2, 28-sep) — lo que es plano y lo que es interpretación
- **Del plano (nivel 2, capa 7):** las dos pantallas curvas del solárium, la caja de la escalera, la U de muros de la rampa. Reemplazan los dos arcos a ojo (`sol1`/`sol2`) que estaban sobre la terraza.
- **Descartado del nivel 2, con motivo:** piezas 3 y 4 (contorno de fachada = antepechos ya hechos), 5 (unión duplicada de las pantallas), 7 (poste suelto de 0,3 m, sin identificar), 6 (es la **mesa fija de la terraza** vista desde arriba: x 2,6…4,9 · z −2,4…−3,7).
- **Interpretación, a verificar con fotos:** alto de pantallas 2,6 m; ventana del solárium con antepecho a 0,95 m y dintel a 2,10 m; antepechos de la rampa a 1,05 m.
- **Pendiente para la fase 4:** la mesa de la terraza de `villa_detalle.py` está en (4,0…6,2 · −1,2…−0,4); el DWG la pone en (2,6…4,9 · −2,4…−3,7). Moverla allá.
- **Pendiente:** la escalera caracol no está modelada; la losa de cubierta va cerrada sobre ella hasta que exista (un hueco sin escalera deja ver el interior).
- **Metal:** abortó una vez con la escena completa y la misma escena pasó en CPU y luego en Metal. Intermitente; si se repite, `VILLA_CPU=1`.
- Cámara de verificación nueva: `VILLA_CAM=aerea` (3/4 desde arriba).

## Alturas medidas (28-sep) — de la fachada 1 y el corte A-A del DWG (24,8 px/m, ±5 cm)
| Cota | Antes (a ojo) | Medida |
|---|---|---|
| Bajo la losa del nivel principal | 3,30 | **3,07** |
| Piso acabado del nivel principal | 3,45 | **3,31** |
| Ventana corrida | 3,85 → 5,05 (1,20) | **4,34 → 5,31 (0,97)** |
| Cielo raso | 6,55 | **6,45** |
| Cubierta acabada | 6,89 | **6,66** |
| Remate de fachada | 7,60 | **6,88** (22 cm sobre la cubierta, no 1,05) |
| Corona de las pantallas del solárium | 9,49 | **9,40** |
| Ventana del solárium | 0,95 → 2,10 | **1,00 → 2,03** sobre la cubierta |
| Caja de escalera | abierta, 2,6 | **techada, losa 9,10 → 9,30** |

Consecuencia: la caja del nivel principal era 0,7 m más alta y la ventana corrida 23 cm más alta de lo real. Con las cotas medidas la proporción ya se lee como la casa.
- **Metal:** la cámara `aerea` abortó 2 de 3 veces en GPU; en CPU pasa siempre (~24 s). Para verificación aérea usar `VILLA_CPU=1`.

## Rampa y escalera (28-sep) — `scripts/villa_circulacion.py`
- **Rampa, del plano:** pozo x −1,25…1,25; dos tramos de 1,18 m lado a lado (oeste sube hacia el fondo, este vuelve), muro central de 14 cm, descanso z −6,08…−7,12. Mismo esquema del nivel principal a la cubierta. El muro central se quitó de los rellenos genéricos (planta baja y nivel principal) porque en planta aparece como muro pero es un **antepecho con remate inclinado**: nace sobre el tramo que baja y remata 1 m sobre el que sube.
- **Escalera: NO es caracol.** El DWG la dibuja en U: dos tramos rectos (x −4,75…−3,15), muro de ojo en medio y remate semicircular con compensadas (r 0,75). 18 contrahuellas por entrepiso (6 + 6 compensadas + 6). Sus muros ya venían de los rellenos.
- **Losas:** los huecos de rampa y escalera en el piso del nivel principal y en la cubierta salen del mismo módulo; dos tapas cierran las esquinas que el semicírculo deja fuera del hueco rectangular.
- **A verificar con fotos:** si en el nivel principal el pozo de la rampa tiene vidrio hacia la terraza o cubierta propia (hoy queda abierto al cielo desde la cubierta hasta el suelo); barandas y pasamanos van en la fase 4.
- Cámaras de verificación: `VILLA_CAM=corte` (`VILLA_CORTE_X` o `VILLA_CORTE_Z`), `VILLA_CAM=rampa` con `VILLA_CORTE`, `VILLA_CAM=hall`; `VILLA_EXPO` para aclarar zonas oscuras al verificar.

## Prueba de techo de calidad (28-sep) — `scripts/villa_lookdev.py`, `VILLA_CAM=rincon`
- Toma: llegando por la rampa al solárium, mirando la ventana de la pantalla. 1920×1080, 192 muestras, **4 min 10 s en Metal** (sin caída).
- Ajustes de la toma: `VILLA_HDRI_GIRO=230 VILLA_SOL_AZ=170 VILLA_SOL_EL=28`, exposición −0,45.
- Lo que ya funciona: revoque sin recuadros (mundo + 2 muestras), chorreaduras, oclusión, losetas con tono por pieza, pantalla en UNA pieza (booleana; sin juntas falsas), DOF, retoque (brillo, aberración, viñeta).
- Lo que todavía delata el CG: piso demasiado limpio y parejo; revoque sin textura visible a esta distancia; una junta doble en el piso a la derecha (dos piezas de losa); el fondo es foto de bosque, no el prado de Poissy.
- Siguiente escalón (necesita descargas → pedir permiso): escaneo de losa de concreto, hierba en las juntas, HDRI con prado abierto.

### Pulido del rincón, ronda 2 (28-sep, con observaciones de Alejandro)
- **"Se ve como paneles, no curva":** las curvas del DWG son polilíneas (48 caras) y se sombreaban planas. Arreglo en `villa_obra.suavizar_curvas` (sombreado suave + aristas vivas solo sobre 25°), aplicado a TODA la obra, no solo al rincón.
- **Junta doble en el piso:** el bisel de cada panel de losa dibujaba una ranura. Las losas ya no llevan bisel.
- **Descargas (OK de Alejandro):** HDRI `charolettenbrunn_park_4k` (prado abierto, cambia el bosque) y escaneo `concrete_floor_worn_001`. El pasto de las juntas reusa `leafy_grass`.
- **Losa:** el escaneo es oscuro (albedo ~0,15, medido con `VILLA_DEBUG_PISO`): aporta variación, el tono lo fija un gris cálido de 0,50. Cada loseta lee la foto corrida al azar.
- Toma final: `VILLA_HDR=…charolettenbrunn_park_4k.hdr VILLA_HDRI_GIRO=145 VILLA_SOL_AZ=170 VILLA_SOL_EL=28`, 192 muestras, 4 min en Metal.

## Pulido de la obra gris en TODA la casa (28-sep, opción B aprobada)
- `villa_acabados.py` (antes solo del rincón): revoque sin mosaicos en blanco y verde, mugre sobre los 3 pisos, chorreaduras, losetas escaneadas en la cubierta, biseles en cubierta/rampa/escalera. `villa_lookdev.py` quedó solo con la cámara y el retoque del rincón.
- Pantalla del solárium en una pieza desde la obra (`villa_obra.pantalla_continua`), no solo en el rincón.
- **Tabiques duplicados** del DWG (pares detectados dos veces) filtrados por solape: 12 → 9, sin cuerpos metidos uno en otro.
- **La "caja" de la terraza era la MESA FIJA:** 7 pares de líneas del nivel 1 en la terraza estaban subidos como muros de piso a techo. Ahora mesa a 0,72 m con tapa de 8 cm (x 2,6…4,9 · z −3,45…−2,4). Se quitó la mesa mal ubicada de `villa_detalle`. ⚠️ La jardinera de `villa_detalle` (x 1,0…8,8 · z −4,5…−3,8) se cruza con la pata de la mesa: revisar en la fase 4.
- **Vidriera del salón a la terraza** (9 × 3 m, corrediza, [S5][S6]): el DWG no la dibuja; va por el expediente, x 1,40…9,30 en z 4,78, 4 paños con marcos de acero oscuro.
- Cada toma con su cielo: exterior/aérea contra el bosque (ballawley), rincón contra el prado (charolettenbrunn) — el prado desde la cámara de aproximación muestra casas y un muro de piedra.
- Pendiente anotado: la cinta de ventanas del lado de la TERRAZA en la Villa real es un vano sin vidrio; hoy lleva vidrio como el resto.

## Terraza y pasto (28-sep, opción A)
- **Cinta de la terraza = VANO sin vidrio** [S4 "ventana corrida con baby piloti"]: fachada este, z −4,60…4,78, sin vidrio ni montantes; baby pilotis de 5 cm de radio en los ejes de media crujía (su número y posición = interpretación, a verificar con fotos).
- **Jardinera** partida en dos tramos a los lados de la mesa (antes empezaba dentro del pozo de la rampa y atravesaba la mesa).
- **Pasto nuevo** (`scripts/villa_pasto.py`): matas de 70–130 hojas reales (cintas que se afinan y se doblan), 5 variantes + trébol, **420 000 matas como instancias** (memoria casi plana), más densas cerca de la casa, tono por mata. Altura 10 cm (césped cortado). Las rotaciones de partícula van APAGADAS: con ellas las matas salían acostadas (probado lado a lado). El pelo de antes sigue con `VILLA_PASTO_MODO=pelo`.
- Costo: ~3,5 min a 60 % y 32 muestras en CPU con pasto; Metal abortó una vez con el pasto nuevo → renders con pasto en CPU hasta ver si se repite. Revisiones de obra: `VILLA_PASTO_N=0`.
- Cámara nueva: `VILLA_CAM=libre VILLA_CAM_POS="x,y,z" VILLA_CAM_MIRA="x,y,z" VILLA_CAM_LENTE=35`; `VILLA_CAM=pasto` (+ `VILLA_PASTO_CERCA=1`).

## Pasada contra fotos (28-sep, Archweb S8 interiores + S9 exteriores)
Confirmado por las fotos: vano sin vidrio de la terraza (S9 13/14/30), vidriera del salón (S9 12/19), losas grandes de concreto en terraza (S9 8/13), muros verdes y cinta con montantes en planta baja (S9 1/4), piso ocre y muro rosa del salón (S8 28–30).
Corregido:
- **Escalera EXENTA** (S8 3/4/11/13): la "jaula" del DWG era el antepecho cortado a la altura del plano. Ahora `villa_circulacion.antepechos_escalera`: cada vértice del contorno sube con su peldaño (+1 m) y baja 30 cm (zanca); abierta por debajo. Mismo error que el muro central de la rampa.
- **Columnas en el nivel principal** (S8 29/30): el DWG no las dibuja; se prolongan los pilotis de la planta baja donde no caen en muro, fachada, rampa o escalera (6).
- **Mesa de la terraza**: tablero delgado de 6 cm sobre apoyos de lámina (S9 19/20/29/30), no cajón.
- **Chimenea** junto a las pantallas (S9 27): era la pieza 7 del nivel 2 que el filtro descartaba; altura ~9,9 m = interpretación.
- **Fondo del exterior**: `VILLA_HDRI_GIRO=300` por defecto (sin el tronco gigante: "parece Ant-Man").
Para fases 3–4 (visto en fotos, no se toca ahora): piso de la rampa con losetas en DIAGONAL (S9 9); barandas de tubo delgado en rampa y escalera (S9 7/15/24, S8 4); canaleta de luz que cruza el techo del salón (S8 28–30); cocina con mesón de baldosa blanca y muebles con puertas correderas grises (S8 17/19/24/25); baño azul con chaise lounge de mosaico (S8 7/8/26).
Noche: `VILLA_MODO=noche` — render `artefactos-bake/pruebas/noche-exterior.png` (CPU, 60 %, 64 muestras).

## Fase 3 — Materia, primera tanda (28-sep) — `scripts/villa_materia.py`
Solo lo que tiene evidencia. Hallazgos que cambiaban la lectura:
- **El vestíbulo tenía piso de GRAVA** (la del jardín seguía bajo la casa) → baldosa clara de 30 cm dentro de la herradura.
- **Los muros de planta baja eran verdes también POR DENTRO.** El verde es la cara exterior; adentro (vestíbulo, bloque de servicio) son blancos [S8 1/3/4/13]. Regla: cara verde solo si mira hacia afuera del recinto cerrado (herradura + tramo recto hasta z −9,5 entre x ±6,4 + bloque de servicio).
- **El cielo raso del porche y del vestíbulo era OCRE** (toda la losa tenía el material del piso del salón) → blanco por debajo.
- **Salón:** muro del fondo (salón/cocina) ROSA TERRACOTA entero; paño AZUL junto a la vidriera, del lado de adentro [PLANTA.md, S8 28–30]. El render desde el extremo este reproduce la foto S8 28.
- **Rampa:** losetas de 30 cm en diagonal en las caras de pisada [S9 9].
- **Cocina:** azulejo blanco de 15 cm en los muros que miran hacia adentro (solo tabiques; la cara interior de la fachada es una sola pieza con el resto de la cinta).
- **Montantes de la cinta:** perfil de 5 × 7 cm en el plano del vidrio; antes ocupaban todo el grueso del muro (21 cm) y se leían como postes de madera.
- **Retoque del compositor** (brillo, aberración, viñeta) en todas las tomas de foto, no solo en el rincón (`VILLA_RETOQUE=0` lo apaga).
- **Recintos** (`RECINTOS` en `villa_materia.py`): salón, cocina y terraza ✅; los demás del nivel principal tienen forma segura pero USO ❓ (qué dormitorio es de quién, dónde está el baño con el diván) → se confirma antes de pintarlos.
- Depuración: `VILLA_INSPECT="x,y,z"` lista los objetos cerca de un punto y sus materiales por cara, sin renderizar.

### Fase 3, segunda tanda (28-sep) — recintos aprobados por Alejandro (`expediente/recintos-nivel-1.md`, planta CMN 2021)
- **Salón corregido:** ROSA = cara interior de la fachada este en el tramo del salón (el extremo del ESTAR; la foto S8 28 muestra el rosa con la cinta de ventanas) · AZUL = paño junto a la vidriera, lado COMEDOR · resto blanco [CMN]. La primera tanda había puesto el rosa en el muro salón/cocina: al revés. La fachada este se parte en z 4,72 para pintar solo su tramo del salón.
- **KIOSQUE** (parte techada del jardín): la cinta sin vidrio también en sus dos lados (este z −9,45…4,78; norte x 4,90…9,30) con baby pilotis; piso de losas de terraza. El DWG ya lo dejaba abierto hacia la terraza.
- **Baño n.º 14:** tabique z −4,75…−4,62 entre el cuarto del hijo y el baño (lo dibuja el CMN, no el DWG); puerta x −7,05…−6,25 = interpretación.
- **Boudoir** azul profundo · **pasillo al hijo** bleu charron · **parqué** en el cuarto de huéspedes. Los demás dormitorios quedan BLANCOS: su color no tiene fuente.
- Renders: `f3-salon-estar.png` (≈ S8 28/29), `f3-kiosque.png` (≈ S9 17/18/26), `f3-planta-n1.png`.
- Fase 4 (anotado): la mesa de la terraza vista de cerca se lee como cajón; el baño de los padres (bañera, diván, claraboya) y los muebles fijos (tablero del boudoir, escritorio del hijo, clóset de huéspedes).

### Fase 3, tercera tanda (28-sep)
- **Columna quitada:** el piloti del centro de la terraza (4,76; −1,95) subía a cielo abierto sin sostener nada (lo vio Alejandro). Regla: no hay columna dentro de la terraza salvo en su borde, bajo la losa. Las del salón quedan a 0,97 m de la ventana (verificado en planta: no están empotradas).
- **Pisos por recinto:** parqué RUBIO en tablillas 30 × 7 trabadas (huéspedes [CMN]; hijo, boudoir y suite por "plancher blond" [eg-xiste] + fotos S8 5/10/12/32 → confianza media) · cocina baldosa tostada 20 cm [S8 19] · baño 14 y baño de la suite baldosa blanca 10 cm · el resto (hall, pasillos) sigue ocre: sin fuente.
- **Rampa:** tramo INTERIOR gris oscuro liso [S8 9/15/20/31]; tramo EXTERIOR losetas en diagonal [S9 9].
- **Puertas:** 17 del DWG (arco de giro de ~90° + línea de hoja desde la bisagra), abiertas como las dibuja el plano, hoja de 4 cm × 2,10 m, pintura oscura [S8 10/16]. Sin línea de hoja en el plano → no se pone (1 caso).

### Fase 3, carpintería (28-sep) — puertas fieles a las fotos S8 10/12
- **Lectura del DWG corregida:** en este plano la línea de la hoja va sobre el VANO (puerta cerrada) y el arco termina en la posición abierta. Leído al revés, la hoja tapaba el vano ("un rectángulo negro") y el dintel salía como estante.
- **Dinteles:** muro sobre cada puerta de 2,10 m hasta el cielo raso (el DWG corta a 1 m y el modelo dejaba el hueco hasta el techo). El lado del muro se DETECTA en el plano mirando junto a las dos jambas (`_lado_del_muro`); si no se sabe, se centra. Se nombran como muros del nivel para que la pintura del recinto los alcance.
- **Puerta:** hoja lisa enrasada gris-café oscuro con veta apenas visible · marco metálico delgado y oscuro (jambas de 3,5 cm + cabezal, grueso del muro + 1 cm por cara) · manija de palanca metálica a 1 m con roseta, en las dos caras. Abiertas 90° hacia el lado del giro del plano.
- **Parqué EN CUADROS tipo cesta** (cuadros de 24 cm de 4 tablillas alternadas) [S8 10/12], no tablillas trabadas.
- **Dintel al ras (28-sep, 2.ª vuelta):** el grueso ya no se supone (16 cm sobresalía 1 cm en muros de 15): `_caras_del_muro` barre cada 5 mm junto a las dos jambas y usa las caras REALES del muro del plano.
- **Herrajes:** placa larga (4 × 18 cm) con bocallave, manija de palanca de níquel satinado con cuello, en las dos caras; tres bisagras en el canto; cantos de hoja y marco apenas redondeados (bisel de 3 mm).
- **Puerta medida contra la foto S8 10 (28-sep, 3.ª vuelta):** en la foto la hoja es gris-café cálido de albedo ~0,2 (píxel medio 82/70/67, casi tan clara como el muro azul 61/64/93) y NO tiene marco que contraste: el canto toca el muro. Quitado el marco metálico oscuro; hoja lisa enrasada; manija de palanca chica con roseta y bocallave redonda debajo; tres bisagras.
- **La "línea" sobre la puerta:** era una ranura entre el dintel y el canto biselado del muro, no el grueso. Dintel sin bisel, caras medidas por bisección y 3 cm metido dentro de cada jamba (mismo material en coordenadas de mundo: el solape no se ve).
- **Hall y pasillos del nivel principal:** sin fuente; **Alejandro dejó la elección a Claude**. Elegido: baldosa clara de 20 cm, pariente de la del vestíbulo (las circulaciones de S8 1/13 son cerámica clara). Marcado como INTERPRETACIÓN en el código.
- **Fase 3 CERRADA** (Alejandro, 28-sep: "ahora sí me convence").

### Escalera corregida (28-sep, la vio Alejandro "re rara")
- Cortes (`VILLA_CAM=corte VILLA_CORTE_Z=1.15/1.95`) mostraron: intradós en serrucho (bloques sueltos) y la espina central alabeada entre dos tramos (forma de moño).
- Ahora: cada peldaño tiene la cara de abajo sobre la losa inclinada continua (garganta 16 cm) → intradós liso como en S8 4/11; la ESPINA es un muro continuo del suelo a la losa de la caja de escalera (el DWG la corta en todos los niveles → interpretación consistente); zanca de los antepechos = contrahuella + garganta; cantos de la losa en los huecos, blancos (eran ocres).
- **Escalera como UN sólido continuo por tramo (28-sep):** `_tramo_continuo` arma arriba el perfil de peldaños y abajo el intradós continuo muestreado (2 por peldaño recto, 6 por compensada), con los costados triangulados; sombreado suave con aristas vivas > 35°. Se acabaron las franjas en la hélice ("se notan las partes pegadas", Alejandro).
- **Escalera según las FOTOS (28-sep, S8 3/4/11/13), no solo el plano:** banda helicoidal exterior (sube con los peldaños +1 m y por debajo sigue el intradós) con pasamanos negro encima; el "muro de ojo" del DWG NO es muro: el centro es un hueco con baranda metálica negra (pasamanos + un barrote por peldaño). Probado y descartado: espina alabeada (moño) y muro exterior desde el piso (tambor cerrado). Baranda negra en el borde del hueco del piso principal junto al semicírculo = interpretación.
- Pendiente (visto en S8 4): zócalo gris al pie de la banda; claraboya sobre la escalera (la caja de cubierta la tiene) → fase 5.
- **Escalera, pendiente para la fase 6:** a Alejandro no le termina de convencer cómo conectan las barandas, pero puede ser el ángulo de cámara. Se revisa en el recorrido; si se ve raro ahí, se cambia.

## Fase 4 — Habitado, primera tanda: el salón (28-sep)
- **LC2:** el marco de arriba es una U abierta al frente (brazos + respaldo); cerrado, cruzaba el asiento (observación de Alejandro).
- **Luminaria:** canaleta lineal metálica suspendida de 3 varillas, con tubo emisor, a lo largo del salón [S3 "en forme de gouttière", S8 28–30]; reemplaza los globos (estaban MAL). Largo/posición = lectura de fotos.
- **LC4** en piel de pony (blanca con manchas café) [S8]; **LC6** con tablero de vidrio [S8]; **radiadores** grises [S8].

### Fase 4, muebles con detalle (29-sep) — `scripts/villa_muebles.py`
- Tapizado de verdad (caras abombadas, hundido del asiento, vivo en el canto), cuero con arrugas; LC2 con flejes y regatones.
- LC6 de catálogo: patas de sección ovalada, cabezales, travesaño, niveladores, vidrio de 19 mm con topes. Thonet con asiento redondo de esterilla. Mesa baja de nogal con veta. Alfombra de lana de 8 mm, pelo peinado y ribete.
- **Lección técnica:** bisel + sombreado suave sin `harden_normals` inclina las normales de TODA la cara grande; en vidrio eso rompe la refracción y el tablero salía NEGRO. Aislado ocultando el objeto (`VILLA_OCULTAR=prefijo`, nuevo). Aplicado también a `villa_detalle.cojin`.
- Alfombra y mesa baja: SIN evidencia en fotos (amoblado anterior) → interpretación.

### Fase 4, baño de los padres (29-sep) — `scripts/villa_bano.py`
- Fotos S8 5/7/8/26 abiertas en grande. Plataforma de mosaico azul 5×5 con la tina hundida (40 cm), dos llaves; diván de mosaico gris que ondula (perfil leído de S8 7); muros de azulejo blanco; lavamanos de pedestal, WC y radiador contra el muro del fondo; barra con cortina blanca hacia el dormitorio; claraboya con brocal sobre la plataforma (hueco en la cubierta).
- Posiciones finas (fin de la plataforma, sanitarios, claraboya) = lectura de fotos, ±0,3 m (CMN).
- **Lección:** la baldosa procedural en coordenadas de mundo solo servía para pisos; en caras verticales salía a rayas pálidas. `villa_materia.baldosa(caras=True)` usa (x, y) arriba y (x+y, z) en los costados.
- Cámara de verificación del baño: `VILLA_CAM=libre VILLA_CAM_POS="-1.6,-5.3,4.2" VILLA_CAM_MIRA="-3.6,-4.9,3.75" VILLA_CAM_LENTE=18` (≈ S8 7). Ojo: x −1,25…−1,4 es el muro de la rampa, la cámara no puede ir ahí.
- **Baño releído contra S8 7 lado a lado (29-sep, pedido por Alejandro "¿seguro así es?"):** la tina va JUNTO al diván (franja azul delgada) con la cabecera cerca del muro del fondo; plataforma en L (deja piso blanco atrás a la izquierda); radiador contra el muro lateral, WC/bidé y lavamanos de pedestal atrás a la izquierda; diván ALTO contra el muro del fondo y bajando al nivel de la plataforma (estaba al revés); azulejo de muro en retícula sin trabar; piso blanco de 15 cm. ⚠️ Conflicto: el CMN (planta esquemática ±0,3 m) ponía la tina en x −4,65…−4,0 → gana la foto.
- **Mosaico vidriado** (`villa_bano._mosaico`): tono por tesela con curva en S (algunas bien distintas), brillo del esmalte por tesela (0,06–0,22) + capa de vidriado, teselas desniveladas y junta hundida.
