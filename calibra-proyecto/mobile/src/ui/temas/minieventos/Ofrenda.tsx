import { useCallback, useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { COLECCIONES, slugEvento } from "@/lib/temas/colecciones";
import { PARTICULAS } from "@/lib/temas/dibujos";
import {
  diaUtc,
  escenaOfrenda,
  FICHAS_POR_VELA,
  mensajeErrorMinievento,
  ordenOpcionesOfrenda,
  preguntaOfrendaDe,
  responderOfrenda,
  respuestasOfrenda,
  type RespuestaOfrenda,
} from "@/lib/temas/minieventos";
import type { TemaActivo } from "@/lib/temas/temas";
import { sonar, vibrar } from "~/lib/efectos";
import { supabase } from "~/lib/supabase";
import DibujoTema from "~/ui/temas/DibujoTema";
import Texto from "~/ui/Texto";
import { color, fuente } from "~/tema";

// Día de Muertos · «La ofrenda» (0309, igual que la web): una pregunta de Historia por
// día sobre alguien que ya no está; acertarla enciende una vela y da Fichas.
export default function Ofrenda({ tema, ancho }: { tema: TemaActivo; ancho: number }) {
  const hoy = diaUtc();
  const { desde, hasta } = tema.hoy.rango;
  const slug = slugEvento("muertos", desde);
  const ficha = COLECCIONES.muertos!.ficha;
  const dias = useMemo(() => {
    const lista: string[] = [];
    for (let d = Date.parse(`${desde}T00:00:00Z`); d <= Date.parse(`${hasta}T00:00:00Z`); d += 86_400_000) lista.push(new Date(d).toISOString().slice(0, 10));
    return lista;
  }, [desde, hasta]);
  const { pregunta } = preguntaOfrendaDe(hoy);
  const orden = ordenOpcionesOfrenda(hoy);
  const [respuestas, setRespuestas] = useState<RespuestaOfrenda[] | null>(null);
  const [ocupado, setOcupado] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    setRespuestas((await respuestasOfrenda(supabase, slug)) ?? []);
  }, [slug]);

  useEffect(() => {
    // Lo que ya respondiste (sistema externo).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void cargar();
  }, [cargar]);

  const deHoy = respuestas?.find((r) => r.dia === hoy) ?? null;
  const velas = dias.map((d) => !!respuestas?.find((r) => r.dia === d && r.acierto));
  const encendidas = velas.filter(Boolean).length;

  async function responder(opcion: number) {
    vibrar.medio();
    setOcupado(true);
    setError(null);
    try {
      const r = await responderOfrenda(supabase, opcion);
      if (r.acierto) {
        sonar("logro");
        vibrar.exito();
      }
      setRespuestas((antes) => [...(antes ?? []), { dia: hoy, opcion, acierto: r.acierto }]);
    } catch (e) {
      setError(mensajeErrorMinievento(e));
    } finally {
      setOcupado(false);
    }
  }

  return (
    <View style={{ gap: 10, marginTop: 6 }}>
      <View style={styles.escena}>
        <DibujoTema dibujo={escenaOfrenda(velas)} ancho={ancho} />
        <View style={styles.contador}>
          <DibujoTema dibujo={PARTICULAS.vela} ancho={15} />
          <Texto v="mono" tam={11} c="#FFE08A">
            Velas: {encendidas} de {dias.length}
          </Texto>
        </View>
      </View>

      <View style={{ gap: 2 }}>
        <Texto style={{ fontFamily: fuente.cuerpoBold, fontSize: 10, letterSpacing: 1.8, color: "#FF9F1C" }}>
          {pregunta.personaje.toUpperCase()} · {pregunta.vida}
        </Texto>
        <Texto v="fuerte" tam={15}>
          {pregunta.pregunta}
        </Texto>
      </View>

      {respuestas === null ? (
        <Texto v="nota">…</Texto>
      ) : deHoy ? (
        <Animated.View entering={FadeInDown.duration(280)} style={[styles.resultado, deHoy.acierto && { borderColor: "#FF9F1C88", backgroundColor: "#FF9F1C14" }]}>
          <Texto v="fuerte" tam={13.5} c={deHoy.acierto ? "#FFB627" : color.texto}>
            {deHoy.acierto ? `¡Encendiste una vela! +${FICHAS_POR_VELA} ${ficha.nombre}` : "Esta vez la vela no se encendió."}
          </Texto>
          {!deHoy.acierto && (
            <Texto v="nota" tam={12.5} c={color.texto}>
              La respuesta: {pregunta.opciones[0]}
            </Texto>
          )}
          <Texto v="nota" tam={12.5}>
            {pregunta.dato}
          </Texto>
          <Texto v="nota" tam={11.5}>
            {hoy >= hasta ? "Fue la última pregunta de la ofrenda." : "Mañana hay otra pregunta y otra vela."}
          </Texto>
        </Animated.View>
      ) : (
        <View style={{ gap: 8 }}>
          {orden.map((i) => (
            <Pressable key={i} disabled={ocupado} onPress={() => responder(i)} style={({ pressed }) => [styles.opcion, (pressed || ocupado) && { opacity: 0.7 }]} accessibilityRole="button">
              <Texto v="fuerte" tam={13.5} c="#FFFFFF">
                {pregunta.opciones[i]}
              </Texto>
            </Pressable>
          ))}
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
  escena: { borderRadius: 16, overflow: "hidden", borderWidth: 1, borderColor: "rgba(255,255,255,0.1)", backgroundColor: "#120720" },
  contador: { position: "absolute", right: 8, bottom: 8, flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 9, paddingVertical: 3, borderRadius: 999, backgroundColor: "rgba(0,0,0,0.55)" },
  resultado: { gap: 5, padding: 12, borderRadius: 14, borderWidth: 1, borderColor: "rgba(255,255,255,0.14)" },
  opcion: { paddingHorizontal: 12, paddingVertical: 11, borderRadius: 12, borderWidth: 2, borderColor: "#05060F", backgroundColor: "#1A0B2E", boxShadow: "2px 2px 0px #05060F" },
});
