import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireUsuario } from "@/lib/auth/guard";
import { esMundoPago, tieneMundo } from "@/lib/mundos/precios";
import Header from "@/components/Header";
import MundoBloqueadoClient from "./MundoBloqueadoClient";
import { pagosHabilitados } from "@/lib/pagos/flags";
import { productosConPrecio } from "@/lib/pagos/paddle";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Bloqueos.mundo.metadata");
  return { title: t("title"), description: t("description") };
}

interface Props {
  searchParams: Promise<{ mundo?: string; next?: string }>;
}

// A donde llega cualquier cuenta que chocó con requireMundoComprado
// (src/lib/auth/guard.ts) — el mundo pedido todavía no está en
// profile.mundos_desbloqueados. Muestra el precio real (mismo que la
// RPC exige) y deja comprarlo ahí mismo, sin ir hasta /tienda.
export default async function MundoBloqueadoPage({ searchParams }: Props) {
  const { mundo, next } = await searchParams;
  const tMundos = await getTranslations("Mundos.nombres");
  const supabase = await createClient();
  const { user, profile } = await requireUsuario(supabase, "/mundo-bloqueado");

  if (!mundo || !esMundoPago(mundo)) {
    redirect("/");
  }

  // Si ya lo compró (volvió con el back del navegador después de
  // pagarlo, por ejemplo) no tiene sentido mostrarle la pantalla de
  // compra — mandarlo directo a donde iba.
  if (tieneMundo(profile, mundo)) {
    redirect(next || "/");
  }

  // Cometas aparte: si 0279 todavía no se aplicó, la columna no existe (saldo 0).
  const { data: filaCometas } = await supabase.from("profiles").select("cometas").eq("id", profile.id).maybeSingle();

  return (
    <>
      <Header autenticado />
      <MundoBloqueadoClient
        mundo={mundo}
        nombreMundo={tMundos(mundo)}
        puntosIniciales={profile.puntos_total}
        cometasIniciales={(filaCometas as { cometas?: number } | null)?.cometas ?? 0}
        destino={next || "/"}
        ventaConDinero={pagosHabilitados() && !user.is_anonymous && productosConPrecio().includes("mundo_suelto")}
      />
    </>
  );
}
