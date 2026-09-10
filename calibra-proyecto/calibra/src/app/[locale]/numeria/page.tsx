import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireMundoNumeria } from "@/lib/auth/guard";
import Header from "@/components/Header";
import FondoMundo from "@/components/FondoMundo";
import FondoCursorMundo from "@/components/FondoCursorMundo";
import TopicCard, { type TopicBadge } from "@/components/TopicCard";
import AccionMundo from "@/components/AccionMundo";
import NivelMundoBadge from "@/components/NivelMundoBadge";
import NivelMundoProgreso from "@/components/NivelMundoProgreso";
import type { SincronizarProgresoRow } from "@/lib/mundos/progresoNivel";
import LevelDial from "@/app/[locale]/practica/LevelDial";
import { ARITHMETIC_PROBLEM_TYPES } from "@/types/database";
import {
  IconSuma,
  IconFracciones,
  IconDecimalesPorcentajes,
  IconPotenciasRaices,
  IconAlgebra,
  IconGeometria,
  IconCheck,
  IconLibro,
} from "@/components/icons";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Numeria.metadata");
  return { title: "Numeria", description: t("description") };
}

export default async function NumeriaHomePage() {
  const t = await getTranslations("Numeria");
  const supabase = await createClient();
  const { user, profile } = await requireMundoNumeria(supabase, "/numeria");

  const ahora = new Date();
  const hoyIso = ahora.toISOString().slice(0, 10);

  const [{ data: dailyHoy }, { data: skillRows }, { data: mundoProgreso }] = await Promise.all([
    supabase
      .from("daily_progress")
      .select("xp_ganado")
      .eq("user_id", user.id)
      .eq("fecha", hoyIso)
      .maybeSingle(),
    supabase.from("skill_levels").select("problem_type, nivel").eq("user_id", user.id),
    supabase.rpc("sincronizar_progreso_mundo", { p_world: "numeria" }).returns<SincronizarProgresoRow[]>().maybeSingle(),
  ]);

  const nivelMundo = mundoProgreso?.nivel_mundo ?? 1;
  const progresoMundo = {
    puntos: mundoProgreso?.puntos_mundo ?? 0,
    nivel: nivelMundo,
    fracVolumen: mundoProgreso?.frac_volumen ?? 0,
    fracDominio: mundoProgreso?.frac_dominio ?? 0,
    fracLecciones: mundoProgreso?.frac_lecciones ?? 0,
  };

  const metaXpDiaria = profile.meta_xp_diaria ?? 500;
  const xpHoy = dailyHoy?.xp_ganado ?? 0;
  const metaCumplidaHoy = xpHoy >= metaXpDiaria;
  const nivelesAritmetica = (skillRows ?? []).filter((r) =>
    (ARITHMETIC_PROBLEM_TYPES as string[]).includes(r.problem_type)
  );
  const nivelPromedio =
    nivelesAritmetica.length > 0
      ? Math.round(nivelesAritmetica.reduce((acc, r) => acc + r.nivel, 0) / nivelesAritmetica.length)
      : 1;
  // Fase 2 ("Practicar" estandarizado): el badge de cada tema es ahora
  // el promedio de sus sub-temas (cada uno con su propio problem_type
  // real, ver 0079_practicar_subtemas.sql) — mismo criterio que ya
  // usaba Aritmética con sus 4 operaciones.
  function nivelPromedioDePrefijo(prefijo: string): number {
    const filas = (skillRows ?? []).filter((r) => r.problem_type.startsWith(prefijo));
    return filas.length > 0 ? Math.round(filas.reduce((acc, r) => acc + r.nivel, 0) / filas.length) : 1;
  }
  const nivelFracciones = nivelPromedioDePrefijo("fracciones_");
  const nivelDecimales = nivelPromedioDePrefijo("decimales_");
  const nivelPotencias = nivelPromedioDePrefijo("potencias_");
  const nivelAlgebra = nivelPromedioDePrefijo("algebra_");
  const nivelGeometria = nivelPromedioDePrefijo("geometria_");

  // Fase 2, punto 1: las tarjetas de tema de la home ya no llevan a
  // arrancar una partida directo — son solo vidriera (nivel actual).
  // El único acceso real a jugar es la tarjeta "Practicar" de abajo,
  // que entra a /practica/temas, donde SÍ se elige tema y sub-tema.
  const temas: { nombre: string; Icono: typeof IconSuma; badge: TopicBadge }[] = [
    { nombre: t("temas.aritmetica"), Icono: IconSuma, badge: { tipo: "nivel", nivel: nivelPromedio } },
    { nombre: t("temas.fracciones"), Icono: IconFracciones, badge: { tipo: "nivel", nivel: nivelFracciones } },
    { nombre: t("temas.decimales"), Icono: IconDecimalesPorcentajes, badge: { tipo: "nivel", nivel: nivelDecimales } },
    { nombre: t("temas.potencias"), Icono: IconPotenciasRaices, badge: { tipo: "nivel", nivel: nivelPotencias } },
    { nombre: t("temas.algebra"), Icono: IconAlgebra, badge: { tipo: "nivel", nivel: nivelAlgebra } },
    { nombre: t("temas.geometria"), Icono: IconGeometria, badge: { tipo: "nivel", nivel: nivelGeometria } },
  ];

  return (
    <>
      <FondoMundo mundo="numeria" />
      <FondoCursorMundo mundo="numeria" />
      <Header autenticado />
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-10 px-4 py-12 sm:px-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <span className="text-xs font-medium uppercase tracking-wide text-primario">Numeria</span>
            <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
              {t("titulo")}
            </h1>
            <div className="mt-2">
              <NivelMundoBadge nombreMundo="Numeria" nivel={nivelMundo} colorHex="#6C4CF1" />
            </div>
          </div>
          <LevelDial nivel={nivelPromedio} size={56} mostrarEtiqueta={false} />
        </div>

        <NivelMundoProgreso nombreMundo="Numeria" colorHex="#6C4CF1" progreso={progresoMundo} />

        {metaCumplidaHoy ? (
          <div className="flex items-center gap-3 rounded-2xl bg-correcto/10 px-5 py-4">
            <IconCheck className="h-5 w-5 shrink-0 text-correcto" />
            <p className="text-sm font-medium text-foreground">{t("metaCumplida")}</p>
          </div>
        ) : (
          <div className="flex flex-col items-start gap-3 rounded-2xl border border-border bg-surface px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex-1">
              <p className="text-sm text-texto-secundario">
                {t.rich("metaFaltante", {
                  n: metaXpDiaria - xpHoy,
                  destacado: (chunks) => <span className="font-mono font-semibold text-foreground">{chunks}</span>,
                })}
              </p>
              <div className="mt-2 h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-foreground/10">
                <div
                  className="h-full rounded-full bg-primario transition-all"
                  style={{ width: `${Math.min(100, Math.max(0, (xpHoy / metaXpDiaria) * 100))}%` }}
                />
              </div>
            </div>
            <Link
              href="/practica/temas"
              className="shrink-0 rounded-xl bg-primario px-4 py-2 text-sm font-display font-semibold text-white"
            >
              {t("practicarAhora")}
            </Link>
          </div>
        )}

        <section className="grid gap-4 sm:grid-cols-2">
          <AccionMundo
            href="/practica/temas"
            titulo={t("practicar")}
            descripcion={t("practicarDescripcion")}
            Icono={IconSuma}
            colorHex="#6C4CF1"
          />
          <AccionMundo
            href="/aprender"
            titulo={t("aprender")}
            descripcion={t("aprenderDescripcion")}
            Icono={IconLibro}
            colorHex="#FFC53D"
          />
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="font-display text-lg font-bold text-foreground">{t("temasTitulo")}</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {temas.map((tema) => (
              <TopicCard key={tema.nombre} {...tema} />
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
