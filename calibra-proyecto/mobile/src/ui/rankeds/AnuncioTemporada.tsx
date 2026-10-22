import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import Animated, { FadeIn, ZoomIn } from "react-native-reanimated";
import { capsulasAgrupadas, cargarUmbralProdigio, nombreRango, reclamarTemporadaRanked, recompensaTemporadaPendiente, tierTemporada, type RecompensaTemporada } from "@/lib/rankeds/temporadas";
import { rangoDeSlug } from "@/types/database";
import { sonar, vibrar } from "~/lib/efectos";
import { supabase } from "~/lib/supabase";
import { color, conAlfa, fuente } from "~/tema";
import Boton3D from "../Boton3D";
import InsigniaRango from "../placa/InsigniaRango";
import Texto from "../Texto";

// Fin de temporada de rankeds (0296), igual que la web: el rango que alcanzaste con
// su tier (v1, v2, v3…), el título desde Oro y las cápsulas; «Reclamar» las entrega.
// También fija el corte de Prodigio (top 100) para todas las insignias.
export default function AnuncioTemporada() {
  const [recompensa, setRecompensa] = useState<RecompensaTemporada | null>(null);
  const [reclamando, setReclamando] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    let activo = true;
    void cargarUmbralProdigio(supabase);
    recompensaTemporadaPendiente(supabase).then((r) => activo && setRecompensa(r));
    return () => {
      activo = false;
    };
  }, []);

  if (!recompensa) return null;
  const rango = rangoDeSlug(recompensa.rango);
  const c = rango?.colorHex ?? color.logro;

  async function reclamar() {
    if (!recompensa) return;
    setReclamando(true);
    setError(false);
    try {
      await reclamarTemporadaRanked(supabase, recompensa.temporada);
      vibrar.exito();
      sonar("logro");
      setRecompensa(await recompensaTemporadaPendiente(supabase));
    } catch {
      setError(true);
    } finally {
      setReclamando(false);
    }
  }

  return (
    <Animated.View entering={FadeIn.duration(250)} style={styles.fondo}>
      <Animated.View entering={ZoomIn.duration(380)} style={[styles.tarjeta, { borderColor: c }]}>
        <Texto style={{ fontFamily: fuente.cuerpoBold, fontSize: 11, letterSpacing: 2.2, color: c, textAlign: "center" }}>FIN DE LA TEMPORADA {recompensa.temporada}</Texto>
        <View style={styles.insignia}>
          <InsigniaRango elo={recompensa.elo_max} slug={recompensa.rango} tam={112} />
          <View style={[styles.tier, { backgroundColor: c }]}>
            <Texto v="mono" tam={13} c="#05060F">
              {tierTemporada(recompensa.veces)}
            </Texto>
          </View>
        </View>
        <Texto v="h2" centro>
          Llegaste a {nombreRango(recompensa.rango)}
        </Texto>
        <Texto v="nota" centro>
          {recompensa.veces > 1 ? `${recompensa.veces} temporadas en este rango o más` : "Primera vez en este rango"} · ELO máximo {recompensa.elo_max}
        </Texto>
        <View style={styles.lista}>
          {capsulasAgrupadas(recompensa.capsulas).map((k) => (
            <View key={k.tipo} style={styles.fila}>
              <Texto v="nota" tam={13}>
                {k.nombre}
              </Texto>
              <Texto v="mono" tam={13}>
                ×{k.cantidad}
              </Texto>
            </View>
          ))}
          {recompensa.titulo && (
            <View style={styles.fila}>
              <Texto v="nota" tam={13}>
                Título
              </Texto>
              <Texto v="fuerte" tam={13} c={c}>
                {recompensa.titulo}
              </Texto>
            </View>
          )}
        </View>
        {error && (
          <Texto v="nota" centro c={color.error}>
            No se pudo. Inténtalo de nuevo.
          </Texto>
        )}
        <Boton3D titulo={reclamando ? "Entregando…" : "Reclamar recompensas"} variante="logro" brillo deshabilitado={reclamando} onPress={() => void reclamar()} />
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  fondo: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: conAlfa(color.bgHondo, 0.9), zIndex: 121, elevation: 121, justifyContent: "center", padding: 24 },
  tarjeta: { gap: 10, padding: 22, borderRadius: 24, borderWidth: 2, backgroundColor: color.surface2 },
  insignia: { alignSelf: "center", marginTop: 6 },
  tier: { position: "absolute", right: -10, bottom: -2, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999, borderWidth: 2, borderColor: "#05060F" },
  lista: { gap: 6, padding: 12, borderRadius: 14, backgroundColor: "rgba(255,255,255,0.05)" },
  fila: { flexDirection: "row", justifyContent: "space-between", gap: 12 },
});
