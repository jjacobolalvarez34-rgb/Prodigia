import { useTranslations } from "next-intl";

// La etiqueta «NUEVO» (src/lib/recompensas/novedades.ts), arriba a la derecha de una tarjeta.
export default function EtiquetaNuevo({ className = "absolute -right-1.5 -top-1.5" }: { className?: string }) {
  const t = useTranslations("Comun");
  return (
    <span className={`${className} z-10 rotate-6 rounded-md border-[1.5px] border-[#05060F] bg-[#FF5D8F] px-1.5 py-0.5 font-mono text-[9px] font-black tracking-widest text-white shadow-[2px_2px_0_0_#05060F]`}>
      {t("nuevo")}
    </span>
  );
}
