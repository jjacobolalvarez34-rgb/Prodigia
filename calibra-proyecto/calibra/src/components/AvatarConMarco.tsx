import Avatar from "@/components/Avatar";
import { MARCOS_MUNDO } from "@/types/database";

interface Props {
  url: string | null;
  nombre: string | null;
  marco: string;
  size?: number;
  className?: string;
}

// Grupo B, Fase 1: los 6 marcos de mundo son un anillo PNG con centro
// transparente (public/marcos/marco_<mundo>.png), pensado para
// superponerse sobre el avatar — a diferencia de los marcos de rango
// (bronce..prodigio), que siguen tiñendo el borde de la tarjeta entera
// vía ESTILO_MARCO_PERFIL y no pasan por acá. El anillo mide ~1.3x el
// avatar (banda hacia afuera, no hacia adentro) para no tapar la foto.
export default function AvatarConMarco({ url, nombre, marco, size = 64, className = "" }: Props) {
  const marcoMundo = MARCOS_MUNDO[marco];
  if (!marcoMundo) {
    return <Avatar url={url} nombre={nombre} size={size} className={className} />;
  }

  const tamanoAnillo = Math.round(size * 1.32);
  const offset = Math.round((tamanoAnillo - size) / 2);

  return (
    <div className={`relative shrink-0 ${className}`} style={{ width: tamanoAnillo, height: tamanoAnillo }}>
      <div className="absolute" style={{ top: offset, left: offset }}>
        <Avatar url={url} nombre={nombre} size={size} />
      </div>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={marcoMundo.imagen}
        alt=""
        width={tamanoAnillo}
        height={tamanoAnillo}
        style={{ width: tamanoAnillo, height: tamanoAnillo }}
        className="pointer-events-none absolute inset-0"
      />
    </div>
  );
}
