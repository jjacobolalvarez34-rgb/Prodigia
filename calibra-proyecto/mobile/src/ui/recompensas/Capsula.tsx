import { BlurMask, Canvas, Circle, Group, Oval, RadialGradient, Skia, useClock, vec } from "@shopify/react-native-skia";
import { useDerivedValue, useSharedValue, type SharedValue } from "react-native-reanimated";
import { CuerpoCapsula, rgba } from "../fx/capas";

// La cápsula de Chispas en chico (lista de Recompensas): las mismas dos mitades con
// volumen de fx/capas, flotando con un reflejo que la cruza cada tanto. Los colores
// cambian según el tipo de cápsula (diaria, de racha, de ciudad, de liga…).
export default function Capsula({ abierta, colores = ["#7C5CFF", "#FFC53D"], tam = 110 }: { abierta: SharedValue<number>; colores?: [string, string]; tam?: number }) {
  const alto = (tam * 150) / 110;
  const reloj = useClock();
  const ranura = useSharedValue(0);
  const transform = useDerivedValue(() => [{ translateX: tam / 2 }, { translateY: alto * 0.47 + Math.sin((reloj.value / 1000) * 2.2) * tam * 0.03 }]);
  const sombra = useDerivedValue(() => {
    const w = tam * (0.5 - Math.sin((reloj.value / 1000) * 2.2) * 0.04);
    return Skia.XYWHRect(tam / 2 - w / 2, alto * 0.86, w, tam * 0.08);
  });
  return (
    <Canvas style={{ width: tam, height: alto }}>
      <Circle cx={tam / 2} cy={alto * 0.47} r={tam * 0.5}>
        <RadialGradient c={vec(tam / 2, alto * 0.47)} r={tam * 0.5} colors={[rgba(colores[1], 0.35), rgba(colores[0], 0.12), rgba(colores[0], 0)]} />
      </Circle>
      <Oval rect={sombra} color="rgba(0,0,0,0.5)">
        <BlurMask blur={3} style="normal" />
      </Oval>
      <Group transform={transform}>
        <CuerpoCapsula ancho={tam * 0.58} colores={colores} abierta={abierta} ranura={ranura} colorRanura={colores[1]} reloj={reloj} />
      </Group>
    </Canvas>
  );
}
