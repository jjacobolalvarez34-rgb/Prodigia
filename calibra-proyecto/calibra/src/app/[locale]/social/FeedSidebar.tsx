"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import Boton from "@/components/Boton";
import PlacaAmigo from "@/components/PlacaAmigo";
import { hrefDuelo } from "@/lib/duelos/rutas";
import SelectorMundoDuelo, { useMundosDuelo } from "@/components/duelos/SelectorMundoDuelo";
import type { UseAmigosReturn } from "./useAmigos";
import { useRetosPendientes, type RetoPendienteBase } from "./useRetosPendientes";

type Panel = "ninguno" | "agregar" | "solicitudes" | "retos";

interface Props {
  amigosState: UseAmigosReturn;
  retosIniciales: RetoPendienteBase[];
}

// Fase 3 del rediseño de Social: acceso rápido, fijo mientras el feed
// scrollea (sticky, no fixed de verdad — así respeta el ancho de su
// columna en el grid en vez de superponerse). Reusa amigosState (mismo
// hook que la pestaña "Amigos" completa) para nunca duplicar la lógica
// de buscar/pedir/aceptar — solo agrega su propio panel expandible por
// botón.
export default function FeedSidebar({ amigosState, retosIniciales }: Props) {
  const t = useTranslations("Social");
  const mundosDuelo = useMundosDuelo();
  const [panel, setPanel] = useState<Panel>("ninguno");
  const {
    consulta,
    setConsulta,
    resultados,
    buscando,
    solicitudes,
    amigos,
    enviadas,
    buscar,
    enviarSolicitud,
    responder,
    retar,
    quitarAmigo,
    error,
  } = amigosState;
  const { retos, rechazar } = useRetosPendientes(retosIniciales);
  const [retandoA, setRetandoA] = useState<string | null>(null);

  function togglePanel(p: Panel) {
    setPanel((actual) => (actual === p ? "ninguno" : p));
  }

  return (
    <aside className="flex w-full flex-col gap-3 md:sticky md:top-20 md:h-fit md:w-64 md:shrink-0">
      <button
        onClick={() => togglePanel("agregar")}
        className={`rounded-xl border px-4 py-2.5 text-left text-sm font-medium transition-colors ${
          panel === "agregar" ? "border-primario/40 bg-primario/5 text-primario" : "border-border bg-surface text-foreground hover:border-primario/30"
        }`}
      >
        {t("sidebar.botonAgregarAmigos")}
      </button>
      {/* error compartido entre los 3 paneles (buscar/enviar/responder/
          retar pueden fallar desde cualquiera) — antes solo se veía si
          el panel abierto era "agregar", así que una falla al aceptar
          una solicitud o retar a alguien no mostraba nada. */}
      {error && <p className="text-xs text-error">{error}</p>}
      {panel === "agregar" && (
        <div className="flex flex-col gap-2 rounded-xl border border-border bg-surface p-3">
          <form onSubmit={(e) => { e.preventDefault(); buscar(consulta); }} className="flex gap-1.5">
            <input
              value={consulta}
              onChange={(e) => setConsulta(e.target.value)}
              placeholder={t("buscarPorNombre")}
              className="min-w-0 flex-1 rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs text-foreground outline-none focus:border-primario"
            />
            <Boton type="submit" disabled={consulta.trim().length < 2} cargando={buscando} className="px-2.5 py-1.5 text-xs">
              {t("buscar")}
            </Boton>
          </form>
          {!buscando && !error && consulta.trim().length >= 2 && resultados.length === 0 && (
            <p className="text-xs text-texto-secundario">{t("noEncontramosANadie")}</p>
          )}
          {resultados.map((r) => (
            <div key={r.id} className="flex items-center justify-between gap-2 text-xs">
              <span className="truncate font-medium text-foreground">{r.display_name ?? t("jugador")}</span>
              <button
                onClick={() => enviarSolicitud(r.id)}
                disabled={enviadas.has(r.id)}
                className="shrink-0 text-primario hover:underline disabled:text-texto-secundario disabled:no-underline"
              >
                {enviadas.has(r.id) ? t("enviada") : t("sidebar.enviarCorto")}
              </button>
            </div>
          ))}
        </div>
      )}

      <button
        onClick={() => togglePanel("solicitudes")}
        className={`flex items-center justify-between rounded-xl border px-4 py-2.5 text-left text-sm font-medium transition-colors ${
          panel === "solicitudes" ? "border-primario/40 bg-primario/5 text-primario" : "border-border bg-surface text-foreground hover:border-primario/30"
        }`}
      >
        {t("solicitudesPendientes")}
        {solicitudes.length > 0 && (
          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primario px-1 text-[11px] font-bold text-white">
            {solicitudes.length}
          </span>
        )}
      </button>
      {panel === "solicitudes" && (
        <div className="flex flex-col gap-2 rounded-xl border border-border bg-surface p-3">
          {solicitudes.length === 0 ? (
            <p className="text-xs text-texto-secundario">{t("sidebar.nadaPendiente")}</p>
          ) : (
            solicitudes.map((s) => (
              <div key={s.user_id} className="flex items-center justify-between gap-2 text-xs">
                <span className="truncate font-medium text-foreground">{s.display_name ?? t("jugador")}</span>
                <div className="flex shrink-0 gap-2">
                  <button onClick={() => responder(s.user_id, true)} className="font-medium text-correcto hover:underline">
                    {t("aceptar")}
                  </button>
                  <button onClick={() => responder(s.user_id, false)} className="text-texto-secundario hover:underline">
                    {t("rechazar")}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      <button
        onClick={() => togglePanel("retos")}
        className={`flex items-center justify-between rounded-xl border px-4 py-2.5 text-left text-sm font-medium transition-colors ${
          panel === "retos" ? "border-primario/40 bg-primario/5 text-primario" : "border-border bg-surface text-foreground hover:border-primario/30"
        }`}
      >
        {t("sidebar.retosPendientes")}
        {retos.length > 0 && (
          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-logro px-1 text-[11px] font-bold text-foreground">
            {retos.length}
          </span>
        )}
      </button>
      {panel === "retos" && (
        <div className="flex flex-col gap-2 rounded-xl border border-border bg-surface p-3">
          {retos.length === 0 ? (
            <p className="text-xs text-texto-secundario">{t("sidebar.nadieTeReto")}</p>
          ) : (
            retos.map((r) => (
              <div key={r.duel_id} className="flex flex-col gap-1.5 rounded-lg border border-border/60 px-2.5 py-2 text-xs">
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate font-medium text-foreground">
                    {r.retador_nombre ?? t("sidebar.alguien")} ·{" "}
                    {r.mundo === "numeria" && r.operation_type ? t(`operaciones.${r.operation_type}`) : t(`mundos.${r.mundo}`)}
                  </span>
                  {r.segundosRestantes !== null && (
                    <span className="shrink-0 font-mono text-[10px] text-texto-secundario">{r.segundosRestantes}s</span>
                  )}
                </div>
                <div className="flex gap-2">
                  <Link href={hrefDuelo(r.mundo, r.operation_type, r.duel_id)} className="font-medium text-primario hover:underline">
                    {t("sidebar.botonJugar")}
                  </Link>
                  <button onClick={() => rechazar(r.duel_id)} className="text-texto-secundario hover:underline">
                    {t("rechazar")}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      <div className="flex flex-col gap-2 rounded-xl border border-border bg-surface p-3">
        <p className="text-xs font-medium uppercase tracking-wide text-texto-secundario">{t("tusAmigos")}</p>
        {amigos.length === 0 ? (
          <p className="text-xs text-texto-secundario">{t("sidebar.sinAmigos")}</p>
        ) : (
          amigos.map((a) => (
            <div key={a.friend_id} className="flex flex-col gap-1.5">
              <PlacaAmigo
                amigo={a}
                compacto
                onRetar={() => setRetandoA(retandoA === a.friend_id ? null : a.friend_id)}
                onQuitar={() => quitarAmigo(a.friend_id)}
              />
              {retandoA === a.friend_id && (
                <SelectorMundoDuelo
                  mundos={mundosDuelo}
                  requiereSubopcion
                  onElegirSubopcion={(mundo, opcion) => retar(a.friend_id, mundo, opcion)}
                />
              )}
            </div>
          ))
        )}
      </div>
    </aside>
  );
}
