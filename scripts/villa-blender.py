"""
La Villa Savoye en Blender, construida desde PLANTA.md.

Por qué existe: dos días armando la casa con cajas en three.js dieron
geometría correcta y aspecto de sandbox. El problema no era el orden ni los
planos — era el medio. Materiales planos y luz de tiempo real no parecen
arquitectura. Cycles sí.

    /Applications/Blender.app/Contents/MacOS/Blender -b -P scripts/villa-blender.py

Las coordenadas salen de PLANTA.md §1-2 y de planta.ts. Este archivo NO
inventa medidas: si algo no cuadra, se corrige el documento primero.
"""
import bpy, math, os, sys

RAIZ = os.getcwd()
HDR = os.path.join(RAIZ, "public/lab/villa-savoye/sky_1k.hdr")
OUT = os.path.join(RAIZ, "artefactos-bake/prueba-villa.png")

# ── PLANTA.md §1 ──────────────────────────────────────────────────────────
CRUJIA, VOLADIZO = 4.75, 1.125
W, D = CRUJIA * 4, CRUJIA * 4 + VOLADIZO * 2   # 19.0 x 21.25
H_PILOTIS, H_BANDA_INF, H_VENTANA, H_BANDA_SUP = 3.3, 0.55, 1.2, 1.5
H_VOL = H_BANDA_INF + H_VENTANA + H_BANDA_SUP
Y_LOSA, Y_TECHO = H_PILOTIS + 0.15, H_PILOTIS + H_VOL
T_TAB = 0.15

# ── PLANTA.md §2: los tabiques, con sus huecos de puerta ──────────────────
TABIQUES = [
    ("z", 4.78, 0.1, 9.5, [(4.0, 7.0)], True),
    ("z", 4.78, -9.5, 0.1, [(-8.9, -8.0)], False),
    ("x", -4.79, 4.78, 10.63, [(6.4, 7.3)], False),
    ("x", 0.1, -4.83, 4.78, [(1.2, 3.0)], False),
    ("x", -1.5, -7.0, 4.78, [], False),
    ("z", -4.83, 1.36, 9.5, [], False),
    ("x", 4.47, -10.63, -4.83, [(-7.6, -6.7)], False),
    ("x", 1.36, -10.63, -4.83, [], False),
    ("x", -5.12, -10.63, 4.78, [(-9.6, -8.7), (-3.6, -2.7), (2.6, 3.5)], False),
    ("z", -4.99, -9.5, -5.12, [(-7.6, -6.7)], False),
    ("z", 1.92, -9.5, -5.12, [], False),
    ("z", -6.17, -5.12, 1.36, [(-3.4, -2.5)], False),
    ("z", -0.28, -5.12, -1.5, [(-4.4, -3.5)], False),
]
LOSA = [(-9.5,-1.5,-10.625,-4.57),(0.1,9.5,-10.625,-4.57),(-1.5,0.1,-10.625,-7.0),
        (-9.5,-1.5,4.78,10.625),(0.1,9.5,4.78,10.625),(-1.5,0.1,4.78,10.625),
        (-9.5,-1.5,-4.57,2.4),(0.1,1.4,-4.57,2.4),(-6.35,-1.5,2.4,4.78),(0.1,1.4,2.4,4.78)]
VACIO_RAMPA = (-1.5, 0.1, -7.0, 4.78)

def tramos(a, b, puertas):
    out, cur = [], a
    for p0, p1 in sorted(puertas):
        if p0 > cur: out.append((cur, min(p0, b)))
        cur = max(cur, p1)
    if cur < b: out.append((cur, b))
    return [(u, w) for u, w in out if w - u > 0.05]

# ── escena limpia ─────────────────────────────────────────────────────────
bpy.ops.wm.read_factory_settings(use_empty=True)
esc = bpy.context.scene

def mat(nombre, rgb, rough=0.85, metal=0.0, alpha=1.0, trans=False):
    m = bpy.data.materials.new(nombre); m.use_nodes = True
    b = m.node_tree.nodes["Principled BSDF"]
    b.inputs["Base Color"].default_value = (*rgb, 1)
    b.inputs["Roughness"].default_value = rough
    b.inputs["Metallic"].default_value = metal
    if trans:
        b.inputs["Transmission Weight"].default_value = 0.95
        b.inputs["IOR"].default_value = 1.45
        m.use_backface_culling = False
    return m

# Materiales de PLANTA.md "MATERIA Y COLOR" — leidos de las fotos reales
M_BLANCO   = mat("blanco",  (0.90, 0.89, 0.86), 0.62)
M_ROSA     = mat("rosa",    (0.52, 0.20, 0.14), 0.75)   # polychromie del salon
M_AZUL     = mat("azul",    (0.09, 0.17, 0.22), 0.75)
M_VERDE    = mat("verde",   (0.04, 0.09, 0.05), 0.68)   # el volumen bajo
M_PISO     = mat("ocre",    (0.55, 0.42, 0.28), 0.55)   # baldosa del salon
M_HORMIGON = mat("hormigon",(0.44, 0.43, 0.40), 0.88)
M_VIDRIO   = mat("vidrio",  (0.85, 0.90, 0.90), 0.03, 0.0, 0.15, trans=True)
M_CARP     = mat("carpint", (0.10, 0.05, 0.03), 0.45)

def caja(nombre, x0, x1, y0, y1, z0, z1, material):
    bpy.ops.mesh.primitive_cube_add(size=1)
    o = bpy.context.object; o.name = nombre
    # primitive_cube_add(size=1) YA da un cubo de lado 1: la escala es el lado
    # completo, no el semi-lado. Dividir entre dos dejaba cada pieza a la mitad
    # y la casa se veia desarmada, con todo flotando suelto.
    o.scale = (x1-x0, z1-z0, y1-y0)
    o.location = ((x0+x1)/2, (z0+z1)/2, (y0+y1)/2)   # Blender: Z arriba
    o.data.materials.append(material)
    return o

# ── planta baja: la herradura + el bloque de servicio ─────────────────────
H_RDC = H_PILOTIS - 0.2
bpy.ops.mesh.primitive_cylinder_add(vertices=96, radius=6.5, depth=H_RDC,
                                    location=(0.3, 1.0, H_RDC/2))
herradura = bpy.context.object; herradura.name = "herradura"
bpy.ops.object.modifier_add(type='SOLIDIFY'); herradura.modifiers[-1].thickness = 0.06
herradura.data.materials.append(M_VIDRIO)
caja("bloque_servicio", -8.7, -3.5, 0, H_RDC, -6.8, -0.4, M_VERDE)

# ── pilotis ───────────────────────────────────────────────────────────────
for i in range(5):
    for j in range(5):
        bpy.ops.mesh.primitive_cylinder_add(vertices=24, radius=0.16, depth=H_PILOTIS,
            location=((i-2)*(W/4-0.8), (j-2)*(D/4-0.8), H_PILOTIS/2))
        bpy.context.object.data.materials.append(M_BLANCO)

# ── losa del nobile, en paneles alrededor del vacio de la rampa ───────────
vx0, vx1, vz0, vz1 = VACIO_RAMPA
for n,(x0,x1,z0,z1) in enumerate([(-W/2,vx0,-D/2,D/2),(vx1,W/2,-D/2,D/2),
                                  (vx0,vx1,-D/2,vz0),(vx0,vx1,vz1,D/2)]):
    caja(f"losa_nobile_{n}", x0, x1, H_PILOTIS, Y_LOSA, z0, z1, M_PISO)

# ── tabiques con sus huecos ───────────────────────────────────────────────
for n,(eje, v, a, b, puertas, vidrio) in enumerate(TABIQUES):
    material = M_VIDRIO if vidrio else (M_ROSA if n == 2 else M_AZUL if n == 1 else M_BLANCO)
    for u, w in tramos(a, b, puertas):
        if eje == "x": caja(f"tab{n}", v-T_TAB/2, v+T_TAB/2, Y_LOSA, Y_TECHO, u, w, material)
        else:          caja(f"tab{n}", u, w, Y_LOSA, Y_TECHO, v-T_TAB/2, v+T_TAB/2, material)

# ── fachadas: banda inferior, cinta de vidrio continua, banda superior ────
yv0, yv1 = H_PILOTIS + H_BANDA_INF, H_PILOTIS + H_BANDA_INF + H_VENTANA
for nombre, x0, x1, z0, z1 in [("sur",-W/2,W/2,D/2-0.19,D/2), ("norte",-W/2,W/2,-D/2,-D/2+0.19),
                               ("este",W/2-0.19,W/2,-D/2,D/2), ("oeste",-W/2,-W/2+0.19,-D/2,D/2)]:
    caja(f"fa_{nombre}_inf", x0,x1, H_PILOTIS, yv0, z0,z1, M_BLANCO)
    caja(f"fa_{nombre}_sup", x0,x1, yv1, Y_TECHO, z0,z1, M_BLANCO)
    caja(f"fa_{nombre}_vid", x0,x1, yv0, yv1, z0+0.06, z1-0.06, M_VIDRIO)

# ── cubierta ──────────────────────────────────────────────────────────────
for n,(x0,x1,z0,z1) in enumerate(LOSA):
    caja(f"cubierta_{n}", x0, x1, Y_TECHO, Y_TECHO+0.35, z0, z1, M_BLANCO)
for nombre, x0,x1,z0,z1 in [("s",-W/2,W/2,D/2-0.22,D/2), ("n",-W/2,W/2,-D/2,-D/2+0.22),
                            ("e",W/2-0.22,W/2,-D/2,D/2), ("o",-W/2,-W/2+0.22,-D/2,D/2)]:
    caja(f"antepecho_{nombre}", x0,x1, Y_TECHO, Y_TECHO+1.05, z0,z1, M_BLANCO)

# ── terreno ───────────────────────────────────────────────────────────────
bpy.ops.mesh.primitive_plane_add(size=160, location=(0,0,0))
bpy.context.object.data.materials.append(mat("pradera",(0.14,0.19,0.08),0.95))
caja("explanada", -15, 15, -0.02, 0.10, -13, 13, M_HORMIGON)

# ── luz: el mismo HDRI del lab + sol calido ───────────────────────────────
mundo = bpy.data.worlds.new("cielo"); esc.world = mundo; mundo.use_nodes = True
nt = mundo.node_tree; nt.nodes.clear()
env = nt.nodes.new("ShaderNodeTexEnvironment"); env.image = bpy.data.images.load(HDR)
bg = nt.nodes.new("ShaderNodeBackground"); bg.inputs["Strength"].default_value = 1.0
sal = nt.nodes.new("ShaderNodeOutputWorld")
nt.links.new(env.outputs["Color"], bg.inputs["Color"]); nt.links.new(bg.outputs["Background"], sal.inputs["Surface"])

import mathutils
sd = bpy.data.lights.new("sol", type="SUN"); sd.energy = 3.2
sd.color = (1.0, 0.957, 0.894); sd.angle = math.radians(0.7)
sol = bpy.data.objects.new("sol", sd); esc.collection.objects.link(sol)
sol.rotation_euler = mathutils.Vector((26, 16, 34)).to_track_quat("Z","Y").to_euler()

# ── camara: el encuadre de aproximacion ───────────────────────────────────
cam_d = bpy.data.cameras.new("cam"); cam_d.lens = 40
cam = bpy.data.objects.new("cam", cam_d); esc.collection.objects.link(cam); esc.camera = cam
cam.location = (24, 26, 9)
mira = mathutils.Vector((0,0,4.5)) - mathutils.Vector(cam.location)
cam.rotation_euler = mira.to_track_quat("-Z","Y").to_euler()

# ── render ────────────────────────────────────────────────────────────────
esc.render.engine = "CYCLES"
try:
    prefs = bpy.context.preferences.addons["cycles"].preferences
    prefs.compute_device_type = "METAL"; prefs.get_devices()
    for d in prefs.devices: d.use = True
    esc.cycles.device = "GPU"
except Exception as e:
    print("[villa] METAL no disponible:", e); esc.cycles.device = "CPU"
esc.cycles.samples = 96
esc.cycles.use_denoising = True
esc.view_settings.view_transform = "AgX"
esc.render.resolution_x, esc.render.resolution_y = 1280, 800
esc.render.image_settings.file_format = "PNG"
esc.render.filepath = OUT
print(f"[villa] objetos: {len(esc.objects)} · renderizando…")
bpy.ops.render.render(write_still=True)
print(f"[villa] ✓ {OUT}")
