import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { requireUsuario, bloquearInvitado } from "@/lib/auth/guard";
import Header from "@/components/Header";
import FeedClient, { type PostFeed } from "./FeedClient";

export const metadata: Metadata = {
  title: "Feed",
  description: "Logros y desafíos de la gente que seguís en Prodigia.",
};

export default async function FeedPage() {
  const supabase = await createClient();
  const { user } = await requireUsuario(supabase, "/feed");
  bloquearInvitado(user, "Feed");

  const [{ data: posts }, { data: reacciones }, { data: siguiendo }, { data: sugeridos }] = await Promise.all([
    supabase
      .from("feed_posts")
      .select(
        "id, user_id, tipo, created_at, operation_type, nivel, cantidad_problemas, achievements(nombre, descripcion), profiles(display_name)"
      )
      .order("created_at", { ascending: false })
      .limit(40),
    supabase.from("feed_reactions").select("post_id, user_id"),
    supabase.from("friendships").select("friend_id").eq("user_id", user.id).eq("estado", "aceptada"),
    supabase.from("profiles").select("id, display_name").neq("id", user.id).limit(20),
  ]);

  const idsSeguidos = new Set((siguiendo ?? []).map((f) => f.friend_id));

  const reaccionesPorPost = new Map<string, { total: number; reaccione: boolean }>();
  for (const r of reacciones ?? []) {
    const actual = reaccionesPorPost.get(r.post_id) ?? { total: 0, reaccione: false };
    actual.total++;
    if (r.user_id === user.id) actual.reaccione = true;
    reaccionesPorPost.set(r.post_id, actual);
  }

  const postsFormateados: PostFeed[] = (posts ?? []).map((p) => {
    const autor = p.profiles as unknown as { display_name: string | null } | null;
    const logro = p.achievements as unknown as { nombre: string; descripcion: string } | null;
    const reaccion = reaccionesPorPost.get(p.id) ?? { total: 0, reaccione: false };
    return {
      id: p.id,
      userId: p.user_id,
      tipo: p.tipo as "logro" | "desafio",
      createdAt: p.created_at,
      autorNombre: autor?.display_name ?? "Jugador",
      logroNombre: logro?.nombre ?? null,
      logroDescripcion: logro?.descripcion ?? null,
      operationType: p.operation_type,
      nivel: p.nivel,
      cantidadProblemas: p.cantidad_problemas,
      esDeUnSeguido: idsSeguidos.has(p.user_id),
      esPropio: p.user_id === user.id,
      reaccionesTotal: reaccion.total,
      yoReaccione: reaccion.reaccione,
    };
  });

  const sugeridosFormateados = (sugeridos ?? [])
    .filter((s) => !idsSeguidos.has(s.id))
    .slice(0, 5)
    .map((s) => ({ id: s.id, nombre: s.display_name ?? "Jugador" }));

  return (
    <>
      <Header autenticado invitado={user.is_anonymous} />
      <FeedClient posts={postsFormateados} sugeridos={sugeridosFormateados} />
    </>
  );
}
