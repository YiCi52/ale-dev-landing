"""
Estaciones de luz de la Villa (fase 5, 1-oct-2026) — base del recorrido de la fase 6.

Cada estación es una cámara con su EXPOSICIÓN y su BALANCE DE BLANCOS propios, como una cámara real en modo
manual. Adentro llega ~1/50–1/100 de la luz de afuera; las fotos de Archweb están expuestas para el interior
(+3 pasos) y con blancos neutros. Medido el 1-oct: con 5000 K / tinte 50 los muros blancos quedan en
azul/rojo 0,98–1,05 y verde/rojo 1,02–1,03 (antes 0,65–0,72 y ~1,0: amarillo-verdosos).

Uso: VILLA_ESTACION=<nombre> (villa-blender.py la convierte en VILLA_CAM=libre + exposición + balance).
Coordenadas de OBRA (la casa se refleja al final; la cámara va con ella). Foto de referencia de cada una.
"""
ESTACIONES = {
    # promenade architecturale (guion de la página: I umbral, II rampa, III salón y terraza, IV solárium)
    "llegada":       dict(pos=(13.5, 22.0, 1.7), mira=(0.0, 3.0, 2.6), lente=32, expo=0.0, k=None, foto="e53 / e28"),
    "vestibulo":     dict(pos=(0.5, 4.6, 1.5), mira=(-3.4, 0.8, 1.0), lente=20, expo=3.0, k=5000, foto="i13 / i49"),
    "rampa_pb":      dict(pos=(0.66, 3.4, 1.6), mira=(0.66, -6.0, 3.2), lente=20, expo=2.6, k=5000, foto="i02 / i47"),
    "rampa_n1":      dict(pos=(-0.66, 2.3, 4.95), mira=(-0.6, -6.0, 5.2), lente=20, expo=2.2, k=5000, foto="i20"),
    "hall":          dict(pos=(-0.2, 3.6, 4.95), mira=(-3.6, 1.2, 4.6), lente=20, expo=2.4, k=5000, foto="i38 / i54"),
    "salon":         dict(pos=(-4.0, 6.0, 4.95), mira=(6.0, 9.6, 4.4), lente=20, expo=1.0, k=5600, foto="i59"),
    "salon_terraza": dict(pos=(-1.0, 8.6, 4.95), mira=(5.5, 2.0, 4.3), lente=20, expo=0.8, k=5600, foto="i56 / i57"),
    "terraza":       dict(pos=(6.2, 3.5, 4.95), mira=(7.0, -8.0, 4.5), lente=22, expo=0.3, k=None, foto="e27"),
    "rampa_ext":     dict(pos=(7.6, -3.4, 4.95), mira=(0.6, 3.2, 5.9), lente=22, expo=0.3, k=None, foto="e23"),
    "solarium":      dict(pos=(3.0, 0.8, 8.4), mira=(-2.0, 6.5, 7.0), lente=22, expo=0.2, k=None, foto="e38"),
    # recintos
    "cocina":        dict(pos=(-5.2, 9.8, 4.95), mira=(-8.8, 6.0, 3.9), lente=20, expo=3.0, k=5000, foto="i17"),
    "boudoir":       dict(pos=(3.9, -5.4, 4.9), mira=(3.0, -10.6, 4.2), lente=20, expo=1.8, k=5200, foto="i51"),
    "bano":          dict(pos=(-2.5, -2.6, 4.9), mira=(-3.9, -5.2, 3.6), lente=20, expo=1.8, k=5200, foto="i52"),
}
TINTE = 50.0


def aplicar_env(nombre, env):
    """Traduce una estación a las variables de entorno que ya entiende villa-blender.py."""
    e = ESTACIONES[nombre]
    env.setdefault("VILLA_CAM", "libre")
    env.setdefault("VILLA_CAM_POS", ",".join(str(v) for v in e["pos"]))
    env.setdefault("VILLA_CAM_MIRA", ",".join(str(v) for v in e["mira"]))
    env.setdefault("VILLA_CAM_LENTE", str(e["lente"]))
    env.setdefault("VILLA_EXPO", str(e["expo"]))
    if e["k"]:
        env.setdefault("VILLA_BALANCE_K", str(e["k"])); env.setdefault("VILLA_BALANCE_TINTE", str(TINTE))
