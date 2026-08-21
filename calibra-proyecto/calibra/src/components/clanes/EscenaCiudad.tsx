import { tierCiudadDeNivel } from "@/lib/clanes/tierCiudad";

interface Props {
  nivelClan: number;
  colorEstandarte: string;
  className?: string;
}

// Fase 7 ("Mundo de Clanes"): la ilustración de ciudad según el tier del
// clan (tierCiudadDeNivel) con 3 animaciones CSS por encima (definidas
// en globals.css) — niebla que deriva, un pulso neón tintado del
// estandarte del clan, y un puñado de luces que titilan en puntos fijos.
// Las 5 ilustraciones (public/clan_rangos/1..5.png) se usan tal cual,
// sin generar otras.
export default function EscenaCiudad({ nivelClan, colorEstandarte, className = "" }: Props) {
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
