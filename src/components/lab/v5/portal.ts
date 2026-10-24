/*
  El portal (21-oct, Alejo: "el efecto de portal al darle click a un proyecto"). La foto se abre desde su marco hasta
  llenar la pantalla y a mitad de camino se atraviesa su calco en tinta (se entra a la obra por el plano); al llenar,
  se navega y el velo se va cuando la página nueva ya está pintada. Vive fuera de React (en <body>) para sobrevivir al
  cambio de ruta. Con movimiento reducido se navega directo.
*/
const DURA = 820;
const EASE = "cubic-bezier(0.77, 0, 0.175, 1)";

let enCurso = false;

export function abrirPortal(foto: HTMLImageElement, rutaCalco: string, ir: () => void): void {
  if (enCurso) return;   // un doble clic no dispara dos animaciones ni dos navegaciones
  enCurso = true;
  const r = foto.getBoundingClientRect();
  const vw = window.innerWidth, vh = window.innerHeight;
  const capa = document.createElement("div");
  capa.className = "v5-portal";
  capa.setAttribute("aria-hidden", "true");
  const img = new Image();
  img.src = foto.currentSrc || foto.src;
  img.alt = "";
  const calco = new Image();
  calco.src = rutaCalco;
  calco.alt = "";
  calco.className = "v5-portal-calco";
  capa.append(img, calco);
  document.body.append(capa);

  // el recorte arranca exactamente sobre la foto del marco
  const desde = `inset(${r.top}px ${vw - r.right}px ${vh - r.bottom}px ${r.left}px round 6px)`;
  capa.animate([{ clipPath: desde }, { clipPath: "inset(0px 0px 0px 0px round 0px)" }], { duration: DURA, easing: EASE, fill: "forwards" });
  img.animate([{ transform: "scale(1.12)", filter: "brightness(0.9)" }, { transform: "scale(1)", filter: "brightness(1)" }], { duration: DURA, easing: EASE, fill: "forwards" });
  calco.animate([{ opacity: 0 }, { opacity: 0.9, offset: 0.45 }, { opacity: 0 }], { duration: DURA, easing: "ease-in-out", fill: "forwards" });

  window.setTimeout(() => {
    ir();
    // la página nueva entra con su fundido; el velo se retira encima de ella
    window.setTimeout(() => {
      const salida = capa.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 520, easing: "ease-out", fill: "forwards" });
      salida.onfinish = () => { capa.remove(); enCurso = false; };
    }, 380);
  }, DURA - 60);
}
