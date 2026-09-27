import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, Linking, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { URL_WEB } from "~/lib/entorno";
import { activarAvisos, permisoConcedido } from "~/lib/notificaciones";
import { cargarResumen, type Resumen } from "~/lib/resumen";
import { useSesion } from "~/lib/sesion";
import { supabase } from "~/lib/supabase";
import { actualizarWidgets } from "~/widgets/registro";
import Boton3D from "~/ui/Boton3D";
import { color, radio } from "~/tema";

type TipoAnuncio = "evento" | "actualizacion" | "arreglo";

interface Anuncio {
  id: string;
  tipo: TipoAnuncio;
  titulo: string;
  descripcion: string;
  fecha: string;
  leido: boolean;
}

// Cada tipo de anuncio con su propia luz (tokens del sistema visual).
const ESTILO: Record<TipoAnuncio, { etiqueta: string; icono: string; de: string; a: string; acento: string }> = {
  evento: { etiqueta: "Evento", icono: "🎉", de: "#3A2A0A", a: "#171D34", acento: "#FFB627" },
  actualizacion: { etiqueta: "Novedad", icono: "✨", de: "#2A1F5C", a: "#171D34", acento: "#9B85FF" },
  arreglo: { etiqueta: "Arreglo", icono: "🔧", de: "#0D3326", a: "#171D34", acento: "#3DDC97" },
};

function formatearFecha(iso: string): string {
  const [a, m, d] = iso.split("-").map(Number);
  return new Date(a, m - 1, d).toLocaleDateString("es", { day: "numeric", month: "long" });
}

// Anuncios recientes (0243) con respaldo a los pendientes (0065) si la base todavía
// no tiene la función nueva.
async function cargarAnuncios(): Promise<Anuncio[]> {
  const recientes = await supabase.rpc("anuncios_recientes", { p_limite: 20 });
  if (!recientes.error) {
    return ((recientes.data ?? []) as { out_id: string; out_tipo: TipoAnuncio; out_titulo: string; out_descripcion: string; out_fecha: string; out_leido: boolean }[]).map((a) => ({
      id: a.out_id,
      tipo: a.out_tipo,
      titulo: a.out_titulo,
      descripcion: a.out_descripcion,
      fecha: a.out_fecha,
      leido: a.out_leido,
    }));
  }
  const pendientes = await supabase.rpc("anuncios_pendientes");
  return ((pendientes.data ?? []) as { id: string; tipo: TipoAnuncio; titulo: string; descripcion: string; fecha: string }[])
    .map((a) => ({ ...a, leido: false }))
    .reverse();
}

function TarjetaAnuncio({ anuncio, onAbrir }: { anuncio: Anuncio; onAbrir: () => void }) {
  const [abierto, setAbierto] = useState(false);
  const e = ESTILO[anuncio.tipo] ?? ESTILO.actualizacion;
  return (
    <Pressable
      onPress={() => {
        setAbierto((v) => !v);
        onAbrir();
      }}
      style={({ pressed }) => [pressed && { transform: [{ scale: 0.985 }] }]}
    >
      <LinearGradient colors={[e.de, e.a]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.anuncio, { borderColor: anuncio.leido ? color.border : e.acento }]}>
        <View style={styles.anuncioCabecera}>
          <View style={[styles.chip, { backgroundColor: e.acento + "26" }]}>
            <Text style={[styles.chipTexto, { color: e.acento }]}>
              {e.icono} {e.etiqueta}
            </Text>
          </View>
          <Text style={styles.fecha}>{formatearFecha(anuncio.fecha)}</Text>
          {!anuncio.leido && <View style={[styles.punto, { backgroundColor: e.acento }]} />}
        </View>
        <Text style={styles.anuncioTitulo}>{anuncio.titulo}</Text>
        <Text style={styles.anuncioTexto} numberOfLines={abierto ? undefined : 3}>
          {anuncio.descripcion}
        </Text>
        {!abierto && anuncio.descripcion.length > 140 && <Text style={[styles.leerMas, { color: e.acento }]}>Leer más</Text>}
      </LinearGradient>
    </Pressable>
  );
}

export default function Avisos() {
  const router = useRouter();
  const { sesion } = useSesion();
  const esInvitado = !!sesion?.user.is_anonymous;
  const [resumen, setResumen] = useState<Resumen | null>(null);
  const [anuncios, setAnuncios] = useState<Anuncio[] | null>(null);
  const [permiso, setPermiso] = useState(true);
  const [cargando, setCargando] = useState(false);

  const cargar = useCallback(async () => {
    setCargando(true);
    const [r, a, p] = await Promise.all([cargarResumen(), cargarAnuncios(), permisoConcedido()]);
    setResumen(r);
    setAnuncios(a);
    setPermiso(p);
    setCargando(false);
    actualizarWidgets(r);
  }, []);

  useFocusEffect(
    useCallback(() => {
      cargar();
    }, [cargar])
  );

  async function marcarLeido(id: string) {
    setAnuncios((prev) => prev?.map((a) => (a.id === id ? { ...a, leido: true } : a)) ?? prev);
    await supabase.rpc("marcar_anuncio_leido", { p_anuncio_id: id });
  }

  async function marcarTodo() {
    const pendientes = (anuncios ?? []).filter((a) => !a.leido);
    setAnuncios((prev) => prev?.map((a) => ({ ...a, leido: true })) ?? prev);
    await Promise.all(pendientes.map((a) => supabase.rpc("marcar_anuncio_leido", { p_anuncio_id: a.id })));
    cargarResumen().then(actualizarWidgets);
  }

  const sinLeer = (anuncios ?? []).filter((a) => !a.leido).length;

  return (
    <SafeAreaView style={styles.pantalla}>
      <View style={styles.barra}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Text style={styles.atras}>‹</Text>
        </Pressable>
        <Text style={styles.titulo}>Avisos</Text>
        <Pressable onPress={() => router.push("/ajustes-avisos")} hitSlop={12} accessibilityLabel="Ajustes de avisos">
          <Text style={styles.engranaje}>⚙︎</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.contenido} refreshControl={<RefreshControl refreshing={cargando} onRefresh={cargar} tintColor={color.primario} />}>
        {!permiso && !esInvitado && (
          <LinearGradient colors={["#2A1F5C", "#12172A"]} style={styles.permiso}>
            <Text style={styles.permisoTitulo}>🔔 Activa los avisos</Text>
            <Text style={styles.permisoTexto}>
              Te contamos cuando un amigo te escribe, cuando te retan a un duelo o cuando tu racha está por cortarse. Nunca de noche, y eliges qué recibir.
            </Text>
            <Boton3D
              titulo="Activar avisos"
              onPress={async () => setPermiso(await activarAvisos())}
            />
          </LinearGradient>
        )}

        {!esInvitado && (
          <>
            <Text style={styles.seccion}>Mensajes</Text>
            <Pressable onPress={() => Linking.openURL(`${URL_WEB}/social`)}>
              <LinearGradient
                colors={resumen && resumen.mensajesSinLeer > 0 ? ["#3B2C8F", "#1B1440"] : ["#171D34", "#12172A"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.mensajes}
              >
                <Text style={styles.mensajesIcono}>💬</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.mensajesTitulo}>
                    {resumen && resumen.mensajesSinLeer > 0
                      ? `${resumen.mensajesSinLeer} ${resumen.mensajesSinLeer === 1 ? "mensaje sin leer" : "mensajes sin leer"}`
                      : "Estás al día"}
                  </Text>
                  <Text style={styles.mensajesTexto}>De tus amigos y del chat de tu clan. El chat llega pronto a la app; por ahora se abre en la web.</Text>
                </View>
                <Text style={styles.flecha}>↗</Text>
              </LinearGradient>
            </Pressable>
          </>
        )}

        <View style={styles.filaSeccion}>
          <Text style={styles.seccion}>Novedades y eventos</Text>
          {sinLeer > 0 && (
            <Pressable onPress={marcarTodo} hitSlop={8}>
              <Text style={styles.marcarTodo}>Marcar todo como leído</Text>
            </Pressable>
          )}
        </View>

        {anuncios === null ? (
          <ActivityIndicator color={color.primario} style={{ marginTop: 24 }} />
        ) : anuncios.length === 0 ? (
          <Text style={styles.vacio}>No hay novedades por ahora. Cuando llegue un mundo nuevo o un evento, aparece acá.</Text>
        ) : (
          anuncios.map((a) => <TarjetaAnuncio key={a.id} anuncio={a} onAbrir={() => !a.leido && marcarLeido(a.id)} />)
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
  engranaje: { color: color.texto2, fontSize: 24 },
  contenido: { padding: 20, paddingTop: 8, gap: 14, paddingBottom: 40 },
  permiso: { borderRadius: radio.tarjeta, padding: 18, gap: 10, borderWidth: 1, borderColor: "#3B2C8F" },
  permisoTitulo: { color: color.texto, fontSize: 18, fontWeight: "800" },
  permisoTexto: { color: color.texto2, fontSize: 14, lineHeight: 20 },
  seccion: { color: color.texto, fontSize: 18, fontWeight: "700" },
  filaSeccion: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 6 },
  marcarTodo: { color: color.primario, fontSize: 13, fontWeight: "700" },
  mensajes: { flexDirection: "row", alignItems: "center", gap: 14, borderRadius: radio.tarjeta, padding: 16, borderWidth: 1, borderColor: color.border },
  mensajesIcono: { fontSize: 30 },
  mensajesTitulo: { color: color.texto, fontSize: 17, fontWeight: "800" },
  mensajesTexto: { color: color.texto2, fontSize: 13, lineHeight: 18, marginTop: 2 },
  flecha: { color: color.texto2, fontSize: 20 },
  anuncio: { borderRadius: radio.tarjeta, padding: 16, gap: 8, borderWidth: 1.5 },
  anuncioCabecera: { flexDirection: "row", alignItems: "center", gap: 8 },
  chip: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  chipTexto: { fontSize: 12, fontWeight: "800" },
  fecha: { flex: 1, color: color.texto2, fontSize: 12 },
  punto: { width: 9, height: 9, borderRadius: 5 },
  anuncioTitulo: { color: color.texto, fontSize: 17, fontWeight: "800" },
  anuncioTexto: { color: color.texto2, fontSize: 14, lineHeight: 20 },
  leerMas: { fontSize: 13, fontWeight: "700" },
  vacio: { color: color.texto2, fontSize: 14, lineHeight: 20 },
});
