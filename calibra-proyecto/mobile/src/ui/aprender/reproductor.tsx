import { useEffect, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { vibrar } from "~/lib/efectos";
import { useAnimacionActiva } from "~/lib/rendimiento";
import { color, conAlfa, fuente } from "~/tema";
import Texto from "../Texto";

// Reproductor de los visuales de las lecciones (useReproductor.ts +
// ControlesReproductor.tsx de la web): cada visual tiene `total` cuadros y se dibuja
// en el cuadro `paso`. Avanza solo cada `ms`; Anterior / Siguiente / Pausa /
// Repetir lo controlan a mano. Se detiene si la pantalla no se ve.

interface Opciones {
  total: number;
  ms: number;
  estatico?: boolean;
  autoplay?: boolean;
  inicio?: number;
}

export function useReproductor({ total, ms, estatico = false, autoplay = true, inicio = 0 }: Opciones) {
  const visible = useAnimacionActiva();
  const [manual, setManual] = useState<number | null>(null);
  const [pausado, setPausado] = useState(false);
  const minimo = Math.min(inicio, total);
  const paso = Math.min(total, Math.max(minimo, manual ?? (estatico ? total : minimo)));
  const reproduciendo = autoplay && visible && !pausado && !estatico && paso < total;

  useEffect(() => {
    if (!reproduciendo) return;
    const id = setTimeout(() => setManual(paso + 1), paso === 0 ? Math.min(500, ms) : ms);
    return () => clearTimeout(id);
  }, [reproduciendo, paso, ms]);

  function repetir() {
    setManual(minimo);
    setPausado(false);
  }

  return {
    paso,
    minimo,
    total,
    reproduciendo,
    reducir: estatico,
    alFinal: paso >= total,
    siguiente: () => {
      setManual(Math.min(total, paso + 1));
      setPausado(true);
    },
    anterior: () => {
      setManual(Math.max(minimo, paso - 1));
      setPausado(true);
    },
    repetir,
    alternar: () => {
      if (paso >= total) repetir();
      else if (reproduciendo) setPausado(true);
      else setPausado(false);
    },
  };
}

export type Reproductor = ReturnType<typeof useReproductor>;

function Boton({ texto, onPress, deshabilitado, acento }: { texto: string; onPress: () => void; deshabilitado?: boolean; acento?: string }) {
  return (
    <Pressable
      disabled={deshabilitado}
      onPress={() => {
        vibrar.seleccion();
        onPress();
      }}
      style={({ pressed }) => [
        styles.boton,
        acento && { borderColor: acento, backgroundColor: conAlfa(acento, 0.1) },
        deshabilitado && { opacity: 0.4 },
        pressed && { transform: [{ scale: 0.95 }] },
      ]}
    >
      <Texto style={{ fontFamily: fuente.cuerpoFuerte, fontSize: 12, color: acento ?? color.texto }}>{texto}</Texto>
    </Pressable>
  );
}

export function ControlesReproductor({ r, acento }: { r: Reproductor; acento?: string }) {
  return (
    <View style={styles.fila}>
      <Boton texto="‹ Anterior" onPress={r.anterior} deshabilitado={r.paso <= r.minimo} acento={acento} />
      <Boton texto="Siguiente ›" onPress={r.siguiente} deshabilitado={r.alFinal} acento={acento} />
      {!r.reducir && <Boton texto={r.reproduciendo ? "Pausa" : "Reproducir"} onPress={r.alternar} />}
      <Boton texto="↻ Repetir" onPress={r.repetir} acento={acento} />
      <Texto v="mono" tam={11} c={color.texto2} style={{ minWidth: 44, textAlign: "center" }}>
        {r.paso} de {r.total}
      </Texto>
    </View>
  );
}

// Marco común de un visual: tarjeta, título opcional y controles abajo.
export function MarcoVisual({ titulo, children, r, acento }: { titulo?: string; children: React.ReactNode; r?: Reproductor; acento?: string }) {
  return (
    <View style={styles.marco}>
      {titulo ? (
        <Texto v="fuerte" tam={13}>
          {titulo}
        </Texto>
      ) : null}
      {children}
      {r && r.total > 1 && <ControlesReproductor r={r} acento={acento} />}
    </View>
  );
}

const styles = StyleSheet.create({
  fila: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", justifyContent: "center", gap: 6 },
  boton: { minHeight: 34, paddingHorizontal: 10, borderRadius: 10, borderWidth: 1, borderColor: color.border, backgroundColor: color.surface1, alignItems: "center", justifyContent: "center" },
  marco: { gap: 10, padding: 12, borderRadius: 18, borderWidth: 1, borderColor: color.border, backgroundColor: color.surface1, overflow: "hidden" },
});
