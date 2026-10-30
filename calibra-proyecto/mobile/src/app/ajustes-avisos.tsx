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
  cambiarTipoLocal,
  HORAS_RECORDATORIO,
  leerPreferencias,
  MAX_LOCALES_POR_DIA,
  permisoConcedido,
  TIPOS_LOCALES,
  type PreferenciasAvisos,
} from "~/lib/notificaciones";
import { useSesion } from "~/lib/sesion";
import { anclarWidget } from "~/widgets/registro";
import Boton3D from "~/ui/Boton3D";
import { color, radio, fuente } from "~/tema";
import { IconoAlarma, IconoCampana, IconoCompetir, IconoEscudo, IconoFiesta, IconoLlama, IconoMensaje, IconoParacaidas, IconoPlaneta, IconoRegalo, IconoTrofeo } from "~/ui/Iconos";

function IconoTipo({ icono, c }: { icono: string; c: string }) {
  switch (icono) {
    case "mensaje":
      return <IconoMensaje tam={22} c={c} />;
    case "duelo":
      return <IconoCompetir tam={22} c={c} />;
    case "racha":
      return <IconoLlama tam={22} />;
    case "alineacion":
      return <IconoPlaneta tam={22} c={c} />;
    case "dobleExp":
      return <IconoParacaidas tam={22} c={c} />;
    case "evento":
      return <IconoFiesta tam={22} c={c} />;
    case "temporada":
      return <IconoTrofeo tam={22} c={c} />;
    case "guerra":
      return <IconoEscudo tam={22} c={c} />;
    case "regalo":
      return <IconoRegalo tam={22} c={c} />;
    default:
      return <IconoCampana tam={22} c={c} />;
  }
}

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

        <Text style={styles.seccion}>De otras personas</Text>
        {esInvitado && <Text style={styles.nota}>Con una cuenta de invitado no llegan mensajes ni retos. Crea tu cuenta para recibirlos.</Text>}
        <View style={styles.tarjeta}>
          {CATEGORIAS.filter((c) => c.id === "mensajes" || c.id === "duelos").map((c, i) => (
            <View key={c.id} style={[styles.fila, i > 0 && styles.separador]}>
              <View style={styles.iconoCaja}>
                <IconoTipo icono={c.icono} c={c.color} />
              </View>
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

        <Text style={styles.seccion}>Tu juego</Text>
        <View style={styles.tarjeta}>
          {[
            ...CATEGORIAS.filter((c) => c.id === "racha").map((c) => ({ ...c, local: false, conCuenta: false })),
            ...TIPOS_LOCALES.map((t) => ({ ...t, local: true })),
            ...CATEGORIAS.filter((c) => c.id === "novedades").map((c) => ({ ...c, local: false, conCuenta: true })),
          ].map((t, i) => {
            const activo = t.local ? prefs.locales.includes(t.id as (typeof TIPOS_LOCALES)[number]["id"]) : prefs.categorias.includes(t.id as (typeof CATEGORIAS)[number]["id"]);
            const bloqueado = esInvitado && t.conCuenta;
            return (
              <View key={t.id} style={[styles.fila, i > 0 && styles.separador, bloqueado && { opacity: 0.5 }]}>
                <View style={styles.iconoCaja}>
                  <IconoTipo icono={t.icono} c={t.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.nombre}>{t.nombre}</Text>
                  <Text style={styles.descripcion}>{t.descripcion}</Text>
                </View>
                <Switch
                  value={activo && !bloqueado}
                  disabled={bloqueado}
                  onValueChange={async (v) => {
                    if (v && !(await permisoConcedido()) && !(await activarAvisos())) return;
                    setPrefs(t.local ? await cambiarTipoLocal(t.id as (typeof TIPOS_LOCALES)[number]["id"], v) : await cambiarCategoria(t.id as (typeof CATEGORIAS)[number]["id"], v));
                  }}
                  trackColor={{ true: t.color, false: color.surface3 }}
                  thumbColor={color.texto}
                />
              </View>
            );
          })}
        </View>

        <Text style={styles.seccion}>Recordatorio de práctica</Text>
        <View style={styles.tarjeta}>
          <View style={styles.fila}>
            <View style={styles.iconoCaja}>
              <IconoAlarma tam={22} c={color.logro} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.nombre}>Recordatorio diario</Text>
              <Text style={styles.descripcion}>Un aviso por día a la hora que elijas, con una ciudad distinta cada vez. Si ya jugaste hoy, hoy no sale.</Text>
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
        <Text style={styles.nota}>{`Nunca te avisamos entre las 21:00 y las 08:00 de tu teléfono. Como mucho ${MAX_LOCALES_POR_DIA} avisos de juego por día (los más importantes) y 2 del servidor; los mensajes y retos de tus amigos llegan aparte.`}</Text>

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
                    <Boton3D titulo="Agregar a mi inicio" variante="secundario" onPress={() => anclar(w.nombre)} />
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
  titulo: { flex: 1, color: color.texto, fontSize: 24, fontFamily: fuente.display },
  contenido: { padding: 20, paddingTop: 8, gap: 12, paddingBottom: 40 },
  seccion: { color: color.texto, fontSize: 18, fontFamily: fuente.cuerpoBold, marginTop: 8 },
  tarjeta: { backgroundColor: color.surface1, borderRadius: radio.tarjeta, borderWidth: 1, borderColor: color.border, padding: 14, gap: 10 },
  fila: { flexDirection: "row", alignItems: "center", gap: 12 },
  separador: { borderTopWidth: 1, borderTopColor: color.border, paddingTop: 12 },
  iconoCaja: { width: 30, alignItems: "center" },
  icono: { fontSize: 24, width: 30, textAlign: "center" },
  nombre: { color: color.texto, fontSize: 16, fontFamily: fuente.cuerpoBold },
  descripcion: { fontFamily: fuente.cuerpo, color: color.texto2, fontSize: 13, lineHeight: 18 },
  texto: { fontFamily: fuente.cuerpo, color: color.texto, fontSize: 15 },
  nota: { fontFamily: fuente.cuerpo, color: color.texto2, fontSize: 13, lineHeight: 19 },
  horas: { flexDirection: "row", flexWrap: "wrap", gap: 8, paddingLeft: 42 },
  hora: { borderWidth: 1, borderColor: color.border, borderRadius: radio.chip, paddingHorizontal: 12, paddingVertical: 7, backgroundColor: color.surface2 },
  horaTexto: { color: color.texto2, fontFamily: fuente.cuerpoBold },
  tarjetaWidget: { backgroundColor: color.surface1, borderRadius: radio.tarjeta, borderWidth: 1, borderColor: color.border, padding: 14, gap: 12 },
  previewChica: { width: 130, height: 130, alignSelf: "center" },
  previewGrande: { width: "100%", aspectRatio: 720 / 420 },
  widgetInfo: { gap: 6 },
});
