"use client";

import { useCallback, useState } from "react";

import type { Demo } from "@/lib/demos";

/*
  La demostración de ~9 s: una consulta ficticia llega de noche y pasa lo que pasaría con el sistema puesto.
  Solo CSS (animation-delay por elemento): corre fuera del hilo principal. Arranca cuando la escena entra en pantalla
  (si no, quien llega a la demostración después de 9 s ve solo el final). El botón de pausa cumple WCAG 2.2.2 (movimiento
  automático > 5 s) y "Ver de nuevo" vuelve a montar el bloque para que la animación arranque otra vez.
*/
export function Conversacion({ demo }: { demo: Demo }) {
  const [ciclo, setCiclo] = useState(0);
  const [pausa, setPausa] = useState(false);
  // espera a que la escena se vea; sin IntersectionObserver (o sin JS) la animación corre al cargar
  const alMontar = useCallback((el: HTMLDivElement | null) => {
    if (!el || typeof IntersectionObserver === "undefined") return;
    el.dataset.espera = "true";
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        delete el.dataset.espera;
        io.disconnect();
      },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const personas = demo.tipo === "clinica" ? "pacientes" : "clientes";
  const d = (ms: number) => ({ "--d": `${ms}ms` }) as React.CSSProperties;

  return (
    <div className="dm-demo">
      <div className="dm-controles">
        <button type="button" className="dm-ctl" onClick={() => setPausa((p) => !p)} aria-pressed={pausa}>
          {pausa ? "Reanudar" : "Pausar"}
        </button>
        <button type="button" className="dm-ctl" onClick={() => { setPausa(false); setCiclo((c) => c + 1); }}>
          Ver de nuevo
        </button>
      </div>

      <div key={ciclo} ref={alMontar} className="dm-escena" data-pausa={pausa}>
        <section className="dm-tel" aria-label="La conversación de la persona que escribe">
          <header className="dm-tel-cab">
            <span className="dm-tel-punto" aria-hidden="true" />
            <span>
              <strong>{demo.nombre}</strong>
              <span className="dm-tel-sub">Persona ficticia · 10:12 p. m.</span>
            </span>
          </header>
          <div className="dm-tel-cuerpo">
            <p className="dm-burbuja dm-burbuja--ella dm-aparece" style={d(300)}>
              {demo.consulta.mensaje}
              <span className="dm-hora">10:12 p. m.</span>
            </p>
            <p className="dm-burbuja dm-burbuja--sistema dm-aparece" style={d(1500)}>
              Hola, gracias por escribirnos. Recibimos tu mensaje y el equipo te responde en cuanto lo revise.
              <span className="dm-hora">10:12 p. m. · respuesta automática, al instante</span>
            </p>
            <p className="dm-burbuja dm-burbuja--sistema dm-aparece" style={d(6800)}>
              {demo.consulta.respuestaSugerida}
              <span className="dm-hora">8:05 a. m. · aprobada por el equipo</span>
            </p>
          </div>
        </section>

        <section className="dm-panel" aria-label="Lo que ve el equipo">
          <p className="v5-mono dm-panel-rotulo">Lo que ve el equipo</p>

          <article className="dm-tarjeta dm-aparece" style={d(2600)}>
            <p className="dm-tarjeta-t">
              <span className="dm-chip">10:12 p. m.</span> Aviso al WhatsApp del equipo
            </p>
            <p className="dm-tarjeta-c">
              Consulta nueva · <strong>{demo.consulta.asunto}</strong> · urgencia media
            </p>
          </article>

          <article className="dm-tarjeta dm-aparece" style={d(4200)}>
            <p className="dm-tarjeta-t">
              <span className="dm-chip">8:00 a. m.</span> Respuesta sugerida, lista para aprobar
            </p>
            <p className="dm-tarjeta-c dm-cita">{demo.consulta.respuestaSugerida}</p>
            <span className="dm-falso-boton" aria-hidden="true">Aprobar y enviar</span>
          </article>

          <article className="dm-tarjeta dm-aparece" style={d(7600)}>
            <p className="dm-tarjeta-t">
              <span className="dm-chip">Registro</span> Queda guardada, con su origen
            </p>
            <p className="dm-tarjeta-c dm-fila-registro">
              <span>WhatsApp</span>
              <span>{demo.consulta.asunto}</span>
              <span>Acuse al instante</span>
            </p>
          </article>
        </section>
      </div>

      <p className="dm-nota">
        Demostración con una persona ficticia, preparada para {demo.nombre}. No usa datos de sus {personas} ni de sus cuentas.
      </p>
    </div>
  );
}
