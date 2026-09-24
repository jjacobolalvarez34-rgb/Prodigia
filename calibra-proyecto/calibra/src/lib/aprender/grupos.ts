// Agrupación de las técnicas y clases de los mundos 9-13 en "temas" para el
// panel lateral de Aprender (mismo diseño que Melodía/Trigonometría: panel
// de temas con progreso a la izquierda, camino a la derecha — ver fila 3 y
// fila 22 de docs/PARIDAD_MUNDOS.md). Es un mapeo slug → tema puramente en
// código (sin columna nueva ni migración), igual que hicieron Quimia,
// Anatomía, Melodía y Trigonometría con el suyo. Un slug que no figure acá
// cae en un tema "Otras"/"Other" para que ninguna lección quede invisible.
//
// Desbloqueo por tema en Técnicas (pedido del usuario 2026-09-22): antes
// TODO el camino (los 9 temas de Numeria, o los N grupos de cualquier otro
// mundo) tenía un único puntero "activo" global, ordenado por (grupo,
// orden) — terminar TODA la Suma era requisito para que apareciera la
// primera técnica de Resta. Ahora cada grupo/tema tiene su PROPIO puntero
// independiente: la primera técnica no dominada de cada tema queda
// "activo" a la vez (uno por tema, todos abiertos desde el principio),
// y dentro de un mismo tema se sigue siendo estrictamente lineal (hay que
// dominar la 1 antes de que la 2 de ESE tema se desbloquee). Ver
// `recalcularActivoPorGrupo` más abajo. Aplica SOLO a la pestaña
// "tecnicas" — las Clases siguen siendo una única progresión dependiente
// a propósito (son un curso, no atajos sueltos; ver fila 22 de
// PARIDAD_MUNDOS.md: "lecciones progresivas y dependientes entre sí").

import type { NodoEstado } from "@/lib/aprender/clases";
import { TECNICAS_GEOGRAFIA, CLASES_GEOGRAFIA } from "@/lib/geografia/lecciones";
import type { Continente } from "@/lib/practica/geografia";
import { TECNICAS_QUIMIA, CLASES_QUIMIA } from "@/lib/quimia/lecciones";
import { ORDEN_GRUPOS_QUIMIA, type GrupoQuimia } from "@/lib/quimia/grupos";
import { TECNICAS_ANATOMIA, CLASES_ANATOMIA } from "@/lib/anatomia/lecciones";
import { ORDEN_GRUPOS_ANATOMIA, NOMBRES_GRUPOS_ANATOMIA } from "@/lib/anatomia/grupos";
import { TECNICAS_MELODIA, CLASES_MELODIA } from "@/lib/melodia/lecciones";
import { ORDEN_GRUPOS_MELODIA, NOMBRES_GRUPOS_MELODIA } from "@/lib/melodia/grupos";
import { TECNICAS_TRIGONOMETRIA, CLASES_TRIGONOMETRIA } from "@/lib/trigonometria/lecciones";
import { ORDEN_GRUPOS_TRIGONOMETRIA, NOMBRES_GRUPOS_TRIGONOMETRIA } from "@/lib/trigonometria/bloques";

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

// Nombres de los 4 continentes de Geografía para el sidebar — mismos
// nombres que ya usa Geografia.continentes en messages/*.json (no se
// duplican acá strings nuevos, se repiten literalmente).
function nombreContinentes(): [Continente, string, string][] {
  return [
    ["america", "América", "America"],
    ["europa", "Europa", "Europe"],
    ["africa", "África", "Africa"],
    ["asia_oceania", "Asia y Oceanía", "Asia & Oceania"],
  ];
}

// Nombres de los grupos de Quimia para el sidebar. Repiten los de
// messages/*.json (Quimia.aprenderPagina.grupos): src/lib/quimia/path.test.ts
// comprueba que coincidan, para que no se desincronicen.
export const NOMBRES_GRUPOS_QUIMIA: Record<GrupoQuimia, { es: string; en: string }> = {
  tabla: { es: "Átomo y tabla periódica", en: "Atom and periodic table" },
  simbolos: { es: "Símbolos y elementos", en: "Symbols and elements" },
  formulas: { es: "Enlaces y fórmulas", en: "Bonds and formulas" },
  nomenclatura: { es: "Nomenclatura inorgánica", en: "Inorganic nomenclature" },
  redox: { es: "Estados de oxidación y redox", en: "Oxidation states and redox" },
  organica: { es: "Química orgánica", en: "Organic chemistry" },
};

export const GRUPOS_APRENDER: Record<string, GruposMundo> = {
  // Numeria (retrofit a Técnicas | Clases, docs/PARIDAD_MUNDOS.md fila 22 +
  // fila 23, 2026-09-22): a diferencia de los mundos de arriba, acá "tema"
  // ya existía de antes como TemaAprendible (src/lib/aprender/path.ts) — un
  // grupo por cada uno de los 9 temas, con los slugs reales de las
  // técnicas sembradas en 0005/0007/0018/0019/0026/0032/0079/0101 (grep
  // confirmado, no inventados). Las Clases nuevas (0199) son una por tema
  // salvo Fracciones, que tiene dos (MCM y Operaciones).
  numeria: {
    tecnicas: [
      g("suma", "Suma", "Addition", [
        "complemento-a-10",
        "redondear-decena",
        "sumar-por-la-izquierda",
        "duplicar-y-ajustar",
        "sumar-por-posicion-numeros-grandes",
        "estimar-antes-de-sumar-grande",
      ]),
      g("resta", "Resta", "Subtraction", [
        "resta-compensacion",
        "complemento-a-100",
        "restar-por-posicion-numeros-grandes",
        "restar-completando-al-redondo-mas-cercano",
      ]),
      g("multiplicacion", "Multiplicación", "Multiplication", [
        "x11-segundo",
        "x5-mitad-de-x10",
        "cuadrado-terminado-en-5",
        "x9-es-x10-menos-el-numero",
        "numeros-cercanos-a-100",
        "x4-duplicar-dos-veces",
        "multiplicar-por-partes",
        "multiplicar-redondeando-primero",
      ]),
      g("division", "División", "Division", [
        "divisibilidad-por-3",
        "dividir-por-5",
        "dividir-numeros-grandes-por-partes",
        "estimar-el-cociente-grande",
      ]),
      g("fracciones", "Fracciones", "Fractions", [
        "sumar-fracciones-igual-denominador",
        "simplificar-con-mcd",
        "minimo-comun-denominador",
        "comparar-con-producto-cruzado",
      ]),
      g("decimales", "Decimales y porcentajes", "Decimals and percentages", [
        "convertir-fraccion-decimal",
        "porcentaje-como-decimal",
        "redondear-decimales",
      ]),
      g("potencias", "Potencias y raíces", "Powers and roots", [
        "potencia-como-multiplicacion-repetida",
        "raiz-cuadrada-por-tanteo",
        "notacion-cientifica-basica",
      ]),
      g("algebra", "Álgebra básica", "Basic algebra", ["que-es-una-variable", "despejar-paso-a-paso", "verificar-sustituyendo"]),
      g("geometria", "Geometría básica", "Basic geometry", [
        "geometria-ternas-pitagoricas",
        "geometria-area-compuestas",
        "geometria-pi-fraccion",
        "geometria-angulos-complementarios",
      ]),
    ],
    clases: [
      g("basicos", "Conceptos básicos", "Basic concepts", ["numeria-clase-conceptos-basicos"]),
      g("multiplicacion", "Multiplicación", "Multiplication", ["numeria-clase-multiplicacion"]),
      g("division", "División", "Division", ["numeria-clase-division"]),
      g("fracciones", "Fracciones y MCM", "Fractions and LCM", ["numeria-clase-mcm", "numeria-clase-fracciones-operaciones"]),
    ],
  },
  // Enigmia (retrofit a Técnicas | Clases, 2026-09-22): ya tenía división
  // real por categoría desde antes (logic_techniques.categoria) — acá se
  // usa esa misma partición para las 4 categorías reales, en las dos
  // pestañas (slugs confirmados por grep contra 0015/0020 para Técnicas y
  // contra src/lib/enigmia/lecciones/clases.ts para Clases). A diferencia
  // del resto de los mundos, el desbloqueo por categoría de Enigmia ya se
  // calcula en src/lib/enigmia/pathClases.ts (no depende de
  // recalcularActivoPorGrupo para la pestaña "clases" — ver el comentario
  // de ese archivo).
  enigmia: {
    tecnicas: [
      g("patrones", "Patrones", "Patterns", ["patron-numerico", "encontrar-intruso", "analogias", "enigmia-tecnica-patrones-alternantes"]),
      g("deduccion", "Deducción", "Deduction", [
        "condicional-si-entonces",
        "enigmia-tecnica-silogismos-dos-premisas",
        "enigmia-tecnica-negacion-ningun-x-es-y",
        "enigmia-tecnica-eliminacion-por-descarte",
      ]),
      g("memoria", "Memoria", "Memory", [
        "tecnicas-de-memoria",
        "enigmia-tecnica-metodo-de-loci",
        "enigmia-tecnica-agrupar-por-categoria",
        "enigmia-tecnica-visualizar-en-vez-de-repetir",
      ]),
      g("computacional", "Pensamiento computacional", "Computational thinking", [
        "pensar-como-algoritmo",
        "enigmia-tecnica-trazar-un-bucle-a-mano",
        "enigmia-tecnica-condicion-de-corte",
        "enigmia-tecnica-simplificar-antes-de-ejecutar",
      ]),
    ],
    clases: [
      g("patrones", "Patrones", "Patterns", [
        "enigmia-clase-secuencias-aritmeticas-geometricas",
        "enigmia-clase-patrones-no-numericos",
        "enigmia-clase-patrones-compuestos-dos-reglas",
      ]),
      g("deduccion", "Deducción", "Deduction", [
        "enigmia-clase-proposiciones-y-contrapositiva",
        "enigmia-clase-silogismos-simples",
        "enigmia-clase-deduccion-por-eliminacion",
      ]),
      g("memoria", "Memoria", "Memory", ["enigmia-clase-chunking-y-asociacion", "enigmia-clase-repeticion-espaciada-y-recuerdo-activo"]),
      g("computacional", "Pensamiento computacional", "Computational thinking", [
        "enigmia-clase-que-es-un-algoritmo",
        "enigmia-clase-bucles-y-repeticion",
        "enigmia-clase-depuracion-por-que-falla-un-algoritmo",
      ]),
    ],
  },
  // Geografía (retrofit completo a Técnicas | Clases POR CONTINENTE,
  // 2026-09-23 — ver docs/PARIDAD_MUNDOS.md fila 1: "Aprender tiene solo 3
  // lecciones totales... ninguna por continente. Gap de contenido, no de
  // código"): a diferencia del resto de los mundos de este objeto, acá la
  // fuente de verdad del desbloqueo YA NO es agruparNodos/recalcularActivoPorGrupo
  // — src/lib/geografia/path.ts calcula el grupo y el estado "activo" por
  // continente directamente en el cargador del camino (mismo patrón que
  // src/lib/quimia/path.ts), y la página de Aprender arma el sidebar leyendo
  // ese campo `grupo` sin pasar por acá (mismo criterio que
  // src/app/[locale]/quimia/aprender/page.tsx). Esta entrada se mantiene
  // igual de precisa por consistencia/documentación — no por que algo la
  // use hoy — y sale del contenido tipado real (TECNICAS_GEOGRAFIA/
  // CLASES_GEOGRAFIA) en vez de repetir slugs a mano, para que nunca quede
  // desincronizada. Las 3 Técnicas históricas genéricas
  // (0027_geografia_lecciones.sql) no mapean a un continente específico
  // (ver línea 82 de PARIDAD_MUNDOS.md) y quedan en el grupo "General".
  geografia: {
    tecnicas: [
      g("general", "General", "General", ["dividir-en-subregiones", "anclar-por-vecinos", "forma-caracteristica"]),
      ...nombreContinentes().map(([id, es, en]) =>
        g(
          id,
          es,
          en,
          TECNICAS_GEOGRAFIA.filter((t) => t.continente === id).map((t) => t.slug)
        )
      ),
    ],
    clases: nombreContinentes().map(([id, es, en]) =>
      g(
        id,
        es,
        en,
        CLASES_GEOGRAFIA.filter((c) => c.continente === id).map((c) => c.slug)
      )
    ),
  },
  // Quimia (Técnicas | Clases, tanda 1 del retrofit, 2026-09-23 — ver
  // docs/PARIDAD_MUNDOS.md): igual que Geografía, la fuente de verdad del
  // desbloqueo es src/lib/quimia/path.ts (Técnicas: un "activo" por grupo;
  // Clases: un curso lineal único), y la página de Aprender arma el sidebar
  // leyendo el campo `grupo` de cada nodo. Esta entrada es documentación /
  // presentación y sale del contenido tipado (nunca slugs repetidos a mano)
  // para que no se desincronice. Los grupos vacíos (redox y orgánica hasta la
  // tanda 2) no aparecen en el sidebar (agruparNodos omite los temas vacíos).
  quimia: {
    tecnicas: ORDEN_GRUPOS_QUIMIA.map((id) =>
      g(id, NOMBRES_GRUPOS_QUIMIA[id].es, NOMBRES_GRUPOS_QUIMIA[id].en, TECNICAS_QUIMIA.filter((t) => t.grupo === id).map((t) => t.slug))
    ),
    clases: ORDEN_GRUPOS_QUIMIA.map((id) =>
      g(id, NOMBRES_GRUPOS_QUIMIA[id].es, NOMBRES_GRUPOS_QUIMIA[id].en, CLASES_QUIMIA.filter((c) => c.grupo === id).map((c) => c.slug))
    ),
  },
  // Anatomía (Técnicas | Clases, 2026-09-23 — ver docs/PARIDAD_MUNDOS.md
  // "Anatomía: Técnicas | Clases"): igual que Geografía y Quimia, la fuente
  // de verdad del desbloqueo es src/lib/anatomia/path.ts (un "activo" por
  // sistema en las dos pestañas) y la página arma el sidebar leyendo el
  // campo `grupo` de cada nodo. Esta entrada es documentación/presentación
  // derivada del contenido tipado (nunca slugs repetidos a mano).
  anatomia: {
    tecnicas: ORDEN_GRUPOS_ANATOMIA.map((id) =>
      g(id, NOMBRES_GRUPOS_ANATOMIA[id].es, NOMBRES_GRUPOS_ANATOMIA[id].en, TECNICAS_ANATOMIA.filter((t) => t.grupo === id).map((t) => t.slug))
    ),
    clases: ORDEN_GRUPOS_ANATOMIA.map((id) =>
      g(id, NOMBRES_GRUPOS_ANATOMIA[id].es, NOMBRES_GRUPOS_ANATOMIA[id].en, CLASES_ANATOMIA.filter((c) => c.grupo === id).map((c) => c.slug))
    ),
  },
  // Melodía (Técnicas | Clases, 2026-09-23 — ver docs/PARIDAD_MUNDOS.md
  // "Melodía: Técnicas | Clases"): igual que Anatomía, la fuente de verdad del
  // desbloqueo es src/lib/melodia/path.ts (un "activo" por grupo/modo de
  // práctica en las dos pestañas) y la página arma el sidebar leyendo el
  // campo `grupo` de cada nodo. Esta entrada es documentación/presentación
  // derivada del contenido tipado (nunca slugs repetidos a mano).
  melodia: {
    tecnicas: ORDEN_GRUPOS_MELODIA.map((id) =>
      g(id, NOMBRES_GRUPOS_MELODIA[id].es, NOMBRES_GRUPOS_MELODIA[id].en, TECNICAS_MELODIA.filter((t) => t.grupo === id).map((t) => t.slug))
    ),
    clases: ORDEN_GRUPOS_MELODIA.map((id) =>
      g(id, NOMBRES_GRUPOS_MELODIA[id].es, NOMBRES_GRUPOS_MELODIA[id].en, CLASES_MELODIA.filter((c) => c.grupo === id).map((c) => c.slug))
    ),
  },
  // Trigonometría (Técnicas | Clases, 2026-09-24 — ver docs/PARIDAD_MUNDOS.md
  // "Trigonometría: rediseño del mundo (fase 1)"): los 6 bloques del currículo
  // en orden de colegio. La fuente de verdad del desbloqueo es
  // src/lib/trigonometria/path.ts (Técnicas: un "activo" por bloque; Clases: un
  // curso lineal único) y la página arma el sidebar leyendo el campo `grupo`.
  // Esta entrada es presentación derivada del contenido tipado (nunca slugs
  // repetidos a mano).
  trigonometria: {
    tecnicas: ORDEN_GRUPOS_TRIGONOMETRIA.map((id) =>
      g(id, NOMBRES_GRUPOS_TRIGONOMETRIA[id].es, NOMBRES_GRUPOS_TRIGONOMETRIA[id].en, TECNICAS_TRIGONOMETRIA.filter((t) => t.grupo === id).map((t) => t.slug))
    ),
    clases: ORDEN_GRUPOS_TRIGONOMETRIA.map((id) =>
      g(id, NOMBRES_GRUPOS_TRIGONOMETRIA[id].es, NOMBRES_GRUPOS_TRIGONOMETRIA[id].en, CLASES_TRIGONOMETRIA.filter((c) => c.grupo === id).map((c) => c.slug))
    ),
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
// van a "Otras" para no perder ninguna lección. Para "tecnicas", además
// recalcula el estado activo/bloqueado POR GRUPO (ver comentario de
// cabecera) — el estado que traía cada nodo desde el camino (calculado
// como un único puntero global) se descarta para ese propósito; lo único
// que se conserva de la fuente es si ya estaba "completado" (verdad de
// base, no depende de agrupación).
export function agruparNodos<T extends { slug: string; estado?: NodoEstado }>(
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
  const filtrados = grupos.filter((gr) => gr.nodos.length > 0);
  return pestana === "tecnicas" ? filtrados.map(recalcularActivoPorGrupo) : filtrados;
}

function recalcularActivoPorGrupo<T extends { estado?: NodoEstado }>(grupo: GrupoNodos<T>): GrupoNodos<T> {
  let activoAsignado = false;
  return {
    ...grupo,
    nodos: grupo.nodos.map((n) => {
      if (n.estado === "completado") return n;
      if (!activoAsignado) {
        activoAsignado = true;
        return { ...n, estado: "activo" as NodoEstado };
      }
      return { ...n, estado: "bloqueado" as NodoEstado };
    }),
  };
}
