import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useMemo, useRef, useState } from "react";
import { Animated as AnimadoRN, Easing as EasingRN, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { BlendMode, Canvas, createPicture, PaintStyle, Picture, Skia, TileMode, useClock, type SkPaint, type SkPath } from "@shopify/react-native-skia";
import Animated, { Easing, useAnimatedStyle, useDerivedValue, useSharedValue, withDelay, withRepeat, withSequence, withTiming, type SharedValue } from "react-native-reanimated";
import { capaVisible } from "@/lib/temas/temas";
import { useLiviano } from "~/lib/rendimiento";
import { useTemaHoy } from "~/lib/temporada";
import { color, conAlfa, fuente, mono } from "~/tema";
import Logo from "./Logo";
import AccesorioTemporada from "./temas/AccesorioTemporada";
import { ParticulasTema } from "./temas/CapaTemporada";

// Pantalla de carga al abrir la app (rehecha 2026-10-17: «se ve burda, saturada»).
// Una sola escena, limpia: el espacio con estrellas que titilan y una nebulosa suave;
// el logo entra desde lo alto, cae con su estela hasta el centro del cielo y se asienta
// con una onda de luz; abajo la ciudad en tres planos (lejos, medio, cerca) que se
// desplazan a distinta velocidad, así se siente profundidad. Todo el cielo y la ciudad
// se dibujan en Skia, en el hilo de la interfaz. La barra muestra el progreso real
// (lo mueve el layout a medida que termina cada paso) y debajo rota un consejo.
// En las festividades (2026-10-21) el horizonte, la nebulosa y las ventanas toman los
// colores de la fecha, caen sus partículas, el logo lleva su accesorio y bajo el lema
// aparece el nombre de la fiesta.

const TIPS = [
  "Por 11 con dos cifras: suma las cifras y ponla en el medio. 43 × 11 → 4 (4+3) 3 = 473.",
  "Por 5: multiplica por 10 y divide entre 2. 68 × 5 → 680 ÷ 2 = 340.",
  "Restar 9: resta 10 y suma 1. 73 − 9 → 63 + 1 = 64.",
  "Cuadrado de un número que termina en 5: 35² → 3 × 4 = 12, y le pegas 25: 1225.",
  "Por 4: duplica dos veces. 17 × 4 → 34 → 68.",
  "Sumar 99: suma 100 y resta 1. 245 + 99 → 345 − 1 = 344.",
  "Por 25: multiplica por 100 y divide entre 4. 36 × 25 → 3600 ÷ 4 = 900.",
  "Si aciertas seguido, la dificultad sube sola. Si fallas, baja un poco: siempre juegas en tu nivel.",
  "Tu progreso es el mismo en la app y en la web: la racha y las Chispas se comparten.",
  "Un sprint de 60 segundos al día alcanza para que tu racha siga viva.",
  "En Avisos → ajustes eliges qué notificaciones recibir. Nunca te avisamos de noche.",
  "Agrega el widget de Prodigia a tu pantalla de inicio y mira tu racha sin abrir la app.",
];

const CAIDA_MS = 1250;
const ALTURA_LOGO = 0.34; // centro del logo, en fracción del alto

// ---------- Geometría (una vez, en el hilo de JS) ----------
function azar(semilla: number) {
  let s = semilla >>> 0 || 1;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

interface Plano {
  silueta: SkPath;
  ventanasA: SkPath;
  ventanasB: SkPath;
  bordes: SkPath;
  periodo: number;
  base: number; // y del pie del plano
  velocidad: number; // px/s hacia la derecha
  relleno: SkPaint;
  tintaA: string;
  tintaB: string;
  conVentanas: boolean;
}

// Un plano de edificios de `periodo` px de ancho que se repite sin costura.
function armarPlano(semilla: number, periodo: number, altoMin: number, altoMax: number, anchoMin: number, anchoMax: number, conVentanas: boolean, tamVentana: number) {
  const r = azar(semilla);
  const silueta = Skia.Path.Make();
  const ventanasA = Skia.Path.Make();
  const ventanasB = Skia.Path.Make();
  const bordes = Skia.Path.Make();
  let x = 0;
  while (x < periodo) {
    const ancho = Math.min(periodo - x, anchoMin + r() * (anchoMax - anchoMin));
    const alto = altoMin + r() * (altoMax - altoMin);
    const tipo = r();
    silueta.addRect(Skia.XYWHRect(x, -alto, ancho, alto));
    if (tipo < 0.25 && ancho > 18) {
      // Escalonado: un piso más angosto arriba.
      const a2 = alto * (0.12 + r() * 0.12);
      silueta.addRect(Skia.XYWHRect(x + ancho * 0.2, -alto - a2, ancho * 0.6, a2));
    } else if (tipo < 0.42) {
      // Antena.
      silueta.addRect(Skia.XYWHRect(x + ancho * 0.5 - 0.75, -alto - 10 - r() * 14, 1.5, 12 + r() * 14));
    } else if (tipo < 0.55 && ancho > 16) {
      // Techo a dos aguas / aguja.
      silueta.moveTo(x, -alto);
      silueta.lineTo(x + ancho / 2, -alto - ancho * 0.45);
      silueta.lineTo(x + ancho, -alto);
      silueta.close();
    }
    if (conVentanas) {
      bordes.addRect(Skia.XYWHRect(x, -alto, ancho, 1.2));
      const paso = tamVentana * 2.4;
      for (let vy = -alto + paso * 0.8; vy < -paso * 0.6; vy += paso) {
        for (let vx = x + tamVentana; vx < x + ancho - tamVentana * 1.4; vx += paso) {
          const v = r();
          if (v < 0.36) ventanasA.addRect(Skia.XYWHRect(vx, vy, tamVentana, tamVentana * 1.25));
          else if (v < 0.5) ventanasB.addRect(Skia.XYWHRect(vx, vy, tamVentana, tamVentana * 1.25));
        }
      }
    }
    x += ancho + (r() < 0.3 ? 2 + r() * 6 : 0);
  }
  return { silueta, ventanasA, ventanasB, bordes };
}

function pintura(colorHex: string, alfa = 1): SkPaint {
  const p = Skia.Paint();
  p.setAntiAlias(true);
  p.setColor(Skia.Color(colorHex));
  p.setAlphaf(alfa);
  return p;
}

// ---------- Cielo y ciudad ----------
function Escena({ ancho: W, alto: H, liviano, acento, acento2 }: { ancho: number; alto: number; liviano: boolean; acento: string | null; acento2: string | null }) {
  const reloj = useClock();
  const d = useMemo(() => {
    const horizonte = H * 0.8;
    const periodo = Math.max(W, 420) * 1.3;
    const lejos = armarPlano(11, periodo, H * 0.07, H * 0.16, 16, 38, false, 0);
    const medio = armarPlano(23, periodo, H * 0.07, H * 0.16, 20, 44, true, 2.2);
    const cerca = armarPlano(37, periodo, H * 0.045, H * 0.11, 26, 62, true, 3);
    const planos: Plano[] = [
      { ...lejos, periodo, base: horizonte + H * 0.02, velocidad: 6, relleno: pintura("#191640"), tintaA: "#FFD27A", tintaB: "#9BE7FF", conVentanas: false },
      { ...medio, periodo, base: horizonte + H * 0.08, velocidad: 14, relleno: pintura("#11122C"), tintaA: acento ?? "#FFD27A", tintaB: acento2 ?? "#B9A8FF", conVentanas: true },
      ...(liviano ? [] : [{ ...cerca, periodo, base: H + 2, velocidad: 28, relleno: pintura("#07081A"), tintaA: acento ?? "#FFC36B", tintaB: acento2 ?? "#9BE7FF", conVentanas: true }]),
    ];
    // Cielo: del negro del espacio arriba a un violeta profundo en el horizonte.
    const cielo = Skia.Paint();
    cielo.setShader(Skia.Shader.MakeLinearGradient(Skia.Point(0, 0), Skia.Point(0, horizonte), [Skia.Color("#020309"), Skia.Color("#070A1C"), Skia.Color("#1A1442")], [0, 0.55, 1], TileMode.Clamp));
    const brilloHorizonte = Skia.Paint();
    brilloHorizonte.setBlendMode(BlendMode.Plus);
    brilloHorizonte.setShader(Skia.Shader.MakeRadialGradient(Skia.Point(W / 2, horizonte), W * 0.9, [Skia.Color(conAlfa(acento ?? "#7C5CFF", 0.38)), Skia.Color(conAlfa(acento ?? "#7C5CFF", 0.08)), Skia.Color(conAlfa(acento ?? "#7C5CFF", 0))], [0, 0.45, 1], TileMode.Clamp));
    const nebulosa = Skia.Paint();
    nebulosa.setBlendMode(BlendMode.Plus);
    nebulosa.setShader(Skia.Shader.MakeRadialGradient(Skia.Point(W * 0.78, H * 0.14), W * 0.6, [Skia.Color(conAlfa(acento2 ?? "#5DE4FF", 0.1)), Skia.Color(conAlfa(acento2 ?? "#A794FF", 0.06)), Skia.Color("rgba(0,0,0,0)")], [0, 0.5, 1], TileMode.Clamp));
    const nebulosa2 = Skia.Paint();
    nebulosa2.setBlendMode(BlendMode.Plus);
    nebulosa2.setShader(Skia.Shader.MakeRadialGradient(Skia.Point(W * 0.12, H * 0.5), W * 0.55, [Skia.Color("rgba(255,93,143,0.07)"), Skia.Color("rgba(0,0,0,0)")], [0, 1], TileMode.Clamp));
    // Bruma entre planos (da distancia).
    const bruma = Skia.Paint();
    bruma.setShader(Skia.Shader.MakeLinearGradient(Skia.Point(0, horizonte - H * 0.06), Skia.Point(0, horizonte + H * 0.1), [Skia.Color("rgba(26,20,66,0)"), Skia.Color("rgba(26,20,66,0.55)"), Skia.Color("rgba(26,20,66,0)")], [0, 0.5, 1], TileMode.Clamp));
    const r = azar(5);
    const estrellas = Array.from({ length: liviano ? 50 : 110 }, () => ({ x: r() * W, y: r() * horizonte * 0.95, rad: 0.4 + r() * r() * 1.5, base: 0.25 + r() * 0.6, vel: 0.6 + r() * 2.2, fase: r() * 6.28 }));
    const punto = pintura("#FFFFFF");
    const halo = Skia.Paint();
    halo.setBlendMode(BlendMode.Plus);
    halo.setShader(Skia.Shader.MakeRadialGradient(Skia.Point(0, 0), 1, [Skia.Color("rgba(200,210,255,0.6)"), Skia.Color("rgba(200,210,255,0)")], [0, 1], TileMode.Clamp));
    const ventana = pintura("#FFFFFF");
    const borde = pintura("#9B85FF", 0.45);
    return { horizonte, planos, cielo, brilloHorizonte, nebulosa, nebulosa2, bruma, estrellas, punto, halo, ventana, borde };
  }, [W, H, liviano, acento, acento2]);

  const dibujo = useDerivedValue(() => {
    const t = reloj.value / 1000;
    return createPicture(
      (c) => {
        c.drawRect(Skia.XYWHRect(0, 0, W, H), d.cielo);
        c.drawRect(Skia.XYWHRect(0, 0, W, H), d.nebulosa);
        c.drawRect(Skia.XYWHRect(0, 0, W, H), d.nebulosa2);
        // Estrellas que titilan; las más grandes con un halito.
        for (let i = 0; i < d.estrellas.length; i++) {
          const e = d.estrellas[i];
          const a = e.base * (0.55 + 0.45 * Math.sin(t * e.vel + e.fase));
          if (e.rad > 1.2) {
            d.halo.setAlphaf(a * 0.7);
            c.save();
            c.translate(e.x, e.y);
            c.scale(e.rad * 4, e.rad * 4);
            c.drawCircle(0, 0, 1, d.halo);
            c.restore();
          }
          d.punto.setAlphaf(a);
          c.drawCircle(e.x, e.y, e.rad, d.punto);
        }
        c.drawRect(Skia.XYWHRect(0, 0, W, H), d.brilloHorizonte);
        // Los planos de la ciudad, del más lejano al más cercano.
        for (let k = 0; k < d.planos.length; k++) {
          const p = d.planos[k];
          const corrimiento = (t * p.velocidad) % p.periodo;
          for (let copia = -1; copia <= 0; copia++) {
            c.save();
            c.translate(corrimiento + copia * p.periodo, p.base);
            c.drawPath(p.silueta, p.relleno);
            if (p.conVentanas) {
              c.drawPath(p.bordes, d.borde);
              d.ventana.setColor(Skia.Color(p.tintaA));
              d.ventana.setAlphaf(0.55 + 0.25 * Math.sin(t * 0.8 + k));
              c.drawPath(p.ventanasA, d.ventana);
              d.ventana.setColor(Skia.Color(p.tintaB));
              d.ventana.setAlphaf(0.4 + 0.3 * Math.sin(t * 1.3 + 2 + k));
              c.drawPath(p.ventanasB, d.ventana);
            }
            c.restore();
          }
          if (k === 0) c.drawRect(Skia.XYWHRect(0, 0, W, H), d.bruma);
        }
      },
      { width: W, height: H }
    );
  });
  return (
    <Canvas style={StyleSheet.absoluteFill}>
      <Picture picture={dibujo} />
    </Canvas>
  );
}

// ---------- Estela y onda del logo (Skia, siguen a la caída) ----------
// Caída: rápida al principio y frenando al llegar.
function salidaCaida(p: number) {
  "worklet";
  return 1 - Math.pow(1 - Math.min(1, Math.max(0, p)), 3.2);
}

function EstelaLogo({ ancho: W, alto: H, caida, onda }: { ancho: number; alto: number; caida: SharedValue<number>; onda: SharedValue<number> }) {
  const recursos = useMemo(() => {
    const anillo = Skia.Paint();
    anillo.setAntiAlias(true);
    anillo.setStyle(PaintStyle.Stroke);
    anillo.setBlendMode(BlendMode.Plus);
    const estela = Skia.Paint();
    estela.setAntiAlias(true);
    estela.setBlendMode(BlendMode.Plus);
    return { anillo, estela };
  }, []);
  const dibujo = useDerivedValue(() => {
    const p = caida.value;
    const o = onda.value;
    const cx = W / 2;
    const yFinal = H * ALTURA_LOGO;
    const y = -H * 0.12 + (yFinal + H * 0.12) * salidaCaida(p);
    return createPicture(
      (c) => {
        if (p > 0 && p < 1) {
          // Estela de cometa encima del logo, más larga cuanto más rápido cae.
          const largo = H * 0.28 * (1 - p);
          const ancho = 26 * (0.4 + 0.6 * p);
          recursos.estela.setShader(Skia.Shader.MakeLinearGradient(Skia.Point(cx, y - largo), Skia.Point(cx, y), [Skia.Color("rgba(155,133,255,0)"), Skia.Color("rgba(183,160,255,0.55)")], [0, 1], TileMode.Clamp));
          c.drawRRect(Skia.RRectXY(Skia.XYWHRect(cx - ancho / 2, y - largo, ancho, largo), ancho / 2, ancho / 2), recursos.estela);
        }
        if (o > 0 && o < 1) {
          // Onda de luz al asentarse.
          recursos.anillo.setColor(Skia.Color("#B9A8FF"));
          recursos.anillo.setAlphaf((1 - o) * 0.8);
          recursos.anillo.setStrokeWidth(10 * (1 - o) + 1);
          c.drawCircle(cx, yFinal, 60 + o * W * 0.42, recursos.anillo);
        }
      },
      { width: W, height: H }
    );
  });
  return (
    <Canvas style={StyleSheet.absoluteFill} pointerEvents="none">
      <Picture picture={dibujo} />
    </Canvas>
  );
}

interface Props {
  progreso: number; // 0 a 1
  etapa: string;
  onTerminada: () => void;
}

export default function PantallaCarga({ progreso, etapa, onTerminada }: Props) {
  const { width: W, height: H } = useWindowDimensions();
  const liviano = useLiviano();
  const temaHoy = useTemaHoy();
  const tema = temaHoy && capaVisible(temaHoy, "interfaz") ? temaHoy.tema : null;
  const barra = useState(() => new AnimadoRN.Value(0))[0];
  const salida = useState(() => new AnimadoRN.Value(1))[0];
  const tipOpacidad = useState(() => new AnimadoRN.Value(1))[0];
  const [porcentaje, setPorcentaje] = useState(0);
  const [tip, setTip] = useState(() => Math.floor(Math.random() * TIPS.length));
  const [anchoBarra, setAnchoBarra] = useState(0);
  const terminadaRef = useRef(false);

  // Caída del logo, onda al asentarse, nombre y flotación.
  const caida = useSharedValue(0);
  const onda = useSharedValue(0);
  const flota = useSharedValue(0);
  const nombre = useSharedValue(0);
  const destello = useSharedValue(0);
  useEffect(() => {
    caida.set(withTiming(1, { duration: CAIDA_MS, easing: Easing.linear }));
    onda.set(withDelay(CAIDA_MS * 0.82, withTiming(1, { duration: 900, easing: Easing.out(Easing.cubic) })));
    nombre.set(withDelay(CAIDA_MS * 0.75, withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) })));
    flota.set(withDelay(CAIDA_MS, withRepeat(withTiming(1, { duration: 2600, easing: Easing.inOut(Easing.sin) }), -1, true)));
    destello.set(withRepeat(withSequence(withTiming(0, { duration: 500 }), withTiming(1, { duration: 1300, easing: Easing.inOut(Easing.quad) })), -1));
  }, [caida, onda, nombre, flota, destello]);

  const estiloLogo = useAnimatedStyle(() => {
    const p = caida.value;
    const y = -H * 0.12 + (H * ALTURA_LOGO + H * 0.12) * salidaCaida(p);
    const escala = 0.3 + 0.7 * salidaCaida(p);
    // Al asentarse, un leve aplastón y vuelve.
    const asiento = p > 0.8 ? 1 + Math.sin(((p - 0.8) / 0.2) * Math.PI) * 0.05 : 1;
    return {
      opacity: Math.min(1, p * 6),
      transform: [{ translateY: y - 70 + (flota.value - 0.5) * 8 }, { scale: escala * asiento }],
    };
  });
  const estiloHalo = useAnimatedStyle(() => ({ opacity: Math.max(0, caida.value - 0.5) * 2 * (0.5 + 0.15 * Math.sin(flota.value * Math.PI)) }));
  const estiloNombre = useAnimatedStyle(() => ({ opacity: nombre.value, transform: [{ translateY: (1 - nombre.value) * 12 }] }));
  const estiloDestello = useAnimatedStyle(() => ({ transform: [{ translateX: -80 + destello.value * (anchoBarra + 160) }] }));

  // Número del porcentaje, siempre en sincronía con la barra.
  useEffect(() => {
    const id = barra.addListener(({ value }) => setPorcentaje(Math.round(value * 100)));
    return () => barra.removeListener(id);
  }, [barra]);

  // La barra avanza suave hacia el progreso real; al llegar a 100 % se desvanece
  // (nunca antes de que el logo termine de caer).
  const [inicio] = useState(() => Date.now());
  useEffect(() => {
    AnimadoRN.timing(barra, { toValue: progreso, duration: 450, easing: EasingRN.out(EasingRN.cubic), useNativeDriver: false }).start(({ finished }) => {
      if (finished && progreso >= 1 && !terminadaRef.current) {
        terminadaRef.current = true;
        const espera = Math.max(250, CAIDA_MS + 450 - (Date.now() - inicio));
        AnimadoRN.timing(salida, { toValue: 0, duration: 420, delay: espera, useNativeDriver: true }).start(() => onTerminada());
      }
    });
  }, [progreso, barra, salida, onTerminada, inicio]);

  // Un consejo distinto cada 3,6 s, con fundido.
  useEffect(() => {
    const id = setInterval(() => {
      AnimadoRN.timing(tipOpacidad, { toValue: 0, duration: 240, useNativeDriver: true }).start(() => {
        setTip((t) => (t + 1) % TIPS.length);
        AnimadoRN.timing(tipOpacidad, { toValue: 1, duration: 280, useNativeDriver: true }).start();
      });
    }, 3600);
    return () => clearInterval(id);
  }, [tipOpacidad]);

  const relleno = barra.interpolate({ inputRange: [0, 1], outputRange: ["0%", "100%"] });

  return (
    <AnimadoRN.View style={[StyleSheet.absoluteFill, styles.pantalla, { opacity: salida }]} pointerEvents="none">
      <Escena ancho={W} alto={H} liviano={liviano} acento={tema?.acento ?? null} acento2={tema?.acento2 ?? null} />
      <ParticulasTema z={1} />
      <EstelaLogo ancho={W} alto={H} caida={caida} onda={onda} />

      {/* Logo: cae desde arriba y queda flotando en el centro del cielo. */}
      <Animated.View style={[styles.logo, estiloLogo]}>
        <Animated.View style={[styles.halo, estiloHalo]} />
        <View>
          <Logo tam={140} />
          <AccesorioTemporada tam={140} />
        </View>
      </Animated.View>
      <Animated.View style={[styles.nombre, { top: H * ALTURA_LOGO + 84 }, estiloNombre]}>
        <Text style={styles.marca}>Prodigia</Text>
        <Text style={styles.lema}>Tu cabeza, en modo juego.</Text>
        {tema && <Text style={[styles.fiesta, { color: tema.acento }]}>{tema.nombre.toUpperCase()}</Text>}
      </Animated.View>

      {/* Abajo: un velo para que se lea sobre la ciudad, el progreso y un consejo. */}
      <LinearGradient colors={["rgba(5,6,15,0)", "rgba(5,6,15,0.82)", "rgba(5,6,15,0.95)"]} locations={[0, 0.45, 1]} style={styles.velo} />
      <View style={styles.abajo}>
        <View style={styles.filaProgreso}>
          <Text style={styles.etapa} numberOfLines={1}>
            {etapa}
          </Text>
          <Text style={styles.porcentaje}>{porcentaje}%</Text>
        </View>
        <View style={styles.barraFondo} onLayout={(e) => setAnchoBarra(e.nativeEvent.layout.width)}>
          <AnimadoRN.View style={[styles.barraRelleno, { width: relleno }]}>
            <LinearGradient colors={tema ? [tema.acento, tema.acento2, tema.acento] : [color.primario, "#B79CFF", color.logro]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={StyleSheet.absoluteFill} />
            <Animated.View style={[styles.destello, estiloDestello]}>
              <LinearGradient colors={["rgba(255,255,255,0)", "rgba(255,255,255,0.75)", "rgba(255,255,255,0)"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={StyleSheet.absoluteFill} />
            </Animated.View>
          </AnimadoRN.View>
        </View>

        <AnimadoRN.View style={[styles.tip, { opacity: tipOpacidad }]}>
          <Text style={styles.tipEtiqueta}>CONSEJO</Text>
          <Text style={styles.tipTexto}>{TIPS[tip]}</Text>
        </AnimadoRN.View>
      </View>
    </AnimadoRN.View>
  );
}

const styles = StyleSheet.create({
  pantalla: { backgroundColor: "#020309", zIndex: 100, elevation: 100 },
  logo: { position: "absolute", top: 0, left: 0, right: 0, height: 140, alignItems: "center", justifyContent: "center" },
  halo: { position: "absolute", width: 170, height: 170, borderRadius: 85, backgroundColor: "rgba(124,92,255,0.28)", boxShadow: "0px 0px 70px rgba(124,92,255,0.7)" },
  nombre: { position: "absolute", left: 0, right: 0, alignItems: "center", gap: 2 },
  marca: { color: color.texto, fontSize: 36, fontFamily: fuente.display, letterSpacing: -0.5, textShadowColor: "rgba(124,92,255,0.6)", textShadowRadius: 18 },
  lema: { color: color.texto2, fontSize: 14 },
  fiesta: { marginTop: 6, fontSize: 11, fontFamily: fuente.display, letterSpacing: 2.4 },
  velo: { position: "absolute", left: 0, right: 0, bottom: 0, height: 260 },
  abajo: { position: "absolute", left: 0, right: 0, bottom: 0, paddingHorizontal: 30, paddingBottom: 46, gap: 10 },
  filaProgreso: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", gap: 12 },
  etapa: { flex: 1, color: color.texto2, fontSize: 13, fontFamily: fuente.cuerpoFuerte },
  porcentaje: { color: color.texto, fontFamily: mono, fontSize: 15 },
  barraFondo: { height: 6, borderRadius: 3, backgroundColor: "rgba(255,255,255,0.09)", overflow: "hidden" },
  barraRelleno: { height: "100%", borderRadius: 3, overflow: "hidden", boxShadow: "0px 0px 10px rgba(155,133,255,0.8)" },
  destello: { position: "absolute", top: 0, bottom: 0, width: 80 },
  tip: { marginTop: 8, gap: 4, minHeight: 64 },
  tipEtiqueta: { color: color.logro, fontSize: 10, fontFamily: fuente.display, letterSpacing: 2 },
  tipTexto: { color: "rgba(244,246,251,0.78)", fontSize: 13, lineHeight: 19 },
});
