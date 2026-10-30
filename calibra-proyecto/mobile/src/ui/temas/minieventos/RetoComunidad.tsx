import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { mensajeErrorMinievento, reclamarRetoComunidad, retoComunidad, type RetoComunidad as Reto } from "@/lib/temas/minieventos";
import { sonar, vibrar } from "~/lib/efectos";
import { supabase } from "~/lib/supabase";
import Boton3D from "~/ui/Boton3D";
import Texto from "~/ui/Texto";
import { color, fuente } from "~/tema";

// Año Nuevo · «Reto 2027» (0309, igual que la web): entre toda la comunidad, tantas
// operaciones de Numeria bien resueltas en un día como el año que empieza; si se llega,
// cápsula para todos.
export default function RetoComunidad() {
  const router = useRouter();
  const [reto, setReto] = useState<Reto | null>(null);
  const [ocupado, setOcupado] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    const r = await retoComunidad(supabase);
    if (r) setReto(r);
  }, []);

  useEffect(() => {
    // La cuenta de toda la comunidad (sistema externo): se refresca cada minuto.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void cargar();
    const id = setInterval(() => void cargar(), 60_000);
    return () => clearInterval(id);
  }, [cargar]);

  async function reclamar() {
    vibrar.medio();
    setOcupado(true);
    setError(null);
    try {
      await reclamarRetoComunidad(supabase);
      sonar("recompensa");
      setReto((r) => (r ? { ...r, reclamado: true } : r));
    } catch (e) {
      setError(mensajeErrorMinievento(e));
    } finally {
      setOcupado(false);
    }
  }

  if (!reto) return null;
  const pct = Math.min(100, (reto.total / reto.meta) * 100);
  return (
    <View style={{ gap: 8, marginTop: 6 }}>
      <Texto style={{ fontFamily: fuente.display, fontSize: 28, color: "#FFC53D" }}>
        {reto.total.toLocaleString("es")}
        <Texto style={{ fontFamily: fuente.display, fontSize: 15, color: "rgba(255,255,255,0.5)" }}> / {reto.meta.toLocaleString("es")}</Texto>
      </Texto>
      <View style={styles.barra}>
        <LinearGradient colors={["#A794FF", "#FFC53D"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={[styles.relleno, { width: `${pct}%` }]} />
      </View>
      <Texto v="mono" tam={11}>
        Operaciones de Numeria de toda la comunidad, hoy
      </Texto>
      {reto.logrado ? (
        reto.reclamado ? (
          <Texto v="fuerte" tam={13} c={color.correcto}>
            Ya tienes la cápsula de hoy (está en Recompensas).
          </Texto>
        ) : (
          <View style={{ gap: 6 }}>
            <Texto v="fuerte" tam={13} c="#FFC53D">
              ¡La comunidad lo logró!
            </Texto>
            <Boton3D titulo="Recibir mi cápsula" variante="logro" tamano="sm" cargando={ocupado} onPress={reclamar} />
          </View>
        )
      ) : (
        <View style={{ gap: 6 }}>
          <Texto v="nota" tam={12}>
            Resuelve operaciones en Numeria: cuentan las de toda la comunidad.
          </Texto>
          <Boton3D titulo="Jugar Numeria" tamano="sm" acento="#6C4CF1" onPress={() => router.push("/numeria")} />
        </View>
      )}
      {error && (
        <Texto v="nota" tam={12.5} c={color.error}>
          {error}
        </Texto>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  barra: { height: 10, borderRadius: 999, overflow: "hidden", backgroundColor: "rgba(255,255,255,0.1)" },
  relleno: { height: "100%", borderRadius: 999 },
});
