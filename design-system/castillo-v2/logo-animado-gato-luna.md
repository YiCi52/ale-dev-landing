# Sello animado: luna → gato (idea de Alejandro, 2026-08-01)

## Por qué existe
La marca personal de Alejandro siempre lleva **un gato y una luna** — su animal y
su astro favoritos. Es el detalle que la competencia del nicho (Luciano Marchisio,
Visual Bloom, Proyecto W) no tiene: ellos tienen servicio, no marca.

## Decisión de formato: INLINE, no pantalla de carga
La idea original era un loader tipo ALCHE. **Alejandro la reformuló y su versión
es mejor**: la animación ocurre en el gato que YA está en el hero, junto al
eyebrow. Ventajas:
- Cero interrupción de entrada (no bloquea el contenido ni el LCP)
- Queda como gancho visual pegado al mensaje principal
- El estado final es el gato que ya existe → no rompe nada si la animación no corre

## Secuencia
1. **Luna** en fases: llena → menguante → cuarto → creciente (el ciclo, comprimido)
2. **Gato negro** entra caminando desde un lado
3. La luna se transforma en la **C** de Castillo Studio
4. La C **se desplaza hacia un lado y al hacerlo ARRASTRA/REVELA el nombre**
   "CASTILLO STUDIO" — el deslizamiento deja de ser un movimiento gratuito y pasa
   a ser el gesto que escribe la marca (refinamiento de Alejandro, 2026-08-01)
5. La C sale de cuadro; queda el **nombre + el gato** (estado de reposo)

Detalle de implementación del paso 4: el texto del eyebrow ya existe en el DOM —
la C actúa como máscara/cortina que lo va descubriendo al desplazarse. Así el
nombre es legible aunque la animación no corra (no se "escribe" con JS, se revela).

## Decisión técnica: SVG, NO 3D
Descartado 3D/WebGL por tres razones:
1. Contradice el norte visual ya validado (objeto héroe = pre-render, no WebGL vivo)
   y el hero llegó a CERO WebGL a propósito al reemplazar el cristal R3F por HeroArch.
2. Un animal estilizado en 3D tiende a verse "asset de videojuego" — lo contrario
   de dark editorial. El gato funciona porque es SILUETA.
3. Regla propia de Lighthouse mobile ≥95: cargar runtime 3D para una mascota es
   el peor intercambio posible.

SVG además es la herramienta NATURAL para esta idea:
- Fases lunares = un círculo con una máscara que se desplaza (no se "anima la luna")
- El gato ya es un path (`CatMascot.tsx`)
- Luna → C = morph de path (GSAP MorphSVG, hoy gratuito)

## Guardas obligatorias
- Se reproduce UNA vez por sesión (sessionStorage), nunca en cada navegación
- `prefers-reduced-motion` → sin animación, gato estático directo
- El gato debe ser legible aunque la animación nunca corra (mismo principio que
  se aplicó al titular: nada crítico depende de JS para ser visible)

## Pendiente asociado
Mejorar el SVG del gato (`CatMascot.tsx` son hoy 4 formas geométricas). Es el logo:
sirve para el sello animado, el favicon, el footer y redes. ~30 min, mayor retorno
que el 3D.
