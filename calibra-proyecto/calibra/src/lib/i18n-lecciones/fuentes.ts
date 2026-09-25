// Lecciones en español de cada mundo (fuente de las traducciones al inglés), en el
// formato común `LeccionFuente`. Salen del mismo contenido tipado que generó las
// migraciones de cada mundo; la excepción son las lecciones que solo existen en
// migraciones viejas (ver `FUENTES_SIN_TS` más abajo).
import { TECNICAS_GEOGRAFIA, TECNICAS_GENERALES_GEOGRAFIA, CLASES_GEOGRAFIA } from "@/lib/geografia/lecciones";
import { TECNICAS_QUIMIA, CLASES_QUIMIA } from "@/lib/quimia/lecciones";
import { TECNICAS_ANATOMIA, CLASES_ANATOMIA } from "@/lib/anatomia/lecciones";
import { TECNICAS_MELODIA, CLASES_MELODIA } from "@/lib/melodia/lecciones";
import { TECNICAS_TRIGONOMETRIA, CLASES_TRIGONOMETRIA } from "@/lib/trigonometria/lecciones";
import { TECNICAS_HISTORIA, CLASES_HISTORIA } from "@/lib/historia/lecciones";
import { TECNICAS_CALCULIA, CLASES_CALCULIA } from "@/lib/calculia/lecciones";
import { TECNICAS as TECNICAS_CIRCUITIA, CLASES as CLASES_CIRCUITIA } from "@/lib/circuitia/lecciones";
import { TECNICAS_ESTADISTICA, CLASES_ESTADISTICA } from "@/lib/estadistica/lecciones";
import { TECNICAS as TECNICAS_NAIPIA, CLASES as CLASES_NAIPIA } from "@/lib/naipia/lecciones";
import { TECNICAS as TECNICAS_CODIA, CLASES as CLASES_CODIA } from "@/lib/codia/lecciones";
import { CLASES_NUMERIA, TECNICAS_NUMERIA } from "@/lib/numeria/lecciones";
import { CLASES_ENIGMIA, CLASES_ENIGMIA_NUEVAS, TECNICAS_ENIGMIA_NUEVAS } from "@/lib/enigmia/lecciones";
import { readFileSync } from "node:fs";
import path from "node:path";
import { aNeutroProfundo } from "@/lib/texto/neutroSembrado";
import type { LeccionFuente } from "./traducir";

export type MundoTraducible =
  | "numeria"
  | "enigmia"
  | "geografia"
  | "quimia"
  | "anatomia"
  | "melodia"
  | "trigonometria"
  | "historia"
  | "calculia"
  | "circuitia"
  | "estadistica"
  | "naipia"
  | "codia";

interface LeccionTipada {
  slug: string;
  nombre?: string;
  descripcion?: string | null;
  pasos?: string[];
  quiz?: { pregunta: string; opciones: string[]; respuesta: string; explicacion?: string }[];
  visuales?: unknown[];
}

function aFuente(l: LeccionTipada): LeccionFuente {
  return {
    slug: l.slug,
    nombre: l.nombre ?? "",
    descripcion: l.descripcion ?? null,
    pasos: l.pasos ?? [],
    quiz: l.quiz && l.quiz.length > 0 ? l.quiz : undefined,
    visuales: l.visuales,
  };
}

// Las 39 Técnicas de Numeria tienen sus pasos y visuales en TypeScript, pero su quiz solo
// existe en las migraciones 0182, 0183 y 0184 (un `update ... contenido || {"quiz": [...]}`
// por slug). Se lee de ahí y se pasa por el mapa de voseo de 0221, que es el texto final
// que queda en la base.
function quizNumeriaDeMigraciones(): Map<string, { pregunta: string; opciones: string[]; respuesta: string; explicacion?: string }[]> {
  const dir = path.resolve(__dirname, "../../../supabase/migrations");
  const archivos = ["0182_numeria_quiz_aritmetica_basica.sql", "0183_numeria_quiz_fracciones_decimales_potencias.sql", "0184_numeria_quiz_algebra_geometria.sql"];
  const mapa = new Map<string, { pregunta: string; opciones: string[]; respuesta: string; explicacion?: string }[]>();
  for (const a of archivos) {
    const sql = readFileSync(path.join(dir, a), "utf8").replace(/\r\n/g, "\n");
    const re = /set contenido = contenido \|\| '(\{"quiz": \[[\s\S]*?\]\})'::jsonb\nwhere slug = '([^']+)';/g;
    for (const m of sql.matchAll(re)) {
      const json = JSON.parse(m[1].replace(/''/g, "'")) as { quiz: { pregunta: string; opciones: string[]; respuesta: string; explicacion?: string }[] };
      mapa.set(m[2], aNeutroProfundo(json.quiz));
    }
  }
  return mapa;
}

const lista = (...grupos: LeccionTipada[][]): LeccionFuente[] => grupos.flat().map(aFuente);

// Todas las lecciones de cada mundo, Técnicas y luego Clases.
export function leccionesFuente(mundo: MundoTraducible): LeccionFuente[] {
  switch (mundo) {
    case "numeria": {
      const quizTecnicas = quizNumeriaDeMigraciones();
      const tecnicas = (TECNICAS_NUMERIA as LeccionTipada[]).map((t) => ({ ...t, quiz: quizTecnicas.get(t.slug) }));
      return lista(tecnicas, CLASES_NUMERIA as LeccionTipada[]);
    }
    case "enigmia":
      return lista(TECNICAS_ENIGMIA_NUEVAS as LeccionTipada[], CLASES_ENIGMIA as LeccionTipada[], CLASES_ENIGMIA_NUEVAS as LeccionTipada[]);
    case "geografia":
      return lista(TECNICAS_GEOGRAFIA as LeccionTipada[], TECNICAS_GENERALES_GEOGRAFIA as LeccionTipada[], CLASES_GEOGRAFIA as LeccionTipada[]);
    case "quimia":
      return lista(TECNICAS_QUIMIA as LeccionTipada[], CLASES_QUIMIA as LeccionTipada[]);
    case "anatomia":
      return lista(TECNICAS_ANATOMIA as LeccionTipada[], CLASES_ANATOMIA as LeccionTipada[]);
    case "melodia":
      return lista(TECNICAS_MELODIA as LeccionTipada[], CLASES_MELODIA as LeccionTipada[]);
    case "trigonometria":
      return lista(TECNICAS_TRIGONOMETRIA as LeccionTipada[], CLASES_TRIGONOMETRIA as LeccionTipada[]);
    case "historia":
      return lista(TECNICAS_HISTORIA as LeccionTipada[], CLASES_HISTORIA as LeccionTipada[]);
    case "calculia":
      return lista(TECNICAS_CALCULIA as LeccionTipada[], CLASES_CALCULIA as LeccionTipada[]);
    case "circuitia":
      return lista(TECNICAS_CIRCUITIA as LeccionTipada[], CLASES_CIRCUITIA as LeccionTipada[]);
    case "estadistica":
      return lista(TECNICAS_ESTADISTICA as LeccionTipada[], CLASES_ESTADISTICA as LeccionTipada[]);
    case "naipia":
      return lista(TECNICAS_NAIPIA as LeccionTipada[], CLASES_NAIPIA as LeccionTipada[]);
    case "codia":
      return lista(TECNICAS_CODIA as LeccionTipada[], CLASES_CODIA as LeccionTipada[]);
  }
}

// Mundos cuyas lecciones se guardan en `logic_techniques` (Enigmia); el resto, en `techniques`.
export const TABLA_DE = (mundo: MundoTraducible): "techniques" | "logic_techniques" => (mundo === "enigmia" ? "logic_techniques" : "techniques");
