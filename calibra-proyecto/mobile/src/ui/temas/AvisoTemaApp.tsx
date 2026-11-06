import { useState } from "react";
import { Text, View } from "react-native";
import { letraDe, TEMA_CLASICO, temaAppDe } from "@/lib/recompensas/temas";
import { descartarLetraPendiente, useLetraPendiente } from "~/lib/letraApp";
import { descartarPendiente, reiniciarConTema, useTemaPendiente } from "~/lib/temaApp";
import { color, TEMA_APP_ACTIVO } from "~/tema";
import { mostrarAviso } from "~/ui/Aviso";
import Boton3D from "~/ui/Boton3D";
import Hoja from "~/ui/Hoja";
import Texto from "~/ui/Texto";
import MiniTemaApp from "./MiniTemaApp";
import MuestraLetraLibre from "./MuestraLetraLibre";

// Un tema de la app (0297) o una letra de la Letra libre (0314) guardados que todavía
// no se ven: se eligieron en el Bazar o en Ajustes, o llegaron desde la web. Los
// colores, la forma y la letra de la app se arman al arrancar, así que se ofrece
// reiniciar (unos segundos, sin perder nada) o dejarlo para la próxima vez que se abra.
// Si hay tema y letra pendientes, una sola hoja: el reinicio pone los dos.
export default function AvisoTemaApp() {
  const pendiente = useTemaPendiente();
  const letraPendiente = useLetraPendiente();
  const [ocupado, setOcupado] = useState(false);
  if (!pendiente && !letraPendiente) return null;
  const tema = pendiente ? (pendiente === TEMA_CLASICO ? null : temaAppDe(pendiente)) : null;
  const nombre = tema ? tema.nombre : "Noche de Prodigia";
  // La letra que se verá: la elegida, o la del tema con el que arrancará la app.
  const letra = letraPendiente ? (letraDe(letraPendiente.id) ?? letraDe(temaAppDe(pendiente ?? TEMA_APP_ACTIVO)?.letra) ?? letraDe("siempre")!) : null;
  const descartar = () => {
    descartarPendiente();
    descartarLetraPendiente();
  };
  return (
    <Hoja visible onCerrar={descartar}>
      {pendiente ? (
        <View style={{ flexDirection: "row", gap: 14, alignItems: "center" }}>
          <MiniTemaApp tema={tema} ancho={78} alto={102} />
          <View style={{ flex: 1, gap: 4 }}>
            <Texto v="micro">Tema de la app</Texto>
            <Texto v="h2">{nombre}</Texto>
            <Texto v="nota">Prodigia se reinicia unos segundos para ponérselo. No pierdes nada.</Texto>
          </View>
        </View>
      ) : (
        letra && (
          <View style={{ flexDirection: "row", gap: 14, alignItems: "center" }}>
            <MuestraLetraLibre tam={70} />
            <View style={{ flex: 1, gap: 4 }}>
              <Texto v="micro">Letra de la app</Texto>
              {/* Text a propósito: la muestra va en su propia letra, sin la escala de la actual. */}
              <Text style={{ fontFamily: letra.app.display, fontSize: Math.round(22 * letra.escala), lineHeight: Math.ceil(22 * letra.escala * letra.interlineado), color: color.texto }}>
                {letraPendiente?.id ? letra.nombre : `La del tema (${letra.nombre})`}
              </Text>
              <Texto v="nota">Prodigia se reinicia unos segundos para ponerla en todos los títulos. No pierdes nada.</Texto>
            </View>
          </View>
        )
      )}
      <Boton3D
        titulo="Aplicar ahora"
        brillo
        cargando={ocupado}
        onPress={async () => {
          setOcupado(true);
          const ok = await reiniciarConTema();
          setOcupado(false);
          if (!ok) {
            descartar();
            mostrarAviso("Se pondrá la próxima vez que abras Prodigia.", "info");
          }
        }}
      />
      <Boton3D
        titulo="Más tarde"
        variante="secundario"
        tamano="sm"
        onPress={() => {
          descartar();
          mostrarAviso("Listo: se pondrá la próxima vez que abras Prodigia.", "info");
        }}
      />
    </Hoja>
  );
}
