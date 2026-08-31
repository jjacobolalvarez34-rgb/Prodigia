"use client";

import { useState } from "react";
import type { ArithmeticProblemType, ModifierSlug } from "@/types/database";
import type { Problem } from "@/lib/practica/problems";
import type { RespuestaDuelo } from "@/app/[locale]/practica/page";
import SprintRunner from "@/app/[locale]/practica/SprintRunner";
import FlujoResultado from "@/components/landing/FlujoResultado";
import FlujoTour from "@/components/landing/FlujoTour";
import FlujoPromoPro from "@/components/landing/FlujoPromoPro";
import FlujoElegirMundos from "@/components/landing/FlujoElegirMundos";

const TOTAL_DEMO = 5;
const DURACION_DEMO_MS = 30_000;
const COLOR_NUMERIA = "#6C4CF1";

type Fase = "sprint" | "resultado" | "tour" | "promo" | "mundos";

interface Props {
  nivelPorOperacion: Record<ArithmeticProblemType, number>;
  modificadoresPorOperacion: Record<ArithmeticProblemType, ModifierSlug[]>;
}

export default function DemoNumeriaClient({ nivelPorOperacion, modificadoresPorOperacion }: Props) {
  const [fase, setFase] = useState<Fase>("sprint");
  const [correctos, setCorrectos] = useState(0);
  // Lazy initializer (no useEffect): el valor que server-renderiza se
  // descarta sin usarse — nunca llega a la marca — así que lo único que
  // importa es el que corre en el cliente durante la hidratación, que sí
  // usa el reloj correcto del navegador.
  const [startedAt] = useState(() => performance.now());

  function handleFinish(_errores: Problem[], respuestas: RespuestaDuelo[]) {
    setCorrectos(respuestas.filter((r) => r.correct).length);
    setFase("resultado");
  }

  if (fase === "resultado") {
    return (
      <FlujoResultado correctos={correctos} total={TOTAL_DEMO} colorHex={COLOR_NUMERIA} onContinuar={() => setFase("tour")} />
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
    <SprintRunner
      seleccion={["suma"]}
      startedAt={startedAt}
      nivelPorOperacion={nivelPorOperacion}
      modificadoresPorOperacion={modificadoresPorOperacion}
      escudosExtra={0}
      colorDial={COLOR_NUMERIA}
      totalPreguntas={TOTAL_DEMO}
      duracionMs={DURACION_DEMO_MS}
      onNivelChange={() => {}}
      onFinish={handleFinish}
    />
  );
}
