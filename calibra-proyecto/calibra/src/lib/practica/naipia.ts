// Mundo Naipia — deporte mental de memoria y conteo de cartas: entrenamiento
// de atención, memoria de trabajo y aritmética mental. 5 modos = 5 SISTEMAS
// DE CONTEO (nivel 1-10 vía skill_levels, igual que el resto de los
// mundos): Hi-Lo (1-3), KO (3-5), Hi-Opt II (5-7), Omega II (7-9) y
// conteo verdadero (9-10). Las bandas son techos autorales por modo (mismo
// patrón que calculia.ts): cada generador recorta el nivel 1-10 a su
// banda, sin cambios de esquema. NO se rotulan "niveles" de sistema.
//
// Encuadre: es un entrenamiento cognitivo. El vocabulario de todo el texto
// generado es "mazo", "conjunto de mazos", "cartas restantes", "conteo
// corriente", "conteo verdadero", "precisión y velocidad" (un test escanea
// todo el texto generado buscando lenguaje ajeno a ese encuadre).
//
// Los valores de cada sistema viven como DATOS (TABLA_SISTEMAS): ninguna
// lógica de valores está hardcodeada en los generadores. Cada respuesta se
// calcula POR CONSTRUCCIÓN (suma de la tabla / aritmética entera exacta) y
// naipia.test.ts la recalcula con un método independiente.
//
// Sin semilla compartida entre rivales de duelo (mismo criterio que
// Calculia/Circuitia/etc., ver src/lib/duelos/rutas.ts): cada jugador
// genera SUS problemas en el cliente. Lo que sí es idéntico para ambos es
// la regla del modo memoria (depende solo del nivel forzado del duelo y del
// largo de la secuencia, sin ningún azar propio: ver `memoriaParaNivel`).

import type { PreguntaRetoDiario } from "@/lib/retoDiario";

export type ModoNaipia = "hilo" | "ko" | "hiopt2" | "omega2" | "verdadero";

export const NOMBRE_MODO_NAIPIA: Record<ModoNaipia, string> = {
  hilo: "Hi-Lo",
  ko: "KO",
  hiopt2: "Hi-Opt II",
  omega2: "Omega II",
  verdadero: "Conteo verdadero",
};

export const MODOS_NAIPIA: ModoNaipia[] = ["hilo", "ko", "hiopt2", "omega2", "verdadero"];

// Modos que cuentan una secuencia de cartas con una tabla de valores.
export type SistemaConteo = "hilo" | "ko" | "hiopt2" | "omega2";
export const SISTEMAS_CONTEO: SistemaConteo[] = ["hilo", "ko", "hiopt2", "omega2"];

// ---------- Cartas ----------

export type Palo = "picas" | "corazones" | "diamantes" | "treboles";
export const PALOS: Palo[] = ["picas", "corazones", "diamantes", "treboles"];
export const SIMBOLO_PALO: Record<Palo, string> = {
  picas: "♠",
  corazones: "♥",
  diamantes: "♦",
  treboles: "♣",
};

export type ValorCarta = "A" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "J" | "Q" | "K";
export const VALORES_CARTA: ValorCarta[] = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];

export interface Carta {
  valor: ValorCarta;
  palo: Palo;
}

export function cartaATexto(c: Carta): string {
  return `${c.valor}${SIMBOLO_PALO[c.palo]}`;
}

export function cartasATexto(cartas: Carta[]): string {
  return cartas.map(cartaATexto).join(" ");
}

// ---------- Tablas de valores (DATOS) ----------
// Cada sistema se declara como "valor -> lista de rangos que lo llevan";
// abajo se expande a la tabla completa rango -> valor (los 13 rangos).

type Especificacion = Record<string, ValorCarta[]>;

const ESPECIFICACION_SISTEMAS: Record<SistemaConteo, Especificacion> = {
  hilo: {
    "1": ["2", "3", "4", "5", "6"],
    "0": ["7", "8", "9"],
    "-1": ["10", "J", "Q", "K", "A"],
  },
  ko: {
    "1": ["2", "3", "4", "5", "6", "7"],
    "0": ["8", "9"],
    "-1": ["10", "J", "Q", "K", "A"],
  },
  hiopt2: {
    "1": ["2", "3", "6", "7"],
    "2": ["4", "5"],
    "0": ["8", "9", "A"],
    "-2": ["10", "J", "Q", "K"],
  },
  omega2: {
    "1": ["2", "3", "7"],
    "2": ["4", "5", "6"],
    "0": ["8", "A"],
    "-1": ["9"],
    "-2": ["10", "J", "Q", "K"],
  },
};

function expandir(spec: Especificacion): Record<ValorCarta, number> {
  const tabla = {} as Record<ValorCarta, number>;
  for (const [valor, rangos] of Object.entries(spec)) {
    for (const r of rangos) tabla[r] = Number(valor);
  }
  return tabla;
}

export const TABLA_SISTEMAS: Record<SistemaConteo, Record<ValorCarta, number>> = {
  hilo: expandir(ESPECIFICACION_SISTEMAS.hilo),
  ko: expandir(ESPECIFICACION_SISTEMAS.ko),
  hiopt2: expandir(ESPECIFICACION_SISTEMAS.hiopt2),
  omega2: expandir(ESPECIFICACION_SISTEMAS.omega2),
};

// Grupos "valor -> rangos" (para mostrar la tabla en pantalla), ordenados
// de mayor a menor valor.
export function gruposDeSistema(sistema: SistemaConteo): { valor: number; rangos: ValorCarta[] }[] {
  const tabla = TABLA_SISTEMAS[sistema];
  const grupos = new Map<number, ValorCarta[]>();
  for (const r of VALORES_CARTA) {
    const v = tabla[r];
    grupos.set(v, [...(grupos.get(v) ?? []), r]);
  }
  return [...grupos.entries()].sort((a, b) => b[0] - a[0]).map(([valor, rangos]) => ({ valor, rangos }));
}

export function valorDeCarta(sistema: SistemaConteo, carta: Carta): number {
  return TABLA_SISTEMAS[sistema][carta.valor];
}

export function conteoCorriente(sistema: SistemaConteo, cartas: Carta[]): number {
  return cartas.reduce((acc, c) => acc + valorDeCarta(sistema, c), 0);
}

// Suma de un mazo completo de 52 cartas (4 de cada rango): 0 en los
// sistemas balanceados, +4 en KO (sistema no balanceado).
export function sumaMazoCompleto(sistema: SistemaConteo): number {
  return VALORES_CARTA.reduce((acc, r) => acc + 4 * TABLA_SISTEMAS[sistema][r], 0);
}

// ---------- Tipos de problema ----------

export type TipoPreguntaNaipia = "corriente" | "restante" | "verdadero" | "mazos" | "verdadero2";

export interface ProblemaNaipia {
  modo: ModoNaipia;
  tipo: TipoPreguntaNaipia;
  // Enunciado SIN la secuencia de cartas (la UI dibuja `cartas` en SVG).
  // Para texto plano (reto diario) usar enunciadoCompleto().
  enunciado: string;
  cartas: Carta[];
  entrada: "numero";
  respuesta: number;
  tolerancia: number;
  // Modo memoria (niveles altos de los 4 sistemas por secuencia): las cartas
  // salen una a una, cada una queda visible `msPorCarta` y luego se oculta;
  // el conteo se da de memoria al final. `cartas`/`respuesta` siguen completos
  // (la UI necesita las cartas para dibujarlas mientras están visibles) pero
  // el `enunciado` NUNCA lista la secuencia. Ausente = cartas visibles.
  memoria?: MemoriaNaipia;
}

export interface MemoriaNaipia {
  msPorCarta: number;
}

// Texto plano con la secuencia. SOLO para contextos donde la secuencia se
// muestra como texto (reto diario, que se genera con sinMemoria); un problema
// con `memoria` no debe pasar por acá en la UI o se revelarían las cartas.
export function enunciadoCompleto(p: ProblemaNaipia): string {
  return p.cartas.length > 0 ? `${p.enunciado} Cartas: ${cartasATexto(p.cartas)}` : p.enunciado;
}

// ---------- RNG ----------

// Mismo patrón que calculia.ts: referencia mutable a nivel de módulo que
// conRngSembrado() reemplaza durante la llamada.
let rngActual: () => number = Math.random;

export function conRngSembrado<T>(rng: () => number, fn: () => T): T {
  const anterior = rngActual;
  rngActual = rng;
  try {
    return fn();
  } finally {
    rngActual = anterior;
  }
}

function randomInt(min: number, max: number): number {
  return Math.floor(rngActual() * (max - min + 1)) + min;
}

function mezclar<T>(arr: T[]): T[] {
  const copia = [...arr];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(rngActual() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

function elegir<T>(arr: T[]): T {
  return arr[Math.floor(rngActual() * arr.length)];
}

// ---------- Bandas de dificultad ----------

export const BANDA_NAIPIA: Record<ModoNaipia, { min: number; max: number }> = {
  hilo: { min: 1, max: 3 },
  ko: { min: 3, max: 5 },
  hiopt2: { min: 5, max: 7 },
  omega2: { min: 7, max: 9 },
  verdadero: { min: 9, max: 10 },
};

// Recorta el nivel bruto (1-10) a la banda autoral del modo. NO es un
// candado entre modos: cualquiera se puede elegir desde el día uno.
export function bandaNaipia(modo: ModoNaipia, nivel: number): number {
  const { min, max } = BANDA_NAIPIA[modo];
  return Math.min(max, Math.max(min, nivel));
}

// Largo base de la secuencia por posición dentro de la banda (0, 1, 2) y
// sistema; se le suma un jitter 0-2. Crece con el nivel.
const LARGO_BASE: Record<SistemaConteo, number[]> = {
  hilo: [6, 9, 12],
  ko: [8, 11, 14],
  hiopt2: [9, 12, 15],
  omega2: [10, 13, 16],
};

// Fracción de la secuencia armada con pares que se cancelan (recurso
// didáctico): alta al empezar la banda, baja después.
const FRACCION_PARES = [0.6, 0.4, 0.3];

// ---------- Modo memoria (niveles altos) ----------
//
// Decisión pedagógica: primero se aprende el sistema con las cartas a la
// vista (tabla de valores incluida al empezar la banda); recién cuando el
// conteo ya es fluido las cartas desaparecen, como en el conteo real, donde
// nadie puede volver a mirar una carta que ya salió.
//
// Se activa cuando el NIVEL del jugador en ese sistema (skill_levels, 1-10,
// sin recortar a la banda) es >= NIVEL_MIN_MEMORIA **y** la banda del sistema
// ya no está en su primer escalón (ahí se enseña la tabla de valores y hay
// que verla; el modo memoria jamás convive con la tabla). Efecto por sistema:
//   Hi-Lo     (banda 1-3): nivel 6-10
//   KO        (banda 3-5): nivel 6-10
//   Hi-Opt II (banda 5-7): nivel 6-10
//   Omega II  (banda 7-9): nivel 8-10 (el 7 es el escalón de aprendizaje)
// Un jugador de nivel alto que practica un sistema "fácil" (Hi-Lo) también lo
// hace de memoria: es justamente su desafío. Conteo verdadero no aplica: sus
// datos son cifras ya calculadas (conteo corriente y mazos que quedan), sin
// secuencia de cartas que ocultar; ocultarlas sería solo pedir retener un
// número, no contar.
//
// Tabla nivel -> ms por carta (lineal, más rápido a mayor nivel):
//   6: 1600 · 7: 1325 · 8: 1050 · 9: 775 · 10: 500
// Tope de reparto por problema (TOPE_TOTAL_MEMORIA_MS): con secuencias
// largas msPorCarta baja lo necesario para que n × ms <= 16 s (sin esto,
// 14 cartas a 1600 ms serían 22 s de mirar); el reloj de la partida se
// detiene durante el reparto (ver NaipiaSprintRunner), así que esto no
// resta tiempo de respuesta sino que acota lo largo de la sesión.
export const NIVEL_MIN_MEMORIA = 6;
export const MS_CARTA_NIVEL_MIN_MEMORIA = 1600;
export const MS_CARTA_NIVEL_MAX_MEMORIA = 500;
export const TOPE_TOTAL_MEMORIA_MS = 16_000;
export const MS_CARTA_MINIMO = 400;

// ms por carta según el nivel (sin considerar el tope por largo).
export function msPorCartaBase(nivel: number): number {
  const n = Math.min(10, Math.max(NIVEL_MIN_MEMORIA, Math.round(nivel)));
  const pasos = 10 - NIVEL_MIN_MEMORIA;
  const paso = (MS_CARTA_NIVEL_MIN_MEMORIA - MS_CARTA_NIVEL_MAX_MEMORIA) / pasos;
  return Math.round(MS_CARTA_NIVEL_MIN_MEMORIA - (n - NIVEL_MIN_MEMORIA) * paso);
}

// Devuelve el ritmo del modo memoria para (sistema, nivel, largo) o null si
// esas cartas se muestran a la vista. Función pura y determinista: nada de
// azar, así que dos jugadores con el mismo nivel forzado (duelo) juegan al
// mismo ritmo por carta.
export function memoriaParaNivel(modo: ModoNaipia, nivel: number, nCartas: number): MemoriaNaipia | null {
  if (modo === "verdadero" || nCartas <= 0) return null;
  if (nivel < NIVEL_MIN_MEMORIA) return null;
  if (bandaNaipia(modo, nivel) === BANDA_NAIPIA[modo].min) return null;
  const tope = Math.floor(TOPE_TOTAL_MEMORIA_MS / nCartas);
  return { msPorCarta: Math.max(MS_CARTA_MINIMO, Math.min(msPorCartaBase(nivel), tope)) };
}

export interface OpcionesNaipia {
  // Fuerza cartas visibles aunque el nivel active el modo memoria (reto
  // diario, que muestra la secuencia como texto, y diagnóstico).
  sinMemoria?: boolean;
}

// ---------- Mazo y secuencias ----------

function mazoCompleto(): Carta[] {
  const mazo: Carta[] = [];
  for (const palo of PALOS) for (const valor of VALORES_CARTA) mazo.push({ valor, palo });
  return mezclar(mazo);
}

// Saca (sin reposición) la primera carta del mazo que cumple `pred`.
function sacar(mazo: Carta[], pred: (c: Carta) => boolean): Carta | null {
  const i = mazo.findIndex(pred);
  if (i < 0) return null;
  return mazo.splice(i, 1)[0];
}

// Valores v > 0 para los que el sistema tiene rangos con +v y con -v: son
// los pares que se pueden cancelar entre sí.
function valoresCancelables(sistema: SistemaConteo): number[] {
  const tabla = TABLA_SISTEMAS[sistema];
  const valores = new Set(VALORES_CARTA.map((r) => tabla[r]));
  return [...valores].filter((v) => v > 0 && valores.has(-v));
}

function armarSecuencia(sistema: SistemaConteo, largo: number, idx: number): Carta[] {
  const tabla = TABLA_SISTEMAS[sistema];
  const mazo = mazoCompleto();
  const cancelables = valoresCancelables(sistema);
  const paresDeseados = cancelables.length === 0 ? 0 : Math.floor((largo * FRACCION_PARES[idx]) / 2);

  const bloques: Carta[][] = [];
  let usadas = 0;
  for (let i = 0; i < paresDeseados; i++) {
    const v = elegir(cancelables);
    const a = sacar(mazo, (c) => tabla[c.valor] === v);
    const b = sacar(mazo, (c) => tabla[c.valor] === -v);
    if (a && b) {
      bloques.push(rngActual() < 0.5 ? [a, b] : [b, a]);
      usadas += 2;
    } else {
      if (a) mazo.push(a);
      if (b) mazo.push(b);
    }
  }
  while (usadas < largo) {
    const c = mazo.splice(Math.floor(rngActual() * mazo.length), 1)[0];
    bloques.push([c]);
    usadas += 1;
  }

  // Al empezar la banda los pares quedan contiguos (se ve la cancelación);
  // después se mezclan carta por carta.
  if (idx === 0) return mezclar(bloques).flat();
  return mezclar(bloques.flat());
}

// ---------- Formato de números ----------

function conSigno(n: number): string {
  return n > 0 ? `+${n}` : String(n);
}

// Número con coma decimal (medios mazos): 2,5 / 3.
function formatoMazos(n: number): string {
  return Number.isInteger(n) ? String(n) : String(n).replace(".", ",");
}

// ---------- Modos por secuencia (Hi-Lo, KO, Hi-Opt II, Omega II) ----------

function generarSecuencia(modo: SistemaConteo, nivel: number, opciones: OpcionesNaipia): ProblemaNaipia {
  const banda = bandaNaipia(modo, nivel);
  const idx = banda - BANDA_NAIPIA[modo].min;
  const largo = LARGO_BASE[modo][idx] + randomInt(0, 2);
  const cartas = armarSecuencia(modo, largo, idx);
  const nombre = NOMBRE_MODO_NAIPIA[modo];
  const corriente = conteoCorriente(modo, cartas);
  // Sin consumo de rng: activar el modo memoria no altera la secuencia ni la
  // respuesta que saldría con la misma semilla.
  const memoria = opciones.sinMemoria ? null : memoriaParaNivel(modo, nivel, cartas.length);

  // Desde la segunda posición de la banda, parte de las preguntas piden el
  // conteo de las cartas que QUEDAN en el mazo, usando la suma conocida del
  // mazo completo (0 en los balanceados, +4 en KO).
  if (idx >= 1 && rngActual() < 0.3) {
    const total = sumaMazoCompleto(modo);
    const dato =
      total === 0
        ? "un mazo completo de 52 cartas suma 0"
        : `un mazo completo de 52 cartas suma ${conSigno(total)}`;
    return {
      modo,
      tipo: "restante",
      enunciado: memoria
        ? `Sistema ${nombre}: ${dato}. Salen cartas de un mazo de 52, una a una, y desaparecen. Cuenta de memoria las que salieron: ¿cuál es el conteo de las cartas que quedan en el mazo?`
        : `Sistema ${nombre}: ${dato}. Ya salieron las cartas indicadas, de un mazo de 52. ¿Cuál es el conteo de las cartas que quedan en el mazo?`,
      cartas,
      entrada: "numero",
      respuesta: total - corriente,
      tolerancia: 0,
      ...(memoria ? { memoria } : {}),
    };
  }

  return {
    modo,
    tipo: "corriente",
    enunciado: memoria
      ? `Sistema ${nombre}: las cartas salen una a una y desaparecen. Cuéntalas de memoria, en orden. ¿Cuál es el conteo corriente final?`
      : `Sistema ${nombre}: cuenta las cartas en orden. ¿Cuál es el conteo corriente final?`,
    cartas,
    entrada: "numero",
    respuesta: corriente,
    tolerancia: 0,
    ...(memoria ? { memoria } : {}),
  };
}

// ---------- Conteo verdadero ----------

type ReglaRedondeo = "cercano" | "truncar" | "abajo";

const TEXTO_REGLA: Record<ReglaRedondeo, string> = {
  cercano: "redondeando al entero más cercano",
  truncar: "descartando los decimales (truncando hacia cero)",
  abajo: "redondeando hacia abajo (al entero menor)",
};

// num/den con den > 0 y enteros chicos.
function divisionEntera(num: number, den: number, regla: ReglaRedondeo): number {
  // `|| 0` normaliza -0 (trunc de un cociente negativo chico) a 0.
  return divisionEnteraCruda(num, den, regla) || 0;
}

function divisionEnteraCruda(num: number, den: number, regla: ReglaRedondeo): number {
  const q = Math.trunc(num / den);
  const resto = num - q * den;
  if (regla === "truncar") return q;
  if (regla === "abajo") return resto !== 0 && num < 0 ? q - 1 : q;
  // cercano (sin empates: los generadores los descartan)
  const piso = resto !== 0 && num < 0 ? q - 1 : q;
  const restoPiso = num - piso * den;
  return restoPiso * 2 > den ? piso + 1 : piso;
}

// num/den cae exactamente a la mitad entre dos enteros.
function esEmpate(num: number, den: number): boolean {
  const m = ((2 * num) % (2 * den) + 2 * den) % (2 * den);
  return m === den;
}

function elegirReglaSinEmpate(num: number, den: number): ReglaRedondeo | null {
  const reglas = mezclar<ReglaRedondeo>(["cercano", "truncar", "abajo"]);
  for (const r of reglas) {
    if (r === "cercano" && esEmpate(num, den)) continue;
    return r;
  }
  return null;
}

// Redondeo al medio mazo más cercano de rem/52 (rem = cartas que quedan),
// en unidades de medio mazo: round(rem / 26). Sin empates (rem % 26 != 13).
function mediosMazosRestantes(rem: number): number {
  return Math.round(rem / 26);
}

// Conteo corriente Hi-Lo y mazos restantes dados: dividir y redondear con
// la regla declarada en el enunciado.
function verdaderoDirecto(nivelBanda: number): ProblemaNaipia {
  const mediosPermitidos = nivelBanda >= 10;
  for (;;) {
    const medios = mediosPermitidos ? randomInt(3, 12) : 2 * randomInt(2, 6); // en unidades de medio mazo
    const rc = randomInt(-14, 26);
    if (rc === 0) continue;
    const num = 2 * rc; // rc / (medios/2) = 2rc / medios
    const regla = elegirReglaSinEmpate(num, medios);
    if (!regla) continue;
    const mazos = medios / 2;
    return {
      modo: "verdadero",
      tipo: "verdadero",
      enunciado: `Sistema Hi-Lo: el conteo corriente es ${conSigno(rc)} y quedan ${formatoMazos(mazos)} mazos. Calcula el conteo verdadero (conteo corriente ÷ mazos restantes), ${TEXTO_REGLA[regla]}.`,
      cartas: [],
      entrada: "numero",
      respuesta: divisionEntera(num, medios, regla),
      tolerancia: 0,
    };
  }
}

// Estimación de mazos restantes a partir de las cartas ya jugadas.
function estimarMazos(): ProblemaNaipia {
  for (;;) {
    const m = randomInt(2, 8);
    const jugadas = randomInt(20, 52 * m - 24);
    const rem = 52 * m - jugadas;
    if (rem % 26 === 13) continue; // empate al medio mazo: se descarta
    return {
      modo: "verdadero",
      tipo: "mazos",
      enunciado: `Se usa un conjunto de ${m} mazos de 52 cartas y ya salieron ${jugadas} cartas. ¿Cuántos mazos quedan? Redondea al medio mazo más cercano.`,
      cartas: [],
      entrada: "numero",
      respuesta: mediosMazosRestantes(rem) / 2,
      tolerancia: 0,
    };
  }
}

// Dos pasos: estimar los mazos que quedan (medio mazo más cercano) y con
// eso calcular el conteo verdadero.
function verdaderoEnDosPasos(): ProblemaNaipia {
  for (;;) {
    const m = randomInt(3, 8);
    const jugadas = randomInt(26, 52 * m - 52);
    const rem = 52 * m - jugadas;
    if (rem % 26 === 13) continue;
    const medios = mediosMazosRestantes(rem);
    if (medios < 2) continue;
    const rc = randomInt(-14, 26);
    if (rc === 0) continue;
    const num = 2 * rc;
    const regla = elegirReglaSinEmpate(num, medios);
    if (!regla) continue;
    return {
      modo: "verdadero",
      tipo: "verdadero2",
      enunciado: `Sistema Hi-Lo con un conjunto de ${m} mazos de 52 cartas: el conteo corriente es ${conSigno(rc)} y ya salieron ${jugadas} cartas. Primero redondea al medio mazo más cercano los mazos que quedan; después calcula el conteo verdadero (conteo corriente ÷ mazos restantes), ${TEXTO_REGLA[regla]}.`,
      cartas: [],
      entrada: "numero",
      respuesta: divisionEntera(num, medios, regla),
      tolerancia: 0,
    };
  }
}

function generarVerdadero(nivel: number): ProblemaNaipia {
  const banda = bandaNaipia("verdadero", nivel);
  const r = rngActual();
  if (banda >= 10) {
    if (r < 0.4) return verdaderoDirecto(banda);
    if (r < 0.6) return estimarMazos();
    return verdaderoEnDosPasos();
  }
  return r < 0.6 ? verdaderoDirecto(banda) : estimarMazos();
}

export function generarProblemaNaipia(modo: ModoNaipia, nivel: number, opciones: OpcionesNaipia = {}): ProblemaNaipia {
  if (modo === "verdadero") return generarVerdadero(nivel);
  return generarSecuencia(modo, nivel, opciones);
}

export function claveNaipia(p: ProblemaNaipia): string {
  return `${p.enunciado}|${cartasATexto(p.cartas)}|${p.respuesta}`;
}

// ---------- Reto diario ----------

// Los 4 sistemas por secuencia (respuesta entera) entran al reto; el
// conteo verdadero queda afuera (más aritmética que memoria, fuera del
// formato rápido de 5 preguntas).
export const MODOS_NAIPIA_RETO: ModoNaipia[] = ["hilo", "ko", "hiopt2", "omega2"];

function distractoresEnteros(rng: () => number, correcto: number): string[] {
  const candidatos = [correcto + 1, correcto - 1, correcto + 2, correcto - 2, -correcto].filter(
    (n, i, arr) => n !== correcto && arr.indexOf(n) === i
  );
  const mezclados = [...candidatos];
  for (let i = mezclados.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [mezclados[i], mezclados[j]] = [mezclados[j], mezclados[i]];
  }
  return mezclados.slice(0, 3).map(String);
}

// Misma forma que preguntaCalculia de retoDiario.ts: (rng) -> PreguntaRetoDiario.
// La secuencia viaja en el texto del enunciado ("7♠ K♥ ..."): por eso el reto
// SIEMPRE se genera con sinMemoria (el modo memoria no tiene versión en texto).
export function preguntaNaipia(rng: () => number): PreguntaRetoDiario {
  const modo = MODOS_NAIPIA_RETO[Math.floor(rng() * MODOS_NAIPIA_RETO.length)];
  const nivel = Math.floor(rng() * 5) + 3; // 3-7, igual que nivelMedio() del reto
  const p = conRngSembrado(rng, () => generarProblemaNaipia(modo, nivel, { sinMemoria: true }));
  const respuesta = String(p.respuesta);
  const opciones = [respuesta, ...distractoresEnteros(rng, p.respuesta)];
  for (let i = opciones.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [opciones[i], opciones[j]] = [opciones[j], opciones[i]];
  }
  return { mundo: "naipia", enunciado: enunciadoCompleto(p), opciones, respuesta };
}
