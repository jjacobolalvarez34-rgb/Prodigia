import { StyleSheet, View } from "react-native";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { sonar } from "~/lib/efectos";
import { color, conAlfa, fuente } from "~/tema";
import Revelacion from "./fx/Revelacion";
import { IconoChispa } from "./Iconos";
import NumeroAnimado from "./NumeroAnimado";
import Texto from "./Texto";

// "Cápsula de Chispas" al subir de nivel DE CUENTA (NivelCuentaSubio.tsx de la web,
// mismo diseño: dos mitades en el degradé de marca violeta → dorado). La escena
// (cae, flota, tiembla soltando luz y estalla) es fx/Revelacion, la misma de las
// cápsulas de Recompensas. Las Chispas del regalo ya las acreditó la base al
// cerrar la partida: esto es la entrega.
export default function CapsulaNivel({ nivel, bonus, onCerrar }: { nivel: number; bonus: number; onCerrar: () => void }) {
  return (
    <Revelacion
      colores={["#7C5CFF", "#FFC53D"]}
      etiqueta="¡Subiste de nivel!"
      titulo="Te llegó una cápsula"
      textoBoton="¡Continuar!"
      onCerrar={onCerrar}
      abrir={async () => ({
        color: "#FFC53D",
        nivel: nivel % 10 === 0 ? 4 : nivel % 5 === 0 ? 3 : 2,
        contenido: (
          <View style={{ alignItems: "center", gap: 8 }}>
            <Texto style={{ fontFamily: fuente.display, fontSize: 48, color: color.texto, textShadowColor: color.primario, textShadowRadius: 22 }}>¡NIVEL {nivel}!</Texto>
            {bonus > 0 && (
              <Animated.View entering={FadeInDown.delay(150).duration(320)} style={styles.bonus}>
                <IconoChispa tam={26} />
                <NumeroAnimado valor={bonus} desde={0} prefijo="+" v="mono" c={color.logro} duracion={1100} estilo={{ fontSize: 30 }} onTic={() => sonar("moneda")} />
                <Texto v="fuerte" c={color.logro}>
                  Chispas
                </Texto>
              </Animated.View>
            )}
            <Animated.View entering={FadeIn.delay(400).duration(300)}>
              <Texto v="nota" centro>
                Sigue sumando para el nivel {nivel + 1}
              </Texto>
            </Animated.View>
          </View>
        ),
      })}
    />
  );
}

const styles = StyleSheet.create({
  bonus: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 18, paddingVertical: 8, borderRadius: 999, borderWidth: 1, borderColor: conAlfa(color.logro, 0.5), backgroundColor: conAlfa(color.logro, 0.12) },
});
