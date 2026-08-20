/*
  LA RUTA DE LA PROMENADE, EN UN SOLO LUGAR.

  Vivía dentro de promenadeRig.ts y el verificador tenía su propia copia
  pegada a mano. Las dos se desincronizaron y el chequeo dejó de significar
  algo. Ahora el rig la anima y el script la mide desde el mismo archivo.

  Las dos curvas tienen que llevar EL MISMO número de puntos: se recorren con
  getPoint (parámetro uniforme), así que el punto i de la mirada le
  corresponde al punto i del ojo. Con distinto largo, la mirada se
  desincroniza y termina apuntando a un muro.
*/


// Recorrido del ojo (alturas = piso + ~1.6 de estatura) — LA PLANTA REAL:
// cruza la puerta de la vidriera al salón, rodea el estar y el comedor,
// vuelve por la MISMA puerta, sale a la TERRAZA abierta al cielo y sube la
// rampa exterior al solárium. Verificado contra check-villa-tour: 0 choques.

export const RUTA: [number, number, number][] = [
  [0, 2.0, 26], // llegando por el jardin, la casa entera de frente
  [-0.7, 1.95, 15], // bajo el voladizo: la caja empieza a tapar el cielo
  [-0.7, 1.9, 8.5], // entre los pilotis, la herradura de vidrio a la izquierda
  [-0.7, 2.1, 4.0], // pie de la rampa
  [-0.7, 3.1, -1.0], // subiendo el tramo A
  [-0.7, 3.9, -5.5], // descanso norte
  [-0.7, 4.7, -1.0], // subiendo el tramo B
  [-0.7, 5.3, 2.1], // llega al nobile, dentro del corredor de la rampa
  [1.1, 5.3, 2.1], // cruza la puerta a la terraza
  [3.2, 5.3, 1.2], // la terraza se abre a cielo abierto
  [5.5, 5.3, 3.2], // hacia el panel corredizo
  [5.5, 5.3, 6.2], // CRUZA el panel: entra a la salle
  [1.5, 5.3, 7.8], // el salon en diagonal
  [-2.5, 5.3, 8.8], // el fondo suroeste, contra la cinta
  [-4.0, 5.3, 6.6], // gira junto a la cocina
  [-0.5, 5.3, 6.4], // vuelve hacia el panel
  [5.5, 5.3, 5.2], // re-cruza a la terraza
  [7.8, 5.3, 1.5], // el fondo este de la terraza
  [1.6, 5.3, 2.1], // de regreso a la puerta de la rampa
  [-0.7, 5.4, 1.6], // reentra al corredor
  [-0.7, 6.4, -2.5], // subiendo el tramo C, ya a cielo abierto
  [-0.7, 7.4, -6.0], // descanso alto
  [-0.7, 8.2, -1.5], // subiendo el tramo D
  [-0.7, 8.6, 2.5], // desemboca en la cubierta
  [-3.5, 8.6, 4.5], // hacia el solarium
  [-6.5, 8.7, 6.5], // remate: las pantallas curvas
];

export const MIRADA: [number, number, number][] = [
  [0, 3.2, 16], // la casa de frente
  [-0.7, 3.0, 6], // el bajo de la losa
  [-0.7, 2.6, 2], // la curva de vidrio
  [-0.7, 3.2, -2], // la pendiente por delante
  [-0.7, 3.8, -6], // el descanso al fondo
  [-0.7, 4.4, -1], // nivelada al giro
  [-0.7, 5.0, 3], // la llegada por delante
  [1.5, 5.3, 2.2], // la puerta de la terraza
  [3.5, 5.3, 1.4], // la terraza se abre
  [5.5, 5.2, 2.2], // hacia el panel
  [5.6, 5.2, 5.5], // el panel y el salon detras
  [3.0, 5.2, 7.6], // el salon se abre
  [-1.5, 5.2, 8.6], // el fondo del salon
  [-4.2, 5.2, 7.5], // la cinta de ventanas
  [-3.0, 5.2, 6.0], // hacia el panel de vuelta
  [3.0, 5.2, 5.8], // la terraza otra vez
  [7.5, 5.2, 3.0], // el fondo este
  [5.0, 5.2, 1.0], // de vuelta a la rampa
  [-0.5, 5.3, 1.6], // el corredor por delante
  [-0.7, 6.0, -2], // la pendiente C
  [-0.7, 7.0, -6], // nivelada al descanso
  [-0.7, 7.8, -2], // el tramo final
  [-0.7, 8.4, 2], // se abre el cielo
  [-2.5, 8.5, 4], // el solarium
  [-5.5, 8.5, 6], // las pantallas
  [-8.0, 8.5, 7.5], // remate en diagonal
];
