import { useEffect, useRef, useState } from "react";
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import Animated, { FadeIn, FadeInDown, type AnimatedStyle } from "react-native-reanimated";
import { vibrar } from "~/lib/efectos";
import type { PreguntaMundo } from "~/lib/mundosJugables";
import type { Memoria } from "~/lib/mundosJugables/tipos";
import { brillo, color, conAlfa, fuente } from "~/tema";
import Barra from "./Barra";
import Boton3D from "./Boton3D";
import { Teclado } from "./Sprint";
import Texto from "./Texto";
import { textoConFormulas } from "./TextoMate";
import Carta, { Dorso } from "./visuales/Carta";
import Esqueleto from "./visuales/Esqueleto";
import { subindices } from "./visuales/Molecula";
import VisualPregunta from "./visuales/VisualPregunta";

// Cómo se ve y se contesta una pregunta de los mundos del registro: lo comparten el
// sprint genérico (`app/[mundo]/sprint`) y el diagnóstico inicial.

export type Feedback = "idle" | "correcto" | "incorrecto";
type EstiloAnimado = StyleProp<AnimatedStyle<StyleProp<ViewStyle>>>;

export function mostrar(texto: string, formato: PreguntaMundo["formato"]): string {
  if (formato === "formulas") return textoConFormulas(texto);
  if (formato === "quimica") return subindices(texto);
  return texto;
}

// ¿La respuesta (texto del teclado, opción o hueso) es la correcta?
export function esRespuestaCorrecta(p: PreguntaMundo, valor: string): boolean {
  const e = p.entrada;
  if (e.tipo === "numero") {
    const n = Number(valor.replace(",", "."));
    return Number.isFinite(n) && Math.abs(n - e.respuesta) <= e.tolerancia + 1e-9;
  }
  if (e.tipo === "esqueleto") return valor === e.objetivo;
  return valor === e.respuesta;
}

// Fase de memorizar: la lista entera (Enigmia) o las cartas de a una (Naipia).
export function FaseMemoria({ memoria, acento, onListo }: { memoria: Memoria; acento: string; onListo: () => void }) {
  const [visible, setVisible] = useState<number | null>(null);
  const onListoRef = useRef(onListo);
  useEffect(() => {
    onListoRef.current = onListo;
  }, [onListo]);
  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    if (memoria.tipo === "lista") {
      timers.push(setTimeout(() => onListoRef.current(), memoria.ms));
    } else {
      const inicio = 900;
      memoria.cartas.forEach((_, i) => timers.push(setTimeout(() => setVisible(i), inicio + i * memoria.msPorCarta)));
      timers.push(setTimeout(() => onListoRef.current(), inicio + memoria.cartas.length * memoria.msPorCarta));
    }
    return () => timers.forEach(clearTimeout);
  }, [memoria]);
  const duracion = memoria.tipo === "lista" ? memoria.ms : 900 + memoria.cartas.length * memoria.msPorCarta;
  return (
    <View style={{ alignItems: "center", gap: 14, alignSelf: "stretch" }}>
      <Texto v="micro" c={acento}>
        Memoriza
      </Texto>
      {memoria.tipo === "lista" ? (
        <View style={styles.lista}>
          {memoria.items.map((it, i) => (
            <Animated.View key={i} entering={FadeInDown.delay(i * 110).duration(260)} style={[styles.itemMemoria, { borderColor: acento }]}>
              <Texto style={{ fontFamily: fuente.display, fontSize: 18, color: acento }}>{it}</Texto>
            </Animated.View>
          ))}
        </View>
      ) : (
        <View style={{ alignItems: "center", gap: 10 }}>
          <View style={{ height: 118, justifyContent: "center" }}>
            {visible == null ? (
              <Dorso tam={78} acento={acento} />
            ) : (
              <Animated.View key={visible} entering={FadeIn.duration(120)}>
                <Carta valor={memoria.cartas[visible].valor} palo={memoria.cartas[visible].palo} tam={78} />
              </Animated.View>
            )}
          </View>
          <Texto v="nota">
            Carta {visible == null ? 0 : visible + 1} de {memoria.cartas.length}
          </Texto>
        </View>
      )}
      <Barra valor={0} duracion={duracion} acento={acento} estilo={{ alignSelf: "stretch" }} />
    </View>
  );
}

// Lo de adentro de la tarjeta: memoria, o dibujo + enunciado + lo tecleado + "Era …".
export function CuerpoPregunta({
  pregunta,
  acento,
  memorizando,
  onMemoriaLista,
  feedback,
  respuesta,
}: {
  pregunta: PreguntaMundo;
  acento: string;
  memorizando: boolean;
  onMemoriaLista: () => void;
  feedback: Feedback;
  respuesta: string;
}) {
  const e = pregunta.entrada;
  if (memorizando && pregunta.memoria) return <FaseMemoria key={pregunta.clave} memoria={pregunta.memoria} acento={acento} onListo={onMemoriaLista} />;
  const colorEstado = feedback === "correcto" ? color.correcto : feedback === "incorrecto" ? color.error : acento;
  const solucion = pregunta.solucion ?? (e.tipo === "numero" ? String(e.respuesta).replace(".", ",") : e.respuesta);
  return (
    <>
      {(pregunta.visuales ?? []).map((v, i) => (
        <VisualPregunta key={i} visual={v} acento={acento} />
      ))}
      <Texto style={{ fontFamily: fuente.display, fontSize: pregunta.enunciado.length > 90 ? 17 : 20, color: color.texto, textAlign: "center" }}>{mostrar(pregunta.enunciado, pregunta.formato)}</Texto>
      {e.tipo === "numero" && (
        <Texto style={{ fontFamily: fuente.mono, fontSize: 30, letterSpacing: 3, color: colorEstado, textDecorationLine: feedback === "incorrecto" ? "line-through" : "none" }}>
          {respuesta === "" ? "_" : respuesta}
        </Texto>
      )}
      {feedback === "incorrecto" && (
        <Texto v="fuerte" c={color.correcto} centro>
          Era {mostrar(solucion, pregunta.formato)}
        </Texto>
      )}
    </>
  );
}

// Debajo de la tarjeta: el esqueleto para tocar o la grilla/lista de opciones.
export function OpcionesPregunta({
  pregunta,
  feedback,
  seleccion,
  bloqueado,
  base,
  onResponder,
  estilo,
  ocultas,
}: {
  pregunta: PreguntaMundo;
  feedback: Feedback;
  seleccion: string | null;
  bloqueado: boolean;
  base: string;
  onResponder: (valor: string) => void;
  estilo?: EstiloAnimado;
  // Opciones descartadas por una pista (se apagan y no se pueden tocar).
  ocultas?: Set<string>;
}) {
  const e = pregunta.entrada;
  if (e.tipo === "esqueleto") {
    return (
      <Animated.View style={estilo}>
        <Esqueleto objetivo={e.objetivo} respondido={feedback !== "idle"} seleccion={seleccion} onElegir={(h) => onResponder(h)} />
      </Animated.View>
    );
  }
  if (e.tipo !== "opciones") return null;
  const largas = e.opciones.some((o) => o.length > 16);
  return (
    <Animated.View style={[largas ? styles.listaOpciones : styles.grilla, estilo]}>
      {e.opciones.map((op, i) => {
        const esCorrecta = feedback !== "idle" && op === e.respuesta;
        const esMala = feedback !== "idle" && op === seleccion && op !== e.respuesta;
        const descartada = !!ocultas?.has(op);
        return (
          <Animated.View key={`${pregunta.clave}-${op}`} entering={FadeInDown.delay(60 + i * 50).duration(260)} style={largas ? null : styles.celdaGrilla}>
            <Pressable
              disabled={bloqueado || descartada}
              onPress={() => {
                vibrar.seleccion();
                onResponder(op);
              }}
              style={({ pressed }) => [
                styles.opcion,
                descartada && { opacity: 0.18 },
                pressed && { transform: [{ scale: 0.97 }], backgroundColor: conAlfa(base, 0.25) },
                esCorrecta && { borderColor: color.correcto, backgroundColor: conAlfa(color.correcto, 0.15), boxShadow: brillo(color.correcto, 16, 0.35) },
                esMala && { borderColor: color.error, backgroundColor: conAlfa(color.error, 0.15) },
              ]}
            >
              <Texto style={{ fontFamily: fuente.cuerpoFuerte, fontSize: op.length > 30 ? 13 : 15, color: color.texto, textAlign: "center" }}>{mostrar(op, pregunta.formato)}</Texto>
            </Pressable>
          </Animated.View>
        );
      })}
    </Animated.View>
  );
}

// Teclado numérico (con coma y/o signo según la pregunta) + "Listo".
export function TecladoPregunta({
  pregunta,
  bloqueado,
  respuesta,
  setRespuesta,
  base,
  onListo,
  estilo,
}: {
  pregunta: PreguntaMundo;
  bloqueado: boolean;
  respuesta: string;
  setRespuesta: (f: (x: string) => string) => void;
  base: string;
  onListo: () => void;
  estilo?: EstiloAnimado;
}) {
  const e = pregunta.entrada;
  if (e.tipo !== "numero") return null;
  return (
    <Animated.View style={[styles.teclado, estilo]}>
      <Teclado
        deshabilitado={bloqueado}
        teclaIzquierda={e.decimales ? "," : "−"}
        onDigito={(d) => setRespuesta((x) => (x.replace(/[-,]/g, "").length >= 8 ? x : x + d))}
        onBorrar={() => setRespuesta((x) => x.slice(0, -1))}
        onMenos={() => {
          if (e.decimales) setRespuesta((x) => (x.includes(",") ? x : (x === "" || x === "-" ? x + "0" : x) + ","));
          else setRespuesta((x) => (x.startsWith("-") ? x.slice(1) : "-" + x));
        }}
      />
      <View style={{ flexDirection: "row", gap: 8 }}>
        {e.decimales && e.negativos && (
          <Boton3D titulo="±" variante="secundario" silencioso estilo={{ width: 70 }} deshabilitado={bloqueado} onPress={() => setRespuesta((x) => (x.startsWith("-") ? x.slice(1) : "-" + x))} />
        )}
        <Boton3D titulo="Listo" acento={base} silencioso estilo={{ flex: 1 }} deshabilitado={bloqueado || respuesta === "" || respuesta === "-"} onPress={onListo} />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  grilla: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  celdaGrilla: { width: "48%" },
  listaOpciones: { gap: 9 },
  opcion: { minHeight: 58, borderWidth: 2, borderColor: color.border, backgroundColor: color.surface1, borderRadius: 16, paddingHorizontal: 12, paddingVertical: 12, alignItems: "center", justifyContent: "center" },
  teclado: { paddingHorizontal: 16, paddingBottom: 10, gap: 6 },
  lista: { flexDirection: "row", flexWrap: "wrap", gap: 8, justifyContent: "center" },
  itemMemoria: { borderWidth: 2, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 8 },
});
