"use client";

import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { tierCiudadDeNivel } from "@/lib/clanes/tierCiudad";
import EscenaCiudad, { type MiembroCasa } from "./EscenaCiudad";
import EstandarteClan from "./EstandarteClan";

export interface ParcelaClan {
  clan_id: string;
  nombre: string;
  tag: string | null;
  color_estandarte: string;
  nivel_clan: number;
  cantidad_miembros: number;
  capacidad: number;
  imagen_url: string | null;
}

interface ClanPublico extends ParcelaClan {
  descripcion: string;
  guerras_ganadas: number;
}

const ZOOM_MIN = 0.6;
const ZOOM_MAX = 2;
const COLUMNAS = 6;
const ANCHO_PARCELA = 168;
const ALTO_PARCELA = 128;
const GAP = 20;
// Fase 8 (auditoría 2026-08-25 — "clickear una parcela no abre la
// ciudad"): causa real, mismo patrón que el bug viejo de GlareHover —
// onPointerDown arrancaba el arrastre y llamaba setPointerCapture()
// en CUALQUIER click, sin exigir movimiento real primero. Un click
// real en el mouse/dedo casi nunca tiene cero movimiento entre down y
// up (tiembla un par de píxeles) — eso ya alcanzaba para: (a)
// capturar el puntero en el contenedor de pan/zoom en vez de dejarlo
// en el <button> de la parcela, y (b) mover `offset` un pelo durante
// el gesto, lo que varios navegadores toman como "fue un drag, no un
// click" y cancelan el evento click sintético del botón. Con un piso
// de movimiento real antes de considerar que empezó un arrastre (y
// setPointerCapture recién ahí, no en el pointerdown), un click
// genuino nunca dispara nada de esto — llega intacto al botón.
const UMBRAL_ARRASTRE_PX = 6;

// Fase 7 ("Mundo de Clanes"): mapa pan/zoom sin librería externa (mismo
// criterio que el resto del proyecto — TextType.tsx se portó a mano en
// vez de sumar una dependencia) — arrastre con Pointer Events + escala
// vía rueda del mouse o los botones +/-. Una parcela por clan, en
// grilla, en orden de creación (mapa_clanes() ya la devuelve ordenada).
export default function MundoClanesMapa({ parcelas }: { parcelas: ParcelaClan[] }) {
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

  function onPointerDown(e: React.PointerEvent) {
    punteroAbajoRef.current = true;
    arrastreConfirmadoRef.current = false;
    puntoInicialRef.current = { x: e.clientX, y: e.clientY };
    ultimoPunto.current = { x: e.clientX, y: e.clientY };
    // Nada de setPointerCapture ni setArrastrando(true) todavía — recién
    // cuando se confirma un movimiento real (onPointerMove de abajo). Un
    // click sobre una parcela nunca debe pasar por acá.
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
    setZoom((z) => Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, z - e.deltaY * 0.001)));
  }

  async function abrirClan(clanId: string) {
    setCargandoDetalle(true);
    setMiembrosClan([]);
    try {
      const supabase = createClient();
      // Fase 4 (bug "la ciudad del clan no carga ni las casas por
      // miembro"): antes acá solo se pedía ver_clan_publico — la lista
      // de miembros nunca se cargaba, así que EscenaCiudad nunca tenía
      // nada que dibujar aparte del tier. miembros_de_clan() ya existe
      // (se usa hoy para MI propio clan en ClanesClient.tsx) y no tiene
      // ningún chequeo de "sos miembro de este clan" — ya es de lectura
      // pública para cualquier clan_id, solo nunca se había llamado
      // desde el mapa.
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

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-texto-secundario">Arrastrá para moverte por el mapa — rueda o los botones para acercar.</p>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setZoom((z) => Math.max(ZOOM_MIN, z - 0.2))}
            className="flex h-7 w-7 items-center justify-center rounded-full border border-border text-sm font-bold text-foreground hover:bg-surface-2"
          >
            −
          </button>
          <button
            onClick={() => setZoom((z) => Math.min(ZOOM_MAX, z + 0.2))}
            className="flex h-7 w-7 items-center justify-center rounded-full border border-border text-sm font-bold text-foreground hover:bg-surface-2"
          >
            +
          </button>
        </div>
      </div>

      <div
        ref={contenedorRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
        onWheel={onWheel}
        className="relative h-[420px] w-full touch-none overflow-hidden rounded-2xl border border-border bg-surface-2 [cursor:grab] active:[cursor:grabbing]"
      >
        <div
          className="absolute left-1/2 top-1/2"
          style={{
            transform: `translate(-50%, -50%) translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
            transition: arrastrando ? "none" : "transform 0.15s ease-out",
          }}
        >
          <div
            className="grid"
            style={{ gridTemplateColumns: `repeat(${COLUMNAS}, ${ANCHO_PARCELA}px)`, gap: `${GAP}px` }}
          >
            {parcelas.map((p) => (
              <ParcelaTile key={p.clan_id} parcela={p} onClick={() => abrirClan(p.clan_id)} />
            ))}
          </div>
        </div>

        {parcelas.length === 0 && (
          <p className="absolute inset-0 flex items-center justify-center text-sm text-texto-secundario">
            Todavía no hay clanes fundados.
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

function ParcelaTile({ parcela, onClick }: { parcela: ParcelaClan; onClick: () => void }) {
  const tier = tierCiudadDeNivel(parcela.nivel_clan);
  const llena = parcela.cantidad_miembros >= parcela.capacidad;
  return (
    <button
      onClick={onClick}
      style={{ width: ANCHO_PARCELA, height: ALTO_PARCELA, borderColor: parcela.color_estandarte }}
      className="group relative flex flex-col overflow-hidden rounded-xl border-2 bg-surface text-left shadow-sm transition-transform hover:z-10 hover:scale-[1.04]"
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- miniatura estática, sin animaciones por perf con muchas parcelas */}
      <img src={tier.imagen} alt="" className="h-16 w-full object-cover" draggable={false} />
      <div className="flex flex-1 flex-col justify-center gap-0.5 px-2 py-1">
        <p className="truncate text-xs font-bold text-foreground">
          {parcela.nombre} {parcela.tag && <span className="text-texto-secundario">[{parcela.tag}]</span>}
        </p>
        <p className="text-[10px] text-texto-secundario">
          Nv. {parcela.nivel_clan} · {parcela.cantidad_miembros}/{parcela.capacidad}
          {llena && " · Lleno"}
        </p>
      </div>
    </button>
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
  return (
    <div className="rounded-2xl border border-border bg-surface p-4 shadow-sm">
      {cargando && !clan ? (
        <p className="text-sm text-texto-secundario">Cargando…</p>
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
            <button onClick={onCerrar} className="shrink-0 text-sm text-texto-secundario hover:text-foreground">
              ✕
            </button>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-texto-secundario">
            <span>Nivel {clan.nivel_clan}</span>
            <span>
              {clan.cantidad_miembros}/{clan.capacidad} miembros
            </span>
            <span>{clan.guerras_ganadas} guerras ganadas</span>
          </div>
        </div>
      ) : null}
    </div>
  );
}
