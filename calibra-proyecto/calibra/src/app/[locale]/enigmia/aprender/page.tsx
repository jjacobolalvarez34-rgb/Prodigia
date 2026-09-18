import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { requireMundoEnigmia, bloquearInvitado } from "@/lib/auth/guard";
import { obtenerCaminoEnigmia } from "@/lib/enigmia/path";
import Header from "@/components/Header";
import CaminoContinuo, { type UnidadCaminoGenerico } from "@/components/CaminoContinuo";
import AprenderLayout from "@/components/AprenderLayout";

const COLOR = "#0E9F6E";

export default async function EnigmiaAprenderPage() {
  const t = await getTranslations("Enigmia.aprenderPagina");
  const supabase = await createClient();
  const { user } = await requireMundoEnigmia(supabase, "/enigmia/aprender");
  const tBloqueos = await getTranslations("Bloqueos.invitado.secciones");
  bloquearInvitado(user, tBloqueos("aprender"));
  const unidades = await obtenerCaminoEnigmia(supabase, user.id);

  const totalDominadas = unidades.reduce((acc, u) => acc + u.nodos.filter((n) => n.estado === "completado").length, 0);
  const totalTecnicas = unidades.reduce((acc, u) => acc + u.nodos.length, 0);

  const unidadesGenericas: UnidadCaminoGenerico[] = unidades.map((u) => ({
    id: u.categoria,
    nombre: u.nombre,
    nodos: u.nodos.map((n) => ({ id: n.id, slug: n.slug, nombre: n.nombre, estado: n.estado })),
  }));

  return (
    <>
      <Header autenticado />
      <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-8 px-4 py-12 sm:px-6">
        <AprenderLayout
          titulo={t("titulo")}
          subtitulo=""
          progresoLabel={t("progreso")}
          tecnicasTexto={t("progresoTecnicas", { dominadas: totalDominadas, total: totalTecnicas })}
          colorHex={COLOR}
          totalDominadas={totalDominadas}
          totalTecnicas={totalTecnicas}
          unidadesSidebar={unidades.map((u) => ({
            id: u.categoria,
            nombre: u.nombre,
            dominadas: u.nodos.filter((n) => n.estado === "completado").length,
            total: u.nodos.length,
          }))}
        >
          <CaminoContinuo unidades={unidadesGenericas} basePath="/enigmia/aprender" colorHex={COLOR} />
        </AprenderLayout>
      </div>
    </>
  );
}
