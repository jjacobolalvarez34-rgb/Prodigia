// Editor de la placa en la web (2026-10-30): qué se puede poner en cada sección,
// qué tiene el jugador y, si no lo tiene, cómo se consigue. Lógica pura (sin red ni
// React), espejo de lo que muestra el editor de la app (mobile/src/app/editar-placa.tsx).
//
// Regla de eventos: lo que no se vende (piezas de eventos, de colección, marcos de
// otros meses, el Pionero) solo aparece si ya es tuyo, para no mostrar nada de un
// evento antes de su fecha.
import { MARCOS_MUNDO, MARCOS_NEON, RANGOS_CON_MARCO } from "@/types/database";
import { CATALOGO_NUEVO, CIUDADES, ciudadDeMarcoColeccion, MARCOS_ESPECIALES, temporadaActual, type ItemCatalogo } from "@/lib/recompensas/catalogo";
import { FUENTES_NOMBRE_NUEVAS, FUENTES_PUNTOS } from "@/lib/recompensas/catalogoAmpliado";
import { COSTOS } from "@/lib/tienda/costos";
import { precioConDescuento } from "@/lib/descuentoDiario";
import { precioEnCometas } from "@/lib/recompensas/catalogo";
import type { PuestoId } from "@/lib/tienda/bazar";
import type { CosmeticosNuevos } from "@/lib/recompensas/api";

export type SeccionPlaca = "fondo" | "marco" | "fuente" | "animacion" | "puntos" | "titulo" | "ciudad" | "estela" | "efecto" | "sonido";

export type GrupoOpcion = "base" | "rango" | "mundo" | "colores" | "especial" | "ciudades" | "galeria" | "clasicas" | "nuevas" | "ganados" | "tienda";

export type ComoConseguir =
  | { tipo: "tienda"; precio: number; moneda: "chispas" | "cometas"; puesto: PuestoId; item: string }
  | { tipo: "pro"; puesto: PuestoId; item: string }
  | { tipo: "nivelMundo"; mundo: string; nivel: number; requerido: number; puesto: PuestoId; item: string };

export interface OpcionPlaca {
  // Clave única dentro de la sección.
  id: string;
  seccion: SeccionPlaca;
  // Lo que queda en el perfil (slug); para la galería, el slug de la galería.
  valor: string;
  nombre: string;
  grupo: GrupoOpcion;
  tiene: boolean;
  como?: ComoConseguir;
  // Solo galería y fondo propio: la imagen.
  url?: string | null;
  galeria?: boolean;
}

export interface EstadoPlaca {
  marco: string;
  marcos: string[];
  fuente: string;
  fuentes: string[];
  animacion: string;
  animaciones: string[];
  fondo: string;
  fondoUrl: string | null;
  fondos: string[];
  colorNombre: string | null;
  colorDesbloqueado: boolean;
  titulo: string | null;
  titulos: { slug: string; nombre: string }[];
  fuentePuntos: string;
  fuentesPuntos: string[];
  cos: CosmeticosNuevos;
  galeria: { slug: string; nombre: string; url: string; costo: number }[];
  galeriaMia: string[];
  nivelesMundo: Record<string, number>;
  esPro: boolean;
}

// Nombres que salen de los textos (es/en) y no del catálogo.
export interface NombresPlaca {
  rango: (slug: string) => string;
  neon: (slug: string) => string;
  mundo: (slug: string) => string;
  fuente: (valor: string) => string;
  animacion: (valor: string) => string;
  fondo: (valor: string) => string;
  ninguno: (seccion: SeccionPlaca) => string;
}

export const NIVEL_MARCO_MUNDO = 40;

export const PUESTO_DE_SECCION: Record<SeccionPlaca, PuestoId> = {
  marco: "herreria",
  fondo: "estudio",
  ciudad: "estudio",
  fuente: "caligrafia",
  animacion: "caligrafia",
  puntos: "caligrafia",
  titulo: "caligrafia",
  estela: "pirotecnia",
  efecto: "pirotecnia",
  sonido: "musica",
};

// Valor de «sin nada» de cada sección (null = se quita).
export const VALOR_BASE: Record<SeccionPlaca, string | null> = {
  marco: "ninguno",
  fondo: "ninguno",
  fuente: "default",
  animacion: "ninguna",
  puntos: "clasica",
  titulo: null,
  ciudad: null,
  estela: "clasica",
  efecto: "chispas",
  sonido: "clasico",
};

// Enlace a la tienda para conseguir algo (el puesto y, si se puede, el artículo).
export function enlaceTienda(como: ComoConseguir | undefined, seccion: SeccionPlaca): string {
  if (!como) return `/tienda?puesto=${PUESTO_DE_SECCION[seccion]}`;
  if (como.tipo === "pro") return "/pro";
  const item = CATALOGO_NUEVO.some((x) => x.item === como.item && x.vendible) ? `&item=${encodeURIComponent(como.item)}` : "";
  return `/tienda?puesto=${como.puesto}${item}`;
}

function sinPrefijo(nombre: string, ...prefijos: string[]): string {
  for (const p of prefijos) if (nombre.startsWith(p)) return nombre.slice(p.length);
  return nombre;
}

// Precio de algo de antes (COSTOS) con la oferta del día, o en Cometas si es legendario.
function comoLegado(item: string, seccion: SeccionPlaca, hoy: string): ComoConseguir {
  const cometas = precioEnCometas(item);
  if (cometas != null) return { tipo: "tienda", precio: cometas, moneda: "cometas", puesto: PUESTO_DE_SECCION[seccion], item };
  const base = (COSTOS as Record<string, number>)[item] ?? 0;
  return { tipo: "tienda", precio: precioConDescuento(base, item, hoy), moneda: "chispas", puesto: PUESTO_DE_SECCION[seccion], item };
}

function comoNuevo(x: ItemCatalogo, seccion: SeccionPlaca): ComoConseguir {
  if (x.precioCometas != null) return { tipo: "tienda", precio: x.precioCometas, moneda: "cometas", puesto: PUESTO_DE_SECCION[seccion], item: x.item };
  return { tipo: "tienda", precio: x.precio, moneda: "chispas", puesto: PUESTO_DE_SECCION[seccion], item: x.item };
}

// ¿Se vende hoy? (los marcos de temporada, solo el del mes).
function seVendeHoy(x: ItemCatalogo, hoy: string): boolean {
  if (!x.vendible) return false;
  return x.temporada == null || x.temporada === temporadaActual(new Date(`${hoy}T12:00:00Z`));
}

// Agrega lo que el jugador tiene y ninguna lista conoce (por si la base trae algo nuevo).
function conSobrantes(lista: OpcionPlaca[], mios: string[], seccion: SeccionPlaca, nombre: (v: string) => string): OpcionPlaca[] {
  const vistos = new Set(lista.map((o) => o.valor));
  const extra = mios.filter((v) => v && !vistos.has(v) && v !== VALOR_BASE[seccion]).map((v) => ({ id: v, seccion, valor: v, nombre: nombre(v), grupo: "especial" as const, tiene: true }));
  return [...lista, ...extra];
}

function nombreCatalogo(categoria: string, valor: string): string | null {
  return CATALOGO_NUEVO.find((x) => x.categoria === categoria && x.valor === valor)?.nombre ?? null;
}

export function opcionesMarco(e: EstadoPlaca, n: NombresPlaca, hoy: string): OpcionPlaca[] {
  const tiene = (v: string) => e.marcos.includes(v);
  const lista: OpcionPlaca[] = [{ id: "ninguno", seccion: "marco", valor: "ninguno", nombre: n.ninguno("marco"), grupo: "base", tiene: true }];
  for (const r of RANGOS_CON_MARCO) {
    lista.push({ id: r.slug, seccion: "marco", valor: r.slug, nombre: n.rango(r.slug), grupo: "rango", tiene: tiene(r.slug), como: comoLegado(`marco_${r.slug}`, "marco", hoy) });
  }
  for (const m of MARCOS_NEON) {
    lista.push({ id: m.slug, seccion: "marco", valor: m.slug, nombre: n.neon(m.slug), grupo: "rango", tiene: tiene(m.slug), como: comoLegado(`marco_${m.slug}`, "marco", hoy) });
  }
  for (const mundo of Object.keys(MARCOS_MUNDO)) {
    const nivel = e.nivelesMundo[mundo] ?? 0;
    const como: ComoConseguir =
      nivel >= NIVEL_MARCO_MUNDO ? comoLegado(`marco_${mundo}`, "marco", hoy) : { tipo: "nivelMundo", mundo, nivel, requerido: NIVEL_MARCO_MUNDO, puesto: "herreria", item: `marco_${mundo}` };
    lista.push({ id: mundo, seccion: "marco", valor: mundo, nombre: n.mundo(mundo), grupo: "mundo", tiene: tiene(mundo), como });
  }
  for (const x of CATALOGO_NUEVO.filter((c) => c.categoria === "marco")) {
    const mio = tiene(x.valor);
    if (!mio && !seVendeHoy(x, hoy)) continue;
    const grupo: GrupoOpcion = x.valor.startsWith("estilo_") ? "colores" : "especial";
    lista.push({ id: x.valor, seccion: "marco", valor: x.valor, nombre: sinPrefijo(x.nombre, "Marco "), grupo, tiene: mio, como: comoNuevo(x, "marco") });
  }
  // Pionero y los de colección: solo si son tuyos.
  for (const m of MARCOS_ESPECIALES) if (tiene(m.slug) && !lista.some((o) => o.valor === m.slug)) lista.push({ id: m.slug, seccion: "marco", valor: m.slug, nombre: m.nombre, grupo: "especial", tiene: true });
  return conSobrantes(lista, e.marcos, "marco", (v) => {
    const c = ciudadDeMarcoColeccion(v);
    return c ? c.nombre : nombreCatalogo("marco", v)?.replace(/^Marco /, "") ?? v.replace(/_/g, " ");
  });
}

const FONDOS_CLASICOS = ["oceano", "bosque", "aurora", "dorado", "nebulosa", "prodigio"] as const;

export function opcionesFondo(e: EstadoPlaca, n: NombresPlaca, hoy: string): OpcionPlaca[] {
  const tiene = (v: string) => e.fondos.includes(v);
  const lista: OpcionPlaca[] = [{ id: "ninguno", seccion: "fondo", valor: "ninguno", nombre: n.ninguno("fondo"), grupo: "base", tiene: true }];
  for (const f of FONDOS_CLASICOS) {
    const mio = tiene(f);
    const como: ComoConseguir = f === "prodigio" && !e.esPro ? { tipo: "pro", puesto: "estudio", item: `fondo_${f}` } : comoLegado(`fondo_${f}`, "fondo", hoy);
    lista.push({ id: f, seccion: "fondo", valor: f, nombre: n.fondo(f), grupo: "clasicas", tiene: mio, como });
  }
  for (const x of CATALOGO_NUEVO.filter((c) => c.categoria === "fondo")) {
    const mio = tiene(x.valor);
    if (!mio && !seVendeHoy(x, hoy)) continue;
    const grupo: GrupoOpcion = x.valor.startsWith("ciudad_") ? "ciudades" : x.vendible ? "clasicas" : "especial";
    lista.push({ id: x.valor, seccion: "fondo", valor: x.valor, nombre: sinPrefijo(x.nombre, "Fondo "), grupo, tiene: mio, como: comoNuevo(x, "fondo") });
  }
  // Tu propia imagen o GIF (se sube aparte).
  lista.push({ id: "personalizado", seccion: "fondo", valor: "personalizado", nombre: n.fondo("personalizado"), grupo: "galeria", tiene: tiene("personalizado"), como: comoLegado("fondo_personalizado", "fondo", hoy), url: null });
  for (const g of e.galeria) {
    const mio = e.galeriaMia.includes(g.slug);
    lista.push({
      id: `galeria:${g.slug}`,
      seccion: "fondo",
      valor: g.slug,
      nombre: g.nombre,
      grupo: "galeria",
      tiene: mio,
      galeria: true,
      url: g.url,
      como: { tipo: "tienda", precio: g.costo, moneda: "chispas", puesto: "estudio", item: `galeria:${g.slug}` },
    });
  }
  return conSobrantes(lista, e.fondos, "fondo", (v) => nombreCatalogo("fondo", v)?.replace(/^Fondo /, "") ?? v.replace(/_/g, " "));
}

const FUENTES_CLASICAS = ["mono", "serif", "manuscrita", "impacto", "script", "futurista", "urbana", "elegante"] as const;

export function opcionesFuente(e: EstadoPlaca, n: NombresPlaca, hoy: string): OpcionPlaca[] {
  const tiene = (v: string) => e.fuentes.includes(v);
  const lista: OpcionPlaca[] = [{ id: "default", seccion: "fuente", valor: "default", nombre: n.ninguno("fuente"), grupo: "base", tiene: true }];
  for (const f of FUENTES_CLASICAS) lista.push({ id: f, seccion: "fuente", valor: f, nombre: n.fuente(f), grupo: "clasicas", tiene: tiene(f), como: comoLegado(`fuente_${f}`, "fuente", hoy) });
  for (const f of FUENTES_NOMBRE_NUEVAS) {
    const x = CATALOGO_NUEVO.find((c) => c.item === `fuente_${f.valor}`);
    lista.push({ id: f.valor, seccion: "fuente", valor: f.valor, nombre: f.nombre, grupo: "nuevas", tiene: tiene(f.valor), como: x ? comoNuevo(x, "fuente") : comoLegado(`fuente_${f.valor}`, "fuente", hoy) });
  }
  return conSobrantes(lista, e.fuentes, "fuente", (v) => v);
}

const ANIMACIONES = ["ondulante", "brillo", "arcoiris", "neon", "glitch", "glitch_intenso", "deconstruccion", "shuffle", "decrypted", "prisma"] as const;

export function opcionesAnimacion(e: EstadoPlaca, n: NombresPlaca, hoy: string): OpcionPlaca[] {
  const lista: OpcionPlaca[] = [{ id: "ninguna", seccion: "animacion", valor: "ninguna", nombre: n.ninguno("animacion"), grupo: "base", tiene: true }];
  for (const a of ANIMACIONES) {
    const mio = e.animaciones.includes(a);
    const como: ComoConseguir = a === "prisma" && !e.esPro ? { tipo: "pro", puesto: "caligrafia", item: `animacion_${a}` } : comoLegado(`animacion_${a}`, "animacion", hoy);
    lista.push({ id: a, seccion: "animacion", valor: a, nombre: n.animacion(a), grupo: "clasicas", tiene: mio, como });
  }
  return lista;
}

export function opcionesPuntos(e: EstadoPlaca, n: NombresPlaca): OpcionPlaca[] {
  const lista: OpcionPlaca[] = [{ id: "clasica", seccion: "puntos", valor: "clasica", nombre: n.ninguno("puntos"), grupo: "base", tiene: true }];
  for (const f of FUENTES_PUNTOS) {
    if (f.valor === "clasica") continue;
    const x = CATALOGO_NUEVO.find((c) => c.item === `puntos_${f.valor}`);
    lista.push({ id: f.valor, seccion: "puntos", valor: f.valor, nombre: f.nombre, grupo: "nuevas", tiene: e.fuentesPuntos.includes(f.valor), como: x ? comoNuevo(x, "puntos") : undefined });
  }
  return lista;
}

export function opcionesTitulo(e: EstadoPlaca, n: NombresPlaca, hoy: string): OpcionPlaca[] {
  const lista: OpcionPlaca[] = [{ id: "ninguno", seccion: "titulo", valor: "", nombre: n.ninguno("titulo"), grupo: "base", tiene: true }];
  const mios = new Set(e.titulos.map((t) => t.slug));
  for (const t of e.titulos) lista.push({ id: t.slug, seccion: "titulo", valor: t.slug, nombre: t.nombre, grupo: "ganados", tiene: true });
  for (const x of CATALOGO_NUEVO.filter((c) => c.categoria === "titulo" && seVendeHoy(c, hoy) && !mios.has(c.valor))) {
    lista.push({ id: x.valor, seccion: "titulo", valor: x.valor, nombre: x.nombre, grupo: "tienda", tiene: false, como: comoNuevo(x, "titulo") });
  }
  return lista;
}

export function opcionesCiudad(e: EstadoPlaca, n: NombresPlaca): OpcionPlaca[] {
  const lista: OpcionPlaca[] = [{ id: "ninguna", seccion: "ciudad", valor: "", nombre: n.ninguno("ciudad"), grupo: "base", tiene: true }];
  for (const c of CIUDADES) {
    const x = CATALOGO_NUEVO.find((i) => i.item === `ciudad_placa_${c.slug}`);
    const mio = e.cos.ciudadesPlaca.includes(c.slug);
    if (!mio && !x?.vendible) continue;
    lista.push({ id: c.slug, seccion: "ciudad", valor: c.slug, nombre: c.nombre, grupo: "ciudades", tiene: mio, como: x ? comoNuevo(x, "ciudad") : undefined });
  }
  return lista;
}

export function opcionesPartida(seccion: "estela" | "efecto" | "sonido", e: EstadoPlaca, n: NombresPlaca, hoy: string): OpcionPlaca[] {
  const mios = seccion === "estela" ? e.cos.estelas : seccion === "efecto" ? e.cos.efectos : e.cos.sonidos;
  const base = VALOR_BASE[seccion] as string;
  const lista: OpcionPlaca[] = [{ id: base, seccion, valor: base, nombre: n.ninguno(seccion), grupo: "base", tiene: true }];
  for (const x of CATALOGO_NUEVO.filter((c) => c.categoria === seccion)) {
    const mio = mios.includes(x.valor);
    if (!mio && !seVendeHoy(x, hoy)) continue;
    if (lista.some((o) => o.valor === x.valor)) continue;
    lista.push({ id: x.valor, seccion, valor: x.valor, nombre: sinPrefijo(x.nombre, "Estela ", "Sonido "), grupo: x.vendible ? "tienda" : "especial", tiene: mio, como: comoNuevo(x, seccion) });
  }
  return conSobrantes(lista, mios, seccion, (v) => nombreCatalogo(seccion, v) ?? v.replace(/_/g, " "));
}

export function opcionesDe(seccion: SeccionPlaca, e: EstadoPlaca, n: NombresPlaca, hoy: string): OpcionPlaca[] {
  switch (seccion) {
    case "marco":
      return opcionesMarco(e, n, hoy);
    case "fondo":
      return opcionesFondo(e, n, hoy);
    case "fuente":
      return opcionesFuente(e, n, hoy);
    case "animacion":
      return opcionesAnimacion(e, n, hoy);
    case "puntos":
      return opcionesPuntos(e, n);
    case "titulo":
      return opcionesTitulo(e, n, hoy);
    case "ciudad":
      return opcionesCiudad(e, n);
    default:
      return opcionesPartida(seccion, e, n, hoy);
  }
}

// ¿Está puesta esta opción? (la galería y el fondo propio comparten fondo_perfil = personalizado).
export function estaPuesta(o: OpcionPlaca, e: EstadoPlaca): boolean {
  switch (o.seccion) {
    case "marco":
      return e.marco === o.valor;
    case "fondo": {
      if (o.galeria) return e.fondo === "personalizado" && !!e.fondoUrl && e.fondoUrl === o.url;
      if (o.valor === "personalizado") return e.fondo === "personalizado" && !e.galeria.some((g) => g.url === e.fondoUrl);
      return e.fondo === o.valor;
    }
    case "fuente":
      return e.fuente === o.valor;
    case "animacion":
      return e.animacion === o.valor;
    case "puntos":
      return e.fuentePuntos === o.valor;
    case "titulo":
      return (e.titulo ?? "") === o.valor;
    case "ciudad":
      return (e.cos.ciudadPlaca ?? "") === o.valor;
    case "estela":
      return e.cos.estela === o.valor;
    case "efecto":
      return e.cos.efecto === o.valor;
    case "sonido":
      return e.cos.sonido === o.valor;
  }
}

// Cuánto de cada sección es tuyo (sin contar el «sin nada»).
export function conteo(lista: OpcionPlaca[]): { mios: number; total: number } {
  const reales = lista.filter((o) => o.grupo !== "base");
  return { mios: reales.filter((o) => o.tiene).length, total: reales.length };
}
