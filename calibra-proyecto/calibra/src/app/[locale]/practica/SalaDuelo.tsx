"use client";

import type { ArithmeticProblemType } from "@/types/database";
import { useArranqueSincronizado } from "@/lib/duelos/useArranqueSincronizado";
import SalaEsperaDuelo from "@/components/duelos/SalaEsperaDuelo";

const NOMBRES_OPERACION: Record<ArithmeticProblemType, string> = {
  suma: "Suma",
  resta: "Resta",
  multiplicacion: "Multiplicación",
  division: "División",
};

interface Props {
  duelId: string;
  operacion: ArithmeticProblemType;
  miUserId: string;
  rivalId: string;
  rivalNombre: string;
  miElo: number;
  rivalElo: number;
  miTituloNombre?: string | null;
  rivalTituloNombre?: string | null;
  // Fase 3 de Clanes: un rival del Clan de Bots nunca va a conectarse a
  // esta sala de verdad (no existe ningún segundo cliente real del otro
  // lado) — se salta directo a la cuenta regresiva en vez de pasar por
  // la espera de Presence + el fallback de 45s a "agotado", que sería
  // literalmente lo mismo pero con una demora artificial e innecesaria.
  rivalEsBot?: boolean;
  // Fase 5: si esta ronda es parte de un "todas las ciudades", se
  // muestra "Ronda X/Y" en vez de solo el nombre de la operación.
  serieId?: string | null;
  rondaNumero?: number;
  rondaTotal?: number;
  onEmpezar: () => void;
}

// Sala de espera de un duelo en tiempo real (Fase T3). La sincronización
// real (Presence + Broadcast sobre `duelo:<id>`) vive en
// useArranqueSincronizado — compartida con los otros 3 mundos desde la
// tanda "Duelos: llevar el progreso en vivo..." (Fase 2). Este archivo
// solo aporta lo específico de Numeria: el label de la operación.
export default function SalaDuelo({
  duelId,
  operacion,
  miUserId,
  rivalId,
  rivalNombre,
  miElo,
  rivalElo,
  rivalEsBot = false,
  serieId,
  rondaNumero,
  rondaTotal,
  onEmpezar,
}: Props) {
  const { estado, segundos, rivalPresente, empezarAhora } = useArranqueSincronizado({
    duelId,
    miUserId,
    rivalId,
    rivalEsBot,
    onEmpezar,
  });

  const subtitulo = serieId ? `Ronda ${rondaNumero}/${rondaTotal} · ${NOMBRES_OPERACION[operacion]}` : NOMBRES_OPERACION[operacion];
  const modo = serieId ? "mejor_de_3" : "simple";

  return (
    <SalaEsperaDuelo
      estado={estado}
      segundos={segundos}
      rivalPresente={rivalPresente}
      miElo={miElo}
      rivalNombre={rivalNombre}
      rivalElo={rivalElo}
      rivalEsBot={rivalEsBot}
      modo={modo}
      subtitulo={subtitulo}
      onEmpezarAhora={empezarAhora}
    />
  );
}
