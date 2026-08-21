import { motion } from "framer-motion";

// Fase 4 ("Duelos: llevar el progreso en vivo..."): bug de freeze de ~1s
// al terminar tu parte — entre la última respuesta y que el resumen
// esté listo, el fetch a /api/practica|enigmia/finish (y, si es un
// duelo, el fetch subsiguiente a /api/duelos/resultado) tarda una
// fracción de segundo, y sin esto la última pregunta se quedaba
// congelada en pantalla mientras tanto. Ahora es una fase explícita
// entre "sprint" y "resumen" en cada *PracticaClient — carga
// intencional, no un freeze accidental.
export default function TransicionFinalizando() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      className="flex flex-1 flex-col items-center justify-center gap-4 px-4 py-20"
    >
      <span className="h-8 w-8 animate-spin rounded-full border-2 border-primario/30 border-t-primario" />
      <p className="text-sm font-medium text-texto-secundario">Cerrando la partida…</p>
    </motion.div>
  );
}
