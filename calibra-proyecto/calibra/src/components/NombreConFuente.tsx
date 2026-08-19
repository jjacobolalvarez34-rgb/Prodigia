import { FUENTE_NOMBRE_CLASS, type FuenteNombre } from "@/types/database";

interface Props {
  nombre: string | null;
  fuente?: FuenteNombre | null;
  className?: string;
}

// Fase 5 (mercado): un solo lugar que sabe traducir profiles.fuente_nombre
// a la clase Tailwind real — usado en perfil, ranking y feed para que la
// tipografía comprada se vea en todos lados sin duplicar el mapeo.
export default function NombreConFuente({ nombre, fuente, className = "" }: Props) {
  const claseFuente = FUENTE_NOMBRE_CLASS[fuente ?? "default"] ?? "";
  return <span className={`${claseFuente} ${className}`}>{nombre ?? "Jugador"}</span>;
}
