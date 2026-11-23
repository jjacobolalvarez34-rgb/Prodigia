import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Pressable, View } from "react-native";
import { ordenarMisTareas, type MiTarea } from "@/lib/docentes/panel";
import { cargarMisTareas } from "~/lib/curso";
import { color } from "~/tema";
import { TituloSeccion } from "../Pantalla";
import Texto from "../Texto";
import TarjetaTarea from "./TarjetaTarea";

// Inicio: las tareas pendientes del curso (0318). No muestra nada si el jugador no está
// en un curso o no tiene tareas vigentes. Igual que components/curso/TareasInicio.tsx.
export default function TareasInicio() {
  const router = useRouter();
  const [tareas, setTareas] = useState<MiTarea[]>([]);
  const [ahora, setAhora] = useState(() => Date.now());

  useFocusEffect(
    useCallback(() => {
      let vivo = true;
      cargarMisTareas().then((t) => {
        if (!vivo) return;
        setAhora(Date.now());
        setTareas(t);
      });
      return () => {
        vivo = false;
      };
    }, []),
  );

  const pendientes = ordenarMisTareas(tareas, ahora).filter((x) => x.hechos < x.meta_ejercicios && new Date(x.vence_at).getTime() > ahora);
  if (pendientes.length === 0) return null;

  return (
    <View style={{ gap: 10 }}>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <TituloSeccion>Tareas de tu curso</TituloSeccion>
        <Pressable onPress={() => router.push("/curso")} hitSlop={10}>
          <Texto v="fuerte" tam={13} c={color.primarioClaro}>
            Ver todas
          </Texto>
        </Pressable>
      </View>
      {pendientes.slice(0, 3).map((t) => (
        <TarjetaTarea key={t.tarea_id} tarea={t} ahora={ahora} />
      ))}
    </View>
  );
}
