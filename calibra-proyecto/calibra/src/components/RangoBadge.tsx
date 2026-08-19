import { rangoDeElo } from "@/types/database";
import { IconRango } from "@/components/icons";

interface Props {
  elo: number;
  size?: "sm" | "md" | "lg";
  mostrarElo?: boolean;
  // Fase 2 (títulos), pulido: el título que el usuario eligió mostrar
  // (profiles.titulo_activo, resuelto server-side por
  // titulo_nombre_de() — nunca se busca de nuevo acá, siempre viene ya
  // resuelto en la misma fila/RPC que trae el ELO). null/undefined =
  // no tiene título activo, no se muestra nada extra.
  tituloNombre?: string | null;
  className?: string;
}

const TAMANOS = {
  sm: { icon: "h-3.5 w-3.5", texto: "text-xs" },
  md: { icon: "h-[18px] w-[18px]", texto: "text-sm" },
  lg: { icon: "h-6.5 w-6.5", texto: "text-lg" },
} as const;

// Fase 1 de Rankeds: ícono + color + nombre del rango, en un solo
// componente reusado en Rankeds ("Mi competitivo"), el perfil (propio y
// de otros) y la pantalla de resultado de duelo — nunca el texto plano
// de tierDeElo() que había antes. Prodigio (el rango tope) lleva
// tratamiento especial: el NOMBRE va en degradé violeta→ámbar (mismo
// truco que un ícono con degradé sería mucho más código para el mismo
// resultado visual, y acá el texto es lo más visible de la insignia).
export default function RangoBadge({ elo, size = "md", mostrarElo = false, tituloNombre, className = "" }: Props) {
  const rango = rangoDeElo(elo);
  const t = TAMANOS[size];

  const estiloNombre: React.CSSProperties = rango.degradado
    ? {
        backgroundImage: `linear-gradient(120deg, ${rango.degradado[0]}, ${rango.degradado[1]})`,
        WebkitBackgroundClip: "text",
        backgroundClip: "text",
        color: "transparent",
      }
    : { color: rango.colorHex };

  return (
    <span className={`inline-flex items-center gap-1.5 font-display font-bold ${t.texto} ${className}`}>
      <span className="shrink-0" style={{ color: rango.colorHex }}>
        <IconRango className={t.icon} />
      </span>
      <span style={estiloNombre}>{rango.nombre}</span>
      {tituloNombre && (
        <span className="rounded-full bg-foreground/[0.06] px-2 py-0.5 text-[0.7em] font-medium text-texto-secundario">
          {tituloNombre}
        </span>
      )}
      {mostrarElo && <span className="font-mono font-normal text-texto-secundario">· {elo} ELO</span>}
    </span>
  );
}
