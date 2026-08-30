import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireMundoNumeria } from "@/lib/auth/guard";
import Header from "@/components/Header";
import { ARITHMETIC_PROBLEM_TYPES } from "@/types/database";
import LevelDial from "@/app/[locale]/practica/LevelDial";
import { IconSuma, IconFracciones, IconDecimalesPorcentajes, IconPotenciasRaices, IconAlgebra, IconGeometria, IconCandado } from "@/components/icons";

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

  // Deuda técnica invisible, Fase 1: estos 5 (todo salvo Aritmética) ya
  // están bloqueados de verdad del lado del servidor para invitados
  // (bloquearInvitado en cada page.tsx, ver src/lib/auth/guard.ts) —
  // acá solo se muestra el candado ANTES de que hagan el clic, para no
  // dejarlos entrar y recién ahí rebotarlos.
  const temas = [
    { nombre: tNumeria("aritmetica"), desc: t("desc.aritmetica"), Icono: IconSuma, href: "/practica", nivel: nivelAritmetica, bloqueadoInvitado: false },
    { nombre: tNumeria("fracciones"), desc: t("desc.fracciones"), Icono: IconFracciones, href: "/practica/fracciones", nivel: nivelPromedioDePrefijo("fracciones_"), bloqueadoInvitado: true },
    { nombre: tNumeria("decimales"), desc: t("desc.decimales"), Icono: IconDecimalesPorcentajes, href: "/practica/decimales", nivel: nivelPromedioDePrefijo("decimales_"), bloqueadoInvitado: true },
    { nombre: tNumeria("potencias"), desc: t("desc.potencias"), Icono: IconPotenciasRaices, href: "/practica/potencias", nivel: nivelPromedioDePrefijo("potencias_"), bloqueadoInvitado: true },
    { nombre: tNumeria("algebra"), desc: t("desc.algebra"), Icono: IconAlgebra, href: "/practica/algebra", nivel: nivelPromedioDePrefijo("algebra_"), bloqueadoInvitado: true },
    { nombre: tNumeria("geometria"), desc: t("desc.geometria"), Icono: IconGeometria, href: "/practica/geometria", nivel: nivelPromedioDePrefijo("geometria_"), bloqueadoInvitado: true },
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
          {temas.map((tema) => {
            const bloqueado = tema.bloqueadoInvitado && user.is_anonymous;
            return (
              <Link
                key={tema.nombre}
                href={tema.href}
                className={`flex items-center gap-4 rounded-2xl border-2 px-5 py-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg ${
                  bloqueado ? "border-dashed border-border bg-surface hover:border-primario/20" : "border-border bg-surface hover:border-primario/40"
                }`}
              >
                <span
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${
                    bloqueado ? "bg-foreground/5 text-foreground/40" : "bg-primario/10 text-primario"
                  }`}
                >
                  <tema.Icono className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className={`font-display font-bold ${bloqueado ? "text-foreground/70" : "text-foreground"}`}>{tema.nombre}</p>
                  <p className="text-xs text-texto-secundario">{bloqueado ? "Necesitás una cuenta para practicar esto" : tema.desc}</p>
                  {bloqueado && (
                    <span className="mt-1 flex w-fit items-center gap-1 rounded-full border border-border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-foreground/40">
                      <IconCandado className="h-2.5 w-2.5" /> Invitado
                    </span>
                  )}
                </div>
                {!bloqueado && <LevelDial nivel={tema.nivel} size={44} mostrarEtiqueta={false} />}
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}
