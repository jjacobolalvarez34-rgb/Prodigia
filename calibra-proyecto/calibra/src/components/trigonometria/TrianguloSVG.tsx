import type { TrianguloDiagrama } from "@/lib/practica/trigonometria";
import { arcoEnVertice } from "@/lib/trigonometria/visualesLey";

type ClaveLado = "ladoA" | "ladoB" | "ladoC";

interface Props {
  triangulo: TrianguloDiagrama;
  colorHex: string;
  // Opcionales (los usan los visuales de Aprender; la práctica no los pasa):
  // color de cada lado a resaltar (el resto se dibuja con `colorHex`).
  resaltar?: Partial<Record<ClaveLado, string>>;
  // Palabra corta encima del número de cada lado ("opuesto", "hipotenusa"...).
  nombres?: Partial<Record<ClaveLado, string>>;
  // Marca con un arco el ángulo de este vértice.
  marcarAngulo?: "A" | "B" | "C";
  // Vértices cuyo ángulo es la incógnita: se dibuja "A (?)".
  angulosIncognita?: ("A" | "B" | "C")[];
  // Descripción para lectores de pantalla (si falta, se arma con los datos visibles).
  descripcion?: string;
}

interface Punto {
  x: number;
  y: number;
}

const ANCHO = 300;
const ALTO = 220;
const PADDING_X = 46;
// Con nombres de lado («hipotenusa», «adyacente») las etiquetas son más anchas: más margen a los costados.
const PADDING_X_CON_NOMBRES = 60;
const PADDING_Y = 40;

const r2 = (n: number): number => Math.round(n * 100) / 100;

// Ángulo A (grados) a partir de los TRES lados, con la ley del coseno: el
// dibujo sale de los lados reales, nunca de un ángulo redondeado.
function anguloDesdeLados(opuesto: number, l1: number, l2: number): number {
  const c = (l1 * l1 + l2 * l2 - opuesto * opuesto) / (2 * l1 * l2);
  return (Math.acos(Math.max(-1, Math.min(1, c))) * 180) / Math.PI;
}

// Ubica los 3 vértices. Si hay un ángulo recto en C, se dibuja con los catetos
// horizontal (b, de A a C) y vertical (a, de C a B), que es la figura de los
// libros; en cualquier otro caso, A en el origen, B sobre el eje horizontal a
// distancia c y C según el ángulo A (ley del coseno, sin usar los ángulos
// guardados). Las coordenadas se redondean a 2 decimales porque Math.sin/cos
// difieren en el último bit entre Node y el navegador (mismatch de hidratación).
export function calcularVertices(t: TrianguloDiagrama): { A: Punto; B: Punto; C: Punto } {
  if (t.marcarRectoEn === "C") {
    return { A: { x: 0, y: 0 }, B: { x: r2(t.ladoB), y: r2(t.ladoA) }, C: { x: r2(t.ladoB), y: 0 } };
  }
  const A = anguloDesdeLados(t.ladoA, t.ladoB, t.ladoC);
  const a = (A * Math.PI) / 180;
  return { A: { x: 0, y: 0 }, B: { x: r2(t.ladoC), y: 0 }, C: { x: r2(t.ladoB * Math.cos(a)), y: r2(t.ladoB * Math.sin(a)) } };
}

function centroide(a: Punto, b: Punto, c: Punto): Punto {
  return { x: (a.x + b.x + c.x) / 3, y: (a.y + b.y + c.y) / 3 };
}

function alejarDe(p: Punto, centro: Punto, distancia: number): Punto {
  const dx = p.x - centro.x;
  const dy = p.y - centro.y;
  const largo = Math.hypot(dx, dy) || 1;
  return { x: r2(p.x + (dx / largo) * distancia), y: r2(p.y + (dy / largo) * distancia) };
}

// 12,5 · 8 · 7,07 (coma decimal, sin ceros de más).
export function formatoLado(n: number): string {
  return String(Math.round(n * 100) / 100).replace(".", ",");
}

// 30° · 36,9° (entero si lo es).
export function formatoAngulo(g: number): string {
  const r = Math.round(g * 10) / 10;
  return `${String(r).replace(".", ",")}°`;
}

// Texto para lectores de pantalla: qué se ve en el dibujo (solo los datos visibles).
export function descripcionTriangulo(t: TrianguloDiagrama): string {
  const ocultos = new Set([...(t.ocultarLados ?? []), ...(t.ocultar ? [t.ocultar] : [])]);
  const omitidos = new Set(t.omitirLados ?? []);
  const angulosOcultos = new Set(t.ocultarAngulos ?? []);
  const lados = ([["a", "ladoA"], ["b", "ladoB"], ["c", "ladoC"]] as const)
    .filter(([, k]) => !omitidos.has(k))
    .map(([n, k]) => (ocultos.has(k) ? `lado ${n} desconocido` : `lado ${n} = ${formatoLado(t[k])}`));
  const angulos = ([["A", "anguloA"], ["B", "anguloB"], ["C", "anguloC"]] as const)
    .filter(([n]) => !angulosOcultos.has(n) && n !== t.marcarRectoEn)
    .map(([n, k]) => `ángulo ${n} = ${formatoAngulo(t[k])}`);
  const recto = t.marcarRectoEn ? `Triángulo rectángulo con el ángulo recto en ${t.marcarRectoEn}. ` : "Triángulo. ";
  return `${recto}${[...lados, ...angulos].join(", ")}.`;
}

// Triángulo con lados/ángulos reales para Trigonometría (razones y leyes de
// seno/coseno): un diagrama propio del mundo, no un chart genérico. Solo se
// muestran los datos del enunciado: la incógnita (`ocultarLados`) se dibuja
// como "?", los lados que no se dan (`omitirLados`) quedan sin etiqueta y los
// ángulos ocultos (`ocultarAngulos`) muestran solo la letra del vértice, así el
// dibujo es geométricamente correcto sin filtrar la respuesta.
export default function TrianguloSVG({ triangulo, colorHex, resaltar, nombres, marcarAngulo, angulosIncognita, descripcion }: Props) {
  const { A, B, C } = calcularVertices(triangulo);
  const xs = [A.x, B.x, C.x];
  const ys = [A.y, B.y, C.y];
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const anchoReal = maxX - minX || 1;
  const altoReal = maxY - minY || 1;
  const padX = nombres ? PADDING_X_CON_NOMBRES : PADDING_X;
  const escala = Math.min((ANCHO - padX * 2) / anchoReal, (ALTO - PADDING_Y * 2) / altoReal);
  // Centrado en el área disponible.
  const offsetX = (ANCHO - anchoReal * escala) / 2;
  const offsetY = (ALTO - altoReal * escala) / 2;

  function aSvg(p: Punto): Punto {
    return { x: r2(offsetX + (p.x - minX) * escala), y: r2(ALTO - offsetY - (p.y - minY) * escala) };
  }

  const pA = aSvg(A);
  const pB = aSvg(B);
  const pC = aSvg(C);
  const centro = centroide(pA, pB, pC);

  const ocultos = new Set([...(triangulo.ocultarLados ?? []), ...(triangulo.ocultar ? [triangulo.ocultar] : [])]);
  const omitidos = new Set(triangulo.omitirLados ?? []);
  const angulosOcultos = new Set(triangulo.ocultarAngulos ?? []);
  const incognita = new Set(angulosIncognita ?? []);

  const etiquetaLado = (k: ClaveLado): string | null => (omitidos.has(k) ? null : ocultos.has(k) ? "?" : formatoLado(triangulo[k]));
  const medio = (p: Punto, q: Punto): Punto => ({ x: (p.x + q.x) / 2, y: (p.y + q.y) / 2 });
  const lados: { k: ClaveLado; desde: Punto; hasta: Punto; pos: Punto }[] = [
    { k: "ladoA", desde: pB, hasta: pC, pos: alejarDe(medio(pB, pC), centro, nombres?.ladoA ? 20 : 15) },
    { k: "ladoB", desde: pA, hasta: pC, pos: alejarDe(medio(pA, pC), centro, nombres?.ladoB ? 20 : 15) },
    { k: "ladoC", desde: pA, hasta: pB, pos: alejarDe(medio(pA, pB), centro, nombres?.ladoC ? 20 : 15) },
  ];

  const vertices: { n: "A" | "B" | "C"; p: Punto; angulo: number }[] = [
    { n: "A", p: pA, angulo: triangulo.anguloA },
    { n: "B", p: pB, angulo: triangulo.anguloB },
    { n: "C", p: pC, angulo: triangulo.anguloC },
  ];
  const conResaltado = resaltar !== undefined;

  return (
    <svg viewBox={`0 0 ${ANCHO} ${ALTO}`} role="img" aria-label={descripcion ?? descripcionTriangulo(triangulo)} className="mx-auto h-auto w-full max-w-[300px]">
      <polygon
        points={`${pA.x},${pA.y} ${pB.x},${pB.y} ${pC.x},${pC.y}`}
        fill={`color-mix(in oklab, ${colorHex} 10%, transparent)`}
        stroke={conResaltado ? "none" : colorHex}
        strokeWidth={2.5}
        strokeLinejoin="round"
      />

      {conResaltado &&
        lados.map(({ k, desde, hasta }) => (
          <line
            key={k}
            x1={desde.x}
            y1={desde.y}
            x2={hasta.x}
            y2={hasta.y}
            stroke={resaltar?.[k] ?? colorHex}
            strokeWidth={resaltar?.[k] ? 5 : 2.5}
            strokeLinecap="round"
            opacity={resaltar?.[k] ? 1 : 0.55}
            style={{ transition: "stroke 300ms, stroke-width 300ms, opacity 300ms" }}
          />
        ))}

      {marcarAngulo && (
        <path
          d={
            marcarAngulo === "A"
              ? arcoEnVertice(pA, pB, pC, 26)
              : marcarAngulo === "B"
                ? arcoEnVertice(pB, pA, pC, 26)
                : arcoEnVertice(pC, pA, pB, 26)
          }
          fill="none"
          stroke="var(--foreground)"
          strokeWidth={2}
        />
      )}

      {triangulo.marcarRectoEn && <RectoMarker vertice={triangulo.marcarRectoEn} pA={pA} pB={pB} pC={pC} colorHex={colorHex} />}

      {lados.map(({ k, pos }) => {
        const texto = etiquetaLado(k);
        if (texto === null) return null;
        const nombre = nombres?.[k];
        const color = resaltar?.[k];
        return (
          <text key={k} x={pos.x} y={pos.y} textAnchor="middle" dominantBaseline="middle" className="fill-foreground font-mono text-[13px] font-bold" style={color ? { fill: color } : undefined}>
            {nombre ? (
              <>
                <tspan x={pos.x} dy="-0.55em" className="font-sans text-[10px] font-semibold">
                  {nombre}
                </tspan>
                <tspan x={pos.x} dy="1.25em">
                  {texto}
                </tspan>
              </>
            ) : (
              texto
            )}
          </text>
        );
      })}

      {vertices.map(({ n, p, angulo }) => {
        const pos = alejarDe(p, centro, 20);
        const conValor = !angulosOcultos.has(n) && n !== triangulo.marcarRectoEn;
        const texto = incognita.has(n) ? `${n} (?)` : conValor ? `${n} (${formatoAngulo(angulo)})` : n;
        return (
          <text key={n} x={pos.x} y={pos.y} textAnchor="middle" dominantBaseline="middle" className="text-[11px] font-semibold" fill={colorHex}>
            {texto}
          </text>
        );
      })}
    </svg>
  );
}

function RectoMarker({ vertice, pA, pB, pC, colorHex }: { vertice: "A" | "B" | "C"; pA: Punto; pB: Punto; pC: Punto; colorHex: string }) {
  const mapa = { A: pA, B: pB, C: pC };
  const v = mapa[vertice];
  const otros = (["A", "B", "C"] as const).filter((k) => k !== vertice).map((k) => mapa[k]);
  const tam = 14;
  // Dos vectores unitarios desde el vértice recto hacia los otros dos
  // vértices: el "cuadradito" del ángulo recto se arma desplazándose esa
  // misma distancia por cada uno.
  function unitario(desde: Punto, hacia: Punto) {
    const dx = hacia.x - desde.x;
    const dy = hacia.y - desde.y;
    const largo = Math.hypot(dx, dy) || 1;
    return { x: dx / largo, y: dy / largo };
  }
  const u1 = unitario(v, otros[0]);
  const u2 = unitario(v, otros[1]);
  const p1 = { x: r2(v.x + u1.x * tam), y: r2(v.y + u1.y * tam) };
  const p2 = { x: r2(v.x + u1.x * tam + u2.x * tam), y: r2(v.y + u1.y * tam + u2.y * tam) };
  const p3 = { x: r2(v.x + u2.x * tam), y: r2(v.y + u2.y * tam) };

  return <polyline points={`${p1.x},${p1.y} ${p2.x},${p2.y} ${p3.x},${p3.y}`} fill="none" stroke={colorHex} strokeWidth={1.5} />;
}
