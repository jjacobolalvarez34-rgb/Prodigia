import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireMundoNumeria } from "@/lib/auth/guard";
import Header from "@/components/Header";
import { ARITHMETIC_PROBLEM_TYPES } from "@/types/database";
import LevelDial from "@/app/[locale]/practica/LevelDial";
import { IconSuma, IconFracciones, IconDecimalesPorcentajes, IconPotenciasRaices, IconAlgebra, IconGeometria } from "@/components/icons";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Practica.temas.metadata");
  return { title: t("title"), description: t("description") };
}

// Fase 2 ("Practicar" estandarizado): "Practicar" ya no lleva directo al
// selector de operaciones de aritmética — primero elegís el TEMA (esta
// pantalla), y recién adentro de cada tema elegís qué sub-tema
// practicar, CON el nivel de cada uno — mismo patrón para los 6 temas
// de Numeria, ya no solo Aritmética.
export default async function TemasPage() {
  const t = await getTranslations("Practica.temas");
  const tNumeria = await getTranslations("Numeria.temas");
  const supabase = await createClient();
  const { user } = await requireMundoNumeria(supabase, "/practica/temas");

  const { data: skillRows } = await supabase.from("skill_levels").select("problem_type, nivel").eq("user_id", user.id);

  const nivelesAritmetica = (skillRows ?? []).filter((r) => (ARITHMETIC_PROBLEM_TYPES as string[]).includes(r.problem_type));
  const nivelAritmetica =
    nivelesAritmetica.length > 0
      ? Math.round(nivelesAritmetica.reduce((acc, r) => acc + r.nivel, 0) / nivelesAritmetica.length)
      : 1;
  function nivelPromedioDePrefijo(prefijo: string): number {
    const filas = (skillRows ?? []).filter((r) => r.problem_type.startsWith(prefijo));
    return filas.length > 0 ? Math.round(filas.reduce((acc, r) => acc + r.nivel, 0) / filas.length) : 1;
  }

  const temas = [
    { nombre: tNumeria("aritmetica"), desc: t("desc.aritmetica"), Icono: IconSuma, href: "/practica", nivel: nivelAritmetica },
    { nombre: tNumeria("fracciones"), desc: t("desc.fracciones"), Icono: IconFracciones, href: "/practica/fracciones", nivel: nivelPromedioDePrefijo("fracciones_") },
    { nombre: tNumeria("decimales"), desc: t("desc.decimales"), Icono: IconDecimalesPorcentajes, href: "/practica/decimales", nivel: nivelPromedioDePrefijo("decimales_") },
    { nombre: tNumeria("potencias"), desc: t("desc.potencias"), Icono: IconPotenciasRaices, href: "/practica/potencias", nivel: nivelPromedioDePrefijo("potencias_") },
    { nombre: tNumeria("algebra"), desc: t("desc.algebra"), Icono: IconAlgebra, href: "/practica/algebra", nivel: nivelPromedioDePrefijo("algebra_") },
    { nombre: tNumeria("geometria"), desc: t("desc.geometria"), Icono: IconGeometria, href: "/practica/geometria", nivel: nivelPromedioDePrefijo("geometria_") },
  ];

  return (
    <>
      <Header autenticado />
      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-4 py-16">
        <div className="text-center">
          <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">{t("titulo")}</h1>
          <p className="mt-2 text-sm text-texto-secundario">{t("subtitulo")}</p>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {temas.map((tema) => (
            <Link
              key={tema.nombre}
              href={tema.href}
              className="flex items-center gap-4 rounded-2xl border-2 border-border bg-surface px-5 py-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-primario/40 hover:shadow-lg"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primario/10 text-primario">
                <tema.Icono className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-display font-bold text-foreground">{tema.nombre}</p>
                <p className="text-xs text-texto-secundario">{tema.desc}</p>
              </div>
              <LevelDial nivel={tema.nivel} size={44} mostrarEtiqueta={false} />
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
