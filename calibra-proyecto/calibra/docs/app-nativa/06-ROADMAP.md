# 06 — Roadmap de la app nativa

> Estado: PROPUESTA. Cada fase tiene entregables y un criterio de "terminado" verificable, para
> trabajarlas con el sistema de claims de `docs/agent-work/ACTIVE.md`. Los nombres de agente son
> los de `.opencode/agents/`. Sin estimaciones de calendario: dependen de cuántas sesiones por
> semana se dediquen.

## Fase 0 — Limpiar el terreno (bloqueante)

| # | Tarea | Agente | Terminado cuando |
|---|---|---|---|
| 0.1 | Rotar key de fal.ai y sacarla del repo (SEG-01) | auth-security | Key vieja revocada; `opencode.json` usa `{env:FAL_KEY}` |
| 0.2 | Supabase CLI + reconciliar migraciones aplicadas en producción (SEG-09) | backend-supabase | `supabase migration list` coincide local vs remoto |
| 0.3 | Migración de seguridad: S5, gate de edad en RPC de Trastienda, T-01..T-04 (SEG-02/03/08) | auth-security | Migración aplicada; prueba con la clave anon de que las RPC rechazan |
| 0.4 | Secreto en webhooks de Edge Functions (SEG-04) | backend-supabase | Llamada sin secreto → 401 |
| 0.5 | Decisión PO: Trastienda en Android, umbral de edad, chat de menores (PROD-01/02) | orchestrator + PO | Decisión escrita en `docs/DECISIONS.md` |
| 0.6 | Corregir `AGENTS.md`, `BRAND.md`, `PROJECT-STATE.md` (DOC-01/02) | documentation | Ningún doc de entrada dice "vos", "8 mundos", "no hay git" ni "0114" |
| 0.7 | Toast global, confirmar salida, Ajustes > Cuenta en la web (UX-04) | ux-ui | Implementado y verificado en navegador |
| 0.8 | CI mínimo en GitHub Actions: tsc + lint + vitest (REPO-05) | repo-architect | Un PR con un error de tipos falla en CI |

## Fase 1 — Monorepo y `core` compartido

| # | Tarea | Terminado cuando |
|---|---|---|
| 1.1 | Aplanar el repo y mover la web a `apps/web` (commit aislado, sin cambios de lógica) + limpiar REPO-01..04 | `next build` y vitest idénticos a antes |
| 1.2 | Crear `packages/core` y mover la lógica pura de `src/lib` (generadores, ELO, retos, worldLevel, racha, mundos, validadores, rng) con sus tests | 92+ archivos de test pasan en Node sin DOM; regla de lint que prohíbe `react`/`next`/`@supabase` en core |
| 1.3 | `packages/tokens` (colores base + neón por mundo, radios, tipografía) → genera CSS para web | La web usa los tokens generados; `page.tsx` itera el catálogo en vez de 13 bloques |
| 1.4 | `packages/i18n` con `messages/es.json` y `en.json` | La web lee desde el paquete; script de paridad de claves sigue pasando |
| 1.5 | Adaptador de sesión Bearer en rutas API (§5.2 de `01-`) para `practica/finish`, `attempts`, `logic-attempts`, `reto-diario/completar` | Test: la misma ruta responde igual con cookie y con Bearer |
| 1.6 | Spike de fórmulas matemáticas en RN (riesgo R1) | Decisión escrita con la opción ganadora y medición |

## Fase 2 — Esqueleto jugable (1 mundo, de punta a punta)

| # | Tarea | Terminado cuando |
|---|---|---|
| 2.1 | App Expo en `apps/mobile` con expo-router, fuentes, tokens, ícono y splash | Instala en un teléfono real vía EAS (build interno) |
| 2.2 | Auth: invitado, email/contraseña, Google nativo, App Links para `/auth/confirm` | Crear cuenta en la app y ver el mismo progreso en la web |
| 2.3 | Componentes base: `Boton3D`, `Tarjeta`, `HUD`, `BarraInferior`, `Teclado`, `Toast` | Pantalla de catálogo de componentes dentro de la app (solo en builds de desarrollo) |
| 2.4 | Hoy (versión mínima) + Mundos (carrusel) + Hub de Numeria | Navegación completa con el botón atrás de Android correcto |
| 2.5 | Sprint de Numeria con generadores de `core` + `insertar_intento` + finish | Una partida en la app suma XP visible en la web |
| 2.6 | Resultado con cascada de recompensas (datos del servidor) | Level-up de mundo y de cuenta se ven animados |
| 2.6b | **Placa de jugador** en sus 5 variantes con **todo** el catálogo actual (fondos GIF/galería/colores, avatar GIF, marcos, 8 fuentes, color, 10 animaciones de nombre, título, datos) — decisión del PO: no se recorta | La Placa de una cuenta QA con todo comprado se ve igual en web y app (video lado a lado) |
| 2.7 | Medir rendimiento en gama baja | Arranque < 2,5 s, sprint a 60 fps |

**Hito: prueba interna con 5 personas del grupo cerrado.**

## Fase 3 — Sensación de juego

| # | Tarea | Terminado cuando |
|---|---|---|
| 3.1 | Momentos firma (acierto, error, combo, racha, Chispas al HUD) con Reanimated/Skia | Revisado en video contra `02-SISTEMA-VISUAL.md` §7 |
| 3.2 | Háptica y set de 16 sonidos | Interruptores separados en Ajustes funcionando |
| 3.3 | Fondo vivo por mundo (glifos) | ≤ 3 ms por cuadro en gama baja |
| 3.4 | Ilustraciones de las 13 ciudades (encargo/generación) + animación de desbloqueo | Las 13 integradas, encendidas y apagadas |
| 3.5 | "Reducir movimiento" respetado en todo | Revisión con la opción activada |

## Fase 4 — Los 13 mundos y Aprender

| # | Tarea | Terminado cuando |
|---|---|---|
| 4.1 | Runner genérico + variantes: teclado, opción múltiple, mapa (Geografía), pentagrama (Melodía), cartas (Naipia), código (Codia) | Cada mundo jugable en práctica y diagnóstico |
| 4.2 | Camino de Aprender + lecciones con visuales portados, mundo por mundo (Técnicas gratis, Clases Pro) | Fila nueva en `PARIDAD_MUNDOS.md`: "Funciona en la app Android" con ✓ en los 13 |
| 4.3 | Retos diario y semanal | Mismo set que la web (seed por fecha) |
| 4.4 | Práctica libre offline + cola de intentos (requiere decisión PO y RPC nueva) | Modo avión: se juega; al reconectar se sincroniza sin duplicar |

## Fase 5 — Competir y Social

| # | Tarea | Terminado cuando |
|---|---|---|
| 5.1 | Rankeds y casual con Realtime, fantasma, pantalla VS | Duelo app vs web funciona en ambos sentidos |
| 5.2 | Retar a un amigo + App Links de invitación | Link abre la app si está instalada, la web si no |
| 5.3 | Social (Inicio con presencia), amigos, mensajes, clan (ciudad por tier, guerra, misión, chat, reclamar) con controles por edad | Menor de 13 no ve texto libre |
| 5.3b | Mundo de clanes nativo: mapa Skia con pan/pellizco, filtros, hoja de resumen al tocar una parcela | Fluido con 500 clanes de prueba en gama baja; tocar nunca se confunde con arrastrar |
| 5.4 | Push nativo (permiso después del 1er sprint) + ajustes por tipo + horario silencioso | Racha en riesgo y duelo llegan a la app |
| 5.5 | Ligas semanales (si el PO aprueba; requiere migración) | Cierre de semana con ascensos/descensos |

## Fase 6 — Tienda, Pro y pagos

| # | Tarea | Terminado cuando |
|---|---|---|
| 6.1 | Tienda con vista previa sobre la propia Placa y confirmación de 2 pasos | Comprar con Chispas ganadas funciona |
| 6.1b | Editor de placa (ver ≠ editar), encuadre del fondo, compartir Placa como imagen/clip | Cambiar y previsualizar cada capa sin salir del editor |
| 6.1c | Conversión GIF → WebP animado en servidor + "Reportar imagen" con ocultado automático (PROD-05) | Imagen con N reportes deja de verse hasta revisión |
| 6.2 | Play Billing: Pro y paquetes de Chispas + webhook `google-play` + reembolsos | Compra de prueba acredita en servidor; reembolso de prueba descuenta |
| 6.3 | Paywall contextual y "Restaurar compras" | Pro comprado en web se ve en la app |

## Fase 7 — Publicación

| # | Tarea | Terminado cuando |
|---|---|---|
| 7.1 | Checklist completo de `05-PUBLICACION-GOOGLE-PLAY.md` | Todas las casillas marcadas |
| 7.2 | Prueba cerrada ≥ 14 días con el grupo actual | Sin fallos críticos, métricas de `04-` medidas |
| 7.3 | Producción escalonada 10 → 50 → 100 % | App pública |

## Después del lanzamiento
- Tema claro (v1.1), widget de racha en la pantalla de inicio de Android, temporadas, pase,
  iOS (mismo código), mascota si se aprobó.

## Cambios en la infraestructura de agentes

- Reemplazar `.opencode/agents/mobile-capacitor.md` por **`mobile-native.md`** (misión: app Expo,
  `apps/mobile`, rendimiento en gama baja, Play Console).
- Agregar a `AGENT-RULES.md`: "Toda lógica de juego nueva va en `packages/core` con test; nunca
  dentro de `apps/web` ni `apps/mobile`." Es la regla que evita que la app y la web se separen.
- Agregar la columna "App Android" en `PARIDAD_MUNDOS.md`.
