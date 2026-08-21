import type { PreguntaQuimia, Rng } from "./quimia";

// Sección 5, ítem 3: banco chico (no generación infinita, a propósito)
// de compuestos orgánicos comunes con su fórmula estructural SIMPLE —
// notación condensada (ej. "CH₃-CH₂-OH"), el mismo estándar que
// cualquier libro de química usa para representar una molécula sin
// dibujar cada átomo de hidrógeno por separado. Los grupos y el orden
// son datos reales verificados, no inventados; el dibujo (líneas entre
// cajas de texto) lo arma MoleculaSVG.tsx a partir de estos datos —
// nunca una imagen externa.
export interface CompuestoOrganico {
  id: string;
  formula: string; // fórmula molecular, ej. "C2H5OH"
  nombre: string;
  dificultad: number;
  grupos: string[]; // fórmula condensada, de izquierda a derecha
  enlaceDoble?: number; // índice del enlace (entre grupos[i] y grupos[i+1]) que es doble
  anillo?: boolean; // benceno: se dibuja aparte, como hexágono (ver MoleculaSVG)
}

export const COMPUESTOS_ORGANICOS: CompuestoOrganico[] = [
  { id: "metano", formula: "CH4", nombre: "Metano", dificultad: 1, grupos: ["CH₄"] },
  { id: "metanol", formula: "CH3OH", nombre: "Metanol", dificultad: 2, grupos: ["CH₃", "OH"] },
  { id: "etano", formula: "C2H6", nombre: "Etano", dificultad: 2, grupos: ["CH₃", "CH₃"] },
  { id: "etanol", formula: "C2H5OH", nombre: "Etanol", dificultad: 3, grupos: ["CH₃", "CH₂", "OH"] },
  { id: "eteno", formula: "C2H4", nombre: "Eteno (etileno)", dificultad: 4, grupos: ["CH₂", "CH₂"], enlaceDoble: 0 },
  { id: "acido-formico", formula: "HCOOH", nombre: "Ácido fórmico", dificultad: 5, grupos: ["H", "COOH"] },
  { id: "propano", formula: "C3H8", nombre: "Propano", dificultad: 4, grupos: ["CH₃", "CH₂", "CH₃"] },
  { id: "acido-acetico", formula: "CH3COOH", nombre: "Ácido acético", dificultad: 5, grupos: ["CH₃", "COOH"] },
  { id: "benceno", formula: "C6H6", nombre: "Benceno", dificultad: 8, grupos: ["CH", "CH", "CH", "CH", "CH", "CH"], anillo: true },
  {
    id: "glucosa",
    formula: "C6H12O6",
    nombre: "Glucosa",
    dificultad: 9,
    // Cadena abierta (forma aldehído, Fischer simplificada) — real,
    // aunque en solución la glucosa está mayormente en forma de anillo;
    // la cadena abierta es la representación "simple" estándar.
    grupos: ["CHO", "CHOH", "CHOH", "CHOH", "CHOH", "CH₂OH"],
  },
];

function elegirAlAzar<T extends { dificultad: number }>(banco: T[], nivel: number, usados: Set<string>, clave: (t: T) => string, rng: Rng): T {
  const candidatos = banco.filter((x) => Math.abs(x.dificultad - nivel) <= 3 && !usados.has(clave(x)));
  const pool = candidatos.length > 0 ? candidatos : banco.filter((x) => !usados.has(clave(x)));
  const poolFinal = pool.length > 0 ? pool : banco;
  return poolFinal[Math.floor(rng() * poolFinal.length)];
}

function opcionesConDistractores(correcta: string, resto: string[], rng: Rng, cantidad = 4): string[] {
  const distractores = Array.from(new Set(resto.filter((x) => x !== correcta)));
  const elegidos: string[] = [];
  const disponibles = [...distractores];
  while (elegidos.length < cantidad - 1 && disponibles.length > 0) {
    const idx = Math.floor(rng() * disponibles.length);
    elegidos.push(disponibles.splice(idx, 1)[0]);
  }
  const opciones = [correcta, ...elegidos];
  for (let i = opciones.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [opciones[i], opciones[j]] = [opciones[j], opciones[i]];
  }
  return opciones;
}

export function generarPreguntaOrganica(nivel: number, usados: Set<string>, rng: Rng = Math.random): PreguntaQuimia {
  const c = elegirAlAzar(COMPUESTOS_ORGANICOS, nivel, usados, (x) => x.id, rng);
  return {
    enunciado: "¿Cómo se llama este compuesto?",
    opciones: opcionesConDistractores(c.nombre, COMPUESTOS_ORGANICOS.map((x) => x.nombre), rng),
    respuesta: c.nombre,
    clave: c.id,
    diagramaId: c.id,
  };
}
