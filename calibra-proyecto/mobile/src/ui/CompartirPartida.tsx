import { useRef, useState } from "react";
import { View } from "react-native";
import type { OrigenCompartir, TarjetaPartida } from "@/lib/partidas/compartir";
import { compartirTarjeta, crearEnlacePartida, mensajeCompartir } from "~/lib/partidasCompartidas";
import { textosDe } from "~/lib/textosWeb";
import { color } from "~/tema";
import Boton3D from "./Boton3D";
import Hoja from "./Hoja";
import TarjetaPartidaVista from "./TarjetaPartida";
import Texto from "./Texto";

const t = textosDe("Partidas");

// «Compartir» del resultado de una partida y del detalle de un duelo: muestra
// la tarjeta-imagen en una hoja y la comparte con el menú del sistema (con el
// enlace público si la base lo permite, ver 0300_compartir_partidas.sql).
export default function CompartirPartida({ origen, tarjeta, acento, tamano = "sm" }: { origen: OrigenCompartir | null; tarjeta: TarjetaPartida; acento?: string; tamano?: "sm" | "md" }) {
  const [abierta, setAbierta] = useState(false);
  const [ocupado, setOcupado] = useState(false);
  const [nota, setNota] = useState<string | null>(null);
  const enlace = useRef<{ clave: string; url: string | null } | null>(null);
  const vista = useRef<View>(null);

  async function compartir() {
    setOcupado(true);
    setNota(null);
    try {
      const clave = JSON.stringify(origen);
      if (enlace.current?.clave !== clave) enlace.current = { clave, url: await crearEnlacePartida(origen) };
      const url = enlace.current.url;
      await compartirTarjeta(vista, mensajeCompartir(tarjeta, url));
      setNota(url ? null : t("sinEnlace"));
    } catch {
      setNota(t("errorImagen"));
    } finally {
      setOcupado(false);
    }
  }

  return (
    <>
      <Boton3D titulo={t("compartir")} variante="secundario" acento={acento} tamano={tamano} onPress={() => setAbierta(true)} />
      <Hoja visible={abierta} onCerrar={() => setAbierta(false)}>
        <View style={{ alignItems: "center", gap: 12 }}>
          <Texto v="h3">{t("compartirResultado")}</Texto>
          <TarjetaPartidaVista ref={vista} tarjeta={tarjeta} />
          {nota && (
            <Texto v="nota" tam={12} centro c={color.texto2}>
              {nota}
            </Texto>
          )}
          <View style={{ alignSelf: "stretch" }}>
            <Boton3D titulo={t("compartirImagen")} acento={acento} cargando={ocupado} onPress={() => void compartir()} />
          </View>
        </View>
      </Hoja>
    </>
  );
}
