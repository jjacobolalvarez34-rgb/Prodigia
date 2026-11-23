"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";

export interface LicenciaDocente {
  id: string;
  colegio: string;
  codigo: string;
  vence_at: string;
  cupos: number;
  usados: number;
  vigente: boolean;
}

interface Curso {
  id: string;
  nombre: string;
  codigo: string;
  estudiantes: number;
}

function errorLicencia(mensaje: string): "codigo" | "otro" | "vencida" | "cuenta" | "generico" {
  if (mensaje.includes("otro docente")) return "otro";
  if (mensaje.includes("vencida")) return "vencida";
  if (mensaje.includes("cuenta")) return "cuenta";
  if (mensaje.includes("código inválido")) return "codigo";
  return "generico";
}

export default function ProfesorClient({ cursos: cursosIniciales, licencia }: { cursos: Curso[]; licencia: LicenciaDocente | null }) {
  const t = useTranslations("Curso.profesor");
  const locale = useLocale();
  const router = useRouter();
  const [cursos, setCursos] = useState(cursosIniciales);
  const [nombreNuevo, setNombreNuevo] = useState("");
  const [creando, setCreando] = useState(false);
  const [errorCrear, setErrorCrear] = useState(false);
  const [codigo, setCodigo] = useState("");
  const [activando, setActivando] = useState(false);
  const [mensajeLicencia, setMensajeLicencia] = useState<{ ok: boolean; texto: string } | null>(null);

  async function crearCurso(e: React.FormEvent) {
    e.preventDefault();
    const nombre = nombreNuevo.trim();
    if (nombre.length < 2) return;
    setCreando(true);
    setErrorCrear(false);
    const res = await fetch("/api/profesor/crear-grupo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre }),
    });
    const data = await res.json().catch(() => ({}));
    setCreando(false);
    if (!res.ok) {
      setErrorCrear(true);
      return;
    }
    setCursos((prev) => [{ id: data.id, nombre, codigo: data.codigo, estudiantes: 0 }, ...prev]);
    setNombreNuevo("");
    router.refresh();
  }

  async function activarLicencia(e: React.FormEvent) {
    e.preventDefault();
    if (codigo.trim().length < 6) return;
    setActivando(true);
    setMensajeLicencia(null);
    const supabase = createClient();
    const { data, error } = await supabase.rpc("activar_licencia_colegio", { p_codigo: codigo.trim() });
    setActivando(false);
    if (error) {
      setMensajeLicencia({ ok: false, texto: t(`licencia.errores.${errorLicencia(error.message)}`) });
      return;
    }
    const fila = (data as { colegio: string }[] | null)?.[0];
    setMensajeLicencia({ ok: true, texto: t("licencia.activada", { colegio: fila?.colegio ?? "" }) });
    setCodigo("");
    router.refresh();
  }

  const fecha = (iso: string) => new Date(iso).toLocaleDateString(locale, { day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-8 px-4 py-10 sm:px-6">
      <div data-tour="docente-titulo">
        <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">{t("titulo")}</h1>
        <p className="mt-1 text-sm text-texto-secundario">{t("subtitulo")}</p>
      </div>

      <section data-tour="docente-licencia">
        {licencia ? (
          <div className="flex flex-col gap-3 rounded-3xl bg-[linear-gradient(135deg,#2A1E6B,#4B32C3_60%,#6C4CF1)] p-6 text-white">
            <p className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-white/70">{t("licencia.titulo")}</p>
            <p className="font-display text-2xl font-bold">{licencia.colegio}</p>
            <div className="h-2 w-full overflow-hidden rounded-full bg-white/20">
              <div className="h-full rounded-full bg-[#7DF0C0]" style={{ width: `${Math.min(100, (licencia.usados / Math.max(1, licencia.cupos)) * 100)}%` }} />
            </div>
            <div className="flex flex-wrap justify-between gap-2 text-sm text-white/85">
              <span>{t("licencia.cupos", { usados: licencia.usados, cupos: licencia.cupos })}</span>
              <span>{licencia.vigente ? t("licencia.vence", { fecha: fecha(licencia.vence_at) }) : t("licencia.vencida", { fecha: fecha(licencia.vence_at) })}</span>
            </div>
            <p className="text-sm text-white/75">{t("licencia.beneficio")}</p>
          </div>
        ) : (
          <form onSubmit={activarLicencia} className="flex flex-col gap-3 rounded-3xl border border-primario/30 bg-primario/5 p-6">
            <p className="font-display text-lg font-bold text-foreground">{t("licencia.sinLicencia")}</p>
            <p className="text-sm text-texto-secundario">{t("licencia.sinLicenciaTexto")}</p>
            <div className="flex flex-wrap gap-2">
              <input
                value={codigo}
                onChange={(e) => setCodigo(e.target.value.toUpperCase())}
                placeholder={t("licencia.placeholder")}
                maxLength={10}
                className="min-w-0 flex-1 rounded-xl border border-border bg-background px-3 py-2.5 font-mono text-sm uppercase text-foreground outline-none focus:border-primario"
              />
              <button type="submit" disabled={activando || codigo.trim().length < 6} className="rounded-xl bg-primario px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60">
                {activando ? t("licencia.activando") : t("licencia.activar")}
              </button>
            </div>
            <Link href="/docentes" className="w-fit text-sm font-medium text-primario hover:underline">
              {t("licencia.piloto")}
            </Link>
          </form>
        )}
        {mensajeLicencia && <p className={`mt-2 text-sm ${mensajeLicencia.ok ? "text-correcto" : "text-error"}`}>{mensajeLicencia.texto}</p>}
      </section>

      {cursos.length === 0 && (
        <section className="rounded-3xl border border-border bg-surface p-6">
          <h2 className="font-display text-lg font-bold text-foreground">{t("pasos.titulo")}</h2>
          <ol className="mt-4 grid gap-3 sm:grid-cols-2">
            {(["p1", "p2", "p3", "p4"] as const).map((p, i) => (
              <li key={p} className="flex items-start gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primario font-display text-sm font-bold text-white">{i + 1}</span>
                <span className="text-sm text-foreground">{t(`pasos.${p}`)}</span>
              </li>
            ))}
          </ol>
        </section>
      )}

      <section className="flex flex-col gap-3" data-tour="docente-cursos">
        <h2 className="font-display text-lg font-bold text-foreground">{t("cursos.titulo")}</h2>
        {cursos.length === 0 ? (
          <p className="text-sm text-texto-secundario">{t("cursos.vacio")}</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {cursos.map((c) => (
              <Link
                key={c.id}
                href={`/profesor/${c.id}`}
                className="group flex flex-col gap-3 rounded-2xl border border-border bg-surface p-5 transition-colors hover:border-primario/50"
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="font-display text-lg font-bold text-foreground">{c.nombre}</p>
                  <span className="rounded-lg bg-surface-2 px-2 py-1 font-mono text-xs text-texto-secundario">{t("cursos.codigo", { codigo: c.codigo })}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-texto-secundario">{t("cursos.estudiantes", { n: c.estudiantes })}</span>
                  <span className="font-semibold text-primario group-hover:underline">{t("cursos.abrir")}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
        <form onSubmit={crearCurso} className="flex flex-col gap-2 rounded-2xl border border-dashed border-border p-5" data-tour="docente-crear">
          <p className="font-display text-sm font-semibold text-foreground">{t("crear.titulo")}</p>
          <div className="flex flex-wrap gap-2">
            <input
              value={nombreNuevo}
              onChange={(e) => setNombreNuevo(e.target.value)}
              placeholder={t("crear.placeholder")}
              maxLength={60}
              className="min-w-0 flex-1 rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-primario"
            />
            <button type="submit" disabled={creando || nombreNuevo.trim().length < 2} className="rounded-xl bg-primario px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60">
              {creando ? t("crear.creando") : t("crear.boton")}
            </button>
          </div>
          {errorCrear && <p className="text-sm text-error">{t("crear.error")}</p>}
        </form>
      </section>

      <p className="text-sm text-texto-secundario">
        {t("estudiante")}{" "}
        <Link href="/curso" className="font-semibold text-primario hover:underline">
          {t("irMiCurso")}
        </Link>
      </p>
    </div>
  );
}
