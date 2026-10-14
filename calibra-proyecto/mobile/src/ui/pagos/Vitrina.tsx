import { LinearGradient } from "expo-linear-gradient";
import * as WebBrowser from "expo-web-browser";
import { useState, type ReactNode } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import Animated, { FadeInDown, ZoomIn } from "react-native-reanimated";
import { PRODUCTOS } from "@/lib/pagos/productos";
import type { ProductoComprable } from "@/lib/pagos/tipos";
import { ahorroAnual, bonoPorcentaje, MAS_ELEGIDO, mejorValor, PAQUETES_CHISPAS, PAQUETES_COMETAS, precioTexto } from "@/lib/pagos/vitrina";
import { COLOR_COMETA } from "@/lib/recompensas/iconoCometa";
import { vibrar } from "~/lib/efectos";
import { URL_WEB } from "~/lib/entorno";
import { IconoChispa, IconoCometa, IconoTrazo } from "~/ui/Iconos";
import Texto from "~/ui/Texto";
import { color, fuente } from "~/tema";

// Rediseño de pagos en la app (2026-10-14), igual que la web (components/pagos/Vitrina):
// tarjetas grandes, precio fuerte, checks y botones con sombra desplazada. La app todavía
// no cobra (llega con Google Play): los botones abren la compra en la web.

const NEGRO = "#05060F";
const ORO = "#FFC53D";

export function abrirCompraWeb(ruta: string) {
  vibrar.medio();
  WebBrowser.openBrowserAsync(`${URL_WEB}${ruta}`);
}

// Botón con sombra desplazada: al apretarlo «baja» y tapa su sombra.
export function BotonBrutal({ titulo, onPress, fondo = ORO, texto = NEGRO, icono }: { titulo: string; onPress: () => void; fondo?: string; texto?: string; icono?: ReactNode }) {
  const [abajo, setAbajo] = useState(false);
  return (
    <Pressable onPress={onPress} onPressIn={() => setAbajo(true)} onPressOut={() => setAbajo(false)} style={styles.botonCaja} accessibilityRole="button">
      <View style={styles.botonSombra} />
      <View style={[styles.boton, { backgroundColor: fondo }, abajo && { transform: [{ translateX: 4 }, { translateY: 4 }] }]}>
        {icono}
        <Texto style={{ fontFamily: fuente.display, fontSize: 16, color: texto }}>{titulo}</Texto>
      </View>
    </Pressable>
  );
}

function Sello({ texto, fondo }: { texto: string; fondo: string }) {
  return (
    <View style={[styles.sello, { backgroundColor: fondo }]}>
      <Texto style={{ fontFamily: fuente.cuerpoBold, fontSize: 10, letterSpacing: 1, color: NEGRO }}>{texto.toUpperCase()}</Texto>
    </View>
  );
}

// Montón de monedas que crece con el paquete (mismas posiciones que la web).
const MONTON: [number, number, number][][] = [
  [[50, 50, 60]],
  [[40, 56, 48], [66, 38, 36]],
  [[50, 58, 46], [24, 36, 32], [76, 32, 34]],
  [[48, 60, 44], [22, 38, 30], [74, 30, 32], [76, 74, 26]],
  [[50, 56, 42], [22, 34, 28], [76, 26, 30], [78, 72, 26], [24, 76, 24]],
];

export function IlustracionMoneda({ tipo, nivel, tam }: { tipo: "chispas" | "cometas"; nivel: number; tam: number }) {
  const puestos = MONTON[Math.min(MONTON.length - 1, Math.max(0, nivel))];
  return (
    <View style={{ width: tam, height: tam, alignSelf: "center" }}>
      <View style={{ position: "absolute", left: tam * 0.2, top: tam * 0.2, width: tam * 0.6, height: tam * 0.6, borderRadius: tam, boxShadow: `0px 0px ${tam * 0.35}px ${tipo === "cometas" ? COLOR_COMETA : ORO}` }} />
      {puestos.map(([x, y, s], i) => {
        const lado = (s / 100) * tam;
        return (
          <Animated.View key={i} entering={ZoomIn.delay(120 + i * 90).springify().damping(12)} style={{ position: "absolute", left: (x / 100) * tam - lado / 2, top: (y / 100) * tam - lado / 2 }}>
            {tipo === "cometas" ? <IconoCometa tam={lado} /> : <IconoChispa tam={lado} />}
          </Animated.View>
        );
      })}
    </View>
  );
}

// ---------- Paquetes de Cometas o Chispas ----------
export function PaquetesMoneda({ tipo, ancho }: { tipo: "cometas" | "chispas"; ancho: number }) {
  const lista = tipo === "cometas" ? PAQUETES_COMETAS : PAQUETES_CHISPAS;
  const mejor = mejorValor(lista);
  const acento = tipo === "cometas" ? COLOR_COMETA : ORO;
  const anchoTarjeta = (ancho - 12) / 2;
  return (
    <View style={styles.grilla}>
      {lista.map((p, i) => {
        const def = PRODUCTOS[p];
        const monto = def.montoCometas ?? def.montoChispas ?? 0;
        const bono = bonoPorcentaje(p);
        const destacado = MAS_ELEGIDO.has(p);
        const sello = destacado ? "Más elegido" : p === mejor ? "Mejor valor" : null;
        return (
          <Animated.View key={p} entering={FadeInDown.delay(i * 90).duration(380)} style={{ width: anchoTarjeta }}>
            <View style={[styles.tarjeta, { borderColor: destacado ? acento : "rgba(244,228,193,0.25)", boxShadow: destacado ? `5px 5px 0px ${acento}` : `4px 4px 0px ${NEGRO}` }, destacado && { backgroundColor: "#211A4A" }]}>
              {sello && <Sello texto={sello} fondo={acento} />}
              <IlustracionMoneda tipo={tipo} nivel={i} tam={anchoTarjeta * 0.62} />
              <View style={{ alignItems: "center" }}>
                <Texto style={{ fontFamily: fuente.display, fontSize: 24, color: color.texto }}>{monto.toLocaleString("es")}</Texto>
                <Texto v="micro" c={color.texto2}>
                  {tipo === "cometas" ? "Cometas" : "Chispas"}
                </Texto>
                <Texto v="mono" tam={12} c={acento} style={{ height: 18 }}>
                  {bono > 0 ? `+${bono} % extra` : ""}
                </Texto>
              </View>
              <BotonBrutal titulo={precioTexto(def.precioUsd)} fondo={acento} onPress={() => abrirCompraWeb("/tienda?puesto=mercado")} />
            </View>
          </Animated.View>
        );
      })}
    </View>
  );
}

// ---------- Planes de Pro ----------
export function PlanesPro() {
  const ahorro = ahorroAnual();
  const planes = [
    {
      producto: "pro_anual" as ProductoComprable,
      nombre: "Anual",
      periodo: "/año",
      nota: `Equivale a US$${ahorro.porMes.toFixed(2)} al mes.`,
      puntos: ["Todos los beneficios de Pro", `Ahorras US$${ahorro.usd.toFixed(2)} frente al mensual`, "3.600 Cometas en el año"],
      destacado: true,
    },
    {
      producto: "pro_mensual" as ProductoComprable,
      nombre: "Mensual",
      periodo: "/mes",
      nota: "Se renueva cada mes.",
      puntos: ["Todos los beneficios de Pro", "300 Cometas cada mes", "Pagas mes a mes"],
      destacado: false,
    },
  ];
  return (
    <View style={{ gap: 22 }}>
      {planes.map((p, i) => {
        const claro = !p.destacado;
        const tinta = claro ? "#1A1206" : color.texto;
        const contenido = (
          <>
            {p.destacado && <Sello texto={`Ahorras ${ahorro.porcentaje} %`} fondo={ORO} />}
            <View style={styles.planCabecera}>
              <Texto style={{ fontFamily: fuente.cuerpoBold, fontSize: 12, letterSpacing: 2.5, color: claro ? "#6C4CF1" : "#FFD36B" }}>{p.nombre.toUpperCase()}</Texto>
              <IconoTrazo nombre={p.destacado ? "corona" : "destello"} tam={22} c={claro ? "#6C4CF1" : ORO} />
            </View>
            <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 4 }}>
              <Texto style={{ fontFamily: fuente.display, fontSize: 40, lineHeight: 44, color: tinta }}>{precioTexto(PRODUCTOS[p.producto].precioUsd)}</Texto>
              <Texto style={{ fontFamily: fuente.cuerpoFuerte, fontSize: 14, color: claro ? "rgba(26,18,6,0.6)" : color.texto2, paddingBottom: 6 }}>{p.periodo}</Texto>
            </View>
            <Texto v="nota" tam={13} c={claro ? "rgba(26,18,6,0.7)" : color.texto2}>
              {p.nota}
            </Texto>
            <View style={{ gap: 9 }}>
              {p.puntos.map((x) => (
                <View key={x} style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                  <View style={[styles.check, { backgroundColor: claro ? "#6C4CF1" : ORO }]}>
                    <IconoTrazo nombre="check" tam={12} c={claro ? "#FFFFFF" : NEGRO} ancho={3.5} />
                  </View>
                  <Texto v="fuerte" tam={14} c={tinta} style={{ flex: 1 }}>
                    {x}
                  </Texto>
                </View>
              ))}
            </View>
            <BotonBrutal titulo={`Elegir ${p.nombre}`} fondo={claro ? "#6C4CF1" : ORO} texto={claro ? "#FFFFFF" : NEGRO} onPress={() => abrirCompraWeb("/pro")} />
          </>
        );
        return (
          <Animated.View key={p.producto} entering={FadeInDown.delay(150 + i * 140).duration(420)}>
            {p.destacado ? (
              <LinearGradient colors={["#3B2C8F", "#2A1F5C", "#12172A"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.plan, { boxShadow: `7px 7px 0px ${ORO}` }]}>
                {contenido}
              </LinearGradient>
            ) : (
              <View style={[styles.plan, { backgroundColor: "#F4E4C1", boxShadow: `7px 7px 0px ${NEGRO}` }]}>{contenido}</View>
            )}
          </Animated.View>
        );
      })}
      <Texto v="nota" tam={12} centro>
        El pago se hace en la web, con Paddle, y Pro se enciende en la web y en la app con la misma cuenta.
      </Texto>
    </View>
  );
}

const styles = StyleSheet.create({
  botonCaja: { paddingRight: 4, paddingBottom: 4 },
  botonSombra: { position: "absolute", left: 4, top: 4, right: 0, bottom: 0, borderRadius: 12, backgroundColor: NEGRO },
  boton: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 12, paddingHorizontal: 14, borderRadius: 12, borderWidth: 2, borderColor: NEGRO },
  sello: { position: "absolute", top: -12, right: 12, zIndex: 2, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, borderWidth: 2, borderColor: NEGRO, transform: [{ rotate: "4deg" }], boxShadow: `2px 2px 0px ${NEGRO}` },
  grilla: { flexDirection: "row", flexWrap: "wrap", gap: 12, rowGap: 18 },
  tarjeta: { gap: 8, padding: 12, paddingTop: 16, borderRadius: 18, borderWidth: 2, backgroundColor: "#12172A" },
  plan: { gap: 14, padding: 20, borderRadius: 24, borderWidth: 2, borderColor: NEGRO },
  planCabecera: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  check: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: NEGRO, alignItems: "center", justifyContent: "center" },
});
