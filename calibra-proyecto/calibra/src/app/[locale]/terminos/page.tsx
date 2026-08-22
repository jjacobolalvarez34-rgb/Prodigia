import Link from "next/link";
import Header from "@/components/Header";

export const metadata = {
  title: "Términos de uso — Prodigia",
  description: "Términos de uso de Prodigia, en lenguaje simple.",
};

export default function TerminosPage() {
  return (
    <>
      <Header />
      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-16 sm:px-6">
        <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">Términos de uso</h1>
        <p className="text-sm text-texto-secundario">
          Esto está escrito en lenguaje simple a propósito — no es un contrato legal complejo, es una
          explicación honesta de qué es Prodigia y cómo funciona.
        </p>

        <section className="flex flex-col gap-2">
          <h2 className="font-display text-lg font-bold text-foreground">Qué es Prodigia</h2>
          <p className="text-sm text-texto-secundario">
            Prodigia es una app educativa de práctica adaptativa: cálculo mental, lógica y otros temas
            que se van agregando, con dificultad que se ajusta a cómo te va. No reemplaza una clase ni
            una evaluación formal — es una herramienta de práctica.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="font-display text-lg font-bold text-foreground">Tu cuenta</h2>
          <p className="text-sm text-texto-secundario">
            Podés crear una cuenta con email y contraseña, o entrar como invitado y decidir más adelante
            si querés guardarla. Sos responsable de mantener tu contraseña segura.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="font-display text-lg font-bold text-foreground">Uso aceptable</h2>
          <p className="text-sm text-texto-secundario">
            Usá Prodigia para practicar de buena fe. No intentes manipular el sistema de Chispas, el
            ranking o los duelos con bots, scripts, o respondiendo automáticamente.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="font-display text-lg font-bold text-foreground">Borrar tu cuenta</h2>
          <p className="text-sm text-texto-secundario">
            Podés borrar tu cuenta cuando quieras desde{" "}
            <Link href="/perfil" className="text-primario hover:underline">
              tu perfil
            </Link>
            . Esa acción es permanente: borra tu progreso, tus logros y tu historial, y no se puede
            deshacer.
          </p>
        </section>

        <p className="text-xs text-texto-secundario">
          Ver también nuestra{" "}
          <Link href="/privacidad" className="text-primario hover:underline">
            política de privacidad
          </Link>
          .
        </p>
      </div>
    </>
  );
}
