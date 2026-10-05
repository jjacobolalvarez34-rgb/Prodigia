import { StyleSheet, View } from "react-native";
import { ciudadDe, efectoDe, EMOTES, estelaDe, particulasDe } from "@/lib/recompensas/catalogo";
import { useJugador } from "~/lib/jugador";
import { color, fuente, MUNDO_POR_SLUG, type MundoSlug } from "~/tema";
import Ciudad from "../Ciudad";
import { IconoLlama } from "../Iconos";
import AvatarMarco from "../placa/AvatarMarco";
import FondoPlaca from "../placa/FondoPlaca";
import Texto from "../Texto";

// Muestra chica de un cosmético de las categorías nuevas (tienda, cápsulas y
// colecciones): la llama con la estela, el estallido del efecto, el emote, etc.
export default function VistaCosmetico({ categoria, valor, tam = 56 }: { categoria: string; valor: string; tam?: number }) {
  const { placa } = useJugador();
  switch (categoria) {
    case "estela":
      return <IconoLlama tam={tam * 0.8} estado="llamas" estela={estelaDe(valor)} />;
    case "efecto": {
      const efecto = efectoDe(valor);
      const piezas = particulasDe(efecto, 8, tam * 0.36);
      return (
        <View style={{ width: tam, height: tam, alignItems: "center", justifyContent: "center" }}>
          {piezas.map((p, i) =>
            p.texto ? (
              <Texto key={i} style={{ position: "absolute", transform: [{ translateX: p.dx }, { translateY: p.dy }], fontFamily: fuente.display, fontSize: 13, color: p.color }}>
                {p.texto}
              </Texto>
            ) : (
              <View
                key={i}
                style={{
                  position: "absolute",
                  width: efecto.forma === "burbujas" ? p.tam * 1.6 : p.tam,
                  height: efecto.forma === "confeti" ? p.tam * 1.6 : efecto.forma === "burbujas" ? p.tam * 1.6 : p.tam,
                  borderRadius: efecto.forma === "pixeles" || efecto.forma === "confeti" ? 1 : 99,
                  borderWidth: efecto.forma === "burbujas" ? 1.5 : 0,
                  borderColor: p.color,
                  backgroundColor: efecto.forma === "burbujas" ? "transparent" : p.color,
                  transform: [{ translateX: p.dx }, { translateY: p.dy }, { rotate: `${p.giro}deg` }],
                }}
              />
            )
          )}
        </View>
      );
    }
    case "sonido":
      return <Texto style={{ fontSize: tam * 0.55 }}>🎵</Texto>;
    case "emote": {
      const e = EMOTES[valor];
      return <Texto style={{ fontSize: tam * 0.6 }}>{e?.emoji ?? "💬"}</Texto>;
    }
    case "titulo":
      return (
        <View style={styles.titulo}>
          <Texto v="fuerte" tam={11} c={color.logro} centro numberOfLines={2}>
            TÍTULO
          </Texto>
        </View>
      );
    case "marco":
      return <AvatarMarco url={placa?.avatarUrl ?? null} nombre={placa?.nombre ?? "?"} marco={valor} tam={tam * 0.85} animar={false} />;
    case "fondo":
      return (
        <View style={[styles.fondo, { width: tam * 1.3, height: tam }]}>
          <FondoPlaca fondo={valor} url={null} velo={false} animar={false} />
        </View>
      );
    case "ciudad_placa": {
      const c = ciudadDe(valor);
      const m = MUNDO_POR_SLUG[valor as MundoSlug];
      return (
        <View style={[styles.fondo, { width: tam * 1.4, height: tam }]}>
          <Ciudad semilla={valor} acento={m?.neon ?? c?.color ?? color.primario} alto={tam} radio={10} quieta sinAvion sinLuna />
        </View>
      );
    }
    default:
      return null;
  }
}

const styles = StyleSheet.create({
  titulo: { paddingHorizontal: 8, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: color.logro },
  fondo: { borderRadius: 10, overflow: "hidden" },
});
