import { LabGlassMount } from "./LabGlassMount";

const services = [
  { n: "01", label: "AI Automation" },
  { n: "02", label: "AI Integration" },
  { n: "03", label: "AI Agent Development" },
];

export function LabHero() {
  return (
    <section className="relative isolate flex min-h-screen flex-col justify-end overflow-hidden">
      <LabGlassMount />

      {/* Lista mono lateral (tipo Sanjaya) */}
      <ul className="absolute left-6 top-1/2 z-10 hidden -translate-y-1/2 space-y-3 lg:left-10 lg:block">
        {services.map((s) => (
          <li
            key={s.n}
            className="flex items-center gap-3 font-mono text-[0.68rem] uppercase tracking-[0.15em] text-white/45"
          >
            <span className="text-white/30">/{s.n}</span>
            {s.label}
          </li>
        ))}
      </ul>

      {/* Headline abajo-izquierda */}
      <div className="relative z-10 mx-auto w-full max-w-7xl px-6 pb-16 lg:px-10 lg:pb-24">
        <p className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-white/12 bg-white/[0.03] px-3 py-1.5 font-mono text-[0.62rem] uppercase tracking-[0.2em] text-white/50 backdrop-blur">
          <span className="text-[#9fb4ff]">◆</span> Automate · Integrate · Accelerate
        </p>
        <h1 className="font-[family-name:var(--font-grotesk)] text-[clamp(3rem,8vw,6.75rem)] font-semibold leading-[0.9] tracking-[-0.03em] text-white">
          Clear. Precise.
          <br />
          <span className="text-white/40">Automated.</span>
        </h1>
      </div>

      {/* Chat card abajo-derecha */}
      <div className="absolute bottom-16 right-6 z-10 hidden w-72 rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-xl lg:right-10 lg:block">
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-full bg-gradient-to-br from-[#9fb4ff] to-[#5a6a90]" />
          <div>
            <p className="text-sm font-medium text-white">Talk with Denise</p>
            <p className="font-mono text-[0.62rem] uppercase tracking-wide text-white/40">
              AI Consultant · online
            </p>
          </div>
        </div>
        <div className="mt-3 rounded-lg bg-white/[0.06] px-3 py-2 text-xs leading-relaxed text-white/70">
          How can we automate your workflow today?
        </div>
      </div>
    </section>
  );
}
