# App Android nativa de Prodigia — plan y diseño

> Estado: **EN CONSTRUCCIÓN** (plan del 2026-09-26). La app vive en `calibra-proyecto/mobile/`
> (Expo SDK 57, importa la lógica de `calibra/src` con el alias `@/`). Ver "Estado actual" abajo.
> Reemplaza al contenedor Capacitor actual (`capacitor.config.ts` + `android/`), que solo carga
> `prodigia-sandy.vercel.app` dentro de un WebView.
> Prerrequisito: leer `docs/audits/REVISION-GENERAL-2026-09-26.md` (hay bloqueantes de seguridad y de
> política de tiendas que conviene cerrar antes de escribir la primera pantalla).

## Qué se quiere

Una app que **se descarga de Google Play (o como APK), abre sin conexión, se siente de juego y no de
sitio web**, con la misma cuenta, progreso y economía que la web. Que dé ganas de volver todos los
días, sin usar trucos que dañen a un público que en buena parte es menor de edad.

## Principio intocable: la Placa de jugador

La tarjeta de perfil personalizable (fondo y avatar animados con GIF, fuentes, color y efectos del
nombre, marcos, título y datos) es parte de la esencia de Prodigia: le da identidad a cada jugador.
Pasa **completa** a la app y se ve igual que en la web (decisión del PO, 2026-09-26). Ver
`02-SISTEMA-VISUAL.md` §10 y `03-PANTALLAS-Y-NAVEGACION.md` §4.11.

## Decisión central (resumen)

**Expo (React Native) + un paquete `core` compartido con la web.** La UI es 100 % nativa (no hay
WebView), y los ~350 módulos de lógica pura de `src/lib` (generadores de los 13 mundos, ELO, retos,
curvas de nivel, validadores) se reutilizan tal cual, con sus 92 archivos de test. Reescribir todo
en Kotlin duplicaría la lógica y multiplicaría el problema de paridad que ya documenta
`PARIDAD_MUNDOS.md`. Justificación completa en `01-STACK-Y-ARQUITECTURA.md`.

## Estado actual (2026-10-01)

Hecho en `mobile/` (comparte cuenta, progreso y economía con la web; todo pasa por las mismas
RPC security definer):

- **Sistema visual** de las maquetas: tokens, fuentes empaquetadas (marca + las 8 de nombre),
  `Boton3D` con resorte y destello, tarjetas con brillo, ciudades nocturnas por mundo, glifos
  flotantes, confeti, sonidos propios (`assets/sonidos`, síntesis sin licencias) y háptica, con
  interruptores en Ajustes.
- **Navegación**: 5 pestañas + HUD (racha, Chispas → tienda, campana).
- **Placa** en sus 5 variantes con fondos (degradés, GIF, galería), marcos de rango/neón/ciudad
  y las 10 animaciones de nombre; editor de placa (fondo, avatar, marco, nombre, título).
- **Mundos en la app**: Numeria y Geografía (sprint con combo, borde que gira, +XP flotante y
  cascada de recompensas). Los otros 11 se ven en Mundos y abren la web.
- **Competir**: Rankeds y casual (matchmaking, VS, sala sincronizada y progreso en vivo con los
  mismos canales que la web, fantasma, series mejor de 3), liga semanal, retos diario y semanal.
- **Social y clanes**: presencia, solicitudes, amigos, retar, mensajes y chat del clan en vivo,
  misión con reclamar, guerra, roles, crear/buscar/unirse, invitaciones y Mundo de clanes.
- **Tienda** (sin Trastienda, PROD-01), logros y títulos, Pro (informativo), avisos push,
  widgets y ajustes.

Pendiente: los otros 11 mundos y Aprender dentro de la app, Play Billing (Pro y Chispas),
borrado de cuenta dentro de la app (hoy abre la web) y lo de `05-PUBLICACION-GOOGLE-PLAY.md`.

## Índice

| Archivo | Qué contiene |
|---|---|
| `01-STACK-Y-ARQUITECTURA.md` | Comparación de stacks, decisión, monorepo, qué se comparte, auth, datos, offline, push, pagos |
| `02-SISTEMA-VISUAL.md` | Dirección de arte "Noche de Prodigia": tokens, color por mundo, tipografía, íconos, volumen, movimiento, háptica y sonido |
| `03-PANTALLAS-Y-NAVEGACION.md` | Arquitectura de información, barra inferior, y cada pantalla con su distribución (wireframes) |
| `04-BUCLE-DE-ENGANCHE.md` | Por qué la gente vuelve: bucles diario/semanal/temporada, recompensas, notificaciones y límites éticos |
| `05-PUBLICACION-GOOGLE-PLAY.md` | Checklist de Play: firma, testing cerrado, Data safety, clasificación, Familias, Billing, borrado de cuenta |
| `06-ROADMAP.md` | Fases con entregables y criterios de "terminado", listo para asignar a agentes |
| `maquetas-android.html` | 11 maquetas (abrir en el navegador): Hoy, Mundos, Sprint, Resultado, Duelo VS, Perfil/Placa, Placa en variantes, Competir, Social, Clan, Mundo de clanes |

## Convenciones

- **EXISTE** = verificado en el código actual (con ruta). **NUEVO** = propuesta de esta sesión, no
  existe todavía. Todo lo NUEVO que toque economía o reglas de juego necesita aprobación del PO.
- La web sigue siendo la fuente de verdad del producto; la app no inventa mecánicas propias.
- Texto visible en español neutro (tú), según `docs/TERMINOLOGY.md`.
