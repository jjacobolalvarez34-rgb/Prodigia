import { getTranslations } from "next-intl/server";
import Boton from "@/components/Boton";
import { confirmarCuenta } from "./actions";

// GET /auth/confirm?token_hash=...&type=...&next=...&ref=...
//
// Bug real (2026-09-15): la primera versión de esto era un Route Handler
// que llamaba verifyOtp directo en el GET — funcionaba en teoría (no
// depende de cookies PKCE, a diferencia de /auth/callback), pero en la
// práctica el link seguía "gastándose" solo. Causa: muchos clientes de
// correo (Gmail incluido) escanean/pre-visitan automáticamente los links
// de un email por seguridad ANTES de que el usuario haga click — si esa
// visita automática ya consume un token de un solo uso, para cuando la
// persona hace click de verdad el token ya "expiró o se usó". Se vio en
// vivo en los logs de Brevo: un mismo correo con 3 eventos "Abierto"
// seguidos en el mismo minuto.
//
// Esta página es la mitigación estándar: el GET (lo que cualquier escáner
// automático dispara) solo MUESTRA un botón, nunca llama a Supabase. La
// verificación real (confirmarCuenta, en actions.ts) corre en un Server
// Action, que solo se dispara con un POST real — algo que un escáner que
// solo sigue links por GET no hace. El costo es un click extra para el
// usuario real; el beneficio es que el token ya no se puede gastar solo.
export default async function ConfirmarPage({
  searchParams,
}: {
  searchParams: Promise<{ token_hash?: string; type?: string; next?: string; ref?: string }>;
}) {
  const { token_hash: tokenHash, type, next, ref } = await searchParams;
  const t = await getTranslations("Common.confirmarCuenta");

  const valido = Boolean(tokenHash && type);

  return (
    <main className="flex min-h-svh items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-surface p-6 text-center shadow-xl">
        {valido ? (
          <>
            <h1 className="font-display text-lg font-bold text-foreground">{t("titulo")}</h1>
            <p className="mt-2 text-sm text-texto-secundario">{t("subtitulo")}</p>
            <form action={confirmarCuenta} className="mt-5">
              <input type="hidden" name="token_hash" value={tokenHash} />
              <input type="hidden" name="type" value={type} />
              <input type="hidden" name="next" value={next ?? "/"} />
              {ref && <input type="hidden" name="ref" value={ref} />}
              <Boton type="submit" className="w-full">
                {t("boton")}
              </Boton>
            </form>
          </>
        ) : (
          <p className="text-sm text-texto-secundario">{t("invalido")}</p>
        )}
      </div>
    </main>
  );
}
