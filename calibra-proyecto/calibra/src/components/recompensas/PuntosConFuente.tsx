"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { FUENTES_NOMBRE_NUEVAS, FUENTES_PUNTOS } from "@/lib/recompensas/catalogoAmpliado";

// El «+N» con una fuente de puntos (0294): su letra, su color y su acabado, siempre
// inclinado 8°. «clasica» (o sin fuente) = el de siempre, en el color que se pase.
export function estiloPuntos(valor: string | null | undefined, colorBase: string): React.CSSProperties {
  const f = FUENTES_PUNTOS.find((x) => x.valor === valor);
  if (!f) return { color: colorBase };
  const e = f.estilo;
  const estilo: React.CSSProperties = { fontFamily: f.familia ? `var(${f.familia})` : undefined, color: e.color };
  if (e.degrade) Object.assign(estilo, { background: `linear-gradient(180deg, ${e.degrade.join(", ")})`, WebkitBackgroundClip: "text", color: "transparent" });
  if (e.contorno) Object.assign(estilo, { WebkitTextStroke: `1.5px ${e.contorno}` });
  if (e.sombra) estilo.textShadow = `2px 2px 0 ${e.sombra}`;
  if (e.brillo) estilo.filter = `drop-shadow(0 0 8px ${e.brillo}aa)`;
  return estilo;
}

export function familiaFuenteNombre(valor: string): string | undefined {
  const f = FUENTES_NOMBRE_NUEVAS.find((x) => x.valor === valor);
  return f ? `var(${f.familia})` : undefined;
}

// La fuente de puntos equipada (se lee una vez; sin la migración 0294 queda «clasica»).
let cache: string | null = null;
export function useFuentePuntos(): string {
  const [valor, setValor] = useState(cache ?? "clasica");
  useEffect(() => {
    if (cache) return;
    const sb = createClient();
    sb.auth.getUser().then(async ({ data }) => {
      if (!data.user) return;
      const { data: fila } = await sb.from("profiles").select("fuente_puntos").eq("id", data.user.id).maybeSingle();
      cache = ((fila as { fuente_puntos?: string } | null)?.fuente_puntos ?? "clasica") as string;
      setValor(cache);
    });
  }, []);
  return valor;
}

export function olvidarFuentePuntos() {
  cache = null;
}

export default function PuntosConFuente({ texto, valor, colorBase = "#FFC53D", tam = 20 }: { texto: string; valor: string | null | undefined; colorBase?: string; tam?: number }) {
  return (
    <span className="inline-block font-display font-black" style={{ fontSize: tam, transform: "skewX(-8deg)", ...estiloPuntos(valor, colorBase) }}>
      {texto}
    </span>
  );
}
