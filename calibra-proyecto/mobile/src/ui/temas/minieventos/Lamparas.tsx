import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { COLECCIONES } from "@/lib/temas/colecciones";
import { escenaLamparas, FICHAS_LAMPARAS, lamparasEvento, META_LAMPARAS } from "@/lib/temas/minieventos";
import { supabase } from "~/lib/supabase";
import DibujoTema from "~/ui/temas/DibujoTema";
import Texto from "~/ui/Texto";

// Diwali · «Enciende 100 lámparas» (0309, igual que la web): cada acierto del evento
// enciende una lámpara; con 100, la ciudad se ilumina y da Fichas.
export default function Lamparas({ ancho }: { ancho: number }) {
  const ficha = COLECCIONES.diwali!.ficha;
  const [estado, setEstado] = useState<{ encendidas: number; premio: boolean } | null>(null);

  useEffect(() => {
    let vivo = true;
    void lamparasEvento(supabase).then((r) => {
      if (vivo) setEstado(r ?? { encendidas: 0, premio: false });
    });
    return () => {
      vivo = false;
    };
  }, []);

  const n = estado?.encendidas ?? 0;
  return (
    <View style={{ gap: 8, marginTop: 6 }}>
      <View style={styles.escena}>
        <DibujoTema dibujo={escenaLamparas(n)} ancho={ancho} />
      </View>
      <View style={styles.barra}>
        <View style={[styles.relleno, { width: `${Math.min(100, (n / META_LAMPARAS) * 100)}%` }]} />
      </View>
      <Texto v="mono" tam={11.5} c="#FFD36B">
        {estado ? `${n} de ${META_LAMPARAS} lámparas encendidas` : "…"}
      </Texto>
      {estado?.premio ? (
        <Texto v="fuerte" tam={13} c="#FFC53D">
          ¡Tu ciudad entera brilla! +{FICHAS_LAMPARAS} {ficha.nombre}
        </Texto>
      ) : (
        <Texto v="nota" tam={12}>
          Cada acierto en cualquier mundo enciende una.
        </Texto>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  escena: { borderRadius: 16, overflow: "hidden", borderWidth: 1, borderColor: "rgba(255,255,255,0.1)", backgroundColor: "#120720" },
  barra: { height: 8, borderRadius: 999, overflow: "hidden", backgroundColor: "rgba(255,255,255,0.1)" },
  relleno: { height: "100%", borderRadius: 999, backgroundColor: "#FFC53D" },
});
