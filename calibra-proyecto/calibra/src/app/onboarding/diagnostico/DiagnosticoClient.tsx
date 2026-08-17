"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { generarProblema, type Problem } from "@/lib/practica/problems";
import { tiempoEsperadoMs } from "@/lib/practica/formulas";
import { ARITHMETIC_PROBLEM_TYPES, type ArithmeticProblemType } from "@/types/database";
import LevelDial from "@/app/practica/LevelDial";
import { IconSuma, IconResta, IconMultiplicacion, IconDivision } from "@/components/icons";
import Boton from "@/components/Boton";

type Fase = "pregunta" | "diagnostico" | "guardando" | "resultado";

const PROBLEMAS_POR_OPERACION = 3;
const NIVEL_INICIAL_BLOQUE = 3;

const NOMBRES: Record<ArithmeticProblemType, string> = {
  suma: "Suma",
  resta: "Resta",
  multiplicacion: "Multiplicación",
  division: "División",
};

const ICONOS = {
  suma: IconSuma,
  resta: IconResta,
  multiplicacion: IconMultiplicacion,
  division: IconDivision,
};

function construirOrden(): ArithmeticProblemType[] {
  const orden: ArithmeticProblemType[] = [];
  for (let ronda = 0; ronda < PROBLEMAS_POR_OPERACION; ronda++) {
    orden.push(...ARITHMETIC_PROBLEM_TYPES);
  }
  return orden;
}

function nivelInicial(): Record<ArithmeticProblemType, number> {
  return { suma: NIVEL_INICIAL_BLOQUE, resta: NIVEL_INICIAL_BLOQUE, multiplicacion: NIVEL_INICIAL_BLOQUE, division: NIVEL_INICIAL_BLOQUE };
}

interface Props {
  destino: string;
}

export default function DiagnosticoClient({ destino }: Props) {
  const router = useRouter();
  const [fase, setFase] = useState<Fase>("pregunta");
  const [prioridad, setPrioridad] = useState<ArithmeticProblemType | null>(null);
  const [indice, setIndice] = useState(0);
  const [problema, setProblema] = useState<Problem | null>(null);
  const [respuesta, setRespuesta] = useState("");
  const [feedback, setFeedback] = useState<"idle" | "correcto" | "incorrecto">("idle");
  const [nivelesFinal, setNivelesFinal] = useState(nivelInicial());

  const ordenRef = useRef<ArithmeticProblemType[]>([]);
  const nivelesRef = useRef(nivelInicial());
  const problemShownAtRef = useRef(0);
  const submittingRef = useRef(false);

  function generarEnIndice(i: number) {
    const tipo = ordenRef.current[i];
    const nuevo = generarProblema(tipo, nivelesRef.current[tipo]);
    setProblema(nuevo);
    setRespuesta("");
    setFeedback("idle");
    problemShownAtRef.current = performance.now();
  }

  function empezarDiagnostico(prioridadElegida: ArithmeticProblemType | null) {
    setPrioridad(prioridadElegida);
    nivelesRef.current = nivelInicial();
    ordenRef.current = construirOrden();
    setIndice(0);
    setFase("diagnostico");
    generarEnIndice(0);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submittingRef.current || !problema || respuesta === "") return;
    submittingRef.current = true;

    const timeMs = Math.round(performance.now() - problemShownAtRef.current);
    const correct = Number(respuesta) === problema.answer;
    setFeedback(correct ? "correcto" : "incorrecto");

    const tipo = problema.problemType;
    const esperado = tiempoEsperadoMs(nivelesRef.current[tipo]);
    if (correct && timeMs < esperado * 0.8) {
      nivelesRef.current[tipo] = Math.min(10, nivelesRef.current[tipo] + 1);
    } else if (!correct) {
      nivelesRef.current[tipo] = Math.max(1, nivelesRef.current[tipo] - 1);
    }

    setTimeout(() => {
      submittingRef.current = false;
      const siguiente = indice + 1;
      setIndice(siguiente);
      if (siguiente >= ordenRef.current.length) {
        finalizar();
      } else {
        generarEnIndice(siguiente);
      }
    }, 500);
  }

  async function guardarNiveles(niveles: Record<ArithmeticProblemType, number>) {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    await Promise.all(
      ARITHMETIC_PROBLEM_TYPES.map((tipo) =>
        supabase
          .from("skill_levels")
          .upsert(
            { user_id: user.id, problem_type: tipo, nivel: niveles[tipo], racha_actual: 0 },
            { onConflict: "user_id,problem_type" }
          )
      )
    );
    await supabase.from("profiles").update({ onboarding_completado: true }).eq("id", user.id);
  }

  async function finalizar() {
    setFase("guardando");
    setNivelesFinal({ ...nivelesRef.current });
    await guardarNiveles(nivelesRef.current);
    setFase("resultado");
  }

  async function saltear() {
    setFase("guardando");
    await guardarNiveles(nivelInicial());
    continuar(prioridad);
  }

  function continuar(prioridadFinal: ArithmeticProblemType | null) {
    router.push(prioridadFinal ? `/practica?operacion=${prioridadFinal}` : destino);
  }

  return (
    <div className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center gap-8 px-4 py-16">
      <AnimatePresence mode="wait">
        {fase === "pregunta" && (
          <motion.div
            key="pregunta"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex flex-col gap-6 text-center"
          >
            <div>
              <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
                Veamos dónde estás
              </h1>
              <p className="mt-2 text-sm text-texto-secundario">
                Sin presión — esto no afecta tu racha ni tu experiencia, solo nos ayuda a calibrar
                bien desde el principio. ¿Qué querés mejorar primero?
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {ARITHMETIC_PROBLEM_TYPES.map((tipo) => {
                const Icono = ICONOS[tipo];
                return (
                  <button
                    key={tipo}
                    onClick={() => empezarDiagnostico(tipo)}
                    className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-surface px-4 py-6 transition-colors hover:border-primario/40"
                  >
                    <Icono className="h-5 w-5 text-primario" />
                    <span className="font-display font-semibold text-foreground">{NOMBRES[tipo]}</span>
                  </button>
                );
              })}
            </div>
            <Boton onClick={() => empezarDiagnostico(null)} className="py-4">
              No sé, mostrame de todo
            </Boton>
            <button onClick={saltear} className="text-sm text-texto-secundario hover:underline">
              Prefiero arrancar en nivel 1
            </button>
          </motion.div>
        )}

        {fase === "diagnostico" && problema && (
          <motion.div
            key={`diag-${indice}`}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col items-center gap-6"
          >
            <div className="flex gap-1.5">
              {ordenRef.current.map((_, i) => (
                <span
                  key={i}
                  className={`h-1.5 w-5 rounded-full ${i <= indice ? "bg-primario" : "bg-foreground/15"}`}
                />
              ))}
            </div>
            <div
              className={`flex w-full flex-col items-center gap-6 rounded-3xl border-2 bg-surface px-8 py-14 transition-colors ${
                feedback === "correcto"
                  ? "border-correcto"
                  : feedback === "incorrecto"
                    ? "border-error"
                    : "border-border"
              }`}
            >
              <span className="font-mono text-4xl font-bold text-foreground">
                {problema.a} <span className="text-primario">{problema.symbol}</span> {problema.b}
              </span>
              <form onSubmit={handleSubmit} className="flex w-full max-w-xs gap-2">
                <input
                  type="number"
                  inputMode="numeric"
                  value={respuesta}
                  onChange={(e) => setRespuesta(e.target.value)}
                  disabled={feedback !== "idle"}
                  autoFocus
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 text-center font-mono text-xl font-semibold text-foreground outline-none focus:border-primario disabled:opacity-60"
                />
                <button
                  type="submit"
                  disabled={feedback !== "idle"}
                  className="rounded-xl bg-primario px-5 py-3 font-display font-semibold text-white disabled:opacity-60"
                >
                  Ok
                </button>
              </form>
            </div>
            <button onClick={saltear} className="text-sm text-texto-secundario hover:underline">
              Prefiero arrancar en nivel 1
            </button>
          </motion.div>
        )}

        {fase === "guardando" && (
          <motion.p
            key="guardando"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-sm text-texto-secundario"
          >
            Guardando tu diagnóstico...
          </motion.p>
        )}

        {fase === "resultado" && (
          <motion.div
            key="resultado"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35 }}
            className="flex flex-col items-center gap-6 text-center"
          >
            <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
              Así arrancás
            </h1>
            <div className="grid grid-cols-2 gap-6">
              {ARITHMETIC_PROBLEM_TYPES.map((tipo) => (
                <div key={tipo} className="flex flex-col items-center gap-2">
                  <LevelDial nivel={nivelesFinal[tipo]} size={72} mostrarEtiqueta={false} />
                  <span className="text-sm font-medium text-foreground">{NOMBRES[tipo]}</span>
                </div>
              ))}
            </div>
            <Boton onClick={() => continuar(prioridad)} className="w-full py-4">
              Continuar
            </Boton>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
