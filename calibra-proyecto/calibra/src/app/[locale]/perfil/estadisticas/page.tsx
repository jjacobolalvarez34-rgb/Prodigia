import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { requireUsuario, requirePro, bloquearInvitado } from "@/lib/auth/guard";
import Header from "@/components/Header";
import BotonEnlace from "@/components/BotonEnlace";
import { MUNDOS_LANDING } from "@/lib/mundos";
import { calcularRachaMaxima } from "@/lib/perfil/records";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Perfil.estadisticas");
  return { title: t("metadata.title"), description: t("metadata.description") };
}

interface FilaEstadistica {
  mundo: string;
  intentos: number;
  correctos: number;
  precision_pct: number;
  tiempo_ms: number;
}

interface FilaActividad {
  fecha: string;
  intentos: number;
  correctos: number;
  tiempo_ms: number;
}

interface FilaSubtema {
  mundo: string;
  problem_type: string;
  intentos: number;
  correctos: number;
  precision_pct: number;
}

interface TiendaTrastiendaStats {
  gasto_tienda_total: number;
  items_desbloqueados: number;
  apostado_total: number;
  ganado_total: number;
  perdido_total: number;
  balance_neto: number;
}

// No hay traducción por sub-tema exacto para los ~50 problem_type que
// existen entre los 7 mundos que tienen (fracciones_simplificar,
// quimia_organica, historia_fechas...) — armar esa tabla habría sido
// desproporcionado para una frase secundaria. Se "humaniza" el string
// crudo en vez de traducirlo: saca el prefijo del mundo y separa
// guiones bajos, sigue siendo entendible aunque no esté 100% prolijo.
function nombreSubtema(problemType: string, mundo: string): string {
  const sinPrefijo = problemType.startsWith(`${mundo}_`) ? problemType.slice(mundo.length + 1) : problemType;
  return sinPrefijo
    .split("_")
    .map((palabra) => palabra.charAt(0).toUpperCase() + palabra.slice(1))
    .join(" ");
}

// Umbral para que una ciudad cuente como "mejor"/"a reforzar" — evita
// que 1 intento con suerte al 100% se destaque como si fuera un patrón real.
const INTENTOS_MINIMOS_DESTACAR = 5;

function formatearMinutos(ms: number, t: Awaited<ReturnType<typeof getTranslations>>): string {
  const totalMin = Math.round(ms / 60_000);
  if (totalMin < 60) return t("kpi.minutos", { n: totalMin });
  return t("kpi.horasYMinutos", { h: Math.floor(totalMin / 60), m: totalMin % 60 });
}

function colorDeMundo(mundo: string): string {
  return MUNDOS_LANDING.find((m) => m.slug === mundo)?.colorHex ?? "#6C4CF1";
}

function formatearChispas(n: number): string {
  return `${n.toLocaleString()} ⚡`;
}

// Fase 4 (infraestructura de pagos): primer beneficio de Prodigia Pro
// con gate real (requirePro, ver src/lib/auth/guard.ts). Rediseño
// pedido en vivo (2026-09-15): "buenas estadisticas de CADA ciudad,
// mostrar tiempo jugado, estadisticas descriptivas, graficos... que no
// sea muy avanzado estadisticamente, completo" — antes era una tabla
// plana de precisión por mundo, ahora suma tiempo jugado (suma de
// time_ms, la única medida de "tiempo" que existe sin agregar
// tracking nuevo), un gráfico de barras de actividad diaria, y 3
// frases descriptivas simples (ciudad favorita/mejor precisión/a
// reforzar) — nada de desviaciones estándar ni intervalos de
// confianza, a propósito, según lo pedido.
export default async function EstadisticasPage() {
  const t = await getTranslations("Perfil.estadisticas");
  const tPerfil = await getTranslations("Perfil");
  const supabase = await createClient();
  const { user, profile } = await requireUsuario(supabase, "/perfil/estadisticas");
  const tBloqueos = await getTranslations("Bloqueos.invitado.secciones");
  bloquearInvitado(user, tBloqueos("perfil"));
  requirePro(profile, "/perfil/estadisticas");

  const [{ data: porMundo }, { data: actividad }, { data: dailyRows }, { data: subtemas }, { data: tiendaTrastienda }] =
    await Promise.all([
      supabase.rpc("estadisticas_pro_perfil"),
      supabase.rpc("estadisticas_pro_actividad_diaria"),
      supabase.from("daily_progress").select("fecha, meta_alcanzada, congelado").eq("user_id", user.id).limit(1000),
      supabase.rpc("estadisticas_pro_subtemas"),
      supabase.rpc("estadisticas_pro_tienda_trastienda"),
    ]);

  const filas = (porMundo as FilaEstadistica[] | null) ?? [];
  const filasSubtemas = (subtemas as FilaSubtema[] | null) ?? [];
  const statsTiendaTrastienda = ((tiendaTrastienda as TiendaTrastiendaStats[] | null) ?? [])[0] ?? null;
  // estadisticas_pro_subtemas ya viene ordenada por precisión asc DENTRO
  // de cada mundo — el primer resultado de cada uno es el más flojo.
  const peorSubtemaDe = (mundo: string) => filasSubtemas.find((s) => s.mundo === mundo) ?? null;
  // La RPC trae hasta 30 días, acá solo se muestran los últimos 14 —
  // 30 barras se apretaban demasiado en pantallas angostas (la app
  // también corre como app Android vía Capacitor).
  const actividadDiaria = ((actividad as FilaActividad[] | null) ?? []).slice(-14);

  const totalIntentos = filas.reduce((acc, f) => acc + f.intentos, 0);
  const totalCorrectos = filas.reduce((acc, f) => acc + f.correctos, 0);
  const tiempoTotalMs = filas.reduce((acc, f) => acc + f.tiempo_ms, 0);
  const precisionGlobal = totalIntentos > 0 ? totalCorrectos / totalIntentos : null;
  const rachaMaxima = calcularRachaMaxima(dailyRows ?? []);

  // estadisticas_pro_perfil ya ordena por cantidad de intentos desc.
  const favorita = filas[0] ?? null;
  const conSuficientes = filas.filter((f) => f.intentos >= INTENTOS_MINIMOS_DESTACAR);
  const mejor =
    conSuficientes.length > 0 ? conSuficientes.reduce((a, b) => (b.precision_pct > a.precision_pct ? b : a)) : null;
  const aReforzar =
    conSuficientes.length > 1 ? conSuficientes.reduce((a, b) => (b.precision_pct < a.precision_pct ? b : a)) : null;

  const maxIntentosDia = Math.max(1, ...actividadDiaria.map((a) => a.intentos));

  return (
    <>
      <Header autenticado invitado={user.is_anonymous} />
      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-4 py-12 sm:px-6">
        <div>
          <BotonEnlace href="/perfil" variante="secundario" atras tamano="sm">
            {t("volverAlPerfil")}
          </BotonEnlace>
          <h1 className="mt-2 font-display text-2xl font-bold tracking-tight text-foreground">{t("titulo")}</h1>
          <p className="text-sm text-texto-secundario">{t("subtitulo")}</p>
        </div>

        {filas.length === 0 ? (
          <p className="rounded-2xl border border-border bg-surface px-6 py-8 text-center text-sm text-texto-secundario">
            {t("vacio")}
          </p>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <TarjetaKpi label={t("kpi.tiempoJugado")} valor={formatearMinutos(tiempoTotalMs, t)} />
              <TarjetaKpi label={t("kpi.intentos")} valor={totalIntentos.toLocaleString()} />
              <TarjetaKpi
                label={t("kpi.precisionGlobal")}
                valor={precisionGlobal !== null ? `${Math.round(precisionGlobal * 100)}%` : "—"}
              />
              <TarjetaKpi label={t("kpi.rachaMaxima")} valor={t("kpi.dias", { n: rachaMaxima })} />
            </div>

            <div className="flex flex-col gap-2 rounded-2xl border border-border bg-surface px-5 py-4">
              {favorita && (
                <p className="text-sm text-foreground">
                  {t.rich("ciudadFavorita", {
                    ciudad: tPerfil(`publico.nombreMundo.${favorita.mundo}`),
                    destacado: (chunks) => (
                      <span className="font-semibold" style={{ color: colorDeMundo(favorita.mundo) }}>
                        {chunks}
                      </span>
                    ),
                  })}
                </p>
              )}
              {mejor && (
                <p className="text-sm text-foreground">
                  {t.rich("mejorPrecision", {
                    ciudad: tPerfil(`publico.nombreMundo.${mejor.mundo}`),
                    pct: Math.round(mejor.precision_pct * 100),
                    destacado: (chunks) => (
                      <span className="font-semibold" style={{ color: colorDeMundo(mejor.mundo) }}>
                        {chunks}
                      </span>
                    ),
                  })}
                </p>
              )}
              {aReforzar && mejor && aReforzar.mundo !== mejor.mundo && (
                <p className="text-sm text-foreground">
                  {t.rich("aReforzar", {
                    ciudad: tPerfil(`publico.nombreMundo.${aReforzar.mundo}`),
                    pct: Math.round(aReforzar.precision_pct * 100),
                    destacado: (chunks) => (
                      <span className="font-semibold" style={{ color: colorDeMundo(aReforzar.mundo) }}>
                        {chunks}
                      </span>
                    ),
                  })}
                </p>
              )}
            </div>

            {actividadDiaria.length > 0 && (
              <section className="flex flex-col gap-2">
                <h2 className="font-display text-sm font-bold text-foreground">{t("actividadTitulo")}</h2>
                {/* Bug (2026-09-15, reportado en vivo: "se ve vacío, no
                    muestra nada"): con items-end acá, cada columna del día
                    se achica a su contenido (align-items: flex-end no
                    estira los items) — el div interno flex-1 que debía
                    crecer con la barra terminaba sin altura real de
                    donde sacar el height: {pct}%, así que la barra medía
                    0px aunque los datos SÍ estaban (1851 intentos reales
                    en los últimos 30 días, confirmado). items-stretch
                    (el default) hace que cada columna sí llegue a los
                    112px del contenedor, y ahí el %  de la barra tiene
                    algo real contra qué calcularse. */}
                <div className="flex h-28 items-stretch gap-1 rounded-2xl border border-border bg-surface px-4 py-3">
                  {actividadDiaria.map((dia) => {
                    const pct = Math.max(4, Math.round((dia.intentos / maxIntentosDia) * 100));
                    const fecha = new Date(`${dia.fecha}T00:00:00Z`);
                    const diaMes = fecha.getUTCDate();
                    return (
                      <div key={dia.fecha} className="flex flex-1 flex-col items-center gap-1" title={t("actividadTooltip", { n: dia.intentos, dia: diaMes })}>
                        <div className="flex w-full flex-1 items-end">
                          <div
                            className="w-full rounded-t-sm bg-primario/70 transition-all"
                            style={{ height: `${pct}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-texto-secundario">{diaMes}</span>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            <section className="flex flex-col gap-3">
              <h2 className="font-display text-sm font-bold text-foreground">{t("porCiudadTitulo")}</h2>
              {filas.map((f) => {
                const color = colorDeMundo(f.mundo);
                const peorSubtema = peorSubtemaDe(f.mundo);
                return (
                  <div key={f.mundo} className="flex flex-col gap-2 rounded-xl border border-border bg-surface px-4 py-3">
                    <div className="flex items-center justify-between gap-4">
                      <p className="font-display text-sm font-bold text-foreground">{tPerfil(`publico.nombreMundo.${f.mundo}`)}</p>
                      <p className="font-mono text-lg font-bold" style={{ color }}>
                        {Math.round(f.precision_pct * 100)}%
                      </p>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-foreground/10">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${Math.round(f.precision_pct * 100)}%`, background: color }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-xs text-texto-secundario">
                      <span>{t("intentosCantidad", { n: f.intentos })}</span>
                      <span>{formatearMinutos(f.tiempo_ms, t)}</span>
                    </div>
                    {peorSubtema && peorSubtema.precision_pct < 0.9 && (
                      <p className="text-xs text-texto-secundario">
                        {t("teCuestaMas", {
                          tema: nombreSubtema(peorSubtema.problem_type, f.mundo),
                          pct: Math.round(peorSubtema.precision_pct * 100),
                        })}
                      </p>
                    )}
                  </div>
                );
              })}
              <p className="text-center text-xs text-texto-secundario">{t("totalIntentos", { n: totalIntentos })}</p>
            </section>
          </>
        )}

        <section className="flex flex-col gap-3">
          <div>
            <h2 className="font-display text-sm font-bold text-foreground">{t("tiendaTrastiendaTitulo")}</h2>
            <p className="text-xs text-texto-secundario">{t("tiendaTrastiendaSubtitulo")}</p>
          </div>
          {!statsTiendaTrastienda || (statsTiendaTrastienda.gasto_tienda_total === 0 && statsTiendaTrastienda.items_desbloqueados === 0 && statsTiendaTrastienda.apostado_total === 0) ? (
            <p className="rounded-2xl border border-border bg-surface px-6 py-8 text-center text-sm text-texto-secundario">
              {t("tiendaTrastiendaVacio")}
            </p>
          ) : (
            <>
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-texto-secundario">{t("tiendaSubtitulo")}</p>
                <div className="grid grid-cols-2 gap-3">
                  <TarjetaKpi label={t("kpi.gastoTienda")} valor={formatearChispas(statsTiendaTrastienda.gasto_tienda_total)} />
                  <TarjetaKpi
                    label={t("kpi.itemsDesbloqueados")}
                    valor={statsTiendaTrastienda.items_desbloqueados.toLocaleString()}
                  />
                </div>
                <p className="mt-2 text-[11px] text-texto-secundario">{t("tiendaGastoNota")}</p>
              </div>

              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-texto-secundario">{t("trastiendaSubtitulo")}</p>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <TarjetaKpi label={t("kpi.apostadoTotal")} valor={formatearChispas(statsTiendaTrastienda.apostado_total)} />
                  <TarjetaKpi label={t("kpi.ganadoTotal")} valor={formatearChispas(statsTiendaTrastienda.ganado_total)} />
                  <TarjetaKpi label={t("kpi.perdidoTotal")} valor={formatearChispas(statsTiendaTrastienda.perdido_total)} />
                  <TarjetaKpi
                    label={t("kpi.balanceNeto")}
                    valor={`${statsTiendaTrastienda.balance_neto >= 0 ? "+" : ""}${formatearChispas(statsTiendaTrastienda.balance_neto)}`}
                    claseValor={statsTiendaTrastienda.balance_neto >= 0 ? "text-correcto" : "text-error"}
                  />
                </div>
              </div>
            </>
          )}
        </section>
      </div>
    </>
  );
}

function TarjetaKpi({ label, valor, claseValor }: { label: string; valor: string; claseValor?: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-xl border border-border bg-surface px-3 py-3 text-center">
      <p className={`font-mono text-lg font-bold ${claseValor ?? "text-foreground"}`}>{valor}</p>
      <p className="text-[11px] leading-tight text-texto-secundario">{label}</p>
    </div>
  );
}
