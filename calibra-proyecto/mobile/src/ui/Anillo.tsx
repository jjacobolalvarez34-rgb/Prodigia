import { useEffect, type ReactNode } from "react";
import { View } from "react-native";
import Animated, { Easing, useAnimatedProps, useSharedValue, withDelay, withTiming, type SharedValue } from "react-native-reanimated";
import Svg, { Circle, Defs, LinearGradient, Stop } from "react-native-svg";
import { aclarar, color } from "~/tema";

const CirculoAnimado = Animated.createAnimatedComponent(Circle);

// Anillo de progreso (meta diaria, temporizador del sprint): se cierra con una curva
// suave cada vez que cambia el valor.
interface Props {
  valor: number; // 0..1
  tam?: number;
  grosor?: number;
  acento?: string;
  fondo?: string;
  demora?: number;
  duracion?: number;
  children?: ReactNode;
  // Progreso que maneja otro (p. ej. el reloj del sprint, en el hilo nativo).
  externo?: SharedValue<number>;
}

export default function Anillo({ valor, tam = 64, grosor = 6, acento = color.logro, fondo = color.surface3, demora = 0, duracion = 1000, children, externo }: Props) {
  const r = (tam - grosor) / 2;
  const circ = 2 * Math.PI * r;
  const progreso = useSharedValue(0);
  const objetivo = Math.max(0, Math.min(1, Number.isFinite(valor) ? valor : 0));

  useEffect(() => {
    if (externo) return;
    progreso.set(withDelay(demora, withTiming(objetivo, { duration: duracion, easing: Easing.out(Easing.cubic) })));
  }, [objetivo, demora, duracion, progreso, externo]);

  const props = useAnimatedProps(() => ({ strokeDashoffset: circ * (1 - (externo ? externo.value : progreso.value)) }));
  const idGrad = `anillo${acento.replace("#", "")}`;

  return (
    <View style={{ width: tam, height: tam, alignItems: "center", justifyContent: "center" }}>
      <Svg width={tam} height={tam} style={{ position: "absolute", transform: [{ rotate: "-90deg" }] }}>
        <Defs>
          <LinearGradient id={idGrad} x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={aclarar(acento, 0.35)} />
            <Stop offset="1" stopColor={acento} />
          </LinearGradient>
        </Defs>
        <Circle cx={tam / 2} cy={tam / 2} r={r} stroke={fondo} strokeWidth={grosor} fill="none" />
        <CirculoAnimado
          cx={tam / 2}
          cy={tam / 2}
          r={r}
          stroke={`url(#${idGrad})`}
          strokeWidth={grosor}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={`${circ} ${circ}`}
          animatedProps={props}
        />
      </Svg>
      {children}
    </View>
  );
}
