import { useEffect, useState } from "react";
import { Dimensions, Pressable, StyleSheet, View } from "react-native";
import Animated, {
  cancelAnimation,
  Easing,
  FadeIn,
  FadeInDown,
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
import { CAPSULAS, CATALOGO_NUEVO, ciudadDe, COLOR_RAREZA, coloresCapsula, NOMBRE_RAREZA, type Rareza } from "@/lib/recompensas/catalogo";
import { sonar, vibrar } from "~/lib/efectos";
import { fijarChispas, recargarJugador } from "~/lib/jugador";
import { abrirCapsula, recargarCosmeticos, recargarPendientes, type Capsula as DatosCapsula, type PremioCapsula } from "~/lib/recompensas";
import { supabase } from "~/lib/supabase";
import { color, conAlfa, fuente } from "~/tema";
import Boton3D from "../Boton3D";
import { IconoChispa, IconoCopo, IconoEscudo, IconoReloj } from "../Iconos";
import NumeroAnimado from "../NumeroAnimado";
import Texto from "../Texto";
import Capsula from "./Capsula";
import VistaCosmetico from "./VistaCosmetico";

// Abrir una cápsula: cae, queda latiendo, la tocas, tiembla, se abre y muestra el
// premio. El premio lo sortea la base (abrir_capsula, 0249) mientras tiembla.
const { height: ALTO } = Dimensions.get("window");
type Fase = "cae" | "espera" | "abre" | "premio";

function Estrella({ i, estallido, colores }: { i: number; estallido: SharedValue<number>; colores: [string, string] }) {
  const angulo = (i / 18) * Math.PI * 2;
  const distancia = 90 + (i % 3) * 30;
  const estilo = useAnimatedStyle(() => {
    const t = estallido.value;
    return {
      opacity: t <= 0 ? 0 : t < 0.7 ? 1 : (1 - t) / 0.3,
      transform: [{ translateX: Math.cos(angulo) * distancia * t }, { translateY: Math.sin(angulo) * distancia * t }, { rotate: `${t * 200}deg` }, { scale: 0.5 + Math.sin(t * Math.PI) * 0.8 }],
    };
  });
  return <Animated.View style={[styles.estrella, { backgroundColor: i % 2 ? colores[0] : colores[1] }, estilo]} />;
}

function itemDe(slug: string | null) {
  return slug ? CATALOGO_NUEVO.find((x) => x.item === slug) ?? null : null;
}

function Premio({ p }: { p: PremioCapsula }) {
  if (p.premio === "chispas" || p.convertido) {
    return (
      <View style={{ alignItems: "center", gap: 6 }}>
        {p.convertido && (
          <Texto v="nota" centro>
            Ya tenías {p.nombre}: se convirtió en Chispas.
          </Texto>
        )}
        <View style={styles.bonus}>
          <IconoChispa tam={28} />
          <NumeroAnimado valor={p.cantidad} desde={0} prefijo="+" v="mono" c={color.logro} duracion={1000} estilo={{ fontSize: 32 }} onTic={() => sonar("moneda")} />
        </View>
      </View>
    );
  }
  if (p.premio === "hielo" || p.premio === "tiempo_extra" || p.premio === "escudo") {
    const nombre = p.premio === "hielo" ? "1 hielo" : p.premio === "escudo" ? "1 escudo" : "+3 segundos";
    return (
      <View style={{ alignItems: "center", gap: 8 }}>
        <View style={styles.icono}>{p.premio === "hielo" ? <IconoCopo tam={46} c="#BDEBFF" /> : p.premio === "escudo" ? <IconoEscudo tam={48} /> : <IconoReloj tam={46} c={color.logro} />}</View>
        <Texto v="h2" centro>
          {nombre}
        </Texto>
      </View>
    );
  }
  const it = itemDe(p.slug);
  const rareza = (p.rareza ?? "raro") as Rareza;
  const categoria = it?.categoria ?? (p.slug?.startsWith("marco_") ? "marco" : "titulo");
  const valor = it?.valor ?? (p.slug?.replace(/^marco_/, "") ?? "");
  return (
    <View style={{ alignItems: "center", gap: 8 }}>
      <View style={[styles.icono, { borderColor: COLOR_RAREZA[rareza], boxShadow: `0px 0px 24px ${conAlfa(COLOR_RAREZA[rareza], 0.6)}` }]}>
        <VistaCosmetico categoria={categoria} valor={valor} tam={64} />
      </View>
      <Texto style={{ fontFamily: fuente.cuerpoBold, fontSize: 11, letterSpacing: 1.2, color: COLOR_RAREZA[rareza] }}>{NOMBRE_RAREZA[rareza].toUpperCase()}</Texto>
      <Texto v="h2" centro>
        {p.nombre}
      </Texto>
      <Texto v="nota" centro>
        Ya es tuyo. Póntelo desde la tienda.
      </Texto>
    </View>
  );
}

export default function AbrirCapsula({ capsula, onCerrar }: { capsula: DatosCapsula; onCerrar: () => void }) {
  const colores = coloresCapsula(capsula.tipo, capsula.mundo);
  const [fase, setFase] = useState<Fase>("cae");
  const [premio, setPremio] = useState<PremioCapsula | null>(null);
  const [error, setError] = useState(false);
  const caida = useSharedValue(-ALTO * 0.7);
  const latido = useSharedValue(0);
  const temblor = useSharedValue(0);
  const abierta = useSharedValue(0);
  const estallido = useSharedValue(0);

  useEffect(() => {
    sonar("swoosh");
    caida.set(
      withSpring(0, { damping: 9, stiffness: 120, mass: 1.1 }, (fin) => {
        if (fin) runOnJS(setFase)("espera");
      })
    );
    const t = setTimeout(() => vibrar.medio(), 520);
    return () => clearTimeout(t);
  }, [caida]);

  useEffect(() => {
    if (fase !== "espera") return;
    latido.set(withRepeat(withSequence(withTiming(1, { duration: 650 }), withTiming(0, { duration: 650 })), -1));
    return () => cancelAnimation(latido);
  }, [fase, latido]);

  async function abrir() {
    if (fase !== "espera") return;
    setFase("abre");
    cancelAnimation(latido);
    vibrar.fuerte();
    sonar("combo");
    temblor.set(withRepeat(withSequence(withTiming(-7, { duration: 45 }), withTiming(7, { duration: 45 })), -1, true));
    try {
      const [r] = await Promise.all([abrirCapsula(supabase, capsula.id), new Promise((res) => setTimeout(res, 450))]);
      cancelAnimation(temblor);
      temblor.set(withTiming(0, { duration: 60 }));
      setPremio(r);
      fijarChispas(r.puntos_total);
      abierta.set(withTiming(1, { duration: 450, easing: Easing.out(Easing.cubic) }));
      estallido.set(
        withDelay(
          40,
          withTiming(1, { duration: 900, easing: Easing.out(Easing.cubic) }, (fin) => {
            if (fin) runOnJS(setFase)("premio");
          })
        )
      );
      sonar("nivel_cuenta");
      vibrar.exito();
      const { data } = await supabase.auth.getSession();
      if (data.session) recargarCosmeticos(data.session.user.id);
      recargarPendientes();
      recargarJugador();
    } catch {
      cancelAnimation(temblor);
      temblor.set(0);
      setError(true);
      setFase("premio");
    }
  }

  useEffect(() => {
    if (fase === "premio" && premio) sonar("recompensa");
  }, [fase, premio]);

  const estiloCapsula = useAnimatedStyle(() => ({ transform: [{ translateY: caida.value }, { translateX: temblor.value }, { scale: 1 + latido.value * 0.06 }] }));
  const estiloBrillo = useAnimatedStyle(() => ({ opacity: Math.max(latido.value * 0.35, estallido.value < 1 ? estallido.value : 0), transform: [{ scale: 0.6 + estallido.value * 2 + latido.value * 0.15 }] }));
  const nombre = CAPSULAS[capsula.tipo]?.nombre ?? "Cápsula";
  const ciudad = ciudadDe(capsula.mundo);

  return (
    <Animated.View entering={FadeIn.duration(250)} exiting={FadeOut.duration(220)} style={styles.capa}>
      <View style={styles.centro}>
        {fase !== "premio" && (
          <Animated.View entering={FadeInDown.duration(300)} style={{ alignItems: "center", gap: 4, marginBottom: 26 }}>
            <Texto v="micro" c={colores[1]}>
              {ciudad ? `${nombre} · ${ciudad.nombre}` : nombre}
            </Texto>
            <Texto v="h2" centro>
              {fase === "abre" ? "Abriendo…" : "¡Tócala para abrirla!"}
            </Texto>
          </Animated.View>
        )}
        <View style={styles.escenario}>
          <Animated.View style={[styles.brillo, { backgroundColor: conAlfa(colores[1], 0.45) }, estiloBrillo]} pointerEvents="none" />
          {Array.from({ length: 18 }, (_, i) => (
            <Estrella key={i} i={i} estallido={estallido} colores={colores} />
          ))}
          <Pressable onPress={abrir} disabled={fase !== "espera"} hitSlop={30}>
            <Animated.View style={estiloCapsula}>
              <Capsula abierta={abierta} colores={colores} />
            </Animated.View>
          </Pressable>
        </View>
        {fase === "premio" && (
          <View style={{ alignItems: "center", gap: 10, marginTop: -30, alignSelf: "stretch" }}>
            <Animated.View entering={ZoomIn.springify().damping(10)} style={{ alignItems: "center" }}>
              {error || !premio ? (
                <Texto v="h3" centro>
                  No se pudo abrir ahora. Inténtalo de nuevo con conexión.
                </Texto>
              ) : (
                <Premio p={premio} />
              )}
            </Animated.View>
            <Animated.View entering={FadeInDown.delay(500).duration(300)} style={{ alignSelf: "stretch", marginTop: 8 }}>
              <Boton3D titulo="¡Genial!" brillo onPress={onCerrar} />
            </Animated.View>
          </View>
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  capa: { ...StyleSheet.absoluteFill, backgroundColor: "rgba(3,4,10,0.88)", zIndex: 300, elevation: 300, alignItems: "center", justifyContent: "center" },
  centro: { width: "86%", maxWidth: 380, alignItems: "center" },
  escenario: { width: 260, height: 240, alignItems: "center", justifyContent: "center" },
  brillo: { position: "absolute", width: 170, height: 170, borderRadius: 85 },
  estrella: { position: "absolute", width: 9, height: 9, borderRadius: 2 },
  bonus: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 18, paddingVertical: 8, borderRadius: 999, borderWidth: 1, borderColor: conAlfa(color.logro, 0.5), backgroundColor: conAlfa(color.logro, 0.12) },
  icono: { width: 104, height: 104, borderRadius: 28, borderWidth: 2, borderColor: color.border, backgroundColor: color.surface2, alignItems: "center", justifyContent: "center" },
});
