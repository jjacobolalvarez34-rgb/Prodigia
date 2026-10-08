import type { ColorDibujo, Dibujo } from "@/lib/dibujo/primitivas";

// Pinta en SVG un dibujo compartido con la app (lib/dibujo/primitivas.ts). Los
// colores del tema van como variables CSS, así se lee bien en claro y oscuro.
function pintar(c: ColorDibujo | undefined, acento: string): string | undefined {
  if (!c) return undefined;
  if (c === "texto") return "var(--foreground)";
  if (c === "texto2") return "var(--texto-secundario)";
  if (c === "borde") return "var(--border)";
  if (c === "acento") return acento;
  return c;
}

export default function DibujoWeb({ dibujo, acento, className = "w-full max-w-sm", titulo }: { dibujo: Dibujo; acento: string; className?: string; titulo?: string }) {
  const p = (c?: ColorDibujo) => pintar(c, acento);
  return (
    <svg viewBox={`0 0 ${dibujo.ancho} ${dibujo.alto}`} className={className} role="img" aria-label={titulo}>
      {dibujo.prims.map((x, i) => {
        switch (x.t) {
          case "elipse":
            return (
              <ellipse
                key={i}
                cx={x.cx}
                cy={x.cy}
                rx={x.rx}
                ry={x.ry}
                transform={x.rot ? `rotate(${x.rot} ${x.cx} ${x.cy})` : undefined}
                fill={p(x.fill) ?? "none"}
                stroke={p(x.stroke)}
                strokeWidth={x.sw}
                opacity={x.op}
                strokeDasharray={x.dash}
              />
            );
          case "circulo":
            return <circle key={i} cx={x.cx} cy={x.cy} r={x.r} fill={p(x.fill) ?? "none"} stroke={p(x.stroke)} strokeWidth={x.sw} opacity={x.op} />;
          case "camino":
            return <path key={i} d={x.d} fill={p(x.fill) ?? "none"} stroke={p(x.stroke)} strokeWidth={x.sw} opacity={x.op} strokeDasharray={x.dash} strokeLinecap="round" strokeLinejoin="round" />;
          case "linea":
            return <line key={i} x1={x.x1} y1={x.y1} x2={x.x2} y2={x.y2} stroke={p(x.stroke)} strokeWidth={x.sw ?? 1} opacity={x.op} strokeDasharray={x.dash} strokeLinecap="round" />;
          case "rect":
            return <rect key={i} x={x.x} y={x.y} width={x.w} height={x.h} rx={x.r} fill={p(x.fill) ?? "none"} stroke={p(x.stroke)} strokeWidth={x.sw} opacity={x.op} />;
          case "texto":
            return (
              <text key={i} x={x.x} y={x.y} fontSize={x.size} fill={p(x.fill)} textAnchor={x.anchor ?? "start"} fontWeight={x.bold ? 700 : 500}>
                {x.s}
              </text>
            );
        }
      })}
    </svg>
  );
}
