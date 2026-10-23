"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { CapsulaSinVer } from "@/lib/recompensas/capsulasSinVer";
import { capsulasSinVerWeb } from "@/lib/recompensas/capsulasSinVerWeb";
import AbrirCapsula from "./AbrirCapsula";

// Premios de cápsulas que salieron pero no se llegaron a ver (el jugador se fue en
// medio de la animación; capsulasSinVer.ts): al volver se le muestran, de a uno, con
// la escena entera. Se revisa al entrar y cada vez que se cierra otra apertura.
export default function CapsulasSinVer({ pausado = false, onCerrar }: { pausado?: boolean; onCerrar?: () => void }) {
  const [cola, setCola] = useState<CapsulaSinVer[]>([]);

  useEffect(() => {
    if (pausado) return;
    let vivo = true;
    capsulasSinVerWeb(createClient()).then(
      (lista) => {
        if (vivo) setCola(lista);
      },
      () => undefined
    );
    return () => {
      vivo = false;
    };
  }, [pausado]);

  const actual = cola[0];
  if (!actual || pausado) return null;
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
