import type { RealtimeChannel } from "@supabase/supabase-js";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import Animated, { FadeIn, ZoomIn } from "react-native-reanimated";
import type { FilaHistorial, ResultadoDuelo } from "~/lib/competir";
import { sonar, vibrar } from "~/lib/efectos";
import { supabase } from "~/lib/supabase";
import { color, conAlfa } from "~/tema";
import Barra from "./Barra";
import NumeroAnimado from "./NumeroAnimado";
import Tarjeta from "./Tarjeta";
import Texto from "./Texto";

// Tú contra tu rival al terminar un duelo. Si el rival sigue jugando (duelo en
// vivo con un amigo), muestra su avance en vivo y, cuando termina, el resultado:
// quién ganó y el puntaje de cada uno.
const CADA_MS = 3000;
const ESPERA_MAX_MS = 4 * 60_000;

export default function ComparativaDuelo({
  duelId,
  inicial,
  rivalNombre,
  total,
  acento,
  onResuelto,
}: {
  duelId: string | null;
  inicial: ResultadoDuelo;
  rivalNombre: string;
  total: number;
  acento: string;
  onResuelto: (r: ResultadoDuelo) => void;
}) {
  const [r, setR] = useState(inicial);
  const [rivalVa, setRivalVa] = useState<{ respondidos: number; correctos: number } | null>(null);
  const [agotado, setAgotado] = useState(false);
  const avisado = useRef(inicial.resuelto);
  const onResueltoRef = useRef(onResuelto);
  useEffect(() => {
    onResueltoRef.current = onResuelto;
  }, [onResuelto]);

  useEffect(() => {
    if (r.resuelto || !duelId) return;
    let canal: RealtimeChannel | null = supabase.channel(`duelo:${duelId}:vivo`);
    const miId = supabase.auth.getSession().then((s) => s.data.session?.user.id ?? null);
    canal.on("broadcast", { event: "progreso" }, async ({ payload }) => {
      const p = payload as { userId: string; respondidos: number; correctos: number };
      if (p.userId !== (await miId)) setRivalVa({ respondidos: p.respondidos, correctos: p.correctos });
    });
    canal.subscribe();
    const inicio = Date.now();
    const t = setInterval(async () => {
      if (Date.now() - inicio > ESPERA_MAX_MS) {
        setAgotado(true);
        clearInterval(t);
        return;
      }
      const { data } = await supabase.rpc("mi_historial_duelos", { p_limite: 10 });
      const f = ((data as FilaHistorial[] | null) ?? []).find((x) => x.duel_id === duelId);
      if (!f) return;
      clearInterval(t);
      const final: ResultadoDuelo = { ...r, resuelto: true, gane: f.gane, empate: f.empate, mi_puntaje: f.mi_puntaje, rival_puntaje: f.rival_puntaje, oponente_nombre: f.rival_nombre ?? r.oponente_nombre };
      setR(final);
    }, CADA_MS);
    return () => {
      clearInterval(t);
      if (canal) supabase.removeChannel(canal);
      canal = null;
    };
  }, [duelId, r]);

  useEffect(() => {
    if (!r.resuelto || avisado.current) return;
    avisado.current = true;
    sonar(r.gane ? "victoria" : r.empate ? "combo" : "derrota");
    vibrar.fuerte();
    onResueltoRef.current(r);
  }, [r]);

  const nombre = r.oponente_nombre ?? rivalNombre;
  if (!r.resuelto) {
    return (
      <Tarjeta sinEntrada acento={acento} brillo={0.25}>
        <View style={styles.fila}>
          <ActivityIndicator color={acento} />
          <View style={{ flex: 1 }}>
            <Texto v="h3">{agotado ? `${nombre} todavía no termina` : `Esperando a ${nombre}…`}</Texto>
            <Texto v="nota">{agotado ? "Te avisamos el resultado apenas termine." : "Apenas termine, aquí ves quién ganó."}</Texto>
          </View>
        </View>
        {rivalVa && !agotado && (
          <Animated.View entering={FadeIn} style={{ gap: 6, marginTop: 12 }}>
            <View style={styles.entre}>
              <Texto v="nota">{nombre} va en</Texto>
              <Texto v="mono" tam={13}>
                {rivalVa.respondidos}/{total} · {rivalVa.correctos} bien
              </Texto>
            </View>
            <Barra valor={rivalVa.respondidos / Math.max(1, total)} acento={color.error} alto={6} />
          </Animated.View>
        )}
      </Tarjeta>
    );
  }

  const mio = r.mi_puntaje ?? 0;
  const suyo = r.rival_puntaje ?? 0;
  const max = Math.max(mio, suyo, 1);
  const tono = r.gane ? color.logro : r.empate ? color.primarioClaro : color.error;
  return (
    <Animated.View entering={ZoomIn.duration(380)}>
      <Tarjeta sinEntrada acento={tono} brillo={0.35}>
        <Texto v="micro" c={tono} centro>
          {r.gane ? "Ganaste el duelo" : r.empate ? "Empate" : `Ganó ${nombre}`}
        </Texto>
        <View style={[styles.fila, { justifyContent: "space-between", marginVertical: 10 }]}>
          <View style={styles.lado}>
            <Texto v="nota">Tú</Texto>
            <NumeroAnimado valor={mio} desde={0} v="mono" c={r.gane ? color.logro : color.texto} estilo={{ fontSize: 30, lineHeight: 36 }} />
          </View>
          <Texto v="h2" c={color.texto2}>
            vs
          </Texto>
          <View style={styles.lado}>
            <Texto v="nota" numberOfLines={1}>
              {nombre}
            </Texto>
            <NumeroAnimado valor={suyo} desde={0} v="mono" c={!r.gane && !r.empate ? color.logro : color.texto} estilo={{ fontSize: 30, lineHeight: 36 }} />
          </View>
        </View>
        <View style={{ gap: 6 }}>
          <Barra valor={mio / max} colores={[color.primarioBase, color.primarioNeon]} alto={7} />
          <Barra valor={suyo / max} colores={[conAlfa(color.error, 0.7), color.error]} alto={7} />
        </View>
        {r.mi_precision != null && r.rival_precision != null && (
          <View style={[styles.entre, { marginTop: 10 }]}>
            <Texto v="nota" tam={12}>
              Precisión {Math.round(r.mi_precision * 100)}%
            </Texto>
            <Texto v="nota" tam={12}>
              {Math.round(r.rival_precision * 100)}%
            </Texto>
          </View>
        )}
      </Tarjeta>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  fila: { flexDirection: "row", alignItems: "center", gap: 12 },
  entre: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  lado: { flex: 1, alignItems: "center", gap: 2 },
});
