import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { sellosAlineacionDe } from "@/lib/recompensas/alineacion";
import { supabase } from "~/lib/supabase";
import { TituloSeccion } from "../Pantalla";
import Texto from "../Texto";
import { fuente } from "~/tema";

// Los sellos de la Gran Alineación en la Placa (0290): uno por cada Alineación en la
// que jugó, numerados. Solo aparece si tiene alguno.
export function Sello({ numero, tam = 58 }: { numero: number; tam?: number }) {
  return (
    <View style={[styles.sello, { width: tam, height: tam, borderRadius: tam / 2 }]}>
      <LinearGradient colors={["#FFE9A8", "#E8A317", "#9A5B0C"]} start={{ x: 0.2, y: 0 }} end={{ x: 0.8, y: 1 }} style={[StyleSheet.absoluteFill, { borderRadius: tam / 2 }]} />
      <View style={[styles.aro, { borderRadius: tam / 2 - 5 }]} />
      <Texto style={{ fontFamily: fuente.cuerpoBold, fontSize: tam * 0.13, letterSpacing: 1, color: "#4A2A05" }}>TESTIGO</Texto>
      <Texto style={{ fontFamily: fuente.display, fontSize: tam * 0.32, lineHeight: tam * 0.38, color: "#2A1602" }}>#{numero}</Texto>
    </View>
  );
}

export default function SellosAlineacion({ userId }: { userId: string | null | undefined }) {
  const [sellos, setSellos] = useState<number[]>([]);
  useEffect(() => {
    if (!userId) return;
    let vivo = true;
    sellosAlineacionDe(supabase, userId).then((s) => vivo && setSellos(s));
    return () => {
      vivo = false;
    };
  }, [userId]);
  if (sellos.length === 0) return null;
  return (
    <Animated.View entering={FadeIn.duration(300)} style={{ gap: 8 }}>
      <TituloSeccion>Sellos de la Alineación</TituloSeccion>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingVertical: 4 }}>
        {sellos.map((n) => (
          <Sello key={n} numero={n} />
        ))}
      </ScrollView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  sello: { alignItems: "center", justifyContent: "center", borderWidth: 1.5, borderColor: "#05060F", boxShadow: "0px 0px 14px rgba(242,193,78,0.45)", overflow: "hidden" },
  aro: { position: "absolute", top: 4, left: 4, right: 4, bottom: 4, borderWidth: 1, borderColor: "rgba(74,42,5,0.45)" },
});
