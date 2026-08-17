"use client";

import { useState } from "react";
import AmigosClient from "@/app/amigos/AmigosClient";
import ProfesorClient from "@/app/profesor/ProfesorClient";

type Tab = "amigos" | "grupos";

interface Solicitud {
  user_id: string;
  display_name: string | null;
}

interface Amigo {
  friend_id: string;
  display_name: string | null;
  elo_rating: number;
}

interface Grupo {
  id: string;
  nombre: string;
  codigo_invitacion: string;
}

interface Props {
  miUserId: string;
  tabInicial: Tab;
  solicitudesIniciales: Solicitud[];
  amigosIniciales: Amigo[];
  gruposIniciales: Grupo[];
}

const TABS: { id: Tab; nombre: string }[] = [
  { id: "amigos", nombre: "Amigos" },
  { id: "grupos", nombre: "Grupos" },
];

// Fase T2: Amigos y Profesor (renombrado "Grupos") comparten una sola
// sección "Social" con pestañas — la funcionalidad de cada uno no
// cambió, solo dónde se entra. Reutiliza los clientes existentes tal
// cual, sin reescribir su lógica interna.
export default function SocialClient({
  miUserId,
  tabInicial,
  solicitudesIniciales,
  amigosIniciales,
  gruposIniciales,
}: Props) {
  const [tab, setTab] = useState<Tab>(tabInicial);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 pt-10 sm:px-6">
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

      {tab === "amigos" ? (
        <AmigosClient miUserId={miUserId} solicitudesIniciales={solicitudesIniciales} amigosIniciales={amigosIniciales} />
      ) : (
        <ProfesorClient grupos={gruposIniciales} />
      )}
    </div>
  );
}
