import { StyleSheet, View, type ViewStyle } from "react-native";
import Texto from "./Texto";
import { fuente } from "~/tema";

// La etiqueta «NUEVO» (src/lib/recompensas/novedades.ts), igual que en la web.
export default function EtiquetaNuevo({ estilo }: { estilo?: ViewStyle }) {
  return (
    <View pointerEvents="none" style={[styles.etiqueta, estilo]}>
      <Texto style={{ fontFamily: fuente.cuerpoBold, fontSize: 8.5, letterSpacing: 1.2, color: "#FFFFFF" }}>NUEVO</Texto>
    </View>
  );
}

const styles = StyleSheet.create({
  etiqueta: { position: "absolute", top: -5, right: -5, zIndex: 5, transform: [{ rotate: "6deg" }], paddingHorizontal: 5, paddingVertical: 1.5, borderRadius: 5, borderWidth: 1.5, borderColor: "#05060F", backgroundColor: "#FF5D8F", boxShadow: "2px 2px 0px #05060F" },
});
