import { useEffect, useMemo, type ReactNode } from "react";
import { StyleSheet, useWindowDimensions, View } from "react-native";
import { Canvas, useClock } from "@shopify/react-native-skia";
import Animated, { Easing, FadeIn, FadeInDown, FadeOut, useSharedValue, withDelay, withSequence, withSpring, withTiming, ZoomIn } from "react-native-reanimated";
import { sonar, vibrar } from "~/lib/efectos";
import { useLiviano } from "~/lib/rendimiento";
import { color, fuente } from "~/tema";
import Boton3D from "../Boton3D";
import { Destello, Halo, Onda, Particulas, Rayos, tonoHex } from "../fx/capas";
import { crearExplosion } from "../fx/particulas";
import NumeroAnimado from "../NumeroAnimado";
import Texto from "../Texto";

// Celebración al reclamar un premio (día del calendario, misión): el ícono del
// premio aparece de golpe con destello, onda, partículas y rayos girando detrás,
// y la cantidad cuenta hacia arriba. Mismas piezas de Skia que las cápsulas.
export default function CelebracionPremio({
  colorPremio = color.logro,
  icono,
  etiqueta,
  titulo,
  cantidad,
  sufijo,
  nota,
  grande = false,
  onCerrar,
}: {
  colorPremio?: string;
  icono: ReactNode;
  etiqueta?: string;
  titulo: string;
  cantidad?: number;
  sufijo?: string;
  nota?: string;
  // Día 7, las 3 misiones…: más partículas y doble destello.
  grande?: boolean;
  onCerrar: () => void;
}) {
  const { width: W, height: H } = useWindowDimensions();
  const liviano = useLiviano();
  const CX = W / 2;
  const CY = H * 0.36;
  const reloj = useClock();
  const opRayos = useSharedValue(0);
  const escalaRayos = useSharedValue(0.5);
  const opHalo = useSharedValue(0);
  const escalaHalo = useSharedValue(0.4);
  const onda = useSharedValue(0);
  const destello = useSharedValue(0);
  const tExplosion = useSharedValue(-1);

  const explosion = useMemo(
    () => crearExplosion({ cantidad: (liviano ? 30 : 60) + (grande ? 40 : 0), colores: [colorPremio, tonoHex(colorPremio, 0.5), "#FFFFFF", color.primario], velocidad: grande ? 640 : 520, gravedad: 400, vida: grande ? 2 : 1.6, semilla: 23, tam: 7, radioSalida: 30 }),
    [colorPremio, liviano, grande]
  );

  useEffect(() => {
    vibrar.exito();
    sonar(grande ? "victoria" : "recompensa");
    destello.set(withSequence(withTiming(0.7, { duration: 70 }), withTiming(0, { duration: 380 }), ...(grande ? [withTiming(0.45, { duration: 80 }), withTiming(0, { duration: 420 })] : [])));
    onda.set(withTiming(1, { duration: 700, easing: Easing.linear }));
    tExplosion.set(0);
    tExplosion.set(withTiming(3, { duration: 3000, easing: Easing.linear }));
    opRayos.set(withSequence(withTiming(1, { duration: 200 }), withDelay(800, withTiming(0.65, { duration: 800 }))));
    escalaRayos.set(withSequence(withTiming(1.2, { duration: 260 }), withSpring(1, { damping: 8 })));
    opHalo.set(withSequence(withTiming(1, { duration: 120 }), withTiming(0.55, { duration: 900 })));
    escalaHalo.set(withSequence(withTiming(1.9, { duration: 200 }), withSpring(1.1, { damping: 10 })));
  }, [grande, destello, onda, tExplosion, opRayos, escalaRayos, opHalo, escalaHalo]);

  return (
    <Animated.View entering={FadeIn.duration(200)} exiting={FadeOut.duration(200)} style={styles.capa}>
      <Canvas style={StyleSheet.absoluteFill} pointerEvents="none">
        <Rayos cx={CX} cy={CY} radio={Math.max(W, H) * 0.6} color={colorPremio} opacidad={opRayos} escala={escalaRayos} reloj={reloj} cantidad={grande ? 16 : 12} />
        <Halo cx={CX} cy={CY} radio={130} color={colorPremio} opacidad={opHalo} escala={escalaHalo} />
        <Onda cx={CX} cy={CY} desde={30} hasta={Math.max(W, H) * 0.5} color={colorPremio} avance={onda} />
        <Particulas lista={explosion} tiempo={tExplosion} cx={CX} cy={CY} ancho={W} alto={H} brillo={!liviano} />
        <Destello ancho={W} alto={H} opacidad={destello} />
      </Canvas>
      <View style={[styles.contenido, { top: CY - 70 }]}>
        <Animated.View entering={ZoomIn.springify().damping(8).stiffness(160)} style={[styles.icono, { borderColor: colorPremio, boxShadow: `0px 0px 34px ${colorPremio}` }]}>
          {icono}
        </Animated.View>
        <Animated.View entering={FadeInDown.delay(200).duration(320)} style={{ alignItems: "center", gap: 4, marginTop: 18 }}>
          {etiqueta ? (
            <Texto v="micro" c={tonoHex(colorPremio, 0.2)} centro>
              {etiqueta}
            </Texto>
          ) : null}
          <Texto v="h2" centro>
            {titulo}
          </Texto>
        </Animated.View>
        {cantidad != null && cantidad > 0 && (
          <Animated.View entering={FadeInDown.delay(320).duration(320)} style={styles.cantidad}>
            <NumeroAnimado valor={cantidad} desde={0} prefijo="+" v="mono" c={colorPremio} duracion={1000} estilo={{ fontSize: 34, fontFamily: fuente.display }} onTic={() => sonar("moneda")} />
            {sufijo ? (
              <Texto v="fuerte" c={colorPremio}>
                {sufijo}
              </Texto>
            ) : null}
          </Animated.View>
        )}
        {nota ? (
          <Animated.View entering={FadeIn.delay(500).duration(300)}>
            <Texto v="nota" centro>
              {nota}
            </Texto>
          </Animated.View>
        ) : null}
        <Animated.View entering={FadeInDown.delay(700).duration(300)} style={{ alignSelf: "stretch", marginTop: 20 }}>
          <Boton3D titulo="¡Genial!" brillo onPress={onCerrar} />
        </Animated.View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  capa: { ...StyleSheet.absoluteFill, backgroundColor: "rgba(3,4,10,0.9)", zIndex: 300, elevation: 300 },
  contenido: { position: "absolute", left: "8%", right: "8%", alignItems: "center" },
  icono: { width: 120, height: 120, borderRadius: 34, borderWidth: 2, backgroundColor: "rgba(20,18,40,0.92)", alignItems: "center", justifyContent: "center" },
  cantidad: { flexDirection: "row", alignItems: "baseline", gap: 6, marginTop: 10 },
});
