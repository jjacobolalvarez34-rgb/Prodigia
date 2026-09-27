import * as Haptics from "expo-haptics";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { color, mono, radio } from "~/tema";

// Teclado numérico propio (UX-03 de la revisión general): el del sistema tapa media
// pantalla y en la web salían flechitas del <input type="number">. Teclas de 64 dp
// de alto (§4 del sistema visual), vibración corta en cada toque.
interface Props {
  onDigito: (d: string) => void;
  onBorrar: () => void;
  onMenos: () => void;
  onEnviar: () => void;
  acento: string;
  deshabilitado?: boolean;
  puedeEnviar: boolean;
}

const FILAS = [
  ["1", "2", "3"],
  ["4", "5", "6"],
  ["7", "8", "9"],
];

function Tecla({ texto, onPress, estilo, colorTexto, deshabilitado }: { texto: string; onPress: () => void; estilo?: object; colorTexto?: string; deshabilitado?: boolean }) {
  return (
    <Pressable
      disabled={deshabilitado}
      onPress={() => {
        Haptics.selectionAsync();
        onPress();
      }}
      style={({ pressed }) => [styles.tecla, estilo, pressed && styles.teclaPresionada, deshabilitado && { opacity: 0.4 }]}
    >
      <Text style={[styles.textoTecla, colorTexto ? { color: colorTexto } : null]}>{texto}</Text>
    </Pressable>
  );
}

export default function Teclado({ onDigito, onBorrar, onMenos, onEnviar, acento, deshabilitado, puedeEnviar }: Props) {
  return (
    <View style={styles.contenedor}>
      {FILAS.map((fila) => (
        <View key={fila[0]} style={styles.fila}>
          {fila.map((d) => (
            <Tecla key={d} texto={d} onPress={() => onDigito(d)} deshabilitado={deshabilitado} />
          ))}
        </View>
      ))}
      <View style={styles.fila}>
        <Tecla texto="−" onPress={onMenos} deshabilitado={deshabilitado} colorTexto={color.texto2} />
        <Tecla texto="0" onPress={() => onDigito("0")} deshabilitado={deshabilitado} />
        <Tecla texto="⌫" onPress={onBorrar} deshabilitado={deshabilitado} colorTexto={color.texto2} />
      </View>
      <Tecla
        texto="Responder"
        onPress={onEnviar}
        deshabilitado={deshabilitado || !puedeEnviar}
        estilo={[styles.enviar, { backgroundColor: acento }]}
        colorTexto="#FFFFFF"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: { gap: 8 },
  fila: { flexDirection: "row", gap: 8 },
  tecla: {
    flex: 1,
    height: 60,
    borderRadius: radio.chip,
    backgroundColor: color.surface2,
    borderWidth: 1,
    borderColor: color.border,
    alignItems: "center",
    justifyContent: "center",
  },
  teclaPresionada: { backgroundColor: color.surface3, transform: [{ scale: 0.97 }] },
  textoTecla: { color: color.texto, fontSize: 26, fontFamily: mono, fontWeight: "700" },
  enviar: { flex: 0, height: 58, borderWidth: 0 },
});
