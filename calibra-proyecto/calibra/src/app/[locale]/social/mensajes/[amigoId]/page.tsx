import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { requireUsuario, bloquearInvitado } from "@/lib/auth/guard";
import type { PerfilPublico } from "@/types/database";
import Header from "@/components/Header";
import BotonEnlace from "@/components/BotonEnlace";
import MensajeDirectoClient, { type MensajeDirecto } from "./MensajeDirectoClient";

interface Props {
  params: Promise<{ amigoId: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { amigoId } = await params;
  const t = await getTranslations("Social.mensajes");
  const supabase = await createClient();
  const { data } = await supabase.rpc("obtener_perfil_publico", { p_user_id: amigoId });
  const nombre = (data as PerfilPublico[] | null)?.[0]?.display_name ?? "Prodigia";
  return {
    title: t("metadata.title", { nombre }),
    description: t("metadata.description", { nombre }),
  };
}

// Mensajería directa (0198_mensajes_directos.sql) — mínima, solo entre
// amigos. Esta ruta es a la que apunta el link "Mandar mensaje" desde
// la tarjeta de un amigo (otra fase se encarga de ese link puntual;
// esta página solo tiene que existir y funcionar cuando alguien entra
// acá). mi_conversacion() valida amistad server-side de nuevo (nunca
// hay que confiar solo en este chequeo de la página) y de paso marca
// como leídos los mensajes recibidos no leídos de esta conversación —
// por eso se llama en la carga inicial del server component, no en el
// cliente.
export default async function MensajeDirectoPage({ params }: Props) {
  const { amigoId } = await params;
  const t = await getTranslations("Social.mensajes");
  const tSocial = await getTranslations("Social");
  const supabase = await createClient();
  const { user } = await requireUsuario(supabase, `/social/mensajes/${amigoId}`);
  // Mismo guardLabel que /social (esta ruta es parte de esa misma
  // sección para un invitado) — no hace falta una etiqueta nueva.
  bloquearInvitado(user, tSocial("guardLabel"));

  if (amigoId === user.id) {
    redirect("/social");
  }

  const [{ data: amistad }, { data: perfilRows }, { data: mensajesRows, error: mensajesError }] = await Promise.all([
    supabase
      .from("friendships")
      .select("estado")
      .or(`and(user_id.eq.${user.id},friend_id.eq.${amigoId}),and(user_id.eq.${amigoId},friend_id.eq.${user.id})`)
      .eq("estado", "aceptada")
      .maybeSingle(),
    supabase.rpc("obtener_perfil_publico", { p_user_id: amigoId }),
    supabase.rpc("mi_conversacion", { p_amigo_id: amigoId }),
  ]);

  // No amigos (todavía, ya no, o nunca) -> no hay conversación que ver.
  // mi_conversacion() también la rechazaría (son_amigos()), pero se
  // chequea acá antes para poder mandar de vuelta a /social en vez de
  // mostrar un error crudo de RPC.
  if (!amistad) {
    redirect("/social");
  }

  const amigo = (perfilRows as PerfilPublico[] | null)?.[0];
  if (!amigo) {
    redirect("/social");
  }

  const mensajesIniciales: MensajeDirecto[] = mensajesError
    ? []
    : ((mensajesRows as MensajeDirecto[] | null) ?? []).slice().reverse();

  return (
    <>
      <Header autenticado invitado={user.is_anonymous} />
      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 px-4 py-8 sm:px-6">
        <BotonEnlace href="/social" variante="secundario" atras tamano="sm" className="self-start">
          {t("volver")}
        </BotonEnlace>
        <MensajeDirectoClient
          amigoId={amigoId}
          miUserId={user.id}
          amigoNombre={amigo.display_name}
          amigoAvatarUrl={amigo.avatar_url}
          mensajesIniciales={mensajesIniciales}
        />
      </div>
    </>
  );
}
