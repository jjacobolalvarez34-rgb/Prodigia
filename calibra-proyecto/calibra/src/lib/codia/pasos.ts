import type { MutacionError, ProblemaCodia } from "./problema";
import { NOMBRE_LENGUAJE } from "./tipos";

// «Cómo se resuelve» de cada pregunta de Codia (pedido 2026-10-18). Sale de la
// verificación que ya trae la pregunta: la salida real del programa, el defecto que se
// le inyectó y en qué línea, o la clase de complejidad. Todo eso se comprobó
// ejecutando el código de verdad (codia.test.ts).

const salidaTexto = (s: string) => (s.trim() === "" ? "nada" : `«${s.trim().split("\n").join(" ↵ ")}»`);

const QUE_PASA: Record<MutacionError, (linea: string) => string> = {
  sintaxis: (l) => `En ${l} hay un error de sintaxis (un símbolo que falta o sobra): el programa ni siquiera llega a ejecutarse`,
  nombre: (l) => `En ${l} se usa un nombre que no existe (está mal escrito o nunca se declaró): el programa falla al llegar ahí`,
  indice: (l) => `En ${l} se pide una posición que no existe en la lista: las posiciones van de 0 a largo − 1`,
  divcero: (l) => `En ${l} se divide entre 0, y eso no se puede`,
  tipo: (l) => `En ${l} se mezclan tipos que no combinan (por ejemplo, texto con número) sin convertirlos`,
  igualdad: (l) => `En ${l} se asigna (=) donde había que comparar (== o ===)`,
  logica: () => `El programa corre sin errores, pero la lógica está mal: no calcula lo que debería`,
};

const GUIA_COMPLEJIDAD = `Cuenta cuántas veces se repite el trabajo según n: un bucle que recorre n → O(n); dos bucles anidados sobre n → O(n²); si n se divide a la mitad en cada vuelta → O(log n); sin bucles que dependan de n → O(1)`;

export function pasosCodia(p: ProblemaCodia): string[] {
  const v = p.verificacion;
  const lang = NOMBRE_LENGUAJE[p.lenguaje];
  if (v.tipo === "hueco") {
    return [`La única opción válida en ${lang} es «${v.correcta}»; las otras no compilan o fallan al correr`, `Con ella el programa funciona e imprime ${salidaTexto(v.stdout)}`];
  }
  if (v.tipo === "salida") {
    return [`Sigue el programa línea por línea y anota cómo cambia cada variable (en los bucles, vuelta por vuelta)`, `Lo que imprime, en orden: ${salidaTexto(v.stdout)}`];
  }
  if (v.tipo === "complejidad") {
    return [GUIA_COMPLEJIDAD, `Este código es ${v.clase}`];
  }
  const linea = v.lineaPantalla != null ? `la línea ${v.lineaPantalla}` : "el código";
  const pasos = [QUE_PASA[v.mutacion](linea)];
  if (v.mutacion === "logica" && v.stdoutMal != null) pasos.push(`Imprime ${salidaTexto(v.stdoutMal)} en vez de ${salidaTexto(v.stdoutOk)}`);
  else pasos.push(`Corregido, el programa imprime ${salidaTexto(v.stdoutOk)}`);
  pasos.push(`Respuesta: ${p.respuesta}`);
  return pasos;
}
