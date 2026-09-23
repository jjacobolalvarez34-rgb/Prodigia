"use client";

import { useState } from "react";
import type { CategoriaEnigmia, LogicPuzzle } from "@/types/database";
import EnigmiaSprintRunner from "@/app/[locale]/enigmia/practica/EnigmiaSprintRunner";
import FlujoResultado from "@/components/landing/FlujoResultado";
import FlujoTour from "@/components/landing/FlujoTour";
import FlujoPromoPro from "@/components/landing/FlujoPromoPro";
import FlujoElegirMundos from "@/components/landing/FlujoElegirMundos";

const TOTAL_DEMO = 5;
const DURACION_DEMO_MS = 30_000;
const COLOR_ENIGMIA = "#0E9F6E";
// Landing pública, sin cuenta — no hay logic_skill_levels que leer todavía,
// arranca en nivel 1 en las 4 categorías (mismo criterio que un usuario
// nuevo real antes de su primer diagnóstico).
const NIVELES_DEMO: Record<CategoriaEnigmia, number> = { memoria: 1, patrones: 1, deduccion: 1, computacional: 1 };

type Fase = "sprint" | "resultado" | "tour" | "promo" | "mundos";

interface Props {
  puzzles: LogicPuzzle[];
}

export default function DemoEnigmiaClient({ puzzles }: Props) {
  const [fase, setFase] = useState<Fase>("sprint");
  const [correctos, setCorrectos] = useState(0);
  const [startedAt] = useState(() => performance.now());

  function handleFinish(_errores: LogicPuzzle[], correctosReales: number) {
    setCorrectos(correctosReales);
    setFase("resultado");
  }

  if (fase === "resultado") {
    return (
      <FlujoResultado correctos={correctos} total={TOTAL_DEMO} colorHex={COLOR_ENIGMIA} onContinuar={() => setFase("tour")} />
    );
  }
  if (fase === "tour") {
    return <FlujoTour onTerminar={() => setFase("promo")} />;
  }
  if (fase === "promo") {
    return <FlujoPromoPro onContinuar={() => setFase("mundos")} />;
  }
  if (fase === "mundos") {
    return <FlujoElegirMundos />;
  }

  return (
    <EnigmiaSprintRunner
      puzzles={puzzles}
      startedAt={startedAt}
      nivelesIniciales={NIVELES_DEMO}
      escudosExtra={0}
      totalPreguntas={TOTAL_DEMO}
      duracionMs={DURACION_DEMO_MS}
      onFinish={handleFinish}
    />
  );
}
