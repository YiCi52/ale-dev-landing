# Escena de la galería v4 (13-oct-2026): asomado desde un piso de nogal sobre un río de noche; una luna llena real se
# refleja en el agua y, con el scroll, se eclipsa hasta dejar solo un halo blanco. Los proyectos aparecen después en ese
# reflejo negro (eso lo hace la página, no Blender).
#
# Uso:  Blender -b -P scripts/v4/rio_luna.py -- <salida_dir> [cuadros=1-120] [muestras=48] [ancho=1600]
#   cuadros: "1-120" (secuencia) o "1,60,120" (prueba)
import bpy, math, os, sys
from mathutils import Vector

ARGS = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
SALIDA = os.path.abspath(ARGS[0] if ARGS else "/tmp/rio")
CUADROS = ARGS[1] if len(ARGS) > 1 else "1-120"
MUESTRAS = int(ARGS[2]) if len(ARGS) > 2 else 48
ANCHO = int(ARGS[3]) if len(ARGS) > 3 else 1600
TEX_LUNA = os.path.expanduser("~/CastilloStudio/assets/nasa-luna/luna-nasa-4k.png")   # NASA SVS CGI Moon Kit (LRO), dominio público
GIRO_LUNA = float(os.environ.get("GIRO_LUNA", "270"))
N = int(os.environ.get("N_CUADROS", "74"))   # 14-oct: el resto (agua mirando abajo, eclipse) va EN VIVO en WebGL
SIN_LUNA = os.environ.get("SIN_LUNA", "1") == "1"

bpy.ops.wm.read_factory_settings(use_empty=True)
esc = bpy.context.scene
esc.frame_start, esc.frame_end = 1, N
esc.render.resolution_x = ANCHO; esc.render.resolution_y = round(ANCHO * 9 / 16)   # antes de proyectar puntos a pantalla


def mat(nombre):
    m = bpy.data.materials.new(nombre); m.use_nodes = True
    return m, m.node_tree.nodes, m.node_tree.links


def bsdf_de(nodos):
    return next(n for n in nodos if n.type == "BSDF_PRINCIPLED")


def emisivo(nombre, color, fuerza):
    m, nodos, ln = mat(nombre)
    for n in list(nodos):
        if n.type != "OUTPUT_MATERIAL": nodos.remove(n)
    e = nodos.new("ShaderNodeEmission"); e.inputs["Color"].default_value = (*color, 1); e.inputs["Strength"].default_value = fuerza
    ln.new(e.outputs[0], next(n for n in nodos if n.type == "OUTPUT_MATERIAL").inputs[0])
    return m, e


# ── mundo: noche casi negra con un degradé muy leve hacia el horizonte ─────────────────────────────────────────────
mundo = bpy.data.worlds.new("noche"); esc.world = mundo; mundo.use_nodes = True
fondo = next(n for n in mundo.node_tree.nodes if n.type == "BACKGROUND")
nt = mundo.node_tree; tcw = nt.nodes.new("ShaderNodeTexCoord"); sep = nt.nodes.new("ShaderNodeSeparateXYZ")
rw = nt.nodes.new("ShaderNodeValToRGB"); rw.color_ramp.elements[0].position = 0.0; rw.color_ramp.elements[0].color = (0.030, 0.036, 0.055, 1)
rw.color_ramp.elements[1].position = 0.25; rw.color_ramp.elements[1].color = (0.004, 0.005, 0.010, 1)
nt.links.new(tcw.outputs["Generated"], sep.inputs[0]); nt.links.new(sep.outputs["Z"], rw.inputs["Fac"])
vor = nt.nodes.new("ShaderNodeTexVoronoi"); vor.inputs["Scale"].default_value = 300; vor.inputs["Randomness"].default_value = 1.0
tcs = nt.nodes.new("ShaderNodeTexCoord"); nt.links.new(tcs.outputs["Generated"], vor.inputs["Vector"])
pts = nt.nodes.new("ShaderNodeMapRange"); pts.inputs["From Min"].default_value = 0.085; pts.inputs["From Max"].default_value = 0.0
pts.clamp = True; nt.links.new(vor.outputs["Distance"], pts.inputs["Value"])
brillo_e = nt.nodes.new("ShaderNodeMath"); brillo_e.operation = "MULTIPLY"; nt.links.new(pts.outputs["Result"], brillo_e.inputs[0])
nt.links.new(vor.outputs["Color"], brillo_e.inputs[1])   # cada estrella con su intensidad
alto = nt.nodes.new("ShaderNodeMath"); alto.operation = "GREATER_THAN"; alto.inputs[1].default_value = 0.01
nt.links.new(sep.outputs["Z"], alto.inputs[0])             # solo sobre el horizonte
est = nt.nodes.new("ShaderNodeMath"); est.operation = "MULTIPLY"; nt.links.new(brillo_e.outputs[0], est.inputs[0]); nt.links.new(alto.outputs[0], est.inputs[1])
est2 = nt.nodes.new("ShaderNodeMath"); est2.operation = "MULTIPLY"; est2.inputs[1].default_value = 7.0; nt.links.new(est.outputs[0], est2.inputs[0])
# las estrellas brillan en el CIELO; en el reflejo del agua casi no (con las ondas se estiraban en rayas que parecían lluvia)
camino = nt.nodes.new("ShaderNodeLightPath"); solo_cam = nt.nodes.new("ShaderNodeMapRange")
solo_cam.inputs["To Min"].default_value = 0.06; solo_cam.inputs["To Max"].default_value = 1.0
nt.links.new(camino.outputs["Is Camera Ray"], solo_cam.inputs["Value"])
est3 = nt.nodes.new("ShaderNodeMath"); est3.operation = "MULTIPLY"; nt.links.new(est2.outputs[0], est3.inputs[0]); nt.links.new(solo_cam.outputs["Result"], est3.inputs[1])
suma = nt.nodes.new("ShaderNodeMixRGB"); suma.blend_type = "ADD"; suma.inputs["Fac"].default_value = 1.0
nt.links.new(rw.outputs["Color"], suma.inputs["Color1"]); nt.links.new(est3.outputs[0], suma.inputs["Color2"])
nt.links.new(suma.outputs["Color"], fondo.inputs["Color"]); fondo.inputs["Strength"].default_value = 1.0

# ── agua ────────────────────────────────────────────────────────────────────────────────────────────────────────────
bpy.ops.mesh.primitive_plane_add(size=1, location=(0, 120, 0)); agua = bpy.context.object; agua.scale = (400, 400, 1)
m_agua, nodos, ln = mat("agua"); b = bsdf_de(nodos)
b.inputs["Base Color"].default_value = (0.012, 0.020, 0.030, 1); b.inputs["Roughness"].default_value = 0.015
b.inputs["IOR"].default_value = 1.9   # más reflejo que el agua real: la luna reflejada es la protagonista
coord = nodos.new("ShaderNodeTexCoord"); mapeo = nodos.new("ShaderNodeMapping")
mapeo.inputs["Scale"].default_value = (0.5, 2.6, 1)   # crestas largas a lo ancho: rompen el reflejo en un camino de luz
ruido = nodos.new("ShaderNodeTexNoise"); ruido.inputs["Scale"].default_value = 2.2; ruido.inputs["Detail"].default_value = 9
ruido.noise_dimensions = "4D"
w = ruido.inputs["W"]; w.default_value = 0.0; w.keyframe_insert("default_value", frame=1); w.default_value = 1.6
w.keyframe_insert("default_value", frame=N)
bump = nodos.new("ShaderNodeBump"); bump.inputs["Strength"].default_value = 0.14; bump.inputs["Distance"].default_value = 0.4
ln.new(coord.outputs["Object"], mapeo.inputs["Vector"]); ln.new(mapeo.outputs[0], ruido.inputs["Vector"])
rizo = nodos.new("ShaderNodeTexNoise"); rizo.inputs["Scale"].default_value = 26.0; rizo.inputs["Detail"].default_value = 4
rizo.noise_dimensions = "4D"; wr = rizo.inputs["W"]; wr.default_value = 0.0; wr.keyframe_insert("default_value", frame=1)
wr.default_value = 6.0; wr.keyframe_insert("default_value", frame=N)
mezcla = nodos.new("ShaderNodeMath"); mezcla.operation = "MULTIPLY_ADD"; mezcla.inputs[1].default_value = 0.35
ln.new(mapeo.outputs[0], rizo.inputs["Vector"]); ln.new(rizo.outputs["Fac"], mezcla.inputs[0]); ln.new(ruido.outputs["Fac"], mezcla.inputs[2])
ln.new(mezcla.outputs[0], bump.inputs["Height"]); ln.new(bump.outputs[0], b.inputs["Normal"])
agua.data.materials.append(m_agua)

# ── orillas: dos bancos bajos y vegetación en silueta (el río NO es mar) ────────────────────────────────────────────
m_orilla, _ = emisivo("orilla", (0.0, 0.0, 0.0), 0.0)
m_orilla_b = bpy.data.materials.new("orilla_bsdf"); m_orilla_b.use_nodes = True
bsdf_de(m_orilla_b.node_tree.nodes).inputs["Base Color"].default_value = (0.010, 0.012, 0.011, 1)
bsdf_de(m_orilla_b.node_tree.nodes).inputs["Roughness"].default_value = 0.9
import random, bmesh
random.seed(7)


def linea_arboles(lado):
    """Franja vertical que corre río arriba con el borde superior ruidoso: copas de árboles y palmas en silueta."""
    bm = bmesh.new(); prev = None
    for k in range(0, 520):
        y = 6 + k * 0.62; x = lado * (19 + 0.06 * y + 2.5 * math.sin(y * 0.05))
        h = (6.5 + 2.4 * math.sin(y * 0.09 + lado) + 1.3 * math.sin(y * 0.31) + 0.6 * math.sin(y * 1.7) + random.uniform(0, 0.5)) * (1 + y / 420)
        a = bm.verts.new((x, y, 0.4)); b = bm.verts.new((x, y, 0.4 + h))
        if prev: bm.faces.new((prev[0], a, b, prev[1]))
        prev = (a, b)
    me = bpy.data.meshes.new("arboles"); bm.to_mesh(me); bm.free()
    o = bpy.data.objects.new("arboles", me); esc.collection.objects.link(o); o.data.materials.append(m_orilla_b)


m_orilla_b = bpy.data.materials.new("orilla"); m_orilla_b.use_nodes = True
bsdf_de(m_orilla_b.node_tree.nodes).inputs["Base Color"].default_value = (0.0015, 0.0017, 0.0022, 1)
bsdf_de(m_orilla_b.node_tree.nodes).inputs["Roughness"].default_value = 0.95
# 13-oct (Alejo): sin árboles. Bordes de PIEDRA NEGRA pulida: un canal de agua arquitectónico (como el de la villa de Bali)
TEX_PIEDRA = os.path.expanduser("~/CastilloStudio/marca/materiales-2026-10/piedra-negra-vetas-grises.png")
m_piedra, nodos, ln = mat("piedra"); bp = bsdf_de(nodos)
bp.inputs["Roughness"].default_value = 0.22; bp.inputs["Coat Weight"].default_value = 0.6; bp.inputs["Coat Roughness"].default_value = 0.08
tp = nodos.new("ShaderNodeTexImage"); tp.image = bpy.data.images.load(TEX_PIEDRA); tp.projection = "BOX"; tp.projection_blend = 0.2
tcp = nodos.new("ShaderNodeTexCoord"); mpp = nodos.new("ShaderNodeMapping"); mpp.inputs["Scale"].default_value = (0.35, 0.35, 0.35)
ln.new(tcp.outputs["Object"], mpp.inputs["Vector"]); ln.new(mpp.outputs[0], tp.inputs["Vector"]); ln.new(tp.outputs["Color"], bp.inputs["Base Color"])
# 13-oct tarde (Alejo): sin bordes: el fondo es un HORIZONTE de agua y cielo (los muros se quitaron)

# ── piso de nogal: tablones que corren hacia el agua y terminan en un borde ─────────────────────────────────────────
m_nogal, nodos, ln = mat("nogal"); b = bsdf_de(nodos)
b.inputs["Roughness"].default_value = 0.38; b.inputs["Coat Weight"].default_value = 0.45; b.inputs["Coat Roughness"].default_value = 0.14
coord = nodos.new("ShaderNodeTexCoord"); mapeo = nodos.new("ShaderNodeMapping"); mapeo.inputs["Scale"].default_value = (30, 1.2, 30)
veta = nodos.new("ShaderNodeTexWave"); veta.wave_type = "BANDS"; veta.bands_direction = "X"   # vetas a lo largo del tablón (eje Y)
veta.inputs["Scale"].default_value = 1.0; veta.inputs["Distortion"].default_value = 5.5; veta.inputs["Detail"].default_value = 6
fig = nodos.new("ShaderNodeTexNoise"); fig.inputs["Scale"].default_value = 4.0; fig.inputs["Detail"].default_value = 5
mez = nodos.new("ShaderNodeMath"); mez.operation = "MULTIPLY_ADD"; mez.inputs[1].default_value = 0.7
rampa = nodos.new("ShaderNodeValToRGB")
rampa.color_ramp.elements[0].color = (0.020, 0.008, 0.004, 1); rampa.color_ramp.elements[1].color = (0.11, 0.055, 0.028, 1)
medio = rampa.color_ramp.elements.new(0.55); medio.color = (0.055, 0.026, 0.013, 1)
ln.new(coord.outputs["Object"], mapeo.inputs["Vector"]); ln.new(mapeo.outputs[0], veta.inputs["Vector"]); ln.new(mapeo.outputs[0], fig.inputs["Vector"])
ln.new(veta.outputs["Fac"], mez.inputs[0]); ln.new(fig.outputs["Fac"], mez.inputs[2]); ln.new(mez.outputs[0], rampa.inputs["Fac"])
ln.new(rampa.outputs["Color"], b.inputs["Base Color"])
rel = nodos.new("ShaderNodeBump"); rel.inputs["Strength"].default_value = 0.15; rel.inputs["Distance"].default_value = 0.001
ln.new(veta.outputs["Fac"], rel.inputs["Height"]); ln.new(rel.outputs[0], b.inputs["Normal"])
Y_BORDE = -2.6; Z_PISO = 1.0
for i in range(38):
    x = -3.46 + i * 0.187
    bpy.ops.mesh.primitive_cube_add(location=(x, Y_BORDE - 2.6, Z_PISO - 0.03)); t = bpy.context.object
    t.scale = (0.088, 2.6, 0.03); t.data.materials.append(m_nogal)
    bpy.ops.object.modifier_add(type="BEVEL"); t.modifiers[-1].width = 0.006; t.modifiers[-1].segments = 2
bpy.ops.mesh.primitive_cube_add(location=(0, Y_BORDE + 0.04, Z_PISO - 0.09)); viga = bpy.context.object
# la viga corre a lo ancho (eje X): con el material de los tablones la veta quedaba atravesada y se leía como zigzag.
# copia del nogal con la veta girada para que corra a lo largo de la viga
m_viga = m_nogal.copy(); m_viga.name = "nogal_viga"
next(n for n in m_viga.node_tree.nodes if n.type == "MAPPING").inputs["Scale"].default_value = (1.2, 30, 30)
viga.scale = (3.6, 0.05, 0.09); viga.data.materials.append(m_viga)

# ── luna llena REAL (textura NASA) + eclipse como sombra + halo FINO ────────────────────────────────────────────────
# 13-oct (Alejo): luna realista y grande; al llegar al borde se baja la mirada y SOLO se ve el agua: la luna llena se
# ve reflejada, se eclipsa EN EL REFLEJO y queda una línea de luz delgada con un aura corta (no un halo gordo).
D_LUNA, R_LUNA, ELEV = 320.0, 30.0, math.radians(20.0)
dir_luna = Vector((0.0, math.cos(ELEV), math.sin(ELEV)))
c_luna = dir_luna * D_LUNA
bpy.ops.mesh.primitive_uv_sphere_add(radius=R_LUNA, location=c_luna, segments=128, ring_count=64); luna = bpy.context.object
bpy.ops.object.shade_smooth(); luna.rotation_euler = (math.radians(-20), 0, math.radians(GIRO_LUNA))
m_luna, nodos, ln = mat("luna")
for n in list(nodos):
    if n.type != "OUTPUT_MATERIAL": nodos.remove(n)
img = nodos.new("ShaderNodeTexImage"); img.image = bpy.data.images.load(TEX_LUNA); img.interpolation = "Cubic"
gama = nodos.new("ShaderNodeGamma"); gama.inputs["Gamma"].default_value = 1.35
em = nodos.new("ShaderNodeEmission"); em.inputs["Strength"].default_value = 2.0
# leve oscurecimiento del borde (la luna llena real no es un disco plano)
lw = nodos.new("ShaderNodeLayerWeight"); lw.inputs["Blend"].default_value = 0.35
inv = nodos.new("ShaderNodeMath"); inv.operation = "SUBTRACT"; inv.inputs[0].default_value = 1.0
borde = nodos.new("ShaderNodeMixRGB"); borde.blend_type = "MULTIPLY"; borde.inputs["Fac"].default_value = 1.0
ln.new(lw.outputs["Facing"], inv.inputs[1])
geo = nodos.new("ShaderNodeNewGeometry"); sepl = nodos.new("ShaderNodeSeparateXYZ")   # X del mundo: la sombra barre de izquierda a derecha
corr = nodos.new("ShaderNodeMath"); corr.operation = "SUBTRACT"
mrange = nodos.new("ShaderNodeMapRange"); mrange.inputs["From Min"].default_value = -R_LUNA * 0.18
mrange.inputs["From Max"].default_value = R_LUNA * 0.18; mrange.clamp = True
mult = nodos.new("ShaderNodeMixRGB"); mult.blend_type = "MULTIPLY"; mult.inputs["Fac"].default_value = 1.0
ln.new(img.outputs["Color"], gama.inputs["Color"]); ln.new(gama.outputs[0], borde.inputs["Color1"])
ln.new(inv.outputs[0], borde.inputs["Color2"]); ln.new(borde.outputs[0], mult.inputs["Color1"])
ln.new(geo.outputs["Position"], sepl.inputs[0]); ln.new(sepl.outputs["X"], corr.inputs[0]); ln.new(corr.outputs[0], mrange.inputs["Value"])
ln.new(mrange.outputs["Result"], mult.inputs["Color2"]); ln.new(mult.outputs[0], em.inputs["Color"])
ln.new(em.outputs[0], next(n for n in nodos if n.type == "OUTPUT_MATERIAL").inputs[0])
SOMBRA = corr.inputs[1]
for f, v in ((1, -R_LUNA * 1.4), (76, -R_LUNA * 1.4), (108, R_LUNA * 1.4)):
    SOMBRA.default_value = v; SOMBRA.keyframe_insert("default_value", frame=f)
luna.data.materials.append(m_luna)
luna.hide_render = SIN_LUNA
# luz cálida desde atrás (la casa a tu espalda): el nogal se lee como nogal
bpy.ops.object.light_add(type="AREA", location=(0, -14.5, 4.2)); calida = bpy.context.object
calida.data.energy = 1900; calida.data.size = 7; calida.data.color = (1.0, 0.68, 0.42)
calida.rotation_euler = (math.radians(62), 0, 0)
bpy.ops.object.light_add(type="SUN", location=(0, 0, 10)); sol = bpy.context.object
sol.data.energy = 0.9; sol.data.color = (0.82, 0.86, 1.0); sol.data.angle = math.radians(1.0)
sol.rotation_euler = (math.radians(90) - ELEV, 0, math.radians(180))
sol.visible_glossy = False   # sin destello de "sol" en el agua: el reflejo de la luna lo pinta la web
# halo: plano detrás de la luna, mirando a la cámara; línea fina en el borde + aura corta
bpy.ops.mesh.primitive_plane_add(size=R_LUNA * 5.2, location=c_luna + dir_luna * 12); halo = bpy.context.object
halo.rotation_euler = (math.radians(90) + ELEV, 0, 0)   # normal hacia la cámara
m_halo, nodos, ln = mat("halo")
for n in list(nodos):
    if n.type != "OUTPUT_MATERIAL": nodos.remove(n)
tc = nodos.new("ShaderNodeTexCoord"); grad = nodos.new("ShaderNodeTexGradient"); grad.gradient_type = "SPHERICAL"
k_h = 1 / (R_LUNA * 2.6 * (D_LUNA + 12) / D_LUNA)   # el plano está 12 m más lejos: el borde aparente se corrige
mp = nodos.new("ShaderNodeMapping"); mp.inputs["Scale"].default_value = (k_h, k_h, k_h)
rp = nodos.new("ShaderNodeValToRGB"); el = rp.color_ramp.elements
# borde de la luna ≈ 0,615 (1 - 1/2,6). Línea fina justo afuera y un aura que se apaga rápido.
el[0].position = 0.0; el[0].color = (0, 0, 0, 1); el[1].position = 0.622; el[1].color = (0, 0, 0, 1)
for pos, v in ((0.50, 0.0), (0.56, 0.05), (0.59, 0.16), (0.606, 0.45), (0.614, 1.0)):
    e = rp.color_ramp.elements.new(pos); e.color = (v, v, v, 1)
em = nodos.new("ShaderNodeEmission"); em.inputs["Color"].default_value = (0.95, 0.96, 1.0, 1)
tr = nodos.new("ShaderNodeBsdfTransparent"); mx = nodos.new("ShaderNodeMixShader")
ln.new(tc.outputs["Object"], mp.inputs["Vector"]); ln.new(mp.outputs[0], grad.inputs["Vector"])
ln.new(grad.outputs["Fac"], rp.inputs["Fac"]); ln.new(rp.outputs["Color"], mx.inputs["Fac"])
ln.new(tr.outputs[0], mx.inputs[1]); ln.new(em.outputs[0], mx.inputs[2])
ln.new(mx.outputs[0], next(n for n in nodos if n.type == "OUTPUT_MATERIAL").inputs[0])
halo.data.materials.append(m_halo)
halo.hide_render = SIN_LUNA
s_h = em.inputs["Strength"]
for f, v in ((1, 0.18), (80, 0.25), (106, 2.6), (N, 2.8)): s_h.default_value = v; s_h.keyframe_insert("default_value", frame=f)
fz = next(n for n in m_luna.node_tree.nodes if n.type == "EMISSION").inputs["Strength"]
for f, v in ((1, 2.0), (102, 1.9), (110, 0.0)): fz.default_value = v; fz.keyframe_insert("default_value", frame=f)
sol.data.keyframe_insert("energy", frame=80); sol.data.energy = 0.12; sol.data.keyframe_insert("energy", frame=108)

# ── cámara: camina hasta el borde mirando la luna; en el borde BAJA LA MIRADA hasta ver solo el agua ───────────────
bpy.ops.object.camera_add(); cam = bpy.context.object; esc.camera = cam; cam.data.sensor_width = 36
for f, y, z, pitch, lente in ((1, -9.0, 2.6, 3.0, 22), (48, -5.4, 2.48, 3.0, 22), (74, -4.9, 2.25, -20.0, 45), (N, -4.85, 2.22, -20.0, 45)):
    cam.location = (0.0, y, z); cam.rotation_euler = (math.radians(90 + pitch), 0, 0); cam.data.lens = lente
    cam.keyframe_insert("location", frame=f); cam.keyframe_insert("rotation_euler", frame=f); cam.data.keyframe_insert("lens", frame=f)

# ── datos para la página: dónde cae el reflejo de la luna, su radio, el borde del piso y el horizonte, por cuadro ──
import json
from bpy_extras.object_utils import world_to_camera_view


def a_pantalla(p):
    v = world_to_camera_view(esc, cam, p); return [round(v.x, 4), round(1 - v.y, 4)]


reflejo = Vector((c_luna.x, c_luna.y, -c_luna.z)); lateral = Vector((R_LUNA, 0, 0))
datos = {}
for f in range(1, N + 1):
    esc.frame_set(f)
    c = a_pantalla(reflejo); r = a_pantalla(reflejo + lateral)
    datos[f] = {"reflejo": c, "radio": round(abs(r[0] - c[0]) * esc.render.resolution_x / esc.render.resolution_y, 4),
                "piso": a_pantalla(Vector((0, Y_BORDE, Z_PISO)))[1], "horizonte": a_pantalla(Vector((0, 4000, 0)))[1],
                "luna": a_pantalla(c_luna), "luna_radio": round(abs(a_pantalla(c_luna + lateral)[0] - a_pantalla(c_luna)[0]) * esc.render.resolution_x / esc.render.resolution_y, 4)}

# ── render ──────────────────────────────────────────────────────────────────────────────────────────────────────────
esc.render.engine = "CYCLES"
try:
    prefs = bpy.context.preferences.addons["cycles"].preferences
    prefs.compute_device_type = "METAL"; prefs.get_devices()
    for d in prefs.devices: d.use = True
    esc.cycles.device = "GPU"
except Exception as e:
    print("[rio] METAL no disponible:", e)
esc.cycles.samples = MUESTRAS; esc.cycles.use_denoising = True
esc.view_settings.view_transform = "AgX"; esc.view_settings.look = "AgX - Base Contrast"
esc.render.resolution_x = ANCHO; esc.render.resolution_y = round(ANCHO * 9 / 16); esc.render.resolution_percentage = 100
esc.render.image_settings.file_format = "JPEG"; esc.render.image_settings.quality = 90
os.makedirs(SALIDA, exist_ok=True)
json.dump(datos, open(os.path.join(SALIDA, "datos.json"), "w"))
if "-" in CUADROS and "," not in CUADROS:
    a, z = (int(v) for v in CUADROS.split("-")); lista = range(a, z + 1)
else:
    lista = [int(v) for v in CUADROS.split(",")]
for f in lista:
    esc.frame_set(f); esc.render.filepath = os.path.join(SALIDA, f"rio-{f:03d}.jpg")
    bpy.ops.render.render(write_still=True); print(f"[rio] cuadro {f}", flush=True)
print("[rio] TERMINADO")
