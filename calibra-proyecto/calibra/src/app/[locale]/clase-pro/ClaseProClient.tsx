"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";
import { TICKETS_PRO_INICIALES, usarTicketClase } from "@/lib/aprender/ticketsPro";
import Boton from "@/components/Boton";
import { IconCandado } from "@/components/icons";

interface Props {
  tecnicaId: string;
  nombre: string;
  tickets: number;
  destino: string;
  proHref: string;
}

export default function ClaseProClient({ tecnicaId, nombre, tickets: inicial, destino, proHref }: Props) {
  const t = useTranslations("TicketsPro");
  const router = useRouter();
  const [tickets, setTickets] = useState(inicial);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(false);

  async function usar() {
    setCargando(true);
    setError(false);
    const r = await usarTicketClase(createClient(), tecnicaId);
    if (r?.desbloqueada) {
      router.push(destino);
      return;
    }
    setCargando(false);
    if (r) setTickets(r.restantes);
    else setError(true);
  }

  return (
    <div className="flex flex-col items-center gap-5 rounded-3xl border border-border bg-surface p-6 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-border bg-surface-2 text-texto-secundario">
        <IconCandado className="h-6 w-6" />
      </span>
      <div className="flex flex-col gap-1">
        <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-texto-secundario">{t("claseProEtiqueta")}</p>
        <h1 className="font-display text-2xl font-bold">{nombre}</h1>
      </div>

      <div className="flex flex-col items-center gap-2" aria-label={t("quedan", { n: tickets })}>
        <div className="flex gap-2">
          {Array.from({ length: Math.max(TICKETS_PRO_INICIALES, tickets) }, (_, i) => (
            <span
              key={i}
              className={`h-7 w-11 rounded-md border-2 ${i < tickets ? "border-[#B8860B] bg-[#FFC53D]" : "border-dashed border-border bg-transparent"}`}
            />
          ))}
        </div>
        <p className="text-sm font-semibold">{t("quedan", { n: tickets })}</p>
      </div>

      {tickets > 0 ? (
        <>
          <p className="max-w-sm text-sm text-texto-secundario">{t("explicacion")}</p>
          <Boton onClick={usar} cargando={cargando} disabled={cargando}>
            {t("usar")}
          </Boton>
          <Link href={proHref} className="text-sm font-semibold hover:underline">
            {t("verPro")}
          </Link>
        </>
      ) : (
        <>
          <p className="text-base font-semibold">{t("sinTickets")}</p>
          <Link
            href={proHref}
            className="rounded-full bg-[#FFC53D] px-6 py-3 font-bold text-[#05060F] shadow-[3px_3px_0_0_#05060F] hover:brightness-105"
          >
            {t("hazteProCta")}
          </Link>
        </>
      )}
      {error && <p className="text-sm text-error">{t("error")}</p>}
    </div>
  );
}
