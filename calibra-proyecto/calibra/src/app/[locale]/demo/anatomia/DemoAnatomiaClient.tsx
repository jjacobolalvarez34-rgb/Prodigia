"use client";

import ConCuentaRegresiva from "@/components/CuentaRegresivaInicio";
import { useState } from "react";
import type { PreguntaAnatomia } from "@/lib/practica/anatomia";
import AnatomiaSprintRunner from "@/app/[locale]/anatomia/AnatomiaSprintRunner";
import FlujoResultado from "@/components/landing/FlujoResultado";
import FlujoTour from "@/components/landing/FlujoTour";
import FlujoPromoPro from "@/components/landing/FlujoPromoPro";
import FlujoElegirMundos from "@/components/landing/FlujoElegirMundos";

const TOTAL_DEMO = 5;
const DURACION_DEMO_MS = 30_000;
const COLOR_ANATOMIA = "#8B2942";

type Fase = "sprint" | "resultado" | "tour" | "promo" | "mundos";

export default function DemoAnatomiaClient() {
  const [fase, setFase] = useState<Fase>("sprint");
  const [correctos, setCorrectos] = useState(0);
  const [startedAt] = useState(() => performance.now());

  function handleFinish(_errores: PreguntaAnatomia[], correctosReales: number) {
    setCorrectos(correctosReales);
    setFase("resultado");
  }

  if (fase === "resultado") {
    return (
      <FlujoResultado correctos={correctos} total={TOTAL_DEMO} colorHex={COLOR_ANATOMIA} onContinuar={() => setFase("tour")} />
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
    <ConCuentaRegresiva>
      <AnatomiaSprintRunner
        modo="oseo"
        startedAt={startedAt}
        nivelInicial={1}
        escudosExtra={0}
        totalPreguntas={TOTAL_DEMO}
        duracionMs={DURACION_DEMO_MS}
        onFinish={handleFinish}
      />
    </ConCuentaRegresiva>
  );
}
