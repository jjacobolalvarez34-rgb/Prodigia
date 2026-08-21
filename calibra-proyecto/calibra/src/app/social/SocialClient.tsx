"use client";

import AmigosClient from "@/app/amigos/AmigosClient";
import type { PostFeed } from "./Feed";
import { useAmigos, type Solicitud, type Amigo } from "./useAmigos";
import type { RetoPendienteBase } from "./useRetosPendientes";

interface Props {
  posts: PostFeed[];
  solicitudesIniciales: Solicitud[];
  amigosIniciales: Amigo[];
  retosIniciales: RetoPendienteBase[];
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
  retosIniciales: _retosIniciales,
  puedeCrearProblemaPersonalizado: _puedeCrearProblemaPersonalizado,
}: Props) {
  const amigosState = useAmigos(solicitudesIniciales, amigosIniciales);

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 pt-10 sm:px-6">
      <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">Social</h1>
      <AmigosClient amigosState={amigosState} />
    </div>
  );
}
