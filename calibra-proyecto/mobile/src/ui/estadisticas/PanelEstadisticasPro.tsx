import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { useRouter, type Href } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Line, Polyline } from "react-native-svg";
import { ciudadDe } from "@/lib/recompensas/catalogo";
import { constancia, estadisticasPro, mejorHora, precisionDe, tendencia, textoConstancia, type EstadisticasPro } from "@/lib/estadisticasPro";
import { supabase } from "~/lib/supabase";
import { color, fuente, conAlfa, temaClaro } from "~/tema";
import Boton3D from "../Boton3D";
import Tarjeta from "../Tarjeta";
import Texto from "../Texto";

// Panel de Estadísticas Pro (0293), igual que el de la web: un solo color para la
// magnitud y las mismas frases de análisis (src/lib/estadisticasPro.ts).
const ESCALA = ["#2A2350", "#3B2F7A", "#5543B0", "#7C5CFF", "#B9A8FF"];

function Analisis({ texto }: { texto: string }) {
  return (
    <View style={styles.analisis}>
      <Texto v="nota" tam={12.5} c={color.texto}>
        {texto}
      </Texto>
    </View>
  );
}

function Seccion({ titulo, sub, children }: { titulo: string; sub?: string; children: React.ReactNode }) {
  return (
    <Tarjeta estilo={{ gap: 10 }}>
      <View>
        <Texto v="h3">{titulo}</Texto>
        {sub && (
          <Texto v="nota" tam={12}>
            {sub}
          </Texto>
        )}
      </View>
      {children}
    </Tarjeta>
  );
}

const seg = (ms: number) => `${(ms / 1000).toFixed(1).replace(".", ",")} s`;

export default function PanelEstadisticasPro() {
  const router = useRouter();
  const [e, setE] = useState<EstadisticasPro | null | undefined>(undefined);
  useEffect(() => {
    estadisticasPro(supabase).then(setE);
  }, []);
  if (!e) return null;
  const dias = constancia(e);
  const hora = mejorHora(e);
  const tend = tendencia(e);
  const delta = e.indice - e.indice_antes;
  const maxHora = Math.max(1, ...e.horas.map((h) => precisionDe(h.correctos, h.intentos)));
  const pts = tend.valores.map((v, i) => `${(i / Math.max(1, tend.valores.length - 1)) * 300},${100 - (v - 40) * 1.6}`).join(" ");

  return (
    <View style={{ gap: 12 }}>
      <View style={styles.heroe}>
        <LinearGradient colors={temaClaro ? [conAlfa(color.primario, 0.22), color.surface1] : ["#2A1F66", "#12172A"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
        <Texto v="micro" c="#B9A8FF">
          ÍNDICE PRODIGIA · ESTA SEMANA
        </Texto>
        <View style={{ flexDirection: "row", alignItems: "baseline", gap: 10 }}>
          <Texto style={{ fontFamily: fuente.display, fontSize: 56, lineHeight: 62, color: color.texto }}>{e.indice}</Texto>
          {e.indice_antes > 0 && (
            <Texto v="mono" tam={15} c={delta >= 0 ? color.correcto : color.error}>
              {delta >= 0 ? `▲ ${delta}` : `▼ ${-delta}`}
            </Texto>
          )}
        </View>
        <Texto v="nota" tam={12.5}>
          Precisión, velocidad y constancia en un solo número.{e.top_pct != null ? ` Estás en el top ${e.top_pct} % de esta semana.` : ""}
        </Texto>
        <View style={{ flexDirection: "row", gap: 8, marginTop: 6 }}>
          {[
            [e.precision != null ? `${e.precision} %` : "—", "precisión"],
            [e.tiempo_ms != null ? seg(e.tiempo_ms) : "—", "por respuesta"],
            [`${e.dias_7}/7`, "días jugados"],
          ].map(([n, t]) => (
            <View key={t} style={styles.mini}>
              <Texto v="mono" tam={16}>
                {n}
              </Texto>
              <Texto v="nota" tam={11}>
                {t}
              </Texto>
            </View>
          ))}
        </View>
      </View>

      <Seccion titulo="Tu constancia" sub="Las últimas 12 semanas: cada cuadro es un día">
        <View style={{ flexDirection: "row", gap: 3 }}>
          {Array.from({ length: 12 }, (_, c) => (
            <View key={c} style={{ flex: 1, gap: 3 }}>
              {dias.slice(c * 7, c * 7 + 7).map((n, f) => (
                <View key={f} style={{ aspectRatio: 1, borderRadius: 3, backgroundColor: n === 0 ? color.surface2 : ESCALA[Math.min(4, Math.floor(n / 15))] }} />
              ))}
            </View>
          ))}
        </View>
        <Analisis texto={textoConstancia(e)} />
      </Seccion>

      {hora && (
        <Seccion titulo="Tu mejor hora" sub="Precisión por hora del día">
          <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 2, height: 80 }}>
            {Array.from({ length: 24 }, (_, h) => {
              const f = e.horas.find((x) => x.hora === h);
              const p = f && f.intentos >= 5 ? precisionDe(f.correctos, f.intentos) : 0;
              return <View key={h} style={{ flex: 1, height: `${(p / maxHora) * 100}%`, borderTopLeftRadius: 3, borderTopRightRadius: 3, backgroundColor: h === hora.hora ? "#B9A8FF" : "#5543B0" }} />;
            })}
          </View>
          <Analisis texto={hora.frase} />
        </Seccion>
      )}

      {e.mundos.length > 0 && (
        <Seccion titulo="Tus fortalezas" sub="Precisión por ciudad (últimos 30 días)">
          {e.mundos.map((m) => {
            const c = ciudadDe(m.mundo);
            const p = precisionDe(m.correctos, m.intentos);
            return (
              <View key={m.mundo} style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <View style={{ width: 96, flexDirection: "row", alignItems: "center", gap: 6 }}>
                  <View style={{ width: 8, height: 8, borderRadius: 2, backgroundColor: c?.color ?? color.primario }} />
                  <Texto v="nota" tam={12.5} c={color.texto}>
                    {c?.nombre ?? m.mundo}
                  </Texto>
                </View>
                <View style={{ flex: 1, height: 10, borderRadius: 4, backgroundColor: color.surface2 }}>
                  <View style={{ width: `${p}%`, height: "100%", borderRadius: 4, backgroundColor: color.primario }} />
                </View>
                <Texto v="mono" tam={11} c={color.texto2}>
                  {p} %
                </Texto>
              </View>
            );
          })}
          {e.mundos[0] && <Analisis texto={`En ${ciudadDe(e.mundos[0].mundo)?.nombre ?? e.mundos[0].mundo} eres más rápido que el ${e.mundos[0].mas_lentos_pct} % de los jugadores.`} />}
        </Seccion>
      )}

      {tend.valores.length > 1 && (
        <Seccion titulo="Tu progreso" sub="Precisión semanal">
          <Svg viewBox="-6 -6 312 116" style={{ width: "100%", height: 110 }}>
            {[60, 80, 100].map((g) => (
              <Line key={g} x1={0} x2={300} y1={100 - (g - 40) * 1.6} y2={100 - (g - 40) * 1.6} stroke={color.border} strokeWidth={1} />
            ))}
            <Polyline points={pts} fill="none" stroke="#9B85FF" strokeWidth={2} strokeLinejoin="round" />
          </Svg>
          <Analisis texto={tend.frase} />
        </Seccion>
      )}

      {e.debiles.length > 0 && (
        <Seccion titulo="Lo que más te cuesta" sub="Los temas con menos aciertos (últimos 30 días)">
          {e.debiles.map((d) => (
            <View key={d.tipo} style={styles.debil}>
              <View style={{ flex: 1 }}>
                <Texto v="fuerte" tam={13}>
                  {(ciudadDe(d.mundo)?.nombre ?? d.mundo) + (d.tipo.startsWith(`${d.mundo}_`) ? ` · ${d.tipo.slice(d.mundo.length + 1).replace(/_/g, " ")}` : "")}
                </Texto>
                <Texto v="mono" tam={11} c={color.racha}>
                  {precisionDe(d.correctos, d.intentos)} % de aciertos
                </Texto>
              </View>
              <Boton3D titulo="Practicar esto" tamano="sm" onPress={() => router.push(`/${d.mundo}` as Href)} />
            </View>
          ))}
        </Seccion>
      )}

      <Seccion titulo="Tus récords">
        <View style={{ flexDirection: "row", gap: 8 }}>
          {[
            [e.records.mas_rapida_ms != null ? seg(e.records.mas_rapida_ms) : "—", "más rápida"],
            [e.records.mejor_dia ? `${e.records.mejor_dia.precision} %` : "—", "mejor día"],
            [e.records.elo != null ? String(e.records.elo) : "—", "ELO"],
          ].map(([n, t]) => (
            <View key={t} style={[styles.mini, { backgroundColor: color.surface2 }]}>
              <Texto v="mono" tam={16}>
                {n}
              </Texto>
              <Texto v="nota" tam={11}>
                {t}
              </Texto>
            </View>
          ))}
        </View>
      </Seccion>
    </View>
  );
}

const styles = StyleSheet.create({
  heroe: { borderRadius: 22, padding: 18, overflow: "hidden", borderWidth: 1, borderColor: "rgba(124,92,255,0.5)", gap: 4 },
  mini: { flex: 1, borderRadius: 12, padding: 10, backgroundColor: "rgba(0,0,0,0.25)" },
  analisis: { borderRadius: 12, borderWidth: 1, borderColor: "rgba(124,92,255,0.35)", backgroundColor: "rgba(124,92,255,0.12)", paddingHorizontal: 10, paddingVertical: 8 },
  debil: { flexDirection: "row", alignItems: "center", gap: 10, borderRadius: 14, backgroundColor: color.surface2, padding: 12 },
});
