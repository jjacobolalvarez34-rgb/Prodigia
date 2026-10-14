import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import Animated, { FadeIn, FadeInDown, FadeOut } from "react-native-reanimated";
import { estadoSerie, type RondaSerie } from "~/lib/competir";
import { sonar, vibrar } from "~/lib/efectos";
import { recargarJugador } from "~/lib/jugador";
import Boton3D from "~/ui/Boton3D";
import Confeti from "~/ui/Confeti";
import { PantallaApilada } from "~/ui/Pantalla";
import ResultadoVersus from "~/ui/ResultadoVersus";
import Tarjeta from "~/ui/Tarjeta";
import Texto from "~/ui/Texto";
import { color, fuente, MUNDO_POR_SLUG } from "~/tema";

// Serie "todas las ciudades" (mejor de 3), igual que SerieDueloClient de la web:
// se actualiza sola cada 3 s, deja leer el resultado de la ronda (3,5 s), muestra
// la transición "siguiente ciudad" y entra sola a la próxima ronda. No hay botón
// para jugar la ronda. Al terminar, el resultado del versus y el ELO (la base lo
// aplica una sola vez, al cerrar la serie).
const CADA_MS = 3000;
const LECTURA_RESULTADO_MS = 3500;
const ESCRIBIR_MS = 60;
const BORRAR_MS = 40;
const PAUSA_MS = 500;
const COLCHON_MS = 300;

type Final = Awaited<ReturnType<typeof estadoSerie>>["final"];

function duracionTransicionMs(anterior: string | null, siguiente: string): number {
  const nueva = siguiente.length * ESCRIBIR_MS;
  if (!anterior) return nueva + COLCHON_MS;
  return anterior.length * ESCRIBIR_MS + PAUSA_MS + anterior.length * BORRAR_MS + nueva + COLCHON_MS;
}

// Escribe el nombre de la ciudad que se acaba de jugar, lo borra y escribe la siguiente.
function TextoQueSeEscribe({ textos, colores }: { textos: string[]; colores: string[] }) {
  const [vista, setVista] = useState({ i: 0, n: 0 });
  // La serie se vuelve a consultar cada 3 s: la escritura no debe reiniciarse por eso.
  const clave = textos.join("|");
  useEffect(() => {
    const lista = clave.split("|");
    const pasos: { i: number; n: number; ms: number }[] = [];
    let t = 0;
    lista.forEach((txt, i) => {
      for (let n = 1; n <= txt.length; n++) pasos.push({ i, n, ms: (t += ESCRIBIR_MS) });
      if (i < lista.length - 1) {
        t += PAUSA_MS;
        for (let n = txt.length - 1; n >= 0; n--) pasos.push({ i, n, ms: (t += BORRAR_MS) });
      }
    });
    const timers = pasos.map((p) =>
      setTimeout(() => {
        setVista({ i: p.i, n: p.n });
        if (p.n > 0) sonar("tecla");
      }, p.ms)
    );
    return () => timers.forEach(clearTimeout);
  }, [clave]);
  return (
    <Texto style={{ fontFamily: fuente.display, fontSize: 40, lineHeight: 48, color: colores[vista.i], textAlign: "center", textShadowColor: colores[vista.i], textShadowRadius: 16 }}>
      {textos[vista.i].slice(0, vista.n) || " "}
    </Texto>
  );
}

function Marcador({ mias, suyas, rival }: { mias: number; suyas: number; rival: string }) {
  return (
    <View style={styles.marcador}>
      <View style={styles.ladoMarcador}>
        <Texto v="micro">Tú</Texto>
        <Texto v="mono" tam={26}>
          {mias}
        </Texto>
      </View>
      <Texto v="nota">–</Texto>
      <View style={styles.ladoMarcador}>
        <Texto v="micro" numberOfLines={1}>
          {rival}
        </Texto>
        <Texto v="mono" tam={26}>
          {suyas}
        </Texto>
      </View>
    </View>
  );
}

export default function Serie() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [rondas, setRondas] = useState<RondaSerie[]>([]);
  const [final, setFinal] = useState<Final>(null);
  const [ranked, setRanked] = useState(true);
  const [cargado, setCargado] = useState(false);
  const [enPantalla, setEnPantalla] = useState(true);
  const [rondaLista, setRondaLista] = useState<string | null>(null);
  const festejado = useRef(false);

  const cargar = useCallback(async () => {
    if (!id) return null;
    const r = await estadoSerie(id);
    setRondas([...r.rondas].sort((a, b) => a.ronda_numero - b.ronda_numero));
    setFinal(r.final);
    setRanked(r.clasificatorio);
    setCargado(true);
    if (r.final?.finalizada) recargarJugador();
    return r.final;
  }, [id]);

  // Se consulta cada 3 s mientras la serie siga abierta y esta pantalla esté a la vista.
  useFocusEffect(
    useCallback(() => {
      let vivo = true;
      setEnPantalla(true);
      (async () => {
        while (vivo) {
          const f = await cargar().catch(() => null);
          if (!vivo || f?.finalizada) return;
          await new Promise((r) => setTimeout(r, CADA_MS));
        }
      })();
      return () => {
        vivo = false;
        setEnPantalla(false);
      };
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

  // Con la serie decidida (2-0) la tercera ronda existe pero ya no se juega.
  const decidida = !!final?.finalizada || rondas.some((r) => r.serie_finalizada);
  const proxima = decidida ? undefined : rondas.find((r) => !r.yo_jugue);
  const indice = proxima ? rondas.indexOf(proxima) : -1;
  const anterior = indice > 0 ? rondas[indice - 1] : null;
  const enCeremonia = !!proxima && rondaLista === proxima.duel_id && enPantalla;
  const nombreDe = (slug: string) => MUNDO_POR_SLUG[slug as keyof typeof MUNDO_POR_SLUG]?.nombre ?? slug;
  const colorDe = (slug: string) => MUNDO_POR_SLUG[slug as keyof typeof MUNDO_POR_SLUG]?.neon ?? color.primarioClaro;

  // Piso de lectura: el resultado de la ronda queda a la vista antes de la transición.
  useEffect(() => {
    if (!proxima || !enPantalla) return;
    const t = setTimeout(() => setRondaLista(proxima.duel_id), LECTURA_RESULTADO_MS);
    return () => clearTimeout(t);
  }, [proxima?.duel_id, enPantalla]); // eslint-disable-line react-hooks/exhaustive-deps

  // Al terminar de escribirse la siguiente ciudad, se entra sola a la ronda.
  useEffect(() => {
    if (!proxima || !enCeremonia || decidida) return;
    vibrar.ligero();
    const t = setTimeout(() => {
      sonar("swoosh");
      router.replace({ pathname: "/duelo/[id]", params: { id: proxima.duel_id } });
    }, duracionTransicionMs(anterior ? nombreDe(anterior.mundo) : null, nombreDe(proxima.mundo)));
    return () => clearTimeout(t);
  }, [proxima?.duel_id, enCeremonia, decidida]); // eslint-disable-line react-hooks/exhaustive-deps

  const oponente = final?.oponente_nombre ?? rondas[0]?.oponente_nombre ?? "tu rival";
  const mias = rondas.filter((r) => r.gane_ronda).length;
  const suyas = rondas.filter((r) => r.estado === "completado" && !r.gane_ronda && !r.empate_ronda).length;
  const salir = () => router.replace({ pathname: "/competir", params: { seccion: "rankeds" } });

  const listaRondas = rondas.map((r, i) => {
    const m = MUNDO_POR_SLUG[r.mundo];
    const resuelta = r.estado === "completado";
    const sobra = decidida && !r.yo_jugue;
    return (
      <Animated.View key={r.duel_id} entering={FadeInDown.delay(i * 90).duration(300)}>
        <Tarjeta acento={resuelta ? (r.gane_ronda ? color.correcto : r.empate_ronda ? undefined : color.error) : m?.neon}>
          <View style={styles.entre}>
            <View style={{ flex: 1 }}>
              <Texto v="micro" c={m?.neon}>
                Ronda {r.ronda_numero}
              </Texto>
              <Texto v="h3">{m?.nombre ?? r.mundo}</Texto>
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <Texto style={{ fontSize: 18 }}>{resuelta ? (r.empate_ronda ? "🤝" : r.gane_ronda ? "✅" : "❌") : sobra ? "—" : "⏳"}</Texto>
              <Texto v="mono" tam={13} c={resuelta ? (r.gane_ronda ? color.correcto : color.error) : color.texto2}>
                {resuelta ? `${r.mi_puntaje ?? 0}–${r.rival_puntaje ?? 0}` : sobra ? "No hizo falta" : r.yo_jugue ? `Esperando a ${oponente}` : "Por jugar"}
              </Texto>
            </View>
          </View>
        </Tarjeta>
      </Animated.View>
    );
  });

  if (final?.finalizada) {
    return (
      <View style={{ flex: 1 }}>
        <PantallaApilada titulo="Mejor de 3" subtitulo={`vs ${oponente}`}>
          <ResultadoVersus
            gane={final.gane}
            empate={final.empate}
            rival={oponente}
            linea={final.empate ? `Empataste la serie con ${oponente}` : final.gane ? `Le ganaste la serie a ${oponente}` : `${oponente} ganó la serie`}
            marcador={`${final.victorias_propias} – ${final.victorias_rival}`}
            eloAnterior={ranked ? final.elo_anterior : null}
            eloNuevo={ranked ? final.elo_nuevo : null}
          />
          {listaRondas}
          <Boton3D titulo="Otra partida" brillo onPress={() => router.replace({ pathname: "/duelo/buscar", params: { mundo: "aleatorio", ranked: ranked ? "1" : "0" } })} />
          <Boton3D titulo="Volver a Competir" variante="secundario" onPress={salir} />
        </PantallaApilada>
        {final.gane && <Confeti cantidad={48} />}
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <PantallaApilada titulo="Mejor de 3" subtitulo={`vs ${oponente}`}>
        <Tarjeta acento={color.primario} brillo={0.2} estilo={{ alignItems: "center", gap: 6 }}>
          <Texto v="micro" c={color.primarioClaro}>
            Gana 2 de 3 rondas en ciudades al azar
          </Texto>
          <Marcador mias={mias} suyas={suyas} rival={oponente} />
        </Tarjeta>
        {!cargado ? <ActivityIndicator color={color.primarioClaro} /> : listaRondas}
        {cargado && !proxima && (
          <View style={styles.esperando}>
            <ActivityIndicator color={color.primarioClaro} />
            <Texto v="nota" centro style={{ flex: 1 }}>
              Esperando a que {oponente} termine su ronda. El resultado aparece solo.
            </Texto>
          </View>
        )}
        {proxima && !enCeremonia && (
          <Texto v="nota" centro>
            La ronda {proxima.ronda_numero} empieza en un momento…
          </Texto>
        )}
        <Boton3D titulo="Volver a Competir" variante="secundario" onPress={salir} />
      </PantallaApilada>

      {proxima && enCeremonia && (
        <Animated.View key={proxima.duel_id} entering={FadeIn.duration(350)} exiting={FadeOut.duration(250)} style={styles.ceremonia}>
          <Marcador mias={mias} suyas={suyas} rival={oponente} />
          <Texto v="micro" style={{ letterSpacing: 4 }}>
            {anterior ? "Siguiente ciudad" : "Arrancamos en"}
          </Texto>
          <TextoQueSeEscribe
            textos={anterior ? [nombreDe(anterior.mundo), nombreDe(proxima.mundo)] : [nombreDe(proxima.mundo)]}
            colores={anterior ? [colorDe(anterior.mundo), colorDe(proxima.mundo)] : [colorDe(proxima.mundo)]}
          />
          <Texto v="nota">Ronda {proxima.ronda_numero} de {rondas.length}</Texto>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  entre: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 10 },
  marcador: { flexDirection: "row", alignItems: "center", gap: 18 },
  ladoMarcador: { alignItems: "center", minWidth: 70, maxWidth: 130 },
  esperando: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 6 },
  ceremonia: { ...StyleSheet.absoluteFill, backgroundColor: color.bgHondo, alignItems: "center", justifyContent: "center", gap: 18, padding: 24, zIndex: 50, elevation: 50 },
});
