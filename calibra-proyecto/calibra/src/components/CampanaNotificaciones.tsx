"use client";

// Campanita centralizada de notificaciones (pedido del propietario):
// junta en un solo dropdown las 3 cosas que hoy viven repartidas —
// solicitudes de amistad, invitaciones a duelo, invitaciones a clan.
// Reusa los hooks únicos ya existentes (useAmigos/useRetosPendientes)
// y el nuevo useInvitacionesClan — nunca copia su estado, mismo
// criterio documentado en useAmigos.ts.
import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { hrefDuelo } from "@/lib/duelos/rutas";
import { IconCampana } from "@/components/icons";
import type { UseAmigosReturn } from "@/app/[locale]/social/useAmigos";
import { useRetosPendientes, type RetoPendienteBase } from "@/app/[locale]/social/useRetosPendientes";
import { useInvitacionesClan, type InvitacionClan } from "@/app/[locale]/social/useInvitacionesClan";
import { reproducirTono } from "@/lib/sonido";

interface Props {
  amigosState: UseAmigosReturn;
  retosIniciales: RetoPendienteBase[];
  invitacionesClanIniciales: InvitacionClan[];
}

export default function CampanaNotificaciones({ amigosState, retosIniciales, invitacionesClanIniciales }: Props) {
  const t = useTranslations("Common.campana");
  const tClan = useTranslations("Clanes.invitacionRecibida");
  const tSocial = useTranslations("Social");
  const [abierta, setAbierta] = useState(false);
  const contenedorRef = useRef<HTMLDivElement>(null);

  const { solicitudes, responder: responderAmistad } = amigosState;
  const { retos, rechazar: rechazarReto } = useRetosPendientes(retosIniciales);
  const { invitaciones: invitacionesClan, respondiendoId, responder: responderClan } = useInvitacionesClan(
    invitacionesClanIniciales
  );

  const total = solicitudes.length + retos.length + invitacionesClan.length;

  useEffect(() => {
    if (!abierta) return;
    function onClickFuera(e: MouseEvent) {
      if (contenedorRef.current && !contenedorRef.current.contains(e.target as Node)) {
        setAbierta(false);
      }
    }
    document.addEventListener("mousedown", onClickFuera);
    return () => document.removeEventListener("mousedown", onClickFuera);
  }, [abierta]);

  return (
    <div ref={contenedorRef} className="relative">
      <button
        type="button"
        onClick={() => {
          setAbierta((v) => {
            if (!v && total > 0) reproducirTono("notificacion");
            return !v;
          });
        }}
        aria-label={t("abrir")}
        className="relative flex h-9 w-9 items-center justify-center rounded-full text-texto-secundario transition-colors hover:bg-surface-2 hover:text-foreground"
      >
        <IconCampana className="h-5 w-5" />
        {total > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-primario px-1 text-[10px] font-bold text-white">
            {total > 9 ? "9+" : total}
          </span>
        )}
      </button>

      {abierta && (
        <div className="absolute right-0 top-full z-50 mt-2 max-h-[70vh] w-80 overflow-y-auto rounded-2xl border border-border bg-surface shadow-xl">
          {total === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-texto-secundario">{t("sinNotificaciones")}</p>
          ) : (
            <div className="flex flex-col divide-y divide-border">
              {solicitudes.length > 0 && (
                <div className="flex flex-col gap-2 px-4 py-3">
                  <p className="text-[11px] font-bold uppercase tracking-wide text-texto-secundario">
                    {tSocial("solicitudesPendientes")}
                  </p>
                  {solicitudes.map((s) => (
                    <div key={s.user_id} className="flex items-center justify-between gap-2 text-sm">
                      <span className="truncate font-medium text-foreground">{s.display_name ?? tSocial("jugador")}</span>
                      <div className="flex shrink-0 gap-2 text-xs">
                        <button
                          onClick={() => responderAmistad(s.user_id, true)}
                          className="font-semibold text-correcto hover:underline"
                        >
                          {tSocial("aceptar")}
                        </button>
                        <button
                          onClick={() => responderAmistad(s.user_id, false)}
                          className="text-texto-secundario hover:underline"
                        >
                          {tSocial("rechazar")}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {retos.length > 0 && (
                <div className="flex flex-col gap-2 px-4 py-3">
                  <p className="text-[11px] font-bold uppercase tracking-wide text-texto-secundario">
                    {tSocial("sidebar.retosPendientes")}
                  </p>
                  {retos.map((r) => (
                    <div key={r.duel_id} className="flex flex-col gap-1.5 rounded-lg border border-border/60 px-2.5 py-2 text-xs">
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate font-medium text-foreground">
                          {r.retador_nombre ?? tSocial("sidebar.alguien")} ·{" "}
                          {r.mundo === "numeria" && r.operation_type
                            ? tSocial(`operaciones.${r.operation_type}`)
                            : tSocial(`mundos.${r.mundo}`)}
                        </span>
                        {r.segundosRestantes !== null && (
                          <span className="shrink-0 font-mono text-[10px] text-texto-secundario">{r.segundosRestantes}s</span>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Link
                          href={hrefDuelo(r.mundo, r.operation_type, r.duel_id)}
                          onClick={() => setAbierta(false)}
                          className="font-medium text-primario hover:underline"
                        >
                          {tSocial("sidebar.botonJugar")}
                        </Link>
                        <button onClick={() => rechazarReto(r.duel_id)} className="text-texto-secundario hover:underline">
                          {tSocial("rechazar")}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {invitacionesClan.length > 0 && (
                <div className="flex flex-col gap-2 px-4 py-3">
                  <p className="text-[11px] font-bold uppercase tracking-wide text-texto-secundario">{tClan("titulo")}</p>
                  {invitacionesClan.map((inv) => (
                    <div key={inv.invitacion_id} className="flex flex-col gap-1.5 rounded-lg border border-border/60 px-2.5 py-2 text-xs">
                      <p className="text-foreground">
                        {tClan("texto", {
                          invitador: inv.invitador_nombre ?? tSocial("jugador"),
                          clan: `${inv.nombre}${inv.tag ? ` [${inv.tag}]` : ""}`,
                        })}
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => responderClan(inv.invitacion_id, true)}
                          disabled={respondiendoId === inv.invitacion_id}
                          className="font-semibold text-correcto hover:underline disabled:opacity-50"
                        >
                          {respondiendoId === inv.invitacion_id ? tClan("aceptando") : tClan("aceptar")}
                        </button>
                        <button
                          onClick={() => responderClan(inv.invitacion_id, false)}
                          disabled={respondiendoId === inv.invitacion_id}
                          className="text-texto-secundario hover:underline disabled:opacity-50"
                        >
                          {tClan("rechazar")}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
