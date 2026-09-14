"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import Boton from "@/components/Boton";

export type EstadoAmistad = "ninguno" | "amigos" | "enviada" | "recibida";

interface Props {
  userId: string;
  estadoInicial: EstadoAmistad;
}

// Botón de amistad en el perfil público de otro usuario — 4 estados
// posibles según la fila de `friendships` entre el que mira y el
// dueño del perfil (ver perfil/[userId]/page.tsx, que ya resuelve cuál
// de los 4 es antes de renderizar esto): "ninguno" (invitar), "enviada"
// (yo mandé la solicitud, esperando), "recibida" (me invitó, puedo
// aceptar/rechazar acá mismo) y "amigos" (ya lo son, sin acción).
export default function AmistadBoton({ userId, estadoInicial }: Props) {
  const t = useTranslations("Perfil");
  const [estado, setEstado] = useState(estadoInicial);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function invitar() {
    setCargando(true);
    setError(null);
    const res = await fetch("/api/amigos/solicitar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ friend_id: userId }),
    });
    const data = await res.json().catch(() => ({}));
    setCargando(false);
    if (!res.ok) {
      setError(data.error ?? t("amistadBoton.errorEnviarSolicitud"));
      return;
    }
    setEstado("enviada");
  }

  async function responder(aceptar: boolean) {
    setCargando(true);
    setError(null);
    const res = await fetch("/api/amigos/responder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userId, aceptar }),
    });
    const data = await res.json().catch(() => ({}));
    setCargando(false);
    if (!res.ok) {
      setError(data.error ?? t("amistadBoton.errorProcesarSolicitud"));
      return;
    }
    setEstado(aceptar ? "amigos" : "ninguno");
  }

  if (estado === "amigos") {
    return (
      <span className="rounded-full border border-correcto/30 bg-correcto/10 px-3 py-1.5 text-sm font-medium text-correcto">
        {t("amistadBoton.yaSonAmigos")}
      </span>
    );
  }

  if (estado === "enviada") {
    return (
      <span className="rounded-full border border-border px-3 py-1.5 text-sm font-medium text-texto-secundario">
        {t("amistadBoton.solicitudEnviada")}
      </span>
    );
  }

  if (estado === "recibida") {
    return (
      <div className="flex flex-col items-center gap-1.5">
        <div className="flex gap-2">
          <Boton onClick={() => responder(true)} cargando={cargando} className="px-3 py-1.5 text-sm">
            {t("amistadBoton.aceptarSolicitud")}
          </Boton>
          <button
            onClick={() => responder(false)}
            disabled={cargando}
            className="rounded-full border border-border px-3 py-1.5 text-sm font-medium text-texto-secundario transition-colors hover:border-error/40 hover:text-error disabled:opacity-60"
          >
            {t("amistadBoton.rechazar")}
          </button>
        </div>
        {error && <p className="text-xs text-error">{error}</p>}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-1.5">
      <Boton onClick={invitar} cargando={cargando} className="px-4 py-2 text-sm">
        {t("amistadBoton.invitarSerAmigo")}
      </Boton>
      {error && <p className="text-xs text-error">{error}</p>}
    </div>
  );
}
