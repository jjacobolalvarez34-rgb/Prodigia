import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireUsuario } from "@/lib/auth/guard";
import Header from "@/components/Header";
import ConvertirCuenta from "@/components/ConvertirCuenta";
import { IconCandado } from "@/components/icons";

export const metadata: Metadata = {
  title: "Creá tu cuenta",
  description: "Esta parte de Prodigia necesita una cuenta real.",
};

interface Props {
  searchParams: Promise<{ seccion?: string }>;
}

// A donde llega cualquier invitado que chocó contra algo bloqueado
// (bloquearInvitado en src/lib/auth/guard.ts) — pantalla corta a
// propósito, no el perfil completo: un candado, qué se bloqueó, y el
// mismo formulario de siempre para guardar la cuenta sin perder nada de
// lo ya jugado (ConvertirCuenta hace un updateUser sobre el mismo
// user_id anónimo, no crea una cuenta nueva).
export default async function InvitadoBloqueadoPage({ searchParams }: Props) {
  const { seccion } = await searchParams;
  const supabase = await createClient();
  const { user } = await requireUsuario(supabase, "/invitado-bloqueado");

  // Si una cuenta real llega acá (link viejo, back del navegador), no
  // hay nada que desbloquear — no tiene sentido para ella.
  if (!user.is_anonymous) {
    redirect("/");
  }

  const etiqueta = seccion?.trim() || "Esto";

  return (
    <>
      <Header autenticado invitado />
      <div className="mx-auto flex w-full max-w-sm flex-1 flex-col items-center justify-center gap-5 px-4 py-16 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primario/10 text-primario">
          <IconCandado className="h-7 w-7" />
        </span>
        <div>
          <h1 className="font-display text-xl font-bold tracking-tight text-foreground">
            Creá tu cuenta para desbloquear esto
          </h1>
          <p className="mt-2 text-sm text-texto-secundario">
            <span className="font-medium text-foreground">{etiqueta}</span> necesita una cuenta real
            — es gratis y no perdés nada de lo que ya practicaste.
          </p>
        </div>

        <div className="w-full">
          <ConvertirCuenta />
        </div>

        <Link href="/" className="text-sm font-medium text-texto-secundario hover:text-foreground">
          Volver a jugar como invitado
        </Link>
      </div>
    </>
  );
}
