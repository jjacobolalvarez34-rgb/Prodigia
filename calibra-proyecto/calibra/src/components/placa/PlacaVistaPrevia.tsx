"use client";

import { useTranslations } from "next-intl";
import { ESTILO_MARCO_PERFIL, type AnimacionNombre, type FondoPerfil, type FuenteNombre } from "@/types/database";
import AvatarConMarco from "@/components/AvatarConMarco";
import NombreConFuente from "@/components/NombreConFuente";
import RangoBadge from "@/components/RangoBadge";
import FondoPerfilCapa, { tieneFondoPerfil } from "@/components/FondoPerfilCapa";
import CiudadSkyline from "@/components/recompensas/CiudadSkyline";
import PuntosConFuente from "@/components/recompensas/PuntosConFuente";

// La Placa tal como se ve en la web, para el editor (2026-10-30): las mismas piezas
// que la tarjeta de /perfil (fondo, ciudad, avatar con marco, nombre, título, rango)
// y que PlacaAmigo (tarjeta y fila de la lista de amigos), pero solo para mirar: sin
// menú ni enlaces, así refleja al instante lo que se va eligiendo.
export interface DatosPlacaVista {
  nombre: string | null;
  avatarUrl: string | null;
  marco: string;
  fuente: string;
  animacion: string;
  colorNombre: string | null;
  fondo: string;
  fondoUrl: string | null;
  tituloNombre: string | null;
  ciudad: string | null;
  elo: number;
  nivel: number;
  chispas: number;
  fuentePuntos: string;
}

export default function PlacaVistaPrevia({ datos, variante = "perfil" }: { datos: DatosPlacaVista; variante?: "perfil" | "tarjeta" | "fila" }) {
  const t = useTranslations("Social.placaAmigo");
  const fondo = datos.fondo as FondoPerfil;
  // Fondo propio sin imagen todavía: tarjeta lisa (igual que /perfil).
  const claro = tieneFondoPerfil(fondo, datos.fondoUrl);
  const claseTexto = claro ? "text-white" : "text-foreground";
  const claseTextoSec = claro ? "text-white/75" : "text-texto-secundario";
  const marcoEstilo = ESTILO_MARCO_PERFIL[datos.marco] ?? ESTILO_MARCO_PERFIL.ninguno;
  const nombre = (
    <NombreConFuente
      nombre={datos.nombre}
      fuente={datos.fuente as FuenteNombre}
      animacion={datos.animacion as AnimacionNombre}
      color={datos.colorNombre}
      permitirEfectosPesados={variante === "perfil"}
    />
  );
  const chip = `flex items-center justify-center rounded-lg border px-1.5 py-1 text-center font-mono text-[11px] font-semibold leading-tight ${claseTexto} ${claro ? "border-white/25 bg-white/10" : "border-border bg-background"}`;

  if (variante === "fila") {
    return (
      <div className={`relative flex w-full items-center gap-3 overflow-hidden rounded-xl border-2 px-4 py-3 shadow-sm ${claro ? "" : "bg-surface"} ${marcoEstilo}`}>
        <FondoPerfilCapa fondoPerfil={fondo} fondoPerfilUrl={datos.fondoUrl} />
        <div className="relative flex min-w-0 flex-1 items-center gap-2.5">
          <AvatarConMarco url={datos.avatarUrl} nombre={datos.nombre} marco={datos.marco} size={44} />
          <div className="min-w-0 flex-1">
            <p className={`truncate font-display text-base font-bold ${claseTexto}`}>{nombre}</p>
            <RangoBadge elo={datos.elo} tituloNombre={datos.tituloNombre ?? undefined} size="sm" className={claseTextoSec} />
          </div>
        </div>
      </div>
    );
  }

  if (variante === "tarjeta") {
    return (
      <div className={`relative flex aspect-[4/5] w-full flex-col items-center justify-center gap-2 overflow-hidden rounded-2xl border-2 px-3 py-4 text-center shadow-sm ${claro ? "" : "bg-surface"} ${marcoEstilo}`}>
        <FondoPerfilCapa fondoPerfil={fondo} fondoPerfilUrl={datos.fondoUrl} />
        <div className="relative flex w-full min-w-0 flex-col items-center gap-2">
          <AvatarConMarco url={datos.avatarUrl} nombre={datos.nombre} marco={datos.marco} size={60} />
          <p className={`w-full truncate font-display text-base font-bold ${claseTexto}`}>{nombre}</p>
          <div className="flex max-w-full flex-wrap justify-center">
            <RangoBadge elo={datos.elo} tituloNombre={datos.tituloNombre ?? undefined} size="sm" className={claseTextoSec} />
          </div>
          <div className="mt-1 grid w-full grid-cols-2 gap-1.5">
            <span className={chip}>{t("nivel", { n: datos.nivel })}</span>
            <span className={chip}>{t("chispas", { n: datos.chispas })}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden rounded-2xl border-2 shadow-sm transition-colors ${claro ? "" : "bg-surface"} ${marcoEstilo}`}>
      <FondoPerfilCapa fondoPerfil={fondo} fondoPerfilUrl={datos.fondoUrl} />
      {datos.ciudad && (
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center opacity-80">
          <CiudadSkyline ciudad={datos.ciudad} alto={96} ancho={640} />
        </div>
      )}
      <div className="relative flex flex-col gap-3 px-5 py-6 sm:px-6">
        <div className="flex items-start justify-between gap-3">
          <AvatarConMarco url={datos.avatarUrl} nombre={datos.nombre} marco={datos.marco} size={84} />
          <span className={`rounded-xl border px-2.5 py-1 ${claro ? "border-white/25 bg-black/25" : "border-border bg-background"}`}>
            <PuntosConFuente texto="+24" valor={datos.fuentePuntos} tam={20} />
          </span>
        </div>
        <p className={`font-display text-2xl font-bold tracking-tight ${claseTexto}`}>{nombre}</p>
        {datos.tituloNombre && (
          <span className={`-mt-1 w-fit rounded-full px-3 py-1 text-xs font-semibold ${claro ? "bg-white/15 text-white" : "bg-primario/10 text-primario"}`}>{datos.tituloNombre}</span>
        )}
        <RangoBadge elo={datos.elo} size="md" mostrarElo className={claseTextoSec} />
        <div className="mt-1 grid max-w-xs grid-cols-2 gap-2 pb-6">
          <span className={chip}>{t("nivel", { n: datos.nivel })}</span>
          <span className={chip}>{t("chispas", { n: datos.chispas })}</span>
        </div>
      </div>
    </div>
  );
}
