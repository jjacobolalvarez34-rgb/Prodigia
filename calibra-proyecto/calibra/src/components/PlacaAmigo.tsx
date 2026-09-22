"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ESTILO_MARCO_PERFIL } from "@/types/database";
import type { Amigo } from "@/app/[locale]/social/useAmigos";
import AvatarConMarco from "@/components/AvatarConMarco";
import NombreConFuente from "@/components/NombreConFuente";
import RangoBadge from "@/components/RangoBadge";
import FondoPerfilCapa, { tieneFondoPerfil } from "@/components/FondoPerfilCapa";
import ReportarBoton from "@/app/[locale]/perfil/[userId]/ReportarBoton";

interface Props {
  amigo: Amigo;
  // La lista de mundo (retandoA en AmigosClient/FeedSidebar) sigue
  // afuera, tal como ya funcionaba: PlacaAmigo solo avisa "elegí retar
  // a este amigo" — quien lo llama decide si mostrar SelectorMundoDuelo
  // debajo de la placa (mismo patrón de siempre, ahora disparado desde
  // el menú en vez de un botón suelto).
  onRetar: () => void;
  onQuitar: () => void;
  // FeedSidebar (barra angosta, sticky) necesita una versión más chica
  // que la pestaña "Amigos" completa — mismo componente, avatar/tipografía
  // más chicos, para no reventar el ancho fijo de la barra.
  compacto?: boolean;
}

// Rediseño pedido en vivo (2026-09-22): "no un recuadro con el nombre y
// un 'retar a duelo', sino más como la 'placa' de su perfil" — mismo
// lenguaje visual que /perfil/[userId] (FondoPerfilCapa + AvatarConMarco
// + NombreConFuente + RangoBadge), en formato compacto de una fila, para
// que la personalización de perfil de cada amigo (fondo, marco, fuente,
// animación, color, título activo) se note también acá.
//
// Click abre un menú (role="menu", Escape/click afuera cierran) con las
// 5 acciones pedidas: retar a duelo (ya existía, ahora vive en el
// menú), ver perfil, mandar mensaje, reportar y quitar de amigos (las
// 3 últimas no existían juntas en ningún lado antes de esta tanda).
//
// "Mandar mensaje" linkea a /social/mensajes/[amigoId] — esa página la
// construye OTRO agente en paralelo; no hace falta que exista todavía
// para que esto compile (next-intl/routing acá no usa `pathnames`
// tipados — ver src/i18n/routing.ts — así que un string con un friend_id
// dinámico no choca con ninguna validación de rutas en build).
//
// "Reportar": en vez de linkear a /perfil/[userId] (donde también vive
// ReportarBoton) se reusa el componente EMBEBIDO tal cual, como pidió
// el brief — es autocontenido (maneja su propio abrir/cerrar y el
// picker de motivo) y evita mandar a la gente a otra pantalla solo para
// reportar. No lleva role="menuitem" (es un sub-widget con sus propios
// controles, no una acción de un solo click) — el resto de la lista sí.
export default function PlacaAmigo({ amigo, onRetar, onQuitar, compacto = false }: Props) {
  const t = useTranslations("Social");
  const [abierto, setAbierto] = useState(false);
  const contenedorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!abierto) return;
    function alClickAfuera(e: MouseEvent) {
      if (contenedorRef.current && !contenedorRef.current.contains(e.target as Node)) {
        setAbierto(false);
      }
    }
    function alTecla(e: KeyboardEvent) {
      if (e.key === "Escape") setAbierto(false);
    }
    document.addEventListener("mousedown", alClickAfuera);
    document.addEventListener("keydown", alTecla);
    return () => {
      document.removeEventListener("mousedown", alClickAfuera);
      document.removeEventListener("keydown", alTecla);
    };
  }, [abierto]);

  const claro = tieneFondoPerfil(amigo.fondo_perfil, amigo.fondo_perfil_url);
  const claseTexto = claro ? "text-white" : "text-foreground";
  const claseTextoSec = claro ? "text-white/75" : "text-texto-secundario";
  const marcoEstilo = ESTILO_MARCO_PERFIL[amigo.marco_perfil] ?? ESTILO_MARCO_PERFIL.ninguno;
  const nombreVisible = amigo.display_name ?? t("jugador");
  const avatarSize = compacto ? 34 : 52;

  function elegirRetar() {
    setAbierto(false);
    onRetar();
  }

  function elegirQuitar() {
    setAbierto(false);
    if (window.confirm(t("placaAmigo.confirmarQuitar", { nombre: nombreVisible }))) {
      onQuitar();
    }
  }

  const itemClase =
    "rounded-lg px-3 py-2 text-left text-sm font-medium text-foreground transition-colors hover:bg-primario/10 hover:text-primario";

  return (
    <div ref={contenedorRef} className="relative">
      <button
        type="button"
        onClick={() => setAbierto((a) => !a)}
        aria-haspopup="menu"
        aria-expanded={abierto}
        className={`relative flex w-full items-center overflow-hidden rounded-xl border-2 text-left shadow-sm transition-transform hover:-translate-y-0.5 ${claro ? "" : "bg-surface"} ${marcoEstilo} ${compacto ? "gap-2 px-2.5 py-2" : "gap-3 px-4 py-3"}`}
      >
        <FondoPerfilCapa fondoPerfil={amigo.fondo_perfil} fondoPerfilUrl={amigo.fondo_perfil_url} />
        <div className="relative flex min-w-0 flex-1 items-center gap-2.5">
          <AvatarConMarco url={amigo.avatar_url} nombre={amigo.display_name} marco={amigo.marco_perfil} size={avatarSize} />
          <div className="min-w-0 flex-1">
            <p className={`truncate font-display font-bold ${compacto ? "text-xs" : "text-base"} ${claseTexto}`}>
              <NombreConFuente
                nombre={amigo.display_name}
                fuente={amigo.fuente_nombre}
                animacion={amigo.animacion_nombre}
                color={amigo.color_nombre}
              />
            </p>
            <RangoBadge
              elo={amigo.elo_rating}
              tituloNombre={amigo.titulo_nombre}
              size={compacto ? "sm" : "md"}
              className={claseTextoSec}
            />
          </div>
        </div>
      </button>

      {abierto && (
        <div
          role="menu"
          aria-label={nombreVisible}
          className="absolute right-0 top-full z-20 mt-1 flex w-60 flex-col gap-0.5 rounded-xl border border-border bg-surface p-1.5 shadow-lg"
        >
          <button role="menuitem" type="button" onClick={elegirRetar} className={itemClase}>
            {t("retarADuelo")}
          </button>
          <Link role="menuitem" href={`/perfil/${amigo.friend_id}`} onClick={() => setAbierto(false)} className={itemClase}>
            {t("placaAmigo.verPerfil")}
          </Link>
          <Link
            role="menuitem"
            href={`/social/mensajes/${amigo.friend_id}`}
            onClick={() => setAbierto(false)}
            className={itemClase}
          >
            {t("placaAmigo.mandarMensaje")}
          </Link>
          <div className="border-t border-border/60 pt-1">
            <ReportarBoton userId={amigo.friend_id} />
          </div>
          <button
            role="menuitem"
            type="button"
            onClick={elegirQuitar}
            className="rounded-lg px-3 py-2 text-left text-sm font-medium text-error transition-colors hover:bg-error/10"
          >
            {t("placaAmigo.quitarAmigo")}
          </button>
        </div>
      )}
    </div>
  );
}
