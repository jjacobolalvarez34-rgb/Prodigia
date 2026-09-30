import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { cargarNivelesGeografia, CONTINENTES, type Continente } from "~/lib/geografia";
import { usePerfil } from "~/lib/perfil";
import { useSesion } from "~/lib/sesion";
import { color, mono, MUNDOS, radio } from "~/tema";

const GEOGRAFIA = MUNDOS.find((m) => m.slug === "geografia")!;

export default function HubGeografia() {
  const router = useRouter();
  const { sesion } = useSesion();
  const userId = sesion?.user.id;
  const { perfil } = usePerfil(userId);
  const [niveles, setNiveles] = useState<Record<Continente, number> | null>(null);

  useFocusEffect(
    useCallback(() => {
      if (userId) cargarNivelesGeografia(userId).then(setNiveles);
    }, [userId])
  );

  const bloqueado = perfil !== null && !perfil.mundos_desbloqueados.includes("geografia");

  return (
    <SafeAreaView style={styles.pantalla}>
      <ScrollView contentContainerStyle={styles.contenido}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Text style={styles.atras}>‹ Volver</Text>
        </Pressable>

        <View style={styles.cabecera}>
          <Text style={[styles.glifo, { color: GEOGRAFIA.neon }]}>{GEOGRAFIA.glifo}</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.titulo}>Geografía</Text>
            <Text style={styles.subtitulo}>10 países en 60 segundos, en el mapa real. Cada continente tiene su propio nivel.</Text>
          </View>
        </View>

        {bloqueado ? (
          <Text style={styles.aviso}>Geografía no está entre tus mundos. Desbloquéala en la web para jugarla acá.</Text>
        ) : (
          <>
            <Text style={styles.seccion}>Elige un continente</Text>
            {CONTINENTES.map((c) => (
              <Pressable
                key={c.id}
                onPress={() => router.push({ pathname: "/geografia/sprint", params: { continente: c.id } })}
                style={({ pressed }) => [styles.continente, { borderColor: GEOGRAFIA.neon + "66" }, pressed && { transform: [{ scale: 0.98 }] }]}
              >
                <Text style={styles.continenteGlifo}>{c.glifo}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.continenteNombre}>{c.nombre}</Text>
                  <Text style={styles.continenteNota}>Toca para jugar</Text>
                </View>
                <View style={styles.nivel}>
                  <Text style={styles.nivelMicro}>NIVEL</Text>
                  <Text style={[styles.nivelValor, { color: GEOGRAFIA.neon }]}>{niveles ? niveles[c.id] : "…"}</Text>
                </View>
              </Pressable>
            ))}
            <Text style={styles.nota}>En el mapa: pellizca para acercar y arrastra para moverte. Así los países chicos se tocan fácil.</Text>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: color.bg },
  contenido: { padding: 20, gap: 14 },
  atras: { color: color.texto2, fontSize: 16 },
  cabecera: { flexDirection: "row", alignItems: "center", gap: 14 },
  glifo: { fontSize: 44, fontWeight: "800" },
  titulo: { color: color.texto, fontSize: 28, fontWeight: "800" },
  subtitulo: { color: color.texto2, fontSize: 14 },
  seccion: { color: color.texto, fontSize: 18, fontWeight: "700", marginTop: 4 },
  continente: { flexDirection: "row", alignItems: "center", gap: 14, borderWidth: 1.5, borderRadius: radio.tarjeta, padding: 14, backgroundColor: color.surface1 },
  continenteGlifo: { fontSize: 32 },
  continenteNombre: { color: color.texto, fontSize: 17, fontWeight: "700" },
  continenteNota: { color: color.texto2, fontSize: 12 },
  nivel: { alignItems: "center" },
  nivelMicro: { color: color.texto2, fontSize: 10, fontWeight: "700", letterSpacing: 1 },
  nivelValor: { fontFamily: mono, fontSize: 22, fontWeight: "800" },
  aviso: { color: color.texto2, fontSize: 15, lineHeight: 22 },
  nota: { color: color.texto2, fontSize: 13, lineHeight: 19 },
});
