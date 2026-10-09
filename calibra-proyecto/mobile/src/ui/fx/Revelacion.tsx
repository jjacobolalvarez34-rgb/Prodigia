import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Pressable, StyleSheet, useWindowDimensions, View } from "react-native";
import { BlurMask, Canvas, Group, Oval, Skia, useClock } from "@shopify/react-native-skia";
import Animated, { cancelAnimation, Easing, FadeIn, FadeInDown, FadeOut, useDerivedValue, useSharedValue, withDelay, withRepeat, withSequence, withSpring, withTiming, ZoomIn } from "react-native-reanimated";
import { sonar, vibrar } from "~/lib/efectos";
import { useLiviano } from "~/lib/rendimiento";
import { color } from "~/tema";
import Boton3D from "../Boton3D";
import Texto from "../Texto";
import { CuerpoCapsula, Destello, Halo, Onda, Particulas, Rayos, tonoHex } from "./capas";
import { crearExplosion, crearLluvia } from "./particulas";

// Apertura de una cápsula, con efectos dibujados en vivo por la GPU (Skia):
// 1) cae y rebota levantando polvo; 2) flota latiendo, con rayos tenues detrás;
// 3) al tocarla tiembla cada vez más y la luz se escapa por la unión: cuanto más
//    raro el premio, más dura el suspenso y más fuerte tiembla (del color de la
//    rareza); 4) estalla: destello, onda expansiva, partículas, las mitades salen
//    volando y el premio aparece con rayos girando detrás (los legendarios,
//    además, con lluvia de confeti y doble destello).

export interface PremioRevelado {
  // Color de la rareza (o del premio) y nivel de emoción: 1 común … 4 legendario.
  color: string;
  nivel: 1 | 2 | 3 | 4;
  contenido: ReactNode;
}

type Fase = "cae" | "espera" | "carga" | "premio" | "error";

const CARGA_MS = [0, 450, 650, 1150, 1700];

export default function Revelacion({
  colores,
  etiqueta,
  titulo,
  abrir,
  textoBoton = "¡Genial!",
  onCerrar,
}: {
  colores: [string, string];
  etiqueta?: string;
  titulo: string;
  abrir: () => Promise<PremioRevelado>;
  textoBoton?: string;
  onCerrar: () => void;
}) {
  const { width: W, height: H } = useWindowDimensions();
  const liviano = useLiviano();
  const CX = W / 2;
  const CY = H * 0.42;
  const ANCHO_CAPSULA = 118;

  const [fase, setFase] = useState<Fase>("cae");
  const [premio, setPremio] = useState<PremioRevelado | null>(null);
  const [colorLuz, setColorLuz] = useState(colores[1]);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const despues = (ms: number, f: () => void) => timers.current.push(setTimeout(f, ms));
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const reloj = useClock();
  const caida = useSharedValue(-H * 0.75);
  const giro = useSharedValue(-0.25);
  const flota = useSharedValue(0);
  const latido = useSharedValue(0);
  const amplitud = useSharedValue(0);
  const abierta = useSharedValue(0);
  const ranura = useSharedValue(0);
  const sombra = useSharedValue(0);
  const opRayos = useSharedValue(0);
  const escalaRayos = useSharedValue(0.7);
  const opHalo = useSharedValue(0);
  const escalaHalo = useSharedValue(0.6);
  const destello = useSharedValue(0);
  const ondaPiso = useSharedValue(0);
  const ondaEstallido = useSharedValue(0);
  const tPolvo = useSharedValue(-1);
  const tFuga = useSharedValue(-1);
  const tExplosion = useSharedValue(-1);
  const tLluvia = useSharedValue(-1);

  const nivel = premio?.nivel ?? 1;
  const paleta = useMemo(() => [colorLuz, tonoHex(colorLuz, 0.45), colores[0], colores[1], "#FFFFFF"], [colorLuz, colores]);
  const polvo = useMemo(() => crearExplosion({ cantidad: liviano ? 10 : 18, colores: ["#FFFFFF", tonoHex(colores[1], 0.5)], formas: ["punto"], velocidad: 260, angulo: -90, apertura: 150, gravedad: 260, vida: 0.9, semilla: 3, tam: 4 }), [colores, liviano]);
  const fuga = useMemo(() => {
    const n = liviano ? 14 : 30;
    const lados = [...crearExplosion({ cantidad: n / 2, colores: paleta, formas: ["chispa", "punto"], velocidad: 300, angulo: 180, apertura: 70, gravedad: 120, vida: 0.7, semilla: 5, tam: 5 }), ...crearExplosion({ cantidad: n / 2, colores: paleta, formas: ["chispa", "punto"], velocidad: 300, angulo: 0, apertura: 70, gravedad: 120, vida: 0.7, semilla: 9, tam: 5 })];
    // Salen de a poco durante todo el suspenso.
    const dur = CARGA_MS[nivel] / 1000 + 0.4;
    return lados.map((p, i) => ({ ...p, retraso: (i / lados.length) * dur }));
  }, [paleta, liviano, nivel]);
  const explosion = useMemo(
    () => crearExplosion({ cantidad: (liviano ? 34 : 70) + nivel * (liviano ? 6 : 16), colores: paleta, velocidad: 560 + nivel * 90, gravedad: 380, vida: 1.5 + nivel * 0.25, semilla: 17, tam: 7 + nivel, radioSalida: 20 }),
    [paleta, liviano, nivel]
  );
  const lluvia = useMemo(() => (nivel >= 4 ? crearLluvia(W, liviano ? 30 : 70, [colorLuz, "#FFFFFF", colores[0], colores[1], "#34D399"]) : []), [nivel, W, liviano, colorLuz, colores]);

  // 1) Cae y rebota.
  useEffect(() => {
    sonar("swoosh");
    caida.set(withSpring(0, { damping: 9, stiffness: 120, mass: 1.1 }));
    giro.set(withSequence(withTiming(0.18, { duration: 420 }), withSpring(0, { damping: 6, stiffness: 140 })));
    sombra.set(withTiming(1, { duration: 600, easing: Easing.in(Easing.quad) }));
    despues(470, () => {
      vibrar.medio();
      sonar("moneda");
      ondaPiso.set(0);
      ondaPiso.set(withTiming(1, { duration: 550, easing: Easing.linear }));
      tPolvo.set(0);
      tPolvo.set(withTiming(1.2, { duration: 1200, easing: Easing.linear }));
    });
    despues(900, () => {
      setFase("espera");
      flota.set(withTiming(1, { duration: 500 }));
      latido.set(withRepeat(withSequence(withTiming(1, { duration: 700, easing: Easing.inOut(Easing.quad) }), withTiming(0, { duration: 700, easing: Easing.inOut(Easing.quad) })), -1));
      opRayos.set(withTiming(0.28, { duration: 600 }));
      opHalo.set(withTiming(0.45, { duration: 600 }));
    });
  }, [caida, giro, sombra, ondaPiso, tPolvo, flota, latido, opRayos, opHalo]);

  function cargar(p: PremioRevelado) {
    const dur = CARGA_MS[p.nivel];
    setColorLuz(p.color);
    amplitud.set(withTiming(3 + p.nivel * 2.6, { duration: dur, easing: Easing.in(Easing.quad) }));
    ranura.set(withTiming(1, { duration: dur, easing: Easing.in(Easing.cubic) }));
    opRayos.set(withTiming(0.5 + p.nivel * 0.08, { duration: dur }));
    escalaHalo.set(withTiming(1 + p.nivel * 0.12, { duration: dur }));
    tFuga.set(0);
    tFuga.set(withTiming(dur / 1000 + 1.2, { duration: dur + 1200, easing: Easing.linear }));
    // Golpecitos cada vez más seguidos.
    let t = 0;
    let paso = 230;
    while (t < dur - 60) {
      despues(t, () => vibrar.ligero());
      t += paso;
      paso = Math.max(55, paso * 0.78);
    }
    despues(dur, () => estallar(p));
  }

  function estallar(p: PremioRevelado) {
    vibrar.exito();
    sonar(p.nivel >= 4 ? "victoria" : "nivel_cuenta");
    cancelAnimation(latido);
    latido.set(0);
    amplitud.set(withTiming(0, { duration: 120 }));
    flota.set(withTiming(0, { duration: 200 }));
    destello.set(withSequence(withTiming(p.nivel >= 3 ? 0.95 : 0.75, { duration: 70 }), withTiming(0, { duration: 420 }), ...(p.nivel >= 4 ? [withTiming(0.6, { duration: 80 }), withTiming(0, { duration: 500 })] : [])));
    abierta.set(withTiming(1, { duration: 520, easing: Easing.out(Easing.cubic) }));
    ondaEstallido.set(0);
    ondaEstallido.set(withTiming(1, { duration: 750, easing: Easing.linear }));
    tExplosion.set(0);
    tExplosion.set(withTiming(3.5, { duration: 3500, easing: Easing.linear }));
    if (p.nivel >= 4) {
      tLluvia.set(0);
      tLluvia.set(withDelay(150, withTiming(5, { duration: 5000, easing: Easing.linear })));
    }
    opRayos.set(withSequence(withTiming(1, { duration: 200 }), withDelay(900, withTiming(0.72, { duration: 800 }))));
    escalaRayos.set(withSequence(withTiming(1.25, { duration: 260 }), withSpring(1, { damping: 8 })));
    opHalo.set(withSequence(withTiming(1, { duration: 120 }), withTiming(0.55, { duration: 900 })));
    escalaHalo.set(withSequence(withTiming(2.1, { duration: 200 }), withSpring(1.3, { damping: 10 })));
    despues(220, () => setFase("premio"));
    despues(700, () => sonar("recompensa"));
  }

  async function tocar() {
    if (fase !== "espera") return;
    setFase("carga");
    vibrar.fuerte();
    sonar("combo");
    amplitud.set(withTiming(3, { duration: 300 }));
    ranura.set(withTiming(0.35, { duration: 500 }));
    try {
      const [p] = await Promise.all([abrir(), new Promise((ok) => setTimeout(ok, 550))]);
      setPremio(p);
      cargar(p);
    } catch {
      amplitud.set(withTiming(0, { duration: 150 }));
      ranura.set(withTiming(0, { duration: 300 }));
      setFase("error");
    }
  }

  // Posición de la cápsula: caída, flotar, temblor y latido.
  const transformCapsula = useDerivedValue(() => {
    const s = reloj.value / 1000;
    const amp = amplitud.value;
    return [
      { translateX: CX + Math.sin(s * 47) * amp },
      { translateY: CY + caida.value + Math.sin(s * 2.4) * 7 * flota.value + Math.cos(s * 39) * amp * 0.35 },
      { rotate: giro.value + Math.sin(s * 31) * amp * 0.012 + Math.sin(s * 1.7) * 0.05 * flota.value },
      { scale: 1 + latido.value * 0.05 + amplitud.value * 0.006 },
    ];
  });
  const rectSombra = useDerivedValue(() => {
    const w = 96 * (0.45 + 0.55 * sombra.value) - latido.value * 8 - Math.sin((reloj.value / 1000) * 2.4) * 6 * flota.value;
    return Skia.XYWHRect(CX - w / 2, CY + 88, w, 14);
  });
  const opSombra = useDerivedValue(() => sombra.value * (1 - abierta.value) * 0.55);

  return (
    <Animated.View entering={FadeIn.duration(250)} exiting={FadeOut.duration(220)} style={styles.capa}>
      <Canvas style={StyleSheet.absoluteFill} pointerEvents="none">
        <Rayos cx={CX} cy={CY} radio={Math.max(W, H) * 0.62} color={colorLuz} opacidad={opRayos} escala={escalaRayos} reloj={reloj} cantidad={nivel >= 3 ? 16 : 12} />
        <Halo cx={CX} cy={CY} radio={150} color={colorLuz} opacidad={opHalo} escala={escalaHalo} />
        <Group opacity={opSombra}>
          <Oval rect={rectSombra} color="#000000">
            <BlurMask blur={6} style="normal" />
          </Oval>
        </Group>
        <Onda cx={CX} cy={CY + 94} desde={20} hasta={150} color={tonoHex(colores[1], 0.4)} avance={ondaPiso} />
        <Particulas lista={polvo} tiempo={tPolvo} cx={CX} cy={CY + 92} ancho={W} alto={H} brillo={!liviano} />
        <Group transform={transformCapsula}>
          <CuerpoCapsula ancho={ANCHO_CAPSULA} colores={colores} abierta={abierta} ranura={ranura} colorRanura={colorLuz} reloj={reloj} />
        </Group>
        <Particulas lista={fuga} tiempo={tFuga} cx={CX} cy={CY} ancho={W} alto={H} brillo={!liviano} />
        <Onda cx={CX} cy={CY} desde={30} hasta={Math.max(W, H) * 0.55} color={colorLuz} avance={ondaEstallido} />
        <Particulas lista={explosion} tiempo={tExplosion} cx={CX} cy={CY} ancho={W} alto={H} brillo={!liviano} />
        {lluvia.length > 0 && <Particulas lista={lluvia} tiempo={tLluvia} cx={CX} cy={0} ancho={W} alto={H} brillo={false} />}
        <Destello ancho={W} alto={H} opacidad={destello} />
      </Canvas>

      {(fase === "cae" || fase === "espera" || fase === "carga") && (
        <Animated.View entering={FadeInDown.duration(320)} exiting={FadeOut.duration(150)} style={[styles.cabecera, { top: CY - 210 }]} pointerEvents="none">
          {etiqueta ? (
            <Texto v="micro" c={tonoHex(colores[1], 0.3)} centro>
              {etiqueta}
            </Texto>
          ) : null}
          <Texto v="h2" centro>
            {titulo}
          </Texto>
        </Animated.View>
      )}

      <Pressable onPress={tocar} disabled={fase !== "espera"} style={[styles.toque, { left: CX - 100, top: CY - 120 }]} accessibilityRole="button" accessibilityLabel="Abrir la cápsula" />

      {fase === "espera" && (
        <Animated.View entering={FadeIn.delay(100).duration(300)} exiting={FadeOut.duration(120)} style={[styles.cabecera, { top: CY + 128 }]} pointerEvents="none">
          <Texto v="fuerte" c={color.logro} centro>
            ¡Tócala para abrirla!
          </Texto>
        </Animated.View>
      )}

      {(fase === "premio" || fase === "error") && (
        <View style={[styles.premio, { top: CY - 96 }]}>
          <Animated.View entering={ZoomIn.springify().damping(9).stiffness(150)} style={{ alignItems: "center", alignSelf: "stretch" }}>
            {fase === "error" || !premio ? (
              <Texto v="h3" centro>
                No se pudo abrir ahora. Inténtalo de nuevo con conexión.
              </Texto>
            ) : (
              premio.contenido
            )}
          </Animated.View>
          <Animated.View entering={FadeInDown.delay(650).duration(300)} style={{ alignSelf: "stretch", marginTop: 18 }}>
            <Boton3D titulo={fase === "error" ? "Cerrar" : textoBoton} brillo onPress={onCerrar} />
          </Animated.View>
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  capa: { ...StyleSheet.absoluteFill, backgroundColor: "rgba(3,4,10,0.92)", zIndex: 300, elevation: 300 },
  cabecera: { position: "absolute", left: 24, right: 24, alignItems: "center", gap: 4 },
  toque: { position: "absolute", width: 200, height: 240 },
  premio: { position: "absolute", left: "7%", right: "7%", alignItems: "center" },
});
