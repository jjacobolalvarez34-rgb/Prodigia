import { Pressable, StyleSheet, View } from "react-native";
import Animated, { FadeInDown, FadeInRight, type SharedValue } from "react-native-reanimated";
import type { PreguntaRetoDiario } from "@/lib/retoDiario";
import { vibrar } from "~/lib/efectos";
import Pentagrama, { FiguraRitmicaIcono } from "~/ui/Pentagrama";
import { TarjetaProblema } from "~/ui/Sprint";
import Texto from "~/ui/Texto";
import TextoLatex from "~/ui/TextoLatex";
import { brillo, color, conAlfa, fuente, MUNDO_POR_SLUG, type MundoSlug } from "~/tema";

const CON_FORMULAS = new Set(["calculia", "circuitia", "estadistica", "trigonometria"]);

// Una pregunta de reto (enunciado con sus visuales y las opciones). La usan el
// reto diario/semanal (reto/[tipo]) y el de fin de semana (reto-finde).
export default function PreguntaReto({
  pregunta: p,
  indice,
  elegida,
  combo,
  sello,
  sacudida,
  onResponder: responder,
}: {
  pregunta: PreguntaRetoDiario;
  indice: number;
  elegida: string | null;
  combo: number;
  sello: SharedValue<number>;
  sacudida: SharedValue<number>;
  onResponder: (op: string) => void;
}) {
  const m = MUNDO_POR_SLUG[p.mundo as MundoSlug];
  const formulas = CON_FORMULAS.has(p.mundo);
  const esCodigo = p.mundo === "codia";
  return (
    <>
    <Animated.View key={indice} entering={FadeInRight.duration(300)}>
      <TarjetaProblema acento={m?.neon ?? color.logro} combo={combo} feedback={!elegida ? "idle" : elegida === p.respuesta ? "correcto" : "incorrecto"} sello={sello} sacudida={sacudida}>
        <Texto v="micro" c={m?.neon}>
          {m?.nombre ?? p.mundo}
        </Texto>
        {p.notasMelodia && <Pentagrama notas={p.notasMelodia} disposicion={p.disposicionMelodia} acento={m?.neon} />}
        {p.figuraMelodia && <FiguraRitmicaIcono figura={p.figuraMelodia} acento={m?.neon} />}
        {formulas ? (
          <TextoLatex texto={p.enunciado} centro estilo={{ fontFamily: fuente.display, fontSize: 20, lineHeight: 26, color: color.texto }} />
        ) : (
          <Texto style={{ fontFamily: esCodigo ? fuente.monoMedio : fuente.display, fontSize: esCodigo ? 15 : 20, lineHeight: esCodigo ? 21 : 26, color: color.texto, textAlign: esCodigo ? "left" : "center", alignSelf: "stretch" }}>
            {p.enunciado}
          </Texto>
        )}
      </TarjetaProblema>
    </Animated.View>
    <View style={{ gap: 10 }}>
      {p.opciones.map((op, i) => {
        const correcta = !!elegida && op === p.respuesta;
        const mala = elegida === op && op !== p.respuesta;
        return (
          <Animated.View key={`${indice}-${op}`} entering={FadeInDown.delay(80 + i * 60).duration(300)}>
            <Pressable
              disabled={!!elegida}
              onPress={() => {
                vibrar.seleccion();
                responder(op);
              }}
              style={({ pressed }) => [
                styles.opcion,
                pressed && { transform: [{ scale: 0.97 }] },
                correcta && { borderColor: color.correcto, backgroundColor: conAlfa(color.correcto, 0.15), boxShadow: brillo(color.correcto, 16, 0.35) },
                mala && { borderColor: color.error, backgroundColor: conAlfa(color.error, 0.15) },
              ]}
            >
              {formulas ? (
                <TextoLatex texto={op} centro estilo={{ fontFamily: fuente.cuerpoFuerte, fontSize: 15, color: color.texto }} />
              ) : (
                <Texto style={{ fontFamily: esCodigo ? fuente.monoMedio : fuente.cuerpoFuerte, fontSize: 15, color: color.texto, textAlign: "center" }}>
                  {op}
                </Texto>
              )}
            </Pressable>
          </Animated.View>
        );
      })}
    </View>
    </>
  );
}

const styles = StyleSheet.create({
  opcion: { borderWidth: 2, borderColor: color.border, backgroundColor: color.surface1, borderRadius: 16, paddingVertical: 15, paddingHorizontal: 14 },
});
