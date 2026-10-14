import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { AppState, Pressable, StyleSheet, View } from "react-native";
import Animated, { FadeInDown, FadeOutDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { buscarDueloEnCurso, type ClienteMinimo, type DueloEnCurso } from "@/lib/duelos/enCurso";
import { vibrar } from "~/lib/efectos";
import { supabase } from "~/lib/supabase";
import Texto from "~/ui/Texto";
import { fuente } from "~/tema";

// Reconexión (pedido 2026-10-14: «si me salgo de la app en un duelo y vuelvo al
// instante, no me vuelve a conectar»). Al abrir la app o volver a ella, si quedó un
// duelo tuyo a medias aparece este aviso para volver a entrar. Igual que la web
// (BannerDueloEnCurso). No se muestra mientras ya estás en un duelo o una partida.
const EN_PARTIDA = new Set(["duelo", "sprint", "resultado", "reto", "reto-finde", "diagnostico"]);

export default function BannerDueloEnCurso({ userId, segmentos }: { userId: string; segmentos: string[] }) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [duelo, setDuelo] = useState<DueloEnCurso | null>(null);
  const enPartida = segmentos.some((s) => EN_PARTIDA.has(s));

  useEffect(() => {
    if (enPartida) return;
    let vivo = true;
    const revisar = () => {
      buscarDueloEnCurso(supabase as unknown as ClienteMinimo, userId).then(
        (d) => {
          if (vivo) setDuelo(d);
        },
        () => undefined
      );
    };
    revisar();
    const sub = AppState.addEventListener("change", (e) => {
      if (e === "active") revisar();
    });
    return () => {
      vivo = false;
      sub.remove();
    };
  }, [userId, enPartida]);

  if (!duelo || enPartida) return null;
  return (
    <Animated.View entering={FadeInDown.duration(260)} exiting={FadeOutDown} style={[styles.caja, { bottom: insets.bottom + 86 }]}>
      <View style={styles.punto} />
      <Texto v="fuerte" style={{ flex: 1, color: "#fff" }}>
        Tienes un duelo en curso. ¡Tu rival te espera!
      </Texto>
      <Pressable
        onPress={() => {
          vibrar.medio();
          setDuelo(null);
          if (duelo.serieId) router.push({ pathname: "/duelo/serie/[id]", params: { id: duelo.serieId } });
          else router.push({ pathname: "/duelo/[id]", params: { id: duelo.id } });
        }}
        style={styles.boton}
      >
        <Texto style={{ fontFamily: fuente.display, color: "#fff", fontSize: 13 }}>Volver</Texto>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  caja: { position: "absolute", left: 12, right: 12, flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 14, paddingVertical: 12, borderRadius: 18, backgroundColor: "#1A0E1A", borderWidth: 1, borderColor: "rgba(255,92,122,0.6)", boxShadow: "0px 10px 30px rgba(255,92,122,0.35)" },
  punto: { width: 10, height: 10, borderRadius: 5, backgroundColor: "#FF5C7A" },
  boton: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, backgroundColor: "#FF5C7A" },
});
