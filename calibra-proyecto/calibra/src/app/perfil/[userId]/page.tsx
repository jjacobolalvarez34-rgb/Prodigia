import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireUsuario } from "@/lib/auth/guard";
import { tierDeElo, type PerfilPublico } from "@/types/database";
import Header from "@/components/Header";
import Avatar from "@/components/Avatar";
import ReportarBoton from "./ReportarBoton";

interface Props {
  params: Promise<{ userId: string }>;
}

const ESTILO_MARCO: Record<string, string> = {
  ninguno: "border-border",
  plata: "border-[#C0C5CE] shadow-[0_0_0_3px_rgba(192,197,206,0.25)]",
  oro: "border-[#FFC53D] shadow-[0_0_0_3px_rgba(255,197,61,0.25)]",
};

function formatearFecha(iso: string): string {
  return new Date(iso).toLocaleDateString("es-AR", { year: "numeric", month: "long" });
}

// Fase Q3: perfil público de OTRO usuario — de solo lectura, columnas
// seguras nada más (ver obtener_perfil_publico en
// 0040_perfil_publico_y_reportes.sql). Si el userId es el propio, manda
// a /perfil (la versión completa, editable).
export default async function PerfilPublicoPage({ params }: Props) {
  const { userId } = await params;
  const supabase = await createClient();
  const { user } = await requireUsuario(supabase, `/perfil/${userId}`);

  if (userId === user.id) {
    redirect("/perfil");
  }

  const { data, error } = await supabase.rpc("obtener_perfil_publico", { p_user_id: userId });
  const perfil = (data as PerfilPublico[] | null)?.[0];

  if (error || !perfil) {
    notFound();
  }

  const marcoPerfil = perfil.marco_perfil ?? "ninguno";

  return (
    <>
      <Header autenticado invitado={user.is_anonymous} />
      <div className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-6 px-4 py-12 sm:px-6">
        <section
          className={`flex flex-col items-center gap-3 rounded-2xl border-2 bg-surface px-6 py-8 text-center shadow-sm ${ESTILO_MARCO[marcoPerfil] ?? ESTILO_MARCO.ninguno}`}
        >
          <Avatar url={perfil.avatar_url} nombre={perfil.display_name} size={88} />
          <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
            {perfil.display_name ?? "Jugador"}
          </h1>
          <p className="text-sm text-texto-secundario">En Prodigia desde {formatearFecha(perfil.created_at)}</p>

          <div className="mt-2 grid w-full grid-cols-2 gap-3">
            <div className="rounded-xl border border-border bg-background px-4 py-3">
              <p className="text-xs font-medium uppercase tracking-wide text-texto-secundario">Rango de duelos</p>
              <p className="mt-1 font-mono text-lg font-bold text-foreground">{tierDeElo(perfil.elo_rating)}</p>
              <p className="text-xs text-texto-secundario">{perfil.elo_rating} ELO</p>
            </div>
            <div className="rounded-xl border border-border bg-background px-4 py-3">
              <p className="text-xs font-medium uppercase tracking-wide text-texto-secundario">Puntos</p>
              <p className="mt-1 font-mono text-lg font-bold text-foreground">{perfil.puntos_total}</p>
            </div>
          </div>

          <div className="mt-2">
            <ReportarBoton userId={perfil.id} />
          </div>
        </section>
      </div>
    </>
  );
}
