import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { cargarNiveles, OPERACIONES, operacionDisponible, type Operacion } from "~/lib/numeria";
import { usePerfil } from "~/lib/perfil";
import { useSesion } from "~/lib/sesion";
import Boton3D from "~/ui/Boton3D";
import { color, mono, NUMERIA, radio } from "~/tema";

export default function HubNumeria() {
  const router = useRouter();
  const { sesion } = useSesion();
  const { perfil } = usePerfil(sesion?.user.id);
  const esInvitado = !!sesion?.user.is_anonymous;
  const userId = sesion?.user.id;
  const [niveles, setNiveles] = useState<Record<Operacion, number> | null>(null);
  const [elegidas, setElegidas] = useState<Operacion[]>(["suma"]);

  useFocusEffect(
    useCallback(() => {
      if (userId) cargarNiveles(userId).then(setNiveles);
    }, [userId])
  );

  function alternar(tipo: Operacion) {
    setElegidas((prev) => (prev.includes(tipo) ? (prev.length > 1 ? prev.filter((t) => t !== tipo) : prev) : [...prev, tipo]));
  }

  const bloqueado = perfil !== null && !perfil.mundos_desbloqueados.includes("numeria");

  return (
    <SafeAreaView style={styles.pantalla}>
      <ScrollView contentContainerStyle={styles.contenido}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Text style={styles.atras}>‹ Volver</Text>
        </Pressable>

        <View style={styles.cabecera}>
          <Text style={[styles.glifo, { color: NUMERIA.neon }]}>{NUMERIA.glifo}</Text>
          <View>
            <Text style={styles.titulo}>Numeria</Text>
            <Text style={styles.subtitulo}>Sprint de 60 segundos. La dificultad se ajusta sola.</Text>
          </View>
        </View>

        {bloqueado ? (
          <Text style={styles.aviso}>Numeria no está entre tus mundos. Desbloquéala en la web para jugarla acá.</Text>
        ) : (
          <>
            <Text style={styles.seccion}>¿Qué quieres practicar?</Text>
            <View style={{ gap: 10 }}>
              {OPERACIONES.map((op) => {
                const disponible = operacionDisponible(op.tipo, esInvitado);
                const activa = elegidas.includes(op.tipo);
                return (
                  <Pressable
                    key={op.tipo}
                    disabled={!disponible}
                    onPress={() => alternar(op.tipo)}
                    style={[
                      styles.operacion,
                      { borderColor: activa ? NUMERIA.neon : color.border, backgroundColor: activa ? NUMERIA.base + "26" : color.surface1, opacity: disponible ? 1 : 0.45 },
                    ]}
                  >
                    <Text style={[styles.simbolo, { color: NUMERIA.neon }]}>{op.simbolo}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.opNombre}>{op.nombre}</Text>
                      <Text style={styles.opNota}>{disponible ? "Toca para sumar o quitar" : "Crea una cuenta para desbloquearla"}</Text>
                    </View>
                    <View style={styles.nivel}>
                      <Text style={styles.nivelMicro}>NIVEL</Text>
                      <Text style={[styles.nivelValor, { color: NUMERIA.neon }]}>{niveles ? niveles[op.tipo] : "…"}</Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
            <Boton3D
              titulo="Jugar"
              acento={NUMERIA.base}
              deshabilitado={!niveles}
              onPress={() => router.push({ pathname: "/numeria/sprint", params: { ops: elegidas.join(",") } })}
              estilo={{ marginTop: 8 }}
            />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: color.bg },
  contenido: { padding: 20, gap: 16 },
  atras: { color: color.texto2, fontSize: 16 },
  cabecera: { flexDirection: "row", alignItems: "center", gap: 14 },
  glifo: { fontSize: 44, fontWeight: "800" },
  titulo: { color: color.texto, fontSize: 28, fontWeight: "800" },
  subtitulo: { color: color.texto2, fontSize: 14, maxWidth: 260 },
  seccion: { color: color.texto, fontSize: 18, fontWeight: "700" },
  operacion: { flexDirection: "row", alignItems: "center", gap: 14, borderWidth: 1.5, borderRadius: radio.tarjeta, padding: 14 },
  simbolo: { fontSize: 30, fontWeight: "800", width: 30, textAlign: "center" },
  opNombre: { color: color.texto, fontSize: 17, fontWeight: "700" },
  opNota: { color: color.texto2, fontSize: 12 },
  nivel: { alignItems: "center" },
  nivelMicro: { color: color.texto2, fontSize: 10, fontWeight: "700", letterSpacing: 1 },
  nivelValor: { fontFamily: mono, fontSize: 22, fontWeight: "800" },
  aviso: { color: color.texto2, fontSize: 15, lineHeight: 22 },
});
