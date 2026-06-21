type CatMascotProps = {
  className?: string;
};

export function CatMascot({ className }: CatMascotProps) {
  return (
    <svg
      viewBox="0 0 60 70"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={className}
    >
      <path
        fill="currentColor"
        d="M 18 65 C 14 65 12 60 14 54 L 14 38 C 14 30 18 26 24 24 L 24 18 L 30 24 L 34 24 L 40 18 L 40 26 C 44 30 44 36 44 42 L 44 58 C 44 64 40 65 36 65 Z"
      />
      <path
        className="cat-tail"
        d="M 16 56 Q 6 50 6 30 Q 6 22 12 22"
        fill="none"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
