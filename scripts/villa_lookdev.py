"""
Prueba de techo de calidad (28-sep-2026): UN rincón al máximo antes de meterle materia a toda la casa.

El rincón: llegando por la rampa al solárium, a la altura de los ojos, mirando la ventana de la pantalla curva
(el final del recorrido de Le Corbusier). Se activa con VILLA_CAM=rincon y cambia solo lo que la toma ve:
  1. revoque sin mosaicos (coordenadas de mundo + dos muestras de la textura mezcladas con ruido)
  2. envejecimiento: oclusión en las esquinas y una línea de mugre en el arranque de los muros
  3. losetas de la cubierta en las caras que miran arriba (el resto de la pieza sigue siendo revoque)
  4. biseles en la obra de la cubierta y la rampa
  5. cámara con lente de 26 mm, profundidad de campo suave y un retoque final (brillo, aberración, viñeta)
Nada de esto es definitivo para la fase 3: es la medida de hasta dónde llega el Mac.
"""
import bpy, math, mathutils, os

CUBIERTA = 6.66                                    # cubierta acabada (se recibe del script principal)


def _ruta(assets, prefijo, k):
    return os.path.join(assets, f"{prefijo}_{k}_2k.jpg")


def _muestra(nt, pos, imgs, metros, giro, corrimiento):
    """Una lectura de las texturas en proyección de caja, con su propia escala, giro y corrimiento."""
    mp = nt.nodes.new("ShaderNodeMapping")
    mp.inputs["Scale"].default_value = (1 / metros,) * 3
    mp.inputs["Rotation"].default_value = (0, 0, giro)
    mp.inputs["Location"].default_value = corrimiento
    nt.links.new(pos, mp.inputs["Vector"])
    out = {}
    for k, im in imgs.items():
        n = nt.nodes.new("ShaderNodeTexImage"); n.image = im; n.projection = "BOX"; n.projection_blend = 0.3
        nt.links.new(mp.outputs["Vector"], n.inputs["Vector"]); out[k] = n.outputs["Color"]
    return out


def _mezcla(nt, fac, a, b, tipo="RGBA"):
    m = nt.nodes.new("ShaderNodeMix"); m.data_type = tipo
    nt.links.new(fac, m.inputs["Factor"])
    nt.links.new(a, m.inputs[6 if tipo == "RGBA" else 4]); nt.links.new(b, m.inputs[7 if tipo == "RGBA" else 5])
    return m.outputs[2 if tipo == "RGBA" else 1]


def _valor(nt, op, a, b=None):
    n = nt.nodes.new("ShaderNodeMath"); n.operation = op
    for i, v in enumerate((a, b)):
        if v is None: continue
        if isinstance(v, (int, float)): n.inputs[i].default_value = v
        else: nt.links.new(v, n.inputs[i])
    return n.outputs[0]


def revoque_sin_mosaico(m, assets, tinte=(0.86, 0.84, 0.79)):
    """El revoque blanco: la foto escaneada solo aporta variación; el color lo pone el tinte."""
    prefijo = "painted_plaster_wall"
    if not os.path.exists(_ruta(assets, prefijo, "diff")): print("[lookdev] sin texturas de revoque"); return
    imgs = {k: bpy.data.images.load(_ruta(assets, prefijo, k), check_existing=True) for k in ("diff", "rough", "nor")}
    for k in ("rough", "nor"): imgs[k].colorspace_settings.name = "Non-Color"
    nt = m.node_tree; nt.nodes.clear()
    out = nt.nodes.new("ShaderNodeOutputMaterial"); b = nt.nodes.new("ShaderNodeBsdfPrincipled")
    nt.links.new(b.outputs["BSDF"], out.inputs["Surface"])
    geo = nt.nodes.new("ShaderNodeNewGeometry")
    pos = geo.outputs["Position"]                              # mundo: la textura no se corta entre piezas
    s1 = _muestra(nt, pos, imgs, 3.4, 0.0, (0, 0, 0))
    s2 = _muestra(nt, pos, imgs, 2.3, math.radians(37), (0.37, 0.71, 0.13))
    ruido = nt.nodes.new("ShaderNodeTexNoise"); ruido.inputs["Scale"].default_value = 0.35
    ruido.inputs["Detail"].default_value = 2.0; nt.links.new(pos, ruido.inputs["Vector"])
    fac = nt.nodes.new("ShaderNodeMapRange"); fac.inputs["From Min"].default_value = 0.42; fac.inputs["From Max"].default_value = 0.58
    nt.links.new(ruido.outputs["Fac"], fac.inputs["Value"]); f = fac.outputs["Result"]
    diff = _mezcla(nt, f, s1["diff"], s2["diff"])
    # blanco cálido: luminancia de la foto comprimida a ±6 % sobre el tinte
    bw = nt.nodes.new("ShaderNodeRGBToBW"); nt.links.new(diff, bw.inputs["Color"])
    mr = nt.nodes.new("ShaderNodeMapRange"); mr.inputs["To Min"].default_value = 0.90; mr.inputs["To Max"].default_value = 1.03
    nt.links.new(bw.outputs["Val"], mr.inputs["Value"])
    # envejecimiento: oclusión (esquinas) y mugre en el arranque de los muros sobre la cubierta
    ao = nt.nodes.new("ShaderNodeAmbientOcclusion"); ao.inputs["Distance"].default_value = 0.45
    ao_f = nt.nodes.new("ShaderNodeMapRange"); ao_f.inputs["To Min"].default_value = 0.80
    nt.links.new(ao.outputs["AO"], ao_f.inputs["Value"])
    sep = nt.nodes.new("ShaderNodeSeparateXYZ"); nt.links.new(pos, sep.inputs["Vector"])
    alto = _valor(nt, "SUBTRACT", sep.outputs["Z"], CUBIERTA)
    zocalo = nt.nodes.new("ShaderNodeMapRange"); zocalo.inputs["From Min"].default_value = 0.0
    zocalo.inputs["From Max"].default_value = 0.35; zocalo.inputs["To Min"].default_value = 0.86
    nt.links.new(alto, zocalo.inputs["Value"])
    lejos = _valor(nt, "GREATER_THAN", _valor(nt, "ABSOLUTE", alto), 1.5)      # solo cerca de la cubierta
    zoc = _valor(nt, "MAXIMUM", zocalo.outputs["Result"], lejos)
    # chorreaduras de lluvia: ruido estirado en vertical, solo en caras verticales (−7 % como mucho)
    mp_ch = nt.nodes.new("ShaderNodeMapping"); mp_ch.inputs["Scale"].default_value = (2.2, 2.2, 0.25)
    nt.links.new(pos, mp_ch.inputs["Vector"])
    ch = nt.nodes.new("ShaderNodeTexNoise"); ch.inputs["Scale"].default_value = 1.0; ch.inputs["Detail"].default_value = 4.0
    nt.links.new(mp_ch.outputs["Vector"], ch.inputs["Vector"])
    ch_f = nt.nodes.new("ShaderNodeMapRange"); ch_f.inputs["From Min"].default_value = 0.35; ch_f.inputs["From Max"].default_value = 0.65
    ch_f.inputs["To Min"].default_value = 0.955; nt.links.new(ch.outputs["Fac"], ch_f.inputs["Value"])
    geo_n = nt.nodes.new("ShaderNodeNewGeometry"); sep_n = nt.nodes.new("ShaderNodeSeparateXYZ")
    nt.links.new(geo_n.outputs["Normal"], sep_n.inputs["Vector"])
    horizontal = _valor(nt, "GREATER_THAN", _valor(nt, "ABSOLUTE", sep_n.outputs["Z"]), 0.5)
    chorreado = _valor(nt, "MAXIMUM", ch_f.outputs["Result"], horizontal)
    k = _valor(nt, "MULTIPLY", _valor(nt, "MULTIPLY", mr.outputs["Result"], ao_f.outputs["Result"]), zoc)
    k = _valor(nt, "MULTIPLY", k, chorreado)
    col = nt.nodes.new("ShaderNodeMix"); col.data_type = "RGBA"; col.blend_type = "MULTIPLY"
    col.inputs["Factor"].default_value = 1.0; col.inputs[6].default_value = (*tinte, 1)
    nt.links.new(k, col.inputs[7]); nt.links.new(col.outputs[2], b.inputs["Base Color"])
    rough = nt.nodes.new("ShaderNodeMapRange"); rough.inputs["To Min"].default_value = 0.55; rough.inputs["To Max"].default_value = 0.85
    nt.links.new(_mezcla(nt, f, s1["rough"], s2["rough"]), rough.inputs["Value"])
    nt.links.new(rough.outputs["Result"], b.inputs["Roughness"])
    nm = nt.nodes.new("ShaderNodeNormalMap"); nm.inputs["Strength"].default_value = 0.22
    nt.links.new(_mezcla(nt, f, s1["nor"], s2["nor"]), nm.inputs["Color"]); nt.links.new(nm.outputs["Normal"], b.inputs["Normal"])
    return b, nt, pos, mr.outputs["Result"], ao_f.outputs["Result"]


def _img(nt, ruta, vector, dato):
    n = nt.nodes.new("ShaderNodeTexImage"); n.image = bpy.data.images.load(ruta, check_existing=True)
    if dato: n.image.colorspace_settings.name = "Non-Color"
    nt.links.new(vector, n.inputs["Vector"]); return n.outputs["Color"]


def losetas_arriba(m, b, nt, pos, detalle, ao, assets):
    """Sobre la misma pieza: donde la cara mira arriba y está a nivel de cubierta, losetas de 50 cm de concreto
    escaneado (cada loseta lee la foto en otro lugar: no se repite) con juntas donde a trechos crece el pasto."""
    geo = nt.nodes.new("ShaderNodeNewGeometry")
    sep_n = nt.nodes.new("ShaderNodeSeparateXYZ"); nt.links.new(geo.outputs["Normal"], sep_n.inputs["Vector"])
    arriba = _valor(nt, "GREATER_THAN", sep_n.outputs["Z"], 0.9)
    sep = nt.nodes.new("ShaderNodeSeparateXYZ"); nt.links.new(pos, sep.inputs["Vector"])
    en_cubierta = _valor(nt, "LESS_THAN", _valor(nt, "ABSOLUTE", _valor(nt, "SUBTRACT", sep.outputs["Z"], CUBIERTA)), 0.05)
    es_piso = _valor(nt, "MULTIPLY", arriba, en_cubierta)
    lad = nt.nodes.new("ShaderNodeTexBrick"); nt.links.new(pos, lad.inputs["Vector"])
    lad.offset = 0.0; lad.squash = 1.0
    lad.inputs["Scale"].default_value = 1.0; lad.inputs["Brick Width"].default_value = 0.5
    lad.inputs["Row Height"].default_value = 0.5; lad.inputs["Mortar Size"].default_value = 0.011
    lad.inputs["Mortar Smooth"].default_value = 0.25; lad.inputs["Bias"].default_value = 0.0
    junta = lad.outputs["Fac"]                                   # 1 = junta (verificado en render: al revés sale verde)
    # cada loseta: la foto corrida a un lugar al azar + un tono propio
    celda = nt.nodes.new("ShaderNodeVectorMath"); celda.operation = "SNAP"; celda.inputs[1].default_value = (0.5, 0.5, 0.5)
    nt.links.new(pos, celda.inputs[0])
    azar = nt.nodes.new("ShaderNodeTexWhiteNoise"); azar.noise_dimensions = "3D"
    nt.links.new(celda.outputs["Vector"], azar.inputs["Vector"])
    mp = nt.nodes.new("ShaderNodeMapping"); mp.inputs["Scale"].default_value = (1 / 2.0,) * 3
    nt.links.new(pos, mp.inputs["Vector"]); nt.links.new(azar.outputs["Color"], mp.inputs["Location"])
    ruta = lambda k: os.path.join(assets, f"concrete_floor_worn_001_{k}_2k.jpg")
    if not os.path.exists(ruta("diff")): print("[lookdev] sin escaneo de concreto"); return
    c_diff = _img(nt, ruta("diff"), mp.outputs["Vector"], False)
    c_rough = _img(nt, ruta("rough"), mp.outputs["Vector"], True)
    c_nor = _img(nt, ruta("nor"), mp.outputs["Vector"], True)
    tono_f = nt.nodes.new("ShaderNodeMapRange"); tono_f.inputs["To Min"].default_value = 0.88; tono_f.inputs["To Max"].default_value = 1.08
    nt.links.new(azar.outputs["Value"], tono_f.inputs["Value"])
    mancha = nt.nodes.new("ShaderNodeTexNoise"); mancha.inputs["Scale"].default_value = 0.9; mancha.inputs["Detail"].default_value = 3
    nt.links.new(pos, mancha.inputs["Vector"])
    mancha_f = nt.nodes.new("ShaderNodeMapRange"); mancha_f.inputs["From Min"].default_value = 0.4
    mancha_f.inputs["From Max"].default_value = 0.7; mancha_f.inputs["To Min"].default_value = 0.82
    nt.links.new(mancha.outputs["Fac"], mancha_f.inputs["Value"])
    k_loseta = _valor(nt, "MULTIPLY", _valor(nt, "MULTIPLY", tono_f.outputs["Result"], mancha_f.outputs["Result"]), ao)
    # el escaneo es oscuro (albedo ~0,15, medido en el canal de depuración): aporta la VARIACIÓN, el tono lo fija
    # la losa clara de la cubierta. Luminancia / 0,15, recortada a 0,65…1,35, por un gris cálido de 0,50.
    c_bw = nt.nodes.new("ShaderNodeRGBToBW"); nt.links.new(c_diff, c_bw.inputs["Color"])
    c_var = nt.nodes.new("ShaderNodeMapRange"); c_var.clamp = True
    c_var.inputs["From Min"].default_value = 0.0; c_var.inputs["From Max"].default_value = 0.30
    c_var.inputs["To Min"].default_value = 0.0; c_var.inputs["To Max"].default_value = 2.0
    nt.links.new(c_bw.outputs["Val"], c_var.inputs["Value"])
    c_var_c = _valor(nt, "MINIMUM", _valor(nt, "MAXIMUM", c_var.outputs["Result"], 0.65), 1.35)
    tinte = nt.nodes.new("ShaderNodeMix"); tinte.data_type = "RGBA"; tinte.blend_type = "MULTIPLY"
    tinte.inputs["Factor"].default_value = 1.0; tinte.inputs[6].default_value = (0.50, 0.48, 0.44, 1)
    nt.links.new(c_var_c, tinte.inputs[7])
    loseta = nt.nodes.new("ShaderNodeMix"); loseta.data_type = "RGBA"; loseta.blend_type = "MULTIPLY"
    loseta.inputs["Factor"].default_value = 1.0
    nt.links.new(tinte.outputs[2], loseta.inputs[6]); nt.links.new(k_loseta, loseta.inputs[7])
    # juntas: mortero oscuro, y en un tercio de ellas pasto (el escaneo de pasto que ya se usa en el prado)
    pasto = os.path.join(assets, "leafy_grass_diff_2k.jpg")
    mp_p = nt.nodes.new("ShaderNodeMapping"); mp_p.inputs["Scale"].default_value = (1 / 0.6,) * 3
    nt.links.new(pos, mp_p.inputs["Vector"])
    verde = nt.nodes.new("ShaderNodeMix"); verde.data_type = "RGBA"; verde.blend_type = "MULTIPLY"
    verde.inputs["Factor"].default_value = 1.0; verde.inputs[6].default_value = (0.30, 0.42, 0.16, 1)
    nt.links.new(_img(nt, pasto, mp_p.outputs["Vector"], False), verde.inputs[7])
    donde = nt.nodes.new("ShaderNodeTexNoise"); donde.inputs["Scale"].default_value = 1.6; nt.links.new(pos, donde.inputs["Vector"])
    donde_f = nt.nodes.new("ShaderNodeMapRange"); donde_f.inputs["From Min"].default_value = 0.60; donde_f.inputs["From Max"].default_value = 0.66
    nt.links.new(donde.outputs["Fac"], donde_f.inputs["Value"])
    mortero = nt.nodes.new("ShaderNodeMix"); mortero.data_type = "RGBA"
    nt.links.new(donde_f.outputs["Result"], mortero.inputs["Factor"])
    mortero.inputs[6].default_value = (0.13, 0.125, 0.11, 1); nt.links.new(verde.outputs[2], mortero.inputs[7])
    piso = _mezcla(nt, junta, loseta.outputs[2], mortero.outputs[2])
    base_rev = b.inputs["Base Color"].links[0].from_socket
    nt.links.new(_mezcla(nt, es_piso, base_rev, piso), b.inputs["Base Color"])
    dbg = os.environ.get("VILLA_DEBUG_PISO")                     # verificación: pinta un canal del piso sin luz
    if dbg:
        em = nt.nodes.new("ShaderNodeEmission"); salida = next(n for n in nt.nodes if n.type == "OUTPUT_MATERIAL")
        nt.links.new({"piso": piso, "es_piso": es_piso, "junta": junta}[dbg], em.inputs["Color"])
        nt.links.new(em.outputs[0], salida.inputs["Surface"])
    # rugosidad y relieve
    rough_rev = b.inputs["Roughness"].links[0].from_socket
    r_piso = _valor(nt, "MAXIMUM", c_rough, junta)
    rr = nt.nodes.new("ShaderNodeMix"); rr.data_type = "FLOAT"
    nt.links.new(es_piso, rr.inputs["Factor"]); nt.links.new(rough_rev, rr.inputs[2]); nt.links.new(r_piso, rr.inputs[3])
    nt.links.new(rr.outputs[0], b.inputs["Roughness"])
    nm_c = nt.nodes.new("ShaderNodeNormalMap"); nm_c.inputs["Strength"].default_value = 0.7
    nt.links.new(c_nor, nm_c.inputs["Color"])
    bump = nt.nodes.new("ShaderNodeBump"); bump.inputs["Strength"].default_value = float(os.environ.get("VILLA_BUMP_JUNTA", "0.12"))
    nt.links.new(_valor(nt, "SUBTRACT", 1.0, junta), bump.inputs["Height"]); nt.links.new(nm_c.outputs["Normal"], bump.inputs["Normal"])
    normal_rev = b.inputs["Normal"].links[0].from_socket
    nn = nt.nodes.new("ShaderNodeMix"); nn.data_type = "VECTOR"
    nt.links.new(es_piso, nn.inputs["Factor"]); nt.links.new(normal_rev, nn.inputs[4]); nt.links.new(bump.outputs["Normal"], nn.inputs[5])
    nt.links.new(nn.outputs[1], b.inputs["Normal"])


def _caja_obj(nombre, x0, x1, z0, z1, h0, h1, col):
    import bmesh
    me = bpy.data.meshes.new(nombre); bm = bmesh.new()
    r = bmesh.ops.create_cube(bm, size=1.0)
    for v in r["verts"]:
        v.co = ((x0 + x1) / 2 + v.co.x * (x1 - x0), (z0 + z1) / 2 + v.co.y * (z1 - z0), (h0 + h1) / 2 + v.co.z * (h1 - h0))
    bm.to_mesh(me); bm.free()
    o = bpy.data.objects.new(nombre, me); col.objects.link(o); return o


def villa_obra_suavizar(me):
    import villa_obra; villa_obra.suavizar_curvas(me)


def pantalla_continua(esc, ventana, alto_antepecho, alto_dintel):
    """Las dos pantallas + el paño de la ventana eran tres piezas y el bisel dibujaba juntas que no existen.
    Aquí se funden en UN muro (unión booleana) y la ventana se le recorta después (diferencia)."""
    piezas = [o for o in esc.objects if o.name.startswith("cub_pantalla")]
    viejas = [o for o in esc.objects if o.name.startswith("cub_ventana")]
    if not piezas: return
    base = piezas[0]; col = base.users_collection[0]; alto = max(v.co.z for v in base.data.vertices)
    x0, x1, z0, z1 = ventana
    pano = _caja_obj("cub_pano", x0 - 0.002, x1 + 0.002, z0, z1, CUBIERTA, alto, col)
    for o in piezas[1:] + [pano]:
        m = base.modifiers.new("union", "BOOLEAN"); m.operation = "UNION"; m.solver = "EXACT"; m.object = o
        bpy.context.view_layer.objects.active = base; bpy.ops.object.modifier_apply(modifier=m.name)
    hueco = _caja_obj("cub_hueco", x0, x1, z0 - 0.3, z1 + 0.3, CUBIERTA + alto_antepecho, CUBIERTA + alto_dintel, col)
    m = base.modifiers.new("ventana", "BOOLEAN"); m.operation = "DIFFERENCE"; m.solver = "EXACT"; m.object = hueco
    bpy.ops.object.modifier_apply(modifier=m.name)
    for o in piezas[1:] + viejas + [pano, hueco]: bpy.data.objects.remove(o, do_unlink=True)
    base.name = "cub_pantalla_solarium"
    villa_obra_suavizar(base.data)
    print(f"[lookdev] pantalla del solárium en una pieza ({len(base.data.polygons)} caras)")


def biseles(esc):
    for o in esc.objects:
        if o.type == "MESH" and o.name.startswith(("cub_", "circ_", "antepecho")) and "bisel" not in o.modifiers:
            bv = o.modifiers.new("bisel", "BEVEL"); bv.width = 0.012; bv.segments = 2
            bv.limit_method = "ANGLE"; bv.angle_limit = math.radians(40); bv.harden_normals = True


def camara(cam, cam_d, esc):
    """De pie en el tramo este de la rampa a la cubierta, 0,6 m antes de la boca, mirando la ventana."""
    z_cam = 1.9
    piso = 4.985 + (z_cam + 6.08) / 8.58 * 1.675           # superficie del tramo en ese punto
    cam.location = (0.66, z_cam, piso + 1.6)
    mira = mathutils.Vector((-0.52, 8.3, CUBIERTA + 1.45))
    cam.rotation_euler = (mira - cam.location).to_track_quat("-Z", "Y").to_euler()
    cam_d.type = "PERSP"; cam_d.lens = 26; cam_d.shift_y = 0.02
    cam_d.dof.use_dof = True; cam_d.dof.focus_distance = (mira - cam.location).length; cam_d.dof.aperture_fstop = 5.6
    esc.render.resolution_x, esc.render.resolution_y = 1920, 1080


def retoque(esc):
    """Retoque del compositor (Blender 5): un brillo suave, un pelo de aberración de lente y viñeta."""
    try:
        ng = bpy.data.node_groups.new("retoque", "CompositorNodeTree"); esc.compositing_node_group = ng
        ng.interface.new_socket("Image", in_out="OUTPUT", socket_type="NodeSocketColor")
        rl = ng.nodes.new("CompositorNodeRLayers"); sal = ng.nodes.new("NodeGroupOutput")
        gl = ng.nodes.new("CompositorNodeGlare")
        for tipo in ("Bloom", "Fog Glow"):
            try: gl.inputs["Type"].default_value = tipo; break
            except Exception: pass
        gl.inputs["Threshold"].default_value = 1.0; gl.inputs["Strength"].default_value = 0.35; gl.inputs["Size"].default_value = 0.6
        ld = ng.nodes.new("CompositorNodeLensdist"); ld.inputs["Dispersion"].default_value = 0.012
        ng.links.new(rl.outputs["Image"], gl.inputs["Image"]); ng.links.new(gl.outputs["Image"], ld.inputs["Image"])
        el = ng.nodes.new("CompositorNodeEllipseMask"); el.inputs["Size"].default_value = (0.95, 0.95)
        bl = ng.nodes.new("CompositorNodeBlur"); bl.inputs["Size"].default_value = (300, 300)
        ng.links.new(el.outputs["Mask"], bl.inputs["Image"])
        rango = ng.nodes.new("ShaderNodeMapRange"); rango.inputs["To Min"].default_value = 0.72
        ng.links.new(bl.outputs["Image"], rango.inputs["Value"])
        mx = ng.nodes.new("ShaderNodeMix"); mx.data_type = "RGBA"; mx.blend_type = "MULTIPLY"
        mx.inputs["Factor"].default_value = 1.0
        ng.links.new(ld.outputs["Image"], mx.inputs[6]); ng.links.new(rango.outputs["Result"], mx.inputs[7])
        ng.links.new(mx.outputs[2], sal.inputs[0])
        print("[lookdev] retoque del compositor: brillo + aberración + viñeta")
    except Exception as e:
        print("[lookdev] retoque NO aplicado:", e)


def aplicar(esc, cam, cam_d, assets, m_blanco, cubierta):
    global CUBIERTA
    CUBIERTA = cubierta
    r = revoque_sin_mosaico(m_blanco, assets)
    if r: losetas_arriba(m_blanco, *r, assets)
    import villa_obra
    pantalla_continua(esc, villa_obra.VENTANA_SOLARIUM, 1.00, 2.03)
    biseles(esc); camara(cam, cam_d, esc); retoque(esc)
    esc.view_settings.exposure = float(os.environ.get("VILLA_EXPO", "0.1"))   # el blanco no se quema
    esc.cycles.use_adaptive_sampling = True
    esc.cycles.sample_clamp_indirect = 8.0
    esc.cycles.max_bounces = 8
    print("[lookdev] rincón listo: rampa → ventana del solárium")
