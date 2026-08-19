"use client";

import { useState } from "react";
import AmigosClient from "@/app/amigos/AmigosClient";
import Feed, { type PostFeed } from "./Feed";
import FeedSidebar from "./FeedSidebar";
import { useAmigos, type Solicitud, type Amigo } from "./useAmigos";
import type { RetoPendienteBase } from "./useRetosPendientes";

type Tab = "feed" | "amigos";

interface Props {
  tabInicial: Tab;
  posts: PostFeed[];
  solicitudesIniciales: Solicitud[];
  amigosIniciales: Amigo[];
  retosIniciales: RetoPendienteBase[];
  puedeCrearProblemaPersonalizado: boolean;
}

const TABS: { id: Tab; nombre: string }[] = [
  { id: "feed", nombre: "Feed" },
  { id: "amigos", nombre: "Amigos" },
];

// Fase 3 del rediseño de Social — layout tipo Instagram: Feed es la
// pestaña por default, con una barra lateral FIJA de accesos rápidos de
// amigos/retos. "Amigos" mantiene la gestión completa de siempre. Las
// dos comparten useAmigos() (una sola vez, acá) para que aceptar una
// solicitud desde la barra lateral se refleje también si cambiás a la
// pestaña Amigos, sin dos copias de estado que puedan desincronizarse.
export default function SocialClient({
  tabInicial,
  posts,
  solicitudesIniciales,
  amigosIniciales,
  retosIniciales,
  puedeCrearProblemaPersonalizado,
}: Props) {
  const [tab, setTab] = useState<Tab>(tabInicial);
  const amigosState = useAmigos(solicitudesIniciales, amigosIniciales);

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 pt-10 sm:px-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">Social</h1>
        <div className="mt-4 flex w-fit gap-1 rounded-full border border-border bg-surface p-1">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                tab === t.id ? "bg-primario text-white" : "text-texto-secundario hover:text-foreground"
              }`}
            >
              {t.nombre}
            </button>
          ))}
        </div>
      </div>

      {tab === "feed" ? (
        <div className="flex flex-1 flex-col gap-6 pb-12 md:flex-row md:items-start">
          <Feed posts={posts} puedeCrearProblemaPersonalizado={puedeCrearProblemaPersonalizado} />
          <FeedSidebar amigosState={amigosState} retosIniciales={retosIniciales} />
        </div>
      ) : (
        <AmigosClient amigosState={amigosState} />
      )}
    </div>
  );
}
