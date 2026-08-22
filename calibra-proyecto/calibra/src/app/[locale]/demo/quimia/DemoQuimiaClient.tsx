"use client";

import { useState } from "react";
import type { PreguntaQuimia } from "@/lib/practica/quimia";
import QuimiaSprintRunner from "@/app/[locale]/quimia/QuimiaSprintRunner";
import DemoTour from "@/components/landing/DemoTour";
import DemoCtaScreen from "@/components/landing/DemoCtaScreen";

const TOTAL_DEMO = 5;
const DURACION_DEMO_MS = 30_000;
const COLOR_QUIMIA = "#C026D3";

export default function DemoQuimiaClient() {
  const [fase, setFase] = useState<"sprint" | "cta">("sprint");
  const [correctos, setCorrectos] = useState(0);
  const [startedAt] = useState(() => performance.now());

  function handleFinish(errores: PreguntaQuimia[]) {
    setCorrectos(Math.max(0, TOTAL_DEMO - errores.length));
    setFase("cta");
  }

  if (fase === "cta") {
    return <DemoCtaScreen correctos={correctos} total={TOTAL_DEMO} colorHex={COLOR_QUIMIA} />;
  }

  return (
    <>
      <DemoTour />
      <QuimiaSprintRunner
        modo="simbolos"
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
