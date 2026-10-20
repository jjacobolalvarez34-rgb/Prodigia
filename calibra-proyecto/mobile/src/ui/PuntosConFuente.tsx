import { useEffect, useState } from "react";
import { FUENTES_PUNTOS } from "@/lib/recompensas/catalogoAmpliado";
import { supabase } from "~/lib/supabase";
import { fuente } from "~/tema";
import Texto from "./Texto";

// El «+N» con una fuente de puntos (0294), igual que en la web: su letra, su color y su
// acabado, siempre inclinado 8°. «clasica» (o sin fuente) = el de siempre.
let cache: string | null = null;

export function olvidarFuentePuntos() {
  cache = null;
}

export function useFuentePuntos(): string {
  const [valor, setValor] = useState(cache ?? "clasica");
  useEffect(() => {
    if (cache) return;
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return;
      const { data: fila } = await supabase.from("profiles").select("fuente_puntos").eq("id", data.user.id).maybeSingle();
      cache = ((fila as { fuente_puntos?: string } | null)?.fuente_puntos ?? "clasica") as string;
      setValor(cache);
    });
  }, []);
  return valor;
}

export default function PuntosConFuente({ texto, valor, colorBase, tam = 21 }: { texto: string; valor: string | null | undefined; colorBase: string; tam?: number }) {
  const f = FUENTES_PUNTOS.find((x) => x.valor === valor);
  const e = f?.estilo;
  // React Native no pinta degradés en el texto: el color del medio del degradé.
  const colorTexto = e ? (e.degrade ? e.degrade[1] : e.color) : colorBase;
  const sombra = e?.brillo ?? e?.sombra ?? colorBase;
  return (
    <Texto
      style={{
        fontFamily: f?.archivo ?? fuente.display,
        fontSize: f?.archivo === "PressStart2P" ? tam * 0.7 : tam,
        color: colorTexto,
        textShadowColor: e?.contorno ?? sombra,
        textShadowRadius: e?.contorno ? 2 : 10,
        textShadowOffset: e?.sombra && !e.brillo ? { width: 2, height: 2 } : { width: 0, height: 0 },
        transform: [{ skewX: "-8deg" }],
      }}
    >
      {texto}
    </Texto>
  );
}
