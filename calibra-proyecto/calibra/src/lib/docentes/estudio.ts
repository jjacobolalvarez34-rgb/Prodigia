// Estudio del curso para el docente (0319, pedido 2026-11-23: «que sean datos útiles y
// que haya estudios de cómo mejorar»). Lógica pura: recibe lo que devuelven
// estudio_grupo y habitos_grupo y arma
//  - los temas del curso (qué tanto aciertan, si mejoran o empeoran, a quién le cuesta),
//  - el perfil de cada estudiante (fortalezas, debilidades, velocidad frente al curso,
//    constancia, tendencia y una etiqueta que resume cómo va),
//  - recomendaciones concretas, ordenadas por importancia.
// Los umbrales son prudentes a propósito: con pocos ejercicios no se saca conclusión.

export interface FilaEstudio {
  user_id: string;
  mundo: string;
  tema: string;
  intentos: number;
  correctos: number;
  intentos_rec: number;
  correctos_rec: number;
  intentos_ant: number;
  correctos_ant: number;
  tiempo_mediano_ms: number | null;
  nivel_max: number | null;
  nivel_rec: number | null;
  ultimo: string | null;
}

export interface FilaHabito {
  user_id: string;
  fecha: string;
  hora: number;
  ejercicios: number;
  correctos: number;
  minutos: number;
}

const DIA = 24 * 60 * 60 * 1000;
// Mínimo de ejercicios de un estudiante en un tema para opinar sobre ese tema.
export const MIN_TEMA_ALUMNO = 10;
// Mínimo de ejercicios del curso en un tema para opinar sobre el curso.
export const MIN_TEMA_CURSO = 25;
// Mínimo en cada quincena para hablar de tendencia.
export const MIN_TENDENCIA = 8;

function prec(c: number, n: number): number | null {
  return n > 0 ? c / n : null;
}

function mediana(v: number[]): number | null {
  if (v.length === 0) return null;
  const o = [...v].sort((a, b) => a - b);
  const m = Math.floor(o.length / 2);
  return o.length % 2 ? o[m] : (o[m - 1] + o[m]) / 2;
}

// Diferencia en puntos porcentuales entre las dos últimas quincenas (null si no alcanza).
export function tendencia(cRec: number, nRec: number, cAnt: number, nAnt: number): number | null {
  if (nRec < MIN_TENDENCIA || nAnt < MIN_TENDENCIA) return null;
  return Math.round(((cRec / nRec) - (cAnt / nAnt)) * 100);
}

// ---------- temas del curso ----------
export interface TemaCurso {
  tema: string;
  mundo: string;
  intentos: number;
  precision: number | null;
  tendencia: number | null;
  alumnos: number;
  conDificultad: string[];
  tiempoMedianoMs: number | null;
  nivelPromedio: number | null;
}

export function temasDelCurso(filas: FilaEstudio[]): TemaCurso[] {
  const porTema = new Map<string, FilaEstudio[]>();
  for (const f of filas) {
    const l = porTema.get(f.tema) ?? [];
    l.push(f);
    porTema.set(f.tema, l);
  }
  const lista: TemaCurso[] = [];
  for (const [tema, fs] of porTema) {
    const n = fs.reduce((s, f) => s + f.intentos, 0);
    const c = fs.reduce((s, f) => s + f.correctos, 0);
    const nr = fs.reduce((s, f) => s + f.intentos_rec, 0);
    const cr = fs.reduce((s, f) => s + f.correctos_rec, 0);
    const na = fs.reduce((s, f) => s + f.intentos_ant, 0);
    const ca = fs.reduce((s, f) => s + f.correctos_ant, 0);
    const niveles = fs.map((f) => f.nivel_rec).filter((x): x is number => x !== null);
    lista.push({
      tema,
      mundo: fs[0].mundo,
      intentos: n,
      precision: prec(c, n),
      tendencia: tendencia(cr, nr, ca, na),
      alumnos: fs.length,
      conDificultad: fs.filter((f) => f.intentos >= MIN_TEMA_ALUMNO && f.correctos / f.intentos < 0.6).map((f) => f.user_id),
      tiempoMedianoMs: mediana(fs.filter((f) => f.tiempo_mediano_ms !== null).map((f) => f.tiempo_mediano_ms as number)),
      nivelPromedio: niveles.length ? Math.round((niveles.reduce((a, b) => a + b, 0) / niveles.length) * 10) / 10 : null,
    });
  }
  // Primero los que más cuestan (con datos suficientes), después el resto.
  return lista.sort((a, b) => {
    const da = a.intentos >= MIN_TEMA_CURSO ? 0 : 1;
    const db = b.intentos >= MIN_TEMA_CURSO ? 0 : 1;
    return da - db || (a.precision ?? 1) - (b.precision ?? 1) || b.intentos - a.intentos;
  });
}

// ---------- perfil de cada estudiante ----------
export type Etiqueta = "sin_actividad" | "en_riesgo" | "apurado" | "estancado" | "progresa" | "lento_seguro" | "solido" | "en_camino";

export interface TemaAlumno {
  tema: string;
  mundo: string;
  intentos: number;
  precision: number;
}

export interface PerfilAlumno {
  user_id: string;
  intentos: number;
  precision: number | null;
  tendencia: number | null;
  // Tiempo de respuesta frente a la mediana del curso en los mismos temas (1 = igual;
  // 0,7 = 30 % más rápido).
  velocidad: number | null;
  diasActivos: number;
  minutosSemana: number;
  horaPico: number | null;
  fuertes: TemaAlumno[];
  debiles: TemaAlumno[];
  diasSinPracticar: number | null;
  etiqueta: Etiqueta;
}

export function perfilAlumno(userId: string, filas: FilaEstudio[], temas: TemaCurso[], habitos: FilaHabito[], ahora: number): PerfilAlumno {
  const mias = filas.filter((f) => f.user_id === userId);
  const n = mias.reduce((s, f) => s + f.intentos, 0);
  const c = mias.reduce((s, f) => s + f.correctos, 0);
  const t = tendencia(
    mias.reduce((s, f) => s + f.correctos_rec, 0),
    mias.reduce((s, f) => s + f.intentos_rec, 0),
    mias.reduce((s, f) => s + f.correctos_ant, 0),
    mias.reduce((s, f) => s + f.intentos_ant, 0),
  );

  const medianaCurso = new Map(temas.map((x) => [x.tema, x.tiempoMedianoMs]));
  let pesos = 0;
  let suma = 0;
  for (const f of mias) {
    const mc = medianaCurso.get(f.tema);
    if (f.intentos >= MIN_TEMA_ALUMNO && f.tiempo_mediano_ms && mc) {
      suma += (f.tiempo_mediano_ms / mc) * f.intentos;
      pesos += f.intentos;
    }
  }
  const velocidad = pesos > 0 ? Math.round((suma / pesos) * 100) / 100 : null;

  const misHabitos = habitos.filter((h) => h.user_id === userId);
  const hoy = new Date(ahora - 5 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const haceSemana = new Date(ahora - 5 * 60 * 60 * 1000 - 6 * DIA).toISOString().slice(0, 10);
  const diasActivos = new Set(misHabitos.map((h) => h.fecha)).size;
  const minutosSemana = Math.round(misHabitos.filter((h) => h.fecha >= haceSemana && h.fecha <= hoy).reduce((s, h) => s + h.minutos, 0));
  const porHora = new Map<number, number>();
  for (const h of misHabitos) porHora.set(h.hora, (porHora.get(h.hora) ?? 0) + h.ejercicios);
  const horaPico = porHora.size ? [...porHora.entries()].sort((a, b) => b[1] - a[1] || a[0] - b[0])[0][0] : null;

  const conDatos: TemaAlumno[] = mias
    .filter((f) => f.intentos >= MIN_TEMA_ALUMNO)
    .map((f) => ({ tema: f.tema, mundo: f.mundo, intentos: f.intentos, precision: f.correctos / f.intentos }));
  const fuertes = [...conDatos].filter((x) => x.precision >= 0.8).sort((a, b) => b.precision - a.precision || b.intentos - a.intentos).slice(0, 3);
  const debiles = [...conDatos].filter((x) => x.precision < 0.7).sort((a, b) => a.precision - b.precision || b.intentos - a.intentos).slice(0, 3);

  const ultimo = mias.reduce<number | null>((m, f) => (f.ultimo ? Math.max(m ?? 0, new Date(f.ultimo).getTime()) : m), null);
  const diasSinPracticar = ultimo === null ? null : Math.floor((ahora - ultimo) / DIA);
  const p = prec(c, n);

  let etiqueta: Etiqueta;
  if (n === 0) etiqueta = "sin_actividad";
  else if ((diasSinPracticar ?? 99) >= 7) etiqueta = "en_riesgo";
  // «Apurado» antes que «acierta poco»: explica por qué falla y qué hacer.
  else if (velocidad !== null && velocidad < 0.75 && p !== null && p < 0.65) etiqueta = "apurado";
  else if (p !== null && n >= MIN_TEMA_ALUMNO && p < 0.5) etiqueta = "en_riesgo";
  else if (t !== null && (t <= -5 || (Math.abs(t) < 3 && p !== null && p < 0.65))) etiqueta = "estancado";
  else if (t !== null && t >= 8) etiqueta = "progresa";
  else if (velocidad !== null && velocidad > 1.35 && p !== null && p >= 0.8) etiqueta = "lento_seguro";
  else if (p !== null && p >= 0.85 && diasActivos >= 8) etiqueta = "solido";
  else etiqueta = "en_camino";

  return { user_id: userId, intentos: n, precision: p, tendencia: t, velocidad, diasActivos, minutosSemana, horaPico, fuertes, debiles, diasSinPracticar, etiqueta };
}

// ---------- recomendaciones ----------
export type TipoRecomendacion =
  | "tema_critico"
  | "tema_empeora"
  | "contactar"
  | "apurados"
  | "estancados"
  | "repartir_practica"
  | "fluidez"
  | "reconocer"
  | "subir_nivel";

export interface Recomendacion {
  tipo: TipoRecomendacion;
  prioridad: 1 | 2 | 3;
  tema?: string;
  mundo?: string;
  valor?: number;
  alumnos?: string[];
  tarea?: { mundo: string; tema: string; meta: number };
}

export function recomendaciones(temas: TemaCurso[], perfiles: PerfilAlumno[]): Recomendacion[] {
  const r: Recomendacion[] = [];
  const conDatos = temas.filter((t) => t.intentos >= MIN_TEMA_CURSO && t.precision !== null);

  for (const t of conDatos.filter((t) => (t.precision ?? 1) < 0.65).slice(0, 2)) {
    r.push({ tipo: "tema_critico", prioridad: 1, tema: t.tema, mundo: t.mundo, valor: Math.round((t.precision ?? 0) * 100), alumnos: t.conDificultad, tarea: { mundo: t.mundo, tema: t.tema, meta: 20 } });
  }
  for (const t of conDatos.filter((t) => t.tendencia !== null && t.tendencia <= -8 && !r.some((x) => x.tema === t.tema)).slice(0, 2)) {
    r.push({ tipo: "tema_empeora", prioridad: 1, tema: t.tema, mundo: t.mundo, valor: t.tendencia ?? 0, tarea: { mundo: t.mundo, tema: t.tema, meta: 15 } });
  }
  const riesgo = perfiles.filter((p) => p.etiqueta === "en_riesgo" || p.etiqueta === "sin_actividad").map((p) => p.user_id);
  if (riesgo.length) r.push({ tipo: "contactar", prioridad: 1, alumnos: riesgo });

  const apurados = perfiles.filter((p) => p.etiqueta === "apurado").map((p) => p.user_id);
  if (apurados.length) r.push({ tipo: "apurados", prioridad: 2, alumnos: apurados });
  const estancados = perfiles.filter((p) => p.etiqueta === "estancado").map((p) => p.user_id);
  if (estancados.length) r.push({ tipo: "estancados", prioridad: 2, alumnos: estancados });

  const activos = perfiles.filter((p) => p.intentos > 0);
  const medianaDias = mediana(activos.map((p) => p.diasActivos));
  if (activos.length >= 3 && medianaDias !== null && medianaDias < 6) {
    r.push({ tipo: "repartir_practica", prioridad: 2, valor: medianaDias });
  }

  const lentos = perfiles.filter((p) => p.etiqueta === "lento_seguro").map((p) => p.user_id);
  if (lentos.length) r.push({ tipo: "fluidez", prioridad: 3, alumnos: lentos });
  const progresan = perfiles.filter((p) => p.etiqueta === "progresa").map((p) => p.user_id);
  if (progresan.length) r.push({ tipo: "reconocer", prioridad: 3, alumnos: progresan });
  const dominado = conDatos.find((t) => (t.precision ?? 0) >= 0.9 && t.alumnos >= 3);
  if (dominado) r.push({ tipo: "subir_nivel", prioridad: 3, tema: dominado.tema, mundo: dominado.mundo, valor: Math.round((dominado.precision ?? 0) * 100) });

  return r.sort((a, b) => a.prioridad - b.prioridad);
}

// ---------- hábitos del curso ----------
// Ejercicios por día de los últimos `dias` días para cada estudiante (para el mapa de constancia).
export function matrizConstancia(habitos: FilaHabito[], userIds: string[], dias: number, ahora: number): { fechas: string[]; filas: Map<string, number[]> } {
  const base = ahora - 5 * 60 * 60 * 1000;
  const fechas = Array.from({ length: dias }, (_, k) => new Date(base - (dias - 1 - k) * DIA).toISOString().slice(0, 10));
  const indice = new Map(fechas.map((f, k) => [f, k]));
  const filas = new Map(userIds.map((u) => [u, new Array<number>(dias).fill(0)]));
  for (const h of habitos) {
    const k = indice.get(h.fecha);
    const fila = filas.get(h.user_id);
    if (k !== undefined && fila) fila[k] += h.ejercicios;
  }
  return { fechas, filas };
}

// Ejercicios del curso por hora del día (0-23).
export function horasDelCurso(habitos: FilaHabito[]): number[] {
  const horas = new Array<number>(24).fill(0);
  for (const h of habitos) horas[h.hora] += h.ejercicios;
  return horas;
}

// Cuántos estudiantes caen en cada franja de precisión.
export function distribucionPrecision(perfiles: PerfilAlumno[]): { franja: string; cantidad: number }[] {
  const franjas: [string, number, number][] = [
    ["<50", 0, 0.5],
    ["50-64", 0.5, 0.65],
    ["65-79", 0.65, 0.8],
    ["80-89", 0.8, 0.9],
    ["90+", 0.9, 1.01],
  ];
  return franjas.map(([franja, desde, hasta]) => ({
    franja,
    cantidad: perfiles.filter((p) => p.precision !== null && p.intentos >= MIN_TEMA_ALUMNO && p.precision >= desde && p.precision < hasta).length,
  }));
}
