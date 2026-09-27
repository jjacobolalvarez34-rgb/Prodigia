import { Image } from "expo-image";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { esAndroid, hayWidgets } from "~/lib/entorno";
import {
  activarAvisos,
  CATEGORIAS,
  cambiarCategoria,
  cambiarRecordatorio,
  HORAS_RECORDATORIO,
  leerPreferencias,
  permisoConcedido,
  type PreferenciasAvisos,
} from "~/lib/notificaciones";
import { useSesion } from "~/lib/sesion";
import { anclarWidget } from "~/widgets/registro";
import Boton3D from "~/ui/Boton3D";
import { color, radio } from "~/tema";

const WIDGETS: { nombre: "Racha" | "Progreso"; titulo: string; texto: string; imagen: number }[] = [
  { nombre: "Racha", titulo: "Racha", texto: "Chico (2×2): tu racha y tus Chispas.", imagen: require("../../assets/widgets/racha.png") },
  { nombre: "Progreso", titulo: "Progreso", texto: "Mediano (4×3): racha, Chispas, nivel, meta del día y avisos.", imagen: require("../../assets/widgets/progreso.png") },
];

export default function AjustesAvisos() {
  const router = useRouter();
  const { sesion } = useSesion();
  const esInvitado = !!sesion?.user.is_anonymous;
  const [prefs, setPrefs] = useState<PreferenciasAvisos | null>(null);
  const [permiso, setPermiso] = useState(true);

  useFocusEffect(
    useCallback(() => {
      leerPreferencias().then(setPrefs);
      permisoConcedido().then(setPermiso);
    }, [])
  );

  async function anclar(nombre: "Racha" | "Progreso") {
    const ok = await anclarWidget(nombre);
    if (!ok) Alert.alert("Agrégalo desde la pantalla de inicio", "Mantén presionado un espacio vacío de la pantalla de inicio → Widgets → Prodigia.");
  }

  if (!prefs) return <SafeAreaView style={styles.pantalla} />;

  return (
    <SafeAreaView style={styles.pantalla}>
      <View style={styles.barra}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Text style={styles.atras}>‹</Text>
        </Pressable>
        <Text style={styles.titulo}>Avisos y widgets</Text>
      </View>

      <ScrollView contentContainerStyle={styles.contenido}>
        {!permiso && (
          <View style={styles.tarjeta}>
            <Text style={styles.texto}>Los avisos están apagados para Prodigia en este teléfono.</Text>
            <Boton3D titulo="Activar avisos" onPress={async () => setPermiso(await activarAvisos())} />
          </View>
        )}

        <Text style={styles.seccion}>Qué quieres recibir</Text>
        {esInvitado && <Text style={styles.nota}>Con una cuenta de invitado solo funciona el recordatorio de práctica. Crea tu cuenta para recibir mensajes y duelos.</Text>}
        <View style={styles.tarjeta}>
          {CATEGORIAS.map((c, i) => (
            <View key={c.id} style={[styles.fila, i > 0 && styles.separador]}>
              <Text style={styles.icono}>{c.icono}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.nombre}>{c.nombre}</Text>
                <Text style={styles.descripcion}>{c.descripcion}</Text>
              </View>
              <Switch
                value={prefs.categorias.includes(c.id)}
                disabled={esInvitado}
                onValueChange={async (v) => setPrefs(await cambiarCategoria(c.id, v))}
                trackColor={{ true: c.color, false: color.surface3 }}
                thumbColor={color.texto}
              />
            </View>
          ))}
        </View>

        <Text style={styles.seccion}>Recordatorio de práctica</Text>
        <View style={styles.tarjeta}>
          <View style={styles.fila}>
            <Text style={styles.icono}>⏰</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.nombre}>Recordatorio diario</Text>
              <Text style={styles.descripcion}>Un aviso por día a la hora que elijas para jugar tu sprint.</Text>
            </View>
            <Switch
              value={prefs.recordatorio.activo}
              onValueChange={async (v) => {
                if (v && !(await permisoConcedido()) && !(await activarAvisos())) return;
                setPrefs(await cambiarRecordatorio(v, prefs.recordatorio.hora));
              }}
              trackColor={{ true: "#FF8A3D", false: color.surface3 }}
              thumbColor={color.texto}
            />
          </View>
          {prefs.recordatorio.activo && (
            <View style={styles.horas}>
              {HORAS_RECORDATORIO.map((h) => {
                const activa = h === prefs.recordatorio.hora;
                return (
                  <Pressable
                    key={h}
                    onPress={async () => setPrefs(await cambiarRecordatorio(true, h))}
                    style={[styles.hora, activa && { backgroundColor: "#FF8A3D", borderColor: "#FF8A3D" }]}
                  >
                    <Text style={[styles.horaTexto, activa && { color: "#FFFFFF" }]}>{`${h}:00`}</Text>
                  </Pressable>
                );
              })}
            </View>
          )}
        </View>
        <Text style={styles.nota}>🌙 Nunca te avisamos entre las 21:00 y las 08:00, y como mucho mandamos 2 recordatorios o novedades por día.</Text>

        {esAndroid && (
          <>
            <Text style={styles.seccion}>Widgets de la pantalla de inicio</Text>
            {WIDGETS.map((w) => (
              <View key={w.nombre} style={styles.tarjetaWidget}>
                <Image source={w.imagen} style={w.nombre === "Racha" ? styles.previewChica : styles.previewGrande} contentFit="contain" />
                <View style={styles.widgetInfo}>
                  <Text style={styles.nombre}>{w.titulo}</Text>
                  <Text style={styles.descripcion}>{w.texto}</Text>
                  {hayWidgets ? (
                    <Boton3D titulo="Agregar a mi inicio" variante="contorno" onPress={() => anclar(w.nombre)} />
                  ) : (
                    <Text style={styles.nota}>Aparecen en la versión instalable de la app (no en Expo Go).</Text>
                  )}
                </View>
              </View>
            ))}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: color.bg },
  barra: { flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingVertical: 8, gap: 12 },
  atras: { color: color.texto, fontSize: 32, lineHeight: 34, width: 28 },
  titulo: { flex: 1, color: color.texto, fontSize: 24, fontWeight: "800" },
  contenido: { padding: 20, paddingTop: 8, gap: 12, paddingBottom: 40 },
  seccion: { color: color.texto, fontSize: 18, fontWeight: "700", marginTop: 8 },
  tarjeta: { backgroundColor: color.surface1, borderRadius: radio.tarjeta, borderWidth: 1, borderColor: color.border, padding: 14, gap: 10 },
  fila: { flexDirection: "row", alignItems: "center", gap: 12 },
  separador: { borderTopWidth: 1, borderTopColor: color.border, paddingTop: 12 },
  icono: { fontSize: 24, width: 30, textAlign: "center" },
  nombre: { color: color.texto, fontSize: 16, fontWeight: "700" },
  descripcion: { color: color.texto2, fontSize: 13, lineHeight: 18 },
  texto: { color: color.texto, fontSize: 15 },
  nota: { color: color.texto2, fontSize: 13, lineHeight: 19 },
  horas: { flexDirection: "row", flexWrap: "wrap", gap: 8, paddingLeft: 42 },
  hora: { borderWidth: 1, borderColor: color.border, borderRadius: radio.chip, paddingHorizontal: 12, paddingVertical: 7, backgroundColor: color.surface2 },
  horaTexto: { color: color.texto2, fontWeight: "700" },
  tarjetaWidget: { backgroundColor: color.surface1, borderRadius: radio.tarjeta, borderWidth: 1, borderColor: color.border, padding: 14, gap: 12 },
  previewChica: { width: 130, height: 130, alignSelf: "center" },
  previewGrande: { width: "100%", aspectRatio: 720 / 420 },
  widgetInfo: { gap: 6 },
});
