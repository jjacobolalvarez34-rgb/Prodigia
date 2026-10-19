import { useEffect, useState } from "react";
import { Modal, Pressable, StyleSheet, View } from "react-native";
import Animated, { Easing, FadeIn, FadeInDown, useAnimatedStyle, useSharedValue, withDelay, withSequence, withTiming, ZoomIn } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { CAPSULAS, coloresCapsula, type TipoCapsula } from "@/lib/recompensas/catalogo";
import type { Capsula as DatosCapsula } from "@/lib/recompensas/api";
import { agruparCapsulas, COLOR_RANGO, FUSION, fusionarCapsulas, fusionesPosibles, mensajeErrorFusion, NOMBRE_RANGO, rangoCapsula, type FusionPosible } from "@/lib/recompensas/fusion";
import { sonar, vibrar } from "~/lib/efectos";
import { fijarChispas } from "~/lib/jugador";
import { supabase } from "~/lib/supabase";
import { mostrarAviso } from "../Aviso";
import Boton3D from "../Boton3D";
import Texto from "../Texto";
import { color, conAlfa, fuente } from "~/tema";
import Capsula from "./Capsula";

// Cápsulas por abrir (rehecho 2026-10-18, «mejora el apartado de las cápsulas», igual
// que la web): juntas por tipo con su contador, el rango de cada una y, arriba, las
// fusiones que se pueden hacer ahora (0290). Un solo dibujo animado por tipo.

function CapsulaQuieta({ tipo, mundo, tam }: { tipo: TipoCapsula; mundo: string | null; tam: number }) {
  const abierta = useSharedValue(0);
  return <Capsula abierta={abierta} colores={coloresCapsula(tipo, mundo)} tam={tam} />;
}

// Las 3 cápsulas se juntan girando, destello del color del rango y sale la nueva.
function Fusion({ de, nueva, onGuardar, onAbrir }: { de: TipoCapsula[]; nueva: TipoCapsula; onGuardar: () => void; onAbrir: () => void }) {
  const junta = useSharedValue(0);
  const luz = useSharedValue(0);
  const tinta = COLOR_RANGO[rangoCapsula(nueva)];
  useEffect(() => {
    junta.set(withTiming(1, { duration: 750, easing: Easing.bezier(0.6, 0, 0.4, 1) }));
    luz.set(withDelay(700, withSequence(withTiming(1, { duration: 160 }), withTiming(0.35, { duration: 700 }))));
    const t = setTimeout(() => {
      sonar("logro");
      vibrar.exito();
    }, 720);
    return () => clearTimeout(t);
  }, [junta, luz]);
  const estiloLuz = useAnimatedStyle(() => ({ opacity: luz.value, transform: [{ scale: 0.4 + luz.value * 1.2 }] }));
  return (
    <View style={styles.velo}>
      <View style={styles.escena}>
        {de.map((tipo, i) => (
          <Pieza key={i} i={i} tipo={tipo} junta={junta} />
        ))}
        <Animated.View style={[styles.luz, { backgroundColor: conAlfa(tinta, 0.55), boxShadow: `0px 0px 80px ${tinta}` }, estiloLuz]} />
        <Animated.View entering={ZoomIn.delay(800).springify().damping(9)}>
          <CapsulaQuieta tipo={nueva} mundo={null} tam={120} />
        </Animated.View>
      </View>
      <Animated.View entering={FadeInDown.delay(1100).duration(320)} style={{ alignItems: "center", gap: 4 }}>
        <Texto style={{ fontFamily: fuente.cuerpoBold, fontSize: 11, letterSpacing: 2.2, color: tinta }}>{NOMBRE_RANGO[rangoCapsula(nueva)].toUpperCase()}</Texto>
        <Texto v="h1" centro>
          ¡Nueva {CAPSULAS[nueva].nombre.replace("Cápsula ", "cápsula ")}!
        </Texto>
      </Animated.View>
      <Animated.View entering={FadeIn.delay(1300)} style={{ flexDirection: "row", gap: 10, alignSelf: "stretch" }}>
        <View style={{ flex: 1 }}>
          <Boton3D titulo="Guardar" variante="secundario" onPress={onGuardar} />
        </View>
        <View style={{ flex: 1 }}>
          <Boton3D titulo="Abrir ahora" variante="logro" onPress={onAbrir} />
        </View>
      </Animated.View>
    </View>
  );
}

function Pieza({ i, tipo, junta }: { i: number; tipo: TipoCapsula; junta: { value: number } }) {
  const estilo = useAnimatedStyle(() => {
    const v = junta.value;
    return { opacity: 1 - v, transform: [{ translateX: (i - 1) * 100 * (1 - v) }, { translateY: (i === 1 ? -18 : 8) * (1 - v) }, { rotate: `${(i - 1) * 40 * v}deg` }, { scale: 1 - v * 0.6 }] };
  });
  return (
    <Animated.View style={[styles.pieza, estilo]}>
      <CapsulaQuieta tipo={tipo} mundo={null} tam={54} />
    </Animated.View>
  );
}

export default function CapsulasPorAbrir({ capsulas, detalle, onAbrir, onVer, onCambio }: { capsulas: DatosCapsula[]; detalle: (c: DatosCapsula) => string; onAbrir: (c: DatosCapsula) => void; onVer: (c: DatosCapsula) => void; onCambio: () => void }) {
  const [confirmando, setConfirmando] = useState<number | null>(null);
  const [ocupado, setOcupado] = useState(false);
  const [verComo, setVerComo] = useState(false);
  const [fusionada, setFusionada] = useState<{ capsula: DatosCapsula; de: TipoCapsula[] } | null>(null);
  const grupos = agruparCapsulas(capsulas);
  const fusiones = fusionesPosibles(capsulas);

  async function fusionar(f: FusionPosible) {
    vibrar.medio();
    setOcupado(true);
    try {
      const de = f.ids.map((id) => capsulas.find((c) => c.id === id)?.tipo ?? "diaria");
      const r = await fusionarCapsulas(supabase, f.ids);
      fijarChispas(r.puntos_total);
      setConfirmando(null);
      setFusionada({ capsula: { id: r.id, tipo: r.tipo, mundo: null, detalle: null, creada_at: new Date().toISOString() }, de });
      onCambio();
    } catch (e) {
      mostrarAviso(mensajeErrorFusion(e), "error");
    } finally {
      setOcupado(false);
    }
  }

  return (
    <View style={{ gap: 12 }}>
      <View style={styles.entre}>
        <Texto v="h2">Cápsulas por abrir</Texto>
        <Texto v="mono" tam={12} c={color.texto2}>
          {capsulas.length} por abrir
        </Texto>
      </View>

      {fusiones.map((f) => {
        const tinta = COLOR_RANGO[rangoCapsula(f.destino)];
        const nivel = NOMBRE_RANGO[rangoCapsula(capsulas.find((c) => c.id === f.ids[0])?.tipo ?? "diaria")];
        return (
          <Animated.View key={f.nivel} entering={FadeInDown.duration(280)} style={[styles.fusion, { borderColor: conAlfa(tinta, 0.6), boxShadow: `0px 10px 28px ${conAlfa(tinta, 0.25)}` }]}>
            <LinearGradient colors={["transparent", conAlfa(tinta, 0.16)]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={StyleSheet.absoluteFill} />
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                {f.ids.map((id, i) => {
                  const c = capsulas.find((x) => x.id === id);
                  return (
                    <View key={id} style={{ marginLeft: i === 0 ? 0 : -14, zIndex: 3 - i }}>
                      <CapsulaQuieta tipo={c?.tipo ?? "diaria"} mundo={c?.mundo ?? null} tam={30} />
                    </View>
                  );
                })}
                <Texto style={{ marginHorizontal: 6, color: tinta, fontFamily: fuente.display, fontSize: 18 }}>→</Texto>
                <CapsulaQuieta tipo={f.destino} mundo={null} tam={40} />
              </View>
              <View style={{ flex: 1 }}>
                <Texto v="fuerte" tam={14}>
                  3 de {nivel} → {CAPSULAS[f.destino].nombre}
                </Texto>
                <Pressable onPress={() => setVerComo((v) => !v)} hitSlop={6}>
                  <Texto v="nota" tam={12}>
                    Tienes {f.cuantas} · <Texto tam={12} c={color.primarioClaro}>¿Cómo funciona?</Texto>
                  </Texto>
                </Pressable>
              </View>
            </View>
            {confirmando === f.nivel ? (
              <View style={{ flexDirection: "row", gap: 8 }}>
                <View style={{ flex: 1 }}>
                  <Boton3D titulo="Cancelar" variante="secundario" tamano="sm" deshabilitado={ocupado} onPress={() => setConfirmando(null)} />
                </View>
                <View style={{ flex: 1.4 }}>
                  <Boton3D titulo={`Confirmar · ${f.costo} Chispas`} variante="logro" tamano="sm" cargando={ocupado} onPress={() => fusionar(f)} />
                </View>
              </View>
            ) : (
              <Boton3D titulo={`Fusionar · ${FUSION[f.nivel].costo} Chispas`} variante="secundario" tamano="sm" onPress={() => setConfirmando(f.nivel)} />
            )}
          </Animated.View>
        );
      })}
      {verComo && (
        <Texto v="nota" tam={12}>
          Junta 3 cápsulas del mismo nivel y paga unas Chispas para convertirlas en una del nivel siguiente: Bronce → Plata (50), Plata → Oro (150), Oro → Prisma (400). Las especiales (ciudad, colección, Pro, de Cometas y de la Alineación) no se fusionan.
        </Texto>
      )}

      <View style={styles.grilla}>
        {grupos.map((g, i) => {
          const primera = g.capsulas[0];
          const rango = rangoCapsula(g.tipo);
          const tinta = COLOR_RANGO[rango];
          const colores = coloresCapsula(g.tipo, g.mundo);
          return (
            <Animated.View key={g.clave} entering={FadeInDown.delay(i * 45).duration(260)} style={styles.celda}>
              <Pressable
                onPress={() => {
                  vibrar.medio();
                  onAbrir(primera);
                }}
                style={({ pressed }) => [styles.tarjeta, { borderColor: conAlfa(colores[0], 0.55) }, pressed && { transform: [{ scale: 0.96 }] }]}
              >
                <LinearGradient colors={[conAlfa(colores[0], 0.22), "transparent"]} style={styles.brilloArriba} />
                <View style={styles.filaChips}>
                  <View style={[styles.chip, { borderColor: conAlfa(tinta, 0.5), backgroundColor: conAlfa(tinta, 0.12) }]}>
                    <Texto style={{ fontFamily: fuente.cuerpoBold, fontSize: 8.5, letterSpacing: 1.2, color: tinta }}>{NOMBRE_RANGO[rango].toUpperCase()}</Texto>
                  </View>
                  {g.capsulas.length > 1 && (
                    <View style={styles.contador}>
                      <Texto style={{ fontFamily: fuente.display, fontSize: 12, color: "#05060F" }}>×{g.capsulas.length}</Texto>
                    </View>
                  )}
                </View>
                <CapsulaQuieta tipo={g.tipo} mundo={g.mundo} tam={52} />
                <Texto v="fuerte" tam={12} centro numberOfLines={2}>
                  {CAPSULAS[g.tipo]?.nombre ?? "Cápsula"}
                </Texto>
                <Texto v="nota" tam={10.5} centro numberOfLines={1}>
                  {detalle(primera)}
                </Texto>
                <View style={[styles.abrir, { backgroundColor: colores[1] }]}>
                  <Texto style={{ fontFamily: fuente.display, fontSize: 13, color: "#05060F" }}>Abrir</Texto>
                </View>
              </Pressable>
              <Pressable onPress={() => onVer(primera)} hitSlop={8}>
                <Texto v="nota" tam={11} c={color.primarioClaro} centro>
                  ¿Qué puede salir?
                </Texto>
              </Pressable>
            </Animated.View>
          );
        })}
      </View>

      <Modal visible={!!fusionada} transparent animationType="fade" statusBarTranslucent onRequestClose={() => setFusionada(null)}>
        {fusionada && (
          <Fusion
            de={fusionada.de}
            nueva={fusionada.capsula.tipo}
            onGuardar={() => setFusionada(null)}
            onAbrir={() => {
              const c = fusionada.capsula;
              setFusionada(null);
              onAbrir(c);
            }}
          />
        )}
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  entre: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" },
  fusion: { gap: 12, padding: 14, borderRadius: 20, borderWidth: 1.5, backgroundColor: "#0B1022", overflow: "hidden" },
  grilla: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  celda: { width: "31.5%", gap: 4 },
  tarjeta: { alignItems: "center", gap: 3, paddingTop: 8, paddingBottom: 8, paddingHorizontal: 6, borderRadius: 18, borderWidth: 1.5, backgroundColor: color.surface1, overflow: "hidden" },
  brilloArriba: { position: "absolute", left: 0, right: 0, top: 0, height: 70 },
  filaChips: { flexDirection: "row", justifyContent: "space-between", alignSelf: "stretch", alignItems: "center", minHeight: 18 },
  chip: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 999, borderWidth: 1 },
  contador: { paddingHorizontal: 6, paddingVertical: 1, borderRadius: 999, backgroundColor: "#FFFFFF", boxShadow: "2px 2px 0px #05060F" },
  abrir: { marginTop: 4, alignSelf: "stretch", alignItems: "center", paddingVertical: 5, borderRadius: 10, borderWidth: 1.5, borderColor: "#05060F", boxShadow: "2px 2px 0px #05060F" },
  velo: { flex: 1, backgroundColor: "rgba(5,6,15,0.9)", alignItems: "center", justifyContent: "center", gap: 18, padding: 28 },
  escena: { width: "100%", height: 200, alignItems: "center", justifyContent: "center" },
  pieza: { position: "absolute" },
  luz: { position: "absolute", width: 150, height: 150, borderRadius: 75 },
});
