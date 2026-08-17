import { useId, type ReactNode } from "react";

interface Props {
  value: number;
  max: number;
  size?: number;
  children: ReactNode;
  colorDesde?: string;
  colorHasta?: string;
}

export default function ProgressDial({
  value,
  max,
  size = 72,
  children,
  colorDesde = "var(--primario)",
  colorHasta = "var(--logro)",
}: Props) {
  const gradientId = useId();
  const strokeWidth = size * 0.09;
  const radius = size / 2 - strokeWidth;
  const circumference = 2 * Math.PI * radius;
  const pct = max > 0 ? Math.min(1, Math.max(0, value / max)) : 0;
  const offset = circumference - circumference * pct;

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={colorDesde} />
            <stop offset="100%" stopColor={colorHasta} />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--border)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset .5s cubic-bezier(.16,1,.3,1)" }}
        />
        {/* Fase M2: punta tipo cometa en la cabeza del arco — un brillo
            asimétrico en vez de un relleno parejo de punta a punta. */}
        {pct > 0.02 && (
          <circle
            cx={size / 2 + radius * Math.cos(pct * 2 * Math.PI)}
            cy={size / 2 + radius * Math.sin(pct * 2 * Math.PI)}
            r={strokeWidth * 0.62}
            fill={colorHasta}
            style={{
              filter: `drop-shadow(0 0 ${strokeWidth * 0.55}px ${colorHasta})`,
              transition: "cx .5s cubic-bezier(.16,1,.3,1), cy .5s cubic-bezier(.16,1,.3,1)",
            }}
          />
        )}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">{children}</div>
    </div>
  );
}
