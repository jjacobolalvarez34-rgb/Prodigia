import ProgressDial from "@/components/ProgressDial";

const TIERS = [
  { name: "Iniciado", min: 1, max: 2 },
  { name: "Aprendiz", min: 3, max: 4 },
  { name: "Competente", min: 5, max: 6 },
  { name: "Avanzado", min: 7, max: 8 },
  { name: "Calculista", min: 9, max: 10 },
];

export function nombreDeTier(nivel: number): string {
  return TIERS.find((t) => nivel >= t.min && nivel <= t.max)?.name ?? "Iniciado";
}

interface Props {
  nivel: number; // 1-10
  size?: number;
  mostrarEtiqueta?: boolean;
  colorHex?: string; // cosmético de la tienda (Fase BB) — reemplaza el violeta por defecto
}

export default function LevelDial({ nivel, size = 72, mostrarEtiqueta = true, colorHex }: Props) {
  return (
    <ProgressDial value={nivel} max={10} size={size} colorDesde={colorHex}>
      <span className="font-mono font-bold text-foreground" style={{ fontSize: size * 0.32, lineHeight: 1 }}>
        {nivel}
      </span>
      {mostrarEtiqueta && (
        <span className="mt-0.5 font-mono text-foreground/50" style={{ fontSize: size * 0.115 }}>
          {nombreDeTier(nivel)}
        </span>
      )}
    </ProgressDial>
  );
}
