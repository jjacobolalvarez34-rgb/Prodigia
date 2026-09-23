import type { GrupoAnatomia } from "@/lib/anatomia/grupos";
import type { VisualAnatomia } from "@/lib/anatomia/visuales";

export interface PreguntaLeccionAnatomia {
  pregunta: string;
  opciones: string[];
  respuesta: string;
  explicacion: string;
}

// Una Técnica de Anatomía (gratis, `requierePro: false`): un atajo o
// mnemotecnia para retener lo que evalúa la práctica. Las 5 históricas
// (0081_mundo_anatomia.sql + quiz en 0173) se reescriben por slug; las demás
// son nuevas. El desbloqueo es POR GRUPO (sistema): cada sistema tiene su
// propio puntero "activo", lineal dentro del grupo (ver
// src/lib/anatomia/path.ts).
export interface TecnicaAnatomia {
  slug: string;
  grupo: GrupoAnatomia;
  // Posición dentro de su grupo (1, 2, 3...), correlativa.
  orden: number;
  requierePro: false;
  nombre: string;
  descripcion: string;
  pasos: string[];
  visuales: VisualAnatomia[];
  quiz: PreguntaLeccionAnatomia[];
}

// Una Clase de Anatomía (Pro, `requierePro: true`): lección desarrollada
// (definiciones, ejemplos, errores comunes) con visuales y quiz. Cada
// sistema es un curso independiente (orden de dependencia DENTRO del
// sistema); la primera Clase de todas (posición anatómica y planos) es
// preview gratis.
export interface ClaseAnatomia {
  slug: string;
  grupo: GrupoAnatomia;
  orden: number;
  requierePro: true;
  nombre: string;
  descripcion: string;
  pasos: string[];
  visuales: VisualAnatomia[];
  quiz: PreguntaLeccionAnatomia[];
}
