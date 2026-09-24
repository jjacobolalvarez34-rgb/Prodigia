import { contarAtomos } from "./formulas";

// Motor de química orgánica de nivel colegio para las lecciones de la tanda 2
// de Quimia y los visuales "quimia.cadena", "quimia.grupos", "quimia.isomeria"
// y "quimia.hibridacion". Ninguna fórmula ni nombre de esas lecciones se
// escribe a mano: cada molécula se describe con su conectividad (una notación
// SMILES mínima: átomos C, O, N, F, Cl, Br, I; enlaces =, #; ramas y anillos),
// y de ahí se CALCULAN los hidrógenos (el carbono siempre hace 4 enlaces), la
// fórmula molecular, el nombre IUPAC, los grupos funcionales, la hibridación
// y el dibujo. organica.test.ts contrasta los resultados con una tabla de
// nombres y fórmulas curada aparte y con el banco de la práctica.
//
// SIMPLIFICACIONES de nivel colegio (se avisan en las lecciones):
//  - cadena principal: la que contiene el grupo principal, después la de
//    más enlaces múltiples y después la más larga (regla que se enseña en el
//    colegio; las recomendaciones IUPAC de 2013 priorizan la longitud);
//  - solo un grupo principal por molécula (con prefijos para los demás), sin
//    radicales complejos (solo lineales, isopropil y terc-butil), sin
//    compuestos policíclicos ni estereoquímica R/S;
//  - los dibujos son ESQUELETOS 2D esquemáticos: los ángulos son los de un
//    plano (120° en zigzag), no una geometría tridimensional real.

export type Elemento = "C" | "O" | "N" | "F" | "Cl" | "Br" | "I";
const VALENCIA: Record<Elemento, number> = { C: 4, O: 2, N: 3, F: 1, Cl: 1, Br: 1, I: 1 };
const HALOGENOS: Elemento[] = ["F", "Cl", "Br", "I"];
const NOMBRE_HALOGENO: Record<string, string> = { F: "fluoro", Cl: "cloro", Br: "bromo", I: "yodo" };

export interface EnlaceMol {
  a: number;
  b: number;
  orden: 1 | 2 | 3;
}
export interface Molecula {
  atomos: Elemento[];
  enlaces: EnlaceMol[];
  ady: { v: number; orden: 1 | 2 | 3 }[][];
}

// ---------- SMILES mínimo ----------

export function desdeSmiles(smiles: string): Molecula {
  const atomos: Elemento[] = [];
  const enlaces: EnlaceMol[] = [];
  const pila: number[] = [];
  const anillos = new Map<string, { atomo: number; orden: 1 | 2 | 3 }>();
  let previo = -1;
  let orden: 1 | 2 | 3 = 1;
  const unir = (a: number, b: number, o: 1 | 2 | 3) => enlaces.push({ a, b, orden: o });
  for (let i = 0; i < smiles.length; i++) {
    const c = smiles[i];
    let el: Elemento | null = null;
    if (c === "C" && smiles[i + 1] === "l") {
      el = "Cl";
      i++;
    } else if (c === "B" && smiles[i + 1] === "r") {
      el = "Br";
      i++;
    } else if ("CONFI".includes(c)) el = c as Elemento;
    if (el) {
      const idx = atomos.length;
      atomos.push(el);
      if (previo >= 0) unir(previo, idx, orden);
      previo = idx;
      orden = 1;
    } else if (c === "=") orden = 2;
    else if (c === "#") orden = 3;
    else if (c === "(") pila.push(previo);
    else if (c === ")") {
      const p = pila.pop();
      if (p === undefined) throw new Error(`SMILES mal formado: ${smiles}`);
      previo = p;
    } else if (/\d/.test(c)) {
      const abierto = anillos.get(c);
      if (abierto) {
        unir(abierto.atomo, previo, (abierto.orden > orden ? abierto.orden : orden) as 1 | 2 | 3);
        anillos.delete(c);
      } else anillos.set(c, { atomo: previo, orden });
      orden = 1;
    } else throw new Error(`Carácter no soportado «${c}» en ${smiles}`);
  }
  if (pila.length > 0 || anillos.size > 0) throw new Error(`SMILES mal formado: ${smiles}`);
  const ady: Molecula["ady"] = atomos.map(() => []);
  for (const e of enlaces) {
    ady[e.a].push({ v: e.b, orden: e.orden });
    ady[e.b].push({ v: e.a, orden: e.orden });
  }
  const m: Molecula = { atomos, enlaces, ady };
  for (let i = 0; i < atomos.length; i++) if (hidrogenos(m, i) < 0) throw new Error(`Valencia excedida en el átomo ${i} (${atomos[i]}) de ${smiles}`);
  return m;
}

// Hidrógenos implícitos: los que faltan para completar la valencia (el
// carbono tiene siempre 4 enlaces).
export function hidrogenos(m: Molecula, i: number): number {
  return VALENCIA[m.atomos[i]] - m.ady[i].reduce((a, x) => a + x.orden, 0);
}

export function formulaMolecular(m: Molecula): Record<string, number> {
  const t: Record<string, number> = {};
  for (let i = 0; i < m.atomos.length; i++) {
    t[m.atomos[i]] = (t[m.atomos[i]] ?? 0) + 1;
    const h = hidrogenos(m, i);
    if (h > 0) t.H = (t.H ?? 0) + h;
  }
  return t;
}

// "C2H6O" en orden de Hill (C, H y el resto alfabético).
export function formulaHill(m: Molecula): string {
  const t = formulaMolecular(m);
  const resto = Object.keys(t).filter((s) => s !== "C" && s !== "H").sort();
  return [...(t.C ? ["C"] : []), ...(t.H ? ["H"] : []), ...resto].map((s) => `${s}${t[s] > 1 ? t[s] : ""}`).join("");
}

export function igualesFormula(a: Record<string, number>, b: Record<string, number>): boolean {
  const claves = new Set([...Object.keys(a), ...Object.keys(b)]);
  for (const k of claves) if ((a[k] ?? 0) !== (b[k] ?? 0)) return false;
  return true;
}

function esCiclica(m: Molecula): boolean {
  return m.enlaces.length >= m.atomos.length;
}

// ---------- Grupos funcionales ----------

export type IdGrupo = "alqueno" | "alquino" | "aromatico" | "alcohol" | "eter" | "aldehido" | "cetona" | "acido" | "ester" | "amina" | "amida" | "haluro";

export interface GrupoDetectado {
  id: IdGrupo;
  // Átomos que forman el grupo (índices), para resaltarlo en el dibujo.
  atomos: number[];
}

const vecinosC = (m: Molecula, i: number) => m.ady[i].filter((x) => m.atomos[x.v] === "C");
const dobleO = (m: Molecula, i: number) => m.ady[i].find((x) => m.atomos[x.v] === "O" && x.orden === 2)?.v;

function anilloBenceno(m: Molecula): number[] | null {
  const ciclo = encontrarAnillo(m);
  if (!ciclo || ciclo.length !== 6 || !ciclo.every((i) => m.atomos[i] === "C")) return null;
  let dobles = 0;
  for (let k = 0; k < 6; k++) {
    const a = ciclo[k];
    const b = ciclo[(k + 1) % 6];
    const e = m.ady[a].find((x) => x.v === b);
    if (e?.orden === 2) dobles++;
  }
  return dobles === 3 ? ciclo : null;
}

// Un anillo (el primero que se encuentra) como lista ordenada de átomos.
export function encontrarAnillo(m: Molecula): number[] | null {
  const n = m.atomos.length;
  const padre = new Array<number>(n).fill(-2);
  const profundidad = new Array<number>(n).fill(0);
  let ciclo: number[] | null = null;
  const dfs = (u: number, p: number) => {
    padre[u] = p;
    for (const { v } of m.ady[u]) {
      if (ciclo) return;
      if (v === p) continue;
      if (padre[v] !== -2) {
        if (profundidad[v] < profundidad[u]) {
          const c: number[] = [];
          let x = u;
          while (x !== v) {
            c.push(x);
            x = padre[x];
          }
          c.push(v);
          ciclo = c.reverse();
        }
        continue;
      }
      profundidad[v] = profundidad[u] + 1;
      dfs(v, u);
    }
  };
  for (let s = 0; s < n && !ciclo; s++) if (padre[s] === -2) dfs(s, -1);
  return ciclo;
}

export function gruposFuncionales(m: Molecula): GrupoDetectado[] {
  const r: GrupoDetectado[] = [];
  const benceno = anilloBenceno(m);
  if (benceno) r.push({ id: "aromatico", atomos: benceno });
  for (const e of m.enlaces) {
    if (m.atomos[e.a] === "C" && m.atomos[e.b] === "C") {
      const enBenceno = benceno && benceno.includes(e.a) && benceno.includes(e.b);
      if (e.orden === 2 && !enBenceno) r.push({ id: "alqueno", atomos: [e.a, e.b] });
      if (e.orden === 3) r.push({ id: "alquino", atomos: [e.a, e.b] });
    }
  }
  for (let i = 0; i < m.atomos.length; i++) {
    const el = m.atomos[i];
    if (el === "C") {
      const o = dobleO(m, i);
      if (o !== undefined) {
        const otros = m.ady[i].filter((x) => x.v !== o);
        const oSimple = otros.find((x) => m.atomos[x.v] === "O" && x.orden === 1);
        const nSimple = otros.find((x) => m.atomos[x.v] === "N" && x.orden === 1);
        if (oSimple) {
          const otroC = m.ady[oSimple.v].filter((x) => x.v !== i);
          if (otroC.length === 0) r.push({ id: "acido", atomos: [i, o, oSimple.v] });
          else r.push({ id: "ester", atomos: [i, o, oSimple.v] });
        } else if (nSimple) r.push({ id: "amida", atomos: [i, o, nSimple.v] });
        else if (vecinosC(m, i).length <= 1) r.push({ id: "aldehido", atomos: [i, o] });
        else r.push({ id: "cetona", atomos: [i, o] });
      }
    } else if (el === "O") {
      const vec = m.ady[i].filter((x) => x.orden === 1);
      if (m.ady[i].length === 1 && vec.length === 1 && m.atomos[vec[0].v] === "C" && dobleO(m, vec[0].v) === undefined) r.push({ id: "alcohol", atomos: [vec[0].v, i] });
      if (m.ady[i].length === 2 && m.ady[i].every((x) => m.atomos[x.v] === "C" && dobleO(m, x.v) === undefined)) r.push({ id: "eter", atomos: [m.ady[i][0].v, i, m.ady[i][1].v] });
    } else if (el === "N") {
      const cs = m.ady[i].filter((x) => m.atomos[x.v] === "C" && x.orden === 1);
      if (cs.length > 0 && cs.every((x) => dobleO(m, x.v) === undefined)) r.push({ id: "amina", atomos: [...cs.map((x) => x.v), i] });
    } else if (HALOGENOS.includes(el)) {
      const c = m.ady[i][0]?.v;
      if (c !== undefined && m.atomos[c] === "C") r.push({ id: "haluro", atomos: [c, i] });
    }
  }
  return r;
}

// ---------- Hibridación del carbono ----------

export type Hibridacion = "sp3" | "sp2" | "sp";
export interface InfoHibridacion {
  // Enlaces sigma (incluye los de H) y pi del carbono.
  sigma: number;
  pi: number;
  hibridacion: Hibridacion;
  // Geometría de la zona alrededor del carbono y ángulo aproximado.
  angulo: number;
}

// sigma = vecinos (con los hidrógenos implícitos); pi = enlaces "extra". Un
// carbono con 4 sigma es sp³, con 3 es sp² y con 2 es sp.
export function hibridacionDe(m: Molecula, i: number): InfoHibridacion {
  if (m.atomos[i] !== "C") throw new Error("Solo se calcula la hibridación del carbono");
  const h = hidrogenos(m, i);
  const sigma = m.ady[i].length + h;
  const pi = m.ady[i].reduce((a, x) => a + (x.orden - 1), 0);
  if (sigma === 4) return { sigma, pi, hibridacion: "sp3", angulo: 109.5 };
  if (sigma === 3) return { sigma, pi, hibridacion: "sp2", angulo: 120 };
  if (sigma === 2) return { sigma, pi, hibridacion: "sp", angulo: 180 };
  throw new Error(`Hibridación no prevista (sigma = ${sigma})`);
}

// ---------- Nombres IUPAC (cadenas abiertas y anillos simples) ----------

const RAIZ = ["", "met", "et", "prop", "but", "pent", "hex", "hept", "oct", "non", "dec", "undec", "dodec"];
const RADICAL = ["", "metil", "etil", "propil", "butil", "pentil", "hexil", "heptil", "octil"];
const ALCOXI = ["", "metoxi", "etoxi", "propoxi", "butoxi", "pentoxi", "hexoxi", "heptoxi", "octoxi"];
const MULT = ["", "", "di", "tri", "tetra", "penta", "hexa", "hepta", "octa"];

interface Rama {
  // Posición (1-based) en la cadena numerada.
  pos: number;
  nombre: string;
}

// Radical (rama de carbonos) que sale de `raiz` sin volver a `desde`.
function nombreRadical(m: Molecula, raiz: number, desde: number): string {
  const hijos = (i: number, p: number) => m.ady[i].filter((x) => x.v !== p);
  const recolectar = (i: number, p: number, acc: number[]) => {
    acc.push(i);
    for (const x of hijos(i, p)) recolectar(x.v, i, acc);
  };
  const todos: number[] = [];
  recolectar(raiz, desde, todos);
  if (!todos.every((i) => m.atomos[i] === "C") || m.enlaces.some((e) => todos.includes(e.a) && todos.includes(e.b) && e.orden !== 1)) {
    throw new Error("Radical con heteroátomos o enlaces múltiples: no soportado");
  }
  const h0 = hijos(raiz, desde);
  if (todos.length === 3 && h0.length === 2 && h0.every((x) => hijos(x.v, raiz).length === 0)) return "isopropil";
  if (todos.length === 4 && h0.length === 3 && h0.every((x) => hijos(x.v, raiz).length === 0)) return "terc-butil";
  let n = 0;
  let cur = raiz;
  let p = desde;
  for (;;) {
    n++;
    const h = hijos(cur, p);
    if (h.length === 0) break;
    if (h.length > 1) throw new Error("Radical ramificado: no soportado");
    p = cur;
    cur = h[0].v;
  }
  return RADICAL[n];
}

function nombreAlquilo(m: Molecula, raiz: number, desde: number): string {
  const r = nombreRadical(m, raiz, desde);
  if (r === "isopropil") return "isopropilo";
  if (r === "terc-butil") return "terc-butilo";
  return r.replace(/il$/, "ilo");
}

function nombreAlcoxi(m: Molecula, raiz: number, desde: number): string {
  const r = nombreRadical(m, raiz, desde);
  const i = RADICAL.indexOf(r);
  if (i < 0) throw new Error(`Alcoxi no soportado: ${r}`);
  return ALCOXI[i];
}

// Nombre de un sustituyente unido a la cadena por el átomo `raiz` (que sale
// de `desde`, con enlace `orden`).
function nombreSustituyente(m: Molecula, raiz: number, desde: number, orden: number): string {
  const el = m.atomos[raiz];
  if (HALOGENOS.includes(el)) return NOMBRE_HALOGENO[el];
  if (el === "C") return nombreRadical(m, raiz, desde);
  if (el === "O") {
    const otros = m.ady[raiz].filter((x) => x.v !== desde);
    if (orden === 2 && otros.length === 0) return "oxo";
    if (otros.length === 0) return "hidroxi";
    if (otros.length === 1 && m.atomos[otros[0].v] === "C") return nombreAlcoxi(m, otros[0].v, raiz);
    throw new Error("Sustituyente con O no soportado");
  }
  if (el === "N") {
    if (m.ady[raiz].length === 1) return "amino";
    throw new Error("Amina sustituida: no soportada");
  }
  throw new Error(`Sustituyente no soportado: ${el}`);
}

function claveAlfabetica(nombre: string): string {
  return nombre.replace(/^terc-/, "").replace(/^sec-/, "");
}

export type TipoPrincipal = "acido" | "ester" | "amida" | "aldehido" | "cetona" | "alcohol" | "amina" | "ninguno";
const PRIORIDAD: TipoPrincipal[] = ["acido", "ester", "amida", "aldehido", "cetona", "alcohol", "amina"];

export interface ResultadoNombre {
  nombre: string;
  // El nombre partido en prefijos (localizadores y radicales) y cuerpo
  // (raíz, insaturaciones y terminación), para los visuales.
  partes: { prefijos: string; cuerpo: string; acido: boolean };
  // Átomos de la cadena principal, en el orden de la numeración (posición 1 = índice 0).
  cadena: number[];
  principal: TipoPrincipal;
  // Sustituyentes con su posición y el átomo del que salen.
  ramas: (Rama & { atomo: number })[];
  // Posiciones (1-based) de los enlaces dobles y triples (primer carbono).
  dobles: number[];
  triples: number[];
  // Posiciones del grupo principal.
  posPrincipal: number[];
}

interface Candidato {
  path: number[]; // ya en el sentido de la numeración
  principales: number[]; // posiciones
  dobles: number[];
  triples: number[];
  ramas: (Rama & { atomo: number })[];
}

function todosLosCaminos(m: Molecula, permitidos: (i: number) => boolean): number[][] {
  const caminos: number[][] = [];
  const carbonos = m.atomos.map((e, i) => (e === "C" && permitidos(i) ? i : -1)).filter((i) => i >= 0);
  const dfs = (camino: number[]) => {
    caminos.push([...camino]);
    const u = camino[camino.length - 1];
    for (const { v } of m.ady[u]) {
      if (m.atomos[v] !== "C" || !permitidos(v) || camino.includes(v)) continue;
      camino.push(v);
      dfs(camino);
      camino.pop();
    }
  };
  for (const c of carbonos) dfs([c]);
  return caminos;
}

function grupoPrincipalDe(m: Molecula): { tipo: TipoPrincipal; carbonos: number[]; atomosGrupo: Set<number> } {
  const gr = gruposFuncionales(m);
  for (const tipo of PRIORIDAD) {
    const g = gr.filter((x) => x.id === tipo);
    if (g.length > 0) {
      const carbonos = g.map((x) => (tipo === "alcohol" || tipo === "amina" ? x.atomos.find((a) => m.atomos[a] === "C")! : x.atomos[0]));
      const atomosGrupo = new Set<number>();
      for (const x of g) for (const a of x.atomos) if (m.atomos[a] !== "C") atomosGrupo.add(a);
      // amina: solo la amina primaria (un único carbono)
      if (tipo === "amina" && g.some((x) => x.atomos.length !== 2)) throw new Error("Amina secundaria o terciaria: no soportada");
      return { tipo, carbonos, atomosGrupo };
    }
  }
  return { tipo: "ninguno", carbonos: [], atomosGrupo: new Set() };
}

function comparar(a: number[], b: number[]): number {
  for (let i = 0; i < Math.min(a.length, b.length); i++) if (a[i] !== b[i]) return a[i] - b[i];
  return a.length - b.length;
}

// Une posiciones con comas: [2, 3] -> "2,3".
const locs = (p: number[]) => [...p].sort((a, b) => a - b).join(",");

function armarPartes(m: Molecula, c: Candidato, tipo: TipoPrincipal): { acido: boolean; prefijos: string; cuerpo: string } {
  const n = c.path.length;
  const dobles = c.dobles;
  const triples = c.triples;
  const nMult = dobles.length + triples.length;
  const nRamas = c.ramas.length;

  // Prefijos (sustituyentes) por orden alfabético.
  const grupos = new Map<string, number[]>();
  for (const r of c.ramas) grupos.set(r.nombre, [...(grupos.get(r.nombre) ?? []), r.pos]);
  const nombres = [...grupos.keys()].sort((x, y) => claveAlfabetica(x).localeCompare(claveAlfabetica(y), "es"));
  const sinLocPrefijos = n === 1 || (n === 2 && nRamas === 1 && tipo === "ninguno" && nMult === 0);
  const prefijos = nombres
    .map((nom) => {
      const pos = grupos.get(nom)!;
      const mult = MULT[pos.length] ?? "";
      return sinLocPrefijos ? `${mult}${nom}` : `${locs(pos)}-${mult}${nom}`;
    })
    .join("-");

  // Raíz + insaturaciones.
  const raiz = RAIZ[n];
  if (!raiz) throw new Error(`Cadena demasiado larga: ${n}`);
  const soloUnaInsaturacion = nMult === 1;
  const sinLocMulti = tipo === "ninguno" && nRamas === 0 && n <= 3 && soloUnaInsaturacion;
  let base = raiz;
  if (nMult === 0) base += "an";
  else {
    const primero = dobles.length > 0 ? dobles.length : triples.length;
    if (primero > 1) base += "a";
    if (dobles.length > 0) base += `${sinLocMulti ? "" : `-${locs(dobles)}-`}${MULT[dobles.length] ?? ""}en`;
    if (triples.length > 0) base += `${sinLocMulti ? "" : `-${locs(triples)}-`}${triples.length > 1 ? MULT[triples.length] : ""}in`;
  }

  // Sufijo del grupo principal.
  const posP = c.principales;
  const k = posP.length;
  let cuerpo: string;
  const terminal = tipo === "acido" || tipo === "aldehido" || tipo === "amida" || tipo === "ester";
  if (tipo === "ninguno") cuerpo = `${base}o`;
  else if (terminal) {
    if (k > 1) throw new Error("Grupo terminal repetido: no soportado");
    const suf = tipo === "acido" ? "oico" : tipo === "aldehido" ? "al" : tipo === "amida" ? "amida" : "oato";
    cuerpo = `${base}${suf}`;
  } else {
    const suf = tipo === "alcohol" ? "ol" : tipo === "cetona" ? "ona" : "amina";
    const multS = k > 1 ? MULT[k] : "";
    // Se omite el localizador cuando es único y no hay nada más en la molécula.
    const clases = tipo === "cetona" ? Math.ceil((n - 2) / 2) : Math.ceil(n / 2);
    const sinLocSufijo = k === 1 && nRamas === 0 && nMult === 0 && clases === 1;
    const conVocal = !multS && /^[aeiou]/.test(suf);
    const baseSuf = conVocal ? base : `${base}o`;
    cuerpo = sinLocSufijo ? `${baseSuf}${multS}${suf}` : `${baseSuf}-${locs(posP)}-${multS}${suf}`;
  }
  return { acido: tipo === "acido", prefijos, cuerpo };
}

function armarNombre(m: Molecula, c: Candidato, tipo: TipoPrincipal): string {
  const p = armarPartes(m, c, tipo);
  return `${p.acido ? "ácido " : ""}${p.prefijos}${p.cuerpo}`;
}

// Candidatos (cadena + sentido) de una molécula abierta que cumplen los
// criterios de cadena principal. Los nombres de los sustituyentes se piden
// SOLO para la cadena elegida (una cadena descartada puede tener una rama que
// el motor no sabe nombrar, y no importa).
interface RamaCruda {
  pos: number;
  atomo: number;
  desde: number;
  orden: number;
}
interface CandidatoCrudo {
  path: number[];
  principales: number[];
  dobles: number[];
  triples: number[];
  ramas: RamaCruda[];
}

function elegirCadena(m: Molecula, restringir: (i: number) => boolean, principalesAtomos: Set<number>, carbonosPrincipales: number[], excluidos: Set<number>): Candidato {
  const caminos = todosLosCaminos(m, restringir);
  const evaluar = (path: number[]): CandidatoCrudo => {
    const pos = new Map<number, number>();
    path.forEach((a, i) => pos.set(a, i + 1));
    const principales = carbonosPrincipales.filter((c) => pos.has(c)).map((c) => pos.get(c)!);
    const dobles: number[] = [];
    const triples: number[] = [];
    for (let i = 0; i < path.length - 1; i++) {
      const e = m.ady[path[i]].find((x) => x.v === path[i + 1])!;
      if (e.orden === 2) dobles.push(i + 1);
      if (e.orden === 3) triples.push(i + 1);
    }
    const ramas: RamaCruda[] = [];
    for (let i = 0; i < path.length; i++) {
      for (const x of m.ady[path[i]]) {
        if (pos.has(x.v) || excluidos.has(x.v) || principalesAtomos.has(x.v)) continue;
        ramas.push({ pos: i + 1, atomo: x.v, desde: path[i], orden: x.orden });
      }
    }
    return { path, principales, dobles, triples, ramas };
  };
  let cands = caminos.map(evaluar);
  const maximo = (f: (c: CandidatoCrudo) => number) => {
    const mx = Math.max(...cands.map(f));
    cands = cands.filter((c) => f(c) === mx);
  };
  maximo((c) => c.principales.length);
  maximo((c) => c.dobles.length + c.triples.length);
  maximo((c) => c.path.length);
  maximo((c) => c.ramas.length);
  // Los dos sentidos de cada camino, ya con los nombres de las ramas.
  const dirs: Candidato[] = [];
  for (const c of cands) {
    const n = c.path.length;
    const inv = (p: number) => n + 1 - p;
    const nombres = c.ramas.map((r) => {
      if (m.atomos[r.atomo] === "C" && r.orden !== 1) throw new Error("Rama unida por un enlace múltiple: no soportada");
      return nombreSustituyente(m, r.atomo, r.desde, r.orden);
    });
    dirs.push({ path: c.path, principales: c.principales, dobles: c.dobles, triples: c.triples, ramas: c.ramas.map((r, i) => ({ pos: r.pos, nombre: nombres[i], atomo: r.atomo })) });
    // En el sentido inverso, un enlace múltiple entre i e i+1 pasa a estar entre n-i y n-i+1.
    dirs.push({
      path: [...c.path].reverse(),
      principales: c.principales.map(inv),
      dobles: c.dobles.map((p) => inv(p) - 1),
      triples: c.triples.map((p) => inv(p) - 1),
      ramas: c.ramas.map((r, i) => ({ pos: inv(r.pos), nombre: nombres[i], atomo: r.atomo })),
    });
  }
  const clave = (c: Candidato): number[][] => {
    const porNombre = [...c.ramas].sort((x, y) => claveAlfabetica(x.nombre).localeCompare(claveAlfabetica(y.nombre), "es") || x.pos - y.pos);
    return [
      [...c.principales].sort((a, b) => a - b),
      [...c.dobles, ...c.triples].sort((a, b) => a - b),
      [...c.dobles].sort((a, b) => a - b),
      c.ramas.map((r) => r.pos).sort((a, b) => a - b),
      porNombre.map((r) => r.pos),
    ];
  };
  dirs.sort((x, y) => {
    const kx = clave(x);
    const ky = clave(y);
    for (let i = 0; i < kx.length; i++) {
      const d = comparar(kx[i], ky[i]);
      if (d !== 0) return d;
    }
    return 0;
  });
  return dirs[0];
}

function resultadoDe(m: Molecula, c: Candidato, tipo: TipoPrincipal, nombre: string): ResultadoNombre {
  return {
    nombre,
    partes: armarPartes(m, c, tipo),
    cadena: c.path,
    principal: tipo,
    ramas: c.ramas.map((r) => ({ pos: r.pos, nombre: r.nombre, atomo: r.atomo })),
    dobles: c.dobles,
    triples: c.triples,
    posPrincipal: c.principales,
  };
}

// Nombre de un éster: cadena del ácido (que lleva el C=O) + "de" + el alquilo.
function nombrarEster(m: Molecula): ResultadoNombre {
  const gr = gruposFuncionales(m).filter((g) => g.id === "ester");
  if (gr.length !== 1) throw new Error("Solo se soporta un éster");
  const [acilo, oCarbonilo, oEster] = gr[0].atomos;
  const alquiloRaiz = m.ady[oEster].find((x) => x.v !== acilo)!.v;
  // Todo lo que cuelga del O del éster (el alquilo) queda fuera de la cadena del ácido.
  const alquilo = new Set<number>();
  const recolectar = (i: number, p: number) => {
    alquilo.add(i);
    for (const x of m.ady[i]) if (x.v !== p) recolectar(x.v, i);
  };
  recolectar(alquiloRaiz, oEster);
  const excluidos = new Set<number>([oCarbonilo, oEster, ...alquilo]);
  const cand = elegirCadena(m, (i) => !alquilo.has(i), new Set(), [acilo], excluidos);
  const nombreAcilo = armarNombre(m, cand, "ester");
  const nombre = `${nombreAcilo} de ${nombreAlquilo(m, alquiloRaiz, oEster)}`;
  return resultadoDe(m, cand, "ester", nombre);
}

export function nombrarAbierta(m: Molecula): ResultadoNombre {
  if (esCiclica(m)) throw new Error("La molécula tiene un anillo");
  if (!m.atomos.includes("C")) throw new Error("Sin carbono");
  const { tipo, carbonos, atomosGrupo } = grupoPrincipalDe(m);
  if (tipo === "ester") return nombrarEster(m);
  const cand = elegirCadena(m, () => true, atomosGrupo, carbonos, new Set());
  return resultadoDe(m, cand, tipo, armarNombre(m, cand, tipo));
}

// Anillos: cicloalcanos, cicloalquenos, benceno y derivados simples (con
// sustituyentes alquilo, halógeno u OH).
export function nombrarAnillo(m: Molecula): { nombre: string; anillo: number[] } {
  const anillo = encontrarAnillo(m);
  if (!anillo || !anillo.every((i) => m.atomos[i] === "C")) throw new Error("Anillo no soportado");
  if (m.enlaces.length !== m.atomos.length) throw new Error("Más de un anillo: no soportado");
  const n = anillo.length;
  const benceno = anilloBenceno(m) !== null;
  const enAnillo = new Set(anillo);
  const dobles: number[] = [];
  for (let k = 0; k < n; k++) {
    const e = m.ady[anillo[k]].find((x) => x.v === anillo[(k + 1) % n])!;
    if (e.orden === 2) dobles.push(k);
  }
  // Sustituyentes por posición (índice dentro de `anillo`).
  const ramas: { k: number; nombre: string; atomo: number }[] = [];
  anillo.forEach((a, k) => {
    for (const x of m.ady[a]) if (!enAnillo.has(x.v)) ramas.push({ k, nombre: nombreSustituyente(m, x.v, a, x.orden), atomo: x.v });
  });
  // Fenol: OH sobre benceno es el grupo principal ("fenol").
  const fenol = benceno && ramas.some((r) => r.nombre === "hidroxi");
  const efectivas = fenol ? ramas.filter((r) => r.nombre !== "hidroxi") : ramas;
  const hidroxi = fenol ? ramas.find((r) => r.nombre === "hidroxi")! : null;
  // Todas las numeraciones posibles (punto de partida y sentido).
  const opciones: { pos: (k: number) => number }[] = [];
  for (let s = 0; s < n; s++) {
    opciones.push({ pos: (k) => ((k - s + n) % n) + 1 });
    opciones.push({ pos: (k) => ((s - k + n) % n) + 1 });
  }
  const evalua = (o: { pos: (k: number) => number }) => {
    const l = [
      ...(hidroxi ? [o.pos(hidroxi.k)] : []).sort((a, b) => a - b),
    ];
    const dob = dobles.map((k) => Math.min(o.pos(k), o.pos((k + 1) % n))).sort((a, b) => a - b);
    const sub = efectivas.map((r) => o.pos(r.k)).sort((a, b) => a - b);
    const porNombre = [...efectivas].sort((x, y) => claveAlfabetica(x.nombre).localeCompare(claveAlfabetica(y.nombre), "es")).map((r) => o.pos(r.k));
    return { l, dob: benceno ? [] : dob, sub, porNombre };
  };
  const elegido = opciones
    .map((o) => ({ o, e: evalua(o) }))
    .filter((x) => {
      // El primer doble enlace de un cicloalqueno va entre 1 y 2.
      return benceno || dobles.length === 0 || x.e.dob.length === 0 || x.e.dob[0] === 1;
    })
    .sort((x, y) => comparar(x.e.l, y.e.l) || comparar(x.e.dob, y.e.dob) || comparar(x.e.sub, y.e.sub) || comparar(x.e.porNombre, y.e.porNombre))[0];
  const grupos = new Map<string, number[]>();
  for (const r of efectivas) grupos.set(r.nombre, [...(grupos.get(r.nombre) ?? []), elegido.o.pos(r.k)]);
  const nombres = [...grupos.keys()].sort((x, y) => claveAlfabetica(x).localeCompare(claveAlfabetica(y), "es"));
  const sinLoc = efectivas.length === 1 && !fenol && (benceno || dobles.length === 0);
  const prefijos = nombres.map((nom) => `${sinLoc ? "" : `${locs(grupos.get(nom)!)}-`}${MULT[grupos.get(nom)!.length] ?? ""}${nom}`).join("-");
  let base: string;
  if (benceno) base = fenol ? "fenol" : "benceno";
  else {
    const raiz = RAIZ[n];
    if (dobles.length === 0) base = `ciclo${raiz}ano`;
    else if (dobles.length === 1) base = `ciclo${raiz}eno`;
    else throw new Error("Cicloalqueno con más de un doble enlace: no soportado");
  }
  return { nombre: `${prefijos}${base}`, anillo };
}

export function nombreIUPAC(m: Molecula): string {
  return esCiclica(m) ? nombrarAnillo(m).nombre : nombrarAbierta(m).nombre;
}

// ---------- Fórmula condensada (semidesarrollada) ----------

// Texto de un sustituyente: OH, NH2, Cl, CH3, CH2CH3, CH(CH3)2, OCH3...
function textoRama(m: Molecula, i: number, desde: number): string {
  const el = m.atomos[i];
  const h = hidrogenos(m, i);
  const base = `${el}${h > 0 ? `H${h > 1 ? h : ""}` : ""}`;
  const partes = m.ady[i].filter((x) => x.v !== desde).map((x) => textoRama(m, x.v, i));
  if (partes.length === 0) return base;
  if (partes.length === 1) return `${base}${partes[0]}`;
  return `${base}${agrupar(partes)}`;
}

// Ramas iguales se agrupan: (CH3)(CH3) -> (CH3)2.
function agrupar(partes: string[]): string {
  const cuenta = new Map<string, number>();
  for (const p of partes) cuenta.set(p, (cuenta.get(p) ?? 0) + 1);
  return [...cuenta.entries()].map(([p, n]) => `(${p})${n > 1 ? n : ""}`).join("");
}

function textoCarbonoCadena(m: Molecula, i: number, cadena: number[], k: number): string {
  const enCadena = new Set(cadena);
  const otros = m.ady[i].filter((x) => !enCadena.has(x.v));
  const h = hidrogenos(m, i);
  const terminal = k === 0 || k === cadena.length - 1;
  const oxo = otros.find((x) => m.atomos[x.v] === "O" && x.orden === 2 && m.ady[x.v].length === 1);
  if (oxo) {
    const resto = otros.filter((x) => x !== oxo);
    if (terminal && cadena.length >= 1) {
      // Aldehído (CHO), ácido (COOH), amida (CONH2) y éster (COO...).
      const hh = h > 0 ? `H${h > 1 ? h : ""}` : "";
      if (resto.length === 0) return `C${hh}O`;
      const r = resto[0];
      if (m.atomos[r.v] === "O" && m.ady[r.v].length === 1) return `${h > 0 ? "H" : ""}COOH`;
      if (m.atomos[r.v] === "N") return `${h > 0 ? "H" : ""}CONH2`;
      if (m.atomos[r.v] === "O") return `${h > 0 ? "H" : ""}COO`;
    }
    return "CO";
  }
  const hh = h > 0 ? `H${h > 1 ? h : ""}` : "";
  const partes = otros.map((x) => textoRama(m, x.v, i));
  if (partes.length === 0) return `C${hh}`;
  if (terminal && partes.length === 1) return `C${hh}${partes[0]}`;
  return `C${hh}${agrupar(partes)}`;
}

// "CH3-CH(CH3)-CH2-CH3": la cadena principal con las ramas entre paréntesis
// (con "=" y "≡" en los enlaces múltiples). Para un éster escribe también el alquilo.
export function formulaCondensada(m: Molecula): string {
  const r = nombrarAbierta(m);
  // Se escribe con el grupo terminal a la derecha (CH3-CH2OH, CH3-COOH, CH3-CHO):
  // al revés que la numeración, que empieza por el grupo principal.
  const terminales: TipoPrincipal[] = ["acido", "aldehido", "amida", "alcohol", "amina", "ester"];
  const invertir = r.cadena.length > 1 && terminales.includes(r.principal) && r.posPrincipal.length === 1 && r.posPrincipal[0] === 1;
  const cadena = invertir ? [...r.cadena].reverse() : r.cadena;
  let s = "";
  for (let k = 0; k < cadena.length; k++) {
    const i = cadena[k];
    const carbono = textoCarbonoCadena(m, i, cadena, k);
    if (k > 0) {
      const e = m.ady[cadena[k - 1]].find((x) => x.v === i)!;
      s += e.orden === 2 ? "=" : e.orden === 3 ? "≡" : "-";
    }
    s += carbono;
  }
  if (r.principal === "ester") {
    const g = gruposFuncionales(m).find((x) => x.id === "ester")!;
    const oEster = g.atomos[2];
    const alquilo = m.ady[oEster].find((x) => x.v !== g.atomos[0])!.v;
    // Construye el alquilo como cadena: CH2-CH3.
    let alq = "";
    let cur = alquilo;
    let p = oEster;
    for (;;) {
      const hijos = m.ady[cur].filter((x) => x.v !== p);
      const h = hidrogenos(m, cur);
      const ramas = hijos.length > 1 ? hijos.slice(0, -1).map((x) => `(${textoRama(m, x.v, cur)})`).join("") : "";
      alq += `${alq ? "-" : ""}C${h > 0 ? `H${h > 1 ? h : ""}` : ""}${ramas}`;
      if (hijos.length === 0) break;
      p = cur;
      cur = hijos[hijos.length - 1].v;
    }
    s += `-${alq}`;
  }
  return s;
}

// Cuenta átomos de una fórmula condensada (para los tests): ignora los
// separadores de enlace.
export function contarCondensada(texto: string): Record<string, number> {
  return contarAtomos(texto.replace(/[-=≡]/g, ""));
}

// ---------- Dibujo esquemático 2D ----------

export interface AtomoDibujo {
  id: number;
  el: Elemento;
  x: number;
  y: number;
  // Texto del átomo si no es un carbono de esqueleto ("OH", "NH₂", "Cl", "O").
  etiqueta?: string;
  // Posición (localizador) si está en la cadena numerada.
  localizador?: number;
  enCadena: boolean;
}
export interface EnlaceDibujo {
  a: number;
  b: number;
  orden: 1 | 2 | 3;
  enCadena: boolean;
}
export interface Dibujo {
  atomos: AtomoDibujo[];
  enlaces: EnlaceDibujo[];
  // Caja que contiene todo (unidades de enlace).
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

const SUB_DIGITO: Record<string, string> = { "2": "₂", "3": "₃" };

function etiquetaAtomo(m: Molecula, i: number): string | undefined {
  const el = m.atomos[i];
  if (el === "C") return undefined;
  const h = hidrogenos(m, i);
  if (el === "O") return h === 1 ? "OH" : "O";
  if (el === "N") return h === 0 ? "N" : `NH${h > 1 ? SUB_DIGITO[String(h)] : ""}`;
  return el;
}

const rad = (g: number) => (g * Math.PI) / 180;
const dirV = (g: number) => ({ x: Math.cos(rad(g)), y: Math.sin(rad(g)) });
const norm = (g: number) => ((g % 360) + 360) % 360;
const sep = (a: number, b: number) => {
  const d = Math.abs(norm(a) - norm(b));
  return Math.min(d, 360 - d);
};

// Elige `k` direcciones (múltiplos de 30°) para los sustituyentes de un
// átomo: lo más separadas posible de los enlaces ya ocupados, y hacia el
// lado contrario de ellos. Determinístico.
function elegirDirecciones(ocupadas: number[], k: number, sesgo = 0): number[] {
  if (k === 0) return [];
  const candidatas = Array.from({ length: 12 }, (_, i) => i * 30).filter((a) => ocupadas.every((o) => sep(a, o) >= 50));
  let lejos: number | null = null;
  if (ocupadas.length > 0) {
    const sx = ocupadas.reduce((a, o) => a + Math.cos(rad(o)), 0);
    const sy = ocupadas.reduce((a, o) => a + Math.sin(rad(o)), 0);
    if (Math.hypot(sx, sy) > 0.05) lejos = (Math.atan2(-sy, -sx) * 180) / Math.PI;
  }
  const combos: number[][] = [];
  const rec = (inicio: number, act: number[]) => {
    if (act.length === k) {
      combos.push([...act]);
      return;
    }
    for (let i = inicio; i < candidatas.length; i++) rec(i + 1, [...act, candidatas[i]]);
  };
  rec(0, []);
  let mejor: number[] | null = null;
  let mejorPuntaje = -Infinity;
  for (const c of combos) {
    const todas = [...ocupadas, ...c];
    let min = 360;
    for (let i = 0; i < todas.length; i++) for (let j = i + 1; j < todas.length; j++) min = Math.min(min, sep(todas[i], todas[j]));
    if (todas.length > 1 && min < 50) continue;
    let puntaje = min * 10;
    if (lejos !== null) puntaje += c.reduce((a, g) => a + Math.cos(rad(g - lejos!)), 0);
    else puntaje += c.reduce((a, g) => a + Math.abs(Math.sin(rad(g))), 0) * 0.5;
    if (sesgo !== 0 && ocupadas.length === 1 && c.length === 1) puntaje += 0.3 * Math.sign(Math.sin(rad(c[0] - ocupadas[0] - 180))) * sesgo;
    if (puntaje > mejorPuntaje + 1e-9) {
      mejorPuntaje = puntaje;
      mejor = c;
    }
  }
  if (!mejor) return Array.from({ length: k }, (_, i) => norm(ocupadas[0] !== undefined ? ocupadas[0] + 180 + 60 * (i - (k - 1) / 2) : 90));
  return mejor;
}

interface Colocado {
  x: number;
  y: number;
}

// Dibuja una molécula abierta: cadena principal en zigzag con las ramas.
// `cis` dobla la cadena del mismo lado alrededor del primer doble enlace.
export function dibujarMolecula(m: Molecula, opciones: { cis?: boolean } = {}): Dibujo {
  const pos = new Map<number, Colocado>();
  const enCadena = new Set<number>();
  const loc = new Map<number, number>();
  const enlaces: EnlaceDibujo[] = [];
  const anillo = esCiclica(m) ? encontrarAnillo(m) : null;

  const colocarRama = (i: number, desde: number, angulo: number, origen: Colocado, signo: number) => {
    const d = dirV(angulo);
    const p = { x: origen.x + d.x, y: origen.y - d.y };
    pos.set(i, p);
    const hijos = m.ady[i].filter((x) => x.v !== desde);
    const dirs = elegirDirecciones([norm(angulo + 180)], hijos.length, signo);
    hijos.forEach((h, k) => {
      const e = m.ady[i].find((x) => x.v === h.v)!;
      enlaces.push({ a: i, b: h.v, orden: e.orden, enCadena: false });
      colocarRama(h.v, i, dirs[k], p, -signo);
    });
  };

  if (anillo) {
    const n = anillo.length;
    const R = 1 / (2 * Math.sin(Math.PI / n));
    anillo.forEach((a, k) => {
      const ang = 90 + (360 * k) / n;
      pos.set(a, { x: R * Math.cos(rad(ang)), y: -R * Math.sin(rad(ang)) });
      enCadena.add(a);
    });
    anillo.forEach((a, k) => {
      const b = anillo[(k + 1) % n];
      const e = m.ady[a].find((x) => x.v === b)!;
      enlaces.push({ a, b, orden: e.orden, enCadena: true });
    });
    anillo.forEach((a, k) => {
      const ang = 90 + (360 * k) / n;
      const externos = m.ady[a].filter((x) => !anillo.includes(x.v));
      externos.forEach((x, j) => {
        const e = m.ady[a].find((y) => y.v === x.v)!;
        enlaces.push({ a, b: x.v, orden: e.orden, enCadena: false });
        const separacion = externos.length === 1 ? 0 : (j - (externos.length - 1) / 2) * 60;
        colocarRama(x.v, a, ang + separacion, pos.get(a)!, 1);
      });
    });
  } else {
    const r = nombrarAbierta(m);
    const cadena = r.cadena;
    cadena.forEach((a, k) => {
      enCadena.add(a);
      loc.set(a, k + 1);
    });
    // Ángulos de los enlaces de la cadena: zigzag de 120° (giros alternados de
    // 60°), recto alrededor de un triple enlace; cis repite el giro tras el doble enlace.
    const nb = cadena.length - 1;
    const angulos: number[] = [];
    let ultimoGiro = 60;
    for (let k = 0; k < nb; k++) {
      if (k === 0) {
        const bond1 = nb > 1 ? m.ady[cadena[1]].find((x) => x.v === cadena[2])!.orden : 1;
        const bond0 = m.ady[cadena[0]].find((x) => x.v === cadena[1])!.orden;
        // Una cadena que arranca en un triple enlace se dibuja horizontal.
        angulos.push(bond0 === 3 || bond1 === 3 ? 0 : 30);
        continue;
      }
      const e1 = m.ady[cadena[k - 1]].find((x) => x.v === cadena[k])!.orden;
      const e2 = m.ady[cadena[k]].find((x) => x.v === cadena[k + 1])!.orden;
      let giro: number;
      if (e1 === 3 || e2 === 3) giro = 0;
      else if (opciones.cis && e1 === 2) giro = ultimoGiro;
      else giro = -ultimoGiro;
      if (giro !== 0) ultimoGiro = giro;
      angulos.push(norm(angulos[k - 1] + giro));
    }
    let actual: Colocado = { x: 0, y: 0 };
    pos.set(cadena[0], actual);
    for (let k = 0; k < nb; k++) {
      const d = dirV(angulos[k]);
      actual = { x: actual.x + d.x, y: actual.y - d.y };
      pos.set(cadena[k + 1], actual);
    }
    for (let k = 0; k < nb; k++) {
      const e = m.ady[cadena[k]].find((x) => x.v === cadena[k + 1])!;
      enlaces.push({ a: cadena[k], b: cadena[k + 1], orden: e.orden, enCadena: true });
    }
    cadena.forEach((a, k) => {
      const externos = m.ady[a].filter((x) => !enCadena.has(x.v));
      const ocupadas: number[] = [];
      if (k > 0) ocupadas.push(norm(angulos[k - 1] + 180));
      if (k < nb) ocupadas.push(angulos[k]);
      const signo = k % 2 === 0 ? 1 : -1;
      const dirs = elegirDirecciones(ocupadas, externos.length, signo);
      externos.forEach((x, j) => {
        const e = m.ady[a].find((y) => y.v === x.v)!;
        enlaces.push({ a, b: x.v, orden: e.orden, enCadena: false });
        colocarRama(x.v, a, dirs[j], pos.get(a)!, signo);
      });
    });
  }

  const atomos: AtomoDibujo[] = [...pos.entries()].map(([id, p]) => ({
    id,
    el: m.atomos[id],
    x: Math.round(p.x * 1000) / 1000,
    y: Math.round(p.y * 1000) / 1000,
    etiqueta: etiquetaAtomo(m, id),
    localizador: loc.get(id),
    enCadena: enCadena.has(id),
  }));
  const xs = atomos.map((a) => a.x);
  const ys = atomos.map((a) => a.y);
  return { atomos, enlaces, minX: Math.min(...xs), maxX: Math.max(...xs), minY: Math.min(...ys), maxY: Math.max(...ys) };
}

// ---------- Texto ----------

// Fórmula condensada en LaTeX (sin $): CH3-CH(CH3)-CH2-CH3 -> CH_{3}{-}CH(CH_{3}){-}...
export function condensadaLatex(s: string): string {
  return s
    .replace(/(\d+)/g, "_{$1}")
    .replace(/-/g, "{-}")
    .replace(/=/g, "{=}")
    .replace(/≡/g, "{\\equiv}");
}

// Tipo de cada carbono según a cuántos otros carbonos está unido: primario
// (1), secundario (2), terciario (3) o cuaternario (4).
export function tipoDeCarbono(m: Molecula, i: number): "primario" | "secundario" | "terciario" | "cuaternario" | null {
  if (m.atomos[i] !== "C") return null;
  const n = m.ady[i].filter((x) => m.atomos[x.v] === "C").length;
  return n <= 1 ? "primario" : n === 2 ? "secundario" : n === 3 ? "terciario" : "cuaternario";
}
