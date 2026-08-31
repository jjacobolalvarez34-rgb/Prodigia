import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import HeaderFlujo from "@/components/landing/HeaderFlujo";
import type { LogicPuzzle } from "@/types/database";
import DemoEnigmiaClient from "./DemoEnigmiaClient";

// Ver nota de /demo/numeria/page.tsx: mismo criterio, sin
// requireMundoEnigmia. Acá sí hace falta una consulta real (el banco de
// acertijos de "deducción" no se genera por código, a diferencia de
// memoria/patrones/computacional — ver EnigmiaSprintRunner.tsx).
export default async function DemoEnigmiaPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: puzzles } = await supabase
    .from("logic_puzzles")
    .select("id, tipo, dificultad, contenido, respuesta");

  return (
    <>
      <HeaderFlujo />
      <DemoEnigmiaClient puzzles={(puzzles ?? []) as LogicPuzzle[]} />
    </>
  );
}
