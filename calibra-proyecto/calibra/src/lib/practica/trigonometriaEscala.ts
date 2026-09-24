// ESCALA DE DIFICULTAD de la práctica de Trigonometría, declarativa: para cada
// modo, una tabla "tipo de problema -> desde qué nivel aparece y con qué peso
// en cada nivel". Los generadores (trigonometriaRazones.ts, ...Circulo.ts,
// ...Identidades.ts, ...Leyes.ts) NO deciden la dificultad con `if (nivel ...)`:
// preguntan a activosEnNivel() qué tipos pueden salir y con qué probabilidad, y
// cada tipo recibe `dif` (0, 1, 2... = cuántos niveles lleva activo) para
// endurecer sus propios parámetros (ternas más grandes, más cuadrantes,
// ángulos menos amigables).
//
// Reglas que trigonometria.test.ts hace cumplir:
//  - cada modo cubre los niveles 1 a 10 sin huecos y el conjunto (tipo, peso)
//    de cada nivel es DISTINTO al del nivel anterior (no hay niveles planos);
//  - todo tipo declarado sale de verdad del generador (con el `tipo` correcto);
//  - `conceptos` nombra los conceptos de Aprender que enseñan ese tipo de
//    problema (src/lib/trigonometria/lecciones/conceptos.ts): cada uno debe
//    estar en al menos una Clase y una Técnica del bloque del modo.
//
// El "nivel N" de la escala VIEJA (razones estancado desde el nivel 3, leyes
// sin nivel, identidades con dos escalones) NO significa lo mismo que este:
// los usuarios ya calibrados lo fueron contra la escala plana. Ver
// docs/PARIDAD_MUNDOS.md, sección "Trigonometría: rediseño del mundo (fase 1)".

export type ModoTrigonometria = "razones" | "circulo" | "identidades" | "leyes";

export interface TipoEscala {
  tipo: string;
  // Primer nivel en que aparece; `pesos[i]` es su peso en el nivel desde + i
  // (0 = ya no sale). El último nivel activo es desde + pesos.length - 1.
  desde: number;
  pesos: number[];
  conceptos: string[];
  // Una línea: qué pide (documentación viva, se muestra en el reporte).
  descripcion: string;
}


export const ESCALA_TRIGONOMETRIA: Record<ModoTrigonometria, TipoEscala[]> = {
  razones: [
    { tipo: "razon-ternas", desde: 1, pesos: [5, 5, 2, 1], conceptos: ["lados-relativos", "razon-seno", "razon-coseno", "razon-tangente", "sohcahtoa"], descripcion: "sen, cos o tan de A (o de B) con los tres lados dados (ternas pitagóricas)" },
    { tipo: "lado-notable", desde: 3, pesos: [5, 5, 2, 1], conceptos: ["triangulo-30-60-90", "triangulo-45-45-90", "hallar-lado"], descripcion: "hallar un lado con un ángulo de 30°, 45° o 60° y un lado" },
    { tipo: "lado-calculadora", desde: 5, pesos: [4, 4, 2, 1], conceptos: ["hallar-lado", "calculadora-grados"], descripcion: "hallar un lado con un ángulo cualquiera (calculadora en grados)" },
    { tipo: "angulo-inverso", desde: 5, pesos: [3, 3, 2, 2, 1.5, 1.5], conceptos: ["hallar-angulo", "razones-inversas"], descripcion: "hallar un ángulo con la razón inversa (arcsen, arccos, arctan)" },
    { tipo: "reciprocas", desde: 6, pesos: [3, 3, 2, 2, 1.5], conceptos: ["razones-reciprocas"], descripcion: "cosecante, secante y cotangente" },
    { tipo: "elevacion", desde: 7, pesos: [5, 4, 2, 1.5], conceptos: ["angulo-elevacion", "problemas-rectangulo"], descripcion: "ángulo de elevación con enunciado de contexto" },
    { tipo: "depresion", desde: 8, pesos: [3, 2, 1.5], conceptos: ["angulo-depresion"], descripcion: "ángulo de depresión con enunciado de contexto" },
    { tipo: "dos-pasos", desde: 9, pesos: [5, 7], conceptos: ["problemas-rectangulo"], descripcion: "problemas de dos pasos (dos observaciones, mástil sobre un edificio, dos barcos)" },
  ],
  circulo: [
    { tipo: "q1-exactos", desde: 1, pesos: [5, 5, 2], conceptos: ["valores-exactos", "circulo-unitario"], descripcion: "valores exactos de sen, cos y tan en el primer cuadrante" },
    { tipo: "conversion", desde: 3, pesos: [5, 4, 1, 1], conceptos: ["radian", "conversion-grados-radianes"], descripcion: "conversión grados a radianes y radianes a grados" },
    { tipo: "ref-q2q3", desde: 4, pesos: [5, 5, 2, 1], conceptos: ["angulo-referencia", "signos-cuadrantes"], descripcion: "segundo y tercer cuadrante: ángulo de referencia y signo" },
    { tipo: "todos-cuadrantes", desde: 5, pesos: [2, 5, 5, 1], conceptos: ["cuadrantes", "valores-exactos", "signos-cuadrantes"], descripcion: "los cuatro cuadrantes y los ejes, en grados y en radianes" },
    { tipo: "coterminales", desde: 8, pesos: [5, 3, 2], conceptos: ["angulo-coterminal", "angulo-negativo"], descripcion: "ángulos negativos o mayores de 360°" },
    { tipo: "dado-valor", desde: 9, pesos: [5, 6], conceptos: ["relacion-pitagorica-circulo", "signos-cuadrantes"], descripcion: "dado sen θ y el cuadrante, hallar cos θ o tan θ" },
  ],
  identidades: [
    { tipo: "pitagorica", desde: 1, pesos: [4, 4, 3, 1], conceptos: ["identidad-pitagorica"], descripcion: "identidad pitagórica: de un valor al otro, con cuadrante" },
    { tipo: "complementarios", desde: 1, pesos: [4, 3, 1], conceptos: ["cofunciones"], descripcion: "ángulos complementarios: sen(90° − x) = cos x" },
    { tipo: "cociente", desde: 2, pesos: [3, 3, 1], conceptos: ["identidad-cociente"], descripcion: "identidad del cociente: tan = sen/cos" },
    { tipo: "reciprocas-id", desde: 3, pesos: [3, 2, 1], conceptos: ["identidad-reciproca"], descripcion: "identidades recíprocas: cosec, sec, cot" },
    { tipo: "doble", desde: 4, pesos: [5, 5, 2], conceptos: ["angulo-doble"], descripcion: "ángulo doble con θ notable: sen 2θ, cos 2θ y tan 2θ" },
    { tipo: "doble-dado", desde: 5, pesos: [2, 5, 5, 1], conceptos: ["angulo-doble"], descripcion: "ángulo doble dado sen θ (ternas): sen 2θ, cos 2θ, tan 2θ" },
    { tipo: "suma-diferencia", desde: 7, pesos: [5, 5, 1], conceptos: ["suma-diferencia"], descripcion: "suma y diferencia de ángulos con notables (sen 75°, cos 15°...) y con ternas" },
    { tipo: "equivalente", desde: 8, pesos: [2, 5, 4], conceptos: ["verificar-identidad", "simplificar-expresion"], descripcion: "elegir la expresión equivalente / simplificar (recíprocas, cociente, pitagóricas)" },
    { tipo: "equivalente-doble", desde: 9, pesos: [3, 5], conceptos: ["verificar-identidad", "simplificar-expresion", "angulo-doble"], descripcion: "expresiones equivalentes con ángulo doble y pitagóricas combinadas" },
  ],
  leyes: [
    { tipo: "seno-lado", desde: 1, pesos: [5, 5, 3, 1], conceptos: ["ley-seno", "triangulo-oblicuo"], descripcion: "ley del seno: hallar un lado (dos ángulos y un lado)" },
    { tipo: "coseno-lado", desde: 3, pesos: [3, 5, 5, 2], conceptos: ["ley-coseno"], descripcion: "ley del coseno: hallar el tercer lado (SAS)" },
    { tipo: "coseno-angulo", desde: 5, pesos: [4, 5, 2, 1], conceptos: ["ley-coseno"], descripcion: "ley del coseno: hallar un ángulo (SSS)" },
    { tipo: "area", desde: 6, pesos: [4, 5, 2, 1], conceptos: ["area-seno"], descripcion: "área = ½·a·b·sen C" },
    { tipo: "aplicacion", desde: 8, pesos: [6, 6, 3], conceptos: ["elegir-ley", "ley-seno", "ley-coseno"], descripcion: "aplicaciones con contexto (distancias, perímetro, área)" },
    { tipo: "ambiguo", desde: 9, pesos: [2, 6], conceptos: ["caso-ambiguo"], descripcion: "caso ambiguo SSA: cuántos triángulos hay (0, 1 o 2) y cuál es el ángulo" },
  ],
};

export interface ActivoEscala {
  tipo: string;
  peso: number;
  // 0 en el primer nivel del tipo, 1 en el siguiente...
  dif: number;
}

export function pesoEnNivel(t: TipoEscala, nivel: number): number {
  const i = nivel - t.desde;
  return i >= 0 && i < t.pesos.length ? t.pesos[i] : 0;
}

// Tipos que pueden salir en un nivel (peso > 0), con su peso y su `dif`.
export function activosEnNivel(modo: ModoTrigonometria, nivel: number): ActivoEscala[] {
  const n = Math.min(10, Math.max(1, Math.round(nivel)));
  return ESCALA_TRIGONOMETRIA[modo]
    .map((t) => ({ tipo: t.tipo, peso: pesoEnNivel(t, n), dif: n - t.desde }))
    .filter((a) => a.peso > 0);
}

// Huella de un nivel (tipos, pesos y dif): lo que cambia de un nivel al siguiente.
export function firmaDeNivel(modo: ModoTrigonometria, nivel: number): string {
  return activosEnNivel(modo, nivel)
    .map((a) => `${a.tipo}:${a.peso}:${a.dif}`)
    .join("|");
}
