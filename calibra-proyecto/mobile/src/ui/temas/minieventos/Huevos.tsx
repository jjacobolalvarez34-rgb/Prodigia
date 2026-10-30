import { useEffect, useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import { COLECCIONES, slugEvento } from "@/lib/temas/colecciones";
import { escenaHuevos } from "@/lib/temas/escenasFiestas";
import { diaUtc, FICHAS_TODOS_HUEVOS, LUGARES_HUEVOS, lugarHuevoDe, PISTAS_HUEVOS, premiosMinievento, type PremioMinievento } from "@/lib/temas/minieventos";
import type { TemaActivo } from "@/lib/temas/temas";
import { supabase } from "~/lib/supabase";
import DibujoTema from "~/ui/temas/DibujoTema";
import Texto from "~/ui/Texto";

// Pascua · «Huevos escondidos» (0311, igual que la web), en el Inicio: cuántos
// encontraste y la pista del de hoy. El huevo está en otra pantalla (HuevoEscondido).
export default function Huevos({ tema, ancho }: { tema: TemaActivo; ancho: number }) {
  const hoy = diaUtc();
  const { desde, hasta } = tema.hoy.rango;
  const slug = slugEvento("pascua", desde);
  const ficha = COLECCIONES.pascua!.ficha;
  const [premios, setPremios] = useState<PremioMinievento[] | null>(null);

  useEffect(() => {
    let vivo = true;
    void premiosMinievento(supabase, slug).then((r) => {
      if (vivo) setPremios(r ?? []);
    });
    return () => {
      vivo = false;
    };
  }, [slug]);

  const dias = useMemo(() => {
    const lista: string[] = [];
    for (let d = Date.parse(`${desde}T00:00:00Z`); d <= Date.parse(`${hasta}T00:00:00Z`) && lista.length < LUGARES_HUEVOS.length; d += 86_400_000) lista.push(new Date(d).toISOString().slice(0, 10));
    return lista;
  }, [desde, hasta]);
  const encontrado = (d: string) => !!premios?.some((p) => p.clave === `huevo:${d}`);
  const lugar = lugarHuevoDe(desde, hoy);
  const n = dias.filter(encontrado).length;
  const todos = !!premios?.some((p) => p.clave === "huevos:todos");

  return (
    <View style={{ gap: 8, marginTop: 6 }}>
      <View style={styles.escena}>
        <DibujoTema dibujo={escenaHuevos(dias.map(encontrado))} ancho={ancho} />
      </View>
      <Texto v="mono" tam={11.5} c="#9BE7FF">
        {premios ? `Huevos: ${n} de ${dias.length}` : "…"}
      </Texto>
      {todos ? (
        <Texto v="fuerte" tam={13} c="#FFD36B">
          ¡Los encontraste todos! +{FICHAS_TODOS_HUEVOS} {ficha.nombre} de premio
        </Texto>
      ) : encontrado(hoy) ? (
        <Texto v="nota" tam={12.5}>
          Ya encontraste el de hoy. Mañana se esconde otro.
        </Texto>
      ) : (
        lugar && (
          <Texto v="fuerte" tam={13}>
            {PISTAS_HUEVOS[lugar].es}
          </Texto>
        )
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  escena: { borderRadius: 16, overflow: "hidden", borderWidth: 1, borderColor: "rgba(255,255,255,0.1)", backgroundColor: "#0B2A1F" },
});
