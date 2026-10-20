import { useCallback, useEffect, useRef, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { DECIMALES_PI, DIGITOS_TITULO_PI, guardarDigitosPi, SEGUNDOS_PI, tablaPi, type FilaTablaPi } from "@/lib/pi";
import { sonar, vibrar } from "~/lib/efectos";
import { supabase } from "~/lib/supabase";
import Boton3D from "~/ui/Boton3D";
import { PantallaApilada } from "~/ui/Pantalla";
import Tarjeta from "~/ui/Tarjeta";
import Texto from "~/ui/Texto";
import { color } from "~/tema";

// «Dígitos de π» (0295), igual que la web: escribe de memoria todos los decimales
// que puedas en 1 minuto; un error termina la partida y te muestra cuál era.
export default function Pi() {
  const [estado, setEstado] = useState<"inicio" | "jugando" | "fin">("inicio");
  const [escrito, setEscrito] = useState("");
  const [quedan, setQuedan] = useState(SEGUNDOS_PI);
  const [fallo, setFallo] = useState<string | null>(null);
  const [resultado, setResultado] = useState<{ mejor: number; titulo: boolean } | null>(null);
  const [tabla, setTabla] = useState<FilaTablaPi[]>([]);
  const fin = useRef(false);

  const terminar = useCallback(async (digitos: number) => {
    if (fin.current) return;
    fin.current = true;
    setEstado("fin");
    setResultado(await guardarDigitosPi(supabase, digitos));
    setTabla(await tablaPi(supabase));
  }, []);

  useEffect(() => {
    tablaPi(supabase).then(setTabla);
  }, []);

  useEffect(() => {
    if (estado !== "jugando") return;
    const id = setInterval(() => setQuedan((q) => q - 1), 1000);
    return () => clearInterval(id);
  }, [estado]);

  useEffect(() => {
    if (estado === "jugando" && quedan <= 0) terminar(escrito.length);
  }, [quedan, estado, escrito.length, terminar]);

  function tecla(d: string) {
    if (estado !== "jugando") return;
    const i = escrito.length;
    if (DECIMALES_PI[i] === d) {
      vibrar.seleccion();
      setEscrito(escrito + d);
      if ((i + 1) % 10 === 0) sonar("acierto2");
    } else {
      vibrar.medio();
      sonar("error");
      setFallo(`Era ${DECIMALES_PI[i]}, no ${d}`);
      terminar(i);
    }
  }

  const visibles = escrito.slice(-14);
  return (
    <PantallaApilada titulo="Dígitos de π" subtitulo="Minievento · Día de π">
      <Texto v="nota">Escribe de memoria todos los decimales que puedas en 1 minuto. Un error y se termina. Desde {DIGITOS_TITULO_PI} dígitos el 14 de marzo, el título «Irracional».</Texto>
      <Tarjeta estilo={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <Texto v="mono" tam={22}>
          3,<Texto v="mono" tam={22} c={color.primarioNeon}>{(escrito.length > 14 ? "…" : "") + visibles}</Texto>
        </Texto>
        <Texto v="mono" tam={16} c={color.texto2}>
          {estado === "jugando" ? `${quedan}s` : `${escrito.length}`}
        </Texto>
      </Tarjeta>

      {estado === "inicio" && <Boton3D titulo="Empezar" brillo onPress={() => setEstado("jugando")} />}

      {estado === "jugando" && (
        <View style={styles.teclado}>
          {["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", ""].map((k, i) =>
            k ? (
              <Pressable key={i} onPress={() => tecla(k)} style={({ pressed }) => [styles.tecla, pressed && { transform: [{ translateY: 2 }] }]}>
                <Texto v="mono" tam={24}>
                  {k}
                </Texto>
              </Pressable>
            ) : (
              <View key={i} style={styles.hueco} />
            )
          )}
        </View>
      )}

      {estado === "fin" && (
        <Tarjeta estilo={{ alignItems: "center", gap: 6 }}>
          <Texto v="display" tam={48}>
            {escrito.length}
          </Texto>
          <Texto v="nota" centro>
            {fallo ?? "Se acabó el minuto"} · tu mejor marca de hoy: {resultado?.mejor ?? escrito.length}
          </Texto>
          {resultado?.titulo && (
            <Texto v="fuerte" c={color.logro}>
              ¡Ganaste el título «Irracional»!
            </Texto>
          )}
          <Boton3D
            titulo="Otra vez"
            tamano="sm"
            estilo={{ marginTop: 6 }}
            onPress={() => {
              fin.current = false;
              setEscrito("");
              setFallo(null);
              setQuedan(SEGUNDOS_PI);
              setResultado(null);
              setEstado("jugando");
            }}
          />
        </Tarjeta>
      )}

      {tabla.length > 0 && (
        <Tarjeta estilo={{ gap: 4 }}>
          <Texto v="h3">Tabla de hoy</Texto>
          {tabla.map((f, i) => (
            <View key={i} style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Texto v={f.yo ? "fuerte" : "nota"}>
                {i + 1}. {f.nombre}
              </Texto>
              <Texto v="mono" tam={13}>
                {f.digitos}
              </Texto>
            </View>
          ))}
        </Tarjeta>
      )}
    </PantallaApilada>
  );
}

const styles = StyleSheet.create({
  teclado: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  tecla: { width: "31%", height: 58, borderRadius: 16, alignItems: "center", justifyContent: "center", backgroundColor: color.surface2, boxShadow: "0px 3px 0px #0E1222" },
  hueco: { width: "31%", height: 58 },
});
