import { NOMBRE_POR_HUESO_CLICKEABLE } from "@/lib/practica/anatomia";
import type {
  EntradaCuerpo,
  EtapaFlujoAnatomia,
  GrupoVisualAnatomia,
  ItemGrupoAnatomia,
  RegionCuerpo,
} from "@/lib/anatomia/visuales";

// Funciones puras que limpian y resuelven los datos de los visuales de
// Anatomía. Los componentes SOLO dibujan lo que estas funciones devuelven:
// nunca inventan un dato anatómico. Un dato malo (jsonb de la base) se
// descarta sin romper la lección.

export const MAX_HUESOS_ESQUELETO = 8;
export const MAX_ENTRADAS_CUERPO = 10;
export const MAX_GRUPOS = 6;
export const MAX_ETAPAS = 10;

export const REGIONES_CUERPO: RegionCuerpo[] = [
  "cabeza",
  "cuello",
  "hombro",
  "torax",
  "abdomen",
  "pelvis",
  "brazo",
  "antebrazo",
  "muslo",
  "pierna",
];

export const NOMBRE_REGION: Record<RegionCuerpo, string> = {
  cabeza: "cabeza",
  cuello: "cuello",
  hombro: "hombro",
  torax: "tórax",
  abdomen: "abdomen",
  pelvis: "pelvis y cadera",
  brazo: "brazo",
  antebrazo: "antebrazo",
  muslo: "muslo",
  pierna: "pierna",
};

const texto = (v: unknown): v is string => typeof v === "string" && v.trim().length > 0;

export interface HuesoResuelto {
  clave: string;
  nombre: string;
}

// Claves data-hueso reales del SVG (las que la práctica ya usa para el modo
// click), sin repetidos, con su nombre en español.
export function resolverHuesos(claves: unknown): HuesoResuelto[] {
  if (!Array.isArray(claves)) return [];
  const vistos = new Set<string>();
  const salida: HuesoResuelto[] = [];
  for (const c of claves) {
    if (typeof c !== "string" || vistos.has(c)) continue;
    if (!Object.hasOwn(NOMBRE_POR_HUESO_CLICKEABLE, c)) continue;
    vistos.add(c);
    salida.push({ clave: c, nombre: NOMBRE_POR_HUESO_CLICKEABLE[c] });
    if (salida.length >= MAX_HUESOS_ESQUELETO) break;
  }
  return salida;
}

export interface EntradaCuerpoResuelta {
  nombre: string;
  regiones: RegionCuerpo[];
  vista: "anterior" | "posterior";
  detalle?: string;
}

export function resolverEntradasCuerpo(entradas: unknown): EntradaCuerpoResuelta[] {
  if (!Array.isArray(entradas)) return [];
  const salida: EntradaCuerpoResuelta[] = [];
  for (const e of entradas as Partial<EntradaCuerpo>[]) {
    if (typeof e !== "object" || e === null || !texto(e.nombre)) continue;
    const regiones = Array.isArray(e.regiones)
      ? [...new Set(e.regiones.filter((r): r is RegionCuerpo => REGIONES_CUERPO.includes(r as RegionCuerpo)))]
      : [];
    if (regiones.length === 0) continue;
    salida.push({
      nombre: e.nombre,
      regiones,
      vista: e.vista === "posterior" ? "posterior" : "anterior",
      ...(texto(e.detalle) ? { detalle: e.detalle } : {}),
    });
    if (salida.length >= MAX_ENTRADAS_CUERPO) break;
  }
  return salida;
}

export interface GrupoResuelto {
  nombre: string;
  items: ItemGrupoAnatomia[];
  // true si algún ítem trae `detalle`: se dibuja como filas en vez de chips.
  conDetalle: boolean;
}

export function resolverGrupos(grupos: unknown): GrupoResuelto[] {
  if (!Array.isArray(grupos)) return [];
  const salida: GrupoResuelto[] = [];
  for (const g of grupos as Partial<GrupoVisualAnatomia>[]) {
    if (typeof g !== "object" || g === null || !texto(g.nombre) || !Array.isArray(g.items)) continue;
    const items: ItemGrupoAnatomia[] = [];
    for (const it of g.items as Partial<ItemGrupoAnatomia>[]) {
      if (typeof it !== "object" || it === null || !texto(it.texto)) continue;
      items.push({
        texto: it.texto,
        ...(texto(it.marca) ? { marca: it.marca } : {}),
        ...(texto(it.detalle) ? { detalle: it.detalle } : {}),
      });
    }
    if (items.length === 0) continue;
    salida.push({ nombre: g.nombre, items, conDetalle: items.some((i) => i.detalle !== undefined) });
    if (salida.length >= MAX_GRUPOS) break;
  }
  return salida;
}

export function resolverEtapas(etapas: unknown): EtapaFlujoAnatomia[] {
  if (!Array.isArray(etapas)) return [];
  const salida: EtapaFlujoAnatomia[] = [];
  for (const e of etapas as Partial<EtapaFlujoAnatomia>[]) {
    if (typeof e !== "object" || e === null || !texto(e.titulo)) continue;
    salida.push({ titulo: e.titulo, ...(texto(e.detalle) ? { detalle: e.detalle } : {}) });
    if (salida.length >= MAX_ETAPAS) break;
  }
  return salida;
}

// Texto plano de un visual (alternativa accesible y cobertura de contenido
// en los tests).
export function textoDeVisual(visual: { tipo: string } & Record<string, unknown>): string {
  switch (visual.tipo) {
    case "anatomia.esqueleto":
      return resolverHuesos(visual.huesos)
        .map((h) => h.nombre)
        .join(", ");
    case "anatomia.cuerpo":
      return resolverEntradasCuerpo(visual.entradas)
        .map((e) => `${e.nombre} (${e.regiones.map((r) => NOMBRE_REGION[r]).join(" y ")}${e.detalle ? `: ${e.detalle}` : ""})`)
        .join("; ");
    case "anatomia.grupos":
      return resolverGrupos(visual.grupos)
        .map((g) => `${g.nombre}: ${g.items.map((i) => [i.marca, i.texto, i.detalle && `(${i.detalle})`].filter(Boolean).join(" ")).join(", ")}`)
        .join(". ");
    case "anatomia.flujo":
      return resolverEtapas(visual.etapas)
        .map((e) => (e.detalle ? `${e.titulo} (${e.detalle})` : e.titulo))
        .join(" → ");
    default:
      return "";
  }
}
