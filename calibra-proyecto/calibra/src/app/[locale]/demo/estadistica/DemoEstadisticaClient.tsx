"use client";

import { useState } from "react";
import type { ProblemaEstadistica } from "@/lib/practica/estadistica";
import EstadisticaSprintRunner from "@/app/[locale]/estadistica/EstadisticaSprintRunner";
import FlujoResultado from "@/components/landing/FlujoResultado";
import FlujoTour from "@/components/landing/FlujoTour";
import FlujoPromoPro from "@/components/landing/FlujoPromoPro";
import FlujoElegirMundos from "@/components/landing/FlujoElegirMundos";

const TOTAL_DEMO = 5;
const DURACION_DEMO_MS = 30_000;
const COLOR_ESTADISTICA = "#0D9488";

type Fase = "sprint" | "resultado" | "tour" | "promo" | "mundos";

export default function DemoEstadisticaClient() {
  const [fase, setFase] = useState<Fase>("sprint");
  const [correctos, setCorrectos] = useState(0);
  const [startedAt] = useState(() => performance.now());

  function handleFinish(_errores: ProblemaEstadistica[], correctosReales: number) {
    setCorrectos(correctosReales);
    setFase("resultado");
  }

  if (fase === "resultado") {
    return (
      <FlujoResultado
        correctos={correctos}
        total={TOTAL_DEMO}
        colorHex={COLOR_ESTADISTICA}
        onContinuar={() => setFase("tour")}
      />
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
    <EstadisticaSprintRunner
      modo="central"
      startedAt={startedAt}
      nivelInicial={1}
      escudosExtra={0}
      totalPreguntas={TOTAL_DEMO}
      duracionMs={DURACION_DEMO_MS}
      onFinish={handleFinish}
    />
  );
}
