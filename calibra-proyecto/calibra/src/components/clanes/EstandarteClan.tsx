// Fase 9.4: cosmético de clan. No hay arte curado nuevo para esto (a
// diferencia de las insignias de rango, que vinieron de un PNG que
// diste) — así que en vez de imitar ese estilo con placeholders,
// esto es una bandera/estandarte 100% generado por código (SVG), con
// el color propio del clan y 3 escalones visuales según nivel_clan
// (1-3 lisa, 4-7 con borde + brillo, 8-10 con emblema de estrella) —
// mismo espíritu de "evoluciona con el nivel", código en vez de PNG.
export default function EstandarteClan({ color, nivel, size = 64 }: { color: string; nivel: number; size?: number }) {
  const alto = size;
  const ancho = size * 0.72;
  const tierAlto = nivel >= 8 ? 3 : nivel >= 4 ? 2 : 1;
  const idGrad = `estandarte-grad-${color.replace("#", "")}`;

  return (
    <svg width={ancho} height={alto} viewBox={`0 0 ${ancho} ${alto}`} role="img" aria-label={`Estandarte de clan, nivel ${nivel}`}>
      <defs>
        <linearGradient id={idGrad} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={1} />
          <stop offset="100%" stopColor={color} stopOpacity={0.7} />
        </linearGradient>
      </defs>
      {/* Mástil */}
      <rect x={0} y={0} width={ancho * 0.06} height={alto} fill="var(--texto-secundario)" rx={1} />
      {/* Paño de la bandera, terminado en punta (forma de pendón) */}
      <path
        d={`M ${ancho * 0.08} ${alto * 0.05}
            H ${ancho * 0.95}
            L ${ancho * 0.7} ${alto * 0.5}
            L ${ancho * 0.95} ${alto * 0.95}
            H ${ancho * 0.08} Z`}
        fill={`url(#${idGrad})`}
        stroke={tierAlto >= 2 ? "var(--logro)" : "transparent"}
        strokeWidth={tierAlto >= 2 ? 2 : 0}
      />
      {tierAlto >= 3 && (
        <text x={ancho * 0.42} y={alto * 0.42} textAnchor="middle" dominantBaseline="central" fontSize={size * 0.22} fill="white">
          ★
        </text>
      )}
    </svg>
  );
}
