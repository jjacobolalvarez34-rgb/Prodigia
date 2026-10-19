import { useEffect, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { useSharedValue } from "react-native-reanimated";
import { useRouter } from "expo-router";
import { CAPSULAS_CON_COMETAS, coloresCapsula, COLOR_RAREZA, NOMBRE_RAREZA, textoPremio, type Rareza } from "@/lib/recompensas/catalogo";
import { vibrar } from "~/lib/efectos";
import { fijarCometas } from "~/lib/jugador";
import { comprarPaqueteCapsulas, contenidoCapsula, mensajeError, paquetesCapsulas, recargarPendientes, type ContenidoCapsula, type PaqueteCapsulas as Paquete } from "~/lib/recompensas";
import { supabase } from "~/lib/supabase";
import { color } from "~/tema";
import { mostrarAviso } from "../Aviso";
import Boton3D from "../Boton3D";
import { IconoCometa } from "../Iconos";
import Capsula from "../recompensas/Capsula";
import Texto from "../Texto";

// Paquetes de cápsulas con Cometas (0291), igual que en la web: los fijos siempre y los
// de temporada mientras dura su evento. Precio y contenido los decide la base. Se ven
// las probabilidades antes de pagar; las cápsulas quedan en Recompensas › Por abrir.
const NOMBRE: Record<string, string> = {
  lote_estelar: "Lote Estelar",
  lote_supernova: "Lote Supernova",
  halloween_x1: "Cápsula de Halloween",
  halloween_x5: "Lote de Halloween",
};
const PRECIO_SUELTA: Record<string, number> = Object.fromEntries(CAPSULAS_CON_COMETAS.map((c) => [c.tipo, c.costo]));
const MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
const fecha = (iso: string) => `${Number(iso.slice(8, 10))} de ${MESES[Number(iso.slice(5, 7)) - 1]}`;

function Pila({ colores, n }: { colores: [string, string]; n: number }) {
  const abierta = useSharedValue(0);
  const visibles = Math.min(3, n);
  return (
    <View style={styles.pila}>
      {Array.from({ length: visibles }, (_, i) => {
        const d = i - (visibles - 1) / 2;
        return (
          <View key={i} style={{ position: "absolute", bottom: 0, transform: [{ translateX: d * 18 }, { rotate: `${d * 8}deg` }], zIndex: i === Math.floor(visibles / 2) ? 3 : 1 }}>
            <Capsula abierta={abierta} colores={colores} tam={visibles > 1 ? 56 : 70} />
          </View>
        );
      })}
      {n > 1 && (
        <View style={styles.cuantas}>
          <Texto v="mono" tam={11} c="#05060F">
            ×{n}
          </Texto>
        </View>
      )}
    </View>
  );
}

function Tarjeta({ p, unidad, contenido, ocupado, onComprar }: { p: Paquete; unidad: number | null; contenido: ContenidoCapsula[]; ocupado: boolean; onComprar: () => void }) {
  const [verContenido, setVerContenido] = useState(false);
  const [confirmar, setConfirmar] = useState(false);
  const colores = coloresCapsula(p.tipo, p.tema);
  const ahorro = unidad != null && p.cantidad > 1 ? unidad * p.cantidad - p.cometas : 0;
  const total = contenido.reduce((a, f) => a + f.peso, 0);
  return (
    <View style={[styles.tarjeta, p.tema ? { borderColor: `${colores[0]}88`, backgroundColor: "#1A1424" } : null]}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
        <Pila colores={colores} n={p.cantidad} />
        <View style={{ flex: 1, gap: 3 }}>
          {p.tema && (
            <View style={[styles.etiqueta, { backgroundColor: colores[0] }]}>
              <Texto v="micro" c="#05060F">
                SOLO DURANTE EL EVENTO
              </Texto>
            </View>
          )}
          <Texto v="h3">{NOMBRE[p.slug] ?? p.slug}</Texto>
          <Texto v="nota" tam={12}>
            {p.cantidad === 1 ? "1 cápsula" : `${p.cantidad} cápsulas`}
            {p.hasta ? ` · hasta el ${fecha(p.hasta)}` : ""}
          </Texto>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
              <IconoCometa tam={16} />
              <Texto v="mono" tam={15}>
                {p.cometas}
              </Texto>
            </View>
            {ahorro > 0 && (
              <View style={styles.ahorro}>
                <Texto v="mono" tam={11} c={color.correcto}>
                  Ahorras {ahorro}
                </Texto>
              </View>
            )}
          </View>
        </View>
      </View>
      <Pressable onPress={() => setVerContenido((v) => !v)} hitSlop={8} accessibilityRole="button">
        <Texto v="nota" tam={12} c={color.texto2}>
          {verContenido ? "Ocultar" : "¿Qué puede salir?"}
        </Texto>
      </Pressable>
      {verContenido && (
        <View style={styles.contenido}>
          {contenido.map((f) => {
            const rareza = f.premio.startsWith("cosmetico_") ? (f.premio.slice(10) as Rareza) : null;
            return (
              <View key={f.premio} style={styles.fila}>
                <Texto v="nota" tam={12} c={rareza ? COLOR_RAREZA[rareza] : colores[0]} style={{ flex: 1 }}>
                  {rareza ? NOMBRE_RAREZA[rareza] : textoPremio(f.premio, f.minimo, f.maximo)}
                </Texto>
                <Texto v="mono" tam={12} c={color.texto2}>
                  {total ? Math.round((f.peso / total) * 100) : 0} %
                </Texto>
              </View>
            );
          })}
        </View>
      )}
      {confirmar ? (
        <View style={{ flexDirection: "row", gap: 8 }}>
          <Boton3D titulo={`Confirmar por ${p.cometas}`} tamano="sm" cargando={ocupado} onPress={onComprar} estilo={{ flex: 1 }} />
          <Boton3D titulo="Cancelar" variante="secundario" tamano="sm" deshabilitado={ocupado} onPress={() => setConfirmar(false)} estilo={{ flex: 1 }} />
        </View>
      ) : (
        <Boton3D titulo="Comprar" variante="secundario" tamano="sm" onPress={() => setConfirmar(true)} />
      )}
    </View>
  );
}

export default function PaquetesCapsulas() {
  const [paquetes, setPaquetes] = useState<Paquete[]>([]);
  const [contenido, setContenido] = useState<Record<string, ContenidoCapsula[]>>({});
  const [ocupado, setOcupado] = useState<string | null>(null);
  const [listo, setListo] = useState<number | null>(null);
  const router = useRouter();

  useEffect(() => {
    paquetesCapsulas(supabase).then(async (ps) => {
      setPaquetes(ps);
      const tipos = [...new Set(ps.map((p) => p.tipo))];
      const filas = await Promise.all(tipos.map(async (tipo) => [tipo, await contenidoCapsula(supabase, tipo)] as const));
      setContenido(Object.fromEntries(filas));
    });
  }, []);

  if (paquetes.length === 0) return null;

  async function comprar(p: Paquete) {
    vibrar.medio();
    setOcupado(p.slug);
    setListo(null);
    try {
      const r = await comprarPaqueteCapsulas(supabase, p.slug);
      fijarCometas(r.cometas);
      recargarPendientes();
      setListo(r.cantidad);
    } catch (e) {
      mostrarAviso(mensajeError(e), "error");
    } finally {
      setOcupado(null);
    }
  }

  const unidad = (p: Paquete) => PRECIO_SUELTA[p.tipo] ?? paquetes.find((x) => x.tipo === p.tipo && x.tema === p.tema && x.cantidad === 1)?.cometas ?? null;

  return (
    <View style={{ gap: 10 }}>
      <View style={{ gap: 2 }}>
        <Texto v="micro" c="#5DE4FF">
          Paquetes · con Cometas
        </Texto>
        <Texto v="h2">Paquetes de cápsulas</Texto>
        <Texto v="nota" tam={12.5}>
          Más cápsulas por menos Cometas. Quedan en tus Recompensas para abrirlas cuando quieras, una por una.
        </Texto>
      </View>
      {paquetes.map((p) => (
        <Tarjeta key={p.slug} p={p} unidad={unidad(p)} contenido={contenido[p.tipo] ?? []} ocupado={ocupado === p.slug} onComprar={() => comprar(p)} />
      ))}
      {listo != null && (
        <View style={{ gap: 8 }}>
          <Texto v="fuerte" c={color.correcto} centro>
            ¡Listo! {listo === 1 ? "Tu cápsula está" : `Tus ${listo} cápsulas están`} en Recompensas.
          </Texto>
          <Boton3D titulo="Ir a abrirlas" variante="secundario" tamano="sm" onPress={() => router.push("/recompensas")} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  tarjeta: { gap: 10, padding: 14, borderRadius: 18, borderWidth: 1, borderColor: "rgba(255,255,255,0.12)", backgroundColor: "#12172A" },
  pila: { width: 100, height: 78, alignItems: "center", justifyContent: "flex-end" },
  cuantas: { position: "absolute", top: -2, right: -2, zIndex: 10, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8, borderWidth: 2, borderColor: "#05060F", backgroundColor: "#fff" },
  etiqueta: { alignSelf: "flex-start", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  ahorro: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, backgroundColor: "rgba(61,220,151,0.15)" },
  contenido: { gap: 3, padding: 10, borderRadius: 12, backgroundColor: "rgba(0,0,0,0.25)" },
  fila: { flexDirection: "row", justifyContent: "space-between", gap: 8 },
});
