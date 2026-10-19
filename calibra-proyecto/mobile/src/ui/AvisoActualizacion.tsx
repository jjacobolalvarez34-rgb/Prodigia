import { useEffect, useRef, useState } from "react";
import { AppState, Linking, StyleSheet, View } from "react-native";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { buscarVersionNueva, descargarEInstalar, posponer, URL_DESCARGA_WEB, versionInstalada, type VersionNueva } from "~/lib/actualizacion";
import { vibrar } from "~/lib/efectos";
import { color, conAlfa } from "~/tema";
import Barra from "./Barra";
import Boton3D from "./Boton3D";
import Logo from "./Logo";
import Texto from "./Texto";

// «Hay una nueva versión de Prodigia»: se revisa al abrir la app y al volver a ella
// (como mucho cada 6 h). «Actualizar» baja el APK dentro de la app y abre el instalador.
const CADA_MS = 6 * 60 * 60 * 1000;

export default function AvisoActualizacion() {
  const [nueva, setNueva] = useState<VersionNueva | null>(null);
  const [avance, setAvance] = useState<number | null>(null);
  const [error, setError] = useState(false);
  const ultima = useRef(0);

  useEffect(() => {
    const revisar = () => {
      if (Date.now() - ultima.current < CADA_MS) return;
      ultima.current = Date.now();
      buscarVersionNueva().then((v) => v && setNueva(v));
    };
    revisar();
    const sub = AppState.addEventListener("change", (estado) => estado === "active" && revisar());
    return () => sub.remove();
  }, []);

  if (!nueva) return null;

  async function actualizar() {
    if (!nueva) return;
    vibrar.medio();
    setError(false);
    setAvance(0);
    try {
      await descargarEInstalar(nueva.version, setAvance);
    } catch {
      setError(true);
    } finally {
      setAvance(null);
    }
  }

  return (
    <Animated.View entering={FadeIn.duration(250)} style={styles.fondo}>
      <Animated.View entering={FadeInDown.duration(350)} style={styles.tarjeta}>
        <View style={styles.icono}>
          <Logo tam={40} />
        </View>
        <Texto v="micro" c={color.logro} centro>
          ACTUALIZACIÓN
        </Texto>
        <Texto v="h2" centro>
          Hay una nueva versión de Prodigia
        </Texto>
        <Texto v="nota" centro>
          Versión {nueva.version} · tienes la {versionInstalada()}. Tu progreso no se toca: está en tu cuenta.
        </Texto>
        {nueva.notas && (
          <View style={styles.notas}>
            <Texto v="nota" tam={12.5}>
              {nueva.notas}
            </Texto>
          </View>
        )}
        {avance != null ? (
          <View style={{ gap: 6 }}>
            <Barra valor={avance} acento={color.logro} alto={10} />
            <Texto v="nota" centro tam={12}>
              {avance < 1 ? `Descargando… ${Math.round(avance * 100)} %` : "Abriendo el instalador…"}
            </Texto>
          </View>
        ) : (
          <>
            {error && (
              <Texto v="nota" centro tam={12} c={color.error}>
                No se pudo bajar desde la app. Prueba de nuevo o desde el navegador.
              </Texto>
            )}
            <Boton3D titulo="Actualizar ahora" variante="logro" brillo onPress={actualizar} />
            {error && <Boton3D titulo="Descargar en el navegador" variante="secundario" tamano="sm" onPress={() => Linking.openURL(URL_DESCARGA_WEB)} />}
            <Boton3D
              titulo="Más tarde"
              variante="secundario"
              tamano="sm"
              onPress={() => {
                void posponer(nueva.version);
                setNueva(null);
              }}
            />
          </>
        )}
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  fondo: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: conAlfa(color.bgHondo, 0.9), zIndex: 130, elevation: 130, justifyContent: "center", padding: 24 },
  tarjeta: { gap: 10, padding: 22, borderRadius: 24, borderWidth: 1, borderColor: conAlfa(color.logro, 0.45), backgroundColor: color.surface2 },
  icono: { alignSelf: "center", width: 64, height: 64, borderRadius: 32, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(124,92,255,0.14)" },
  notas: { padding: 12, borderRadius: 14, backgroundColor: conAlfa(color.logro, 0.08) },
});
