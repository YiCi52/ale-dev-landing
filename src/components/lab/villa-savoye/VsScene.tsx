"use client";

import { useEffect, useImperativeHandle, useRef } from "react";
import type { Ref } from "react";

import type { DesarmeRig } from "./desarmeRig";

/*
  Escena del DESARME — cáscara React (ronda 2b). No sabe de three: el rig
  (three + postprocessing + modelo) se importa DINÁMICAMENTE cuando la
  sección entra en viewport y se destruye al salir — el chunk inicial del
  route queda sin three, y nunca hay dos contextos WebGL vivos de fondo.
  Expone setProgress(0..1); VsDesarme la alimenta desde ScrollTrigger. El
  progreso se guarda ANTES de que el rig exista: al montar, el primer
  frame ya pinta la posición correcta del scroll.
*/

export type VsSceneHandle = {
  setProgress: (p: number) => void;
};

type Props = {
  ref?: Ref<VsSceneHandle>;
  /** true ⇒ arranca en axonometría explotada estática (reduced motion) */
  isStatic?: boolean;
};

export function VsScene({ ref, isStatic = false }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef(isStatic ? 1 : 0);
  const rigRef = useRef<DesarmeRig | null>(null);

  useImperativeHandle(ref, () => ({
    setProgress: (p: number) => {
      progressRef.current = Math.min(1, Math.max(0, p));
      rigRef.current?.markDirty();
    },
  }));

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let alive = true;
    let visible = false;
    const mount = async () => {
      const { mountDesarme } = await import("./desarmeRig");
      // el import es async: pudo salir del viewport (o desmontarse) mientras cargaba
      if (!alive || !visible || rigRef.current) return;
      rigRef.current = mountDesarme(host, () => progressRef.current);
    };
    const unmount = () => {
      rigRef.current?.dispose();
      rigRef.current = null;
    };
    const io = new IntersectionObserver(
      (entries) => {
        visible = entries[0]?.isIntersecting ?? false;
        if (visible) void mount();
        else unmount();
      },
      { rootMargin: "20% 0px" },
    );
    io.observe(host);

    return () => {
      alive = false;
      io.disconnect();
      unmount();
    };
  }, []);

  return <div ref={hostRef} className="vs-scene" aria-hidden="true" />;
}
