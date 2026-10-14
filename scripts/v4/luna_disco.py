# Luna llena como disco (14-oct-2026) para la pantalla de carga: proyecta la textura NASA (equirectangular, cara
# visible centrada en longitud 0) sobre una esfera vista de frente, con la ley de Lommel-Seeliger (luna llena pareja,
# borde apenas más oscuro). Sale un PNG con transparencia que después se pasa a webp.
# Uso: python3 scripts/v4/luna_disco.py <textura_equirect> <salida.png> [lado=720]
import sys

import numpy as np
from PIL import Image

origen, salida = sys.argv[1], sys.argv[2]
LADO = int(sys.argv[3]) if len(sys.argv) > 3 else 720

tex = np.asarray(Image.open(origen).convert("RGB"), dtype=np.float32) / 255.0
th, tw = tex.shape[:2]
ys, xs = np.mgrid[0:LADO, 0:LADO].astype(np.float32)
x = (xs + 0.5) / LADO * 2 - 1
y = 1 - (ys + 0.5) / LADO * 2
r2 = x * x + y * y
dentro = r2 <= 1.0
z = np.sqrt(np.clip(1 - r2, 0, 1))
lon = np.degrees(np.arctan2(x, z))
lat = np.degrees(np.arcsin(np.clip(y, -1, 1)))
u = ((lon + 180) / 360 * tw).astype(int) % tw
v = np.clip(((90 - lat) / 180 * th).astype(int), 0, th - 1)
color = tex[v, u]
mu = np.maximum(z, 0.05)                       # luz desde el observador: mu0 = mu
brillo = (mu / (mu + mu)) * 2.0                 # Lommel-Seeliger con luz de frente = 1 (disco parejo)
borde = 0.78 + 0.22 * np.power(z, 0.4)          # oscurecimiento leve hacia el borde
color = np.clip(np.power(color, 1.08) * brillo[..., None] * borde[..., None] * 1.12, 0, 1)
alfa = np.clip((1 - np.sqrt(r2)) * LADO * 0.5, 0, 1) * dentro   # borde suavizado de 1 px
img = np.dstack([color, alfa[..., None]])
Image.fromarray((img * 255).astype(np.uint8), "RGBA").save(salida)
print("[luna_disco] listo", salida, LADO)
