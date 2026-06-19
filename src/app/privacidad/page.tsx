import type { Metadata } from "next";
import {
  Container,
  Eyebrow,
  Heading,
  Section,
  Text,
} from "@/components/ui";

export const metadata: Metadata = {
  title: "Política de privacidad — Alejandro Díaz del Castillo",
  description:
    "Cómo trato los datos personales que recibo en el formulario de contacto. Cumplimiento de la Ley 1581 de 2012 (Colombia).",
  robots: { index: true, follow: true },
};

const lastUpdate = "19 de junio de 2026";

export default function PrivacidadPage() {
  return (
    <Section containerSize="narrow" spacing="default">
      <Eyebrow>Privacidad</Eyebrow>
      <Heading level="h1" className="mt-6">
        Política de tratamiento de datos personales.
      </Heading>
      <Text size="lg" tone="muted" className="mt-6">
        Última actualización: {lastUpdate}.
      </Text>

      <Container size="narrow">
        <div className="mt-16 space-y-12 text-foreground/90 text-base leading-relaxed">
          <Block heading="1. Responsable del tratamiento">
            <p>
              Alejandro Díaz del Castillo Vargas, persona natural domiciliada en
              Bogotá, Colombia. Contacto:{" "}
              <a
                href="mailto:addelcv@gmail.com"
                className="underline underline-offset-4 hover:text-muted"
              >
                addelcv@gmail.com
              </a>
              .
            </p>
            <p>
              Esta política aplica a esta web (ale-dev-landing.vercel.app y
              dominios asociados) y a cualquier interacción comercial derivada.
            </p>
          </Block>

          <Block heading="2. Datos que recolecto">
            <p>Cuando completás el formulario de contacto, recibo:</p>
            <ul className="list-disc list-outside pl-6 space-y-2 mt-3">
              <li>
                <b>Nombre</b> (obligatorio)
              </li>
              <li>
                <b>Correo electrónico</b> (obligatorio)
              </li>
              <li>
                <b>WhatsApp</b> (opcional)
              </li>
              <li>
                <b>Tipo de proyecto</b> (obligatorio, selección de lista)
              </li>
              <li>
                <b>Mensaje libre</b> (obligatorio)
              </li>
              <li>
                <b>User-agent del navegador</b> y{" "}
                <b>timestamp del consentimiento</b> (automático, para auditoría)
              </li>
            </ul>
          </Block>

          <Block heading="3. Finalidad del tratamiento">
            <p>Los datos se usan únicamente para:</p>
            <ul className="list-disc list-outside pl-6 space-y-2 mt-3">
              <li>Responder tu consulta inicial</li>
              <li>Coordinar reuniones de discovery si hay interés mutuo</li>
              <li>Enviar propuestas y contratos relacionados</li>
            </ul>
            <p className="mt-3">
              <b>No</b> uso tus datos para marketing masivo, newsletter,
              perfilamiento ni los comparto con terceros distintos de los
              proveedores técnicos mencionados abajo.
            </p>
          </Block>

          <Block heading="4. Proveedores técnicos (encargados)">
            <p>
              Para operar la web y procesar consultas, los datos pasan por:
            </p>
            <ul className="list-disc list-outside pl-6 space-y-2 mt-3">
              <li>
                <b>Vercel</b> (Estados Unidos) — hosting de la aplicación.
              </li>
              <li>
                <b>Supabase</b> (Estados Unidos) — base de datos donde se
                almacenan los leads.
              </li>
              <li>
                <b>Make.com</b> (Unión Europea) — automatización para
                notificarme por correo, Notion y Telegram cuando llega una
                consulta nueva.
              </li>
              <li>
                <b>Google</b> — el correo de contacto vive en Gmail.
              </li>
              <li>
                <b>Notion</b> y <b>Telegram</b> — destino de las notificaciones
                internas.
              </li>
            </ul>
            <p className="mt-3">
              Todos los proveedores cumplen estándares internacionales de
              seguridad y son seleccionados por mí bajo el principio de
              minimización de datos.
            </p>
          </Block>

          <Block heading="5. Tiempo de conservación">
            <p>
              Tus datos se conservan mientras exista una relación activa o
              potencial conmigo, con un máximo de <b>24 meses</b> después del
              último contacto. Cumplido ese plazo se eliminan salvo obligación
              legal de retenerlos por más tiempo.
            </p>
          </Block>

          <Block heading="6. Tus derechos (Ley 1581 de 2012)">
            <p>Como titular de los datos podés:</p>
            <ul className="list-disc list-outside pl-6 space-y-2 mt-3">
              <li>
                <b>Conocer</b> qué datos tuyos tengo y para qué los uso.
              </li>
              <li>
                <b>Actualizar</b> o <b>corregir</b> datos inexactos o
                incompletos.
              </li>
              <li>
                <b>Solicitar prueba</b> del consentimiento que diste.
              </li>
              <li>
                <b>Revocar</b> tu consentimiento o <b>solicitar la eliminación</b>{" "}
                de tus datos en cualquier momento.
              </li>
              <li>
                <b>Presentar quejas</b> ante la Superintendencia de Industria y
                Comercio (SIC).
              </li>
            </ul>
            <p className="mt-3">
              Para ejercer cualquiera de estos derechos, escribime a{" "}
              <a
                href="mailto:addelcv@gmail.com"
                className="underline underline-offset-4 hover:text-muted"
              >
                addelcv@gmail.com
              </a>{" "}
              indicando tu nombre, correo registrado y la solicitud específica.
              Te respondo en máximo 15 días hábiles.
            </p>
          </Block>

          <Block heading="7. Seguridad">
            <p>
              Los datos viajan por HTTPS, se almacenan en bases de datos con
              control de acceso por filas (Row Level Security), y solo yo —
              como responsable — puedo leer los registros completos.
            </p>
          </Block>

          <Block heading="8. Cookies">
            <p>
              Esta web no usa cookies de seguimiento de terceros, ni Google
              Analytics, ni píxeles publicitarios. Solo se usan las cookies
              técnicas mínimas que el framework necesita para funcionar
              (ninguna identifica al usuario).
            </p>
          </Block>

          <Block heading="9. Cambios en esta política">
            <p>
              Si cambia algo material, actualizo la fecha al inicio y, si vos
              ya me habías contactado, te aviso por correo antes de aplicar el
              cambio.
            </p>
          </Block>
        </div>
      </Container>
    </Section>
  );
}

function Block({
  heading,
  children,
}: {
  heading: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <Heading level="h3" as="h2" className="mb-4">
        {heading}
      </Heading>
      <div className="space-y-3">{children}</div>
    </section>
  );
}
