import { useFocusEffect, useRouter, type Href } from "expo-router";
import { useCallback, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
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
import Tarjeta from "./Tarjeta";
import Texto from "./Texto";

// Tarjeta «Primeros pasos» del Inicio (0260): 8 tareas con premio y uno grande al
// final. Tocar una tarea lleva a donde se hace; las hechas se reclaman acá.
export default function PrimerosPasos({ indice }: { indice: number }) {
  const router = useRouter();
  const [pasos, setPasos] = useState<PasoPrimerosPasos[]>([]);
  const [abierta, setAbierta] = useState(false);
  const [ocupado, setOcupado] = useState<string | null>(null);

  const cargar = useCallback(() => {
    misPrimerosPasos(supabase).then(setPasos);
  }, []);
  useFocusEffect(cargar);

  if (primerosPasosTerminados(pasos)) return null;
  const tareas = pasos.filter((p) => p.tarea !== "final");
  const final = pasos.find((p) => p.tarea === "final");
  const reclamadas = tareas.filter((p) => p.reclamada).length;
  const porReclamar = pasos.filter((p) => p.hecha && !p.reclamada).length;
  const visibles = abierta ? tareas : tareas.filter((p) => !p.reclamada).slice(0, 2);

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

  function fila(p: PasoPrimerosPasos) {
    const t = TEXTOS_PRIMEROS_PASOS[p.tarea];
    const ruta = RUTA_APP_PRIMEROS_PASOS[p.tarea];
    return (
      <Pressable
        key={p.tarea}
        disabled={p.reclamada || (p.hecha ? false : !ruta)}
        onPress={() => (p.hecha ? reclamar(p) : ruta && router.push(ruta as Href))}
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
    );
  }

  return (
    <Tarjeta indice={indice} acento={porReclamar > 0 ? color.logro : color.primario} brillo={porReclamar > 0 ? 0.25 : 0.1}>
      <Pressable onPress={() => setAbierta((a) => !a)} style={{ gap: 6 }}>
        <View style={styles.cabeza}>
          <Texto v="micro" c={color.primarioClaro}>
            Primeros pasos
          </Texto>
          <Texto v="nota" tam={12}>
            {reclamadas}/8 · {abierta ? "ocultar" : "ver todo"}
          </Texto>
        </View>
        <Barra valor={reclamadas / 8} acento={color.logro} alto={6} />
      </Pressable>
      <Animated.View entering={FadeIn} style={{ gap: 4, marginTop: 6 }}>
        {visibles.map(fila)}
        {final && final.hecha && fila(final)}
        {!abierta && final && !final.hecha && (
          <Texto v="nota" tam={11.5} c={color.texto2}>
            Al completar las 8: {TEXTOS_PRIMEROS_PASOS.final.ensena}
          </Texto>
        )}
      </Animated.View>
    </Tarjeta>
  );
}

const styles = StyleSheet.create({
  cabeza: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  fila: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 6 },
  marca: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: color.border, alignItems: "center", justifyContent: "center" },
  premio: { paddingHorizontal: 9, paddingVertical: 5, borderRadius: 999, borderWidth: 1, borderColor: conAlfa(color.logro, 0.6) },
});
