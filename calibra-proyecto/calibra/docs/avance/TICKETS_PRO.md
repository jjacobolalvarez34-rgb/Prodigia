# Prueba gratis de Pro con tickets (2026-10-30)

Estado: código listo, migración `0310_tickets_pro.sql` escrita y validada con pglast. **Falta aplicarla a mano.**
Sin aplicarla todo se comporta como antes (las lecturas fallan en silencio, las clases bloqueadas llevan a /pro).

## Cómo funciona
- Cada jugador tiene 3 tickets (`profiles.tickets_pro`, default 3, también para los existentes; sin permiso de UPDATE del cliente).
- Tocar una Clase Pro bloqueada (no la primera, que es gratis) abre «la clase bloqueada»: web `/clase-pro?id&ir&pro`, app `/clase-pro`.
  Muestra los tickets que quedan; «Usar 1 ticket» llama a `usar_ticket_clase(p_tecnica)` y abre la clase. Sin tickets: «Para continuar, hazte Pro» con botón a /pro.
- La clase abierta queda en `clases_con_ticket` para siempre (no gasta otro ticket si se vuelve a abrir; no gasta si eres Pro).
- Aprender (pestaña Clases, sin Pro) muestra cuántos tickets quedan (web `AprenderTabs`, app `PestanaAprender`).

## Dónde
- Lógica compartida: `calibra/src/lib/aprender/ticketsPro.ts` (`conTicketsPro` se aplica al final de cada `obtenerCamino*` de los 15 mundos, así web y app ven lo mismo).
- Validación server: `api/aprender/completar`, `api/enigmia/completar-leccion` y la RPC `completar_leccion` (redefinida en 0310) aceptan clases con ticket.
- Web: `CaminoContinuo` (nodo bloqueado por plan → /clase-pro), `app/[locale]/clase-pro/*`, mensajes `TicketsPro` (es/en).
- App: `mobile/src/app/clase-pro.tsx`, `mobile/src/ui/aprender/PestanaAprender.tsx`.

## Avance
- [x] Migración 0310 (validada)
- [x] Lógica compartida y caminos
- [x] Web: página de clase bloqueada, aviso en Aprender, mensajes es/en
- [x] App: pantalla de clase bloqueada, aviso en Aprender
- [x] Plan del pack de inicio: `docs/economy/PLAN_PACK_INICIO.md`
- [x] Aviso local «ciudad de doble Exp de hoy» en la app
- [x] Verificación (2026-10-30)

## Verificación
- calibra `tsc`: sin errores en lo tocado; el único error es `src/lib/temas/escenasFiestas.ts(170)`, del agente de colecciones de fiestas (no tocado).
- calibra `eslint` de lo tocado: limpio. `vitest`: 21 archivos de caminos/aprender/enigmia/eventos (271 tests) + `ticketsPro.test.ts` (2), todo pasa.
- mobile `tsc` y `eslint` de lo tocado: limpios. `npm run paridad`: alineadas.
- Mensajes es/en: 4414 claves en cada uno, mismas claves.
- Migración 0310: `val.py` OK (12 sentencias, 2 cuerpos plpgsql).

## Aviso de la ciudad de doble Exp (app)
- `mobile/src/lib/notificaciones.ts`: tipo local `dobleExp` (prioridad 5, canal novedades, 12:30 de hoy y los 2 días siguientes, solo si la ciudad es del jugador y está en la app; hoy no, si ya cumplió la meta; al menos 2 h antes del cambio de día UTC). Respeta el tope de 2 por día y el horario 08-21. Llega encendido también para quien ya tenía preferencias guardadas.
- `mobile/src/app/ajustes-avisos.tsx`: interruptor con el ícono del paracaídas (sale solo de `TIPOS_LOCALES`).
