"use client";

import Boton from "@/components/Boton";
import BotonEnlace from "@/components/BotonEnlace";
import { useTranslations } from "next-intl";

interface Props {
  onOtraVez: () => void;
  volverHref: string;
  colorHex?: string;
}

// Fase UU: toda pantalla de resumen de partida termina con las mismas
// dos salidas — repetir con la misma configuración, o volver a la home
// del mundo — nunca solo una.
export default function BotonesFinPartida({ onOtraVez, volverHref, colorHex }: Props) {
  const t = useTranslations("Componentes");
  return (
    <div className="flex w-full max-w-md flex-col gap-3 sm:flex-row">
      <Boton destacado colorHex={colorHex} className="flex-1 py-4" onClick={onOtraVez}>
        {t("botonesFinPartida.otraPartida")}
      </Boton>
      <BotonEnlace href={volverHref} variante="secundario" atras colorHex={colorHex} className="py-4">
        {t("botonesFinPartida.volver")}
      </BotonEnlace>
    </div>
  );
}
