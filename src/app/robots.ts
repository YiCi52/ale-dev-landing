import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/"], // /styleguide sale por noindex, no por Disallow:
        // bloquear el rastreo impide que Google LEA el noindex (se indexa igual
        // si alguien la enlaza, y sin descripcion).
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
