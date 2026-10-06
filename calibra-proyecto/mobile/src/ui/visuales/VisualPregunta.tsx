import { ScrollView, StyleSheet, View } from "react-native";
import type { Visual } from "~/lib/mundosJugables/tipos";
import { color, fuente } from "~/tema";
import Pentagrama, { FiguraRitmicaIcono } from "../Pentagrama";
import Texto from "../Texto";
import Carta from "./Carta";
import Circuito from "./Circuito";
import GraficoEstadistica from "./GraficoEstadistica";
import Molecula from "./Molecula";
import NotaAudio from "./NotaAudio";
import PulsoAudio from "./PulsoAudio";
import Triangulo from "./Triangulo";

// Lo que se dibuja arriba del enunciado en el sprint genérico, según el mundo:
// pentagrama, figura rítmica, nota para escuchar, molécula, triángulo, circuito,
// gráfico, código o cartas. Todo con react-native-svg, sin imágenes.
export default function VisualPregunta({ visual, acento }: { visual: Visual; acento: string }) {
  switch (visual.tipo) {
    case "pentagrama":
      return <Pentagrama notas={visual.notas} disposicion={visual.disposicion} acento={acento} />;
    case "figura":
      return <FiguraRitmicaIcono figura={visual.figura} acento={acento} />;
    case "nota-audio":
      return <NotaAudio frecuencia={visual.frecuencia} acorde={visual.acorde} acento={acento} />;
    case "pulso":
      return <PulsoAudio bpm={visual.bpm} pulsos={visual.pulsos} acentoCada={visual.acentoCada} acento={acento} />;
    case "molecula":
      return <Molecula id={visual.id} acento={acento} />;
    case "triangulo":
      return <Triangulo t={visual.triangulo} acento={acento} />;
    case "circuito":
      return <Circuito topologia={visual.topologia} vFuente={visual.vFuente} resaltarId={visual.resaltarId} acento={acento} />;
    case "grafico":
      return <GraficoEstadistica grafico={visual.grafico} acento={acento} />;
    case "codigo":
      return (
        <View style={styles.codigo}>
          <Texto style={styles.lenguaje}>{visual.lenguaje}</Texto>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <Texto style={styles.textoCodigo}>{visual.codigo}</Texto>
          </ScrollView>
        </View>
      );
    case "tabla":
      return (
        <View style={styles.tabla}>
          <Texto v="micro" style={{ marginBottom: 4 }}>
            {visual.titulo}
          </Texto>
          <View style={styles.filasTabla}>
            {visual.filas.map((f) => (
              <View key={f.etiqueta} style={styles.celda}>
                <Texto style={styles.celdaEtiqueta}>{f.etiqueta}</Texto>
                <Texto style={[styles.celdaValor, { color: acento }]}>{f.valor}</Texto>
              </View>
            ))}
          </View>
        </View>
      );
    case "cartas":
      return (
        <View style={styles.cartas}>
          {visual.cartas.map((c, i) => (
            <Carta key={i} valor={c.valor} palo={c.palo} tam={visual.cartas.length > 6 ? 40 : 54} />
          ))}
        </View>
      );
  }
}

const styles = StyleSheet.create({
  codigo: { alignSelf: "stretch", backgroundColor: "#0A0E1A", borderRadius: 12, borderWidth: 1, borderColor: color.border, padding: 12, gap: 6 },
  lenguaje: { fontFamily: fuente.cuerpoBold, fontSize: 10, letterSpacing: 1, color: color.texto2, textTransform: "uppercase" },
  textoCodigo: { fontFamily: fuente.monoMedio, fontSize: 14, lineHeight: 21, color: "#D7E3FF" },
  cartas: { flexDirection: "row", flexWrap: "wrap", gap: 6, justifyContent: "center" },
  tabla: { alignSelf: "stretch", alignItems: "center" },
  filasTabla: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 6 },
  celda: { alignItems: "center", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, backgroundColor: color.surface2, borderWidth: 1, borderColor: color.border },
  celdaEtiqueta: { fontFamily: fuente.cuerpoFuerte, fontSize: 12, color: color.texto2 },
  celdaValor: { fontFamily: fuente.mono, fontSize: 16 },
});
