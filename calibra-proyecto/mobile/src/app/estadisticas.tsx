import { useFocusEffect, useRouter, type Href } from "expo-router";
import { useCallback, useState } from "react";
import { StyleSheet, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { calcularRachaMaxima } from "@/lib/perfil/records";
import { useJugador } from "~/lib/jugador";
import { useSesion } from "~/lib/sesion";
import { supabase } from "~/lib/supabase";
import Barra from "~/ui/Barra";
import Boton3D from "~/ui/Boton3D";
import { PantallaApilada, TituloSeccion, Vacio } from "~/ui/Pantalla";
import Tarjeta from "~/ui/Tarjeta";
import Texto from "~/ui/Texto";
import { color, conAlfa, mundoDe } from "~/tema";

// Estadísticas (Prodigia Pro), las mismas que /perfil/estadisticas de la web:
// tiempo jugado, intentos, precisión, racha máxima, actividad de los últimos 14
// días, ciudad favorita / mejor / a reforzar y cada ciudad con su subtema más flojo.
// Sin la parte de la Trastienda (la app no la tiene, PROD-01).
interface FilaMundo {
  mundo: string;
  intentos: number;
  correctos: number;
  precision_pct: number;
  tiempo_ms: number;
}
interface FilaActividad {
  fecha: string;
  intentos: number;
}
interface FilaSubtema {
  mundo: string;
  problem_type: string;
  intentos: number;
  precision_pct: number;
}
interface Datos {
  mundos: FilaMundo[];
  actividad: FilaActividad[];
  subtemas: FilaSubtema[];
  rachaMaxima: number;
  gastoTienda: number;
  itemsDesbloqueados: number;
}

const MINIMO_DESTACAR = 5;

function minutos(ms: number): string {
  const m = Math.round(ms / 60_000);
  return m < 60 ? `${m} min` : `${Math.floor(m / 60)} h ${m % 60} min`;
}

function subtema(problemType: string, mundo: string): string {
  const sin = problemType.startsWith(`${mundo}_`) ? problemType.slice(mundo.length + 1) : problemType;
  return sin
    .split("_")
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(" ");
}

function Kpi({ valor, etiqueta, indice }: { valor: string; etiqueta: string; indice: number }) {
  return (
    <View style={{ flex: 1 }}>
      <Tarjeta indice={indice} estilo={{ alignItems: "center", paddingVertical: 12 }}>
        <Texto v="mono" tam={17}>
          {valor}
        </Texto>
        <Texto v="nota" tam={11} centro>
          {etiqueta}
        </Texto>
      </Tarjeta>
    </View>
  );
}

export default function Estadisticas() {
  const router = useRouter();
  const { sesion } = useSesion();
  const userId = sesion?.user.id;
  const { plan } = useJugador();
  const [datos, setDatos] = useState<Datos | null>(null);

  const cargar = useCallback(async () => {
    if (!userId || plan !== "pro") return;
    const [m, a, d, s, ti] = await Promise.all([
      supabase.rpc("estadisticas_pro_perfil"),
      supabase.rpc("estadisticas_pro_actividad_diaria"),
      supabase.from("daily_progress").select("fecha, meta_alcanzada, congelado").eq("user_id", userId).limit(1000),
      supabase.rpc("estadisticas_pro_subtemas"),
      supabase.rpc("estadisticas_pro_tienda_trastienda"),
    ]);
    const tienda = ((ti.data as { gasto_tienda_total: number; items_desbloqueados: number }[] | null) ?? [])[0];
    setDatos({
      mundos: (m.data as FilaMundo[] | null) ?? [],
      actividad: ((a.data as FilaActividad[] | null) ?? []).slice(-14),
      subtemas: (s.data as FilaSubtema[] | null) ?? [],
      rachaMaxima: calcularRachaMaxima((d.data as { fecha: string; meta_alcanzada: boolean; congelado?: boolean }[] | null) ?? []),
      gastoTienda: tienda?.gasto_tienda_total ?? 0,
      itemsDesbloqueados: tienda?.items_desbloqueados ?? 0,
    });
  }, [userId, plan]);

  useFocusEffect(
    useCallback(() => {
      cargar();
    }, [cargar])
  );

  if (plan !== "pro") {
    return (
      <PantallaApilada titulo="Estadísticas" subtitulo="Prodigia Pro">
        <Tarjeta acento={color.logro} brillo={0.25} estilo={{ gap: 8 }}>
          <Texto v="h2">📊 Tus estadísticas, a fondo</Texto>
          <Texto v="nota">
            Tiempo jugado, precisión de cada ciudad, qué tema te cuesta más, tu actividad de las últimas dos semanas y tu racha máxima. Es parte de Prodigia Pro.
          </Texto>
          <Boton3D titulo="Ver Prodigia Pro" acento={color.logroLabio} brillo onPress={() => router.push("/pro" as Href)} />
        </Tarjeta>
      </PantallaApilada>
    );
  }

  if (!datos) {
    return (
      <PantallaApilada titulo="Estadísticas" subtitulo="Prodigia Pro">
        <Texto v="nota" centro>
          Cargando…
        </Texto>
      </PantallaApilada>
    );
  }

  const { mundos } = datos;
  const intentos = mundos.reduce((s, f) => s + f.intentos, 0);
  const correctos = mundos.reduce((s, f) => s + f.correctos, 0);
  const tiempo = mundos.reduce((s, f) => s + f.tiempo_ms, 0);
  const favorita = mundos[0] ?? null;
  const suficientes = mundos.filter((f) => f.intentos >= MINIMO_DESTACAR);
  const mejor = suficientes.length > 0 ? suficientes.reduce((a, b) => (b.precision_pct > a.precision_pct ? b : a)) : null;
  const reforzar = suficientes.length > 1 ? suficientes.reduce((a, b) => (b.precision_pct < a.precision_pct ? b : a)) : null;
  const maxDia = Math.max(1, ...datos.actividad.map((d) => d.intentos));
  const nombre = (slug: string) => mundoDe(slug)?.nombre ?? slug;

  return (
    <PantallaApilada titulo="Estadísticas" subtitulo="Tu progreso, a fondo">
      {mundos.length === 0 ? (
        <Vacio titulo="Todavía no hay datos" texto="Juega unas partidas y aquí verás tu progreso." />
      ) : (
        <>
          <View style={styles.fila}>
            <Kpi indice={0} valor={minutos(tiempo)} etiqueta="Tiempo jugado" />
            <Kpi indice={1} valor={intentos.toLocaleString("es")} etiqueta="Respuestas" />
          </View>
          <View style={styles.fila}>
            <Kpi indice={2} valor={intentos > 0 ? `${Math.round((correctos / intentos) * 100)}%` : "—"} etiqueta="Precisión" />
            <Kpi indice={3} valor={`${datos.rachaMaxima} días`} etiqueta="Racha máxima" />
          </View>

          <Tarjeta indice={4} estilo={{ gap: 6 }}>
            {favorita && (
              <Texto v="cuerpo" tam={14}>
                Tu ciudad favorita es{" "}
                <Texto v="fuerte" tam={14} c={mundoDe(favorita.mundo)?.neon}>
                  {nombre(favorita.mundo)}
                </Texto>
                .
              </Texto>
            )}
            {mejor && (
              <Texto v="cuerpo" tam={14}>
                Donde más aciertas:{" "}
                <Texto v="fuerte" tam={14} c={mundoDe(mejor.mundo)?.neon}>
                  {nombre(mejor.mundo)}
                </Texto>{" "}
                ({Math.round(mejor.precision_pct * 100)}%).
              </Texto>
            )}
            {reforzar && mejor && reforzar.mundo !== mejor.mundo && (
              <Texto v="cuerpo" tam={14}>
                Para reforzar:{" "}
                <Texto v="fuerte" tam={14} c={mundoDe(reforzar.mundo)?.neon}>
                  {nombre(reforzar.mundo)}
                </Texto>{" "}
                ({Math.round(reforzar.precision_pct * 100)}%).
              </Texto>
            )}
          </Tarjeta>

          {datos.actividad.length > 0 && (
            <>
              <TituloSeccion>Últimos 14 días</TituloSeccion>
              <Tarjeta indice={5}>
                <View style={styles.barras}>
                  {datos.actividad.map((d, i) => (
                    <View key={d.fecha} style={styles.columna}>
                      <View style={styles.pista}>
                        <Animated.View
                          entering={FadeInDown.delay(i * 40).duration(300)}
                          style={{ height: `${Math.max(4, Math.round((d.intentos / maxDia) * 100))}%`, backgroundColor: conAlfa(color.primario, 0.8), borderTopLeftRadius: 3, borderTopRightRadius: 3 }}
                        />
                      </View>
                      <Texto v="nota" tam={9}>
                        {new Date(`${d.fecha}T00:00:00Z`).getUTCDate()}
                      </Texto>
                    </View>
                  ))}
                </View>
              </Tarjeta>
            </>
          )}

          <TituloSeccion>Por ciudad</TituloSeccion>
          {mundos.map((f, i) => {
            const m = mundoDe(f.mundo);
            const flojo = datos.subtemas.find((s) => s.mundo === f.mundo);
            return (
              <Tarjeta key={f.mundo} indice={6 + i} acento={m?.neon} estilo={{ gap: 6 }}>
                <View style={styles.entre}>
                  <Texto v="h3">{nombre(f.mundo)}</Texto>
                  <Texto v="mono" tam={18} c={m?.neon}>
                    {Math.round(f.precision_pct * 100)}%
                  </Texto>
                </View>
                <Barra valor={f.precision_pct} acento={m?.base} />
                <View style={styles.entre}>
                  <Texto v="nota" tam={12}>
                    {f.intentos.toLocaleString("es")} respuestas
                  </Texto>
                  <Texto v="nota" tam={12}>
                    {minutos(f.tiempo_ms)}
                  </Texto>
                </View>
                {flojo && flojo.precision_pct < 0.9 && (
                  <Texto v="nota" tam={12}>
                    Te cuesta más: {subtema(flojo.problem_type, f.mundo)} ({Math.round(flojo.precision_pct * 100)}%)
                  </Texto>
                )}
              </Tarjeta>
            );
          })}
        </>
      )}

      <TituloSeccion>Tienda</TituloSeccion>
      <View style={styles.fila}>
        <Kpi indice={0} valor={`${datos.gastoTienda.toLocaleString("es")} ⚡`} etiqueta="Chispas gastadas" />
        <Kpi indice={1} valor={datos.itemsDesbloqueados.toLocaleString("es")} etiqueta="Cosas desbloqueadas" />
      </View>
    </PantallaApilada>
  );
}

const styles = StyleSheet.create({
  fila: { flexDirection: "row", gap: 10 },
  entre: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  barras: { flexDirection: "row", alignItems: "stretch", gap: 4, height: 110 },
  columna: { flex: 1, alignItems: "center", gap: 3 },
  pista: { flex: 1, width: "100%", justifyContent: "flex-end" },
});
