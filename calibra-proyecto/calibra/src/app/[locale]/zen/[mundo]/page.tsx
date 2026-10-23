import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import FondoMundo from "@/components/FondoMundo";
import Header from "@/components/Header";
import ZenClient from "@/components/zen/ZenClient";
import { redirect } from "@/i18n/navigation";
import { requireUsuario } from "@/lib/auth/guard";
import { MUNDOS_LANDING } from "@/lib/mundos";
import { createClient } from "@/lib/supabase/server";
import { problemTypeDeTema } from "@/lib/zen/config";
import { temasZen } from "@/lib/zen/preguntas";

export async function generateMetadata({ params }: { params: Promise<{ locale: string; mundo: string }> }): Promise<Metadata> {
  const { locale, mundo } = await params;
  const t = await getTranslations({ locale, namespace: "Zen" });
  const m = MUNDOS_LANDING.find((x) => x.slug === mundo);
  return { title: `${t("titulo")} · ${m?.nombre ?? ""}` };
}

// Modo Zen de una ciudad (docs/PLAN_MODO_SIN_RELOJ.md). Pide sesión (la racha se
// guarda en la cuenta) y que la ciudad esté desbloqueada, igual que practicar.
export default async function ZenPage({ params }: { params: Promise<{ locale: string; mundo: string }> }) {
  const { locale, mundo } = await params;
  setRequestLocale(locale);
  const m = MUNDOS_LANDING.find((x) => x.slug === mundo);
  if (!m || temasZen(mundo).length === 0) notFound();

  const supabase = await createClient();
  const { user, profile } = await requireUsuario(supabase, `/zen/${mundo}`);
  const desbloqueados = (profile as { mundos_desbloqueados?: string[] | null }).mundos_desbloqueados ?? [];
  if ((profile as { plan?: string }).plan !== "pro" && desbloqueados.length > 0 && !desbloqueados.includes(mundo)) {
    redirect({ href: `/${mundo}`, locale });
  }

  // Nivel actual de cada modo (la dificultad arranca ahí) y, en Enigmia, el banco
  // de acertijos de deducción.
  // Los niveles quedan por id de tema (en Numeria, «seccion:tipo»).
  const temaPorTipo = new Map(temasZen(mundo).map((t) => [problemTypeDeTema(mundo, t.id), t.id]));
  const [{ data: filas }, banco] = await Promise.all([
    supabase.from("skill_levels").select("problem_type, nivel").eq("user_id", user.id).in("problem_type", [...temaPorTipo.keys()]),
    mundo === "enigmia" ? supabase.from("logic_puzzles").select("id, tipo, dificultad, contenido, respuesta").then((r) => r.data ?? []) : Promise.resolve(null),
  ]);
  const niveles: Record<string, number> = {};
  for (const f of filas ?? []) {
    const tema = temaPorTipo.get(f.problem_type);
    if (tema) niveles[tema] = f.nivel;
  }

  return (
    <>
      <FondoMundo mundo={mundo as never} />
      <Header autenticado />
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 py-10 sm:px-6">
        <ZenClient mundo={mundo} nombreMundo={m.nombre} color={m.colorHex} niveles={niveles} contexto={banco} />
      </main>
    </>
  );
}
