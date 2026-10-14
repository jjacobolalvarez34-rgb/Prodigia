// Compartido entre /pro (página informativa completa) y el paso de
// promo Pro del flujo de landing (FlujoPromoPro.tsx) — una sola lista,
// no dos copias que se puedan desincronizar.
//
// Fase 4 (infraestructura de pagos, 2026-09-14): lista aterrizada a
// algo verificable en código, no solo marketing — cada beneficio de
// acá tiene un gate real (ver 0146_prodigia_pro_gates_y_estadisticas.sql
// y aplicar_suscripcion en 0145_infraestructura_pagos.sql). Se sacó
// "Beneficios en Aprender" (quedaba demasiado vago para prometerlo sin
// definir qué es exactamente) y se agregó "Sin anuncios", que sí es
// concreto desde el día uno de la fase de Google Ads.
export const BENEFICIOS_PRO = [
  {
    emoji: "⚡",
    titulo: "10.000 Chispas con cada pago",
    descripcion: "Al suscribirte y en cada renovación: cada mes con el plan mensual, una vez al año con el anual.",
  },
  {
    emoji: "🌍",
    titulo: "Los 15 mundos encendidos",
    descripcion: "Juega todas las ciudades mientras dure tu Pro, sin gastar Chispas en desbloquearlas.",
  },
  {
    emoji: "☄️",
    titulo: "300 Cometas al mes",
    descripcion: "La moneda premium, para lo legendario o para cambiarla por Chispas.",
  },
  {
    emoji: "💠",
    titulo: "2 cápsulas Pro cada semana",
    descripcion: "Cápsulas especiales que casi siempre traen un cosmético épico o legendario.",
  },
  {
    emoji: "🚫",
    titulo: "Sin anuncios",
    descripcion: "Cero publicidad, en cualquier pantalla de la web.",
  },
  {
    emoji: "🎨",
    titulo: "Cosméticos exclusivos",
    descripcion: "Animación Prisma y Fondo Prodigio — solo disponibles para cuentas Pro.",
  },
  {
    emoji: "📊",
    titulo: "Estadísticas avanzadas",
    descripcion: "Precisión por mundo y evolución en el tiempo, con más detalle que el perfil normal.",
  },
  {
    emoji: "🚀",
    titulo: "Acceso anticipado",
    descripcion: "Prueba mundos y funciones nuevas antes de que salgan para todos.",
  },
  {
    emoji: "🎓",
    titulo: "Clases",
    descripcion: "Pestaña Clases dentro de Aprender de cada mundo: lecciones progresivas y dependientes entre sí, con ejemplos resueltos paso a paso y un quiz entre lecciones. La primera clase es gratis.",
  },
] as const;
