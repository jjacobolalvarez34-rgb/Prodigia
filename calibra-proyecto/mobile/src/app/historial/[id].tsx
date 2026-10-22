import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import type { DetalleDuelo, LadoDetalle } from "@/lib/partidas/detalleDuelo";
import { tarjetaDeDetalle } from "@/lib/partidas/detalleDuelo";
import { segundosTexto } from "@/lib/partidas/estadisticas";
import { useJugador } from "~/lib/jugador";
import { cargarDetalleDuelo, nombreMundo } from "~/lib/partidasCompartidas";
import { useSesion } from "~/lib/sesion";
import { textosDe } from "~/lib/textosWeb";
import { color, MUNDO_POR_SLUG, type MundoSlug } from "~/tema";
import CompartirPartida from "~/ui/CompartirPartida";
import { PantallaApilada, Vacio } from "~/ui/Pantalla";
import { PreguntaPorPregunta, RepeticionPartida } from "~/ui/RepeticionPartida";
import Tarjeta from "~/ui/Tarjeta";
import Texto from "~/ui/Texto";

const t = textosDe("Partidas");

function pct(p: number | null | undefined): string {
  return p == null ? "—" : `${Math.round(p * 100)}%`;
}

// Detalle de un duelo del historial (2026-10-21), igual que /rankeds/duelo/<id> de
// la web: tú contra tu rival, pregunta por pregunta, repetición y compartir.
export default function PantallaDetalleDuelo() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { sesion } = useSesion();
  const { placa } = useJugador();
  const userId = sesion?.user.id ?? null;
  const [detalle, setDetalle] = useState<DetalleDuelo | null | undefined>(undefined);

  useEffect(() => {
    if (!id || !userId) return;
    let vivo = true;
    cargarDetalleDuelo(id, userId)
      .then((d) => vivo && setDetalle(d))
      .catch(() => vivo && setDetalle(null));
    return () => {
      vivo = false;
    };
  }, [id, userId]);

  if (detalle === undefined) {
    return (
      <PantallaApilada titulo={t("detalle.titulo")}>
        <ActivityIndicator color={color.primarioNeon} style={{ marginTop: 40 }} />
      </PantallaApilada>
    );
  }
  if (!detalle) {
    return (
      <PantallaApilada titulo={t("detalle.titulo")}>
        <Vacio titulo={t("detalle.noEncontrado")} />
      </PantallaApilada>
    );
  }

  const mundo = MUNDO_POR_SLUG[detalle.mundo as MundoSlug];
  const acento = mundo?.neon ?? color.primarioNeon;
  const miNombre = placa?.nombre ?? null;
  const nombreYo = miNombre ?? t("detalle.tu");
  const nombreRival = detalle.rivalNombre ?? t("tarjeta.rival");
  const { yo, rival } = detalle;
  const tono = detalle.resultado === "victoria" ? color.logro : detalle.resultado === "derrota" ? color.error : color.primarioClaro;
  const filas: [string, (l: LadoDetalle) => string][] = [
    [t("detalle.aciertos"), (l) => (l.stats ? `${l.stats.aciertos}/${l.stats.total}` : pct(l.precision))],
    [t("detalle.errores"), (l) => (l.stats ? String(l.stats.errores) : "—")],
    [t("detalle.precision"), (l) => pct(l.stats?.precision ?? l.precision)],
    [t("detalle.rachaMax"), (l) => (l.stats ? String(l.stats.rachaMax) : "—")],
    [t("detalle.tiempoProm"), (l) => segundosTexto(l.stats?.tiempoPromedioMs ?? l.tiempoPromedioMs)],
    [t("detalle.masRapida"), (l) => segundosTexto(l.stats?.masRapidaMs)],
    [t("detalle.masLenta"), (l) => segundosTexto(l.stats?.masLentaMs)],
    [t("detalle.exp"), (l) => `+${l.puntaje}`],
  ];
  const lados = [
    ...(yo?.respuestas ? [{ nombre: nombreYo, respuestas: yo.respuestas, color: acento }] : []),
    ...(rival?.respuestas ? [{ nombre: nombreRival, respuestas: rival.respuestas, color: color.error }] : []),
  ];
  const fecha = new Date(detalle.creadoAt).toLocaleString("es-AR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

  return (
    <PantallaApilada titulo={t("detalle.titulo")} subtitulo={`${nombreMundo(detalle.mundo)} · ${detalle.clasificatorio ? "Ranked" : "Casual"} · ${fecha}`}>
      <Tarjeta sinEntrada acento={tono} brillo={0.25}>
        {detalle.resultado && (
          <Texto v="display" tam={28} c={tono} centro>
            {t(`tarjeta.${detalle.resultado}`)}
          </Texto>
        )}
        <View style={[styles.fila, { marginTop: 8 }]}>
          <View style={styles.lado}>
            <Texto v="nota" numberOfLines={1}>
              {nombreYo}
            </Texto>
            <Texto v="mono" c={detalle.resultado === "victoria" ? color.logro : color.texto} style={{ fontSize: 34, lineHeight: 40 }}>
              {yo?.puntaje ?? "—"}
            </Texto>
          </View>
          <Texto v="h3" c={color.texto2}>
            vs
          </Texto>
          <View style={styles.lado}>
            <Texto v="nota" numberOfLines={1}>
              {nombreRival}
            </Texto>
            <Texto v="mono" c={detalle.resultado === "derrota" ? color.logro : color.texto} style={{ fontSize: 34, lineHeight: 40 }}>
              {rival?.puntaje ?? "—"}
            </Texto>
          </View>
        </View>
      </Tarjeta>

      {yo && (
        <Tarjeta sinEntrada>
          <View style={[styles.filaTabla, { borderBottomWidth: 1, borderBottomColor: color.border }]}>
            <View style={{ flex: 1 }} />
            <Texto v="micro" numberOfLines={1} style={styles.columna}>
              {nombreYo}
            </Texto>
            <Texto v="micro" numberOfLines={1} style={styles.columna}>
              {nombreRival}
            </Texto>
          </View>
          {filas.map(([etiqueta, valor]) => (
            <View key={etiqueta} style={styles.filaTabla}>
              <Texto v="nota" style={{ flex: 1 }}>
                {etiqueta}
              </Texto>
              <Texto v="mono" tam={13} style={styles.columna}>
                {valor(yo)}
              </Texto>
              <Texto v="mono" tam={13} c={color.texto2} style={styles.columna}>
                {rival ? valor(rival) : "—"}
              </Texto>
            </View>
          ))}
        </Tarjeta>
      )}

      {!rival && (
        <Texto v="nota" centro>
          {t("detalle.rivalSinJugar")}
        </Texto>
      )}

      {lados.length > 0 ? (
        <>
          <Tarjeta sinEntrada>
            <Texto v="micro" style={{ marginBottom: 10 }}>
              {t("detalle.repeticion")}
            </Texto>
            <RepeticionPartida lados={lados} acento={acento} />
          </Tarjeta>
          {yo?.respuestas && (
            <Tarjeta sinEntrada>
              <Texto v="micro" style={{ marginBottom: 10 }}>
                {t("detalle.porPregunta")}
              </Texto>
              <PreguntaPorPregunta yo={yo.respuestas} rival={rival?.respuestas ?? null} acento={acento} />
            </Tarjeta>
          )}
        </>
      ) : (
        yo && (
          <Texto v="nota" centro>
            {t("detalle.sinDetalle")}
          </Texto>
        )
      )}

      {yo && <CompartirPartida origen={{ duelId: detalle.duelId }} tarjeta={tarjetaDeDetalle(detalle, miNombre)} acento={mundo?.base} tamano="md" />}

      {detalle.clasificatorio && (
        <Texto v="nota" tam={11} centro>
          {t("detalle.notaElo")}
        </Texto>
      )}
    </PantallaApilada>
  );
}

const styles = StyleSheet.create({
  fila: { flexDirection: "row", alignItems: "center", gap: 10 },
  lado: { flex: 1, alignItems: "center" },
  filaTabla: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 7 },
  columna: { width: 76, textAlign: "right" },
});
