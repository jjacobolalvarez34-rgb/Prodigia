import { useCallback, useEffect, useState } from "react";
import { useFocusEffect } from "expo-router";
import type { CapsulaSinVer } from "@/lib/recompensas/capsulasSinVer";
import { capsulasSinVer } from "~/lib/capsulasSinVer";
import AbrirCapsula from "./AbrirCapsula";

// Premios de cápsulas que salieron pero no se llegaron a ver (el jugador se fue en
// medio de la animación; ~/lib/capsulasSinVer): al volver se le muestran, de a uno,
// con la escena entera. Se revisa al entrar a la pantalla y cada vez que se cierra
// otra apertura. Igual que components/recompensas/CapsulasSinVer.tsx de la web.
export default function CapsulasSinVer({ pausado = false, onCerrar }: { pausado?: boolean; onCerrar?: () => void }) {
  const [cola, setCola] = useState<CapsulaSinVer[]>([]);
  const [enFoco, setEnFoco] = useState(false);

  useFocusEffect(
    useCallback(() => {
      setEnFoco(true);
      return () => setEnFoco(false);
    }, [])
  );

  useEffect(() => {
    if (pausado || !enFoco) return;
    let vivo = true;
    capsulasSinVer().then(
      (lista) => {
        if (vivo) setCola(lista);
      },
      () => undefined
    );
    return () => {
      vivo = false;
    };
  }, [pausado, enFoco]);

  const actual = cola[0];
  if (!actual || pausado || !enFoco) return null;
  return (
    <AbrirCapsula
      key={actual.capsula.id}
      capsula={actual.capsula}
      guardado={actual.premio}
      onCerrar={() => {
        setCola((c) => c.slice(1));
        onCerrar?.();
      }}
    />
  );
}
