"""
Pasto con volumen (28-sep-2026). Alejandro: "le falta volumen y naturalidad, aún se ve muy maqueta".

Antes: pelo de partículas (hebras de un solo trazo, iguales, 110 000). Se veía peinado y plano, y subir la
cantidad tumbó el Mac (27-sep, 3,6 M hebras). Ahora: MATAS de hojas reales —cada hoja es una cinta curva
que se afina— armadas en 5 variantes, y repartidas como INSTANCIAS. Cycles guarda cada mata una sola vez y
solo una posición por copia: se pueden poner cientos de miles sin que la memoria suba casi nada.
Naturalidad: alturas distintas por mata, tono distinto por mata (Object Info → Random), hojas que se
doblan hacia afuera, hojas secas mezcladas, más densidad cerca de la casa y un poco de trébol.
"""
import bpy, bmesh, math, mathutils, os, random

VARIANTES = 8                                         # 28-sep: 8 (antes 5), cada una con su giro e inclinación


def _hoja(bm, capa, x, y, ang, alto, ancho, curva, inclina):
    """Una hoja: cinta de 4 tramos que se afina y se dobla. `capa` guarda 0 en la raíz y 1 en la punta."""
    ca, sa = math.cos(ang), math.sin(ang)
    prev = None
    for k in range(5):
        t = k / 4
        w = ancho * (1 - t) ** 0.8 / 2
        dx = (inclina * t + curva * t * t) * alto                # se abre y se vence con la altura
        h = alto * t * (1 - 0.25 * curva * t)
        cx, cy = x + ca * dx, y + sa * dx
        par = (bm.verts.new((cx - sa * w, cy + ca * w, h)), bm.verts.new((cx + sa * w, cy - ca * w, h)))
        if prev:
            f = bm.faces.new((prev[0], prev[1], par[1], par[0]))
            for lp, v in zip(f.loops, (prev[0], prev[1], par[1], par[0])):
                lp[capa].uv = (t - 0.25 if v in prev else t, 0.0)
        prev = par


def _mata(nombre, semilla, hojas, alto, col):
    rnd = random.Random(semilla)
    me = bpy.data.meshes.new(nombre); bm = bmesh.new()
    capa = bm.loops.layers.uv.new("altura")
    for _ in range(hojas):
        r = rnd.uniform(0, 0.11) * rnd.random() ** 0.5          # más hojas al centro, alguna suelta afuera
        a = rnd.uniform(0, 2 * math.pi)
        _hoja(bm, capa, r * math.cos(a), r * math.sin(a), rnd.uniform(0, 2 * math.pi),
              alto * rnd.uniform(0.5, 1.2), rnd.uniform(0.004, 0.009), rnd.uniform(0.1, 0.6), rnd.uniform(0.03, 0.28))
    bm.to_mesh(me); bm.free()
    # sin rotaciones de partícula (acuestan la mata), el giro y la inclinación van HORNEADOS en cada variante:
    # así no todas las matas miran igual
    me.transform(mathutils.Matrix.Rotation(rnd.uniform(0, 2 * math.pi), 4, "Z"))
    me.transform(mathutils.Matrix.Rotation(rnd.uniform(-0.14, 0.14), 4, mathutils.Vector((rnd.uniform(-1, 1), rnd.uniform(-1, 1), 0)).normalized()))
    _de_pie(me)
    o = bpy.data.objects.new(nombre, me); col.objects.link(o)
    for p in me.polygons: p.use_smooth = True
    return o


def _de_pie(me):
    """Las copias de un sistema de pelo alinean su eje X con la hebra (hacia arriba): la mata armada hacia +Z
    salía ACOSTADA (render del 28-sep). Se gira para que su "arriba" sea +X."""
    me.transform(mathutils.Matrix.Rotation(math.radians(90), 4, "Y"))


def _trebol(nombre, semilla, col):
    """Unas pocas hojas redondas y bajas: rompen la uniformidad del césped cortado."""
    rnd = random.Random(semilla)
    me = bpy.data.meshes.new(nombre); bm = bmesh.new()
    capa = bm.loops.layers.uv.new("altura")
    for _ in range(9):
        x, y, h = rnd.uniform(-0.06, 0.06), rnd.uniform(-0.06, 0.06), rnd.uniform(0.02, 0.05)
        vs = [bm.verts.new((x + 0.011 * math.cos(a), y + 0.011 * math.sin(a), h)) for a in [k * math.pi / 3 for k in range(6)]]
        f = bm.faces.new(vs)
        for lp in f.loops: lp[capa].uv = (0.8, 0.0)
    bm.to_mesh(me); bm.free(); _de_pie(me)
    o = bpy.data.objects.new(nombre, me); col.objects.link(o); return o


def _material():
    m = bpy.data.materials.new("pasto_hoja"); m.use_nodes = True; nt = m.node_tree
    b = next(n for n in nt.nodes if n.type == "BSDF_PRINCIPLED")
    uv = nt.nodes.new("ShaderNodeUVMap"); uv.uv_map = "altura"
    sep = nt.nodes.new("ShaderNodeSeparateXYZ"); nt.links.new(uv.outputs["UV"], sep.inputs["Vector"])
    rampa = nt.nodes.new("ShaderNodeValToRGB")
    rampa.color_ramp.elements[0].color = (0.018, 0.035, 0.008, 1)          # raíz en sombra
    rampa.color_ramp.elements[1].color = (0.16, 0.26, 0.05, 1)             # punta
    nt.links.new(sep.outputs["X"], rampa.inputs["Fac"])
    info = nt.nodes.new("ShaderNodeObjectInfo")                             # cada mata con su tono
    tono = nt.nodes.new("ShaderNodeValToRGB")
    tono.color_ramp.elements[0].color = (0.75, 0.85, 0.55, 1)              # mata más seca / amarillenta
    tono.color_ramp.elements[1].color = (1.15, 1.10, 1.0, 1)               # mata más verde
    el = tono.color_ramp.elements.new(0.06); el.color = (1.5, 1.15, 0.55, 1)  # unas pocas pajizas
    nt.links.new(info.outputs["Random"], tono.inputs["Fac"])
    mul = nt.nodes.new("ShaderNodeMix"); mul.data_type = "RGBA"; mul.blend_type = "MULTIPLY"
    mul.inputs["Factor"].default_value = 1.0
    nt.links.new(rampa.outputs["Color"], mul.inputs[6]); nt.links.new(tono.outputs["Color"], mul.inputs[7])
    # manchas del prado a escala de metros: un césped real nunca es parejo (sombra de árboles, riego, pisadas)
    geo = nt.nodes.new("ShaderNodeNewGeometry"); mancha = nt.nodes.new("ShaderNodeTexNoise")
    mancha.inputs["Scale"].default_value = 0.12; mancha.inputs["Detail"].default_value = 3.0
    nt.links.new(geo.outputs["Position"], mancha.inputs["Vector"])
    tinte_m = nt.nodes.new("ShaderNodeValToRGB")
    tinte_m.color_ramp.elements[0].color = (1.25, 1.12, 0.72, 1)      # zona más seca
    tinte_m.color_ramp.elements[1].color = (0.85, 1.0, 0.95, 1)       # zona más verde y oscura
    tinte_m.color_ramp.elements[0].position = 0.38; tinte_m.color_ramp.elements[1].position = 0.62
    nt.links.new(mancha.outputs["Fac"], tinte_m.inputs["Fac"])
    mul2 = nt.nodes.new("ShaderNodeMix"); mul2.data_type = "RGBA"; mul2.blend_type = "MULTIPLY"; mul2.inputs["Factor"].default_value = 1.0
    nt.links.new(mul.outputs[2], mul2.inputs[6]); nt.links.new(tinte_m.outputs["Color"], mul2.inputs[7])
    nt.links.new(mul2.outputs[2], b.inputs["Base Color"])
    b.inputs["Roughness"].default_value = 0.5
    b.inputs["Specular IOR Level"].default_value = 0.25
    # hoja fina: deja pasar luz verde por detrás (el contraluz es lo que hace que el pasto "brille")
    b.inputs["Transmission Weight"].default_value = 0.0      # con 0,12 las hojas salían pálidas, casi blancas
    b.inputs["Subsurface Weight"].default_value = 0.15
    m.use_backface_culling = False
    return m


def _ruido(x, y):
    """Ruido de valor suave 0…1 (sin dependencias): para que la densidad del césped tenga claros."""
    def h(i, j): return (math.sin(i * 127.1 + j * 311.7) * 43758.5453) % 1.0
    i, j = math.floor(x), math.floor(y); fx, fy = x - i, y - j
    sx, sy = fx * fx * (3 - 2 * fx), fy * fy * (3 - 2 * fy)
    a = h(i, j) + (h(i + 1, j) - h(i, j)) * sx
    b = h(i, j + 1) + (h(i + 1, j + 1) - h(i, j + 1)) * sx
    return a + (b - a) * sy


def _densidad(o, W, D, radio):
    """Más matas cerca de la casa (donde miran las cámaras), ninguna bajo la casa ni en el camino."""
    vg = o.vertex_groups.new(name="densidad")
    gx0, gx1, gy0, gy1 = -W / 2 - 1.5, W / 2 + 1.5, -D / 2 - 1.5, D / 2 + 1.5
    for v in o.data.vertices:
        x, y = v.co.x, v.co.y
        rr = math.hypot(x, y)
        if (gx0 < x < gx1 and gy0 < y < gy1) or (-1.9 < x < 1.9 and y < gy0 + 0.3) or rr > radio:
            w = 0.0
        else:
            cerca = max(0.0, 1.0 - max(0.0, rr - 16.0) / 24.0)            # plena hasta 16 m, baja hasta 40 m
            w = min(1.0, (radio - rr) / 6.0) * (0.08 + 0.92 * cerca ** 1.5)
            w *= 0.72 + 0.28 * _ruido(x * 0.35, y * 0.35)             # claros y matorrales: densidad no pareja
        vg.add([v.index], w, "REPLACE")


def pradera(W, D, col, radio=58.0, cortes=150):
    """Disco emisor invisible + 5 matas + trébol, repartidos como instancias."""
    bib = bpy.data.collections.new("pasto_matas")                         # la biblioteca no se renderiza sola
    bpy.context.scene.collection.children.link(bib)
    alto = float(os.environ.get("VILLA_PASTO_ALTO", "0.10"))              # césped de Poissy: cortado, pero vivo
    m = _material()
    for k in range(VARIANTES):
        o = _mata(f"pasto_mata_{k}", 11 + k, hojas=80 + 12 * k, alto=alto * (0.8 + 0.07 * k), col=bib)
        o.data.materials.append(m)
    t = _trebol("pasto_trebol", 99, bib); t.data.materials.append(m)
    # que la biblioteca no aparezca en el origen: se EXCLUYE de la capa (hide_render también apagaba las copias)
    capa = bpy.context.view_layer.layer_collection.children.get(bib.name)
    if capa: capa.exclude = True

    bpy.ops.mesh.primitive_grid_add(x_subdivisions=cortes, y_subdivisions=cortes, size=radio * 2, location=(0, 0, 0.002))
    o = bpy.context.object; o.name = "pasto_emisor"
    for c in o.users_collection: c.objects.unlink(o)
    col.objects.link(o)
    _densidad(o, W, D, radio)
    o.modifiers.new("pasto", "PARTICLE_SYSTEM")
    ps = o.particle_systems[-1]; st = ps.settings
    ps.vertex_group_density = "densidad"
    st.type = "HAIR"; st.use_advanced_hair = True
    st.count = int(os.environ.get("VILLA_PASTO_N", "420000"))            # MATAS, no hebras: son instancias
    st.emit_from = "FACE"; st.distribution = "RAND"; st.hair_length = 1.0
    st.render_type = "COLLECTION"; st.instance_collection = bib; st.use_collection_pick_random = True
    st.particle_size = 1.0; st.size_random = 0.55
    # SIN rotaciones: con ellas las matas salían acostadas (prueba a ras del 28-sep, las dos lado a lado)
    st.use_rotations = os.environ.get("VILLA_PASTO_ROT", "0") == "1"; st.rotation_mode = "NOR"; st.phase_factor_random = 2.0
    st.rotation_factor_random = 0.08                                       # un poco torcidas, no en fila
    o.show_instancer_for_render = False
    print(f"[villa_pasto] {st.count} matas instanciadas ({VARIANTES} variantes + trébol)")
    return o
