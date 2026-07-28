"use client";

import { useReveal } from "@/hooks/use-reveal";

const STEPS = [
  {
    n: "01",
    title: "Choose Your Program",
    body: "Choose between PRIME and Direct Sim Funded. Add the EOD Drawdown and earn Taurus Coins with every order.",
  },
  {
    n: "02",
    title: "Pass Your Evaluation",
    body: "Reach your profit target while respecting the account rules. No minimum trading days, no unnecessary delays.",
  },
  {
    n: "03",
    title: "Build Your Track Record",
    body: "Grow your Sim Profit Account and generate payouts. Consistent traders unlock long-term opportunities.",
  },
] as const;

export function TaurusSteps() {
  const { ref, visible } = useReveal<HTMLDivElement>({ threshold: 0.25 });

  return (
    <section className="taurus-steps" aria-labelledby="taurus-steps-title">
      <header className="taurus-section-head">
        <p className="taurus-eyebrow">
          How It Works
          <span className="taurus-scroll-badge" aria-hidden>
            <svg viewBox="0 0 100 100">
              <defs>
                <path
                  id="taurus-scroll-path"
                  d="M50,50 m-34,0 a34,34 0 1,1 68,0 a34,34 0 1,1 -68,0"
                  fill="none"
                />
              </defs>
              <text>
                <textPath href="#taurus-scroll-path">
                  SCROLL · SCROLL · SCROLL ·
                </textPath>
              </text>
            </svg>
            <span className="taurus-scroll-badge__dot" />
          </span>
        </p>
        <h2 id="taurus-steps-title">Three steps to the arena.</h2>
      </header>

      <div ref={ref} className={`taurus-track${visible ? " is-drawn" : ""}`}>
        {/* Línea SVG que conecta los pasos, dibujada al entrar en viewport. */}
        <svg className="taurus-track__line" viewBox="0 0 1000 20" preserveAspectRatio="none" aria-hidden>
          <path d="M10,10 H990" className="taurus-track__path" />
        </svg>

        <ol className="taurus-track__cards">
          {STEPS.map((step, index) => (
            <li
              key={step.n}
              className="taurus-step-card"
              style={{ transitionDelay: `${index * 130}ms` }}
            >
              <span className="taurus-step-card__n">{step.n}</span>
              <h3>{step.title}</h3>
              <p>{step.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
