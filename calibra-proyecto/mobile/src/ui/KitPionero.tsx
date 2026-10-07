import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import Animated, { Easing, FadeInDown, interpolate, useAnimatedStyle, useSharedValue, withTiming, type SharedValue } from "react-native-reanimated";
import { sonar, vibrar } from "~/lib/efectos";
import { useJugador } from "~/lib/jugador";
import { color, conAlfa, fuente, MUNDOS } from "~/tema";
import Boton3D from "./Boton3D";
import AvatarMarco from "./placa/AvatarMarco";
import Texto from "./Texto";

// Kit del Pionero (0258): la caja se abre, las 13 luces de las ciudades salen
// volando, dan una vuelta y se juntan en tu avatar, que aparece con el marco puesto.
const DURACION = 2600;
const RADIO = 125;

function Luz({ i, p }: { i: number; p: SharedValue<number> }) {
  const angulo = (i / MUNDOS.length) * Math.PI * 2;
  const estilo = useAnimatedStyle(() => {
    const r = p.value < 0.45 ? interpolate(p.value, [0.14, 0.45], [0, RADIO], "clamp") : interpolate(p.value, [0.45, 0.8], [RADIO, 0], "clamp");
    const giro = angulo + interpolate(p.value, [0.14, 0.8], [0, Math.PI], "clamp");
    return {
      opacity: interpolate(p.value, [0.12, 0.18, 0.74, 0.82], [0, 1, 1, 0], "clamp"),
      transform: [{ translateX: Math.cos(giro) * r }, { translateY: Math.sin(giro) * r }, { scale: interpolate(p.value, [0.45, 0.8], [1, 0.5], "clamp") }],
    };
  });
  const c = MUNDOS[i].neon;
  return <Animated.View style={[styles.luz, { backgroundColor: c, boxShadow: `0px 0px 14px ${c}` }, estilo]} />;
}

export default function KitPionero({ onCerrar }: { onCerrar: () => void }) {
  const { placa } = useJugador();
  const p = useSharedValue(0);
  const [listo, setListo] = useState(false);

  useEffect(() => {
    p.value = withTiming(1, { duration: DURACION, easing: Easing.inOut(Easing.quad) });
    const a = setTimeout(() => {
      sonar("moneda");
      vibrar.exito();
    }, DURACION * 0.15);
    const b = setTimeout(() => {
      sonar("acierto3");
      setListo(true);
    }, DURACION * 0.85);
    return () => {
      clearTimeout(a);
      clearTimeout(b);
    };
  }, [p]);

  const caja = useAnimatedStyle(() => ({
    opacity: interpolate(p.value, [0, 0.05, 0.14, 0.2], [0, 1, 1, 0], "clamp"),
    transform: [{ scale: interpolate(p.value, [0, 0.06, 0.12, 0.2], [0.5, 1, 1.15, 1.6], "clamp") }, { rotate: `${interpolate(p.value, [0.06, 0.08, 0.1, 0.12], [0, -8, 8, 0], "clamp")}deg` }],
  }));
  const avatar = useAnimatedStyle(() => ({
    opacity: interpolate(p.value, [0.7, 0.88], [0, 1], "clamp"),
    transform: [{ scale: interpolate(p.value, [0.7, 0.9, 1], [0.4, 1.12, 1], "clamp") }],
  }));
  const halo = useAnimatedStyle(() => ({ opacity: interpolate(p.value, [0.75, 0.9, 1], [0, 0.9, 0.5], "clamp") }));

  return (
    <View style={styles.fondo}>
      <View style={styles.escena}>
        <Animated.View style={[styles.halo, halo]} />
        {MUNDOS.map((m, i) => (
          <Luz key={m.slug} i={i} p={p} />
        ))}
        <Animated.Text style={[styles.caja, caja]}>🎁</Animated.Text>
        <Animated.View style={avatar}>
          <AvatarMarco url={placa?.avatarUrl ?? null} nombre={placa?.nombre ?? "?"} marco="pionero" tam={120} />
        </Animated.View>
      </View>
      {listo && (
        <Animated.View entering={FadeInDown.duration(400)} style={styles.texto}>
          <Texto v="micro" c={color.logro} centro>
            KIT DEL PIONERO
          </Texto>
          <Texto v="h1" centro>
            ¡Gracias por jugar en la app!
          </Texto>
          <View style={styles.premios}>
            {[
              ["⚡", "1.000 Chispas"],
              ["◎", "Marco «Pionero», con las 13 ciudades"],
              ["🏷", "Título «Pionero» para tu placa"],
              ["🎁", "1 cápsula para abrir en Recompensas"],
            ].map(([icono, t]) => (
              <View key={t} style={styles.premio}>
                <Texto tam={18}>{icono}</Texto>
                <Texto v="fuerte" tam={15} style={{ flex: 1 }}>
                  {t}
                </Texto>
              </View>
            ))}
          </View>
          <Boton3D titulo="¡A jugar!" variante="logro" brillo onPress={onCerrar} />
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  fondo: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: conAlfa(color.bgHondo, 0.96), zIndex: 130, elevation: 130, justifyContent: "center", padding: 24, gap: 28 },
  escena: { height: 300, alignItems: "center", justifyContent: "center" },
  halo: { position: "absolute", width: 220, height: 220, borderRadius: 110, backgroundColor: conAlfa(color.logro, 0.18), boxShadow: `0px 0px 60px ${conAlfa(color.primario, 0.6)}` },
  luz: { position: "absolute", width: 16, height: 16, borderRadius: 8 },
  caja: { position: "absolute", fontSize: 84, fontFamily: fuente.display },
  texto: { gap: 14 },
  premios: { gap: 10, padding: 16, borderRadius: 18, borderWidth: 1, borderColor: conAlfa(color.logro, 0.4), backgroundColor: conAlfa(color.logro, 0.08) },
  premio: { flexDirection: "row", alignItems: "center", gap: 12 },
});
