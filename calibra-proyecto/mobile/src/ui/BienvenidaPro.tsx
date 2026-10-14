import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter, type Href } from "expo-router";
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import Animated, { FadeIn, FadeInDown, ZoomIn } from "react-native-reanimated";
import { BENEFICIOS_PRO } from "@/lib/pro/beneficios";
import { sonar, vibrar } from "~/lib/efectos";
import { useJugador } from "~/lib/jugador";
import { color, conAlfa } from "~/tema";
import Boton3D from "./Boton3D";
import Confeti from "./Confeti";
import Texto from "./Texto";

// «¡Ya tienes Pro!» en la app (revisión 2026-10-14: la bienvenida solo existía en la
// web, /pro/bienvenida). Sale una sola vez por cuenta, la primera vez que la app ve
// el plan en Pro: la lista de todo lo nuevo (la misma de la web) y dónde está el
// contador. Al revés de AvisoProTermino.
const clave = (userId: string) => `prodigia:pro-bienvenida:${userId}`;

export default function BienvenidaPro({ userId }: { userId: string }) {
  const router = useRouter();
  const { plan } = useJugador();
  const [ver, setVer] = useState(false);

  useEffect(() => {
    if (plan !== "pro") return;
    AsyncStorage.getItem(clave(userId)).then((v) => {
      if (!v) {
        setVer(true);
        sonar("victoria");
        vibrar.exito();
      }
    });
  }, [plan, userId]);

  if (!ver) return null;
  const cerrar = (ir?: Href) => {
    setVer(false);
    void AsyncStorage.setItem(clave(userId), "1");
    if (ir) router.push(ir);
  };

  return (
    <Animated.View entering={FadeIn.duration(250)} style={styles.fondo}>
      <Confeti cantidad={50} />
      <Animated.View entering={ZoomIn.duration(380).springify().damping(12)} style={styles.tarjeta}>
        <Texto v="micro" c={color.logro} centro>
          PRODIGIA PRO
        </Texto>
        <Texto v="h1" centro>
          ¡Ya tienes Pro!
        </Texto>
        <Texto v="nota" centro>
          Esto es todo lo que se acaba de encender en tu cuenta:
        </Texto>
        <ScrollView style={{ maxHeight: 320 }} contentContainerStyle={styles.lista}>
          {BENEFICIOS_PRO.map((b, i) => (
            <Animated.View key={b.titulo} entering={FadeInDown.delay(120 + i * 70)} style={styles.fila}>
              <Texto tam={20}>{b.emoji}</Texto>
              <View style={{ flex: 1 }}>
                <Texto v="fuerte">{b.titulo}</Texto>
                <Texto v="nota" tam={12}>
                  {b.descripcion}
                </Texto>
              </View>
            </Animated.View>
          ))}
        </ScrollView>
        <Texto v="nota" centro tam={12}>
          Cuánto le queda a tu Pro lo ves siempre en la sección Pro, con su contador.
        </Texto>
        <Boton3D titulo="Ver mi Pro" variante="pro" brillo onPress={() => cerrar("/pro" as Href)} />
        <Boton3D titulo="¡A jugar!" variante="secundario" onPress={() => cerrar()} />
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  fondo: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: conAlfa(color.bgHondo, 0.92), zIndex: 125, elevation: 125, justifyContent: "center", padding: 20 },
  tarjeta: { gap: 10, padding: 20, borderRadius: 24, borderWidth: 1, borderColor: conAlfa(color.logro, 0.5), backgroundColor: color.surface2, boxShadow: `0px 0px 40px ${conAlfa(color.logro, 0.3)}` },
  lista: { gap: 8 },
  fila: { flexDirection: "row", gap: 10, alignItems: "flex-start", padding: 10, borderRadius: 14, backgroundColor: conAlfa(color.logro, 0.08) },
});
