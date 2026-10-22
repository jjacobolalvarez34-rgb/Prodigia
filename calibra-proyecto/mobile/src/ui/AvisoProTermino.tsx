import { useRouter, type Href } from "expo-router";
import { StyleSheet, View } from "react-native";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { cerrarAvisoProTermino, useJugador } from "~/lib/jugador";
import { color, conAlfa } from "~/tema";
import Boton3D from "./Boton3D";
import Logo from "./Logo";
import Texto from "./Texto";

// «Tu Prodigia Pro terminó» (0276), igual que AvisoProTermino de la web: sale una
// vez cuando la suscripción vence o se cancela y Pro se apaga. Lo que compraste
// con Chispas se queda; lo que se apaga es lo que daba Pro.
export default function AvisoProTermino() {
  const router = useRouter();
  const { proTermino } = useJugador();
  if (!proTermino) return null;

  return (
    <Animated.View entering={FadeIn.duration(250)} style={styles.fondo}>
      <Animated.View entering={FadeInDown.duration(350)} style={styles.tarjeta}>
        <View style={{ alignSelf: "center" }}>
          <Logo tam={52} />
        </View>
        <Texto v="micro" c={color.logro} centro>
          PRODIGIA PRO
        </Texto>
        <Texto v="h2" centro>
          Tu Pro terminó
        </Texto>
        <Texto v="nota" centro>
          Tu suscripción venció, así que se apagó lo que daba Pro:
        </Texto>
        <View style={styles.lista}>
          {["Los mundos que no compraste vuelven a tener candado", "Las Clases después de la primera", "Estadísticas avanzadas", "Partidas sin anuncios"].map((t) => (
            <Texto key={t} v="nota" tam={13}>
              ·  {t}
            </Texto>
          ))}
        </View>
        <Texto v="nota" centro tam={12}>
          Tus mundos comprados, tu progreso y tus cosméticos siguen siendo tuyos.
        </Texto>
        <Boton3D
          titulo="Renovar Pro"
          variante="pro"
          brillo
          onPress={() => {
            void cerrarAvisoProTermino();
            router.push("/pro" as Href);
          }}
        />
        <Boton3D titulo="Ahora no" variante="secundario" onPress={() => void cerrarAvisoProTermino()} />
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  fondo: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: conAlfa(color.bgHondo, 0.9), zIndex: 120, elevation: 120, justifyContent: "center", padding: 24 },
  tarjeta: { gap: 10, padding: 22, borderRadius: 24, borderWidth: 1, borderColor: conAlfa(color.logro, 0.45), backgroundColor: color.surface2 },
  lista: { gap: 4, padding: 12, borderRadius: 14, backgroundColor: conAlfa(color.logro, 0.08) },
});
