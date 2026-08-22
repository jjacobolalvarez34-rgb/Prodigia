"use client";

import { useState } from "react";
import type { PaisAmerica } from "@/lib/practica/geografia";
import type { PreguntaAvanzada } from "@/lib/practica/geografiaAvanzada";
import GeografiaSprintRunner from "@/app/[locale]/geografia/GeografiaSprintRunner";
import DemoTour from "@/components/landing/DemoTour";
import DemoCtaScreen from "@/components/landing/DemoCtaScreen";

const TOTAL_DEMO = 5;
const DURACION_DEMO_MS = 30_000;
const COLOR_GEOGRAFIA = "#1E7A8C";

export default function DemoGeografiaClient() {
  const [fase, setFase] = useState<"sprint" | "cta">("sprint");
  const [correctos, setCorrectos] = useState(0);
  const [startedAt] = useState(() => performance.now());

  function handleFinish(errores: (PaisAmerica | PreguntaAvanzada)[]) {
    setCorrectos(Math.max(0, TOTAL_DEMO - errores.length));
    setFase("cta");
  }

  if (fase === "cta") {
    return <DemoCtaScreen correctos={correctos} total={TOTAL_DEMO} colorHex={COLOR_GEOGRAFIA} />;
  }

  return (
    <>
      <DemoTour />
      <GeografiaSprintRunner
        continente="america"
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
