import {
  SITE_URL,
  SITE_NAME,
  FOUNDER_NAME,
  SOCIAL_PROFILES,
  CASE_MH_INTERIOR,
} from "@/lib/site";

/*
  JSON-LD del estudio (capa 14 — descubribilidad).

  Sin esto, Google y los motores de IA leen el sitio como texto suelto: no
  saben que "Castillo Studio" es una organización, que Alejandro es su
  fundador, ni que mhinterior.net es trabajo suyo. Con esto lo saben, y es
  la diferencia entre poder citarlo y no poder.

  Tres declaraciones encadenadas por @id:
  - Organization: quién es el estudio, qué hace, para quién.
  - Person:       Alejandro, ligado a la organización y a sus perfiles reales.
  - WebSite:      el sitio, ligado a su dueño.

  TODO el contenido es constante del código (lib/site.ts) — cero entrada de
  usuario. El JSON.stringify va en dangerouslySetInnerHTML porque es la única
  forma de emitir JSON-LD; DEBE PERMANECER ESTÁTICO (G-09).

  Regla honesta: acá NO van métricas ("40+ marcas", "$X generados"). El JSON-LD
  es una declaración a máquinas y una cifra inflada es una mentira estructurada.
  Solo entran hechos verificables.
*/

const organization = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${SITE_URL}/#organization`,
  name: SITE_NAME,
  url: SITE_URL,
  description:
    "Estudio de desarrollo web para arquitectos, diseñadores de interior y estudios con criterio visual. Sitios con diseño editorial y captura de clientes integrada.",
  founder: { "@id": `${SITE_URL}/#founder` },
  knowsAbout: [
    "Desarrollo web para arquitectos",
    "Sitios para diseñadores de interior",
    "Portafolios editoriales",
    "Captura de clientes en web",
    "Next.js",
  ],
  areaServed: [
    { "@type": "Country", name: "Colombia" },
    { "@type": "Country", name: "Estados Unidos" },
  ],
};

const founder = {
  "@context": "https://schema.org",
  "@type": "Person",
  "@id": `${SITE_URL}/#founder`,
  name: FOUNDER_NAME,
  jobTitle: "Desarrollador web",
  url: `${SITE_URL}/sobre-mi`,
  worksFor: { "@id": `${SITE_URL}/#organization` },
  // `sameAs` le dice a los motores que estas identidades son la misma persona.
  sameAs: [...SOCIAL_PROFILES],
};

const website = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${SITE_URL}/#website`,
  url: SITE_URL,
  name: SITE_NAME,
  inLanguage: "es-CO",
  publisher: { "@id": `${SITE_URL}/#organization` },
  // Caso publicado y navegable — verificable por cualquiera.
  about: {
    "@type": "CreativeWork",
    name: "MH Interior Design",
    url: CASE_MH_INTERIOR,
  },
};

export function StructuredData() {
  return (
    <>
      {[organization, founder, website].map((schema) => (
        <script
          key={schema["@id"]}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
    </>
  );
}
