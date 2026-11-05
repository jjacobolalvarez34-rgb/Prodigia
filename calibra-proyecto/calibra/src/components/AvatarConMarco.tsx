import Avatar from "@/components/Avatar";
import { ciudadDeMarcoColeccion } from "@/lib/recompensas/catalogo";
import { MARCOS_MUNDO } from "@/types/database";
import { ESCALA_MARCO_ANIMADO, marcoAnimadoDe, rutaMarcoAnimado, TAM_MIN_ANIMADO } from "@/lib/recompensas/marcosAnimados";

interface Props {
  url: string | null;
  nombre: string | null;
  marco: string;
  size?: number;
  className?: string;
}

// Grupo B, Fase 1: los marcos de mundo son un anillo con centro transparente
// (public/marcos/marco_<mundo>.svg, generado por lib/recompensas/marcosMundo.ts), pensado para
// superponerse sobre el avatar — a diferencia de los marcos de rango
// (bronce..prodigio), que siguen tiñendo el borde de la tarjeta entera
// vía ESTILO_MARCO_PERFIL y no pasan por acá. El anillo mide ~1.3x el
// avatar (banda hacia afuera, no hacia adentro) para no tapar la foto.
export default function AvatarConMarco({ url, nombre, marco, size = 64, className = "" }: Props) {
  // Marco animado (0313): la imagen mide 1,6 veces el avatar y lo rodea sin mover el
  // diseño (sobresale). Quieta en tamaños chicos o con «reducir movimiento».
  const animado = marcoAnimadoDe(marco);
  if (animado) {
    const lado = Math.round(size * ESCALA_MARCO_ANIMADO);
    const desplazar = Math.round((lado - size) / 2);
    const quieta = rutaMarcoAnimado(animado, false);
    return (
      <div className={`relative shrink-0 ${className}`} style={{ width: size, height: size }}>
        <Avatar url={url} nombre={nombre} size={size} />
        <picture>
          {size >= TAM_MIN_ANIMADO && <source media="(prefers-reduced-motion: no-preference)" srcSet={rutaMarcoAnimado(animado, true)} type="image/webp" />}
          { }
          <img src={quieta} alt="" width={lado} height={lado} className="pointer-events-none absolute max-w-none" style={{ width: lado, height: lado, left: -desplazar, top: -desplazar }} />
        </picture>
      </div>
    );
  }
  // Marco de colección (0248): el anillo del mundo con un brillo que gira.
  const coleccion = ciudadDeMarcoColeccion(marco);
  const marcoMundo = MARCOS_MUNDO[coleccion ? coleccion.slug : marco];
  if (!marcoMundo) {
    return <Avatar url={url} nombre={nombre} size={size} className={className} />;
  }

  const tamanoAnillo = Math.round(size * 1.32);
  const offset = Math.round((tamanoAnillo - size) / 2);

  return (
    <div className={`relative shrink-0 ${className}`} style={{ width: tamanoAnillo, height: tamanoAnillo }}>
      {coleccion && (
        <div
          aria-hidden="true"
          className="marco-coleccion-brillo pointer-events-none absolute inset-0 rounded-full"
          style={{ "--mc-color": coleccion.color } as React.CSSProperties}
        />
      )}
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
