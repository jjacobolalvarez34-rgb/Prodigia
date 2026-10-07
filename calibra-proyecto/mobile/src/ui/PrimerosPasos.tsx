import { useFocusEffect, useRouter, type Href } from "expo-router";
import { useCallback, useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, View } from "react-native";
import Animated, { FadeIn, FadeInDown, SlideInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  misPrimerosPasos,
  primerosPasosTerminados,
  reclamarPrimerPaso,
  RUTA_APP_PRIMEROS_PASOS,
  TEXTOS_PRIMEROS_PASOS,
  textoPremioPrimerPaso,
  type PasoPrimerosPasos,
} from "@/lib/primerosPasos";
import { sonar, vibrar } from "~/lib/efectos";
import { fijarChispas, recargarJugador } from "~/lib/jugador";
import { mensajeError, supabase } from "~/lib/supabase";
import { color, conAlfa } from "~/tema";
import { mostrarAviso } from "./Aviso";
import Barra from "./Barra";
import { IconoCheck } from "./Iconos";
import Texto from "./Texto";

// «Primeros pasos» (0260) en el Inicio: un botón chico con el avance (no tapa el
// botón de Jugar) que abre la lista de 8 tareas con su premio y el grande del final.
export default function PrimerosPasos() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [pasos, setPasos] = useState<PasoPrimerosPasos[]>([]);
  const [abierta, setAbierta] = useState(false);
  const [ocupado, setOcupado] = useState<string | null>(null);

  const cargar = useCallback(() => {
    misPrimerosPasos(supabase).then(setPasos);
  }, []);
  useFocusEffect(cargar);

  if (pasos.length === 0 || primerosPasosTerminados(pasos)) return null;
  const tareas = pasos.filter((p) => p.tarea !== "final");
  const final = pasos.find((p) => p.tarea === "final");
  const reclamadas = tareas.filter((p) => p.reclamada).length;
  const porReclamar = pasos.filter((p) => p.hecha && !p.reclamada).length;

  async function reclamar(p: PasoPrimerosPasos) {
    setOcupado(p.tarea);
    try {
      const total = await reclamarPrimerPaso(supabase, p.tarea);
      if (total) fijarChispas(total);
      sonar("recompensa");
      vibrar.exito();
      mostrarAviso(p.tarea === "final" ? "¡Primeros pasos completos! Título «Bien encaminado»." : `+${textoPremioPrimerPaso(p)}`, "logro");
      recargarJugador();
      cargar();
    } catch (e) {
      mostrarAviso(mensajeError(e), "error");
    } finally {
      setOcupado(null);
    }
  }

  function fila(p: PasoPrimerosPasos, i: number) {
    const t = TEXTOS_PRIMEROS_PASOS[p.tarea];
    const ruta = RUTA_APP_PRIMEROS_PASOS[p.tarea];
    return (
      <Animated.View key={p.tarea} entering={FadeInDown.delay(80 + i * 45).duration(260)}>
        <Pressable
          disabled={p.reclamada || (p.hecha ? false : !ruta)}
          onPress={() => {
            if (p.hecha) reclamar(p);
            else if (ruta) {
              setAbierta(false);
              router.push(ruta as Href);
            }
          }}
          style={({ pressed }) => [styles.fila, pressed && { opacity: 0.7 }]}
        >
          <View style={[styles.marca, p.reclamada && { backgroundColor: color.correcto, borderColor: color.correcto }, p.hecha && !p.reclamada && { borderColor: color.logro }]}>
            {p.reclamada && <IconoCheck tam={14} c={color.bg} />}
          </View>
          <View style={{ flex: 1 }}>
            <Texto v="fuerte" tam={14} style={p.reclamada && { textDecorationLine: "line-through", opacity: 0.6 }}>
              {t.titulo}
            </Texto>
            <Texto v="nota" tam={11.5}>
              {t.ensena}
            </Texto>
          </View>
          {!p.reclamada && (
            <View style={[styles.premio, p.hecha && { backgroundColor: color.logro, borderColor: color.logro }]}>
              <Texto v="mono" tam={11.5} c={p.hecha ? "#2A1A00" : color.logro}>
                {ocupado === p.tarea ? "…" : p.hecha ? `Reclamar ${textoPremioPrimerPaso(p)}` : textoPremioPrimerPaso(p)}
              </Texto>
            </View>
          )}
        </Pressable>
      </Animated.View>
    );
  }

  return (
    <>
      <Pressable
        onPress={() => {
          vibrar.seleccion();
          setAbierta(true);
        }}
        style={({ pressed }) => [styles.boton, porReclamar > 0 && { borderColor: color.logro, boxShadow: `0px 0px 14px ${conAlfa(color.logro, 0.35)}` }, pressed && { transform: [{ scale: 0.97 }] }]}
      >
        <View style={styles.entre}>
          <Texto v="micro" c={porReclamar > 0 ? color.logro : color.primarioClaro}>
            Primeros pasos
          </Texto>
          {porReclamar > 0 && <View style={styles.punto} />}
        </View>
        <Texto v="fuerte" tam={13.5}>
          {reclamadas}/8 hechos
        </Texto>
        <Barra valor={reclamadas / 8} acento={color.logro} alto={4} />
      </Pressable>

      <Modal visible={abierta} transparent animationType="none" statusBarTranslucent onRequestClose={() => setAbierta(false)}>
        <Animated.View entering={FadeIn.duration(200)} style={styles.velo}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setAbierta(false)} />
          <Animated.View entering={SlideInDown.springify().damping(18)} style={[styles.hoja, { paddingBottom: insets.bottom + 18 }]}>
            <View style={styles.agarre} />
            <View style={styles.entre}>
              <Texto v="h2">Primeros pasos</Texto>
              <Texto v="mono" tam={13} c={color.logro}>
                {reclamadas}/8
              </Texto>
            </View>
            <Texto v="nota">Cada tarea te enseña algo de Prodigia y tiene premio. Toca una para ir a hacerla.</Texto>
            <Barra valor={reclamadas / 8} acento={color.logro} alto={6} estilo={{ marginVertical: 6 }} />
            <ScrollView style={{ maxHeight: 420 }} showsVerticalScrollIndicator={false}>
              {tareas.map(fila)}
              {final && (final.hecha ? fila(final, tareas.length) : (
                <Texto v="nota" tam={12} c={color.texto2} style={{ marginTop: 8 }}>
                  Al completar las 8: {TEXTOS_PRIMEROS_PASOS.final.ensena}
                </Texto>
              ))}
            </ScrollView>
          </Animated.View>
        </Animated.View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  boton: { flex: 1, gap: 4, padding: 12, borderRadius: 16, backgroundColor: color.surface1, borderWidth: 1, borderColor: color.border },
  entre: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  punto: { width: 8, height: 8, borderRadius: 4, backgroundColor: color.logro },
  velo: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.6)" },
  hoja: { gap: 6, padding: 20, borderTopLeftRadius: 26, borderTopRightRadius: 26, backgroundColor: color.surface2, borderWidth: 1, borderColor: color.border },
  agarre: { alignSelf: "center", width: 42, height: 5, borderRadius: 3, backgroundColor: color.border, marginBottom: 8 },
  fila: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 8 },
  marca: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: color.border, alignItems: "center", justifyContent: "center" },
  premio: { paddingHorizontal: 9, paddingVertical: 5, borderRadius: 999, borderWidth: 1, borderColor: conAlfa(color.logro, 0.6) },
});
