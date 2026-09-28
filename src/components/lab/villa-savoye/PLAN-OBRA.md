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
| 2 | Obra gris | Planta baja → nivel principal → cubierta, cada una verificada contra fotos | **en curso** — planta baja ✅ desde el DWG (`scripts/villa_obra.py`: 10 muros, 21 pilotis, vidrio curvo con montantes); sigue nivel principal |
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
- **GPU Metal**: se cae (SIGABRT dentro de Cycles) con ~100 objetos sueltos iguales → piezas repetidas SIEMPRE en una sola malla. `VILLA_CPU=1` fuerza CPU para aislar fallas; `VILLA_CAM=planta` = vista cenital de la planta baja para verificar contra el plano.
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
