"use client";

import { useState } from "react";
import type { PaisAmerica } from "@/lib/practica/geografia";
import type { PreguntaAvanzada } from "@/lib/practica/geografiaAvanzada";
import GeografiaSprintRunner from "@/app/[locale]/geografia/GeografiaSprintRunner";
import FlujoResultado from "@/components/landing/FlujoResultado";
import FlujoTour from "@/components/landing/FlujoTour";
import FlujoPromoPro from "@/components/landing/FlujoPromoPro";
import FlujoElegirMundos from "@/components/landing/FlujoElegirMundos";

const TOTAL_DEMO = 5;
const DURACION_DEMO_MS = 30_000;
const COLOR_GEOGRAFIA = "#1E7A8C";

type Fase = "sprint" | "resultado" | "tour" | "promo" | "mundos";

export default function DemoGeografiaClient() {
  const [fase, setFase] = useState<Fase>("sprint");
  const [correctos, setCorrectos] = useState(0);
  const [startedAt] = useState(() => performance.now());

  function handleFinish(_errores: (PaisAmerica | PreguntaAvanzada)[], correctosReales: number) {
    setCorrectos(correctosReales);
    setFase("resultado");
  }

  if (fase === "resultado") {
    return (
      <FlujoResultado correctos={correctos} total={TOTAL_DEMO} colorHex={COLOR_GEOGRAFIA} onContinuar={() => setFase("tour")} />
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
    <GeografiaSprintRunner
      continente="america"
      startedAt={startedAt}
      nivelInicial={1}
      escudosExtra={0}
      totalPreguntas={TOTAL_DEMO}
      duracionMs={DURACION_DEMO_MS}
      onFinish={handleFinish}
    />
  );
}
