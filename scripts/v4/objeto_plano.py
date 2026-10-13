# Remate de la intro v4 (13-oct-2026): una muestra de materiales (piedra negra · nogal · cuarzo) gira con el scroll, sus
# capas se separan y la misma vista se entrega dos veces: RENDER (Cycles) y PLANO (líneas Freestyle sobre transparente).
# La página cruza de una a otra y dibuja las líneas guía hacia las etiquetas con las posiciones que exporta este script.
#
# Uso:  Blender -b -P scripts/v4/objeto_plano.py -- <salida_dir> [cuadros=1-90] [muestras=48] [ancho=1440] [pasada=ambas]
#   pasada: render | lineas | ambas
import bpy, math, os, sys, json
from mathutils import Vector
from bpy_extras.object_utils import world_to_camera_view

ARGS = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
SALIDA = os.path.abspath(ARGS[0] if ARGS else "/tmp/objeto")
CUADROS = ARGS[1] if len(ARGS) > 1 else "1-90"
MUESTRAS = int(ARGS[2]) if len(ARGS) > 2 else 48
ANCHO = int(ARGS[3]) if len(ARGS) > 3 else 1440
PASADA = ARGS[4] if len(ARGS) > 4 else "ambas"
MAT = os.path.expanduser("~/CastilloStudio/marca/materiales-2026-10")
N = 90

bpy.ops.wm.read_factory_settings(use_empty=True)
esc = bpy.context.scene; esc.frame_start, esc.frame_end = 1, N


def material(nombre):
    m = bpy.data.materials.new(nombre); m.use_nodes = True
    nodos = m.node_tree.nodes
    return m, nodos, m.node_tree.links, next(n for n in nodos if n.type == "BSDF_PRINCIPLED")


def con_imagen(nombre, archivo, escala, rugosidad, capa):
    m, nodos, ln, b = material(nombre)
    t = nodos.new("ShaderNodeTexImage"); t.image = bpy.data.images.load(os.path.join(MAT, archivo))
    t.projection = "BOX"; t.projection_blend = 0.15
    tc = nodos.new("ShaderNodeTexCoord"); mp = nodos.new("ShaderNodeMapping"); mp.inputs["Scale"].default_value = (escala,) * 3
    ln.new(tc.outputs["Object"], mp.inputs["Vector"]); ln.new(mp.outputs[0], t.inputs["Vector"]); ln.new(t.outputs["Color"], b.inputs["Base Color"])
    b.inputs["Roughness"].default_value = rugosidad; b.inputs["Coat Weight"].default_value = capa; b.inputs["Coat Roughness"].default_value = 0.06
    return m


def nogal():
    m, nodos, ln, b = material("nogal")
    tc = nodos.new("ShaderNodeTexCoord"); mp = nodos.new("ShaderNodeMapping"); mp.inputs["Scale"].default_value = (1.0, 14, 1.0)
    w = nodos.new("ShaderNodeTexWave"); w.wave_type = "BANDS"; w.bands_direction = "X"
    w.inputs["Scale"].default_value = 2.2; w.inputs["Distortion"].default_value = 7; w.inputs["Detail"].default_value = 5
    r = nodos.new("ShaderNodeValToRGB")
    r.color_ramp.elements[0].color = (0.022, 0.009, 0.004, 1); r.color_ramp.elements[1].color = (0.075, 0.036, 0.018, 1)
    ln.new(tc.outputs["Object"], mp.inputs["Vector"]); ln.new(mp.outputs[0], w.inputs["Vector"])
    ln.new(w.outputs["Fac"], r.inputs["Fac"]); ln.new(r.outputs["Color"], b.inputs["Base Color"])
    b.inputs["Roughness"].default_value = 0.38; b.inputs["Coat Weight"].default_value = 0.4
    return m


def losa(nombre, tam, z, m):
    bpy.ops.mesh.primitive_cube_add(location=(0, 0, z)); o = bpy.context.object; o.name = nombre
    o.scale = (tam[0] / 2, tam[1] / 2, tam[2] / 2); o.data.materials.append(m)
    bpy.ops.object.transform_apply(scale=True)
    bpy.ops.object.modifier_add(type="BEVEL"); o.modifiers[-1].width = 0.012; o.modifiers[-1].segments = 3
    return o


m_piedra = con_imagen("piedra", "piedra-negra-vetas-grises.png", 1.1, 0.24, 0.7)
m_cuarzo = con_imagen("cuarzo", "cuarzo-textura.png", 0.9, 0.12, 0.5)
pivote = bpy.data.objects.new("pivote", None); esc.collection.objects.link(pivote)
piedra = losa("piedra", (1.6, 1.0, 0.34), 0.17, m_piedra)
madera = losa("nogal", (1.42, 0.86, 0.10), 0.39, nogal())
cuarzo = losa("cuarzo", (1.24, 0.74, 0.06), 0.47, m_cuarzo)
for o in (piedra, madera, cuarzo): o.parent = pivote
# las capas se separan como un plano en explosión (cuadros 30 → 70)
for o, dz in ((madera, 0.22), (cuarzo, 0.48)):
    o.keyframe_insert("location", frame=30); o.location.z += dz; o.keyframe_insert("location", frame=70)
pivote.rotation_euler = (0, 0, math.radians(-38)); pivote.keyframe_insert("rotation_euler", frame=1)
pivote.rotation_euler = (0, 0, math.radians(52)); pivote.keyframe_insert("rotation_euler", frame=N)

# luz de estudio
for loc, rot, e, tam, color in (((-2.6, -2.4, 3.2), (55, 0, -48), 260, 2.2, (1.0, 0.93, 0.85)),
                                 ((2.8, 1.6, 2.2), (65, 0, 125), 140, 1.4, (0.85, 0.9, 1.0)),
                                 ((0.0, 3.0, 0.6), (95, 0, 180), 90, 2.5, (1.0, 1.0, 1.0))):
    bpy.ops.object.light_add(type="AREA", location=loc); l = bpy.context.object
    l.data.energy = e; l.data.size = tam; l.data.color = color; l.rotation_euler = tuple(math.radians(v) for v in rot)

bpy.ops.object.camera_add(location=(0, -4.6, 2.55)); cam = bpy.context.object; esc.camera = cam
cam.data.lens = 50; cam.rotation_euler = (math.radians(63.5), 0, 0)

# puntos que la página une con las etiquetas (coordenadas locales de cada losa)
ANCLAS = {"diseno": (cuarzo, (0.62, -0.37, 0.03)), "recorrido": (cuarzo, (-0.62, 0.37, 0.03)),
          "formulario": (madera, (0.71, 0.0, 0.0)), "aviso": (piedra, (0.8, -0.5, 0.0)), "respaldo": (piedra, (-0.8, 0.5, -0.17))}

esc.render.engine = "CYCLES"
try:
    prefs = bpy.context.preferences.addons["cycles"].preferences
    prefs.compute_device_type = "METAL"; prefs.get_devices()
    for d in prefs.devices: d.use = True
    esc.cycles.device = "GPU"
except Exception as e:
    print("[objeto] METAL no disponible:", e)
esc.cycles.use_denoising = True; esc.render.film_transparent = True
esc.view_settings.view_transform = "AgX"; esc.view_settings.look = "AgX - Medium High Contrast"
esc.render.resolution_x = ANCHO; esc.render.resolution_y = round(ANCHO * 9 / 16)
esc.render.image_settings.file_format = "PNG"; esc.render.image_settings.color_mode = "RGBA"
os.makedirs(SALIDA, exist_ok=True)
lista = range(*(lambda a, z: (a, z + 1))(*(int(v) for v in CUADROS.split("-")))) if "-" in CUADROS else [int(v) for v in CUADROS.split(",")]

# posiciones 2D de las anclas por cuadro (0-1, origen arriba a la izquierda)
anclas = {}
for f in range(1, N + 1):
    esc.frame_set(f); fila = {}
    for nombre, (o, p) in ANCLAS.items():
        v = world_to_camera_view(esc, cam, o.matrix_world @ Vector(p)); fila[nombre] = [round(v.x, 4), round(1 - v.y, 4)]
    anclas[f] = fila
json.dump(anclas, open(os.path.join(SALIDA, "anclas.json"), "w"))


def pasada_render():
    esc.cycles.samples = MUESTRAS; esc.render.use_freestyle = False
    for f in lista:
        esc.frame_set(f); esc.render.filepath = os.path.join(SALIDA, f"render-{f:03d}.png")
        bpy.ops.render.render(write_still=True); print(f"[objeto] render {f}", flush=True)


def pasada_lineas():
    # misma vista: todo en holdout (transparente) y solo las aristas en línea fina color cuarzo
    hold = bpy.data.materials.new("hold"); hold.use_nodes = True; nt = hold.node_tree
    for n in list(nt.nodes):
        if n.type != "OUTPUT_MATERIAL": nt.nodes.remove(n)
    h = nt.nodes.new("ShaderNodeHoldout"); nt.links.new(h.outputs[0], next(n for n in nt.nodes if n.type == "OUTPUT_MATERIAL").inputs[0])
    for o in (piedra, madera, cuarzo):
        o.data.materials[0] = hold
        for md in o.modifiers: md.show_render = False   # sin bisel: aristas a 90° que Freestyle sí detecta
    esc.cycles.samples = 1; esc.render.use_freestyle = True; esc.render.line_thickness_mode = "ABSOLUTE"; esc.render.line_thickness = 1.3
    vl = esc.view_layers[0]; vl.use_freestyle = True
    fs = vl.freestyle_settings; ls = fs.linesets[0] if fs.linesets else fs.linesets.new("lineas")
    ls.select_by_visibility = False   # también las aristas ocultas, como en un plano
    ls.select_silhouette = ls.select_border = ls.select_crease = True
    st = ls.linestyle or bpy.data.linestyles.new("plano"); ls.linestyle = st; st.color = (0.95, 0.94, 0.91); st.thickness = 1.3
    for f in lista:
        esc.frame_set(f); esc.render.filepath = os.path.join(SALIDA, f"lineas-{f:03d}.png")
        bpy.ops.render.render(write_still=True); print(f"[objeto] lineas {f}", flush=True)


if PASADA in ("render", "ambas"): pasada_render()
if PASADA in ("lineas", "ambas"): pasada_lineas()
print("[objeto] TERMINADO")
