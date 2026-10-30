import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { View } from "react-native";
import { COLECCIONES } from "@/lib/temas/colecciones";
import { PARTICULAS } from "@/lib/temas/dibujos";
import { DUO_MAX_AMIGOS, duoAmistad, FICHAS_POR_DUO, type DuoAmistad as Duo } from "@/lib/temas/minieventos";
import { supabase } from "~/lib/supabase";
import Boton3D from "~/ui/Boton3D";
import DibujoTema from "~/ui/temas/DibujoTema";
import Texto from "~/ui/Texto";

// Amor y amistad · «Dúo de la amistad» (0311, igual que la web): cada duelo amistoso
// terminado con un amigo da Cartas a los dos (una vez por amigo, hasta 5 amigos).
export default function DuoAmistad() {
  const router = useRouter();
  const ficha = COLECCIONES.amor_amistad!.ficha;
  const [duos, setDuos] = useState<Duo[] | null>(null);

  useEffect(() => {
    let vivo = true;
    void duoAmistad(supabase).then((r) => {
      if (vivo) setDuos(r ?? []);
    });
    return () => {
      vivo = false;
    };
  }, []);

  const n = duos?.length ?? 0;
  return (
    <View style={{ gap: 8, marginTop: 6 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
        {Array.from({ length: DUO_MAX_AMIGOS }, (_, i) => (
          <View key={i} style={{ opacity: i < n ? 1 : 0.2 }}>
            <DibujoTema dibujo={PARTICULAS.carta} ancho={30} />
          </View>
        ))}
        <Texto v="mono" tam={11.5} c="#FF5D8F">
          {duos ? `Dúos: ${n} de ${DUO_MAX_AMIGOS}` : "…"}
        </Texto>
      </View>
      {duos?.map((d) => (
        <Texto key={d.amigo_id} v="nota" tam={12.5}>
          {d.nombre}: +{d.fichas} {ficha.nombre}
        </Texto>
      ))}
      {n >= DUO_MAX_AMIGOS ? (
        <Texto v="fuerte" tam={13} c="#FF5D8F">
          ¡Completaste los {DUO_MAX_AMIGOS} dúos!
        </Texto>
      ) : (
        <View style={{ gap: 6 }}>
          <Texto v="nota" tam={12}>
            Juega un duelo amistoso con un amigo: cuando termine, los dos ganan {FICHAS_POR_DUO} {ficha.nombre}.
          </Texto>
          <Boton3D titulo="Ir a Amigos" tamano="sm" acento="#FF5D8F" onPress={() => router.push({ pathname: "/social", params: { seccion: "amigos" } })} />
        </View>
      )}
    </View>
  );
}
