import { createAudioPlayer, type AudioPlayer } from "expo-audio";
import { useEffect, useRef } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import Animated, { cancelAnimation, Easing, useAnimatedStyle, useSharedValue, withSequence, withTiming } from "react-native-reanimated";
import { vibrar } from "~/lib/efectos";
import { color, conAlfa } from "~/tema";
import Texto from "../Texto";
import { NOTAS } from "./notas";

// Oído absoluto (Melodía): suena la nota (mismo timbre que reproducirNotaMusical de
// la web) apenas aparece la pregunta, y se puede volver a escuchar las veces que
// haga falta. Suena aunque el sonido de efectos esté apagado: es la pregunta.
export default function NotaAudio({ frecuencia, acorde, acento }: { frecuencia: number; acorde?: number[]; acento: string }) {
  // Oído de acordes: un reproductor por nota, todos a la vez.
  const semitonos = (acorde && acorde.length > 0 ? acorde : [frecuencia]).map((f) => Math.round(57 + 12 * Math.log2(f / 440)));
  const claveSonido = semitonos.join(",");
  const reproductores = useRef<AudioPlayer[]>([]);
  const onda = useSharedValue(0);

  function sonar() {
    if (reproductores.current.length === 0) {
      reproductores.current = semitonos.flatMap((st) => (NOTAS[st] ? [createAudioPlayer(NOTAS[st])] : []));
    }
    for (const p of reproductores.current) {
      p.volume = semitonos.length > 1 ? 0.55 : 0.9;
      p.pause();
      p.seekTo(0).then(() => p.play()).catch(() => p.play());
    }
    onda.set(withSequence(withTiming(0, { duration: 0 }), withTiming(1, { duration: 1100, easing: Easing.out(Easing.quad) })));
  }

  useEffect(() => {
    const t = setTimeout(sonar, 250);
    return () => {
      clearTimeout(t);
      for (const p of reproductores.current) p.remove();
      reproductores.current = [];
      cancelAnimation(onda);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [claveSonido]);

  const estiloOnda = useAnimatedStyle(() => ({ opacity: 0.6 * (1 - onda.value), transform: [{ scale: 1 + onda.value * 0.9 }] }));
  return (
    <View style={styles.caja}>
      <Animated.View style={[styles.onda, { borderColor: acento }, estiloOnda]} />
      <Pressable
        onPress={() => {
          vibrar.ligero();
          sonar();
        }}
        style={[styles.boton, { backgroundColor: conAlfa(acento, 0.25), borderColor: acento }]}
        accessibilityLabel={semitonos.length > 1 ? "Escuchar el acorde otra vez" : "Escuchar la nota otra vez"}
      >
        <Texto style={{ fontSize: 34, color: color.texto }}>♪</Texto>
      </Pressable>
      <Texto v="nota" tam={12}>
        Toca para escuchar otra vez
      </Texto>
    </View>
  );
}

const styles = StyleSheet.create({
  caja: { alignItems: "center", gap: 8, paddingVertical: 6 },
  onda: { position: "absolute", top: 6, width: 84, height: 84, borderRadius: 42, borderWidth: 2 },
  boton: { width: 84, height: 84, borderRadius: 42, borderWidth: 2, alignItems: "center", justifyContent: "center" },
});
