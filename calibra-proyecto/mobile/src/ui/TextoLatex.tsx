import { memo } from "react";
import { StyleSheet, View, type StyleProp, type TextStyle } from "react-native";
import { SvgXml } from "react-native-svg";
import { latexASvg, trozosLatex } from "~/lib/latex";
import { color } from "~/tema";
import Texto, { type Variante } from "./Texto";
import { latexAUnicode } from "./TextoMate";

// Texto con fórmulas dibujadas en LaTeX de verdad (MathJax → SVG), como el
// MathText de la web. Sin `$` es un Texto común. Las palabras y las fórmulas van en
// una fila que se parte sola, así un enunciado largo baja de renglón normalmente.
// Si una fórmula no se puede dibujar, se muestra traducida a Unicode (TextoMate).
function TextoLatex({ texto, v = "cuerpo", c, centro, estilo, escala = 1.08 }: { texto: string; v?: Variante; c?: string; centro?: boolean; estilo?: StyleProp<TextStyle>; escala?: number }) {
  if (!texto.includes("$")) {
    return (
      <Texto v={v} c={c} centro={centro} style={estilo}>
        {texto}
      </Texto>
    );
  }
  // Tamaño y color reales del texto (variante + estilo), para la fórmula.
  const plano = StyleSheet.flatten([VARIANTE[v], c ? { color: c } : null, estilo]) as TextStyle;
  const tam = plano.fontSize ?? 15;
  const colorTexto = (plano.color as string | undefined) ?? (v === "nota" || v === "micro" ? color.texto2 : color.texto);
  const alinear = centro || plano.textAlign === "center" ? "center" : plano.textAlign === "right" ? "flex-end" : "flex-start";
  const sinAlinear = [estilo, { textAlign: undefined }] as StyleProp<TextStyle>;

  const piezas: React.ReactNode[] = [];
  trozosLatex(texto).forEach((t, i) => {
    if (t.tipo === "texto") {
      // Cada palabra (con su espacio) por separado, para que la fila se pueda partir.
      (t.s.match(/\S+\s*|\s+/g) ?? []).forEach((p, j) =>
        piezas.push(
          <Texto key={`${i}-${j}`} v={v} c={c} style={sinAlinear}>
            {p}
          </Texto>
        )
      );
      return;
    }
    const f = latexASvg(t.tex, t.display);
    if (!f) {
      piezas.push(
        <Texto key={i} v={v} c={c} style={sinAlinear}>
          {latexAUnicode(t.tex)}
        </Texto>
      );
      return;
    }
    const k = tam * escala;
    const svg = <SvgXml xml={f.xml} width={f.ancho * k} height={f.alto * k} color={colorTexto} />;
    piezas.push(
      t.display ? (
        <View key={i} style={{ width: "100%", alignItems: "center", marginVertical: 4 }}>
          {svg}
        </View>
      ) : (
        <View key={i} style={{ marginHorizontal: 1 }}>
          {svg}
        </View>
      )
    );
  });
  return (
    <View accessible accessibilityLabel={texto.replace(/\$/g, "")} style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center", justifyContent: alinear, rowGap: 2 }}>
      {piezas}
    </View>
  );
}

// Tamaños de cada variante (los mismos de Texto.tsx) para escalar la fórmula.
const VARIANTE: Record<Variante, TextStyle> = {
  display: { fontSize: 32 },
  h1: { fontSize: 26 },
  h2: { fontSize: 20 },
  h3: { fontSize: 16 },
  cuerpo: { fontSize: 15 },
  fuerte: { fontSize: 15 },
  nota: { fontSize: 13 },
  micro: { fontSize: 11 },
  mono: { fontSize: 15 },
  numero: { fontSize: 52 },
  contador: { fontSize: 14 },
};

export default memo(TextoLatex);
