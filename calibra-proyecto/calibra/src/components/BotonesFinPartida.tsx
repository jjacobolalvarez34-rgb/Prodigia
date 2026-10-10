"use client";

import { useEffect, useState } from "react";
import Boton from "@/components/Boton";
import BotonEnlace from "@/components/BotonEnlace";
import { useTranslations } from "next-intl";
import { anuncioEntrePartidasWeb, contarPartidaWeb } from "@/lib/publicidad/web";

interface Props {
  onOtraVez: () => void;
  volverHref: string;
  colorHex?: string;
}

// Fase UU: toda pantalla de resumen de partida termina con las mismas
// dos salidas — repetir con la misma configuración, o volver a la home
// del mundo — nunca solo una.
//
// Anuncio entre partidas (lib/publicidad/web.ts, solo cuentas gratis): esta
// pantalla cuenta la partida y, cada 3, muestra uno al pedir otra. Los duelos
// (que vuelven a /rankeds) no cuentan ni muestran nada.
export default function BotonesFinPartida({ onOtraVez, volverHref, colorHex }: Props) {
  const t = useTranslations("Componentes");
  const esDuelo = volverHref.startsWith("/rankeds");
  const [esperando, setEsperando] = useState(false);

  useEffect(() => {
    if (!esDuelo) contarPartidaWeb();
  }, [esDuelo]);

  async function otraVez() {
    if (!esDuelo) {
      setEsperando(true);
      await anuncioEntrePartidasWeb();
      setEsperando(false);
    }
    onOtraVez();
  }

  return (
    <div className="flex w-full max-w-md flex-col gap-3 sm:flex-row">
      <Boton destacado colorHex={colorHex} className="flex-1 py-4" onClick={otraVez} disabled={esperando}>
        {t("botonesFinPartida.otraPartida")}
      </Boton>
      <BotonEnlace href={volverHref} variante="secundario" atras colorHex={colorHex} className="py-4">
        {t("botonesFinPartida.volver")}
      </BotonEnlace>
    </div>
  );
}
