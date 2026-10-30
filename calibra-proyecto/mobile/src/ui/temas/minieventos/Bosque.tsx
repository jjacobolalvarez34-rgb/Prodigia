import { useCallback, useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { COLECCIONES } from "@/lib/temas/colecciones";
import { escenaBosque } from "@/lib/temas/escenasFiestas";
import { bosqueCompartido, FICHAS_BOSQUE, mensajeErrorMinievento, reclamarBosque, type BosqueCompartido } from "@/lib/temas/minieventos";
import { sonar, vibrar } from "~/lib/efectos";
import { supabase } from "~/lib/supabase";
import Boton3D from "~/ui/Boton3D";
import DibujoTema from "~/ui/temas/DibujoTema";
import Texto from "~/ui/Texto";
import { color } from "~/tema";

// Día de la Tierra · «Bosque compartido» (0311, igual que la web): cada 5 aciertos de toda
// la comunidad plantan un árbol; con 400, Semillas para cada uno que haya plantado.
export default function Bosque({ ancho }: { ancho: number }) {
  const ficha = COLECCIONES.dia_tierra!.ficha;
  const [bosque, setBosque] = useState<BosqueCompartido | null>(null);
  const [ocupado, setOcupado] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    const r = await bosqueCompartido(supabase);
    if (r) setBosque(r);
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
      await reclamarBosque(supabase);
      sonar("recompensa");
      setBosque((b) => (b ? { ...b, reclamado: true } : b));
    } catch (e) {
      setError(mensajeErrorMinievento(e));
    } finally {
      setOcupado(false);
    }
  }

  if (!bosque) return null;
  const fraccion = Math.min(1, bosque.arboles / bosque.meta);
  return (
    <View style={{ gap: 8, marginTop: 6 }}>
      <View style={styles.escena}>
        <DibujoTema dibujo={escenaBosque(fraccion)} ancho={ancho} />
      </View>
      <View style={styles.barra}>
        <LinearGradient colors={["#1F8A5B", "#3DDC97"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={[styles.relleno, { width: `${fraccion * 100}%` }]} />
      </View>
      <Texto v="mono" tam={11.5} c="#3DDC97">
        {bosque.arboles.toLocaleString("es")} de {bosque.meta.toLocaleString("es")} árboles · Tú plantaste {bosque.mios}
      </Texto>
      {bosque.arboles >= bosque.meta ? (
        bosque.reclamado ? (
          <Texto v="fuerte" tam={13} c={color.correcto}>
            Ya recibiste tus {ficha.nombre}.
          </Texto>
        ) : (
          <View style={{ gap: 6 }}>
            <Texto v="fuerte" tam={13} c="#3DDC97">
              ¡El bosque está completo!
            </Texto>
            <Boton3D titulo={`Recibir ${FICHAS_BOSQUE} ${ficha.nombre}`} variante="logro" tamano="sm" cargando={ocupado} onPress={reclamar} />
          </View>
        )
      ) : (
        <Texto v="nota" tam={12}>
          Cada 5 aciertos de cualquiera plantan un árbol.
        </Texto>
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
  escena: { borderRadius: 16, overflow: "hidden", borderWidth: 1, borderColor: "rgba(255,255,255,0.1)", backgroundColor: "#0B2018" },
  barra: { height: 8, borderRadius: 999, overflow: "hidden", backgroundColor: "rgba(255,255,255,0.1)" },
  relleno: { height: "100%", borderRadius: 999 },
});
