"use client";

import { useState } from "react";
import type { PreguntaAnatomia } from "@/lib/practica/anatomia";
import AnatomiaSprintRunner from "@/app/[locale]/anatomia/AnatomiaSprintRunner";
import DemoTour from "@/components/landing/DemoTour";
import DemoCtaScreen from "@/components/landing/DemoCtaScreen";

const TOTAL_DEMO = 5;
const DURACION_DEMO_MS = 30_000;
const COLOR_ANATOMIA = "#8B2942";

export default function DemoAnatomiaClient() {
  const [fase, setFase] = useState<"sprint" | "cta">("sprint");
  const [correctos, setCorrectos] = useState(0);
  const [startedAt] = useState(() => performance.now());

  function handleFinish(errores: PreguntaAnatomia[]) {
    setCorrectos(Math.max(0, TOTAL_DEMO - errores.length));
    setFase("cta");
  }

  if (fase === "cta") {
    return <DemoCtaScreen correctos={correctos} total={TOTAL_DEMO} colorHex={COLOR_ANATOMIA} />;
  }

  return (
    <>
      <DemoTour />
      <AnatomiaSprintRunner
        modo="oseo"
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
