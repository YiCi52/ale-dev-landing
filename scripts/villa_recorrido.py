"""
El recorrido (fase 6, 1-oct-2026): la promenade architecturale como caminata de cámara por los pasillos reales.

Cada TRAMO es una lista de puntos de paso (coordenadas de OBRA, ojo a ~1,6 m sobre el piso) con la exposición y el
balance de blancos de ese lugar (los de villa_estaciones). La cámara camina a velocidad de paso por una curva suave
que pasa por los puntos, mira ~3 m adelante en el camino, y exposición/balance se interpolan como una cámara que
se adapta al entrar y salir. Los puntos van por pasillos, vanos y la rampa: no se atraviesan muros (las puertas
del recorrido están abiertas o son vanos).

Uso: VILLA_RECORRIDO=<tramo> [VILLA_FPS=12] [VILLA_VEL=1.2] → secuencia PNG en VILLA_OUT (un directorio).
La casa se refleja al final del armado (ESPEJO): cada fotograma de la cámara se refleja igual, sin espejar la imagen.
"""
import math, mathutils

EXT = dict(expo=0.0, k=6200, tinte=28)
INT = dict(expo=3.0, k=5000, tinte=50)
RAMPA = dict(expo=2.4, k=5000, tinte=30)


def _p(x, y, z, **luz):
    return (x, y, z, luz or None)


TRAMOS = {
    # I · el umbral y II · la rampa: del auto a la puerta, el vestíbulo, y la rampa hasta el hall del piso principal
    "llegada_rampa": [
        _p(13.5, 22.0, 1.70, **EXT), _p(7.0, 14.0, 1.66), _p(2.6, 9.2, 1.65), _p(0.0, 7.2, 1.65, expo=0.6, k=6000, tinte=32),
        _p(0.0, 5.6, 1.62, **INT), _p(0.45, 4.2, 1.62), _p(0.66, 2.6, 1.64, **RAMPA),
        _p(0.66, -2.0, 2.53), _p(0.66, -5.6, 3.16), _p(0.40, -6.55, 3.25), _p(-0.40, -6.55, 3.26),
        _p(-0.66, -5.6, 3.35), _p(-0.66, -2.0, 4.04), _p(-0.66, 2.3, 4.87), _p(-0.40, 3.6, 4.93, **INT),
    ],
}


def _catmull(pts, n=24):
    """Curva Catmull-Rom centrípeta que pasa por todos los puntos (sin cortar esquinas como una B-spline)."""
    P = [mathutils.Vector(p[:3]) for p in pts]
    P = [P[0] + (P[0] - P[1])] + P + [P[-1] + (P[-1] - P[-2])]
    out, idx = [], []
    for i in range(1, len(P) - 2):
        p0, p1, p2, p3 = P[i - 1], P[i], P[i + 1], P[i + 2]
        t0 = 0.0; t1 = t0 + (p1 - p0).length ** 0.5 + 1e-6; t2 = t1 + (p2 - p1).length ** 0.5 + 1e-6; t3 = t2 + (p3 - p2).length ** 0.5 + 1e-6
        for k in range(n):
            t = t1 + (t2 - t1) * k / n
            a1 = p0 * ((t1 - t) / (t1 - t0)) + p1 * ((t - t0) / (t1 - t0))
            a2 = p1 * ((t2 - t) / (t2 - t1)) + p2 * ((t - t1) / (t2 - t1))
            a3 = p2 * ((t3 - t) / (t3 - t2)) + p3 * ((t - t2) / (t3 - t2))
            b1 = a1 * ((t2 - t) / (t2 - t0)) + a2 * ((t - t0) / (t2 - t0))
            b2 = a2 * ((t3 - t) / (t3 - t1)) + a3 * ((t - t1) / (t3 - t1))
            out.append(b1 * ((t2 - t) / (t2 - t1)) + b2 * ((t - t1) / (t2 - t1))); idx.append(i - 1 + k / n)
    out.append(P[-2]); idx.append(len(pts) - 1)
    return out, idx


def _luces(pts):
    """Exposición / balance en cada punto: el último declarado se arrastra hasta el siguiente que declare."""
    cur, res = dict(EXT), []
    for p in pts:
        if p[3]: cur = {**cur, **p[3]}
        res.append(dict(cur))
    return res


def _interp(luces, u):
    i = min(int(u), len(luces) - 2); f = u - i; f = f * f * (3 - 2 * f)
    a, b = luces[i], luces[i + 1]
    return {k: a[k] + (b[k] - a[k]) * f for k in a}


def preparar(esc, cam, cam_d, tramo, fps=12, vel=1.2, adelante=3.0, espejo=None):
    pts = TRAMOS[tramo]; curva, idx = _catmull(pts); luces = _luces(pts)
    largo = [0.0]
    for a, b in zip(curva, curva[1:]): largo.append(largo[-1] + (b - a).length)
    total = largo[-1]; n_frames = max(2, int(total / vel * fps))
    esc.render.fps = fps; esc.frame_start, esc.frame_end = 1, n_frames
    cam_d.lens = 22; cam_d.shift_y = 0.0
    vs = esc.view_settings; vs.use_white_balance = True
    D = mathutils.Matrix.Diagonal((-1.0, 1.0, 1.0, 1.0))

    def en(s):                                           # punto e índice de la curva a la distancia s
        s = min(max(s, 0.0), total)
        j = max(k for k in range(len(largo)) if largo[k] <= s) if s < total else len(largo) - 2
        f = (s - largo[j]) / max(largo[j + 1] - largo[j], 1e-9)
        return curva[j].lerp(curva[j + 1], f), idx[j] + (idx[j + 1] - idx[j]) * f

    prev = None
    for fr in range(1, n_frames + 1):
        s = total * (fr - 1) / (n_frames - 1)
        pos, u = en(s); mira, _ = en(s + adelante)
        if s + adelante > total:                         # al final mira en la última dirección del camino
            d = (curva[-1] - curva[-3]).normalized(); mira = pos + d * adelante
        mira.z = pos.z + (mira.z - pos.z) * 0.6 - 0.05   # la cabeza sigue la pendiente a medias
        rot = (mira - pos).to_track_quat("-Z", "Y").to_matrix().to_4x4()
        M = mathutils.Matrix.Translation(pos) @ rot
        if espejo is not None: M = espejo @ M @ D
        loc, q, _ = M.decompose()
        eul = q.to_euler("XYZ", prev) if prev else q.to_euler("XYZ"); prev = eul
        cam.location = loc; cam.rotation_euler = eul
        cam.keyframe_insert("location", frame=fr); cam.keyframe_insert("rotation_euler", frame=fr)
        L = _interp(luces, u)
        vs.exposure = L["expo"]; vs.white_balance_temperature = L["k"]; vs.white_balance_tint = L["tinte"]
        for prop in ("exposure", "white_balance_temperature", "white_balance_tint"):
            vs.keyframe_insert(prop, frame=fr)
    print(f"[villa_recorrido] {tramo}: {total:.1f} m · {n_frames} fotogramas a {fps} fps ({n_frames / fps:.0f} s)")
    return n_frames
