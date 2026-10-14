import { LinearGradient } from "expo-linear-gradient";
import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, { Easing, FadeInDown, useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from "react-native-reanimated";
import { useJugador } from "~/lib/jugador";
import { useVencimientoPro } from "~/lib/pro";
import { textoRestantePro } from "@/lib/pro/vencimiento";
import { IconoTrazo } from "~/ui/Iconos";
import { PlanesPro } from "~/ui/pagos/Vitrina";
import { PantallaApilada } from "~/ui/Pantalla";
import { BENEFICIOS_PRO } from "@/lib/pro/beneficios";
import Tarjeta from "~/ui/Tarjeta";
import Texto from "~/ui/Texto";
import { color, fuente } from "~/tema";

// Prodigia Pro (03-PANTALLAS §4.13). Rediseño 2026-10-14: los dos planes arriba, como en
// la web (ui/pagos/Vitrina); el pago se hace en la web hasta que llegue Google Play
// Billing. La lista de beneficios es la misma de la web (src/lib/pro/beneficios.ts).

export default function Pro() {
  const { plan } = useJugador();
  const vence = useVencimientoPro();
  const brilla = useSharedValue(0);
  useEffect(() => {
    brilla.set(withRepeat(withSequence(withTiming(1, { duration: 1600, easing: Easing.inOut(Easing.quad) }), withTiming(0, { duration: 1600 })), -1));
  }, [brilla]);
  const halo = useAnimatedStyle(() => ({ opacity: 0.35 + brilla.value * 0.5, transform: [{ scale: 0.95 + brilla.value * 0.1 }] }));

  return (
    <PantallaApilada titulo="Prodigia Pro">
      <View style={styles.heroe}>
        <Animated.View style={[styles.halo, halo]} />
        <LinearGradient colors={[color.primario, "#B07CFF", color.logro]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.sello}>
          <Texto style={{ fontFamily: fuente.display, fontSize: 30, color: "#fff", letterSpacing: 2 }}>PRO</Texto>
        </LinearGradient>
      </View>
      <Texto v="display" centro>
        {plan === "pro" ? "Ya eres Pro ✦" : "Juega Prodigia sin límites"}
      </Texto>
      {plan !== "pro" && (
        <>
          <Texto v="nota" centro>
            Los 15 mundos, más Chispas en cada partida, Cometas cada mes y cápsulas Pro. Elige tu plan.
          </Texto>
          <PlanesPro />
        </>
      )}
      {vence && (
        <Tarjeta acento={vence.renueva ? color.primario : color.racha} brillo={vence.urgente ? 0.3 : 0.1}>
          <View style={{ alignItems: "center", gap: 2 }}>
            <Texto v="micro" c={vence.renueva ? color.texto2 : color.racha}>
              {vence.renueva ? "Se renueva en" : "Tu Pro termina en"}
            </Texto>
            <Texto v="mono" tam={28} c={vence.renueva ? color.texto : color.racha}>
              {textoRestantePro(vence)}
            </Texto>
            <Texto v="nota" tam={12}>
              {vence.renueva ? "Se cobra de nuevo el " : "Vuelves a la cuenta gratis el "}
              {vence.fin.toLocaleDateString("es", { day: "numeric", month: "long", year: "numeric" })}
            </Texto>
          </View>
        </Tarjeta>
      )}
      <Texto v="micro" c="#FFD36B" centro style={{ marginTop: 6 }}>
        Todo lo que incluye Pro
      </Texto>
      <Tarjeta acento={color.logro} brillo={0.2}>
        {BENEFICIOS_PRO.map((b, i) => (
          <Animated.View key={b.id} entering={FadeInDown.delay(150 + i * 80)} style={styles.beneficio}>
            <View style={styles.check}>
              <IconoTrazo nombre={b.icono} tam={18} c="#1F1400" ancho={2.2} />
            </View>
            <View style={{ flex: 1 }}>
              <Texto v="fuerte">{b.titulo}</Texto>
              <Texto v="nota" tam={12}>
                {b.descripcion}
              </Texto>
            </View>
          </Animated.View>
        ))}
      </Tarjeta>
      {plan === "pro" && (
        <Texto v="nota" centro>
          Gracias por apoyar Prodigia. Tu plan se comparte con la web.
        </Texto>
      )}
    </PantallaApilada>
  );
}

const styles = StyleSheet.create({
  heroe: { height: 150, alignItems: "center", justifyContent: "center" },
  halo: { position: "absolute", width: 110, height: 110, borderRadius: 55, boxShadow: `0px 0px 60px ${color.logro}` },
  sello: { width: 110, height: 110, borderRadius: 30, alignItems: "center", justifyContent: "center", transform: [{ rotate: "-8deg" }] },
  beneficio: { flexDirection: "row", alignItems: "flex-start", gap: 12, paddingVertical: 8 },
  check: { width: 36, height: 36, borderRadius: 11, borderWidth: 2, borderColor: "#05060F", backgroundColor: color.logro, alignItems: "center", justifyContent: "center" },
});
