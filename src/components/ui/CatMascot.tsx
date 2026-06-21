type CatMascotProps = {
  className?: string;
};

/*
  Silueta de gato sentado de frente.
  Composicion: 2 orejas triangulares con tip rounded, head ellipse,
  body en forma de pera (sentido de "sentado" via wider-base), cola S-curve.
  Todas las piezas comparten fill currentColor para silhouette pareja.
  La cola tiene su propio path con stroke y se anima desde su base.
*/
export function CatMascot({ className }: CatMascotProps) {
  return (
    <svg
      viewBox="0 0 60 60"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={className}
    >
      <g fill="currentColor">
        <path d="M 17 16 L 19 4 Q 20.5 1 22 4 L 24 16 Z" />
        <path d="M 36 16 L 38 4 Q 39.5 1 41 4 L 43 16 Z" />
        <ellipse cx="30" cy="20" rx="13" ry="11" />
        <path d="M 22 28 L 38 28 C 44 28 47 36 47 42 L 47 50 C 47 56 42 56 30 56 C 18 56 13 56 13 50 L 13 42 C 13 36 16 28 22 28 Z" />
      </g>
      <path
        className="cat-tail"
        d="M 45 50 C 53 48 56 36 50 26"
        fill="none"
        stroke="currentColor"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
