import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { comprarLetraLibre, elegirLetraApp } from "@/lib/recompensas/api";
import { COLOR_COMETA } from "@/lib/recompensas/iconoCometa";
import { LETRA_LIBRE, LETRAS_APP, letraDe, type LetraApp } from "@/lib/recompensas/temas";
import { sonar, vibrar } from "~/lib/efectos";
import { fijarCometas, useJugador } from "~/lib/jugador";
import { fijarEstadoLetra, guardarLetra, sincronizarLetraApp, useLetraApp, useLetraPendiente } from "~/lib/letraApp";
import { useSesion } from "~/lib/sesion";
import { mensajeError, supabase } from "~/lib/supabase";
import { reiniciarConTema } from "~/lib/temaApp";
import { color, conAlfa, forma, LETRA_APP_ACTIVA, TEMA_APP_ACTIVO } from "~/tema";
import { letraEfectiva } from "@/lib/recompensas/temas";
import { mostrarAviso } from "../Aviso";
import Boton3D from "../Boton3D";
import { IconoCometa } from "../Iconos";
import Tarjeta from "../Tarjeta";
import Texto from "../Texto";
import MuestraLetraLibre from "./MuestraLetraLibre";

// Letra libre (0314) en la app: comprarla con Cometas (Bazar › Caligrafía) y, si ya la
// tienes, elegir la letra de títulos de toda la app. Como el tema, se ve al reiniciar
// (AvisoTemaApp ofrece «Aplicar ahora»). Sin 0314 en la base, no dibuja nada.
//   - donde="ajustes": si no la tienes, lleva a la Caligrafía en vez de vender.
//   - soloSiLaTienes: en el Inventario.
export default function LetraLibreApp({ donde, soloSiLaTienes }: { donde: "tienda" | "ajustes"; soloSiLaTienes?: boolean }) {
  const router = useRouter();
  const { sesion } = useSesion();
  const userId = sesion?.user.id;
  const { resumen } = useJugador();
  const e = useLetraApp();
  const pendiente = useLetraPendiente();
  const [confirmar, setConfirmar] = useState(false);
  const [ocupado, setOcupado] = useState(false);
  const cometas = resumen?.cometas ?? 0;

  useEffect(() => {
    if (userId) void sincronizarLetraApp(userId);
  }, [userId]);

  if (!e.disponible || (soloSiLaTienes && !e.tiene)) return null;
  const precio = LETRA_LIBRE.precioCometas;

  async function comprar() {
    if (!confirmar) {
      vibrar.medio();
      setConfirmar(true);
      return;
    }
    setOcupado(true);
    try {
      const r = await comprarLetraLibre(supabase);
      fijarCometas(r.cometas);
      sonar("recompensa");
      vibrar.exito();
      setConfirmar(false);
      fijarEstadoLetra({ ...e, tiene: true });
      mostrarAviso("¡La Letra libre es tuya! Elige tu letra.", "logro");
    } catch (err) {
      mostrarAviso(mensajeError(err), "error");
    } finally {
      setOcupado(false);
    }
  }

  async function elegir(id: string | null) {
    setOcupado(true);
    try {
      await elegirLetraApp(supabase, id);
      sonar("boton");
      fijarEstadoLetra({ ...e, elegida: id });
      // Queda guardada en el teléfono: AvisoTemaApp ofrece reiniciar para verla.
      guardarLetra(id);
    } catch (err) {
      mostrarAviso(mensajeError(err), "error");
    } finally {
      setOcupado(false);
    }
  }

  const cabecera = (
    <View style={styles.fila}>
      <View style={styles.emblema}>
        <MuestraLetraLibre tam={50} />
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <Texto v="micro" c={color.logro}>
          Desbloqueo único · Épico
        </Texto>
        <Texto v="h3">{donde === "ajustes" ? "Letra de la app" : "Letra libre"}</Texto>
        <Texto v="nota" tam={12.5}>
          {e.tiene ? "La letra de los títulos en toda la app. Gana sobre la de tu tema." : "Elige la letra de los títulos de toda la app: menús, tarjetas, botones y carteles. Solo cambia cómo se ve."}
        </Texto>
      </View>
    </View>
  );

  if (!e.tiene) {
    return (
      <Tarjeta sinEntrada relleno={14}>
        <View style={{ gap: 12 }}>
          {cabecera}
          <View style={styles.muestras}>
            {["cartel", "cursiva", "arcade", "romana", "marcador", "consola"].map((id) => {
              const l = letraDe(id)!;
              return (
                <Text key={id} style={{ fontFamily: l.app.display, fontSize: Math.round(17 * l.escala), lineHeight: Math.ceil(17 * l.escala * l.interlineado), color: color.texto }}>
                  Prodigia
                </Text>
              );
            })}
          </View>
          <Texto v="nota" tam={12}>
            Se compra una sola vez con Cometas o sale en las cápsulas prisma, supernova, de la Alineación y Pro.
          </Texto>
          {donde === "ajustes" ? (
            <Boton3D titulo="Conseguirla en la Caligrafía" tamano="sm" onPress={() => router.push({ pathname: "/tienda", params: { pestana: "caligrafia" } })} />
          ) : (
            <>
              <Boton3D
                titulo={confirmar ? "Toca otra vez para confirmar" : `Desbloquear por ${precio}`}
                icono={<IconoCometa tam={16} />}
                cargando={ocupado}
                deshabilitado={cometas < precio}
                onPress={comprar}
                acento={COLOR_COMETA}
              />
              {cometas < precio && (
                <Texto v="nota" tam={12} centro>
                  Te faltan {precio - cometas} Cometas.
                </Texto>
              )}
            </>
          )}
        </View>
      </Tarjeta>
    );
  }

  const elegida = letraDe(e.elegida)?.id ?? null;
  const letraTema = letraEfectiva(TEMA_APP_ACTIVO, null) ?? letraDe("siempre")!;
  const opciones: { id: string | null; letra: LetraApp; nombre: string; nota?: string }[] = [
    { id: null, letra: letraTema, nombre: "La del tema", nota: letraTema.nombre },
    ...LETRAS_APP.map((l) => ({ id: l.id, letra: l, nombre: l.nombre })),
  ];
  // Hay una letra guardada que todavía no se ve (se elige y se aplica al reiniciar).
  const porAplicar = pendiente !== null || (elegida ?? null) !== (LETRA_APP_ACTIVA ?? null);

  return (
    <Tarjeta sinEntrada relleno={14}>
      <View style={{ gap: 12 }}>
        {cabecera}
        <View style={styles.grilla}>
          {opciones.map((o) => {
            const activa = o.id === elegida;
            return (
              <Pressable
                key={o.id ?? "tema"}
                disabled={ocupado || activa}
                onPress={() => {
                  vibrar.seleccion();
                  void elegir(o.id);
                }}
                accessibilityRole="button"
                accessibilityState={{ selected: activa }}
                style={({ pressed }) => [styles.opcion, activa && { borderColor: color.correcto, backgroundColor: conAlfa(color.correcto, 0.1) }, pressed && { transform: [{ scale: 0.96 }] }]}
              >
                {/* Text a propósito: Texto volvería a escalar la letra que ya es la de la app. */}
                <Text numberOfLines={1} style={{ fontFamily: o.letra.app.display, fontSize: Math.round(16 * o.letra.escala), lineHeight: Math.ceil(16 * o.letra.escala * o.letra.interlineado), color: color.texto }}>
                  {o.nombre}
                </Text>
                <Texto v="micro" tam={9.5} c={activa ? color.correcto : color.texto2} numberOfLines={1}>
                  {activa ? "En uso" : (o.nota ?? " ")}
                </Texto>
              </Pressable>
            );
          })}
        </View>
        {porAplicar && (
          <Boton3D
            titulo="Aplicar ahora"
            tamano="sm"
            brillo
            onPress={async () => {
              const ok = await reiniciarConTema();
              if (!ok) mostrarAviso("Se pondrá la próxima vez que abras Prodigia.", "info");
            }}
          />
        )}
      </View>
    </Tarjeta>
  );
}

const styles = StyleSheet.create({
  fila: { flexDirection: "row", alignItems: "center", gap: 12 },
  emblema: { width: 62, height: 62, borderRadius: Math.min(16, forma.radioTarjeta), backgroundColor: color.surface2, borderWidth: 1, borderColor: color.border, alignItems: "center", justifyContent: "center" },
  muestras: { flexDirection: "row", flexWrap: "wrap", alignItems: "baseline", columnGap: 14, rowGap: 2, paddingHorizontal: 12, paddingVertical: 8, borderRadius: Math.min(12, forma.radioTarjeta), borderWidth: 1, borderStyle: "dashed", borderColor: color.border },
  grilla: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  opcion: { width: "48%", flexGrow: 1, minHeight: 58, justifyContent: "center", gap: 3, paddingHorizontal: 10, paddingVertical: 8, borderRadius: Math.min(12, forma.radioTarjeta), borderWidth: 2, borderColor: color.border, backgroundColor: color.surface2 },
});
