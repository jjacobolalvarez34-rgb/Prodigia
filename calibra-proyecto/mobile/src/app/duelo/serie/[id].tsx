import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";
import Animated, { FadeInDown, ZoomIn } from "react-native-reanimated";
import { estadoSerie, type RondaSerie } from "~/lib/competir";
import { sonar, vibrar } from "~/lib/efectos";
import { recargarJugador } from "~/lib/jugador";
import Boton3D from "~/ui/Boton3D";
import Confeti from "~/ui/Confeti";
import NumeroAnimado from "~/ui/NumeroAnimado";
import { PantallaApilada } from "~/ui/Pantalla";
import Tarjeta from "~/ui/Tarjeta";
import Texto from "~/ui/Texto";
import { color, fuente, MUNDO_POR_SLUG } from "~/tema";

// Serie "todas las ciudades" (mejor de 3): rondas, quién ganó cada una y el ELO final
// (la base aplica el ELO una sola vez, al terminar la serie).
export default function Serie() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [rondas, setRondas] = useState<RondaSerie[]>([]);
  const [final, setFinal] = useState<Awaited<ReturnType<typeof estadoSerie>>["final"]>(null);
  const festejado = useRef(false);

  const cargar = useCallback(async () => {
    if (!id) return;
    const r = await estadoSerie(id);
    setRondas(r.rondas.sort((a, b) => a.ronda_numero - b.ronda_numero));
    setFinal(r.final);
    if (r.final?.finalizada) recargarJugador();
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      cargar();
    }, [cargar])
  );

  useEffect(() => {
    if (final?.finalizada && !festejado.current) {
      festejado.current = true;
      sonar(final.gane ? "victoria" : final.empate ? "combo" : "derrota");
      if (final.gane) vibrar.exito();
      else vibrar.error();
    }
  }, [final]);

  const siguiente = rondas.find((r) => !r.yo_jugue && r.estado === "pendiente");
  const oponente = rondas[0]?.oponente_nombre ?? "tu rival";
  const delta = final?.finalizada && final.elo_nuevo != null && final.elo_anterior != null ? final.elo_nuevo - final.elo_anterior : null;

  return (
    <View style={{ flex: 1 }}>
      <PantallaApilada titulo="Mejor de 3" subtitulo={`vs ${oponente}`}>
        {final?.finalizada ? (
          <Animated.View entering={ZoomIn.duration(320)}>
            <Tarjeta acento={final.gane ? color.logro : final.empate ? color.primario : color.error} brillo={0.35} estilo={{ alignItems: "center", gap: 6, paddingVertical: 22 }}>
              <Texto v="display">{final.gane ? "¡Ganaste la serie!" : final.empate ? "Empate" : "Perdiste la serie"}</Texto>
              <Texto style={{ fontFamily: fuente.mono, fontSize: 40, color: color.texto }}>
                {final.victorias_propias} – {final.victorias_rival}
              </Texto>
              {delta != null && (
                <NumeroAnimado
                  valor={final.elo_nuevo}
                  desde={final.elo_anterior}
                  v="mono"
                  sufijo={` ELO (${delta >= 0 ? "+" : ""}${delta})`}
                  c={delta >= 0 ? color.correcto : color.error}
                  duracion={1400}
                />
              )}
            </Tarjeta>
          </Animated.View>
        ) : (
          <Tarjeta acento={color.primario} brillo={0.2}>
            <Texto v="h3">La serie sigue</Texto>
            <Texto v="nota">Gana 2 de 3 rondas en ciudades al azar. El ELO se aplica al terminar.</Texto>
          </Tarjeta>
        )}

        {rondas.map((r, i) => {
          const m = MUNDO_POR_SLUG[r.mundo];
          const jugada = r.yo_jugue && r.rival_jugo;
          return (
            <Animated.View key={r.duel_id} entering={FadeInDown.delay(i * 90).duration(300)}>
              <Tarjeta acento={jugada ? (r.gane_ronda ? color.correcto : r.empate_ronda ? undefined : color.error) : m?.neon}>
                <View style={styles.entre}>
                  <View>
                    <Texto v="micro" c={m?.neon}>
                      Ronda {r.ronda_numero}
                    </Texto>
                    <Texto v="h3">{m?.nombre ?? r.mundo}</Texto>
                  </View>
                  <Texto v="mono" c={jugada ? (r.gane_ronda ? color.correcto : color.error) : color.texto2}>
                    {jugada ? `${r.mi_puntaje ?? 0}–${r.rival_puntaje ?? 0}` : r.yo_jugue ? "Esperando rival" : "Por jugar"}
                  </Texto>
                </View>
              </Tarjeta>
            </Animated.View>
          );
        })}

        {siguiente && !final?.finalizada && (
          <Boton3D
            titulo={`Jugar ronda ${siguiente.ronda_numero}`}
            acento={MUNDO_POR_SLUG[siguiente.mundo]?.base}
            brillo
            onPress={() => router.push({ pathname: "/duelo/[id]", params: { id: siguiente.duel_id } })}
          />
        )}
        <Boton3D titulo="Volver a Competir" variante="secundario" onPress={() => router.replace({ pathname: "/competir", params: { seccion: "rankeds" } })} />
      </PantallaApilada>
      {final?.finalizada && final.gane && <Confeti cantidad={48} />}
    </View>
  );
}

const styles = StyleSheet.create({
  entre: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
});
