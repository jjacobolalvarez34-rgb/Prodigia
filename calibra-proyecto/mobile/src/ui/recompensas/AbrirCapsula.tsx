import { useRef, useState } from "react";
import { StyleSheet, View } from "react-native";
import { CAPSULAS, CATALOGO_NUEVO, ciudadDe, COLOR_RAREZA, coloresCapsula, NOMBRE_RAREZA, type Rareza } from "@/lib/recompensas/catalogo";
import { sonar } from "~/lib/efectos";
import { fijarChispas, recargarJugador } from "~/lib/jugador";
import type { PremioGuardado } from "@/lib/recompensas/capsulasSinVer";
import { marcarAbriendo, marcarVista } from "~/lib/capsulasSinVer";
import { abrirCapsula, recargarCosmeticos, recargarPendientes, type Capsula as DatosCapsula } from "~/lib/recompensas";
import { supabase } from "~/lib/supabase";
import { color, conAlfa, fuente } from "~/tema";
import Revelacion, { type PremioRevelado } from "../fx/Revelacion";
import { IconoChispa, IconoCopo, IconoEscudo, IconoReloj } from "../Iconos";
import NumeroAnimado from "../NumeroAnimado";
import Texto from "../Texto";
import VistaCosmetico from "./VistaCosmetico";

// Abrir una cápsula: la escena (caída, suspenso, estallido) es fx/Revelacion; acá
// solo se pide el premio a la base (abrir_capsula, 0249) y se arma cómo se ve.
// Cuanto más raro el premio, más dura el suspenso y más grande la explosión.
//
// 2026-10-23: el premio se pide al tocarla y, justo antes, la cápsula se anota en el
// teléfono (~/lib/capsulasSinVer); se borra al ver el premio. Si el jugador se va en
// medio, al volver a Recompensas se le muestra lo que le salió (`guardado`: la misma
// escena, sin pedir nada a la base).

function itemDe(slug: string | null) {
  return slug ? CATALOGO_NUEVO.find((x) => x.item === slug) ?? null : null;
}

function Premio({ p }: { p: PremioGuardado }) {
  if (p.premio === "chispas" || p.convertido) {
    return (
      <View style={{ alignItems: "center", gap: 6 }}>
        {p.convertido && (
          <Texto v="nota" centro>
            Ya tenías {p.nombre}: se convirtió en Chispas.
          </Texto>
        )}
        <View style={styles.bonus}>
          <IconoChispa tam={28} />
          <NumeroAnimado valor={p.cantidad} desde={0} prefijo="+" v="mono" c={color.logro} duracion={1000} estilo={{ fontSize: 32 }} onTic={() => sonar("moneda")} />
        </View>
      </View>
    );
  }
  if (p.premio === "hielo" || p.premio === "tiempo_extra" || p.premio === "escudo") {
    const nombre = p.premio === "hielo" ? "1 hielo" : p.premio === "escudo" ? "1 escudo" : "+3 segundos";
    return (
      <View style={{ alignItems: "center", gap: 8 }}>
        <View style={styles.icono}>{p.premio === "hielo" ? <IconoCopo tam={46} c="#BDEBFF" /> : p.premio === "escudo" ? <IconoEscudo tam={48} /> : <IconoReloj tam={46} c={color.logro} />}</View>
        <Texto v="h2" centro>
          {nombre}
        </Texto>
      </View>
    );
  }
  const it = itemDe(p.slug);
  const rareza = (p.rareza ?? "raro") as Rareza;
  // Un tema de la app (0297) llega con slug tema_<tema>.
  const esTema = p.premio === "tema_app" || !!p.slug?.startsWith("tema_");
  const categoria = it?.categoria ?? (esTema ? "tema" : p.slug?.startsWith("marco_") ? "marco" : "titulo");
  const valor = it?.valor ?? (esTema ? p.slug?.replace(/^tema_/, "") : p.slug?.replace(/^marco_/, "")) ?? "";
  return (
    <View style={{ alignItems: "center", gap: 8 }}>
      <View style={[styles.icono, { borderColor: COLOR_RAREZA[rareza], boxShadow: `0px 0px 24px ${conAlfa(COLOR_RAREZA[rareza], 0.6)}` }]}>
        <VistaCosmetico categoria={categoria} valor={valor} tam={64} />
      </View>
      <Texto style={{ fontFamily: fuente.cuerpoBold, fontSize: 11, letterSpacing: 1.2, color: COLOR_RAREZA[rareza] }}>{NOMBRE_RAREZA[rareza].toUpperCase()}</Texto>
      <Texto v="h2" centro>
        {p.nombre}
      </Texto>
      <Texto v="nota" centro>
        {esTema ? "Ya es tuyo. Póntelo en el Bazar › Temas." : "Ya es tuyo. Póntelo desde la tienda."}
      </Texto>
    </View>
  );
}

const NIVEL_RAREZA: Record<Rareza, PremioRevelado["nivel"]> = { comun: 1, raro: 2, epico: 3, legendario: 4 };

// Color y emoción de cada premio: los cosméticos según su rareza; las Chispas
// según cuántas son.
function revelado(p: PremioGuardado): Omit<PremioRevelado, "contenido"> {
  if (p.premio === "chispas" || p.convertido) return { color: color.logro, nivel: p.cantidad >= 150 ? 3 : p.cantidad >= 60 ? 2 : 1 };
  if (p.premio === "hielo") return { color: "#7FD8FF", nivel: 1 };
  if (p.premio === "escudo") return { color: "#4FE0F5", nivel: 2 };
  if (p.premio === "tiempo_extra") return { color: color.logro, nivel: 1 };
  const rareza = (p.rareza ?? "raro") as Rareza;
  return { color: COLOR_RAREZA[rareza], nivel: NIVEL_RAREZA[rareza] ?? 2 };
}

// Lo que se recarga después de abrir (saldo, cosméticos, pendientes) espera a que se
// cierre la escena: recargarlo en medio re-dibujaba toda la app de fondo y trababa
// la animación (2026-10-15).
async function recargarTodo(chispas: number | null) {
  if (chispas != null) fijarChispas(chispas);
  const { data } = await supabase.auth.getSession();
  if (data.session) recargarCosmeticos(data.session.user.id);
  recargarPendientes();
  recargarJugador();
}

export default function AbrirCapsula({
  capsula,
  guardado,
  onCerrar,
}: {
  capsula: DatosCapsula;
  // Premio que ya salió y no se llegó a ver (capsulasSinVer): se muestra sin abrir nada.
  guardado?: PremioGuardado;
  // abierta = false si se cerró antes de tocarla (sigue en «Por abrir»).
  onCerrar: (abierta: boolean) => void;
}) {
  const nombre = CAPSULAS[capsula.tipo]?.nombre ?? "Cápsula";
  const ciudad = ciudadDe(capsula.mundo);
  const [chispas, setChispas] = useState<number | null>(null);
  const pedida = useRef(false);
  return (
    <Revelacion
      colores={coloresCapsula(capsula.tipo, capsula.mundo)}
      etiqueta={ciudad ? `${nombre} · ${ciudad.nombre}` : nombre}
      titulo={guardado ? "No alcanzaste a ver lo que te salió" : "Te espera un premio"}
      // Antes de tocarla no se pidió nada: se puede cerrar y queda en «Por abrir».
      // Una ya abierta sin ver no se cierra hasta verla (si no, volvería a aparecer).
      cerrable={!guardado}
      onVisto={() => marcarVista(capsula.id)}
      onCerrar={() => {
        const abierta = pedida.current || !!guardado;
        if (abierta) void recargarTodo(chispas);
        onCerrar(abierta);
      }}
      abrir={async () => {
        if (guardado) return { ...revelado(guardado), contenido: <Premio p={guardado} /> };
        pedida.current = true;
        await marcarAbriendo(capsula.id);
        const r = await abrirCapsula(supabase, capsula.id);
        setChispas(r.puntos_total);
        return { ...revelado(r), contenido: <Premio p={r} /> };
      }}
    />
  );
}

const styles = StyleSheet.create({
  bonus: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 18, paddingVertical: 8, borderRadius: 999, borderWidth: 1, borderColor: conAlfa(color.logro, 0.5), backgroundColor: conAlfa(color.logro, 0.12) },
  icono: { width: 104, height: 104, borderRadius: 28, borderWidth: 2, borderColor: color.border, backgroundColor: color.surface2, alignItems: "center", justifyContent: "center" },
});
