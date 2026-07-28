"use client";

import { useRef, useState } from "react";

type Project = {
  id: string;
  client: string;
  title: string;
  year: string;
  /** Gradiente del preview — sustituye al video del sitio original. */
  tint: string;
};

const PROJECTS: readonly Project[] = [
  {
    id: "kizuna",
    client: "KizunaAI",
    title: "Hello, Fortnite",
    year: "2024",
    tint: "linear-gradient(135deg, #ff5fa2 0%, #7c6cff 55%, #21123f 100%)",
  },
  {
    id: "weargo",
    client: "WEAR GO LAND",
    title: "Retail Playground",
    year: "2024",
    tint: "linear-gradient(135deg, #ffd166 0%, #ff7d3b 50%, #3d1a08 100%)",
  },
  {
    id: "radwimps",
    client: "RADWIMPS",
    title: "Role Playing Music",
    year: "2023",
    tint: "linear-gradient(135deg, #4fd8ff 0%, #2b5cff 55%, #061029 100%)",
  },
  {
    id: "runformoney",
    client: "run for money",
    title: "Created in Fortnite",
    year: "2023",
    tint: "linear-gradient(135deg, #9dffb0 0%, #1fa97a 50%, #05261c 100%)",
  },
];

const PREVIEW_OFFSET_X = 28;
const PREVIEW_OFFSET_Y = -140;

export function AlcheWorks() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  const active = PROJECTS.find((project) => project.id === activeId) ?? null;

  const handlePointerMove = (event: React.PointerEvent<HTMLElement>) => {
    const preview = previewRef.current;
    if (!preview) return;

    const bounds = event.currentTarget.getBoundingClientRect();
    preview.style.transform = `translate3d(${
      event.clientX - bounds.left + PREVIEW_OFFSET_X
    }px, ${event.clientY - bounds.top + PREVIEW_OFFSET_Y}px, 0)`;
  };

  return (
    <section
      className="alche-works"
      aria-labelledby="alche-works-title"
      onPointerMove={handlePointerMove}
      onPointerLeave={() => setActiveId(null)}
    >
      <h2 id="alche-works-title" className="alche-section-title">
        WORKS
      </h2>

      <ul className="alche-works__list">
        {PROJECTS.map((project) => (
          <li key={project.id}>
            <a
              className={`alche-work${activeId === project.id ? " is-active" : ""}`}
              href="#alche-works-title"
              onPointerEnter={() => setActiveId(project.id)}
              onFocus={() => setActiveId(project.id)}
              onBlur={() => setActiveId(null)}
            >
              <span className="alche-work__client">{project.client}</span>
              <span className="alche-work__title">{project.title}</span>
              <span className="alche-work__year">{project.year}</span>
            </a>
          </li>
        ))}
      </ul>

      <div
        ref={previewRef}
        className={`alche-preview${active ? " is-visible" : ""}`}
        aria-hidden
      >
        <div
          className="alche-preview__media"
          style={{ backgroundImage: active?.tint }}
        />
        <p className="alche-preview__label">{active?.client}</p>
      </div>
    </section>
  );
}
