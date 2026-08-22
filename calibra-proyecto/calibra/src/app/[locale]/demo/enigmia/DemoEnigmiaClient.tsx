"use client";

import { useState } from "react";
import type { LogicPuzzle } from "@/types/database";
import EnigmiaSprintRunner from "@/app/[locale]/enigmia/practica/EnigmiaSprintRunner";
import DemoTour from "@/components/landing/DemoTour";
import DemoCtaScreen from "@/components/landing/DemoCtaScreen";

const TOTAL_DEMO = 5;
const DURACION_DEMO_MS = 30_000;
const COLOR_ENIGMIA = "#0E9F6E";

interface Props {
  puzzles: LogicPuzzle[];
}

export default function DemoEnigmiaClient({ puzzles }: Props) {
  const [fase, setFase] = useState<"sprint" | "cta">("sprint");
  const [correctos, setCorrectos] = useState(0);
  const [startedAt] = useState(() => performance.now());

  function handleFinish(errores: LogicPuzzle[]) {
    setCorrectos(Math.max(0, TOTAL_DEMO - errores.length));
    setFase("cta");
  }

  if (fase === "cta") {
    return <DemoCtaScreen correctos={correctos} total={TOTAL_DEMO} colorHex={COLOR_ENIGMIA} />;
  }

  return (
    <>
      <DemoTour />
      <EnigmiaSprintRunner
        puzzles={puzzles}
        startedAt={startedAt}
        nivelInicial={1}
        escudosExtra={0}
        totalPreguntas={TOTAL_DEMO}
        duracionMs={DURACION_DEMO_MS}
        onFinish={handleFinish}
      />
    </>
  );
}
