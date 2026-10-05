import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { mundoDobleExperiencia } from "@/lib/eventos/dobleExperiencia";

// Cartel del evento del día en la portada: qué mundo da doble experiencia hoy
// (src/lib/eventos/dobleExperiencia.ts; la base duplica la Exp, 0247). En la app es
// el paquete que cae en paracaídas sobre esa ciudad.
export default async function EventoDobleExperiencia() {
  const t = await getTranslations("Componentes.eventoDobleExperiencia");
  const tMundos = await getTranslations("Mundos.nombres");
  const mundo = mundoDobleExperiencia();
  const nombre = tMundos(mundo);
  return (
    <Link
      href={`/${mundo}`}
      className="group flex items-center gap-4 rounded-2xl border border-logro/50 bg-logro/10 px-5 py-4 transition-colors hover:bg-logro/15"
    >
      <span className="text-3xl transition-transform group-hover:-translate-y-1" aria-hidden="true">
        🪂
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-display font-bold text-foreground">{t("titulo", { mundo: nombre })}</p>
        <p className="text-xs text-texto-secundario">{t("descripcion", { mundo: nombre })}</p>
      </div>
      <span className="shrink-0 rounded-full bg-logro px-4 py-2 font-display text-sm font-semibold text-[#2A1A00]">{t("ir")}</span>
    </Link>
  );
}
