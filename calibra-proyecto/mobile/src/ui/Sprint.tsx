import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Pressable, StyleSheet, View, type LayoutChangeEvent } from "react-native";
import Animated, {
  cancelAnimation,
  Easing,
  FadeIn,
  FadeOut,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
  ZoomIn,
  type SharedValue,
} from "react-native-reanimated";
import { sonar, vibrar } from "~/lib/efectos";
import { useLiviano } from "~/lib/rendimiento";
import { brillo, color, conAlfa, fuente, radio } from "~/tema";
import Anillo from "./Anillo";
import { IconoCerrar, IconoEscudo, IconoLlama } from "./Iconos";
import Texto from "./Texto";

// Piezas del sprint (02-SISTEMA-VISUAL.md §7.2 y §9). Reglas de rendimiento: el
// reloj corre en el hilo nativo (el anillo no hace redibujar la pantalla) y solo la
// cabecera se actualiza para el número de segundos, 4 veces por segundo.

// ---------- Reloj ----------

// Reloj del sprint: arranca cuando `inicio` deja de ser null y avisa `onFin` al
// llegar a 0. `detenido` lo congela (al terminar la partida).
export function useReloj(inicio: number | null, totalMs: number, onFin: () => void, detenido = false) {
  const progreso = useSharedValue(1);
  const onFinRef = useRef(onFin);
  useEffect(() => {
    onFinRef.current = onFin;
  }, [onFin]);
  useEffect(() => {
    if (inicio == null) return;
    if (detenido) {
      cancelAnimation(progreso);
      return;
    }
    const restante = Math.max(0, totalMs - (Date.now() - inicio));
    progreso.set(restante / totalMs);
    progreso.set(withTiming(0, { duration: restante, easing: Easing.linear }));
    const t = setTimeout(() => onFinRef.current(), restante);
    return () => clearTimeout(t);
  }, [inicio, totalMs, detenido, progreso]);
  return progreso;
}

function Segundos({ inicio, totalMs, detenido }: { inicio: number | null; totalMs: number; detenido: boolean }) {
  const [s, setS] = useState(Math.ceil(totalMs / 1000));
  useEffect(() => {
    if (inicio == null || detenido) return;
    const tic = () => setS(Math.max(0, Math.ceil((totalMs - (Date.now() - inicio)) / 1000)));
    tic();
    const id = setInterval(tic, 250);
    return () => clearInterval(id);
  }, [inicio, totalMs, detenido]);
  return (
    <Texto v="mono" tam={13} c={s <= 10 ? color.error : color.texto}>
      0:{String(s).padStart(2, "0")}
    </Texto>
  );
}

// ---------- Llama de la racha (RachaFuego.tsx de la web, más grande y viva) ----------

const TIERS = [
  { desde: 2, tam: 26, texto: 18 },
  { desde: 4, tam: 32, texto: 21 },
  { desde: 6, tam: 38, texto: 24 },
  { desde: 8, tam: 46, texto: 28 },
  { desde: 12, tam: 54, texto: 32 },
];

function Brasa({ i, activa }: { i: number; activa: boolean }) {
  const t = useSharedValue(0);
  useEffect(() => {
    if (!activa) return;
    t.set(withDelay(i * 260, withRepeat(withTiming(1, { duration: 900 + i * 120, easing: Easing.out(Easing.quad) }), -1)));
    return () => cancelAnimation(t);
  }, [t, i, activa]);
  const estilo = useAnimatedStyle(() => ({
    opacity: 1 - t.value,
    transform: [{ translateY: -t.value * (26 + i * 6) }, { translateX: Math.sin(t.value * 6 + i) * 5 }, { scale: 1 - t.value * 0.6 }],
  }));
  return <Animated.View style={[styles.brasa, { left: 10 + ((i * 7) % 18) }, estilo]} />;
}

export function RachaFuego({ racha }: { racha: number }) {
  const liviano = useLiviano();
  const pop = useSharedValue(0.4);
  const vaiven = useSharedValue(0);
  const tier = TIERS.reduce((acc, t) => (racha >= t.desde ? t : acc), TIERS[0]);
  useEffect(() => {
    if (racha < 2) return;
    // Igual que la web: scale 0.4 → 1.55 → 1 y un giro, en cada acierto.
    pop.set(withSequence(withTiming(1.55, { duration: 180, easing: Easing.out(Easing.back(2)) }), withSpring(1, { damping: 7, stiffness: 260 })));
  }, [racha, pop]);
  useEffect(() => {
    if (racha < 2) return;
    vaiven.set(withRepeat(withSequence(withTiming(1, { duration: 260 }), withTiming(-1, { duration: 300 })), -1, true));
    return () => cancelAnimation(vaiven);
  }, [racha >= 2, vaiven]); // eslint-disable-line react-hooks/exhaustive-deps
  const estiloPop = useAnimatedStyle(() => ({ transform: [{ scale: pop.value }, { rotate: `${(1 - Math.min(1, pop.value)) * -10}deg` }] }));
  const estiloLlama = useAnimatedStyle(() => ({ transform: [{ scaleY: 1 + vaiven.value * 0.07 }, { scaleX: 1 - vaiven.value * 0.04 }, { rotate: `${vaiven.value * 3}deg` }] }));
  if (racha < 2) return <View style={{ width: 76 }} />;
  return (
    <Animated.View style={[styles.racha, racha >= 5 && { boxShadow: brillo(color.racha, 22, 0.55) }, estiloPop]}>
      {racha >= 5 && !liviano && [0, 1, 2, 3].map((i) => <Brasa key={i} i={i} activa />)}
      <Animated.View style={[{ transformOrigin: "bottom" }, estiloLlama]}>
        <IconoLlama tam={tier.tam} estado={racha >= 6 ? "llamas" : "encendida"} />
      </Animated.View>
      <Texto style={{ fontFamily: fuente.display, fontSize: tier.texto, color: color.racha }}>{racha}</Texto>
    </Animated.View>
  );
}

// ---------- Cabecera ----------

export function Cabecera({
  onSalir,
  inicio,
  totalMs,
  combo,
  acento,
  progreso,
  detenido = false,
}: {
  onSalir: () => void;
  inicio: number | null;
  totalMs: number;
  combo: number;
  acento: string;
  progreso: SharedValue<number>;
  detenido?: boolean;
}) {
  return (
    <View style={styles.cabecera}>
      <Pressable onPress={onSalir} hitSlop={12} style={styles.x} accessibilityLabel="Salir de la partida">
        <IconoCerrar tam={16} c={color.texto2} />
      </Pressable>
      <Anillo valor={1} externo={progreso} tam={58} grosor={5} acento={acento}>
        <Segundos inicio={inicio} totalMs={totalMs} detenido={detenido} />
      </Anillo>
      <View style={{ width: 92, alignItems: "flex-end" }}>
        <RachaFuego racha={combo} />
      </View>
    </View>
  );
}

export function Progreso({ resultados, total, acento, escudos }: { resultados: boolean[]; total: number; acento: string; escudos: number }) {
  return (
    <View style={styles.progreso}>
      <View style={styles.puntos}>
        {Array.from({ length: total }, (_, i) => {
          if (i < resultados.length) return <Animated.View key={i} entering={ZoomIn.duration(220)} style={[styles.punto, { backgroundColor: resultados[i] ? color.correcto : color.error }]} />;
          if (i === resultados.length) return <View key={i} style={[styles.punto, { backgroundColor: acento, transform: [{ scale: 1.3 }] }]} />;
          return <View key={i} style={styles.punto} />;
        })}
      </View>
      <View style={styles.escudos}>
        {Array.from({ length: escudos }, (_, i) => (
          <IconoEscudo key={i} tam={16} />
        ))}
      </View>
    </View>
  );
}

// Tarjeta del problema. `sello` y `sacudida` se disparan desde el sprint.
export function TarjetaProblema({
  children,
  acento,
  combo,
  feedback,
  sello,
  sacudida,
}: {
  children: ReactNode;
  acento: string;
  combo: number;
  feedback: "idle" | "correcto" | "incorrecto";
  sello: SharedValue<number>;
  sacudida: SharedValue<number>;
}) {
  const [lado, setLado] = useState(0);
  const giro = useSharedValue(0);
  const enLlamas = combo >= 5;
  const rapido = combo >= 10;
  useEffect(() => {
    if (!enLlamas) {
      cancelAnimation(giro);
      return;
    }
    giro.set(withRepeat(withTiming(giro.value + 1, { duration: rapido ? 1400 : 2600, easing: Easing.linear }), -1));
    return () => cancelAnimation(giro);
  }, [enLlamas, rapido, giro]);
  const estiloGiro = useAnimatedStyle(() => ({ transform: [{ rotate: `${giro.value * 360}deg` }] }));
  const estilo = useAnimatedStyle(() => ({ transform: [{ scale: sello.value }, { translateX: sacudida.value }] }));
  const colorEstado = feedback === "correcto" ? color.correcto : feedback === "incorrecto" ? color.error : acento;
  return (
    <Animated.View
      onLayout={(e: LayoutChangeEvent) => setLado(Math.hypot(e.nativeEvent.layout.width, e.nativeEvent.layout.height))}
      style={[styles.marco, { borderColor: enLlamas && feedback === "idle" ? "transparent" : conAlfa(colorEstado, feedback === "idle" ? 0.55 : 1), boxShadow: brillo(colorEstado, 30, enLlamas ? 0.45 : 0.22) }, estilo]}
    >
      {enLlamas && feedback === "idle" && lado > 0 && (
        <Animated.View style={[{ position: "absolute", width: lado, height: lado, left: "50%", top: "50%", marginLeft: -lado / 2, marginTop: -lado / 2 }, estiloGiro]}>
          <LinearGradient colors={[acento, color.logro, color.racha, acento]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
        </Animated.View>
      )}
      <View style={styles.tarjeta}>{children}</View>
    </Animated.View>
  );
}

// "+12" que sube y se desvanece.
export function Flotante({ texto, c = color.correcto }: { texto: string; c?: string }) {
  const y = useSharedValue(0);
  useEffect(() => {
    y.set(withTiming(1, { duration: 1000, easing: Easing.out(Easing.cubic) }));
  }, [y]);
  const estilo = useAnimatedStyle(() => ({ opacity: 1 - y.value * 0.9, transform: [{ translateY: -46 * y.value }, { scale: 0.8 + Math.min(1, y.value * 3) * 0.4 }] }));
  return (
    <Animated.View pointerEvents="none" exiting={FadeOut} style={[styles.flotante, estilo]}>
      <Texto style={{ fontFamily: fuente.mono, fontSize: 22, color: c }}>{texto}</Texto>
    </Animated.View>
  );
}

// Acierto (sello) y error (sacudida: 6 dp, 3 ciclos, 240 ms).
export function animarAcierto(sello: SharedValue<number>) {
  sello.set(withSequence(withTiming(1.07, { duration: 90 }), withSpring(1, { damping: 8, stiffness: 300 })));
}
export function animarError(sacudida: SharedValue<number>) {
  sacudida.set(withSequence(withTiming(-8, { duration: 40 }), withTiming(8, { duration: 40 }), withTiming(-6, { duration: 40 }), withTiming(6, { duration: 40 }), withTiming(-3, { duration: 40 }), withTiming(0, { duration: 40 })));
}

// ---------- "¿Preparado? 3, 2, 1… ¡Ya!" ----------

const PASOS = ["¿Preparado?", "3", "2", "1", "¡Ya!"];

export function CuentaInicio({ acento, onListo }: { acento: string; onListo: () => void }) {
  const [paso, setPaso] = useState(0);
  const onListoRef = useRef(onListo);
  useEffect(() => {
    onListoRef.current = onListo;
  }, [onListo]);
  useEffect(() => {
    if (paso >= 1 && paso <= 3) {
      sonar("cuenta");
      vibrar.ligero();
    }
    if (paso === 4) {
      sonar("ya");
      vibrar.fuerte();
    }
    if (paso >= PASOS.length) {
      onListoRef.current();
      return;
    }
    const t = setTimeout(() => setPaso((p) => p + 1), paso === 0 ? 800 : paso === 4 ? 420 : 650);
    return () => clearTimeout(t);
  }, [paso]);
  if (paso >= PASOS.length) return null;
  const texto = PASOS[paso];
  const numero = /^\d$/.test(texto);
  return (
    <Animated.View exiting={FadeOut.duration(180)} style={styles.cuenta} pointerEvents="none">
      <Animated.View key={texto} entering={ZoomIn.duration(240)}>
        <Texto
          style={{
            fontFamily: numero ? fuente.mono : fuente.display,
            fontSize: numero ? 110 : 40,
            color: texto === "¡Ya!" ? color.logro : numero ? acento : color.texto,
            textShadowColor: acento,
            textShadowRadius: 26,
            textAlign: "center",
          }}
        >
          {texto}
        </Texto>
      </Animated.View>
    </Animated.View>
  );
}

// ---------- Salida al terminar ----------

// Al terminar, la partida se aleja y se desvanece (en vez de cortar de golpe) y
// aparece "¡Tiempo!" o "¡Listo!" mientras se guarda.
export function useSalida() {
  const t = useSharedValue(0);
  const estiloJuego = useAnimatedStyle(() => ({ opacity: 1 - t.value, transform: [{ scale: 1 - t.value * 0.12 }, { translateY: t.value * 18 }] }));
  const estiloTeclado = useAnimatedStyle(() => ({ opacity: 1 - Math.min(1, t.value * 1.8), transform: [{ translateY: t.value * 80 }] }));
  function salir(alTerminar?: () => void) {
    t.set(withTiming(1, { duration: 650, easing: Easing.inOut(Easing.cubic) }, (fin) => {
      if (fin && alTerminar) runOnJS(alTerminar)();
    }));
  }
  return { estiloJuego, estiloTeclado, salir };
}

export function CartelFinal({ texto, nota }: { texto: string; nota: string }) {
  return (
    <Animated.View entering={FadeIn.delay(250).duration(300)} style={styles.cuenta} pointerEvents="none">
      <Animated.View entering={ZoomIn.delay(250).duration(320)}>
        <Texto style={{ fontFamily: fuente.display, fontSize: 46, color: color.texto, textAlign: "center" }}>{texto}</Texto>
      </Animated.View>
      <Texto v="nota" centro style={{ marginTop: 8 }}>
        {nota}
      </Texto>
    </Animated.View>
  );
}

// ---------- Teclado ----------

function Tecla({ texto, onPress, deshabilitado, apagado }: { texto: string; onPress: () => void; deshabilitado?: boolean; apagado?: boolean }) {
  const y = useSharedValue(0);
  const estilo = useAnimatedStyle(() => ({ transform: [{ translateY: y.value }] }));
  return (
    <Pressable
      disabled={deshabilitado}
      onPressIn={() => {
        y.set(withTiming(4, { duration: 50 }));
        vibrar.seleccion();
        sonar("tecla");
      }}
      onPressOut={() => y.set(withSpring(0, { damping: 10, stiffness: 400 }))}
      onPress={onPress}
      style={[styles.teclaBase, deshabilitado && { opacity: 0.45 }]}
    >
      <Animated.View style={[styles.tecla, estilo]}>
        <Texto style={{ fontFamily: fuente.mono, fontSize: apagado ? 20 : 25, color: apagado ? color.texto2 : color.texto }}>{texto}</Texto>
      </Animated.View>
    </Pressable>
  );
}

export function Teclado({
  onDigito,
  onBorrar,
  onMenos,
  deshabilitado,
  teclaIzquierda = "−",
}: {
  onDigito: (d: string) => void;
  onBorrar: () => void;
  onMenos: () => void;
  deshabilitado?: boolean;
  // La tecla de abajo a la izquierda cambia según el tema: −, coma decimal o /.
  teclaIzquierda?: string;
}) {
  return (
    <View style={{ gap: 8 }}>
      {[
        ["1", "2", "3"],
        ["4", "5", "6"],
        ["7", "8", "9"],
      ].map((fila) => (
        <View key={fila[0]} style={styles.filaTeclas}>
          {fila.map((d) => (
            <Tecla key={d} texto={d} onPress={() => onDigito(d)} deshabilitado={deshabilitado} />
          ))}
        </View>
      ))}
      <View style={styles.filaTeclas}>
        <Tecla texto={teclaIzquierda} apagado onPress={onMenos} deshabilitado={deshabilitado} />
        <Tecla texto="0" onPress={() => onDigito("0")} deshabilitado={deshabilitado} />
        <Tecla texto="⌫" apagado onPress={onBorrar} deshabilitado={deshabilitado} />
      </View>
    </View>
  );
}

// Barra del rival: el fantasma avanza al ritmo exacto de sus respuestas guardadas
// (se calcula acá, así la pantalla no se redibuja entera por esto).
export function BarraRival({
  nombre,
  total,
  yo,
  inicio,
  respuestasFantasma,
  enVivo,
}: {
  nombre: string;
  total: number;
  yo: number;
  inicio: number | null;
  respuestasFantasma: { timeMs: number }[] | null;
  enVivo: number | null;
}) {
  const [fantasma, setFantasma] = useState(0);
  useEffect(() => {
    if (!respuestasFantasma || inicio == null) return;
    const acumulado = respuestasFantasma.reduce<number[]>((acc, r) => [...acc, (acc[acc.length - 1] ?? 0) + r.timeMs], []);
    const id = setInterval(() => setFantasma(acumulado.filter((t) => t <= Date.now() - inicio).length), 300);
    return () => clearInterval(id);
  }, [respuestasFantasma, inicio]);
  const respondidos = respuestasFantasma ? fantasma : enVivo;
  if (respondidos == null) return null;
  const texto = yo > respondidos ? `Le vas ganando a ${nombre}` : yo < respondidos ? `${nombre} va adelante` : `Parejos con ${nombre}`;
  return (
    <View style={styles.rival}>
      <Texto v="nota" tam={11} c={color.texto2}>
        {respuestasFantasma ? "👻 " : "⚔ "}
        {texto}
      </Texto>
      <View style={styles.puntos}>
        {Array.from({ length: total }, (_, i) => (
          <View key={i} style={[styles.puntoChico, i < respondidos && { backgroundColor: color.error }]} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cabecera: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingTop: 4, minHeight: 66 },
  x: { width: 38, height: 38, borderRadius: 19, backgroundColor: color.surface1, borderWidth: 1, borderColor: color.border, alignItems: "center", justifyContent: "center" },
  racha: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, backgroundColor: conAlfa(color.racha, 0.16) },
  brasa: { position: "absolute", bottom: 14, width: 5, height: 5, borderRadius: 3, backgroundColor: "#FFD36B" },
  progreso: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 18, marginTop: 10 },
  puntos: { flexDirection: "row", gap: 6 },
  punto: { width: 10, height: 10, borderRadius: 5, backgroundColor: color.surface3 },
  puntoChico: { width: 7, height: 7, borderRadius: 4, backgroundColor: color.surface3 },
  escudos: { flexDirection: "row", gap: 3 },
  marco: { borderRadius: radio.sprint, borderWidth: 2, overflow: "hidden" },
  tarjeta: { backgroundColor: color.surface1, borderRadius: radio.sprint - 2, margin: 2, paddingVertical: 26, paddingHorizontal: 16, alignItems: "center", gap: 10 },
  flotante: { position: "absolute", top: 8, right: 18 },
  cuenta: { position: "absolute", left: 0, right: 0, top: 0, bottom: 0, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(5,7,13,0.78)", zIndex: 50 },
  filaTeclas: { flexDirection: "row", gap: 8 },
  teclaBase: { flex: 1, height: 60, borderRadius: 14, backgroundColor: "#080B17" },
  tecla: { height: 56, borderRadius: 14, backgroundColor: color.surface2, borderWidth: 1, borderColor: color.border, alignItems: "center", justifyContent: "center" },
  rival: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginHorizontal: 18, marginTop: 8, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 12, backgroundColor: conAlfa(color.error, 0.08), borderWidth: 1, borderColor: conAlfa(color.error, 0.3) },
});
