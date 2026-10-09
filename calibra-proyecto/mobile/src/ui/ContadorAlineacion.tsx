import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { estadoAlineacion, partesTiempo } from "@/lib/recompensas/contadorAlineacion";
import { useAnimacionActiva } from "~/lib/rendimiento";
import { color, conAlfa, fuente } from "~/tema";
import Texto from "./Texto";

const DIAS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
const MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
function fechaLarga(ms: number): string {
  const d = new Date(ms);
  const h = d.getHours();
  return `${DIAS[d.getDay()]} ${d.getDate()} de ${MESES[d.getMonth()]}, ${h % 12 === 0 ? 12 : h % 12}:${String(d.getMinutes()).padStart(2, "0")} ${h < 12 ? "a. m." : "p. m."}`;
}

// Cuenta regresiva hasta la próxima Gran Alineación, o hasta que termine la que está
// pasando (como ContadorAlineacion.tsx de la web). Se actualiza cada segundo
// solo mientras la pantalla está a la vista.
export default function ContadorAlineacion({ compacto = false }: { compacto?: boolean }) {
  const activa = useAnimacionActiva();
  const [ahora, setAhora] = useState(() => Date.now());
  useEffect(() => {
    if (!activa) return;
    const id = setInterval(() => setAhora(Date.now()), 1000);
    return () => clearInterval(id);
  }, [activa]);
  const e = estadoAlineacion(ahora);
  const p = partesTiempo(e.restanteMs);
  const bloques: [number, string][] = [
    [p.dias, "días"],
    [p.horas, "horas"],
    [p.minutos, "min"],
    [p.segundos, "seg"],
  ];
  return (
    <LinearGradient colors={e.enCurso ? ["#6B3FD8", "#241452", "#0B0820"] : ["#1B1240", "#0B0820"]} style={[styles.caja, e.enCurso && { borderColor: color.logro, boxShadow: `0px 0px 24px ${conAlfa(color.logro, 0.35)}` }]}>
      <Texto v="micro" c={e.enCurso ? color.logro : "rgba(255,255,255,0.6)"} centro>
        {e.enCurso ? "¡Gran Alineación en curso!" : "Próxima Gran Alineación"}
      </Texto>
      <View style={styles.fila} accessible accessibilityLabel={`${p.dias} días, ${p.horas} horas, ${p.minutos} minutos`}>
        {bloques.map(([v, nombre], i) => (
          <View key={nombre} style={styles.fila}>
            <View style={{ alignItems: "center" }}>
              <View style={[styles.numero, compacto && { minWidth: 42, paddingVertical: 4 }]}>
                <Texto style={{ fontFamily: fuente.mono, fontSize: compacto ? 20 : 26, color: "#FFFFFF" }}>{String(v).padStart(2, "0")}</Texto>
              </View>
              <Texto v="micro" tam={9} c="rgba(255,255,255,0.55)">
                {nombre}
              </Texto>
            </View>
            {i < bloques.length - 1 && (
              <Texto style={{ fontFamily: fuente.mono, fontSize: 18, color: "rgba(255,255,255,0.4)", marginBottom: 14 }}>:</Texto>
            )}
          </View>
        ))}
      </View>
      <Texto v="nota" tam={11} c="rgba(255,255,255,0.75)" centro>
        {e.enCurso ? `Termina el ${fechaLarga(e.objetivo)}` : `Empieza el ${fechaLarga(e.objetivo)}`}
      </Texto>
      {!compacto && (
        <Texto v="fuerte" tam={11.5} c={color.logro} centro>
          Todas las ciudades amanecen juntas: constelaciones con premio doble y doble experiencia en todos los mundos.
        </Texto>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  caja: { gap: 8, padding: 14, borderRadius: 18, borderWidth: 1, borderColor: "rgba(255,255,255,0.12)", alignItems: "center", overflow: "hidden" },
  fila: { flexDirection: "row", alignItems: "flex-end", gap: 6 },
  numero: { minWidth: 50, alignItems: "center", paddingHorizontal: 6, paddingVertical: 6, borderRadius: 12, borderWidth: 1, borderColor: "rgba(255,255,255,0.15)", backgroundColor: "rgba(255,255,255,0.08)" },
});
