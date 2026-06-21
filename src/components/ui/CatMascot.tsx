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
        <polygon points="18,18 21,6 27,17" />
        <polygon points="33,17 39,6 42,18" />
        <circle cx="30" cy="24" r="11" />
        <path d="M 16 52 C 12 52 11 47 13 42 L 13 38 C 13 33 17 30 22 30 L 38 30 C 43 30 47 33 47 38 L 47 42 C 49 47 48 52 44 52 Z" />
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
