const links = ["Projects", "About Us", "Blog", "Contact"];

export function LabNav() {
  return (
    <header className="absolute inset-x-0 top-0 z-20">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-10">
        <span className="font-mono text-sm font-medium tracking-tight text-white">
          sanjaya<span className="text-[#9fb4ff]">°</span>
        </span>
        <ul className="hidden gap-8 md:flex">
          {links.map((l) => (
            <li key={l}>
              <a
                href="#"
                className="font-mono text-[0.7rem] uppercase tracking-[0.15em] text-white/55 transition-colors hover:text-white"
              >
                {l}
              </a>
            </li>
          ))}
        </ul>
        <a
          href="#"
          className="rounded-full border border-white/15 bg-white/[0.04] px-4 py-2 font-mono text-[0.7rem] uppercase tracking-[0.12em] text-white/85 backdrop-blur transition-colors hover:bg-white/10"
        >
          Get Free Consultation
        </a>
      </nav>
    </header>
  );
}
