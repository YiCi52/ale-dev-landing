"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

// Lazy: three.js NO se descarga en SSR ni en mobile (gate por JS antes de montar).
const LabGlass = dynamic(() => import("./LabGlass").then((m) => m.LabGlass), {
  ssr: false,
});

export function LabGlassMount() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(min-width: 768px) and (pointer: fine)").matches) {
      setEnabled(true);
    }
  }, []);

  return enabled ? <LabGlass /> : null;
}
