import Link from "next/link";
import Header from "@/components/Header";
import RegistroForm from "./RegistroForm";

interface Props {
  searchParams: Promise<{ ref?: string }>;
}

export default async function RegistroPage({ searchParams }: Props) {
  const { ref } = await searchParams;

  return (
    <>
      <Header />
      <div className="flex flex-1 items-center justify-center px-4 py-20">
        <div className="w-full max-w-sm rounded-2xl border border-border bg-surface p-8 shadow-sm">
          <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
            Creá tu cuenta
          </h1>
          <p className="mt-2 mb-7 text-sm text-texto-secundario">Con tu email y una contraseña.</p>

          <RegistroForm refId={ref} />

          <p className="mt-6 text-sm text-texto-secundario">
            ¿Ya tenés cuenta?{" "}
            <Link href="/login" className="font-medium text-primario hover:underline">
              Iniciá sesión
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
