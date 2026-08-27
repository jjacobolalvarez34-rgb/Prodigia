import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireUsuario } from "@/lib/auth/guard";
import { esMundoPago, NOMBRE_MUNDO_PAGO } from "@/lib/mundos/precios";
import Header from "@/components/Header";
import MundoBloqueadoClient from "./MundoBloqueadoClient";

export const metadata: Metadata = {
  title: "Mundo bloqueado",
  description: "Este mundo se desbloquea pagando con Chispas.",
};

interface Props {
  searchParams: Promise<{ mundo?: string; next?: string }>;
}

// A donde llega cualquier cuenta que chocó con requireMundoComprado
// (src/lib/auth/guard.ts) — el mundo pedido todavía no está en
// profile.mundos_desbloqueados. Muestra el precio real (mismo que la
// RPC exige) y deja comprarlo ahí mismo, sin ir hasta /tienda.
export default async function MundoBloqueadoPage({ searchParams }: Props) {
  const { mundo, next } = await searchParams;
  const supabase = await createClient();
  const { profile } = await requireUsuario(supabase, "/mundo-bloqueado");

  if (!mundo || !esMundoPago(mundo)) {
    redirect("/");
  }

  // Si ya lo compró (volvió con el back del navegador después de
  // pagarlo, por ejemplo) no tiene sentido mostrarle la pantalla de
  // compra — mandarlo directo a donde iba.
  if (profile.mundos_desbloqueados?.includes(mundo)) {
    redirect(next || "/");
  }

  return (
    <>
      <Header autenticado />
      <MundoBloqueadoClient
        mundo={mundo}
        nombreMundo={NOMBRE_MUNDO_PAGO[mundo]}
        puntosIniciales={profile.puntos_total}
        destino={next || "/"}
      />
    </>
  );
}
