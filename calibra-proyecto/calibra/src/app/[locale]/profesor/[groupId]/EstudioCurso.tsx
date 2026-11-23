"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import Avatar from "@/components/Avatar";
import { MUNDOS_LANDING } from "@/lib/mundos";
import type { FilaPanelAlumno } from "@/lib/docentes/panel";
import {
  distribucionPrecision,
  horasDelCurso,
  matrizConstancia,
  MIN_TEMA_CURSO,
  perfilAlumno,
  recomendaciones,
  temasDelCurso,
  type Etiqueta,
  type FilaEstudio,
  type FilaHabito,
  type PerfilAlumno,
  type Recomendacion,
} from "@/lib/docentes/estudio";
import { nombreTema } from "@/lib/docentes/temas";

// Estudio del curso (0319): recomendaciones, temas, perfiles y hábitos. Todo se calcula
// en el cliente con lib/docentes/estudio.ts a partir de estudio_grupo y habitos_grupo.

const COLOR_MUNDO = Object.fromEntries(MUNDOS_LANDING.map((m) => [m.slug, m.colorHex])) as Record<string, string>;
const NOMBRE_MUNDO = Object.fromEntries(MUNDOS_LANDING.map((m) => [m.slug, m.nombre])) as Record<string, string>;

const COLOR_ETIQUETA: Record<Etiqueta, string> = {
  sin_actividad: "#8892B0",
  en_riesgo: "#FF5D5D",
  apurado: "#FF8A3D",
  estancado: "#F2C14E",
  progresa: "#3DDC97",
  lento_seguro: "#4FE0F5",
  solido: "#9B85FF",
  en_camino: "#B9A8FF",
};
const ORDEN_ETIQUETA: Etiqueta[] = ["en_riesgo", "sin_actividad", "apurado", "estancado", "en_camino", "lento_seguro", "progresa", "solido"];

function pct(v: number | null) {
  return v === null ? "—" : `${Math.round(v * 100)} %`;
}

export interface AsignarTarea {
  (t: { mundo: string; titulo: string; meta: number }): Promise<boolean>;
}

export default function EstudioCurso({
  filas,
  estudio,
  habitos,
  faltaMigracion,
  onAsignar,
}: {
  filas: FilaPanelAlumno[];
  estudio: FilaEstudio[];
  habitos: FilaHabito[];
  faltaMigracion: boolean;
  onAsignar: AsignarTarea;
}) {
  const t = useTranslations("Curso.estudio");
  const locale = useLocale();
  const [ahora] = useState(() => Date.now());
  const sinNombre = useTranslations("Curso.panel.alumnos")("sinNombre");
  const nombres = useMemo(() => new Map(filas.map((f) => [f.user_id, f.display_name ?? sinNombre])), [filas, sinNombre]);
  const temas = useMemo(() => temasDelCurso(estudio.filter((e) => nombres.has(e.user_id))), [estudio, nombres]);
  const perfiles = useMemo(() => filas.map((f) => perfilAlumno(f.user_id, estudio, temas, habitos, ahora)), [filas, estudio, temas, habitos, ahora]);
  const recs = useMemo(() => recomendaciones(temas, perfiles), [temas, perfiles]);

  if (faltaMigracion) return <p className="rounded-2xl border border-logro/40 bg-logro/10 px-4 py-3 text-sm text-foreground">{t("faltaMigracion")}</p>;
  if (estudio.length === 0) return <p className="rounded-2xl border border-dashed border-border px-6 py-10 text-center text-texto-secundario">{t("vacio")}</p>;

  return (
    <div className="flex flex-col gap-10">
      <p className="text-sm text-texto-secundario">{t("intro")}</p>
      <Recomendaciones recs={recs} nombres={nombres} locale={locale} onAsignar={onAsignar} />
      <TablaTemas temas={temas} locale={locale} />
      <Perfiles filas={filas} perfiles={perfiles} locale={locale} />
      <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        <Constancia habitos={habitos} filas={filas} ahora={ahora} />
        <div className="flex flex-col gap-4">
          <Horas habitos={habitos} />
          <Distribucion perfiles={perfiles} />
        </div>
      </div>
    </div>
  );
}

function Recomendaciones({ recs, nombres, locale, onAsignar }: { recs: Recomendacion[]; nombres: Map<string, string>; locale: string; onAsignar: AsignarTarea }) {
  const t = useTranslations("Curso.estudio.recomendaciones");
  const [hechas, setHechas] = useState<Set<number>>(new Set());
  if (recs.length === 0) return null;
  const lista = (ids?: string[]) => (ids ?? []).map((id) => nombres.get(id) ?? "").filter(Boolean).join(", ");
  return (
    <section className="flex flex-col gap-3" data-tour="estudio-recomendaciones">
      <h2 className="font-display text-lg font-bold text-foreground">{t("titulo")}</h2>
      <div className="grid gap-3 md:grid-cols-2">
        {recs.map((r, i) => {
          const tema = r.tema ? nombreTema(r.tema, locale) : "";
          const ciudad = r.mundo ? NOMBRE_MUNDO[r.mundo] ?? r.mundo : "";
          const params = { tema, ciudad, valor: Math.abs(r.valor ?? 0), n: r.alumnos?.length ?? 0, nombres: lista(r.alumnos) };
          const color = r.prioridad === 1 ? "#FF5D5D" : r.prioridad === 2 ? "#FF8A3D" : "#3DDC97";
          return (
            <div key={i} className="flex flex-col gap-2 rounded-2xl border border-border bg-surface p-5" style={{ borderLeft: `4px solid ${color}` }}>
              <p className="font-display font-bold text-foreground">{t(`${r.tipo}.titulo`, params)}</p>
              <p className="text-sm text-texto-secundario">{t(`${r.tipo}.texto`, params)}</p>
              {r.tarea && (
                <button
                  type="button"
                  disabled={hechas.has(i)}
                  onClick={async () => {
                    const ok = await onAsignar({ mundo: r.tarea!.mundo, titulo: t("tituloTarea", { tema }), meta: r.tarea!.meta });
                    if (ok) setHechas((prev) => new Set(prev).add(i));
                  }}
                  className="mt-1 w-fit rounded-full bg-primario px-4 py-2 text-xs font-semibold text-white disabled:bg-correcto/20 disabled:text-correcto print:hidden"
                >
                  {hechas.has(i) ? t("asignada") : t("asignar")}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

function TablaTemas({ temas, locale }: { temas: ReturnType<typeof temasDelCurso>; locale: string }) {
  const t = useTranslations("Curso.estudio.temas");
  const [todos, setTodos] = useState(false);
  const visibles = todos ? temas : temas.slice(0, 8);
  return (
    <section className="flex flex-col gap-3" data-tour="estudio-temas">
      <div>
        <h2 className="font-display text-lg font-bold text-foreground">{t("titulo")}</h2>
        <p className="text-sm text-texto-secundario">{t("texto")}</p>
      </div>
      <div className="overflow-x-auto rounded-2xl border border-border">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-surface-2 text-xs uppercase tracking-wide text-texto-secundario">
            <tr>
              <th className="px-4 py-3">{t("columnas.tema")}</th>
              <th className="px-3 py-3">{t("columnas.precision")}</th>
              <th className="px-3 py-3">{t("columnas.tendencia")}</th>
              <th className="px-3 py-3">{t("columnas.dificultad")}</th>
              <th className="px-3 py-3">{t("columnas.ejercicios")}</th>
              <th className="px-3 py-3">{t("columnas.tiempo")}</th>
              <th className="px-3 py-3">{t("columnas.nivel")}</th>
            </tr>
          </thead>
          <tbody>
            {visibles.map((x) => {
              const pocos = x.intentos < MIN_TEMA_CURSO;
              const p = x.precision ?? 0;
              const color = p < 0.65 ? "#FF5D5D" : p < 0.8 ? "#FF8A3D" : "#3DDC97";
              return (
                <tr key={x.tema} className="border-t border-border">
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: COLOR_MUNDO[x.mundo] ?? "#6C4CF1" }} />
                      <span className="font-medium text-foreground">{nombreTema(x.tema, locale)}</span>
                      <span className="text-xs text-texto-secundario">{NOMBRE_MUNDO[x.mundo] ?? x.mundo}</span>
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    {pocos ? (
                      <span className="text-xs text-texto-secundario">{t("pocos")}</span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <span className="h-1.5 w-16 overflow-hidden rounded-full bg-surface-2">
                          <span className="block h-full rounded-full" style={{ width: `${p * 100}%`, background: color }} />
                        </span>
                        <span className="font-mono">{pct(x.precision)}</span>
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-3 font-mono text-xs">
                    {x.tendencia === null ? (
                      <span className="text-texto-secundario">—</span>
                    ) : x.tendencia >= 3 ? (
                      <span className="text-correcto">{t("sube", { n: x.tendencia })}</span>
                    ) : x.tendencia <= -3 ? (
                      <span className="text-error">{t("baja", { n: x.tendencia })}</span>
                    ) : (
                      <span className="text-texto-secundario">{t("estable")}</span>
                    )}
                  </td>
                  <td className="px-3 py-3 font-mono">{x.conDificultad.length > 0 ? <span className="text-error">{x.conDificultad.length}</span> : "0"}</td>
                  <td className="px-3 py-3 font-mono">{x.intentos}</td>
                  <td className="px-3 py-3 font-mono">{x.tiempoMedianoMs ? t("segundos", { n: (x.tiempoMedianoMs / 1000).toFixed(1) }) : "—"}</td>
                  <td className="px-3 py-3 font-mono">{x.nivelPromedio ?? "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {temas.length > 8 && (
        <button type="button" onClick={() => setTodos((v) => !v)} className="w-fit text-sm font-semibold text-primario print:hidden">
          {todos ? t("verMenos") : t("verTodos", { n: temas.length })}
        </button>
      )}
    </section>
  );
}

function Perfiles({ filas, perfiles, locale }: { filas: FilaPanelAlumno[]; perfiles: PerfilAlumno[]; locale: string }) {
  const t = useTranslations("Curso.estudio.perfiles");
  const [abierto, setAbierto] = useState<string | null>(null);
  const porId = new Map(filas.map((f) => [f.user_id, f]));
  const ordenados = [...perfiles].sort((a, b) => ORDEN_ETIQUETA.indexOf(a.etiqueta) - ORDEN_ETIQUETA.indexOf(b.etiqueta));
  const cuenta = ORDEN_ETIQUETA.map((e) => [e, perfiles.filter((p) => p.etiqueta === e).length] as const).filter(([, n]) => n > 0);

  return (
    <section className="flex flex-col gap-3" data-tour="estudio-perfiles">
      <h2 className="font-display text-lg font-bold text-foreground">{t("titulo")}</h2>
      <div className="flex flex-wrap gap-2">
        {cuenta.map(([e, n]) => (
          <span key={e} className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-xs text-foreground" title={t(`descripcion.${e}`)}>
            <span className="h-2 w-2 rounded-full" style={{ background: COLOR_ETIQUETA[e] }} />
            {t(`etiquetas.${e}`)} · {n}
          </span>
        ))}
      </div>
      <div className="flex flex-col gap-2">
        {ordenados.map((p) => {
          const f = porId.get(p.user_id);
          const abiertoEste = abierto === p.user_id;
          return (
            <div key={p.user_id} className="rounded-2xl border border-border bg-surface">
              <button type="button" onClick={() => setAbierto(abiertoEste ? null : p.user_id)} className="flex w-full flex-wrap items-center gap-3 px-4 py-3 text-left" aria-expanded={abiertoEste}>
                <Avatar url={f?.avatar_url ?? null} nombre={f?.display_name ?? null} size={30} />
                <span className="min-w-0 flex-1 font-medium text-foreground">{f?.display_name ?? "—"}</span>
                <span className="rounded-full px-2.5 py-0.5 text-[11px] font-semibold" style={{ background: `${COLOR_ETIQUETA[p.etiqueta]}22`, color: COLOR_ETIQUETA[p.etiqueta] }}>
                  {t(`etiquetas.${p.etiqueta}`)}
                </span>
                <span className="w-14 text-right font-mono text-sm text-foreground">{pct(p.precision)}</span>
                <span className={`w-14 text-right font-mono text-xs ${p.tendencia === null ? "text-texto-secundario" : p.tendencia >= 3 ? "text-correcto" : p.tendencia <= -3 ? "text-error" : "text-texto-secundario"}`}>
                  {p.tendencia === null ? "—" : `${p.tendencia > 0 ? "+" : ""}${p.tendencia}`}
                </span>
                <span className="text-texto-secundario">{abiertoEste ? "−" : "+"}</span>
              </button>
              {abiertoEste && (
                <div className="grid gap-4 border-t border-border px-4 py-4 text-sm sm:grid-cols-2">
                  <div className="flex flex-col gap-2">
                    <p className="text-texto-secundario">{t(`descripcion.${p.etiqueta}`)}</p>
                    <Dato etiqueta={t("precision")} valor={`${pct(p.precision)} · ${t("ejercicios", { n: p.intentos })}`} />
                    <Dato
                      etiqueta={t("velocidad")}
                      valor={
                        p.velocidad === null
                          ? "—"
                          : p.velocidad < 0.9
                            ? t("rapido", { n: Math.round((1 - p.velocidad) * 100) })
                            : p.velocidad > 1.1
                              ? t("lento", { n: Math.round((p.velocidad - 1) * 100) })
                              : t("igual")
                      }
                    />
                    <Dato etiqueta={t("dias")} valor={`${p.diasActivos} / 28`} />
                    <Dato etiqueta={t("minutos")} valor={String(p.minutosSemana)} />
                    {p.horaPico !== null && <p className="text-xs text-texto-secundario">{t("hora", { hora: p.horaPico })}</p>}
                    {p.diasSinPracticar !== null && p.diasSinPracticar >= 2 && <p className="text-xs text-error">{t("ultimaVez", { n: p.diasSinPracticar })}</p>}
                  </div>
                  <div className="flex flex-col gap-3">
                    <ListaTemas titulo={t("fuertes")} temas={p.fuertes} locale={locale} color="#3DDC97" vacio={t("sinDatos")} />
                    <ListaTemas titulo={t("debiles")} temas={p.debiles} locale={locale} color="#FF5D5D" vacio={t("sinDatos")} />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

function Dato({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <p className="flex justify-between gap-3">
      <span className="text-texto-secundario">{etiqueta}</span>
      <span className="font-mono text-foreground">{valor}</span>
    </p>
  );
}

function ListaTemas({ titulo, temas, locale, color, vacio }: { titulo: string; temas: PerfilAlumno["fuertes"]; locale: string; color: string; vacio: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-texto-secundario">{titulo}</p>
      {temas.length === 0 ? (
        <p className="mt-1 text-xs text-texto-secundario">{vacio}</p>
      ) : (
        <ul className="mt-1.5 flex flex-col gap-1.5">
          {temas.map((x) => (
            <li key={x.tema} className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full" style={{ background: COLOR_MUNDO[x.mundo] ?? "#6C4CF1" }} />
              <span className="flex-1 text-foreground">{nombreTema(x.tema, locale)}</span>
              <span className="font-mono text-xs" style={{ color }}>
                {Math.round(x.precision * 100)} %
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Constancia({ habitos, filas, ahora }: { habitos: FilaHabito[]; filas: FilaPanelAlumno[]; ahora: number }) {
  const t = useTranslations("Curso.estudio.constancia");
  const { fechas, filas: m } = matrizConstancia(habitos, filas.map((f) => f.user_id), 28, ahora);
  const max = Math.max(1, ...[...m.values()].flat());
  return (
    <section className="rounded-3xl border border-border bg-surface p-5" data-tour="estudio-constancia">
      <h2 className="font-display text-sm font-bold text-foreground">{t("titulo")}</h2>
      <p className="text-xs text-texto-secundario">{t("texto")}</p>
      <div className="mt-4 overflow-x-auto">
        <div className="flex min-w-[520px] flex-col gap-1">
          {filas.map((f) => (
            <div key={f.user_id} className="flex items-center gap-2">
              <span className="w-28 shrink-0 truncate text-xs text-texto-secundario">{f.display_name ?? "—"}</span>
              <div className="grid flex-1 gap-[3px]" style={{ gridTemplateColumns: `repeat(${fechas.length}, minmax(0, 1fr))` }}>
                {(m.get(f.user_id) ?? []).map((v, k) => (
                  <span
                    key={k}
                    title={`${fechas[k]}: ${v}`}
                    className="aspect-square rounded-[3px]"
                    style={{ background: v === 0 ? "var(--surface-2)" : `color-mix(in oklab, #7C5CFF ${25 + Math.round((v / max) * 75)}%, transparent)` }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Horas({ habitos }: { habitos: FilaHabito[] }) {
  const t = useTranslations("Curso.estudio.horas");
  const horas = horasDelCurso(habitos);
  const max = Math.max(1, ...horas);
  return (
    <section className="rounded-3xl border border-border bg-surface p-5">
      <h2 className="font-display text-sm font-bold text-foreground">{t("titulo")}</h2>
      <div className="mt-4 flex h-24 items-end gap-[3px]">
        {horas.map((v, h) => (
          <div key={h} className="flex h-full flex-1 flex-col justify-end" title={`${h}:00 · ${v}`}>
            <div className="w-full rounded-t-sm bg-primario/80" style={{ height: `${Math.max(v > 0 ? 4 : 1, (v / max) * 100)}%` }} />
          </div>
        ))}
      </div>
      <div className="mt-1 flex justify-between font-mono text-[9px] text-texto-secundario">
        <span>0</span>
        <span>6</span>
        <span>12</span>
        <span>18</span>
        <span>23</span>
      </div>
    </section>
  );
}

function Distribucion({ perfiles }: { perfiles: PerfilAlumno[] }) {
  const t = useTranslations("Curso.estudio.distribucion");
  const d = distribucionPrecision(perfiles);
  const max = Math.max(1, ...d.map((x) => x.cantidad));
  const colores = ["#FF5D5D", "#FF8A3D", "#F2C14E", "#9B85FF", "#3DDC97"];
  return (
    <section className="rounded-3xl border border-border bg-surface p-5">
      <h2 className="font-display text-sm font-bold text-foreground">{t("titulo")}</h2>
      <p className="text-xs text-texto-secundario">{t("texto")}</p>
      <div className="mt-3 flex flex-col gap-1.5">
        {d.map((x, i) => (
          <div key={x.franja} className="flex items-center gap-2 text-xs">
            <span className="w-16 shrink-0 whitespace-nowrap font-mono text-texto-secundario">{x.franja} %</span>
            <div className="h-3 flex-1 overflow-hidden rounded-full bg-surface-2">
              <div className="h-full rounded-full" style={{ width: `${(x.cantidad / max) * 100}%`, background: colores[i] }} />
            </div>
            <span className="w-5 text-right font-mono text-foreground">{x.cantidad}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
