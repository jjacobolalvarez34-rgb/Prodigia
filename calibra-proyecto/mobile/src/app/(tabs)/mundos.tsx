import * as WebBrowser from "expo-web-browser";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { alineacionEnCurso, proximaAlineacion } from "@/lib/ciudades/cicloDia";
import { mundoDobleExperiencia } from "@/lib/eventos/dobleExperiencia";
import { PRECIO_MUNDO_CHISPAS } from "@/lib/mundos/precios";
import { sonar, vibrar } from "~/lib/efectos";
import { URL_WEB } from "~/lib/entorno";
import { fijarChispas, recargarJugador, useJugador } from "~/lib/jugador";
import { nivelesDeMundos } from "~/lib/mundos";
import { useSesion } from "~/lib/sesion";
import { mensajeError, supabase } from "~/lib/supabase";
import { mostrarAviso } from "~/ui/Aviso";
import Barra from "~/ui/Barra";
import Boton3D from "~/ui/Boton3D";
import Ciudad from "~/ui/Ciudad";
import Confeti from "~/ui/Confeti";
import Hoja from "~/ui/Hoja";
import { IconoCandado, IconoChispa } from "~/ui/Iconos";
import { PantallaPestana } from "~/ui/Pantalla";
import Tarjeta from "~/ui/Tarjeta";
import Texto from "~/ui/Texto";
import { color, conAlfa, fuente, MUNDOS, type Mundo } from "~/tema";

type Filtro = "todos" | "mios" | "bloqueados";

function Chip({ texto, activo, onPress }: { texto: string; activo: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={() => {
        vibrar.seleccion();
        onPress();
      }}
      style={[styles.chip, activo && { backgroundColor: color.surface3, borderColor: conAlfa(color.primario, 0.5) }]}
    >
      <Texto style={{ fontFamily: fuente.cuerpoFuerte, fontSize: 12.5, color: activo ? color.texto : color.texto2 }}>{texto}</Texto>
    </Pressable>
  );
}

function TarjetaMundo({ mundo, tuyo, nivel, indice, recien, onPress }: { mundo: Mundo; tuyo: boolean; nivel: number; indice: number; recien: boolean; onPress: () => void }) {
  if (!tuyo) {
    return (
      <Tarjeta indice={indice} onPress={onPress} relleno={10}>
        <Ciudad semilla={mundo.slug} acento={mundo.neon} alto={92} apagada quieta />
        <View style={[styles.entre, { marginTop: 10 }]}>
          <View style={[styles.fila, { flex: 1 }]}>
            <IconoCandado tam={18} c={color.texto2} />
            <View>
              <Texto v="h3" style={{ letterSpacing: 1 }}>
                {mundo.nombre.toUpperCase()}
              </Texto>
              <Texto v="nota">{mundo.tema} · o incluido en Pro</Texto>
            </View>
          </View>
          <View style={styles.precio}>
            <IconoChispa tam={15} />
            <Texto v="mono" tam={13}>
              {PRECIO_MUNDO_CHISPAS.toLocaleString("es")}
            </Texto>
          </View>
        </View>
      </Tarjeta>
    );
  }
  const doble = mundoDobleExperiencia() === mundo.slug;
  return (
    <Tarjeta indice={indice} onPress={onPress} relleno={10} acento={doble ? color.logro : mundo.neon} brillo={doble ? 0.3 : 0.16}>
      <Animated.View entering={recien ? FadeIn.duration(1200) : undefined}>
        <Ciudad semilla={mundo.slug} acento={mundo.neon} alto={128} densidad={Math.min(1.25, 0.8 + nivel / 100)} />
        {doble && (
          <View style={styles.doble}>
            <Texto style={{ fontFamily: fuente.display, fontSize: 11, color: "#2A1A00" }}>🪂 ×2 EXP HOY</Texto>
          </View>
        )}
      </Animated.View>
      <View style={[styles.entre, { marginTop: 10 }]}>
        <View style={{ flex: 1 }}>
          <Texto v="h3" tam={18} style={{ letterSpacing: 1 }}>
            {mundo.nombre.toUpperCase()}
          </Texto>
          <Texto v="nota">{mundo.tema}</Texto>
        </View>
        <Texto v="mono" tam={18} c={mundo.neon}>
          Nv {nivel}
        </Texto>
      </View>
      <Barra valor={nivel / 100} acento={mundo.base} estilo={{ marginTop: 8 }} />
    </Tarjeta>
  );
}

// La Gran Alineación (lib/ciudades/cicloDia.ts): cada 28 días las 13 ciudades
// amanecen juntas. Mientras dura (3 h) se anuncia; si no, cuánto falta.
function Alineacion() {
  const [ahora] = useState(() => Date.now());
  const enCurso = alineacionEnCurso(ahora);
  const dias = Math.ceil((proximaAlineacion(ahora) - ahora) / 86_400_000);
  return (
    <View style={[styles.alineacion, enCurso && { borderColor: color.logro, backgroundColor: conAlfa(color.logro, 0.12) }]}>
      <Texto tam={20}>{enCurso ? "🌅" : "☀️"}</Texto>
      <View style={{ flex: 1 }}>
        <Texto v="fuerte" tam={13} c={enCurso ? color.logro : color.texto}>
          {enCurso ? "¡La Gran Alineación! Las 13 ciudades amanecen juntas" : "Cada ciudad tiene su propio día y su propia noche"}
        </Texto>
        <Texto v="nota" tam={11}>
          {enCurso ? "Pasa una vez cada 28 días." : dias <= 1 ? "Mañana amanecen todas juntas: la Gran Alineación." : `Faltan ${dias} días para que las 13 amanezcan juntas.`}
        </Texto>
      </View>
    </View>
  );
}

export default function Mundos() {
  const router = useRouter();
  const { sesion } = useSesion();
  const userId = sesion?.user.id;
  const { mundos: desbloqueados, plan, resumen } = useJugador();
  const [niveles, setNiveles] = useState<Record<string, number>>({});
  const [filtro, setFiltro] = useState<Filtro>("todos");
  const [elegido, setElegido] = useState<Mundo | null>(null);
  const [comprando, setComprando] = useState(false);
  const [recien, setRecien] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    if (!userId) return;
    await Promise.all([recargarJugador(), nivelesDeMundos(userId).then(setNiveles)]);
  }, [userId]);

  useFocusEffect(
    useCallback(() => {
      cargar();
    }, [cargar])
  );

  const esPro = plan === "pro";
  const esTuyo = (m: Mundo) => esPro || desbloqueados.includes(m.slug);
  const lista = MUNDOS.filter((m) => (filtro === "mios" ? esTuyo(m) : filtro === "bloqueados" ? !esTuyo(m) : true)).sort((a, b) => Number(esTuyo(b)) - Number(esTuyo(a)));
  const encendidos = MUNDOS.filter(esTuyo).length;
  const chispas = resumen?.chispas ?? 0;

  async function desbloquear(m: Mundo) {
    setComprando(true);
    try {
      const { data, error } = await supabase.rpc("desbloquear_mundo", { p_mundo: m.slug });
      if (error) throw error;
      const fila = (data as { puntos_total: number }[])[0];
      fijarChispas(fila.puntos_total);
      sonar("nivel");
      vibrar.exito();
      setRecien(m.slug);
      setElegido(null);
      mostrarAviso(`¡${m.nombre} se encendió!`, "logro");
      await recargarJugador();
      setTimeout(() => setRecien(null), 4000);
    } catch (e) {
      mostrarAviso(mensajeError(e), "error");
    } finally {
      setComprando(false);
    }
  }

  return (
    <View style={{ flex: 1 }}>
      <PantallaPestana>
        <View style={[styles.entre, { alignItems: "flex-end" }]}>
          <Texto v="h1">Tus mundos</Texto>
          <Texto v="nota">
            <Texto v="mono" tam={13}>
              {encendidos}
            </Texto>{" "}
            de 13 encendidos
          </Texto>
        </View>
        <Alineacion />
        <View style={styles.fila}>
          <Chip texto="Todos" activo={filtro === "todos"} onPress={() => setFiltro("todos")} />
          <Chip texto="Míos" activo={filtro === "mios"} onPress={() => setFiltro("mios")} />
          <Chip texto="Bloqueados" activo={filtro === "bloqueados"} onPress={() => setFiltro("bloqueados")} />
        </View>
        {lista.map((m, i) => (
          <View key={m.slug}>
            <TarjetaMundo
              mundo={m}
              tuyo={esTuyo(m)}
              nivel={niveles[m.slug] ?? 1}
              indice={i}
              recien={recien === m.slug}
              onPress={() => {
                if (esTuyo(m) && m.enApp) router.push(`/${m.slug}` as "/numeria");
                else setElegido(m);
              }}
            />
          </View>
        ))}
      </PantallaPestana>

      <Hoja visible={!!elegido} onCerrar={() => setElegido(null)}>
        {elegido && (
          <>
            <Ciudad semilla={elegido.slug} acento={elegido.neon} alto={110} apagada={!esTuyo(elegido)} />
            <Texto v="h2">{elegido.nombre}</Texto>
            {esTuyo(elegido) ? (
              <>
                <Texto v="nota">
                  {elegido.nombre} ya es tuyo. Todavía se juega en la web: muy pronto llega a la app, con tu mismo progreso.
                </Texto>
                <Boton3D titulo="Abrir en la web" acento={elegido.base} onPress={() => WebBrowser.openBrowserAsync(`${URL_WEB}/${elegido.slug}`)} />
              </>
            ) : (
              <>
                <Texto v="nota">
                  Enciende {elegido.nombre} para siempre con Chispas, o tenlo incluido con Prodigia Pro. Tienes {chispas.toLocaleString("es")} Chispas.
                </Texto>
                <Boton3D
                  titulo={`Encender por ${PRECIO_MUNDO_CHISPAS.toLocaleString("es")}`}
                  icono={<IconoChispa tam={18} />}
                  variante="logro"
                  brillo
                  deshabilitado={chispas < PRECIO_MUNDO_CHISPAS}
                  cargando={comprando}
                  onPress={() => desbloquear(elegido)}
                />
                {chispas < PRECIO_MUNDO_CHISPAS && (
                  <Texto v="nota" centro>
                    Te faltan {(PRECIO_MUNDO_CHISPAS - chispas).toLocaleString("es")} Chispas. ¡Juega unas partidas!
                  </Texto>
                )}
                <Boton3D titulo="Ver Prodigia Pro" variante="pro" tamano="sm" onPress={() => { setElegido(null); router.push("/pro"); }} />
              </>
            )}
          </>
        )}
      </Hoja>
      {recien && <Confeti cantidad={40} />}
    </View>
  );
}

const styles = StyleSheet.create({
  alineacion: { flexDirection: "row", alignItems: "center", gap: 10, padding: 10, borderRadius: 14, borderWidth: 1, borderColor: color.border, backgroundColor: color.surface1 },
  doble: { position: "absolute", top: 8, left: 8, paddingHorizontal: 9, paddingVertical: 4, borderRadius: 999, backgroundColor: color.logro },
  fila: { flexDirection: "row", alignItems: "center", gap: 8 },
  entre: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 999, borderWidth: 1, borderColor: color.border, backgroundColor: color.surface1 },
  precio: { flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: color.surface2, borderWidth: 1, borderColor: color.border, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5 },
});

export { default as ErrorBoundary } from "~/ui/PantallaError";
