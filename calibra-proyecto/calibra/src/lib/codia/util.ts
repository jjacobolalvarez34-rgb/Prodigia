import { elegir, mezclar, randomInt } from "./rng";
import { interpretar, textoSalida, type Semantica } from "./interprete";
import type { Lenguaje, Prog } from "./tipos";

export const NOMBRES_VAR = [
  "puntos", "edad", "total", "cuenta", "precio", "saldo", "altura", "vidas", "nivel", "dias", "suma", "resto", "turno", "meta", "monedas", "goles",
];
export const NOMBRES_TXT = ["Ana", "Luis", "Marta", "Pablo", "Sofia", "Diego", "Lucia"];
export const NOMBRES_FUNC = ["doble", "triple", "cuadrado", "mayor", "menor", "sumar", "restar", "signo", "puntaje", "bono"];

// k nombres de variable distintos.
export function nombresVar(k: number): string[] {
  return mezclar(NOMBRES_VAR).slice(0, k);
}

export { elegir, mezclar, randomInt };

const VARIANTES: Omit<Semantica, "lang">[] = [
  { rangoIncl: true },
  { saltaPrimero: true },
  { limiteCompara: true },
  { divFlotante: true },
  { divOtro: true },
  { modOtro: true },
  { pilaComoCola: true },
  { colaComoPila: true },
  { conjLista: true },
  { mapaNoSobrescribe: true },
];

// Distractores de una salida multi-línea: primero las salidas del MISMO
// programa bajo errores conceptuales típicos (rango inclusivo, < vs <=,
// división entera vs flotante, pila como cola...), luego las alternativas
// que aporte la plantilla (`extras`) y por último perturbaciones
// numéricas de la respuesta. Todos distintos de la correcta.
export function distractoresSalida(prog: Prog, lang: Lenguaje, correcta: string, extras: string[] = [], cantidad = 3): string[] {
  const vistos = new Set<string>([correcta]);
  const candidatos: string[] = [];
  const agregar = (t: string) => {
    if (!vistos.has(t) && t.trim() !== "") {
      vistos.add(t);
      candidatos.push(t);
    }
  };
  for (const v of mezclar(VARIANTES)) {
    try {
      const r = interpretar(prog, { lang, ...v });
      if (!r.fallo) agregar(textoSalida(r));
    } catch {
      // una variante inaplicable simplemente no aporta distractor
    }
  }
  const prioritarios = candidatos.slice();
  const elegidos = mezclar(prioritarios).slice(0, cantidad);
  for (const e of mezclar(extras)) {
    if (elegidos.length >= cantidad) break;
    if (!vistos.has(e) && e.trim() !== "") {
      vistos.add(e);
      elegidos.push(e);
    }
  }
  let intentos = 0;
  while (elegidos.length < cantidad && intentos < 60) {
    intentos++;
    const perturbado = perturbarNumeros(correcta);
    if (perturbado && !vistos.has(perturbado)) {
      vistos.add(perturbado);
      elegidos.push(perturbado);
    }
  }
  return elegidos;
}

function perturbarNumeros(texto: string): string | null {
  const re = /-?\d+/g;
  const tokens = [...texto.matchAll(re)];
  if (tokens.length === 0) return null;
  const t = elegir(tokens);
  const delta = elegir([-2, -1, 1, 2, 3, -3]);
  const nuevo = Number(t[0]) + delta;
  const idx = t.index ?? 0;
  return texto.slice(0, idx) + String(nuevo) + texto.slice(idx + t[0].length);
}

// Opciones finales: la correcta + distractores, mezcladas; sin repetidos.
export function armarOpciones(correcta: string, distractores: string[]): string[] {
  const vistos = new Set<string>([correcta]);
  const lista = [correcta];
  for (const d of distractores) {
    if (!vistos.has(d)) {
      vistos.add(d);
      lista.push(d);
    }
  }
  return mezclar(lista);
}

export function randomEntre(min: number, max: number): number {
  return randomInt(min, max);
}
