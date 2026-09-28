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
| 3 | Materia | Materiales y color por recinto | parcial* |
| 4 | Habitado | Muebles, objetos, plantas — solo con evidencia | parcial* |
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
