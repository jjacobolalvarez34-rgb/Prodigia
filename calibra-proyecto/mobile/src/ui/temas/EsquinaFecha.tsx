import { StyleSheet, View } from "react-native";
import { celebracionDe } from "@/lib/temas/celebracion";
import { PARTICULAS } from "@/lib/temas/dibujos";
import { useTemaHoy } from "~/lib/temporada";
import DibujoTema from "./DibujoTema";

// La figura de la fecha en la esquina de una tarjeta durante un evento
// (PARIDAD_EVENTOS.md fila 6), igual que EsquinaFecha de la web.
export default function EsquinaFecha({ tam = 22 }: { tam?: number }) {
  const tema = useTemaHoy();
  const esquina = celebracionDe(tema)?.esquina;
  if (!tema || !esquina) return null;
  return (
    <View pointerEvents="none" style={styles.esquina}>
      <DibujoTema dibujo={PARTICULAS[esquina]} ancho={tam} color={tema.tema.acento} />
    </View>
  );
}

const styles = StyleSheet.create({
  esquina: { position: "absolute", top: 6, right: 8, zIndex: 5, transform: [{ rotate: "18deg" }] },
});
