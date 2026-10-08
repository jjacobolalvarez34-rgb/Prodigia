import { useEffect, useMemo, useState } from "react";
import { View } from "react-native";
import type { Escena } from "@/lib/dibujo/escena";
import { escenaDinamia } from "@/lib/dinamia/escenas";
import type { VisualDinamia as DatosDinamia } from "@/lib/dinamia/visuales";
import { MUNDOS } from "~/tema";
import DibujoSvg from "../../visuales/DibujoSvg";
import { Leyenda, Marco, T } from "../comun";
import { useReproductor } from "../reproductor";

// Reproductor de las escenas de Dinamia y Vitalia (src/lib/dibujo/escena.ts):
// la MISMA escena que dibuja la web (components/mundosNuevos/visuales/VisualEscena.tsx).

// Avance (0..1) de la transición hacia el paso actual; con `estatico`, siempre 1.
function useAvancePaso(paso: number, duracion: number, estatico: boolean): number {
  const [estado, setEstado] = useState({ paso, t: 0 });
  useEffect(() => {
    if (estatico) return;
    let id = 0;
    const inicio = Date.now();
    const cuadro = () => {
      const t = Math.min(1, (Date.now() - inicio) / duracion);
      setEstado({ paso, t });
      if (t < 1) id = requestAnimationFrame(cuadro);
    };
    id = requestAnimationFrame(cuadro);
    return () => cancelAnimationFrame(id);
  }, [paso, duracion, estatico]);
  if (estatico) return 1;
  return estado.paso === paso ? estado.t : 0;
}

function ReproductorEscena({ escena, base, claro, titulo, estatico }: { escena: Escena; base: string; claro: string; titulo?: string; estatico?: boolean }) {
  const r = useReproductor({ total: escena.pasos, ms: escena.ms, estatico });
  const t = useAvancePaso(r.paso, Math.min(1200, escena.ms * 0.75), r.reducir);
  const leyenda = escena.leyenda(r.paso);
  return (
    <Marco acento={base} titulo={titulo} r={r}>
      <View accessible accessibilityLabel={escena.alternativa} style={{ alignItems: "center" }}>
        <DibujoSvg dibujo={escena.dibujar(r.paso, t)} acento={claro} maxAlto={240} />
      </View>
      {leyenda ? (
        <Leyenda acento={base}>
          <T>{leyenda}</T>
        </Leyenda>
      ) : null}
    </Marco>
  );
}

function crearVisualEscena<V extends { titulo?: string; estatico?: boolean }>(crear: (v: V) => Escena | null, slug: "dinamia" | "vitalia") {
  const mundo = MUNDOS.find((m) => m.slug === slug);
  const base = mundo?.base ?? "#2563EB";
  const claro = mundo?.neon ?? base;
  return function VisualEscena({ visual }: { visual: V }) {
    const escena = useMemo(() => {
      try {
        return crear(visual);
      } catch {
        return null;
      }
    }, [visual]);
    if (!escena) return null;
    return <ReproductorEscena escena={escena} base={base} claro={claro} titulo={visual.titulo} estatico={visual.estatico} />;
  };
}

export const VisualDinamia = crearVisualEscena<DatosDinamia>(escenaDinamia, "dinamia");
