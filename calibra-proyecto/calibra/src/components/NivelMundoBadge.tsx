interface Props {
  nombreMundo: string;
  nivel: number;
  colorHex: string;
}

// Fase DD2: tercer eje de progreso, separado del nivel de calibración
// por operación (LevelDial, el anillo que ya se usa en cada tarjeta de
// tema) — tratamiento visual deliberadamente distinto (pastilla sólida
// con el nombre del mundo adentro, no un dial) para que no se confundan.
export default function NivelMundoBadge({ nombreMundo, nivel, colorHex }: Props) {
  return (
    <div
      className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-white"
      style={{ background: `linear-gradient(120deg, ${colorHex}, color-mix(in oklab, ${colorHex} 60%, #FFC53D))` }}
    >
      <span className="text-xs font-medium uppercase tracking-wide opacity-80">{nombreMundo}</span>
      <span className="font-display text-base font-black">Nivel {nivel}</span>
    </div>
  );
}
