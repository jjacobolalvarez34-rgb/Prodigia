import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { COLECCIONES } from "@/lib/temas/colecciones";
import { PARTICULAS } from "@/lib/temas/dibujos";
import { METAS_PI, premiosDigitosPi } from "@/lib/temas/minieventos";
import { supabase } from "~/lib/supabase";
import DibujoTema from "~/ui/temas/DibujoTema";
import Texto from "~/ui/Texto";
import { color } from "~/tema";

// Día de π · «Dígitos de π» (0295) con Fichas (0311, igual que la web): tu mejor marca
// del día da Dígitos con 10, 20 y 31 dígitos.
export default function DigitosPi() {
  const ficha = COLECCIONES.dia_pi!.ficha;
  const [estado, setEstado] = useState<{ mejor: number; fichas: number } | null>(null);

  useEffect(() => {
    let vivo = true;
    void premiosDigitosPi(supabase).then((r) => {
      if (vivo && r) setEstado(r);
    });
    return () => {
      vivo = false;
    };
  }, []);

  if (!estado) return null;
  const tope = METAS_PI[METAS_PI.length - 1].digitos;
  return (
    <View style={{ gap: 8, marginTop: 6 }}>
      <Texto v="mono" tam={11.5} c="#9B85FF">
        Tu mejor marca de hoy: {estado.mejor} dígitos
      </Texto>
      <View style={styles.barra}>
        <LinearGradient colors={["#9B85FF", "#5DE4FF"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={[styles.relleno, { width: `${Math.min(100, (estado.mejor / tope) * 100)}%` }]} />
      </View>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
        {METAS_PI.map((m) => {
          const ok = estado.mejor >= m.digitos;
          return (
            <View key={m.digitos} style={[styles.meta, ok && { borderColor: "#5DE4FF" }]}>
              <View style={{ opacity: ok ? 1 : 0.4 }}>
                <DibujoTema dibujo={PARTICULAS.pi} ancho={14} />
              </View>
              <Texto v="fuerte" tam={11.5} c={ok ? "#5DE4FF" : color.texto}>
                {m.digitos} dígitos · +{m.fichas} {ficha.nombre}
              </Texto>
            </View>
          );
        })}
      </View>
      {estado.fichas > 0 && (
        <Texto v="fuerte" tam={13} c="#5DE4FF">
          Llevas {estado.fichas} {ficha.nombre} del reto
        </Texto>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  barra: { height: 10, borderRadius: 999, overflow: "hidden", backgroundColor: "rgba(255,255,255,0.1)" },
  relleno: { height: "100%", borderRadius: 999 },
  meta: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 9, paddingVertical: 4, borderRadius: 999, borderWidth: 1, borderColor: "rgba(255,255,255,0.14)" },
});
