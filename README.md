# Alejandro Díaz del Castillo — Landing personal

Landing personal de mi negocio freelance dev. Doble propósito: portafolio público + máquina de captura de leads cualificados.

**🌐 Producción:** [ale-dev-landing.vercel.app](https://ale-dev-landing.vercel.app)

---

## Stack

- **Framework:** Next.js 16 (App Router) + React 19 + TypeScript
- **Estilos:** Tailwind v4 (sintaxis `@theme inline`)
- **Tipografía:** Fraunces (display) + Inter (body) vía `next/font`
- **Base de datos:** Supabase (tabla `leads` con RLS insert-only)
- **Automatización:** Make.com webhook → Gmail + Notion + Telegram
- **Testing:** Vitest (unit) + Playwright (E2E)
- **CI/CD:** GitHub Actions + Vercel auto-deploy en cada push a `main`
- **Hosting:** Vercel (Hobby plan)

## Características

- Form de contacto con validación cliente + server (Zod en ambos lados)
- Compliance Ley 1581 Colombia: política de privacidad + checkbox de consentimiento + audit trail
- 5 security headers en producción (X-Content-Type-Options, X-Frame-Options, Referrer-Policy, Permissions-Policy, HSTS)
- Open Graph image dinámica vía edge function
- `robots.txt` + `sitemap.xml` generados automáticamente
- Honeypot anti-spam
- Dark theme editorial (sin pinta de plantilla Tailwind/shadcn por defecto)

## Scripts

```bash
npm run dev          # dev server en http://localhost:3000
npm run build        # build producción
npm run start        # start producción local
npm run lint         # ESLint
npm run test         # Vitest watch mode
npm run test:run     # Vitest single run (CI)
npm run test:e2e     # Playwright E2E
npm run test:e2e:ui  # Playwright UI mode
```

## Estructura

```
src/
├── app/                 # Routes + globals.css con design tokens
│   ├── actions/         # Server Actions
│   ├── opengraph-image.tsx
│   ├── privacidad/
│   ├── robots.ts
│   └── sitemap.ts
├── components/
│   ├── hero/
│   ├── servicios/
│   ├── proceso/
│   ├── sobre-mi/
│   ├── casos/
│   ├── footer/
│   ├── form/
│   └── ui/              # Primitives (Button, Section, Container, etc.)
├── hooks/
└── lib/                 # Supabase client + utilidades + schemas Zod
```

## Variables de entorno

Crear `.env.local` (no commitear, ya está en `.gitignore`):

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxx
MAKE_WEBHOOK_URL=https://hook.us2.make.com/xxx
```

## Privacidad

Esta web cumple la [Ley 1581 de 2012 de Colombia](https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=49981) sobre protección de datos personales. Ver [política completa](https://ale-dev-landing.vercel.app/privacidad).

## Licencia

Código propietario. Todos los derechos reservados © 2026 Alejandro Díaz del Castillo Vargas.
