import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireUsuario, bloquearInvitado } from "@/lib/auth/guard";
import Header from "@/components/Header";
import MundoClanesMapa, { type ParcelaClan } from "@/components/clanes/MundoClanesMapa";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Clanes.mundo.metadata");
  return { title: t("title"), description: t("description") };
}

export default async function MundoClanesPage() {
  const t = await getTranslations("Clanes.mundo");
  const supabase = await createClient();
  const { user } = await requireUsuario(supabase, "/clanes/mundo");
  const tBloqueos = await getTranslations("Bloqueos.invitado.secciones");
  bloquearInvitado(user, tBloqueos("clanes"));

  const { data } = await supabase.rpc("mapa_clanes");

  return (
    <>
      <Header autenticado invitado={user.is_anonymous} />
      <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 px-4 py-10 sm:px-6">
        <div>
          <Link href="/clanes" className="text-xs font-medium text-texto-secundario hover:text-foreground">
            {t("volver")}
          </Link>
          <h1 className="mt-2 font-display text-2xl font-bold tracking-tight text-foreground">{t("titulo")}</h1>
          <p className="mt-1 text-sm text-texto-secundario">{t("subtitulo")}</p>
        </div>
        <MundoClanesMapa parcelas={(data as ParcelaClan[] | null) ?? []} />
      </div>
    </>
  );
}
