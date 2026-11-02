import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, { Easing, FadeIn, FadeInDown, useAnimatedStyle, useSharedValue, withDelay, withSpring, withTiming, ZoomIn } from "react-native-reanimated";
import { rangoDeElo } from "~/lib/placa";
import { color, conAlfa, fuente } from "~/tema";
import { IconoCorona } from "./Iconos";
import NumeroAnimado from "./NumeroAnimado";
import InsigniaRango from "./placa/InsigniaRango";
import Tarjeta from "./Tarjeta";
import Texto from "./Texto";

// Resultado de un versus (duelo suelto o serie "mejor de 3"). Rehecho el 2026-11-02
// como un podio de juego: VICTORIA / DERROTA arriba, los dos en su pedestal (el que
// ganó más alto, con la corona y el 1), el puntaje contando, por qué ganó quien ganó,
// el ELO y la comparación fila por fila con lo mejor de cada fila resaltado. Todo
// entra en orden, de arriba abajo, para que se lea como una secuencia y no de golpe.

export interface DesgloseVersus {
  etiqueta: string;
  mio: string;
  suyo: string;
  // Quién gana esa fila (se resalta); null o ausente = parejos.
  mejor?: "mio" | "suyo" | null;
}

const ALTO_PEDESTAL = { gana: 118, pierde: 74, empate: 96 };

function Pedestal({ nombre, puntaje, alto, gana, propio, demora }: { nombre: string; puntaje: number | null; alto: number; gana: boolean; propio: boolean; demora: number }) {
  const h = useSharedValue(0);
  useEffect(() => {
    h.set(withDelay(demora, withSpring(alto, { damping: 14, stiffness: 140 })));
  }, [alto, demora, h]);
  const estilo = useAnimatedStyle(() => ({ height: h.value }));
  const tono = gana ? color.logro : propio ? color.primarioClaro : color.texto2;
  return (
    <View style={styles.columna}>
      <Animated.View entering={FadeInDown.delay(demora + 250).duration(350)} style={{ alignItems: "center", gap: 4 }}>
        <View style={{ height: 22, justifyContent: "flex-end" }}>{gana ? <IconoCorona tam={22} c={color.logro} /> : null}</View>
        <View style={[styles.avatar, { borderColor: tono, backgroundColor: conAlfa(tono, 0.14) }]}>
          <Texto style={{ fontFamily: fuente.display, fontSize: 24, color: tono }}>{(nombre.trim()[0] ?? "?").toUpperCase()}</Texto>
        </View>
        <Texto v="fuerte" tam={14} numberOfLines={1} style={{ maxWidth: 130, textAlign: "center" }}>
          {nombre}
        </Texto>
        {puntaje != null && <NumeroAnimado valor={puntaje} desde={0} demora={demora + 300} duracion={900} v="mono" estilo={[styles.puntaje, { color: gana ? color.logro : color.texto }]} />}
      </Animated.View>
      <Animated.View style={[styles.pedestal, { borderColor: conAlfa(tono, 0.7), backgroundColor: conAlfa(tono, gana ? 0.22 : 0.1) }, estilo]}>
        <Texto style={{ fontFamily: fuente.display, fontSize: 30, color: conAlfa(tono, 0.9) }}>{gana ? "1" : "2"}</Texto>
      </Animated.View>
    </View>
  );
}

// Por qué ganó quien ganó, en una línea (el puntaje de un duelo es la Exp: aciertos,
// dificultad y rapidez).
export function motivoVersus({
  gane,
  empate,
  rival,
  aciertos,
  tiempos,
}: {
  gane: boolean;
  empate: boolean;
  rival: string;
  aciertos?: [number | null, number | null];
  tiempos?: [number | null, number | null];
}): string {
  if (empate) return "Mismo puntaje: ni uno ni otro sacó ventaja.";
  const [a1, a2] = aciertos ?? [null, null];
  const [t1, t2] = tiempos ?? [null, null];
  const quien = gane ? "Acertaste" : `${rival} acertó`;
  if (a1 != null && a2 != null && a1 !== a2) {
    const dif = Math.abs(a1 - a2);
    return `${quien} ${dif} ${dif === 1 ? "pregunta" : "preguntas"} más.`;
  }
  if (t1 != null && t2 != null && Math.abs(t1 - t2) >= 100) {
    const dif = (Math.abs(t1 - t2) / 1000).toFixed(1);
    return gane ? `Mismos aciertos, pero fuiste ${dif} s más rápido por respuesta.` : `Mismos aciertos, pero ${rival} fue ${dif} s más rápido por respuesta.`;
  }
  return gane ? "Mismos aciertos: sumaste más con las preguntas difíciles." : `Mismos aciertos: ${rival} sumó más con las preguntas difíciles.`;
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
  puntajes,
  motivo,
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
  // Lo que va sobre cada pedestal (puntaje del duelo o rondas ganadas de la serie).
  puntajes?: [number | null, number | null];
  motivo?: string;
}) {
  const tono = empate ? color.primarioClaro : gane ? color.correcto : color.error;
  const hayElo = eloAnterior != null && eloNuevo != null;
  const delta = hayElo ? eloNuevo - eloAnterior : 0;
  const subioDeRango = hayElo && gane && rangoDeElo(eloNuevo).slug !== rangoDeElo(eloAnterior).slug;
  const altoMio = empate ? ALTO_PEDESTAL.empate : gane ? ALTO_PEDESTAL.gana : ALTO_PEDESTAL.pierde;
  const altoSuyo = empate ? ALTO_PEDESTAL.empate : gane ? ALTO_PEDESTAL.pierde : ALTO_PEDESTAL.gana;

  // El título entra con un golpe corto (escala que se asienta), sin rebotes largos.
  const golpe = useSharedValue(1.25);
  useEffect(() => {
    golpe.set(withTiming(1, { duration: 320, easing: Easing.out(Easing.cubic) }));
  }, [golpe]);
  const estiloTitulo = useAnimatedStyle(() => ({ transform: [{ scale: golpe.value }] }));

  return (
    <Animated.View entering={ZoomIn.duration(300)}>
      <Tarjeta sinEntrada acento={tono} estilo={styles.tarjeta}>
        <Animated.View entering={FadeIn.duration(200)} style={estiloTitulo}>
          <Texto style={[styles.titulo, { color: empate ? color.texto : gane ? color.correcto : color.error }]}>{empate ? "EMPATE" : gane ? "VICTORIA" : "DERROTA"}</Texto>
        </Animated.View>
        <Texto v="nota" centro>
          {linea}
        </Texto>

        {/* Podio: tú a la izquierda, el rival a la derecha. */}
        <View style={styles.podio}>
          <Pedestal nombre="Tú" puntaje={puntajes?.[0] ?? null} alto={altoMio} gana={gane && !empate} propio demora={150} />
          <Pedestal nombre={rival} puntaje={puntajes?.[1] ?? null} alto={altoSuyo} gana={!gane && !empate} propio={false} demora={300} />
        </View>
        <View style={styles.piso} />

        {marcador ? (
          <Animated.View entering={FadeInDown.delay(650).duration(300)}>
            <Texto v="mono" tam={26} centro>
              {marcador}
            </Texto>
          </Animated.View>
        ) : null}
        {motivo ? (
          <Animated.View entering={FadeInDown.delay(750).duration(300)} style={[styles.motivo, { borderColor: conAlfa(tono, 0.45) }]}>
            <Texto v="fuerte" tam={14} centro>
              {motivo}
            </Texto>
          </Animated.View>
        ) : null}

        {hayElo && (
          <Animated.View entering={FadeInDown.delay(900).duration(320)} style={{ alignItems: "center", marginTop: 10 }}>
            <Texto v="micro">ELO</Texto>
            <NumeroAnimado valor={eloNuevo} desde={eloAnterior} v="mono" demora={1000} duracion={1200} formato={(n) => String(Math.round(n))} estilo={styles.elo} />
            <Texto v="mono" tam={15} c={delta >= 0 ? color.correcto : color.error}>
              {delta >= 0 ? "+" : ""}
              {delta}
            </Texto>
          </Animated.View>
        )}
        {subioDeRango && (
          <Animated.View entering={FadeInDown.delay(1300).duration(380)} style={styles.rango}>
            <Texto v="micro" c={color.logro}>
              ¡Subiste de rango!
            </Texto>
            <InsigniaRango elo={eloNuevo!} tam={64} />
          </Animated.View>
        )}

        {desglose && desglose.length > 0 && (
          <Animated.View entering={FadeInDown.delay(1100).duration(320)} style={styles.desglose}>
            <View style={styles.filaDesglose}>
              <Texto v="micro" style={styles.lado} c={color.primarioClaro}>
                Tú
              </Texto>
              <View style={styles.medio} />
              <Texto v="micro" style={styles.lado} numberOfLines={1}>
                {rival}
              </Texto>
            </View>
            {desglose.map((d) => (
              <View key={d.etiqueta} style={styles.filaDesglose}>
                <View style={[styles.celda, d.mejor === "mio" && styles.celdaMejor]}>
                  <Texto v="mono" tam={15} centro c={d.mejor === "mio" ? color.logro : color.texto}>
                    {d.mio}
                  </Texto>
                </View>
                <Texto v="nota" tam={11} style={styles.medio}>
                  {d.etiqueta}
                </Texto>
                <View style={[styles.celda, d.mejor === "suyo" && styles.celdaMejor]}>
                  <Texto v="mono" tam={15} centro c={d.mejor === "suyo" ? color.logro : color.texto}>
                    {d.suyo}
                  </Texto>
                </View>
              </View>
            ))}
          </Animated.View>
        )}
      </Tarjeta>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  tarjeta: { alignItems: "center", gap: 4, paddingVertical: 20 },
  titulo: { fontFamily: fuente.display, fontSize: 44, lineHeight: 52, letterSpacing: 2 },
  podio: { flexDirection: "row", alignItems: "flex-end", justifyContent: "center", gap: 14, marginTop: 14, alignSelf: "stretch", paddingHorizontal: 10 },
  columna: { flex: 1, alignItems: "center", gap: 8, maxWidth: 150 },
  avatar: { width: 54, height: 54, borderRadius: 27, borderWidth: 2.5, alignItems: "center", justifyContent: "center" },
  puntaje: { fontFamily: fuente.display, fontSize: 26, lineHeight: 30 },
  pedestal: { alignSelf: "stretch", borderTopLeftRadius: 12, borderTopRightRadius: 12, borderWidth: 2, borderBottomWidth: 0, alignItems: "center", paddingTop: 8, overflow: "hidden" },
  piso: { alignSelf: "stretch", height: 3, borderRadius: 2, marginHorizontal: 10, backgroundColor: color.surface3 },
  motivo: { marginTop: 8, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12, borderWidth: 1, backgroundColor: "rgba(255,255,255,0.04)" },
  elo: { fontFamily: fuente.display, fontSize: 56, lineHeight: 64, color: color.texto },
  rango: { alignItems: "center", gap: 6, marginTop: 10, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 14, backgroundColor: "rgba(255,182,39,0.12)" },
  desglose: { alignSelf: "stretch", gap: 6, marginTop: 16 },
  filaDesglose: { flexDirection: "row", alignItems: "center", gap: 6 },
  lado: { flex: 1, textAlign: "center" },
  celda: { flex: 1, paddingVertical: 6, borderRadius: 10, backgroundColor: "rgba(255,255,255,0.04)" },
  celdaMejor: { backgroundColor: "rgba(255,182,39,0.14)" },
  medio: { width: 96, textAlign: "center" },
});
