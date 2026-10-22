import { memo, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Pressable, StyleSheet, useWindowDimensions, View } from "react-native";
import { Canvas, Group, interpolateColors, Oval, RadialGradient, Skia, useClock, vec } from "@shopify/react-native-skia";
import Animated, { cancelAnimation, Easing, FadeIn, FadeInDown, FadeOut, useAnimatedStyle, useDerivedValue, useSharedValue, withDelay, withRepeat, withSequence, withSpring, withTiming, type SharedValue } from "react-native-reanimated";
import { COLOR_RAREZA } from "@/lib/recompensas/catalogo";
import { precargarSonidos, sonar, vibrar, type Sonido } from "~/lib/efectos";
import { useLiviano } from "~/lib/rendimiento";
import { color } from "~/tema";
import Boton3D from "../Boton3D";
import Texto, { SobreOscuro } from "../Texto";
import { CuerpoCapsula, Destello, Halo, Onda, Particulas, Rayos, tonoHex, type ColorVivo } from "./capas";
import { crearExplosion, crearLluvia, type Particula } from "./particulas";

// Apertura de una cápsula, con efectos dibujados por la GPU (Skia):
// 1) cae y rebota levantando polvo; 2) flota latiendo, con rayos tenues detrás;
// 3) al tocarla la rareza SUBE por colores, como en Brawl Stars: cada escalón es un
//    golpe de luz, un temblor más fuerte y una nota más aguda, hasta el color del
//    premio; 4) estalla: destello, onda expansiva, partículas, las mitades salen
//    volando y el premio entra girando como una carta (los legendarios, además, con
//    lluvia de confeti y doble destello).
//
// Rendimiento (2026-10-15, «se traba un poco»), como lo hacen Clash Royale y Brawl
// Stars: el premio se pide al servidor apenas aparece la cápsula (al tocarla ya está,
// no hay espera de red), los sonidos se cargan antes, los efectos no usan desenfoques
// en vivo, todo se anima en el hilo de la interfaz y la escena no se vuelve a armar
// con cada cambio de estado.

export interface PremioRevelado {
  // Color de la rareza (o del premio) y nivel de emoción: 1 común … 4 legendario.
  color: string;
  nivel: 1 | 2 | 3 | 4;
  contenido: ReactNode;
}

type Fase = "cae" | "espera" | "carga" | "premio" | "error";

// Escalones de rareza que se recorren antes de llegar al premio.
const ESCALERA = [COLOR_RAREZA.comun, COLOR_RAREZA.raro, COLOR_RAREZA.epico, COLOR_RAREZA.legendario];
const PASO_MS = 420;
const NOTAS: Sonido[] = ["acierto_cristal1", "acierto_cristal3", "acierto_cristal5", "acierto_cristal7"];
const SONIDOS: Sonido[] = ["swoosh", "moneda", "combo", "victoria", "nivel_cuenta", "recompensa", ...NOTAS];

interface Escena {
  W: number;
  H: number;
  CX: number;
  CY: number;
  colores: [string, string];
  colorFinal: string;
  colorVivo: ColorVivo;
  nivel: number;
  liviano: boolean;
  v: Record<"caida" | "giro" | "flota" | "latido" | "amplitud" | "abierta" | "ranura" | "sombra" | "opRayos" | "escalaRayos" | "opHalo" | "escalaHalo" | "destello" | "ondaPiso" | "ondaEstallido" | "tPolvo" | "tFuga" | "tExplosion" | "tLluvia", SharedValue<number>>;
  polvo: Particula[];
  fuga: Particula[];
  explosion: Particula[];
  lluvia: Particula[];
}

const ANCHO_CAPSULA = 118;

// El dibujo, aparte y memorizado: los cambios de fase de la pantalla no lo rearman.
const EscenaCapsula = memo(function EscenaCapsula({ W, H, CX, CY, colores, colorFinal, colorVivo, nivel, liviano, v, polvo, fuga, explosion, lluvia }: Escena) {
  const reloj = useClock();
  const transformCapsula = useDerivedValue(() => {
    const s = reloj.value / 1000;
    const amp = v.amplitud.value;
    return [
      { translateX: CX + Math.sin(s * 47) * amp },
      { translateY: CY + v.caida.value + Math.sin(s * 2.4) * 7 * v.flota.value + Math.cos(s * 39) * amp * 0.35 },
      { rotate: v.giro.value + Math.sin(s * 31) * amp * 0.012 + Math.sin(s * 1.7) * 0.05 * v.flota.value },
      { scale: 1 + v.latido.value * 0.05 + amp * 0.006 },
    ];
  });
  const anchoSombra = useDerivedValue(() => 96 * (0.45 + 0.55 * v.sombra.value) - v.latido.value * 8 - Math.sin((reloj.value / 1000) * 2.4) * 6 * v.flota.value);
  const rectSombra = useDerivedValue(() => Skia.XYWHRect(CX - anchoSombra.value / 2, CY + 88, anchoSombra.value, 14));
  const radioSombra = useDerivedValue(() => anchoSombra.value / 2);
  const opSombra = useDerivedValue(() => v.sombra.value * (1 - v.abierta.value) * 0.6);
  return (
    <Canvas style={StyleSheet.absoluteFill} pointerEvents="none">
      <Rayos cx={CX} cy={CY} radio={Math.max(W, H) * 0.62} color={colorFinal} colorVivo={colorVivo} opacidad={v.opRayos} escala={v.escalaRayos} reloj={reloj} cantidad={nivel >= 3 ? 16 : 12} />
      <Halo cx={CX} cy={CY} radio={150} color={colorFinal} colorVivo={colorVivo} opacidad={v.opHalo} escala={v.escalaHalo} />
      <Group opacity={opSombra}>
        <Oval rect={rectSombra}>
          <RadialGradient c={vec(CX, CY + 95)} r={radioSombra} colors={["rgba(0,0,0,0.9)", "rgba(0,0,0,0)"]} />
        </Oval>
      </Group>
      <Onda cx={CX} cy={CY + 94} desde={20} hasta={150} color={tonoHex(colores[1], 0.4)} avance={v.ondaPiso} />
      <Particulas lista={polvo} tiempo={v.tPolvo} cx={CX} cy={CY + 92} ancho={W} alto={H} brillo={!liviano} />
      <Group transform={transformCapsula}>
        <CuerpoCapsula ancho={ANCHO_CAPSULA} colores={colores} abierta={v.abierta} ranura={v.ranura} colorRanura={colorFinal} colorVivo={colorVivo} reloj={reloj} />
      </Group>
      <Particulas lista={fuga} tiempo={v.tFuga} cx={CX} cy={CY} ancho={W} alto={H} brillo={!liviano} />
      <Onda cx={CX} cy={CY} desde={30} hasta={Math.max(W, H) * 0.55} color={colorFinal} avance={v.ondaEstallido} />
      <Particulas lista={explosion} tiempo={v.tExplosion} cx={CX} cy={CY} ancho={W} alto={H} brillo={!liviano} />
      {lluvia.length > 0 && <Particulas lista={lluvia} tiempo={v.tLluvia} cx={CX} cy={0} ancho={W} alto={H} brillo={false} />}
      <Destello ancho={W} alto={H} opacidad={v.destello} />
    </Canvas>
  );
});

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

  const [fase, setFase] = useState<Fase>("cae");
  const [premio, setPremio] = useState<PremioRevelado | null>(null);
  const [verPremio, setVerPremio] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const despues = (ms: number, f: () => void) => timers.current.push(setTimeout(f, ms));
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

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
  // Los valores compartidos no cambian entre renders: el objeto se arma una vez.
  const valores = useMemo(
    () => ({ caida, giro, flota, latido, amplitud, abierta, ranura, sombra, opRayos, escalaRayos, opHalo, escalaHalo, destello, ondaPiso, ondaEstallido, tPolvo, tFuga, tExplosion, tLluvia }),
    [caida, giro, flota, latido, amplitud, abierta, ranura, sombra, opRayos, escalaRayos, opHalo, escalaHalo, destello, ondaPiso, ondaEstallido, tPolvo, tFuga, tExplosion, tLluvia]
  );

  // Color que sube de escalón en escalón: 0 = el de la cápsula, luego la escalera.
  const tono = useSharedValue(0);
  const escalera = useSharedValue<string[]>([colores[1], colores[1]]);
  const colorVivo = useDerivedValue(() => {
    const lista = escalera.value;
    return interpolateColors(
      tono.value,
      lista.map((_, i) => i),
      lista
    );
  });

  const nivel = premio?.nivel ?? 1;
  const colorFinal = premio?.color ?? colores[1];
  const paleta = useMemo(() => [colorFinal, tonoHex(colorFinal, 0.45), colores[0], colores[1], "#FFFFFF"], [colorFinal, colores]);
  const polvo = useMemo(() => crearExplosion({ cantidad: liviano ? 10 : 18, colores: ["#FFFFFF", tonoHex(colores[1], 0.5)], formas: ["punto"], velocidad: 260, angulo: -90, apertura: 150, gravedad: 260, vida: 0.9, semilla: 3, tam: 4 }), [colores, liviano]);
  // La luz que se escapa es neutra (no adelanta el premio); el color lo pone la escalera.
  const fuga = useMemo(() => {
    const n = liviano ? 14 : 30;
    const neutros = ["#FFFFFF", tonoHex(colores[1], 0.5), colores[0]];
    const lados = [...crearExplosion({ cantidad: n / 2, colores: neutros, formas: ["chispa", "punto"], velocidad: 300, angulo: 180, apertura: 70, gravedad: 120, vida: 0.7, semilla: 5, tam: 5 }), ...crearExplosion({ cantidad: n / 2, colores: neutros, formas: ["chispa", "punto"], velocidad: 300, angulo: 0, apertura: 70, gravedad: 120, vida: 0.7, semilla: 9, tam: 5 })];
    const dur = (250 + 4 * PASO_MS) / 1000;
    return lados.map((p, i) => ({ ...p, retraso: (i / lados.length) * dur }));
  }, [colores, liviano]);
  const explosion = useMemo(
    () => crearExplosion({ cantidad: (liviano ? 34 : 70) + nivel * (liviano ? 6 : 16), colores: paleta, velocidad: 560 + nivel * 90, gravedad: 380, vida: 1.5 + nivel * 0.25, semilla: 17, tam: 7 + nivel, radioSalida: 20 }),
    [paleta, liviano, nivel]
  );
  const lluvia = useMemo(() => (nivel >= 4 ? crearLluvia(W, liviano ? 30 : 70, [colorFinal, "#FFFFFF", colores[0], colores[1], "#34D399"]) : []), [nivel, W, liviano, colorFinal, colores]);

  // El premio se pide apenas aparece la cápsula: al tocarla ya está (sin espera de red).
  const [pedido] = useState(() => abrir());

  useEffect(() => {
    precargarSonidos(SONIDOS);
    let vivo = true;
    pedido.then(
      (p) => {
        if (!vivo) return;
        setPremio(p);
        escalera.set([colores[1], ...ESCALERA.slice(0, p.nivel - 1), p.color]);
      },
      () => undefined
    );
    // 1) Cae y rebota.
    sonar("swoosh");
    valores.caida.set(withSpring(0, { damping: 9, stiffness: 120, mass: 1.1 }));
    valores.giro.set(withSequence(withTiming(0.18, { duration: 420 }), withSpring(0, { damping: 6, stiffness: 140 })));
    valores.sombra.set(withTiming(1, { duration: 600, easing: Easing.in(Easing.quad) }));
    despues(470, () => {
      vibrar.medio();
      sonar("moneda");
      valores.ondaPiso.set(0);
      valores.ondaPiso.set(withTiming(1, { duration: 550, easing: Easing.linear }));
      valores.tPolvo.set(0);
      valores.tPolvo.set(withTiming(1.2, { duration: 1200, easing: Easing.linear }));
    });
    despues(900, () => {
      setFase("espera");
      valores.flota.set(withTiming(1, { duration: 500 }));
      valores.latido.set(withRepeat(withSequence(withTiming(1, { duration: 700, easing: Easing.inOut(Easing.quad) }), withTiming(0, { duration: 700, easing: Easing.inOut(Easing.quad) })), -1));
      valores.opRayos.set(withTiming(0.2, { duration: 600 }));
      valores.opHalo.set(withTiming(0.32, { duration: 600 }));
    });
    return () => {
      vivo = false;
    };
    // Solo al montar: la escena corre una vez.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 3) Suspenso: la rareza sube escalón por escalón hasta la del premio.
  function cargar(p: PremioRevelado) {
    const pasos = p.nivel;
    const dur = 250 + pasos * PASO_MS;
    valores.amplitud.set(withTiming(3 + p.nivel * 2.6, { duration: dur, easing: Easing.in(Easing.quad) }));
    valores.ranura.set(withTiming(1, { duration: dur, easing: Easing.in(Easing.cubic) }));
    valores.opRayos.set(withTiming(0.32 + p.nivel * 0.06, { duration: dur }));
    valores.tFuga.set(0);
    valores.tFuga.set(withTiming(dur / 1000 + 1.2, { duration: dur + 1200, easing: Easing.linear }));
    for (let k = 1; k <= pasos; k++) {
      despues(250 + (k - 1) * PASO_MS, () => {
        tono.set(withTiming(k, { duration: 160, easing: Easing.out(Easing.quad) }));
        valores.escalaHalo.set(withSequence(withTiming(1.25 + k * 0.12, { duration: 110 }), withTiming(1 + k * 0.1, { duration: 280, easing: Easing.out(Easing.quad) })));
        valores.escalaRayos.set(withSequence(withTiming(1.08, { duration: 110 }), withTiming(0.95 + k * 0.03, { duration: 280 })));
        vibrar.medio();
        sonar(NOTAS[Math.min(NOTAS.length - 1, k - 1)]);
      });
    }
    despues(dur, () => estallar(p));
  }

  // Entrada del premio: gira como una carta y se asienta.
  const carta = useSharedValue(0);
  const estiloCarta = useAnimatedStyle(() => ({
    opacity: Math.min(1, carta.value * 2),
    transform: [{ perspective: 900 }, { rotateY: `${(1 - carta.value) * 100}deg` }, { scale: 0.55 + 0.45 * carta.value }],
  }));

  function estallar(p: PremioRevelado) {
    vibrar.exito();
    sonar(p.nivel >= 4 ? "victoria" : "nivel_cuenta");
    cancelAnimation(valores.latido);
    valores.latido.set(0);
    valores.amplitud.set(withTiming(0, { duration: 120 }));
    valores.flota.set(withTiming(0, { duration: 200 }));
    valores.destello.set(withSequence(withTiming(p.nivel >= 3 ? 0.62 : 0.45, { duration: 70 }), withTiming(0, { duration: 420 }), ...(p.nivel >= 4 ? [withTiming(0.4, { duration: 80 }), withTiming(0, { duration: 500 })] : [])));
    valores.abierta.set(withTiming(1, { duration: 520, easing: Easing.out(Easing.cubic) }));
    valores.ondaEstallido.set(0);
    valores.ondaEstallido.set(withTiming(1, { duration: 750, easing: Easing.linear }));
    valores.tExplosion.set(0);
    valores.tExplosion.set(withTiming(3.5, { duration: 3500, easing: Easing.linear }));
    if (p.nivel >= 4) {
      valores.tLluvia.set(0);
      valores.tLluvia.set(withDelay(150, withTiming(5, { duration: 5000, easing: Easing.linear })));
    }
    // Fondo más tenue (2026-10-18, «bájale un poco al brillo de fondo»): el premio manda.
    valores.opRayos.set(withSequence(withTiming(0.7, { duration: 200 }), withDelay(900, withTiming(0.4, { duration: 800 }))));
    valores.escalaRayos.set(withSequence(withTiming(1.25, { duration: 260 }), withSpring(1, { damping: 8 })));
    valores.opHalo.set(withSequence(withTiming(0.75, { duration: 120 }), withTiming(0.32, { duration: 900 })));
    valores.escalaHalo.set(withSequence(withTiming(2.1, { duration: 200 }), withSpring(1.3, { damping: 10 })));
    // El premio se monta después del pico del destello, cuando el teléfono ya está libre.
    despues(240, () => {
      setFase("premio");
      setVerPremio(true);
      carta.set(withSpring(1, { damping: 13, stiffness: 120 }));
    });
    despues(700, () => sonar("recompensa"));
  }

  async function tocar() {
    if (fase !== "espera") return;
    setFase("carga");
    vibrar.fuerte();
    sonar("combo");
    valores.amplitud.set(withTiming(3, { duration: 300 }));
    valores.ranura.set(withTiming(0.35, { duration: 500 }));
    try {
      // Casi siempre ya llegó (se pidió al aparecer la cápsula).
      const p = await pedido;
      cargar(p);
    } catch {
      valores.amplitud.set(withTiming(0, { duration: 150 }));
      valores.ranura.set(withTiming(0, { duration: 300 }));
      setFase("error");
    }
  }

  return (
    <SobreOscuro>
      <Animated.View entering={FadeIn.duration(250)} exiting={FadeOut.duration(220)} style={styles.capa}>
        <EscenaCapsula W={W} H={H} CX={CX} CY={CY} colores={colores} colorFinal={colorFinal} colorVivo={colorVivo} nivel={nivel} liviano={liviano} v={valores} polvo={polvo} fuga={fuga} explosion={explosion} lluvia={lluvia} />

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

        {fase === "error" && (
          <View style={[styles.premio, { top: CY - 96 }]}>
            <Texto v="h3" centro>
              No se pudo abrir ahora. Inténtalo de nuevo con conexión.
            </Texto>
            <Boton3D titulo="Cerrar" onPress={onCerrar} estilo={{ alignSelf: "stretch", marginTop: 18 }} />
          </View>
        )}

        {verPremio && premio && (
          <View style={[styles.premio, { top: CY - 96 }]}>
            <Animated.View style={[{ alignItems: "center", alignSelf: "stretch" }, estiloCarta]}>{premio.contenido}</Animated.View>
            <Animated.View entering={FadeInDown.delay(650).duration(300)} style={{ alignSelf: "stretch", marginTop: 18 }}>
              <Boton3D titulo={textoBoton} brillo onPress={onCerrar} />
            </Animated.View>
          </View>
        )}
      </Animated.View>
    </SobreOscuro>
  );
}

const styles = StyleSheet.create({
  capa: { ...StyleSheet.absoluteFill, backgroundColor: "rgba(3,4,10,0.92)", zIndex: 300, elevation: 300 },
  cabecera: { position: "absolute", left: 24, right: 24, alignItems: "center", gap: 4 },
  toque: { position: "absolute", width: 200, height: 240 },
  premio: { position: "absolute", left: "7%", right: "7%", alignItems: "center" },
});
