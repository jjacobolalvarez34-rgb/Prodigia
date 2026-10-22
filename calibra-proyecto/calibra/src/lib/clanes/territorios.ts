// Mundo de clanes como mapa de territorios (pedido del 2026-10-21: «que parezca un
// territorio, no un cuadrado y todos alineados, sino territorios grandes o pequeños
// que se van generando cuando hay un nuevo clan»).
//
// Geometría pura y determinista, compartida por la web (SVG del DOM) y la app
// (react-native-svg):
//
// 1. Semillas: cada clan ocupa un lugar en una espiral de girasol (ángulo áureo)
//    según su orden de fundación, con un pequeño desvío sacado de su id. La espiral
//    ya reparte los puntos de forma pareja (como una relajación de Lloyd, pero sin
//    mover a nadie): un clan nuevo cae siempre en la frontera exterior y las semillas
//    de los clanes viejos no se mueven nunca.
// 2. Celdas: diagrama de potencia (Voronoi con pesos). El peso sale del tamaño real
//    del clan (miembros y nivel): un clan grande empuja sus fronteras, uno recién
//    fundado es chico. El peso está acotado para que cada semilla quede siempre dentro
//    de su propia celda (ninguna desaparece).
// 3. Costa: cada celda se recorta con su «disco de potencia» (|x-p|² - w ≤ R²). Dos
//    vecinos cortan su frontera común exactamente en el mismo punto, así que no hay
//    solapes ni huecos raros en el interior, y el borde exterior del mundo queda
//    redondeado, como una isla.
// 4. Bordes: la frontera entre dos clanes se ondula con una curva que depende solo
//    del par de clanes, y los dos la dibujan igual (sin solapes). La costa se hunde
//    un poco hacia adentro con ruido suave.
//
// Agregar un clan solo cambia las celdas de sus vecinos en la frontera; el resto
// queda idéntico.

export interface Punto {
  x: number;
  y: number;
}

export interface ClanParaTerritorio {
  clan_id: string;
  cantidad_miembros?: number | null;
  nivel_clan?: number | null;
  creado_at?: string | null;
}

export interface Territorio {
  clan_id: string;
  /** Lugar en el orden de fundación (0 = el más antiguo). */
  orden: number;
  semilla: Punto;
  /** Celda convexa exacta (sin ondas). */
  celda: Punto[];
  /** Contorno final con bordes ondulados; es lo que se dibuja y lo que se toca. */
  contorno: Punto[];
  /** El contorno como atributo `d` de un <path> SVG. */
  d: string;
  /** Punto para la etiqueta (centroide de la celda). */
  centro: Punto;
  /** Distancia del centro al borde más cercano: sirve para el tamaño del texto. */
  radioInterior: number;
  area: number;
  /** Peso normalizado 0..1 (0 = clan recién fundado de una persona). */
  peso: number;
  vecinos: string[];
}

export interface MapaTerritorios {
  territorios: Territorio[];
  caja: { minX: number; minY: number; ancho: number; alto: number };
}

/** Distancia típica entre semillas vecinas, en unidades del mapa (≈ px a escala 1). */
export const PASO_TERRITORIO = 62;
const ANGULO_AUREO = Math.PI * (3 - Math.sqrt(5));
const DESVIO = 0.2 * PASO_TERRITORIO;
// Con el desvío acotado, dos semillas nunca quedan a menos de ~1.3·PASO (lo
// comprueban las pruebas); el peso máximo se queda bien por debajo de esa distancia
// al cuadrado para que ninguna celda pierda su semilla.
const PESO_MAX = 1.25 * PASO_TERRITORIO ** 2;
const RADIO_COSTA = 1.3 * PASO_TERRITORIO;
const LADOS_DISCO = 64;
const MARGEN = 26;

// ---------------------------------------------------------------- azar fijo

function hash32(texto: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < texto.length; i++) {
    h ^= texto.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

function generador(semilla: number) {
  let s = semilla >>> 0 || 1;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ---------------------------------------------------------------- tamaño

/**
 * Qué tan «grande» es un clan, de 0 a 1. Crece rápido con los primeros miembros y
 * niveles y luego se satura, para que un clan enorme no se coma el mapa.
 */
export function pesoDeClan(miembros: number | null | undefined, nivel: number | null | undefined): number {
  const m = Math.max(1, Number.isFinite(miembros) ? Number(miembros) : 1);
  const n = Math.max(1, Number.isFinite(nivel) ? Number(nivel) : 1);
  const x = (m - 1) + 1.5 * (n - 1);
  return 1 - Math.exp(-x / 9);
}

// ---------------------------------------------------------------- semillas

/** Semilla del clan número `orden` (0 = el primero fundado). Solo depende de su id y su orden. */
export function semillaDeClan(orden: number, clanId: string): Punto {
  const r = PASO_TERRITORIO * Math.sqrt(orden + 0.5);
  const a = orden * ANGULO_AUREO;
  const azar = generador(hash32(clanId));
  const da = azar() * Math.PI * 2;
  const dr = DESVIO * Math.sqrt(azar());
  return { x: r * Math.cos(a) + dr * Math.cos(da), y: r * Math.sin(a) + dr * Math.sin(da) };
}

function ordenar(clanes: ClanParaTerritorio[]): ClanParaTerritorio[] {
  const todosConFecha = clanes.every((c) => c.creado_at && !Number.isNaN(Date.parse(c.creado_at)));
  if (!todosConFecha) return clanes.slice();
  return clanes
    .map((c, i) => ({ c, i, t: Date.parse(c.creado_at as string) }))
    .sort((a, b) => a.t - b.t || (a.c.clan_id < b.c.clan_id ? -1 : a.c.clan_id > b.c.clan_id ? 1 : 0) || a.i - b.i)
    .map((x) => x.c);
}

// ---------------------------------------------------------------- recorte convexo

interface Vertice extends Punto {
  /** Etiqueta del lado que sale de este vértice: índice del vecino o -1 (costa). */
  lado: number;
}

function recortar(poligono: Vertice[], ax: number, ay: number, b: number, etiqueta: number): Vertice[] {
  // Se queda con la parte donde ax·x + ay·y ≤ b.
  const salida: Vertice[] = [];
  const n = poligono.length;
  for (let k = 0; k < n; k++) {
    const p = poligono[k];
    const q = poligono[(k + 1) % n];
    const fp = ax * p.x + ay * p.y - b;
    const fq = ax * q.x + ay * q.y - b;
    const pDentro = fp <= 0;
    const qDentro = fq <= 0;
    if (pDentro) salida.push(p);
    if (pDentro !== qDentro) {
      const t = fp / (fp - fq);
      const corte = { x: p.x + (q.x - p.x) * t, y: p.y + (q.y - p.y) * t };
      // Al salir, el tramo que sigue va por la recta nueva; al entrar, sigue el lado viejo.
      salida.push({ ...corte, lado: pDentro ? etiqueta : p.lado });
    }
  }
  // Quitar vértices repetidos (lados de largo cero).
  const limpio: Vertice[] = [];
  for (const v of salida) {
    const u = limpio[limpio.length - 1];
    if (u && Math.hypot(u.x - v.x, u.y - v.y) < 1e-7) {
      u.lado = v.lado;
      continue;
    }
    limpio.push({ ...v });
  }
  if (limpio.length > 1) {
    const a = limpio[0];
    const z = limpio[limpio.length - 1];
    if (Math.hypot(a.x - z.x, a.y - z.y) < 1e-7) limpio.pop();
  }
  return limpio.length >= 3 ? limpio : [];
}

/**
 * Intersección de un polígono convexo (en sentido de ángulo creciente) con un
 * círculo. Los tramos de borde que quedan adentro conservan su etiqueta; donde el
 * polígono sale del círculo se agrega el arco de costa (etiqueta -1) hasta donde
 * vuelve a entrar. Los puntos de corte se calculan exactos, así que dos vecinos con
 * el mismo círculo de potencia sobre su frontera los obtienen iguales.
 */
function cortarConCirculo(poligono: Vertice[], c: Punto, r: number): Vertice[] {
  if (poligono.length < 3) return [];
  interface Pieza {
    a: Punto;
    b: Punto;
    lado: number;
    sale: boolean;
  }
  const piezas: Pieza[] = [];
  const n = poligono.length;
  for (let k = 0; k < n; k++) {
    const p = poligono[k];
    const q = poligono[(k + 1) % n];
    const dx = q.x - p.x;
    const dy = q.y - p.y;
    const fx = p.x - c.x;
    const fy = p.y - c.y;
    const A = dx * dx + dy * dy;
    if (A < 1e-12) continue;
    const Bq = 2 * (fx * dx + fy * dy);
    const C = fx * fx + fy * fy - r * r;
    const disc = Bq * Bq - 4 * A * C;
    if (disc <= 0) continue;
    const raiz = Math.sqrt(disc);
    const t0 = Math.max(0, (-Bq - raiz) / (2 * A));
    const t1 = Math.min(1, (-Bq + raiz) / (2 * A));
    if (t1 - t0 < 1e-9) continue;
    piezas.push({
      a: { x: p.x + dx * t0, y: p.y + dy * t0 },
      b: { x: p.x + dx * t1, y: p.y + dy * t1 },
      lado: p.lado,
      sale: t1 < 1,
    });
  }
  const arco = (desde: Punto, hasta: Punto | null): Vertice[] => {
    const a0 = Math.atan2(desde.y - c.y, desde.x - c.x);
    let da = Math.PI * 2;
    if (hasta) {
      da = Math.atan2(hasta.y - c.y, hasta.x - c.x) - a0;
      while (da <= 1e-9) da += Math.PI * 2;
    }
    const pasos = Math.max(1, Math.ceil(da / ((Math.PI * 2) / LADOS_DISCO)));
    const salida: Vertice[] = [];
    for (let k = hasta ? 1 : 0; k < pasos; k++) {
      const ang = a0 + (da * k) / pasos;
      salida.push({ x: c.x + r * Math.cos(ang), y: c.y + r * Math.sin(ang), lado: -1 });
    }
    return salida;
  };
  if (piezas.length === 0) {
    // Ningún borde toca el círculo: como la semilla está dentro de la celda, el
    // círculo entero queda adentro (una isla sin vecinos).
    return arco({ x: c.x + r, y: c.y }, null);
  }
  const salida: Vertice[] = [];
  for (let k = 0; k < piezas.length; k++) {
    const pz = piezas[k];
    salida.push({ ...pz.a, lado: pz.lado });
    if (pz.sale) {
      salida.push({ ...pz.b, lado: -1 });
      salida.push(...arco(pz.b, piezas[(k + 1) % piezas.length].a));
    }
  }
  // Limpieza de vértices repetidos, igual que en el recorte.
  const limpio: Vertice[] = [];
  for (const v of salida) {
    const u = limpio[limpio.length - 1];
    if (u && Math.hypot(u.x - v.x, u.y - v.y) < 1e-7) {
      u.lado = v.lado;
      continue;
    }
    limpio.push({ ...v });
  }
  while (limpio.length > 1) {
    const a = limpio[0];
    const z = limpio[limpio.length - 1];
    if (Math.hypot(a.x - z.x, a.y - z.y) >= 1e-7) break;
    limpio.pop();
  }
  return limpio.length >= 3 ? limpio : [];
}

// ---------------------------------------------------------------- ondas

function fronteraOndulada(
  a: Punto,
  b: Punto,
  idA: string,
  idB: string,
  semA: Punto,
  semB: Punto,
): Punto[] {
  // Mismo resultado visto desde los dos lados: todo se calcula en el orden del par.
  const [idLo, semLo, semHi] = idA < idB ? [idA, semA, semB] : [idB, semB, semA];
  const idHi = idLo === idA ? idB : idA;
  const dx = semHi.x - semLo.x;
  const dy = semHi.y - semLo.y;
  const ln = Math.hypot(dx, dy) || 1;
  const nx = dx / ln;
  const ny = dy / ln;
  const tx = -ny;
  const ty = nx;
  const sa = a.x * tx + a.y * ty;
  const sb = b.x * tx + b.y * ty;
  const [A, B] = sa <= sb ? [a, b] : [b, a];
  const L = Math.hypot(B.x - A.x, B.y - A.y);
  if (L < 3) return [];
  const azar = generador(hash32(`${idLo}|${idHi}`));
  const f1 = 0.55 + azar() * 0.7;
  const f2 = 1.7 + azar() * 1.1;
  const p1 = azar() * Math.PI * 2;
  const p2 = azar() * Math.PI * 2;
  const amp = Math.min(0.085 * L, 0.11 * PASO_TERRITORIO);
  const pasos = Math.min(40, Math.max(2, Math.ceil(L / 4.5)));
  const puntos: Punto[] = [];
  for (let k = 1; k < pasos; k++) {
    const t = k / pasos;
    const o = amp * Math.sin(Math.PI * t) * (0.72 * Math.sin(2 * Math.PI * f1 * t + p1) + 0.28 * Math.sin(2 * Math.PI * f2 * t + p2));
    puntos.push({ x: A.x + (B.x - A.x) * t + nx * o, y: A.y + (B.y - A.y) * t + ny * o });
  }
  return sa <= sb ? puntos : puntos.reverse();
}

function costaHundida(tramo: Punto[], semilla: Punto, idClan: string, cerrada: boolean): Punto[] {
  // Hunde la costa hacia la semilla con ruido suave según el ángulo; en las puntas
  // (donde empieza una frontera con otro clan) el hundimiento vuelve a cero.
  const azar = generador(hash32(`costa|${idClan}`));
  const p1 = azar() * Math.PI * 2;
  const p2 = azar() * Math.PI * 2;
  const p3 = azar() * Math.PI * 2;
  const largos = [0];
  for (let k = 1; k < tramo.length; k++) {
    largos.push(largos[k - 1] + Math.hypot(tramo[k].x - tramo[k - 1].x, tramo[k].y - tramo[k - 1].y));
  }
  const total = largos[largos.length - 1] || 1;
  const rampa = Math.min(16, total / 3);
  return tramo.map((p, k) => {
    let env = 1;
    if (!cerrada) {
      const s = Math.min(largos[k], total - largos[k]);
      const u = Math.min(1, s / rampa);
      env = u * u * (3 - 2 * u);
    }
    const ang = Math.atan2(p.y - semilla.y, p.x - semilla.x);
    const ruido = 0.5 + 0.28 * Math.sin(3 * ang + p1) + 0.14 * Math.sin(5 * ang + p2) + 0.08 * Math.sin(9 * ang + p3);
    const hundir = env * PASO_TERRITORIO * 0.13 * ruido;
    const dx = semilla.x - p.x;
    const dy = semilla.y - p.y;
    const dist = Math.hypot(dx, dy) || 1;
    const h = Math.min(hundir, dist * 0.3);
    return { x: p.x + (dx / dist) * h, y: p.y + (dy / dist) * h };
  });
}

// ---------------------------------------------------------------- medidas

function areaDe(poligono: Punto[]): number {
  let s = 0;
  for (let k = 0; k < poligono.length; k++) {
    const p = poligono[k];
    const q = poligono[(k + 1) % poligono.length];
    s += p.x * q.y - q.x * p.y;
  }
  return s / 2;
}

function centroideDe(poligono: Punto[]): Punto {
  const a = areaDe(poligono);
  if (Math.abs(a) < 1e-9) {
    const n = poligono.length || 1;
    return { x: poligono.reduce((s, p) => s + p.x, 0) / n, y: poligono.reduce((s, p) => s + p.y, 0) / n };
  }
  let cx = 0;
  let cy = 0;
  for (let k = 0; k < poligono.length; k++) {
    const p = poligono[k];
    const q = poligono[(k + 1) % poligono.length];
    const f = p.x * q.y - q.x * p.y;
    cx += (p.x + q.x) * f;
    cy += (p.y + q.y) * f;
  }
  return { x: cx / (6 * a), y: cy / (6 * a) };
}

function distanciaASegmento(p: Punto, a: Punto, b: Punto): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const l2 = dx * dx + dy * dy;
  const t = l2 > 0 ? Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / l2)) : 0;
  return Math.hypot(p.x - (a.x + dx * t), p.y - (a.y + dy * t));
}

/** ¿El punto está dentro del polígono? (par/impar, sirve para polígonos no convexos). */
export function puntoEnPoligono(p: Punto, poligono: Punto[]): boolean {
  let dentro = false;
  for (let i = 0, j = poligono.length - 1; i < poligono.length; j = i++) {
    const a = poligono[i];
    const b = poligono[j];
    if (a.y > p.y !== b.y > p.y && p.x < ((b.x - a.x) * (p.y - a.y)) / (b.y - a.y) + a.x) dentro = !dentro;
  }
  return dentro;
}

function aPath(puntos: Punto[]): string {
  if (puntos.length === 0) return "";
  const r = (v: number) => Math.round(v * 10) / 10;
  return `M${puntos.map((p) => `${r(p.x)} ${r(p.y)}`).join("L")}Z`;
}

// ---------------------------------------------------------------- mapa

/**
 * Calcula el mapa de territorios. Los clanes se ordenan por `creado_at` si todos lo
 * traen (si no, se respeta el orden recibido, que en `mapa_clanes()` ya es por fecha).
 */
export function calcularTerritorios(clanes: ClanParaTerritorio[]): MapaTerritorios {
  const lista = ordenar(clanes);
  const n = lista.length;
  const semillas = lista.map((c, i) => semillaDeClan(i, c.clan_id));
  const pesos = lista.map((c) => pesoDeClan(c.cantidad_miembros, c.nivel_clan));
  const w = pesos.map((p) => p * PESO_MAX);
  const radios = w.map((wi) => Math.sqrt(RADIO_COSTA * RADIO_COSTA + wi));

  const territorios: Territorio[] = lista.map((c, i) => {
    const s = semillas[i];
    // Primero la celda de potencia dentro de un cuadrado holgado; después se corta
    // con el círculo exacto (un polígono aproximado haría que dos vecinos no cortaran
    // su frontera en el mismo punto).
    const B = radios[i] * 1.5;
    let poligono: Vertice[] = [
      { x: s.x - B, y: s.y - B, lado: -1 },
      { x: s.x + B, y: s.y - B, lado: -1 },
      { x: s.x + B, y: s.y + B, lado: -1 },
      { x: s.x - B, y: s.y + B, lado: -1 },
    ];
    for (let j = 0; j < n && poligono.length; j++) {
      if (j === i) continue;
      const o = semillas[j];
      if (Math.hypot(o.x - s.x, o.y - s.y) >= radios[i] + radios[j]) continue;
      // |x-s|² - wi ≤ |x-o|² - wj  ⇔  2x·(o-s) ≤ |o|² - |s|² - wj + wi
      poligono = recortar(
        poligono,
        2 * (o.x - s.x),
        2 * (o.y - s.y),
        o.x * o.x + o.y * o.y - s.x * s.x - s.y * s.y - w[j] + w[i],
        j,
      );
    }
    poligono = cortarConCirculo(poligono, s, radios[i]);

    const celda = poligono.map(({ x, y }) => ({ x, y }));
    const vecinos = Array.from(new Set(poligono.filter((v) => v.lado >= 0).map((v) => lista[v.lado].clan_id)));

    // Contorno ondulado: fronteras compartidas con su onda común y costa hundida.
    const contorno: Punto[] = [];
    const m = poligono.length;
    const todoCosta = m > 0 && poligono.every((v) => v.lado === -1);
    if (todoCosta) {
      contorno.push(...costaHundida(celda, s, c.clan_id, true));
    } else if (m > 0) {
      // Empezar en un vértice cuyo lado entrante no sea costa, para no partir un tramo.
      let inicio = 0;
      for (let k = 0; k < m; k++) {
        if (poligono[(k - 1 + m) % m].lado !== -1) {
          inicio = k;
          break;
        }
      }
      let tramoCosta: Punto[] | null = null;
      for (let paso = 0; paso < m; paso++) {
        const k = (inicio + paso) % m;
        const v = poligono[k];
        const sig = poligono[(k + 1) % m];
        if (v.lado === -1) {
          if (!tramoCosta) tramoCosta = [{ x: v.x, y: v.y }];
          tramoCosta.push({ x: sig.x, y: sig.y });
          continue;
        }
        if (tramoCosta) {
          // El último punto del tramo es este vértice: se agrega abajo.
          contorno.push(...costaHundida(tramoCosta, s, c.clan_id, false).slice(0, -1));
          tramoCosta = null;
        }
        contorno.push({ x: v.x, y: v.y });
        contorno.push(...fronteraOndulada(v, sig, c.clan_id, lista[v.lado].clan_id, s, semillas[v.lado]));
      }
      if (tramoCosta) contorno.push(...costaHundida(tramoCosta, s, c.clan_id, false).slice(0, -1));
    }

    const centro = celda.length ? centroideDe(celda) : { ...s };
    let radioInterior = 0;
    if (contorno.length) {
      radioInterior = Infinity;
      for (let k = 0; k < contorno.length; k++) {
        radioInterior = Math.min(radioInterior, distanciaASegmento(centro, contorno[k], contorno[(k + 1) % contorno.length]));
      }
    }

    return {
      clan_id: c.clan_id,
      orden: i,
      semilla: s,
      celda,
      contorno,
      d: aPath(contorno),
      centro,
      radioInterior,
      area: Math.abs(areaDe(contorno)),
      peso: pesos[i],
      vecinos,
    };
  });

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const t of territorios) {
    for (const p of t.contorno) {
      if (p.x < minX) minX = p.x;
      if (p.y < minY) minY = p.y;
      if (p.x > maxX) maxX = p.x;
      if (p.y > maxY) maxY = p.y;
    }
  }
  if (!Number.isFinite(minX)) {
    minX = -PASO_TERRITORIO;
    minY = -PASO_TERRITORIO;
    maxX = PASO_TERRITORIO;
    maxY = PASO_TERRITORIO;
  }
  return {
    territorios,
    caja: { minX: minX - MARGEN, minY: minY - MARGEN, ancho: maxX - minX + 2 * MARGEN, alto: maxY - minY + 2 * MARGEN },
  };
}

/** El territorio que hay en un punto del mapa (en unidades del mapa), si hay alguno. */
export function territorioEnPunto(mapa: MapaTerritorios, p: Punto): Territorio | null {
  for (const t of mapa.territorios) {
    if (t.contorno.length && puntoEnPoligono(p, t.contorno)) return t;
  }
  return null;
}

// ---------------------------------------------------------------- dibujo

/**
 * Texto que entra en la etiqueta de un territorio: el nombre si cabe, si no la
 * etiqueta del clan, y si tampoco, el nombre recortado.
 */
export function etiquetaTerritorio(
  nombre: string,
  tag: string | null | undefined,
  radioInterior: number,
): { texto: string; tam: number; conDetalle: boolean } {
  const tamIdeal = Math.max(6.5, Math.min(17, radioInterior * 0.36));
  const ancho = radioInterior * 1.9;
  const anchoDe = (s: string, tam: number) => s.length * tam * 0.58;
  const limpio = nombre.trim() || (tag ?? "?");
  const conDetalle = radioInterior >= 30;
  if (anchoDe(limpio, tamIdeal) <= ancho) return { texto: limpio, tam: tamIdeal, conDetalle };
  // Un poco más chica, mientras siga siendo legible.
  const tamQueCabe = ancho / (limpio.length * 0.58);
  if (tamQueCabe >= Math.max(6.5, tamIdeal * 0.68)) return { texto: limpio, tam: tamQueCabe, conDetalle };
  if (tag && anchoDe(tag, tamIdeal) <= ancho) return { texto: tag, tam: tamIdeal, conDetalle };
  const max = Math.max(2, Math.floor(ancho / (tamIdeal * 0.58)) - 1);
  return { texto: `${limpio.slice(0, max).trimEnd()}…`, tam: tamIdeal, conDetalle };
}

function aRgb(hex: string): [number, number, number] | null {
  const m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return null;
  let h = m[1];
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

function aHex([r, g, b]: [number, number, number]): string {
  const c = (v: number) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, "0");
  return `#${c(r)}${c(g)}${c(b)}`;
}

function mezclar(a: [number, number, number], b: [number, number, number], t: number): string {
  return aHex([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]);
}

/** Colores fijos del mapa (noche), iguales en la web y en la app. */
export const ESTILO_MAPA = {
  mar: "#08101F",
  marClaro: "#10233F",
  bajio: "#4FA3CF",
  olas: "#7FB8E0",
  miClan: "#FFB627",
  elegido: "#FFFFFF",
  texto: "#F4F6FB",
  textoSuave: "#C9D2EA",
  contornoTexto: "#050812",
} as const;

/** Banderín del clan (mismo dibujo que el estandarte de la app), en una caja de 22×34. */
export const PATH_BANDERIN = "M0 0H22V34L11 27L0 34Z";

/** Paleta de un territorio a partir del color del estandarte del clan. */
export function coloresTerritorio(estandarte: string): { suelo: string; borde: string; luz: string; color: string } {
  const base = aRgb(estandarte) ?? aRgb("#7C5CFF")!;
  const noche = aRgb("#0B1020")!;
  const blanco: [number, number, number] = [255, 255, 255];
  return {
    color: aHex(base),
    suelo: mezclar(base, noche, 0.38),
    borde: mezclar(base, noche, 0.72),
    luz: mezclar(base, blanco, 0.45),
  };
}

/** ¿El clan se fundó hace menos de una semana? (para marcar la frontera nueva). */
export function esTerritorioNuevo(creadoAt: string | null | undefined, ahora: number): boolean {
  if (!creadoAt) return false;
  const t = Date.parse(creadoAt);
  return Number.isFinite(t) && ahora - t < 7 * 24 * 3600 * 1000;
}
