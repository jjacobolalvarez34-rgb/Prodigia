import { useRouter } from "expo-router";
import { useMemo } from "react";
import { StyleSheet, View } from "react-native";
import { COLECCIONES } from "@/lib/temas/colecciones";
import { escenaCuaderno } from "@/lib/temas/escenasFiestas";
import { clavePremioMeta, metasDe } from "@/lib/temas/minieventos";
import type { TemaActivo } from "@/lib/temas/temas";
import Boton3D from "~/ui/Boton3D";
import DibujoTema from "~/ui/temas/DibujoTema";
import Texto from "~/ui/Texto";
import { color } from "~/tema";
import { useMetasMinievento } from "./useMetasMinievento";

// Vuelta a clases · «Semana de repaso» (0311, igual que la web): cada día que haces 10
// aciertos se llena una página del cuaderno de la semana y da Lápices.
export default function Repaso({ tema, ancho }: { tema: TemaActivo; ancho: number }) {
  const router = useRouter();
  const ficha = COLECCIONES.vuelta_clases!.ficha;
  const meta = metasDe("vuelta_clases")[0];
  const { desde, hasta } = tema.hoy.rango;
  const { hoy, progreso, premios, cargado, error } = useMetasMinievento("vuelta_clases", true);
  const dias = useMemo(() => {
    const lista: string[] = [];
    for (let d = Date.parse(`${desde}T00:00:00Z`); d <= Date.parse(`${hasta}T00:00:00Z`); d += 86_400_000) lista.push(new Date(d).toISOString().slice(0, 10));
    return lista;
  }, [desde, hasta]);
  const llena = (d: string) => premios.some((p) => p.clave === clavePremioMeta(meta, d));
  const paginas = dias.map((d) => (llena(d) ? "llena" : d === hoy ? "hoy" : "vacia") as "llena" | "hoy" | "vacia");
  const n = Math.min(progreso?.hoy ?? 0, meta.meta);

  return (
    <View style={{ gap: 8, marginTop: 6 }}>
      <View style={styles.escena}>
        <DibujoTema dibujo={escenaCuaderno(paginas)} ancho={ancho - 8} />
      </View>
      <Texto v="mono" tam={11.5} c="#5DE4FF">
        Páginas: {paginas.filter((p) => p === "llena").length} de {dias.length}
      </Texto>
      {llena(hoy) ? (
        <Texto v="fuerte" tam={13} c={color.correcto}>
          Página de hoy llena: +{meta.fichas} {ficha.nombre}
        </Texto>
      ) : (
        <View style={{ gap: 6 }}>
          <Texto v="nota" tam={12}>
            {cargado ? `Hoy: ${n} de ${meta.meta} aciertos` : "…"}
          </Texto>
          <Boton3D titulo="Jugar" tamano="sm" acento="#5DE4FF" onPress={() => router.push("/mundos")} />
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
  escena: { borderRadius: 16, overflow: "hidden", borderWidth: 1, borderColor: "rgba(255,255,255,0.1)", backgroundColor: "#0B1A16", padding: 4 },
});
