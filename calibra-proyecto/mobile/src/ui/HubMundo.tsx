import { useFocusEffect, useRouter, type Href } from "expo-router";
import { useCallback, useState, type ReactNode } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { mundoDobleExperiencia } from "@/lib/eventos/dobleExperiencia";
import { vibrar } from "~/lib/efectos";
import { useJugador } from "~/lib/jugador";
import { progresoMundo, type ProgresoMundo } from "~/lib/mundos";
import { useSesion } from "~/lib/sesion";
import { brillo, color, conAlfa, fuente, type Mundo } from "~/tema";
import Anillo from "./Anillo";
import Barra from "./Barra";
import Ciudad from "./Ciudad";
import Glifos from "./Glifos";
import { IconoCandado } from "./Iconos";
import { BotonAtras } from "./Pantalla";
import Segmentos from "./Segmentos";
import Tarjeta from "./Tarjeta";
import Texto from "./Texto";
import PestanaAprender from "./aprender/PestanaAprender";

// Hub de un mundo (03-PANTALLAS §4.5): la ciudad encendida arriba con el nivel del
// mundo, y los temas con su nivel de calibración (1-10) en un anillo.
export interface Tema {
  id: string;
  nombre: string;
  simbolo: string;
  nivel: number | null;
  bloqueado?: boolean;
  nota?: string;
}

export function TarjetaTema({ tema, mundo, activo, onPress, indice }: { tema: Tema; mundo: Mundo; activo?: boolean; onPress: () => void; indice: number }) {
  return (
    <Animated.View entering={FadeInDown.delay(indice * 60).duration(300)} style={{ flex: 1 }}>
      <Pressable
        disabled={tema.bloqueado}
        onPress={() => {
          vibrar.seleccion();
          onPress();
        }}
        style={({ pressed }) => [
          styles.tema,
          activo && { borderColor: mundo.neon, backgroundColor: conAlfa(mundo.base, 0.18), boxShadow: brillo(mundo.neon, 18, 0.3) },
          tema.bloqueado && { opacity: 0.45 },
          { transform: [{ scale: pressed ? 0.96 : 1 }] },
        ]}
      >
        <View style={styles.entre}>
          <Texto style={{ fontFamily: fuente.mono, fontSize: 28, color: mundo.neon }}>{tema.simbolo}</Texto>
          {tema.bloqueado ? (
            <IconoCandado tam={18} c={color.texto2} />
          ) : (
            <Anillo valor={(tema.nivel ?? 0) / 10} tam={40} grosor={4} acento={mundo.neon}>
              <Texto v="mono" tam={13}>
                {tema.nivel ?? "…"}
              </Texto>
            </Anillo>
          )}
        </View>
        <Texto v="h3">{tema.nombre}</Texto>
        <Texto v="nota" tam={11}>
          {tema.nota ?? `Nivel ${tema.nivel ?? "…"} de 10`}
        </Texto>
      </Pressable>
    </Animated.View>
  );
}

export default function HubMundo({ mundo, descripcion, children, pie }: { mundo: Mundo; descripcion: string; children: ReactNode; pie?: ReactNode }) {
  const { sesion } = useSesion();
  const userId = sesion?.user.id;
  const { mundos, plan } = useJugador();
  const [progreso, setProgreso] = useState<ProgresoMundo | null>(null);
  const [pestana, setPestana] = useState<"practicar" | "aprender">("practicar");
  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      if (userId) progresoMundo(userId, mundo.slug).then(setProgreso);
    }, [userId, mundo.slug])
  );

  const bloqueado = mundos.length > 0 && plan !== "pro" && !mundos.includes(mundo.slug);

  return (
    <SafeAreaView style={styles.pantalla} edges={["top"]}>
      <ScrollView contentContainerStyle={{ paddingBottom: 28 }} showsVerticalScrollIndicator={false}>
        <View>
          <Ciudad semilla={mundo.slug} acento={mundo.neon} alto={190} radio={0} densidad={1.15} />
          <View style={StyleSheet.absoluteFill} pointerEvents="none">
            <Glifos glifos={mundo.glifos} acento={mundo.neon} cantidad={6} opacidad={0.14} />
          </View>
          <View style={styles.atras}>
            <BotonAtras />
          </View>
          {/* Modo Zen: practicar sin reloj, con tema y dificultad a elección (docs/PLAN_MODO_SIN_RELOJ.md). */}
          <Pressable
            onPress={() => {
              vibrar.seleccion();
              router.push(`/zen/${mundo.slug}` as Href);
            }}
            style={({ pressed }) => [styles.zen, { borderColor: conAlfa(mundo.neon, 0.6) }, pressed && { transform: [{ scale: 0.95 }] }]}
            accessibilityRole="button"
            accessibilityLabel="Modo Zen: practicar sin reloj"
            hitSlop={6}
          >
            <Texto style={{ fontFamily: fuente.cuerpoFuerte, fontSize: 12, color: color.texto }}>☯ Modo Zen</Texto>
          </Pressable>
          <View style={styles.titulo}>
            <Texto style={{ fontFamily: fuente.display, fontSize: 30, letterSpacing: 2, color: color.texto, textShadowColor: mundo.neon, textShadowRadius: 16 }}>
              {mundo.nombre.toUpperCase()}
            </Texto>
            <Texto v="mono" tam={20} c={mundo.neon}>
              Nv {progreso?.nivel ?? 1}
            </Texto>
          </View>
        </View>
        <View style={styles.contenido}>
          <Barra valor={progreso?.avance ?? 0} acento={mundo.base} alto={9} />
          <Texto v="nota" tam={12}>
            {progreso?.faltaTexto ?? descripcion}
          </Texto>
          {mundoDobleExperiencia() === mundo.slug && (
            <View style={styles.doble}>
              <Texto style={{ fontSize: 22 }}>🪂</Texto>
              <View style={{ flex: 1 }}>
                <Texto v="fuerte" c={color.logro}>
                  ¡Doble experiencia hoy!
                </Texto>
                <Texto v="nota" tam={12}>
                  Cada acierto en {mundo.nombre} vale el doble de Exp hasta la medianoche.
                </Texto>
              </View>
            </View>
          )}
          <Segmentos<"practicar" | "aprender">
            opciones={[
              { id: "practicar", titulo: "Practicar" },
              { id: "aprender", titulo: "Aprender" },
            ]}
            valor={pestana}
            onCambio={setPestana}
          />
          {bloqueado ? (
            <Tarjeta acento={mundo.neon}>
              <Texto v="h3">{mundo.nombre} no está entre tus mundos</Texto>
              <Texto v="nota">Enciéndelo desde la pestaña Mundos.</Texto>
            </Tarjeta>
          ) : pestana === "practicar" ? (
            <>
              <Texto v="nota">{descripcion}</Texto>
              {children}
            </>
          ) : (
            <PestanaAprender mundo={mundo} />
          )}
        </View>
      </ScrollView>
      {pie && pestana === "practicar" && !bloqueado ? <View style={styles.pie}>{pie}</View> : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  doble: { flexDirection: "row", alignItems: "center", gap: 10, padding: 12, borderRadius: 16, borderWidth: 1, borderColor: conAlfa(color.logro, 0.5), backgroundColor: conAlfa(color.logro, 0.1) },
  pantalla: { flex: 1, backgroundColor: color.bg },
  atras: { position: "absolute", top: 8, left: 14 },
  zen: { position: "absolute", top: 12, right: 14, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999, borderWidth: 1, backgroundColor: "rgba(8,8,20,0.6)" },
  titulo: { position: "absolute", left: 16, right: 16, bottom: 12, flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between" },
  contenido: { padding: 16, gap: 12 },
  entre: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  tema: { flex: 1, gap: 4, padding: 14, borderRadius: 20, borderWidth: 1.5, borderColor: color.border, backgroundColor: color.surface1 },
  pie: { paddingHorizontal: 16, paddingBottom: 14, paddingTop: 6, borderTopWidth: 1, borderTopColor: color.border, backgroundColor: color.bg },
});
