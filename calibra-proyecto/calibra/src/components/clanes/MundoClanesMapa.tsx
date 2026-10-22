"use client";

import { useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { ESTILO_MAPA, calcularTerritorios } from "@/lib/clanes/territorios";
import EscenaCiudad, { type MiembroCasa } from "./EscenaCiudad";
import EstandarteClan from "./EstandarteClan";
import MapaTerritorios, { type TextosMapa } from "./MapaTerritorios";

export interface ParcelaClan {
  clan_id: string;
  nombre: string;
  tag: string | null;
  color_estandarte: string;
  nivel_clan: number;
  cantidad_miembros: number;
  capacidad: number;
  creado_at?: string | null;
  imagen_url: string | null;
}

interface ClanPublico extends ParcelaClan {
  descripcion: string;
  guerras_ganadas: number;
}

const ZOOM_MIN = 0.7;
const ZOOM_MAX = 6;
const ZOOM_MI_CLAN = 2.2;
/** Píxeles por unidad del mapa por debajo de los cuales los nombres no se leen. */
const ESCALA_LEGIBLE = 0.55;
// Fase 8 (auditoría 2026-08-25 — "clickear una parcela no abre la
// ciudad"): causa real, mismo patrón que el bug viejo de GlareHover —
// onPointerDown arrancaba el arrastre y llamaba setPointerCapture()
// en CUALQUIER click, sin exigir movimiento real primero. Un click
// real en el mouse/dedo casi nunca tiene cero movimiento entre down y
// up (tiembla un par de píxeles) — eso ya alcanzaba para: (a)
// capturar el puntero en el contenedor de pan/zoom en vez de dejarlo
// en el territorio, y (b) mover `offset` un pelo durante el gesto, lo
// que varios navegadores toman como "fue un drag, no un click" y
// cancelan el evento click sintético. Con un piso de movimiento real
// antes de considerar que empezó un arrastre (y setPointerCapture
// recién ahí, no en el pointerdown), un click genuino nunca dispara
// nada de esto — llega intacto al territorio.
const UMBRAL_ARRASTRE_PX = 6;

// Mundo de Clanes como mapa de territorios (pedido del 2026-10-21): cada clan es
// una región irregular cuyo tamaño sale de sus miembros y su nivel; los clanes
// nuevos fundan su territorio en la frontera (geometría en
// lib/clanes/territorios.ts, la misma que dibuja la app). Pan/zoom sin librería
// externa: arrastre con Pointer Events + escala con la rueda o los botones.
export default function MundoClanesMapa({
  parcelas,
  miClanId = null,
  ahora,
}: {
  parcelas: ParcelaClan[];
  miClanId?: string | null;
  /** Momento del servidor para marcar territorios recién fundados. */
  ahora: number;
}) {
  const t = useTranslations("Clanes.mapa");
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [arrastrando, setArrastrando] = useState(false);
  // "podría estar arrastrando" (el puntero está abajo) vs. "ya
  // confirmado que es un arrastre real" (superó UMBRAL_ARRASTRE_PX) —
  // son dos cosas distintas a propósito, ver comentario arriba.
  const punteroAbajoRef = useRef(false);
  const arrastreConfirmadoRef = useRef(false);
  const puntoInicialRef = useRef({ x: 0, y: 0 });
  const ultimoPunto = useRef({ x: 0, y: 0 });
  const contenedorRef = useRef<HTMLDivElement>(null);

  const [seleccionado, setSeleccionado] = useState<ClanPublico | null>(null);
  const [miembrosClan, setMiembrosClan] = useState<MiembroCasa[]>([]);
  const [cargandoDetalle, setCargandoDetalle] = useState(false);

  const mapa = useMemo(() => calcularTerritorios(parcelas), [parcelas]);
  const miTerritorio = miClanId ? (mapa.territorios.find((x) => x.clan_id === miClanId) ?? null) : null;
  const textos = useMemo<TextosMapa>(
    () => ({
      tuClan: t("tuClan"),
      nuevo: t("nuevo"),
      detalle: (c) => `${t("nivelAbrev", { nivel: c.nivel_clan })} · ${c.cantidad_miembros}`,
      territorioDe: (c) => t("territorioDe", { nombre: c.nombre }),
    }),
    [t],
  );

  function onPointerDown(e: React.PointerEvent) {
    punteroAbajoRef.current = true;
    arrastreConfirmadoRef.current = false;
    puntoInicialRef.current = { x: e.clientX, y: e.clientY };
    ultimoPunto.current = { x: e.clientX, y: e.clientY };
    // Nada de setPointerCapture ni setArrastrando(true) todavía — recién
    // cuando se confirma un movimiento real (onPointerMove de abajo). Un
    // click sobre un territorio nunca debe pasar por acá.
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!punteroAbajoRef.current) return;

    if (!arrastreConfirmadoRef.current) {
      const distancia = Math.hypot(e.clientX - puntoInicialRef.current.x, e.clientY - puntoInicialRef.current.y);
      if (distancia < UMBRAL_ARRASTRE_PX) return;
      arrastreConfirmadoRef.current = true;
      setArrastrando(true);
      contenedorRef.current?.setPointerCapture(e.pointerId);
    }

    const dx = e.clientX - ultimoPunto.current.x;
    const dy = e.clientY - ultimoPunto.current.y;
    ultimoPunto.current = { x: e.clientX, y: e.clientY };
    setOffset((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
  }

  function onPointerUp(e: React.PointerEvent) {
    punteroAbajoRef.current = false;
    setArrastrando(false);
    if (arrastreConfirmadoRef.current && contenedorRef.current?.hasPointerCapture(e.pointerId)) {
      contenedorRef.current.releasePointerCapture(e.pointerId);
    }
    arrastreConfirmadoRef.current = false;
  }

  function onWheel(e: React.WheelEvent) {
    e.preventDefault();
    setZoom((z) => Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, z * (1 - e.deltaY * 0.0012))));
  }

  // Desplazamiento que deja el centro de mi territorio en el medio del contenedor.
  function offsetHaciaMiClan(el: HTMLDivElement, z: number) {
    if (!miTerritorio) return { x: 0, y: 0 };
    // El SVG se ajusta al contenedor ("meet"): de unidades del mapa a píxeles.
    const { width: W, height: H } = el.getBoundingClientRect();
    const { minX, minY, ancho, alto } = mapa.caja;
    const f = Math.min(W / ancho, H / alto);
    const lx = (W - ancho * f) / 2 + (miTerritorio.centro.x - minX) * f;
    const ly = (H - alto * f) / 2 + (miTerritorio.centro.y - minY) * f;
    return { x: -z * (lx - W / 2), y: -z * (ly - H / 2) };
  }

  function irAMiClan() {
    const el = contenedorRef.current;
    if (!el || !miTerritorio) return;
    const z = Math.max(zoom, ZOOM_MI_CLAN);
    setZoom(z);
    setOffset(offsetHaciaMiClan(el, z));
  }

  // Encuadre inicial (una sola vez, al montar el contenedor): con muchos clanes el
  // mapa entero queda chico, así que se acerca hasta una escala legible y, si hace
  // falta acercar, se centra en mi clan.
  const encuadradoRef = useRef(false);
  function montarContenedor(el: HTMLDivElement | null) {
    contenedorRef.current = el;
    if (!el || encuadradoRef.current || mapa.territorios.length === 0) return;
    encuadradoRef.current = true;
    const { width: W, height: H } = el.getBoundingClientRect();
    const f = Math.min(W / mapa.caja.ancho, H / mapa.caja.alto);
    if (!(f > 0) || f >= ESCALA_LEGIBLE) return;
    const z = Math.min(ZOOM_MAX, ESCALA_LEGIBLE / f);
    setZoom(z);
    setOffset(offsetHaciaMiClan(el, z));
  }

  async function abrirClan(clanId: string) {
    setCargandoDetalle(true);
    setMiembrosClan([]);
    try {
      const supabase = createClient();
      // Fase 4 (bug "la ciudad del clan no carga ni las casas por
      // miembro"): miembros_de_clan() es de lectura pública para cualquier
      // clan_id, así que el panel puede mostrar las casas de cada miembro.
      const [{ data }, { data: miembrosData }] = await Promise.all([
        supabase.rpc("ver_clan_publico", { p_clan_id: clanId }),
        supabase.rpc("miembros_de_clan", { p_clan_id: clanId }),
      ]);
      const fila = (data as ClanPublico[] | null)?.[0];
      if (fila) setSeleccionado(fila);
      setMiembrosClan((miembrosData as MiembroCasa[] | null) ?? []);
    } finally {
      setCargandoDetalle(false);
    }
  }

  const botonRedondo =
    "flex h-8 min-w-8 items-center justify-center rounded-full border border-border px-2 text-sm font-bold text-foreground hover:bg-surface-2";

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-texto-secundario">{t("ayuda")}</p>
        <div className="flex items-center gap-1.5">
          {miTerritorio && (
            <button onClick={irAMiClan} className={`${botonRedondo} text-xs`}>
              {t("irAMiClan")}
            </button>
          )}
          <button
            onClick={() => setZoom((z) => Math.max(ZOOM_MIN, z / 1.3))}
            aria-label={t("alejar")}
            className={botonRedondo}
          >
            −
          </button>
          <button
            onClick={() => setZoom((z) => Math.min(ZOOM_MAX, z * 1.3))}
            aria-label={t("acercar")}
            className={botonRedondo}
          >
            +
          </button>
        </div>
      </div>

      <div
        ref={montarContenedor}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
        onWheel={onWheel}
        className="relative h-[460px] w-full touch-none overflow-hidden rounded-2xl border border-border sm:h-[560px] [cursor:grab] active:[cursor:grabbing]"
        style={{ background: ESTILO_MAPA.mar }}
      >
        {parcelas.length > 0 ? (
          <div
            className="absolute inset-0"
            style={{
              transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
              transition: arrastrando ? "none" : "transform 0.2s ease-out",
            }}
          >
            <MapaTerritorios
              mapa={mapa}
              clanes={parcelas}
              miClanId={miClanId}
              elegidoId={seleccionado?.clan_id ?? null}
              ahora={ahora}
              textos={textos}
              onElegir={abrirClan}
            />
          </div>
        ) : (
          <p className="absolute inset-0 flex items-center justify-center text-sm" style={{ color: ESTILO_MAPA.textoSuave }}>
            {t("vacio")}
          </p>
        )}
      </div>

      {(seleccionado || cargandoDetalle) && (
        <PanelClan
          clan={seleccionado}
          miembros={miembrosClan}
          cargando={cargandoDetalle}
          onCerrar={() => setSeleccionado(null)}
        />
      )}
    </div>
  );
}

function PanelClan({
  clan,
  miembros,
  cargando,
  onCerrar,
}: {
  clan: ClanPublico | null;
  miembros: MiembroCasa[];
  cargando: boolean;
  onCerrar: () => void;
}) {
  const t = useTranslations("Clanes.mapa");
  return (
    <div className="rounded-2xl border border-border bg-surface p-4 shadow-sm">
      {cargando && !clan ? (
        <p className="text-sm text-texto-secundario">{t("cargando")}</p>
      ) : clan ? (
        <div className="flex flex-col gap-3">
          <EscenaCiudad
            nivelClan={clan.nivel_clan}
            colorEstandarte={clan.color_estandarte}
            miembros={miembros}
            className="h-40 w-full"
          />
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-2">
              <EstandarteClan color={clan.color_estandarte} nivel={clan.nivel_clan} imagenUrl={clan.imagen_url} size={36} />
              <div>
                <p className="font-display text-lg font-bold text-foreground">
                  {clan.nombre} {clan.tag && <span className="text-texto-secundario">[{clan.tag}]</span>}
                </p>
                <p className="mt-0.5 text-sm text-texto-secundario">{clan.descripcion}</p>
              </div>
            </div>
            <button
              onClick={onCerrar}
              aria-label={t("cerrarInfo")}
              className="shrink-0 text-sm text-texto-secundario hover:text-foreground"
            >
              ✕
            </button>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-texto-secundario">
            <span>{t("nivel", { nivel: clan.nivel_clan })}</span>
            <span>{t("miembrosCapacidad", { cantidad: clan.cantidad_miembros, capacidad: clan.capacidad })}</span>
            <span>{t("guerrasGanadas", { n: clan.guerras_ganadas })}</span>
          </div>
        </div>
      ) : null}
    </div>
  );
}
