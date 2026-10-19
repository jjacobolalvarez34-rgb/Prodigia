import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import Animated, { FadeOutUp, ZoomIn } from "react-native-reanimated";
import { Image } from "expo-image";
import { EMOTES } from "@/lib/recompensas/catalogo";
import { vibrar } from "~/lib/efectos";
import { useCosmeticos } from "~/lib/recompensas";
import { color, conAlfa } from "~/tema";
import Texto from "../Texto";

// Emotes de duelo (tienda ampliada, 0248): frases fijas que se mandan al rival por
// el canal en vivo del duelo (igual que en la web). Solo los que tienes, con una
// pausa de 3 s entre uno y otro para que no sea spam. Los animados (el «Baile de
// esqueletos») se ven en grande sobre el duelo, ya hechos como WebP animado.
const ANIMADOS: Record<string, { grande: number; icono: number }> = {
  "baile-esqueletos": { grande: require("../../../assets/emotes/baile-esqueletos-grande.webp"), icono: require("../../../assets/emotes/baile-esqueletos-icono.png") },
};
export default function EmotesDuelo({ recibido, onEnviar }: { recibido: { valor: string; id: number } | null; onEnviar: (valor: string) => void }) {
  const { emotes } = useCosmeticos();
  const [espera, setEspera] = useState(false);
  const [enviado, setEnviado] = useState<{ valor: string; id: number } | null>(null);
  const r = recibido ? EMOTES[recibido.valor] : null;
  const yo = enviado ? EMOTES[enviado.valor] : null;
  const grande = r?.animado && recibido ? { a: r.animado, id: `r${recibido.id}`, mio: false } : yo?.animado && enviado ? { a: yo.animado, id: `y${enviado.id}`, mio: true } : null;
  return (
    <View style={styles.caja}>
      {grande && ANIMADOS[grande.a] && (
        <Animated.View key={grande.id} entering={ZoomIn.springify().damping(12)} exiting={FadeOutUp} pointerEvents="none" style={styles.grande}>
          <Image source={ANIMADOS[grande.a].grande} style={{ width: 300, height: 184, transform: [{ scaleX: grande.mio ? 1 : -1 }] }} contentFit="contain" autoplay />
        </Animated.View>
      )}
      <View style={styles.burbujas} pointerEvents="none">
        {r && (
          <Animated.View key={`r${recibido!.id}`} entering={ZoomIn.springify().damping(12)} exiting={FadeOutUp} style={[styles.burbuja, { borderColor: color.error }]}>
            <Texto v="fuerte" tam={13}>
              {r.emoji} {r.texto}
            </Texto>
          </Animated.View>
        )}
        {yo && (
          <Animated.View key={`y${enviado!.id}`} entering={ZoomIn.springify().damping(12)} exiting={FadeOutUp} style={[styles.burbuja, { borderColor: color.primario, alignSelf: "flex-end" }]}>
            <Texto v="fuerte" tam={13}>
              {yo.emoji} {yo.texto}
            </Texto>
          </Animated.View>
        )}
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6, paddingHorizontal: 16 }}>
        {emotes
          .filter((e) => EMOTES[e])
          .map((e) => (
            <Pressable
              key={e}
              disabled={espera}
              onPress={() => {
                vibrar.seleccion();
                onEnviar(e);
                const id = Date.now();
                setEnviado({ valor: e, id });
                setEspera(true);
                setTimeout(() => setEspera(false), 3000);
                setTimeout(() => setEnviado((x) => (x?.id === id ? null : x)), 2500);
              }}
              style={({ pressed }) => [styles.boton, espera && { opacity: 0.4 }, pressed && { transform: [{ scale: 0.92 }] }]}
            >
              {EMOTES[e].animado && ANIMADOS[EMOTES[e].animado!] ? <Image source={ANIMADOS[EMOTES[e].animado!].icono} style={{ width: 30, height: 30 }} contentFit="contain" /> : <Texto style={{ fontSize: 20 }}>{EMOTES[e].emoji}</Texto>}
            </Pressable>
          ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  caja: { gap: 4, marginTop: 4 },
  grande: { position: "absolute", left: 0, right: 0, bottom: 90, alignItems: "center", zIndex: 20 },
  burbujas: { minHeight: 0, paddingHorizontal: 16, gap: 4 },
  burbuja: { alignSelf: "flex-start", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 14, borderWidth: 1.5, backgroundColor: color.surface1 },
  boton: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center", backgroundColor: conAlfa(color.primario, 0.15), borderWidth: 1, borderColor: color.border },
});
