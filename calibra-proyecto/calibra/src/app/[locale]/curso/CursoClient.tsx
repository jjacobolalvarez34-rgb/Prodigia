"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";
import { ordenarMisTareas, type MiTarea } from "@/lib/docentes/panel";
import TarjetaTarea from "@/components/curso/TarjetaTarea";

export interface MiGrupo {
  group_id: string;
  nombre: string;
  docente_nombre: string | null;
  colegio: string | null;
  con_licencia: boolean;
  unido_at: string;
}

export default function CursoClient({ invitado, grupos, tareas }: { invitado: boolean; grupos: MiGrupo[]; tareas: MiTarea[] }) {
  const t = useTranslations("Curso.estudiante");
  const router = useRouter();
  const [ahora] = useState(() => Date.now());
  const [codigo, setCodigo] = useState("");
  const [uniendo, setUniendo] = useState(false);
  const [mensaje, setMensaje] = useState<{ ok: boolean; texto: string } | null>(null);
  const [saliendo, setSaliendo] = useState<string | null>(null);

  async function unirse(e: React.FormEvent) {
    e.preventDefault();
    if (codigo.trim().length < 4) return;
    setUniendo(true);
    setMensaje(null);
    const supabase = createClient();
    const { data, error } = await supabase.rpc("unirse_a_grupo", { p_codigo: codigo.trim().toUpperCase() });
    setUniendo(false);
    if (error) {
      setMensaje({ ok: false, texto: t("unirse.error") });
      return;
    }
    const fila = (data as { nombre: string }[] | null)?.[0];
    setMensaje({ ok: true, texto: t("unirse.ok", { nombre: fila?.nombre ?? "" }) });
    setCodigo("");
    // El Pro de la licencia del colegio se ve al recargar la sesión.
    router.refresh();
  }

  async function salir(groupId: string) {
    const supabase = createClient();
    await supabase.rpc("salir_de_grupo", { p_group_id: groupId });
    setSaliendo(null);
    router.refresh();
  }

  const ordenadas = ordenarMisTareas(tareas, ahora);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-4 py-10 sm:px-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">{t("titulo")}</h1>
        <p className="mt-1 text-sm text-texto-secundario">{t("subtitulo")}</p>
      </div>

      {invitado ? (
        <p className="rounded-2xl border border-logro/40 bg-logro/10 px-4 py-3 text-sm text-foreground">{t("invitado")}</p>
      ) : (
        <form onSubmit={unirse} className="flex flex-col gap-3 rounded-3xl border border-primario/30 bg-primario/5 p-5" data-tour="curso-unirse">
          <p className="font-display font-bold text-foreground">{t("unirse.titulo")}</p>
          <div className="flex flex-wrap gap-2">
            <input
              value={codigo}
              onChange={(e) => setCodigo(e.target.value.toUpperCase())}
              placeholder={t("unirse.placeholder")}
              maxLength={6}
              className="min-w-0 flex-1 rounded-xl border border-border bg-background px-3 py-2.5 font-mono text-lg uppercase tracking-[0.2em] text-foreground outline-none focus:border-primario"
            />
            <button type="submit" disabled={uniendo || codigo.trim().length < 4} className="rounded-xl bg-primario px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60">
              {uniendo ? t("unirse.uniendo") : t("unirse.boton")}
            </button>
          </div>
          {mensaje && <p className={`text-sm ${mensaje.ok ? "text-correcto" : "text-error"}`}>{mensaje.texto}</p>}
        </form>
      )}

      <section className="flex flex-col gap-3">
        <h2 className="font-display text-lg font-bold text-foreground">{t("tareas.titulo")}</h2>
        {ordenadas.length === 0 ? (
          <p className="text-sm text-texto-secundario">{t("tareas.vacio")}</p>
        ) : (
          ordenadas.map((tarea) => <TarjetaTarea key={tarea.tarea_id} tarea={tarea} ahora={ahora} />)
        )}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-display text-lg font-bold text-foreground">{t("cursos.titulo")}</h2>
        {grupos.length === 0 ? (
          <p className="text-sm text-texto-secundario">{t("cursos.vacio")}</p>
        ) : (
          grupos.map((g) => (
            <div key={g.group_id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-surface p-4">
              <div>
                <p className="font-display font-bold text-foreground">{g.nombre}</p>
                {g.docente_nombre && <p className="text-xs text-texto-secundario">{t("cursos.docente", { nombre: g.docente_nombre })}</p>}
                {g.con_licencia && (
                  <p className="mt-1 w-fit rounded-full bg-primario/10 px-2 py-0.5 text-[11px] font-semibold text-primario">
                    {t("cursos.pro")}
                    {g.colegio ? ` · ${g.colegio}` : ""}
                  </p>
                )}
              </div>
              {saliendo === g.group_id ? (
                <span className="inline-flex items-center gap-2 text-xs">
                  <span className="text-texto-secundario">{t("cursos.confirmarSalir", { nombre: g.nombre })}</span>
                  <button type="button" onClick={() => salir(g.group_id)} className="font-semibold text-error">{t("cursos.si")}</button>
                  <button type="button" onClick={() => setSaliendo(null)} className="text-texto-secundario">{t("cursos.no")}</button>
                </span>
              ) : (
                <button type="button" onClick={() => setSaliendo(g.group_id)} className="text-xs text-texto-secundario hover:text-error">
                  {t("cursos.salir")}
                </button>
              )}
            </div>
          ))
        )}
      </section>
    </div>
  );
}
