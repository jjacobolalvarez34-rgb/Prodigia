"use client";

import { useState } from "react";
import type { ArithmeticProblemType, ModifierSlug } from "@/types/database";
import type { Problem } from "@/lib/practica/problems";
import SprintRunner from "@/app/[locale]/practica/SprintRunner";
import DemoTour from "@/components/landing/DemoTour";
import DemoCtaScreen from "@/components/landing/DemoCtaScreen";

const TOTAL_DEMO = 5;
const DURACION_DEMO_MS = 30_000;
const COLOR_NUMERIA = "#6C4CF1";

interface Props {
  nivelPorOperacion: Record<ArithmeticProblemType, number>;
  modificadoresPorOperacion: Record<ArithmeticProblemType, ModifierSlug[]>;
}

export default function DemoNumeriaClient({ nivelPorOperacion, modificadoresPorOperacion }: Props) {
  const [fase, setFase] = useState<"sprint" | "cta">("sprint");
  const [correctos, setCorrectos] = useState(0);
  // Lazy initializer (no useEffect): el valor que server-renderiza se
  // descarta sin usarse — nunca llega a la marca — así que lo único que
  // importa es el que corre en el cliente durante la hidratación, que sí
  // usa el reloj correcto del navegador.
  const [startedAt] = useState(() => performance.now());

  function handleFinish(errores: Problem[]) {
    setCorrectos(Math.max(0, TOTAL_DEMO - errores.length));
    setFase("cta");
  }

  if (fase === "cta") {
    return <DemoCtaScreen correctos={correctos} total={TOTAL_DEMO} colorHex={COLOR_NUMERIA} />;
  }

  return (
    <>
      <DemoTour />
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
    </>
  );
}
