import { StyleSheet, View } from "react-native";
import Animated, { ZoomIn } from "react-native-reanimated";
import { COLECCIONES } from "@/lib/temas/colecciones";
import { PARTICULAS } from "@/lib/temas/dibujos";
import { escenaSobres } from "@/lib/temas/escenasFiestas";
import { metaCobrada, metasDe } from "@/lib/temas/minieventos";
import Boton3D from "~/ui/Boton3D";
import DibujoTema from "~/ui/temas/DibujoTema";
import Texto from "~/ui/Texto";
import { color } from "~/tema";
import { useMetasMinievento } from "./useMetasMinievento";

// Año Nuevo Lunar · «Sobres rojos» (0311, igual que la web): 3 sobres por día; cada uno
// se abre con 5, 15 y 30 aciertos del día y trae Monedas de la suerte.
export default function SobresRojos({ ancho }: { ancho: number }) {
  const ficha = COLECCIONES.anio_nuevo_lunar!.ficha;
  const { hoy, progreso, premios, cargado, ocupado, error, cobrar } = useMetasMinievento("anio_nuevo_lunar", false);
  const metas = metasDe("anio_nuevo_lunar");
  const aciertos = progreso?.hoy ?? 0;
  const estado = metas.map((m) => (metaCobrada(m, premios, hoy) ? "abierto" : aciertos >= m.meta ? "listo" : "cerrado") as "abierto" | "listo" | "cerrado");

  return (
    <View style={{ gap: 8, marginTop: 6 }}>
      <View style={styles.escena}>
        <DibujoTema dibujo={escenaSobres(estado)} ancho={ancho} />
      </View>
      <Texto v="mono" tam={11.5} c="#FFC53D">
        {cargado ? `Hoy llevas ${aciertos} aciertos` : "…"}
      </Texto>
      <View style={styles.fila}>
        {metas.map((m, i) => (
          <View key={m.clave} style={styles.sobre}>
            {estado[i] === "abierto" ? (
              <Animated.View entering={ZoomIn.duration(240)} style={styles.premio}>
                <DibujoTema dibujo={PARTICULAS.moneda} ancho={15} />
                <Texto v="fuerte" tam={12} c="#FFC53D">
                  +{m.fichas} {ficha.nombre}
                </Texto>
              </Animated.View>
            ) : estado[i] === "listo" ? (
              <Boton3D titulo="Abrir" tamano="sm" acento="#E63946" cargando={ocupado} onPress={() => void cobrar(m.clave)} />
            ) : (
              <Texto v="nota" tam={11.5}>
                {m.meta} aciertos
              </Texto>
            )}
          </View>
        ))}
      </View>
      {error && (
        <Texto v="nota" tam={12.5} c={color.error}>
          {error}
        </Texto>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  escena: { borderRadius: 16, overflow: "hidden", borderWidth: 1, borderColor: "rgba(255,255,255,0.1)", backgroundColor: "#1A0508" },
  fila: { flexDirection: "row", gap: 8 },
  sobre: { flex: 1, alignItems: "center", justifyContent: "center", minHeight: 44, paddingHorizontal: 6, paddingVertical: 8, borderRadius: 12, borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" },
  premio: { flexDirection: "row", alignItems: "center", gap: 4, flexWrap: "wrap", justifyContent: "center" },
});
