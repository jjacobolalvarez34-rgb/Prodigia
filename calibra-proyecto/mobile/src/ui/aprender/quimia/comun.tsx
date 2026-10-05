import { useEffect, type ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { cancelAnimation, Easing, useSharedValue, withRepeat, withTiming, type SharedValue } from "react-native-reanimated";
import { latexAUnicode, textoConFormulas } from "../../TextoMate";
import Texto from "../../Texto";
import { FG, mezcla } from "../comun";

// Piezas comunes de los visuales de Quimia (components/quimia/visuales/comun.tsx).
export const COLOR_QUIMIA = "#C026D3";

// Recuadro con la explicación del paso (TextoDelPaso de la web).
export function TextoDelPaso({ children }: { children: ReactNode }) {
  return <View style={[styles.paso, { borderColor: mezcla(COLOR_QUIMIA, 35), backgroundColor: mezcla(COLOR_QUIMIA, 8) }]}>{children}</View>;
}

export function TextoPaso({ texto }: { texto: string }) {
  return (
    <TextoDelPaso>
      <Texto v="cuerpo" tam={13} centro>
        {textoConFormulas(texto)}
      </Texto>
    </TextoDelPaso>
  );
}

// Una fórmula LaTeX (sin $) respetando los \textcolor{c}{…} de la web: cada tramo
// coloreado se pinta de su color (en la web, los términos que cambian en el balanceo).
export function TexColor({ tex, tam = 15, c = FG, centro = true }: { tex: string; tam?: number; c?: string; centro?: boolean }) {
  const partes: { texto: string; color?: string }[] = [];
  let i = 0;
  let resto = "";
  while (i < tex.length) {
    if (tex.startsWith("\\textcolor{", i)) {
      const finColor = tex.indexOf("}", i);
      const color = tex.slice(i + 11, finColor);
      let nivel = 0;
      let j = finColor + 1;
      for (; j < tex.length; j++) {
        if (tex[j] === "{") nivel++;
        else if (tex[j] === "}") {
          nivel--;
          if (nivel === 0) break;
        }
      }
      if (resto) partes.push({ texto: resto });
      resto = "";
      partes.push({ texto: tex.slice(finColor + 2, j), color });
      i = j + 1;
    } else {
      resto += tex[i++];
    }
  }
  if (resto) partes.push({ texto: resto });
  return (
    <Texto v="fuerte" tam={tam} c={c} centro={centro}>
      {partes.map((p, k) => {
        const txt = latexAUnicode(p.texto);
        const espacio = k > 0 && /^\s/.test(p.texto) ? " " : "";
        const fin = /\s$/.test(p.texto) ? " " : "";
        return p.color ? (
          <Texto key={k} v="fuerte" tam={tam} c={p.color}>
            {espacio + txt + fin}
          </Texto>
        ) : (
          espacio + txt + fin
        );
      })}
    </Texto>
  );
}

// Un valor que va de 0 a 1 una y otra vez (los electrones que viajan por el cable).
export function useBucle(ms: number, activo: boolean): SharedValue<number> {
  const v = useSharedValue(0);
  useEffect(() => {
    if (!activo) {
      cancelAnimation(v);
      v.set(0);
      return;
    }
    v.set(0);
    v.set(withRepeat(withTiming(1, { duration: ms, easing: Easing.linear }), -1, false));
    return () => cancelAnimation(v);
  }, [ms, activo, v]);
  return v;
}

const styles = StyleSheet.create({
  paso: { alignSelf: "stretch", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, borderWidth: 1 },
});
