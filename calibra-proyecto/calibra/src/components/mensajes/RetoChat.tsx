"use client";

import { useTranslations } from "next-intl";
import SelectorMundoDuelo, { useEtiquetasDuelo, useMundosDuelo } from "@/components/duelos/SelectorMundoDuelo";
import { COLOR_MUNDO, type MundoDuelo } from "@/lib/duelos/rutas";
import { estadoVisible, textoRestante, type AccionReto, type RetoChat } from "@/lib/mensajes/retosChat";

// Dos espadas cruzadas (mismo trazo que IconoCompetir de la app).
export function IconoEspadas({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M4 20l7-7M4 4l9 9 3-3-9-9H4zM20 20l-7-7M20 4v3l-6 6" />
    </svg>
  );
}

function IconoReloj({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

const MUNDOS_CONOCIDOS = Object.keys(COLOR_MUNDO);

// Reto a duelo como mensaje del chat: ciudad y tema, estado, y los botones que
// correspondan (aceptar/rechazar para quien lo recibe; ir a la sala/cancelar para
// quien retó, mientras está pendiente).
export function TarjetaRetoChat({
  reto,
  esMio,
  nombreAmigo,
  ahora,
  ocupado,
  hora,
  onAccion,
  onIrASala,
}: {
  reto: RetoChat;
  esMio: boolean;
  nombreAmigo: string;
  ahora: number;
  ocupado: boolean;
  hora: string;
  onAccion: (accion: AccionReto) => void;
  onIrASala: () => void;
}) {
  const t = useTranslations("Social.mensajes.reto");
  const { nombreMundo, etiquetaOpcion } = useEtiquetasDuelo();
  const mundo = (MUNDOS_CONOCIDOS.includes(reto.mundo) ? reto.mundo : "numeria") as MundoDuelo;
  const acento = COLOR_MUNDO[mundo];
  const opcion = reto.operationType ?? reto.subTipo;
  const estado = estadoVisible(reto, ahora);
  const pendiente = estado === "pendiente";
  const colorEstado =
    estado === "aceptada" ? "text-correcto border-correcto/40 bg-correcto/10" : pendiente ? "text-logro border-logro/40 bg-logro/10" : "text-texto-secundario border-border bg-surface-2";

  return (
    <div
      className="w-[min(20rem,85%)] overflow-hidden rounded-2xl border bg-surface shadow-lg"
      style={{ borderColor: `${acento}99`, boxShadow: pendiente ? `0 8px 26px ${acento}40` : undefined }}
    >
      <div className="flex items-center gap-3 px-3 py-2.5" style={{ background: `linear-gradient(135deg, ${acento}38, transparent 75%)` }}>
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white" style={{ backgroundColor: acento }}>
          <IconoEspadas className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-texto-secundario">{t("titulo")}</p>
          <p className="truncate font-display text-sm font-bold text-foreground">{esMio ? t("retaste", { nombre: nombreAmigo }) : t("teReto", { nombre: nombreAmigo })}</p>
          <p className="truncate text-xs font-semibold" style={{ color: acento }}>
            {nombreMundo(mundo)}
            {opcion ? ` · ${etiquetaOpcion(mundo, opcion)}` : ""}
          </p>
        </div>
      </div>
      <div className="flex flex-col gap-2 px-3 pb-3 pt-2">
        <div className="flex items-center justify-between gap-2">
          <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold ${colorEstado}`}>
            {pendiente && <IconoReloj className="h-3 w-3" />}
            {pendiente ? t("vence", { tiempo: textoRestante(reto, ahora) }) : t(`estado.${estado}`)}
          </span>
          <span className="font-mono text-[10px] text-texto-secundario">{hora}</span>
        </div>
        {pendiente && !esMio && (
          <div className="flex gap-2">
            <button
              type="button"
              disabled={ocupado}
              onClick={() => onAccion("rechazar")}
              className="flex-1 rounded-xl border border-border px-3 py-1.5 text-sm font-semibold text-foreground hover:bg-surface-2 disabled:opacity-50"
            >
              {t("rechazar")}
            </button>
            <button
              type="button"
              disabled={ocupado}
              onClick={() => onAccion("aceptar")}
              className="flex-1 rounded-xl px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-50"
              style={{ backgroundColor: acento }}
            >
              {t("aceptar")}
            </button>
          </div>
        )}
        {pendiente && esMio && (
          <div className="flex gap-2">
            <button
              type="button"
              disabled={ocupado}
              onClick={() => onAccion("cancelar")}
              className="flex-1 rounded-xl border border-border px-3 py-1.5 text-sm font-semibold text-foreground hover:bg-surface-2 disabled:opacity-50"
            >
              {t("cancelar")}
            </button>
            <button type="button" onClick={onIrASala} className="flex-1 rounded-xl px-3 py-1.5 text-sm font-semibold text-white" style={{ backgroundColor: acento }}>
              {t("irSala")}
            </button>
          </div>
        )}
        {pendiente && esMio && <p className="text-[11px] text-texto-secundario">{t("esperando", { nombre: nombreAmigo })}</p>}
      </div>
    </div>
  );
}

// Panel para elegir ciudad y tema del reto (el mismo selector que Amigos).
export function PanelRetarEnChat({ nombreAmigo, creando, onElegir, onCerrar }: { nombreAmigo: string; creando: boolean; onElegir: (mundo: MundoDuelo, opcion: string) => void; onCerrar: () => void }) {
  const t = useTranslations("Social.mensajes.reto");
  const mundos = useMundosDuelo();
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border bg-surface-2 p-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 font-display text-base font-bold text-foreground">
          <IconoEspadas className="h-4 w-4 text-primario" />
          {t("panelTitulo", { nombre: nombreAmigo })}
        </h2>
        <button type="button" onClick={onCerrar} className="rounded-full border border-border px-3 py-1 text-xs font-semibold text-texto-secundario hover:text-foreground">
          {t("cerrar")}
        </button>
      </div>
      <p className="text-xs text-texto-secundario">{t("panelExplicacion", { nombre: nombreAmigo })}</p>
      {creando ? <p className="text-sm font-semibold text-foreground">{t("creando")}</p> : <SelectorMundoDuelo mundos={mundos} requiereSubopcion onElegirSubopcion={onElegir} />}
    </div>
  );
}
