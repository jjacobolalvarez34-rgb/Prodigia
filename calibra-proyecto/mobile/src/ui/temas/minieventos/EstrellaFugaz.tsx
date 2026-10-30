import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { COLECCIONES } from "@/lib/temas/colecciones";
import { PARTICULAS } from "@/lib/temas/dibujos";
import { ofertaEstelarAhora, type OfertaEstelar } from "@/lib/temas/minieventos";
import { useTemaHoy } from "~/lib/temporada";
import Boton3D from "~/ui/Boton3D";
import { IconoCometa } from "~/ui/Iconos";
import VistaCosmetico from "~/ui/recompensas/VistaCosmetico";
import DibujoTema from "~/ui/temas/DibujoTema";
import RelojFalta from "~/ui/temas/RelojFalta";
import Texto, { SobreOscuro } from "~/ui/Texto";
import { fuente } from "~/tema";

// La Estrella fugaz que está cayendo ahora (se revisa cada 20 s). Sin vista previa:
// mientras no cae, no se dice cuál viene.
export function useOfertaEstelar(desde: string | null): OfertaEstelar | null {
  const [oferta, setOferta] = useState<OfertaEstelar | null>(null);
  useEffect(() => {
    if (!desde) return;
    const tic = () =>
      setOferta((antes) => {
        const nueva = ofertaEstelarAhora(desde);
        return antes?.desdeMs === nueva?.desdeMs ? antes : nueva;
      });
    tic();
    const id = setInterval(tic, 20_000);
    return () => clearInterval(id);
  }, [desde]);
  return oferta;
}

// Viernes Estelar · «Estrella fugaz» (0309, igual que la web): cada día cae una oferta
// sorpresa de la colección, a mitad de precio, por 2 horas.
export default function EstrellaFugaz({ desde }: { desde: string }) {
  const router = useRouter();
  const oferta = useOfertaEstelar(desde);
  const pieza = oferta ? COLECCIONES.viernes_estelar?.piezas.find((p) => p.item === oferta.item) : null;
  if (!oferta || !pieza) {
    return (
      <Texto v="nota" tam={12}>
        Ahora no está cayendo ninguna. Cada día cae una oferta sorpresa por 2 horas: vuelve más tarde.
      </Texto>
    );
  }
  return (
    <SobreOscuro>
      <View style={styles.caja}>
        <View style={styles.fila}>
          <VistaCosmetico categoria={pieza.categoria} valor={pieza.valor} tam={52} />
          <View style={{ flex: 1, gap: 3 }}>
            <Texto style={{ fontFamily: fuente.cuerpoBold, fontSize: 10, letterSpacing: 1.8, color: "#5DE4FF" }}>¡CAYÓ UNA ESTRELLA FUGAZ!</Texto>
            <Texto v="fuerte" tam={14}>
              {pieza.nombre} a mitad de precio
            </Texto>
            <View style={styles.precios}>
              <DibujoTema dibujo={PARTICULAS.estrella_fugaz} ancho={15} />
              <Texto v="fuerte" tam={12.5}>
                {oferta.fichas}
              </Texto>
              <Texto v="nota" tam={11} style={{ textDecorationLine: "line-through" }}>
                {pieza.fichas}
              </Texto>
              <IconoCometa tam={13} />
              <Texto v="fuerte" tam={12.5}>
                {oferta.cometas}
              </Texto>
              <Texto v="nota" tam={11} style={{ textDecorationLine: "line-through" }}>
                {pieza.cometas}
              </Texto>
            </View>
            <RelojFalta hasta={oferta.hastaMs} texto={(t) => `Quedan ${t}`} tam={11} />
          </View>
        </View>
        <Boton3D titulo="Ver la oferta" tamano="sm" acento="#5DE4FF" onPress={() => router.push("/evento")} />
      </View>
    </SobreOscuro>
  );
}

const styles = StyleSheet.create({
  caja: { gap: 10, padding: 12, borderRadius: 16, borderWidth: 2, borderColor: "#5DE4FF88", backgroundColor: "#050A24" },
  fila: { flexDirection: "row", alignItems: "center", gap: 12 },
  precios: { flexDirection: "row", alignItems: "center", gap: 5 },
});

// En la portada del Bazar: la Estrella fugaz, solo durante el Viernes Estelar y mientras cae.
export function EstrellaEnBazar() {
  const tema = useTemaHoy();
  const desde = tema?.tema.id === "viernes_estelar" && tema.fase === "evento" ? tema.hoy.rango.desde : null;
  const oferta = useOfertaEstelar(desde);
  if (!desde || !oferta) return null;
  return <EstrellaFugaz desde={desde} />;
}
