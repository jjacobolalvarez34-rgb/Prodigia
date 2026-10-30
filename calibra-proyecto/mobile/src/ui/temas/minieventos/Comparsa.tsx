import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { COLECCIONES } from "@/lib/temas/colecciones";
import { PARTICULAS } from "@/lib/temas/dibujos";
import { escenaComparsa } from "@/lib/temas/escenasFiestas";
import { ACIERTOS_POR_BAILARIN, metaCobrada, metasDe, tablaComparsa, type FilaComparsa } from "@/lib/temas/minieventos";
import { supabase } from "~/lib/supabase";
import Boton3D from "~/ui/Boton3D";
import DibujoTema from "~/ui/temas/DibujoTema";
import Texto from "~/ui/Texto";
import { color } from "~/tema";
import { useMetasMinievento } from "./useMetasMinievento";

// Carnaval · «Comparsa» (0311, igual que la web): cada 10 aciertos en Melodía suman un
// bailarín; con 20, 50 y 100 se ganan Máscaras. Tabla de la comparsa del evento.
export default function Comparsa({ ancho }: { ancho: number }) {
  const router = useRouter();
  const ficha = COLECCIONES.carnaval!.ficha;
  const { hoy, progreso, premios, cargado, error } = useMetasMinievento("carnaval", true);
  const [tabla, setTabla] = useState<FilaComparsa[] | null>(null);

  useEffect(() => {
    let vivo = true;
    void tablaComparsa(supabase).then((r) => {
      if (vivo) setTabla(r ?? []);
    });
    return () => {
      vivo = false;
    };
  }, []);

  const n = progreso?.total ?? 0;
  const bailarines = Math.min(10, Math.floor(n / ACIERTOS_POR_BAILARIN));
  return (
    <View style={{ gap: 8, marginTop: 6 }}>
      <View style={[styles.caja, { backgroundColor: "#071A14" }]}>
        <DibujoTema dibujo={escenaComparsa(bailarines)} ancho={ancho} />
      </View>
      <Texto v="mono" tam={11.5} c="#3DDC97">
        {cargado ? `${n} aciertos de Melodía · ${bailarines} bailarines` : "…"}
      </Texto>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
        {metasDe("carnaval").map((m) => {
          const ok = metaCobrada(m, premios, hoy);
          return (
            <View key={m.clave} style={[styles.meta, ok && { borderColor: "#FFC53D" }]}>
              <View style={{ opacity: ok ? 1 : 0.4 }}>
                <DibujoTema dibujo={PARTICULAS.mascara} ancho={14} />
              </View>
              <Texto v="fuerte" tam={11.5} c={ok ? "#FFC53D" : color.texto}>
                {m.meta} aciertos · +{m.fichas} {ficha.nombre}
              </Texto>
            </View>
          );
        })}
      </View>
      {tabla && (
        <View style={[styles.caja, { paddingHorizontal: 12, paddingVertical: 8, gap: 2 }]}>
          <Texto v="micro" c="#FFC53D">
            TABLA DE LA COMPARSA
          </Texto>
          {tabla.length === 0 ? (
            <Texto v="nota" tam={12}>
              Todavía nadie salió a bailar.
            </Texto>
          ) : (
            tabla.map((f, i) => (
              <View key={i} style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Texto v={f.yo ? "fuerte" : "nota"} tam={12.5} c={f.yo ? "#3DDC97" : color.texto}>
                  {i + 1}. {f.nombre}
                </Texto>
                <Texto v="mono" tam={12} c={f.yo ? "#3DDC97" : color.texto}>
                  {f.aciertos}
                </Texto>
              </View>
            ))
          )}
        </View>
      )}
      <Boton3D titulo="Jugar Melodía" tamano="sm" acento="#3DDC97" onPress={() => router.push("/melodia")} />
      {error && (
        <Texto v="nota" tam={12.5} c={color.error}>
          {error}
        </Texto>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  caja: { borderRadius: 16, overflow: "hidden", borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" },
  meta: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 9, paddingVertical: 4, borderRadius: 999, borderWidth: 1, borderColor: "rgba(255,255,255,0.14)" },
});
