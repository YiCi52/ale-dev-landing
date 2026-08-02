# Arquitectura multipágina + baraja de casos (decisión Alejandro, 2026-08-01)

## El problema que él detectó
"Siento que todo está en una pestaña". Hoy la home es un scroll único con DOS casos
completos embebidos (240 y 205 líneas de contenido cada uno) + servicios + proceso +
sobre mí + contacto. Para un PORTAFOLIO eso está mal: el visitante tiene que hacer
scroll por un caso entero antes de ver que existe el segundo, y no puede compartir
el enlace de un proyecto específico.

## Referencia
Vanity (@vanity.llc): la home muestra el trabajo como **tarjetas / baraja**; cada
proyecto vive en su propia página. Además él quiere una página propia de "sobre mí"
— igual que el sitio de Maria, donde la persona tiene su pestaña y no compite con
el trabajo.

## Estructura destino
```
/                     Hero → baraja de casos (tarjetas) → servicios (resumen) → contacto
/trabajo/mh-interior  Caso completo (mueve CasoMHInterior.tsx)
/trabajo/macrolift    Caso completo (mueve CasoMacroLift.tsx)
/sobre-mi             Sobre mí completo (mueve SobreMi.tsx) + proceso
/lab                  Ya existe (labs, sin push aún — publicar es decisión aparte)
```

## Baraja de casos (home)
- Tarjeta por proyecto: screenshot principal, nombre, una línea de resultado, año
- Interacción tipo baraja (apiladas / desplegables), NO grilla plana genérica
- Cada tarjeta enlaza a su página `/trabajo/<slug>`
- Debe funcionar con teclado y sin JS (las tarjetas son enlaces reales, no divs con onClick)

## Beneficios concretos
1. Cada proyecto tiene URL propia → se puede mandar en un DM ("mirá este caso")
2. La home queda corta y respirada: hero + prueba + oferta + contacto
3. SEO: una página por proyecto indexa por su propio nombre y nicho
4. Cuando entren clientes nuevos, agregar un caso = agregar una tarjeta y una ruta

## Guardas
- Las páginas nuevas heredan la metadata del layout (template "%s · Castillo Studio")
- No romper el ancla `#casos` que ya usa el hero — debe apuntar a la baraja
- Mobile: la baraja no puede volverse un carrusel que atrape el scroll vertical
