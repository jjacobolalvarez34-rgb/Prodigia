import { useTranslations } from "next-intl";
import ProgressDial from "@/components/ProgressDial";

const TIERS = [
  { key: "iniciado", min: 1, max: 2 },
  { key: "aprendiz", min: 3, max: 4 },
  { key: "competente", min: 5, max: 6 },
  { key: "avanzado", min: 7, max: 8 },
  { key: "calculista", min: 9, max: 10 },
] as const;

interface Props {
  nivel: number; // 1-10
  size?: number;
  mostrarEtiqueta?: boolean;
  colorHex?: string; // cosmético de la tienda (Fase BB) — reemplaza el violeta por defecto
}

export default function LevelDial({ nivel, size = 72, mostrarEtiqueta = true, colorHex }: Props) {
  const t = useTranslations("Practica.tiers");
  const clave = TIERS.find((tier) => nivel >= tier.min && nivel <= tier.max)?.key ?? "iniciado";

  return (
    <ProgressDial value={nivel} max={10} size={size} colorDesde={colorHex}>
      <span className="font-mono font-bold text-foreground" style={{ fontSize: size * 0.32, lineHeight: 1 }}>
        {nivel}
      </span>
      {mostrarEtiqueta && (
        <span className="mt-0.5 font-mono text-foreground/50" style={{ fontSize: size * 0.115 }}>
          {t(clave)}
        </span>
      )}
    </ProgressDial>
  );
}
