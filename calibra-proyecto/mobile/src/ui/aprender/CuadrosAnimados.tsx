import { StyleSheet, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import type { CuadroLeccion, VisualCuadros } from "@/lib/aprender/visuales";
import { color, conAlfa } from "~/tema";
import Texto from "../Texto";
import { textoConFormulas } from "../TextoMate";
import { MarcoVisual, useReproductor } from "./reproductor";

// Visual genérico "cuadros" (CuadrosAnimados.tsx de la web): la explicación aparece
// en tarjetas de a una; la última queda resaltada.
const MS_POR_CUADRO = 2400;

function cuadroValido(c: unknown): c is CuadroLeccion {
  if (typeof c !== "object" || c === null) return false;
  const o = c as Record<string, unknown>;
  if ([o.texto, o.formula, o.resaltar].some((v) => v !== undefined && typeof v !== "string")) return false;
  return typeof o.texto === "string" || typeof o.formula === "string";
}

export default function CuadrosAnimados({ visual }: { visual: VisualCuadros }) {
  const cuadros = Array.isArray(visual.cuadros) ? visual.cuadros.filter(cuadroValido) : [];
  const r = useReproductor({
    total: cuadros.length,
    ms: typeof visual.msPorCuadro === "number" && visual.msPorCuadro > 200 ? visual.msPorCuadro : MS_POR_CUADRO,
    estatico: visual.estatico,
    autoplay: visual.autoplay ?? true,
    inicio: 1,
  });
  if (cuadros.length === 0) return null;
  return (
    <MarcoVisual titulo={visual.titulo ? textoConFormulas(visual.titulo) : undefined} r={r}>
      <View style={{ gap: 8 }}>
        {cuadros.slice(0, r.paso).map((c, i) => {
          const actual = i === r.paso - 1;
          return (
            <Animated.View key={i} entering={FadeInDown.duration(320)} style={[styles.cuadro, actual && { borderColor: conAlfa(color.logro, 0.5), backgroundColor: conAlfa(color.logro, 0.1) }]}>
              <Texto v="micro">{i + 1}</Texto>
              {c.texto ? <Texto v="cuerpo">{textoConFormulas(c.texto)}</Texto> : null}
              {c.formula ? (
                <Texto v="h3" centro>
                  {textoConFormulas(`$${c.formula.replace(/\$/g, "")}$`)}
                </Texto>
              ) : null}
              {c.resaltar ? (
                <View style={styles.resalte}>
                  <Texto v="fuerte">{textoConFormulas(c.resaltar)}</Texto>
                </View>
              ) : null}
            </Animated.View>
          );
        })}
      </View>
    </MarcoVisual>
  );
}

const styles = StyleSheet.create({
  cuadro: { gap: 5, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 14, borderWidth: 1, borderColor: color.border, backgroundColor: color.bg },
  resalte: { alignSelf: "flex-start", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, backgroundColor: conAlfa(color.logro, 0.2) },
});
