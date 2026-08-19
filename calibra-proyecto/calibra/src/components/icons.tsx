interface IconProps {
  className?: string;
}

const base = {
  width: 22,
  height: 22,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function IconSuma({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export function IconResta({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M5 12h14" />
    </svg>
  );
}

export function IconMultiplicacion({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

export function IconDivision({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <circle cx="12" cy="6.5" r="1.4" fill="currentColor" stroke="none" />
      <path d="M5 12h14" />
      <circle cx="12" cy="17.5" r="1.4" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconMixto({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M3 6h4l9 12h5M3 18h4l3-4M16 6h5" />
      <path d="M18 4l3 2-3 2M18 16l3 2-3 2" />
    </svg>
  );
}

export function IconFracciones({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M17 4L7 20" />
      <circle cx="8.5" cy="6" r="1.3" fill="currentColor" stroke="none" />
      <circle cx="15.5" cy="18" r="1.3" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconDecimalesPorcentajes({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <circle cx="7" cy="7" r="2.5" />
      <circle cx="17" cy="17" r="2.5" />
      <path d="M19 5L5 19" />
    </svg>
  );
}

export function IconPotenciasRaices({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M4 13l3 5 4-15h9" />
    </svg>
  );
}

export function IconAlgebra({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M10 4c-3 3-3 13 0 16" />
      <path d="M14 4c3 3 3 13 0 16" />
      <circle cx="12" cy="12" r="1.3" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconGeometria({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M9 4L4 13h10z" />
      <rect x="13" y="12" width="7" height="7" rx="1" />
    </svg>
  );
}

export function IconLlama({ className }: IconProps) {
  return (
    <svg {...base} className={className} fill="currentColor" stroke="none">
      <path d="M12 2c1 3-2 4-2 7a2 2 0 0 0 4 0c2 1 3 3 3 5a5 5 0 0 1-10 0c0-4 3-5 3-8 0-1.5.8-3 2-4z" />
    </svg>
  );
}

export function IconObjetivo({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="12" cy="12" r="0.5" fill="currentColor" />
    </svg>
  );
}

export function IconX({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  );
}

export function IconCheck({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M5 13l4 4L19 7" />
    </svg>
  );
}

export function IconCandado({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <rect x="5" y="11" width="14" height="9" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </svg>
  );
}

export function IconEscudo({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M12 3l7 3v6c0 4.5-3 8-7 9-4-1-7-4.5-7-9V6z" />
    </svg>
  );
}

export function IconLibro({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M4 5.5C4 4.7 4.7 4 5.5 4H12v16H5.5c-.8 0-1.5-.7-1.5-1.5v-13Z" />
      <path d="M20 5.5c0-.8-.7-1.5-1.5-1.5H12v16h6.5c.8 0 1.5-.7 1.5-1.5v-13Z" />
    </svg>
  );
}

export function IconCasa({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M4 11l8-7 8 7" />
      <path d="M6 9.5V19a1 1 0 0 0 1 1h3v-5h4v5h3a1 1 0 0 0 1-1V9.5" />
    </svg>
  );
}

export function IconPerfil({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M4.5 20c1.2-4 4.2-6 7.5-6s6.3 2 7.5 6" />
    </svg>
  );
}

export function IconLogica({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  );
}

export function IconOjo({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export function IconOjoTachado({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M3 3l18 18" />
      <path d="M10.6 5.2C11 5.1 11.5 5 12 5c6.5 0 10 7 10 7a17 17 0 0 1-3.4 4.3M6.6 6.6C4 8.3 2 12 2 12s3.5 7 10 7c1.3 0 2.5-.3 3.6-.7" />
      <path d="M9.9 10a3 3 0 0 0 4.2 4.2" />
    </svg>
  );
}

export function IconLupa({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.3-4.3" />
    </svg>
  );
}

// Insignia de rango de Rankeds (RangoBadge.tsx) — distinta de IconEscudo
// (que en el resto de la app siempre significa "escudo de calibración
// disponible", un concepto puntual aparte).
export function IconRango({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M12 2l2.4 4.9 5.4.8-3.9 3.8.9 5.4L12 14.3l-4.8 2.6.9-5.4-3.9-3.8 5.4-.8L12 2z" />
    </svg>
  );
}
