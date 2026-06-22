import type { NextConfig } from "next";

/*
  Content-Security-Policy — defensa-en-profundidad contra XSS y data exfiltration.

  - script-src 'unsafe-inline' por inline scripts de Next (hydration data, theme init
    en layout). Migración a nonces requiere refactor mayor — postpuesto.
  - 'unsafe-eval' SOLO en dev: React lo usa para reconstruir callstacks (DEV-only).
    En prod NUNCA lo necesita, así que el CSP se endurece.
  - style-src 'unsafe-inline' por CSS-in-JS de Tailwind v4 runtime.
  - connect-src incluye Supabase para inserts del form de contacto.
  - frame-ancestors 'none' bloquea clickjacking (más estricto que X-Frame-Options).
  - form-action 'self' bloquea submits a dominios externos (defense vs. form hijack).
*/
const isDev = process.env.NODE_ENV !== "production";

const scriptSrc = isDev
  ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'"
  : "script-src 'self' 'unsafe-inline'";

const csp = [
  "default-src 'self'",
  scriptSrc,
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "img-src 'self' data: https:",
  "font-src 'self' https://fonts.gstatic.com",
  "connect-src 'self' https://*.supabase.co https://*.supabase.in",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  { key: "Content-Security-Policy", value: csp },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
