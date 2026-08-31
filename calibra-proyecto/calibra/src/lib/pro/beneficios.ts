// Compartido entre /pro (página informativa completa) y el paso de
// promo Pro del flujo de landing (FlujoPromoPro.tsx) — una sola lista,
// no dos copias que se puedan desincronizar.
export const BENEFICIOS_PRO = [
  {
    emoji: "⚡",
    titulo: "Chispas mensuales",
    descripcion: "Una recarga de Chispas todos los meses, para gastar en la Tienda sin depender solo de jugar.",
  },
  {
    emoji: "🎨",
    titulo: "Cosméticos exclusivos",
    descripcion: "Marcos de perfil y tipografías que no están disponibles para cuentas gratuitas.",
  },
  {
    emoji: "📊",
    titulo: "Estadísticas avanzadas",
    descripcion: "Métricas más profundas de tu progreso: precisión por tema, evolución en el tiempo, más detalle que el perfil normal.",
  },
  {
    emoji: "📚",
    titulo: "Beneficios en Aprender",
    descripcion: "Ventajas en las secciones de Aprender de cada mundo.",
  },
  {
    emoji: "🚀",
    titulo: "Acceso anticipado",
    descripcion: "Probá mundos y funciones nuevas antes de que salgan para todos.",
  },
] as const;
