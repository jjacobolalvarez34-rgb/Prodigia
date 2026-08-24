import { tierCiudadDeNivel } from "@/lib/clanes/tierCiudad";

export interface MiembroCasa {
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
}

interface Props {
  nivelClan: number;
  colorEstandarte: string;
  className?: string;
  // Fase 4 (bug "la ciudad del clan no carga ni las casas por
  // miembro"): esto no existía en absoluto antes — EscenaCiudad nunca
  // recibía la lista de miembros, así que no había NADA que dibujar acá
  // aparte del tier. Una casa (avatar del miembro sobre un techito) por
  // cada fila de miembros(), posicionada de forma determinística según
  // su user_id (mismo layout siempre para el mismo clan, sin depender
  // de random en cada render).
  miembros?: MiembroCasa[];
}

// Posición pseudo-aleatoria pero estable (0-1) a partir de un string —
// nada de Math.random(): dos renders del mismo clan tienen que ubicar
// las casas siempre en el mismo lugar.
function hashA0a1(input: string, sal: number): number {
  let h = sal;
  for (let i = 0; i < input.length; i++) {
    h = (Math.imul(h ^ input.charCodeAt(i), 2654435761) >>> 0);
  }
  return (h >>> 0) / 4294967295;
}

// Fase 7 ("Mundo de Clanes"): la ilustración de ciudad según el tier del
// clan (tierCiudadDeNivel) con 3 animaciones CSS por encima (definidas
// en globals.css) — niebla que deriva, un pulso neón tintado del
// estandarte del clan, y un puñado de luces que titilan en puntos fijos.
// Las 5 ilustraciones (public/clan_rangos/1..5.png) se usan tal cual,
// sin generar otras.
export default function EscenaCiudad({ nivelClan, colorEstandarte, className = "", miembros = [] }: Props) {
  const tier = tierCiudadDeNivel(nivelClan);

  return (
    <div className={`relative overflow-hidden rounded-2xl ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element -- pixel art, sin necesidad de optimización responsive de next/image */}
      <img src={tier.imagen} alt={`Ciudad del clan — ${tier.nombre}`} className="block h-full w-full object-cover" />

      {/* Pulso neón tintado del color del estandarte */}
      <div
        className="ciudad-neon pointer-events-none absolute inset-0"
        style={{ background: `radial-gradient(120% 90% at 50% 30%, ${colorEstandarte}55 0%, transparent 65%)` }}
      />

      {/* Niebla derivando en la mitad inferior */}
      <div
        className="ciudad-niebla pointer-events-none absolute inset-x-[-10%] bottom-0 h-[35%]"
        style={{ background: "linear-gradient(0deg, rgba(255,255,255,0.28) 0%, transparent 100%)" }}
      />

      {/* Luces titilando en puntos fijos */}
      {PUNTOS_LUZ.map((p, i) => (
        <span
          key={i}
          className="ciudad-luz pointer-events-none absolute h-1.5 w-1.5 rounded-full bg-white shadow-[0_0_6px_2px_rgba(255,255,255,0.8)]"
          style={{ left: `${p.x}%`, top: `${p.y}%`, animationDelay: `${p.delay}s` }}
        />
      ))}

      {/* Casas por miembro — un avatar (o inicial) por cada fila de
          miembros(), esparcido en la mitad inferior de la escena con
          posición estable por user_id. */}
      {miembros.map((m) => {
        const x = 12 + hashA0a1(m.user_id, 17) * 76;
        const y = 48 + hashA0a1(m.user_id, 173) * 42;
        return (
          <div
            key={m.user_id}
            title={m.display_name ?? undefined}
            className="pointer-events-none absolute flex h-6 w-6 -translate-x-1/2 -translate-y-1/2 items-center justify-center overflow-hidden rounded-full border-2 shadow-[0_1px_4px_rgba(0,0,0,0.4)]"
            style={{ left: `${x}%`, top: `${y}%`, borderColor: colorEstandarte }}
          >
            {m.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element -- avatar chico dentro de una escena pixel art, no hace falta next/image
              <img src={m.avatar_url} alt="" className="h-full w-full object-cover" />
            ) : (
              <span className="flex h-full w-full items-center justify-center bg-surface text-[10px] font-bold text-foreground">
                {(m.display_name ?? "?").charAt(0).toUpperCase()}
              </span>
            )}
          </div>
        );
      })}

      <div className="pointer-events-none absolute bottom-2 left-3 rounded-full bg-black/40 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-white backdrop-blur-sm">
        {tier.nombre}
      </div>
    </div>
  );
}

const PUNTOS_LUZ = [
  { x: 22, y: 38, delay: 0 },
  { x: 47, y: 28, delay: 0.4 },
  { x: 63, y: 45, delay: 0.9 },
  { x: 78, y: 33, delay: 1.3 },
  { x: 35, y: 55, delay: 1.7 },
  { x: 58, y: 60, delay: 0.6 },
];
