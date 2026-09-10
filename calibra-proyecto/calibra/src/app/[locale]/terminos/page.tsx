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
            Prodigia es una app educativa de práctica adaptativa: cálculo mental, lógica, geografía,
            química, anatomía, teoría musical y otros temas que se van agregando, con dificultad que se
            ajusta a cómo te va. También incluye duelos en tiempo real contra otros jugadores (con ELO y
            rango), clanes, amigos, logros y un feed social. No reemplaza una clase ni una evaluación
            formal — es una herramienta de práctica.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="font-display text-lg font-bold text-foreground">Tu cuenta</h2>
          <p className="text-sm text-texto-secundario">
            Puedes crear una cuenta con email y contraseña, o entrar como invitado y decidir más adelante
            si quieres guardarla. Eres responsable de mantener tu contraseña segura.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="font-display text-lg font-bold text-foreground">Uso aceptable</h2>
          <p className="text-sm text-texto-secundario">
            Usá Prodigia para practicar de buena fe. No intentes manipular el sistema de Chispas, el
            ranking o los duelos con bots, scripts, o respondiendo automáticamente. En el chat de tu
            clan y en cualquier otro lugar donde puedas escribir texto libre, no uses lenguaje ofensivo,
            discriminatorio o abusivo — los mensajes que lo contienen se rechazan automáticamente antes
            de guardarse, y cualquier mensaje o perfil se puede reportar para que lo revisemos a mano.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="font-display text-lg font-bold text-foreground">Borrar tu cuenta</h2>
          <p className="text-sm text-texto-secundario">
            Podés borrar tu cuenta cuando quieras desde{" "}
            <Link href="/perfil" className="text-primario hover:underline">
              tu perfil
            </Link>
            . Esa acción es permanente: borra tu progreso, tus logros, tu historial de duelos, tu
            pertenencia a un clan, tus mensajes de chat y todo lo demás asociado a tu cuenta, y no se
            puede deshacer. Si jugaste un duelo contra alguien que después borra su cuenta, ese duelo
            puede desaparecer también de tu propio historial — es un efecto secundario de cómo funciona
            el borrado, no algo que puedas evitar del otro lado.
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
