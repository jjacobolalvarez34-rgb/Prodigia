// Temas (grupos) de Aprender de Circuitia, en las dos pestañas. Es la FUENTE
// del desbloqueo por tema de src/lib/circuitia/path.ts y del sidebar de la
// página de Aprender. src/lib/aprender/grupos.ts (GRUPOS_APRENDER.circuitia)
// repite estos mismos nombres y slugs para su presentación genérica; el test
// path.test.ts comprueba que no se desincronicen.
//
// Los ids son los que ya usaba GRUPOS_APRENDER (y por eso los ids de unidad del
// sidebar: "tecnicas-serie-paralelo", "clases-fundamentos", ...). El tema de
// mayor peso de cada pestaña (serie/paralelo en Técnicas y Fundamentos en
// Clases) va primero: es el orden recomendado, no un requisito.

export type PestanaCircuitia = "tecnicas" | "clases";

export interface GrupoCircuitia {
  id: string;
  nombre: { es: string; en: string };
  slugs: string[];
}

export const GRUPOS_CIRCUITIA: Record<PestanaCircuitia, GrupoCircuitia[]> = {
  tecnicas: [
    {
      id: "serie-paralelo",
      nombre: { es: "Serie y paralelo", en: "Series and parallel" },
      slugs: ["circuitia-reconocer-serie-vs-paralelo", "circuitia-formula-resistencia-paralelo", "circuitia-voltaje-vs-corriente-compartidos"],
    },
    { id: "mixtos", nombre: { es: "Circuitos mixtos", en: "Mixed circuits" }, slugs: ["circuitia-leer-mixto-por-el-bloque-paralelo"] },
    { id: "cualitativo", nombre: { es: "Razonamiento cualitativo", en: "Qualitative reasoning" }, slugs: ["circuitia-estimar-sube-o-baja-sin-calcular"] },
  ],
  clases: [
    {
      id: "fundamentos",
      nombre: { es: "Fundamentos", en: "Fundamentals" },
      slugs: ["circuitia-pro-fundamentos-ohm-serie", "circuitia-pro-paralelo-voltaje-corriente", "circuitia-pro-resistencia-equivalente-comparacion"],
    },
    { id: "mixtos", nombre: { es: "Circuitos mixtos", en: "Mixed circuits" }, slugs: ["circuitia-pro-mixtos-identificar-bloque", "circuitia-pro-mixtos-resolver-paso-a-paso"] },
    {
      id: "cualitativo",
      nombre: { es: "Razonamiento cualitativo", en: "Qualitative reasoning" },
      slugs: ["circuitia-pro-cualitativo-sube-o-baja", "circuitia-pro-cualitativo-cuando-no-cambia"],
    },
  ],
};

// Tema de un slug dentro de una pestaña. Un slug que ninguna lista conoce cae
// en el primer tema (no se pierde ninguna fila del camino).
export function grupoDeSlug(pestana: PestanaCircuitia, slug: string): string {
  const lista = GRUPOS_CIRCUITIA[pestana];
  return (lista.find((g) => g.slugs.includes(slug)) ?? lista[0]).id;
}

// Posición del tema en el orden recomendado de la pestaña.
export function posicionDeGrupo(pestana: PestanaCircuitia, grupo: string): number {
  return GRUPOS_CIRCUITIA[pestana].findIndex((g) => g.id === grupo);
}
