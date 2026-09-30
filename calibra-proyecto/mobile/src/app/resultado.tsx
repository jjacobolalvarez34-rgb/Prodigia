import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { activarAvisos, leerPreferencias, marcarPermisoPedido, permisoConcedido } from "~/lib/notificaciones";
import type { ResultadoPartida } from "~/lib/partida";
import { cargarResumen } from "~/lib/resumen";
import { useSesion } from "~/lib/sesion";
import { actualizarWidgets } from "~/widgets/registro";
import Boton3D from "~/ui/Boton3D";
import { color, mono, MUNDOS, radio } from "~/tema";

type Datos = ResultadoPartida & { xp: number; correctos: number; total: number };

// Resultado de una partida de cualquier mundo: la pantalla del sprint la reemplaza
// por esta con `mundo` y `datos` (JSON). "Jugar otra" vuelve al hub del mundo.

function Metrica({ etiqueta, valor, tono = color.texto }: { etiqueta: string; valor: string; tono?: string }) {
  return (
    <View style={styles.metrica}>
      <Text style={styles.micro}>{etiqueta}</Text>
      <Text style={[styles.metricaValor, { color: tono }]}>{valor}</Text>
    </View>
  );
}

export default function Resultado() {
  const router = useRouter();
  const { datos, mundo: slug } = useLocalSearchParams<{ datos: string; mundo?: string }>();
  const d = JSON.parse(datos ?? "{}") as Datos;
  const MUNDO = MUNDOS.find((m) => m.slug === slug) ?? MUNDOS[0];
  const precision = d.total > 0 ? Math.round((d.correctos / d.total) * 100) : 0;
  const subioMundo = d.nivelMundo != null && d.nivelMundoAnterior != null && d.nivelMundo > d.nivelMundoAnterior;

  const { sesion } = useSesion();
  const [ofrecerAvisos, setOfrecerAvisos] = useState(false);

  useEffect(() => {
    if (d.nivelCuentaSubio || subioMundo) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, [d.nivelCuentaSubio, subioMundo]);

  // Los widgets muestran la racha y las Chispas nuevas apenas termina la partida.
  useEffect(() => {
    cargarResumen().then(actualizarWidgets);
  }, []);

  // El permiso de avisos se pide DESPUÉS del primer sprint, explicando para qué
  // (04-BUCLE-DE-ENGANCHE.md §5), y una sola vez.
  useEffect(() => {
    if (sesion?.user.is_anonymous) return;
    Promise.all([leerPreferencias(), permisoConcedido()]).then(([prefs, concedido]) => setOfrecerAvisos(!prefs.permisoPedido && !concedido));
  }, [sesion?.user.is_anonymous]);

  return (
    <SafeAreaView style={styles.pantalla}>
      <ScrollView contentContainerStyle={styles.contenido}>
        <Text style={styles.titulo}>¡Partida terminada!</Text>

        <View style={[styles.hero, { borderColor: MUNDO.neon }]}>
          <Text style={styles.micro}>CHISPAS GANADAS</Text>
          <Text style={[styles.heroValor, { color: color.logro }]}>+{d.xp} ⚡</Text>
        </View>

        <View style={styles.fila}>
          <Metrica etiqueta="CORRECTAS" valor={`${d.correctos}/${d.total}`} />
          <Metrica etiqueta="PRECISIÓN" valor={`${precision}%`} tono={precision >= 80 ? color.correcto : color.texto} />
        </View>

        {d.nivelCuentaSubio && (
          <View style={[styles.celebracion, { borderColor: color.logro }]}>
            <Text style={styles.celebracionTitulo}>¡Nivel de cuenta {d.nivelCuentaNuevo}!</Text>
            <Text style={styles.celebracionTexto}>Ganaste {d.bonusNivel} Chispas de recompensa.</Text>
          </View>
        )}
        {subioMundo && (
          <View style={[styles.celebracion, { borderColor: MUNDO.neon }]}>
            <Text style={styles.celebracionTitulo}>{MUNDO.nombre} subió a nivel {d.nivelMundo}</Text>
          </View>
        )}

        <View style={styles.meta}>
          <View style={styles.metaCabecera}>
            <Text style={styles.metaTexto}>Meta del día</Text>
            <Text style={styles.metaTexto}>
              {d.xpHoy}/{d.metaDiaria}
            </Text>
          </View>
          <View style={styles.barraFondo}>
            <View
              style={[
                styles.barra,
                { width: `${Math.min(100, (d.xpHoy / Math.max(1, d.metaDiaria)) * 100)}%`, backgroundColor: d.metaAlcanzada ? color.correcto : MUNDO.neon },
              ]}
            />
          </View>
          {d.metaAlcanzada && <Text style={[styles.metaTexto, { color: color.correcto }]}>¡Meta cumplida!</Text>}
        </View>

        {ofrecerAvisos && (
          <LinearGradient colors={["#2A1F5C", "#12172A"]} style={styles.avisos}>
            <Text style={styles.avisosTitulo}>🔔 ¿Te avisamos?</Text>
            <Text style={styles.avisosTexto}>
              Cuando un amigo te escribe, cuando te retan a un duelo o cuando tu racha está por cortarse. Nunca de noche, y eliges qué recibir.
            </Text>
            <View style={styles.avisosBotones}>
              <Boton3D
                titulo="Ahora no"
                variante="contorno"
                estilo={{ flex: 1 }}
                onPress={() => {
                  marcarPermisoPedido();
                  setOfrecerAvisos(false);
                }}
              />
              <Boton3D
                titulo="Activar"
                estilo={{ flex: 1 }}
                onPress={async () => {
                  await activarAvisos();
                  setOfrecerAvisos(false);
                }}
              />
            </View>
          </LinearGradient>
        )}

        <Text style={styles.total}>Tienes {d.chispasTotal.toLocaleString("es")} Chispas en total.</Text>

        <Boton3D titulo="Jugar otra" acento={MUNDO.base} onPress={() => router.back()} />
        <Boton3D titulo="Volver al inicio" variante="contorno" onPress={() => router.dismissTo("/")} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: color.bg },
  contenido: { padding: 20, gap: 16, paddingTop: 32 },
  titulo: { color: color.texto, fontSize: 28, fontWeight: "800", textAlign: "center" },
  hero: { backgroundColor: color.surface1, borderWidth: 2, borderRadius: radio.tarjeta, padding: 24, alignItems: "center", gap: 6 },
  heroValor: { fontFamily: mono, fontSize: 44, fontWeight: "800" },
  micro: { color: color.texto2, fontSize: 11, fontWeight: "700", letterSpacing: 1 },
  fila: { flexDirection: "row", gap: 12 },
  metrica: { flex: 1, backgroundColor: color.surface1, borderWidth: 1, borderColor: color.border, borderRadius: radio.tarjeta, padding: 16, gap: 4 },
  metricaValor: { fontFamily: mono, fontSize: 26, fontWeight: "800" },
  celebracion: { backgroundColor: color.surface2, borderWidth: 1.5, borderRadius: radio.tarjeta, padding: 16, alignItems: "center", gap: 4 },
  celebracionTitulo: { color: color.texto, fontSize: 18, fontWeight: "800" },
  celebracionTexto: { color: color.texto2, fontSize: 14 },
  meta: { backgroundColor: color.surface1, borderWidth: 1, borderColor: color.border, borderRadius: radio.tarjeta, padding: 16, gap: 10 },
  metaCabecera: { flexDirection: "row", justifyContent: "space-between" },
  metaTexto: { color: color.texto2, fontSize: 14, fontWeight: "600" },
  barraFondo: { height: 10, borderRadius: 5, backgroundColor: color.surface3, overflow: "hidden" },
  barra: { height: "100%", borderRadius: 5 },
  total: { color: color.texto2, textAlign: "center", fontSize: 14 },
  avisos: { borderRadius: radio.tarjeta, padding: 18, gap: 10, borderWidth: 1, borderColor: "#3B2C8F" },
  avisosTitulo: { color: color.texto, fontSize: 18, fontWeight: "800" },
  avisosTexto: { color: color.texto2, fontSize: 14, lineHeight: 20 },
  avisosBotones: { flexDirection: "row", gap: 10 },
});
