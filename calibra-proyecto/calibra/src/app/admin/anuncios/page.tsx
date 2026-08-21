import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireUsuario } from "@/lib/auth/guard";
import Header from "@/components/Header";
import AdminAnunciosClient, { type AnuncioAdmin } from "./AdminAnunciosClient";

// Fase 12: panel de administración mínimo — la única vía para crear
// anuncios sin pedir código cada vez. Protegido por profiles.es_admin
// (ver 0065_anuncios.sql), no por una lista de rutas en middleware —
// mismo criterio de "chequeo en la página" que ya usa bloquearInvitado.
export default async function AdminAnunciosPage() {
  const supabase = await createClient();
  const { user, profile } = await requireUsuario(supabase, "/admin/anuncios");

  if (!profile.es_admin) {
    redirect("/");
  }

  const { data: anuncios } = await supabase.rpc("listar_anuncios_admin");

  return (
    <>
      <Header autenticado invitado={user.is_anonymous} />
      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-4 py-12 sm:px-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Anuncios</h1>
          <p className="mt-1 text-sm text-texto-secundario">
            Lo que crees acá aparece como modal a cada usuario que todavía no lo vio, una sola vez.
          </p>
        </div>
        <AdminAnunciosClient anunciosIniciales={(anuncios as AnuncioAdmin[]) ?? []} />
      </div>
    </>
  );
}
