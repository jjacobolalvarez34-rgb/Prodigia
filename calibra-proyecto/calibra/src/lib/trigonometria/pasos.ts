import type { ProblemaTrigonometria, TrianguloDiagrama } from "@/lib/practica/trigonometriaTipos";

// «Cómo se resuelve» de cada pregunta de Trigonometría (pedido 2026-10-18). Se arma
// por tipo de pregunta: en los triángulos (razones y leyes) con la cuenta concreta,
// usando el triángulo completo que ya trae la pregunta para el dibujo; en círculo
// unitario e identidades, con la regla que se usa y la respuesta. Lleva $…$ como el
// enunciado (el repaso lo dibuja con MathText / TextoMate).

const m = (x: string) => `$${x}$`;
const n = (x: number, d = 2) => String(Math.round(x * 10 ** d) / 10 ** d);
const rad = (g: number) => (g * Math.PI) / 180;
const OP: Record<string, string> = { sen: "\\operatorname{sen}", cos: "\\cos", tan: "\\tan", cosec: "\\operatorname{cosec}", sec: "\\sec", cot: "\\cot" };
const respuestaTex = (p: ProblemaTrigonometria) => (p.entrada === "numero" ? m(n(p.respuesta, 2)) : p.respuesta);

type Lado = "a" | "b" | "c";
const CLAVE: Record<Lado, "ladoA" | "ladoB" | "ladoC"> = { a: "ladoA", b: "ladoB", c: "ladoC" };
const valor = (t: TrianguloDiagrama, l: Lado) => t[CLAVE[l]];
const angulo = (t: TrianguloDiagrama, v: "A" | "B" | "C") => (v === "A" ? t.anguloA : v === "B" ? t.anguloB : t.anguloC);
const oculto = (t: TrianguloDiagrama, l: Lado) => (t.ocultarLados ?? []).includes(CLAVE[l]) || t.ocultar === CLAVE[l];
const omitido = (t: TrianguloDiagrama, l: Lado) => (t.omitirLados ?? []).includes(CLAVE[l]);
const dado = (t: TrianguloDiagrama, l: Lado) => !oculto(t, l) && !omitido(t, l);

// Función y vértice que pide el enunciado: «¿Cuánto vale sen(A)?».
function funcionPedida(enunciado: string): { fn: string; v: "A" | "B" } | null {
  const re = /¿Cuánto vale \$(\\operatorname\{sen\}|\\cos|\\tan|\\operatorname\{cosec\}|\\sec|\\cot)\((A|B)\)\$/;
  const r = re.exec(enunciado);
  if (!r) return null;
  const fn = Object.entries(OP).find(([, tex]) => tex === r[1])?.[0];
  return fn ? { fn, v: r[2] as "A" | "B" } : null;
}

const SOHCAHTOA = `En un triángulo rectángulo: ${m("\\operatorname{sen} = \\frac{\\text{opuesto}}{\\text{hipotenusa}}")}, ${m("\\cos = \\frac{\\text{adyacente}}{\\text{hipotenusa}}")}, ${m("\\tan = \\frac{\\text{opuesto}}{\\text{adyacente}}")}`;

// ---------- Razones (triángulo rectángulo, recto en C) ----------
function pasosRazonTernas(p: ProblemaTrigonometria): string[] {
  const t = p.triangulo;
  const f = funcionPedida(p.enunciado);
  if (!t || !f) return [SOHCAHTOA, `Respuesta: ${respuestaTex(p)}`];
  const op = f.v === "A" ? "a" : "b";
  const ady = f.v === "A" ? "b" : "a";
  const [num, den] = f.fn === "sen" ? [op, "c"] : f.fn === "cos" ? [ady, "c"] : [op, ady];
  return [
    SOHCAHTOA,
    `Para el ángulo ${m(f.v)}: el opuesto es ${m(op)}, el adyacente es ${m(ady)} y la hipotenusa es ${m("c")}`,
    `${m(`${OP[f.fn]}(${f.v}) = \\frac{${num}}{${den}} = \\frac{${n(valor(t, num as Lado))}}{${n(valor(t, den as Lado))}} \\approx ${n(valor(t, num as Lado) / valor(t, den as Lado))}`)}`,
  ];
}

function pasosReciprocas(p: ProblemaTrigonometria): string[] {
  const f = funcionPedida(p.enunciado);
  const base = f?.fn === "cosec" ? "sen" : f?.fn === "sec" ? "cos" : "tan";
  const pasos = [`Las recíprocas: ${m("\\operatorname{cosec} = \\frac{1}{\\operatorname{sen}}")}, ${m("\\sec = \\frac{1}{\\cos}")}, ${m("\\cot = \\frac{1}{\\tan}")}`];
  if (f && p.triangulo) {
    const t = p.triangulo;
    const op = f.v === "A" ? "a" : "b";
    const ady = f.v === "A" ? "b" : "a";
    const [num, den] = base === "sen" ? ["c", op] : base === "cos" ? ["c", ady] : [ady, op];
    pasos.push(`Dar vuelta la razón: ${m(`${OP[f.fn]}(${f.v}) = \\frac{${num}}{${den}} = \\frac{${n(valor(t, num as Lado))}}{${n(valor(t, den as Lado))}} \\approx ${n(valor(t, num as Lado) / valor(t, den as Lado))}`)}`);
  } else {
    pasos.push(`Calcula primero ${m(`${OP[base]}`)} y después da vuelta la fracción: ${respuestaTex(p)}`);
  }
  return pasos;
}

// Hallar un lado con un ángulo y un lado.
function pasosLado(p: ProblemaTrigonometria): string[] {
  const t = p.triangulo;
  if (!t || p.entrada !== "numero") return [SOHCAHTOA, `Respuesta: ${respuestaTex(p)}`];
  const pedido = (["a", "b", "c"] as Lado[]).find((l) => oculto(t, l));
  const conocido = (["a", "b", "c"] as Lado[]).find((l) => l !== pedido && dado(t, l));
  const v: "A" | "B" = (t.ocultarAngulos ?? []).includes("A") ? "B" : "A";
  if (!pedido || !conocido) return [SOHCAHTOA, `Respuesta: ${respuestaTex(p)}`];
  const rol = (l: Lado) => (l === "c" ? "hipotenusa" : (v === "A" ? l === "a" : l === "b") ? "opuesto" : "adyacente");
  const nombreRol = (r: string) => (r === "hipotenusa" ? "la hipotenusa" : `el cateto ${r}`);
  const g = angulo(t, v);
  const roles = [rol(pedido), rol(conocido)].sort().join("+");
  const fn = roles === "hipotenusa+opuesto" ? "sen" : roles === "adyacente+hipotenusa" ? "cos" : "tan";
  const k = valor(t, conocido);
  const tri = fn === "sen" ? Math.sin(rad(g)) : fn === "cos" ? Math.cos(rad(g)) : Math.tan(rad(g));
  // La incógnita va arriba (multiplicar) o abajo (dividir) de la razón.
  const arriba = (fn === "sen" && rol(pedido) === "opuesto") || (fn === "cos" && rol(pedido) === "adyacente") || (fn === "tan" && rol(pedido) === "opuesto");
  return [
    `Respecto del ángulo ${m(`${v} = ${n(g, 1)}^{\\circ}`)}: ${m(pedido)} es ${nombreRol(rol(pedido))} y ${m(conocido)} es ${nombreRol(rol(conocido))}. Los une ${m(OP[fn])}`,
    arriba
      ? `${m(`${pedido} = ${n(k)}\\cdot ${OP[fn]}(${n(g, 1)}^{\\circ}) = ${n(k)}\\cdot ${n(tri, 4)} \\approx ${n(k * tri)}`)}`
      : `${m(`${pedido} = \\frac{${n(k)}}{${OP[fn]}(${n(g, 1)}^{\\circ})} = \\frac{${n(k)}}{${n(tri, 4)}} \\approx ${n(k / tri)}`)}`,
  ];
}

// Hallar un ángulo con dos lados (razón inversa).
function pasosAnguloInverso(p: ProblemaTrigonometria): string[] {
  const t = p.triangulo;
  const vr = /el ángulo \$(A|B)\$/.exec(p.enunciado);
  if (!t || !vr) return [`Arma la razón con los dos lados que tienes y usa la inversa (${m("\\operatorname{sen}^{-1}")}, ${m("\\cos^{-1}")} o ${m("\\tan^{-1}")}) en modo grados`, `Respuesta: ${respuestaTex(p)}°`];
  const v = vr[1] as "A" | "B";
  const op: Lado = v === "A" ? "a" : "b";
  const ady: Lado = v === "A" ? "b" : "a";
  const [fn, num, den] = dado(t, op) && dado(t, "c") ? (["sen", op, "c"] as const) : dado(t, ady) && dado(t, "c") ? (["cos", ady, "c"] as const) : (["tan", op, ady] as const);
  const r = valor(t, num) / valor(t, den);
  return [
    `Con los lados que tienes, la razón para ${m(v)} es ${m(OP[fn])}: ${m(`${OP[fn]}(${v}) = \\frac{${n(valor(t, num))}}{${n(valor(t, den))}} \\approx ${n(r, 4)}`)}`,
    `Usa la inversa en modo grados: ${m(`${v} = ${OP[fn]}^{-1}(${n(r, 4)}) \\approx ${n(angulo(t, v), 1)}^{\\circ}`)}`,
  ];
}

// ---------- Leyes (triángulo cualquiera) ----------
function pasosSenoLado(p: ProblemaTrigonometria): string[] {
  const t = p.triangulo;
  if (!t) return [`Ley del seno: ${m("\\frac{a}{\\operatorname{sen} A} = \\frac{b}{\\operatorname{sen} B} = \\frac{c}{\\operatorname{sen} C}")}`, `Respuesta: ${respuestaTex(p)}`];
  const pedido = (["a", "b", "c"] as Lado[]).find((l) => oculto(t, l));
  const conocido = (["a", "b", "c"] as Lado[]).find((l) => l !== pedido && dado(t, l));
  if (!pedido || !conocido) return [`Ley del seno: ${m("\\frac{a}{\\operatorname{sen} A} = \\frac{b}{\\operatorname{sen} B}")}`, `Respuesta: ${respuestaTex(p)}`];
  const V = pedido.toUpperCase() as "A" | "B" | "C";
  const K = conocido.toUpperCase() as "A" | "B" | "C";
  const tercero = (["A", "B", "C"] as const).find((x) => x !== V && x !== K)!;
  const pasos = [`Ley del seno: ${m("\\frac{a}{\\operatorname{sen} A} = \\frac{b}{\\operatorname{sen} B} = \\frac{c}{\\operatorname{sen} C}")}`];
  if ((t.ocultarAngulos ?? []).includes(V)) pasos.push(`Los ángulos suman 180°: ${m(`${V} = 180^{\\circ} - ${n(angulo(t, K), 1)}^{\\circ} - ${n(angulo(t, tercero), 1)}^{\\circ} = ${n(angulo(t, V), 1)}^{\\circ}`)}`);
  pasos.push(
    `${m(`${pedido} = \\frac{${n(valor(t, conocido))}\\cdot \\operatorname{sen}(${n(angulo(t, V), 1)}^{\\circ})}{\\operatorname{sen}(${n(angulo(t, K), 1)}^{\\circ})} \\approx ${n((valor(t, conocido) * Math.sin(rad(angulo(t, V)))) / Math.sin(rad(angulo(t, K))))}`)}`
  );
  return pasos;
}

// Tercer lado con dos lados y el ángulo entre ellos (SAS).
function pasosCosenoLado(p: ProblemaTrigonometria): string[] {
  const nums = [...p.enunciado.matchAll(/lados de (\d+(?:\.\d+)?) y (\d+(?:\.\d+)?)/g)][0];
  const ang = /mide \$(\d+(?:\.\d+)?)\^\{\\circ\}\$/.exec(p.enunciado);
  const ley = `Ley del coseno: ${m("c^{2} = a^{2} + b^{2} - 2ab\\cos C")}, con ${m("C")} el ángulo entre los lados ${m("a")} y ${m("b")}`;
  if (!nums || !ang) return [ley, `Respuesta: ${respuestaTex(p)}`];
  const a = Number(nums[1]);
  const b = Number(nums[2]);
  const C = Number(ang[1]);
  const c2 = a * a + b * b - 2 * a * b * Math.cos(rad(C));
  return [ley, `${m(`c^{2} = ${a}^{2} + ${b}^{2} - 2\\cdot ${a}\\cdot ${b}\\cdot\\cos(${C}^{\\circ}) \\approx ${n(c2)}`)}`, `${m(`c = \\sqrt{${n(c2)}} \\approx ${n(Math.sqrt(c2))}`)}`];
}

// Ángulo con los tres lados (SSS).
function pasosCosenoAngulo(p: ProblemaTrigonometria): string[] {
  const t = p.triangulo;
  const vr = /el ángulo \$(A|B|C)\$/.exec(p.enunciado);
  const ley = `Ley del coseno despejada: ${m("\\cos A = \\frac{b^{2} + c^{2} - a^{2}}{2bc}")}`;
  if (!t || !vr) return [ley, `Respuesta: ${respuestaTex(p)}°`];
  const V = vr[1] as "A" | "B" | "C";
  const op = V.toLowerCase() as Lado;
  const [x, y] = (["a", "b", "c"] as Lado[]).filter((l) => l !== op);
  const cos = (valor(t, x) ** 2 + valor(t, y) ** 2 - valor(t, op) ** 2) / (2 * valor(t, x) * valor(t, y));
  return [
    ley,
    `${m(`\\cos ${V} = \\frac{${n(valor(t, x))}^{2} + ${n(valor(t, y))}^{2} - ${n(valor(t, op))}^{2}}{2\\cdot ${n(valor(t, x))}\\cdot ${n(valor(t, y))}} \\approx ${n(cos, 4)}`)}`,
    `${m(`${V} = \\cos^{-1}(${n(cos, 4)}) \\approx ${n(angulo(t, V), 1)}^{\\circ}`)}`,
  ];
}

function pasosArea(p: ProblemaTrigonometria): string[] {
  const nums = /lados de (\d+(?:\.\d+)?)(?: m| dm)? y (\d+(?:\.\d+)?)/.exec(p.enunciado) ?? /bordes de (\d+(?:\.\d+)?) dm y (\d+(?:\.\d+)?)/.exec(p.enunciado);
  const ang = /(\d+(?:\.\d+)?)\^\{\\circ\}/.exec(p.enunciado);
  const formula = `Área con dos lados y el ángulo entre ellos: ${m("\\text{Área} = \\frac{1}{2}\\cdot a\\cdot b\\cdot\\operatorname{sen} C")}`;
  if (!nums || !ang) return [formula, `Respuesta: ${respuestaTex(p)}`];
  const a = Number(nums[1]);
  const b = Number(nums[2]);
  const C = Number(ang[1]);
  return [formula, `${m(`\\frac{1}{2}\\cdot ${a}\\cdot ${b}\\cdot\\operatorname{sen}(${C}^{\\circ}) \\approx ${n(0.5 * a * b * Math.sin(rad(C)))}`)}`];
}

// ---------- Guías por tipo (círculo unitario, identidades y problemas con contexto) ----------
const GUIA: Record<string, string[]> = {
  elevacion: [
    `Dibuja el triángulo rectángulo: la altura es el cateto opuesto al ángulo de elevación y la distancia horizontal es el adyacente`,
    `Usa ${m("\\tan = \\frac{\\text{altura}}{\\text{distancia}}")} (o ${m("\\operatorname{sen}")} si el dato es la hipotenusa, como una escalera o un hilo)`,
  ],
  depresion: [
    `El ángulo de depresión (hacia abajo desde la horizontal) es igual al de elevación desde abajo: son alternos internos`,
    `Con la altura como cateto opuesto: ${m("\\tan\\theta = \\frac{\\text{altura}}{\\text{distancia}}")}; si piden la visual, es la hipotenusa: ${m("\\operatorname{sen}\\theta = \\frac{\\text{altura}}{\\text{visual}}")}`,
  ],
  "dos-pasos": [
    `Separa el problema en dos triángulos rectángulos que comparten un lado (la altura o la distancia)`,
    `Resuelve uno con ${m("\\tan")} para hallar el lado común y úsalo en el otro; la respuesta es la diferencia (o la suma) de los dos resultados`,
  ],
  "q1-exactos": [`Valores exactos: ${m("\\operatorname{sen} 30^{\\circ} = \\frac{1}{2}")}, ${m("\\operatorname{sen} 45^{\\circ} = \\frac{\\sqrt{2}}{2}")}, ${m("\\operatorname{sen} 60^{\\circ} = \\frac{\\sqrt{3}}{2}")}; el coseno va al revés (cos 30° = sen 60°) y ${m("\\tan = \\frac{\\operatorname{sen}}{\\cos}")}`],
  conversion: [`${m("\\pi\\ \\text{rad} = 180^{\\circ}")}: de grados a radianes multiplica por ${m("\\frac{\\pi}{180}")}; de radianes a grados, por ${m("\\frac{180}{\\pi}")}`],
  "ref-q2q3": [`Ángulo de referencia: en el 2.º cuadrante ${m("180^{\\circ} - \\theta")}, en el 3.º ${m("\\theta - 180^{\\circ}")}`, `Signo: en el 2.º solo el seno es positivo; en el 3.º solo la tangente`],
  "todos-cuadrantes": [`Busca el ángulo de referencia (lo que le falta o le sobra hasta el eje horizontal) y su valor exacto`, `Pon el signo según el cuadrante: 1.º todas positivas, 2.º seno, 3.º tangente, 4.º coseno`],
  coterminales: [`Suma o resta ${m("360^{\\circ}")} (o ${m("2\\pi")}) las veces que haga falta hasta quedar entre 0° y 360°: ese ángulo tiene los mismos valores`],
  "dado-valor": [`${m("\\operatorname{sen}^{2}\\theta + \\cos^{2}\\theta = 1")}, así que ${m("\\cos\\theta = \\pm\\sqrt{1 - \\operatorname{sen}^{2}\\theta}")}`, `El signo lo decide el cuadrante; para la tangente divide: ${m("\\tan\\theta = \\frac{\\operatorname{sen}\\theta}{\\cos\\theta}")}`],
  pitagorica: [`${m("\\operatorname{sen}^{2}x + \\cos^{2}x = 1")}: despeja el que falta, ${m("\\pm\\sqrt{1 - (\\text{el dado})^{2}}")}`, `El cuadrante decide el signo`],
  complementarios: [`Cofunciones: ${m("\\operatorname{sen}(90^{\\circ} - x) = \\cos x")} y ${m("\\cos(90^{\\circ} - x) = \\operatorname{sen} x")} (igual con tan y cot)`],
  cociente: [`Identidad del cociente: ${m("\\tan x = \\frac{\\operatorname{sen} x}{\\cos x}")} y ${m("\\cot x = \\frac{\\cos x}{\\operatorname{sen} x}")}`],
  "reciprocas-id": [`Recíprocas: ${m("\\operatorname{cosec} x = \\frac{1}{\\operatorname{sen} x}")}, ${m("\\sec x = \\frac{1}{\\cos x}")}, ${m("\\cot x = \\frac{1}{\\tan x}")}`],
  doble: [`Ángulo doble: ${m("\\operatorname{sen} 2\\theta = 2\\operatorname{sen}\\theta\\cos\\theta")}, ${m("\\cos 2\\theta = \\cos^{2}\\theta - \\operatorname{sen}^{2}\\theta")}, ${m("\\tan 2\\theta = \\frac{2\\tan\\theta}{1 - \\tan^{2}\\theta}")}`, `Reemplaza con los valores exactos de θ`],
  "doble-dado": [`Con ${m("\\operatorname{sen}\\theta")} dado, saca ${m("\\cos\\theta")} con ${m("\\operatorname{sen}^{2} + \\cos^{2} = 1")} (el signo según el cuadrante)`, `Después aplica el ángulo doble: ${m("\\operatorname{sen} 2\\theta = 2\\operatorname{sen}\\theta\\cos\\theta")}, ${m("\\cos 2\\theta = 1 - 2\\operatorname{sen}^{2}\\theta")}`],
  "suma-diferencia": [`${m("\\operatorname{sen}(a \\pm b) = \\operatorname{sen} a\\cos b \\pm \\cos a\\operatorname{sen} b")}`, `${m("\\cos(a \\pm b) = \\cos a\\cos b \\mp \\operatorname{sen} a\\operatorname{sen} b")}. Escribe el ángulo como suma o resta de notables (75° = 45° + 30°)`],
  equivalente: [`Pasa todo a seno y coseno (con las recíprocas y el cociente) y simplifica usando ${m("\\operatorname{sen}^{2} + \\cos^{2} = 1")}`],
  "equivalente-doble": [`Usa ${m("\\cos 2x = 1 - 2\\operatorname{sen}^{2}x = 2\\cos^{2}x - 1")} y ${m("\\operatorname{sen} 2x = 2\\operatorname{sen} x\\cos x")}; después simplifica con ${m("\\operatorname{sen}^{2} + \\cos^{2} = 1")}`],
  aplicacion: [`Arma el triángulo con los datos: si tienes dos lados y el ángulo entre ellos, ley del coseno (${m("c^{2} = a^{2} + b^{2} - 2ab\\cos C")}); si tienes dos ángulos y un lado, ley del seno`],
  ambiguo: [`Caso ambiguo (dos lados y un ángulo no comprendido): con la ley del seno saca ${m("\\operatorname{sen} B")}`, `Si ${m("\\operatorname{sen} B > 1")} no hay triángulo; si es 1 hay uno; si es menor, ${m("B")} y ${m("180^{\\circ} - B")} pueden servir las dos (si la suma con ${m("A")} no pasa de 180°)`],
};

export function pasosTrigonometria(tipo: string, p: ProblemaTrigonometria): string[] {
  let pasos: string[] | null = null;
  if (tipo === "razon-ternas") pasos = pasosRazonTernas(p);
  else if (tipo === "reciprocas") pasos = pasosReciprocas(p);
  else if (tipo === "lado-notable" || tipo === "lado-calculadora") pasos = pasosLado(p);
  else if (tipo === "angulo-inverso") pasos = p.triangulo ? pasosAnguloInverso(p) : null;
  else if (tipo === "seno-lado") pasos = pasosSenoLado(p);
  else if (tipo === "coseno-lado") pasos = pasosCosenoLado(p);
  else if (tipo === "coseno-angulo") pasos = pasosCosenoAngulo(p);
  else if (tipo === "area") pasos = pasosArea(p);
  if (pasos) return pasos;
  const guia = GUIA[tipo] ?? (tipo === "angulo-inverso" ? [`Arma la razón con los dos datos (altura, largo, sombra…) y usa la inversa en modo grados`] : [SOHCAHTOA]);
  const unidad = p.entrada === "numero" && /grados/.test(p.enunciado) ? "°" : "";
  return [...guia, `Respuesta: ${respuestaTex(p)}${unidad}`];
}
