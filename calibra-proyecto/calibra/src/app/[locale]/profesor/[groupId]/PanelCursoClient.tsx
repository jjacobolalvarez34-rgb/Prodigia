"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";
import Avatar from "@/components/Avatar";
import { MUNDOS_LANDING } from "@/lib/mundos";
import {
  agruparTareas,
  alertasDelCurso,
  csvDelCurso,
  diasDesde,
  finDelDiaBogota,
  porcentaje,
  precision,
  resumenCurso,
  type DiaActividad,
  type FilaPanelAlumno,
  type FilaProgresoTarea,
} from "@/lib/docentes/panel";
import type { LicenciaDocente } from "../ProfesorClient";
import BorrarGrupo from "./BorrarGrupo";

interface Props {
  grupo: { id: string; nombre: string; codigo: string };
  filas: FilaPanelAlumno[];
  tareas: FilaProgresoTarea[];
  actividad: DiaActividad[];
  licencia: LicenciaDocente | null;
  faltaMigracion: boolean;
  // Demo pública (/docentes/demo): curso de ejemplo; todo se puede tocar pero nada se
  // guarda ni llama a la base.
  demo?: boolean;
}

const COLOR_MUNDO = Object.fromEntries(MUNDOS_LANDING.map((m) => [m.slug, m.colorHex])) as Record<string, string>;
const NOMBRE_MUNDO = Object.fromEntries(MUNDOS_LANDING.map((m) => [m.slug, m.nombre])) as Record<string, string>;

function hoyBogota(): string {
  return new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

function sumarDias(fechaIso: string, n: number): string {
  const d = new Date(`${fechaIso}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

export default function PanelCursoClient({ grupo, filas: filasIniciales, tareas: tareasIniciales, actividad, licencia, faltaMigracion, demo = false }: Props) {
  const t = useTranslations("Curso.panel");
  const locale = useLocale();
  const router = useRouter();
  const [ahora] = useState(() => Date.now());
  const [filas, setFilas] = useState(filasIniciales);
  const [filasTareas, setFilasTareas] = useState(tareasIniciales);
  const [copiado, setCopiado] = useState(false);

  const sinNombre = t("alumnos.sinNombre");
  const nombrePorId = useMemo(() => new Map(filas.map((f) => [f.user_id, f.display_name ?? sinNombre])), [filas, sinNombre]);
  const resumen = resumenCurso(filas);
  const alertas = alertasDelCurso(filas, ahora, sinNombre);
  const tareas = agruparTareas(
    filasTareas.filter((f) => nombrePorId.has(f.user_id)),
    ahora,
  );
  const fecha = (iso: string) => new Date(iso).toLocaleDateString(locale, { day: "numeric", month: "short" });

  async function copiarCodigo() {
    try {
      await navigator.clipboard.writeText(grupo.codigo);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 1800);
    } catch {
      // Sin permiso de portapapeles: el código igual queda a la vista.
    }
  }

  function exportar() {
    const csv = csvDelCurso(
      filas,
      tareas,
      {
        alumno: t("csv.alumno"),
        ejercicios7d: t("csv.ejercicios7d"),
        precision7d: t("csv.precision7d"),
        ejerciciosTotal: t("csv.ejerciciosTotal"),
        precisionTotal: t("csv.precisionTotal"),
        ultima: t("csv.ultima"),
        ciudad: t("csv.ciudad"),
      },
      (slug) => NOMBRE_MUNDO[slug] ?? slug,
      sinNombre,
    );
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `${grupo.nombre.replace(/[^\p{L}\p{N}]+/gu, "-")}-${hoyBogota()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function quitar(userId: string) {
    if (demo) {
      setFilas((prev) => prev.filter((f) => f.user_id !== userId));
      return;
    }
    const supabase = createClient();
    const { error } = await supabase.rpc("quitar_alumno_grupo", { p_group_id: grupo.id, p_user_id: userId });
    if (!error) {
      setFilas((prev) => prev.filter((f) => f.user_id !== userId));
      router.refresh();
    }
  }

  const maxEjercicios = Math.max(1, ...actividad.map((d) => d.ejercicios));
  const sinCupos = licencia?.vigente && licencia.usados >= licencia.cupos;

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-4 py-10 sm:px-6 print:max-w-none print:py-0">
      <p className="hidden font-display text-sm text-texto-secundario print:block">
        Prodigia · {t("informe", { fecha: new Date(ahora).toLocaleDateString(locale) })}
      </p>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link href={demo ? "/docentes" : "/profesor"} className="text-xs text-texto-secundario hover:underline print:hidden">
            {t("volver")}
          </Link>
          <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">{grupo.nombre}</h1>
        </div>
        <div className="flex flex-wrap items-center gap-2 print:hidden">
          <button type="button" onClick={exportar} className="rounded-xl border border-border px-4 py-2 text-sm font-semibold text-foreground hover:border-primario/50">
            {t("exportar")}
          </button>
          <button type="button" onClick={() => window.print()} className="rounded-xl border border-border px-4 py-2 text-sm font-semibold text-foreground hover:border-primario/50">
            {t("imprimir")}
          </button>
          {!demo && <BorrarGrupo groupId={grupo.id} nombreGrupo={grupo.nombre} />}
        </div>
      </div>

      <section className="flex flex-col gap-3 rounded-3xl border border-primario/30 bg-primario/5 p-5 sm:flex-row sm:items-center sm:justify-between print:hidden" data-tour="curso-codigo">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-primario">{t("codigo")}</p>
          <p className="font-mono text-3xl font-black tracking-[0.2em] text-foreground">{grupo.codigo}</p>
          <p className="mt-1 max-w-md text-sm text-texto-secundario">{t("compartir")}</p>
        </div>
        <button type="button" onClick={copiarCodigo} className="w-fit rounded-xl bg-primario px-5 py-2.5 text-sm font-semibold text-white">
          {copiado ? t("copiado") : t("copiar")}
        </button>
      </section>

      {licencia?.vigente && (
        <p className={`text-sm ${sinCupos ? "text-error" : "text-texto-secundario"}`}>
          {sinCupos ? t("sinCupos") : t("licencia", { colegio: licencia.colegio, usados: licencia.usados, cupos: licencia.cupos })}
        </p>
      )}
      {faltaMigracion && <p className="rounded-2xl border border-logro/40 bg-logro/10 px-4 py-3 text-sm text-foreground">{t("faltaMigracion")}</p>}

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4" data-tour="curso-resumen">
        <Kpi etiqueta={t("kpi.alumnos")} valor={String(resumen.alumnos)} />
        <Kpi etiqueta={t("kpi.activos")} valor={t("kpi.activosValor", { n: resumen.activos7d, total: resumen.alumnos })} />
        <Kpi etiqueta={t("kpi.ejercicios")} valor={resumen.ejercicios7d.toLocaleString(locale)} />
        <Kpi etiqueta={t("kpi.precision")} valor={porcentaje(resumen.precision7d)} />
      </section>

      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <section className="rounded-3xl border border-border bg-surface p-5">
          <h2 className="font-display text-sm font-bold text-foreground">{t("actividad.titulo")}</h2>
          {actividad.every((d) => d.ejercicios === 0) ? (
            <p className="mt-6 text-sm text-texto-secundario">{t("actividad.vacio")}</p>
          ) : (
            <div className="mt-4 flex h-36 items-end gap-1.5">
              {actividad.map((d) => (
                <div key={d.fecha} className="group relative flex h-full flex-1 flex-col justify-end">
                  <div
                    className="w-full rounded-t-md bg-primario/80 transition-colors group-hover:bg-primario"
                    style={{ height: `${Math.max(d.ejercicios > 0 ? 6 : 2, (d.ejercicios / maxEjercicios) * 100)}%` }}
                    title={t("actividad.leyenda", { fecha: fecha(`${d.fecha}T12:00:00Z`), ejercicios: d.ejercicios, activos: d.activos })}
                  />
                  <span className="mt-1 text-center font-mono text-[9px] text-texto-secundario">{Number(d.fecha.slice(8, 10))}</span>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-3xl border border-border bg-surface p-5" data-tour="curso-alertas">
          <h2 className="font-display text-sm font-bold text-foreground">{t("alertas.titulo")}</h2>
          {alertas.length === 0 ? (
            <p className="mt-4 text-sm text-correcto">{t("alertas.vacio")}</p>
          ) : (
            <ul className="mt-3 flex max-h-44 flex-col gap-2 overflow-y-auto print:max-h-none">
              {alertas.map((a) => (
                <li key={a.user_id} className="flex items-center justify-between gap-3 rounded-xl bg-surface-2 px-3 py-2 text-sm">
                  {demo ? (
                    <span className="font-medium text-foreground">{a.nombre}</span>
                  ) : (
                    <Link href={`/profesor/${grupo.id}/${a.user_id}`} className="font-medium text-foreground hover:underline">
                      {a.nombre}
                    </Link>
                  )}
                  <span className={a.motivo === "precision" ? "text-racha" : "text-error"}>
                    {a.motivo === "nunca" && t("alertas.nunca")}
                    {a.motivo === "inactivo" && t("alertas.inactivo", { dias: a.dias ?? 0 })}
                    {a.motivo === "precision" && t("alertas.precision", { p: porcentaje(a.precision ?? null) })}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <SeccionTareas
        grupoId={grupo.id}
        tareas={tareas}
        nombrePorId={nombrePorId}
        totalAlumnos={filas.length}
        fecha={fecha}
        faltaMigracion={faltaMigracion}
        demo={
          demo
            ? {
                crear: (base) => setFilasTareas((prev) => [...filas.map((f) => ({ ...base, user_id: f.user_id, hechos: 0, correctos: 0 })), ...prev]),
                borrar: (id) => setFilasTareas((prev) => prev.filter((f) => f.tarea_id !== id)),
              }
            : undefined
        }
      />

      <section className="flex flex-col gap-3" data-tour="curso-alumnos">
        <h2 className="font-display text-lg font-bold text-foreground">{t("alumnos.titulo")}</h2>
        {filas.length === 0 ? (
          <p className="rounded-2xl border border-border bg-surface px-6 py-8 text-center text-texto-secundario">{t("alumnos.vacio")}</p>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-border">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="bg-surface-2 text-xs uppercase tracking-wide text-texto-secundario">
                <tr>
                  <th className="px-4 py-3">{t("alumnos.columnas.alumno")}</th>
                  <th className="px-3 py-3">{t("alumnos.columnas.semana")}</th>
                  <th className="px-3 py-3">{t("alumnos.columnas.precision")}</th>
                  <th className="px-3 py-3">{t("alumnos.columnas.total")}</th>
                  <th className="px-3 py-3">{t("alumnos.columnas.ultima")}</th>
                  <th className="px-3 py-3">{t("alumnos.columnas.ciudad")}</th>
                  <th className="px-3 py-3 print:hidden" />
                </tr>
              </thead>
              <tbody>
                {filas.map((f) => (
                  <FilaAlumno key={f.user_id} grupoId={grupo.id} fila={f} ahora={ahora} sinNombre={sinNombre} demo={demo} onQuitar={() => quitar(f.user_id)} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function Kpi({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <div className="rounded-2xl border border-border bg-surface px-4 py-4">
      <p className="text-[11px] font-medium uppercase tracking-wide text-texto-secundario">{etiqueta}</p>
      <p className="mt-1 font-display text-2xl font-black text-foreground">{valor}</p>
    </div>
  );
}

function FilaAlumno({ grupoId, fila: f, ahora, sinNombre, demo, onQuitar }: { grupoId: string; fila: FilaPanelAlumno; ahora: number; sinNombre: string; demo: boolean; onQuitar: () => void }) {
  const t = useTranslations("Curso.panel.alumnos");
  const [confirmar, setConfirmar] = useState(false);
  const nombre = f.display_name ?? sinNombre;
  const dias = diasDesde(f.ultima_actividad, ahora);
  const ultima = dias === null ? t("nunca") : dias === 0 ? t("hoy") : dias === 1 ? t("ayer") : t("haceDias", { n: dias });
  return (
    <tr className="border-t border-border">
      <td className="px-4 py-3">
        <Link
          href={demo ? "#" : `/profesor/${grupoId}/${f.user_id}`}
          onClick={demo ? (e) => e.preventDefault() : undefined}
          className="flex items-center gap-2 font-medium text-foreground hover:text-primario"
        >
          <Avatar url={f.avatar_url} nombre={f.display_name} size={28} />
          <span className="hover:underline">{nombre}</span>
          {f.pro_colegio && <span className="rounded-full bg-primario/10 px-2 py-0.5 text-[10px] font-semibold text-primario">{t("pro")}</span>}
        </Link>
      </td>
      <td className="px-3 py-3 font-mono">{f.ejercicios_7d}</td>
      <td className="px-3 py-3 font-mono">{porcentaje(precision(f.correctos_7d, f.ejercicios_7d))}</td>
      <td className="px-3 py-3 font-mono">{f.ejercicios_total}</td>
      <td className={`px-3 py-3 ${dias === null || dias >= 7 ? "text-error" : "text-texto-secundario"}`}>{ultima}</td>
      <td className="px-3 py-3">
        {f.mundo_top_7d ? (
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: COLOR_MUNDO[f.mundo_top_7d] ?? "#6C4CF1" }} />
            {NOMBRE_MUNDO[f.mundo_top_7d] ?? f.mundo_top_7d}
          </span>
        ) : (
          "—"
        )}
      </td>
      <td className="px-3 py-3 text-right print:hidden">
        {confirmar ? (
          <span className="inline-flex items-center gap-2 whitespace-nowrap text-xs">
            <span className="text-texto-secundario">{t("confirmarQuitar", { nombre })}</span>
            <button type="button" onClick={onQuitar} className="font-semibold text-error">{t("si")}</button>
            <button type="button" onClick={() => setConfirmar(false)} className="text-texto-secundario">{t("no")}</button>
          </span>
        ) : (
          <button type="button" onClick={() => setConfirmar(true)} className="text-xs text-texto-secundario hover:text-error">
            {t("quitar")}
          </button>
        )}
      </td>
    </tr>
  );
}

function SeccionTareas({
  grupoId,
  tareas,
  nombrePorId,
  totalAlumnos,
  fecha,
  faltaMigracion,
  demo,
}: {
  grupoId: string;
  tareas: ReturnType<typeof agruparTareas>;
  nombrePorId: Map<string, string>;
  totalAlumnos: number;
  fecha: (iso: string) => string;
  faltaMigracion: boolean;
  demo?: { crear: (base: Omit<FilaProgresoTarea, "user_id" | "hechos" | "correctos">) => void; borrar: (id: string) => void };
}) {
  const t = useTranslations("Curso.panel.tareas");
  const router = useRouter();
  const [abierta, setAbierta] = useState(false);
  const [mundo, setMundo] = useState<string>("numeria");
  const [titulo, setTitulo] = useState("");
  const [meta, setMeta] = useState(20);
  const [vence, setVence] = useState(() => sumarDias(hoyBogota(), 7));
  const [instrucciones, setInstrucciones] = useState("");
  const [creando, setCreando] = useState(false);
  const [error, setError] = useState(false);
  const [detalle, setDetalle] = useState<string | null>(null);
  const [borrando, setBorrando] = useState<string | null>(null);

  async function crear(e: React.FormEvent) {
    e.preventDefault();
    if (titulo.trim().length < 2) return;
    setCreando(true);
    setError(false);
    if (demo) {
      demo.crear({
        tarea_id: `demo-${Date.now()}`,
        mundo,
        titulo: titulo.trim(),
        instrucciones: instrucciones.trim() || null,
        meta_ejercicios: meta,
        inicia_at: new Date().toISOString(),
        vence_at: new Date(finDelDiaBogota(vence)).toISOString(),
      });
      setCreando(false);
      setTitulo("");
      setInstrucciones("");
      setAbierta(false);
      return;
    }
    const supabase = createClient();
    const { error: err } = await supabase.rpc("crear_tarea_grupo", {
      p_group_id: grupoId,
      p_mundo: mundo,
      p_titulo: titulo.trim(),
      p_instrucciones: instrucciones.trim() || null,
      p_meta: meta,
      p_vence_at: finDelDiaBogota(vence),
    });
    setCreando(false);
    if (err) {
      setError(true);
      return;
    }
    setTitulo("");
    setInstrucciones("");
    setAbierta(false);
    router.refresh();
  }

  async function borrar(id: string) {
    if (demo) {
      demo.borrar(id);
      setBorrando(null);
      return;
    }
    const supabase = createClient();
    await supabase.rpc("borrar_tarea_grupo", { p_tarea_id: id });
    setBorrando(null);
    router.refresh();
  }

  const campo = "rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-primario";

  return (
    <section className="flex flex-col gap-3" data-tour="curso-tareas">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-display text-lg font-bold text-foreground">{t("titulo")}</h2>
        {!faltaMigracion && (
          <button type="button" onClick={() => setAbierta((v) => !v)} className="rounded-xl bg-primario px-4 py-2 text-sm font-semibold text-white print:hidden">
            {t("nueva")}
          </button>
        )}
      </div>

      {abierta && (
        <form onSubmit={crear} className="grid gap-3 rounded-3xl border border-border bg-surface p-5 sm:grid-cols-2 print:hidden">
          <label className="flex flex-col gap-1 text-xs font-medium text-texto-secundario">
            {t("ciudad")}
            <select value={mundo} onChange={(e) => setMundo(e.target.value)} className={campo}>
              {MUNDOS_LANDING.map((m) => (
                <option key={m.slug} value={m.slug}>
                  {m.nombre}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-xs font-medium text-texto-secundario">
            {t("tituloCampo")}
            <input value={titulo} onChange={(e) => setTitulo(e.target.value)} maxLength={80} placeholder={t("tituloPlaceholder")} className={campo} />
          </label>
          <label className="flex flex-col gap-1 text-xs font-medium text-texto-secundario">
            {t("meta")}
            <input type="number" min={5} max={300} value={meta} onChange={(e) => setMeta(Math.min(300, Math.max(5, Number(e.target.value) || 5)))} className={campo} />
          </label>
          <label className="flex flex-col gap-1 text-xs font-medium text-texto-secundario">
            {t("vence")}
            <input type="date" min={hoyBogota()} value={vence} onChange={(e) => setVence(e.target.value)} className={campo} />
          </label>
          <label className="flex flex-col gap-1 text-xs font-medium text-texto-secundario sm:col-span-2">
            {t("instrucciones")}
            <textarea value={instrucciones} onChange={(e) => setInstrucciones(e.target.value)} maxLength={400} rows={2} className={campo} />
          </label>
          <div className="flex items-center gap-3 sm:col-span-2">
            <button type="submit" disabled={creando || titulo.trim().length < 2} className="rounded-xl bg-primario px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60">
              {creando ? t("creando") : t("crear")}
            </button>
            {error && <p className="text-sm text-error">{t("error")}</p>}
          </div>
        </form>
      )}

      {tareas.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border px-6 py-6 text-center text-sm text-texto-secundario">{t("vacio")}</p>
      ) : (
        <div className="flex flex-col gap-3">
          {tareas.map((tarea) => {
            const total = Math.max(totalAlumnos, tarea.alumnos.length);
            const pct = total > 0 ? (tarea.cumplidas / total) * 100 : 0;
            const color = COLOR_MUNDO[tarea.mundo] ?? "#6C4CF1";
            return (
              <div key={tarea.tarea_id} className={`rounded-2xl border border-border bg-surface p-5 ${tarea.vencida ? "opacity-75" : ""}`}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-display font-bold text-foreground">{tarea.titulo}</p>
                    <p className="mt-0.5 flex items-center gap-1.5 text-xs text-texto-secundario">
                      <span className="h-2 w-2 rounded-full" style={{ background: color }} />
                      {t("metaTexto", { n: tarea.meta_ejercicios, ciudad: NOMBRE_MUNDO[tarea.mundo] ?? tarea.mundo })} ·{" "}
                      {tarea.vencida ? t("vencida") : t("venceEl", { fecha: fecha(tarea.vence_at) })}
                    </p>
                    {tarea.instrucciones && <p className="mt-2 text-sm text-texto-secundario">{tarea.instrucciones}</p>}
                  </div>
                  <div className="flex items-center gap-3 text-xs print:hidden">
                    <button type="button" onClick={() => setDetalle(detalle === tarea.tarea_id ? null : tarea.tarea_id)} className="font-semibold text-primario">
                      {detalle === tarea.tarea_id ? t("ocultar") : t("verDetalle")}
                    </button>
                    {borrando === tarea.tarea_id ? (
                      <span className="inline-flex items-center gap-2">
                        <span className="text-texto-secundario">{t("confirmarBorrar")}</span>
                        <button type="button" onClick={() => borrar(tarea.tarea_id)} className="font-semibold text-error">{t("si")}</button>
                        <button type="button" onClick={() => setBorrando(null)} className="text-texto-secundario">{t("no")}</button>
                      </span>
                    ) : (
                      <button type="button" onClick={() => setBorrando(tarea.tarea_id)} className="text-texto-secundario hover:text-error">
                        {t("borrar")}
                      </button>
                    )}
                  </div>
                </div>
                <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-surface-2">
                  <div className="h-full rounded-full transition-[width] duration-700" style={{ width: `${pct}%`, background: color }} />
                </div>
                <p className="mt-2 text-xs text-texto-secundario">
                  {t("progreso", { cumplidas: tarea.cumplidas, total })} · {t("enCurso", { n: tarea.enCurso })} · {t("pendientes", { n: tarea.pendientes })}
                </p>
                {(detalle === tarea.tarea_id) && (
                  <ul className="mt-3 grid gap-1.5 sm:grid-cols-2">
                    {tarea.alumnos.map((a) => (
                      <li key={a.user_id} className="flex items-center justify-between gap-2 rounded-lg bg-surface-2 px-3 py-1.5 text-sm">
                        <span className="truncate text-foreground">{nombrePorId.get(a.user_id)}</span>
                        <span className={`shrink-0 font-mono text-xs ${a.estado === "cumplida" ? "text-correcto" : a.estado === "en_curso" ? "text-racha" : "text-texto-secundario"}`}>
                          {a.hechos}/{tarea.meta_ejercicios} · {t(`estado.${a.estado}`)}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
