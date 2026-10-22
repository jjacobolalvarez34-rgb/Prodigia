import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useState } from "react";
import { Dimensions, ScrollView, StyleSheet, View } from "react-native";
import { coloresCapsula, type TipoCapsula } from "@/lib/recompensas/catalogo";
import { COMO_SE_CONSIGUE, CONTENIDO_CAPSULAS, GRUPOS_CAPSULAS, nombreCapsula, nombrePremio, porcentaje, type FilaContenido } from "@/lib/recompensas/contenidoCapsulas";
import { contenidoCapsula } from "~/lib/recompensas";
import { supabase } from "~/lib/supabase";
import { color, conAlfa } from "~/tema";
import Hoja from "../Hoja";
import Texto from "../Texto";

// «¿Qué trae cada cápsula?»: todas las cápsulas, cómo se consigue cada una y qué puede
// traer con su porcentaje. Las filas se piden a la base (contenido_capsula, lo que de
// verdad se sortea); sin red, la tabla compartida (contenidoCapsulas.ts, que un test
// compara con la migración). Igual que la guía de la web (GuiaCapsulas.tsx).
const TIPOS = GRUPOS_CAPSULAS.flatMap((g) => g.tipos);

export default function GuiaCapsulas({ visible, onCerrar }: { visible: boolean; onCerrar: () => void }) {
  const [tabla, setTabla] = useState<Record<string, FilaContenido[]>>(CONTENIDO_CAPSULAS);

  useEffect(() => {
    if (!visible) return;
    let vivo = true;
    Promise.all(TIPOS.map(async (tipo) => [tipo, await contenidoCapsula(supabase, tipo).catch(() => [])] as const)).then((filas) => {
      if (vivo) setTabla(Object.fromEntries(filas.map(([tipo, f]) => [tipo, f.length ? f : CONTENIDO_CAPSULAS[tipo]])));
    });
    return () => {
      vivo = false;
    };
  }, [visible]);

  return (
    <Hoja visible={visible} onCerrar={onCerrar}>
      <Texto v="h2">Qué trae cada cápsula</Texto>
      <Texto v="nota" tam={12}>
        Los porcentajes son los que usa el servidor al abrirla. Si sale algo que ya tienes, se convierte en Chispas. Cada 10 cápsulas sin nada raro, la siguiente trae uno seguro.
      </Texto>
      <ScrollView style={{ maxHeight: Dimensions.get("window").height * 0.62 }} contentContainerStyle={{ gap: 14, paddingBottom: 6 }} showsVerticalScrollIndicator={false}>
        {GRUPOS_CAPSULAS.map((g) => (
          <View key={g.id} style={{ gap: 8 }}>
            <Texto v="micro">{g.titulo}</Texto>
            {g.tipos.map((tipo: TipoCapsula) => {
              const filas = tabla[tipo] ?? [];
              const [a, b] = coloresCapsula(tipo);
              const conTema = filas.some((f) => f.premio === "tema_app");
              return (
                <View key={tipo} style={styles.tarjeta}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                    <LinearGradient colors={[a, b]} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={styles.pildora} />
                    <View style={{ flex: 1 }}>
                      <Texto v="fuerte">{nombreCapsula(tipo)}</Texto>
                      <Texto v="nota" tam={12}>
                        {COMO_SE_CONSIGUE[tipo]}
                      </Texto>
                    </View>
                  </View>
                  {filas.map((f) => (
                    <View key={f.premio} style={styles.fila}>
                      <Texto v="cuerpo" tam={13.5} c={f.premio === "tema_app" ? color.primarioNeon : undefined} style={{ flex: 1 }}>
                        {nombrePremio(f.premio, f.minimo, f.maximo)}
                      </Texto>
                      <Texto v="mono" tam={13}>
                        {porcentaje(filas, f)}
                      </Texto>
                    </View>
                  ))}
                  {conTema && (
                    <Texto v="nota" tam={11}>
                      Puede traer un tema de la app. Si ya los tienes todos, se convierte en Chispas.
                    </Texto>
                  )}
                </View>
              );
            })}
          </View>
        ))}
      </ScrollView>
    </Hoja>
  );
}

const styles = StyleSheet.create({
  tarjeta: { gap: 6, padding: 12, borderRadius: 16, borderWidth: 1, borderColor: color.border, backgroundColor: color.surface2 },
  pildora: { width: 22, height: 34, borderRadius: 11, borderWidth: 1.5, borderColor: conAlfa("#05060F", 0.6) },
  fila: { flexDirection: "row", alignItems: "center", gap: 10, paddingTop: 6, borderTopWidth: 1, borderTopColor: conAlfa(color.border, 0.7) },
});
