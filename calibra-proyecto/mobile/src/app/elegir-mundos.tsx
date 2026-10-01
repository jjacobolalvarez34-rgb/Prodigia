import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { recargarJugador } from "~/lib/jugador";
import { mensajeError, supabase } from "~/lib/supabase";
import Boton3D from "~/ui/Boton3D";
import Ciudad from "~/ui/Ciudad";
import { color, MUNDOS, radio, type MundoSlug, fuente } from "~/tema";

// Primer ingreso: igual que la web, se eligen los 2 mundos gratis (RPC
// elegir_mundos_iniciales, 0190). Numeria sugerido porque es uno de los que ya se juegan acá.
export default function ElegirMundos() {
  const router = useRouter();
  const [elegidos, setElegidos] = useState<MundoSlug[]>(["numeria"]);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function alternar(slug: MundoSlug) {
    setElegidos((prev) => (prev.includes(slug) ? prev.filter((s) => s !== slug) : prev.length >= 2 ? [prev[1], slug] : [...prev, slug]));
  }

  async function confirmar() {
    setEnviando(true);
    setError(null);
    const { error: e } = await supabase.rpc("elegir_mundos_iniciales", { p_mundos: elegidos });
    setEnviando(false);
    if (e) {
      setError(mensajeError(e));
      return;
    }
    await recargarJugador();
    router.replace("/");
  }

  return (
    <SafeAreaView style={styles.pantalla}>
      <ScrollView contentContainerStyle={styles.contenido}>
        <Text style={styles.titulo}>Elige tus 2 mundos</Text>
        <Text style={styles.subtitulo}>Son gratis para siempre. Los demás se desbloquean después.</Text>
        <View style={styles.grilla}>
          {MUNDOS.map((m) => {
            const activo = elegidos.includes(m.slug);
            return (
              <Pressable
                key={m.slug}
                onPress={() => alternar(m.slug)}
                style={[styles.mundo, { borderColor: activo ? m.neon : color.border, backgroundColor: activo ? m.base + "26" : color.surface1 }, activo && { boxShadow: `0px 0px 18px ${m.neon}66` }]}
              >
                <Ciudad semilla={m.slug} acento={m.neon} alto={44} radio={10} apagada={!activo} quieta sinLuna estilo={{ alignSelf: "stretch" }} />
                <Text style={[styles.glifo, { color: m.neon }]}>{m.glifo}</Text>
                <Text style={styles.nombre}>{m.nombre}</Text>
                {!m.enApp && <Text style={styles.nota}>Por ahora en la web</Text>}
              </Pressable>
            );
          })}
        </View>
        {error && <Text style={styles.error}>{error}</Text>}
        <Boton3D titulo={`Confirmar (${elegidos.length}/2)`} onPress={confirmar} cargando={enviando} deshabilitado={elegidos.length !== 2} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: color.bg },
  contenido: { padding: 20, gap: 16 },
  titulo: { color: color.texto, fontSize: 26, fontFamily: fuente.display },
  subtitulo: { fontFamily: fuente.cuerpo, color: color.texto2, fontSize: 15 },
  grilla: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  mundo: { width: "31%", borderWidth: 1.5, borderRadius: radio.tarjeta, padding: 12, alignItems: "center", gap: 4 },
  glifo: { fontSize: 22, fontFamily: fuente.display },
  nombre: { color: color.texto, fontSize: 13, fontFamily: fuente.cuerpoBold, textAlign: "center" },
  nota: { fontFamily: fuente.cuerpo, color: color.texto2, fontSize: 10, textAlign: "center" },
  error: { fontFamily: fuente.cuerpo, color: color.error },
});
