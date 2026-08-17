import type { ReactNode } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireUsuario } from "@/lib/auth/guard";
import Header from "@/components/Header";
import WorldCard from "@/components/WorldCard";
import PrimeraVezTip from "@/components/PrimeraVezTip";
import { calcularRachaDiaria } from "@/lib/practica/racha";
import { aplicarCongelamientoSiHaceFalta } from "@/lib/practica/congelamientos";
import { IconSuma, IconLogica, IconAlgebra, IconGeometria, IconLlama, IconCheck, IconLibro } from "@/components/icons";
import Greeting from "./Greeting";

export const metadata: Metadata = {
  title: "Inicio",
  description: "Tu cuenta de Prodigia: Puntos, racha y tus mundos de práctica.",
};

export default async function ProdigiaHomePage() {
  const supabase = await createClient();
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
      <Header autenticado mostrarTour />
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-10 px-4 py-12 sm:px-6">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
            <Greeting />, {profile.display_name}
          </h1>
          <p className="mt-0.5 font-mono text-xs text-texto-secundario">
            {profile.puntos_total} Puntos totales
          </p>
        </div>

        <section className="grid grid-cols-3 gap-3">
          <MetricaCard
            icono={<IconLlama className="h-4 w-4 text-racha" />}
            label="Racha"
            valor={`${racha} ${racha === 1 ? "día" : "días"}`}
          />
          <MetricaCard
            icono={<IconCheck className="h-4 w-4 text-correcto" />}
            label="Precisión · 7 días"
            valor={precision7dias === null ? "—" : `${precision7dias}%`}
          />
          <MetricaCard
            icono={<span className="text-sm">💰</span>}
            label="Puntos"
            valor={`${profile.puntos_total}`}
          />
        </section>

        <Link
          href="/reto-diario"
          className="flex items-center justify-between gap-4 rounded-2xl border border-logro/30 bg-logro/10 px-5 py-4 transition-colors hover:border-logro/50"
        >
          <div>
            <p className="font-display text-sm font-bold text-foreground">Reto diario</p>
            <p className="text-xs text-texto-secundario">
              {retoHoy ? `Ya lo hiciste hoy: ${retoHoy.correctos}/5` : "5 problemas, iguales para todos hoy"}
            </p>
          </div>
          <span className="shrink-0 rounded-full bg-logro px-4 py-2 text-sm font-display font-semibold text-foreground">
            {retoHoy ? "Ver" : "Jugar"}
          </span>
        </Link>

        <section className="flex flex-col gap-4">
          <div>
            <h2 className="font-display text-lg font-bold text-foreground">Tus mundos</h2>
            <p className="text-xs text-texto-secundario">Cada mundo tiene su propio ritmo y su propio camino.</p>
          </div>
          <PrimeraVezTip
            tipKey="tour-mundos"
            texto="Elegí un mundo para practicar — Puntos, racha y ranking se comparten entre todos."
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <WorldCard
                nombre="Numeria"
                descripcion="Cálculo mental con dificultad adaptativa."
                Icono={IconSuma}
                href="/numeria"
                colorHex="#6C4CF1"
              />
              <WorldCard
                nombre="Enigmia"
                descripcion="Acertijos de lógica: secuencias, patrones y deducción."
                Icono={IconLogica}
                href="/enigmia"
                colorHex="#0E9F6E"
              />
              <WorldCard
                nombre="Geografía"
                descripcion="Ubicá países de América en el mapa."
                Icono={IconGeometria}
                href="/geografia"
                colorHex="#1E7A8C"
              />
              <WorldCard
                nombre="Verbalia"
                descripcion="Comprensión y razonamiento verbal."
                Icono={IconAlgebra}
                href="#"
                colorHex="#6C4CF1"
                proximamente
              />
              <WorldCard
                nombre="Lexia"
                descripcion="Vocabulario e idiomas."
                Icono={IconLibro}
                href="#"
                colorHex="#6C4CF1"
                proximamente
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
