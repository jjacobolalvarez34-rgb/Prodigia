import { useEffect, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import Animated, { FadeIn, FadeOut, useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from "react-native-reanimated";
import { COLECCIONES, slugEvento } from "@/lib/temas/colecciones";
import { PARTICULAS } from "@/lib/temas/dibujos";
import { diaUtc, encontrarHuevo, FICHAS_POR_HUEVO, FICHAS_TODOS_HUEVOS, lugarHuevoDe, mensajeErrorMinievento, premiosMinievento, type LugarHuevo } from "@/lib/temas/minieventos";
import { sonar, vibrar } from "~/lib/efectos";
import { useAnimacionActiva } from "~/lib/rendimiento";
import { supabase } from "~/lib/supabase";
import { useTemaHoy } from "~/lib/temporada";
import DibujoTema from "~/ui/temas/DibujoTema";
import Texto from "~/ui/Texto";

// Pascua · «Huevos escondidos» (0311, igual que la web): el huevo del día, medio
// escondido en la pantalla que le toca (solo durante el evento, solo el de hoy y solo si
// no lo encontraste). `flotante`: en una esquina de la pantalla; si no, al final del
// contenido. La base comprueba el lugar.
export default function HuevoEscondido({ lugar, flotante = false }: { lugar: LugarHuevo; flotante?: boolean }) {
  const tema = useTemaHoy();
  const hoy = diaUtc();
  const esPascua = tema?.tema.id === "pascua" && tema.fase === "evento";
  const desde = tema?.hoy.rango.desde ?? "";
  const aqui = esPascua && lugarHuevoDe(desde, hoy) === lugar;
  const [visible, setVisible] = useState(false);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const activa = useAnimacionActiva();
  const giro = useSharedValue(0);

  useEffect(() => {
    if (!aqui) return;
    let vivo = true;
    void premiosMinievento(supabase, slugEvento("pascua", desde)).then((r) => {
      if (vivo && r) setVisible(!r.some((p) => p.clave === `huevo:${hoy}`));
    });
    return () => {
      vivo = false;
    };
  }, [aqui, desde, hoy]);

  useEffect(() => {
    giro.value = activa && visible ? withRepeat(withSequence(withTiming(-8, { duration: 1300 }), withTiming(8, { duration: 1300 })), -1, true) : 0;
  }, [activa, visible, giro]);

  const estilo = useAnimatedStyle(() => ({ transform: [{ rotate: `${giro.value}deg` }] }));

  async function tocar() {
    vibrar.medio();
    const nombre = COLECCIONES.pascua!.ficha.nombre;
    try {
      const r = await encontrarHuevo(supabase, lugar);
      sonar("logro");
      vibrar.exito();
      setMensaje(r.fichas > FICHAS_POR_HUEVO ? `¡Encontraste un huevo! +${FICHAS_POR_HUEVO} ${nombre}. ¡Los encontraste todos! +${FICHAS_TODOS_HUEVOS} ${nombre} de premio` : `¡Encontraste un huevo! +${r.fichas} ${nombre}`);
    } catch (e) {
      setMensaje(mensajeErrorMinievento(e));
    }
    setVisible(false);
    setTimeout(() => setMensaje(null), 4000);
  }

  if (!aqui || (!visible && !mensaje)) return null;
  return (
    <View pointerEvents="box-none" style={flotante ? styles.flotante : styles.enLinea}>
      {visible && (
        <Animated.View entering={FadeIn.duration(400)} exiting={FadeOut.duration(250)} style={[{ opacity: 0.85 }, estilo]}>
          <Pressable onPress={tocar} accessibilityRole="button" accessibilityLabel="Un huevo de Pascua escondido" hitSlop={10}>
            <DibujoTema dibujo={PARTICULAS.huevo} ancho={34} />
          </Pressable>
        </Animated.View>
      )}
      {mensaje && (
        <Animated.View entering={FadeIn.duration(200)} exiting={FadeOut.duration(200)} style={styles.mensaje}>
          <Texto v="fuerte" tam={12.5} c="#9BE7FF">
            {mensaje}
          </Texto>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  flotante: { position: "absolute", left: 4, bottom: 90, right: 12, alignItems: "flex-start", gap: 6 },
  enLinea: { alignItems: "flex-end", gap: 6, marginTop: 8 },
  mensaje: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, borderWidth: 1, borderColor: "#9BE7FF66", backgroundColor: "#0B1A2A" },
});
