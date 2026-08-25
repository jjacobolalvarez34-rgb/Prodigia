import type { ReactNode } from "react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireUsuario } from "@/lib/auth/guard";
import Header from "@/components/Header";
import Avatar from "@/components/Avatar";
import WorldCard from "@/components/WorldCard";
import PrimeraVezTip from "@/components/PrimeraVezTip";
import AvisoPrimeraVez from "@/components/AvisoPrimeraVez";
import VisitanteLanding from "@/components/landing/VisitanteLanding";
import { calcularRachaDiaria } from "@/lib/practica/racha";
import { aplicarCongelamientoSiHaceFalta } from "@/lib/practica/congelamientos";
import { IconSuma, IconLogica, IconGeometria, IconLlama, IconCheck, IconQuimica, IconAnatomia, IconMelodia } from "@/components/icons";
import Greeting from "./Greeting";

export async function generateMetadata(): Promise<Metadata> {
  // La metadata (título/descripción para redes sociales y buscadores)
  // tiene que reflejar lo que REALMENTE se muestra en "/" — para un
  // visitante sin sesión eso es la landing pública, no la home de
  // cuenta. Prioridad alta según el pedido: "/" es la puerta de entrada
  // real para tráfico de redes sociales.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const t = await getTranslations(user ? "Home.metadata" : "Landing.metadata");
  return { title: t("title"), description: t("description") };
}

export default async function ProdigiaHomePage() {
  const t = await getTranslations("Home");
  const supabase = await createClient();

  // Landing pública (Fases 0-4 de la landing de visitantes): "/" para
  // alguien SIN sesión ya no redirige derecho a /login — muestra la
  // landing + demo interactiva. Un usuario con sesión (incluido un
  // invitado ya logueado vía signInAnonymously) sigue el flujo de
  // siempre más abajo, sin ningún cambio.
  const {
    data: { user: visitante },
  } = await supabase.auth.getUser();
  if (!visitante) {
    return (
      <>
        <Header />
        <VisitanteLanding />
      </>
    );
  }

  const { user, profile } = await requireUsuario(supabase, "/");

  const ahora = new Date();
  const hoyIso = ahora.toISOString().slice(0, 10);
  const hace7dias = new Date(ahora.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

  // Si ayer se te escapó el día pero tenías un congelamiento comprado,
  // se aplica acá antes de calcular la racha — así nunca se ve el corte.
  await aplicarCongelamientoSiHaceFalta(supabase);

  const [{ data: dailyRows }, { data: attemptsSemana }, { data: logicAttemptsSemana }, { data: retoHoy }] =
    await Promise.all([
      supabase
        .from("daily_progress")
        .select("fecha, xp_ganado, meta_alcanzada, congelado")
        .eq("user_id", user.id)
        .order("fecha", { ascending: false })
        .limit(60),
      supabase.from("attempts").select("correct").eq("user_id", user.id).gte("created_at", hace7dias),
      supabase.from("logic_attempts").select("correct").eq("user_id", user.id).gte("created_at", hace7dias),
      supabase
        .from("retos_diarios_completados")
        .select("correctos")
        .eq("user_id", user.id)
        .eq("fecha", hoyIso)
        .maybeSingle(),
    ]);

  const racha = calcularRachaDiaria(dailyRows ?? [], hoyIso);
  const intentosGlobales = [...(attemptsSemana ?? []), ...(logicAttemptsSemana ?? [])];
  const precision7dias =
    intentosGlobales.length > 0
      ? Math.round((intentosGlobales.filter((a) => a.correct).length / intentosGlobales.length) * 100)
      : null;

  return (
    <>
      <Header autenticado mostrarTour invitado={user.is_anonymous} />
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-10 px-4 py-12 sm:px-6">
        <div className="flex items-center gap-3">
          <Avatar url={profile.avatar_url} nombre={profile.display_name} size={48} />
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
              <Greeting />, {profile.display_name}
            </h1>
            <p className="mt-0.5 font-mono text-xs text-texto-secundario">
              {t("chispasTotales", { n: profile.puntos_total })}
            </p>
          </div>
        </div>

        <section className="grid grid-cols-3 gap-3">
          <MetricaCard
            icono={<IconLlama className="h-4 w-4 text-racha" />}
            label={t("racha")}
            valor={t("rachaValor", { racha })}
          />
          <MetricaCard
            icono={<IconCheck className="h-4 w-4 text-correcto" />}
            label={t("precision7dias")}
            valor={precision7dias === null ? t("sinDatos") : `${precision7dias}%`}
          />
          <AvisoPrimeraVez avisoKey="chispas-intro" texto={t("chispasIntro")}>
            <MetricaCard
              icono={<span className="text-sm">💰</span>}
              label={t("chispas")}
              valor={`${profile.puntos_total}`}
            />
          </AvisoPrimeraVez>
        </section>

        <Link
          href="/reto-diario"
          className="flex items-center justify-between gap-4 rounded-2xl border border-logro/30 bg-logro/10 px-5 py-4 transition-colors hover:border-logro/50"
        >
          <div>
            <p className="font-display text-sm font-bold text-foreground">{t("retoDiario")}</p>
            <p className="text-xs text-texto-secundario">
              {retoHoy ? t("retoDiarioHecho", { correctos: retoHoy.correctos }) : t("retoDiarioDescripcion")}
            </p>
          </div>
          <span className="shrink-0 rounded-full bg-logro px-4 py-2 text-sm font-display font-semibold text-foreground">
            {retoHoy ? t("ver") : t("jugar")}
          </span>
        </Link>

        <section className="flex flex-col gap-4">
          <div>
            <h2 className="font-display text-lg font-bold text-foreground">{t("tusMundos")}</h2>
            <p className="text-xs text-texto-secundario">{t("tusMundosDescripcion")}</p>
          </div>
          <PrimeraVezTip tipKey="tour-mundos" texto={t("tourMundos")}>
            <div className="grid gap-4 sm:grid-cols-2">
              <WorldCard
                nombre="Numeria"
                descripcion={t("mundos.numeria")}
                Icono={IconSuma}
                href="/numeria"
                colorHex="#6C4CF1"
              />
              <WorldCard
                nombre="Enigmia"
                descripcion={t("mundos.enigmia")}
                Icono={IconLogica}
                href="/enigmia"
                colorHex="#0E9F6E"
              />
              <WorldCard
                nombre="Geografía"
                descripcion={t("mundos.geografia")}
                Icono={IconGeometria}
                href="/geografia"
                colorHex="#1E7A8C"
              />
              <WorldCard
                nombre="Quimia"
                descripcion={t("mundos.quimia")}
                Icono={IconQuimica}
                href="/quimia"
                colorHex="#C026D3"
              />
              <WorldCard
                nombre="Anatomía"
                descripcion={t("mundos.anatomia")}
                Icono={IconAnatomia}
                href="/anatomia"
                colorHex="#8B2942"
              />
              <WorldCard
                nombre="Melodía"
                descripcion={t("mundos.melodia")}
                Icono={IconMelodia}
                href="/melodia"
                colorHex="#B8860B"
              />
            </div>
          </PrimeraVezTip>
        </section>
      </div>
    </>
  );
}

function MetricaCard({ icono, label, valor }: { icono: ReactNode; label: string; valor: string }) {
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-border bg-surface px-4 py-3">
      <div className="flex items-center gap-1.5 text-texto-secundario">
        {icono}
        <span className="text-[10px] font-medium uppercase tracking-wide">{label}</span>
      </div>
      <span className="font-mono text-lg font-bold text-foreground">{valor}</span>
    </div>
  );
}
