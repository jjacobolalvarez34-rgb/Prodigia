// Agrupación de las técnicas y clases de los mundos 9-13 en "temas" para el
// panel lateral de Aprender (mismo diseño que Melodía/Trigonometría: panel
// de temas con progreso a la izquierda, camino a la derecha — ver fila 3 y
// fila 22 de docs/PARIDAD_MUNDOS.md). Es un mapeo slug → tema puramente en
// código (sin columna nueva ni migración), igual que hicieron Quimia,
// Anatomía, Melodía y Trigonometría con el suyo. Un slug que no figure acá
// cae en un tema "Otras"/"Other" para que ninguna lección quede invisible.

export type PestanaGrupos = "tecnicas" | "clases";
type Idioma = "es" | "en";

interface GrupoDef {
  id: string;
  nombre: Record<Idioma, string>;
  slugs: string[];
}

interface GruposMundo {
  tecnicas: GrupoDef[];
  clases: GrupoDef[];
}

const g = (id: string, es: string, en: string, slugs: string[]): GrupoDef => ({ id, nombre: { es, en }, slugs });

export const GRUPOS_APRENDER: Record<string, GruposMundo> = {
  // Mundos originales que tenían UNA sola unidad (sin panel de temas): se
  // les da división real derivada de sus propias técnicas para que la
  // pantalla de Aprender se vea igual que la de Melodía/Trigonometría.
  geografia: {
    tecnicas: [
      g("ubicar", "Ubicar y agrupar", "Locate and group", ["dividir-en-subregiones", "anclar-por-vecinos"]),
      g("formas", "Reconocer formas", "Recognize shapes", ["forma-caracteristica"]),
    ],
    clases: [],
  },
  historia: {
    tecnicas: [
      g("cronologia", "Cronología", "Chronology", ["historia-anclaje-cronologico", "historia-linea-de-tiempo-mental", "historia-bloques-por-siglo"]),
      g("memoria", "Memoria", "Memory", ["historia-asociacion-memorable", "historia-siglas-para-secuencias"]),
    ],
    clases: [],
  },
  calculia: {
    tecnicas: [
      g("derivadas", "Derivadas", "Derivatives", ["calculia-reconocer-regla-derivacion"]),
      g("integrales", "Integrales", "Integrals", ["calculia-tabla-integrales-comunes"]),
      g("series", "Series", "Series", ["calculia-identificar-tipo-serie"]),
      g("multivariable", "Multivariable y EDOs", "Multivariable and ODEs", ["calculia-derivar-parciales", "calculia-separar-variables-edo"]),
    ],
    clases: [
      g("derivadas", "Derivadas", "Derivatives", ["calculia-pro-derivadas-fundamentos", "calculia-pro-derivadas-producto-cociente-cadena"]),
      g("integrales", "Integrales", "Integrals", ["calculia-pro-integrales-fundamentos", "calculia-pro-integrales-avanzadas"]),
      g("series", "Series", "Series", ["calculia-pro-series-geometricas"]),
      g("multivariable", "Multivariable y EDOs", "Multivariable and ODEs", ["calculia-pro-multivariable-parciales", "calculia-pro-edos-separables"]),
    ],
  },
  circuitia: {
    tecnicas: [
      g("serie-paralelo", "Serie y paralelo", "Series and parallel", [
        "circuitia-reconocer-serie-vs-paralelo",
        "circuitia-formula-resistencia-paralelo",
        "circuitia-voltaje-vs-corriente-compartidos",
      ]),
      g("mixtos", "Circuitos mixtos", "Mixed circuits", ["circuitia-leer-mixto-por-el-bloque-paralelo"]),
      g("cualitativo", "Razonamiento cualitativo", "Qualitative reasoning", ["circuitia-estimar-sube-o-baja-sin-calcular"]),
    ],
    clases: [
      g("fundamentos", "Fundamentos", "Fundamentals", [
        "circuitia-pro-fundamentos-ohm-serie",
        "circuitia-pro-paralelo-voltaje-corriente",
        "circuitia-pro-resistencia-equivalente-comparacion",
      ]),
      g("mixtos", "Circuitos mixtos", "Mixed circuits", ["circuitia-pro-mixtos-identificar-bloque", "circuitia-pro-mixtos-resolver-paso-a-paso"]),
      g("cualitativo", "Razonamiento cualitativo", "Qualitative reasoning", [
        "circuitia-pro-cualitativo-sube-o-baja",
        "circuitia-pro-cualitativo-cuando-no-cambia",
      ]),
    ],
  },
  estadistica: {
    tecnicas: [
      g("central", "Tendencia central", "Central tendency", ["estadistica-media-desde-una-media-provisoria", "estadistica-mediana-por-posicion"]),
      g("dispersion", "Dispersión", "Dispersion", ["estadistica-cuartiles-por-mitades", "estadistica-varianza-con-desvios"]),
      g("probabilidad", "Probabilidad y combinatoria", "Probability and combinatorics", ["estadistica-combinatoria-sin-factoriales-enormes"]),
    ],
    clases: [
      g("datos-central", "Datos y tendencia central", "Data and central tendency", [
        "estadistica-clase-1-datos-y-tipos-de-variable",
        "estadistica-clase-2-tendencia-central",
      ]),
      g("dispersion", "Dispersión", "Dispersion", ["estadistica-clase-3-dispersion"]),
      g("probabilidad", "Probabilidad y combinatoria", "Probability and combinatorics", [
        "estadistica-clase-4-probabilidad",
        "estadistica-clase-5-combinatoria",
      ]),
      g("analisis", "Análisis de datos y gráficos", "Data analysis and charts", [
        "estadistica-clase-6-normal-z-y-percentiles",
        "estadistica-clase-7-correlacion-y-regresion",
        "estadistica-clase-8-lectura-critica-de-graficos",
      ]),
    ],
  },
  naipia: {
    tecnicas: [
      g("ritmo", "Ritmo y velocidad", "Rhythm and speed", ["naipia-tecnica-pares", "naipia-tecnica-bloques", "naipia-tecnica-ritmo"]),
      g("verificacion", "Verificación", "Checking", ["naipia-tecnica-mazo-cero", "naipia-tecnica-neutras"]),
    ],
    clases: [
      g("fundamentos", "Fundamentos", "Fundamentals", ["naipia-clase-por-que-valores", "naipia-clase-hilo", "naipia-clase-cancelacion"]),
      g("sistemas", "Otros sistemas", "Other systems", ["naipia-clase-ko", "naipia-clase-sistemas", "naipia-clase-hiopt2", "naipia-clase-omega2"]),
      g("verdadero", "Conteo verdadero", "True count", ["naipia-clase-conteo-verdadero"]),
    ],
  },
  codia: {
    tecnicas: [
      g("trazado", "Trazado y lectura", "Tracing and reading", ["codia-tecnica-tabla-seguimiento", "codia-tecnica-leer-bucles"]),
      g("errores", "Errores y operadores", "Errors and operators", ["codia-tecnica-errores-tipicos", "codia-tecnica-division-entera-modulo"]),
      g("complejidad", "Complejidad", "Complexity", ["codia-tecnica-complejidad-vistazo"]),
    ],
    clases: [
      g("basicos", "Lo básico", "The basics", [
        "codia-clase-01-variables-y-tipos",
        "codia-clase-02-condicionales",
        "codia-clase-03-bucles",
        "codia-clase-04-funciones",
      ]),
      g("estructuras", "Estructuras de datos", "Data structures", ["codia-clase-05-listas-y-diccionarios", "codia-clase-08-pilas-colas-y-conjuntos"]),
      g("complejidad", "Complejidad y depuración", "Complexity and debugging", [
        "codia-clase-06-recorridos-y-complejidad",
        "codia-clase-07-errores-y-depuracion",
      ]),
    ],
  },
};

export interface GrupoNodos<T> {
  id: string;
  nombre: string;
  nodos: T[];
}

// Reparte los nodos (en el orden en que vienen, que ya es el del camino) en
// los temas del mundo/pestaña. Los temas vacíos se omiten; los slugs sin tema
// van a "Otras" para no perder ninguna lección.
export function agruparNodos<T extends { slug: string }>(
  nodos: T[],
  mundo: string,
  pestana: PestanaGrupos,
  locale: string
): GrupoNodos<T>[] {
  const idioma: Idioma = locale === "en" ? "en" : "es";
  const defs = GRUPOS_APRENDER[mundo]?.[pestana] ?? [];
  const usados = new Set<string>();
  const grupos: GrupoNodos<T>[] = defs.map((d) => {
    const dentro = nodos.filter((n) => d.slugs.includes(n.slug));
    dentro.forEach((n) => usados.add(n.slug));
    return { id: `${pestana}-${d.id}`, nombre: d.nombre[idioma], nodos: dentro };
  });
  const sueltos = nodos.filter((n) => !usados.has(n.slug));
  if (sueltos.length > 0) {
    grupos.push({ id: `${pestana}-otras`, nombre: idioma === "en" ? "Other" : "Otras", nodos: sueltos });
  }
  return grupos.filter((gr) => gr.nodos.length > 0);
}
