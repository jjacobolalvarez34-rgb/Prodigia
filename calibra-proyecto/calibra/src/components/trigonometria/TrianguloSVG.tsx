import type { TrianguloDiagrama } from "@/lib/practica/trigonometria";

interface Props {
  triangulo: TrianguloDiagrama;
  colorHex: string;
}

interface Punto {
  x: number;
  y: number;
}

const ANCHO = 280;
const ALTO = 210;
const PADDING = 40;

// Ubica los 3 vértices a partir de los 3 lados + ángulo A (ley de
// cosenos invertida): A en el origen, B sobre el eje horizontal a
// distancia ladoC (el lado A-B), C a distancia ladoB de A en el
// ángulo A. Geométricamente siempre correcto para cualquier triángulo
// válido — no hace falta resolver nada más, ya viene resuelto desde el
// generador (trigonometria.ts siempre manda los 3 lados y los 3
// ángulos reales, nunca solo los "dados" del enunciado).
function calcularVertices(t: TrianguloDiagrama): { A: Punto; B: Punto; C: Punto } {
  const anguloARad = (t.anguloA * Math.PI) / 180;
  const A: Punto = { x: 0, y: 0 };
  const B: Punto = { x: t.ladoC, y: 0 };
  const C: Punto = { x: t.ladoB * Math.cos(anguloARad), y: t.ladoB * Math.sin(anguloARad) };
  return { A, B, C };
}

function centroide(a: Punto, b: Punto, c: Punto): Punto {
  return { x: (a.x + b.x + c.x) / 3, y: (a.y + b.y + c.y) / 3 };
}

function alejarDe(p: Punto, centro: Punto, distancia: number): Punto {
  const dx = p.x - centro.x;
  const dy = p.y - centro.y;
  const largo = Math.hypot(dx, dy) || 1;
  return { x: p.x + (dx / largo) * distancia, y: p.y + (dy / largo) * distancia };
}

// Triángulo con lados/ángulos reales para Trigonometría (razones básicas
// y leyes de seno/coseno) — mismo espíritu que Pentagrama.tsx de
// Melodía: un diagrama propio del mundo, no un chart genérico. La
// incógnita (`ocultar`, si aplica) se dibuja como "?" en vez del
// número real, así el triángulo se ve geométricamente correcto sin
// filtrar la respuesta.
export default function TrianguloSVG({ triangulo, colorHex }: Props) {
  const { A, B, C } = calcularVertices(triangulo);
  const xs = [A.x, B.x, C.x];
  const ys = [A.y, B.y, C.y];
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const anchoReal = maxX - minX || 1;
  const altoReal = maxY - minY || 1;
  const disponibleX = ANCHO - PADDING * 2;
  const disponibleY = ALTO - PADDING * 2;
  const escala = Math.min(disponibleX / anchoReal, disponibleY / altoReal);

  function aSvg(p: Punto): Punto {
    return {
      x: PADDING + (p.x - minX) * escala,
      y: ALTO - PADDING - (p.y - minY) * escala,
    };
  }

  const pA = aSvg(A);
  const pB = aSvg(B);
  const pC = aSvg(C);
  const centro = centroide(pA, pB, pC);

  const etiquetaLadoA = triangulo.ocultar === "ladoA" ? "?" : String(triangulo.ladoA);
  const etiquetaLadoB = triangulo.ocultar === "ladoB" ? "?" : String(triangulo.ladoB);
  const etiquetaLadoC = triangulo.ocultar === "ladoC" ? "?" : String(triangulo.ladoC);

  const medioA = { x: (pB.x + pC.x) / 2, y: (pB.y + pC.y) / 2 };
  const medioB = { x: (pA.x + pC.x) / 2, y: (pA.y + pC.y) / 2 };
  const medioC = { x: (pA.x + pB.x) / 2, y: (pA.y + pB.y) / 2 };
  const labelLadoA = alejarDe(medioA, centro, 16);
  const labelLadoB = alejarDe(medioB, centro, 16);
  const labelLadoC = alejarDe(medioC, centro, 16);

  const labelAnguloA = alejarDe(pA, centro, -18);
  const labelAnguloB = alejarDe(pB, centro, -18);
  const labelAnguloC = alejarDe(pC, centro, -18);

  return (
    <svg width={ANCHO} height={ALTO} viewBox={`0 0 ${ANCHO} ${ALTO}`} className="mx-auto">
      <polygon
        points={`${pA.x},${pA.y} ${pB.x},${pB.y} ${pC.x},${pC.y}`}
        fill={`color-mix(in oklab, ${colorHex} 10%, transparent)`}
        stroke={colorHex}
        strokeWidth={2.5}
        strokeLinejoin="round"
      />

      {triangulo.marcarRectoEn && (
        <RectoMarker vertice={triangulo.marcarRectoEn} pA={pA} pB={pB} pC={pC} colorHex={colorHex} />
      )}

      <text x={labelLadoA.x} y={labelLadoA.y} textAnchor="middle" dominantBaseline="middle" className="fill-foreground font-mono text-[13px] font-bold">
        {etiquetaLadoA}
      </text>
      <text x={labelLadoB.x} y={labelLadoB.y} textAnchor="middle" dominantBaseline="middle" className="fill-foreground font-mono text-[13px] font-bold">
        {etiquetaLadoB}
      </text>
      <text x={labelLadoC.x} y={labelLadoC.y} textAnchor="middle" dominantBaseline="middle" className="fill-foreground font-mono text-[13px] font-bold">
        {etiquetaLadoC}
      </text>

      <text x={labelAnguloA.x} y={labelAnguloA.y} textAnchor="middle" dominantBaseline="middle" className="text-[11px] font-semibold" fill={colorHex}>
        A ({triangulo.anguloA}°)
      </text>
      <text x={labelAnguloB.x} y={labelAnguloB.y} textAnchor="middle" dominantBaseline="middle" className="text-[11px] font-semibold" fill={colorHex}>
        B ({triangulo.anguloB}°)
      </text>
      <text x={labelAnguloC.x} y={labelAnguloC.y} textAnchor="middle" dominantBaseline="middle" className="text-[11px] font-semibold" fill={colorHex}>
        C ({triangulo.anguloC}°)
      </text>
    </svg>
  );
}

function RectoMarker({
  vertice,
  pA,
  pB,
  pC,
  colorHex,
}: {
  vertice: "A" | "B" | "C";
  pA: Punto;
  pB: Punto;
  pC: Punto;
  colorHex: string;
}) {
  const mapa = { A: pA, B: pB, C: pC };
  const v = mapa[vertice];
  const otros = (["A", "B", "C"] as const).filter((k) => k !== vertice).map((k) => mapa[k]);
  const tam = 14;
  // Dos vectores unitarios desde el vértice recto hacia los otros dos
  // vértices — el marcador ("cuadradito") de ángulo recto se arma
  // desplazándose esa misma distancia por cada uno, en vez de asumir
  // que el triángulo está alineado a los ejes.
  function unitario(desde: Punto, hacia: Punto) {
    const dx = hacia.x - desde.x;
    const dy = hacia.y - desde.y;
    const largo = Math.hypot(dx, dy) || 1;
    return { x: dx / largo, y: dy / largo };
  }
  const u1 = unitario(v, otros[0]);
  const u2 = unitario(v, otros[1]);
  const p1 = { x: v.x + u1.x * tam, y: v.y + u1.y * tam };
  const p2 = { x: v.x + u1.x * tam + u2.x * tam, y: v.y + u1.y * tam + u2.y * tam };
  const p3 = { x: v.x + u2.x * tam, y: v.y + u2.y * tam };

  return (
    <polyline
      points={`${p1.x},${p1.y} ${p2.x},${p2.y} ${p3.x},${p3.y}`}
      fill="none"
      stroke={colorHex}
      strokeWidth={1.5}
    />
  );
}
