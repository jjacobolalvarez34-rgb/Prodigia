import { useCallback, useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { COLECCIONES, slugEvento } from "@/lib/temas/colecciones";
import { PARTICULAS } from "@/lib/temas/dibujos";
import { escenaLinternas } from "@/lib/temas/escenasFiestas";
import {
  diaUtc,
  FICHAS_POR_PREGUNTA,
  mensajeErrorMinievento,
  ordenOpcionesOfrenda,
  preguntaLunaDe,
  responderPreguntaDia,
  respuestasPreguntaDia,
  type RespuestaDia,
} from "@/lib/temas/minieventos";
import type { TemaActivo } from "@/lib/temas/temas";
import { sonar, vibrar } from "~/lib/efectos";
import { supabase } from "~/lib/supabase";
import DibujoTema from "~/ui/temas/DibujoTema";
import Texto from "~/ui/Texto";
import { color, fuente } from "~/tema";

// Noches de linternas · «Noches de luna» (0311, igual que la web): una pregunta tranquila
// por noche; acertarla sube una linterna y da Lunas.
export default function NochesLuna({ tema, ancho }: { tema: TemaActivo; ancho: number }) {
  const hoy = diaUtc();
  const { desde, hasta } = tema.hoy.rango;
  const slug = slugEvento("linternas", desde);
  const ficha = COLECCIONES.linternas!.ficha;
  const dias = useMemo(() => {
    const lista: string[] = [];
    for (let d = Date.parse(`${desde}T00:00:00Z`); d <= Date.parse(`${hasta}T00:00:00Z`); d += 86_400_000) lista.push(new Date(d).toISOString().slice(0, 10));
    return lista;
  }, [desde, hasta]);
  const pregunta = preguntaLunaDe(hoy);
  const orden = ordenOpcionesOfrenda(hoy);
  const [respuestas, setRespuestas] = useState<RespuestaDia[] | null>(null);
  const [ocupado, setOcupado] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    setRespuestas((await respuestasPreguntaDia(supabase, slug)) ?? []);
  }, [slug]);

  useEffect(() => {
    // Lo que ya respondiste (sistema externo).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void cargar();
  }, [cargar]);

  const deHoy = respuestas?.find((r) => r.dia === hoy) ?? null;
  const linternas = dias.map((d) => !!respuestas?.find((r) => r.dia === d && r.acierto));

  async function responder(opcion: number) {
    vibrar.medio();
    setOcupado(true);
    setError(null);
    try {
      const r = await responderPreguntaDia(supabase, "linternas", opcion);
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
        <DibujoTema dibujo={escenaLinternas(linternas)} ancho={ancho} />
        <View style={styles.contador}>
          <DibujoTema dibujo={PARTICULAS.linterna} ancho={15} />
          <Texto v="mono" tam={11} c="#FFD98A">
            Linternas: {linternas.filter(Boolean).length} de {dias.length}
          </Texto>
        </View>
      </View>
      <View style={{ gap: 2 }}>
        <Texto style={{ fontFamily: fuente.cuerpoBold, fontSize: 10, letterSpacing: 1.8, color: "#3DDC97" }}>{pregunta.tema.toUpperCase()}</Texto>
        <Texto v="fuerte" tam={15}>
          {pregunta.pregunta}
        </Texto>
      </View>
      {respuestas === null ? (
        <Texto v="nota">…</Texto>
      ) : deHoy ? (
        <Animated.View entering={FadeInDown.duration(280)} style={[styles.resultado, deHoy.acierto && { borderColor: "#FFC53D88", backgroundColor: "#FFC53D14" }]}>
          <Texto v="fuerte" tam={13.5} c={deHoy.acierto ? "#FFD98A" : color.texto}>
            {deHoy.acierto ? `¡Subió una linterna! +${FICHAS_POR_PREGUNTA} ${ficha.nombre}` : "Esta noche la linterna no subió."}
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
            {hoy >= hasta ? "Fue la última noche de linternas." : "Mañana hay otra pregunta."}
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
  escena: { borderRadius: 16, overflow: "hidden", borderWidth: 1, borderColor: "rgba(255,255,255,0.1)", backgroundColor: "#050A24" },
  contador: { position: "absolute", right: 8, bottom: 8, flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 9, paddingVertical: 3, borderRadius: 999, backgroundColor: "rgba(0,0,0,0.55)" },
  resultado: { gap: 5, padding: 12, borderRadius: 14, borderWidth: 1, borderColor: "rgba(255,255,255,0.14)" },
  opcion: { paddingHorizontal: 12, paddingVertical: 11, borderRadius: 12, borderWidth: 2, borderColor: "#05060F", backgroundColor: "#0F2A2A", boxShadow: "2px 2px 0px #05060F" },
});
