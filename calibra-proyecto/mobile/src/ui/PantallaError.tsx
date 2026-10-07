import { router, type ErrorBoundaryProps } from "expo-router";
import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { color } from "~/tema";
import Boton3D from "./Boton3D";
import Texto from "./Texto";

// Si una pantalla falla al dibujarse, en vez de cerrarse la app se ve esto, con el
// mensaje del error para poder mandarlo.
export default function PantallaError({ error, retry }: ErrorBoundaryProps) {
  return (
    <SafeAreaView style={styles.pantalla}>
      <View style={{ gap: 10 }}>
        <Texto v="h1">Algo falló en esta pantalla</Texto>
        <Texto v="cuerpo" c={color.texto2}>
          La app sigue abierta. Prueba de nuevo y, si se repite, mándanos una captura de este mensaje.
        </Texto>
      </View>
      <ScrollView style={styles.caja}>
        <Texto v="mono" tam={12} c={color.error}>
          {error.message}
        </Texto>
      </ScrollView>
      <View style={{ gap: 10 }}>
        <Boton3D titulo="Reintentar" brillo onPress={retry} />
        <Boton3D titulo="Ir al inicio" variante="secundario" onPress={() => router.replace("/")} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: color.bg, padding: 22, gap: 18, justifyContent: "center" },
  caja: { maxHeight: 180, padding: 12, borderRadius: 14, borderWidth: 1, borderColor: color.border, backgroundColor: color.surface1 },
});
