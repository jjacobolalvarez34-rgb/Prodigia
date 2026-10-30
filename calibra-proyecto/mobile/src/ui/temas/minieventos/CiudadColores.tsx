import { StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { COLECCIONES } from "@/lib/temas/colecciones";
import { escenaHoli } from "@/lib/temas/escenasFiestas";
import { metaCobrada, metasDe } from "@/lib/temas/minieventos";
import DibujoTema from "~/ui/temas/DibujoTema";
import Texto from "~/ui/Texto";
import { color } from "~/tema";
import { useMetasMinievento } from "./useMetasMinievento";

// Holi · «Ciudad de colores» (0311, igual que la web): cada acierto del evento tiñe la
// ciudad; con 60, queda pintada entera y da Polvos de color.
export default function CiudadColores({ ancho }: { ancho: number }) {
  const ficha = COLECCIONES.holi!.ficha;
  const meta = metasDe("holi")[0];
  const { hoy, progreso, premios, cargado, error } = useMetasMinievento("holi", true);
  const n = Math.min(progreso?.total ?? 0, meta.meta);
  const lograda = metaCobrada(meta, premios, hoy);

  return (
    <View style={{ gap: 8, marginTop: 6 }}>
      <View style={styles.escena}>
        <DibujoTema dibujo={escenaHoli(n, meta.meta)} ancho={ancho} />
      </View>
      <View style={styles.barra}>
        <LinearGradient colors={["#FF5D8F", "#FFC53D", "#3DDC97"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={[styles.relleno, { width: `${(n / meta.meta) * 100}%` }]} />
      </View>
      <Texto v="mono" tam={11.5} c="#FF5D8F">
        {cargado ? `${n} de ${meta.meta} aciertos` : "…"}
      </Texto>
      {lograda ? (
        <Texto v="fuerte" tam={13} c="#FFC53D">
          ¡Tu ciudad quedó llena de color! +{meta.fichas} {ficha.nombre}
        </Texto>
      ) : (
        <Texto v="nota" tam={12}>
          Cada acierto en cualquier mundo tiñe tu ciudad.
        </Texto>
      )}
      {error && (
        <Texto v="nota" tam={12.5} c={color.error}>
          {error}
        </Texto>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  escena: { borderRadius: 16, overflow: "hidden", borderWidth: 1, borderColor: "rgba(255,255,255,0.1)", backgroundColor: "#1E0B2A" },
  barra: { height: 8, borderRadius: 999, overflow: "hidden", backgroundColor: "rgba(255,255,255,0.1)" },
  relleno: { height: "100%", borderRadius: 999 },
});
