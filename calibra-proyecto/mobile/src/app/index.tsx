import { Redirect, useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { usePerfil } from "~/lib/perfil";
import { borrarResumen, cargarResumen, type Resumen } from "~/lib/resumen";
import { useSesion } from "~/lib/sesion";
import { supabase } from "~/lib/supabase";
import Boton3D from "~/ui/Boton3D";
import Destacados, { type NovedadDestacada } from "~/ui/Destacados";
import { actualizarWidgets } from "~/widgets/registro";
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
  const [resumen, setResumen] = useState<Resumen | null>(null);
  const [novedades, setNovedades] = useState<NovedadDestacada[]>([]);

  useFocusEffect(
    useCallback(() => {
      cargarResumen().then((r) => {
        setResumen(r);
        actualizarWidgets(r);
      });
      supabase.rpc("anuncios_pendientes").then(({ data }) => setNovedades(((data ?? []) as NovedadDestacada[]).slice().reverse()));
    }, [])
  );

  async function salir() {
    await borrarResumen();
    await actualizarWidgets(null);
    await supabase.auth.signOut();
  }

  if (error) {
    return (
      <SafeAreaView style={[styles.pantalla, styles.centro]}>
        <Text style={styles.error}>{error}</Text>
        <Boton3D titulo="Salir" variante="contorno" onPress={salir} />
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
  const avisos = (resumen?.mensajesSinLeer ?? 0) + (resumen?.novedadesSinLeer ?? 0);
  const pctMeta = resumen ? Math.min(100, Math.round((resumen.xpHoy / Math.max(1, resumen.metaDiaria)) * 100)) : 0;

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
          <Pressable onPress={() => router.push("/avisos")} hitSlop={10} style={styles.campana} accessibilityLabel={`Avisos: ${avisos} sin leer`}>
            <Text style={{ fontSize: 20 }}>🔔</Text>
            {avisos > 0 && (
              <View style={styles.insignia}>
                <Text style={styles.insigniaTexto}>{avisos > 9 ? "9+" : avisos}</Text>
              </View>
            )}
          </Pressable>
        </View>

        <View style={styles.contadores}>
          <Contador icono="🔥" valor={perfil.streak_dias} tono={color.racha} />
          <Contador icono="⚡" valor={perfil.puntos_total.toLocaleString("es")} tono={color.logro} />
          <Contador icono="★" valor={`Nivel ${perfil.nivel_cuenta}`} tono={color.primario} />
        </View>

        <View style={styles.meta}>
          <View style={styles.metaCabecera}>
            <Text style={styles.micro}>{pctMeta >= 100 ? "META DEL DÍA CUMPLIDA ✓" : "META DEL DÍA"}</Text>
            <Text style={styles.metaValor}>{resumen ? `${resumen.xpHoy}/${resumen.metaDiaria}` : "…"}</Text>
          </View>
          <View style={styles.barraFondo}>
            <View style={[styles.barra, { width: `${pctMeta}%`, backgroundColor: pctMeta >= 100 ? color.correcto : color.primario }]} />
          </View>
        </View>

        <Text style={styles.seccion}>Destacados</Text>
        <Destacados novedades={novedades} />

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
          Versión de prueba de la app: por ahora se juegan Numeria y Geografía. Tu progreso es el mismo que en la web.
        </Text>
        <Boton3D titulo="Cerrar sesión" variante="contorno" onPress={salir} />
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
  campana: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: color.surface1,
    borderWidth: 1,
    borderColor: color.border,
    alignItems: "center",
    justifyContent: "center",
  },
  insignia: {
    position: "absolute",
    top: -3,
    right: -3,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: color.error,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 5,
    borderWidth: 2,
    borderColor: color.bg,
  },
  insigniaTexto: { color: "#FFFFFF", fontSize: 11, fontWeight: "800" },
  contadores: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
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
  meta: { backgroundColor: color.surface1, borderRadius: radio.tarjeta, borderWidth: 1, borderColor: color.border, padding: 16, gap: 10 },
  metaCabecera: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  micro: { color: color.texto2, fontSize: 11, fontWeight: "700", letterSpacing: 1 },
  metaValor: { color: color.texto, fontFamily: mono, fontWeight: "700" },
  barraFondo: { height: 10, borderRadius: 5, backgroundColor: color.surface3, overflow: "hidden" },
  barra: { height: "100%", borderRadius: 5 },
  seccion: { color: color.texto, fontSize: 20, fontWeight: "700", marginTop: 4 },
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
