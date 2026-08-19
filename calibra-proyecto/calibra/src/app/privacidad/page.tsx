import Link from "next/link";
import Header from "@/components/Header";

export const metadata = {
  title: "Privacidad — Prodigia",
  description: "Qué datos guarda Prodigia y para qué los usa.",
};

export default function PrivacidadPage() {
  return (
    <>
      <Header />
      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-16 sm:px-6">
        <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">Privacidad</h1>
        <p className="text-sm text-texto-secundario">
          Somos una app educativa chica — esto explica en lenguaje simple qué guardamos y por qué.
        </p>

        <section className="flex flex-col gap-2">
          <h2 className="font-display text-lg font-bold text-foreground">Qué datos guardamos</h2>
          <ul className="list-disc pl-5 text-sm text-texto-secundario">
            <li>Tu email (si creaste cuenta con email y contraseña).</li>
            <li>Tu nombre visible y tu progreso: nivel por tema, racha, Chispas, Experiencia, logros.</li>
            <li>Tu actividad de práctica: qué respondiste, si acertaste, cuánto tardaste — esto es lo
              que usamos para calibrar la dificultad a tu nivel.</li>
            <li>Si sos parte de un grupo de un profesor, ese profesor puede ver tu progreso agregado
              del grupo (nivel, racha, precisión), nunca tus respuestas individuales fuera de eso.</li>
          </ul>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="font-display text-lg font-bold text-foreground">Para qué lo usamos</h2>
          <p className="text-sm text-texto-secundario">
            Solo para que la app funcione: calibrar tu nivel, calcular tu progreso, mostrar el ranking y
            el feed, y nada más. No vendemos tus datos ni los compartimos con terceros con fines
            publicitarios.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="font-display text-lg font-bold text-foreground">Borrar tus datos</h2>
          <p className="text-sm text-texto-secundario">
            Desde{" "}
            <Link href="/perfil" className="text-primario hover:underline">
              tu perfil
            </Link>{" "}
            podés borrar tu cuenta por completo — se elimina tu progreso, tus logros y tu historial de
            verdad, de forma permanente.
          </p>
        </section>
      </div>
    </>
  );
}
