import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { vibrar } from "~/lib/efectos";
import { useJugador } from "~/lib/jugador";
import { cargarNivelesNumeria, SECCION_POR_ID, SECCIONES, temaDisponible, type SeccionId } from "~/lib/numeria";
import { useSesion } from "~/lib/sesion";
import Boton3D from "~/ui/Boton3D";
import HubMundo, { TarjetaTema } from "~/ui/HubMundo";
import { IconoCandado, IconoRayo } from "~/ui/Iconos";
import Texto from "~/ui/Texto";
import { brillo, color, conAlfa, fuente, NUMERIA } from "~/tema";

// Hub de Numeria: las 6 secciones de la web (Aritmética, Geometría, Fracciones,
// Decimales, Potencias y Álgebra). Eliges sección y uno o varios temas; cada tema
// tiene su propio nivel. "Rápida" mezcla todos los temas de la sección.
export default function HubNumeria() {
  const router = useRouter();
  const { sesion } = useSesion();
  const userId = sesion?.user.id;
  const { esInvitado } = useJugador();
  const [niveles, setNiveles] = useState<Record<string, number> | null>(null);
  const [seccion, setSeccion] = useState<SeccionId>("aritmetica");
  const [elegidos, setElegidos] = useState<Record<SeccionId, string[]>>({
    aritmetica: ["suma"],
    geometria: ["perimetro"],
    fracciones: ["simplificar"],
    decimales: ["convertir"],
    potencias: ["potencia"],
    algebra: ["evaluar"],
  });

  useFocusEffect(
    useCallback(() => {
      if (userId) cargarNivelesNumeria(userId).then(setNiveles);
    }, [userId])
  );

  const s = SECCION_POR_ID[seccion];
  const temasLibres = s.temas.filter((t) => temaDisponible(t.problemType, esInvitado));
  const elegidosAhora = elegidos[seccion].filter((id) => temasLibres.some((t) => t.id === id));

  function alternar(id: string) {
    setElegidos((prev) => {
      const actual = prev[seccion];
      const nuevo = actual.includes(id) ? (actual.length > 1 ? actual.filter((x) => x !== id) : actual) : [...actual, id];
      return { ...prev, [seccion]: nuevo };
    });
  }

  function jugar(temas: string[]) {
    if (temas.length === 0) return;
    router.push({ pathname: "/numeria/sprint", params: { seccion, temas: temas.join(",") } });
  }

  return (
    <HubMundo
      mundo={NUMERIA}
      descripcion={`${s.descripcion} 10 problemas en 60 segundos: la dificultad se ajusta sola.`}
      pie={
        <View style={{ flexDirection: "row", gap: 10 }}>
          <Boton3D
            titulo="Rápida"
            variante="secundario"
            acento={NUMERIA.base}
            icono={<IconoRayo tam={15} c={color.logro} />}
            estilo={{ flex: 1 }}
            deshabilitado={!niveles || temasLibres.length === 0}
            onPress={() => jugar(temasLibres.map((t) => t.id))}
          />
          <Boton3D titulo="Jugar" acento={NUMERIA.base} brillo estilo={{ flex: 1.5 }} deshabilitado={!niveles || elegidosAhora.length === 0} onPress={() => jugar(elegidosAhora)} />
        </View>
      }
    >
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingRight: 8 }}>
        {SECCIONES.map((sec) => {
          const activa = sec.id === seccion;
          const bloqueada = sec.temas.every((t) => !temaDisponible(t.problemType, esInvitado));
          return (
            <Pressable
              key={sec.id}
              onPress={() => {
                vibrar.seleccion();
                setSeccion(sec.id);
              }}
              style={[styles.seccion, activa && { borderColor: NUMERIA.neon, backgroundColor: conAlfa(NUMERIA.base, 0.2), boxShadow: brillo(NUMERIA.neon, 14, 0.3) }]}
            >
              <Texto style={{ fontFamily: fuente.mono, fontSize: 20, color: activa ? NUMERIA.neon : color.texto2 }}>{sec.simbolo}</Texto>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                {bloqueada && <IconoCandado tam={11} c={color.texto2} />}
                <Texto style={{ fontFamily: fuente.cuerpoFuerte, fontSize: 12, color: activa ? color.texto : color.texto2 }}>{sec.nombre}</Texto>
              </View>
            </Pressable>
          );
        })}
      </ScrollView>

      {Array.from({ length: Math.ceil(s.temas.length / 2) }, (_, fila) => (
        <View key={`${seccion}-${fila}`} style={{ flexDirection: "row", gap: 10 }}>
          {s.temas.slice(fila * 2, fila * 2 + 2).map((t, i) => {
            const libre = temaDisponible(t.problemType, esInvitado);
            return (
              <TarjetaTema
                key={t.id}
                indice={fila * 2 + i}
                mundo={NUMERIA}
                activo={elegidos[seccion].includes(t.id) && libre}
                tema={{ id: t.id, nombre: t.nombre, simbolo: t.simbolo, nivel: niveles?.[t.problemType] ?? null, bloqueado: !libre, nota: libre ? undefined : "Crea una cuenta" }}
                onPress={() => alternar(t.id)}
              />
            );
          })}
          {s.temas.slice(fila * 2, fila * 2 + 2).length === 1 && <View style={{ flex: 1 }} />}
        </View>
      ))}
      <Texto v="nota" tam={12}>
        Toca para sumar o quitar temas. Cada tema sube de nivel por separado.
      </Texto>
    </HubMundo>
  );
}

const styles = StyleSheet.create({
  seccion: { width: 96, paddingVertical: 10, borderRadius: 16, borderWidth: 1.5, borderColor: color.border, backgroundColor: color.surface1, alignItems: "center", gap: 4 },
});
