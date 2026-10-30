import { redirect } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { requireUsuario, bloquearInvitado } from "@/lib/auth/guard";
import { clasesConTicket } from "@/lib/aprender/ticketsPro";
import Header from "@/components/Header";
import ClaseProClient from "./ClaseProClient";

interface Props {
  searchParams: Promise<{ id?: string; ir?: string; pro?: string }>;
}

// Solo rutas internas (nada de "//otro-sitio" ni URLs completas).
function rutaInterna(valor: string | undefined): string | null {
  return valor && valor.startsWith("/") && !valor.startsWith("//") && !valor.includes("\\") ? valor : null;
}

// Clase Pro bloqueada (prueba con tickets, 0310): cuántos tickets quedan y el
// botón para gastar uno en esta clase; sin tickets, «Para continuar, hazte Pro».
// Sin la migración (o siendo Pro) se comporta como antes: va a /pro o a la clase.
export default async function ClaseProPage({ searchParams }: Props) {
  const { id, ir, pro } = await searchParams;
  const supabase = await createClient();
  const { user, profile } = await requireUsuario(supabase, "/aprender");
  const tBloqueos = await getTranslations("Bloqueos.invitado.secciones");
  bloquearInvitado(user, tBloqueos("aprender"));

  const proHref = rutaInterna(pro) ?? "/pro";
  const destino = rutaInterna(ir);
  if (!id || !destino) redirect(proHref);
  if (profile?.plan === "pro") redirect(destino);

  const tickets = (profile as { tickets_pro?: number | null } | null)?.tickets_pro;
  if (typeof tickets !== "number") redirect(proHref);
  if ((await clasesConTicket(supabase, user.id)).has(id)) redirect(destino);

  const locale = await getLocale();
  const { data: fila } = await supabase.from("techniques").select("nombre, nombre_en").eq("id", id).maybeSingle();
  const { data: filaLogica } = fila
    ? { data: null }
    : await supabase.from("logic_techniques").select("nombre, nombre_en").eq("id", id).maybeSingle();
  const leccion = (fila ?? filaLogica) as { nombre: string; nombre_en: string | null } | null;
  if (!leccion) redirect(proHref);
  const nombre = locale === "en" && leccion.nombre_en ? leccion.nombre_en : leccion.nombre;

  return (
    <>
      <Header autenticado />
      <div className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-6 px-4 py-12 sm:px-6">
        <ClaseProClient tecnicaId={id} nombre={nombre} tickets={tickets} destino={destino} proHref={proHref} />
      </div>
    </>
  );
}
