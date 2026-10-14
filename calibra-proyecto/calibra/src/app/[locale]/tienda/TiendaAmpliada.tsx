"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { probarPaqueteAcierto, reproducirTono } from "@/lib/sonido";
import { CATALOGO_NUEVO, COLOR_RAREZA, diasHastaFinDeMes, PAQUETES, temporadaActual, UTILIDADES_NUEVAS, type Rareza } from "@/lib/recompensas/catalogo";
import { cosmeticosDesdeFila, COLUMNAS_COSMETICOS_NUEVOS, equiparCosmetico, mensajeError, type CosmeticosNuevos } from "@/lib/recompensas/api";
import { refrescarCosmeticosWeb } from "@/lib/recompensas/cosmeticosWeb";
import VistaCosmetico from "@/components/recompensas/VistaCosmetico";
import IconoCometa from "@/components/IconoCometa";
import { TEMAS_APP, type TemaApp } from "@/lib/recompensas/temas";
import { puestoDe, type PuestoId } from "@/lib/tienda/bazar";

// Tienda ampliada (0248) en la web: la misma vidriera que las pestañas nuevas del
// Bazar de la app (paquetes, partida, Placa, duelos, marco del mes y ayudas). La
// compra pasa por /api/tienda/comprar (precio del catálogo compartido) y la base
// revalida todo. Avisa la compra con el evento "prodigia:chispas" para que el saldo
// de arriba (TiendaClient) se actualice.

type Pestana = "paquetes" | "temas" | "marcos" | "partida" | "placa" | "duelos" | "temporada" | "utilidades" | "pirotecnia" | "musica" | "titulos";
const PESTANAS: Pestana[] = ["paquetes", "temas", "marcos", "partida", "placa", "duelos", "temporada", "utilidades"];

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
  caligrafia: ["titulos"],
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
};

// Miniatura de un tema (Próximamente): pantallita con sus colores, la forma de sus
// tarjetas y su botón. Igual que en el Bazar de la app.
function MiniTema({ tema, grande = false }: { tema: TemaApp; grande?: boolean }) {
  const k = tema.colores;
  const radio = Math.min(tema.radio, 6);
  const tarjeta = (alto: string) => (
    <span className="relative block" style={{ height: alto }}>
      {tema.sombra === "dura" && <span className="absolute inset-0 translate-x-[2px] translate-y-[2px]" style={{ borderRadius: radio, background: k.borde }} />}
      <span className="relative flex h-full flex-col justify-center gap-[3px] p-1" style={{ borderRadius: radio, background: k.tarjeta, border: `${tema.borde}px solid ${k.borde}` }}>
        <span className="block h-[3px] w-[62%] rounded-sm opacity-85" style={{ background: k.texto }} />
        <span className="block h-[3px] w-[40%] rounded-sm" style={{ background: k.detalle }} />
      </span>
    </span>
  );
  return (
    <span className={`flex flex-col gap-1.5 overflow-hidden rounded-xl p-2 ${grande ? "h-32 w-24" : "aspect-[10/13] w-full"}`} style={{ background: k.fondo }} aria-hidden="true">
      <span className="block h-[5px] w-[48%] rounded-sm" style={{ background: k.texto === k.tarjeta ? k.borde : k.texto }} />
      {tarjeta("24%")}
      {tarjeta("17%")}
      <span className="flex-1" />
      <span className="block h-[12%]" style={{ borderRadius: radio, background: k.acento, border: tema.borde ? `1px solid ${k.borde}` : undefined }} />
    </span>
  );
}

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
}

export default function TiendaAmpliada() {
  const t = useTranslations("Recompensas.tienda");
  // Tienda (solo lo que no tienes) o Inventario (todo lo tuyo); lo elige TiendaClient con ?modo=.
  const parametros = useSearchParams();
  const inventario = parametros.get("modo") === "inventario";
  const puesto = puestoDe(parametros.get("puesto"))?.id ?? null;
  // Desde «Hoy en el Bazar» se llega con ?item=: se abre ese artículo.
  const itemPedido = parametros.get("item");
  const [pestana, setPestana] = useState<Pestana>("paquetes");
  const [tema, setTema] = useState<TemaApp | null>(null);
  const [e, setE] = useState<Estado | null>(null);
  const [elegido, setElegido] = useState<Item | null>(null);
  const [confirmar, setConfirmar] = useState(false);
  const [ocupado, setOcupado] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);

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
    });
  }, []);

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
    return false;
  }

  function cantidad(it: Item): number | null {
    if (!e) return null;
    if (it.item === "pista") return e.cos.pistas;
    if (it.item === "segunda_oportunidad") return e.cos.segundas;
    if (it.item === "cofre_hielos") return e.hielos;
    return null;
  }

  const pestanas = useMemo(() => (inventario ? PESTANAS.filter((p) => p !== "paquetes" && p !== "temas") : puesto ? PESTANAS_DE_PUESTO[puesto] : []), [inventario, puesto]);
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
      {!inventario && pestanaVista === "temas" && (
        <>
          <div className="rounded-2xl border border-logro/35 bg-logro/5 p-4">
            <p className="text-[11px] font-bold uppercase tracking-wider text-logro">{t("temas.pronto")}</p>
            <p className="font-display text-lg font-bold text-foreground">{t("temas.titulo")}</p>
            <p className="text-sm text-texto-secundario">{t("temas.sub")}</p>
          </div>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
            {TEMAS_APP.map((tm) => (
              <button key={tm.slug} type="button" onClick={() => setTema(tm)} className="flex flex-col items-center gap-1.5 rounded-2xl border border-border bg-surface p-2 text-center transition-transform hover:-translate-y-1">
                <MiniTema tema={tm} />
                <span className="text-xs font-bold text-foreground">{tm.nombre}</span>
                <span className="rounded-full border border-logro/50 px-2 py-0.5 text-[9px] font-bold tracking-wider text-logro">{t("temas.etiqueta")}</span>
              </button>
            ))}
          </div>
        </>
      )}
      {tema && (
        <div className="fixed inset-0 z-[95] flex items-end justify-center bg-black/60 p-4 sm:items-center" onClick={() => setTema(null)} role="dialog" aria-modal="true">
          <div className="flex w-full max-w-md flex-col gap-3 rounded-3xl border border-border bg-surface p-5" onClick={(ev) => ev.stopPropagation()}>
            <div className="flex items-center gap-4">
              <MiniTema tema={tema} grande />
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
      {lista.length === 0 && pestanaVista !== "temas" && (
        <p className="rounded-2xl border border-dashed border-border px-4 py-6 text-center text-sm text-texto-secundario">{inventario ? t("inventarioVacio") : t("yaTienesTodo")}</p>
      )}
      <motion.div key={`${inventario}-${pestanaVista}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {lista.map((it) => {
          const mio = tiene(it) || (it.categoria === "paquete" && (it.items ?? []).every(tieneSlug));
          const enUso = usa(it);
          const c = COLOR_RAREZA[it.rareza];
          const n = cantidad(it);
          return (
            <button
              key={it.item}
              type="button"
              onClick={() => {
                setElegido(it);
                setConfirmar(false);
              }}
              className={`flex flex-col items-center gap-1.5 rounded-2xl border-2 bg-surface p-3 text-center transition-transform hover:-translate-y-1 ${enUso ? "border-correcto" : ""}`}
              style={enUso ? undefined : { borderColor: `${c}99` }}
            >
              <span className="flex h-16 items-center justify-center">
                {it.categoria === "paquete" ? <span className="text-4xl">🎁</span> : it.categoria === "utilidad" ? <span className="text-3xl">{it.item === "pista" ? "💡" : it.item === "segunda_oportunidad" ? "🔁" : "🧊🧊🧊"}</span> : <VistaCosmetico categoria={it.categoria} valor={it.valor} tam={52} />}
              </span>
              <span className="min-h-[2.5rem] text-xs font-bold text-foreground">{it.nombre}</span>
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
                  <span className="rounded-full border border-border bg-surface-2 px-2 py-0.5 font-mono text-xs text-foreground">✦ {it.precio.toLocaleString()}</span>
                ))}
            </button>
          );
        })}
      </motion.div>

      {elegido && e && (
        <div className="fixed inset-0 z-[95] flex items-end justify-center bg-black/60 p-4 sm:items-center" onClick={() => setElegido(null)} role="dialog" aria-modal="true">
          <div className="flex w-full max-w-md flex-col gap-3 rounded-3xl border border-border bg-surface p-5" onClick={(ev) => ev.stopPropagation()}>
            <div className="flex items-center gap-4">
              <span className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl bg-surface-2">
                {elegido.categoria === "paquete" ? <span className="text-5xl">🎁</span> : elegido.categoria === "utilidad" ? <span className="text-4xl">{elegido.item === "pista" ? "💡" : elegido.item === "segunda_oportunidad" ? "🔁" : "🧊"}</span> : <VistaCosmetico categoria={elegido.categoria} valor={elegido.valor} tam={72} />}
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
                  <button type="button" disabled={ocupado || e.chispas < elegido.precio} onClick={comprar} className="rounded-full bg-logro px-6 py-3 font-display font-bold text-[#2A1A00] disabled:opacity-50">
                    {confirmar ? t("confirmar") : t("comprar", { n: elegido.precio.toLocaleString() })}
                  </button>
                  {e.chispas < elegido.precio && <p className="text-center text-xs text-texto-secundario">{t("teFaltan", { n: (elegido.precio - e.chispas).toLocaleString() })}</p>}
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
