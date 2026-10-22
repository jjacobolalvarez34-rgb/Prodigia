import { LinearGradient } from "expo-linear-gradient";
import { forwardRef, useState } from "react";
import { StyleSheet, View } from "react-native";
import { aciertosTexto, type LadoTarjeta, type TarjetaPartida } from "@/lib/partidas/compartir";
import type { RespuestaPartida } from "@/lib/partidas/estadisticas";
import { textosDe } from "~/lib/textosWeb";
import { color, conAlfa, MUNDO_POR_SLUG, type MundoSlug } from "~/tema";
import Logo from "./Logo";
import Texto from "./Texto";

// La tarjeta-imagen del resultado (2026-10-21), igual que la de la web
// (calibra/src/lib/partidas/TarjetaImagen.tsx): se dibuja como una vista quieta
// y se captura para compartirla. Proporción 4:5 (la de un post).
const t = textosDe("Partidas.tarjeta");
export const ANCHO_TARJETA = 320;
export const ALTO_TARJETA = 400;

function colorResultado(r: TarjetaPartida["resultado"], acento: string): string {
  if (r === "victoria") return color.logro;
  if (r === "derrota") return color.error;
  if (r === "empate") return color.primarioClaro;
  return acento;
}

function seg(ms: number | null): string {
  return ms == null ? "—" : `${(ms / 1000).toFixed(1)} s`;
}

function Dato({ valor, etiqueta, c = color.texto }: { valor: string; etiqueta: string; c?: string }) {
  return (
    <View style={styles.dato}>
      <Texto v="mono" tam={14} c={c}>
        {valor}
      </Texto>
      <Texto v="nota" tam={8.5} numberOfLines={1}>
        {etiqueta}
      </Texto>
    </View>
  );
}

function Barras({ respuestas, alto, max }: { respuestas: RespuestaPartida[]; alto: number; max: number }) {
  return (
    <View style={[styles.barras, { height: alto }]}>
      {respuestas.slice(0, 30).map((r, i) => (
        <View key={i} style={{ flex: 1, height: Math.max(alto * 0.12, (r.timeMs / max) * alto), borderTopLeftRadius: 3, borderTopRightRadius: 3, backgroundColor: r.correct ? color.correcto : color.error }} />
      ))}
    </View>
  );
}

function Lado({ lado, nombre, gana, acento }: { lado: LadoTarjeta; nombre: string; gana: boolean; acento: string }) {
  return (
    <View style={{ flex: 1, alignItems: "center" }}>
      <Texto v="nota" tam={11} numberOfLines={1}>
        {nombre}
      </Texto>
      <Texto v="mono" c={gana ? color.logro : color.texto} style={{ fontSize: 40, lineHeight: 46 }}>
        {lado.puntaje ?? "—"}
      </Texto>
      <Texto v="mono" tam={11} c={acento}>
        {aciertosTexto(lado)}
      </Texto>
    </View>
  );
}

const TarjetaPartidaVista = forwardRef<View, { tarjeta: TarjetaPartida }>(function TarjetaPartidaVista({ tarjeta }, ref) {
  const mundo = MUNDO_POR_SLUG[tarjeta.mundo as MundoSlug];
  const acento = mundo?.base ?? color.primarioBase;
  const neon = mundo?.neon ?? color.primarioNeon;
  const etiqueta = tarjeta.tipo === "sprint" ? t("partida") : tarjeta.clasificatorio === false ? t("casual") : t("ranked");
  const precision = tarjeta.yo.precision ?? (tarjeta.yo.correctos != null && tarjeta.yo.total ? tarjeta.yo.correctos / tarjeta.yo.total : null);
  const yoR = tarjeta.yo.respuestas?.length ? tarjeta.yo.respuestas : null;
  const rivalR = tarjeta.rival?.respuestas?.length ? tarjeta.rival.respuestas : null;
  const max = Math.max(1, ...(yoR ?? []).slice(0, 30).map((r) => r.timeMs), ...(rivalR ?? []).slice(0, 30).map((r) => r.timeMs));
  const [hoy] = useState(() => Date.now());
  const fecha = new Date(tarjeta.fecha ?? hoy).toLocaleDateString("es-AR", { day: "numeric", month: "short", year: "numeric" });

  return (
    <View ref={ref} collapsable={false} style={styles.tarjeta}>
      <LinearGradient colors={[conAlfa(acento, 0.55), color.bg, color.bg]} locations={[0, 0.55, 1]} start={{ x: 1, y: 0 }} end={{ x: 0.2, y: 1 }} style={StyleSheet.absoluteFill} />
      <View style={styles.entre}>
        <View style={styles.fila}>
          <Logo tam={26} />
          <Texto v="h2" tam={19}>
            Prodigia
          </Texto>
        </View>
        <View style={[styles.chip, { borderColor: neon, backgroundColor: conAlfa(acento, 0.18) }]}>
          <View style={[styles.punto, { backgroundColor: neon }]} />
          <Texto v="fuerte" tam={11}>
            {mundo?.nombre ?? tarjeta.mundo}
          </Texto>
        </View>
      </View>

      <View style={{ alignItems: "center", gap: 2 }}>
        <Texto v="micro" tam={9}>
          {etiqueta}
        </Texto>
        {tarjeta.resultado && (
          <Texto v="display" tam={30} c={colorResultado(tarjeta.resultado, neon)} centro>
            {t(tarjeta.resultado)}
          </Texto>
        )}
        {tarjeta.tipo === "duelo" && tarjeta.rival ? (
          <View style={[styles.fila, { marginTop: 6 }]}>
            <Lado lado={tarjeta.yo} nombre={tarjeta.yo.nombre ?? t("tu")} gana={tarjeta.resultado === "victoria"} acento={neon} />
            <Texto v="h3" c={color.texto2}>
              vs
            </Texto>
            <Lado lado={tarjeta.rival} nombre={tarjeta.rival.nombre ?? t("rival")} gana={tarjeta.resultado === "derrota"} acento={neon} />
          </View>
        ) : (
          <View style={{ alignItems: "center" }}>
            <View style={[styles.fila, { alignItems: "flex-end" }]}>
              <Texto v="mono" style={{ fontSize: 58, lineHeight: 64 }}>
                {aciertosTexto(tarjeta.yo)}
              </Texto>
              <Texto v="fuerte" tam={14} c={neon} style={{ marginBottom: 10 }}>
                {t("aciertos")}
              </Texto>
            </View>
            {tarjeta.yo.nombre && (
              <Texto v="nota" tam={11}>
                {tarjeta.yo.nombre}
              </Texto>
            )}
          </View>
        )}
      </View>

      <View style={{ gap: 8 }}>
        <View style={[styles.fila, { gap: 6 }]}>
          <Dato valor={precision == null ? "—" : `${Math.round(precision * 100)}%`} etiqueta={t("precision")} />
          <Dato valor={seg(tarjeta.yo.tiempoPromedioMs)} etiqueta={t("tiempoProm")} />
          <Dato valor={tarjeta.yo.puntaje == null ? "—" : `+${tarjeta.yo.puntaje}`} etiqueta={t("exp")} c={color.logro} />
          {tarjeta.rachaMax != null && <Dato valor={String(tarjeta.rachaMax)} etiqueta={t("racha")} c={color.racha} />}
        </View>
        {yoR ? (
          <View style={styles.caja}>
            <Texto v="micro" tam={8}>
              {t("porPregunta")}
            </Texto>
            <Barras respuestas={yoR} alto={rivalR ? 26 : 38} max={max} />
            {rivalR && <Barras respuestas={rivalR} alto={26} max={max} />}
          </View>
        ) : tarjeta.yo.correctos != null && tarjeta.yo.total ? (
          <View style={[styles.fila, { gap: 3 }]}>
            {Array.from({ length: Math.min(30, tarjeta.yo.total) }, (_, i) => (
              <View key={i} style={{ flex: 1, height: 7, borderRadius: 3, backgroundColor: i < (tarjeta.yo.correctos ?? 0) ? color.correcto : "rgba(255,255,255,0.1)" }} />
            ))}
          </View>
        ) : null}
      </View>

      <View style={styles.entre}>
        <Texto v="nota" tam={9.5}>
          {t("pie")}
        </Texto>
        <Texto v="nota" tam={9.5}>
          {fecha}
        </Texto>
      </View>
    </View>
  );
});

export default TarjetaPartidaVista;

const styles = StyleSheet.create({
  tarjeta: { width: ANCHO_TARJETA, height: ALTO_TARJETA, padding: 20, justifyContent: "space-between", backgroundColor: color.bg, borderRadius: 18, overflow: "hidden" },
  fila: { flexDirection: "row", alignItems: "center", gap: 8 },
  entre: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  chip: { flexDirection: "row", alignItems: "center", gap: 6, borderWidth: 1.5, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  punto: { width: 7, height: 7, borderRadius: 4 },
  dato: { flex: 1, alignItems: "center", paddingVertical: 6, borderRadius: 10, backgroundColor: "rgba(255,255,255,0.06)", borderWidth: 1, borderColor: "rgba(255,255,255,0.12)" },
  caja: { gap: 5, padding: 9, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.06)", borderWidth: 1, borderColor: "rgba(255,255,255,0.12)" },
  barras: { flexDirection: "row", alignItems: "flex-end", gap: 3 },
});
