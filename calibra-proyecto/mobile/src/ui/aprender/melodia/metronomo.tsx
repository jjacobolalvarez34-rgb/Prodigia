import { createAudioPlayer, type AudioPlayer } from "expo-audio";
import { useEffect, useRef, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import type { VisualMelodiaMetronomo } from "@/lib/melodia/visuales";
import { formatoSegundos, resolverMetronomo, type Acento, type FilaMetronomo } from "@/lib/melodia/visualesDatos";
import { useAnimacionActiva } from "~/lib/rendimiento";
import { textosDe } from "~/lib/textosWeb";
import { Aparece, BORDE, Marco, mezcla, SECUNDARIO, SUPERFICIE } from "../comun";
import Texto from "../../Texto";
import { useReproductor } from "../reproductor";

// melodia.metronomo (components/melodia/visuales/Metronomo.tsx de la web): cada
// tempo en su fila, con una luz por tiempo del compás que late a ese BPM (la
// grande es el tiempo fuerte). "Escuchar" toca el mismo clic que el modo Tempo.
const COLOR_MELODIA = "#B8860B";
const ACENTO = "#F2C14E";
const FUERTE = require("../../../../assets/sonidos/pulso_fuerte.wav");
const DEBIL = require("../../../../assets/sonidos/pulso.wav");
const TAM: Record<Acento, number> = { fuerte: 18, medio: 14, debil: 11 };

function useLatido(bpm: number, activo: boolean): number {
  const [n, setN] = useState(-1);
  useEffect(() => {
    if (!activo) return;
    const ms = 60000 / bpm;
    const inicio = Date.now();
    let id: ReturnType<typeof setTimeout>;
    const tic = () => {
      const k = Math.floor((Date.now() - inicio) / ms);
      setN(k);
      id = setTimeout(tic, Math.max(0, inicio + (k + 1) * ms - Date.now()));
    };
    id = setTimeout(tic, 0);
    return () => clearTimeout(id);
  }, [bpm, activo]);
  return activo ? n : -1;
}

function Fila({ fila, acentos, visible, actual, animar, escuchar }: { fila: FilaMetronomo; acentos: Acento[]; visible: boolean; actual: boolean; animar: boolean; escuchar: boolean }) {
  const t = textosDe("Melodia.visuales.metronomo");
  const latido = useLatido(fila.bpm, visible && animar);
  const tiempo = latido >= 0 ? latido % acentos.length : -1;
  const fuerte = useRef<AudioPlayer | null>(null);
  const debil = useRef<AudioPlayer | null>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(
    () => () => {
      timers.current.forEach(clearTimeout);
      fuerte.current?.remove();
      debil.current?.remove();
    },
    []
  );

  function sonar() {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    if (!fuerte.current) fuerte.current = createAudioPlayer(FUERTE);
    if (!debil.current) debil.current = createAudioPlayer(DEBIL);
    const ms = 60000 / fila.bpm;
    for (let i = 0; i < acentos.length * 2; i++) {
      timers.current.push(
        setTimeout(() => {
          const p = i % acentos.length === 0 ? fuerte.current : debil.current;
          if (!p) return;
          p.pause();
          p.seekTo(0).then(() => p.play()).catch(() => p.play());
        }, i * ms)
      );
    }
  }

  return (
    <Aparece visible opacidad={visible ? 1 : 0.2} ms={300} estilo={[styles.fila, { borderColor: visible ? COLOR_MELODIA : BORDE, backgroundColor: actual ? mezcla(COLOR_MELODIA, 14) : SUPERFICIE }]}>
      <View style={styles.cabecera}>
        <Texto v="fuerte" tam={16}>
          {fila.bpm} BPM
        </Texto>
        {fila.termino ? (
          <Texto v="fuerte" tam={12} c={ACENTO} style={{ fontStyle: "italic" }}>
            {fila.termino}
          </Texto>
        ) : null}
      </View>
      <View style={styles.luces}>
        {acentos.map((a, i) => (
          <View
            key={i}
            style={{
              width: TAM[a],
              height: TAM[a],
              borderRadius: TAM[a] / 2,
              backgroundColor: ACENTO,
              opacity: tiempo === i ? 1 : 0.22,
              transform: [{ scale: tiempo === i ? 1.15 : 1 }],
              marginLeft: a === "medio" && i > 0 ? 6 : 0,
            }}
          />
        ))}
      </View>
      <View style={styles.cabecera}>
        <Texto v="nota" tam={12} c={SECUNDARIO}>
          {t("cadaPulso", { segundos: formatoSegundos(fila.segundos, "es") })}
        </Texto>
        {escuchar && (
          <Pressable onPress={sonar} style={styles.escuchar} accessibilityRole="button">
            <Texto v="fuerte" tam={12} c={ACENTO}>
              {t("escuchar")}
            </Texto>
          </Pressable>
        )}
      </View>
    </Aparece>
  );
}

export function Metronomo({ visual }: { visual: VisualMelodiaMetronomo }) {
  const t = textosDe("Melodia.visuales.metronomo");
  const activa = useAnimacionActiva();
  const datos = resolverMetronomo(visual);
  const total = datos?.filas.length ?? 0;
  const r = useReproductor({ total, ms: 2600, estatico: visual.estatico, inicio: total > 0 ? 1 : 0 });
  if (!datos) return null;
  return (
    <Marco acento={COLOR_MELODIA} titulo={visual.titulo} r={r}>
      <View style={{ gap: 6 }}>
        {datos.filas.map((f, i) => (
          <Fila key={i} fila={f} acentos={datos.acentos} visible={i < r.paso} actual={i === r.paso - 1} animar={activa && !visual.estatico} escuchar={Boolean(visual.escuchar)} />
        ))}
      </View>
      <Texto v="nota" tam={11} centro>
        {t("nota", { compas: datos.compas })}
      </Texto>
    </Marco>
  );
}

const styles = StyleSheet.create({
  fila: { gap: 8, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, borderWidth: 2 },
  cabecera: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  luces: { flexDirection: "row", alignItems: "center", gap: 8, height: 22 },
  escuchar: { minHeight: 34, paddingHorizontal: 10, borderRadius: 8, borderWidth: 1, borderColor: ACENTO, justifyContent: "center" },
});
