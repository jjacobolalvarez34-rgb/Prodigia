import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import Animated, { Easing, FadeInDown, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from "react-native-reanimated";
import Svg, { Circle, Defs, RadialGradient, Stop } from "react-native-svg";
import { sonar } from "~/lib/efectos";
import { recargarJugador } from "~/lib/jugador";
import { cargarLogros, cargarTitulos, elegirTitulo, type Logro, type Titulo } from "~/lib/logros";
import { useSesion } from "~/lib/sesion";
import { mensajeError } from "~/lib/supabase";
import { mostrarAviso } from "~/ui/Aviso";
import Barra from "~/ui/Barra";
import { IconoCandado, IconoCheck } from "~/ui/Iconos";
import { PantallaApilada } from "~/ui/Pantalla";
import Segmentos from "~/ui/Segmentos";
import Tarjeta from "~/ui/Tarjeta";
import Texto from "~/ui/Texto";
import { color, conAlfa } from "~/tema";

// Medalla dorada que gira despacio (los logros ganados brillan; los que faltan, en gris).
function Medalla({ ganada }: { ganada: boolean }) {
  const giro = useSharedValue(0);
  useEffect(() => {
    if (ganada) giro.set(withRepeat(withTiming(1, { duration: 5000, easing: Easing.inOut(Easing.sin) }), -1, true));
  }, [ganada, giro]);
  const estilo = useAnimatedStyle(() => ({ transform: [{ rotateY: `${giro.value * 30 - 15}deg` }] }));
  return (
    <Animated.View style={[{ width: 44, height: 44, alignItems: "center", justifyContent: "center" }, estilo]}>
      <Svg width={44} height={44} style={{ position: "absolute" }}>
        <Defs>
          <RadialGradient id={ganada ? "mOro" : "mGris"} cx="35%" cy="30%" r="75%">
            <Stop offset="0" stopColor={ganada ? "#FFF3C4" : "#4A5270"} />
            <Stop offset="0.55" stopColor={ganada ? "#FFB627" : "#2A3050"} />
            <Stop offset="1" stopColor={ganada ? "#B87800" : "#1A1F35"} />
          </RadialGradient>
        </Defs>
        <Circle cx={22} cy={22} r={21} fill={`url(#${ganada ? "mOro" : "mGris"})`} />
      </Svg>
      {ganada ? <IconoCheck tam={20} c="#3A2600" /> : <IconoCandado tam={16} c="#6B7391" />}
    </Animated.View>
  );
}

export default function Logros() {
  const { sesion } = useSesion();
  const userId = sesion?.user.id;
  const [seccion, setSeccion] = useState<"logros" | "titulos">("logros");
  const [logros, setLogros] = useState<Logro[]>([]);
  const [titulos, setTitulos] = useState<Titulo[]>([]);

  const cargar = useCallback(async () => {
    if (!userId) return;
    const [l, t] = await Promise.all([cargarLogros(userId), cargarTitulos(userId)]);
    setLogros(l);
    setTitulos(t);
  }, [userId]);

  useFocusEffect(
    useCallback(() => {
      cargar();
    }, [cargar])
  );

  const ganados = logros.filter((l) => l.desbloqueadoAt).length;
  const titulosGanados = titulos.filter((t) => t.ganado).length;

  return (
    <PantallaApilada titulo="Logros y títulos" onRefrescar={cargar}>
      <Tarjeta acento={color.logro} brillo={0.2}>
        <View style={styles.entre}>
          <Texto v="h3">{seccion === "logros" ? "Logros desbloqueados" : "Títulos ganados"}</Texto>
          <Texto v="mono" c={color.logro}>
            {seccion === "logros" ? `${ganados}/${logros.length}` : `${titulosGanados}/${titulos.length}`}
          </Texto>
        </View>
        <Barra
          valor={seccion === "logros" ? ganados / Math.max(1, logros.length) : titulosGanados / Math.max(1, titulos.length)}
          colores={["#B87800", "#FFB627"]}
          estilo={{ marginTop: 10 }}
        />
      </Tarjeta>
      <Segmentos<"logros" | "titulos">
        opciones={[
          { id: "logros", titulo: "Logros" },
          { id: "titulos", titulo: "Títulos" },
        ]}
        valor={seccion}
        onCambio={setSeccion}
      />
      {seccion === "logros"
        ? logros.map((l, i) => (
            <Animated.View key={l.id} entering={FadeInDown.delay(Math.min(i, 14) * 35)}>
              <View style={[styles.fila, l.desbloqueadoAt ? { borderColor: conAlfa(color.logro, 0.4) } : { opacity: 0.6 }]}>
                <Medalla ganada={!!l.desbloqueadoAt} />
                <View style={{ flex: 1 }}>
                  <Texto v="fuerte" tam={14}>
                    {l.nombre}
                  </Texto>
                  <Texto v="nota" tam={12}>
                    {l.descripcion}
                  </Texto>
                </View>
              </View>
            </Animated.View>
          ))
        : titulos.map((t, i) => (
            <Animated.View key={t.slug} entering={FadeInDown.delay(Math.min(i, 14) * 35)}>
              <Pressable
                disabled={!t.ganado || t.activo}
                onPress={async () => {
                  try {
                    await elegirTitulo(t.slug);
                    sonar("boton");
                    await Promise.all([cargar(), recargarJugador()]);
                    mostrarAviso(`Ahora eres «${t.nombre}»`, "ok");
                  } catch (e) {
                    mostrarAviso(mensajeError(e), "error");
                  }
                }}
                style={[styles.fila, t.activo && { borderColor: color.logro, backgroundColor: conAlfa(color.logro, 0.08) }, !t.ganado && { opacity: 0.5 }]}
              >
                <Texto v="fuerte" style={{ flex: 1 }}>
                  «{t.nombre}»
                </Texto>
                {t.activo ? (
                  <Texto v="fuerte" tam={11} c={color.logro}>
                    EN USO
                  </Texto>
                ) : t.ganado ? (
                  <Texto v="nota" tam={11}>
                    Usar
                  </Texto>
                ) : (
                  <IconoCandado tam={14} c={color.texto2} />
                )}
              </Pressable>
            </Animated.View>
          ))}
    </PantallaApilada>
  );
}

const styles = StyleSheet.create({
  entre: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  fila: { flexDirection: "row", alignItems: "center", gap: 12, padding: 12, borderRadius: 16, borderWidth: 1, borderColor: color.border, backgroundColor: color.surface1 },
});
