# Avance: cápsulas y tienda (pedido 2026-10-23)

Estado: TERMINADO y verificado (calibra tsc sin errores propios, eslint limpio, vitest src/lib/recompensas 10/10 archivos; mobile tsc y eslint limpios; es/en con paridad).
Migración: NO hace falta (todo funciona sin tocar la base). No existe 0303.

## 1. Salir antes de abrir una cápsula — HECHO
Qué pasaba: la escena (RevelacionWeb / fx/Revelacion) pedía el premio a la base (abrir_capsula) APENAS aparecía la cápsula,
antes de tocarla. Si el jugador se iba, el premio ya estaba entregado y la cápsula desaparecía de «Por abrir» sin que viera qué salió.
La base nunca perdía el premio ni permitía abrir dos veces (for update + abierta_at).
Arreglo:
- El premio se pide AL TOCAR la cápsula (temblor suave tapa la espera). Cerrar antes (× / Esc / Atrás) = sigue cerrada.
- Justo antes de pedirlo se anota la cápsula en el aparato (localStorage / AsyncStorage); se borra al ver el premio (onVisto).
  Al volver a Recompensas (y a la tienda), las marcas se cruzan con capsulas_usuario (RLS permite leer las propias):
  cerrada → se olvida; abierta con premio → se muestra la escena con lo que salió (sin pedir nada); no aparece → se guarda 14 días.
- Archivos: calibra/src/lib/recompensas/capsulasSinVer.ts (+ .test.ts), capsulasSinVerWeb.ts,
  calibra/src/components/recompensas/CapsulasSinVer.tsx, AbrirCapsula.tsx, fx/RevelacionWeb.tsx, RecompensasClient.tsx,
  tienda/CapsulasCometas.tsx; mobile/src/lib/capsulasSinVer.ts, ui/recompensas/CapsulasSinVer.tsx, ui/recompensas/AbrirCapsula.tsx,
  ui/fx/Revelacion.tsx, app/recompensas.tsx, ui/pagos/CapsulasCometas.tsx, ui/CapsulaNivel.tsx (cerrable).
- messages es/en: Recompensas.capsulas.sinVer.

## 2. Animación de compra detrás de los botones — HECHO
Qué pasaba: app: la escena (absoluteFill) se dibujaba dentro de la caja de CapsulasCometas en el ScrollView de la tienda;
lo de abajo quedaba encima. Web: el overlay fixed quedaba dentro del árbol de la tienda.
Arreglo: app → fx/Revelacion va en un <Modal> transparente a pantalla completa (Atrás manejado por fase).
Web → RevelacionWeb se monta con createPortal en document.body, z-[200].

## 3. Saldo de Cometas en Temas — HECHO
App: mobile/src/app/tienda.tsx, la pastilla de saldo de arriba a la derecha muestra Cometas cuando la pestaña es «temas».
Web: TiendaAmpliada.tsx, pastilla de Cometas arriba a la derecha de la cabecera de la sección de temas (modo tienda).

## Siguiente paso exacto
Nada pendiente del pedido. Probar a mano: abrir una cápsula y cerrar con la × antes de tocarla (debe seguir en «Por abrir»);
tocarla y salir durante el suspenso (al volver a Recompensas debe aparecer «No alcanzaste a ver lo que te salió»);
«Abrir ya» en la tienda (la escena debe tapar todo); pestaña Temas (saldo de Cometas arriba a la derecha).
Nota: calibra tsc muestra errores BigInt en src/lib/practica/decimales.test.ts (archivo de otro agente, no de este pedido).
