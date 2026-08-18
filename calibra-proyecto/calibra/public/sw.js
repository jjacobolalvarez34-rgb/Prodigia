// Service worker mínimo de Prodigia (Fase U-PWA).
//
// Objetivo explícito de esta fase: instalabilidad + carga más rápida en
// visitas repetidas — NADA de modo offline completo (la app depende de
// Supabase en vivo para casi todo: sesión, práctica, duelos en tiempo
// real). Por eso el alcance del cache es deliberadamente angosto:
//
//  - SÍ cachea (cache-first, para siempre): /_next/static/* — Next les
//    pone un hash en el nombre de archivo, así que la misma URL nunca
//    cambia de contenido. Cachearlos agresivo es 100% seguro.
//  - SÍ cachea (cache-first): el ícono/manifest y algunos assets
//    estáticos sueltos de /public.
//  - NO intercepta absolutamente nada más: ni navegación (los .html/RSC
//    de cada página), ni /api/*, ni las llamadas a Supabase. Todo eso
//    sigue yendo directo a la red como si este service worker no
//    existiera — así nunca se corre el riesgo de mostrarle a alguien
//    una sesión vieja, un resultado de duelo viejo, o una versión
//    vieja de la app después de un deploy.

const CACHE_VERSION = "prodigia-static-v1";

const RUTAS_ESTATICAS_CACHEABLES = [/^\/_next\/static\//, /^\/icon\.svg$/, /^\/favicon\.ico$/];

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((claves) => Promise.all(claves.filter((c) => c !== CACHE_VERSION).map((c) => caches.delete(c))))
      .then(() => self.clients.claim())
  );
});

function esCacheable(url) {
  return RUTAS_ESTATICAS_CACHEABLES.some((patron) => patron.test(url.pathname));
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (!esCacheable(url)) return;

  event.respondWith(
    caches.open(CACHE_VERSION).then(async (cache) => {
      const cacheado = await cache.match(request);
      if (cacheado) return cacheado;
      const respuesta = await fetch(request);
      if (respuesta.ok) cache.put(request, respuesta.clone());
      return respuesta;
    })
  );
});
