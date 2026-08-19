import { IconLlama } from "@/components/icons";

interface Props {
  total: number;
  miRespondidos: number;
  rivalRespondidos: number;
  rivalRacha: number;
  rivalNombre: string;
  colorHex?: string;
}

// Fase 6: la pieza que más impacto tiene en la sensación de "carrera
// real" de un duelo — el progreso del rival, en vivo, mientras jugás
// (no al final). Deliberadamente chico y silencioso: nunca tapa ni
// compite con la tarjeta del problema propio, solo está presente, como
// un marcador de fondo.
export default function ProgresoRivalEnVivo({
  total,
  miRespondidos,
  rivalRespondidos,
  rivalRacha,
  rivalNombre,
  colorHex,
}: Props) {
  const color = colorHex ?? "var(--primario)";
  return (
    <div className="flex items-center justify-between text-xs text-texto-secundario">
      <div className="flex items-center gap-1.5">
        <span className="relative flex h-2 w-2">
          <span
            className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-60"
            style={{ background: color }}
          />
          <span className="relative inline-flex h-2 w-2 rounded-full" style={{ background: color }} />
        </span>
        <div className="flex gap-1">
          {Array.from({ length: total }).map((_, i) => (
            <span
              key={i}
              className={`h-1.5 w-1.5 rounded-full transition-colors ${i < rivalRespondidos ? "" : "bg-foreground/10"}`}
              style={i < rivalRespondidos ? { background: color } : undefined}
            />
          ))}
        </div>
        {rivalRacha >= 2 && (
          <span className="flex items-center gap-0.5 text-racha">
            <IconLlama className="h-3 w-3" />
            {rivalRacha}
          </span>
        )}
      </div>
      <span>
        {miRespondidos > rivalRespondidos
          ? `Vas adelante de ${rivalNombre}`
          : miRespondidos < rivalRespondidos
            ? `${rivalNombre} te lleva ventaja`
            : `Van parejo con ${rivalNombre}`}
      </span>
    </div>
  );
}
