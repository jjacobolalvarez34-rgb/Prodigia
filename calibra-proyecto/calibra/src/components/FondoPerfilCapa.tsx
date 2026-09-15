import { FONDO_PERFIL_ESTILO, type FondoPerfil } from "@/types/database";

interface Props {
  fondoPerfil: FondoPerfil;
  fondoPerfilUrl: string | null;
}

// Detecta si hay algo que pintar de fondo — usado por las páginas de
// perfil (propio y público) para decidir si el texto va en blanco
// (sobre el fondo) o en los colores normales de la UI (tarjeta lisa).
export function tieneFondoPerfil(fondoPerfil: FondoPerfil, fondoPerfilUrl: string | null): boolean {
  if (fondoPerfil === "ninguno") return false;
  if (fondoPerfil === "personalizado") return fondoPerfilUrl !== null;
  return true;
}

// Rediseño pedido en vivo (2026-09-15): "el baner fuese de todo el
// recuadro de la foto que adjunte, no de solo un encabezado — que sea
// como un fondo", inspirado en los banners de perfil de Discord. Antes
// era una franja h-20 arriba de la tarjeta; ahora es una capa que cubre
// TODA la tarjeta (position: absolute inset-0, el contenido de la
// tarjeta va encima con position: relative) más un velo oscuro en
// degradé (más fuerte abajo, donde vive la mayoría del texto) para que
// cualquiera de los 8 fondos (o una imagen propia) siga siendo legible
// con texto blanco encima, sin tener que afinar el contraste fondo por
// fondo a mano.
export default function FondoPerfilCapa({ fondoPerfil, fondoPerfilUrl }: Props) {
  if (!tieneFondoPerfil(fondoPerfil, fondoPerfilUrl)) return null;

  return (
    <>
      {fondoPerfil === "personalizado" ? (
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${fondoPerfilUrl})` }} />
      ) : (
        <div className="fondo-perfil-banner absolute inset-0" style={{ backgroundImage: FONDO_PERFIL_ESTILO[fondoPerfil] }} />
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/45 to-black/75" />
    </>
  );
}
