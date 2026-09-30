# Inventario foto por foto (30-sep-2026, noche)

**Fuente.** Las 116 fotos de Archweb:
- 60 interiores: `Villa-Savoye-interni-0nn.jpg`, citadas como **iNN**;
- 56 exteriores: `Villa-Savoye-Esterni-0nn.jpg`, citadas como **eNN**.

**Cómo se hizo.** Cada foto se miró entera. Por foto se anota: el recinto, hacia dónde mira y cada elemento que se ve, contra el estado del modelo al 30-sep (commit `d87d9fd`, ya sin espejo).

**Estados:**
- ✅ está y coincide;
- ⚠️ está pero distinto;
- ❌ falta;
- ❓ hay que verificarlo con un render.

Los números #NN remiten a `fidelidad-2026-09-29.md`. Los hallazgos nuevos se numeran desde #24.

## Interiores

### i01 · planta baja · pasillo de servicio mirando al vestíbulo
- Piso de baldosa clara cuadrada **puesta en diagonal** (45°): ❌ el modelo no tiene piso en los recintos de planta baja fuera del vestíbulo (#24).
- **Zócalo gris** al pie de los muros: ❌ (#25; ya anotado para la escalera en PLAN-OBRA).
- Marco de puerta **oscuro** (café-gris) y puertas oscuras a la derecha: ❌ en planta baja no hay puertas (#26).
- **Lavamanos de pedestal exento** en el vestíbulo, al fondo: ❌ (#27, anotado desde la fase 0).
- Rampa con pasamanos negro, arriba a la izquierda: ❌ pasamanos (#1).
- Interruptor en el muro: ❌ detalle menor (#28, "accesorios eléctricos").

### i02 · rampa interior, planta baja → piso principal
- Piso gris antracita: ✅ en los tramos interiores.
- Pasamanos negro sobre el antepecho: ❌ (#1).
- Ventanales con barras horizontales **claras** arriba a la izquierda, sobre bandas inclinadas: ⚠️ en el modelo las barras son oscuras. Por dentro se ven claras y por fuera oscuras en S9 23: ❓ color real (#1).
- Nicho o ventanita baja en el muro de la derecha: ❓ (#1).

### i03 · planta baja · vestíbulo con escalera y rampa
- Escalera: banda blanca, barandas negras, **zócalo gris** en su base: ✅ banda y barandas · ❌ zócalo (#25).
- Columnas redondas blancas con zócalo gris: ✅ columnas · ❌ zócalo.
- Piso de baldosa clara: ✅.
- Rampa a la derecha con antepecho y pasamanos negro: ❌ pasamanos (#1).
- Aplique de luz en el muro: ❌ (#28).

### i04 · planta baja · la escalera desde el vestíbulo
- Banda helicoidal blanca, pasamanos negro por fuera y baranda del ojo: ✅.
- **Zócalo gris** alrededor de la base: ❌ (#25).
- Vidrio del vestíbulo detrás, con montantes oscuros verticales tupidos: ✅.
- Claraboya o luz cenital sobre la escalera: ❓ (PLAN-OBRA: "claraboya sobre la escalera → fase 5").
- Columna redonda: ✅.

### i05 · suite de los padres, mirando al baño
- Parqué en cuadros: ✅.
- Muro izquierdo rosa pálido: ⚠️ (#18, confirmado por esta foto).
- **Hoja de puerta blanca con tableros**, abierta, entre suite y baño: ❌ el modelo solo tiene puertas lisas gris-café (#29).
- Diván, claraboya, cortina y lavamanos: ✅.
- Pilar o tabique blanco con azulejo a la derecha de la cortina: ❓ (#30).
- Al fondo, pasillo con muros rosados y marco oscuro: ❓ color del pasillo (#10).

### i06 · planta baja · ventanal con barras negras hacia la gravilla y el prado
- Ventanal con barras horizontales **negras** y alféizar blanco: ✅ si es el de la rampa en planta baja; ❓ ubicación exacta (#1).
- Puerta oscura a la derecha: ❌ (#26).

### i08 · baño de los padres desde el lavamanos
- Plataforma, bañera, diván, azulejo blanco en hileras, claraboya, cortina y piso blanco: ✅.
- **Escalón bajo** al frente de la plataforma: ❌ (#31).
- Al fondo, el dormitorio con **mueble bajo bajo la ventana**: ❌ (#32, muebles fijos bajo ventanas).
- Marco café oscuro a la derecha: ❓ (#26).

### i09 · rampa interior llegando al piso principal
- Piso antracita: ✅ · pasamanos negro: ❌ (#1).
- **Aplique de pared** en el descanso: ❌ (#28).
- Ventanas altas con barras arriba a la derecha: ❓ (#1).
- Cielo inclinado = bajo del tramo superior: ✅.

### i10 · cuarto azul (boudoir)
- **Solo el muro de la puerta es azul ultramar**; los demás, blancos: ⚠️ (#5, confirmado).
- Puerta lisa gris-café con manija: ✅.
- Parqué en cuadros: ✅.
- **Mueble bajo empotrado bajo la cinta de ventanas**: puertas corredizas grises y tapa oscura. ❌ (#32).
- Carpintería de la ventana **blanca o gris clara** por dentro: ⚠️ (#17: ya van dos fotos que la muestran clara).
- Tapete gris: prop del museo, no se modela.

### i07 · baño de los padres desde el frente (ya revisada el 29-sep)
- Plataforma en L, bañera, diván, lavamanos, WC y radiador: ✅.
- Borde izquierdo de la plataforma contra el muro: ✅ (corregido hoy).

### i11 · planta baja · vestíbulo, escalera y pasillo
- Escalera, columnas y puertas oscuras al fondo: ✅ escalera y columnas · ❌ puertas (#26).
- Zócalo gris en columnas y muros: ❌ (#25).
- Paño de vidrio a la izquierda con montantes claros: ✅ (herradura).
- Mesa expositora y radiador: prop del museo / ❌ radiador de planta baja (#34).

### i12 · dormitorio (cuarto del hijo o de huéspedes) mirando al pasillo
- Parqué en cuadros: ✅ · muro derecho **rosa pálido**: ❓ qué cuarto es (#18).
- Columna redonda exenta: ✅ si coincide con los pilotis prolongados (❓).
- Mueble bajo empotrado bajo la ventana (puertas grises y tapa oscura): ❌ (#32).
- Radiador blanco de columnas: ❌ (#34).
- Puerta abierta hacia el **pasillo azul (bleu charron)**: ✅ azul del pasillo · puerta lisa ✅.
- Aplique sobre la puerta: ❌ (#28).

### i13 · planta baja · vestíbulo desde el lavamanos
- **Lavamanos exento** en primer plano: ❌ (#27).
- **Puerta de entrada doble, negra**, en el paño de vidrio: ❓ (#33, verificar que exista en la herradura).
- Arranque de la rampa, antepechos blancos y pasamanos negro: ✅ antepechos · ❌ pasamanos (#1).
- **Lámparas colgantes** y apliques: ❌ (#28).
- Piso de baldosa clara con zócalo gris: ✅ · ❌ (#25).

### i14 · contrapicado hacia una claraboya o pozo de luz con un artefacto oscuro colgado
- Recinto sin identificar: ❓ (#35, ubicar; puede ser el baño de huéspedes o el del chofer).

### i15 · rampa interior, tramo superior
- Piso antracita: ✅.
- **Abertura triangular** en el muro central: ✅ (modelada).
- Pasamanos negro: ❌ (#1).
- **Aplique tubular** sobre el muro y plafón en el cielo: ❌ (#28).

### i16 · puerta café oscuro con **luces laterales y montante vidriado**, pasillo con cinta de ventanas
- Puerta con vidrios laterales y superior: ❌ (#29); ubicación ❓, probablemente la salida de servicio de la cocina a la terraza.
- Zócalo gris: ❌ (#25).
- Carpintería blanca de la cinta por dentro: ⚠️ (#17).

### i17 · cocina, rincón de ventanas
- Piso de baldosa tostada cuadrada: ✅.
- **Mesa central** de tapa blanca y patas delgadas: ❌ (#6, cocina después de la fase 5).
- **Mesones de azulejo blanco** a lo largo de las ventanas, con tubería vista abajo: ❌ (#6).
- Radiadores blancos bajo las ventanas: ❌ (#34).
- Azulejo solo en el salpicadero bajo; muro blanco arriba: ⚠️ (#6).
- Ventanas en esquina, carpintería clara: ⚠️ (#17).

### i18 · rampa, piso principal · remate del muro central
- Piso antracita: ✅ · remate inclinado del muro central: ✅.
- **Vano rectangular con 3 barras negras horizontales** (baranda empotrada) junto al remate: ❌ (#1).
- Elemento vertical negro en el vano: ❓ (#1).

### i19 · cocina · muebles
- **Alacenas y bajos de puertas corredizas de aluminio**, repisas abiertas y salpicadero de azulejo: ❌ (#6).
- Puerta oscura: ✅ si es la puerta gris-café.
- Mesa central y piso tostado: ❌ mesa · ✅ piso.

### i21 · lavandería (planta baja)
- **Pileta larga de hormigón** con cuatro llaves de bronce y tubería blanca vista: ❌ (#36).

### i22 · cocina · pasaplatos o despensa hacia la ventana
- Alacenas con **vidrio esmerilado corredizo** a ambos lados y mesones de azulejo blanco: ❌ (#6).
- Pileta bajo la ventana y radiador: ❌ (#6).
- Piso tostado: ✅.

### i23 · cocina · mesón bajo la ventana
- Mesón de azulejo blanco con **tabla de madera** encima: ❌ (#6).
- Ventanas corredizas de carpintería **blanca**: ⚠️ (#17).

### i24 · cocina · pileta doble bajo la ventana
- Pileta doble de azulejo con cuatro llaves, mesón de azulejo, aplique de pared y radiador: ❌ (#6, #28, #34).

### i25 · cocina · alacena
- Alacena alta y baja de **aluminio corredizo**, repisas y salpicadero de azulejo 10×10: ❌ (#6).

### i26 · baño de los padres (foto antigua, luz cálida)
- **Aplique globo** sobre el lavamanos: ❌ (#28).
- Escalón bajo al frente de la plataforma: ❌ (#31).
- **Volumen alto de azulejo blanco** a la derecha (clóset o tabique): ❓ (#30).

### i27 · cocina · esquina de ventanas con pileta
- Igual que i24; ventana en esquina con carpintería blanca: ❌ (#6) · ⚠️ (#17).

### i28 · salón desde la vidriera, mirando al extremo rosa
- Muro rosa del extremo, con su ventana: ✅.
- **Radiador oscuro** (café o negro) bajo la ventana del muro rosa: ⚠️ (#34: en el modelo son grises).
- **LC4 negra** junto al muro rosa: ⚠️ el modelo tiene la LC4 de pony en otro lugar (❓ posición, #38).
- **Chimenea**, bloque de ladrillo con tapa oscura junto a la columna: ❌ (#3).
- **Mesón bajo corrido** bajo la cinta, con puertas grises y tapa oscura: ❌ (#9).
- Canaleta de luz, LC2, columnas adentro y piso beige: ✅.
- **Taburete negro**: prop del museo (no se modela) ❓.
- Afuera: **jardinera a lo largo del pie de la vidriera**: ❌ (#20, confirmado).

### i29 · salón mirando al extremo rosa (otro ángulo)
- Chimenea de ladrillo con tapa oscura **adosada a una columna**: ❌ (#3).
- Mesón gris con tapa oscura bajo la cinta: ❌ (#9).
- Radiador oscuro bajo la ventana rosa: ⚠️ (#34).
- LC4, LC2, canaleta y columnas: ✅ (posición de la LC4 ❓ #38).

### i30 · salón, lado de la cinta · chimenea
- **Chimenea**: marco grueso de concreto gris oscuro, hogar de ladrillo abierto por delante; la tapa oscura **sigue sin corte hasta el mesón** bajo la cinta, junto a una columna. ❌ (#3 y #9 son UNA pieza).
- Radiadores claros dentro del mesón: ❌ (#34).
- Columnas, canaleta, LC2, piso beige y muro rosa del extremo: ✅.

### i32 · dormitorio con estantería de colores (exposición)
- Estantería de colores y silla negra: prop del museo, no se modela.
- Parqué, radiador blanco y cortinas blancas en la cinta: ✅ · ❌ (#34) · ❌ **cortinas** (#39).

### i33 · dormitorio u oficina · ventana con repisa
- **Repisa o escritorio corrido gris oscuro** bajo la cinta: ❌ (#32).
- Radiador blanco y aplique: ❌ (#34, #28).
- Carpintería blanca: ⚠️ (#17).

### i34 · salón con paneles de exposición
- Paneles y mesas de la exposición: props, no se modelan.
- Chimenea y mesón, columnas, canaleta y rosa: ❌ (#3/#9) · ✅ el resto.

### i35 · chimenea y mesón, detalle
- Tapa gris oscura continua de la chimenea al mesón; frente del mesón con paneles grises y radiadores: ❌ (#3/#9). **Medidas de referencia**: tapa a ~0,75 m, mesón de fondo ~0,6 m.

### i36 · hogar de la chimenea, detalle
- Marco gris oscuro de ~12 cm, ladrillo rojo adentro, fondo con hollín, piso del hogar de ladrillo: ❌ (#3).

### i37 · cocina · pileta doble, detalle
- Pileta de azulejo blanco con cuatro llaves cromadas de cuello alto: ❌ (#6).

### i38 · hall del piso principal · escalera y paño hacia el pozo de la rampa
- Escalera con barandas negras y zócalo gris: ✅ · ❌ zócalo (#25).
- Paño de vidrio del lado del hall con **barras horizontales claras**, tras la escalera: ✅ el paño · ⚠️ color de las barras (#1).
- Piso claro del hall y columna: ✅.

### i39 · cocina · alacena de vidrio esmerilado corredizo con tiradores blancos
- ❌ (#6).

### i40 · cuarto con **estantería empotrada de vidrios de colores** en dos muros, sobre radiadores
- ❓ (#40): puede ser pieza original o exposición. Ubicarla antes de modelar. Parqué y radiadores: ✅ · ❌ (#34).

### i41 · escalera, tramo recto
- **Huellas oscuras** (baldosa negra o gris antracita): ⚠️ (#8, confirmado; en el modelo son blancas).
- Banda blanca, pasamanos negro y ventana horizontal alta: ✅ · ❓ ventanita (#41).

### i42 · escalera vista desde arriba
- Huellas de **baldosa oscura con junta**, compensadas en la curva: ⚠️ (#8).
- Pasamanos negro y remate curvo: ✅.

### i43 · planta baja · escalera con muro azul oscuro detrás
- **Paño azul ultramar oscuro** vertical detrás de la escalera: ❌ (#45, polychromie de planta baja).
- Puerta con **marco café oscuro**, abierta: ❌ (#26).
- Zócalo gris y piso claro: ❌ (#25) · ✅.

### i44 · piso principal · hall junto a la rampa
- Muro central de la rampa con remate inclinado: ✅.
- **Muro café chocolate** detrás de una columna, con puerta: ❌ (#43, polychromie del hall del piso principal).
- Rampa con piso antracita: ✅.

### i46 · baño de los padres, rincón de sanitarios (bidé, lavamanos, radiador) bajo la claraboya
- Bidé o WC, lavamanos de pedestal, radiador blanco, azulejo blanco en hileras, claraboya y puerta oscura: ✅.
- **Pilar gris** junto al lavamanos: ⚠️ (#44: en el modelo ese pilar es blanco o no existe, ❓).
- **Aplique** en el pilar: ❌ (#28).

### i47 · planta baja · rampa desde el vestíbulo
- Pasamanos negro sobre el antepecho: ❌ (#1).
- **Puerta de entrada doble negra** al fondo: ❓ (#33).
- Lavamanos exento: ❌ (#27).
- Piso de baldosa clara en diagonal y zócalo gris: ⚠️ (el modelo pone baldosa a escuadra) · ❌ (#25).
- Instalación de ramas rojas: exposición, no se modela.

### i48 · planta baja · vestíbulo, columna, escalera y arranque de la rampa (blanco y negro)
- Ventanal inclinado con **barras horizontales claras** siguiendo la rampa: ✅ si coincide con el vidrio de planta baja (❓ color de barras, #1).
- Piso de la rampa antracita: ✅ · baldosa del vestíbulo: ✅.

### i49 · planta baja · vestíbulo completo
- **Colores en planta baja**: muro gris azulado a la izquierda, paño azul oscuro detrás de la escalera, muro y puertas café chocolate a la derecha. ❌ (#45).
- Ventana alta horizontal con barras sobre el muro izquierdo: ❓ (#46).
- **Bombillo desnudo** en el cielo: ❌ (#28).
- Escalera con barandas negras y columna: ✅.

### i50 · salón desde el extremo rosa hacia el muro azul
- **Radiadores blancos** bajo toda la cinta: ⚠️ (#34: en el modelo son grises y no los hay en toda la cinta).
- Mesón y chimenea al medio: ❌ (#3/#9).
- **Viga descolgada** atravesando el cielo raso: ❌ (#47, ver también S8 58).
- Muro azul al fondo con puerta y columnas: ✅.

### i51 · cuarto azul (boudoir) · muro de la puerta
- Solo el muro de la puerta es azul: ⚠️ (#5, confirmado otra vez).
- Mueble bajo con paneles grises y tapa oscura bajo la ventana: ❌ (#32).
- Radiador blanco: ❌ (#34) · **aplique lineal** sobre la puerta: ❌ (#28).
- Puerta abierta a un recinto con mesón de azulejo (baño o vestidor): ❓ (#35).

### i52 · baño de los padres desde el lavamanos (foto reciente)
- Todo coincide: ✅.
- Escalón bajo al frente de la plataforma: ❌ (#31).
- Luz en cornisa: moderna, no se modela.

### i53 · planta baja · escalera y columna
- Paño azul oscuro: ❌ (#45) · marco oscuro de puerta: ❌ (#26) · radiador: ❌ (#34).

### i55 · salón (foto ANTIGUA, otra restauración)
- **Columna roja** junto a la chimenea y un extremo azul claro con ventana: son colores de una restauración anterior. Hoy esa columna es blanca (i30, i35). Por la decisión D1 (la Villa de hoy) **no se modela**; queda como dato histórico (#48).

### i56 · salón desde el comedor, mirando a la terraza y al extremo rosa
- Mesa LC6 de vidrio con patas ovaladas grises: ✅.
- Muro del fondo lavanda-gris: ✅ (#2).
- **Puerta vidriada con marco oscuro** hacia el hall: ❌ (#29).
- **Barra horizontal negra** a ~0,9 m cruzando la vidriera (baranda o travesaño): ❌ (#49; se ve también en i28).
- Afuera, jardinera al pie de la vidriera: ❌ (#20).
- Chimenea de ladrillo, LC2 y canaleta: ❌ (#3) · ✅.

### i20 · rampa interior, piso principal (subiendo)
- Piso antracita: ✅.
- Pasamanos negro sobre el antepecho izquierdo: ❌ (#1).
- Ventanales con **barras claras** arriba a la izquierda: ✅ desde hoy (triángulo superior) · ⚠️ color de barras (#1).
- **Ranura inclinada en el muro derecho con pasamanos empotrado**: ❌ (#50).
- Puerta gris al fondo y columnas: ✅.

### i57 · salón mirando a la terraza (foto antigua, suelo mojado)
- Vidriera con **barra horizontal negra**: ❌ (#49).
- Afuera, **jardinera larga al pie de la vidriera**: ❌ (#20).
- Rampa exterior con vidrio rayado, kiosque y **losas grises**: ✅ rampa (desde hoy) · ❌ losas grises (#11).
- LC4 de pony junto a la vidriera: ✅.
- **Muro café oscuro** a la izquierda (lado comedor/hall): ❓ (#43).

### i59 · salón desde el lado azul hacia el rosa
- Barra negra en la vidriera: ❌ (#49) · radiador oscuro bajo la ventana rosa: ⚠️ (#34) · mesón y chimenea: ❌ (#3/#9).
- LC6 con patas grises, LC2 y canaleta: ✅.

### i60 · como i56, desde el comedor
- Mismos puntos que i56: ❌ #49, #20, #3.

### i31 · rampa interior, piso principal · antepecho al hall y ventanales hacia la terraza
- Piso antracita: ✅ · antepecho hacia el hall con columna y radiador detrás: ✅ antepecho · ❌ radiador (#34).
- Banda inclinada con **ventanal de barras** arriba: ✅ desde hoy.

### i45 · desde el hall hacia el pozo de la rampa
- Bandas inclinadas y ventanales con barras claras; se ve la terraza detrás: ✅ desde hoy · ⚠️ color de barras (#1).

### i54 · piso principal · hall con escalera y rampa
- Piso de la rampa antracita con antepecho y pasamanos negro: ✅ · ❌ pasamanos (#1).
- Escalera, columnas, piso claro del hall y puertas oscuras al fondo: ✅.

### i58 · salón mirando al muro azul (revisada hoy)
- Muro azul lavanda con la puerta a la derecha: ✅ (#2).
- Cinta a la izquierda con **radiadores blancos**: ⚠️ (#34).
- Chimenea y mesón: ❌ (#3/#9) · **viga transversal**: ❌ (#47).

**Interiores: 60 de 60 revisadas** (i01–i60).

## Exteriores

### e01 · fachada con planta baja (pasto en primer plano)
- Volumen blanco, cinta, pilotis y bloque verde: ✅.
- **Paño de vidrio en planta baja con lamas o barras horizontales BLANCAS** entre bloques verdes: ❌ (#22, confirmado).
- Solárium asomando: ✅.

### e02 · fachada frontal, simétrica
- Vidrio central de planta baja con barras blancas y bloques verdes en los extremos: ❌ (#22) · ✅ verde.
- Arbustos redondos en el pasto: ❌ (#51, jardín: arbustos sueltos junto al camino).

### e04 · fachada, esquina con el bloque verde
- **Carpintería exterior de la cinta: roja-café (granate)**: ✅ en el modelo es café. Esto cierra #17: afuera es granate, adentro blanca. Hay que pintar **dos caras**.
- Planta baja: paño con barras oscuras y **bloque verde con ventana cuadriculada**: ❌ (#4).
- Gravilla: ✅.

### e05 · bajo los pilotis, junto al vidrio curvo (nieve)
- Vidrio curvo con montantes oscuros tupidos, pilotis y gravilla: ✅.

### e06 · vista general con solárium
- ✅ volumen, solárium y pilotis.

### e07 · rampa exterior desde la cubierta, mirando hacia la terraza
- Losas grises de la rampa en diagonal: ✅.
- Baranda de 4 tubos blancos sobre el muro alto: ✅.
- **En ESE muro (el central), bajo la baranda, un triángulo de vidrio con barras oscuras**: ❌ (#1; el modelo lo tiene macizo).
- Muro bajo a la izquierda y la terraza al fondo: ✅.

### e08 · terraza desde la rampa exterior
- Losas grises grandes con junta de pasto: ❌ (#11).
- Mesa de tablero delgado junto al vano: ✅.
- **Jardinera junto a la vidriera** con plantas en los extremos y **un paño vidriado al centro** (claraboya hacia abajo): ❌ (#20 y #52).
- Lila en flor en primer plano: jardinera de la rampa ❓ (#53).

### e09 · rampa exterior, tramo alto
- Losas grises en diagonal: ✅ · baranda de tubos blancos sobre el muro bajo: ✅ · muro alto liso: ✅.

### e11 · desde el salón hacia la terraza
- **Dos jardineras**: una baja al pie de la vidriera (primer plano) y la U contra el muro, con un arbusto grande: ❌ (#20) · ✅ U.
- **Ventana cuadrada oscura** en el muro junto a la U: ❌ (#19).
- Mesa, vano del kiosque y vidrio rayado de la rampa: ✅.

### e12 · no existe en el servidor (404)

### e14 · desde el salón (con la barra negra de la vidriera en cuadro)
- Barra horizontal negra de la vidriera: ❌ (#49).
- **Jardinera de la vidriera con una claraboya de vidrio inclinada** entre las plantas: ❌ (#20, #52).
- Losas grises y la U con arbusto: ❌ (#11) · ✅.
- Pozo de la rampa con ventanitas rayadas: ✅.

### e16 · rampa desde la terraza (con la chimenea alta atrás)
- Triángulo rayado arriba del antepecho y **triángulo rayado chico abajo**, al final del tramo: ✅ desde hoy.
- Machón con **puerta oscura**: ⚠️ (#23).
- **Chimenea alta y delgada** sobre la cubierta: ⚠️ (#14).
- Jardinera de la vidriera con plantas: ❌ (#20).

### e17 · rampa exterior subiendo desde la terraza
- Losas grises en diagonal: ✅.
- Remate del muro bajo de la rampa: **pasamanos blanco grueso y redondeado** sobre el muro: ⚠️ el modelo pone tubos (❓ comparar con e09, que muestra tubos; pueden ser dos tramos distintos, #1).
- En la cubierta, **jardineras con plantas** y **dos postes-farol negros**: ❌ (#21, #54).

### e19 · kiosque
- Losas grises con junta: ❌ (#11).
- **Ventana del fondo vidriada** con carpintería oscura y vano lateral abierto: ⚠️ (#7).
- Caja de luz en el muro del fondo: ❌ (#28).

### e20 · desde el kiosque hacia la vidriera del salón
- Vidriera con **marcos negros gruesos**: ✅ · mesa: ✅ · jardinera de la vidriera: ❌ (#20).
- **Plantas asomando sobre el borde de la cubierta**, encima del salón: ❌ (#21).
- Arbusto grande en la U: ✅.

### e21 · como e20, más cerca
- Mismos puntos: ❌ #20, #21 · ✅ vidriera, mesa y U.
- Baranda de tubos en el borde de la cubierta: ✅.

### e25 · pozo de la rampa desde la terraza
- Triángulos rayados arriba y abajo: ✅ desde hoy.
- Puerta oscura del machón: ⚠️ (#23) · chimenea alta: ⚠️ (#14).
- Jardinera de la vidriera: ❌ (#20) · arbusto en la U: ✅.

### e26 · planta baja bajo los pilotis, vidrio curvo
- Vidrio curvo con montantes oscuros, pilotis, gravilla y pasto: ✅.
- **Puerta de entrada oscura** en la curva: ❓ (#33).
- Cinta con carpintería oscura por fuera: ✅.

### e28 · fachada del acceso con las pantallas del solárium
- Pantallas del solárium con su ventana, volumen, cinta y pilotis: ✅.
- Vidrio curvo con montantes oscuros y **puerta de entrada oscura** al centro: ✅ · ❓ (#33).
- Chimenea delgada entre las pantallas: ⚠️ (#14).

### e29 · desde el kiosque hacia la vidriera (con gente)
- Vidriera con marcos negros: ✅ · jardinera de la vidriera: ❌ (#20) · plantas en la cubierta: ❌ (#21).
- U con arbusto: ✅ · losas grises: ❌ (#11).

### e30 · terraza hacia la vidriera
- **Barra negra horizontal** cruzando la vidriera: ❌ (#49).
- Mesa, jardinera de la vidriera y plantas en la cubierta: ✅ · ❌ #20 · ❌ #21.

### e31 · vano este de la terraza con la mesa
- Vano con baby pilotis y mesa de tablero delgado **pegada al antepecho del vano**: ✅ (❓ posición fina de la mesa).
- Arbusto de la U en primer plano: ✅.

### e32 · terraza desde la rampa, hacia la vidriera
- **Jardinera de la vidriera con paño de vidrio al centro**: ❌ (#20, #52).
- Plantas altas sobre la cubierta, detrás de la vidriera: ❌ (#21).
- Barra negra en la vidriera: ❌ (#49) · losas grises: ❌ (#11).

### e33 · vano este de la terraza hacia el kiosque
- Mesa larga paralela al antepecho, vano y kiosque: ✅.
- **Farol o cámara** en la esquina del kiosque: ❌ (#28).

### e34 · desde lo alto de la rampa hacia la vidriera
- Jardinera de la vidriera con claraboya: ❌ (#20, #52).
- En la cubierta: **jardineras elevadas con plantas** y un farol: ❌ (#21, #54).
- Baranda de tubos blancos: ✅.

### e35 · desde la rampa hacia el kiosque
- **Cubierta del kiosque de GRAVILLA**: ❌ (#55: en el modelo es losa blanca).
- U contra el muro con arbusto y **ventana oscura** en ese muro: ✅ · ❌ (#19).
- Mesa en el vano y losas grises: ✅ · ❌ (#11).

### e36 · como e34, desde otro punto de la rampa
- Mismos puntos: ❌ #20, #21.

### e37 · desde la rampa · kiosque y U
- Cubierta del kiosque de gravilla: ❌ (#55).
- **Ventana oscura con un objeto rojo** (lámpara) en el muro junto a la U: ❌ (#19).
- Losas de la rampa y baranda de tubos: ✅.

### e38 · jardín de la cubierta (solárium)
- **Jardineras elevadas de hormigón blanco con árboles pequeños, arbustos y coníferas**; caminos de **gravilla**: ❌ (#21, #55).
- Chimenea alta, pantallas y baranda: ⚠️ (#14) · ✅.

### e39 · solárium · la banca de la ventana
- **Banca de losa blanca sobre patas**, delante de la ventana de la pantalla: ❌ (#15, confirmado).
- **Lavanda** en jardineras contra la pantalla: ❌ (#21).
- **Piso de gravilla** con franja de losas junto a la banca: ❌ (#55).

### e40 · cubierta · jardinera elevada y boca de la rampa con baranda
- Jardinera elevada con plantas: ❌ (#21).
- Baranda de tubos en la boca de la rampa y caja blanca (brocal o caja de la escalera): ✅.
- Losas grises: ⚠️ (#55: en el modelo la cubierta es baldosa con junta de pasto).

### e41 · solárium · pantalla curva y llegada de la rampa
- Pantalla curva, baranda y **poste blanco** (farol o bolardo): ✅ · ❌ (#54).
- Piso de gravilla y losas: ❌ (#55).

### e42 · vano este hacia el kiosque con la mesa
- ✅ vano, baby pilotis y mesa · ❌ losas grises (#11).

### e43 · desde el kiosque hacia la vidriera
- U con arbusto, jardinera de la vidriera, plantas en la cubierta y machón con puerta: ✅ · ❌ #20 · ❌ #21 · ⚠️ #23.

### e44 · fachada del acceso · vidrio curvo y puerta
- Vidrio curvo con montantes oscuros y puerta de entrada oscura: ✅ · ❓ (#33).
- Carpintería de la cinta oscura por fuera: ✅.

### e45 · vidrio curvo de cerca
- Montantes verticales oscuros tupidos: ✅.
- **Travesaño horizontal** alto en el vidrio: ❓ (#56).
- **Puerta de entrada** doble oscura con **farol** al lado: ❓ (#33) · ❌ (#28).

### e46 · fachada opuesta al acceso, con pasto alto
- Volumen, cinta, pilotis y caja de la escalera del solárium: ✅ · **pradera de pasto alto**: ✅.

### e47 · desde el vestíbulo hacia afuera, por el vidrio curvo
- **Montantes CLAROS (blancos) por dentro**; por fuera se ven oscuros (e05, e45): ⚠️ (#57, dos tonos).
- **Puerta de servicio oscura** dentro del paño curvo: ❓ (#33).
- **Travesaño horizontal** a ~2,3 m: ❓ (#56).
- Baldosa clara y zócalo: ✅ · ❌ (#25).

### e48 · como e46
- ✅.

### e49 · esquina con el bloque verde
- Bloque verde con **portones de garaje** (paneles con manija vertical): ❌ (#58).
- Cinta y pilotis: ✅.

### e50 · esquina del kiosque sobre el bloque verde
- Vano de la terraza en esquina con baby pilotis: ✅.
- **Portón verde con manija vertical, puerta oscura, ventana con barras oscuras y rejilla de lamas blancas**: ❌ (#4, #58).
- Dos perforaciones de ventilación en lo alto de la fachada: ❌ (detalle menor, #28).

### e51 · acceso · vidrio curvo y puertas
- Vidrio curvo con barras oscuras y **travesaño horizontal**: ✅ · ❓ (#56).
- **Puertas de entrada oscuras** (una doble y una simple) y **felpudo de rejilla**: ❓ (#33) · ❌ (#59).

### e52 · acceso de frente, bajo los pilotis
- Vidrio curvo con barras verticales y **travesaño alto**: ✅ · ❓ (#56).
- **Puerta principal oscura** (una hoja grande) con otra abierta y felpudo: ❓ (#33) · ❌ (#59).
- Escalera visible adentro: ✅.

### e53 · e54 · fachada del acceso de frente
- Pantallas del solárium con su ventana, cinta, pilotis y vidrio curvo: ✅.

### e55 · fachada lateral con el bloque verde entero
- Muro verde corrido en planta baja, cinta, vano de la terraza y caja de la escalera: ✅.

### e56 · fachada en blanco y negro
- ✅ volumen, cinta, pilotis y solárium. Un paño blanco opaco en la cinta (cortina o panel): ❓ (#39).

### e13 · desde el salón hacia la terraza
- **Barra negra horizontal a ~1 m** cruzando la vidriera: ❌ (#49, se ve clarísima).
- Jardinera de la vidriera en primer plano: ❌ (#20).
- Mesa y vano al fondo, columna adentro y LC6: ✅ (columna corregida hoy).

### Exteriores revisadas antes en esta sesión
- **e03** fachada: bloque verde sin ventanas en el modelo ❌ (#4).
- **e10** banca del solárium ❌ (#15) y lavanda ❌ (#21).
- **e15** y **e18** kiosque: U contra el muro ✅, ventana oscura ❌ (#19), losas grises ❌ (#11).
- **e22** y **e24** fachada con lamas blancas en planta baja ❌ (#22).
- **e23** rampa y triángulo ✅ desde hoy, puerta oscura ⚠️ (#23), jardinera de la vidriera ❌ (#20), plantas en la cubierta ❌ (#21).
- **e27** kiosque desde la terraza ✅ (sin espejo).

**Exteriores: 55 de 56 revisadas** (e12 no existe en el servidor).

---

## RESUMEN — lista maestra de trabajo

**Revisadas: 115 fotos** (60 interiores + 55 exteriores; e12 no existe en el servidor).

Lo que **coincide** con las fotos:
- el volumen y los niveles;
- los pilotis y el vidrio curvo;
- la cinta de ventanas;
- el solárium;
- la rampa, en su forma y con el triángulo corregido;
- la escalera, en su forma;
- los colores del salón;
- el baño de los padres;
- los parqués;
- las puertas lisas;
- la jardinera en U y la mesa de la terraza.

Lo que falta es sobre todo **habitado y detalle**, y casi toda la **planta baja**.

### A. Correcciones de lo ya hecho (se ve MAL, no solo incompleto)
| # | Qué | Fotos |
|---|---|---|
| 1 | Rampa: **pasamanos negros**; vidrio rayado también en el **muro central** del tramo exterior; ranura con pasamanos empotrado; vano con 3 barras negras; color de las barras (claras por dentro, oscuras por fuera) | i02, i09, i15, i18, i20, e07 |
| 5 | Boudoir: azul **solo** en el muro de la puerta | i10, i51 |
| 8 | Escalera: **huellas de baldosa oscura** | i41, i42 |
| 11 | Terraza: **losas grises con junta de pasto** | e08, e13, e19, e29… |
| 14 | Chimenea de la cubierta **alta y delgada** | e16, e25, e28, e38 |
| 17 | Carpintería de la cinta: **granate por fuera, blanca por dentro** (dos caras) | e04 · i10, i16, i23, i33 |
| 18 | Suite: muro **rosa pálido** | i05 |
| 23 | Puerta del machón de la terraza: **oscura** | e16, e23, e25 |
| 34 | Radiadores: **blancos** bajo toda la cinta (hoy grises y pocos) y **oscuros** bajo la ventana rosa | i12, i50, i58 · i28, i29 |
| 57 | Montantes del vidrio curvo: **claros por dentro**, oscuros por fuera | e47 |

### B. Piezas que faltan, de más a menos visibles
| # | Qué | Fotos |
|---|---|---|
| 3 + 9 | **Chimenea + mesón**: UNA pieza. Tapa de concreto gris oscuro continua, hogar de ladrillo junto a una columna, mesón bajo la cinta con paneles grises | i28–i30, i34–i36, i50, i59 |
| 20 + 52 | **Jardinera al pie de la vidriera** con plantas y una **claraboya vidriada** al centro | e08, e11, e13, e14, e20, e32, i57 |
| 49 | **Barra horizontal negra a ~1 m** cruzando la vidriera del salón | e13, e14, e30, i56, i57, i59 |
| 21 + 55 | **Jardín de la cubierta**: jardineras elevadas con árboles pequeños, arbustos, coníferas y lavanda; caminos de **gravilla**; **gravilla en la cubierta del kiosque** | e10, e17, e34–e41 |
| 15 | **Banca del solárium** | e10, e39 |
| 19 | **Ventana cuadrada oscura** en el muro junto a la U | e11, e15, e18, e35, e37 |
| 22 + 4 + 58 | **Planta baja en fachada**: paño con **barras o lamas blancas**; bloque verde con **ventanas cuadriculadas** y **portones de garaje**; rejilla de lamas | e01, e02, e04, e22, e24, e49, e50 |
| 32 | **Muebles bajos empotrados bajo las ventanas** de los dormitorios (puertas grises, tapa oscura) y repisa corrida | i08, i10, i12, i33, i51 |
| 47 | **Viga transversal** en el cielo raso del salón | i50, i58 |
| 29 | Puertas especiales: **blanca con tableros** (suite), **vidriada con marco oscuro** (salón/hall), **con luces laterales y montante** (servicio) | i05, i16, i56 |
| 31 | **Escalón** al frente de la plataforma del baño | i08, i26, i52 |
| 45 + 43 | **Polychromie de planta baja**: gris azulado, **azul oscuro detrás de la escalera**, café chocolate; y **café chocolate** en el hall del piso principal | i43, i44, i49, i53 |
| 25 | **Zócalo gris** en muros, columnas y escalera | i01, i03, i04, i11, i13 |
| 24 + 26 + 27 + 36 | **Planta baja habitada**: pisos en diagonal, puertas y marcos oscuros, **lavamanos del vestíbulo**, **pileta de la lavandería** | i01, i13, i21, i47 |
| 6 | **Cocina** completa (después de la fase 5) | i17, i19, i22–i25, i27, i37, i39 |
| 28 | **Iluminación y accesorios**: apliques, colgantes, bombillos, faroles, interruptores | i01, i09, i13, i15, i26, i49, e33 |
| 54 | **Faroles o postes** en la cubierta | e17, e34, e41 |
| 59 | Felpudo de rejilla en el acceso | e51, e52 |
| 39 | Cortinas blancas en algunos dormitorios | i32, e56 |
| 51 + 53 | Jardín: arbustos junto al camino; lila y arbustos de la rampa | e02, e08, e16 |

### C. Por confirmar con render u otra fuente (❓)
- **#33** puertas del acceso en el vidrio curvo;
- **#56** travesaño alto del vidrio curvo;
- **#35** baño o recinto de la claraboya de i14;
- **#30** pilar o volumen de azulejo del baño;
- **#40** estantería de vidrios de colores (original o exposición);
- **#41** ventanita de la escalera;
- **#46** ventana alta con barras en el vestíbulo;
- **#38** posición de la LC4;
- **#44** pilar gris del baño.

### D. No se modela
- Props de exposición: paneles, ramas rojas, estantería moderna, taburetes y la silla amarilla.
- **i55** (restauración antigua con la columna roja): se sigue la Villa de hoy (D1).

---

## Avance sobre la lista (30-sep, tarde)
**Resueltos**, cada uno comparado con render contra su foto:
- **#1** rampa:
  - vidrio rayado arriba del antepecho (S9 23, corte B-B);
  - **pasamanos negros** en los antepechos interiores (vestíbulo, hall, muro central del entrepiso bajo).
  - Queda por confirmar el vidrio del muro central del tramo exterior (e07).
- **#2** azul del salón, en el muro del fondo, medido en S8 58.
- **#5** boudoir: azul ultramar solo en el muro de la puerta (x 4,75), medido en i10.
- **#8** escalera: huella y contrahuella de baldosa oscura. De paso: la losa asomaba ocre en los bordes de los huecos → baldosa del hall.
- **#11** terraza y kiosque: losas grises de concreto de ~0,9 m con junta de pasto.
- **#14** chimenea de la cubierta, ~0,9 m sobre las pantallas.
- **#17** carpintería de la cinta en dos mitades: granate afuera, medido en e04; blanca adentro; con rieles de cabeza y antepecho.
- **#18** suite: muro del pasillo en rosa pálido, medido en i05.
- **#23** **machón de la terraza** con puerta angosta oscura. El modelo tenía ahí un hueco de piso a techo.
- **#57** montantes del vidrio curvo, claros por dentro.
- **#3 + #9** chimenea y mesón en una pieza (`scripts/villa_salon.py`).
- **#34** radiadores del salón: blancos bajo la cinta, oscuro bajo la ventana rosa. Faltan los de los demás recintos.
- **#15** banca del solárium.
- **#19** ventana oscura sobre la U.
- **#20 + #52** jardinera de la vidriera con claraboya.
- **#49** barra negra en la vidriera.
- Columnas del salón enteras adentro; la casa ya sin espejo.

**Siguen:**
- **#47** viga del salón;
- **#21 + #55** jardín de la cubierta y gravilla;
- **#22 + #4 + #58** planta baja en fachada;
- **#32** muebles bajo las ventanas;
- **#29** puertas especiales;
- **#31** escalón del baño;
- **#45 + #43** colores de planta baja y hall;
- **#25** zócalo gris;
- **#24–#27 y #36** planta baja habitada;
- **#28 y #54** iluminación;
- **#39** cortinas;
- **#59** felpudo;
- **#51 y #53** jardín;
- **#6** cocina, después de la fase 5.
