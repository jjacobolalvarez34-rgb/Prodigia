"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";

export interface LicenciaAdmin {
  id: string;
  codigo: string;
  colegio: string;
  ciudad: string | null;
  contacto: string | null;
  cupos: number;
  usados: number;
  cursos: number;
  vence_at: string;
  docente_nombre: string | null;
  notas: string | null;
  created_at: string;
}

export default function AdminColegiosClient({ licencias }: { licencias: LicenciaAdmin[] }) {
  const t = useTranslations("Curso.admin");
  const locale = useLocale();
  const router = useRouter();
  const [colegio, setColegio] = useState("");
  const [ciudad, setCiudad] = useState("");
  const [contacto, setContacto] = useState("");
  const [cupos, setCupos] = useState(40);
  const [dias, setDias] = useState(30);
  const [notas, setNotas] = useState("");
  const [creando, setCreando] = useState(false);
  const [mensaje, setMensaje] = useState<{ ok: boolean; texto: string } | null>(null);
  const [errorExtender, setErrorExtender] = useState<string | null>(null);
  const [ahora] = useState(() => Date.now());

  async function crear(e: React.FormEvent) {
    e.preventDefault();
    if (colegio.trim().length < 2) return;
    setCreando(true);
    setMensaje(null);
    const { data, error } = await createClient().rpc("crear_licencia_colegio", {
      p_colegio: colegio.trim(),
      p_ciudad: ciudad.trim() || null,
      p_contacto: contacto.trim() || null,
      p_cupos: cupos,
      p_dias: dias,
      p_notas: notas.trim() || null,
    });
    setCreando(false);
    if (error) {
      setMensaje({ ok: false, texto: t("crear.error") });
      return;
    }
    const fila = (data as { codigo: string }[] | null)?.[0];
    setMensaje({ ok: true, texto: t("crear.ok", { codigo: fila?.codigo ?? "" }) });
    setColegio("");
    setCiudad("");
    setContacto("");
    setNotas("");
    router.refresh();
  }

  async function extender(id: string, masDias: number) {
    setErrorExtender(null);
    const { error } = await createClient().rpc("extender_licencia_colegio", { p_licencia_id: id, p_dias: masDias, p_cupos: null });
    if (error) {
      setErrorExtender(id);
      return;
    }
    router.refresh();
  }

  const campo = "rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-primario";
  const fecha = (iso: string) => new Date(iso).toLocaleDateString(locale, { day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="flex flex-col gap-8">
      <form onSubmit={crear} className="grid gap-3 rounded-3xl border border-border bg-surface p-5 sm:grid-cols-2">
        <p className="font-display font-bold text-foreground sm:col-span-2">{t("crear.titulo")}</p>
        <label className="flex flex-col gap-1 text-xs font-medium text-texto-secundario">
          {t("crear.colegio")}
          <input value={colegio} onChange={(e) => setColegio(e.target.value)} maxLength={120} className={campo} />
        </label>
        <label className="flex flex-col gap-1 text-xs font-medium text-texto-secundario">
          {t("crear.ciudad")}
          <input value={ciudad} onChange={(e) => setCiudad(e.target.value)} maxLength={80} className={campo} />
        </label>
        <label className="flex flex-col gap-1 text-xs font-medium text-texto-secundario sm:col-span-2">
          {t("crear.contacto")}
          <input value={contacto} onChange={(e) => setContacto(e.target.value)} maxLength={160} className={campo} />
        </label>
        <label className="flex flex-col gap-1 text-xs font-medium text-texto-secundario">
          {t("crear.cupos")}
          <input type="number" min={1} max={5000} value={cupos} onChange={(e) => setCupos(Math.max(1, Number(e.target.value) || 1))} className={campo} />
        </label>
        <label className="flex flex-col gap-1 text-xs font-medium text-texto-secundario">
          {t("crear.dias")}
          <input type="number" min={1} max={800} value={dias} onChange={(e) => setDias(Math.max(1, Number(e.target.value) || 1))} className={campo} />
        </label>
        <label className="flex flex-col gap-1 text-xs font-medium text-texto-secundario sm:col-span-2">
          {t("crear.notas")}
          <input value={notas} onChange={(e) => setNotas(e.target.value)} maxLength={300} className={campo} />
        </label>
        <div className="flex flex-wrap items-center gap-3 sm:col-span-2">
          <button type="submit" disabled={creando || colegio.trim().length < 2} className="rounded-xl bg-primario px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60">
            {creando ? t("crear.creando") : t("crear.boton")}
          </button>
          {mensaje && <p className={`font-mono text-sm ${mensaje.ok ? "text-correcto" : "text-error"}`}>{mensaje.texto}</p>}
        </div>
      </form>

      <section className="flex flex-col gap-3">
        <h2 className="font-display text-lg font-bold text-foreground">{t("lista.titulo")}</h2>
        {licencias.length === 0 ? (
          <p className="text-sm text-texto-secundario">{t("lista.vacio")}</p>
        ) : (
          licencias.map((l) => {
            const vencida = new Date(l.vence_at).getTime() <= ahora;
            return (
              <div key={l.id} className="flex flex-col gap-2 rounded-2xl border border-border bg-surface p-5">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-display font-bold text-foreground">
                      {l.colegio}
                      {l.ciudad ? <span className="font-normal text-texto-secundario"> · {l.ciudad}</span> : null}
                    </p>
                    <p className="font-mono text-lg font-black tracking-wider text-primario">{l.codigo}</p>
                  </div>
                  <span className={`text-xs font-semibold ${vencida ? "text-error" : "text-correcto"}`}>
                    {vencida ? t("lista.vencida", { fecha: fecha(l.vence_at) }) : t("lista.vence", { fecha: fecha(l.vence_at) })}
                  </span>
                </div>
                <p className="text-sm text-texto-secundario">
                  {t("lista.uso", { usados: l.usados, cupos: l.cupos, cursos: l.cursos })} ·{" "}
                  {l.docente_nombre ? t("lista.docente", { nombre: l.docente_nombre }) : t("lista.sinDocente")}
                </p>
                {(l.contacto || l.notas) && <p className="text-xs text-texto-secundario">{[l.contacto, l.notas].filter(Boolean).join(" · ")}</p>}
                <div className="flex flex-wrap items-center gap-2">
                  <button type="button" onClick={() => extender(l.id, 30)} className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-foreground hover:border-primario/50">
                    {t("lista.mas30")}
                  </button>
                  <button type="button" onClick={() => extender(l.id, 365)} className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-foreground hover:border-primario/50">
                    {t("lista.mas365")}
                  </button>
                  {errorExtender === l.id && <span className="text-xs text-error">{t("lista.error")}</span>}
                </div>
              </div>
            );
          })
        )}
      </section>
    </div>
  );
}
