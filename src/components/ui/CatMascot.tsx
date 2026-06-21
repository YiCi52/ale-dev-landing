type CatMascotProps = {
  className?: string;
};

export function CatMascot({ className }: CatMascotProps) {
  return (
    <svg
      viewBox="0 0 60 60"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={className}
    >
      <g fill="currentColor">
        <path d="M 18 16 L 20 7 Q 21 4 22 7 L 26 16 Z" />
        <path d="M 34 16 L 38 7 Q 39 4 40 7 L 42 16 Z" />
        <circle cx="30" cy="22" r="10" />
        <path d="M 22 52 Q 12 52 12 42 L 12 38 Q 12 30 22 30 L 38 30 Q 48 30 48 38 L 48 42 Q 48 52 38 52 Z" />
      </g>
      <path
        className="cat-tail"
        d="M 46 46 Q 56 42 54 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
