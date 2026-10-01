import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, type ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from "react-native-reanimated";
import { infoMarco } from "~/lib/placa";
import { aclarar, brillo, color, fuente, oscurecer } from "~/tema";
import Texto from "../Texto";

// Avatar + marco (AvatarConMarco.tsx de la web): marco de rango (aro del color del
// rango), neón (aro con resplandor que late), de mundo (anillo de la web encima del
// avatar) o, sin marco, el aro violeta→dorado de la marca.

interface Props {
  url: string | null;
  nombre: string;
  marco?: string;
  tam?: number;
  animar?: boolean;
  presencia?: boolean;
}

function Inicial({ nombre, tam }: { nombre: string; tam: number }) {
  return (
    <LinearGradient colors={["#2A2150", color.surface1]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.relleno, { borderRadius: tam / 2 }]}>
      <Texto style={{ fontFamily: fuente.display, fontSize: Math.max(11, tam * 0.4), color: color.texto }}>{(nombre.trim()[0] ?? "?").toUpperCase()}</Texto>
    </LinearGradient>
  );
}

export default function AvatarMarco({ url, nombre, marco = "ninguno", tam = 40, animar = true, presencia }: Props) {
  const info = infoMarco(marco);
  const grosor = tam >= 60 ? 3 : 2;
  const pulso = useSharedValue(0.5);

  useEffect(() => {
    if (info.tipo !== "neon" || !animar) return;
    pulso.set(withRepeat(withSequence(withTiming(1, { duration: 1100, easing: Easing.inOut(Easing.quad) }), withTiming(0.35, { duration: 1100 })), -1));
  }, [info.tipo, animar, pulso]);
  const estiloPulso = useAnimatedStyle(() => ({ opacity: pulso.value, transform: [{ scale: 1 + pulso.value * 0.06 }] }));

  const interior = tam - grosor * 2;
  const foto = (
    <View style={{ width: interior, height: interior, borderRadius: interior / 2, overflow: "hidden", backgroundColor: color.surface2 }}>
      {url ? <Image source={{ uri: url }} style={styles.relleno} contentFit="cover" autoplay={animar} transition={150} /> : <Inicial nombre={nombre} tam={interior} />}
    </View>
  );

  let aro: ReactNode;
  if (info.tipo === "rango") {
    const dorado = info.color === "#FFC53D" || info.color === "#E8B34D";
    aro = (
      <LinearGradient
        colors={dorado ? ["#FFB627", "#FFF3C4", "#FFB627", "#B87800"] : [aclarar(info.color, 0.35), info.color, oscurecer(info.color, 0.7)]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.aro, { width: tam, height: tam, borderRadius: tam / 2, boxShadow: brillo(info.color, tam * 0.3, 0.35) }]}
      >
        {foto}
      </LinearGradient>
    );
  } else if (info.tipo === "neon") {
    aro = (
      <View style={{ width: tam, height: tam }}>
        <Animated.View style={[StyleSheet.absoluteFill, { borderRadius: tam / 2, boxShadow: `0px 0px ${tam * 0.35}px ${info.color}` }, estiloPulso]} />
        <View style={[styles.aro, { width: tam, height: tam, borderRadius: tam / 2, backgroundColor: info.color }]}>{foto}</View>
      </View>
    );
  } else if (info.tipo === "mundo") {
    const anillo = Math.round(tam * 1.32);
    aro = (
      <View style={{ width: tam, height: tam, alignItems: "center", justifyContent: "center" }}>
        <View style={{ width: tam, height: tam, borderRadius: tam / 2, overflow: "hidden" }}>
          {url ? <Image source={{ uri: url }} style={styles.relleno} contentFit="cover" autoplay={animar} /> : <Inicial nombre={nombre} tam={tam} />}
        </View>
        <Image source={{ uri: info.imagen }} style={{ position: "absolute", width: anillo, height: anillo }} contentFit="contain" />
      </View>
    );
  } else {
    aro = (
      <LinearGradient colors={[color.primario, color.logro, color.primario]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.aro, { width: tam, height: tam, borderRadius: tam / 2 }]}>
        {foto}
      </LinearGradient>
    );
  }

  return (
    <View style={{ width: tam, height: tam }}>
      {aro}
      {presencia && <View style={[styles.presencia, { width: tam * 0.26, height: tam * 0.26, borderRadius: tam * 0.13 }]} />}
    </View>
  );
}

const styles = StyleSheet.create({
  relleno: { width: "100%", height: "100%", alignItems: "center", justifyContent: "center" },
  aro: { alignItems: "center", justifyContent: "center" },
  presencia: { position: "absolute", right: 0, bottom: 1, backgroundColor: color.correcto, borderWidth: 2, borderColor: color.bg },
});
