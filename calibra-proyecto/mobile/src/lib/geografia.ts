// Geografía en la app: los países, la dificultad, las preguntas avanzadas (nivel 8+)
// y el encuadre de cada continente vienen del MISMO código de la web
// (../calibra/src/lib/practica/geografia.ts, geografiaAvanzada.ts y
// geografia/proyeccion.ts), y el mapa sale del mismo topojson real de world-atlas
// (../calibra/public/data/countries-110m.json). Así un país agregado o corregido
// en la web llega igual a la app.
import { geoContains, geoMercator, geoPath, type GeoProjection } from "d3-geo";
import type { Feature, FeatureCollection, Geometry } from "geojson";
import { feature } from "topojson-client";
import type { GeometryCollection, Topology } from "topojson-specification";
import { PROYECCION_POR_CONTINENTE } from "@/lib/geografia/proyeccion";
import { elegirPaisAleatorio, PAISES_POR_CONTINENTE, type Continente, type PaisAmerica } from "@/lib/practica/geografia";
import {
  elegirPreguntaAvanzada,
  NIVEL_MINIMO_AVANZADO,
  PROBABILIDAD_AVANZADO,
  type PreguntaAvanzada,
} from "@/lib/practica/geografiaAvanzada";
import { supabase } from "./supabase";

export type { Continente, PaisAmerica, PreguntaAvanzada };

export const CONTINENTES: { id: Continente; nombre: string; glifo: string }[] = [
  { id: "america", nombre: "América", glifo: "🌎" },
  { id: "europa", nombre: "Europa", glifo: "🏰" },
  { id: "africa", nombre: "África", glifo: "🌍" },
  { id: "asia_oceania", nombre: "Asia y Oceanía", glifo: "🌏" },
];

export const DURACION_SPRINT_GEO_MS = 60_000;
export const PREGUNTAS_POR_PARTIDA = 10;
// Igual que GeografiaSprintRunner.tsx de la web: 2 errores por partida no bajan el nivel.
export const ESCUDOS_POR_PARTIDA = 2;

// Mismo tamaño de lienzo que el ComposableMap de la web (480 × 420): con la misma
// proyección, cada continente queda con el mismo encuadre.
export const ANCHO_MAPA = 480;
export const ALTO_MAPA = 420;

export type Pregunta = PaisAmerica | PreguntaAvanzada;
export function esPreguntaAvanzada(p: Pregunta): p is PreguntaAvanzada {
  return "pregunta" in p;
}

// Mismo sorteo que la web: en calibración alta a veces sale una pregunta de texto
// (ciudades, ríos, puntos de referencia) en vez del mapa.
export function siguientePregunta(continente: Continente, nivel: number, usados: Set<string>): Pregunta | null {
  if (nivel >= NIVEL_MINIMO_AVANZADO && Math.random() < PROBABILIDAD_AVANZADO) {
    const avanzada = elegirPreguntaAvanzada(continente, usados);
    if (avanzada) return avanzada;
  }
  return elegirPaisAleatorio(PAISES_POR_CONTINENTE[continente], nivel, usados);
}

export function nombrePais(continente: Continente, id: string): string | null {
  return PAISES_POR_CONTINENTE[continente].find((p) => p.id === id)?.nombre ?? null;
}

export async function cargarNivelesGeografia(userId: string): Promise<Record<Continente, number>> {
  const niveles: Record<Continente, number> = { america: 1, europa: 1, africa: 1, asia_oceania: 1 };
  const { data } = await supabase
    .from("skill_levels")
    .select("problem_type, nivel")
    .eq("user_id", userId)
    .in("problem_type", CONTINENTES.map((c) => `geografia_${c.id}`));
  for (const fila of data ?? []) niveles[(fila.problem_type as string).replace("geografia_", "") as Continente] = fila.nivel as number;
  return niveles;
}

// ---------- Mapa ----------

export interface FormaPais {
  id: string;
  d: string; // path SVG en coordenadas del lienzo 480 × 420
  centro: [number, number];
  feature: Feature<Geometry>;
}

export interface MapaContinente {
  formas: FormaPais[];
  proyeccion: GeoProjection;
}

const TOPOLOGIA = require("../../../calibra/public/data/countries-110m.json") as Topology<{ countries: GeometryCollection }>;
let mundo: FeatureCollection<Geometry> | null = null;
const cache = new Map<Continente, MapaContinente>();

export function mapaDe(continente: Continente): MapaContinente {
  const guardado = cache.get(continente);
  if (guardado) return guardado;
  mundo ??= feature(TOPOLOGIA, TOPOLOGIA.objects.countries) as FeatureCollection<Geometry>;
  const ids = new Set(PAISES_POR_CONTINENTE[continente].map((p) => p.id));
  const config = PROYECCION_POR_CONTINENTE[continente];
  // Igual que react-simple-maps: scale + center, y el centro del lienzo como translate.
  const proyeccion = geoMercator().scale(config.scale).center(config.center).translate([ANCHO_MAPA / 2, ALTO_MAPA / 2]);
  const trazador = geoPath(proyeccion);
  const formas: FormaPais[] = [];
  for (const f of mundo.features) {
    const id = String(f.id);
    if (!ids.has(id)) continue;
    const d = trazador(f);
    if (!d) continue;
    const [cx, cy] = trazador.centroid(f);
    formas.push({ id, d, centro: [cx, cy], feature: f });
  }
  const mapa = { formas, proyeccion };
  cache.set(continente, mapa);
  return mapa;
}

// Qué país hay en un punto del lienzo. Si el toque cae en el mar pero muy cerca de un
// país (islas del Caribe, Malta, Singapur…), elige el más cercano dentro de
// `tolerancia` (en unidades del lienzo): los países chicos se pueden tocar con el dedo.
export function paisEnPunto(mapa: MapaContinente, x: number, y: number, tolerancia: number): string | null {
  const lonLat = mapa.proyeccion.invert?.([x, y]);
  if (lonLat) {
    for (const f of mapa.formas) if (geoContains(f.feature, lonLat)) return f.id;
  }
  let mejor: { id: string; dist: number } | null = null;
  for (const f of mapa.formas) {
    const dist = Math.hypot(f.centro[0] - x, f.centro[1] - y);
    if (dist <= tolerancia && (!mejor || dist < mejor.dist)) mejor = { id: f.id, dist };
  }
  return mejor?.id ?? null;
}
