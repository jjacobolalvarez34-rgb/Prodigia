"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import Boton from "@/components/Boton";
import { IconX } from "@/components/icons";
import { createClient } from "@/lib/supabase/client";
import { aciertosTexto, codificarTarjeta, esFuncionFaltante, esUuid, rutaPartidaPublica, type OrigenCompartir, type TarjetaPartida } from "@/lib/partidas/compartir";

interface Props {
  origen: OrigenCompartir | null;
  tarjeta: TarjetaPartida;
  colorHex?: string;
  className?: string;
}

interface Preparado {
  clave: string;
  archivo: File;
  vista: string;
  enlace: string | null;
}

// Crea (o reutiliza) el enlace público de la partida — 0300_compartir_partidas.sql.
// Si la migración no corrió o algo falla, null: se comparte solo la imagen.
async function crearEnlace(origen: OrigenCompartir | null): Promise<string | null> {
  if (!origen) return null;
  const supabase = createClient();
  const { data, error } =
    "duelId" in origen
      ? await supabase.rpc("compartir_duelo", { p_duel_id: origen.duelId })
      : await supabase.rpc("compartir_sprint", { p_mundo: origen.mundo, p_cantidad: origen.cantidad, p_desde: origen.desde });
  if (error) {
    if (!esFuncionFaltante(error)) console.warn("compartir partida:", error.message);
    return null;
  }
  return esUuid(data) ? data : null;
}

// «Compartir» del resultado de una partida y del detalle de un duelo: arma la
// tarjeta-imagen (/api/partida/tarjeta), la muestra y la comparte con el menú
// del sistema (Web Share API con el archivo). Sin Web Share: descargar la
// imagen y copiar el enlace.
export default function BotonCompartirPartida({ origen, tarjeta, colorHex, className }: Props) {
  const t = useTranslations("Partidas");
  const tMundos = useTranslations("Mundos.nombres");
  const locale = useLocale();
  const [abierto, setAbierto] = useState(false);
  const [preparado, setPreparado] = useState<Preparado | null>(null);
  const [error, setError] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);
  const pedido = useRef(0);
  // Si la tarjeta cambia (el duelo se resolvió con la pantalla abierta), se rearma.
  const clave = codificarTarjeta(tarjeta);

  const mundo = tMundos.has(tarjeta.mundo) ? tMundos(tarjeta.mundo) : tarjeta.mundo;
  const mensaje =
    tarjeta.tipo === "duelo" && tarjeta.rival
      ? t(`mensaje.${tarjeta.resultado ?? "pendiente"}`, {
          rival: tarjeta.rival.nombre ?? t("tarjeta.rival"),
          mundo,
          mio: tarjeta.yo.puntaje ?? 0,
          suyo: tarjeta.rival.puntaje ?? 0,
        })
      : t("mensaje.sprint", { aciertos: aciertosTexto(tarjeta.yo), mundo });

  useEffect(() => {
    return () => {
      if (preparado) URL.revokeObjectURL(preparado.vista);
    };
  }, [preparado]);

  useEffect(() => {
    if (!abierto) return;
    const alTeclear = (e: KeyboardEvent) => {
      if (e.key === "Escape") setAbierto(false);
    };
    window.addEventListener("keydown", alTeclear);
    return () => window.removeEventListener("keydown", alTeclear);
  }, [abierto]);

  async function preparar() {
    const n = ++pedido.current;
    setError(false);
    setAviso(null);
    try {
      const id = await crearEnlace(origen);
      const src = id ? `/api/partida/tarjeta?id=${id}&l=${locale}` : `/api/partida/tarjeta?d=${clave}&l=${locale}`;
      const res = await fetch(src);
      if (!res.ok) throw new Error(String(res.status));
      const blob = await res.blob();
      if (n !== pedido.current) return;
      setPreparado({
        clave,
        archivo: new File([blob], "prodigia-partida.png", { type: "image/png" }),
        vista: URL.createObjectURL(blob),
        enlace: id ? `${window.location.origin}${rutaPartidaPublica(id, locale)}` : null,
      });
    } catch {
      if (n === pedido.current) setError(true);
    }
  }

  function abrir() {
    setAbierto(true);
    if (!preparado || preparado.clave !== clave) {
      setPreparado(null);
      void preparar();
    }
  }

  const puedeArchivo = typeof navigator !== "undefined" && !!preparado && !!navigator.canShare?.({ files: [preparado.archivo] });
  const puedeTexto = typeof navigator !== "undefined" && typeof navigator.share === "function";
  const textoCompleto = preparado?.enlace ? `${mensaje} ${preparado.enlace}` : mensaje;

  async function compartir() {
    if (!preparado) return;
    try {
      if (puedeArchivo) await navigator.share({ files: [preparado.archivo], text: textoCompleto });
      else await navigator.share({ text: mensaje, url: preparado.enlace ?? undefined });
    } catch {
      // El jugador cerró el menú del sistema: no es un error.
    }
  }

  function descargar() {
    if (!preparado) return;
    const a = document.createElement("a");
    a.href = preparado.vista;
    a.download = preparado.archivo.name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setAviso(t("descargada"));
  }

  async function copiar() {
    try {
      await navigator.clipboard.writeText(preparado?.enlace ?? textoCompleto);
      setAviso(t("copiado"));
    } catch {
      setAviso(null);
    }
  }

  return (
    <>
      <Boton variante="secundario" colorHex={colorHex} className={className} onClick={abrir}>
        {t("compartir")}
      </Boton>
      {abierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setAbierto(false)}>
          <div
            role="dialog"
            aria-modal="true"
            aria-label={t("compartirResultado")}
            className="relative flex max-h-[92vh] w-full max-w-sm flex-col gap-4 overflow-y-auto rounded-2xl border border-border bg-surface p-5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-bold text-foreground">{t("compartirResultado")}</h2>
              <button type="button" onClick={() => setAbierto(false)} aria-label={t("cerrar")} className="rounded-full p-1.5 text-texto-secundario hover:bg-surface-2 hover:text-foreground">
                <IconX className="h-4 w-4" />
              </button>
            </div>

            <div className="overflow-hidden rounded-xl border border-border bg-[#090C14]" style={{ aspectRatio: "1080 / 1350" }}>
              {preparado ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={preparado.vista} alt={t("vistaPrevia")} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center p-6 text-center text-sm text-white/70">{error ? t("errorImagen") : t("preparando")}</div>
              )}
            </div>

            {preparado && !preparado.enlace && <p className="text-xs text-texto-secundario">{t("sinEnlace")}</p>}
            {aviso && <p className="text-xs font-medium text-correcto" role="status">{aviso}</p>}

            {error ? (
              <Boton colorHex={colorHex} onClick={() => void preparar()}>
                {t("compartir")}
              </Boton>
            ) : (
              <div className="flex flex-col gap-2">
                {(puedeArchivo || puedeTexto) && (
                  <Boton colorHex={colorHex} onClick={() => void compartir()} disabled={!preparado}>
                    {puedeArchivo ? t("compartirImagen") : t("compartir")}
                  </Boton>
                )}
                <div className="flex gap-2">
                  <Boton variante="secundario" colorHex={colorHex} className="flex-1" tamano="sm" onClick={descargar} disabled={!preparado}>
                    {t("descargar")}
                  </Boton>
                  <Boton variante="secundario" colorHex={colorHex} className="flex-1" tamano="sm" onClick={() => void copiar()} disabled={!preparado}>
                    {preparado?.enlace ? t("copiarEnlace") : t("copiarTexto")}
                  </Boton>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
