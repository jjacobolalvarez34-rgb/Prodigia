import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { requireUsuario, NIVEL_CUENTA_MINIMO_RANKEDS } from "@/lib/auth/guard";
import Header from "@/components/Header";
import { IconCandado } from "@/components/icons";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Rankeds.bloqueado.metadata");
  return { title: t("title"), description: t("description", { nivel: NIVEL_CUENTA_MINIMO_RANKEDS }) };
}

interface Props {
  searchParams: Promise<{ nivel?: string }>;
}

// A donde llega cualquier cuenta real (no invitada, ver bloquearInvitado
// para ese otro caso) que todavía no llegó a nivel 5 de cuenta —
// requireNivelCuentaRankeds (src/lib/auth/guard.ts) redirige acá desde
// /rankeds. Mensaje concreto: nivel actual y cuántos niveles faltan, no
// un bloqueo genérico sin explicación.
export default async function RankedsBloqueadoPage({ searchParams }: Props) {
  const { nivel } = await searchParams;
  const t = await getTranslations("Rankeds.bloqueado");
  const supabase = await createClient();
  await requireUsuario(supabase, "/rankeds-bloqueado");

  const nivelActual = Number(nivel) || 1;
  const faltan = Math.max(0, NIVEL_CUENTA_MINIMO_RANKEDS - nivelActual);

  return (
    <>
      <Header autenticado />
      <div className="mx-auto flex w-full max-w-sm flex-1 flex-col items-center justify-center gap-5 px-4 py-16 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primario/10 text-primario">
          <IconCandado className="h-7 w-7" />
        </span>
        <div>
          <h1 className="font-display text-xl font-bold tracking-tight text-foreground">
            {t("titulo", { nivel: NIVEL_CUENTA_MINIMO_RANKEDS })}
          </h1>
          <p className="mt-2 text-sm text-texto-secundario">
            {t.rich("mensaje", {
              nivelActual,
              faltan,
              n: (chunks) => <span className="font-medium text-foreground">{chunks}</span>,
              f: (chunks) => <span className="font-medium text-foreground">{chunks}</span>,
            })}
          </p>
        </div>

        <Link
          href="/"
          className="rounded-full bg-primario px-5 py-2.5 text-sm font-semibold text-white transition-transform hover:scale-[1.03]"
        >
          {t("seguirPracticando")}
        </Link>
      </div>
    </>
  );
}
