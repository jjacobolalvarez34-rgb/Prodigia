import { useEffect, useState } from "react";
import { finTemporadaMs, mejorTemporadaRanked, nombreRango, temporadaRankedDe, tierTemporada } from "@/lib/rankeds/temporadas";
import { supabase } from "~/lib/supabase";
import { conAlfa } from "~/tema";
import Tarjeta from "../Tarjeta";
import Texto from "../Texto";
import RelojFalta from "../temas/RelojFalta";

const ORO = "#E8A317";

// La temporada de rankeds en curso (0296), igual que la web: número, cuenta regresiva
// hasta la próxima Gran Alineación y tu mejor temporada.
export default function TemporadaActual({ userId }: { userId: string | null }) {
  const [mejor, setMejor] = useState<{ rango: string; veces: number } | null>(null);
  useEffect(() => {
    if (userId) mejorTemporadaRanked(supabase, userId).then(setMejor);
  }, [userId]);
  const [n] = useState(() => temporadaRankedDe(Date.now()));
  return (
    <Tarjeta acento={ORO} brillo={0.12} estilo={{ gap: 3, borderColor: conAlfa(ORO, 0.4) }}>
      <Texto v="micro" c={ORO}>
        TEMPORADA {n}
      </Texto>
      <RelojFalta hasta={finTemporadaMs(n)} texto={(t) => `Termina en ${t}, al acabar la Gran Alineación`} />
      <Texto v="nota" tam={12}>
        En la Gran Alineación, ganar vale el doble de ELO y perder, la mitad. Al empezar la temporada nueva, quien pasó de Oro baja un poco.
      </Texto>
      {mejor && (
        <Texto v="nota" tam={12.5}>
          Tu mejor temporada: {nombreRango(mejor.rango)} {tierTemporada(mejor.veces)}
        </Texto>
      )}
    </Tarjeta>
  );
}
