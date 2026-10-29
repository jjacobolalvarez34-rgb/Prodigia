import { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import Animated, { FadeIn, FadeInDown, LinearTransition } from "react-native-reanimated";
import { cuantasBien, estadoPregunta, quizListoParaEnviar } from "@/lib/aprender/calificarQuiz";
import { sonar, vibrar } from "~/lib/efectos";
import Boton3D from "~/ui/Boton3D";
import Texto from "~/ui/Texto";
import TextoLatex from "~/ui/TextoLatex";
import { color, conAlfa } from "~/tema";

interface Pregunta {
  pregunta: string;
  opciones: string[];
  respuesta: string;
  explicacion?: string;
}

interface Props {
  quiz: Pregunta[];
  acento: string; // neon del mundo
  base: string; // color del botón
  // Preguntas que la base rechazó (contenido desfasado, raro): se reabren.
  incorrectasServidor: number[] | null;
  onTerminar: (respuestas: string[]) => void;
}

// Quiz de una lección con calificación al momento (la web usa
// components/aprender/QuizLeccion.tsx; docs/avance/CLASES_CALIFICACION.md):
// cada pregunta dice enseguida si está bien o mal, con la explicación; las mal
// respondidas se corrigen (la opción errada queda tachada) y se envía con todas
// bien. La base vuelve a validar todo en completar_leccion.
export default function QuizLeccion({ quiz, acento, base, incorrectasServidor, onTerminar }: Props) {
  const [respuestas, setRespuestas] = useState<string[]>(() => quiz.map(() => ""));
  const [descartadas, setDescartadas] = useState<string[][]>(() => quiz.map(() => []));
  const [rechazadas, setRechazadas] = useState<number[]>([]);
  const [rechazoVisto, setRechazoVisto] = useState(incorrectasServidor);
  if (incorrectasServidor !== rechazoVisto) {
    setRechazoVisto(incorrectasServidor);
    if (incorrectasServidor && incorrectasServidor.length > 0) {
      setRechazadas(incorrectasServidor);
      setRespuestas((prev) => prev.map((r, i) => (incorrectasServidor.includes(i) ? "" : r)));
    }
  }

  const bien = cuantasBien(quiz, respuestas);
  const listo = quizListoParaEnviar(quiz, respuestas) && rechazadas.every((i) => respuestas[i]);

  function elegir(qi: number, op: string) {
    if (estadoPregunta(quiz[qi], respuestas[qi]) === "bien") return;
    const nuevo = estadoPregunta(quiz[qi], op);
    setRespuestas((prev) => prev.map((v, i) => (i === qi ? op : v)));
    setRechazadas((prev) => prev.filter((i) => i !== qi));
    if (nuevo === "mal") {
      setDescartadas((prev) => prev.map((d, i) => (i === qi && !d.includes(op) ? [...d, op] : d)));
      sonar("error");
      vibrar.error();
    } else {
      sonar("acierto0");
      vibrar.seleccion();
    }
  }

  return (
    <View style={{ gap: 16 }}>
      <View style={{ gap: 6 }}>
        <Texto v="h2">Quiz</Texto>
        <Texto v="nota">Cada respuesta se corrige al momento. Termina cuando todas estén bien.</Texto>
        <View style={styles.fila}>
          <View style={styles.pista}>
            <Animated.View layout={LinearTransition.duration(300)} style={[styles.relleno, { backgroundColor: acento, width: `${quiz.length ? (bien / quiz.length) * 100 : 0}%` }]} />
          </View>
          <Texto v="micro" c={color.texto2}>
            {bien} de {quiz.length} bien
          </Texto>
        </View>
      </View>

      {quiz.map((q, qi) => {
        const estado = estadoPregunta(q, respuestas[qi]);
        const rechazada = rechazadas.includes(qi);
        const cerrada = estado === "bien";
        const borde = estado === "bien" ? color.correcto : estado === "mal" || rechazada ? color.error : color.border;
        return (
          <Animated.View key={qi} entering={FadeInDown.delay(qi * 80).duration(300)} style={[styles.pregunta, { borderColor: borde }]}>
            <TextoLatex v="fuerte" texto={`${qi + 1}. ${q.pregunta}`} />
            {q.opciones.map((op) => {
              const elegida = respuestas[qi] === op;
              const descartada = !elegida && (descartadas[qi]?.includes(op) ?? false);
              const tono = elegida && estado === "bien" ? color.correcto : elegida && estado === "mal" ? color.error : elegida ? acento : null;
              return (
                <Pressable
                  key={op}
                  disabled={cerrada}
                  onPress={() => elegir(qi, op)}
                  style={({ pressed }) => [
                    styles.opcion,
                    tono && { borderColor: tono, backgroundColor: conAlfa(tono, 0.14) },
                    (descartada || (cerrada && !elegida)) && { opacity: 0.45 },
                    pressed && { transform: [{ scale: 0.98 }] },
                  ]}
                >
                  <View style={{ flex: 1 }}>
                    <TextoLatex v="cuerpo" texto={op} />
                  </View>
                  {elegida && estado === "bien" ? <Texto v="fuerte" c={color.correcto}>✓</Texto> : null}
                  {elegida && estado === "mal" ? <Texto v="fuerte" c={color.error}>✕</Texto> : null}
                </Pressable>
              );
            })}
            {(estado === "bien" || estado === "mal" || rechazada) && (
              <Animated.View key={`${estado}${rechazada}`} entering={FadeIn.duration(220)}>
                <TextoLatex
                  v="nota"
                  c={estado === "bien" ? color.correcto : color.error}
                  texto={`${estado === "bien" ? "¡Correcto!" : estado === "mal" ? "No es esa. Prueba otra." : "Revisa esta de nuevo."}${
                    q.explicacion && estado !== "sin-responder" ? ` ${q.explicacion}` : ""
                  }`}
                />
              </Animated.View>
            )}
          </Animated.View>
        );
      })}

      <Boton3D
        titulo={listo ? "Terminar lección" : quiz.length - bien === 1 ? "Falta 1 pregunta" : `Faltan ${quiz.length - bien} preguntas`}
        acento={base}
        brillo={listo}
        deshabilitado={!listo}
        onPress={() => onTerminar(respuestas)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  fila: { flexDirection: "row", alignItems: "center", gap: 10 },
  pista: { flex: 1, height: 6, borderRadius: 3, overflow: "hidden", backgroundColor: color.surface3 },
  relleno: { height: 6, borderRadius: 3 },
  pregunta: { gap: 8, padding: 14, borderRadius: 18, borderWidth: 1, backgroundColor: color.surface1 },
  opcion: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 14, paddingVertical: 12, borderRadius: 14, borderWidth: 2, borderColor: color.border, backgroundColor: color.bg },
});
