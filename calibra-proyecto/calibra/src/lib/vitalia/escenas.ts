// Escenas animadas de las lecciones de Vitalia (src/lib/dibujo/escena.ts): lo
// que se ve sale de los datos del visual; la web y la app las pintan igual.
import { esNum, lerp, limitar, ruido, suave, type Escena } from "@/lib/dibujo/escena";
import { barra, flecha, texto } from "@/lib/dibujo/formas";
import { r, type Dibujo, type Primitiva } from "@/lib/dibujo/primitivas";
import { dibujoCelula, dibujoDivision } from "./diagramas";
import { NOMBRE_ORGANELO, type FaseMitosis, type Organelo } from "./tipos";
import type {
  VisualVitalia,
  VisualVitaliaAdn,
  VisualVitaliaArbol,
  VisualVitaliaCadena,
  VisualVitaliaCelula,
  VisualVitaliaDefensa,
  VisualVitaliaDivision,
  VisualVitaliaEnergia,
  VisualVitaliaHormona,
  VisualVitaliaMembrana,
  VisualVitaliaPedigri,
  VisualVitaliaPunnett,
  VisualVitaliaRecorrido,
  VisualVitaliaReinos,
} from "./visuales";

const VERDE = "#4ADE80";
const VERDE_OSC = "#16A34A";
const NARANJA = "#FB923C";
const ROJO = "#F87171";
const AZUL = "#60A5FA";
const VIOLETA = "#A78BFA";
const ROSA = "#F472B6";
const AMARILLO = "#FACC15";
const CELESTE = "#38BDF8";

const dib = (ancho: number, alto: number, prims: Primitiva[]): Dibujo => ({ ancho, alto, prims });

// ---------- 1) La célula, organelo por organelo ----------
export const FUNCION_ORGANELO: Record<Organelo, string> = {
  membrana: "controla qué entra y qué sale de la célula",
  nucleo: "guarda el ADN y dirige la célula",
  mitocondria: "saca la energía de la glucosa (respiración celular)",
  ribosoma: "arma las proteínas",
  reticulo: "fabrica y transporta proteínas y lípidos",
  golgi: "empaqueta y reparte lo que fabrica la célula",
  lisosoma: "digiere lo que la célula ya no usa",
  vacuola: "guarda agua y sustancias (en la vegetal es enorme)",
  cloroplasto: "hace la fotosíntesis con la luz",
  pared: "da forma y protección rígida (vegetales y hongos)",
};
const ORDEN_ANIMAL: Organelo[] = ["membrana", "nucleo", "mitocondria", "ribosoma", "reticulo", "golgi", "lisosoma"];
const ORDEN_VEGETAL: Organelo[] = ["pared", "membrana", "nucleo", "cloroplasto", "vacuola", "mitocondria", "ribosoma"];

function procariota(paso: number): Dibujo {
  const prims: Primitiva[] = [
    { t: "rect", x: 50, y: 50, w: 180, h: 90, r: 45, stroke: VERDE_OSC, sw: paso === 1 ? 7 : 5, op: paso === 0 || paso === 1 ? 1 : 0.5 },
    { t: "rect", x: 58, y: 58, w: 164, h: 74, r: 37, fill: "acento", op: 0.1, stroke: "acento", sw: 1.5 },
    { t: "camino", d: "M110 95 q10 -18 20 0 t20 0 t20 0 q-5 14 -20 6 t-30 2", stroke: VIOLETA, sw: paso === 2 ? 3.5 : 2.2, op: paso === 0 || paso === 2 ? 1 : 0.4 },
    { t: "camino", d: "M230 95 q14 -10 22 0 t22 0", stroke: "texto2", sw: paso === 4 ? 3 : 2, op: paso === 0 || paso === 4 ? 1 : 0.4 },
  ];
  for (const [x, y] of [[80, 80], [90, 112], [180, 76], [196, 108], [150, 120], [74, 100]]) prims.push({ t: "circulo", cx: x, cy: y, r: paso === 3 ? 3.2 : 2.4, fill: ROSA, op: paso === 0 || paso === 3 ? 1 : 0.4 });
  return dib(300, 190, prims);
}

function celula(v: VisualVitaliaCelula): Escena | null {
  if (v.variante === "procariota") {
    const ley = [
      "Una bacteria: célula procariota, sin núcleo.",
      "Pared y membrana la rodean y la protegen.",
      "Su ADN está suelto en el citoplasma (nucleoide), sin membrana que lo encierre.",
      "Tiene ribosomas para fabricar proteínas, como todas las células.",
      "Muchas tienen un flagelo para moverse.",
    ];
    return { pasos: 4, ms: 1600, dibujar: (paso) => procariota(paso), leyenda: (paso) => ley[paso] ?? null, alternativa: "Bacteria: pared, membrana, ADN suelto sin núcleo, ribosomas y flagelo." };
  }
  if (v.variante !== "animal" && v.variante !== "vegetal") return null;
  const base = v.variante === "animal" ? ORDEN_ANIMAL : ORDEN_VEGETAL;
  const lista = (v.organelos ?? base).filter((o) => base.includes(o) || (v.variante === "animal" && o === "vacuola"));
  if (lista.length === 0) return null;
  return {
    pasos: lista.length,
    ms: 1700,
    dibujar: (paso) => (paso === 0 ? dibujoCelula(v.variante as "animal" | "vegetal") : dibujoCelula(v.variante as "animal" | "vegetal", lista[paso - 1], lista[paso - 1])),
    leyenda: (paso) => (paso === 0 ? `Una célula ${v.variante}. Mira cada parte y su oficio.` : `${NOMBRE_ORGANELO[lista[paso - 1]]}: ${FUNCION_ORGANELO[lista[paso - 1]]}.`),
    alternativa: `Célula ${v.variante}: ${lista.map((o) => `${NOMBRE_ORGANELO[o]} (${FUNCION_ORGANELO[o]})`).join("; ")}.`,
  };
}

// ---------- 2) Membrana: difusión, ósmosis, transporte activo ----------
function bicapa(y: number, x0 = 20, x1 = 280): Primitiva[] {
  const out: Primitiva[] = [{ t: "rect", x: x0, y: y - 7, w: x1 - x0, h: 14, fill: "#FDE68A", op: 0.25 }];
  for (let x = x0 + 5; x < x1; x += 10) out.push({ t: "circulo", cx: x, cy: y - 7, r: 4, fill: AMARILLO, op: 0.8 }, { t: "circulo", cx: x, cy: y + 7, r: 4, fill: AMARILLO, op: 0.8 });
  return out;
}

function membrana(v: VisualVitaliaMembrana): Escena | null {
  if (v.modo === "difusion" || v.modo === "activo") {
    const activo = v.modo === "activo";
    // Partículas: arriba (afuera) y abajo (adentro). En difusión, de 12 arriba y 2 abajo
    // pasan 5 hasta quedar 7 y 7; en transporte activo, 3 de las 4 de arriba bajan
    // adonde ya hay 9 (contra la corriente), gastando ATP.
    const n = activo ? 13 : 14;
    const pasan = activo ? [0, 1, 2] : [0, 1, 2, 3, 4];
    const arriba = activo ? 4 : 12;
    const ini = Array.from({ length: n }, (_, i) => (i < arriba ? { x: 30 + ruido(i, 1) * 240, y: 20 + ruido(i, 2) * 50 } : { x: 30 + ruido(i, 3) * 240, y: 110 + ruido(i, 4) * 55 }));
    const fin = ini.map((p, i) => (pasan.includes(i) ? { x: activo ? 150 + (i - 1) * 12 : p.x, y: 115 + ruido(i, 5) * 50 } : p));
    return {
      pasos: 3,
      ms: 1500,
      dibujar: (paso, t) => {
        const prims: Primitiva[] = [...bicapa(92)];
        prims.push(texto(286, 16, "afuera", { size: 9, fill: "texto2", anchor: "end" }), texto(286, 180, "adentro", { size: 9, fill: "texto2", anchor: "end" }));
        if (activo) prims.push({ t: "rect", x: 140, y: 78, w: 22, h: 28, r: 6, fill: VIOLETA, op: 0.85 }, texto(151, 96, "B", { size: 9, fill: "#FFFFFF", bold: true }));
        ini.forEach((p, i) => {
          const k = pasan.indexOf(i);
          // Cada partícula que pasa lo hace en su turno, repartidas en los 3 pasos.
          const f = k >= 0 && paso >= 1 ? limitar(((paso - 1 + t) * pasan.length) / 3 - k, 0, 1) : 0;
          const via = activo && k >= 0 ? { x: 151, y: 92 } : { x: (p.x + fin[i].x) / 2, y: 92 };
          const x = f < 0.5 ? lerp(p.x, via.x, suave(f * 2)) : lerp(via.x, fin[i].x, suave(f * 2 - 1));
          const y = f < 0.5 ? lerp(p.y, via.y, suave(f * 2)) : lerp(via.y, fin[i].y, suave(f * 2 - 1));
          prims.push({ t: "circulo", cx: r(x), cy: r(y), r: 5, fill: activo ? NARANJA : ROSA });
        });
        if (activo && paso >= 1) prims.push(texto(176, 82, "ATP → ADP", { size: 9, fill: AMARILLO, anchor: "start", bold: true }));
        return dib(300, 190, prims);
      },
      leyenda: (paso) =>
        activo
          ? ["Adentro ya hay muchas partículas; afuera, pocas.", "La bomba (B) gasta ATP para meter una, contra la corriente.", "Otra más: cada una cuesta energía.", "Transporte activo: de donde hay menos a donde hay más, con gasto de ATP."][paso]
          : ["Afuera hay muchas partículas; adentro, pocas.", "Se mueven al azar, y más pasan de donde hay más a donde hay menos.", "Siguen pasando sin gastar energía.", "Difusión: hasta quedar parejo de los dos lados."][paso],
      alternativa: activo ? "Transporte activo: una bomba gasta ATP para mover partículas hacia donde ya hay más." : "Difusión: las partículas pasan de donde hay más a donde hay menos, sin gastar energía.",
    };
  }
  if (v.modo !== "osmosis") return null;
  const medio = v.medio ?? "hipotonico";
  const radioFinal = medio === "hipotonico" ? 62 : medio === "hipertonico" ? 34 : 48;
  const salAfuera = medio === "hipotonico" ? 2 : medio === "hipertonico" ? 14 : 7;
  const sentido = medio === "hipotonico" ? 1 : medio === "hipertonico" ? -1 : 0;
  return {
    pasos: 2,
    ms: 1700,
    dibujar: (paso, t) => {
      const rad = paso === 0 ? 48 : paso === 1 ? lerp(48, (48 + radioFinal) / 2, suave(t)) : lerp((48 + radioFinal) / 2, radioFinal, suave(t));
      const prims: Primitiva[] = [{ t: "rect", x: 10, y: 10, w: 280, h: 170, r: 14, fill: CELESTE, op: 0.12 }];
      prims.push({ t: "circulo", cx: 150, cy: 95, r: r(rad), fill: "acento", op: 0.15, stroke: "acento", sw: 3 });
      for (let i = 0; i < 7; i++) prims.push({ t: "circulo", cx: r(150 + Math.cos(i) * rad * 0.5), cy: r(95 + Math.sin(i * 1.7) * rad * 0.5), r: 3, fill: "#FFFFFF", stroke: "texto2", sw: 1 });
      for (let i = 0; i < salAfuera; i++) {
        const a = (i / salAfuera) * Math.PI * 2;
        prims.push({ t: "circulo", cx: r(150 + Math.cos(a) * 100), cy: r(95 + Math.sin(a) * 68), r: 3, fill: "#FFFFFF", stroke: "texto2", sw: 1 });
      }
      if (paso >= 1 && sentido !== 0) {
        for (const a of [0.3, 2.2, 4.1]) {
          const x1 = 150 + Math.cos(a) * (sentido > 0 ? 95 : rad - 8);
          const y1 = 95 + Math.sin(a) * (sentido > 0 ? 70 : rad - 8);
          const x2 = 150 + Math.cos(a) * (sentido > 0 ? rad - 6 : 95);
          const y2 = 95 + Math.sin(a) * (sentido > 0 ? rad - 6 : 70);
          prims.push(...flecha(x1, y1, x2, y2, AZUL, "H₂O", 2));
        }
      }
      return dib(300, 190, prims);
    },
    leyenda: (paso) =>
      paso === 0
        ? `Una célula (sal ⚪ adentro) en un medio ${medio}.`
        : medio === "hipotonico"
          ? "Afuera hay menos sal: el agua entra, hacia donde hay más sal."
          : medio === "hipertonico"
            ? "Afuera hay más sal: el agua sale y la célula se arruga."
            : "Igual sal adentro y afuera: entra tanta agua como sale.",
    alternativa: `Ósmosis en medio ${medio}: el agua va hacia donde hay más sal; la célula ${sentido > 0 ? "se hincha" : sentido < 0 ? "se arruga" : "queda igual"}.`,
  };
}

// ---------- 3) División celular ----------
function celulaSimple(cx: number, cy: number, rx: number, ry: number, cromos: number, conNucleo = true): Primitiva[] {
  const out: Primitiva[] = [{ t: "elipse", cx, cy, rx, ry, fill: "acento", op: 0.1, stroke: "acento", sw: 2.5 }];
  if (conNucleo) out.push({ t: "elipse", cx, cy, rx: rx * 0.45, ry: ry * 0.45, fill: VIOLETA, op: 0.25, stroke: VIOLETA, sw: 1.5 });
  for (let i = 0; i < cromos; i++) {
    const x = cx - (cromos - 1) * 6 + i * 12;
    out.push({ t: "linea", x1: x, y1: cy - 8, x2: x, y2: cy + 8, stroke: i % 2 ? AZUL : ROSA, sw: 3.5 });
  }
  return out;
}

function division(v: VisualVitaliaDivision): Escena | null {
  const dosN = esNum(v.dosN, 2, 100) && v.dosN % 2 === 0 ? v.dosN : 4;
  if (v.modo === "mitosis") {
    const fases: FaseMitosis[] = ["profase", "metafase", "anafase", "telofase"];
    const ley = [
      `Interfase: la célula copió su ADN. Tiene ${dosN} cromosomas (2n).`,
      "Profase: los cromosomas se condensan y se ven dobles (dos cromátidas).",
      "Metafase: se alinean en el medio, enganchados al huso.",
      "Anafase: las cromátidas se separan hacia los polos.",
      `Telofase: se forman dos núcleos y la célula se divide. Cada hija tiene ${dosN} cromosomas, igual que la madre.`,
    ];
    return {
      pasos: 4,
      ms: 1700,
      dibujar: (paso) => (paso === 0 ? dib(260, 160, celulaSimple(130, 80, 110, 66, 0)) : dibujoDivision(fases[paso - 1])),
      leyenda: (paso) => ley[paso] ?? null,
      alternativa: `Mitosis: profase, metafase, anafase y telofase. De una célula con ${dosN} cromosomas salen dos iguales con ${dosN}.`,
    };
  }
  if (v.modo !== "meiosis") return null;
  const n = dosN / 2;
  const ley = [
    `Una célula con ${dosN} cromosomas (2n), en pares de homólogos.`,
    "Entrecruzamiento: los homólogos se aparean e intercambian pedazos. Así cada gameto sale distinto.",
    `Meiosis I: se separan los pares. Quedan dos células con ${n} cromosomas (n) dobles.`,
    `Meiosis II: se separan las cromátidas. Quedan 4 gametos con ${n} cromosomas cada uno.`,
  ];
  return {
    pasos: 3,
    ms: 1800,
    dibujar: (paso) => {
      const prims: Primitiva[] = [];
      if (paso <= 1) {
        prims.push({ t: "elipse", cx: 150, cy: 85, rx: 120, ry: 66, fill: "acento", op: 0.1, stroke: "acento", sw: 2.5 });
        for (let i = 0; i < Math.min(n, 3); i++) {
          const x = 120 + i * 30;
          prims.push({ t: "linea", x1: x - 5, y1: 65, x2: x - 5, y2: 105, stroke: ROSA, sw: 4 }, { t: "linea", x1: x + 5, y1: 65, x2: x + 5, y2: 105, stroke: AZUL, sw: 4 });
          if (paso === 1) prims.push({ t: "linea", x1: x - 5, y1: 92, x2: x - 5, y2: 105, stroke: AZUL, sw: 4 }, { t: "linea", x1: x + 5, y1: 92, x2: x + 5, y2: 105, stroke: ROSA, sw: 4 });
        }
      } else if (paso === 2) {
        prims.push(...celulaSimple(80, 85, 62, 56, Math.min(n, 3), false), ...celulaSimple(220, 85, 62, 56, Math.min(n, 3), false));
      } else {
        for (const [x, y] of [[55, 50], [125, 50], [175, 125], [245, 125]] as const) prims.push(...celulaSimple(x, y, 44, 36, Math.min(n, 3), false));
      }
      prims.push(texto(150, 178, paso <= 1 ? `2n = ${dosN}` : `n = ${n}`, { size: 11, bold: true, fill: "acento" }));
      return dib(300, 185, prims);
    },
    leyenda: (paso) => ley[paso] ?? null,
    alternativa: `Meiosis: de una célula con ${dosN} cromosomas salen 4 gametos con ${n}, todos distintos por el entrecruzamiento.`,
  };
}

// ---------- 4) Energía: cloroplasto y mitocondria ----------
function caja(x: number, y: number, w: number, h: number, color: string, nombre: string): Primitiva[] {
  return [{ t: "rect", x, y, w, h, r: 16, fill: color, op: 0.22, stroke: color, sw: 2 }, texto(x + w / 2, y + h / 2 + 4, nombre, { size: 10, bold: true, fill: color })];
}
function viaje(x1: number, y1: number, x2: number, y2: number, t: number, etiqueta: string, color: string): Primitiva[] {
  const k = suave(t);
  return [
    { t: "linea", x1, y1, x2, y2, stroke: color, sw: 1.5, dash: "4 4", op: 0.6 },
    { t: "circulo", cx: r(lerp(x1, x2, k)), cy: r(lerp(y1, y2, k)), r: 5, fill: color },
    texto(lerp(x1, x2, k), lerp(y1, y2, k) - 9, etiqueta, { size: 9, bold: true, fill: color }),
  ];
}

function energia(v: VisualVitaliaEnergia): Escena | null {
  if (v.modo === "ciclo") {
    return {
      pasos: 3,
      ms: 1800,
      dibujar: (paso, t) => {
        const prims: Primitiva[] = [...caja(20, 60, 100, 60, VERDE, "Cloroplasto"), ...caja(180, 60, 100, 60, NARANJA, "Mitocondria")];
        if (paso >= 1) prims.push(...viaje(70, 10, 70, 58, paso === 1 ? t : 1, "Luz + CO₂ + H₂O", AMARILLO));
        if (paso >= 2) prims.push(...viaje(122, 90, 178, 90, paso === 2 ? t : 1, "Glucosa + O₂", VERDE));
        if (paso >= 3) prims.push(...viaje(230, 122, 230, 170, t, "ATP", AMARILLO), ...viaje(200, 122, 90, 160, t, "CO₂ + H₂O", AZUL));
        return dib(300, 185, prims);
      },
      leyenda: (paso) =>
        ["La planta y el animal están conectados por dos procesos.", "Fotosíntesis: con luz, CO₂ y agua, el cloroplasto fabrica glucosa y suelta O₂.", "La glucosa y el O₂ van a la mitocondria (también en las células de la planta).", "Respiración: saca ATP y devuelve CO₂ y agua. El ciclo se cierra."][paso] ?? null,
      alternativa: "Fotosíntesis y respiración son espejo: lo que una produce, la otra lo usa.",
    };
  }
  const datos: Record<string, { color: string; nombre: string; entra: string; sale: string; ley: string[] }> = {
    fotosintesis: { color: VERDE, nombre: "Cloroplasto", entra: "Luz + 6 CO₂ + 6 H₂O", sale: "Glucosa + 6 O₂", ley: ["La fotosíntesis pasa en el cloroplasto.", "Entran luz, dióxido de carbono y agua.", "Salen glucosa (la comida de la planta) y oxígeno."] },
    respiracion: { color: NARANJA, nombre: "Mitocondria", entra: "Glucosa + 6 O₂", sale: "≈ 36 ATP + 6 CO₂ + 6 H₂O", ley: ["La respiración celular termina en la mitocondria.", "Entran glucosa y oxígeno.", "Salen unos 36 ATP, dióxido de carbono y agua."] },
    fermentacion: { color: ROSA, nombre: "Citoplasma", entra: "Glucosa (sin O₂)", sale: "2 ATP + ácido láctico o alcohol", ley: ["Sin oxígeno, la célula fermenta en el citoplasma.", "Entra glucosa, pero no hay oxígeno.", "Solo salen 2 ATP: ácido láctico (músculo, yogur) o alcohol y CO₂ (pan, levadura)."] },
  };
  const d = datos[v.modo];
  if (!d) return null;
  return {
    pasos: 2,
    ms: 1700,
    dibujar: (paso, t) => {
      const prims: Primitiva[] = [...caja(95, 62, 110, 56, d.color, d.nombre)];
      if (paso >= 1) {
        const k = paso === 1 ? suave(t) : 1;
        prims.push({ t: "linea", x1: 150, y1: 24, x2: 150, y2: 60, stroke: AMARILLO, sw: 1.5, dash: "4 4", op: 0.6 }, { t: "circulo", cx: 150, cy: r(lerp(24, 60, k)), r: 5, fill: AMARILLO }, texto(150, 16, d.entra, { size: 10, bold: true, fill: AMARILLO }));
      }
      if (paso >= 2) {
        const k = suave(t);
        prims.push({ t: "linea", x1: 150, y1: 120, x2: 150, y2: 156, stroke: d.color, sw: 1.5, dash: "4 4", op: 0.6 }, { t: "circulo", cx: 150, cy: r(lerp(120, 156, k)), r: 5, fill: d.color }, texto(150, 174, d.sale, { size: 10, bold: true, fill: d.color }));
      }
      return dib(300, 182, prims);
    },
    leyenda: (paso) => d.ley[paso] ?? null,
    alternativa: `${d.nombre}: entra ${d.entra}; sale ${d.sale}.`,
  };
}

// ---------- 5) ADN: replicación, transcripción, traducción ----------
const PAR_ADN: Record<string, string> = { A: "T", T: "A", G: "C", C: "G" };
const PAR_ARN: Record<string, string> = { A: "U", T: "A", G: "C", C: "G" };
const COLOR_BASE: Record<string, string> = { A: ROJO, T: AMARILLO, U: CELESTE, G: VERDE, C: AZUL };

// Código genético (ARN mensajero → aminoácido, abreviatura de 3 letras).
const CODIGO: Record<string, string> = (() => {
  const bases = "UCAG";
  const aa = "FFLLSSSSYY**CC*WLLLLPPPPHHQQRRRRIIIMTTTTNNKKSSRRVVVVAAAADDEEGGGG";
  const nombre: Record<string, string> = { F: "Phe", L: "Leu", S: "Ser", Y: "Tyr", "*": "Stop", C: "Cys", W: "Trp", P: "Pro", H: "His", Q: "Gln", R: "Arg", I: "Ile", M: "Met", T: "Thr", N: "Asn", K: "Lys", V: "Val", A: "Ala", D: "Asp", E: "Glu", G: "Gly" };
  const out: Record<string, string> = {};
  let i = 0;
  for (const a of bases) for (const b of bases) for (const c of bases) out[a + b + c] = nombre[aa[i++]];
  return out;
})();
export const traducirCodon = (codon: string): string | null => CODIGO[codon] ?? null;

function letra(x: number, y: number, b: string, op = 1): Primitiva[] {
  return [{ t: "rect", x: x - 9, y: y - 10, w: 18, h: 20, r: 4, fill: COLOR_BASE[b] ?? "texto2", op: 0.3 * op, stroke: COLOR_BASE[b] ?? "texto2", sw: 1.2 }, { t: "texto", x, y: y + 4, s: b, size: 11, fill: "texto", anchor: "middle", bold: true }];
}

function adn(v: VisualVitaliaAdn): Escena | null {
  const h = (v.hebra ?? "").toUpperCase();
  if (v.modo === "traduccion") {
    if (!/^[AUGC]+$/.test(h) || h.length < 3 || h.length > 12 || h.length % 3 !== 0) return null;
    const codones = h.match(/.{3}/g)!;
    const aas = codones.map((c) => CODIGO[c]);
    return {
      pasos: codones.length,
      ms: 1700,
      dibujar: (paso, t) => {
        const prims: Primitiva[] = [];
        const x0 = 150 - (h.length - 1) * 11;
        for (let i = 0; i < h.length; i++) prims.push(...letra(x0 + i * 22, 70, h[i]));
        const k = Math.min(codones.length - 1, paso === 0 ? 0 : paso - 1 + suave(t));
        const rx = x0 + k * 66 - 12;
        prims.push({ t: "rect", x: r(rx), y: 44, w: 68, h: 52, r: 18, stroke: VIOLETA, sw: 2.5, fill: VIOLETA, op: 0.15 });
        for (let i = 0; i < paso; i++) {
          prims.push({ t: "circulo", cx: x0 + 22 + i * 66, cy: 130, r: 16, fill: aas[i] === "Stop" ? "texto2" : NARANJA, op: 0.85 });
          prims.push(texto(x0 + 22 + i * 66, 134, aas[i], { size: 9, bold: true, fill: "#FFFFFF" }));
          if (i > 0) prims.push({ t: "linea", x1: x0 + 22 + (i - 1) * 66 + 16, y1: 130, x2: x0 + 22 + i * 66 - 16, y2: 130, stroke: NARANJA, sw: 3 });
        }
        return dib(300, 160, prims);
      },
      leyenda: (paso) => (paso === 0 ? "El ribosoma lee el ARN mensajero de a 3 letras (un codón)." : `Codón ${codones[paso - 1]} → ${aas[paso - 1]}${aas[paso - 1] === "Stop" ? " (ahí termina la proteína)" : ""}.`),
      alternativa: `Traducción de ${codones.join("-")}: ${aas.join("-")}.`,
    };
  }
  if (!/^[ATGC]+$/.test(h) || h.length < 3 || h.length > 12) return null;
  const arn = v.modo === "transcripcion";
  if (!arn && v.modo !== "replicacion") return null;
  const comp = [...h].map((b) => (arn ? PAR_ARN[b] : PAR_ADN[b]));
  return {
    pasos: 3,
    ms: 1600,
    dibujar: (paso, t) => {
      const prims: Primitiva[] = [];
      const x0 = 150 - (h.length - 1) * 11;
      const sep = paso === 0 ? 0 : paso === 1 ? suave(t) : 1;
      for (let i = 0; i < h.length; i++) {
        prims.push(...letra(x0 + i * 22, 60 - sep * 14, h[i]));
        const visible = paso < 2 ? (paso === 0 ? 1 : 1 - sep) : paso === 2 ? limitar(t * h.length - i, 0, 1) : 1;
        if (!arn && paso < 2) prims.push(...letra(x0 + i * 22, 84 + sep * 14, PAR_ADN[h[i]], 1 - sep * 0.7));
        if (paso >= 2 && visible > 0) prims.push(...letra(x0 + i * 22, 112, comp[i], visible));
      }
      prims.push(texto(14, 50, "ADN", { size: 9, anchor: "start", fill: "texto2", bold: true }));
      if (paso >= 2) prims.push(texto(14, 136, arn ? "ARNm" : "nueva", { size: 9, anchor: "start", fill: "texto2", bold: true }));
      return dib(300, 160, prims);
    },
    leyenda: (paso) =>
      [
        "La doble hélice: A se aparea con T y G con C.",
        "La hélice se abre: cada hebra sirve de molde.",
        arn ? "Se arma el ARN mensajero: A con U, T con A, G con C, C con G." : "Llegan bases nuevas: A con T, G con C.",
        arn ? `ARN mensajero: ${comp.join("")} (en el ARN no hay T: va U).` : `Hebra nueva: ${comp.join("")}. Cada copia guarda una hebra vieja y una nueva.`,
      ][paso] ?? null,
    alternativa: `${arn ? "Transcripción" : "Replicación"} de ${h}: ${comp.join("")}.`,
  };
}

// ---------- 6) Cuadro de Punnett ----------
function gametos(g: string): string[] | null {
  if (/^[A-Za-z]{2}$/.test(g) && g[0].toLowerCase() === g[1].toLowerCase()) return [g[0], g[1]];
  if (/^[A-Za-z]{4}$/.test(g) && g[0].toLowerCase() === g[1].toLowerCase() && g[2].toLowerCase() === g[3].toLowerCase() && g[0].toLowerCase() !== g[2].toLowerCase()) {
    const out: string[] = [];
    for (const a of [g[0], g[1]]) for (const b of [g[2], g[3]]) out.push(a + b);
    return out;
  }
  return null;
}
const ordenarAlelos = (s: string) => [...s].sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()) || (a === a.toUpperCase() ? -1 : 1)).join("");

export function fenotipoPunnett(genotipo: string, incompleta = false): string {
  const pares = genotipo.match(/.{2}/g) ?? [];
  return pares
    .map((p) => {
      const may = [...p].filter((c) => c === c.toUpperCase()).length;
      if (incompleta) return may === 2 ? "dominante" : may === 1 ? "intermedio" : "recesivo";
      return may > 0 ? p[0].toUpperCase() : p[0].toLowerCase();
    })
    .join(incompleta ? "+" : "");
}

function punnett(v: VisualVitaliaPunnett): Escena | null {
  const g1 = gametos(v.padre1 ?? "");
  const g2 = gametos(v.padre2 ?? "");
  if (!g1 || !g2 || g1.length !== g2.length) return null;
  if (v.padre1.toLowerCase() !== v.padre2.toLowerCase()) return null;
  const n = g1.length;
  const celdas = g2.map((b) => g1.map((a) => {
    if (n === 2) return ordenarAlelos(a + b);
    return ordenarAlelos(a[0] + b[0]) + ordenarAlelos(a[1] + b[1]);
  }));
  const conteo = new Map<string, number>();
  for (const fila of celdas) for (const c of fila) conteo.set(fenotipoPunnett(c, v.incompleta), (conteo.get(fenotipoPunnett(c, v.incompleta)) ?? 0) + 1);
  // Con dominancia incompleta se ordena dominante, intermedio, recesivo (1 : 2 : 1);
  // si no, de más a menos frecuente (3 : 1, 9 : 3 : 3 : 1).
  const ORDEN_INCOMPLETA = ["dominante", "intermedio", "recesivo"];
  const fenos = [...conteo.entries()].sort((a, b) => (v.incompleta ? ORDEN_INCOMPLETA.indexOf(a[0]) - ORDEN_INCOMPLETA.indexOf(b[0]) : b[1] - a[1]));
  const paleta = [VERDE, AMARILLO, ROSA, AZUL];
  const colorDe = (f: string) => paleta[fenos.findIndex(([x]) => x === f) % paleta.length];
  const proporcion = fenos.map(([, c]) => c).join(" : ");
  const lado = n === 2 ? 46 : 28;
  return {
    pasos: 3,
    ms: 1800,
    dibujar: (paso, t) => {
      const x0 = 150 - (lado * n) / 2 + 10;
      const y0 = 40;
      const prims: Primitiva[] = [];
      g1.forEach((a, i) => prims.push(texto(x0 + i * lado + lado / 2, y0 - 8, a, { size: n === 2 ? 13 : 9, bold: true, fill: VIOLETA })));
      g2.forEach((b, j) => prims.push(texto(x0 - 14, y0 + j * lado + lado / 2 + 4, b, { size: n === 2 ? 13 : 9, bold: true, fill: ROSA })));
      prims.push(texto(x0 - 14, y0 - 8, "♀ \\ ♂", { size: 8, fill: "texto2" }));
      const total = n * n;
      celdas.forEach((fila, j) =>
        fila.forEach((c, i) => {
          const idx = j * n + i;
          const visible = paso >= 2 ? 1 : paso === 1 ? limitar(t * total - idx, 0, 1) : 0;
          prims.push({ t: "rect", x: x0 + i * lado, y: y0 + j * lado, w: lado, h: lado, stroke: "borde", sw: 1.5, fill: paso >= 2 ? colorDe(fenotipoPunnett(c, v.incompleta)) : undefined, op: paso >= 2 ? 0.35 + 0.25 * (paso === 2 ? suave(t) : 1) : undefined });
          if (visible > 0) prims.push(texto(x0 + i * lado + lado / 2, y0 + j * lado + lado / 2 + 4, c, { size: n === 2 ? 12 : 8, bold: true }));
        })
      );
      if (paso >= 3) {
        let x = 30;
        const anchoTot = 240;
        for (const [f, c] of fenos) {
          const w = (anchoTot * c) / total;
          prims.push({ t: "rect", x: r(x), y: 170, w: r(w), h: 12, fill: colorDe(f), op: 0.8 });
          x += w;
        }
      }
      return dib(300, 190, prims);
    },
    leyenda: (paso) =>
      [
        `Cruce ${v.padre1} × ${v.padre2}: cada padre aporta un alelo de cada gen por gameto.`,
        "Cada casilla junta un gameto de cada padre.",
        `Se colorean por cómo se ven (fenotipo)${v.incompleta ? ": el heterocigoto es intermedio" : ": con una mayúscula alcanza para mostrar el dominante"}.`,
        `Proporción de fenotipos: ${proporcion} (de ${n * n} casillas).`,
      ][paso] ?? null,
    alternativa: `Cuadro de Punnett de ${v.padre1} × ${v.padre2}: proporción ${proporcion}.`,
  };
}

// ---------- 7) Árbol genealógico ----------
interface Persona {
  x: number;
  y: number;
  mujer: boolean;
  afectado: boolean;
  portador?: boolean;
  gen: number;
}
function pedigri(v: VisualVitaliaPedigri): Escena | null {
  if (v.modo !== "recesiva" && v.modo !== "ligadaX") return null;
  const x = v.modo === "ligadaX";
  const gente: Persona[] = x
    ? [
        { x: 110, y: 40, mujer: false, afectado: false, gen: 1 },
        { x: 190, y: 40, mujer: true, afectado: false, portador: true, gen: 1 },
        { x: 70, y: 120, mujer: false, afectado: true, gen: 2 },
        { x: 120, y: 120, mujer: true, afectado: false, portador: true, gen: 2 },
        { x: 180, y: 120, mujer: false, afectado: false, gen: 2 },
        { x: 230, y: 120, mujer: true, afectado: false, gen: 2 },
      ]
    : [
        { x: 110, y: 40, mujer: false, afectado: false, portador: true, gen: 1 },
        { x: 190, y: 40, mujer: true, afectado: false, portador: true, gen: 1 },
        { x: 70, y: 120, mujer: true, afectado: false, gen: 2 },
        { x: 120, y: 120, mujer: false, afectado: true, gen: 2 },
        { x: 180, y: 120, mujer: true, afectado: false, portador: true, gen: 2 },
        { x: 230, y: 120, mujer: false, afectado: false, portador: true, gen: 2 },
      ];
  return {
    pasos: 3,
    ms: 1800,
    dibujar: (paso) => {
      const prims: Primitiva[] = [{ t: "linea", x1: 124, y1: 40, x2: 176, y2: 40, stroke: "texto2", sw: 2 }];
      if (paso >= 2) prims.push({ t: "linea", x1: 150, y1: 40, x2: 150, y2: 80, stroke: "texto2", sw: 2 }, { t: "linea", x1: 70, y1: 80, x2: 230, y2: 80, stroke: "texto2", sw: 2 }, ...[70, 120, 180, 230].map((xx) => ({ t: "linea" as const, x1: xx, y1: 80, x2: xx, y2: 106, stroke: "texto2", sw: 2 })));
      for (const p of gente) {
        if (p.gen === 2 && paso < 2) continue;
        const relleno = p.afectado ? (x ? AZUL : ROSA) : undefined;
        if (p.mujer) prims.push({ t: "circulo", cx: p.x, cy: p.y, r: 14, stroke: "texto", sw: 2, fill: relleno });
        else prims.push({ t: "rect", x: p.x - 14, y: p.y - 14, w: 28, h: 28, stroke: "texto", sw: 2, fill: relleno });
        if (p.portador && paso >= 1) prims.push({ t: "circulo", cx: p.x, cy: p.y, r: 4.5, fill: "texto" });
      }
      if (paso >= 3) prims.push(texto(150, 172, x ? "■ afectado   ● portadora" : "■● afectados   • portadores", { size: 9, fill: "texto2" }));
      return dib(300, 180, prims);
    },
    leyenda: (paso) =>
      x
        ? ["Cuadrado: hombre. Círculo: mujer. Relleno: tiene el rasgo (daltonismo).", "La madre es portadora: uno de sus X lleva el alelo, pero el otro X la protege.", "Hijos: un varón con daltonismo (su único X vino de la madre) y una hija portadora.", "Ligada al X: aparece sobre todo en varones, que heredan el alelo de la madre."][paso] ?? null
        : ["Cuadrado: hombre. Círculo: mujer. Relleno: tiene el rasgo.", "Los dos padres son portadores (Aa): tienen el alelo, pero no lo muestran.", "Uno de los hijos sale aa y muestra el rasgo, aunque sus padres no lo mostraban.", "Recesiva: puede saltarse generaciones; en promedio sale 1 de cada 4 hijos de dos portadores."][paso] ?? null,
    alternativa: x ? "Árbol de una herencia ligada al X: madre portadora, hijo varón afectado." : "Árbol de una herencia recesiva: padres portadores sanos con un hijo afectado.",
  };
}

// ---------- 8) Recorridos por el cuerpo ----------
const RECORRIDOS: Record<VisualVitaliaRecorrido["sistema"], { estaciones: { nombre: string; x: number; y: number; nota: string }[]; color: string; color2?: string }> = {
  circulatorio: {
    color: AZUL,
    color2: ROJO,
    estaciones: [
      { nombre: "Cuerpo", x: 150, y: 168, nota: "La sangre vuelve del cuerpo sin oxígeno por las venas cavas." },
      { nombre: "Aurícula der.", x: 110, y: 110, nota: "Entra al corazón por la aurícula derecha." },
      { nombre: "Ventrículo der.", x: 110, y: 75, nota: "El ventrículo derecho la empuja por la arteria pulmonar." },
      { nombre: "Pulmones", x: 150, y: 20, nota: "En los pulmones deja CO₂ y toma O₂: se vuelve roja (circulación menor)." },
      { nombre: "Aurícula izq.", x: 190, y: 75, nota: "Vuelve oxigenada por las venas pulmonares a la aurícula izquierda." },
      { nombre: "Ventrículo izq.", x: 190, y: 110, nota: "El ventrículo izquierdo, el más fuerte, la manda por la aorta a todo el cuerpo (circulación mayor)." },
    ],
  },
  digestivo: {
    color: NARANJA,
    estaciones: [
      { nombre: "Boca", x: 60, y: 22, nota: "Boca: se mastica y la saliva (amilasa) empieza a romper el almidón." },
      { nombre: "Esófago", x: 60, y: 70, nota: "Esófago: el bolo baja por movimientos musculares." },
      { nombre: "Estómago", x: 130, y: 90, nota: "Estómago: el ácido y la pepsina rompen las proteínas." },
      { nombre: "Intestino delgado", x: 200, y: 120, nota: "Intestino delgado: termina la digestión y se absorben los nutrientes a la sangre." },
      { nombre: "Intestino grueso", x: 130, y: 160, nota: "Intestino grueso: se absorbe el agua." },
      { nombre: "Recto", x: 60, y: 160, nota: "Recto y ano: sale lo que no se digirió." },
    ],
  },
  respiratorio: {
    color: CELESTE,
    estaciones: [
      { nombre: "Nariz", x: 50, y: 20, nota: "Nariz: el aire se filtra, se calienta y se humedece." },
      { nombre: "Laringe", x: 90, y: 55, nota: "Faringe y laringe (ahí están las cuerdas vocales)." },
      { nombre: "Tráquea", x: 130, y: 90, nota: "Tráquea: un tubo con anillos que no se cierra." },
      { nombre: "Bronquios", x: 170, y: 120, nota: "Bronquios y bronquiolos: se ramifican dentro de cada pulmón." },
      { nombre: "Alvéolos", x: 230, y: 155, nota: "Alvéolos: el O₂ pasa a la sangre y el CO₂ sale de ella, por difusión." },
    ],
  },
  urinario: {
    color: AMARILLO,
    estaciones: [
      { nombre: "Arteria renal", x: 40, y: 30, nota: "La sangre con desechos llega al riñón por la arteria renal." },
      { nombre: "Riñón (nefrona)", x: 110, y: 65, nota: "En la nefrona se filtra la sangre y se recupera lo útil; queda la orina con urea." },
      { nombre: "Uréter", x: 160, y: 105, nota: "La orina baja por el uréter." },
      { nombre: "Vejiga", x: 210, y: 140, nota: "Se guarda en la vejiga." },
      { nombre: "Uretra", x: 260, y: 170, nota: "Sale por la uretra." },
    ],
  },
  nervioso: {
    color: VIOLETA,
    estaciones: [
      { nombre: "Receptor", x: 40, y: 150, nota: "Un receptor de la piel detecta algo caliente." },
      { nombre: "Neurona sensitiva", x: 100, y: 90, nota: "La neurona sensitiva lleva el impulso eléctrico hacia la médula." },
      { nombre: "Médula espinal", x: 160, y: 30, nota: "En la médula, una sinapsis pasa el mensaje: el reflejo se decide sin esperar al cerebro." },
      { nombre: "Neurona motora", x: 220, y: 90, nota: "La neurona motora lleva la orden al músculo." },
      { nombre: "Músculo", x: 270, y: 150, nota: "El músculo se contrae y retiras la mano: arco reflejo." },
    ],
  },
};

function recorrido(v: VisualVitaliaRecorrido): Escena | null {
  const d = RECORRIDOS[v.sistema];
  if (!d) return null;
  const est = d.estaciones;
  const cerrado = v.sistema === "circulatorio";
  return {
    pasos: cerrado ? est.length : est.length - 1,
    ms: 1600,
    dibujar: (paso, t) => {
      const prims: Primitiva[] = [];
      const puntos = cerrado ? [...est, est[0]] : est;
      for (let i = 0; i < puntos.length - 1; i++) prims.push({ t: "linea", x1: puntos[i].x, y1: puntos[i].y, x2: puntos[i + 1].x, y2: puntos[i + 1].y, stroke: i < paso ? d.color : "borde", sw: i < paso ? 4 : 2, op: 0.7 });
      est.forEach((e, i) => {
        prims.push({ t: "circulo", cx: e.x, cy: e.y, r: 8, fill: i <= paso ? d.color : undefined, stroke: d.color, sw: 2, op: 0.85 });
        prims.push(texto(e.x + (e.x > 230 ? -12 : 12), e.y + (e.y < 30 ? 16 : -10), e.nombre, { size: 9, bold: i === paso, anchor: e.x > 230 ? "end" : "start", fill: i === paso ? "texto" : "texto2" }));
      });
      const a = puntos[Math.max(0, paso - 1)];
      const b = puntos[Math.min(puntos.length - 1, paso)];
      const k = paso === 0 ? 0 : suave(t);
      // En la circulación, la sangre se pone roja después de los pulmones.
      const oxigenada = cerrado && ((paso === 3 && k > 0.5) || (paso > 3 && paso < est.length) || (paso === est.length && k < 0.5));
      prims.push({ t: "circulo", cx: r(lerp(a.x, b.x, k)), cy: r(lerp(a.y, b.y, k)), r: 6, fill: oxigenada ? (d.color2 ?? d.color) : d.color, stroke: "#FFFFFF", sw: 2 });
      return dib(300, 185, prims);
    },
    leyenda: (paso) => (cerrado && paso === est.length ? "Y vuelve a empezar: dos circulaciones en un solo corazón." : est[paso]?.nota ?? null),
    alternativa: `Recorrido del sistema ${v.sistema}: ${est.map((e) => e.nombre).join(" → ")}.`,
  };
}

// ---------- 9) Hormonas y retroalimentación ----------
function hormona(v: VisualVitaliaHormona): Escena | null {
  const glu = v.modo === "glucosa";
  if (!glu && v.modo !== "temperatura") return null;
  const valores = glu ? [90, 160, 90, 60, 90] : [37, 39, 37, 35, 37];
  const ley = glu
    ? ["Glucosa en sangre normal: unos 90 mg/dL.", "Después de comer, sube.", "El páncreas suelta insulina: las células toman glucosa y baja.", "En ayunas, baja.", "El páncreas suelta glucagón: el hígado libera glucosa y sube. Retroalimentación negativa."]
    : ["Temperatura del cuerpo: unos 37 °C.", "Haces ejercicio y sube.", "Sudas y los vasos de la piel se abren: baja.", "Hace frío y baja.", "Tiritas y los vasos se cierran: sube. El cerebro (hipotálamo) corrige siempre hacia 37 °C."];
  const min = glu ? 40 : 34;
  const max = glu ? 180 : 40;
  return {
    pasos: 4,
    ms: 1800,
    dibujar: (paso, t) => {
      const val = paso === 0 ? valores[0] : lerp(valores[paso - 1], valores[paso], suave(t));
      const alto = ((val - min) / (max - min)) * 120;
      const prims: Primitiva[] = [...barra(60, 160, alto, 120, val > valores[0] + 1 ? ROJO : val < valores[0] - 1 ? AZUL : VERDE, glu ? "Glucosa" : "Temp.", glu ? `${Math.round(val)} mg/dL` : `${Math.round(val * 10) / 10} °C`.replace(".", ","))];
      const yNormal = 160 - ((valores[0] - min) / (max - min)) * 120;
      prims.push({ t: "linea", x1: 40, y1: r(yNormal), x2: 84, y2: r(yNormal), stroke: "texto2", sw: 1, dash: "3 3" });
      const actua = paso === 2 || paso === 4;
      prims.push({ t: "rect", x: 150, y: 40, w: 110, h: 44, r: 12, fill: glu ? NARANJA : VIOLETA, op: 0.22, stroke: glu ? NARANJA : VIOLETA, sw: 2 }, texto(205, 66, glu ? "Páncreas" : "Hipotálamo", { size: 10, bold: true, fill: glu ? NARANJA : VIOLETA }));
      if (actua) {
        const h = glu ? (paso === 2 ? "Insulina" : "Glucagón") : paso === 2 ? "Sudor" : "Tiritar";
        prims.push(...flecha(170, 86, lerp(170, 92, suave(t)), lerp(86, 120, suave(t)), paso === 2 ? CELESTE : AMARILLO, undefined, 2.5), texto(205, 104, h, { size: 11, bold: true, fill: paso === 2 ? CELESTE : AMARILLO }));
      }
      return dib(300, 185, prims);
    },
    leyenda: (paso) => ley[paso] ?? null,
    alternativa: glu ? "La insulina baja la glucosa y el glucagón la sube: el cuerpo la mantiene cerca de 90 mg/dL." : "El hipotálamo mantiene la temperatura cerca de 37 °C: sudor para bajarla, tiritar para subirla.",
  };
}

// ---------- 10) Defensas ----------
function defensa(v: VisualVitaliaDefensa): Escena | null {
  if (v.modo === "vacuna") {
    const curva = (inicio: number, alto: number, ancho: number) =>
      Array.from({ length: 41 }, (_, i) => {
        const x = i / 40;
        const s = x - inicio;
        return [40 + x * 240, 150 - (s <= 0 ? 0 : alto * Math.min(1, s / ancho) * Math.exp(-Math.max(0, s - ancho) * 3))] as const;
      });
    const c1 = curva(0.05, 40, 0.18);
    const c2 = curva(0.55, 110, 0.07);
    const camino = (pts: readonly (readonly [number, number])[], hasta: number) => "M" + pts.slice(0, Math.max(2, Math.round(hasta * 41))).map(([x, y]) => `${r(x)} ${r(y)}`).join(" L");
    return {
      pasos: 2,
      ms: 2000,
      dibujar: (paso, t) => {
        const prims: Primitiva[] = [{ t: "linea", x1: 40, y1: 150, x2: 285, y2: 150, stroke: "texto2", sw: 1.5 }, { t: "linea", x1: 40, y1: 20, x2: 40, y2: 150, stroke: "texto2", sw: 1.5 }];
        prims.push(texto(44, 18, "anticuerpos", { size: 9, anchor: "start", fill: "texto2" }), texto(285, 166, "tiempo →", { size: 9, anchor: "end", fill: "texto2" }));
        if (paso >= 1) prims.push({ t: "camino", d: camino(c1, paso === 1 ? suave(t) : 1), stroke: AZUL, sw: 3 }, texto(70, 100, "1.ª vez (vacuna)", { size: 9, fill: AZUL, anchor: "start" }));
        if (paso >= 2) prims.push({ t: "camino", d: camino(c2, suave(t)), stroke: VERDE, sw: 3 }, texto(200, 30, "2.ª vez: rápida y fuerte", { size: 9, fill: VERDE }));
        return dib(300, 175, prims);
      },
      leyenda: (paso) => ["Cuántos anticuerpos hay en la sangre, a lo largo del tiempo.", "La vacuna presenta el microbio sin peligro: la respuesta es lenta y chica, pero quedan células de memoria.", "Cuando llega el microbio de verdad, la respuesta es mucho más rápida y fuerte: no alcanzas a enfermarte."][paso] ?? null,
      alternativa: "Con vacuna, la segunda respuesta inmune es más rápida y más fuerte gracias a las células de memoria.",
    };
  }
  if (v.modo !== "respuesta") return null;
  const microbios = Array.from({ length: 6 }, (_, i) => ({ x: 120 + ruido(i, 7) * 120, y: 40 + ruido(i, 8) * 100 }));
  return {
    pasos: 4,
    ms: 1700,
    dibujar: (paso, t) => {
      const prims: Primitiva[] = [{ t: "rect", x: 10, y: 10, w: 280, h: 160, r: 14, fill: ROJO, op: 0.06 }];
      const vivos = paso >= 4 ? 1 - suave(t) : 1;
      microbios.forEach((m, i) => {
        if (paso === 0) return;
        const entrada = paso === 1 ? suave(limitar(t * 1.5 - i * 0.08, 0, 1)) : 1;
        const x = lerp(290, m.x, entrada);
        prims.push({ t: "circulo", cx: r(x), cy: r(m.y), r: 7, fill: VERDE_OSC, op: vivos, stroke: VERDE, sw: 2 });
        if (paso >= 3) {
          for (const a of [0, 2.1, 4.2]) {
            const ax = x + Math.cos(a) * 12;
            const ay = m.y + Math.sin(a) * 12;
            prims.push({ t: "camino", d: `M${r(ax)} ${r(ay)} l${r(Math.cos(a) * 6)} ${r(Math.sin(a) * 6)} m0 0 l-3 4 m3 -4 l3 4`, stroke: AMARILLO, sw: 2, op: vivos });
          }
        }
      });
      if (paso >= 2) for (const [x, y] of [[50, 60], [60, 130]]) prims.push({ t: "circulo", cx: r(lerp(x - 40, x, paso === 2 ? suave(t) : 1)), cy: y, r: 16, fill: "#FFFFFF", op: 0.85, stroke: "texto2", sw: 2 }, texto(lerp(x - 40, x, paso === 2 ? suave(t) : 1), y + 4, "GB", { size: 9, bold: true, fill: "#111827" }));
      return dib(300, 180, prims);
    },
    leyenda: (paso) => ["La piel y las mucosas son la primera barrera.", "Si un microbio entra, empieza a multiplicarse.", "Llegan glóbulos blancos (GB): la defensa innata, rápida y general.", "Los linfocitos fabrican anticuerpos (Y) que se pegan justo a ese microbio: la defensa adquirida.", "Los microbios marcados se eliminan, y quedan células de memoria."][paso] ?? null,
    alternativa: "Respuesta inmune: barreras, glóbulos blancos (innata) y anticuerpos específicos con memoria (adquirida).",
  };
}

// ---------- 11) Árbol de clasificación ----------
const CATEGORIAS = ["Dominio", "Reino", "Filo", "Clase", "Orden", "Familia", "Género", "Especie"];
const EJEMPLOS: Record<VisualVitaliaArbol["ejemplo"], { nombres: string[]; rasgos: string[] }> = {
  humano: { nombres: ["Eukarya", "Animalia", "Chordata", "Mammalia", "Primates", "Hominidae", "Homo", "Homo sapiens"], rasgos: ["células con núcleo", "come a otros seres vivos", "tiene columna (notocorda)", "pelo y glándulas mamarias", "manos que agarran, vista al frente", "grandes simios, sin cola", "cerebro grande, camina en dos pies", "el ser humano actual"] },
  perro: { nombres: ["Eukarya", "Animalia", "Chordata", "Mammalia", "Carnivora", "Canidae", "Canis", "Canis familiaris"], rasgos: ["células con núcleo", "come a otros seres vivos", "tiene columna (notocorda)", "pelo y glándulas mamarias", "dientes para cortar carne", "lobos, zorros y perros", "lobos y perros", "el perro doméstico"] },
  roble: { nombres: ["Eukarya", "Plantae", "Tracheophyta", "Magnoliopsida", "Fagales", "Fagaceae", "Quercus", "Quercus robur"], rasgos: ["células con núcleo", "hace fotosíntesis, pared de celulosa", "tiene vasos", "flores, semillas con dos cotiledones", "hojas simples, frutos secos", "hayas, castaños y robles", "los robles: frutos como bellotas", "el roble común"] },
};

function arbol(v: VisualVitaliaArbol): Escena | null {
  const e = EJEMPLOS[v.ejemplo];
  if (!e) return null;
  return {
    pasos: 8,
    ms: 1300,
    dibujar: (paso, t) => {
      const prims: Primitiva[] = [];
      for (let i = 0; i < paso; i++) {
        const y = 14 + i * 21;
        const w = 280 - i * 22;
        const op = i === paso - 1 ? suave(t) : 1;
        prims.push({ t: "rect", x: r(150 - w / 2), y, w: r(w), h: 18, r: 6, fill: i === 7 ? VERDE : "acento", op: (i === 7 ? 0.5 : 0.12 + i * 0.04) * op, stroke: "acento", sw: 1 });
        prims.push(texto(150, y + 13, `${CATEGORIAS[i]}: ${e.nombres[i]}`, { size: 9.5, bold: i === paso - 1 }));
      }
      return dib(300, 190, prims);
    },
    leyenda: (paso) => (paso === 0 ? "De lo más amplio a lo más específico: «Doña Reina Fue Con Once Feos Gatos Enanos»." : `${CATEGORIAS[paso - 1]} ${e.nombres[paso - 1]}: ${e.rasgos[paso - 1]}.`),
    alternativa: `Clasificación de ${v.ejemplo}: ${e.nombres.map((n, i) => `${CATEGORIAS[i]} ${n}`).join(", ")}.`,
  };
}

// ---------- 12) Reinos y clases ----------
const GRUPOS_REINOS: Record<VisualVitaliaReinos["modo"], { columnas: string[]; tarjetas: { nombre: string; col: number; rasgo: string }[] }> = {
  reinos: {
    columnas: ["Moneras", "Protistas", "Hongos", "Plantas", "Animales"],
    tarjetas: [
      { nombre: "Bacteria", col: 0, rasgo: "sin núcleo: procariota" },
      { nombre: "Ameba", col: 1, rasgo: "con núcleo, una sola célula" },
      { nombre: "Champiñón", col: 2, rasgo: "pared de quitina, absorbe su comida" },
      { nombre: "Helecho", col: 3, rasgo: "pared de celulosa, fabrica su comida" },
      { nombre: "Perro", col: 4, rasgo: "sin pared, come a otros seres vivos" },
    ],
  },
  vertebrados: {
    columnas: ["Peces", "Anfibios", "Reptiles", "Aves", "Mamíferos"],
    tarjetas: [
      { nombre: "Trucha", col: 0, rasgo: "escamas y branquias" },
      { nombre: "Rana", col: 1, rasgo: "piel desnuda y húmeda" },
      { nombre: "Iguana", col: 2, rasgo: "escamas secas" },
      { nombre: "Colibrí", col: 3, rasgo: "plumas" },
      { nombre: "Delfín", col: 4, rasgo: "pelo (al nacer) y leche materna" },
    ],
  },
  invertebrados: {
    columnas: ["Poríferos", "Cnidarios", "Moluscos", "Anélidos", "Artrópodos", "Equinod."],
    tarjetas: [
      { nombre: "Esponja", col: 0, rasgo: "cuerpo lleno de poros" },
      { nombre: "Medusa", col: 1, rasgo: "tentáculos que pican" },
      { nombre: "Pulpo", col: 2, rasgo: "cuerpo blando" },
      { nombre: "Lombriz", col: 3, rasgo: "cuerpo en anillos" },
      { nombre: "Araña", col: 4, rasgo: "patas articuladas, esqueleto externo" },
      { nombre: "Estrella", col: 5, rasgo: "piel con espinas, simetría de 5" },
    ],
  },
};

function reinos(v: VisualVitaliaReinos): Escena | null {
  const g = GRUPOS_REINOS[v.modo];
  if (!g) return null;
  const nc = g.columnas.length;
  const ancho = 290 / nc;
  return {
    pasos: g.tarjetas.length,
    ms: 1500,
    dibujar: (paso, t) => {
      const prims: Primitiva[] = [];
      g.columnas.forEach((c, i) => {
        prims.push({ t: "rect", x: r(5 + i * ancho + 2), y: 60, w: r(ancho - 4), h: 118, r: 8, fill: "acento", op: 0.08, stroke: "borde", sw: 1 });
        prims.push(texto(5 + i * ancho + ancho / 2, 74, c, { size: nc > 5 ? 7.5 : 8.5, bold: true, fill: "texto2" }));
      });
      g.tarjetas.forEach((tj, i) => {
        if (i >= paso) return;
        const k = i === paso - 1 ? suave(t) : 1;
        const x = lerp(150, 5 + tj.col * ancho + ancho / 2, k);
        const y = lerp(24, 112, k);
        prims.push({ t: "rect", x: r(x - ancho / 2 + 5), y: r(y - 12), w: r(ancho - 10), h: 24, r: 6, fill: VERDE, op: 0.3, stroke: VERDE_OSC, sw: 1.5 }, texto(x, y + 4, tj.nombre, { size: nc > 5 ? 7.5 : 9, bold: true }));
      });
      return dib(300, 185, prims);
    },
    leyenda: (paso) => (paso === 0 ? "Cada ser vivo va a su grupo según sus rasgos." : `${g.tarjetas[paso - 1].nombre}: ${g.tarjetas[paso - 1].rasgo} → ${g.columnas[g.tarjetas[paso - 1].col]}.`),
    alternativa: `Clasificación: ${g.tarjetas.map((tj) => `${tj.nombre} en ${g.columnas[tj.col]}`).join(", ")}.`,
  };
}

// ---------- 13) La línea de las plantas ----------
function plantas(): Escena {
  const etapas = [
    { nombre: "Musgo", nuevo: "sin vasos: vive en lugares húmedos y es bajito" },
    { nombre: "Helecho", nuevo: "vasos: lleva agua y crece más alto; esporas" },
    { nombre: "Pino", nuevo: "semillas desnudas, en conos (gimnosperma)" },
    { nombre: "Planta con flor", nuevo: "flor y fruto que protege la semilla (angiosperma)" },
  ];
  const dibujo = (i: number, x: number, op: number): Primitiva[] => {
    const base = 150;
    if (i === 0) return [0, 1, 2, 3].map((k) => ({ t: "camino" as const, d: `M${x - 12 + k * 8} ${base} q2 -14 ${4 - k} -20`, stroke: VERDE, sw: 3, op }));
    if (i === 1) return [{ t: "linea", x1: x, y1: base, x2: x, y2: base - 60, stroke: VERDE_OSC, sw: 3, op }, ...[0, 1, 2, 3].flatMap((k) => [{ t: "linea" as const, x1: x, y1: base - 15 - k * 12, x2: x - 18 + k * 2, y2: base - 25 - k * 12, stroke: VERDE, sw: 2.5, op }, { t: "linea" as const, x1: x, y1: base - 15 - k * 12, x2: x + 18 - k * 2, y2: base - 25 - k * 12, stroke: VERDE, sw: 2.5, op }])];
    if (i === 2) return [{ t: "rect", x: x - 3, y: base - 20, w: 6, h: 20, fill: "#92400E", op }, { t: "camino", d: `M${x} ${base - 95} L${x - 26} ${base - 20} L${x + 26} ${base - 20} Z`, fill: VERDE_OSC, op }, { t: "elipse", cx: x + 14, cy: base - 40, rx: 4, ry: 7, fill: "#92400E", op }];
    return [{ t: "linea", x1: x, y1: base, x2: x, y2: base - 60, stroke: VERDE_OSC, sw: 3, op }, ...[0, 1, 2, 3, 4].map((k) => ({ t: "circulo" as const, cx: r(x + Math.cos((k * 2 * Math.PI) / 5) * 9), cy: r(base - 68 + Math.sin((k * 2 * Math.PI) / 5) * 9), r: 6, fill: ROSA, op })), { t: "circulo", cx: x, cy: base - 68, r: 4, fill: AMARILLO, op }, { t: "circulo", cx: x + 16, cy: base - 30, r: 6, fill: ROJO, op }];
  };
  return {
    pasos: 4,
    ms: 1600,
    dibujar: (paso, t) => {
      const prims: Primitiva[] = [{ t: "linea", x1: 10, y1: 150, x2: 290, y2: 150, stroke: "#92400E", sw: 2, op: 0.6 }];
      for (let i = 0; i < paso; i++) {
        const x = 40 + i * 73;
        const op = i === paso - 1 ? suave(t) : 1;
        prims.push(...dibujo(i, x, op), texto(x, 168, etapas[i].nombre, { size: 9, bold: i === paso - 1 }));
        if (i > 0) prims.push(...flecha(x - 50, 175, x - 26, 175, "texto2", undefined, 1.5));
      }
      return dib(300, 185, prims);
    },
    leyenda: (paso) => (paso === 0 ? "Las plantas, de las más antiguas a las más nuevas: cada grupo suma algo." : `${etapas[paso - 1].nombre}: ${etapas[paso - 1].nuevo}.`),
    alternativa: "Musgos (sin vasos) → helechos (vasos) → pinos (semillas) → plantas con flor (flor y fruto).",
  };
}

// ---------- 14) Cadena y pirámide de energía ----------
function cadena(v: VisualVitaliaCadena): Escena | null {
  const es = (v.eslabones ?? []).filter((x) => typeof x === "string" && x.length > 0);
  if (es.length < 2 || es.length > 5) return null;
  const e0 = esNum(v.energia, 10, 1e7) ? v.energia : 10000;
  const niveles = es.map((_, i) => e0 / 10 ** i);
  const fmt = (n: number) => (n >= 1 ? Math.round(n).toLocaleString("es").replace(/\./g, " ") : String(n).replace(".", ","));
  return {
    pasos: es.length,
    ms: 1500,
    dibujar: (paso, t) => {
      const prims: Primitiva[] = [];
      const alto = 150 / es.length;
      for (let i = 0; i < paso; i++) {
        const w = 270 - i * (220 / es.length);
        const y = 170 - (i + 1) * alto;
        const op = i === paso - 1 ? suave(t) : 1;
        prims.push({ t: "rect", x: r(150 - w / 2), y: r(y), w: r(w), h: r(alto - 4), r: 6, fill: i === 0 ? VERDE : [AMARILLO, NARANJA, ROJO, VIOLETA][(i - 1) % 4], op: 0.55 * op });
        prims.push(texto(150, y + alto / 2 + 2, `${es[i]} · ${fmt(niveles[i])} kcal`, { size: 9.5, bold: true }));
      }
      return dib(300, 175, prims);
    },
    leyenda: (paso) =>
      paso === 0
        ? "La energía entra por los productores y sube por la cadena."
        : paso === 1
          ? `${es[0]} (productor): ${fmt(niveles[0])} kcal.`
          : `${es[paso - 1]}: solo le llega el 10 %, ${fmt(niveles[paso - 1])} kcal. El resto se gasta en vivir y se pierde como calor.`,
    alternativa: `Pirámide de energía: ${es.map((x, i) => `${x} ${fmt(niveles[i])} kcal`).join(", ")}; en cada nivel queda el 10 %.`,
  };
}

export function escenaVitalia(v: VisualVitalia): Escena | null {
  switch (v.tipo) {
    case "vitalia.celula":
      return celula(v);
    case "vitalia.membrana":
      return membrana(v);
    case "vitalia.division":
      return division(v);
    case "vitalia.energia":
      return energia(v);
    case "vitalia.adn":
      return adn(v);
    case "vitalia.punnett":
      return punnett(v);
    case "vitalia.pedigri":
      return pedigri(v);
    case "vitalia.recorrido":
      return recorrido(v);
    case "vitalia.hormona":
      return hormona(v);
    case "vitalia.defensa":
      return defensa(v);
    case "vitalia.arbol":
      return arbol(v);
    case "vitalia.reinos":
      return reinos(v);
    case "vitalia.plantas":
      return plantas();
    case "vitalia.cadena":
      return cadena(v);
    default:
      return null;
  }
}
