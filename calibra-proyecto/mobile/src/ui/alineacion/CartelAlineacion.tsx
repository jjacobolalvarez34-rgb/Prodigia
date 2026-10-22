import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { faltaPara } from "@/lib/temas/eventos";
import {
  alturaSol,
  CHISPAS_COMUNIDAD,
  estadoAlineacionServidor,
  mensajeErrorAlineacion,
  momentoAlineacion,
  PARTIDAS_PARA_CAPSULA,
  reclamarPremioComunidad,
  SOLES,
  type EstadoAlineacionServidor,
} from "@/lib/recompensas/alineacion";
import { sonar, vibrar } from "~/lib/efectos";
import { fijarChispas, useJugador } from "~/lib/jugador";
import { supabase } from "~/lib/supabase";
import { repetirVideo } from "~/lib/videoApertura";
import { VIDEO_ALINEACION } from "@/lib/temas/videosApertura";
import { mostrarAviso } from "../Aviso";
import Boton3D from "../Boton3D";
import Texto, { SobreOscuro } from "../Texto";
import { color, fuente } from "~/tema";

// Cartel de la Gran Alineación en el Inicio (igual que la web, decisiones del
// 2026-10-18): desde 3 días antes con la cuenta regresiva, durante las 3 horas con tu
// avance y la meta de comunidad, y 3 días después con el resumen y el premio de
// comunidad. Los 15 soles están a la altura real de su día en cada ciudad.
const ORO = "#F2C14E";
const MARFIL = "#F6EFE2";

function Soles({ ahora, alineados, ancho }: { ahora: number; alineados: boolean; ancho: number }) {
  return (
    <View pointerEvents="none" style={styles.soles}>
      <LinearGradient colors={[alineados ? "rgba(255,182,39,0.45)" : "rgba(124,92,255,0.16)", "transparent"]} style={styles.brilloHorizonte} />
      <View style={[styles.horizonte, { backgroundColor: alineados ? ORO : "rgba(255,255,255,0.16)", opacity: alineados ? 0.8 : 1 }]} />
      {SOLES.map((s, i) => {
        const x = ancho * (0.05 + (i * 0.9) / (SOLES.length - 1));
        const h = alineados ? 0 : alturaSol(s.slug, ahora);
        const tam = alineados ? 9 : 7;
        return (
          <View
            key={s.slug}
            style={{
              position: "absolute",
              left: x - tam / 2,
              bottom: 26 + h * 56 - tam / 2,
              width: tam,
              height: tam,
              borderRadius: tam,
              backgroundColor: s.color,
              boxShadow: `0px 0px ${alineados ? 12 : 8}px ${s.color}`,
              opacity: h < -0.25 ? 0.12 : h < 0 ? 0.35 : 1,
            }}
          />
        );
      })}
    </View>
  );
}

function Premio({ titulo, como, hecho, progreso }: { titulo: string; como: string; hecho: boolean; progreso: number }) {
  return (
    <View style={[styles.premio, hecho && { borderColor: "rgba(242,193,78,0.55)", backgroundColor: "rgba(242,193,78,0.08)" }]}>
      <Texto style={{ fontFamily: fuente.cuerpoBold, fontSize: 13, color: MARFIL }} numberOfLines={2}>
        {titulo}
      </Texto>
      <Texto style={{ fontSize: 11.5, color: "rgba(255,255,255,0.65)" }}>{hecho ? "Ganado" : como}</Texto>
      <View style={styles.barra}>
        <View style={{ height: "100%", width: `${(hecho ? 1 : progreso) * 100}%`, backgroundColor: ORO, borderRadius: 2 }} />
      </View>
    </View>
  );
}

export default function CartelAlineacion() {
  const router = useRouter();
  const { esInvitado } = useJugador();
  const [ahora, setAhora] = useState(() => Date.now());
  const [estado, setEstado] = useState<EstadoAlineacionServidor | null>(null);
  const [ocupado, setOcupado] = useState(false);
  const [ancho, setAncho] = useState(0);
  const m = momentoAlineacion(ahora);
  const visible = m.momento !== "nada";

  useEffect(() => {
    const id = setInterval(() => setAhora(Date.now()), 15_000);
    return () => clearInterval(id);
  }, []);

  const cargar = useCallback(async () => {
    if (esInvitado) return;
    setEstado(await estadoAlineacionServidor(supabase));
  }, [esInvitado]);

  useFocusEffect(
    useCallback(() => {
      if (visible) void cargar();
    }, [visible, cargar])
  );

  if (!visible) return null;
  const durante = m.momento === "durante";
  const despues = m.momento === "despues";
  const partidas = estado?.partidas ?? 0;
  const fecha = new Date(m.inicio).toLocaleString("es", { weekday: "long", day: "numeric", month: "long", hour: "numeric", minute: "2-digit" });

  async function reclamar() {
    setOcupado(true);
    try {
      const r = await reclamarPremioComunidad(supabase);
      fijarChispas(r.puntos_total);
      sonar("logro");
      vibrar.exito();
      await cargar();
    } catch (e) {
      mostrarAviso(mensajeErrorAlineacion(e), "error");
    } finally {
      setOcupado(false);
    }
  }

  return (
    <SobreOscuro>
      <Animated.View entering={FadeInDown.duration(320)} onLayout={(e) => setAncho(e.nativeEvent.layout.width)} style={[styles.cartel, durante && { borderColor: "rgba(242,193,78,0.7)", boxShadow: "0px 0px 30px rgba(242,193,78,0.35)" }]}>
        <LinearGradient colors={durante ? ["#0a0b16", "#2a1631", "#6b3c0e"] : ["#12122a", "#07080d"]} locations={durante ? [0.25, 0.65, 1] : undefined} style={StyleSheet.absoluteFill} />
        {ancho > 0 && <Soles ahora={ahora} alineados={durante || despues} ancho={ancho} />}
        <View style={{ gap: 6 }}>
          <Texto style={{ fontFamily: fuente.cuerpoBold, fontSize: 11, letterSpacing: 2.8, color: ORO }}>GRAN ALINEACIÓN #{m.numero}</Texto>
          <Texto style={{ fontFamily: fuente.display, fontSize: 28, color: MARFIL, lineHeight: 32 }}>La Gran Alineación</Texto>
          <Texto style={{ fontSize: 13.5, color: "rgba(255,255,255,0.72)" }}>
            {durante ? `Las 15 ciudades amanecieron juntas. Quedan ${faltaPara(m.fin, ahora)}.` : despues ? "Así te fue en la Alineación." : `Las 15 ciudades amanecen juntas. Empieza en ${faltaPara(m.inicio, ahora)}.`}
          </Texto>
          {!despues && (
            <Texto style={{ fontSize: 12, color: "rgba(246,239,226,0.8)", fontFamily: fuente.cuerpoBold }}>
              Exp ×2 · Chispas ×2 · Constelaciones ×2
              <Texto style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}> · {fecha} · 3 horas</Texto>
            </Texto>
          )}
        </View>

        {esInvitado ? (
          <Texto style={{ fontSize: 13, color: "rgba(255,255,255,0.7)" }}>Crea tu cuenta para ganar el sello y la cápsula.</Texto>
        ) : (
          <>
            {despues && (
              <Texto v="mono" tam={13} c={MARFIL}>
                {partidas > 0 ? `${partidas} partidas · +${estado?.xp ?? 0} Exp · +${estado?.chispas ?? 0} Chispas` : "No jugaste en esta Alineación. La próxima es en 28 días."}
              </Texto>
            )}
            <View style={{ flexDirection: "row", gap: 8 }}>
              <Premio titulo={`Sello «Testigo #${m.numero}»`} como="Juega 1 partida" hecho={!!estado?.sello} progreso={Math.min(1, partidas)} />
              <Premio titulo="Cápsula de la Alineación" como={durante ? `${Math.min(partidas, PARTIDAS_PARA_CAPSULA)}/${PARTIDAS_PARA_CAPSULA} partidas` : `Juega ${PARTIDAS_PARA_CAPSULA} partidas`} hecho={!!estado?.capsula} progreso={Math.min(1, partidas / PARTIDAS_PARA_CAPSULA)} />
            </View>
            <View style={styles.comunidad}>
              <Texto style={{ fontFamily: fuente.cuerpoBold, fontSize: 10.5, letterSpacing: 1.4, color: "rgba(255,255,255,0.55)" }}>REGALO PARA TODOS</Texto>
              <Texto style={{ fontSize: 12, color: "rgba(255,255,255,0.75)" }}>{CHISPAS_COMUNIDAD} Chispas para cada jugador, por la Gran Alineación. Se reclaman hasta la próxima.</Texto>
            </View>
            {durante && <Boton3D titulo="Jugar ahora" variante="logro" onPress={() => router.push("/mundos")} />}
            {(durante || despues) && estado && (
              <Boton3D titulo={estado.premio_comunidad ? "Premio reclamado" : `Reclamar ${CHISPAS_COMUNIDAD} Chispas`} variante="secundario" deshabilitado={estado.premio_comunidad} cargando={ocupado} onPress={reclamar} />
            )}
          </>
        )}
        {(durante || despues) && (
          <Pressable onPress={() => repetirVideo(VIDEO_ALINEACION)} hitSlop={8} style={{ alignSelf: "flex-start" }} accessibilityRole="button">
            <Texto style={{ fontFamily: fuente.cuerpoBold, fontSize: 12.5, color: ORO }}>▶ Ver el video de la Alineación</Texto>
          </Pressable>
        )}
        <View style={{ height: 70 }} />
      </Animated.View>
    </SobreOscuro>
  );
}

const styles = StyleSheet.create({
  cartel: { gap: 12, padding: 18, borderRadius: 24, borderWidth: 1.5, borderColor: "rgba(255,255,255,0.12)", overflow: "hidden", backgroundColor: color.bg },
  soles: { position: "absolute", left: 0, right: 0, bottom: 0, height: 110 },
  brilloHorizonte: { position: "absolute", left: 0, right: 0, bottom: 0, height: 26 },
  horizonte: { position: "absolute", left: 0, right: 0, bottom: 26, height: 1 },
  premio: { flex: 1, gap: 4, padding: 10, borderRadius: 16, borderWidth: 1, borderColor: "rgba(255,255,255,0.1)", backgroundColor: "rgba(255,255,255,0.04)" },
  comunidad: { gap: 5, padding: 10, borderRadius: 16, borderWidth: 1, borderColor: "rgba(255,255,255,0.1)", backgroundColor: "rgba(255,255,255,0.04)" },
  barra: { height: 4, borderRadius: 2, backgroundColor: "rgba(255,255,255,0.1)", overflow: "hidden" },
});
