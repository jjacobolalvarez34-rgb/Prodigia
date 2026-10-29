import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import Animated, { FadeInDown, FadeOut } from "react-native-reanimated";
import { activarAvisos, leerPreferencias, marcarPermisoPedido, permisoConcedido } from "~/lib/notificaciones";
import { color } from "~/tema";
import Boton3D from "./Boton3D";
import { IconoAlarma } from "./Iconos";
import Tarjeta from "./Tarjeta";
import Texto from "./Texto";

// Pedido del permiso de avisos después de una partida (04-BUCLE-DE-ENGANCHE.md §5):
// antes solo se pedía entrando a Ajustes → Avisos, así que en Android 13+ casi nadie
// recibía nada. Sale una sola vez (si dice «Ahora no», no vuelve) y explica para qué.
export default function PedirAvisos({ racha }: { racha: number }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let activo = true;
    (async () => {
      const prefs = await leerPreferencias();
      if (prefs.permisoPedido || (await permisoConcedido())) return;
      if (activo) setVisible(true);
    })().catch(() => undefined);
    return () => {
      activo = false;
    };
  }, []);

  if (!visible) return null;

  return (
    <Animated.View entering={FadeInDown.duration(300)} exiting={FadeOut.duration(200)}>
      <Tarjeta sinEntrada acento={color.logro}>
        <View style={styles.fila}>
          <IconoAlarma tam={24} c={color.logro} />
          <View style={{ flex: 1, gap: 2 }}>
            <Texto v="h3">{racha > 0 ? `Que no se corte tu racha de ${racha} ${racha === 1 ? "día" : "días"}` : "¿Te avisamos a tiempo?"}</Texto>
            <Texto v="nota">Un aviso si tu racha está en peligro, cuando empieza la Gran Alineación y cuando te retan. Como mucho 2 al día y nunca de noche.</Texto>
          </View>
        </View>
        <View style={styles.botones}>
          <View style={{ flex: 1 }}>
            <Boton3D titulo="Ahora no" variante="secundario" tamano="sm" onPress={() => { setVisible(false); void marcarPermisoPedido(); }} />
          </View>
          <View style={{ flex: 1 }}>
            <Boton3D titulo="Activar avisos" tamano="sm" onPress={() => { setVisible(false); void activarAvisos(); }} />
          </View>
        </View>
      </Tarjeta>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  fila: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  botones: { flexDirection: "row", gap: 10, marginTop: 12 },
});
