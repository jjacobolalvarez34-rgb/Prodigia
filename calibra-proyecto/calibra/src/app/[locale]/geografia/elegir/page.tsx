import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireMundoGeografia } from "@/lib/auth/guard";
import Header from "@/components/Header";
import LevelDial from "@/app/[locale]/practica/LevelDial";
import { IconGeometria, IconCandado } from "@/components/icons";
import { COLOR_GEOGRAFIA } from "../GeografiaMapa";

export const metadata: Metadata = {
  title: "Practicar",
  description: "Elegí una región de Geografía para practicar.",
};

// Fase 2 ("Practicar" estandarizado): la home ya no lleva directo a una
// región puntual — entra acá primero. Nivel único compartido entre las
// 4 regiones (no hay sub-tema por continente, a diferencia de Numeria).
export default async function GeografiaElegirPage() {
  const supabase = await createClient();
  const { user } = await requireMundoGeografia(supabase, "/geografia/elegir");

  const { data: nivelRow } = await supabase
    .from("skill_levels")
    .select("nivel")
    .eq("user_id", user.id)
    .eq("problem_type", "geografia")
    .maybeSingle();
  const nivel = nivelRow?.nivel ?? 1;

  // Deuda técnica invisible, Fase 1: las 3 regiones fuera de América ya
  // están bloqueadas de verdad del lado del servidor para invitados
  // (bloquearInvitado en cada page.tsx) — acá solo se avisa antes del
  // clic, mismo criterio que /practica/temas para Numeria.
  const regiones = [
    { nombre: "América", desc: "El continente de base", href: "/geografia/practica", bloqueadoInvitado: false },
    { nombre: "Europa", desc: "Países europeos", href: "/geografia/practica/europa", bloqueadoInvitado: true },
    { nombre: "África", desc: "Países africanos", href: "/geografia/practica/africa", bloqueadoInvitado: true },
    { nombre: "Asia y Oceanía", desc: "Países asiáticos y oceánicos", href: "/geografia/practica/asia-oceania", bloqueadoInvitado: true },
  ];

  return (
    <>
      <Header autenticado />
      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-4 py-16">
        <div className="text-center">
          <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">¿Qué región practicamos?</h1>
          <p className="mt-2 text-sm text-texto-secundario">Elegí una región para arrancar.</p>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {regiones.map((r) => {
            const bloqueado = r.bloqueadoInvitado && user.is_anonymous;
            return (
              <Link
                key={r.nombre}
                href={r.href}
                className={`flex items-center gap-4 rounded-2xl border-2 px-5 py-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg ${
                  bloqueado ? "border-dashed border-border bg-surface hover:border-primario/20" : "border-border bg-surface hover:border-primario/40"
                }`}
              >
                <span
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white"
                  style={{ background: bloqueado ? "var(--foreground)" : COLOR_GEOGRAFIA, opacity: bloqueado ? 0.3 : 1 }}
                >
                  <IconGeometria className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className={`font-display font-bold ${bloqueado ? "text-foreground/70" : "text-foreground"}`}>{r.nombre}</p>
                  <p className="text-xs text-texto-secundario">{bloqueado ? "Necesitás una cuenta para practicar esto" : r.desc}</p>
                  {bloqueado && (
                    <span className="mt-1 flex w-fit items-center gap-1 rounded-full border border-border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-foreground/40">
                      <IconCandado className="h-2.5 w-2.5" /> Invitado
                    </span>
                  )}
                </div>
                {!bloqueado && <LevelDial nivel={nivel} size={44} mostrarEtiqueta={false} colorHex={COLOR_GEOGRAFIA} />}
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}
