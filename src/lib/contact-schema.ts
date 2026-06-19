import { z } from "zod";

export const tiposProyecto = [
  { value: "landing", label: "Landing o sitio informativo" },
  { value: "webapp", label: "Web app con auth y base de datos" },
  { value: "migration", label: "Migración desde Wix o WordPress" },
  { value: "other", label: "Otro / aún no lo tengo claro" },
] as const;

export const tipoProyectoValues = tiposProyecto.map((t) => t.value) as [
  "landing",
  "webapp",
  "migration",
  "other",
];

export const contactSchema = z.object({
  nombre: z
    .string()
    .trim()
    .min(2, "Tu nombre, aunque sea solo el primero."),
  email: z.string().trim().email("Email inválido."),
  whatsapp: z
    .string()
    .trim()
    .optional()
    .refine(
      (v) => !v || /^[+]?[\d\s()-]{7,}$/.test(v),
      "Solo números, espacios, paréntesis y +.",
    ),
  tipoProyecto: z.enum(tipoProyectoValues, {
    message: "Elegí una opción.",
  }),
  mensaje: z
    .string()
    .trim()
    .min(20, "Contame al menos 20 caracteres para no improvisar.")
    .max(2000, "Demasiado largo. Resumí en lo esencial."),
  consentimiento: z.literal(true, {
    message: "Necesitamos tu consentimiento para procesar tu consulta.",
  }),
  honeypot: z.string().max(0).optional(),
});

export type ContactInput = z.infer<typeof contactSchema>;
