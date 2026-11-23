import { useRouter } from "expo-router";
import { StyleSheet, View } from "react-native";
import { plazoDe, type MiTarea } from "@/lib/docentes/panel";
import Barra from "../Barra";
import Boton3D from "../Boton3D";
import Texto from "../Texto";
import { color, conAlfa, mundoDe } from "~/tema";

// Una tarea del curso vista por el estudiante (en «Mi curso» y en el inicio). Igual que
// components/curso/TarjetaTarea.tsx de la web.
export default function TarjetaTarea({ tarea, ahora }: { tarea: MiTarea; ahora: number }) {
  const router = useRouter();
  const m = mundoDe(tarea.mundo);
  const acento = m?.neon ?? color.primarioClaro;
  const cumplida = tarea.hechos >= tarea.meta_ejercicios;
  const plazo = plazoDe(tarea.vence_at, ahora);
  const textoPlazo = cumplida
    ? "Cumplida"
    : plazo.tipo === "vencida"
      ? "Vencida"
      : plazo.tipo === "hoy"
        ? "Vence hoy"
        : plazo.tipo === "manana"
          ? "Vence mañana"
          : `Quedan ${plazo.n} días`;
  const colorPlazo = cumplida ? color.correcto : plazo.tipo === "vencida" ? color.error : plazo.tipo === "hoy" ? color.racha : color.texto2;

  return (
    <View style={[styles.caja, { borderColor: conAlfa(acento, 0.4) }]}>
      <View style={styles.fila}>
        <View style={[styles.glifo, { backgroundColor: conAlfa(m?.base ?? color.primario, 0.25), borderColor: conAlfa(acento, 0.6) }]}>
          <Texto v="fuerte" tam={18} c={acento}>
            {m?.glifo ?? "?"}
          </Texto>
        </View>
        <View style={{ flex: 1, gap: 2 }}>
          <Texto v="fuerte" numberOfLines={1}>
            {tarea.titulo}
          </Texto>
          <Texto v="nota" tam={12} numberOfLines={1}>
            {tarea.grupo} · {m?.nombre ?? tarea.mundo}
          </Texto>
        </View>
        <Texto v="micro" c={colorPlazo}>
          {textoPlazo}
        </Texto>
      </View>
      <View style={styles.fila}>
        <View style={{ flex: 1 }}>
          <Barra valor={Math.min(1, tarea.hechos / Math.max(1, tarea.meta_ejercicios))} acento={cumplida ? color.correcto : m?.base ?? color.primario} />
        </View>
        <Texto v="mono" tam={12} c={color.texto2}>
          {tarea.hechos}/{tarea.meta_ejercicios}
        </Texto>
      </View>
      {tarea.instrucciones ? (
        <Texto v="nota" tam={12}>
          {tarea.instrucciones}
        </Texto>
      ) : null}
      {!cumplida && plazo.tipo !== "vencida" && m?.enApp && (
        <Boton3D titulo="Practicar" tamano="sm" acento={m.base} sonido="jugar" onPress={() => router.push(`/${m.slug}` as "/numeria")} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  caja: { gap: 10, padding: 14, borderRadius: 18, borderWidth: 1, backgroundColor: color.surface1 },
  fila: { flexDirection: "row", alignItems: "center", gap: 12 },
  glifo: { width: 40, height: 40, borderRadius: 12, borderWidth: 1, alignItems: "center", justifyContent: "center" },
});
