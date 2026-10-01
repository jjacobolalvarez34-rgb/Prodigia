import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useState, type ReactNode } from "react";
import { StyleSheet, View, type LayoutChangeEvent } from "react-native";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from "react-native-reanimated";
import { coloresFondo } from "~/lib/placa";
import { conAlfa } from "~/tema";

// Fondo de la Placa: los degradés de la tienda (que se mueven lento, como el
// background-position animado de la web), una imagen o GIF propio / de la galería,
// o el fondo nocturno por defecto. Encima, el velo que deja leer el texto sobre
// cualquier GIF (02-SISTEMA-VISUAL.md §10.3).

interface Props {
  fondo: string;
  url: string | null;
  acento?: string;
  animar?: boolean;
  velo?: boolean;
}

function DegradeVivo({ colores, animar }: { colores: string[]; animar: boolean }) {
  const [tam, setTam] = useState({ w: 0, h: 0 });
  const t = useSharedValue(0);
  useEffect(() => {
    if (!animar) return;
    t.set(withRepeat(withTiming(1, { duration: 6000, easing: Easing.inOut(Easing.sin) }), -1, true));
  }, [animar, t]);
  const estilo = useAnimatedStyle(() => ({ transform: [{ translateX: -t.value * tam.w * 1.2 }, { translateY: -t.value * tam.h * 0.4 }] }));
  const lista = colores.length >= 2 ? colores : [colores[0], colores[0]];
  return (
    <View style={StyleSheet.absoluteFill} onLayout={(e: LayoutChangeEvent) => setTam({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })}>
      {tam.w > 0 && (
        <Animated.View style={[{ position: "absolute", left: 0, top: 0, width: tam.w * 2.2, height: tam.h * 1.4 }, estilo]}>
          <LinearGradient colors={[...lista, ...lista.slice(1)] as [string, string, ...string[]]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
        </Animated.View>
      )}
    </View>
  );
}

export default function FondoPlaca({ fondo, url, acento = "#7C5CFF", animar = true, velo = true }: Props) {
  let capa: ReactNode;
  if (fondo === "personalizado" && url) {
    capa = <Image source={{ uri: url }} style={StyleSheet.absoluteFill} contentFit="cover" autoplay={animar} transition={200} />;
  } else {
    const colores = coloresFondo(fondo);
    capa = colores ? (
      <DegradeVivo colores={colores} animar={animar} />
    ) : (
      <LinearGradient colors={[conAlfa(acento, 0.32), "#141A33", "#080A14"]} start={{ x: 0.2, y: 0 }} end={{ x: 0.8, y: 1 }} style={StyleSheet.absoluteFill} />
    );
  }
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {capa}
      {velo && (
        <LinearGradient
          colors={["rgba(5,7,13,0)", "rgba(5,7,13,0.55)", "rgba(5,7,13,0.88)"]}
          locations={[0.18, 0.5, 1]}
          style={StyleSheet.absoluteFill}
        />
      )}
    </View>
  );
}
