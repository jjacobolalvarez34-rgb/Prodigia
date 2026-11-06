import { StyleSheet, Text, View } from "react-native";
import { color } from "~/tema";

// Emblema de la Letra libre (0314): tres «Aa» en tres letras distintas, encimadas como
// tipos de imprenta. Mismo dibujo que en la web (components/temas/MuestraLetraLibre).
// Text de React Native a propósito: Texto escalaría estas letras con la del tema.
export default function MuestraLetraLibre({ tam = 56 }: { tam?: number }) {
  return (
    <View style={{ width: tam, height: tam }} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <Text style={[styles.aa, { left: tam * 0.06, top: tam * 0.02, fontFamily: "Lobster", fontSize: tam * 0.46, lineHeight: tam * 0.6, color: color.primarioClaro }]}>Aa</Text>
      <Text style={[styles.aa, { right: tam * 0.04, top: tam * 0.38, fontFamily: "Bungee", fontSize: tam * 0.28, lineHeight: tam * 0.36, color: color.logro }]}>Aa</Text>
      <Text style={[styles.aa, { left: tam * 0.1, bottom: tam * 0.06, fontFamily: "PressStart2P", fontSize: tam * 0.17, lineHeight: tam * 0.24, color: color.texto }]}>Aa</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  aa: { position: "absolute", includeFontPadding: false },
});
