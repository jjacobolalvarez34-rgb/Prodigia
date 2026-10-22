import { useEffect, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";
import { duracionRepeticion, estadoEnElInstante, segundosTexto, type RespuestaPartida } from "@/lib/partidas/estadisticas";
import { useAnimacionActiva } from "~/lib/rendimiento";
import { textosDe } from "~/lib/textosWeb";
import { color } from "~/tema";
import Boton3D from "./Boton3D";
import { IconoCerrar, IconoCheck } from "./Iconos";
import Texto from "./Texto";

const t = textosDe("Partidas.detalle");
const PASO_MS = 50;

export interface LadoRepeticion {
  nombre: string;
  respuestas: RespuestaPartida[];
  color: string;
}

// Repetición de la partida (igual que RepeticionPartida.tsx de la web): cada
// respuesta aparece en el momento en que se dio, con su tiempo real. En un duelo,
// los dos a la vez. Se pausa sola fuera de pantalla.
export function RepeticionPartida({ lados, acento }: { lados: LadoRepeticion[]; acento: string }) {
  const activa = useAnimacionActiva();
  const duracion = duracionRepeticion(...lados.map((l) => l.respuestas));
  const [ms, setMs] = useState(0);
  const [corriendo, setCorriendo] = useState(false);
  const ultimo = useRef(0);

  useEffect(() => {
    if (!corriendo || !activa) return;
    ultimo.current = Date.now();
    const id = setInterval(() => {
      const ahora = Date.now();
      const delta = ahora - ultimo.current;
      ultimo.current = ahora;
      setMs((m) => Math.min(duracion, m + delta));
    }, PASO_MS);
    return () => clearInterval(id);
  }, [corriendo, activa, duracion]);

  const terminado = duracion > 0 && ms >= duracion;
  if (terminado && corriendo) setCorriendo(false);

  function alternar() {
    if (terminado) setMs(0);
    setCorriendo((c) => !c);
  }

  return (
    <View style={{ gap: 12 }}>
      {lados.map((l) => {
        const e = estadoEnElInstante(l.respuestas, ms);
        return (
          <View key={l.nombre} style={{ gap: 6 }}>
            <View style={styles.entre}>
              <Texto v="fuerte" tam={13} numberOfLines={1} style={{ flex: 1 }}>
                {l.nombre}
              </Texto>
              <Texto v="mono" tam={13} c={color.texto2}>
                {e.correctas}/{l.respuestas.length}
              </Texto>
            </View>
            <View style={styles.fila}>
              {l.respuestas.map((r, i) => (
                <View key={i} style={[styles.punto, { backgroundColor: i < e.respondidas ? (r.correct ? l.color : color.error) : "rgba(255,255,255,0.08)" }]} />
              ))}
            </View>
          </View>
        );
      })}
      <View style={styles.pista}>
        <View style={{ width: `${duracion > 0 ? (ms / duracion) * 100 : 0}%`, height: "100%", borderRadius: 2, backgroundColor: acento }} />
      </View>
      <View style={styles.entre}>
        <Texto v="mono" tam={12} c={color.texto2}>
          {(ms / 1000).toFixed(1)} / {(duracion / 1000).toFixed(1)} s
        </Texto>
        <Boton3D
          titulo={corriendo ? t("pausar") : terminado ? t("otraVez") : ms > 0 ? t("seguir") : t("verRepeticion")}
          variante="secundario"
          acento={acento}
          tamano="sm"
          deshabilitado={duracion <= 0}
          onPress={alternar}
          estilo={{ minWidth: 150 }}
        />
      </View>
    </View>
  );
}

// La partida pregunta por pregunta: si acertaste y cuánto tardaste. En un duelo,
// el rival al lado.
export function PreguntaPorPregunta({ yo, rival, acento }: { yo: RespuestaPartida[]; rival?: RespuestaPartida[] | null; acento: string }) {
  const n = Math.max(yo.length, rival?.length ?? 0);
  const max = Math.max(1, ...yo.map((r) => r.timeMs), ...(rival ?? []).map((r) => r.timeMs));
  const celda = (r: RespuestaPartida | undefined) =>
    r ? (
      <View style={[styles.fila, { flex: 1, gap: 6 }]}>
        <View style={[styles.marca, { backgroundColor: r.correct ? "rgba(61,220,151,0.15)" : "rgba(255,93,93,0.15)" }]}>
          {r.correct ? <IconoCheck tam={12} c={color.correcto} /> : <IconoCerrar tam={12} c={color.error} />}
        </View>
        <View style={styles.barraFondo}>
          <View style={{ width: `${Math.max(6, (r.timeMs / max) * 100)}%`, height: "100%", borderRadius: 3, backgroundColor: r.correct ? acento : color.error }} />
        </View>
        <Texto v="mono" tam={11} c={color.texto2} style={{ width: 44, textAlign: "right" }}>
          {segundosTexto(r.timeMs)}
        </Texto>
      </View>
    ) : (
      <View style={{ flex: 1 }} />
    );
  return (
    <View style={{ gap: 6 }}>
      {Array.from({ length: n }, (_, i) => (
        <View key={i} style={[styles.fila, { gap: 10 }]}>
          <Texto v="mono" tam={11} c={color.texto2} style={{ width: 18 }}>
            {i + 1}
          </Texto>
          {celda(yo[i])}
          {rival && celda(rival[i])}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  fila: { flexDirection: "row", alignItems: "center", gap: 4 },
  entre: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 },
  punto: { flex: 1, height: 10, borderRadius: 5 },
  pista: { height: 4, borderRadius: 2, backgroundColor: "rgba(255,255,255,0.06)", overflow: "hidden" },
  marca: { width: 20, height: 20, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  barraFondo: { flex: 1, height: 6, borderRadius: 3, backgroundColor: "rgba(255,255,255,0.06)", overflow: "hidden" },
});
