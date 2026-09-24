import type { VisualBase } from "@/lib/aprender/visuales";
import type { FiguraRitmica, TipoAcorde, TipoEscala } from "@/lib/practica/melodia";

// Visuales propios de Melodía (prefijo "melodia."). Seis primitivos; el
// componente de cada uno SOLO dibuja: los datos salen de las funciones puras
// de src/lib/practica/melodia.ts (construirEscala, construirAcorde,
// frecuenciaDeNota, semitonoAbsoluto...) vía src/lib/melodia/visualesDatos.ts,
// y se verifican en tests contra esas mismas funciones y contra una tabla de
// referencia escrita aparte.
//
// Una nota en el jsonb es un texto corto: "Do4", "Fa♯4", "Si♭3" (letra en
// español + alteración opcional + octava científica; Do4 = Do central,
// La4 = 440 Hz). Las escalas y los acordes NO se tipean: se guardan los
// parámetros (fundamental, tipo, sostenidos/bemoles) y el componente llama a
// construirEscala/construirAcorde al dibujar.
//
// Honestidad de lo dibujado (pedido explícito): pentagrama y teclado son
// esquemáticos pero correctos. El pentagrama es el mismo componente
// (Pentagrama.tsx) que usa la Práctica: clave de sol, 5 líneas, cabezas de
// nota en su altura real y líneas adicionales, sin plicas. El teclado es un
// piano de teclas blancas y negras a escala uniforme (no una foto). El sonido
// (opcional) sale del mismo generador que el modo Oído absoluto, SOLO cuando
// el usuario toca "Escuchar" (nunca solo).

export interface EscalaParametros {
  fundamental: string;
  tipo: TipoEscala;
  // true = las notas alteradas se escriben con bemoles (Si♭); false, con
  // sostenidos. Igual que la Práctica: elige una grafía y la usa siempre.
  bemoles?: boolean;
}

export interface AcordeParametros {
  fundamental: string;
  tipo: TipoAcorde;
  bemoles?: boolean;
}

// Notas sobre el pentagrama en clave de sol. Una de tres fuentes: `notas`
// (texto, para posiciones sueltas como líneas y espacios), `escala` o
// `acorde` (calculados). Las notas aparecen una a una.
export interface VisualMelodiaPentagrama extends VisualBase {
  tipo: "melodia.pentagrama";
  notas?: string[];
  escala?: EscalaParametros;
  acorde?: AcordeParametros;
  // Solo con `notas`: una al lado de otra (por defecto) o apiladas.
  disposicion?: "secuencial" | "simultanea";
  // Texto bajo cada nota: nombre con octava ("Mi4"), solo la letra ("Mi") o
  // nada. Por defecto el nombre con octava.
  etiquetas?: "nombre" | "letra" | "ninguna";
  // Etiquetas propias (una por nota): reemplazan a `etiquetas`.
  textos?: string[];
}

// Teclado de piano con teclas resaltadas, una a una.
export interface VisualMelodiaTeclado extends VisualBase {
  tipo: "melodia.teclado";
  // Notas a resaltar, en orden de aparición. Con `saltos`, se marca la
  // distancia (T, S) entre notas consecutivas.
  notas: string[];
  // Rango dibujado (se completa a teclas blancas en los extremos). Por
  // defecto, el que abarcan las notas.
  desde?: string;
  hasta?: string;
  // Nombre en las teclas blancas: solo las resaltadas (por defecto), todas o
  // ninguna.
  nombres?: "resaltadas" | "todas" | "ninguna";
  // Marca los grupos de 2 y de 3 teclas negras.
  grupos?: boolean;
  // Marca los pares de teclas blancas SIN tecla negra en medio (Mi-Fa y Si-Do).
  semitonosNaturales?: boolean;
  saltos?: boolean;
  // Muestra también el cifrado americano (Do = C) en las teclas resaltadas.
  cifrado?: boolean;
  // Botón "Escuchar" (solo suena al tocarlo).
  escuchar?: boolean;
  // Etiquetas propias para las notas resaltadas (mismo orden que `notas`).
  textos?: string[];
}

// Escala construida tono a tono sobre el teclado (con los saltos T/S).
export interface VisualMelodiaEscala extends VisualBase {
  tipo: "melodia.escala";
  escala: EscalaParametros;
  escuchar?: boolean;
}

// Acorde apilado por terceras sobre el teclado, con el grado y los
// semitonos desde la fundamental de cada nota.
export interface VisualMelodiaAcorde extends VisualBase {
  tipo: "melodia.acorde";
  acorde: AcordeParametros;
  escuchar?: boolean;
}

// Figuras rítmicas con su duración (en pulsos de negra) y su barra
// proporcional dentro de un compás de 4/4.
export interface VisualMelodiaRitmo extends VisualBase {
  tipo: "melodia.ritmo";
  figuras: FiguraRitmica[];
}

// Notas con su frecuencia (temperamento igual, La4 = 440 Hz) sobre un eje
// logarítmico: la misma distancia musical se ve como la misma distancia.
export interface VisualMelodiaFrecuencia extends VisualBase {
  tipo: "melodia.frecuencia";
  notas: string[];
  escuchar?: boolean;
}

export type VisualMelodia =
  | VisualMelodiaPentagrama
  | VisualMelodiaTeclado
  | VisualMelodiaEscala
  | VisualMelodiaAcorde
  | VisualMelodiaRitmo
  | VisualMelodiaFrecuencia;
