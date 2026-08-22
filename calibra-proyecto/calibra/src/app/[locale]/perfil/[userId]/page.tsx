import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireUsuario } from "@/lib/auth/guard";
import { ESTILO_MARCO_PERFIL, type PerfilPublico } from "@/types/database";
import Header from "@/components/Header";
import Avatar from "@/components/Avatar";
import RangoBadge from "@/components/RangoBadge";
import NombreConFuente from "@/components/NombreConFuente";
import ReportarBoton from "./ReportarBoton";
import EstandarteClan from "@/components/clanes/EstandarteClan";

interface Props {
  params: Promise<{ userId: string }>;
}

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

  const [{ data, error }, { data: clanRows }] = await Promise.all([
    supabase.rpc("obtener_perfil_publico", { p_user_id: userId }),
    supabase.rpc("clan_de_usuario", { p_user_id: userId }),
  ]);
  const perfil = (data as PerfilPublico[] | null)?.[0];
  const clan = (clanRows as { clan_id: string; nombre: string; tag: string | null; color_estandarte: string; nivel_clan: number }[] | null)?.[0] ?? null;

  if (error || !perfil) {
    notFound();
  }

  const marcoPerfil = perfil.marco_perfil ?? "ninguno";

  return (
    <>
      <Header autenticado invitado={user.is_anonymous} />
      <div className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-6 px-4 py-12 sm:px-6">
        <section
          className={`flex flex-col items-center gap-3 rounded-2xl border-2 bg-surface px-6 py-8 text-center shadow-sm ${ESTILO_MARCO_PERFIL[marcoPerfil] ?? ESTILO_MARCO_PERFIL.ninguno}`}
        >
          <Avatar url={perfil.avatar_url} nombre={perfil.display_name} size={88} />
          <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
            <NombreConFuente nombre={perfil.display_name} fuente={perfil.fuente_nombre} />
          </h1>
          <p className="text-sm text-texto-secundario">En Prodigia desde {formatearFecha(perfil.created_at)}</p>
          {clan && (
            <div className="flex items-center gap-2">
              <EstandarteClan color={clan.color_estandarte} nivel={clan.nivel_clan} size={22} />
              <span className="text-sm text-texto-secundario">
                {clan.nombre} {clan.tag && `[${clan.tag}]`}
              </span>
            </div>
          )}

          <div className="mt-2 grid w-full grid-cols-2 gap-3">
            <div className="rounded-xl border border-border bg-background px-4 py-3">
              <p className="text-xs font-medium uppercase tracking-wide text-texto-secundario">Rango de duelos</p>
              <p className="mt-1"><RangoBadge elo={perfil.elo_rating} tituloNombre={perfil.titulo_nombre} size="md" /></p>
              <p className="text-xs text-texto-secundario">{perfil.elo_rating} ELO</p>
            </div>
            <div className="rounded-xl border border-border bg-background px-4 py-3">
              <p className="text-xs font-medium uppercase tracking-wide text-texto-secundario">Chispas</p>
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
