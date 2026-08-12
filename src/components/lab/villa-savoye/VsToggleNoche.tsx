"use client";

import { useEffect, useState } from "react";

import { isNightMode, onNightMode, setNightMode } from "./nightMode";

/* Toggle día/noche (ref. Pocito/v30): un botón, ambas escenas escuchan. */

export function VsToggleNoche() {
  const [night, setNight] = useState(false);

  useEffect(() => {
    setNight(isNightMode());
    return onNightMode(setNight);
  }, []);

  return (
    <button
      type="button"
      className="vs-toggle-noche"
      aria-pressed={night}
      onClick={() => setNightMode(!night)}
    >
      <span aria-hidden="true">{night ? "☾" : "☀"}</span>
      {night ? "Noche" : "Día"}
    </button>
  );
}
