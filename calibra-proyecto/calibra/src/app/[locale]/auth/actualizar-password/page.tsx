import Header from "@/components/Header";
import ActualizarPasswordForm from "./ActualizarPasswordForm";

export default function ActualizarPasswordPage() {
  return (
    <>
      <Header />
      <div className="flex flex-1 items-center justify-center px-4 py-20">
        <div className="w-full max-w-sm rounded-2xl border border-border bg-surface p-8 shadow-sm">
          <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
            Elegí tu nueva contraseña
          </h1>
          <p className="mt-2 mb-7 text-sm text-texto-secundario">
            Esto reemplaza la contraseña anterior de tu cuenta.
          </p>
          <ActualizarPasswordForm />
        </div>
      </div>
    </>
  );
}
