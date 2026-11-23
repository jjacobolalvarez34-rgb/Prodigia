// Curso de ejemplo para la demo pública del panel docente (/docentes/demo, pedido
// 2026-11-23: «agrega un botón para ver una demo de los colegios»). Todo es inventado
// y la página lo dice: sirve para que un colegio vea el panel sin crear cuenta. Es
// determinista para la misma hora (igual en el servidor y en el cliente).
import type { DiaActividad, FilaPanelAlumno, FilaProgresoTarea } from "./panel";
import type { FilaEstudio, FilaHabito } from "./estudio";


const DIA = 24 * 60 * 60 * 1000;

// [nombre, ejercicios 7 días, % acierto, ejercicios en total, días desde la última vez (null = nunca), ciudad más jugada]
const ALUMNOS: [string, number, number, number, number | null, string | null][] = [
  ["Valentina R.", 142, 0.91, 1260, 0, "numeria"],
  ["Santiago M.", 118, 0.84, 980, 0, "quimia"],
  ["Isabella G.", 96, 0.88, 1105, 1, "numeria"],
  ["Mateo L.", 87, 0.79, 640, 0, "geografia"],
  ["Mariana C.", 74, 0.93, 820, 1, "quimia"],
  ["Samuel P.", 61, 0.52, 410, 2, "numeria"],
  ["Sofía A.", 55, 0.86, 530, 0, "vitalia"],
  ["Juan José H.", 48, 0.81, 395, 3, "geografia"],
  ["Luciana V.", 33, 0.47, 260, 1, "quimia"],
  ["Emiliano T.", 22, 0.77, 300, 4, "numeria"],
  ["Gabriela N.", 0, 0, 140, 9, null],
  ["Tomás B.", 0, 0, 0, null, null],
];

export const GRUPO_DEMO = { id: "demo", nombre: "10A · Matemáticas y Ciencias", codigo: "DEMO10" };

export function cursoDemo(ahora: number): { filas: FilaPanelAlumno[]; tareas: FilaProgresoTarea[]; actividad: DiaActividad[] } {
  const iso = (ms: number) => new Date(ms).toISOString();
  const filas: FilaPanelAlumno[] = ALUMNOS.map(([nombre, e7, p, total, dias, ciudad], i) => ({
    user_id: `demo-${i}`,
    display_name: nombre,
    avatar_url: null,
    unido_at: iso(ahora - 40 * DIA),
    ejercicios_7d: e7,
    correctos_7d: Math.round(e7 * p),
    ejercicios_total: total,
    correctos_total: Math.round(total * (p || 0.75)),
    ultima_actividad: dias === null ? null : iso(ahora - dias * DIA - 3 * 60 * 60 * 1000),
    mundo_top_7d: ciudad,
    pro_colegio: dias !== null,
  }));

  const tareasBase: { id: string; mundo: string; titulo: string; instrucciones: string | null; meta: number; desde: number; hasta: number; avance: number[] }[] = [
    { id: "t1", mundo: "numeria", titulo: "Fracciones: suma y resta", instrucciones: "Antes del parcial del viernes.", meta: 20, desde: -3, hasta: 3, avance: [26, 22, 20, 14, 20, 9, 12, 5, 3, 0, 0, 0] },
    { id: "t2", mundo: "quimia", titulo: "Tabla periódica", instrucciones: null, meta: 15, desde: -2, hasta: 6, avance: [15, 18, 6, 4, 15, 2, 8, 0, 11, 0, 0, 0] },
    { id: "t3", mundo: "geografia", titulo: "Capitales de América", instrucciones: "Repaso de la unidad 2.", meta: 10, desde: -9, hasta: -1, avance: [12, 10, 10, 14, 10, 6, 10, 10, 4, 7, 2, 0] },
  ];
  const tareas: FilaProgresoTarea[] = [];
  for (const tb of tareasBase) {
    filas.forEach((f, i) => {
      const hechos = tb.avance[i] ?? 0;
      tareas.push({
        tarea_id: tb.id,
        mundo: tb.mundo,
        titulo: tb.titulo,
        instrucciones: tb.instrucciones,
        meta_ejercicios: tb.meta,
        inicia_at: iso(ahora + tb.desde * DIA),
        vence_at: iso(ahora + tb.hasta * DIA),
        user_id: f.user_id,
        hechos,
        correctos: Math.round(hechos * 0.82),
      });
    });
  }

  const forma = [34, 52, 61, 18, 9, 66, 71, 58, 63, 22, 14, 74, 80, 69];
  const activos = [5, 7, 8, 3, 2, 8, 9, 8, 9, 4, 3, 9, 10, 9];
  const actividad: DiaActividad[] = forma.map((ej, k) => ({
    fecha: new Date(ahora - 5 * 60 * 60 * 1000 - (13 - k) * DIA).toISOString().slice(0, 10),
    ejercicios: ej * 4,
    activos: activos[k],
  }));

  return { filas, tareas, actividad };
}

// ---------- estudio del curso de ejemplo (0319) ----------

// Temas del curso de ejemplo: [tema, ciudad, ajuste de acierto, tiempo base en ms].
const TEMAS_DEMO: [string, string, number, number][] = [
  ["fracciones_sumar", "numeria", -0.24, 9000],
  ["fracciones_simplificar", "numeria", -0.04, 7000],
  ["decimales_porcentaje", "numeria", -0.08, 8000],
  ["algebra_dos-pasos", "numeria", -0.12, 11000],
  ["quimia_tabla", "quimia", 0.02, 6000],
  ["quimia_nomenclatura", "quimia", -0.18, 10000],
  ["geografia_america", "geografia", 0.07, 5000],
  ["vitalia_celula", "vitalia", 0.03, 7000],
];

// Por estudiante: [multiplicador de velocidad, tendencia en puntos (reciente - anterior)].
const RITMO_DEMO: [number, number][] = [
  [0.95, 3], [1.0, 2], [1.05, 1], [1.0, 14], [1.55, 2], [0.6, -2],
  [1.0, 9], [1.1, -9], [1.0, 0], [1.2, 4], [1.0, 0], [1.0, 0],
];

export function estudioDemo(ahora: number): { estudio: FilaEstudio[]; habitos: FilaHabito[] } {
  const estudio: FilaEstudio[] = [];
  const habitos: FilaHabito[] = [];
  ALUMNOS.forEach(([, e7, p, total, dias], i) => {
    if (total === 0) return;
    const [vel, tend] = RITMO_DEMO[i];
    TEMAS_DEMO.forEach(([tema, mundo, ajuste, ms], k) => {
      if ((i + k) % 4 === 3) return;
      const n = Math.max(6, Math.round((total / 6) * (0.6 + ((i * 7 + k * 3) % 5) / 5)));
      const pt = Math.min(0.98, Math.max(0.2, p + ajuste));
      const nRec = Math.round(n * 0.35);
      const nAnt = Math.round(n * 0.3);
      const pRec = Math.min(0.99, Math.max(0.1, pt + tend / 200));
      const pAnt = Math.min(0.99, Math.max(0.1, pt - tend / 200));
      estudio.push({
        user_id: `demo-${i}`,
        mundo,
        tema,
        intentos: n,
        correctos: Math.round(n * pt),
        intentos_rec: dias !== null && dias < 14 ? nRec : 0,
        correctos_rec: dias !== null && dias < 14 ? Math.round(nRec * pRec) : 0,
        intentos_ant: nAnt,
        correctos_ant: Math.round(nAnt * pAnt),
        tiempo_mediano_ms: Math.round(ms * vel),
        nivel_max: Math.min(10, 2 + Math.round(pt * 7)),
        nivel_rec: Math.round((1 + pt * 7) * 10) / 10,
        ultimo: dias === null ? null : new Date(ahora - (dias + (k % 3)) * DIA).toISOString(),
      });
    });
    // Hábitos de los últimos 28 días: los más activos juegan casi a diario.
    const frecuencia = e7 > 100 ? 1 : e7 > 60 ? 2 : e7 > 30 ? 3 : e7 > 0 ? 4 : 0;
    for (let d = 0; d < 28; d++) {
      if (dias === null || d < dias) continue;
      if (frecuencia === 0 ? d % 6 !== 0 || d < 9 : (d + i) % frecuencia !== 0) continue;
      const fecha = new Date(ahora - 5 * 60 * 60 * 1000 - d * DIA).toISOString().slice(0, 10);
      const hora = [16, 19, 20, 21, 7, 18][(i + d) % 6];
      const ej = 8 + ((i * 5 + d * 3) % 22);
      habitos.push({ user_id: `demo-${i}`, fecha, hora, ejercicios: ej, correctos: Math.round(ej * p), minutos: Math.round(ej * 0.15 * 10) / 10 });
    }
  });
  return { estudio, habitos };
}
