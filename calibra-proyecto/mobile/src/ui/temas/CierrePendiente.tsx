import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { CHISPAS_POR_FICHA } from "@/lib/temas/colecciones";
import { PARTICULAS } from "@/lib/temas/dibujos";
import { cerrarFichas, estadoEvento, eventosPorCerrar, mensajeErrorEvento } from "@/lib/temas/eventos";
import { TEMAS } from "@/lib/temas/temas";
import { sonar } from "~/lib/efectos";
import { fijarChispas } from "~/lib/jugador";
import { supabase } from "~/lib/supabase";
import { mostrarAviso } from "~/ui/Aviso";
import Boton3D from "~/ui/Boton3D";
import DibujoTema from "~/ui/temas/DibujoTema";
import Texto, { SobreOscuro } from "~/ui/Texto";
import { color, fuente } from "~/tema";

interface Pendiente {
  slug: string;
  saldo: number;
  ficha: { nombre: string; dibujo: keyof typeof PARTICULAS };
  evento: string;
}

// Las Fichas que sobraron de un evento que ya terminó y cuyo día de cierre quedó tapado
// por otra fiesta (eventosPorCerrar, igual que la web): se cambian por Chispas acá.
export default function CierrePendiente({ actual }: { actual: string | null }) {
  const [pendientes, setPendientes] = useState<Pendiente[]>([]);
  const [ocupado, setOcupado] = useState<string | null>(null);

  useEffect(() => {
    let vivo = true;
    void (async () => {
      const lista: Pendiente[] = [];
      for (const e of eventosPorCerrar(actual)) {
        const est = await estadoEvento(supabase, e.slug);
        if (est && !est.cerrado && est.saldo > 0) lista.push({ slug: e.slug, saldo: est.saldo, ficha: e.coleccion.ficha, evento: TEMAS[e.coleccion.tema].nombre });
      }
      if (vivo) setPendientes(lista);
    })();
    return () => {
      vivo = false;
    };
  }, [actual]);

  async function cambiar(slug: string) {
    setOcupado(slug);
    try {
      const r = await cerrarFichas(supabase, slug);
      fijarChispas(r.puntos_total);
      sonar("recompensa");
      setPendientes((antes) => antes.filter((p) => p.slug !== slug));
    } catch (e) {
      mostrarAviso(mensajeErrorEvento(e), "error");
    } finally {
      setOcupado(null);
    }
  }

  if (!pendientes.length) return null;
  return (
    <View style={{ gap: 10 }}>
      {pendientes.map((p) => {
        const chispas = (p.saldo * CHISPAS_POR_FICHA).toLocaleString("es");
        return (
          <SobreOscuro key={p.slug}>
            <View style={styles.caja}>
              <View style={styles.fila}>
                <DibujoTema dibujo={PARTICULAS[p.ficha.dibujo]} ancho={38} />
                <View style={{ flex: 1, gap: 2 }}>
                  <Texto style={{ fontFamily: fuente.display, fontSize: 16, color: color.texto }}>
                    Te quedaron {p.saldo} {p.ficha.nombre} de {p.evento}
                  </Texto>
                  <Texto v="nota" tam={12}>
                    Cámbialas por {chispas} Chispas antes de que se pierdan.
                  </Texto>
                </View>
              </View>
              <Boton3D titulo={`Cambiar por ${chispas} Chispas`} variante="logro" tamano="sm" cargando={ocupado === p.slug} deshabilitado={ocupado !== null} onPress={() => cambiar(p.slug)} />
            </View>
          </SobreOscuro>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  caja: { gap: 12, padding: 14, borderRadius: 18, borderWidth: 2, borderColor: "#05060F", backgroundColor: "#0B1022", boxShadow: "3px 3px 0px #05060F" },
  fila: { flexDirection: "row", alignItems: "center", gap: 12 },
});
