import type { Metadata } from "next";

export const metadata: Metadata = {
  alternates: { canonical: "/privacidad" },
  title: "Política de privacidad — Alejandro Díaz del Castillo",
  description:
    "Cómo trato los datos personales que recibo en el formulario de contacto. Cumplimiento de la Ley 1581 de 2012 (Colombia).",
  robots: { index: true, follow: true },
};

const lastUpdate = "19 de junio de 2026";

export default function PrivacidadPage() {
  return (
    /* 24-oct: con la piel de la v5 (antes usaba los componentes y colores del tema anterior). El texto legal no cambia. */
    <article className="v5-legal v5-gutter">
      <p className="v5-mono">Privacidad</p>
      <h1 className="v5-display mt-6 text-[clamp(34px,4.6vw,64px)]">
        Política de tratamiento de datos personales.
      </h1>
      <p className="v5-texto mt-6">
        Última actualización: {lastUpdate}.
      </p>

      <div>
        <div className="v5-legal-cuerpo mt-16 space-y-12">
          <Block heading="1. Responsable del tratamiento">
            <p>
              Alejandro Díaz del Castillo Vargas, persona natural domiciliada en
              Bogotá, Colombia. Contacto:{" "}
              <a
                href="mailto:addelcv@gmail.com"
                className="v5-enlace"
              >
                addelcv@gmail.com
              </a>
              .
            </p>
            <p>
              Esta política aplica a este sitio y sus dominios asociados, y a
              cualquier interacción comercial derivada.
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
            <p>Como titular de los datos puedes:</p>
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
              Para ejercer cualquiera de estos derechos, escríbeme a{" "}
              <a
                href="mailto:addelcv@gmail.com"
                className="v5-enlace"
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
      </div>
    </article>
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
      <h2 className="v5-legal-titulo mb-4">
        {heading}
      </h2>
      <div className="space-y-3">{children}</div>
    </section>
  );
}
