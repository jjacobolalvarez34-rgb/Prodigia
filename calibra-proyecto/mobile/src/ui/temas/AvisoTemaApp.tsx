import { useState } from "react";
import { View } from "react-native";
import { TEMA_CLASICO, temaAppDe } from "@/lib/recompensas/temas";
import { descartarPendiente, reiniciarConTema, useTemaPendiente } from "~/lib/temaApp";
import { mostrarAviso } from "~/ui/Aviso";
import Boton3D from "~/ui/Boton3D";
import Hoja from "~/ui/Hoja";
import Texto from "~/ui/Texto";
import MiniTemaApp from "./MiniTemaApp";

// Un tema de la app guardado que todavía no se ve (0297): se eligió en el Bazar o
// llegó desde la web. Los colores de la app se arman al arrancar, así que se ofrece
// reiniciar (unos segundos, sin perder nada) o dejarlo para la próxima vez que se abra.
export default function AvisoTemaApp() {
  const pendiente = useTemaPendiente();
  const [ocupado, setOcupado] = useState(false);
  if (!pendiente) return null;
  const tema = pendiente === TEMA_CLASICO ? null : temaAppDe(pendiente);
  const nombre = tema ? tema.nombre : "Noche de Prodigia";
  return (
    <Hoja visible onCerrar={descartarPendiente}>
      <View style={{ flexDirection: "row", gap: 14, alignItems: "center" }}>
        <MiniTemaApp tema={tema} ancho={78} alto={102} />
        <View style={{ flex: 1, gap: 4 }}>
          <Texto v="micro">Tema de la app</Texto>
          <Texto v="h2">{nombre}</Texto>
          <Texto v="nota">Prodigia se reinicia unos segundos para ponérselo. No pierdes nada.</Texto>
        </View>
      </View>
      <Boton3D
        titulo="Ponérmelo ahora"
        brillo
        cargando={ocupado}
        onPress={async () => {
          setOcupado(true);
          const ok = await reiniciarConTema();
          setOcupado(false);
          if (!ok) {
            descartarPendiente();
            mostrarAviso("Se pondrá la próxima vez que abras Prodigia.", "info");
          }
        }}
      />
      <Boton3D
        titulo="Más tarde"
        variante="secundario"
        tamano="sm"
        onPress={() => {
          descartarPendiente();
          mostrarAviso("Listo: se pondrá la próxima vez que abras Prodigia.", "info");
        }}
      />
    </Hoja>
  );
}
