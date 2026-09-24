import type { GrupoMelodia } from "@/lib/melodia/grupos";
import type { VisualMelodia } from "@/lib/melodia/visuales";
import type { VisualCuadros } from "@/lib/aprender/visuales";

export interface PreguntaLeccionMelodia {
  pregunta: string;
  opciones: string[];
  respuesta: string;
  explicacion: string;
}

// Los visuales de una lección de Melodía: los propios ("melodia.*") y el
// primitivo genérico de cuadros animados.
export type VisualLeccionMelodia = VisualMelodia | VisualCuadros;

// Una Técnica de Melodía (gratis, `requierePro: false`): un atajo o
// mnemotecnia para retener lo que evalúa la práctica. Las 5 históricas
// (0089_mundo_melodia.sql + quiz en 0174) se reescriben por slug; las demás
// son nuevas. El desbloqueo es POR GRUPO (modo de práctica): cada grupo tiene
// su propio puntero "activo", lineal dentro del grupo (ver
// src/lib/melodia/path.ts).
export interface TecnicaMelodia {
  slug: string;
  grupo: GrupoMelodia;
  // Posición dentro de su grupo (1, 2, 3...), correlativa.
  orden: number;
  requierePro: false;
  nombre: string;
  descripcion: string;
  pasos: string[];
  visuales: VisualLeccionMelodia[];
  quiz: PreguntaLeccionMelodia[];
}

// Una Clase de Melodía (Pro, `requierePro: true`): lección desarrollada
// (definiciones, ejemplos, errores comunes) con visuales y quiz. Cada grupo
// es un curso independiente (orden de dependencia DENTRO del grupo); la
// primera Clase de todas (el sonido y la nota) es preview gratis.
export interface ClaseMelodia {
  slug: string;
  grupo: GrupoMelodia;
  orden: number;
  requierePro: true;
  nombre: string;
  descripcion: string;
  pasos: string[];
  visuales: VisualLeccionMelodia[];
  quiz: PreguntaLeccionMelodia[];
}
