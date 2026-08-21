import type { CompuestoOrganico } from "@/lib/practica/quimicaOrganica";

const ANCHO_CAJA = 56;
const ALTO = 48;
const GAP = 28;

// Fórmula estructural condensada (Sección 5, ítem 3): cajas de texto
// con cada grupo (ej. "CH₃", "OH") unidas por líneas — simple línea
// para enlace simple, doble línea para enlace doble. Benceno es el
// único caso especial: hexágono regular (6 vértices a 60° generados
// por trigonometría, no coordenadas inventadas a mano) con enlaces
// alternados simple/doble, la representación estándar de un anillo
// aromático en cualquier libro de química.
export default function MoleculaSVG({ compuesto }: { compuesto: CompuestoOrganico }) {
  if (compuesto.anillo) {
    const radio = 46;
    const cx = 60;
    const cy = 60;
    const puntos = compuesto.grupos.map((_, i) => {
      const angulo = (Math.PI / 180) * (60 * i - 90);
      return { x: cx + radio * Math.cos(angulo), y: cy + radio * Math.sin(angulo) };
    });
    return (
      <svg width={120} height={120} viewBox="0 0 120 120" role="img" aria-label={compuesto.nombre}>
        {puntos.map((p, i) => {
          const q = puntos[(i + 1) % puntos.length];
          const doble = i % 2 === 0;
          const dx = q.y - p.y;
          const dy = -(q.x - p.x);
          const largo = Math.hypot(dx, dy) || 1;
          const offX = (dx / largo) * 3;
          const offY = (dy / largo) * 3;
          return (
            <g key={i} stroke="var(--foreground)" strokeWidth={2}>
              <line x1={p.x} y1={p.y} x2={q.x} y2={q.y} />
              {doble && <line x1={p.x + offX} y1={p.y + offY} x2={q.x + offX} y2={q.y + offY} />}
            </g>
          );
        })}
        {puntos.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={12} fill="var(--surface)" stroke="var(--foreground)" strokeWidth={1.5} />
        ))}
      </svg>
    );
  }

  const n = compuesto.grupos.length;
  const ancho = n * ANCHO_CAJA + Math.max(0, n - 1) * GAP;
  const cy = ALTO / 2;

  return (
    <svg width={ancho} height={ALTO} viewBox={`0 0 ${ancho} ${ALTO}`} role="img" aria-label={compuesto.nombre}>
      {compuesto.grupos.slice(0, -1).map((_, i) => {
        const x1 = i * (ANCHO_CAJA + GAP) + ANCHO_CAJA;
        const x2 = x1 + GAP;
        const doble = compuesto.enlaceDoble === i;
        return (
          <g key={i} stroke="var(--foreground)" strokeWidth={2}>
            <line x1={x1} y1={cy} x2={x2} y2={cy} />
            {doble && <line x1={x1} y1={cy + 5} x2={x2} y2={cy + 5} />}
          </g>
        );
      })}
      {compuesto.grupos.map((g, i) => {
        const x = i * (ANCHO_CAJA + GAP);
        return (
          <g key={i}>
            <rect x={x} y={4} width={ANCHO_CAJA} height={ALTO - 8} rx={8} fill="var(--surface)" stroke="var(--border)" />
            <text x={x + ANCHO_CAJA / 2} y={ALTO / 2} textAnchor="middle" dominantBaseline="central" fontSize={15} fontWeight={700} fill="var(--foreground)">
              {g}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
