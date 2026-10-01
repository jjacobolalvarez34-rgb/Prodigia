import { useRouter } from "expo-router";
import type { ReactNode } from "react";
import { Pressable, ScrollView, StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { vibrar } from "~/lib/efectos";
import { color } from "~/tema";
import HUD from "./HUD";
import { IconoFlecha } from "./Iconos";
import Texto from "./Texto";

// Pantalla de pestaña: HUD arriba y el contenido. Los datos se refrescan solos
// cada vez que la pantalla vuelve a verse (no hay "jalar para recargar").
export function PantallaPestana({
  children,
  sinScroll,
  hudDerecha,
  contenido,
}: {
  children: ReactNode;
  sinScroll?: boolean;
  hudDerecha?: ReactNode;
  contenido?: StyleProp<ViewStyle>;
}) {
  return (
    <SafeAreaView style={styles.pantalla} edges={["top"]}>
      <HUD derecha={hudDerecha} />
      {sinScroll ? (
        <View style={[styles.contenido, { flex: 1 }, contenido]}>{children}</View>
      ) : (
        <ScrollView
          contentContainerStyle={[styles.contenido, contenido]}
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

export function BotonAtras({ onPress }: { onPress?: () => void }) {
  const router = useRouter();
  return (
    <Pressable
      onPress={() => {
        vibrar.seleccion();
        if (onPress) onPress();
        else if (router.canGoBack()) router.back();
        else router.replace("/");
      }}
      hitSlop={10}
      style={styles.atras}
      accessibilityLabel="Volver"
    >
      <IconoFlecha tam={20} c={color.texto} />
    </Pressable>
  );
}

// Pantalla apilada (tienda, chat, perfil público…): flecha atrás + título.
export function PantallaApilada({
  titulo,
  subtitulo,
  children,
  derecha,
  sinScroll,
  fondo = color.bg,
  contenido,
}: {
  titulo: string;
  subtitulo?: string;
  children: ReactNode;
  derecha?: ReactNode;
  sinScroll?: boolean;
  fondo?: string;
  contenido?: StyleProp<ViewStyle>;
}) {
  return (
    <SafeAreaView style={[styles.pantalla, { backgroundColor: fondo }]} edges={["top"]}>
      <View style={styles.cabecera}>
        <BotonAtras />
        <View style={{ flex: 1 }}>
          <Texto v="h2" numberOfLines={1}>
            {titulo}
          </Texto>
          {subtitulo ? (
            <Texto v="nota" numberOfLines={1}>
              {subtitulo}
            </Texto>
          ) : null}
        </View>
        {derecha}
      </View>
      {sinScroll ? (
        <View style={[{ flex: 1 }, contenido]}>{children}</View>
      ) : (
        <ScrollView
          contentContainerStyle={[styles.contenido, contenido]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

export function TituloSeccion({ children, derecha }: { children: ReactNode; derecha?: ReactNode }) {
  return (
    <View style={styles.seccion}>
      <Texto v="micro">{children}</Texto>
      {derecha}
    </View>
  );
}

export function Vacio({ titulo, texto, children }: { titulo: string; texto?: string; children?: ReactNode }) {
  return (
    <View style={styles.vacio}>
      <Texto v="h3" centro>
        {titulo}
      </Texto>
      {texto ? (
        <Texto v="nota" centro>
          {texto}
        </Texto>
      ) : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: color.bg },
  contenido: { paddingHorizontal: 16, paddingBottom: 32, gap: 12 },
  cabecera: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingTop: 6, paddingBottom: 12 },
  atras: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: color.surface1,
    borderWidth: 1,
    borderColor: color.border,
    alignItems: "center",
    justifyContent: "center",
  },
  seccion: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 6 },
  vacio: { alignItems: "center", gap: 8, paddingVertical: 28, paddingHorizontal: 16 },
});
