import { useEffect, useState } from "react";
import { aplicarNombrePendiente, fijarPrimeraVezActiva, marcarRecorridoVisto, reclamarKitApp, recorridoVisto, suscribirPedidoRecorrido } from "~/lib/bienvenida";
import { recargarJugador } from "~/lib/jugador";
import GuardaTuProgreso from "./GuardaTuProgreso";
import KitPionero from "./KitPionero";
import RecorridoPestanas from "./RecorridoPestanas";

// Lo que se ve una sola vez al entrar con una cuenta (PLAN_PRIMERA_VEZ_APP.md):
// invitado viejo → «Guarda tu progreso»; si no, el Kit del Pionero (una vez por
// cuenta) y después el recorrido por las pestañas (una vez por teléfono).
type Fase = "revisando" | "kit" | "recorrido" | "listo";

export default function PrimeraVez({ userId, anonimo }: { userId: string; anonimo: boolean }) {
  const [fase, setFase] = useState<Fase>("revisando");

  useEffect(() => {
    if (anonimo) return;
    let vivo = true;
    (async () => {
      await aplicarNombrePendiente();
      const kit = await reclamarKitApp(userId);
      if (!vivo) return;
      if (kit) {
        await recargarJugador();
        if (vivo) setFase("kit");
        return;
      }
      setFase((await recorridoVisto()) ? "listo" : "recorrido");
    })();
    return () => {
      vivo = false;
    };
  }, [userId, anonimo]);

  // Ajustes → «Ver el tutorial otra vez».
  useEffect(() => suscribirPedidoRecorrido(() => setFase("recorrido")), []);

  const activa = anonimo || fase === "kit" || fase === "recorrido" || fase === "revisando";
  useEffect(() => {
    fijarPrimeraVezActiva(activa);
  }, [activa]);
  useEffect(() => () => fijarPrimeraVezActiva(false), []);

  if (anonimo) return <GuardaTuProgreso />;
  if (fase === "kit")
    return (
      <KitPionero
        onCerrar={async () => {
          setFase((await recorridoVisto()) ? "listo" : "recorrido");
        }}
      />
    );
  if (fase === "recorrido")
    return (
      <RecorridoPestanas
        onTerminar={() => {
          marcarRecorridoVisto();
          setFase("listo");
        }}
      />
    );
  return null;
}
