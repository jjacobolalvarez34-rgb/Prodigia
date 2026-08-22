import LogoSpinner from "@/components/LogoSpinner";

// Next.js muestra esto automáticamente como fallback de Suspense mientras
// carga la próxima página (incluye login/logout, que navegan con
// router.push) — así las transiciones grandes entre pantallas tienen un
// overlay con marca en vez de quedar en blanco (Fase AA).
export default function GlobalLoading() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 backdrop-blur-sm">
      <LogoSpinner size={96} />
    </div>
  );
}
