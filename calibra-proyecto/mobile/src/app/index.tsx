import { Redirect, useRouter } from "expo-router";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { usePerfil } from "~/lib/perfil";
import { useSesion } from "~/lib/sesion";
import { supabase } from "~/lib/supabase";
import Boton3D from "~/ui/Boton3D";
import { color, mono, MUNDOS, radio, type Mundo } from "~/tema";

function Contador({ icono, valor, tono }: { icono: string; valor: number | string; tono: string }) {
  return (
    <View style={styles.contador}>
      <Text style={{ fontSize: 15 }}>{icono}</Text>
      <Text style={[styles.contadorValor, { color: tono }]}>{valor}</Text>
    </View>
  );
}

function TarjetaMundo({ mundo, desbloqueado, onPress }: { mundo: Mundo; desbloqueado: boolean; onPress: () => void }) {
  const jugable = desbloqueado && mundo.enApp;
  return (
    <Pressable
      onPress={onPress}
      disabled={!jugable}
      style={({ pressed }) => [
        styles.mundo,
        { borderColor: jugable ? mundo.neon : color.border, opacity: desbloqueado ? 1 : 0.45 },
        pressed && { transform: [{ scale: 0.97 }] },
      ]}
    >
      <View style={[styles.glifoCaja, { backgroundColor: mundo.base + "33" }]}>
        <Text style={[styles.glifo, { color: mundo.neon }]}>{mundo.glifo}</Text>
      </View>
      <Text style={styles.mundoNombre} numberOfLines={1}>
        {mundo.nombre}
      </Text>
      <Text style={[styles.mundoEstado, jugable && { color: mundo.neon }]}>
        {!desbloqueado ? "🔒 Bloqueado" : mundo.enApp ? "Jugar" : "Pronto en la app"}
      </Text>
    </Pressable>
  );
}

export default function Hoy() {
  const router = useRouter();
  const { sesion } = useSesion();
  const { perfil, error } = usePerfil(sesion?.user.id);
  const esInvitado = !!sesion?.user.is_anonymous;

  if (error) {
    return (
      <SafeAreaView style={[styles.pantalla, styles.centro]}>
        <Text style={styles.error}>{error}</Text>
        <Boton3D titulo="Salir" variante="contorno" onPress={() => supabase.auth.signOut()} />
      </SafeAreaView>
    );
  }
  if (!perfil) {
    return (
      <SafeAreaView style={[styles.pantalla, styles.centro]}>
        <ActivityIndicator color={color.primario} />
      </SafeAreaView>
    );
  }
  // Mismo criterio que el guard de la web: sin los 2 mundos iniciales elegidos, onboarding.
  if ((perfil.mundos_desbloqueados ?? []).length < 2) return <Redirect href="/elegir-mundos" />;

  const nombre = esInvitado ? "Invitado" : perfil.display_name ?? "Jugador";

  return (
    <SafeAreaView style={styles.pantalla} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.contenido}>
        <View style={styles.hud}>
          <View style={{ flex: 1 }}>
            <Text style={styles.saludo}>Hola,</Text>
            <Text style={styles.nombre} numberOfLines={1}>
              {nombre}
            </Text>
          </View>
          <View style={styles.contadores}>
            <Contador icono="🔥" valor={perfil.streak_dias} tono={color.racha} />
            <Contador icono="⚡" valor={perfil.puntos_total.toLocaleString("es")} tono={color.logro} />
          </View>
        </View>

        <View style={styles.nivelCuenta}>
          <Text style={styles.micro}>NIVEL DE CUENTA</Text>
          <Text style={styles.nivelValor}>{perfil.nivel_cuenta}</Text>
        </View>

        <Text style={styles.seccion}>Tus mundos</Text>
        <View style={styles.grilla}>
          {MUNDOS.map((m) => (
            <TarjetaMundo
              key={m.slug}
              mundo={m}
              desbloqueado={perfil.mundos_desbloqueados.includes(m.slug)}
              onPress={() => router.push(`/${m.slug}` as "/numeria")}
            />
          ))}
        </View>

        <Text style={styles.nota}>
          Versión de prueba de la app: por ahora se juega Numeria (sprint de las 4 operaciones). Tu progreso es el mismo que en la web.
        </Text>
        <Boton3D titulo="Cerrar sesión" variante="contorno" onPress={() => supabase.auth.signOut()} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: color.bg },
  centro: { alignItems: "center", justifyContent: "center", gap: 16, padding: 24 },
  contenido: { padding: 20, gap: 16, paddingBottom: 40 },
  hud: { flexDirection: "row", alignItems: "center", gap: 12 },
  saludo: { color: color.texto2, fontSize: 14 },
  nombre: { color: color.texto, fontSize: 26, fontWeight: "800" },
  contadores: { flexDirection: "row", gap: 8 },
  contador: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: color.surface1,
    borderColor: color.border,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  contadorValor: { fontFamily: mono, fontWeight: "700", fontSize: 15 },
  nivelCuenta: {
    backgroundColor: color.surface1,
    borderRadius: radio.tarjeta,
    borderWidth: 1,
    borderColor: color.border,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  micro: { color: color.texto2, fontSize: 11, fontWeight: "700", letterSpacing: 1 },
  nivelValor: { color: color.primario, fontFamily: mono, fontSize: 28, fontWeight: "800" },
  seccion: { color: color.texto, fontSize: 20, fontWeight: "700", marginTop: 8 },
  grilla: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  mundo: {
    width: "47.5%",
    backgroundColor: color.surface1,
    borderRadius: radio.tarjeta,
    borderWidth: 1.5,
    padding: 14,
    gap: 8,
  },
  glifoCaja: { width: 44, height: 44, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  glifo: { fontSize: 22, fontWeight: "800" },
  mundoNombre: { color: color.texto, fontSize: 16, fontWeight: "700" },
  mundoEstado: { color: color.texto2, fontSize: 12, fontWeight: "600" },
  nota: { color: color.texto2, fontSize: 13, lineHeight: 19, marginTop: 8 },
  error: { color: color.error, textAlign: "center" },
});
