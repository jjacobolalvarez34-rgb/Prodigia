// Calificación al momento del quiz de una Técnica o Clase (web y app;
// docs/avance/CLASES_CALIFICACION.md). Cada pregunta se califica apenas se
// elige una opción; las mal respondidas se pueden corregir y la lección se
// envía cuando todas están bien. El servidor vuelve a validar todo al
// terminar (/api/aprender/completar, completar_leccion), así que esto es solo
// la ayuda en pantalla: no reemplaza ese control.

export interface PreguntaCalificable {
  opciones: string[];
  respuesta: string;
}

// true/false si se puede saber en pantalla; null si la respuesta guardada no
// está entre las opciones (dato desfasado): ahí decide el servidor.
export function calificarOpcion(pregunta: PreguntaCalificable, opcion: string): boolean | null {
  if (!pregunta.opciones.includes(pregunta.respuesta)) return null;
  return opcion === pregunta.respuesta;
}

export type EstadoPregunta = "sin-responder" | "bien" | "mal" | "sin-saber";

export function estadoPregunta(pregunta: PreguntaCalificable, elegida: string | undefined): EstadoPregunta {
  if (!elegida) return "sin-responder";
  const nota = calificarOpcion(pregunta, elegida);
  return nota === null ? "sin-saber" : nota ? "bien" : "mal";
}

// Se puede enviar cuando ninguna está sin responder ni mal.
export function quizListoParaEnviar(quiz: PreguntaCalificable[], respuestas: (string | undefined)[]): boolean {
  return quiz.every((p, i) => {
    const e = estadoPregunta(p, respuestas[i]);
    return e === "bien" || e === "sin-saber";
  });
}

export function cuantasBien(quiz: PreguntaCalificable[], respuestas: (string | undefined)[]): number {
  return quiz.filter((p, i) => {
    const e = estadoPregunta(p, respuestas[i]);
    return e === "bien" || e === "sin-saber";
  }).length;
}
