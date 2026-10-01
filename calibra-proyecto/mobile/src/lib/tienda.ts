// Tienda de la app: el mismo catálogo y los mismos precios que la web
// (src/lib/tienda/costos.ts + descuento del día), comprados con la misma RPC
// (comprar_item_tienda revalida precio, nivel y Pro en el servidor). Sin Trastienda
// ni apuestas (PROD-01) y sin compra de Chispas con dinero (llega con Play Billing).
import { File } from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import { obtenerDescuentoDelDia, precioConDescuento } from "@/lib/descuentoDiario";
import { COSTOS, type ItemComprable } from "@/lib/tienda/costos";
import { MARCOS_MUNDO, MARCOS_NEON, RANGOS_ELO } from "@/types/database";
import { supabase } from "./supabase";

export { COSTOS, type ItemComprable };

export type Categoria = "utilidad" | "marco" | "marco_mundo" | "fuente" | "animacion" | "fondo" | "galeria" | "color";
export type Rareza = "comun" | "raro" | "epico" | "legendario";

export interface ItemTienda {
  item: ItemComprable | `galeria:${string}`;
  nombre: string;
  descripcion?: string;
  categoria: Categoria;
  // Valor que queda en el perfil (slug de marco, fuente, animación o fondo).
  valor: string;
  costoBase: number;
  colorHex?: string;
  imagen?: string;
  soloPro?: boolean;
  nivelMundo?: string;
}

export function rarezaDe(costo: number): Rareza {
  if (costo >= 5000) return "legendario";
  if (costo >= 2400) return "epico";
  if (costo >= 1400) return "raro";
  return "comun";
}

export const COLOR_RAREZA: Record<Rareza, string> = { comun: "#8892B0", raro: "#4FE0F5", epico: "#B07CFF", legendario: "#FFB627" };
export const NOMBRE_RAREZA: Record<Rareza, string> = { comun: "Común", raro: "Raro", epico: "Épico", legendario: "Legendario" };

const NOMBRE_MUNDO: Record<string, string> = Object.fromEntries(Object.entries(MARCOS_MUNDO).map(([k, v]) => [k, v.nombre]));

export const CATALOGO: ItemTienda[] = [
  { item: "escudo", nombre: "Escudo extra", descripcion: "Un escudo de calibración más para tu próxima partida.", categoria: "utilidad", valor: "escudo", costoBase: COSTOS.escudo },
  { item: "congelamiento", nombre: "Congelar racha", descripcion: "Si un día no practicas, no se corta tu racha.", categoria: "utilidad", valor: "congelamiento", costoBase: COSTOS.congelamiento },
  { item: "boost", nombre: "Boost de Chispas", descripcion: "×1,5 Chispas en tu próxima partida, en cualquier mundo.", categoria: "utilidad", valor: "boost", costoBase: COSTOS.boost },
  { item: "hielo", nombre: "Hielo", descripcion: "Detiene el reloj 10 segundos en una partida. No vale en duelos.", categoria: "utilidad", valor: "hielo", costoBase: COSTOS.hielo },
  { item: "tiempo_extra", nombre: "+3 segundos", descripcion: "Suma 3 segundos al reloj de una partida. No vale en duelos.", categoria: "utilidad", valor: "tiempo_extra", costoBase: COSTOS.tiempo_extra },
  ...RANGOS_ELO.map((r) => ({
    item: `marco_${r.slug}` as ItemComprable,
    nombre: `Marco ${r.nombre}`,
    categoria: "marco" as const,
    valor: r.slug,
    costoBase: COSTOS[`marco_${r.slug}` as ItemComprable],
    colorHex: r.colorHex,
  })),
  ...MARCOS_NEON.map((m) => ({
    item: `marco_${m.slug}` as ItemComprable,
    nombre: `Neón ${m.slug.replace("neon_", "")}`,
    descripcion: "Aro con resplandor que late.",
    categoria: "marco" as const,
    valor: m.slug,
    costoBase: COSTOS[`marco_${m.slug}` as ItemComprable],
    colorHex: m.colorHex,
  })),
  ...Object.keys(MARCOS_MUNDO).map((mundo) => ({
    item: `marco_${mundo}` as ItemComprable,
    nombre: `Marco ${NOMBRE_MUNDO[mundo]}`,
    descripcion: `Requiere nivel 40 en ${NOMBRE_MUNDO[mundo]}.`,
    categoria: "marco_mundo" as const,
    valor: mundo,
    costoBase: COSTOS[`marco_${mundo}` as ItemComprable],
    nivelMundo: mundo,
  })),
  ...(
    [
      ["mono", "Monoespaciada"],
      ["serif", "Elegante"],
      ["manuscrita", "Manuscrita"],
      ["impacto", "Impacto"],
      ["script", "Script"],
      ["futurista", "Futurista"],
      ["urbana", "Urbana"],
      ["elegante", "Caligrafía"],
    ] as const
  ).map(([f, nombre]) => ({ item: `fuente_${f}` as ItemComprable, nombre: `Fuente ${nombre}`, categoria: "fuente" as const, valor: f, costoBase: COSTOS[`fuente_${f}` as ItemComprable] })),
  ...(
    [
      ["ondulante", "Ondulante"],
      ["brillo", "Brillo"],
      ["arcoiris", "Arcoíris"],
      ["neon", "Neón"],
      ["glitch", "Glitch"],
      ["glitch_intenso", "Glitch intenso"],
      ["deconstruccion", "Deconstrucción"],
      ["shuffle", "Shuffle"],
      ["decrypted", "Decrypted"],
      ["prisma", "Prisma"],
    ] as const
  ).map(([a, nombre]) => ({
    item: `animacion_${a}` as ItemComprable,
    nombre,
    descripcion: a === "shuffle" || a === "decrypted" ? "Se anima en tu Placa completa." : undefined,
    categoria: "animacion" as const,
    valor: a,
    costoBase: COSTOS[`animacion_${a}` as ItemComprable],
    soloPro: a === "prisma",
  })),
  ...(
    [
      ["oceano", "Azul"],
      ["bosque", "Verde"],
      ["aurora", "Multicolor"],
      ["dorado", "Dorado"],
      ["nebulosa", "Púrpura"],
      ["prodigio", "Prodigio"],
      ["personalizado", "Tu propia imagen o GIF"],
    ] as const
  ).map(([f, nombre]) => ({
    item: `fondo_${f}` as ItemComprable,
    nombre,
    descripcion: f === "personalizado" ? "Sube una imagen o un GIF de hasta 3 MB." : undefined,
    categoria: "fondo" as const,
    valor: f,
    costoBase: COSTOS[`fondo_${f}` as ItemComprable],
    soloPro: f === "prodigio",
  })),
  { item: "color_nombre_personalizado", nombre: "Color de nombre", descripcion: "Elige el color de tu nombre.", categoria: "color", valor: "color", costoBase: COSTOS.color_nombre_personalizado },
];

export interface EstadoTienda {
  chispas: number;
  plan: string;
  escudos: number;
  congelamientos: number;
  boostActivo: boolean;
  hielos: number;
  tiemposExtra: number;
  fuente: string;
  fuentes: string[];
  marco: string;
  marcos: string[];
  animacion: string;
  animaciones: string[];
  fondo: string;
  fondoUrl: string | null;
  fondos: string[];
  colorDesbloqueado: boolean;
  nivelesMundo: Record<string, number>;
  galeria: { slug: string; nombre: string; url: string; costo: number }[];
  galeriaMia: string[];
}

export async function cargarTienda(userId: string): Promise<EstadoTienda | null> {
  const [{ data: p }, { data: mundos }, { data: galeria }, { data: mia }] = await Promise.all([
    supabase
      .from("profiles")
      .select(
        "puntos_total, plan, escudos_extra_pendientes, congelamientos_disponibles, boost_multiplicador_pendiente, hielos_disponibles, tiempos_extra_disponibles, fuente_nombre, fuentes_desbloqueadas, marco_perfil, marcos_desbloqueados, animacion_nombre, animaciones_desbloqueadas, fondo_perfil, fondo_perfil_url, fondos_desbloqueados, color_nombre_desbloqueado"
      )
      .eq("id", userId)
      .single(),
    supabase.from("world_progress").select("world, nivel_mundo").eq("user_id", userId),
    supabase.from("fondos_galeria").select("slug, nombre, url, costo").eq("activo", true).order("orden"),
    supabase.from("fondos_galeria_desbloqueados").select("slug").eq("user_id", userId),
  ]);
  if (!p) return null;
  const f = p as Record<string, unknown>;
  return {
    chispas: (f.puntos_total as number) ?? 0,
    plan: (f.plan as string) ?? "free",
    escudos: (f.escudos_extra_pendientes as number) ?? 0,
    congelamientos: (f.congelamientos_disponibles as number) ?? 0,
    boostActivo: Number(f.boost_multiplicador_pendiente ?? 1) > 1,
    hielos: (f.hielos_disponibles as number) ?? 0,
    tiemposExtra: (f.tiempos_extra_disponibles as number) ?? 0,
    fuente: (f.fuente_nombre as string) ?? "default",
    fuentes: (f.fuentes_desbloqueadas as string[]) ?? [],
    marco: (f.marco_perfil as string) ?? "ninguno",
    marcos: (f.marcos_desbloqueados as string[]) ?? [],
    animacion: (f.animacion_nombre as string) ?? "ninguna",
    animaciones: (f.animaciones_desbloqueadas as string[]) ?? [],
    fondo: (f.fondo_perfil as string) ?? "ninguno",
    fondoUrl: (f.fondo_perfil_url as string | null) ?? null,
    fondos: (f.fondos_desbloqueados as string[]) ?? [],
    colorDesbloqueado: !!f.color_nombre_desbloqueado,
    nivelesMundo: Object.fromEntries(((mundos as { world: string; nivel_mundo: number }[] | null) ?? []).map((m) => [m.world, m.nivel_mundo])),
    galeria: (galeria as EstadoTienda["galeria"] | null) ?? [],
    galeriaMia: ((mia as { slug: string }[] | null) ?? []).map((g) => g.slug),
  };
}

export function hoyIso() {
  return new Date().toISOString().slice(0, 10);
}

export function descuentoDeHoy() {
  return obtenerDescuentoDelDia(hoyIso());
}

export function precioDe(it: ItemTienda): number {
  if (it.item.startsWith("galeria:")) return it.costoBase;
  return precioConDescuento(it.costoBase, it.item, hoyIso());
}

export function loTiene(it: ItemTienda, e: EstadoTienda): boolean {
  switch (it.categoria) {
    case "marco":
    case "marco_mundo":
      return e.marcos.includes(it.valor);
    case "fuente":
      return e.fuentes.includes(it.valor);
    case "animacion":
      return e.animaciones.includes(it.valor);
    case "fondo":
      return e.fondos.includes(it.valor);
    case "galeria":
      return e.galeriaMia.includes(it.valor);
    case "color":
      return e.colorDesbloqueado;
    default:
      return false;
  }
}

export function loUsa(it: ItemTienda, e: EstadoTienda): boolean {
  switch (it.categoria) {
    case "marco":
    case "marco_mundo":
      return e.marco === it.valor;
    case "fuente":
      return e.fuente === it.valor;
    case "animacion":
      return e.animacion === it.valor;
    case "fondo":
      return e.fondo === it.valor;
    case "galeria":
      return e.fondo === "personalizado" && !!e.fondoUrl && e.galeria.some((g) => g.slug === it.valor && g.url === e.fondoUrl);
    default:
      return false;
  }
}

export function cantidadUtilidad(it: ItemTienda, e: EstadoTienda): number | null {
  switch (it.item) {
    case "escudo":
      return e.escudos;
    case "congelamiento":
      return e.congelamientos;
    case "boost":
      return e.boostActivo ? 1 : 0;
    case "hielo":
      return e.hielos;
    case "tiempo_extra":
      return e.tiemposExtra;
    default:
      return null;
  }
}

export async function comprar(it: ItemTienda): Promise<number> {
  if (it.item.startsWith("galeria:")) {
    const { data, error } = await supabase.rpc("comprar_fondo_galeria", { p_slug: it.valor });
    if (error) throw error;
    return (data as { puntos_total: number }[])[0].puntos_total;
  }
  const { data, error } = await supabase.rpc("comprar_item_tienda", { p_item: it.item, p_costo: precioDe(it) });
  if (error) throw error;
  return (data as { puntos_total: number }[])[0].puntos_total;
}

export async function equipar(it: ItemTienda | null, categoria: Categoria, valorNinguno?: string) {
  const valor = it?.valor ?? valorNinguno;
  let r;
  switch (categoria) {
    case "marco":
    case "marco_mundo":
      r = await supabase.rpc("elegir_marco_perfil", { p_marco: valor ?? "ninguno" });
      break;
    case "fuente":
      r = await supabase.rpc("elegir_fuente_nombre", { p_fuente: valor ?? "default" });
      break;
    case "animacion":
      r = await supabase.rpc("elegir_animacion_nombre", { p_animacion: valor ?? "ninguna" });
      break;
    case "fondo":
      r = await supabase.rpc("elegir_fondo_perfil", { p_fondo: valor ?? "ninguno" });
      break;
    case "galeria":
      r = await supabase.rpc("elegir_fondo_galeria", { p_slug: valor });
      break;
    default:
      return;
  }
  if (r.error) throw r.error;
}

export async function guardarColorNombre(colorHex: string | null) {
  const { error } = await supabase.rpc("guardar_color_nombre", { p_color: colorHex });
  if (error) throw error;
}

// ---------- Subir avatar / fondo (mismos buckets que la web) ----------

const TIPOS: Record<string, string> = { jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", webp: "image/webp", gif: "image/gif" };

async function elegirImagen(maxBytes: number): Promise<{ bytes: ArrayBuffer; ext: string; tipo: string } | null> {
  const r = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], allowsEditing: false, quality: 0.9 });
  if (r.canceled || !r.assets[0]) return null;
  const a = r.assets[0];
  const ext = (a.fileName?.split(".").pop() ?? a.uri.split(".").pop() ?? "jpg").toLowerCase().split("?")[0];
  const tipo = a.mimeType ?? TIPOS[ext] ?? "image/jpeg";
  if (!Object.values(TIPOS).includes(tipo)) throw new Error("Usa una imagen PNG, JPG, WEBP o GIF.");
  if (a.fileSize && a.fileSize > maxBytes) throw new Error(`La imagen pesa más de ${Math.round(maxBytes / 1_000_000)} MB.`);
  const bytes = await new File(a.uri).arrayBuffer();
  if (bytes.byteLength > maxBytes) throw new Error(`La imagen pesa más de ${Math.round(maxBytes / 1_000_000)} MB.`);
  return { bytes, ext: ext === "jpeg" ? "jpg" : ext, tipo };
}

export async function subirAvatar(userId: string): Promise<string | null> {
  const img = await elegirImagen(2_000_000);
  if (!img) return null;
  const ruta = `${userId}/foto.${img.ext}`;
  const { error } = await supabase.storage.from("avatares").upload(ruta, img.bytes, { upsert: true, cacheControl: "3600", contentType: img.tipo });
  if (error) throw new Error("No se pudo subir la imagen.");
  const url = `${supabase.storage.from("avatares").getPublicUrl(ruta).data.publicUrl}?v=${Date.now()}`;
  const { error: e2 } = await supabase.from("profiles").update({ avatar_url: url }).eq("id", userId);
  if (e2) throw new Error("No se pudo guardar tu avatar.");
  return url;
}

export async function subirFondo(userId: string): Promise<string | null> {
  const img = await elegirImagen(3_000_000);
  if (!img) return null;
  const ruta = `${userId}/fondo.${img.ext}`;
  const { error } = await supabase.storage.from("fondos-perfil").upload(ruta, img.bytes, { upsert: true, cacheControl: "3600", contentType: img.tipo });
  if (error) throw new Error("No se pudo subir la imagen.");
  const url = `${supabase.storage.from("fondos-perfil").getPublicUrl(ruta).data.publicUrl}?v=${Date.now()}`;
  const { error: e2 } = await supabase.rpc("guardar_fondo_perfil_url", { p_url: url });
  if (e2) throw e2;
  return url;
}

export async function cambiarNombre(nombre: string) {
  const { error } = await supabase.rpc("cambiar_nombre_usuario", { p_nombre: nombre.trim() });
  if (error) throw error;
}
