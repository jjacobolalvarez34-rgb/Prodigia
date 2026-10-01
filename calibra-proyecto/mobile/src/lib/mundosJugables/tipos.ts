// Forma común de los mundos que se juegan en la app con el sprint genérico
// (`app/[mundo]/sprint.tsx`). Cada mundo tiene un adaptador que llama al MISMO
// generador de la web (`@/lib/practica/<mundo>`) y traduce su pregunta a esta forma:
// así el sprint, el hub, los duelos y el resultado son uno solo para todos.
import type { FiguraRitmica, NotaMusical } from "@/lib/practica/melodia";
import type { TrianguloDiagrama } from "@/lib/practica/trigonometriaTipos";
import type { GraficoEstadistica } from "@/lib/estadistica/tipos";
import type { MundoSlug } from "~/tema";
import type { ResultadoIntento } from "../partida";

export interface CartaVisual {
  valor: string;
  palo: string;
}

// Lo que se dibuja arriba del enunciado.
export type Visual =
  | { tipo: "pentagrama"; notas: NotaMusical[]; disposicion: "secuencial" | "simultanea" }
  | { tipo: "figura"; figura: FiguraRitmica }
  | { tipo: "nota-audio"; frecuencia: number }
  | { tipo: "molecula"; id: string }
  | { tipo: "triangulo"; triangulo: TrianguloDiagrama }
  | { tipo: "circuito"; topologia: unknown; vFuente: number; resaltarId?: string }
  | { tipo: "grafico"; grafico: GraficoEstadistica }
  | { tipo: "codigo"; codigo: string; lenguaje: string }
  | { tipo: "cartas"; cartas: CartaVisual[] }
  | { tipo: "tabla"; titulo: string; filas: { etiqueta: string; valor: string }[] };

export type Entrada =
  | { tipo: "opciones"; opciones: string[]; respuesta: string }
  // `decimales`: tecla de coma; `negativos`: tecla de signo.
  | { tipo: "numero"; respuesta: number; tolerancia: number; decimales?: boolean; negativos?: boolean }
  // Anatomía, modo óseo: tocar el hueso en el esqueleto.
  | { tipo: "esqueleto"; objetivo: string; respuesta: string };

// Fase previa de memorizar, con el reloj de la partida en pausa (igual que la web).
export type Memoria =
  // Enigmia: la lista entera a la vista durante `ms`.
  | { tipo: "lista"; items: string[]; ms: number }
  // Naipia: las cartas salen de a una, cada una `msPorCarta`, y se ocultan.
  | { tipo: "cartas"; cartas: CartaVisual[]; msPorCarta: number };

export interface PreguntaMundo {
  enunciado: string;
  // Cómo mostrar el enunciado y las opciones: "formulas" pasa los $…$ de LaTeX a
  // Unicode; "quimica" pone los subíndices de las fórmulas (Al2O3 → Al₂O₃).
  formato?: "formulas" | "quimica";
  entrada: Entrada;
  visuales?: Visual[];
  memoria?: Memoria;
  clave: string;
  // Texto de la respuesta correcta para "Era …" (si no, la respuesta tal cual).
  solucion?: string;
  // Dificultad propia de la pregunta (Enigmia guarda la del acertijo).
  nivel?: number;
  // Datos que necesita el guardado propio del mundo (p. ej. id del acertijo).
  datos?: Record<string, string | number>;
}

export interface ModoMundo {
  id: string;
  nombre: string;
  simbolo: string;
  descripcion: string;
}

export interface MundoJugable {
  slug: MundoSlug;
  modos: ModoMundo[];
  // `contexto`: lo que devuelve `preparar` (p. ej. el banco de acertijos de la base).
  // `rng`: solo en duelos, sembrado con la semilla del duelo (los dos rivales
  // reciben la misma serie, como en la web). `filtro`: el valor elegido en `filtro`.
  // `niveles`: el nivel de cada modo (fuera de duelo), para mundos que mezclan
  // modos en una partida (Enigmia en "mezcla").
  generar: (modo: string, nivel: number, usados: Set<string>, contexto: unknown, rng?: () => number, filtro?: string, niveles?: Record<string, number>) => PreguntaMundo;
  // Opción extra que se elige en el hub antes de jugar (Codia: el lenguaje).
  // El primer valor es el de por defecto.
  filtro?: { titulo: string; opciones: { id: string; nombre: string }[] };
  // Igual que el runner de la web (10 preguntas / 60 s / 2 escudos de base).
  total?: number;
  duracionMs?: number;
  escudosBase?: number;
  // Problem type de skill_levels/attempts (por defecto `${slug}_${modo}`).
  problemType?: (modo: string) => string;
  // Datos que el mundo necesita antes de jugar (una vez por partida).
  preparar?: () => Promise<unknown>;
  // Niveles por modo, si no salen de skill_levels (Enigmia: logic_skill_levels).
  cargarNiveles?: (userId: string) => Promise<Record<string, number>>;
  // Guardado propio del intento (Enigmia: insertar_intento_logica).
  guardar?: (p: PreguntaMundo, modo: string, nivel: number, correcto: boolean, timeMs: number, protegido: boolean) => Promise<ResultadoIntento>;
  // Modo del que sale el nivel de una pregunta (Enigmia en "mezcla": la categoría del acertijo).
  modoDePregunta?: (p: PreguntaMundo, modo: string) => string;
}
