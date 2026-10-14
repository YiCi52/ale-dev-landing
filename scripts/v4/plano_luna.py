# Plano técnico de la cara visible de la luna: curvas de nivel (LOLA), lavado de mares (LROC), retícula cada 30° y borde.
# Sale tinta con transparencia (para ponerla sobre papel de cuarzo en la página).
import sys
import numpy as np
from PIL import Image
Image.MAX_IMAGE_PIXELS = None
elev, color, salida = sys.argv[1], sys.argv[2], sys.argv[3]
L = int(sys.argv[4]) if len(sys.argv) > 4 else 2000
PASO = 700.0
E = np.asarray(Image.open(elev), dtype=np.float32); E -= E.mean()
C = np.asarray(Image.open(color).convert("L"), dtype=np.float32) / 255.0
ys, xs = np.mgrid[0:L, 0:L].astype(np.float32)
x = (xs + 0.5) / L * 2 - 1; y = 1 - (ys + 0.5) / L * 2
r = np.sqrt(x * x + y * y); dentro = r <= 1
z = np.sqrt(np.clip(1 - r * r, 0, 1))
lon = np.degrees(np.arctan2(x, z)); lat = np.degrees(np.arcsin(np.clip(y, -1, 1)))

def muestrear(M, lon, lat):
    th, tw = M.shape
    u = (lon + 180) / 360 * tw; v = (90 - lat) / 180 * th
    u0 = np.floor(u).astype(int) % tw; v0 = np.clip(np.floor(v).astype(int), 0, th - 2)
    fu = u - np.floor(u); fv = v - np.floor(v); u1 = (u0 + 1) % tw
    return (M[v0, u0] * (1 - fu) * (1 - fv) + M[v0, u1] * fu * (1 - fv) + M[v0 + 1, u0] * (1 - fu) * fv + M[v0 + 1, u1] * fu * fv)

def linea(dist_px, ancho):
    return np.clip(1 - (dist_px - ancho * 0.5) / 0.9, 0, 1)

f = muestrear(E, lon, lat) / PASO
gy, gx = np.gradient(f); g = np.sqrt(gx * gx + gy * gy) + 1e-6
d = np.abs(f - np.round(f)) / g; sep = 1.0 / g
mayor = np.round(f) % 5 == 0
curvas = linea(d, np.where(mayor, 1.2, 0.6)) * np.where(mayor, 0.9 * np.clip((sep * 5 - 1.5) / 2.5, 0, 1), 0.5 * np.clip((sep - 1.6) / 2.4, 0, 1))
# lavado de los mares: lo oscuro de la foto (basalto) va como una veladura gris clara
alb = muestrear(C, lon, lat)
mar = np.clip((0.42 - alb) / 0.18, 0, 1) * 0.17
# retícula cada 30° (meridianos y paralelos), muy fina
def reticula(ang, paso):
    q = ang / paso; gyq, gxq = np.gradient(q); gq = np.sqrt(gxq ** 2 + gyq ** 2) + 1e-6
    return linea(np.abs(q - np.round(q)) / gq, 0.5)
ret = np.maximum(reticula(lon, 30.0), reticula(lat, 30.0)) * 0.28
borde = linea(np.abs(r - 1) * L * 0.5, 1.6)
tinta = np.maximum.reduce([curvas * dentro, mar * dentro, ret * dentro, borde])
img = np.zeros((L, L, 4), np.uint8)
img[..., 0], img[..., 1], img[..., 2] = 26, 25, 28
img[..., 3] = (np.clip(tinta, 0, 1) * 255).astype(np.uint8)
Image.fromarray(img, "RGBA").save(salida)
print("listo", salida)
