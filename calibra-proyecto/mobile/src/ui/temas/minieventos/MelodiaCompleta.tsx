import { useRouter } from "expo-router";
import { StyleSheet, View } from "react-native";
import { COLECCIONES } from "@/lib/temas/colecciones";
import { escenaPentagrama } from "@/lib/temas/escenasFiestas";
import { metaCobrada, metasDe } from "@/lib/temas/minieventos";
import Boton3D from "~/ui/Boton3D";
import DibujoTema from "~/ui/temas/DibujoTema";
import Texto from "~/ui/Texto";
import { color } from "~/tema";
import { useMetasMinievento } from "./useMetasMinievento";

// Día de la Música · «Melodía al doble» (0311, igual que la web): la Exp de Melodía da el
// doble de Notas y cada acierto en Melodía toca una nota; con 16, la melodía queda completa.
export default function MelodiaCompleta({ ancho }: { ancho: number }) {
  const router = useRouter();
  const ficha = COLECCIONES.dia_musica!.ficha;
  const meta = metasDe("dia_musica")[0];
  const { hoy, progreso, premios, cargado, error } = useMetasMinievento("dia_musica", true);
  const n = Math.min(progreso?.hoy ?? 0, meta.meta);
  const completa = metaCobrada(meta, premios, hoy);

  return (
    <View style={{ gap: 8, marginTop: 6 }}>
      <View style={styles.escena}>
        <DibujoTema dibujo={escenaPentagrama(n, meta.meta)} ancho={ancho} />
      </View>
      <Texto v="mono" tam={11.5} c="#FFC53D">
        {cargado ? `${n} de ${meta.meta} notas` : "…"}
      </Texto>
      {completa ? (
        <Texto v="fuerte" tam={13} c="#FFC53D">
          ¡Tocaste la melodía completa! +{meta.fichas} {ficha.nombre}
        </Texto>
      ) : (
        <View style={{ gap: 6 }}>
          <Texto v="nota" tam={12}>
            Cada acierto en Melodía toca una nota.
          </Texto>
          <Boton3D titulo="Jugar Melodía" tamano="sm" acento="#A794FF" onPress={() => router.push("/melodia")} />
        </View>
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
  escena: { borderRadius: 16, overflow: "hidden", borderWidth: 1, borderColor: "rgba(255,255,255,0.1)", backgroundColor: "#120A2A" },
});
