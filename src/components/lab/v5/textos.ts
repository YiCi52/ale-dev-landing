/*
  Textos de la v5 en español e inglés (Alejo, 19-oct: "la página en inglés, como la de Mari"). El inglés lo redacta Claude
  (regla: todo texto en inglés hacia clientes pasa por Claude). Las rutas en inglés viven en /lab/v5/en/...
*/
export type Idioma = "es" | "en";

export const RAIZ: Record<Idioma, string> = { es: "/lab/v5", en: "/lab/v5/en" };

export const TEXTOS = {
  es: {
    nav: { trabajo: "Trabajo", servicios: "Servicios", sobre: "Sobre mí", preguntas: "Preguntas", hablemos: "Hablemos", inicio: "Castillo Studio, inicio", otro: "EN", otroNombre: "English version" },
    hero: {
      rotulo: "Estudio web para arquitectura e interiorismo",
      titulo: "Tu obra,", tituloLuz: "a la luz.",
      sub: "Sitios donde el proyecto se recorre y cada consulta llega a tu WhatsApp en el mismo minuto.",
      cta: "Hablemos 15 minutos", ver: "Ver trabajo", pista: "Desliza: sale la luna",
      consulta: "Consulta nueva · ejemplo", consultaTitulo: "Casa campestre · diseño completo", consultaDetalle: "Tiene lote, busca diseño", consultaAria: "Ejemplo de consulta",
    },
    hora: { ciudad: "Bogotá", fases: ["luna nueva", "luna creciente", "cuarto creciente", "gibosa creciente", "luna llena", "gibosa menguante", "cuarto menguante", "luna menguante"], locale: "es-CO" },
    manifiesto: {
      rotulo: "Luz prestada",
      partes: ["La luna no tiene luz propia.", "Toma la del sol y la devuelve, para que de noche se vea lo que hay.", "Eso hacemos con tu obra: la mostramos como es y, cuando alguien la ve y quiere la suya,", "te avisa."],
    },
    puertas: [
      { ruta: "/servicios", rotulo: "Por dentro", titulo: "Cómo funciona", texto: "De la fachada a la planta: lo que lleva cada sitio." },
      { ruta: "/trabajo", rotulo: "Trabajo", titulo: "Obras encendidas", texto: "Un sitio de cliente y un recorrido hecho desde los planos." },
    ],
    trabajo: {
      rotulo: "Trabajo", titulo: "Obras", tituloLuz: "encendidas", pista: "Pasa el cursor por las fotos: debajo de cada obra está su dibujo.", pistaTactil: "Dos obras: un sitio de cliente y un recorrido hecho desde los planos.", cuenta: "obras",
      obras: [
        { tipo: "Sitio de cliente · 2026", detalle: "Portafolio de interiorismo con formulario, aviso y resumen semanal.", accion: "Ver el caso", piezas: ["Sala", "Cocina"] },
        { tipo: "Lab · casas icónicas Nº 1", detalle: "La casa de Le Corbusier reconstruida desde sus planos para recorrerla.", accion: "Ver el recorrido", piezas: ["Salón", "Llegada"] },
      ],
    },
    testimonio: {
      rotulo: "Una clienta", nota: "",
      cita: "“Como diseñadora de interiores necesitaba una página web que reflejara mi estilo y él supo entender perfectamente mis necesidades. Hoy tengo una página funcional, estética y alineada con mi identidad profesional que me ha ayudado a conectar con nuevas oportunidades.”",
      caso: "Ver el caso completo",
    },
    plano: {
      rotulo: "Por dentro", titulo: "Lo que no se ve también", tituloLuz: "se diseña.", corte: "PLANTA · NIVEL +0,55 · CORTE A 1,20 m",
      llamadas: [
        ["Proyectos", "Fotos, planos y ficha técnica de cada obra."],
        ["Recorridos", "La obra a pantalla completa, para caminarla antes de llamarte."],
        ["Formulario", "Pregunta lo que tú preguntarías: tipo de proyecto, metros, presupuesto, fecha."],
        ["Aviso", "Cada consulta llega a tu WhatsApp en el mismo minuto."],
        ["Respaldo", "Copia semanal y datos tratados según la Ley 1581."],
      ],
    },
    servicios: {
      rotulo: "Servicios", titulo: "Lo que", tituloLuz: "enciendo", pasosAria: "Cómo trabajamos",
      lista: [
        ["Sitio a la medida", "Diseño propio para tu estudio, con tus proyectos, tus planos y tu manera de mostrarlos.", "Desde $3.600.000 COP · 5 semanas"],
        ["Captura", "Formulario que filtra, aviso a tu WhatsApp y registro de cada consulta que llega.", "Incluida en todo sitio"],
        ["Recorridos", "La obra en secuencia o en 3D, hecha desde tus planos y tus fotos.", "Se cotiza por obra"],
        ["Cuidado", "Cambios, respaldo y un resumen de cuántas consultas llegaron y de dónde.", "30 días incluidos · luego mensual"],
      ],
      pasos: [
        ["Quince minutos", "Me cuentas de tu estudio y de la obra que quieres mostrar."],
        ["Propuesta en 48 horas", "Alcance, plazo y precio por escrito. Sin letra pequeña."],
        ["Yo me encargo", "Cinco semanas de trabajo. Tú revisas y apruebas en una reunión."],
      ],
    },
    preguntas: {
      rotulo: "Preguntas", titulo: "Antes de", tituloLuz: "escribir",
      lista: [
        ["¿Cuánto cuesta?", "Un sitio parte de $3.600.000 COP. El precio exacto va en la propuesta, después de la llamada, con el alcance por escrito."],
        ["¿Cuánto se demora?", "Cinco semanas desde el anticipo. Si hay recorridos en 3D, el plazo se define en la propuesta."],
        ["¿Qué tengo que darte?", "Fotos de tus obras y, si quieres mostrarlos, los planos. Los textos los trabajamos juntos."],
        ["¿Tengo que saber de tecnología?", "No. Yo me encargo de todo; tú revisas y apruebas en una reunión."],
        ["¿Qué pasa después de la entrega?", "Tienes 30 días de soporte incluidos. Después puedes seguir con un plan mensual de cambios, respaldo y resumen de consultas."],
        ["¿Y los datos de mis clientes?", "El formulario pide consentimiento, los datos se guardan protegidos y se tratan según la Ley 1581 de Colombia."],
      ],
    },
    sobre: {
      rotulo: "Sobre mí", titulo: "Castillo Studio es una persona:", tituloLuz: "Alejandro Díaz del Castillo.",
      texto: "Diseño y construyo sitios para estudios de arquitectura e interiorismo: páginas donde la obra se recorre y donde cada consulta llega a tu WhatsApp en el mismo minuto. Estudio Ingeniería de Software y trabajo con un solo proyecto a la vez, para que el tuyo tenga toda mi atención.",
      datosAria: "Datos", retratoAria: "Retrato de Alejandro Díaz del Castillo",
      datos: [["Base", "Bogotá, Colombia"], ["Formación", "Ingeniería de Software, en curso"], ["Ritmo", "Un proyecto a la vez"], ["Idiomas", "Español e inglés"]],
      formaRotulo: "Cómo trabajo",
      forma: [
        ["Primero tu obra", "El sitio parte de tus proyectos: su luz, sus materiales y cómo quieres que se recorran."],
        ["Después, lo que no se ve", "Formulario que filtra, base de datos propia, aviso a tu WhatsApp, respaldo semanal y seguridad desde el primer día."],
        ["Una persona, de principio a fin", "Hablas conmigo en cada etapa: la propuesta, el diseño, la entrega y lo que venga después."],
      ],
    },
    cierre: {
      rotulo: "Hablemos", titulo: "¿Encendemos", tituloLuz: "la tuya?", whatsapp: "Escríbeme por WhatsApp", formulario: "Prefiero el formulario",
      lema: "Estudio web para arquitectura e interiorismo", sitio: "Sitio", contacto: "Contacto", datos: "Datos", privacidad: "Política de privacidad",
      formularioCorto: "Formulario", nueva: " (se abre en una pestaña nueva)",
    },
  },
  en: {
    nav: { trabajo: "Work", servicios: "Services", sobre: "About", preguntas: "FAQ", hablemos: "Let’s talk", inicio: "Castillo Studio, home", otro: "ES", otroNombre: "Versión en español" },
    hero: {
      rotulo: "Web studio for architecture and interior design",
      titulo: "Your work,", tituloLuz: "in the light.",
      sub: "Websites where every project can be walked through, and every inquiry reaches your WhatsApp the same minute.",
      cta: "Book a 15-minute call", ver: "See the work", pista: "Scroll: the moon rises",
      consulta: "New inquiry · example", consultaTitulo: "Country house · full design", consultaDetalle: "Has the land, looking for a design", consultaAria: "Example inquiry",
    },
    hora: { ciudad: "Bogotá", fases: ["new moon", "waxing crescent", "first quarter", "waxing gibbous", "full moon", "waning gibbous", "last quarter", "waning crescent"], locale: "en-US" },
    manifiesto: {
      rotulo: "Borrowed light",
      partes: ["The moon has no light of its own.", "It borrows the sun’s and gives it back, so that at night you can see what is there.", "That is what we do with your work: we show it as it is and, when someone sees it and wants one of their own,", "you get the message."],
    },
    puertas: [
      { ruta: "/servicios", rotulo: "Inside", titulo: "How it works", texto: "From the façade to the floor plan: what every site includes." },
      { ruta: "/trabajo", rotulo: "Work", titulo: "Lit projects", texto: "A client website and a walkthrough built from the drawings." },
    ],
    trabajo: {
      rotulo: "Work", titulo: "Lit", tituloLuz: "projects", pista: "Move your cursor over the photos: under every project lies its drawing.", pistaTactil: "Two projects: a client website and a walkthrough built from the drawings.", cuenta: "projects",
      obras: [
        { tipo: "Client website · 2026", detalle: "Interior design portfolio with an inquiry form, instant alerts and a weekly summary.", accion: "See the case", piezas: ["Living room", "Kitchen"] },
        { tipo: "Lab · iconic houses No. 1", detalle: "Le Corbusier’s house rebuilt from its drawings so you can walk through it.", accion: "See the walkthrough", piezas: ["Salon", "Arrival"] },
      ],
    },
    testimonio: {
      rotulo: "A client", nota: "Translated from Spanish.",
      cita: "“As an interior designer, I needed a website that reflected my style, and he understood exactly what I needed. Today I have a site that is functional, beautiful and true to my professional identity, and it has helped me connect with new opportunities.”",
      caso: "See the full case",
    },
    plano: {
      rotulo: "Inside", titulo: "What you don’t see", tituloLuz: "is designed too.", corte: "FLOOR PLAN · LEVEL +0.55 · CUT AT 1.20 m",
      llamadas: [
        ["Projects", "Photos, drawings and specs for every project."],
        ["Walkthroughs", "Your work full screen, so clients can walk it before they call."],
        ["Inquiry form", "It asks what you would ask: project type, size, budget, timing."],
        ["Alerts", "Every inquiry reaches your WhatsApp the same minute."],
        ["Backup", "A weekly copy, and client data handled under data-protection law."],
      ],
    },
    servicios: {
      rotulo: "Services", titulo: "What I", tituloLuz: "light up", pasosAria: "How we work",
      lista: [
        ["Custom website", "Designed for your studio, around your projects, your drawings and the way you like to show them.", "5 weeks · priced in the proposal"],
        ["Lead capture", "A form that qualifies, an alert to your WhatsApp and a record of every inquiry.", "Included in every site"],
        ["Walkthroughs", "Your work as a sequence or in 3D, built from your drawings and photos.", "Quoted per project"],
        ["Care", "Updates, backups and a summary of how many inquiries came in, and from where.", "30 days included · then monthly"],
      ],
      pasos: [
        ["Fifteen minutes", "Tell me about your studio and the work you want to show."],
        ["Proposal in 48 hours", "Scope, timeline and price in writing. No fine print."],
        ["I handle it", "Five weeks of work. You review and approve in one meeting."],
      ],
    },
    preguntas: {
      rotulo: "FAQ", titulo: "Before you", tituloLuz: "write",
      lista: [
        ["How much does it cost?", "Every project is priced after a 15-minute call, in a written proposal with the scope, timeline and price."],
        ["How long does it take?", "Five weeks from the deposit. If there are 3D walkthroughs, the timeline is set in the proposal."],
        ["What do I need to give you?", "Photos of your projects and, if you want to show them, the drawings. We work on the copy together."],
        ["Do I need to know anything technical?", "No. I handle everything; you review and approve in one meeting."],
        ["What happens after launch?", "You get 30 days of support. After that you can stay on a monthly plan for updates, backups and an inquiry summary."],
        ["What about my clients’ data?", "The form asks for consent, data is stored securely and handled under Colombian data-protection law."],
      ],
    },
    sobre: {
      rotulo: "About", titulo: "Castillo Studio is one person:", tituloLuz: "Alejandro Díaz del Castillo.",
      texto: "I design and build websites for architecture and interior design studios: sites where every project can be walked through, and every inquiry reaches your WhatsApp the same minute. I’m studying Software Engineering and I take on one project at a time, so yours gets my full attention.",
      datosAria: "Facts", retratoAria: "Portrait of Alejandro Díaz del Castillo",
      datos: [["Based in", "Bogotá, Colombia"], ["Education", "Software Engineering, in progress"], ["Pace", "One project at a time"], ["Languages", "Spanish and English"]],
      formaRotulo: "How I work",
      forma: [
        ["Your work first", "The site starts from your projects: their light, their materials and how you want them to be walked through."],
        ["Then, what you don’t see", "A form that qualifies, your own database, instant WhatsApp alerts, weekly backups and security from day one."],
        ["One person, start to finish", "You talk to me at every stage: the proposal, the design, the launch and whatever comes after."],
      ],
    },
    cierre: {
      rotulo: "Let’s talk", titulo: "Shall we light", tituloLuz: "yours?", whatsapp: "Message me on WhatsApp", formulario: "Use the form (Spanish)",
      lema: "Web studio for architecture and interior design", sitio: "Site", contacto: "Contact", datos: "Data", privacidad: "Privacy policy",
      formularioCorto: "Form", nueva: " (opens in a new tab)",
    },
  },
} as const;
