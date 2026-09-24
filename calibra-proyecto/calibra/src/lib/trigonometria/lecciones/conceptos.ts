// Vocabulario de conceptos del currículo de Trigonometría (grafo de
// dependencias). Cada lección declara `introduce` y `usa` con IDs de esta lista;
// lecciones.test.ts comprueba que:
//   - todo ID declarado exista acá (un error de tipeo falla);
//   - toda Clase que USA un concepto lo encuentre introducido por una Clase
//     anterior (o por sí misma) o en CONOCIMIENTO_PREVIO;
//   - cada concepto de esta lista lo introduzca exactamente UNA Clase;
//   - lo mismo para las Técnicas (que llevan su propio orden).
// Agregar una Clase nueva es agregarle sus conceptos acá: el test dice de
// inmediato si quedó algo usado antes de enseñarse.

export interface ConceptoTrigonometria {
  id: string;
  nombre: string;
}

// Conocimientos que el colegio ya dio antes de Trigonometría: no se enseñan acá.
export const CONOCIMIENTO_PREVIO: ConceptoTrigonometria[] = [
  { id: "pitagoras", nombre: "Teorema de Pitágoras" },
  { id: "angulos-triangulo", nombre: "Los ángulos de un triángulo suman 180°" },
  { id: "semejanza", nombre: "Triángulos semejantes: lados proporcionales" },
  { id: "fracciones-raices", nombre: "Fracciones y raíces cuadradas" },
  { id: "ecuacion-lineal", nombre: "Despejar una incógnita" },
  { id: "plano-cartesiano", nombre: "El plano cartesiano" },
  { id: "funcion-grafica", nombre: "Función y gráfica de una función" },
  { id: "longitud-circunferencia", nombre: "Longitud de la circunferencia (2πr)" },
  { id: "factorizacion", nombre: "Factorización (factor común y trinomios)" },
];

// Conceptos que se enseñan, en orden de currículo (las 27 Clases).
export const CONCEPTOS_TRIGONOMETRIA: ConceptoTrigonometria[] = [
  // Bloque 1: razones en el triángulo rectángulo
  { id: "triangulo-rectangulo", nombre: "El triángulo rectángulo" },
  { id: "lados-relativos", nombre: "Opuesto, adyacente e hipotenusa según el ángulo" },
  { id: "razon-seno", nombre: "Seno" },
  { id: "razon-coseno", nombre: "Coseno" },
  { id: "razon-tangente", nombre: "Tangente" },
  { id: "sohcahtoa", nombre: "SOH-CAH-TOA" },
  { id: "razones-reciprocas", nombre: "Cosecante, secante y cotangente" },
  { id: "hallar-lado", nombre: "Hallar un lado con una razón" },
  { id: "calculadora-grados", nombre: "La calculadora en modo grados" },
  { id: "razones-inversas", nombre: "Razones inversas (arcsen, arccos, arctan)" },
  { id: "hallar-angulo", nombre: "Hallar un ángulo" },
  { id: "triangulo-45-45-90", nombre: "Triángulo 45-45-90 (medio cuadrado)" },
  { id: "triangulo-30-60-90", nombre: "Triángulo 30-60-90 (medio equilátero)" },
  { id: "valores-notables-agudos", nombre: "Razones de 30°, 45° y 60°" },
  { id: "angulo-elevacion", nombre: "Ángulo de elevación" },
  { id: "angulo-depresion", nombre: "Ángulo de depresión" },
  { id: "problemas-rectangulo", nombre: "Problemas con triángulos rectángulos" },
  // Bloque 2: ángulos y círculo unitario
  { id: "posicion-estandar", nombre: "Ángulo en posición estándar" },
  { id: "cuadrantes", nombre: "Los cuatro cuadrantes" },
  { id: "angulo-negativo", nombre: "Ángulos negativos" },
  { id: "angulo-coterminal", nombre: "Ángulos coterminales" },
  { id: "radian", nombre: "El radián" },
  { id: "conversion-grados-radianes", nombre: "Conversión entre grados y radianes" },
  { id: "circulo-unitario", nombre: "El círculo unitario" },
  { id: "valores-exactos", nombre: "Valores exactos de seno, coseno y tangente" },
  { id: "razones-cualquier-angulo", nombre: "Razones de un ángulo cualquiera" },
  { id: "relacion-pitagorica-circulo", nombre: "x² + y² = 1 en el círculo unitario" },
  { id: "angulo-referencia", nombre: "Ángulo de referencia" },
  { id: "signos-cuadrantes", nombre: "Signos por cuadrante" },
  // Bloque 3: gráficas y periodo
  { id: "funcion-seno", nombre: "La función seno" },
  { id: "funcion-periodica", nombre: "Función periódica" },
  { id: "funcion-coseno", nombre: "La función coseno" },
  { id: "amplitud", nombre: "Amplitud" },
  { id: "periodo", nombre: "Periodo" },
  { id: "frecuencia", nombre: "Frecuencia" },
  { id: "desfase", nombre: "Desfase" },
  { id: "desplazamiento-vertical", nombre: "Desplazamiento vertical y línea media" },
  { id: "funcion-tangente", nombre: "La función tangente" },
  { id: "asintotas", nombre: "Asíntotas verticales" },
  { id: "ecuacion-de-grafica", nombre: "Leer y escribir la ecuación de una gráfica" },
  // Bloque 4: leyes de seno y coseno
  { id: "triangulo-oblicuo", nombre: "Triángulo oblicuo" },
  { id: "ley-seno", nombre: "Ley del seno" },
  { id: "ley-coseno", nombre: "Ley del coseno" },
  { id: "elegir-ley", nombre: "Elegir la ley según los datos" },
  { id: "area-seno", nombre: "Área con ½·a·b·sen C" },
  { id: "caso-ambiguo", nombre: "Caso ambiguo (SSA)" },
  // Bloque 5: identidades
  { id: "identidad-reciproca", nombre: "Identidades recíprocas" },
  { id: "identidad-cociente", nombre: "Identidad del cociente" },
  { id: "identidad-pitagorica", nombre: "Identidades pitagóricas" },
  { id: "cofunciones", nombre: "Cofunciones (ángulos complementarios)" },
  { id: "angulo-doble", nombre: "Ángulo doble" },
  { id: "suma-diferencia", nombre: "Suma y diferencia de ángulos" },
  { id: "verificar-identidad", nombre: "Verificar una identidad" },
  { id: "simplificar-expresion", nombre: "Simplificar una expresión trigonométrica" },
  // Bloque 6: ecuaciones trigonométricas
  { id: "ecuacion-trigonometrica", nombre: "Ecuación trigonométrica básica" },
  { id: "soluciones-intervalo", nombre: "Soluciones en [0, 2π)" },
  { id: "ecuacion-con-inversa", nombre: "Resolver con la función inversa" },
  { id: "ecuacion-con-identidad", nombre: "Ecuaciones que se resuelven con una identidad" },
  { id: "ecuacion-factorizada", nombre: "Ecuaciones que se resuelven factorizando" },
];

export const IDS_CONCEPTOS = new Set(CONCEPTOS_TRIGONOMETRIA.map((c) => c.id));
export const IDS_PREVIOS = new Set(CONOCIMIENTO_PREVIO.map((c) => c.id));
