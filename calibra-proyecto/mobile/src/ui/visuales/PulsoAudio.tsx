import { createAudioPlayer, type AudioPlayer } from "expo-audio";
import { useEffect, useRef, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { vibrar } from "~/lib/efectos";
import { color, conAlfa } from "~/tema";
import Texto from "../Texto";

const FUERTE = require("../../../assets/sonidos/pulso_fuerte.wav");
const DEBIL = require("../../../assets/sonidos/pulso.wav");

// Modo Tempo de Melodía (mismo metrónomo que BotonPulso de la web): suenan
// `pulsos` clics a `bpm`, el tiempo fuerte (más agudo) cada `acentoCada`, y los
// puntos se encienden con cada clic. Como el oído absoluto, suena aunque los
// efectos estén apagados: es la pregunta. Cada clic se agenda contra el reloj
// desde el inicio (no un intervalo fijo), así el temblor de los timers no se acumula.
export default function PulsoAudio({ bpm, pulsos, acentoCada, acento }: { bpm: number; pulsos: number; acentoCada: number; acento: string }) {
  const [actual, setActual] = useState(-1);
  const fuerte = useRef<AudioPlayer | null>(null);
  const debil = useRef<AudioPlayer | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function clic(p: AudioPlayer | null) {
    if (!p) return;
    p.pause();
    p.seekTo(0).then(() => p.play()).catch(() => p.play());
  }

  function sonar() {
    if (timer.current) clearTimeout(timer.current);
    if (!fuerte.current) fuerte.current = createAudioPlayer(FUERTE);
    if (!debil.current) debil.current = createAudioPlayer(DEBIL);
    const ms = 60000 / bpm;
    const inicio = Date.now();
    const paso = (i: number) => {
      if (i >= pulsos) {
        setActual(-1);
        return;
      }
      clic(i % acentoCada === 0 ? fuerte.current : debil.current);
      setActual(i);
      timer.current = setTimeout(() => paso(i + 1), Math.max(0, inicio + (i + 1) * ms - Date.now()));
    };
    paso(0);
  }

  useEffect(() => {
    const t = setTimeout(sonar, 300);
    return () => {
      clearTimeout(t);
      if (timer.current) clearTimeout(timer.current);
      fuerte.current?.remove();
      debil.current?.remove();
      fuerte.current = null;
      debil.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bpm, pulsos, acentoCada]);

  return (
    <View style={styles.caja}>
      <Pressable
        onPress={() => {
          vibrar.ligero();
          sonar();
        }}
        style={[styles.boton, { backgroundColor: conAlfa(acento, actual >= 0 && actual % acentoCada === 0 ? 0.45 : 0.25), borderColor: acento }]}
        accessibilityLabel="Escuchar el pulso otra vez"
      >
        <Texto style={{ fontSize: 34, color: color.texto }}>🥁</Texto>
      </Pressable>
      <View style={styles.puntos}>
        {Array.from({ length: acentoCada }, (_, i) => {
          const tam = i === 0 ? 14 : 10;
          return <View key={i} style={{ width: tam, height: tam, borderRadius: tam / 2, backgroundColor: acento, opacity: actual >= 0 && actual % acentoCada === i ? 1 : 0.2 }} />;
        })}
      </View>
      <Texto v="nota" tam={12}>
        Toca para escuchar el pulso otra vez
      </Texto>
    </View>
  );
}

const styles = StyleSheet.create({
  caja: { alignItems: "center", gap: 8, paddingVertical: 6 },
  boton: { width: 84, height: 84, borderRadius: 42, borderWidth: 2, alignItems: "center", justifyContent: "center" },
  puntos: { flexDirection: "row", alignItems: "center", gap: 6 },
});
