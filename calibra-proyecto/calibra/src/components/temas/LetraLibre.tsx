"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";
import { reproducirTono } from "@/lib/sonido";
import { comprarLetraLibre, elegirLetraApp, estadoLetraApp, mensajeError, SIN_LETRA_APP, type EstadoLetraApp } from "@/lib/recompensas/api";
import { LETRA_LIBRE, LETRAS_APP, letraDe, temaAppDe, type LetraApp } from "@/lib/recompensas/temas";
import { aplicarLetraAppWeb, temaAppPuestoWeb } from "@/lib/recompensas/temaAppWeb";
import IconoCometa from "@/components/IconoCometa";
import MuestraLetraLibre from "./MuestraLetraLibre";

// Letra libre (0314) en la web: comprarla con Cometas (puesto Caligrafía del Bazar) y,
// si ya la tienes, elegir la letra de títulos de toda la app. Se ve en caliente. Sin
// 0314 en la base, no dibuja nada.
//   - enAjustes: en Ajustes; si no la tienes, invita a la Caligrafía en vez de vender.
//   - soloSiLaTienes: en el Inventario.
export default function LetraLibre({ enAjustes = false, soloSiLaTienes = false }: { enAjustes?: boolean; soloSiLaTienes?: boolean }) {
  const t = useTranslations("LetraLibre");
  const [e, setE] = useState<EstadoLetraApp | null>(null);
  const [cometas, setCometas] = useState(0);
  const [tema, setTema] = useState<string>("clasico");
  const [confirmar, setConfirmar] = useState(false);
  const [ocupado, setOcupado] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    const sb = createClient();
    const { data } = await sb.auth.getUser();
    if (!data.user) return;
    const [estado, { data: fila }] = await Promise.all([estadoLetraApp(sb, data.user.id).catch(() => SIN_LETRA_APP), sb.from("profiles").select("cometas").eq("id", data.user.id).maybeSingle()]);
    setCometas((fila as { cometas?: number } | null)?.cometas ?? 0);
    setTema(temaAppPuestoWeb());
    setE(estado);
  }, []);

  useEffect(() => {
    // Carga inicial desde la base (sistema externo).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    cargar();
  }, [cargar]);

  // Saldo de Cometas y tema puesto que cambian en otra parte de la página.
  useEffect(() => {
    const alCometas = (ev: Event) => {
      const n = (ev as CustomEvent<number>).detail;
      if (typeof n === "number") setCometas(n);
    };
    const alTema = () => setTema(temaAppPuestoWeb());
    window.addEventListener("prodigia:cometas", alCometas);
    window.addEventListener("prodigia:tema-app", alTema);
    return () => {
      window.removeEventListener("prodigia:cometas", alCometas);
      window.removeEventListener("prodigia:tema-app", alTema);
    };
  }, []);

  function avisar(texto: string) {
    setAviso(texto);
    setTimeout(() => setAviso((a) => (a === texto ? null : a)), 3500);
  }

  async function comprar() {
    if (!confirmar) {
      setConfirmar(true);
      return;
    }
    setOcupado(true);
    try {
      const r = await comprarLetraLibre(createClient());
      reproducirTono("compra");
      window.dispatchEvent(new CustomEvent("prodigia:cometas", { detail: r.cometas }));
      setConfirmar(false);
      avisar(t("comprada"));
      await cargar();
    } catch (err) {
      avisar(mensajeError(err));
    } finally {
      setOcupado(false);
    }
  }

  async function elegir(id: string | null) {
    if (!e) return;
    setOcupado(true);
    try {
      await elegirLetraApp(createClient(), id);
      aplicarLetraAppWeb(id);
      setE({ ...e, elegida: id });
      const l = letraDe(id);
      avisar(l ? t("puesta", { nombre: t(`letras.${l.id}`) }) : t("puestaTema"));
    } catch (err) {
      avisar(mensajeError(err));
    } finally {
      setOcupado(false);
    }
  }

  if (!e || !e.disponible || (soloSiLaTienes && !e.tiene)) return null;

  const precio = LETRA_LIBRE.precioCometas;
  const letraTema = letraDe(temaAppDe(tema)?.letra) ?? letraDe("siempre")!;
  const elegida = letraDe(e.elegida)?.id ?? null;

  const cabecera = (
    <div className="flex items-start gap-4">
      <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-border bg-surface-2">
        <MuestraLetraLibre tam={52} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-bold uppercase tracking-wider text-logro">{t("etiqueta")}</p>
        <p className="font-display text-xl font-bold text-foreground">{enAjustes ? t("ajustesTitulo") : t("titulo")}</p>
        <p className="text-sm text-texto-secundario">{enAjustes && e.tiene ? t("ajustesDesc") : t("desc")}</p>
      </div>
    </div>
  );

  if (!e.tiene) {
    return (
      <section className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-4">
        {cabecera}
        <MuestrasLetras />
        <p className="text-xs text-texto-secundario">{t("comoConseguir")}</p>
        {enAjustes ? (
          <Link href="/tienda?puesto=caligrafia" className="self-start rounded-full bg-primario px-5 py-2.5 font-display text-sm font-bold text-white">
            {t("irATienda")}
          </Link>
        ) : (
          <>
            <button
              type="button"
              disabled={ocupado || cometas < precio}
              onClick={comprar}
              className="flex items-center justify-center gap-2 self-start rounded-full bg-[#5DE4FF] px-6 py-3 font-display font-bold text-[#06202A] disabled:opacity-50"
            >
              <IconoCometa className="h-5 w-5" />
              {confirmar ? t("confirmar") : t("comprar", { n: precio.toLocaleString() })}
            </button>
            {cometas < precio && <p className="text-xs text-texto-secundario">{t("teFaltan", { n: (precio - cometas).toLocaleString() })}</p>}
          </>
        )}
        {aviso && <p className="text-sm font-semibold text-primario">{aviso}</p>}
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-4">
      {cabecera}
      <p className="text-sm font-semibold text-foreground">{t("elige")}</p>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        <OpcionLetra letra={letraTema} nombre={t("delTema")} nota={t(`letras.${letraTema.id}`)} activa={elegida === null} enUso={t("enUso")} ocupado={ocupado} onElegir={() => elegir(null)} />
        {LETRAS_APP.map((l) => (
          <OpcionLetra key={l.id} letra={l} nombre={t(`letras.${l.id}`)} activa={elegida === l.id} enUso={t("enUso")} ocupado={ocupado} onElegir={() => elegir(l.id)} />
        ))}
      </div>
      {aviso && <p className="text-sm font-semibold text-primario">{aviso}</p>}
    </section>
  );
}

// Cada letra se muestra escrita en sí misma, al tamaño corregido por su escala.
function OpcionLetra({ letra, nombre, nota, activa, enUso, ocupado, onElegir }: { letra: LetraApp; nombre: string; nota?: string; activa: boolean; enUso: string; ocupado: boolean; onElegir: () => void }) {
  return (
    <button
      type="button"
      disabled={ocupado || activa}
      onClick={onElegir}
      aria-pressed={activa}
      className={`flex min-h-[64px] flex-col items-start justify-center gap-1 rounded-xl border-2 bg-surface-2 px-3 py-2 text-left transition-transform enabled:hover:-translate-y-0.5 ${activa ? "border-correcto" : "border-border"}`}
    >
      <span className="block max-w-full truncate leading-tight text-foreground" style={{ fontFamily: letra.web, fontSize: Math.round(18 * letra.escala), fontWeight: letra.id === "imprenta" ? 700 : undefined }}>
        {nombre}
      </span>
      <span className={`text-[10px] font-bold tracking-wider ${activa ? "text-correcto" : "text-texto-secundario"}`}>{activa ? enUso : (nota ?? "")}</span>
    </button>
  );
}

// Tira de muestras para quien todavía no la tiene: la misma palabra en varias letras.
function MuestrasLetras() {
  const ids = ["cartel", "cursiva", "arcade", "romana", "marcador", "consola"];
  return (
    <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 rounded-xl border border-dashed border-border px-3 py-2">
      {ids.map((id) => {
        const l = letraDe(id)!;
        return (
          <span key={id} className="text-foreground" style={{ fontFamily: l.web, fontSize: Math.round(20 * l.escala) }}>
            Prodigia
          </span>
        );
      })}
    </div>
  );
}
