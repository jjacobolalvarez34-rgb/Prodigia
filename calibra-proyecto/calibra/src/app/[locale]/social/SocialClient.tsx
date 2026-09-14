"use client";

import { useTranslations } from "next-intl";
import AmigosClient from "@/app/[locale]/amigos/AmigosClient";
import CampanaNotificaciones from "@/components/CampanaNotificaciones";
import type { PostFeed } from "./Feed";
import { useAmigos, type Solicitud, type Amigo } from "./useAmigos";
import type { RetoPendienteBase } from "./useRetosPendientes";
import type { InvitacionClan } from "./useInvitacionesClan";

interface Props {
  posts: PostFeed[];
  solicitudesIniciales: Solicitud[];
  amigosIniciales: Amigo[];
  retosIniciales: RetoPendienteBase[];
  invitacionesClanIniciales: InvitacionClan[];
  puedeCrearProblemaPersonalizado: boolean;
}

// Fase 8 (tanda "Clanes: bugs y sistemas faltantes"): Feed queda
// desactivado temporalmente — no navegable, sin selector — hasta una
// sesión futura. A propósito NO se borra Feed.tsx/FeedSidebar.tsx ni
// la carga de posts en page.tsx, solo se dejan de usar acá.
export default function SocialClient({
  posts: _posts,
  solicitudesIniciales,
  amigosIniciales,
  retosIniciales,
  invitacionesClanIniciales,
  puedeCrearProblemaPersonalizado: _puedeCrearProblemaPersonalizado,
}: Props) {
  const amigosState = useAmigos(solicitudesIniciales, amigosIniciales);
  const t = useTranslations("Social");

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 pt-10 sm:px-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">{t("tituloPagina")}</h1>
        <CampanaNotificaciones
          amigosState={amigosState}
          retosIniciales={retosIniciales}
          invitacionesClanIniciales={invitacionesClanIniciales}
        />
      </div>
      <AmigosClient amigosState={amigosState} />
    </div>
  );
}
