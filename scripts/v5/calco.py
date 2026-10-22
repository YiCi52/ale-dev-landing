"""Calco en tinta de una foto (galería v5): bordes como líneas claras sobre la foto apagada en azul noche, con la cuadrícula de "Por dentro".
Uso: python3 scripts/v5/calco.py public/lab/v5/proyectos/foto.webp ...  → foto-calco.webp"""
import os
import sys
import numpy as np
from PIL import Image, ImageFilter

PAPEL = np.array([10, 12, 18], float)      # --papel-bg de planta.css
TINTA = np.array([232, 237, 245], float)   # --luna
CUADRO = 40

def calco(origen, destino):
    img = Image.open(origen).convert("L")
    base = np.asarray(img, float)[..., None] / 255.0          # la foto, apagada, queda debajo del dibujo
    g = np.asarray(img.filter(ImageFilter.GaussianBlur(1.4)), float)
    gx = np.zeros_like(g); gy = np.zeros_like(g)
    gx[:, 1:-1] = g[:, 2:] - g[:, :-2]
    gy[1:-1, :] = g[2:, :] - g[:-2, :]
    m = np.hypot(gx, gy)
    m = np.clip((m - np.percentile(m, 72)) / (np.percentile(m, 99.2) - np.percentile(m, 72)), 0, 1) ** 0.8
    m = np.asarray(Image.fromarray((m * 255).astype(np.uint8)).filter(ImageFilter.MaxFilter(3)), float) / 255.0  # trazo legible al tamaño de pantalla
    h, w = m.shape
    rejilla = np.zeros((h, w))
    rejilla[::CUADRO, :] = 0.06; rejilla[:, ::CUADRO] = 0.06
    a = np.maximum(m, rejilla)[..., None]
    fondo = PAPEL + (np.array([70, 92, 140], float) - PAPEL) * base * 0.55   # azul noche con la luz de la foto
    out = fondo * (1 - a) + TINTA * a
    Image.fromarray(out.astype(np.uint8)).save(destino, "WEBP", quality=78, method=6)

for ruta in sys.argv[1:]:
    base, _ = os.path.splitext(ruta)
    calco(ruta, base + "-calco.webp")   # nunca pisa la foto original, sea .webp o .jpg
    print("ok", ruta)
