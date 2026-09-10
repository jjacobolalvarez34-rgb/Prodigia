"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Boton from "@/components/Boton";
import { IconCandado } from "@/components/icons";
import { PRECIO_MUNDO_CHISPAS, type MundoPago } from "@/lib/mundos/precios";

interface Props {
  mundo: MundoPago;
  nombreMundo: string;
  puntosIniciales: number;
  destino: string;
}

export default function MundoBloqueadoClient({ mundo, nombreMundo, puntosIniciales, destino }: Props) {
  const router = useRouter();
  const [puntos, setPuntos] = useState(puntosIniciales);
  const [comprando, setComprando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [comprado, setComprado] = useState(false);

  const alcanza = puntos >= PRECIO_MUNDO_CHISPAS;

  async function comprar() {
    setComprando(true);
    setError(null);
    try {
      const res = await fetch("/api/mundos/desbloquear", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mundo }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "No se pudo desbloquear. Probá de nuevo.");
        return;
      }
      setPuntos(data.puntos_total);
      setComprado(true);
      setTimeout(() => router.push(destino), 900);
    } catch {
      setError("No se pudo conectar. Probá de nuevo.");
    } finally {
      setComprando(false);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-sm flex-1 flex-col items-center justify-center gap-5 px-4 py-16 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primario/10 text-primario">
        <IconCandado className="h-7 w-7" />
      </span>
      <div>
        <h1 className="font-display text-xl font-bold tracking-tight text-foreground">
          {nombreMundo} está bloqueado
        </h1>
        <p className="mt-2 text-sm text-texto-secundario">
          Desbloqueá <span className="font-medium text-foreground">{nombreMundo}</span> para siempre por{" "}
          <span className="font-medium text-foreground">{PRECIO_MUNDO_CHISPAS} Chispas</span>. Tenés{" "}
          <span className="font-medium text-foreground">{puntos}</span>.
        </p>
      </div>

      {comprado ? (
        <p className="text-sm font-medium text-correcto">¡Desbloqueado! Entrando…</p>
      ) : (
        <>
          <Boton onClick={comprar} disabled={!alcanza} cargando={comprando} destacado>
            {alcanza ? `Desbloquear por ${PRECIO_MUNDO_CHISPAS} Chispas` : "Te faltan Chispas"}
          </Boton>
          {!alcanza && (
            <p className="text-xs text-texto-secundario">
              Sigue jugando para ganar más Chispas, o mira la tienda.
            </p>
          )}
          {error && <p className="text-xs text-error">{error}</p>}
        </>
      )}
    </div>
  );
}
