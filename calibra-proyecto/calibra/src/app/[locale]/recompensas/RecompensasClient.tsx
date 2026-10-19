"use client";

import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";
import { reproducirTono } from "@/lib/sonido";
import { CATALOGO_NUEVO, CIUDADES, COLOR_RAREZA, coloresCapsula, PREMIOS_CALENDARIO, type Rareza } from "@/lib/recompensas/catalogo";
import {
  contenidoCapsula,
  mensajeError,
  miCalendario,
  misCapsulas,
  misColecciones,
  misMisiones,
  misRegalos,
  premioPorAnuncio,
  premiosAnuncioHoy,
  reclamarCalendario,
  reclamarMision,
  recibirRegalo,
  revisarRecompensas,
  type Capsula,
  type ContenidoCapsula,
  type EstadoCalendario,
  type Mision,
  type PremioAnuncio,
  type PiezaColeccion,
  type Regalo,
} from "@/lib/recompensas/api";
import { refrescarCosmeticosWeb } from "@/lib/recompensas/cosmeticosWeb";
import { anuncioConPremioWeb, publicidadWebActiva, suscribirPublicidadWeb } from "@/lib/publicidad/web";
import { misConstelaciones, type Constelacion as DatosConstelacion } from "@/lib/recompensas/constelaciones";
import ContadorAlineacion from "@/components/recompensas/ContadorAlineacion";
import Constelacion from "@/components/recompensas/Constelacion";
import AbrirCapsula, { DibujoCapsula } from "@/components/recompensas/AbrirCapsula";
import CapsulasPorAbrir from "@/components/recompensas/CapsulasPorAbrir";
import VistaCosmetico from "@/components/recompensas/VistaCosmetico";

export default function RecompensasClient({ invitado, plan }: { invitado: boolean; plan: string }) {
  const t = useTranslations("Recompensas");
  const tMundos = useTranslations("Mundos.nombres");
  const [capsulas, setCapsulas] = useState<Capsula[] | null>(null);
  const [misiones, setMisiones] = useState<Mision[]>([]);
  const [calendario, setCalendario] = useState<EstadoCalendario | null>(null);
  const [regalos, setRegalos] = useState<Regalo[]>([]);
  const [colecciones, setColecciones] = useState<PiezaColeccion[]>([]);
  const [constelaciones, setConstelaciones] = useState<DatosConstelacion[]>([]);
  const [verComo, setVerComo] = useState(false);
  const [abriendo, setAbriendo] = useState<Capsula | null>(null);
  const [verContenido, setVerContenido] = useState<{ capsula: Capsula; filas: ContenidoCapsula[] } | null>(null);
  const [verCiudad, setVerCiudad] = useState<string | null>(null);
  const [ocupado, setOcupado] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [sinBase, setSinBase] = useState(false);
  // Premios por anuncio que ya usaste hoy (0277); null mientras no se sabe.
  const [extrasHoy, setExtrasHoy] = useState<PremioAnuncio[] | null>(null);
  const esPro = plan === "pro";
  const conAnuncios = useSyncExternalStore(suscribirPublicidadWeb, publicidadWebActiva, () => false);
  const hayExtras = esPro || (plan === "free" && conAnuncios);

  const cargar = useCallback(async () => {
    const sb = createClient();
    try {
      await revisarRecompensas(sb);
      const [c, m, cal, r, col, cons] = await Promise.all([misCapsulas(sb), misMisiones(sb), miCalendario(sb), misRegalos(sb), misColecciones(sb), misConstelaciones(sb)]);
      setConstelaciones(cons);
      setCapsulas(c);
      setMisiones(m);
      setCalendario(cal);
      setRegalos(r);
      setColecciones(col);
      premiosAnuncioHoy(sb).then(setExtrasHoy, () => setExtrasHoy(null));
      setSinBase(!cal && c.length === 0 && m.length === 0);
      refrescarCosmeticosWeb();
    } catch {
      setCapsulas([]);
      setSinBase(true);
    }
  }, []);

  useEffect(() => {
    if (invitado) return;
    // Carga inicial desde la base (sistema externo).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    cargar();
  }, [cargar, invitado]);

  const porCiudad = useMemo(() => {
    const m = new Map<string, PiezaColeccion[]>();
    for (const p of colecciones) m.set(p.mundo, [...(m.get(p.mundo) ?? []), p]);
    return m;
  }, [colecciones]);

  function mostrarAviso(texto: string) {
    setAviso(texto);
    setTimeout(() => setAviso(null), 2500);
  }

  async function accion(clave: string, f: () => Promise<string | null>) {
    setOcupado(clave);
    try {
      const texto = await f();
      if (texto) mostrarAviso(texto);
      await cargar();
    } catch (e) {
      mostrarAviso(mensajeError(e));
    } finally {
      setOcupado(null);
    }
  }

  // Duplicar el calendario o una cápsula extra: con un anuncio (gratis) o directo (Pro).
  function extra(tipo: PremioAnuncio) {
    accion(`extra-${tipo}`, async () => {
      if (!esPro && !(await anuncioConPremioWeb())) throw new Error("sin anuncio");
      const r = await premioPorAnuncio(createClient(), tipo);
      reproducirTono("compra");
      if (tipo === "capsula") return t("extras.capsulaLista");
      return r.premio === "estrellas" ? t("calendario.estrellas", { n: r.cantidad }) : t("extras.duplicado");
    });
  }

  function detalle(c: Capsula): string {
    const d = c.detalle;
    const ciudad = c.mundo ? tMundos(c.mundo) : "";
    if (c.tipo === "nivel" && d?.nivel) return t("detalle.nivel", { n: d.nivel });
    if (c.tipo === "racha" && d?.dias) return t("detalle.racha", { n: d.dias });
    if (c.tipo === "racha") return t("detalle.calendario");
    if (c.tipo === "ciudad" && d?.dominio) return t("detalle.dominio", { ciudad });
    if (c.tipo === "ciudad" && d?.nivel) return t("detalle.ciudad", { ciudad, n: d.nivel });
    if (c.tipo.startsWith("liga") && d?.puesto) return t("detalle.liga", { n: d.puesto });
    if (c.tipo === "coleccion") return t("detalle.coleccion", { ciudad });
    if (c.tipo === "misiones") return t("detalle.misiones");
    if (c.tipo === "pro") return t("detalle.pro");
    if (c.tipo === "plata" || c.tipo === "oro" || c.tipo === "prisma") return t("detalle.fusion");
    if (c.tipo === "alineacion") return t("detalle.alineacion", { n: (c.detalle as { numero?: number } | null)?.numero ?? 1 });
    if (c.tipo === "estelar" || c.tipo === "supernova") return t("detalle.comprada");
    return t("detalle.diaria");
  }

  function textoPremio(f: ContenidoCapsula, mundo: string | null): string {
    if (f.premio === "chispas") return f.minimo === f.maximo ? t("premios.chispasFijo", { n: f.minimo }) : t("premios.chispas", { min: f.minimo, max: f.maximo });
    if (f.premio.startsWith("cosmetico_")) return t("premios.cosmetico", { rareza: t(`tienda.rareza.${f.premio.slice(10)}`).toLowerCase() });
    if (f.premio === "coleccion") return t("premios.coleccion", { ciudad: mundo ? tMundos(mundo) : "" });
    if (f.premio === "marco_coleccion") return t("premios.marcoColeccion", { ciudad: mundo ? tMundos(mundo) : "" });
    return t(`premios.${f.premio}`);
  }

  if (invitado) {
    return (
      <main className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6">
        <p className="text-texto-secundario">{t("invitado")}</p>
      </main>
    );
  }

  const totalPeso = verContenido ? verContenido.filas.reduce((a, f) => a + f.peso, 0) : 1;

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-8 sm:px-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-foreground">{t("titulo")}</h1>
        <p className="text-sm text-texto-secundario">{t("subtitulo")}</p>
      </div>

      {sinBase && <p className="rounded-2xl border border-racha/50 bg-racha/10 px-4 py-3 text-sm text-foreground">{t("sinBase")}</p>}

      {constelaciones.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="font-display text-lg font-bold text-foreground">{t("constelaciones.titulo")}</h2>
          <p className="text-sm text-texto-secundario">
            {t("constelaciones.nota")}{" "}
            <button type="button" className="font-semibold text-primario hover:underline" onClick={() => setVerComo((v) => !v)}>
              {t("constelaciones.comoFunciona")}
            </button>
          </p>
          {verComo && (
            <ul className="flex flex-col gap-1.5 rounded-2xl border border-border bg-surface p-4 text-sm text-foreground">
              {(t.raw("constelaciones.como") as string[]).map((x) => (
                <li key={x}>✦ {x}</li>
              ))}
              <li className="text-texto-secundario">{t("constelaciones.fugaz")}</li>
            </ul>
          )}
          <ContadorAlineacion />
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
            {[...constelaciones]
              .sort((a, b) => Number(b.favorita) - Number(a.favorita) || b.estrellas - a.estrellas)
              .map((c) => (
                <div key={c.mundo} className="flex flex-col items-center gap-1 text-center">
                  <Constelacion mundo={c.mundo} estrellas={c.estrellas} tam={96} />
                  <span className="text-xs font-bold text-foreground">
                    {c.de_noche ? "☾ " : ""}
                    {tMundos(c.mundo)}
                    {c.favorita ? " ★" : ""}
                  </span>
                  <span className="text-[11px] text-texto-secundario">
                    {t("constelaciones.estado", { n: c.estrellas, chispas: c.chispas_premio })} {c.falta_pieza ? t("constelaciones.pieza") : ""}
                  </span>
                </div>
              ))}
          </div>
          <p className="text-xs text-texto-secundario">{t("constelaciones.leyenda")}</p>
        </section>
      )}

      {(capsulas ?? []).length > 0 && (
        <CapsulasPorAbrir
          capsulas={capsulas ?? []}
          detalle={detalle}
          onAbrir={setAbriendo}
          onVer={async (c) => setVerContenido({ capsula: c, filas: await contenidoCapsula(createClient(), c.tipo) })}
          onCambio={() => void cargar()}
        />
      )}

      <section className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-4">
        <h2 className="font-display text-lg font-bold text-foreground">{t("calendario.titulo")}</h2>
        <div className="grid grid-cols-7 gap-1.5">
          {PREMIOS_CALENDARIO.map((p) => {
            const hecho = !!calendario && (calendario.reclamado_hoy ? p.dia <= calendario.dia : p.dia < calendario.dia);
            const hoy = !!calendario && p.dia === calendario.dia;
            return (
              <div key={p.dia} className={`flex flex-col items-center gap-1 rounded-xl border px-1 py-2 text-center ${hoy ? "border-logro bg-logro/10" : "border-border bg-surface-2"} ${hecho ? "opacity-55" : ""}`}>
                <span className="text-[10px] font-bold uppercase text-texto-secundario">{t("calendario.dia", { n: p.dia })}</span>
                <span className="text-lg">{hecho ? "✓" : p.premio === "chispas" ? "✦" : p.premio === "hielo" ? "🧊" : p.premio === "tiempo_extra" ? "⏱️" : "✨"}</span>
                <span className="text-[10px] leading-tight text-texto-secundario">{t(`calendario.premio.${p.premio}`, { n: p.cantidad })}</span>
              </div>
            );
          })}
        </div>
        {calendario && !calendario.reclamado_hoy ? (
          calendario.puede_reclamar ? (
            <button
              type="button"
              disabled={ocupado === "calendario"}
              onClick={() =>
                accion("calendario", async () => {
                  const r = await reclamarCalendario(createClient());
                  reproducirTono("compra");
                  return r.premio === "estrellas" ? t("calendario.estrellas", { n: r.cantidad }) : t("calendario.reclamado");
                })
              }
              className="rounded-full bg-logro px-6 py-3 font-display font-bold text-[#2A1A00] disabled:opacity-60"
            >
              {t("calendario.reclamar", { n: calendario.dia })}
            </button>
          ) : (
            <p className="text-center text-sm text-texto-secundario">{t("calendario.juegaPrimero", { n: calendario.dia })}</p>
          )
        ) : calendario ? (
          <>
            <p className="text-center text-sm text-texto-secundario">{t("calendario.vuelveManana", { n: calendario.dia === 7 ? 1 : calendario.dia + 1 })}</p>
            {hayExtras && extrasHoy && !extrasHoy.includes("calendario") && (
              <button
                type="button"
                disabled={ocupado === "extra-calendario"}
                onClick={() => extra("calendario")}
                className="self-center rounded-full border border-logro/60 px-5 py-2 text-sm font-semibold text-logro hover:bg-logro/10 disabled:opacity-60"
              >
                {esPro ? t("extras.duplicarPro") : t("extras.duplicarAnuncio")}
              </button>
            )}
          </>
        ) : null}
      </section>

      {hayExtras && extrasHoy && !extrasHoy.includes("capsula") && (
        <section className="flex items-center gap-4 rounded-2xl border border-border bg-surface p-4">
          <DibujoCapsula colores={coloresCapsula("diaria", null)} tam={52} />
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <p className="font-display font-bold text-foreground">{t("extras.capsulaTitulo")}</p>
            <p className="text-sm text-texto-secundario">{esPro ? t("extras.capsulaTextoPro") : t("extras.capsulaTextoAnuncio")}</p>
          </div>
          <button
            type="button"
            disabled={ocupado === "extra-capsula"}
            onClick={() => extra("capsula")}
            className="shrink-0 rounded-full bg-logro px-4 py-2 text-sm font-bold text-[#2A1A00] disabled:opacity-60"
          >
            {esPro ? t("extras.reclamarPro") : t("extras.verAnuncio")}
          </button>
        </section>
      )}

      <section className="flex flex-col gap-3">
        <h2 className="font-display text-lg font-bold text-foreground">{t("misiones.titulo")}</h2>
        {misiones.map((m) => {
          const lista = m.progreso >= m.meta;
          return (
            <div key={m.tipo} className={`flex items-center gap-3 rounded-2xl border bg-surface px-4 py-3 ${lista && !m.reclamada ? "border-correcto" : "border-border"}`}>
              <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                <p className="font-semibold text-foreground">{t(`misiones.tipos.${m.tipo}`, { n: m.meta, mundo: m.mundo ? tMundos(m.mundo) : "" })}</p>
                <div className="h-2 overflow-hidden rounded-full bg-foreground/10">
                  <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(100, (m.progreso / m.meta) * 100)}%`, background: lista ? "var(--correcto)" : "var(--primario)" }} />
                </div>
                <p className="text-xs text-texto-secundario">
                  {m.progreso} / {m.meta}
                </p>
              </div>
              {m.reclamada ? (
                <span className="text-xl text-correcto">✓</span>
              ) : (
                <button
                  type="button"
                  disabled={!lista || ocupado === m.tipo}
                  onClick={() =>
                    accion(m.tipo, async () => {
                      const r = await reclamarMision(createClient(), m.tipo);
                      reproducirTono("compra");
                      return r.capsula ? t("misiones.tresCompletas") : t("misiones.chispas", { n: m.recompensa });
                    })
                  }
                  className="shrink-0 rounded-full border border-logro/60 bg-logro/10 px-4 py-2 font-mono text-sm font-bold text-logro disabled:opacity-40"
                >
                  ✦ {m.recompensa}
                </button>
              )}
            </div>
          );
        })}
        <p className="text-xs text-texto-secundario">{t("misiones.nota")}</p>
      </section>

      {regalos.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="font-display text-lg font-bold text-foreground">{t("regalos.titulo")}</h2>
          {regalos.map((r) => (
            <div key={r.id} className="flex items-center gap-3 rounded-2xl border border-logro/50 bg-surface px-4 py-3">
              <span className="text-2xl">{r.tipo === "hielo" ? "🧊" : "🛡️"}</span>
              <p className="flex-1 text-sm font-semibold text-foreground">{t("regalos.recibio", { nombre: r.nombre ?? "?", regalo: r.tipo === "hielo" ? t("regalos.unHielo") : t("regalos.unEscudo") })}</p>
              <button
                type="button"
                disabled={ocupado === r.id}
                onClick={() =>
                  accion(r.id, async () => {
                    await recibirRegalo(createClient(), r.id);
                    reproducirTono("compra");
                    return null;
                  })
                }
                className="rounded-full border border-border bg-surface-2 px-4 py-2 text-sm font-semibold text-foreground"
              >
                {t("regalos.recibir")}
              </button>
            </div>
          ))}
        </section>
      )}

      <section className="flex flex-col gap-3">
        <h2 className="font-display text-lg font-bold text-foreground">{t("colecciones.titulo")}</h2>
        <p className="text-xs text-texto-secundario">{t("colecciones.nota")}</p>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
          {CIUDADES.map((c) => {
            const tengo = (porCiudad.get(c.slug) ?? []).filter((p) => p.tengo).length;
            return (
              <button key={c.slug} type="button" onClick={() => setVerCiudad(c.slug)} className="flex flex-col items-center gap-1 rounded-2xl border-2 bg-surface px-2 py-3" style={{ borderColor: `${c.color}${tengo === 6 ? "" : "77"}` }}>
                <span className="font-display text-lg font-bold" style={{ color: c.color }}>
                  {c.glifo}
                </span>
                <span className="text-xs font-semibold text-foreground">{tMundos(c.slug)}</span>
                <span className="h-1.5 w-full overflow-hidden rounded-full bg-foreground/10">
                  <span className="block h-full rounded-full" style={{ width: `${(tengo / 6) * 100}%`, background: c.color }} />
                </span>
                <span className="text-[10px] text-texto-secundario">{tengo}/6</span>
              </button>
            );
          })}
        </div>
      </section>

      {verContenido && (
        <div className="fixed inset-0 z-[95] flex items-end justify-center bg-black/60 p-4 sm:items-center" onClick={() => setVerContenido(null)} role="dialog" aria-modal="true">
          <div className="w-full max-w-md rounded-3xl border border-border bg-surface p-5" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-display text-xl font-bold text-foreground">{t(`capsulas.nombres.${verContenido.capsula.tipo}`)}</h3>
            <p className="mt-1 text-sm text-texto-secundario">{t("capsulas.probabilidades")}</p>
            <ul className="mt-3 flex flex-col gap-2">
              {verContenido.filas.map((f) => (
                <li key={f.premio} className="flex items-center justify-between gap-3 text-sm">
                  <span className="text-foreground">{textoPremio(f, verContenido.capsula.mundo)}</span>
                  <span className="font-mono font-bold text-logro">{Math.round((f.peso / totalPeso) * 100)} %</span>
                </li>
              ))}
            </ul>
            <button type="button" onClick={() => setVerContenido(null)} className="mt-4 w-full rounded-full border border-border px-4 py-2 text-sm font-semibold text-foreground">
              {t("capsulas.cerrar")}
            </button>
          </div>
        </div>
      )}

      {verCiudad && (
        <div className="fixed inset-0 z-[95] flex items-end justify-center bg-black/60 p-4 sm:items-center" onClick={() => setVerCiudad(null)} role="dialog" aria-modal="true">
          <div className="w-full max-w-md rounded-3xl border border-border bg-surface p-5" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-display text-xl font-bold text-foreground">{t("colecciones.de", { ciudad: tMundos(verCiudad) })}</h3>
            <ul className="mt-3 flex flex-col gap-3">
              {(porCiudad.get(verCiudad) ?? []).map((p) => {
                const it = CATALOGO_NUEVO.find((x) => x.item === p.slug);
                return (
                  <li key={p.slug} className={`flex items-center gap-3 ${p.tengo ? "" : "opacity-60"}`}>
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-surface-2">
                      <VistaCosmetico categoria={it?.categoria ?? p.categoria} valor={it?.valor ?? p.slug.replace(/^marco_/, "")} tam={36} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-semibold text-foreground">{p.nombre}</span>
                      <span className="block text-xs text-texto-secundario">
                        {t(`colecciones.categorias.${p.categoria}`)} · <span style={{ color: COLOR_RAREZA[p.rareza as Rareza] }}>{t(`tienda.rareza.${p.rareza}`)}</span> · {p.vendible ? t("colecciones.enTienda") : t("colecciones.enCapsulas")}
                      </span>
                    </span>
                    {p.tengo && <span className="text-correcto">✓</span>}
                  </li>
                );
              })}
            </ul>
            <Link href="/tienda" className="mt-4 block w-full rounded-full border border-border px-4 py-2 text-center text-sm font-semibold text-foreground">
              {t("colecciones.irTienda")}
            </Link>
          </div>
        </div>
      )}

      {abriendo && (
        <AbrirCapsula
          capsula={abriendo}
          onCerrar={() => {
            setAbriendo(null);
            cargar();
          }}
        />
      )}

      {aviso && (
        <div className="fixed bottom-6 left-1/2 z-[110] -translate-x-1/2 rounded-full bg-foreground px-5 py-2 text-sm font-semibold text-background shadow-lg" role="status">
          {aviso}
        </div>
      )}
    </main>
  );
}
