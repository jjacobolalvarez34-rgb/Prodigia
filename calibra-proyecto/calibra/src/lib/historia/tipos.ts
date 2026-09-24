// Tipos de la TABLA CANÓNICA de Historia (fuente única de la práctica, de Aprender
// y de los visuales). Todo lo demás se DERIVA de estas dos tablas:
//   - src/lib/historia/hechos.ts     -> HECHOS
//   - src/lib/historia/personajes.ts -> PERSONAJES
// Agregar contenido (incluida, en el futuro, la historia nacional de un país) es
// agregar filas y un bloque: ningún generador cambia.

export type EpocaId = "prehistoria" | "antiguedad" | "edad-media" | "edad-moderna" | "contemporanea";

// Región del hecho o del personaje (dónde ocurrió o dónde actuó). "global" es
// para lo que ocurrió en varios continentes a la vez (guerras mundiales, la ONU...).
export type Region =
  | "europa"
  | "africa"
  | "oriente-proximo"
  | "asia-sur"
  | "asia-oriental"
  | "asia-central"
  | "asia-sudeste"
  | "america"
  | "oceania"
  | "global";

// Qué tan segura es la fecha:
//  - "exacta": año de amplio consenso (los libros no discrepan);
//  - "convencional": año que la tradición o la convención escolar fija, aunque
//    haya variantes (fundación de Roma, caída de Roma en 476, Hégira...);
//  - "aproximada": el año es una estimación ("hacia el 2560 a. C.").
export type Certeza = "exacta" | "convencional" | "aproximada";

export interface Hecho {
  // Estable: nunca se renombra (lo usan las lecciones, los visuales y los tests).
  id: string;
  nombre: string;
  // Con signo: los años a. C. son negativos (-44 = 44 a. C.). No existe el año 0.
  anio: number;
  certeza: Certeza;
  // Incertidumbre en años (+/-): 0 para exacta, 3 para convencional y 10 para
  // aproximada por defecto, o el valor que se declare. Toda comparación de orden
  // o de siglo exige que la diferencia supere los márgenes.
  margen: number;
  epoca: EpocaId;
  region: Region;
  // 1 a 10: qué tan conocido y central es (10 = lo sabe casi cualquiera). Es el
  // criterio de dificultad de la práctica.
  prominencia: number;
  // Ids de personajes que estaban vivos y actuaron en él.
  personajes: string[];
  // Ids de hechos que contribuyeron a provocarlo (relación causal de amplio
  // consenso; las consecuencias se derivan invirtiendo esta relación).
  causas: string[];
  // true en los cuatro hechos que la convención escolar usa como frontera de época.
  frontera?: boolean;
}

export type CategoriaPersonaje =
  | "gobernante"
  | "militar"
  | "politico"
  | "filosofo"
  | "cientifico"
  | "explorador"
  | "artista"
  | "escritor"
  | "religioso";

export interface Personaje {
  id: string;
  nombre: string;
  // Rol completo, tal como se lee en una pista ("Filósofo griego").
  rol: string;
  categoria: CategoriaPersonaje;
  // Civilización o país al que se asocia; con `categoria` decide si la pista de
  // rol es compatible con otro personaje.
  pueblo: string;
  epoca: EpocaId;
  region: Region;
  // null cuando no se conoce. `auge` es el año en que se lo sitúa (mitad del
  // reinado, de la obra o de su vida activa) y siempre existe.
  nac: number | null;
  mue: number | null;
  auge: number;
  // true si alguna de las fechas de vida es aproximada o tiene variantes.
  aprox: boolean;
  prominencia: number;
  // Una frase que lo identifica sin ambigüedad (para pistas y para Aprender).
  logro: string;
}
