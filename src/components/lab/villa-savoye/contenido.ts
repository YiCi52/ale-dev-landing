/*
  Contenido de la Villa v2 (4-oct-2026): renders de Cycles por estación en
  lugar del 3D vivo. Cada imagen sale de una "estación de luz" del modelo de
  Blender (scripts/villa_estaciones.py en lab/villa-showroom), con la foto de
  referencia del museo con la que se comparó.
*/

const RUTA = "/lab/villa-savoye/v2";

export type Vista = {
  imagen: string;
  alt: string;
  titulo: string;
  texto: string;
  foto: string;
};

export const PORTADA: Vista = {
  imagen: `${RUTA}/llegada.webp`,
  alt: "La Villa Savoye desde el camino de llegada: volumen blanco sobre pilotis y la planta baja verde.",
  titulo: "La llegada",
  texto: "El auto entraba bajo la casa: la curva de la planta baja es el radio de giro de un Citroën.",
  foto: "e53 · e28",
};

export const RECORRIDO: Vista = {
  imagen: `${RUTA}/llegada-noche.webp`,
  alt: "La Villa Savoye de noche desde el camino de llegada: la ventana corrida y el vestíbulo encendidos.",
  titulo: "La llegada, de noche",
  texto: "Las luminarias son las que se ven en las fotos del museo: bombillos y colgantes en el vestíbulo, regletas y globos arriba.",
  foto: "i13 · i49 · e45",
};

export const PUNTOS: ReadonlyArray<Vista & { n: string }> = [
  {
    n: "01",
    titulo: "Los pilotis",
    texto:
      "La casa no toca el suelo: se posa sobre una retícula de columnas delgadas. El jardín sigue de largo por debajo.",
    imagen: `${RUTA}/llegada.webp`,
    alt: "Los pilotis que levantan el volumen sobre el jardín.",
    foto: "e53",
  },
  {
    n: "02",
    titulo: "La planta libre",
    texto:
      "Las columnas cargan; los muros ya no. El salón se abre de lado a lado sin un muro que lo sostenga.",
    imagen: `${RUTA}/salon.webp`,
    alt: "El salón del piso principal, abierto hacia la terraza.",
    foto: "i59",
  },
  {
    n: "03",
    titulo: "La ventana corrida",
    texto:
      "Liberada de cargar, la fachada se abre en una cinta continua de vidrio. El paisaje entra como panorama.",
    imagen: `${RUTA}/salon_terraza.webp`,
    alt: "La cinta de ventanas del salón mirando a la terraza.",
    foto: "i56 · i57",
  },
  {
    n: "04",
    titulo: "La fachada libre",
    texto:
      "La piel exterior es solo piel: un plano blanco que compone en libertad, sin estructura a la cual obedecer.",
    imagen: `${RUTA}/terraza.webp`,
    alt: "La terraza jardín, con la fachada abierta por la ventana corrida.",
    foto: "e27",
  },
  {
    n: "05",
    titulo: "La cubierta-jardín",
    texto:
      "La superficie que la casa le quitó al suelo se devuelve arriba, convertida en solárium y jardín.",
    imagen: `${RUTA}/solarium.webp`,
    alt: "El solárium de la cubierta con sus pantallas curvas.",
    foto: "e38",
  },
];

export const ESTACIONES: ReadonlyArray<Vista> = [
  {
    titulo: "I · El umbral",
    texto: "Se entra por la curva de vidrio a un vestíbulo bajo, con el lavamanos exento en medio.",
    imagen: `${RUTA}/vestibulo.webp`,
    alt: "El vestíbulo de planta baja con el lavamanos exento y el arranque de la rampa.",
    foto: "i13 · i49",
  },
  {
    titulo: "II · La rampa",
    texto: "La promenade sube despacio por una rampa que va del vestíbulo hasta la cubierta.",
    imagen: `${RUTA}/rampa_pb.webp`,
    alt: "La rampa interior subiendo junto a la ventana con barras.",
    foto: "i02 · i47",
  },
  {
    titulo: "III · El hall",
    texto: "Arriba la rampa desemboca en el hall del piso principal, junto a la escalera en caracol.",
    imagen: `${RUTA}/hall.webp`,
    alt: "El hall del piso principal con la escalera en caracol.",
    foto: "i38 · i54",
  },
];

export const RECINTOS: ReadonlyArray<Vista> = [
  {
    titulo: "La cocina",
    texto: "Alacena empotrada, mesón y pileta, con la baldosa cortada a 1,40 m.",
    imagen: `${RUTA}/cocina.webp`,
    alt: "La cocina con la alacena y el mesón bajo la ventana.",
    foto: "i17",
  },
  {
    titulo: "El boudoir",
    texto: "El cuarto azul junto a la suite, con su escritorio.",
    imagen: `${RUTA}/boudoir.webp`,
    alt: "El boudoir con el muro azul oscuro.",
    foto: "i51",
  },
  {
    titulo: "El baño de los padres",
    texto: "La tina embaldosada y la chaise longue de cerámica, bajo la claraboya.",
    imagen: `${RUTA}/bano.webp`,
    alt: "El baño de los padres con la tina y la chaise longue de cerámica.",
    foto: "i52",
  },
];
