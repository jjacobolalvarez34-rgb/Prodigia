import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { StyleSheet, useWindowDimensions, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { COLOR_RAREZA, NOMBRE_RAREZA } from "@/lib/recompensas/catalogo";
import { PARTICULAS } from "@/lib/temas/dibujos";
import { CHISPAS_POR_FICHA, EXP_POR_FICHA, FICHAS_MAX_DIA } from "@/lib/temas/colecciones";
import { canjearPieza, cerrarFichas, estadoEvento, eventoDeTema, faltaHasta, mensajeErrorEvento, type EstadoEvento } from "@/lib/temas/eventos";
import { sonar, vibrar } from "~/lib/efectos";
import { fijarChispas, fijarCometas, useJugador } from "~/lib/jugador";
import { recargarCosmeticos } from "~/lib/recompensas";
import { useSesion } from "~/lib/sesion";
import { supabase } from "~/lib/supabase";
import { useTemaHoy } from "~/lib/temporada";
import { mostrarAviso } from "~/ui/Aviso";
import Boton3D from "~/ui/Boton3D";
import { IconoCometa } from "~/ui/Iconos";
import { PantallaApilada } from "~/ui/Pantalla";
import VistaCosmetico from "~/ui/recompensas/VistaCosmetico";
import DibujoTema from "~/ui/temas/DibujoTema";
import EscenaTema from "~/ui/temas/EscenaTema";
import Texto from "~/ui/Texto";
import { color, fuente } from "~/tema";

// Pantalla del evento de la festividad (igual que /evento en la web, 0289): Fichas y
// cómo se ganan, la colección para elegir qué llevarse (Fichas o Cometas) y el cierre.
export default function Evento() {
  const tema = useTemaHoy();
  const evento = eventoDeTema(tema);
  const { width } = useWindowDimensions();
  const { sesion } = useSesion();
  const { esInvitado } = useJugador();
  const [estado, setEstado] = useState<EstadoEvento | null>(null);
  const [ocupado, setOcupado] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    if (!evento || esInvitado) return;
    setEstado(await estadoEvento(supabase, evento.slug));
  }, [evento?.slug, esInvitado]); // eslint-disable-line react-hooks/exhaustive-deps

  useFocusEffect(
    useCallback(() => {
      void cargar();
    }, [cargar])
  );

  if (!tema || !evento) {
    return (
      <PantallaApilada titulo="Evento">
        <Texto v="nota" centro>
          Ahora no hay ninguna festividad con evento en curso.
        </Texto>
      </PantallaApilada>
    );
  }
  const ficha = PARTICULAS[evento.coleccion.ficha.dibujo];
  const abierto = evento.estado === "abierto";
  const anchoPieza = (width - 32 - 12) / 2;

  async function canjear(item: string, conCometas: boolean) {
    if (!evento) return;
    vibrar.medio();
    setOcupado(item + conCometas);
    try {
      const r = await canjearPieza(supabase, evento.slug, item, conCometas);
      fijarCometas(r.cometas);
      if (sesion) void recargarCosmeticos(sesion.user.id);
      sonar("logro");
      vibrar.exito();
      mostrarAviso("¡Es tuya! Póntela desde tu Placa.", "logro");
      await cargar();
    } catch (e) {
      mostrarAviso(mensajeErrorEvento(e), "error");
    } finally {
      setOcupado(null);
    }
  }

  async function cerrar() {
    if (!evento) return;
    setOcupado("cerrar");
    try {
      const r = await cerrarFichas(supabase, evento.slug);
      fijarChispas(r.puntos_total);
      sonar("recompensa");
      await cargar();
    } catch (e) {
      mostrarAviso(mensajeErrorEvento(e), "error");
    } finally {
      setOcupado(null);
    }
  }

  return (
    <PantallaApilada titulo={tema.tema.nombre}>
      {/* Portada */}
      <View style={styles.portada}>
        <EscenaTema tema={tema.tema} ancho={width - 32} />
        <LinearGradient colors={["transparent", "rgba(5,6,15,0.92)"]} style={StyleSheet.absoluteFill} />
        <View style={{ gap: 4, padding: 18 }}>
          <Texto style={{ fontFamily: fuente.cuerpoBold, fontSize: 11, letterSpacing: 2.4, color: tema.tema.acento }}>{evento.estado === "proximo" ? "SE ACERCA" : "EVENTO"}</Texto>
          <Texto style={{ fontFamily: fuente.display, fontSize: 30, color: color.texto }}>{tema.tema.nombre}</Texto>
          <Texto v="nota">{tema.tema.frase.evento}</Texto>
          <View style={styles.reloj}>
            <Texto v="mono" tam={12}>
              {evento.estado === "proximo"
                ? `Empieza en ${faltaHasta(new Date(Date.parse(`${evento.desde}T00:00:00Z`) - 1).toISOString().slice(0, 10))}`
                : evento.estado === "abierto"
                  ? `Termina en ${faltaHasta(evento.hasta)}`
                  : "Terminó: cambia tus fichas"}
            </Texto>
          </View>
        </View>
      </View>

      {esInvitado ? (
        <Texto v="nota" centro>
          Crea tu cuenta para ganar fichas y llevarte piezas de la colección.
        </Texto>
      ) : (
        <>
          {/* Fichas */}
          <View style={styles.fichas}>
            <View style={[styles.iconoFicha, { backgroundColor: `${tema.tema.acento}22` }]}>
              <DibujoTema dibujo={ficha} ancho={42} />
            </View>
            <View style={{ flex: 1 }}>
              <Texto style={{ fontFamily: fuente.cuerpoBold, fontSize: 11, letterSpacing: 1.6, color: tema.tema.acento }}>TUS {evento.coleccion.ficha.nombre.toUpperCase()}</Texto>
              <Texto style={{ fontFamily: fuente.display, fontSize: 34, color: color.texto }}>{estado ? estado.saldo : "…"}</Texto>
              <Texto v="nota" tam={12}>
                Se ganan jugando en cualquier mundo: 1 cada {EXP_POR_FICHA} de Exp, hasta {FICHAS_MAX_DIA} por día.
              </Texto>
            </View>
          </View>
          {evento.estado === "cierre" && estado && !estado.cerrado && estado.saldo > 0 && (
            <Boton3D titulo={`Cambiar por ${(estado.saldo * CHISPAS_POR_FICHA).toLocaleString("es")} Chispas`} variante="logro" cargando={ocupado === "cerrar"} onPress={cerrar} />
          )}
          {estado?.cerrado && (
            <Texto v="fuerte" c={color.correcto} centro>
              Cambiaste tus fichas por {estado.chispas_cierre.toLocaleString("es")} Chispas.
            </Texto>
          )}

          {/* Colección */}
          <View style={styles.entre}>
            <Texto v="h2">La colección</Texto>
            <Texto v="nota">
              {estado?.piezas.length ?? 0}/{evento.coleccion.piezas.length}
            </Texto>
          </View>
          <View style={styles.grilla}>
            {evento.coleccion.piezas.map((p, i) => {
              const tuya = estado?.piezas.includes(p.item);
              const alcanza = (estado?.saldo ?? 0) >= p.fichas;
              return (
                <Animated.View key={p.item} entering={FadeInDown.delay(i * 60).duration(320)} style={[styles.pieza, { width: anchoPieza, borderColor: tuya ? color.correcto : `${COLOR_RAREZA[p.rareza]}88` }]}>
                  <View style={{ height: 76, justifyContent: "center" }}>
                    <VistaCosmetico categoria={p.categoria} valor={p.valor} tam={60} />
                  </View>
                  <Texto style={{ fontFamily: fuente.cuerpoBold, fontSize: 10, letterSpacing: 1.2, color: COLOR_RAREZA[p.rareza] }}>{NOMBRE_RAREZA[p.rareza].toUpperCase()}</Texto>
                  <Texto v="fuerte" tam={13} centro numberOfLines={2} style={{ minHeight: 34 }}>
                    {p.nombre}
                  </Texto>
                  {tuya ? (
                    <Texto v="fuerte" c={color.correcto}>
                      ¡Es tuya!
                    </Texto>
                  ) : (
                    <View style={{ alignSelf: "stretch", gap: 6 }}>
                      <Boton3D
                        titulo={String(p.fichas)}
                        icono={<DibujoTema dibujo={ficha} ancho={16} />}
                        tamano="sm"
                        acento={tema.tema.acento}
                        deshabilitado={!abierto || !alcanza || ocupado !== null}
                        cargando={ocupado === p.item + false}
                        onPress={() => canjear(p.item, false)}
                      />
                      <Boton3D
                        titulo={String(p.cometas)}
                        icono={<IconoCometa tam={14} />}
                        variante="secundario"
                        tamano="sm"
                        deshabilitado={evento.estado === "proximo" || ocupado !== null}
                        cargando={ocupado === p.item + true}
                        onPress={() => canjear(p.item, true)}
                      />
                    </View>
                  )}
                </Animated.View>
              );
            })}
          </View>
          <Texto v="nota" tam={12}>
            Elige las piezas que quieras con tus {evento.coleccion.ficha.nombre} o con Cometas. Las que sobren al terminar se cambian por {CHISPAS_POR_FICHA} Chispas cada una. La colección vuelve el año que viene.
          </Texto>
        </>
      )}
    </PantallaApilada>
  );
}

const styles = StyleSheet.create({
  portada: { minHeight: 210, borderRadius: 24, overflow: "hidden", borderWidth: 2, borderColor: "#05060F", justifyContent: "flex-end", boxShadow: "5px 5px 0px #05060F" },
  reloj: { alignSelf: "flex-start", marginTop: 6, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, backgroundColor: "rgba(255,255,255,0.1)" },
  fichas: { flexDirection: "row", alignItems: "center", gap: 14, padding: 16, borderRadius: 20, borderWidth: 2, borderColor: "#05060F", backgroundColor: "#0B1022", boxShadow: "4px 4px 0px #05060F" },
  iconoFicha: { width: 62, height: 62, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  entre: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" },
  grilla: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  pieza: { alignItems: "center", gap: 6, padding: 12, borderRadius: 18, borderWidth: 2, backgroundColor: color.surface1 },
});
