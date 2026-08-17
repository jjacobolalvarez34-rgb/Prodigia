import Link from "next/link";
import type { Metadata } from "next";
import Header from "@/components/Header";
import LoginForm from "./LoginForm";

interface Props {
  searchParams: Promise<{ next?: string; error?: string }>;
}

export const metadata: Metadata = {
  title: "Entrar",
  description: "Iniciá sesión en Prodigia con tu email y contraseña.",
};

export default async function LoginPage({ searchParams }: Props) {
  const { next, error } = await searchParams;

  return (
    <>
      <Header />
      <div className="flex flex-1 items-center justify-center px-4 py-20">
        <div className="w-full max-w-sm rounded-2xl border border-border bg-surface p-8 shadow-sm">
          <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
            Entrá a Prodigia
          </h1>
          <p className="mt-2 mb-7 text-sm text-texto-secundario">Con tu email y contraseña.</p>

          <LoginForm next={next} />

          {error && (
            <p className="mt-3 text-sm text-error">No pudimos confirmar el enlace. Probá de nuevo.</p>
          )}

          <div className="mt-6 flex flex-col gap-1.5 text-sm">
            <Link href="/recuperar" className="text-texto-secundario hover:underline">
              ¿Olvidaste tu contraseña?
            </Link>
            <p className="text-texto-secundario">
              ¿No tenés cuenta?{" "}
              <Link href="/registro" className="font-medium text-primario hover:underline">
                Creá una
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
