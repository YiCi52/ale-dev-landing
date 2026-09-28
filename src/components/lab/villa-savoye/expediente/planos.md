# Planos — inventario (cierre de la fase 0; entrada de la fase 1)

| Nivel | Fuente vista | Qué se lee | Qué NO se lee |
|---|---|---|---|
| **Planta baja** | Œuvre complète, reproducida en [WikiArquitectura](https://en.wikiarquitectura.com/building/villa-savoye/) (559×648 px) + lámina FLC 19704 [S0] | Herradura en U hacia la llegada (flecha de acceso abajo); **bloque de servicio arriba a la izquierda** (rótulos LINGERIE · CHAMBRE · CHAMBRE, WC); **garaje a la derecha con 3 autos dibujados en diagonal**; rampa en el eje central; **escalera de caracol a la izquierda de la rampa**, dentro de la curva; lavamanos cerca de la entrada; piso del vestíbulo tramado (baldosa); un recinto arriba a la derecha con **bañera** | cotas; nombre del recinto con bañera (¿apartamento del chofer? ¿huéspedes?) |
| **Nivel principal** | WikiArquitectura "Plata" (480×424 px) + FLC 19704 [S0] | Terraza cuadriculada (losas) en el centro-arriba; salón como gran recinto a la derecha; rampa en el eje; escalera de caracol; dormitorios y baños abajo a la izquierda con la **forma ondulada del diván** en el baño; cocina y servicio | rótulos, cotas |
| **Solárium** | WikiArquitectura "Planta 3" (412×237 px) | Las dos pantallas curvas (grande al oeste, chica al este), remate de la rampa en el eje, jardineras sueltas | cotas |

**Conclusión**: la resolución web alcanza para **confirmar la organización** (y coincide con PLANTA.md),
NO para medir. PLANTA.md ya se levantó de FLC 19704 con ~3 % de error. Para la fase 1 hace falta un
plano medible.

**Candidato para la fase 1**: [dwglab — Villa Savoye DWG](https://www.dwglab.com/projects/famous-architectures/le-corbusier/villa-savoye/)
— gratis, **304 KB**, plantas de los 3 niveles + 4 fachadas + 2 cortes (redibujo de terceros, no
FLC). **Descarga pendiente del OK de Alejandro.** Se usa para medir y para contrastar PLANTA.md,
no como verdad absoluta: donde difiera de FLC 19704, gana la lámina original.

**Contradicciones que resuelve la fase 1 con el plano medible**
1. ⚠️ Habitación de huéspedes: ¿planta baja [S1] o nivel principal [S4][S5]? (el recinto con bañera
   en la planta baja es la pista).
2. ⚠️ Orientación: la vista principal (ventana del solárium) es al **norte** [S10]; con eso se fijan
   el salón (sureste según [S4]), la cocina (suroeste) y el cuarto del hijo (noroeste [S4] vs sur [S5]).
3. ⚠️ Chimenea del salón [S3]: ubicarla en planta (no sale en las fotos).

---

## FASE 1 — superposición del modelo sobre el plano DWG (28-sep)

Fuente: `LECsav.dwg` de dwglab + sus 7 láminas PNG (en `~/CastilloStudio/assets/villa-savoye/planos/`).
Escala medida en la imagen: huella 19,0 × 21,25 m = 471 × 533 px → **~24,8–25,1 px/m** (las dos direcciones
cuadran: la huella de PLANTA.md es correcta). Superposiciones: `fase1-superposicion-nivel0.png` y `-nivel1.png`.
Arriba del plano = z −10,625 (lado 2); abajo = z +10,625 (lado 1 = fachada de acceso y ventana del solárium).

### Nivel principal — PLANTA.md CALZA (salón, cocina, terraza, boudoir, abri en su lugar). Diferencias:
1. **Rampa**: en el DWG ocupa x ≈ −1,4…+1,2 (≈2,6 m: dos tramos en zigzag lado a lado) y z ≈ −7,2…+2,8.
   PLANTA.md la tiene de 1,6 m (x −1,5…0,1) y hasta z +4,78 → **más angosta, corrida y 2 m más larga**.
2. **Escalera de caracol** (la "U"): x ≈ −4,8…−2,2, z ≈ +0,8…+2,4. PLANTA.md no la ubica en el nivel 1.
3. **Dormitorios del lado oeste**: los muros entre CH1/CH3 y del núcleo húmedo no caen donde dice PLANTA.md
   (ej. el límite CH1/CH3 del DWG está hacia z ≈ −3,2, no −4,99). Se redibuja esa franja.

### Planta baja — el MODELO ACTUAL ESTÁ MAL en tres cosas grandes
1. **Pilotis**: el DWG los tiene en retícula de **4,75 m en las dos direcciones**, en x = ±9,5 (al ras de la
   fachada) y z = ±9,5 (con el voladizo de 1,125 m). El script los pone con paso 3,95/4,51 → todos corridos.
2. **Herradura**: es una **U**: semicírculo de radio ≈ 6,3 m con centro ≈ (0, 0) hacia el lado 1, y lados
   rectos que suben hasta el muro del fondo (z ≈ −10,4). El modelo tiene un **cilindro cerrado** r 6,5.
3. **Bloque de servicio**: x ≈ −6,3…−2,4, z ≈ −9,4…−0,6 (más cuartos hasta el muro del fondo). El modelo lo
   tiene 2,4 m corrido hacia el oeste (x −8,7…−3,5).
   Rampa en planta baja: x ≈ −1,4…+1,2, z ≈ −6,4…+2,6. Caracol: x ≈ −4,8…−2,2, z ≈ +0,8…+2,4.

### Orientación ⚠️
Lado 1 (abajo) = acceso curvo + ventana del solárium → según el CMN la vista principal es al NORTE → lado 1 ≈ norte.
Eso choca con Wikipedia/Benton ("salón al sureste"): en el DWG el salón está sobre el lado 1. Falta un plano de
emplazamiento con flecha de norte para cerrarlo; mientras tanto el sol se decide por estética, no por "orientación real".
