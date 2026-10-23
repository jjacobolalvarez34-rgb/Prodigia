"use client";

import { olvidarFuentePuntos } from "@/components/recompensas/PuntosConFuente";
import EtiquetaNuevo from "@/components/EtiquetaNuevo";
import { esNuevo } from "@/lib/recompensas/novedades";
import { marcarNuevoVisto, useNuevoVisto } from "@/lib/recompensas/novedadesWeb";
import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { probarPaqueteAcierto, reproducirTono } from "@/lib/sonido";
import { CATALOGO_NUEVO, COLOR_RAREZA, diasHastaFinDeMes, PAQUETES, temporadaActual, UTILIDADES_NUEVAS, type Rareza } from "@/lib/recompensas/catalogo";
import { comprarTemaApp, cosmeticosDesdeFila, COLUMNAS_COSMETICOS_NUEVOS, equiparCosmetico, estadoTemasApp, mensajeError, ponerTemaApp, preciosPaquetesParaMi, SIN_TEMAS_APP, type CosmeticosNuevos, type EstadoTemasApp } from "@/lib/recompensas/api";
import { refrescarCosmeticosWeb } from "@/lib/recompensas/cosmeticosWeb";
import VistaCosmetico from "@/components/recompensas/VistaCosmetico";
import IconoCometa from "@/components/IconoCometa";
import { precioTemaCometas, TEMA_CLASICO, TEMAS_APP, type TemaApp } from "@/lib/recompensas/temas";
import { aplicarTemaAppWeb } from "@/lib/recompensas/temaAppWeb";
import MiniTemaApp from "@/components/recompensas/MiniTemaApp";
import { puestoDe, type PuestoId } from "@/lib/tienda/bazar";
import IlustracionPaquete from "@/components/tienda/IlustracionPaquete";
import IconoTrazo from "@/components/IconoTrazo";
import { useCheckout } from "@/components/pagos/Vitrina";
import { precioTexto, precioUsdPaquete, precioUsdParcial } from "@/lib/pagos/vitrina";

// Tienda ampliada (0248) en la web: la misma vidriera que las pestañas nuevas del
// Bazar de la app (paquetes, partida, Placa, duelos, marco del mes y ayudas). La
// compra pasa por /api/tienda/comprar (precio del catálogo compartido) y la base
// revalida todo. Avisa la compra con el evento "prodigia:chispas" para que el saldo
// de arriba (TiendaClient) se actualice.

type Pestana = "paquetes" | "temas" | "marcos" | "partida" | "placa" | "duelos" | "temporada" | "utilidades" | "pirotecnia" | "musica" | "titulos" | "nombre" | "puntos";
const PESTANAS: Pestana[] = ["paquetes", "temas", "marcos", "partida", "placa", "duelos", "temporada", "utilidades", "nombre", "puntos"];

interface Item {
  item: string;
  categoria: string;
  valor: string;
  nombre: string;
  precio: number;
  rareza: Rareza;
  temporada?: number;
  items?: string[];
  // Lo legendario se compra con Cometas (0280).
  precioCometas?: number;
}

const ITEMS: Item[] = [
  // Los marcos de rango y de ciudad se venden arriba (TiendaClient); acá, los de temporada y los de colores (0275).
  ...CATALOGO_NUEVO.filter((x) => x.vendible && !(x.categoria === "fondo") && !(x.categoria === "marco" && x.temporada == null && !x.valor.startsWith("estilo_"))).map((x) => ({ ...x })),
  ...PAQUETES.map((p) => ({ item: p.item, categoria: "paquete", valor: p.item, nombre: p.nombre, precio: p.precio, rareza: "epico" as Rareza, items: p.items })),
  ...UTILIDADES_NUEVAS.map((u) => ({ item: u.item, categoria: "utilidad", valor: u.item, nombre: u.nombre, precio: u.precio, rareza: "comun" as Rareza })),
];
// Lo que costaría lo de un paquete comprado por separado (null si falta algún precio).
function precioSuelto(it: Item): number | null {
  let total = 0;
  for (const s of it.items ?? []) {
    const x = CATALOGO_NUEVO.find((c) => c.item === s);
    if (!x || !x.precio) return null;
    total += x.precio;
  }
  return total > it.precio ? total : null;
}

// Ayudas sueltas dibujadas (antes eran emojis).
function IconoAyuda({ item, grande }: { item: string; grande?: boolean }) {
  const clase = grande ? "h-12 w-12" : "h-10 w-10";
  if (item === "pista") return <IconoTrazo nombre="bombilla" className={`${clase} text-[#C9BDFF]`} />;
  if (item === "segunda_oportunidad") return <IconoTrazo nombre="repetir" className={`${clase} text-correcto`} />;
  return (
    <span className="flex -space-x-3 text-[#7FD8FF]">
      <IconoTrazo nombre="copo" className={clase} />
      {!grande && <IconoTrazo nombre="copo" className={clase} />}
      {!grande && <IconoTrazo nombre="copo" className={clase} />}
    </span>
  );
}

// Los fondos de ciudad (también vendibles) van con su colección, en la pestaña Placa.
const FONDOS_CIUDAD: Item[] = CATALOGO_NUEVO.filter((x) => x.vendible && x.categoria === "fondo").map((x) => ({ ...x }));
// Inventario: todo lo que se puede tener, también lo que no se vende (piezas de colección,
// marcos de otros meses) y las ayudas.
const TODO_INVENTARIO: Item[] = [
  ...CATALOGO_NUEVO.map((x) => ({ ...x })),
  ...UTILIDADES_NUEVAS.map((u) => ({ item: u.item, categoria: "utilidad", valor: u.item, nombre: u.nombre, precio: u.precio, rareza: "comun" as Rareza })),
];

// Tienda A + C: qué pestañas tiene cada puesto de la calle (src/lib/tienda/bazar.ts).
const PESTANAS_DE_PUESTO: Record<PuestoId, Pestana[]> = {
  herreria: ["marcos", "temporada"],
  estudio: ["placa"],
  pirotecnia: ["pirotecnia"],
  musica: ["musica"],
  arena: ["duelos"],
  caligrafia: ["titulos", "nombre", "puntos"],
  botica: ["utilidades"],
  mercado: ["paquetes", "temas"],
};

const DE_PESTANA: Record<Pestana, (it: Item) => boolean> = {
  pirotecnia: (it) => it.categoria === "estela" || it.categoria === "efecto",
  musica: (it) => it.categoria === "sonido",
  titulos: (it) => it.categoria === "titulo",
  paquetes: (it) => it.categoria === "paquete",
  temas: () => false,
  marcos: (it) => it.categoria === "marco" && it.temporada == null && it.valor.startsWith("estilo_"),
  partida: (it) => it.categoria === "estela" || it.categoria === "efecto" || it.categoria === "sonido",
  placa: (it) => it.categoria === "ciudad_placa" || it.categoria === "titulo" || it.categoria === "fondo",
  duelos: (it) => it.categoria === "emote",
  temporada: (it) => it.temporada != null && it.temporada === temporadaActual(),
  utilidades: (it) => it.categoria === "utilidad",
  nombre: (it) => it.categoria === "fuente",
  puntos: (it) => it.categoria === "fuente_puntos",
};

interface Estado {
  cos: CosmeticosNuevos;
  titulos: string[];
  tituloActivo: string | null;
  marcos: string[];
  marco: string;
  fondos: string[];
  fondo: string;
  hielos: number;
  chispas: number;
  cometas: number;
  // Fuentes (0294): de nombre y de puntos.
  fuentes: string[];
  fuente: string;
  fuentesPuntos: string[];
  fuentePuntos: string;
  // Temas de la app (0297); sin la migración, disponible = false.
  temas: EstadoTemasApp;
}

export default function TiendaAmpliada({ paquetesConDinero = false }: { paquetesConDinero?: boolean }) {
  const t = useTranslations("Recompensas.tienda");
  const tCometas = useTranslations("Cometas");
  const vistos = useNuevoVisto();
  // Tienda (solo lo que no tienes) o Inventario (todo lo tuyo); lo elige TiendaClient con ?modo=.
  const parametros = useSearchParams();
  const inventario = parametros.get("modo") === "inventario";
  const puesto = puestoDe(parametros.get("puesto"))?.id ?? null;
  // Desde «Hoy en el Bazar» se llega con ?item=: se abre ese artículo.
  const itemPedido = parametros.get("item");
  const [pestana, setPestana] = useState<Pestana>("paquetes");
  const [tema, setTema] = useState<TemaApp | null>(null);
  // Tema elegido cuando ya se venden (0297); "clasico" = Noche de Prodigia.
  const [temaElegido, setTemaElegido] = useState<TemaApp | "clasico" | null>(null);
  const [e, setE] = useState<Estado | null>(null);
  const [elegido, setElegido] = useState<Item | null>(null);
  const [confirmar, setConfirmar] = useState(false);
  const [ocupado, setOcupado] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);
  // Precio de cada paquete para esta cuenta (0287): si ya tienes parte, solo lo que falta.
  const [preciosPaq, setPreciosPaq] = useState<Record<string, { precio: number; paraTi: number; fraccion: number }>>({});
  const precioDe = (it: Item) => (it.categoria === "paquete" && preciosPaq[it.item] ? preciosPaq[it.item].paraTi : it.precio);

  const cargar = useCallback(async () => {
    const sb = createClient();
    const { data: u } = await sb.auth.getUser();
    if (!u.user) return;
    const [{ data: nuevos }, { data: base }, { data: titulos }] = await Promise.all([
      sb.from("profiles").select(COLUMNAS_COSMETICOS_NUEVOS).eq("id", u.user.id).maybeSingle(),
      sb.from("profiles").select("puntos_total, marco_perfil, marcos_desbloqueados, fondo_perfil, fondos_desbloqueados, hielos_disponibles, titulo_activo").eq("id", u.user.id).maybeSingle(),
      sb.from("titulos_usuario").select("slug").eq("user_id", u.user.id),
    ]);
    // Aparte: si 0279 no se aplicó, la columna no existe y la tienda sigue andando.
    const { data: filaCometas } = await sb.from("profiles").select("cometas").eq("id", u.user.id).maybeSingle();
    // Aparte también: las fuentes de puntos llegan con 0294.
    const { data: filaFuentes } = await sb.from("profiles").select("fuente_nombre, fuentes_desbloqueadas, fuente_puntos, fuentes_puntos_desbloqueadas").eq("id", u.user.id).maybeSingle();
    const ff = (filaFuentes ?? {}) as Record<string, unknown>;
    setPreciosPaq(await preciosPaquetesParaMi(sb));
    const temas = await estadoTemasApp(sb, u.user.id).catch(() => SIN_TEMAS_APP);
    const b = (base ?? {}) as Record<string, unknown>;
    setE({
      cos: cosmeticosDesdeFila(nuevos as Record<string, unknown> | null),
      titulos: ((titulos as { slug: string }[] | null) ?? []).map((x) => x.slug),
      tituloActivo: (b.titulo_activo as string | null) ?? null,
      marcos: (b.marcos_desbloqueados as string[]) ?? [],
      marco: (b.marco_perfil as string) ?? "ninguno",
      fondos: (b.fondos_desbloqueados as string[]) ?? [],
      fondo: (b.fondo_perfil as string) ?? "ninguno",
      hielos: (b.hielos_disponibles as number) ?? 0,
      chispas: (b.puntos_total as number) ?? 0,
      cometas: (filaCometas as { cometas?: number } | null)?.cometas ?? 0,
      fuentes: (ff.fuentes_desbloqueadas as string[]) ?? [],
      fuente: (ff.fuente_nombre as string) ?? "default",
      fuentesPuntos: (ff.fuentes_puntos_desbloqueadas as string[]) ?? [],
      fuentePuntos: (ff.fuente_puntos as string) ?? "clasica",
      temas,
    });
  }, []);

  // Paquetes con dinero: al pagar, el webhook los entrega; se recarga hasta verlos.
  const { comprar: pagar, comprando: pagando, error: errorPago } = useCheckout(async () => {
    for (let i = 0; i < 8; i++) {
      await new Promise((ok) => setTimeout(ok, 1500));
      await cargar();
    }
  });

  useEffect(() => {
    // Carga inicial desde la base (sistema externo).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    cargar();
  }, [cargar]);

  // Canje o compra de Cometas en otra parte de la tienda.
  useEffect(() => {
    const alCambiar = (ev: Event) => {
      const n = (ev as CustomEvent<number>).detail;
      if (typeof n === "number") setE((prev) => (prev ? { ...prev, cometas: n } : prev));
    };
    window.addEventListener("prodigia:cometas", alCambiar);
    return () => window.removeEventListener("prodigia:cometas", alCambiar);
  }, []);

  const tiene = useCallback(
    (it: Item): boolean => {
      if (!e) return false;
      switch (it.categoria) {
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
        case "marco":
          return e.marcos.includes(it.valor);
        case "fondo":
          return e.fondos.includes(it.valor);
        case "fuente":
          return e.fuentes.includes(it.valor);
        case "fuente_puntos":
          return e.fuentesPuntos.includes(it.valor);
        default:
          return false;
      }
    },
    [e]
  );

  const tieneSlug = useCallback(
    (slug: string): boolean => {
      if (!e) return false;
      const it = [...ITEMS, ...FONDOS_CIUDAD].find((x) => x.item === slug);
      if (it) return tiene(it);
      if (slug.startsWith("fondo_")) return e.fondos.includes(slug.slice(6));
      if (slug.startsWith("marco_")) return e.marcos.includes(slug.slice(6));
      return false;
    },
    [e, tiene]
  );

  function usa(it: Item): boolean {
    if (!e) return false;
    if (it.categoria === "estela") return e.cos.estela === it.valor;
    if (it.categoria === "efecto") return e.cos.efecto === it.valor;
    if (it.categoria === "sonido") return e.cos.sonido === it.valor;
    if (it.categoria === "ciudad_placa") return e.cos.ciudadPlaca === it.valor;
    if (it.categoria === "titulo") return e.tituloActivo === it.valor;
    if (it.categoria === "marco") return e.marco === it.valor;
    if (it.categoria === "fondo") return e.fondo === it.valor;
    if (it.categoria === "fuente") return e.fuente === it.valor;
    if (it.categoria === "fuente_puntos") return e.fuentePuntos === it.valor;
    return false;
  }

  function cantidad(it: Item): number | null {
    if (!e) return null;
    if (it.item === "pista") return e.cos.pistas;
    if (it.item === "segunda_oportunidad") return e.cos.segundas;
    if (it.item === "cofre_hielos") return e.hielos;
    return null;
  }

  // En el Inventario, los temas aparecen cuando ya se pueden tener (0297).
  const temasDisponibles = !!e?.temas.disponible;
  const pestanas = useMemo(() => (inventario ? PESTANAS.filter((p) => p !== "paquetes" && (p !== "temas" || temasDisponibles)) : puesto ? PESTANAS_DE_PUESTO[puesto] : []), [inventario, puesto, temasDisponibles]);
  const pestanaVista = pestanas.includes(pestana) ? pestana : pestanas[0];
  const [pedidoAbierto, setPedidoAbierto] = useState<string | null>(null);
  useEffect(() => {
    if (!e || !itemPedido || pedidoAbierto === itemPedido) return;
    const it = [...ITEMS, ...FONDOS_CIUDAD].find((x) => x.item === itemPedido);
    const enPestana = it ? pestanas.find((p) => DE_PESTANA[p](it)) : undefined;
    // Abrir el artículo elegido desde «Hoy en el Bazar» (sistema externo: la URL).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPedidoAbierto(itemPedido);
    if (it) {
      if (enPestana) setPestana(enPestana);
      setElegido(it);
    }
  }, [e, itemPedido, pedidoAbierto, pestanas]);

  const lista = useMemo(() => {
    // En la portada del Bazar (sin puesto) no hay pestañas: antes esto filtraba con
    // DE_PESTANA[undefined] y la tienda entera caía en «Algo no cargó bien» (2026-10-19).
    if (!pestanaVista) return [];
    if (inventario) {
      // En el inventario, «Del mes» muestra todos los marcos de temporada que tengas.
      const filtro = pestanaVista === "temporada" ? (it: Item) => it.temporada != null : DE_PESTANA[pestanaVista];
      return TODO_INVENTARIO.filter(filtro).filter((it) => (it.categoria === "utilidad" ? (cantidad(it) ?? 0) > 0 : tiene(it)));
    }
    return [...ITEMS, ...FONDOS_CIUDAD]
      .filter(DE_PESTANA[pestanaVista])
      .filter((it) => it.categoria === "utilidad" || !(tiene(it) || (it.categoria === "paquete" && (it.items ?? []).every(tieneSlug))));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pestanaVista, inventario, e]);

  function avisar(texto: string) {
    setAviso(texto);
    setTimeout(() => setAviso(null), 2500);
  }

  async function equipar(it: Item, quitar = false) {
    const sb = createClient();
    if (it.categoria === "estela" || it.categoria === "efecto" || it.categoria === "sonido") {
      await equiparCosmetico(sb, it.categoria, quitar ? (it.categoria === "estela" ? "clasica" : it.categoria === "efecto" ? "chispas" : "clasico") : it.valor);
    } else if (it.categoria === "ciudad_placa") {
      await equiparCosmetico(sb, "ciudad_placa", quitar ? null : it.valor);
    } else if (it.categoria === "fuente" || it.categoria === "fuente_puntos") {
      await equiparCosmetico(sb, it.categoria, quitar ? (it.categoria === "fuente" ? "default" : "clasica") : it.valor);
      olvidarFuentePuntos();
      await cargar();
    } else if (it.categoria === "titulo") {
      const { error } = await sb.rpc("elegir_titulo_activo", { p_slug: it.valor });
      if (error) throw error;
    } else if (it.categoria === "marco") {
      await fetch("/api/tienda/elegir-marco", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ marco: quitar ? "ninguno" : it.valor }) });
    } else if (it.categoria === "fondo") {
      await fetch("/api/tienda/elegir-fondo", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ fondo: quitar ? "ninguno" : it.valor }) });
    }
    await refrescarCosmeticosWeb();
  }

  async function comprar() {
    if (!elegido || !e) return;
    if (!confirmar) {
      setConfirmar(true);
      return;
    }
    setOcupado(true);
    try {
      const res = await fetch("/api/tienda/comprar", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ item: elegido.item }) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "");
      reproducirTono("compra");
      if (typeof data.puntos_total === "number") window.dispatchEvent(new CustomEvent("prodigia:chispas", { detail: data.puntos_total }));
      if (typeof data.cometas === "number") window.dispatchEvent(new CustomEvent("prodigia:cometas", { detail: data.cometas }));
      // Comprar no lo pone solo (pedido 2026-10-09): se usa con el botón «Usar».
      avisar(t("comprado", { nombre: elegido.nombre }));
      setConfirmar(false);
      await cargar();
      refrescarCosmeticosWeb();
    } catch (err) {
      avisar(mensajeError(err));
    } finally {
      setOcupado(false);
    }
  }

  async function comprarTema(tm: TemaApp) {
    if (!e) return;
    if (!confirmar) {
      setConfirmar(true);
      return;
    }
    setOcupado(true);
    try {
      const { cometas } = await comprarTemaApp(createClient(), tm.slug);
      reproducirTono("compra");
      window.dispatchEvent(new CustomEvent("prodigia:cometas", { detail: cometas }));
      avisar(t("comprado", { nombre: tm.nombre }));
      setConfirmar(false);
      await cargar();
    } catch (err) {
      avisar(mensajeError(err));
    } finally {
      setOcupado(false);
    }
  }

  // Poner un tema se ve al instante en la web (variables de color en <html>).
  async function ponerTema(tm: TemaApp | null) {
    setOcupado(true);
    try {
      await ponerTemaApp(createClient(), tm?.slug ?? TEMA_CLASICO);
      aplicarTemaAppWeb(tm?.slug ?? null);
      avisar(t("temas.puesto", { nombre: tm ? tm.nombre : t("temas.clasico") }));
      await cargar();
    } catch (err) {
      avisar(mensajeError(err));
    } finally {
      setOcupado(false);
    }
  }

  // En la portada (sin puesto) la tienda ampliada no se muestra: está repartida en los puestos.
  if (pestanas.length === 0) return null;

  return (
    <section className="mx-auto flex w-full max-w-4xl flex-col gap-4 px-4 pb-12 sm:px-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-foreground">{inventario ? t("inventarioTitulo") : t("titulo")}</h2>
        <p className="text-sm text-texto-secundario">{inventario ? t("inventarioSubtitulo") : t("subtitulo")}</p>
      </div>
      <div className={`flex gap-2 overflow-x-auto pb-1 ${pestanas.length < 2 ? "hidden" : ""}`}>
        {pestanas.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setPestana(p)}
            className={`shrink-0 rounded-full border px-4 py-2 text-sm font-semibold ${pestanaVista === p ? "border-primario bg-primario/20 text-foreground" : "border-border bg-surface text-texto-secundario"}`}
          >
            {t(`pestanas.${p}`)}
          </button>
        ))}
      </div>
      {!inventario && pestanaVista === "temporada" && <p className="text-sm font-semibold text-racha">{t("quedanDias", { n: diasHastaFinDeMes() })}</p>}
      {pestanaVista === "temas" && e && !e.temas.disponible && !inventario && (
        <>
          {/* Sin 0297 en la base: como antes, «Próximamente». */}
          <div className="rounded-2xl border border-logro/35 bg-logro/5 p-4">
            <p className="text-[11px] font-bold uppercase tracking-wider text-logro">{t("temas.pronto")}</p>
            <p className="font-display text-lg font-bold text-foreground">{t("temas.titulo")}</p>
            <p className="text-sm text-texto-secundario">{t("temas.sub")}</p>
          </div>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
            {TEMAS_APP.map((tm) => (
              <button key={tm.slug} type="button" onClick={() => setTema(tm)} className="flex flex-col items-center gap-1.5 rounded-2xl border border-border bg-surface p-2 text-center transition-transform hover:-translate-y-1">
                <MiniTemaApp tema={tm} />
                <span className="text-xs font-bold text-foreground">{tm.nombre}</span>
                <span className="rounded-full border border-logro/50 px-2 py-0.5 text-[9px] font-bold tracking-wider text-logro">{t("temas.etiqueta")}</span>
              </button>
            ))}
          </div>
        </>
      )}
      {pestanaVista === "temas" && e?.temas.disponible && (
        <>
          <div className="rounded-2xl border border-primario/35 bg-primario/5 p-4">
            <div className="flex items-start justify-between gap-3">
              <p className="font-display text-lg font-bold text-foreground">{t("temas.aLaVenta")}</p>
              {/* Los temas se compran con Cometas: arriba a la derecha, ese saldo (no el de Chispas). */}
              {!inventario && (
                <span title={tCometas("tusCometas")} className="flex shrink-0 items-center gap-1.5 rounded-full border border-[#5DE4FF]/50 bg-surface-2 px-3 py-1 font-mono text-sm font-bold text-foreground">
                  <IconoCometa className="h-4 w-4" />
                  <span className="sr-only">{tCometas("tusCometas")}:</span>
                  {e.cometas.toLocaleString()}
                </span>
              )}
            </div>
            <p className="text-sm text-texto-secundario">{t("temas.subVenta")}</p>
            <p className="mt-1 text-xs text-texto-secundario">{t("temas.comoConseguir")}</p>
          </div>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
            {[null, ...TEMAS_APP.filter((tm) => !inventario || e.temas.mios.includes(tm.slug))].map((tm) => {
              const slug = tm?.slug ?? TEMA_CLASICO;
              const enUso = e.temas.puesto === slug || (!tm && !TEMAS_APP.some((x) => x.slug === e.temas.puesto));
              const mio = !tm || e.temas.mios.includes(slug);
              const c = tm ? COLOR_RAREZA[tm.rareza] : undefined;
              return (
                <button
                  key={slug}
                  type="button"
                  onClick={() => {
                    setTemaElegido(tm ?? "clasico");
                    setConfirmar(false);
                  }}
                  className={`flex flex-col items-center gap-1.5 rounded-2xl border-2 bg-surface p-2 text-center transition-transform hover:-translate-y-1 ${enUso ? "border-correcto" : "border-border"}`}
                  style={enUso || !c ? undefined : { borderColor: `${c}99` }}
                >
                  <MiniTemaApp tema={tm} />
                  <span className="text-xs font-bold text-foreground">{tm ? tm.nombre : t("temas.clasico")}</span>
                  {enUso ? (
                    <span className="text-[10px] font-bold text-correcto">{t("enUso").toUpperCase()}</span>
                  ) : mio ? (
                    <span className="text-[10px] font-bold text-primario">{tm ? t("tuyo").toUpperCase() : t("temas.gratis")}</span>
                  ) : (
                    <span className="flex items-center gap-1 rounded-full border border-[#5DE4FF]/50 bg-surface-2 px-2 py-0.5 font-mono text-[11px] text-foreground">
                      <IconoCometa className="h-3 w-3" /> {tm ? precioTemaCometas(tm) : 0}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </>
      )}
      {tema && (
        <div className="fixed inset-0 z-[95] flex items-end justify-center bg-black/60 p-4 sm:items-center" onClick={() => setTema(null)} role="dialog" aria-modal="true">
          <div className="flex w-full max-w-md flex-col gap-3 rounded-3xl border border-border bg-surface p-5" onClick={(ev) => ev.stopPropagation()}>
            <div className="flex items-center gap-4">
              <MiniTemaApp tema={tema} ancho={96} />
              <div className="min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-logro">{t("temas.etiquetaLarga")}</span>
                <p className="font-display text-xl font-bold text-foreground">{tema.nombre}</p>
                <p className="text-xs text-texto-secundario">{t("temas.inspiracion", { x: tema.inspiracion })}</p>
              </div>
            </div>
            <p className="text-sm text-foreground">{tema.descripcion}</p>
            <p className="text-xs text-texto-secundario">{t("temas.nota")}</p>
            <button type="button" disabled className="rounded-full border border-border bg-surface-2 px-6 py-3 font-display font-bold text-texto-secundario">
              {t("temas.boton")}
            </button>
          </div>
        </div>
      )}
      {temaElegido && e && (
        <div className="fixed inset-0 z-[95] flex items-end justify-center bg-black/60 p-4 sm:items-center" onClick={() => setTemaElegido(null)} role="dialog" aria-modal="true">
          {(() => {
            const tm = temaElegido === "clasico" ? null : temaElegido;
            const slug = tm?.slug ?? TEMA_CLASICO;
            const mio = !tm || e.temas.mios.includes(slug);
            const enUso = e.temas.puesto === slug || (!tm && !TEMAS_APP.some((x) => x.slug === e.temas.puesto));
            const precio = tm ? precioTemaCometas(tm) : 0;
            return (
              <div className="flex w-full max-w-md flex-col gap-3 rounded-3xl border border-border bg-surface p-5" onClick={(ev) => ev.stopPropagation()}>
                <div className="flex items-center gap-4">
                  <MiniTemaApp tema={tm} ancho={96} />
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold uppercase tracking-wider" style={tm ? { color: COLOR_RAREZA[tm.rareza] } : undefined}>
                      {t("temas.etiquetaTema")} · {tm ? t(`rareza.${tm.rareza}`) : t("temas.gratis")}
                    </span>
                    <p className="font-display text-xl font-bold text-foreground">{tm ? tm.nombre : t("temas.clasico")}</p>
                    {tm && <p className="text-xs text-texto-secundario">{t("temas.inspiracion", { x: tm.inspiracion })}</p>}
                  </div>
                </div>
                <p className="text-sm text-foreground">{tm ? tm.descripcion : t("temas.clasicoDesc")}</p>
                <p className="text-xs text-texto-secundario">{t("temas.nota")}</p>
                {!mio && <p className="text-xs text-texto-secundario">{t("temas.enCapsulas")}</p>}
                {mio ? (
                  <button type="button" disabled={ocupado || enUso} onClick={() => ponerTema(tm)} className="rounded-full bg-primario px-6 py-3 font-display font-bold text-white disabled:opacity-60">
                    {enUso ? t("enUso") : t("usar")}
                  </button>
                ) : (
                  <>
                    <button type="button" disabled={ocupado || e.cometas < precio} onClick={() => tm && comprarTema(tm)} className="flex items-center justify-center gap-2 rounded-full bg-[#5DE4FF] px-6 py-3 font-display font-bold text-[#06202A] disabled:opacity-50">
                      <IconoCometa className="h-5 w-5" />
                      {confirmar ? t("confirmar") : t("comprarCometas", { n: precio.toLocaleString() })}
                    </button>
                    {e.cometas < precio && <p className="text-center text-xs text-texto-secundario">{t("teFaltanCometas", { n: (precio - e.cometas).toLocaleString() })}</p>}
                  </>
                )}
                {mio && enUso && tm && (
                  <button type="button" disabled={ocupado} onClick={() => ponerTema(null)} className="rounded-full border border-border px-6 py-2 text-sm font-semibold text-foreground disabled:opacity-60">
                    {t("temas.volverClasico")}
                  </button>
                )}
              </div>
            );
          })()}
        </div>
      )}
      {lista.length === 0 && pestanaVista !== "temas" && (
        <p className="rounded-2xl border border-dashed border-border px-4 py-6 text-center text-sm text-texto-secundario">{inventario ? t("inventarioVacio") : t("yaTienesTodo")}</p>
      )}
      <motion.div key={`${inventario}-${pestanaVista}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {lista.map((it) => {
          const mio = tiene(it) || (it.categoria === "paquete" && (it.items ?? []).every(tieneSlug));
          const enUso = usa(it);
          const c = COLOR_RAREZA[it.rareza];
          const n = cantidad(it);
          const pie = (
            <>
                {n != null ? (
                  <span className="text-[11px] text-texto-secundario">{t("tienes", { n })}</span>
                ) : enUso ? (
                  <span className="text-[11px] font-bold text-correcto">{t("enUso").toUpperCase()}</span>
                ) : mio ? (
                  <span className="text-[11px] font-bold text-primario">{t("tuyo").toUpperCase()}</span>
                ) : (
                  <span className="text-[10px] font-bold tracking-wider" style={{ color: c }}>
                    {t(`rareza.${it.rareza}`).toUpperCase()}
                  </span>
                )}
                {(!mio || n != null) &&
                  (it.precioCometas ? (
                    <span className="flex items-center gap-1 rounded-full border border-[#5DE4FF]/50 bg-surface-2 px-2 py-0.5 font-mono text-xs text-foreground">
                      <IconoCometa className="h-3.5 w-3.5" /> {it.precioCometas.toLocaleString()}
                    </span>
                  ) : (
                    <span className="rounded-full border border-border bg-surface-2 px-2 py-0.5 font-mono text-xs text-foreground">✦ {precioDe(it).toLocaleString()}</span>
                  ))}
            </>
          );
          return (
            <button
              key={it.item}
              type="button"
              onClick={() => {
                setElegido(it);
                setConfirmar(false);
                marcarNuevoVisto(it.item);
              }}
              className={`relative flex flex-col items-center gap-1.5 rounded-2xl border-2 bg-surface p-3 text-center transition-transform hover:-translate-y-1 ${enUso ? "border-correcto" : ""} ${it.categoria === "paquete" ? "col-span-2 !flex-row !items-center gap-3 text-left" : ""}`}
              style={enUso ? undefined : { borderColor: `${c}99` }}
            >
              {!mio && esNuevo(it.item, vistos) && <EtiquetaNuevo />}
              {it.categoria === "paquete" ? (
                <>
                  <IlustracionPaquete item={it.item} className="h-24 w-24 sm:h-28 sm:w-28" />
                  <span className="flex min-w-0 flex-1 flex-col items-start gap-1">
                    <span className="font-display text-base font-bold text-foreground">{it.nombre}</span>
                    <span className="text-[11px] text-texto-secundario">{t("cosas", { n: it.items?.length ?? 0 })}</span>
                    {(() => {
                      const suelto = precioSuelto(it);
                      return suelto && !mio ? (
                        <span className="flex flex-wrap items-center gap-1.5">
                          <span className="font-mono text-[11px] text-texto-secundario line-through">✦ {suelto.toLocaleString()}</span>
                          <span className="rounded-full bg-correcto/15 px-2 py-0.5 text-[10px] font-bold text-correcto">{t("ahorras", { n: Math.round((1 - it.precio / suelto) * 100) })}</span>
                        </span>
                      ) : null;
                    })()}
                    <span className="flex flex-wrap items-center gap-2">{pie}</span>
                  </span>
                </>
              ) : (
              <span className="flex h-16 items-center justify-center">
                {it.categoria === "utilidad" ? <IconoAyuda item={it.item} /> : <VistaCosmetico categoria={it.categoria} valor={it.valor} tam={52} />}
              </span>
              )}
              {it.categoria !== "paquete" && <span className="min-h-[2.5rem] text-xs font-bold text-foreground">{it.nombre}</span>}
              {it.categoria !== "paquete" && pie}
            </button>
          );
        })}
      </motion.div>

      {elegido && e && (
        <div className="fixed inset-0 z-[95] flex items-end justify-center bg-black/60 p-4 sm:items-center" onClick={() => setElegido(null)} role="dialog" aria-modal="true">
          <div className="flex w-full max-w-md flex-col gap-3 rounded-3xl border border-border bg-surface p-5" onClick={(ev) => ev.stopPropagation()}>
            <div className="flex items-center gap-4">
              <span className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl bg-surface-2">
                {elegido.categoria === "paquete" ? <IlustracionPaquete item={elegido.item} className="h-24 w-24" /> : elegido.categoria === "utilidad" ? <IconoAyuda item={elegido.item} grande /> : <VistaCosmetico categoria={elegido.categoria} valor={elegido.valor} tam={72} />}
              </span>
              <div className="min-w-0">
                <span className="text-[10px] font-bold tracking-wider" style={{ color: COLOR_RAREZA[elegido.rareza] }}>
                  {t(`rareza.${elegido.rareza}`).toUpperCase()}
                </span>
                <p className="font-display text-xl font-bold text-foreground">{elegido.nombre}</p>
                <p className="text-sm text-texto-secundario">
                  {elegido.categoria === "utilidad"
                    ? UTILIDADES_NUEVAS.find((u) => u.item === elegido.item)?.descripcion
                    : elegido.temporada != null
                      ? t("descripciones.temporada")
                      : t.has(`descripciones.${elegido.categoria}`)
                        ? t(`descripciones.${elegido.categoria}`)
                        : ""}
                </p>
                {elegido.categoria === "sonido" && (
                  <button type="button" onClick={() => probarPaqueteAcierto(elegido.valor)} className="mt-1 rounded-full border border-border px-3 py-1 text-xs font-semibold text-foreground">
                    {t("escuchar")}
                  </button>
                )}
              </div>
            </div>
            {elegido.categoria === "paquete" && (
              <ul className="text-sm">
                <li className="text-texto-secundario">{t("paqueteContiene")}</li>
                {(elegido.items ?? []).map((s) => (
                  <li key={s} className={tieneSlug(s) ? "text-correcto" : "text-foreground"}>
                    {tieneSlug(s) ? "✓ " : "• "}
                    {[...ITEMS, ...FONDOS_CIUDAD].find((x) => x.item === s)?.nombre ?? s.replace(/^(fondo|marco)_/, "").replace(/_/g, " ")}
                  </li>
                ))}
              </ul>
            )}
            {(() => {
              const mio = tiene(elegido) || (elegido.categoria === "paquete" && (elegido.items ?? []).every(tieneSlug));
              if (elegido.categoria !== "utilidad" && mio) {
                if (elegido.categoria === "emote") return <p className="text-center text-sm text-texto-secundario">{t("emoteTuyo")}</p>;
                if (elegido.categoria === "paquete") return <p className="text-center text-sm text-texto-secundario">{t("yaTodo")}</p>;
                if (usa(elegido) && elegido.categoria === "titulo") return null;
                return (
                  <button
                    type="button"
                    disabled={ocupado}
                    onClick={async () => {
                      setOcupado(true);
                      try {
                        await equipar(elegido, usa(elegido));
                        await cargar();
                      } catch (err) {
                        avisar(mensajeError(err));
                      } finally {
                        setOcupado(false);
                      }
                    }}
                    className="rounded-full bg-primario px-6 py-3 font-display font-bold text-white disabled:opacity-60"
                  >
                    {usa(elegido) ? t("quitar") : t("usar")}
                  </button>
                );
              }
              if (elegido.precioCometas) {
                const pc = elegido.precioCometas;
                return (
                  <>
                    <button type="button" disabled={ocupado || e.cometas < pc} onClick={comprar} className="flex items-center justify-center gap-2 rounded-full bg-[#5DE4FF] px-6 py-3 font-display font-bold text-[#06202A] disabled:opacity-50">
                      <IconoCometa className="h-5 w-5" />
                      {confirmar ? t("confirmar") : t("comprarCometas", { n: pc.toLocaleString() })}
                    </button>
                    {e.cometas < pc && <p className="text-center text-xs text-texto-secundario">{t("teFaltanCometas", { n: (pc - e.cometas).toLocaleString() })}</p>}
                  </>
                );
              }
              return (
                <>
                  {elegido.categoria === "paquete" && precioDe(elegido) < elegido.precio && <p className="text-center text-xs font-semibold text-correcto">{t("pagasLoQueFalta")}</p>}
                  <button type="button" disabled={ocupado || e.chispas < precioDe(elegido)} onClick={comprar} className="rounded-full bg-logro px-6 py-3 font-display font-bold text-[#2A1A00] disabled:opacity-50">
                    {confirmar ? t("confirmar") : t("comprar", { n: precioDe(elegido).toLocaleString() })}
                  </button>
                  {e.chispas < precioDe(elegido) && <p className="text-center text-xs text-texto-secundario">{t("teFaltan", { n: (precioDe(elegido) - e.chispas).toLocaleString() })}</p>}
                  {elegido.categoria === "paquete" && paquetesConDinero && preciosPaq[elegido.item] && (
                    <>
                      <button
                        type="button"
                        disabled={pagando !== null}
                        onClick={() => pagar("paquete_cosmetico", { paquete: elegido.item })}
                        className="rounded-xl border-2 border-[#05060F] bg-[#FFC53D] px-6 py-3 font-display font-bold text-[#1A1206] shadow-[3px_3px_0_0_#05060F] transition-all enabled:hover:translate-x-[1px] enabled:hover:translate-y-[1px] enabled:hover:shadow-[2px_2px_0_0_#05060F] disabled:opacity-60"
                      >
                        {pagando ? t("abriendoPago") : t("comprarDinero", { precio: precioTexto(precioUsdParcial(precioUsdPaquete(preciosPaq[elegido.item].precio), preciosPaq[elegido.item].fraccion)) })}
                      </button>
                      {errorPago && <p className="text-center text-xs text-error">{errorPago}</p>}
                    </>
                  )}
                </>
              );
            })()}
          </div>
        </div>
      )}

      {aviso && (
        <div className="fixed bottom-6 left-1/2 z-[110] -translate-x-1/2 rounded-full bg-foreground px-5 py-2 text-sm font-semibold text-background shadow-lg" role="status">
          {aviso}
        </div>
      )}
    </section>
  );
}
