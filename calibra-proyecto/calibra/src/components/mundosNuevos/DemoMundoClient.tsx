"use client";

import ConCuentaRegresiva from "@/components/CuentaRegresivaInicio";
import { useState } from "react";
import { CONFIG_MUNDOS_NUEVOS, type SlugMundoNuevo } from "@/lib/mundosNuevos/config";
import FlujoResultado from "@/components/landing/FlujoResultado";
import FlujoTour from "@/components/landing/FlujoTour";
import FlujoPromoPro from "@/components/landing/FlujoPromoPro";
import FlujoElegirMundos from "@/components/landing/FlujoElegirMundos";
import SprintRunnerMundo from "./SprintRunnerMundo";

const TOTAL_DEMO = 5;
const DURACION_DEMO_MS = 30_000;

type Fase = "sprint" | "resultado" | "tour" | "promo" | "mundos";

// Partida de prueba de la landing (igual que DemoEstadisticaClient): 5 preguntas
// del primer modo en 30 segundos, y después el resto del flujo de bienvenida.
export default function DemoMundoClient({ slug }: { slug: SlugMundoNuevo }) {
  const cfg = CONFIG_MUNDOS_NUEVOS[slug];
  const [fase, setFase] = useState<Fase>("sprint");
  const [correctos, setCorrectos] = useState(0);
  const [startedAt] = useState(() => performance.now());

  if (fase === "resultado") return <FlujoResultado correctos={correctos} total={TOTAL_DEMO} colorHex={cfg.color} onContinuar={() => setFase("tour")} />;
  if (fase === "tour") return <FlujoTour onTerminar={() => setFase("promo")} />;
  if (fase === "promo") return <FlujoPromoPro onContinuar={() => setFase("mundos")} />;
  if (fase === "mundos") return <FlujoElegirMundos />;

  return (
    <ConCuentaRegresiva>
      <SprintRunnerMundo
        slug={slug}
        modo={cfg.modoDiagnostico}
        startedAt={startedAt}
        nivelInicial={1}
        escudosExtra={0}
        totalPreguntas={TOTAL_DEMO}
        duracionMs={DURACION_DEMO_MS}
        onFinish={(_errores, c) => {
          setCorrectos(c);
          setFase("resultado");
        }}
      />
    </ConCuentaRegresiva>
  );
}
