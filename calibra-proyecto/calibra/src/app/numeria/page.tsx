import Link from "next/link";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { requireMundoNumeria } from "@/lib/auth/guard";
import Header from "@/components/Header";
import FondoMundo from "@/components/FondoMundo";
import FondoCursorMundo from "@/components/FondoCursorMundo";
import TopicCard, { type TopicBadge } from "@/components/TopicCard";
import AccionMundo from "@/components/AccionMundo";
import NivelMundoBadge from "@/components/NivelMundoBadge";
import LevelDial from "@/app/practica/LevelDial";
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

export const metadata: Metadata = {
  title: "Numeria",
  description: "Cálculo mental con dificultad adaptativa: suma, resta, multiplicación, división y fracciones.",
};

export default async function NumeriaHomePage() {
  const supabase = await createClient();
  const { user, profile } = await requireMundoNumeria(supabase, "/numeria");

  const ahora = new Date();
  const hoyIso = ahora.toISOString().slice(0, 10);

  const [{ data: dailyHoy }, { data: skillRows }, { data: worldRow }] = await Promise.all([
    supabase
      .from("daily_progress")
      .select("xp_ganado")
      .eq("user_id", user.id)
      .eq("fecha", hoyIso)
      .maybeSingle(),
    supabase.from("skill_levels").select("problem_type, nivel").eq("user_id", user.id),
    supabase.from("world_progress").select("nivel_mundo").eq("user_id", user.id).eq("world", "numeria").maybeSingle(),
  ]);

  const nivelMundo = worldRow?.nivel_mundo ?? 1;

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
  const nivelFracciones = skillRows?.find((r) => r.problem_type === "fracciones")?.nivel ?? 1;
  const nivelDecimales = skillRows?.find((r) => r.problem_type === "decimales")?.nivel ?? 1;
  const nivelPotencias = skillRows?.find((r) => r.problem_type === "potencias")?.nivel ?? 1;
  const nivelAlgebra = skillRows?.find((r) => r.problem_type === "algebra")?.nivel ?? 1;

  const proximamente: TopicBadge = { tipo: "proximamente" };
  const temas: { nombre: string; Icono: typeof IconSuma; href: string; badge: TopicBadge }[] = [
    { nombre: "Aritmética", Icono: IconSuma, href: "/practica", badge: { tipo: "nivel", nivel: nivelPromedio } },
    { nombre: "Fracciones", Icono: IconFracciones, href: "/practica/fracciones", badge: { tipo: "nivel", nivel: nivelFracciones } },
    { nombre: "Decimales y porcentajes", Icono: IconDecimalesPorcentajes, href: "/practica/decimales", badge: { tipo: "nivel", nivel: nivelDecimales } },
    { nombre: "Potencias y raíces", Icono: IconPotenciasRaices, href: "/practica/potencias", badge: { tipo: "nivel", nivel: nivelPotencias } },
    { nombre: "Álgebra básica", Icono: IconAlgebra, href: "/practica/algebra", badge: { tipo: "nivel", nivel: nivelAlgebra } },
    { nombre: "Geometría básica", Icono: IconGeometria, href: "/aprender", badge: proximamente },
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
              Cálculo mental
            </h1>
            <div className="mt-2">
              <NivelMundoBadge nombreMundo="Numeria" nivel={nivelMundo} colorHex="#6C4CF1" />
            </div>
          </div>
          <LevelDial nivel={nivelPromedio} size={56} mostrarEtiqueta={false} />
        </div>

        {metaCumplidaHoy ? (
          <div className="flex items-center gap-3 rounded-2xl bg-correcto/10 px-5 py-4">
            <IconCheck className="h-5 w-5 shrink-0 text-correcto" />
            <p className="text-sm font-medium text-foreground">Ya cumpliste tu meta de hoy.</p>
          </div>
        ) : (
          <div className="flex flex-col items-start gap-3 rounded-2xl border border-border bg-surface px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex-1">
              <p className="text-sm text-texto-secundario">
                Te faltan{" "}
                <span className="font-mono font-semibold text-foreground">{metaXpDiaria - xpHoy}</span>{" "}
                de experiencia para cumplir tu meta de hoy.
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
              Practicar ahora
            </Link>
          </div>
        )}

        <section className="grid gap-4 sm:grid-cols-2">
          <AccionMundo
            href="/practica/temas"
            titulo="Practicar"
            descripcion="Partida de cálculo mental, calibrada a tu nivel."
            Icono={IconSuma}
            colorHex="#6C4CF1"
          />
          <AccionMundo
            href="/aprender"
            titulo="Aprender"
            descripcion="Técnicas de cálculo mental, un truco a la vez."
            Icono={IconLibro}
            colorHex="#FFC53D"
          />
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="font-display text-lg font-bold text-foreground">Temas</h2>
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
