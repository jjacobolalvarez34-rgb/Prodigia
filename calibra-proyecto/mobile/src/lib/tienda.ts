// Tienda de la app: el mismo catálogo y los mismos precios que la web
// (src/lib/tienda/costos.ts + descuento del día), comprados con la misma RPC
// (comprar_item_tienda revalida precio, nivel y Pro en el servidor). Sin Trastienda
// ni apuestas (PROD-01) y sin compra de Chispas con dinero (llega con Play Billing).
import { File } from "expo-file-system";
import { ImageManipulator, SaveFormat } from "expo-image-manipulator";
import * as ImagePicker from "expo-image-picker";
import { comprimirGif } from "@/lib/imagenes/comprimirGif";
import { mostrarAviso } from "~/ui/Aviso";
import { obtenerDescuentoDelDia, precioConDescuento } from "@/lib/descuentoDiario";
import { COSTOS, type ItemComprable } from "@/lib/tienda/costos";
import { COLUMNAS_COSMETICOS_NUEVOS, cosmeticosDesdeFila, equiparCosmetico, type CosmeticosNuevos } from "@/lib/recompensas/api";
import { CATALOGO_NUEVO, MARCOS_ESPECIALES, PAQUETES, temporadaActual, UTILIDADES_NUEVAS, type Rareza as RarezaNueva } from "@/lib/recompensas/catalogo";
import { MARCOS_MUNDO, MARCOS_NEON, RANGOS_ELO } from "@/types/database";
import { supabase } from "./supabase";

export { COSTOS, type ItemComprable };

export type Categoria =
  | "utilidad"
  | "marco"
  | "marco_mundo"
  | "fuente"
  | "animacion"
  | "fondo"
  | "galeria"
  | "color"
  // Tienda ampliada (0248)
  | "estela"
  | "efecto"
  | "sonido"
  | "emote"
  | "ciudad_placa"
  | "titulo"
  | "paquete";
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
  // Tienda ampliada: rareza fija del catálogo, mes del marco de temporada y
  // contenido de un paquete.
  rareza?: Rareza;
  temporada?: number;
  items?: string[];
  // No se vende: solo aparece si ya lo tienes (el marco «Pionero» del Kit del Pionero).
  especial?: boolean;
}

export function rarezaDeItem(it: ItemTienda): Rareza {
  return it.rareza ?? rarezaDe(it.costoBase);
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
  ...MARCOS_ESPECIALES.map((m) => ({
    item: `marco_${m.slug}` as ItemComprable,
    nombre: `Marco ${m.nombre}`,
    descripcion: "Exclusivo del Kit del Pionero: solo se consigue entrando a la app.",
    categoria: "marco" as const,
    valor: m.slug,
    costoBase: 0,
    rareza: "legendario" as const,
    especial: true,
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
  // ---------- Tienda ampliada (0248, catálogo en @/lib/recompensas/catalogo) ----------
  ...UTILIDADES_NUEVAS.map((u) => ({ item: u.item as ItemComprable, nombre: u.nombre, descripcion: u.descripcion, categoria: "utilidad" as const, valor: u.item, costoBase: u.precio })),
  ...CATALOGO_NUEVO.filter((x) => x.vendible).map((x) => ({
    item: x.item as ItemComprable,
    nombre: x.nombre,
    descripcion:
      x.temporada != null
        ? "Marco de temporada: solo se vende este mes."
        : x.categoria === "ciudad_placa"
          ? "Un skyline de la ciudad detrás de tu avatar, en tu Placa."
          : x.categoria === "emote"
            ? "Para mandarle a tu rival en los duelos."
            : x.categoria === "titulo"
              ? "Título cosmético para tu Placa."
              : undefined,
    categoria: (x.categoria === "marco" ? "marco" : x.categoria) as Categoria,
    valor: x.valor,
    costoBase: x.precio,
    rareza: x.rareza as RarezaNueva,
    temporada: x.temporada,
  })),
  ...PAQUETES.map((p) => ({
    item: p.item as ItemComprable,
    nombre: p.nombre,
    descripcion: "Todo junto, 25 % más barato que por separado.",
    categoria: "paquete" as const,
    valor: p.item,
    costoBase: p.precio,
    items: p.items,
  })),
];

// El marco de temporada que se vende este mes (los otros 3 no aparecen).
export function aLaVenta(it: ItemTienda): boolean {
  return it.temporada == null || it.temporada === temporadaActual();
}

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
  // Tienda ampliada: lo equipado y desbloqueado de las categorías nuevas y los títulos.
  cos: CosmeticosNuevos;
  titulos: string[];
  tituloActivo: string | null;
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
  // Aparte: si la base todavía no tiene 0248, el resto de la tienda sigue andando.
  const [{ data: nuevos }, { data: titulos }, { data: activo }] = await Promise.all([
    supabase.from("profiles").select(COLUMNAS_COSMETICOS_NUEVOS).eq("id", userId).maybeSingle(),
    supabase.from("titulos_usuario").select("slug").eq("user_id", userId),
    supabase.from("profiles").select("titulo_activo").eq("id", userId).maybeSingle(),
  ]);
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
    cos: cosmeticosDesdeFila(nuevos as Record<string, unknown> | null),
    titulos: ((titulos as { slug: string }[] | null) ?? []).map((t) => t.slug),
    tituloActivo: (activo as { titulo_activo: string | null } | null)?.titulo_activo ?? null,
  };
}

// ¿Tengo este ítem? (por su slug de la tienda; lo usan los paquetes).
export function tieneSlug(slug: string, e: EstadoTienda): boolean {
  const it = CATALOGO.find((x) => x.item === slug);
  return it ? loTiene(it, e) : false;
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
    case "estela":
      return e.cos.estelas.includes(it.valor);
    case "efecto":
      return e.cos.efectos.includes(it.valor);
    case "sonido":
      return e.cos.sonidos.includes(it.valor);
    case "emote":
      return e.cos.emotes.includes(it.valor);
    case "ciudad_placa":
      return e.cos.ciudadesPlaca.includes(it.valor);
    case "titulo":
      return e.titulos.includes(it.valor);
    case "paquete":
      return (it.items ?? []).every((s) => tieneSlug(s, e));
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
    case "estela":
      return e.cos.estela === it.valor;
    case "efecto":
      return e.cos.efecto === it.valor;
    case "sonido":
      return e.cos.sonido === it.valor;
    case "ciudad_placa":
      return e.cos.ciudadPlaca === it.valor;
    case "titulo":
      return e.tituloActivo === it.valor;
    default:
      return false;
  }
}

export function cantidadUtilidad(it: ItemTienda, e: EstadoTienda): number | null {
  switch (it.item as string) {
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
    case "pista":
      return e.cos.pistas;
    case "segunda_oportunidad":
      return e.cos.segundas;
    case "cofre_hielos":
      return e.hielos;
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
    case "estela":
    case "efecto":
    case "sonido":
      await equiparCosmetico(supabase, categoria, valor ?? (categoria === "estela" ? "clasica" : categoria === "efecto" ? "chispas" : "clasico"));
      return;
    case "ciudad_placa":
      await equiparCosmetico(supabase, "ciudad_placa", it?.valor ?? null);
      return;
    case "titulo":
      if (!valor) return;
      r = await supabase.rpc("elegir_titulo_activo", { p_slug: valor });
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

// Si la imagen pesa más que el límite del bucket, se achica en el teléfono antes de
// subirla (pedido del usuario, 2026-10-06) en vez de rechazarla: los GIF con
// comprimirGif (siguen animados, mismo código que la web) y las fotos con
// expo-image-manipulator (más chicas y en WEBP). Lo que ya cumple se sube tal cual.
async function achicarFoto(uri: string, ancho: number, alto: number, maxBytes: number, maxLado: number): Promise<ArrayBuffer | null> {
  const escala0 = Math.min(1, maxLado / Math.max(ancho || maxLado, alto || maxLado));
  for (const factor of [1, 0.8, 0.62, 0.48, 0.36]) {
    const w = Math.max(1, Math.round((ancho || maxLado) * escala0 * factor));
    for (const calidad of [0.85, 0.72, 0.6]) {
      const ctx = ImageManipulator.manipulate(uri);
      ctx.resize({ width: w });
      const imagen = await ctx.renderAsync();
      const r = await imagen.saveAsync({ compress: calidad, format: SaveFormat.WEBP });
      const bytes = await new File(r.uri).arrayBuffer();
      if (bytes.byteLength <= maxBytes) return bytes;
    }
  }
  return null;
}

async function elegirImagen(maxBytes: number, maxLado: number): Promise<{ bytes: ArrayBuffer; ext: string; tipo: string } | null> {
  const r = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], allowsEditing: false, quality: 0.9 });
  if (r.canceled || !r.assets[0]) return null;
  const a = r.assets[0];
  const ext = (a.fileName?.split(".").pop() ?? a.uri.split(".").pop() ?? "jpg").toLowerCase().split("?")[0];
  const tipo = a.mimeType ?? TIPOS[ext] ?? "image/jpeg";
  if (!Object.values(TIPOS).includes(tipo)) throw new Error("Usa una imagen PNG, JPG, WEBP o GIF.");
  const bytes = await new File(a.uri).arrayBuffer();
  if (bytes.byteLength <= maxBytes) return { bytes, ext: ext === "jpeg" ? "jpg" : ext, tipo };

  const limite = `${Math.round(maxBytes / 1_000_000)} MB`;
  mostrarAviso("Tu imagen pesa mucho: la estamos achicando…", "info");
  // Un respiro para que el aviso se dibuje antes del trabajo pesado.
  await new Promise((ok) => setTimeout(ok, 50));
  if (tipo === "image/gif") {
    const g = comprimirGif(bytes, maxBytes, maxLado);
    if (!g) throw new Error(`No pudimos achicar el GIF hasta ${limite}. Prueba con otro.`);
    return { bytes: g.bytes.buffer.slice(g.bytes.byteOffset, g.bytes.byteOffset + g.bytes.byteLength) as ArrayBuffer, ext: "gif", tipo: "image/gif" };
  }
  const chica = await achicarFoto(a.uri, a.width, a.height, maxBytes, maxLado);
  if (!chica) throw new Error(`No pudimos achicar la imagen hasta ${limite}. Prueba con otra.`);
  return { bytes: chica, ext: "webp", tipo: "image/webp" };
}

export async function subirAvatar(userId: string): Promise<string | null> {
  const img = await elegirImagen(2_000_000, 512);
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
  const img = await elegirImagen(3_000_000, 1600);
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
