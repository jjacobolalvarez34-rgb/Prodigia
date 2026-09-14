"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
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
  const t = useTranslations("Bloqueos.mundo");
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
        setError(data.error ?? t("noSePudoDesbloquear"));
        return;
      }
      setPuntos(data.puntos_total);
      setComprado(true);
      setTimeout(() => router.push(destino), 900);
    } catch {
      setError(t("noSePudoConectar"));
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
          {t("mundoBloqueado", { mundo: nombreMundo })}
        </h1>
        <p className="mt-2 text-sm text-texto-secundario">
          {t.rich("desbloqueaPara", {
            mundo: nombreMundo,
            precio: PRECIO_MUNDO_CHISPAS,
            puntos,
            nombre: (chunks) => <span className="font-medium text-foreground">{chunks}</span>,
            chispas: (chunks) => <span className="font-medium text-foreground">{chunks}</span>,
            valor: (chunks) => <span className="font-medium text-foreground">{chunks}</span>,
          })}
        </p>
      </div>

      {comprado ? (
        <p className="text-sm font-medium text-correcto">{t("desbloqueado")}</p>
      ) : (
        <>
          <Boton onClick={comprar} disabled={!alcanza} cargando={comprando} destacado>
            {alcanza ? t("desbloquearPor", { precio: PRECIO_MUNDO_CHISPAS }) : t("teFaltanChispas")}
          </Boton>
          {!alcanza && (
            <p className="text-xs text-texto-secundario">
              {t("sigueJugando")}
            </p>
          )}
          {error && <p className="text-xs text-error">{error}</p>}
        </>
      )}
    </div>
  );
}
