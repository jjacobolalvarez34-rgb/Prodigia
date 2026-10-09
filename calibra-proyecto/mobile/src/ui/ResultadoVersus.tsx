import { StyleSheet, View } from "react-native";
import Animated, { FadeInDown, ZoomIn } from "react-native-reanimated";
import { rangoDeElo } from "~/lib/placa";
import { color, fuente } from "~/tema";
import NumeroAnimado from "./NumeroAnimado";
import InsigniaRango from "./placa/InsigniaRango";
import Tarjeta from "./Tarjeta";
import Texto from "./Texto";

// Resultado de un versus (duelo suelto o serie "mejor de 3"), con el mismo orden
// que ResultadoDueloBlock y el final de SerieDueloClient de la web: VICTORIA /
// DERROTA grande, contra quién, el marcador, el ELO contando desde el anterior (lo
// más grande de la pantalla), si subiste de rango, y tú contra el rival lado a lado.

export interface DesgloseVersus {
  etiqueta: string;
  mio: string;
  suyo: string;
}

export default function ResultadoVersus({
  gane,
  empate,
  rival,
  linea,
  marcador,
  eloAnterior,
  eloNuevo,
  desglose,
}: {
  gane: boolean;
  empate: boolean;
  rival: string;
  // "Le ganaste a Ana", "Ganaste la serie contra Ana"…
  linea: string;
  marcador?: string;
  eloAnterior?: number | null;
  eloNuevo?: number | null;
  desglose?: DesgloseVersus[];
}) {
  const tono = empate ? color.primarioClaro : gane ? color.correcto : color.error;
  const hayElo = eloAnterior != null && eloNuevo != null;
  const delta = hayElo ? eloNuevo - eloAnterior : 0;
  const subioDeRango = hayElo && gane && rangoDeElo(eloNuevo).slug !== rangoDeElo(eloAnterior).slug;

  return (
    <Animated.View entering={ZoomIn.duration(420)}>
      <Tarjeta sinEntrada acento={tono} brillo={0.35} estilo={styles.tarjeta}>
        <Texto style={[styles.titulo, { color: gane ? color.correcto : color.texto, textShadowColor: tono }]}>{empate ? "EMPATE" : gane ? "VICTORIA" : "DERROTA"}</Texto>
        <Texto v="nota" centro>
          {linea}
        </Texto>
        {marcador ? (
          <Texto v="mono" tam={30} centro style={{ marginTop: 4 }}>
            {marcador}
          </Texto>
        ) : null}
        {hayElo && (
          <View style={{ alignItems: "center", marginTop: 8 }}>
            <Texto v="micro">ELO</Texto>
            <NumeroAnimado valor={eloNuevo} desde={eloAnterior} v="mono" duracion={1400} formato={(n) => String(Math.round(n))} estilo={styles.elo} />
            <Texto v="mono" tam={15} c={delta >= 0 ? color.correcto : color.error}>
              {delta >= 0 ? "+" : ""}
              {delta}
            </Texto>
          </View>
        )}
        {subioDeRango && (
          <Animated.View entering={FadeInDown.delay(500).duration(420)} style={styles.rango}>
            <Texto v="micro" c={color.logro}>
              ¡Subiste de rango!
            </Texto>
            <InsigniaRango elo={eloNuevo!} tam={64} />
          </Animated.View>
        )}
        {desglose && desglose.length > 0 && (
          <View style={styles.desglose}>
            <View style={styles.filaDesglose}>
              <Texto v="fuerte" style={styles.lado}>
                Tú
              </Texto>
              <View style={styles.medio} />
              <Texto v="fuerte" style={styles.lado} numberOfLines={1}>
                {rival}
              </Texto>
            </View>
            {desglose.map((d) => (
              <View key={d.etiqueta} style={styles.filaDesglose}>
                <Texto v="mono" tam={15} style={styles.lado}>
                  {d.mio}
                </Texto>
                <Texto v="nota" tam={11} style={styles.medio}>
                  {d.etiqueta}
                </Texto>
                <Texto v="mono" tam={15} style={styles.lado}>
                  {d.suyo}
                </Texto>
              </View>
            ))}
          </View>
        )}
      </Tarjeta>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  tarjeta: { alignItems: "center", gap: 2, paddingVertical: 20 },
  titulo: { fontFamily: fuente.display, fontSize: 44, lineHeight: 52, letterSpacing: 2, textShadowRadius: 18 },
  elo: { fontFamily: fuente.display, fontSize: 60, lineHeight: 68, color: color.texto },
  rango: { alignItems: "center", gap: 6, marginTop: 10, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 14, backgroundColor: "rgba(255,182,39,0.12)" },
  desglose: { alignSelf: "stretch", gap: 6, marginTop: 14 },
  filaDesglose: { flexDirection: "row", alignItems: "center" },
  lado: { flex: 1, textAlign: "center" },
  medio: { width: 90, textAlign: "center" },
});
