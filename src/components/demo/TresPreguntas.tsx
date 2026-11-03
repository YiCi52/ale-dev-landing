"use client";

import { useState } from "react";

import { enlaceWhatsApp, preguntasDe, type Demo } from "@/lib/demos";

/*
  Tres preguntas antes de agendar. No se guarda nada en el servidor: las respuestas arman el mensaje de WhatsApp y la
  persona decide si lo envía. El botón queda apagado hasta que estén las tres (así llega el dato que hace útil la llamada).
*/
export function TresPreguntas({ demo }: { demo: Demo }) {
  const preguntas = preguntasDe(demo.tipo);
  const [respuestas, setRespuestas] = useState<string[]>(() => preguntas.map(() => ""));
  const enlace = enlaceWhatsApp(demo, respuestas);

  return (
    <form className="dm-form" onSubmit={(e) => e.preventDefault()}>
      {preguntas.map((p, i) => (
        <fieldset key={p.id} className="dm-pregunta">
          <legend className="dm-pregunta-t">
            <span className="v5-mono">{String(i + 1).padStart(2, "0")}</span> {p.texto}
          </legend>
          <div className="dm-opciones">
            {p.opciones.map((o) => (
              <label key={o} className="dm-opcion">
                <input
                  type="radio"
                  name={p.id}
                  value={o}
                  checked={respuestas[i] === o}
                  onChange={() => setRespuestas((r) => r.map((x, j) => (j === i ? o : x)))}
                />
                <span>{o}</span>
              </label>
            ))}
          </div>
        </fieldset>
      ))}

      <div className="dm-cierre">
        {enlace ? (
          <a className="v5-boton v5-boton-luz" href={enlace} target="_blank" rel="noopener noreferrer">
            Agendar 15 minutos por WhatsApp
            <span className="sr-only"> (se abre en una pestaña nueva)</span>
          </a>
        ) : (
          <span className="v5-boton v5-boton-luz dm-apagado" aria-disabled="true">Agendar 15 minutos por WhatsApp</span>
        )}
        <p className="dm-ayuda" role="status">
          {enlace
            ? "Se abre WhatsApp con tus respuestas ya escritas. Tú decides si lo envías."
            : "Responde las tres para armar el mensaje. No guardamos nada en esta página."}
        </p>
      </div>
    </form>
  );
}
