"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { probarPaqueteAcierto, reproducirTono } from "@/lib/sonido";
import { CATALOGO_NUEVO, COLOR_RAREZA, diasHastaFinDeMes, PAQUETES, temporadaActual, UTILIDADES_NUEVAS, type Rareza } from "@/lib/recompensas/catalogo";
import { cosmeticosDesdeFila, COLUMNAS_COSMETICOS_NUEVOS, equiparCosmetico, mensajeError, type CosmeticosNuevos } from "@/lib/recompensas/api";
import { refrescarCosmeticosWeb } from "@/lib/recompensas/cosmeticosWeb";
import VistaCosmetico from "@/components/recompensas/VistaCosmetico";

// Tienda ampliada (0248) en la web: la misma vidriera que las pestañas nuevas del
// Bazar de la app (paquetes, partida, Placa, duelos, marco del mes y ayudas). La
// compra pasa por /api/tienda/comprar (precio del catálogo compartido) y la base
// revalida todo. Avisa la compra con el evento "prodigia:chispas" para que el saldo
// de arriba (TiendaClient) se actualice.

type Pestana = "paquetes" | "partida" | "placa" | "duelos" | "temporada" | "utilidades";
const PESTANAS: Pestana[] = ["paquetes", "partida", "placa", "duelos", "temporada", "utilidades"];

interface Item {
  item: string;
  categoria: string;
  valor: string;
  nombre: string;
  precio: number;
  rareza: Rareza;
  temporada?: number;
  items?: string[];
}

const ITEMS: Item[] = [
  ...CATALOGO_NUEVO.filter((x) => x.vendible && !(x.categoria === "fondo") && !(x.categoria === "marco" && x.temporada == null)).map((x) => ({ ...x })),
  ...PAQUETES.map((p) => ({ item: p.item, categoria: "paquete", valor: p.item, nombre: p.nombre, precio: p.precio, rareza: "epico" as Rareza, items: p.items })),
  ...UTILIDADES_NUEVAS.map((u) => ({ item: u.item, categoria: "utilidad", valor: u.item, nombre: u.nombre, precio: u.precio, rareza: "comun" as Rareza })),
];
// Los fondos de ciudad (también vendibles) van con su colección, en la pestaña Placa.
const FONDOS_CIUDAD: Item[] = CATALOGO_NUEVO.filter((x) => x.vendible && x.categoria === "fondo").map((x) => ({ ...x }));

const DE_PESTANA: Record<Pestana, (it: Item) => boolean> = {
  paquetes: (it) => it.categoria === "paquete",
  partida: (it) => it.categoria === "estela" || it.categoria === "efecto" || it.categoria === "sonido",
  placa: (it) => it.categoria === "ciudad_placa" || it.categoria === "titulo" || it.categoria === "fondo",
  duelos: (it) => it.categoria === "emote",
  temporada: (it) => it.temporada != null && it.temporada === temporadaActual(),
  utilidades: (it) => it.categoria === "utilidad",
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
}

export default function TiendaAmpliada() {
  const t = useTranslations("Recompensas.tienda");
  const [pestana, setPestana] = useState<Pestana>("paquetes");
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
    });
  }, []);

  useEffect(() => {
    // Carga inicial desde la base (sistema externo).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    cargar();
  }, [cargar]);

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

  const lista = useMemo(() => [...ITEMS, ...FONDOS_CIUDAD].filter(DE_PESTANA[pestana]), [pestana]);

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
      window.dispatchEvent(new CustomEvent("prodigia:chispas", { detail: data.puntos_total }));
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

  return (
    <section className="mx-auto flex w-full max-w-4xl flex-col gap-4 px-4 pb-12 sm:px-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-foreground">{t("titulo")}</h2>
        <p className="text-sm text-texto-secundario">{t("subtitulo")}</p>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {PESTANAS.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setPestana(p)}
            className={`shrink-0 rounded-full border px-4 py-2 text-sm font-semibold ${pestana === p ? "border-primario bg-primario/20 text-foreground" : "border-border bg-surface text-texto-secundario"}`}
          >
            {t(`pestanas.${p}`)}
          </button>
        ))}
      </div>
      {pestana === "temporada" && <p className="text-sm font-semibold text-racha">{t("quedanDias", { n: diasHastaFinDeMes() })}</p>}
      <motion.div key={pestana} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-2 gap-3 sm:grid-cols-4">
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
              {(!mio || n != null) && <span className="rounded-full border border-border bg-surface-2 px-2 py-0.5 font-mono text-xs text-foreground">✦ {it.precio.toLocaleString()}</span>}
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
