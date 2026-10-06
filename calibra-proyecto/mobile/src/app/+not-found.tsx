import { useRouter } from "expo-router";
import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, { cancelAnimation, Easing, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withSequence, withTiming } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Circle, Defs, Ellipse, LinearGradient, Polygon, Stop } from "react-native-svg";
import { textosDe } from "~/lib/textosWeb";
import { useAnimacionActiva } from "~/lib/rendimiento";
import Boton3D from "~/ui/Boton3D";
import Ciudad from "~/ui/Ciudad";
import Texto from "~/ui/Texto";
import { color, fuente } from "~/tema";

// 404 de Prodigia (igual que PaginaNoEncontrada.tsx de la web): una ciudad de
// noche con un ovni que se está llevando el "0" del 404 con su rayo.
const t = textosDe("Common.noEncontrado");
const ESTRELLAS = Array.from({ length: 22 }, (_, i) => ({ x: (i * 37) % 100, y: (i * 53) % 50, tam: 1 + (i % 3), demora: (i % 7) * 400 }));

function Estrella({ x, y, tam, demora }: (typeof ESTRELLAS)[number]) {
  const o = useSharedValue(0.3);
  const activa = useAnimacionActiva();
  useEffect(() => {
    if (!activa) return;
    o.set(withDelay(demora, withRepeat(withSequence(withTiming(1, { duration: 1300 }), withTiming(0.2, { duration: 1300 })), -1)));
    return () => cancelAnimation(o);
  }, [activa, demora, o]);
  const a = useAnimatedStyle(() => ({ opacity: o.value }));
  return <Animated.View style={[{ position: "absolute", left: `${x}%`, top: `${y}%`, width: tam, height: tam, borderRadius: tam, backgroundColor: "#fff" }, a]} />;
}

export default function NoEncontrada() {
  const router = useRouter();
  const activa = useAnimacionActiva();
  const flota = useSharedValue(0);
  const cero = useSharedValue(0);
  const rayo = useSharedValue(0.6);
  useEffect(() => {
    if (!activa) return;
    flota.set(withRepeat(withSequence(withTiming(1, { duration: 1600, easing: Easing.inOut(Easing.quad) }), withTiming(0, { duration: 1600, easing: Easing.inOut(Easing.quad) })), -1));
    cero.set(withRepeat(withSequence(withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.quad) }), withTiming(0, { duration: 1200, easing: Easing.inOut(Easing.quad) })), -1));
    rayo.set(withRepeat(withSequence(withTiming(1, { duration: 900 }), withTiming(0.6, { duration: 900 })), -1));
    return () => {
      cancelAnimation(flota);
      cancelAnimation(cero);
      cancelAnimation(rayo);
    };
  }, [activa, flota, cero, rayo]);
  const estiloOvni = useAnimatedStyle(() => ({ transform: [{ translateY: -8 * flota.value }, { rotate: `${-2 + 4 * flota.value}deg` }] }));
  const estiloCero = useAnimatedStyle(() => ({ transform: [{ translateY: -36 - 22 * cero.value }, { rotate: `${-8 + 16 * cero.value}deg` }] }));
  const estiloRayo = useAnimatedStyle(() => ({ opacity: rayo.value }));

  return (
    <View style={styles.pantalla}>
      {ESTRELLAS.map((e, i) => (
        <Estrella key={i} {...e} />
      ))}
      <SafeAreaView style={styles.contenido}>
        <View style={styles.escena}>
          <Animated.View style={[styles.rayo, estiloRayo]}>
            <Svg width={180} height={180} viewBox="0 0 100 100">
              <Defs>
                <LinearGradient id="rayo404" x1="0" y1="0" x2="0" y2="1">
                  <Stop offset="0" stopColor="#7CFFB2" stopOpacity={0.55} />
                  <Stop offset="1" stopColor="#7CFFB2" stopOpacity={0.04} />
                </LinearGradient>
              </Defs>
              <Polygon points="38,0 62,0 100,100 0,100" fill="url(#rayo404)" />
            </Svg>
          </Animated.View>
          <Animated.View style={[styles.ovni, estiloOvni]}>
            <Svg width={160} height={94} viewBox="0 0 120 70">
              <Ellipse cx={60} cy={26} rx={22} ry={18} fill="#9BE7FF" fillOpacity={0.85} />
              <Ellipse cx={54} cy={20} rx={7} ry={5} fill="#ffffff" fillOpacity={0.6} />
              <Ellipse cx={60} cy={38} rx={56} ry={14} fill="#B8C2DA" />
              <Ellipse cx={60} cy={42} rx={40} ry={6} fill="#7C86A2" />
              {[24, 42, 60, 78, 96].map((cx, i) => (
                <Circle key={cx} cx={cx} cy={38} r={3.2} fill={i % 2 ? color.logro : "#7CFFB2"} />
              ))}
            </Svg>
          </Animated.View>
          <View style={styles.numeros}>
            <Texto style={[styles.numero, { color: color.primarioClaro, textShadowColor: color.primario }]}>4</Texto>
            <Animated.View style={estiloCero}>
              <Texto style={[styles.numero, { color: "#7CFFB2", textShadowColor: "#7CFFB2" }]}>0</Texto>
            </Animated.View>
            <Texto style={[styles.numero, { color: color.logro, textShadowColor: color.logro }]}>4</Texto>
          </View>
        </View>
        <View style={{ alignItems: "center", gap: 8, paddingHorizontal: 24 }}>
          <Texto v="h1" centro>
            {t("titulo")}
          </Texto>
          <Texto v="nota" centro>
            {t("descripcion")}
          </Texto>
        </View>
        <View style={{ alignSelf: "stretch", gap: 10, paddingHorizontal: 24, marginTop: 8 }}>
          <Boton3D titulo={t("inicio")} brillo onPress={() => router.replace("/")} />
        </View>
      </SafeAreaView>
      <View style={styles.ciudad} pointerEvents="none">
        <Ciudad semilla="numeria" acento={color.primario} alto={120} radio={0} sinLuna />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: "#070A16" },
  contenido: { flex: 1, alignItems: "center", justifyContent: "center", gap: 14, paddingBottom: 110 },
  escena: { width: 280, height: 250, alignItems: "center" },
  ovni: { position: "absolute", top: 0 },
  rayo: { position: "absolute", top: 56 },
  numeros: { position: "absolute", bottom: 0, flexDirection: "row", alignItems: "flex-end", gap: 10 },
  numero: { fontFamily: fuente.display, fontSize: 92, lineHeight: 100, textShadowRadius: 24 },
  ciudad: { position: "absolute", left: 0, right: 0, bottom: 0 },
});
