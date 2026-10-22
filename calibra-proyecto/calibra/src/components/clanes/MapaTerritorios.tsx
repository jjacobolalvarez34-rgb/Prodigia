import { memo, useMemo } from "react";
import {
  ESTILO_MAPA,
  PATH_BANDERIN,
  coloresTerritorio,
  esTerritorioNuevo,
  etiquetaTerritorio,
  type ClanParaTerritorio,
  type MapaTerritorios as Mapa,
} from "@/lib/clanes/territorios";

export interface ClanEnMapa extends ClanParaTerritorio {
  nombre: string;
  tag: string | null;
  color_estandarte: string;
  nivel_clan: number;
  cantidad_miembros: number;
}

export interface TextosMapa {
  tuClan: string;
  nuevo: string;
  detalle: (clan: ClanEnMapa) => string;
  territorioDe: (clan: ClanEnMapa) => string;
}

// Mundo de clanes: cada clan es un territorio de forma irregular (ver
// lib/clanes/territorios.ts). El SVG ocupa todo su contenedor y se ajusta a la caja
// del mapa; el arrastre y el zoom los maneja quien lo contiene. La app dibuja lo
// mismo con react-native-svg en mobile/src/app/clan/mundo.tsx.
function MapaTerritorios({
  mapa,
  clanes,
  miClanId,
  elegidoId,
  ahora,
  textos,
  onElegir,
}: {
  /** Resultado de calcularTerritorios(clanes). */
  mapa: Mapa;
  clanes: ClanEnMapa[];
  miClanId: string | null;
  elegidoId: string | null;
  /** Momento de referencia para marcar territorios nuevos (fijo, para no romper la hidratación). */
  ahora: number;
  textos: TextosMapa;
  onElegir?: (clanId: string) => void;
}) {
  const porId = useMemo(() => new Map(clanes.map((c) => [c.clan_id, c])), [clanes]);
  const { minX, minY, ancho, alto } = mapa.caja;
  // El mar se extiende más allá de la caja para que al alejar no se vea el borde.
  const mar = { x: minX - ancho, y: minY - alto, w: ancho * 3, h: alto * 3 };

  return (
    <svg
      viewBox={`${minX} ${minY} ${ancho} ${alto}`}
      preserveAspectRatio="xMidYMid meet"
      className="h-full w-full select-none"
      style={{ overflow: "visible" }}
    >
      <defs>
        <radialGradient id="tc-mar" cx="50%" cy="45%" r="60%">
          <stop offset="0%" stopColor={ESTILO_MAPA.marClaro} />
          <stop offset="100%" stopColor={ESTILO_MAPA.mar} />
        </radialGradient>
        <pattern id="tc-olas" width="46" height="26" patternUnits="userSpaceOnUse">
          <path d="M2 8q5-4 10 0t10 0M25 20q5-4 10 0t10 0" fill="none" stroke={ESTILO_MAPA.olas} strokeOpacity={0.09} strokeWidth={1.1} strokeLinecap="round" />
        </pattern>
        <pattern id="tc-textura" width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(28)">
          <circle cx="2" cy="2" r="0.8" fill="#FFFFFF" fillOpacity={0.09} />
          <path d="M5 6.5h3" stroke="#000000" strokeOpacity={0.12} strokeWidth={0.8} strokeLinecap="round" />
        </pattern>
        <radialGradient id="tc-relieve" cx="42%" cy="36%" r="70%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity={0.24} />
          <stop offset="55%" stopColor="#FFFFFF" stopOpacity={0} />
          <stop offset="100%" stopColor="#000000" stopOpacity={0.34} />
        </radialGradient>
      </defs>
      <style>{`
        .tc-territorio { transform-box: fill-box; transform-origin: center; animation: tc-aparece 620ms cubic-bezier(.2,.8,.2,1) both; }
        .tc-territorio:focus { outline: none; }
        .tc-territorio:focus-visible .tc-luz, .tc-territorio:hover .tc-luz { opacity: 0.14; }
        .tc-pulso { animation: tc-pulso 2.4s ease-in-out infinite; }
        @keyframes tc-aparece { from { opacity: 0; transform: scale(0.82); } to { opacity: 1; transform: scale(1); } }
        @keyframes tc-pulso { 0%, 100% { stroke-opacity: 0.18; } 50% { stroke-opacity: 0.42; } }
        @media (prefers-reduced-motion: reduce) { .tc-territorio, .tc-pulso { animation: none; } }
      `}</style>

      <rect x={mar.x} y={mar.y} width={mar.w} height={mar.h} fill="url(#tc-mar)" />
      <rect x={mar.x} y={mar.y} width={mar.w} height={mar.h} fill="url(#tc-olas)" />

      {/* Bajíos: un halo claro alrededor de la costa. */}
      <g fill="none" stroke={ESTILO_MAPA.bajio} strokeLinejoin="round">
        {mapa.territorios.map((t) => (
          <path key={t.clan_id} d={t.d} strokeWidth={22} strokeOpacity={0.07} />
        ))}
        {mapa.territorios.map((t) => (
          <path key={t.clan_id} d={t.d} strokeWidth={9} strokeOpacity={0.12} />
        ))}
      </g>
      {/* Sombra: el relieve se levanta del mar. */}
      <g fill="#000000" fillOpacity={0.42} transform="translate(0 5)">
        {mapa.territorios.map((t) => (
          <path key={t.clan_id} d={t.d} />
        ))}
      </g>

      {mapa.territorios.map((t) => {
        const clan = porId.get(t.clan_id);
        if (!clan || !t.d) return null;
        const col = coloresTerritorio(clan.color_estandarte);
        const mio = clan.clan_id === miClanId;
        const nuevo = esTerritorioNuevo(clan.creado_at, ahora);
        return (
          <g
            key={t.clan_id}
            className="tc-territorio cursor-pointer"
            style={{ animationDelay: `${Math.min(t.orden, 40) * 22}ms` }}
            role="button"
            tabIndex={0}
            aria-label={textos.territorioDe(clan)}
            onClick={() => onElegir?.(clan.clan_id)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onElegir?.(clan.clan_id);
              }
            }}
          >
            <path d={t.d} fill={col.suelo} />
            <path d={t.d} fill="url(#tc-textura)" />
            <path d={t.d} fill="url(#tc-relieve)" />
            <path className="tc-luz" d={t.d} fill="#FFFFFF" opacity={0} style={{ transition: "opacity 160ms" }} />
            <path d={t.d} fill="none" stroke={col.borde} strokeWidth={1.8} strokeLinejoin="round" />
            <path d={t.d} fill="none" stroke={col.luz} strokeOpacity={0.22} strokeWidth={0.7} strokeLinejoin="round" />
            {nuevo && !mio && (
              <path d={t.d} fill="none" stroke={col.luz} strokeWidth={1.4} strokeDasharray="5 4" strokeOpacity={0.8} />
            )}
          </g>
        );
      })}

      {/* Bordes destacados por encima de todos los territorios (tu clan y el elegido). */}
      {mapa.territorios.map((t) => {
        const mio = t.clan_id === miClanId;
        const elegido = t.clan_id === elegidoId;
        if (!mio && !elegido) return null;
        const c = elegido ? ESTILO_MAPA.elegido : ESTILO_MAPA.miClan;
        return (
          <g key={t.clan_id} fill="none" strokeLinejoin="round" pointerEvents="none">
            <path className={mio ? "tc-pulso" : undefined} d={t.d} stroke={c} strokeWidth={9} strokeOpacity={0.3} />
            <path d={t.d} stroke={c} strokeWidth={2.6} />
          </g>
        );
      })}

      {/* Etiquetas: siempre arriba para que se lean. */}
      <g pointerEvents="none" fontFamily="inherit" textAnchor="middle">
        {mapa.territorios.map((t) => {
          const clan = porId.get(t.clan_id);
          if (!clan) return null;
          const col = coloresTerritorio(clan.color_estandarte);
          const mio = clan.clan_id === miClanId;
          const nuevo = esTerritorioNuevo(clan.creado_at, ahora);
          const et = etiquetaTerritorio(clan.nombre, clan.tag, t.radioInterior);
          const { x, y } = t.centro;
          const alto = et.tam * 1.25;
          const anchoB = (alto * 22) / 34;
          const yNombre = et.conDetalle ? y + et.tam * 0.55 : y + et.tam * 0.35;
          const sobre = mio ? textos.tuClan : nuevo ? textos.nuevo : null;
          return (
            <g key={t.clan_id}>
              {et.conDetalle && (
                <g transform={`translate(${x - anchoB / 2} ${y - et.tam * 1.15}) scale(${anchoB / 22} ${alto / 34})`}>
                  <path d={PATH_BANDERIN} fill={col.color} stroke={ESTILO_MAPA.contornoTexto} strokeWidth={2.4} strokeLinejoin="round" />
                  <path d="M0 0H22V9H0Z" fill="#FFFFFF" opacity={0.2} />
                </g>
              )}
              {sobre && et.conDetalle && (
                <text
                  x={x}
                  y={y - et.tam * 1.45}
                  fontSize={et.tam * 0.55}
                  fontWeight={800}
                  letterSpacing={et.tam * 0.06}
                  fill={mio ? ESTILO_MAPA.miClan : col.luz}
                  stroke={ESTILO_MAPA.contornoTexto}
                  strokeWidth={et.tam * 0.2}
                  strokeLinejoin="round"
                  paintOrder="stroke"
                >
                  {sobre.toUpperCase()}
                </text>
              )}
              <text
                x={x}
                y={yNombre}
                fontSize={et.tam}
                fontWeight={800}
                fill={ESTILO_MAPA.texto}
                stroke={ESTILO_MAPA.contornoTexto}
                strokeWidth={et.tam * 0.26}
                strokeOpacity={0.85}
                strokeLinejoin="round"
                paintOrder="stroke"
              >
                {et.texto}
              </text>
              {et.conDetalle && (
                <text
                  x={x}
                  y={yNombre + et.tam * 0.95}
                  fontSize={et.tam * 0.6}
                  fontWeight={600}
                  fill={ESTILO_MAPA.textoSuave}
                  stroke={ESTILO_MAPA.contornoTexto}
                  strokeWidth={et.tam * 0.2}
                  strokeOpacity={0.8}
                  strokeLinejoin="round"
                  paintOrder="stroke"
                >
                  {textos.detalle(clan)}
                </text>
              )}
            </g>
          );
        })}
      </g>
    </svg>
  );
}

export default memo(MapaTerritorios);
