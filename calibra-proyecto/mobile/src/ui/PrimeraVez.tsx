import { useEffect, useState } from "react";
import { aplicarMundosPendientes, aplicarNombrePendiente, fijarPrimeraVezActiva, marcarRecorridoVisto, reclamarKitApp, recorridoVisto, suscribirPedidoRecorrido } from "~/lib/bienvenida";
import { recargarJugador, useJugador } from "~/lib/jugador";
import GuardaTuProgreso from "./GuardaTuProgreso";
import KitPionero from "./KitPionero";
import RecorridoPestanas from "./RecorridoPestanas";

// Lo que se ve una sola vez al entrar con una cuenta: invitado con mundos y sin
// cuenta → «Guarda tu progreso»; si no, el Kit del Pionero (una vez por cuenta) y
// después el recorrido por las pestañas (una vez por teléfono).
type Fase = "revisando" | "kit" | "recorrido" | "listo";

export default function PrimeraVez({ userId, anonimo }: { userId: string; anonimo: boolean }) {
  const [fase, setFase] = useState<Fase>("revisando");
  const { mundos } = useJugador();

  useEffect(() => {
    if (anonimo) return;
    let vivo = true;
    (async () => {
      await aplicarNombrePendiente();
      await aplicarMundosPendientes();
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

  // El invitado de la partida de prueba sigue en /bienvenida; «Guarda tu progreso» es
  // para el que ya tiene sus mundos y todavía no hizo la cuenta.
  if (anonimo) return mundos.length >= 2 ? <GuardaTuProgreso /> : null;
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
