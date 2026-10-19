/* Cada página de la v5 entra con un fundido corto al navegar (el template se vuelve a montar en cada ruta). */
export default function V5Template({ children }: { children: React.ReactNode }) {
  return <div className="v5-entra">{children}</div>;
}
