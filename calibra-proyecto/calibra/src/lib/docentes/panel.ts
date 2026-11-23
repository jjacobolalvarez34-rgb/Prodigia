// Piloto para colegios (0318): lógica pura del panel del docente y de las tareas.
// La usan la web (/profesor) y la app (tareas del estudiante); sin React ni Supabase
// para poder probarla sola (panel.test.ts).

export interface FilaPanelAlumno {
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  unido_at: string;
  ejercicios_7d: number;
  correctos_7d: number;
  ejercicios_total: number;
  correctos_total: number;
  ultima_actividad: string | null;
  mundo_top_7d: string | null;
  pro_colegio: boolean;
}

export interface FilaProgresoTarea {
  tarea_id: string;
  mundo: string;
  titulo: string;
  instrucciones: string | null;
  meta_ejercicios: number;
  inicia_at: string;
  vence_at: string;
  user_id: string;
  hechos: number;
  correctos: number;
}

export interface DiaActividad {
  fecha: string;
  ejercicios: number;
  activos: number;
}

export const DIA_MS = 24 * 60 * 60 * 1000;
// Por debajo de esto (con al menos MIN_EJERCICIOS_PRECISION) se avisa al docente.
export const PRECISION_BAJA = 0.6;
export const MIN_EJERCICIOS_PRECISION = 15;
export const DIAS_INACTIVO = 7;

export function precision(correctos: number, hechos: number): number | null {
  return hechos > 0 ? correctos / hechos : null;
}

export function porcentaje(valor: number | null): string {
  return valor === null ? "—" : `${Math.round(valor * 100)} %`;
}

export function diasDesde(iso: string | null, ahora: number): number | null {
  if (!iso) return null;
  return Math.floor((ahora - new Date(iso).getTime()) / DIA_MS);
}

export type MotivoAlerta = "nunca" | "inactivo" | "precision";

export interface Alerta {
  user_id: string;
  nombre: string;
  motivo: MotivoAlerta;
  dias?: number;
  precision?: number;
}

// Quién necesita atención: nunca jugó, lleva 7+ días sin jugar, o en la última
// semana acierta menos del 60 % (con suficientes ejercicios para que no sea ruido).
export function alertasDelCurso(filas: FilaPanelAlumno[], ahora: number, sinNombre: string): Alerta[] {
  const alertas: Alerta[] = [];
  for (const f of filas) {
    const nombre = f.display_name ?? sinNombre;
    const dias = diasDesde(f.ultima_actividad, ahora);
    if (dias === null) {
      alertas.push({ user_id: f.user_id, nombre, motivo: "nunca" });
      continue;
    }
    if (dias >= DIAS_INACTIVO) {
      alertas.push({ user_id: f.user_id, nombre, motivo: "inactivo", dias });
      continue;
    }
    const p = precision(f.correctos_7d, f.ejercicios_7d);
    if (p !== null && f.ejercicios_7d >= MIN_EJERCICIOS_PRECISION && p < PRECISION_BAJA) {
      alertas.push({ user_id: f.user_id, nombre, motivo: "precision", precision: p });
    }
  }
  const orden: Record<MotivoAlerta, number> = { nunca: 0, inactivo: 1, precision: 2 };
  return alertas.sort((a, b) => orden[a.motivo] - orden[b.motivo] || (b.dias ?? 0) - (a.dias ?? 0));
}

export interface ResumenCurso {
  alumnos: number;
  activos7d: number;
  ejercicios7d: number;
  precision7d: number | null;
}

export function resumenCurso(filas: FilaPanelAlumno[]): ResumenCurso {
  const ejercicios7d = filas.reduce((s, f) => s + f.ejercicios_7d, 0);
  const correctos7d = filas.reduce((s, f) => s + f.correctos_7d, 0);
  return {
    alumnos: filas.length,
    activos7d: filas.filter((f) => f.ejercicios_7d > 0).length,
    ejercicios7d,
    precision7d: precision(correctos7d, ejercicios7d),
  };
}

export type EstadoTarea = "pendiente" | "en_curso" | "cumplida";

export function estadoTareaAlumno(hechos: number, meta: number): EstadoTarea {
  if (hechos >= meta) return "cumplida";
  if (hechos > 0) return "en_curso";
  return "pendiente";
}

export interface TareaAgrupada {
  tarea_id: string;
  mundo: string;
  titulo: string;
  instrucciones: string | null;
  meta_ejercicios: number;
  inicia_at: string;
  vence_at: string;
  vencida: boolean;
  cumplidas: number;
  enCurso: number;
  pendientes: number;
  alumnos: { user_id: string; hechos: number; correctos: number; estado: EstadoTarea }[];
}

// progreso_tareas_grupo devuelve una fila por tarea y estudiante: se agrupa por tarea.
export function agruparTareas(filas: FilaProgresoTarea[], ahora: number): TareaAgrupada[] {
  const porId = new Map<string, TareaAgrupada>();
  for (const f of filas) {
    let t = porId.get(f.tarea_id);
    if (!t) {
      t = {
        tarea_id: f.tarea_id,
        mundo: f.mundo,
        titulo: f.titulo,
        instrucciones: f.instrucciones,
        meta_ejercicios: f.meta_ejercicios,
        inicia_at: f.inicia_at,
        vence_at: f.vence_at,
        vencida: new Date(f.vence_at).getTime() <= ahora,
        cumplidas: 0,
        enCurso: 0,
        pendientes: 0,
        alumnos: [],
      };
      porId.set(f.tarea_id, t);
    }
    const estado = estadoTareaAlumno(f.hechos, f.meta_ejercicios);
    t.alumnos.push({ user_id: f.user_id, hechos: f.hechos, correctos: f.correctos, estado });
    if (estado === "cumplida") t.cumplidas++;
    else if (estado === "en_curso") t.enCurso++;
    else t.pendientes++;
  }
  // Primero las vigentes (la que vence antes arriba), después las vencidas (la más reciente arriba).
  return [...porId.values()].sort((a, b) => {
    if (a.vencida !== b.vencida) return a.vencida ? 1 : -1;
    const da = new Date(a.vence_at).getTime();
    const db = new Date(b.vence_at).getTime();
    return a.vencida ? db - da : da - db;
  });
}

// Fecha límite de una tarea: el final del día elegido (23:59:59) en hora de Colombia.
export function finDelDiaBogota(fechaIso: string): string {
  return `${fechaIso}T23:59:59-05:00`;
}

function celdaCsv(v: string | number | null): string {
  const s = v === null ? "" : String(v);
  return /[",;\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

// Informe del curso para Excel / Google Sheets. Separador «;» y BOM para que Excel en
// español abra las tildes y las columnas bien.
export function csvDelCurso(
  filas: FilaPanelAlumno[],
  tareas: TareaAgrupada[],
  encabezados: { alumno: string; ejercicios7d: string; precision7d: string; ejerciciosTotal: string; precisionTotal: string; ultima: string; ciudad: string },
  nombreMundo: (slug: string) => string,
  sinNombre: string,
): string {
  const cab = [
    encabezados.alumno,
    encabezados.ejercicios7d,
    encabezados.precision7d,
    encabezados.ejerciciosTotal,
    encabezados.precisionTotal,
    encabezados.ultima,
    encabezados.ciudad,
    ...tareas.map((t) => `${t.titulo} (${t.meta_ejercicios})`),
  ];
  const lineas = [cab.map(celdaCsv).join(";")];
  for (const f of filas) {
    const celdas: (string | number | null)[] = [
      f.display_name ?? sinNombre,
      f.ejercicios_7d,
      porcentaje(precision(f.correctos_7d, f.ejercicios_7d)),
      f.ejercicios_total,
      porcentaje(precision(f.correctos_total, f.ejercicios_total)),
      f.ultima_actividad ? f.ultima_actividad.slice(0, 10) : "",
      f.mundo_top_7d ? nombreMundo(f.mundo_top_7d) : "",
      ...tareas.map((t) => t.alumnos.find((a) => a.user_id === f.user_id)?.hechos ?? 0),
    ];
    lineas.push(celdas.map(celdaCsv).join(";"));
  }
  return String.fromCharCode(0xfeff) + lineas.join("\r\n");
}

// Tareas del estudiante (mis_tareas): vigentes primero, sin cumplir antes que cumplidas.
export interface MiTarea {
  tarea_id: string;
  grupo: string;
  mundo: string;
  titulo: string;
  instrucciones: string | null;
  meta_ejercicios: number;
  inicia_at: string;
  vence_at: string;
  hechos: number;
  correctos: number;
}

export function ordenarMisTareas(tareas: MiTarea[], ahora: number): MiTarea[] {
  const clave = (t: MiTarea) => {
    const vencida = new Date(t.vence_at).getTime() <= ahora;
    const cumplida = t.hechos >= t.meta_ejercicios;
    return (vencida ? 2 : 0) + (cumplida ? 1 : 0);
  };
  return [...tareas].sort((a, b) => clave(a) - clave(b) || new Date(a.vence_at).getTime() - new Date(b.vence_at).getTime());
}

// «Vence hoy», «vence mañana», «quedan N días», «venció».
export type Plazo = { tipo: "vencida" } | { tipo: "hoy" } | { tipo: "manana" } | { tipo: "dias"; n: number };

export function plazoDe(venceIso: string, ahora: number): Plazo {
  const vence = new Date(venceIso).getTime();
  if (vence <= ahora) return { tipo: "vencida" };
  const dia = (ms: number) => Math.floor((ms - 5 * 60 * 60 * 1000) / DIA_MS);
  const n = dia(vence) - dia(ahora);
  if (n <= 0) return { tipo: "hoy" };
  if (n === 1) return { tipo: "manana" };
  return { tipo: "dias", n };
}
