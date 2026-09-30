"""
Plantas REALES para las jardineras (hallazgo #13, 30-sep-2026). Antes: esferas con ruido que se leían como "piedras
escarchadas". Ahora: modelos escaneados de Poly Haven (CC0), descargados con OK de Alejandro a
~/CastilloStudio/assets/polyhaven/ (ver LICENCIA.txt):
  · shrub_04          — 4 ramas de hoja verde brillante (~20 cm): la unidad con la que se ARMA cada arbusto
  · grass_medium_02   — 5 matas de pasto (12–43 cm)
  · periwinkle_plant  — 6 plantas de vinca con flor (16–41 cm)
Poly Haven no tiene arbustos redondos enteros; un arbusto podado se lee como muchas ramas que salen hacia afuera
de una cúpula, así que se arma con copias ENLAZADAS (comparten la malla: no pesan en memoria).
Reutilizable para los otros labs: `arbusto`, `matas` y `flores` solo piden centro, tamaño y colección.
"""
import bpy, bmesh, math, os, random
from mathutils import Matrix, Quaternion, Vector

BASE = os.path.expanduser("~/CastilloStudio/assets/polyhaven")
_MOLDES = {}


def _importar(nombre):
    """Mallas del gltf con la transformación horneada, base en z 0 y centradas en xy; fuera de la escena."""
    antes = set(bpy.data.objects)
    bpy.ops.import_scene.gltf(filepath=f"{BASE}/{nombre}/{nombre}_1k.gltf")
    nuevos = [o for o in bpy.data.objects if o not in antes]
    mallas = []
    for o in nuevos:
        if o.type == "MESH":
            me = o.data.copy(); me.transform(o.matrix_world); mallas.append(me)
    for o in nuevos: bpy.data.objects.remove(o, do_unlink=True)
    return mallas


def _centrar(me):
    xs = [v.co.x for v in me.vertices]; ys = [v.co.y for v in me.vertices]; zs = [v.co.z for v in me.vertices]
    me.transform(Matrix.Translation(((-(min(xs) + max(xs)) / 2), -(min(ys) + max(ys)) / 2, -min(zs))))
    return me


def _partir_en_x(me, n):
    """shrub_04 trae sus 4 ramas en fila a lo largo de x: se separan por franjas para variar el arbusto."""
    xs = [v.co.x for v in me.vertices]; a, b = min(xs), max(xs)
    partes = []
    for k in range(n):
        bm = bmesh.new(); bm.from_mesh(me)
        lo, hi = a + (b - a) * k / n, a + (b - a) * (k + 1) / n
        fuera = [f for f in bm.faces if not lo <= f.calc_center_median().x < hi + (1e-6 if k == n - 1 else 0)]
        bmesh.ops.delete(bm, geom=fuera, context="FACES")
        nueva = me.copy(); nueva.name = f"{me.name}_{k}"; bm.to_mesh(nueva); bm.free()
        if len(nueva.polygons): partes.append(_centrar(nueva))
    return partes


def moldes(nombre):
    if nombre not in _MOLDES:
        mallas = _importar(nombre)
        _MOLDES[nombre] = _partir_en_x(mallas[0], 4) if nombre == "shrub_04" else [_centrar(m) for m in mallas]
    return _MOLDES[nombre]


def _copia(nombre, me, pos, rot, esc, col):
    o = bpy.data.objects.new(nombre, me); col.objects.link(o)
    o.matrix_world = Matrix.Translation(pos) @ rot.to_matrix().to_4x4() @ Matrix.Scale(esc, 4)
    return o


def arbusto(nombre, centro, radio, alto, col, semilla=0, densidad=45):
    """Arbusto podado: ramas sobre una cúpula achatada, cada una apuntando hacia afuera y girada al azar;
    un tercio va más adentro para que no se vea hueco. `centro` = base, sobre la tierra."""
    rng = random.Random(semilla); ramas = moldes("shrub_04")
    n = max(12, int(densidad * (radio / 0.30) ** 2))
    for k in range(n):
        z = rng.uniform(0.15, 1.0); fi = rng.uniform(0, 2 * math.pi); r_h = math.sqrt(1 - z * z)
        d = Vector((r_h * math.cos(fi), r_h * math.sin(fi), z))
        prof = rng.uniform(0.35, 0.75) if k % 3 == 0 else rng.uniform(0.70, 0.95)
        pos = Vector(centro) + Vector((d.x * radio * prof, d.y * radio * prof, d.z * alto * prof * 0.75))
        rot = Vector((0, 0, 1)).rotation_difference(d) @ Quaternion((0, 0, 1), rng.uniform(0, 2 * math.pi))
        _copia(f"{nombre}_{k}", ramas[k % len(ramas)], pos, rot, rng.uniform(1.3, 2.2), col)


def matas(nombre, centro, radio, col, semilla=0, n=5, cual="grass_medium_02", escala=(0.8, 1.2)):
    """Varias matas (pasto o flores) regadas en un círculo, verticales con una leve inclinación."""
    rng = random.Random(semilla); ms = moldes(cual)
    for k in range(n):
        a = rng.uniform(0, 2 * math.pi); r = radio * math.sqrt(rng.random())
        pos = Vector(centro) + Vector((r * math.cos(a), r * math.sin(a), 0))
        rot = Quaternion((1, 0, 0), rng.uniform(-0.12, 0.12)) @ Quaternion((0, 0, 1), rng.uniform(0, 2 * math.pi))
        _copia(f"{nombre}_{k}", ms[rng.randrange(len(ms))], pos, rot, rng.uniform(*escala), col)


def flores(nombre, centro, radio, col, semilla=0, n=4):
    matas(nombre, centro, radio, col, semilla, n, "periwinkle_plant", (0.9, 1.3))
