import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { requireUsuario } from "@/lib/auth/guard";
import Header from "@/components/Header";
import { BENEFICIOS_PRO } from "@/lib/pro/beneficios";

export const metadata: Metadata = {
  title: "Prodigia Pro",
  description: "Los beneficios de Prodigia Pro — próximamente.",
};

// Fase 14: pantalla SOLO informativa — el botón está deshabilitado a
// propósito. Integrar un método de pago real queda pendiente de una
// decisión de proveedor aparte (Stripe no cubre Colombia directamente),
// así que acá no hay ningún flujo de compra, solo la lista de
// beneficios ya definidos.
export default async function ProPage() {
  const supabase = await createClient();
  await requireUsuario(supabase, "/pro");

  return (
    <>
      <Header autenticado />
      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-4 py-12 sm:px-6">
        <div className="text-center">
          <span className="text-xs font-medium uppercase tracking-wide text-primario">Prodigia</span>
          <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">Prodigia Pro</h1>
          <p className="mt-2 text-sm text-texto-secundario">
            Todo lo que vas a tener cuando Pro esté disponible.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {BENEFICIOS_PRO.map((b) => (
            <div
              key={b.titulo}
              className="flex flex-col gap-2 rounded-2xl border border-border bg-surface px-5 py-5"
            >
              <span className="text-2xl">{b.emoji}</span>
              <h2 className="font-display text-base font-bold text-foreground">{b.titulo}</h2>
              <p className="text-sm text-texto-secundario">{b.descripcion}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-surface-2 px-6 py-8 text-center">
          <button
            type="button"
            disabled
            className="cursor-not-allowed rounded-xl bg-primario/40 px-6 py-3 font-display font-semibold text-white opacity-70"
          >
            Próximamente
          </button>
          <p className="text-xs text-texto-secundario">Todavía no se puede comprar Prodigia Pro.</p>
        </div>
      </div>
    </>
  );
}
