# Prueba de concepto (14-oct-2026): "el muro" — un solo muro arquitectónico hecho con los tres materiales, visto en
# un recorrido lateral. Base y paño de piedra negra, tramo de listones verticales de nogal, nicho con losa de cuarzo
# iluminada. Luz rasante de atardecer. Esta versión saca UNA imagen para que Alejo decida antes de animar.
# Uso: Blender -b -P scripts/v4/muro_recorrido.py -- <salida.png> [ancho=1600] [muestras=64] [x_camara=0]
import bpy, math, os, sys

ARGS = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
SALIDA = os.path.abspath(ARGS[0] if ARGS else "/tmp/muro.png")
ANCHO = int(ARGS[1]) if len(ARGS) > 1 else 1600
MUESTRAS = int(ARGS[2]) if len(ARGS) > 2 else 64
XCAM = float(ARGS[3]) if len(ARGS) > 3 else 0.0
MAT = os.path.expanduser("~/CastilloStudio/marca/materiales-2026-10")

bpy.ops.wm.read_factory_settings(use_empty=True)
esc = bpy.context.scene


def nuevo(nombre):
    m = bpy.data.materials.new(nombre); m.use_nodes = True
    n = m.node_tree.nodes
    return m, n, m.node_tree.links, next(x for x in n if x.type == "BSDF_PRINCIPLED")


def con_imagen(nombre, archivo, escala, rug, capa):
    m, n, ln, b = nuevo(nombre)
    t = n.new("ShaderNodeTexImage"); t.image = bpy.data.images.load(os.path.join(MAT, archivo)); t.projection = "BOX"; t.projection_blend = 0.2
    tc = n.new("ShaderNodeTexCoord"); mp = n.new("ShaderNodeMapping"); mp.inputs["Scale"].default_value = (escala,) * 3
    ln.new(tc.outputs["Object"], mp.inputs["Vector"]); ln.new(mp.outputs[0], t.inputs["Vector"]); ln.new(t.outputs["Color"], b.inputs["Base Color"])
    b.inputs["Roughness"].default_value = rug; b.inputs["Coat Weight"].default_value = capa; b.inputs["Coat Roughness"].default_value = 0.12
    return m


def nogal():
    m, n, ln, b = nuevo("nogal")
    tc = n.new("ShaderNodeTexCoord"); mp = n.new("ShaderNodeMapping"); mp.inputs["Scale"].default_value = (40, 40, 1.2)
    w = n.new("ShaderNodeTexWave"); w.wave_type = "BANDS"; w.bands_direction = "X"
    w.inputs["Distortion"].default_value = 2.5; w.inputs["Detail"].default_value = 4
    r = n.new("ShaderNodeValToRGB")
    r.color_ramp.elements[0].color = (0.02, 0.009, 0.004, 1); r.color_ramp.elements[1].color = (0.1, 0.05, 0.025, 1)
    ln.new(tc.outputs["Object"], mp.inputs["Vector"]); ln.new(mp.outputs[0], w.inputs["Vector"]); ln.new(w.outputs["Fac"], r.inputs["Fac"])
    ln.new(r.outputs["Color"], b.inputs["Base Color"])
    b.inputs["Roughness"].default_value = 0.35; b.inputs["Coat Weight"].default_value = 0.4
    return m


def caja(nombre, tam, loc, m):
    bpy.ops.mesh.primitive_cube_add(location=loc); o = bpy.context.object; o.name = nombre
    o.scale = tuple(v / 2 for v in tam); bpy.ops.object.transform_apply(scale=True)
    o.data.materials.append(m)
    bpy.ops.object.modifier_add(type="BEVEL"); o.modifiers[-1].width = 0.006; o.modifiers[-1].segments = 2
    return o


piedra = con_imagen("piedra", "piedra-2x.png", 0.16, 0.25, 0.6)
cuarzo = con_imagen("cuarzo", "cuarzo-2x.png", 0.5, 0.12, 0.7)
madera = con_imagen("nogal", "nogal-real-2k.jpg", 1.0, 0.3, 0.45)   # Poly Haven black_walnut_veneer_02 (CC0) teñido al nogal de Alejo
H = 3.6
# el muro corre a lo largo de X (de -9 a 9); cara hacia -Y
caja("muro_izq", (6.0, 0.5, H), (-6.0, 0.25, H / 2), piedra)                # paño de piedra
for i in range(26):                                                           # tramo de listones de nogal
    caja(f"liston{i}", (0.07, 0.09, H - 0.2), (-2.8 + i * 0.16, 0.0, H / 2), madera)
m_fondo, _, _, b_f = nuevo("fondo"); b_f.inputs["Base Color"].default_value = (0.012, 0.012, 0.013, 1); b_f.inputs["Roughness"].default_value = 0.8
caja("fondo_listones", (4.3, 0.1, H), (-0.8, 0.45, H / 2), m_fondo)   # negro mate: la madera y sus sombras mandan
caja("muro_der", (6.0, 0.5, H), (4.4, 0.25, H / 2), piedra)
# nicho en el paño derecho con la losa de cuarzo (se ve como una ventana de luz en la piedra)
caja("nicho_fondo", (1.6, 0.05, 2.2), (4.4, -0.03, 1.7), cuarzo)
for loc, tam in (((4.4, -0.12, 0.58), (1.8, 0.2, 0.04)), ((4.4, -0.12, 2.82), (1.8, 0.2, 0.04))):
    caja("nicho_borde", tam, loc, piedra)
bpy.ops.mesh.primitive_plane_add(size=1, location=(0, -5, 0)); piso = bpy.context.object; piso.scale = (30, 12, 1)
m_piso, n_p, ln_p, b_p = nuevo("piso")   # concreto pulido oscuro y parejo: que el protagonista sea el muro
b_p.inputs["Base Color"].default_value = (0.03, 0.031, 0.034, 1); b_p.inputs["Roughness"].default_value = 0.22
rp = n_p.new("ShaderNodeTexNoise"); rp.inputs["Scale"].default_value = 3.0; rr = n_p.new("ShaderNodeMapRange")
rr.inputs["To Min"].default_value = 0.16; rr.inputs["To Max"].default_value = 0.4
ln_p.new(rp.outputs["Fac"], rr.inputs["Value"]); ln_p.new(rr.outputs["Result"], b_p.inputs["Roughness"])
piso.data.materials.append(m_piso)
# luz del nicho (el cuarzo brilla tenue desde atrás) y luz rasante de atardecer desde la izquierda
bpy.ops.object.light_add(type="AREA", location=(4.4, -0.6, 1.7)); l = bpy.context.object
l.data.size = 1.4; l.data.energy = 120; l.data.color = (1.0, 0.9, 0.78); l.rotation_euler = (math.radians(-90), 0, 0)
l.visible_glossy = False   # que el piso no refleje la lámpara, solo el cuarzo encendido
bpy.ops.object.light_add(type="SUN", location=(0, 0, 8)); sol = bpy.context.object
sol.data.energy = 4.5; sol.data.angle = math.radians(1.2); sol.data.color = (1.0, 0.78, 0.55)
sol.rotation_euler = (math.radians(74), 0, math.radians(-78))   # bajo y casi paralelo al muro: sombras largas de los listones
mundo = bpy.data.worlds.new("cielo"); esc.world = mundo; mundo.use_nodes = True
fondo_w = next(n for n in mundo.node_tree.nodes if n.type == "BACKGROUND")
cielo = mundo.node_tree.nodes.new("ShaderNodeTexSky")
try:
    cielo.sky_type = "MULTIPLE_SCATTERING"; cielo.sun_elevation = math.radians(2.0); cielo.sun_rotation = math.radians(-160); cielo.sun_disc = False
except Exception as e:
    print("[muro] cielo:", e)
mundo.node_tree.links.new(cielo.outputs["Color"], fondo_w.inputs["Color"]); fondo_w.inputs["Strength"].default_value = 0.12
bpy.ops.object.camera_add(location=(XCAM, -10.5, 1.5)); cam = bpy.context.object; esc.camera = cam
cam.data.lens = 35; cam.rotation_euler = (math.radians(88), 0, math.radians(-6))

esc.render.engine = "CYCLES"
try:
    prefs = bpy.context.preferences.addons["cycles"].preferences
    prefs.compute_device_type = "METAL"; prefs.get_devices()
    for d in prefs.devices: d.use = True
    esc.cycles.device = "GPU"
except Exception:
    pass
esc.cycles.samples = MUESTRAS; esc.cycles.use_denoising = True
esc.view_settings.view_transform = "AgX"; esc.view_settings.look = "AgX - Medium High Contrast"
esc.render.resolution_x = ANCHO; esc.render.resolution_y = round(ANCHO * 9 / 16)
N = int(os.environ.get("N_CUADROS", "0"))
if N <= 1:
    esc.render.filepath = SALIDA; esc.render.image_settings.file_format = "PNG"
    bpy.ops.render.render(write_still=True)
    print("[muro] listo", SALIDA)
else:
    # recorrido: la cámara camina de lado frente al muro, de la piedra a los listones y termina frente al nicho
    os.makedirs(SALIDA, exist_ok=True)
    esc.render.image_settings.file_format = "JPEG"; esc.render.image_settings.quality = 92
    for f in range(N):
        t = f / (N - 1); t = t * t * (3 - 2 * t)
        cam.location.x = -5.4 + (4.4 + 5.4) * t
        cam.rotation_euler.z = math.radians(-6 + 6 * t)   # al llegar al nicho la mira queda de frente
        esc.render.filepath = os.path.join(SALIDA, f"muro-{f + 1:03d}.jpg")
        bpy.ops.render.render(write_still=True); print(f"[muro] cuadro {f + 1}", flush=True)
    print("[muro] TERMINADO")
