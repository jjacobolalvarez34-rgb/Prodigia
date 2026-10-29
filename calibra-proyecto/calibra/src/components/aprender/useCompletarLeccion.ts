"use client";

import { useCallback, useRef, useState } from "react";
import type { Achievement } from "@/types/database";

export type EstadoGuardadoLeccion = "inactivo" | "guardando" | "listo" | "error";

interface Opciones {
  techniqueId: string;
  // /api/aprender/completar (techniques) o /api/enigmia/completar-leccion.
  endpoint?: string;
  // Pasa al festejo. Se llama ANTES de que responda el servidor: el quiz ya se
  // calificó pregunta por pregunta en pantalla, así que no hay que esperar.
  alCelebrar: () => void;
  // El servidor no aprobó el quiz (contenido desfasado, raro): volver al quiz.
  alRechazar?: (incorrectas: number[]) => void;
  // Guardado confirmado (p. ej. router.refresh() para que el camino se recalcule).
  alGuardar?: () => void;
}

// Terminar una Técnica o Clase de Aprender (docs/avance/CLASES_CALIFICACION.md).
// Antes la pantalla esperaba al servidor (lección + plan + progreso + logros +
// títulos, en serie) antes de festejar: a veces varios segundos con el botón
// girando. Ahora el festejo entra al instante y el guardado sigue debajo: los
// logros aparecen con su animación cuando llegan, y si el guardado falla se
// ofrece reintentar ahí mismo. La validación de respuestas sigue en el servidor.
export function useCompletarLeccion({ techniqueId, endpoint = "/api/aprender/completar", alCelebrar, alRechazar, alGuardar }: Opciones) {
  const [estado, setEstado] = useState<EstadoGuardadoLeccion>("inactivo");
  const [logros, setLogros] = useState<Achievement[]>([]);
  const [incorrectas, setIncorrectas] = useState<number[] | null>(null);
  const ultimas = useRef<string[] | undefined>(undefined);
  const enCurso = useRef(false);

  const guardar = useCallback(
    async (respuestas?: string[]) => {
      if (enCurso.current) return;
      enCurso.current = true;
      setEstado("guardando");
      try {
        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(respuestas ? { technique_id: techniqueId, respuestas } : { technique_id: techniqueId }),
        });
        const data = (await res.json().catch(() => ({}))) as {
          ok?: boolean;
          aprobado?: boolean;
          incorrectas?: unknown;
          logrosNuevos?: unknown;
        };
        if (data.ok === false || data.aprobado === false) {
          const mal = Array.isArray(data.incorrectas) ? (data.incorrectas as number[]) : [];
          setIncorrectas(mal);
          setEstado("inactivo");
          alRechazar?.(mal);
          return;
        }
        if (!res.ok) {
          setEstado("error");
          return;
        }
        if (Array.isArray(data.logrosNuevos)) setLogros(data.logrosNuevos as Achievement[]);
        setEstado("listo");
        alGuardar?.();
      } catch {
        setEstado("error");
      } finally {
        enCurso.current = false;
      }
    },
    [endpoint, techniqueId, alRechazar, alGuardar]
  );

  const completar = useCallback(
    (respuestas?: string[]) => {
      ultimas.current = respuestas;
      setIncorrectas(null);
      alCelebrar();
      void guardar(respuestas);
    },
    [alCelebrar, guardar]
  );

  const reintentar = useCallback(() => void guardar(ultimas.current), [guardar]);

  return { completar, reintentar, estado, logros, incorrectas };
}
