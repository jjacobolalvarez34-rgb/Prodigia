import { aRad, areaSAS, oblicuoAAS, oblicuoSAS, redondear, solucionesSSA, type Oblicuo } from "./triangulos";
import { dec, decTex, r2, type Decimal } from "./formato";
import type { VisualTrigonometriaLey } from "./visuales";

// Datos del visual "trigonometria.ley": un triángulo oblicuo dibujado con sus
// lados y ángulos REALES (calculados con triangulos.ts), con las partes que
// usa cada ley (seno: parejas ángulo-lado opuesto; coseno: dos lados y el
// ángulo entre ellos; área: la altura; ambiguo: la circunferencia de radio a
// que corta la base en 0, 1 o 2 puntos). Todo en px del viewBox y redondeado
// a 2 decimales (hidratación estable entre Node y el navegador).

export const VISTA_LEY = { ancho: 320, alto: 230, margen: 44 } as const;

export interface PuntoPx {
  x: number;
  y: number;
}

export interface TrianguloLey {
  A: PuntoPx;
  B: PuntoPx;
  C: PuntoPx;
  t: Oblicuo;
  // Arcos de los tres ángulos (radio 20 px), como `d` de <path>.
  arcos: { A: string; B: string; C: string };
}

export interface DatosLey {
  ley: VisualTrigonometriaLey["ley"];
  triangulo: TrianguloLey;
  // Segundo triángulo del caso ambiguo (mismo A y C, otro B).
  segundo: TrianguloLey | null;
  // Altura (área y ambiguo): de un vértice a su pie sobre la recta de la base, en px, y su longitud real.
  altura: { desde: PuntoPx; hasta: PuntoPx; valor: number } | null;
  // Caso ambiguo: arco de la circunferencia de radio a con centro en C.
  arcoCircunferencia: string | null;
  cantidad: number;
  pasos: { clave: string; formulas: string[] }[];
  resultado: number | null;
  textoPlano: string;
}

interface Punto {
  x: number;
  y: number;
}

// Convierte puntos en coordenadas de dibujo (y hacia arriba) a px del viewBox, centrados y a escala.
function encajar(puntos: Punto[]): { px: (p: Punto) => PuntoPx; escala: number } {
  const { ancho, alto, margen } = VISTA_LEY;
  const minX = Math.min(...puntos.map((p) => p.x));
  const maxX = Math.max(...puntos.map((p) => p.x));
  const minY = Math.min(...puntos.map((p) => p.y));
  const maxY = Math.max(...puntos.map((p) => p.y));
  const escala = Math.min((ancho - 2 * margen) / (maxX - minX || 1), (alto - 2 * margen) / (maxY - minY || 1));
  const offX = (ancho - (maxX - minX) * escala) / 2;
  const offY = (alto - (maxY - minY) * escala) / 2;
  return { px: (p) => ({ x: r2(offX + (p.x - minX) * escala), y: r2(alto - offY - (p.y - minY) * escala) }), escala };
}

// Arco de radio r px alrededor de `c` (px), antihorario en pantalla, desde el ángulo `desde` hasta `hasta` (grados, con y hacia arriba).
function arcoAlrededor(c: PuntoPx, r: number, desde: number, hasta: number): string {
  const p = (g: number) => `${r2(c.x + r * Math.cos(aRad(g)))} ${r2(c.y - r * Math.sin(aRad(g)))}`;
  const grande = hasta - desde > 180 ? 1 : 0;
  return `M ${p(desde)} A ${r2(r)} ${r2(r)} 0 ${grande} 0 ${p(hasta)}`;
}

// Arco del ángulo en el vértice P entre las direcciones hacia Q y hacia R (puntos en px).
export function arcoEnVertice(P: PuntoPx, Q: PuntoPx, R: PuntoPx, r = 20): string {
  const ang = (T: PuntoPx) => (Math.atan2(-(T.y - P.y), T.x - P.x) * 180) / Math.PI;
  let a1 = ang(Q);
  let a2 = ang(R);
  if (a1 > a2) [a1, a2] = [a2, a1];
  if (a2 - a1 > 180) return arcoAlrededor(P, r, a2, a1 + 360);
  return arcoAlrededor(P, r, a1, a2);
}

function trianguloDe(t: Oblicuo, A: PuntoPx, B: PuntoPx, C: PuntoPx): TrianguloLey {
  return { A, B, C, t, arcos: { A: arcoEnVertice(A, B, C), B: arcoEnVertice(B, A, C), C: arcoEnVertice(C, A, B) } };
}

// A en el origen, B sobre el eje horizontal a distancia c, C a distancia b con el ángulo A.
function puntosDe(t: Oblicuo): { A: Punto; B: Punto; C: Punto } {
  return { A: { x: 0, y: 0 }, B: { x: t.c, y: 0 }, C: { x: t.b * Math.cos(aRad(t.A)), y: t.b * Math.sin(aRad(t.A)) } };
}

function pedido(x: number | undefined, nombre: string): number {
  if (x === undefined || !(x > 0)) throw new Error(`Falta el dato ${nombre}`);
  return x;
}

export function datosLey(v: Pick<VisualTrigonometriaLey, "ley" | "datos">, sep: Decimal = ","): DatosLey {
  const d = (x: number, n = 2) => decTex(x, n, sep);
  const { a, b, A, B, C } = v.datos;

  if (v.ley === "seno") {
    const t = oblicuoAAS(pedido(A, "A"), pedido(B, "B"), pedido(a, "a"));
    const p = puntosDe(t);
    const { px } = encajar([p.A, p.B, p.C]);
    const k = t.a / Math.sin(aRad(t.A));
    return {
      ley: "seno",
      triangulo: trianguloDe(t, px(p.A), px(p.B), px(p.C)),
      segundo: null,
      altura: null,
      arcoCircunferencia: null,
      cantidad: 1,
      resultado: redondear(t.b, 2),
      pasos: [
        { clave: "datos", formulas: [`A=${t.A}^{\\circ},\\ B=${t.B}^{\\circ},\\ a=${d(t.a)}`] },
        { clave: "parejaA", formulas: [`\\dfrac{a}{\\operatorname{sen}(A)}=\\dfrac{${d(t.a)}}{\\operatorname{sen}(${t.A}^{\\circ})}\\approx ${d(k, 3)}`] },
        { clave: "parejaB", formulas: [`\\dfrac{b}{\\operatorname{sen}(B)}=\\dfrac{b}{\\operatorname{sen}(${t.B}^{\\circ})}`] },
        { clave: "igualar", formulas: [`\\dfrac{a}{\\operatorname{sen}(A)}=\\dfrac{b}{\\operatorname{sen}(B)}`] },
        { clave: "resultado", formulas: [`b=${d(t.a)}\\cdot\\dfrac{\\operatorname{sen}(${t.B}^{\\circ})}{\\operatorname{sen}(${t.A}^{\\circ})}\\approx ${d(t.b)}`] },
      ],
      textoPlano: `Triángulo con A = ${t.A}°, B = ${t.B}° y C = ${t.C}°; el lado a = ${dec(t.a, 2, sep)} es opuesto a A. Ley del seno: a/sen A = b/sen B, de donde b ≈ ${dec(t.b, 2, sep)}.`,
    };
  }

  if (v.ley === "coseno" || v.ley === "area") {
    const CC = pedido(C, "C");
    if (!(CC < 180)) throw new Error("C debe ser menor que 180°");
    const t = oblicuoSAS(pedido(a, "a"), pedido(b, "b"), CC);
    const p = puntosDe(t);
    // Altura desde B sobre la recta AC: el pie es la proyección de B sobre la dirección de AC.
    const u = { x: Math.cos(aRad(t.A)), y: Math.sin(aRad(t.A)) };
    const pie = { x: t.c * u.x * u.x, y: t.c * u.x * u.y };
    const h = t.a * Math.sin(aRad(t.C));
    const { px } = encajar(v.ley === "area" ? [p.A, p.B, p.C, pie] : [p.A, p.B, p.C]);
    const tri = trianguloDe(t, px(p.A), px(p.B), px(p.C));
    if (v.ley === "coseno") {
      return {
        ley: "coseno",
        triangulo: tri,
        segundo: null,
        altura: null,
        arcoCircunferencia: null,
        cantidad: 1,
        resultado: redondear(t.c, 2),
        pasos: [
          { clave: "datos", formulas: [`a=${d(t.a)},\\ b=${d(t.b)},\\ C=${t.C}^{\\circ}`] },
          { clave: "formula", formulas: ["c^{2}=a^{2}+b^{2}-2ab\\cos(C)"] },
          { clave: "sustituir", formulas: [`c^{2}=${d(t.a)}^{2}+${d(t.b)}^{2}-2\\cdot ${d(t.a)}\\cdot ${d(t.b)}\\cdot\\cos(${t.C}^{\\circ})`] },
          { clave: "calcular", formulas: [`c^{2}\\approx ${d(t.c * t.c)}`] },
          { clave: "resultado", formulas: [`c\\approx ${d(t.c)}`] },
        ],
        textoPlano: `Triángulo con los lados a = ${dec(t.a, 2, sep)} y b = ${dec(t.b, 2, sep)} y el ángulo C = ${t.C}° entre ellos. Ley del coseno: c² = a² + b² − 2ab·cos C, de donde c ≈ ${dec(t.c, 2, sep)}.`,
      };
    }
    const area = areaSAS(t.a, t.b, t.C);
    return {
      ley: "area",
      triangulo: tri,
      segundo: null,
      altura: { desde: tri.B, hasta: px(pie), valor: h },
      arcoCircunferencia: null,
      cantidad: 1,
      resultado: redondear(area, 2),
      pasos: [
        { clave: "datos", formulas: [`a=${d(t.a)},\\ b=${d(t.b)},\\ C=${t.C}^{\\circ}`] },
        { clave: "altura", formulas: [`h=a\\operatorname{sen}(C)=${d(t.a)}\\cdot\\operatorname{sen}(${t.C}^{\\circ})\\approx ${d(h)}`] },
        { clave: "formula", formulas: ["\\text{Área}=\\dfrac{1}{2}\\,b\\,h=\\dfrac{1}{2}\\,a\\,b\\operatorname{sen}(C)"] },
        { clave: "resultado", formulas: [`\\text{Área}=\\dfrac{1}{2}\\cdot ${d(t.a)}\\cdot ${d(t.b)}\\cdot\\operatorname{sen}(${t.C}^{\\circ})\\approx ${d(area)}`] },
      ],
      textoPlano: `Triángulo con los lados a = ${dec(t.a, 2, sep)} y b = ${dec(t.b, 2, sep)} y el ángulo C = ${t.C}° entre ellos. La altura sobre el lado b es h = a·sen C ≈ ${dec(h, 2, sep)}, y el área es ½·a·b·sen C ≈ ${dec(area, 2, sep)}.`,
    };
  }

  // ---- ambiguo (SSA): a, b y A ----
  const aa = pedido(a, "a");
  const bb = pedido(b, "b");
  const AA = pedido(A, "A");
  const soluciones = solucionesSSA(aa, bb, AA);
  const h = bb * Math.sin(aRad(AA));
  const origen = { x: 0, y: 0 };
  const cima = { x: bb * Math.cos(aRad(AA)), y: bb * Math.sin(aRad(AA)) };
  const pie = { x: cima.x, y: 0 };
  // B_i está sobre el eje horizontal a distancia c_i de A.
  const bs = soluciones.map((s) => ({ x: s.c, y: 0 }));
  // Puntos que deben entrar en el dibujo: además, un margen a la derecha si no hay solución (el arco no llega a la base).
  const visibles = [origen, cima, pie, ...bs, ...(bs.length === 0 ? [{ x: cima.x + aa, y: 0 }] : [])];
  const { px, escala } = encajar(visibles);
  const pA = px(origen);
  const pC = px(cima);
  const pH = px(pie);
  const pBs = bs.map(px);
  const triAmb = (i: number): TrianguloLey => trianguloDe(soluciones[i], pA, pBs[i], pC);
  // Arco de la circunferencia de radio a (centro C): entre los cortes (o alrededor del punto más bajo si no corta).
  // Ángulo (grados, con y hacia arriba, como espera arcoAlrededor) del vector C -> p, en coordenadas de dibujo.
  const anguloDesdeC = (p: Punto): number => (Math.atan2(p.y - cima.y, p.x - cima.x) * 180) / Math.PI;
  let arcoCircunferencia: string;
  if (bs.length === 0) arcoCircunferencia = arcoAlrededor(pC, r2(aa * escala), -90 - 40, -90 + 40);
  else {
    const angs = bs.map(anguloDesdeC).sort((x, y) => x - y);
    arcoCircunferencia = arcoAlrededor(pC, r2(aa * escala), angs[0] - (bs.length === 1 ? 35 : 12), angs[angs.length - 1] + (bs.length === 1 ? 35 : 12));
  }
  const cantidad = soluciones.length;
  const referencia: Oblicuo = soluciones[0] ?? { a: aa, b: bb, c: 0, A: AA, B: 0, C: 0 };
  return {
    ley: "ambiguo",
    triangulo: cantidad > 0 ? triAmb(0) : { A: pA, B: pH, C: pC, t: referencia, arcos: { A: arcoEnVertice(pA, pH, pC), B: "", C: "" } },
    segundo: cantidad === 2 ? triAmb(1) : null,
    altura: { desde: pC, hasta: pH, valor: h },
    arcoCircunferencia,
    cantidad,
    pasos: [
      { clave: "datos", formulas: [`a=${d(aa)},\\ b=${d(bb)},\\ A=${AA}^{\\circ}`] },
      { clave: "altura", formulas: [`h=b\\operatorname{sen}(A)=${d(bb)}\\cdot\\operatorname{sen}(${AA}^{\\circ})\\approx ${d(h)}`] },
      { clave: "comparar", formulas: [`a=${d(aa)},\\quad h\\approx ${d(h)},\\quad b=${d(bb)}`] },
      { clave: "conclusion", formulas: [String(cantidad)] },
    ],
    resultado: null,
    textoPlano: `Caso ambiguo SSA con a = ${dec(aa, 2, sep)}, b = ${dec(bb, 2, sep)} y A = ${AA}°. La altura es h = b·sen A ≈ ${dec(h, 2, sep)}. Hay ${cantidad} triángulo${cantidad === 1 ? "" : "s"}${
      cantidad === 2 ? `: uno con B ≈ ${dec(soluciones[0].B, 1, sep)}° y otro con B ≈ ${dec(soluciones[1].B, 1, sep)}°` : ""
    }.`,
  };
}
