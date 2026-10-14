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
// `id`: clave de traducción en la web (messages → ProBeneficios.<id>); la app usa el
// texto en español de acá (revisión 2026-10-14: en la web en inglés salía en español).
// `icono`: dibujo de src/lib/iconosTrazo.ts (antes era un emoji).
import type { NombreTrazo } from "@/lib/iconosTrazo";

export const BENEFICIOS_PRO: readonly { id: string; icono: NombreTrazo; titulo: string; descripcion: string }[] = [
  {
    id: "chispas",
    icono: "rayo",
    titulo: "+25 % de Chispas al jugar",
    descripcion: "Cada partida te da un cuarto más de Chispas. La Experiencia es la misma para todos, así no da ventaja en ligas ni rankings.",
  },
  {
    id: "mundos",
    icono: "mundos",
    titulo: "Los 15 mundos encendidos",
    descripcion: "Juega todas las ciudades mientras dure tu Pro, sin gastar Chispas en desbloquearlas.",
  },
  {
    id: "cometas",
    icono: "cometa",
    titulo: "300 Cometas al mes",
    descripcion: "La moneda premium, para lo legendario o para cambiarla por Chispas.",
  },
  {
    id: "capsulas",
    icono: "capsula",
    titulo: "2 cápsulas Pro cada semana",
    descripcion: "Cápsulas especiales que casi siempre traen un cosmético épico o legendario. Llegan la semana que entras a jugar.",
  },
  {
    id: "anuncios",
    icono: "sinAnuncios",
    titulo: "Sin anuncios",
    descripcion: "Cero publicidad, en cualquier pantalla de la web.",
  },
  {
    id: "cosmeticos",
    icono: "pincel",
    titulo: "Cosméticos exclusivos",
    descripcion: "Animación Prisma y Fondo Prodigio — solo disponibles para cuentas Pro.",
  },
  {
    id: "estadisticas",
    icono: "grafico",
    titulo: "Estadísticas avanzadas",
    descripcion: "Precisión por mundo y evolución en el tiempo, con más detalle que el perfil normal.",
  },
  {
    id: "anticipado",
    icono: "cohete",
    titulo: "Acceso anticipado",
    descripcion: "Prueba mundos y funciones nuevas antes de que salgan para todos.",
  },
  {
    id: "clases",
    icono: "birrete",
    titulo: "Clases",
    descripcion: "Pestaña Clases dentro de Aprender de cada mundo: lecciones progresivas y dependientes entre sí, con ejemplos resueltos paso a paso y un quiz entre lecciones. La primera clase es gratis.",
  },
];
