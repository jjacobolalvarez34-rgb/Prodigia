import { useCallback, useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { COLECCIONES, slugEvento } from "@/lib/temas/colecciones";
import { PARTICULAS } from "@/lib/temas/dibujos";
import { abrirCasillaAdviento, casillasAdviento, diaUtc, esDomingo, mensajeErrorMinievento, ULTIMA_CASILLA, type CasillaAdviento } from "@/lib/temas/minieventos";
import { sonar, vibrar } from "~/lib/efectos";
import { supabase } from "~/lib/supabase";
import Boton3D from "~/ui/Boton3D";
import DibujoTema from "~/ui/temas/DibujoTema";
import Texto from "~/ui/Texto";
import { color } from "~/tema";

// Navidad · «Calendario de adviento» (0309, igual que la web): del 1 al 24 de diciembre,
// una casilla por día (solo la de hoy): Fichas, y los domingos una cápsula del evento.
export default function Adviento({ desde, ancho }: { desde: string; ancho: number }) {
  const ficha = COLECCIONES.navidad!.ficha;
  const slug = slugEvento("navidad", desde);
  const hoy = diaUtc();
  const anio = desde.slice(0, 4);
  const diaHoy = hoy.slice(0, 7) === `${anio}-12` ? Number(hoy.slice(8, 10)) : 0;
  const [casillas, setCasillas] = useState<CasillaAdviento[] | null>(null);
  const [ultima, setUltima] = useState<CasillaAdviento | null>(null);
  const [ocupado, setOcupado] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lado = (ancho - 5 * 6) / 6;

  const cargar = useCallback(async () => {
    setCasillas((await casillasAdviento(supabase, slug)) ?? []);
  }, [slug]);

  useEffect(() => {
    // Las casillas que ya abriste (sistema externo).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void cargar();
  }, [cargar]);

  async function abrir() {
    vibrar.medio();
    setOcupado(true);
    setError(null);
    try {
      const c = await abrirCasillaAdviento(supabase);
      sonar("logro");
      vibrar.exito();
      setUltima(c);
      setCasillas((antes) => [...(antes ?? []), c]);
    } catch (e) {
      setError(mensajeErrorMinievento(e));
    } finally {
      setOcupado(false);
    }
  }

  const abierta = (dia: number) => casillas?.find((c) => Number(c.dia.slice(8, 10)) === dia) ?? null;
  const hoyAbierta = diaHoy > 0 ? abierta(diaHoy) : null;
  const textoCasilla = (c: CasillaAdviento) =>
    c.premio === "capsula" ? `Casilla ${Number(c.dia.slice(8, 10))}: una cápsula del evento (está en Recompensas)` : `Casilla ${Number(c.dia.slice(8, 10))}: +${c.cantidad} ${ficha.nombre}`;

  return (
    <View style={{ gap: 10, marginTop: 6 }}>
      <View style={styles.grilla}>
        {Array.from({ length: ULTIMA_CASILLA }, (_, i) => i + 1).map((dia) => {
          const c = abierta(dia);
          const esHoy = dia === diaHoy;
          const domingo = esDomingo(`${anio}-12-${String(dia).padStart(2, "0")}`);
          return (
            <View
              key={dia}
              style={[
                styles.casilla,
                { width: lado, height: lado },
                { borderColor: esHoy ? "#FFC53D" : c ? "#3DDC9766" : "rgba(255,255,255,0.12)", backgroundColor: c ? "#3DDC9714" : esHoy ? "#E6394633" : dia < diaHoy ? "transparent" : "rgba(255,255,255,0.03)" },
              ]}
            >
              {c ? (
                <View style={{ opacity: 0.5 }}>
                  <DibujoTema dibujo={PARTICULAS.regalo} ancho={lado * 0.5} />
                </View>
              ) : (
                <Texto v="fuerte" tam={13} c={dia < diaHoy ? "rgba(255,255,255,0.25)" : "#FFFFFF"}>
                  {dia}
                </Texto>
              )}
              {domingo && !c && <View style={styles.punto} />}
            </View>
          );
        })}
      </View>
      <Texto v="nota" tam={11}>
        El punto dorado: los domingos, cápsula.
      </Texto>
      {diaHoy === 0 || diaHoy > ULTIMA_CASILLA ? (
        <Texto v="nota">El calendario terminó el 24.</Texto>
      ) : casillas === null ? (
        <Texto v="nota">…</Texto>
      ) : hoyAbierta ? (
        <View style={{ gap: 2 }}>
          <Texto v="fuerte" tam={13} c={color.correcto}>
            {textoCasilla(ultima ?? hoyAbierta)}
          </Texto>
          <Texto v="nota" tam={12}>
            Mañana se abre otra casilla.
          </Texto>
        </View>
      ) : (
        <Boton3D titulo={`Abrir la casilla ${diaHoy}`} icono={<DibujoTema dibujo={PARTICULAS.regalo} ancho={18} />} tamano="sm" acento="#E63946" cargando={ocupado} onPress={abrir} />
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
  grilla: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  casilla: { alignItems: "center", justifyContent: "center", borderRadius: 9, borderWidth: 1 },
  punto: { position: "absolute", top: 3, right: 3, width: 5, height: 5, borderRadius: 3, backgroundColor: "#FFC53D" },
});
