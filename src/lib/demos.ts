import { WHATSAPP_NUMBER } from "./site";

/*
  Páginas de demostración por prospecto (/demo/<slug>), 31-oct-2026.
  Una página = un problema (el hecho público y verificado de ESA empresa) + una demostración con una persona ficticia +
  tres preguntas + agendar 15 minutos. Se manda como toque 2 del outreach; no se indexa.
  Reglas del contenido:
  - `hecho` es solo lo que se puede ver desde afuera (anuncios, web, horario de Maps) y lleva la fecha cuando cambia.
    Nunca se cita el comentario de un paciente ni de un cliente.
  - La respuesta sugerida NUNCA inventa horarios, disponibilidad ni precios: promete confirmar (regla del marco).
*/

export type TipoDemo = "clinica" | "estudio";

export type Demo = {
  slug: string;
  nombre: string;
  tipo: TipoDemo;
  /** titular: lo que se lee en gris + lo que se lee en luz (cursiva) */
  titulo: { antes: string; luz: string };
  /** el hecho público y verificado, en una o dos frases */
  hecho: string;
  /** la consulta ficticia que dispara la demostración */
  consulta: { mensaje: string; asunto: string; respuestaSugerida: string };
};

export const DEMOS: Demo[] = [
  {
    slug: "clinica-fiore",
    nombre: "Clínica Fiore",
    tipo: "clinica",
    titulo: { antes: "Una pregunta de precio sin respuesta es ", luz: "una valoración que se va." },
    hecho:
      "Sus anuncios llevan a Instagram, y en sus publicaciones hay preguntas de precio y de ubicación que siguen esperando respuesta.",
    consulta: {
      mensaje: "Hola, ¿cuánto cuesta un lifting facial y dónde están ubicados?",
      asunto: "Lifting facial",
      respuestaSugerida:
        "Hola, gracias por tu interés. El valor depende de una valoración con el doctor; te confirmamos la dirección y los pasos para agendarla en cuanto el equipo revise tu mensaje.",
    },
  },
  {
    slug: "prana-clinic",
    nombre: "Prana Clinic",
    tipo: "clinica",
    titulo: { antes: "Los anuncios corren todos los días. ", luz: "La atención, no." },
    hecho:
      "Tiene 16 anuncios activos hacia WhatsApp e Instagram, y según su ficha de Google Maps atiende de lunes a viernes de 10 a 6 y los sábados hasta la 1.",
    consulta: {
      mensaje: "Buenas noches, quiero una cita con la dermatóloga para tratar unas manchas. ¿Qué disponibilidad tienen?",
      asunto: "Cita con dermatología",
      respuestaSugerida:
        "Hola, gracias por escribir a Prana Clinic. Recibimos tu solicitud y te confirmamos la disponibilidad de la dermatóloga en cuanto el equipo la revise.",
    },
  },
  {
    slug: "lirio-spa",
    nombre: "Lirio Spa",
    tipo: "clinica",
    titulo: { antes: "Tres números de WhatsApp ", luz: "para las mismas consultas." },
    hecho:
      "En sus anuncios aparecen tres números distintos (322 839 0963, 312 546 2489 y el 312 564 2489 al que llevan los botones de su web). Las consultas quedan repartidas y sin un registro único.",
    consulta: {
      mensaje: "Hola, vi el anuncio de la limpieza facial. ¿Tienen cupo esta semana?",
      asunto: "Limpieza facial",
      respuestaSugerida:
        "Hola, gracias por escribirnos. Recibimos tu mensaje y te confirmamos el cupo de la semana en cuanto el equipo lo revise.",
    },
  },
  {
    slug: "clinica-paramo",
    nombre: "Clínica Páramo",
    tipo: "clinica",
    titulo: { antes: "Cuando la web no carga, ", luz: "el anuncio sigue pagando." },
    hecho:
      "El 26 de octubre clinicaparamo.com respondió con error 503 mientras 15 anuncios mandaban personas a WhatsApp. Su ficha de Maps indica atención hasta las 4 los sábados y cerrado el domingo.",
    consulta: {
      mensaje: "Hola, me interesa el diseño de sonrisa. ¿Pueden darme información y precios?",
      asunto: "Diseño de sonrisa",
      respuestaSugerida:
        "Hola, gracias por tu interés en el diseño de sonrisa. Recibimos tu mensaje y te confirmamos la información y los pasos para la valoración en cuanto el equipo lo revise.",
    },
  },
  {
    slug: "marco-martinez-estetica",
    nombre: "Marco Martínez Estética",
    tipo: "clinica",
    titulo: { antes: "Lo que llega el sábado en la tarde ", luz: "espera hasta el lunes." },
    hecho:
      "Tiene anuncios activos hacia WhatsApp desde el 3 de octubre. Su web no tiene formulario, solo el botón de WhatsApp, y la atención es de lunes a viernes hasta las 5 y los sábados hasta el mediodía.",
    consulta: {
      mensaje: "Hola, quiero información de la rinomodelación. ¿Cuánto vale y cómo se agenda?",
      asunto: "Rinomodelación",
      respuestaSugerida:
        "Hola, gracias por escribirnos. Recibimos tu consulta y te confirmamos el valor y cómo agendar la valoración en cuanto el equipo la revise.",
    },
  },
  {
    slug: "dermilab-cali",
    nombre: "Dermilab",
    tipo: "clinica",
    titulo: { antes: "Todo entra por un botón de WhatsApp. ", luz: "Nada queda registrado." },
    hecho:
      "Su web no tiene formulario: toda consulta entra por el botón de WhatsApp. Tiene anuncios activos desde septiembre de 2025 y, según Maps, los domingos no hay atención.",
    consulta: {
      mensaje: "Hola, ¿cuánto cuestan las sesiones de depilación láser de piernas completas?",
      asunto: "Depilación láser",
      respuestaSugerida:
        "Hola, gracias por escribir a Dermilab. Recibimos tu consulta y te confirmamos el valor de las sesiones en cuanto el equipo la revise.",
    },
  },
  {
    slug: "euroestetica-cali",
    nombre: "Euroestética",
    tipo: "clinica",
    titulo: { antes: "El formulario no pregunta ", luz: "qué procedimiento ni para cuándo." },
    hecho:
      "Su formulario pide nombre, correo, teléfono y mensaje, pero no el procedimiento ni la fecha. Con 22 anuncios hacia WhatsApp, cada consulta empieza con preguntas de ida y vuelta.",
    consulta: {
      mensaje: "Hola, estoy interesada en tratamientos antiedad para el rostro. ¿Qué opciones tienen?",
      asunto: "Tratamiento antiedad",
      respuestaSugerida:
        "Hola, gracias por escribirnos. Recibimos tu consulta y te confirmamos las opciones y cómo agendar la valoración en cuanto el equipo la revise.",
    },
  },
  {
    slug: "newlife-medicina-estetica",
    nombre: "Newlife",
    tipo: "clinica",
    titulo: { antes: "Les llega un número, ", luz: "sin saber qué quiere esa persona." },
    hecho:
      "El formulario de su web solo pide el celular. Para las citas ya usan AgendaPro; este sistema no la reemplaza, atiende lo que llega antes de que alguien agende.",
    consulta: {
      mensaje: "Buenas, quisiera saber cuánto cuesta el botox y si necesito una valoración antes.",
      asunto: "Botox",
      respuestaSugerida:
        "Hola, gracias por escribirnos. Recibimos tu consulta y te confirmamos el valor y los pasos previos en cuanto el equipo la revise.",
    },
  },
  {
    slug: "sabanaderma",
    nombre: "SabanaDerma",
    tipo: "clinica",
    titulo: { antes: "El anuncio corre todos los días. ", luz: "La atención, de lunes a sábado." },
    hecho:
      "Tiene 19 anuncios activos hacia WhatsApp. Según Maps, la atención es de lunes a viernes de 8 a 5 y los sábados hasta el mediodía; lo que llega el sábado en la tarde o el domingo espera al lunes.",
    consulta: {
      mensaje: "Hola, me gustaría información sobre depilación láser diodo. ¿Pueden ayudarme?",
      asunto: "Depilación láser",
      respuestaSugerida:
        "Hola, gracias por escribir a SabanaDerma. Recibimos tu consulta y te confirmamos la información y los pasos para agendar en cuanto el equipo la revise.",
    },
  },
  {
    slug: "innova-laser-center",
    nombre: "Innova Laser Center",
    tipo: "clinica",
    titulo: { antes: "Quien llega por el anuncio ", luz: "escribe a cualquier hora." },
    hecho:
      "Tiene anuncios activos en Instagram desde el 20 de octubre, y la atención es de lunes a viernes de 9 a 6 y los sábados hasta el mediodía. Su formulario no pregunta qué procedimiento le interesa a la persona.",
    consulta: {
      mensaje: "Hola, vi el video del botox. ¿Cuánto cuesta y cómo agendo una valoración?",
      asunto: "Botox",
      respuestaSugerida:
        "Hola, gracias por escribirnos. Recibimos tu mensaje y te confirmamos el valor y cómo agendar la valoración en cuanto el equipo lo revise.",
    },
  },
  {
    slug: "dermanova",
    nombre: "Dermanova",
    tipo: "clinica",
    titulo: { antes: "Cada consulta del anuncio ", luz: "queda registrada." },
    hecho:
      "Tiene un anuncio de depilación láser diodo activo desde el 9 de diciembre que lleva a WhatsApp, con la invitación a agendar la valoración. No encontré una web propia: su Facebook solo muestra el teléfono, el correo y el Instagram.",
    consulta: {
      mensaje: "Hola, quiero información de la depilación láser diodo para piernas completas. ¿Cuánto vale y cuántas sesiones necesito?",
      asunto: "Depilación láser diodo",
      respuestaSugerida:
        "Hola, gracias por escribir a Dermanova. Recibimos tu consulta y te confirmamos el valor, el número de sesiones y cómo agendar la valoración en cuanto una asesora la revise.",
    },
  },
  // CL3 (toque 2, 11-nov-2026). Hechos de Notion (gancho_verificado y el DM1 que salió), verificados el 4 de noviembre.
  {
    slug: "sahar-spa",
    nombre: "Sahar Spa y Estética",
    tipo: "clinica",
    titulo: { antes: "Quien busca Sahar en internet ", luz: "llega a un spa en Japón." },
    hecho:
      "Tienen un anuncio de lipo sin cirugía activo desde el 16 de julio que lleva a WhatsApp. Al 4 de noviembre no tenían web: su Facebook solo muestra un correo de Gmail, y saharspa.com es un spa en Japón.",
    consulta: {
      mensaje: "Hola, vi el anuncio de lipo sin cirugía. ¿Cuánto cuesta y cuántas sesiones son?",
      asunto: "Lipo sin cirugía",
      respuestaSugerida:
        "Hola, gracias por escribir a Sahar. Recibimos tu consulta y te confirmamos el valor y el número de sesiones en cuanto el equipo la revise.",
    },
  },
  {
    slug: "dr-gilberto-ortiz",
    nombre: "Dr. Gilberto Ortiz",
    tipo: "clinica",
    titulo: { antes: "La web dice «Envíanos un mensaje», ", luz: "pero no hay dónde escribirlo." },
    hecho:
      "Su anuncio de valoración gratuita, activo desde el 21 de mayo, da dos números: el 318 206 2895 y el 316 715 5516. Al 4 de noviembre, la página de contacto de drgilbertoortiz.com decía «Envíanos un mensaje», pero no tenía formulario: solo el botón de WhatsApp.",
    consulta: {
      mensaje: "Buenas noches, quiero la valoración gratuita. ¿Qué días tienen disponibles?",
      asunto: "Valoración gratuita",
      respuestaSugerida:
        "Hola, gracias por escribir al consultorio del Dr. Gilberto Ortiz. Recibimos tu solicitud de valoración y te confirmamos los días disponibles en cuanto el equipo la revise.",
    },
  },
  {
    slug: "cantik",
    nombre: "Cantik",
    tipo: "clinica",
    titulo: { antes: "Seis sedes, un solo WhatsApp. ", luz: "¿De cuál es cada consulta?" },
    hecho:
      "Sus anuncios de consulta gratuita están activos desde agosto. Al 4 de noviembre, cantik.clinic listaba seis sedes (Bogotá Salitre, Cedritos y Centro Mayor, Cajicá, Tunja y Cali), todas con el mismo WhatsApp, el 324 448 4848, y la web no tenía formulario: cada «Agenda ya» abre ese chat.",
    consulta: {
      mensaje: "Hola, estoy en Cajicá. ¿La consulta gratuita la hacen en esa sede y qué días?",
      asunto: "Consulta gratuita · Cajicá",
      respuestaSugerida:
        "Hola, gracias por escribir a Cantik. Recibimos tu consulta para la sede de Cajicá y te confirmamos los días de atención en cuanto el equipo la revise.",
    },
  },
  {
    slug: "studio-glows",
    nombre: "Studio Glows",
    tipo: "clinica",
    titulo: { antes: "Ocho anuncios mandan a reservar por chat. ", luz: "Lo que llega de noche espera." },
    hecho:
      "Al 4 de noviembre tenían 8 anuncios de depilación láser activos hacia WhatsApp, el primero desde el 22 de abril. Su página de Facebook no tenía web, solo el teléfono y un correo: toda reserva y toda pregunta de precio pasa por el chat.",
    consulta: {
      mensaje: "Hola, ¿cuánto vale la depilación láser de axilas y piernas? ¿Tienen cita esta semana?",
      asunto: "Depilación láser",
      respuestaSugerida:
        "Hola, gracias por escribir a Studio Glows. Recibimos tu consulta y te confirmamos el valor y los cupos de esta semana en cuanto el equipo la revise.",
    },
  },
  // CL2 (toque 2, 9-nov-2026). Hechos tomados de Notion (gancho_verificado y el DM1 que salió), verificados del 1 al 4 de nov; por eso llevan la fecha.
  {
    slug: "dulce-vanidad",
    nombre: "Dulce Vanidad",
    tipo: "clinica",
    titulo: { antes: "Quien busca su web antes de escribir ", luz: "se encuentra con relojes de imitación." },
    hecho:
      "Tienen anuncios activos desde el 3 de septiembre. El 1 de noviembre, dulcevanidadce.com mostraba en medio de la página un texto en inglés que vende relojes de imitación, con enlaces a otras tiendas: código ajeno dentro de la web. Tampoco tiene formulario.",
    consulta: {
      mensaje: "Hola, ¿cuánto vale la limpieza facial profunda y tienen cita este sábado?",
      asunto: "Limpieza facial",
      respuestaSugerida:
        "Hola, gracias por escribir a Dulce Vanidad. Recibimos tu consulta y te confirmamos el valor y el cupo del sábado en cuanto el equipo la revise.",
    },
  },
  {
    slug: "viarmoni",
    nombre: "Viarmoni",
    tipo: "clinica",
    titulo: { antes: "Tres ciudades, un solo número. ", luz: "¿De qué sede es cada consulta?" },
    hecho:
      "Atienden en Pereira, Cali y Popayán con un solo WhatsApp, el 305 425 5782, y sus anuncios llevan a ese chat desde el 19 de agosto. Al 1 de noviembre no tenían web: los enlaces de su perfil son un linktr.ee y su página de Facebook.",
    consulta: {
      mensaje: "Hola, estoy en Cali. ¿Cuánto cuesta la armonización facial y qué días atienden aquí?",
      asunto: "Armonización facial · Cali",
      respuestaSugerida:
        "Hola, gracias por escribirnos. Recibimos tu consulta para la sede de Cali y te confirmamos el valor y los días de atención en cuanto el equipo la revise.",
    },
  },
  {
    slug: "el-cielo-pereira",
    nombre: "El Cielo",
    tipo: "clinica",
    titulo: { antes: "22 anuncios llevan gente al chat. ", luz: "No hay dónde conocer los tratamientos." },
    hecho:
      "Al 4 de noviembre tenían 22 anuncios activos hacia WhatsApp, y el enlace de su perfil de Instagram lleva directo al chat. No encontramos una web de la clínica: quien quiere conocer los tratamientos antes de escribir no tiene dónde.",
    consulta: {
      mensaje: "Buenas noches, quiero información del tratamiento antienvejecimiento. ¿Cómo es la valoración?",
      asunto: "Tratamiento antienvejecimiento",
      respuestaSugerida:
        "Hola, gracias por escribir a El Cielo. Recibimos tu consulta y te confirmamos cómo es la valoración y cómo agendarla en cuanto el equipo la revise.",
    },
  },
  {
    slug: "koa-depil",
    nombre: "KOA Depil & Esthetic",
    tipo: "clinica",
    titulo: { antes: "AgendaPro reserva. ", luz: "Las preguntas de antes se quedan en el chat." },
    hecho:
      "Su web no tiene formulario: toda consulta entra por el botón de WhatsApp, y las reservas van por AgendaPro. Lo que alguien pregunta antes de reservar (precio, zona, si le sirve el láser) queda en el chat. Esto no reemplaza AgendaPro: atiende lo que llega antes.",
    consulta: {
      mensaje: "Hola, ¿la depilación láser sirve para vello claro? ¿Cuánto cuesta axilas y bikini?",
      asunto: "Depilación láser",
      respuestaSugerida:
        "Hola, gracias por escribirnos. Recibimos tu consulta y te confirmamos si el láser te sirve y el valor de las zonas en cuanto el equipo la revise.",
    },
  },
  {
    slug: "revital-spa",
    nombre: "Revital Spa",
    tipo: "clinica",
    titulo: { antes: "El número del anuncio ", luz: "no entra desde un celular." },
    hecho:
      "El 2 de noviembre su anuncio de la promo corporal mostraba el fijo 345 5855 sin el 606 que hoy hay que marcar, y su página de Facebook no tenía web. Quien no escribe al chat no tiene otra forma de llegar.",
    consulta: {
      mensaje: "Hola, vi la promo corporal de $89.000. ¿Sigue vigente y qué incluye?",
      asunto: "Promo corporal",
      respuestaSugerida:
        "Hola, gracias por escribir a Revital Spa. Recibimos tu consulta y te confirmamos si la promo sigue vigente y qué incluye en cuanto el equipo la revise.",
    },
  },
  // C10 (toque 2, 10-nov-2026). Hechos de Notion (gancho_verificado y el DM1 que salió), verificados el 3 de noviembre.
  {
    slug: "a-giraldo-constructores",
    nombre: "A Giraldo Constructores",
    tipo: "estudio",
    titulo: { antes: "Dos celulares en el anuncio. ", luz: "Ningún registro de quién pidió qué." },
    hecho:
      "Su anuncio hacia WhatsApp, activo desde el 27 de octubre, da dos celulares distintos (313 444 3342 y 313 458 1804). Al 3 de noviembre no tenían web, solo Facebook: las consultas quedan repartidas entre dos chats.",
    consulta: {
      mensaje: "Hola, tengo un lote en Chía y quiero construir una casa de dos pisos. ¿Cómo cotizan?",
      asunto: "Construcción de casa · Chía",
      respuestaSugerida:
        "Hola, gracias por escribirnos. Recibimos los datos de tu lote y te confirmamos cómo hacemos la cotización en cuanto el equipo los revise.",
    },
  },
  {
    slug: "hi-home-design",
    nombre: "Hi Home Design",
    tipo: "estudio",
    titulo: { antes: "El anuncio manda al perfil, ", luz: "y el perfil no lleva a ninguna web." },
    hecho:
      "Su anuncio de obra gris a terminado, del 31 de octubre, manda al perfil para que les escriban por mensaje, y al 3 de noviembre el perfil no tenía una web enlazada. Cada persona tiene que preguntar todo por chat.",
    consulta: {
      mensaje: "Hola, me entregan un apartamento en obra gris de 65 m² en diciembre. ¿Cuánto tiempo tardan en dejarlo terminado?",
      asunto: "Obra gris a terminado · 65 m²",
      respuestaSugerida:
        "Hola, gracias por escribirnos. Recibimos los datos de tu apartamento y te confirmamos los tiempos y cómo es el proceso en cuanto el equipo los revise.",
    },
  },
  {
    slug: "arq-360",
    nombre: "ARQ 360",
    tipo: "estudio",
    titulo: { antes: "El botón dice «cotizar». ", luz: "Ninguna web con obras para ver antes." },
    hecho:
      "Su anuncio de remodelación de obra gris y mantenimiento de conjuntos, activo desde octubre, tiene botón de cotizar, y al 3 de noviembre el enlace de su Instagram llevaba directo a WhatsApp, sin una web con obras terminadas.",
    consulta: {
      mensaje: "Buenas, administro un conjunto de 120 apartamentos y necesitamos cotizar mantenimiento de fachadas.",
      asunto: "Mantenimiento de conjunto",
      respuestaSugerida:
        "Hola, gracias por escribirnos. Recibimos la información del conjunto y te confirmamos cómo hacemos la visita y la cotización en cuanto el equipo la revise.",
    },
  },
  {
    slug: "essencial-arquitectura",
    nombre: "Essencial Arquitectura",
    tipo: "estudio",
    titulo: { antes: "Un Linktree no muestra proyectos. ", luz: "Una web sí." },
    hecho:
      "Tienen un anuncio hacia WhatsApp activo desde septiembre, y al 3 de noviembre el enlace de su Instagram era un Linktree con WhatsApp y redes, sin una web de Essencial donde conocer sus proyectos antes de escribir.",
    consulta: {
      mensaje: "Hola, queremos diseñar la remodelación de una casa en Usaquén. ¿Hacen el diseño y la obra?",
      asunto: "Remodelación de casa · Usaquén",
      respuestaSugerida:
        "Hola, gracias por escribirnos. Recibimos tu consulta y te confirmamos cómo trabajamos el diseño y la obra en cuanto el equipo la revise.",
    },
  },
  {
    slug: "axi-group",
    nombre: "Axi Group",
    tipo: "estudio",
    titulo: { antes: "Su web nueva muestra el trabajo, ", luz: "pero no tiene dónde dejar una consulta." },
    hecho:
      "Tiene un anuncio activo hacia WhatsApp desde el 29 de septiembre. Su web, axigroupsas.com, solo trae un teléfono: no hay formulario que pregunte tipo de obra, metros o presupuesto.",
    consulta: {
      mensaje: "Hola, tengo un apartamento de 80 m² y quiero remodelar la cocina y los dos baños. ¿Cuánto puede costar?",
      asunto: "Remodelación de apartamento",
      respuestaSugerida:
        "Hola, gracias por escribirnos. Recibimos los datos de tu apartamento y te confirmamos cómo es el proceso de cotización en cuanto el equipo los revise.",
    },
  },
  {
    slug: "arquitectura-moderna",
    nombre: "Arquitectura Moderna",
    tipo: "estudio",
    titulo: { antes: "El anuncio manda a la web, ", luz: "y la web manda a WhatsApp." },
    hecho:
      "Su anuncio activo desde el 18 de octubre lleva a arqmoderna.com, que no tiene formulario: solo un botón de WhatsApp. La consulta depende de que alguien la vea y la anote.",
    consulta: {
      mensaje: "Hola, compré un apartamento en obra gris de 70 m² y quiero que me lo entreguen terminado. ¿Cómo trabajan?",
      asunto: "Obra gris a apartamento terminado",
      respuestaSugerida:
        "Hola, gracias por escribirnos. Recibimos la información de tu apartamento y te confirmamos cómo es el proceso de diseño y ejecución en cuanto el equipo la revise.",
    },
  },
  {
    slug: "ideia-remodelaciones",
    nombre: "IDEIA",
    tipo: "estudio",
    titulo: { antes: "Pagan para que les escriban, ", luz: "y no hay una web donde mirar." },
    hecho:
      "Tiene anuncios activos hacia WhatsApp desde finales de agosto. En su perfil de Instagram el único enlace es el WhatsApp: quien quiere ver proyectos antes de escribir no encuentra dónde.",
    consulta: {
      mensaje: "Hola, quiero remodelar un local de 40 m² para abrir un restaurante. ¿Me pueden cotizar?",
      asunto: "Remodelación de local",
      respuestaSugerida:
        "Hola, gracias por escribirnos. Recibimos los datos del local y te confirmamos cómo se hace la cotización en cuanto el equipo los revise.",
    },
  },
  {
    slug: "tres-c",
    nombre: "Tres-C",
    tipo: "estudio",
    titulo: { antes: "Ofrecen asesoría gratuita, ", luz: "pero la consulta depende de quien conteste." },
    hecho:
      "Tiene anuncios activos hacia WhatsApp (remodelación desde el 31 de agosto y sistemas constructivos desde el 16 de octubre). Su web invita a recibir asesoría gratuita y deja el contacto en el teléfono y el WhatsApp.",
    consulta: {
      mensaje: "Hola, quiero remodelar la cocina y los baños de mi apartamento. ¿Hacen también el diseño?",
      asunto: "Remodelación de cocina y baños",
      respuestaSugerida:
        "Hola, gracias por escribirnos. Recibimos tu consulta y te confirmamos qué incluye el diseño y cómo es el proceso en cuanto el equipo la revise.",
    },
  },
  // CL4 (12-nov-2026): cinco clínicas odontológicas. Hechos verificados el 6-nov (y Odent re-verificada el 9-nov).
  {
    slug: "natural-design",
    nombre: "Natural Design Odontología",
    tipo: "clinica",
    titulo: { antes: "Cuatro anuncios hacia WhatsApp desde julio, ", luz: "y ninguna web donde mirar." },
    hecho:
      "Tiene 4 anuncios activos hacia WhatsApp desde el 1 de julio de 2026. No encontramos una web propia: en su Facebook solo aparecen la dirección y el número.",
    consulta: {
      mensaje: "Hola, quiero una valoración dental. ¿Qué disponibilidad tienen esta semana?",
      asunto: "Valoración dental",
      respuestaSugerida:
        "Hola, gracias por escribirnos. Recibimos tu solicitud y te confirmamos la disponibilidad para la valoración en cuanto el equipo la revise.",
    },
  },
  {
    slug: "clinica-odontologica-ok",
    nombre: "Clínica Odontológica OK",
    tipo: "clinica",
    titulo: { antes: "Un anuncio activo desde junio, ", luz: "y el chat como único lugar a donde ir." },
    hecho:
      "Tiene un anuncio activo hacia WhatsApp desde el 2 de junio de 2026. No encontramos una web propia, así que quien llega desde el anuncio solo tiene el chat.",
    consulta: {
      mensaje: "Buenas tardes, ¿cuánto cuesta una limpieza dental y tienen cita para esta semana?",
      asunto: "Limpieza dental",
      respuestaSugerida:
        "Hola, gracias por escribirnos. Recibimos tu consulta y te confirmamos el valor y la disponibilidad en cuanto el equipo la revise.",
    },
  },
  {
    slug: "odontologia-omnisalud",
    nombre: "Odontología Omnisalud",
    tipo: "clinica",
    titulo: { antes: "Anuncian desde diciembre, ", luz: "pero no hay una web a donde mandar." },
    hecho:
      "Tiene 4 anuncios activos hacia WhatsApp desde el 20 de diciembre de 2025. No encontramos una web propia: el dominio odontologiaomnisalud.com no abre.",
    consulta: {
      mensaje: "Hola, me gustaría información sobre un tratamiento de ortodoncia. ¿Cómo es el proceso?",
      asunto: "Ortodoncia",
      respuestaSugerida:
        "Hola, gracias por escribirnos. Recibimos tu consulta y te confirmamos cómo es el proceso y los pasos para la valoración en cuanto el equipo la revise.",
    },
  },
  {
    slug: "cedent",
    nombre: "Cedent Soluciones Odontológicas",
    tipo: "clinica",
    titulo: { antes: "Quien busca su nombre en internet ", luz: "no encuentra su web." },
    hecho:
      "Tiene 4 anuncios activos hacia WhatsApp desde el 10 de marzo de 2026. No encontramos una web propia; el dominio cedent.com.co que aparece al buscar el nombre es de otra clínica.",
    consulta: {
      mensaje: "Hola, vi el anuncio y quiero agendar una cita de valoración. ¿Cómo hago?",
      asunto: "Cita de valoración",
      respuestaSugerida:
        "Hola, gracias por escribirnos. Recibimos tu solicitud y te confirmamos los pasos para agendar la valoración en cuanto el equipo la revise.",
    },
  },
  {
    slug: "odent",
    nombre: "Odent",
    tipo: "clinica",
    titulo: { antes: "Anuncian implantes, ", luz: "y el enlace de su web no abre." },
    hecho:
      "Tiene 2 anuncios activos hacia WhatsApp desde el 5 de agosto de 2026. El enlace de su Instagram a «Qué vale un implante dental» da error 404, y el de su Facebook responde 402 «Tienda no disponible» (verificado el 9 de noviembre de 2026).",
    consulta: {
      mensaje: "Buenas noches, quiero información sobre implantes dentales. ¿Cómo es la valoración?",
      asunto: "Implantes dentales",
      respuestaSugerida:
        "Hola, gracias por escribirnos. Recibimos tu consulta y te confirmamos cómo es la valoración y los pasos a seguir en cuanto el equipo la revise.",
    },
  },
];

export function demoPorSlug(slug: string): Demo | undefined {
  return DEMOS.find((d) => d.slug === slug);
}

export type Pregunta = { id: string; texto: string; opciones: string[] };

const PREGUNTAS: Record<TipoDemo, Pregunta[]> = {
  clinica: [
    { id: "volumen", texto: "¿Cuántas consultas les llegan por semana?", opciones: ["Menos de 20", "Entre 20 y 60", "Más de 60", "No lo sé"] },
    { id: "quien", texto: "¿Quién las responde hoy?", opciones: ["Una persona del equipo", "Varias personas", "La dueña o el dueño", "Nadie fijo"] },
    { id: "noche", texto: "¿Qué pasa con las que llegan fuera de horario?", opciones: ["Esperan al día siguiente", "Las atiende alguien", "Se pierden, no sé cuántas"] },
  ],
  estudio: [
    { id: "volumen", texto: "¿Cuántas consultas de proyectos les llegan al mes?", opciones: ["Menos de 10", "Entre 10 y 30", "Más de 30", "No lo sé"] },
    { id: "donde", texto: "¿Por dónde llegan sobre todo?", opciones: ["WhatsApp", "Instagram", "La web o el correo", "Por todos lados y se mezclan"] },
    { id: "registro", texto: "¿Quién las responde y las anota?", opciones: ["Yo mismo", "Una persona del equipo", "Nadie las anota", "Cada quien las suyas"] },
  ],
};

export function preguntasDe(tipo: TipoDemo): Pregunta[] {
  return PREGUNTAS[tipo];
}

export function ofertaTexto(tipo: TipoDemo): string {
  return tipo === "clinica"
    ? // (9-nov) igual a la propuesta de Dermanova y al DM1 de CL4; antes decía $2.500.000 + $500.000
      "Desde $1.800.000 de montaje y $400.000 al mes, listo en 3 semanas."
    : "Desde $3.600.000, listo en 5 semanas.";
}

/** Mensaje de WhatsApp con las tres respuestas; sin las tres no hay enlace (el botón queda apagado). */
export function enlaceWhatsApp(demo: Demo, respuestas: string[]): string {
  const preguntas = PREGUNTAS[demo.tipo];
  if (respuestas.length < preguntas.length || respuestas.slice(0, preguntas.length).some((r) => !r)) return "";
  const lineas = preguntas.map((p, i) => `• ${p.texto} ${respuestas[i]}`);
  const texto = [`Hola, soy de ${demo.nombre}. Vi la demostración y quiero agendar los 15 minutos.`, ...lineas].join("\n");
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(texto)}`;
}
