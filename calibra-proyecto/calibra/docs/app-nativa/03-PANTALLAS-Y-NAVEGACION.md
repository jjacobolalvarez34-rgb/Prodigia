# 03 — Pantallas y navegación

> Estado: PROPUESTA. Wireframes en texto (ancho de referencia 360 dp) + maquetas visuales en
> `maquetas-android.html`. Cada pantalla indica qué datos/RPC ya EXISTEN para alimentarla.

## 1. Arquitectura de información

```
                         ┌──────────── HUD (siempre visible en pestañas) ────────────┐
                         │ avatar · 🔥 racha · ✦ Chispas · 🔔 notificaciones           │
                         └───────────────────────────────────────────────────────────┘
 ┌─────────┬──────────┬───────────┬──────────┬──────────┐
 │  Hoy    │  Mundos  │  Competir │  Social  │  Perfil  │   ← barra inferior (5 pestañas)
 └─────────┴──────────┴───────────┴──────────┴──────────┘
   │          │           │            │           │
   │          │           │            │           ├─ Logros y títulos
   │          │           │            │           ├─ Estadísticas (Pro)
   │          │           │            │           ├─ Tienda (también desde ✦ del HUD)
   │          │           │            │           ├─ Prodigia Pro
   │          │           │            │           └─ Ajustes (incluye Cuenta)
   │          │           │            ├─ Amigos · Mensajes · Clan (pestañas internas)
   │          │           ├─ Rankeds · Duelo casual · Liga semanal · Reto semanal
   │          ├─ Mapa de los 13 mundos → Hub del mundo → Practicar | Aprender
   ├─ Meta diaria · Reto diario · Continuar · Misión del clan · Liga
```

Por qué así:
- **Hoy** responde "¿qué hago ahora?" en un toque. Es la pantalla que más se abre.
- **Mundos** es la exploración y la colección (13 ciudades para encender).
- **Competir** junta todo lo que tiene ELO o ranking (hoy está repartido entre `/leaderboard`,
  `/rankeds`, `/duelo`, `/reto-semanal`).
- **Social** junta amigos, mensajes y clan (hoy `/social`, `/amigos`, `/clanes`).
- **Tienda y Pro** no son pestañas: se llega desde el contador de Chispas del HUD, desde Perfil y
  desde los momentos en los que tiene sentido (mundo bloqueado, recompensa, lección Pro). Una
  pestaña de tienda empuja a comprar; un acceso contextual vende mejor y molesta menos.

## 2. Reglas de navegación Android

- **Atrás del sistema**: dentro de una pestaña vuelve un nivel; en la raíz de una pestaña vuelve a
  **Hoy**; en Hoy, un segundo "atrás" en 2 s cierra la app (con aviso). En partida abre la
  confirmación de abandonar (EXISTE en web desde 2026-09-24).
- Pantallas de juego (sprint, duelo, lección): pantalla completa, sin barra inferior ni HUD, modo
  inmersivo (se ocultan las barras del sistema, reaparecen al deslizar).
- **App Links** (NUEVO): `https://<dominio>/<locale>/duelo?invite=…`, `/auth/confirm?...`,
  `/perfil/<id>`, `/clanes/...` abren la app si está instalada.
- Estado de cada pestaña se conserva al cambiar de pestaña.

## 3. Mapa web → app

| Ruta web (EXISTE) | Pantalla en la app |
|---|---|
| `/` (home logueado) | Hoy |
| `/<mundo>`, `/<mundo>/elegir`, `/<mundo>/practica/*` | Mundos → Hub → Elegir tema → Sprint |
| `/<mundo>/aprender`, `/aprender/[slug]` | Hub → pestaña Aprender → Lección |
| `/<mundo>/diagnostico` | Onboarding de mundo (primera vez que se entra) |
| `/reto-diario` | Hoy → tarjeta Reto diario → Sprint (modo reto) |
| `/reto-semanal`, `/leaderboard`, `/rankeds`, `/duelo` | Competir |
| `/social`, `/amigos`, `/social/mensajes/[id]`, `/clanes` | Social |
| `/perfil`, `/perfil/[userId]`, `/perfil/estadisticas` | Perfil / perfil público |
| `/tienda` | Tienda (modal de pantalla completa) |
| `/pro` | Paywall Pro |
| `/ajustes` | Perfil → Ajustes |
| `/onboarding`, `/login`, `/registro`, `/recuperar` | Flujo de bienvenida |
| `/trastienda` | **No existe en la app v1** (PROD-01) |
| `/profesor`, `/admin`, `/docentes`, `/demo`, landing | Solo web |

## 4. Pantallas

### 4.1 Arranque
- Splash nativo (Android 12+ SplashScreen API) con el logo sobre `bg`; los assets ya existen
  (`assets/splash*.png`, se regeneran con el ícono adaptativo).
- Mientras carga la sesión: el aro del logo gira (EXISTE `LogoSpinner`). Objetivo < 2,5 s en gama baja.

### 4.2 Bienvenida y onboarding (EXISTE en capas en la web; se rediseña para móvil)
```
┌────────────────────────────┐   Paso 1/5  ●○○○○
│                            │
│   [ilustración: 13 luces   │   "Aprende jugando en 13 mundos"
│    de ciudades de noche]   │
│                            │
│  ¿Cuántos años tienes?     │   ← EXISTE PedirEdadModal; aquí pasa a ser paso del onboarding
│  [ 8-10 ][11-13][14-17][18+]│      (define chat, notificaciones y visibilidad)
│                            │
│ ┌────────────────────────┐ │
│ │       CONTINUAR        │ │   Boton3D
│ └────────────────────────┘ │
└────────────────────────────┘
```
Pasos: 1) edad · 2) qué te gusta (preferencias, EXISTE) · 3) elegir 2 mundos gratis
(`elegir_mundos_iniciales`, EXISTE) · 4) diagnóstico corto del primer mundo (EXISTE) ·
5) meta diaria (casual / normal / intensa). **La cuenta se crea después** del primer sprint
(invitado primero, EXISTE `ConvertirCuenta`): el usuario prueba antes de dar su correo.
Resuelve el hallazgo "onboarding sin stepper" de `UX-AUDIT.md`.

### 4.3 Hoy (pestaña 1)
```
┌────────────────────────────┐
│ (av) 🔥 12   ✦ 2.340   🔔•│  HUD (av = tu Placa en variante Mini: avatar + marco)
├────────────────────────────┤
│ Hola, Ana                  │
│ ┌────────────────────────┐ │
│ │  ◔ Meta diaria  260/400│ │  anillo que se cierra con XP del día (EXISTE daily_progress)
│ │  Te faltan 2 partidas  │ │
│ └────────────────────────┘ │
│ ┌────────────────────────┐ │
│ │ ▶ CONTINUAR            │ │  último mundo/tema jugado, con su color e ilustración
│ │   Numeria · Fracciones │ │  (un toque → sprint directo, sin pasar por menús)
│ │   Nivel 4  ▓▓▓▓▓░░ 62% │ │
│ └────────────────────────┘ │
│ ┌──────────┐ ┌───────────┐ │
│ │Reto diario│ │Reto semanal│ │  EXISTE (0113). Estado: jugar / hecho 4/5
│ │  ⏱ 5 preg │ │ 12/45     │ │
│ └──────────┘ └───────────┘ │
│ ┌────────────────────────┐ │
│ │ Misión del clan        │ │  EXISTE (0239/0240): 3000 Exp conjunta → 2000 Chispas
│ │ ▓▓▓▓▓▓▓░░ 2.180/3.000  │ │  botón RECLAMAR dorado cuando se completa
│ └────────────────────────┘ │
│ ┌────────────────────────┐ │
│ │ Liga semanal · #7 de 30│ │  ranking semanal por Exp (EXISTE); "zona de ascenso" = NUEVO
│ │ Termina en 2d 4h       │ │
│ └────────────────────────┘ │
├────────────────────────────┤
│ Hoy  Mundos Competir Social Perfil │
└────────────────────────────┘
```
Regla: como máximo 5 tarjetas; se ordenan por urgencia (racha en riesgo arriba de todo si son más
de las 18 h y no jugó hoy).

### 4.4 Mundos (pestaña 2)
```
┌────────────────────────────┐
│ HUD                        │
│ Tus mundos  (4 de 13)      │
│  ┌──────────────────────┐  │
│  │ [ciudad Numeria      │  │  carrusel vertical con "snap": una ciudad grande por vez,
│  │  encendida, violeta] │  │  ilustración + nombre + nivel del mundo (1-100, EXISTE
│  │ NUMERIA   Nv 23      │  │  world_progress) + % de Técnicas vistas
│  │ ▓▓▓▓▓▓░░░            │  │
│  └──────────────────────┘  │
│  ┌──────────────────────┐  │
│  │ [ciudad Quimia       │  │
│  │  apagada, gris]  🔒  │  │  bloqueada: silueta gris + precio en Chispas (EXISTE
│  │ QUIMIA  ✦ 3.000      │  │  desbloquear_mundo, 0097) o "Incluido en Pro"
│  └──────────────────────┘  │
│  … 13 ciudades             │
│  Filtro: [Todos][Míos][Bloqueados]
└────────────────────────────┘
```
Alternativa a evaluar en diseño visual: vista "mapa nocturno" (las 13 ciudades en un mapa con
caminos). Más bonito, más caro de producir. Arrancar con el carrusel.

### 4.5 Hub de mundo
```
┌────────────────────────────┐
│ ←  NUMERIA          Nv 23  │  cabecera con ilustración del mundo y fondo vivo
│ [ilustración ciudad]       │
│ ▓▓▓▓▓▓▓░░ 62 % al Nv 24    │
│ [ Practicar ] [ Aprender ] │  pestañas (EXISTE AprenderTabs: Técnicas | Clases (Pro))
│                            │
│ Practicar                  │
│ ┌──────────┐ ┌──────────┐  │  temas con su nivel de calibración 1-10 (EXISTE skill_levels)
│ │ Suma  7  │ │ Resta  6 │  │
│ └──────────┘ └──────────┘  │
│ ┌──────────┐ ┌──────────┐  │
│ │Fracc. 4 │ │ Potenc. 🔒│  │  desbloqueo por tema (EXISTE desde 0216-0219)
│ └──────────┘ └──────────┘  │
│ ┌────────────────────────┐ │
│ │  PRÁCTICA RÁPIDA  ⚡    │ │  Boton3D: mezcla de temas, la opción de 1 toque
│ └────────────────────────┘ │
└────────────────────────────┘
```

### 4.6 Aprender (camino)
- Camino vertical de nodos estilo "sendero" (EXISTE `CaminoContinuo` en web), agrupado por tema
  (EXISTE `AprenderSidebar` → en móvil pasa a encabezados que quedan fijos al hacer scroll).
- Nodo = círculo de 64 dp: completado (acento lleno + ✓), disponible (acento con pulso suave),
  bloqueado (gris), Clase Pro (borde dorado + candado; la primera Clase es gratis, EXISTE).
- Lección: pantallas deslizables con los visuales animados (EXISTE el motor `visuales` en 13 mundos;
  portar a `react-native-svg`), quiz al final (EXISTE), cascada de recompensa corta.

### 4.7 Sprint (pantalla completa)
```
┌────────────────────────────┐
│ ✕        ◯ 0:24     ×4 🔥  │  salir (confirma) · anillo de tiempo · combo
│ ● ● ● ○ ○        🛡 🛡      │  progreso de 5 · escudos disponibles
│                            │
│ ┌────────────────────────┐ │
│ │                        │ │
│ │       37 × 8           │ │  numero-juego 56 sp; fórmulas con el renderer matemático
│ │                        │ │
│ │     [ 2 9 6 _ ]        │ │  respuesta que se va escribiendo
│ └────────────────────────┘ │
│  ┌────┐ ┌────┐ ┌────┐      │
│  │ 1  │ │ 2  │ │ 3  │      │  teclado propio, 64 dp, háptica de selección
│  ├────┤ ├────┤ ├────┤      │
│  │ 4  │ │ 5  │ │ 6  │      │
│  ├────┤ ├────┤ ├────┤      │
│  │ 7  │ │ 8  │ │ 9  │      │
│  ├────┤ ├────┤ ├────┤      │
│  │ ,  │ │ 0  │ │ ⌫  │      │  la tecla izquierda cambia según el tipo (, / − / √)
│  └────┘ └────┘ └────┘      │
│ ┌────────────────────────┐ │
│ │        LISTO           │ │  o envío automático cuando la longitud de la respuesta
│ └────────────────────────┘ │  coincide (opción en Ajustes, para los rápidos)
└────────────────────────────┘
```
Opción múltiple: 4 tarjetas 2×2 en lugar del teclado. Geografía: mapa a pantalla completa con
zoom por gesto. Melodía: pentagrama/teclado (EXISTE en web).

### 4.8 Resultado
Cascada de recompensas (ver `02-SISTEMA-VISUAL.md` §7.3). Distribución final estable:
```
┌────────────────────────────┐
│        ¡Buen sprint!       │
│   9/10 · 90 % · 0:41       │
│ ┌────────────────────────┐ │
│ │ +128 Exp   Numeria Nv23│ │  barra que se llena
│ │ ▓▓▓▓▓▓▓▓░ → 71 %       │ │
│ └────────────────────────┘ │
│  ✦ +45     🔥 13 días      │
│ ┌────────────────────────┐ │
│ │🏅 Logro: Sin fallas     │ │  si hubo
│ └────────────────────────┘ │
│ ┌────────────────────────┐ │
│ │     OTRA PARTIDA       │ │  Boton3D acento (la acción que más retiene)
│ └────────────────────────┘ │
│      Volver al mundo       │
└────────────────────────────┘
```

### 4.9 Competir (pestaña 3)

Maqueta 8 de `maquetas-android.html`. La insignia de rango es la protagonista; filtro de ciudad con
chips (incluye "Todas las ciudades", EXISTE desde a54839f).
```
┌────────────────────────────┐
│ HUD                        │
│ [Rankeds][Casual][Liga][Semanal] │ pestañas internas
│ ┌────────────────────────┐ │
│ │ [insignia Oro]  ELO 1284│ │  EXISTE rangos y ELO (0016…0074); mínimo nivel 5
│ │ Oro II · 3 V seguidas   │ │  (EXISTE guard; si no llega, tarjeta "Te faltan X Exp")
│ │ ┌────────────────────┐ │ │
│ │ │   BUSCAR DUELO  ⚔  │ │ │  Boton3D; elegir mundo (EXISTE SelectorMundoDuelo)
│ │ └────────────────────┘ │ │
│ └────────────────────────┘ │
│ Últimos duelos              │
│  ✓ vs Tomi  +18            │
│  ✗ vs Lu    −12            │
│ Retar a un amigo →          │
└────────────────────────────┘
```
Duelo: búsqueda (anillo pulsante, "buscando rival de tu rango"), pantalla VS (las dos Placas en variante VS
entran y chocan), partida (mismo runner del sprint + barra del rival/fantasma arriba, EXISTE el fantasma),
resultado con cambio de ELO animado y "Revancha".

### 4.10 Social (pestaña 4)

Pestañas internas: **Inicio · Amigos · Mensajes · Clan**. Maquetas 7, 9, 10 y 11 de
`maquetas-android.html`.

#### Inicio de Social
```
┌────────────────────────────┐
│ HUD                        │
│ [Inicio][Amigos][Mensajes][Clan]
│ EN LÍNEA AHORA             │
│ (T)• (L)• (V)• (S)• (J)•   │  Placas Mini con punto de presencia (EXISTE src/lib/presencia)
│ ┌────────────────────────┐ │
│ │ Mati quiere ser tu     │ │  solicitudes pendientes arriba (EXISTE amigos/responder)
│ │ amigo      [ACEPTAR]   │ │
│ └────────────────────────┘ │
│ ┌────────────────────────┐ │
│ │ Tomi  ¿Revancha?    (2)│ │  conversaciones directas y del clan juntas,
│ │ [FA]  Valen: faltan…(5)│ │  ordenadas por último mensaje, con no leídos (EXISTE 0224)
│ │ Lu    Tú: te gané…     │ │
│ └────────────────────────┘ │
│      + INVITAR AMIGOS      │
└────────────────────────────┘
```

#### Amigos
Cuadrícula de 2 columnas con Placas en variante Tarjeta (EXISTE desde 2026-09-24). Acción rápida en
cada amigo: **Retar** (EXISTE `amigos/retar`) y **Mensaje**.

#### Mensajes
Lista de conversaciones + chat con "responder a un mensaje" y avisos de no leídos (EXISTE 0198/0224).

#### Clan (EXISTE 0068 → 0240; se reordena para móvil)
```
┌────────────────────────────┐
│┌──────────────────────────┐│
││ ▌FamiliaAtomica [FA] 🗺Mundo│  ciudad del clan: ilustración según tier
││ Metrópolis · Nv 12 · 14/20 ││  (Asentamiento/Aldea/Ciudad/Metrópolis/Prodigio,
││ [skyline + casas de       ││  public/clan_rangos/1-5.png, EXISTE tierCiudad.ts) y
││  miembros con su avatar]  ││  una casa por miembro (EXISTE EscenaCiudad)
│└──────────────────────────┘│
│ Nivel del clan ▓▓▓▓▓▓▓░ Exp│  en Exp (EXISTE desde a499958)
│ Guerra de la semana        │  [FA] 18.240 vs 15.900 [PIX], barra dividida
│ Misión semanal 3.000 Exp   │  barra dorada + RECLAMAR (EXISTE 0239/0240)
│ Miembros                   │  Placas Fila con rol (Fundador/Guía) y aporte histórico
│ Chat del clan ▸  (5)       │  (EXISTE ChatDeClan; controles por edad PROD-02)
└────────────────────────────┘
```
Sin clan: buscar clan, crear clan (EXISTEN) y un acceso grande al Mundo de clanes para explorar.

#### Mundo de clanes (EXISTE `/clanes/mundo`, `MundoClanesMapa`, RPC `mapa_clanes`)
Hoy es un mapa con arrastre y zoom hecho a mano (Pointer Events), una parcela por clan en grilla y en
orden de fundación. En la app:
```
┌────────────────────────────┐
│ ←  Mundo de clanes         │
│    128 clanes              │
│ [Todos][Con lugar][Top guerra][Mi clan]   ← filtros (NUEVO)
│ ┌────┐ ┌────┐ ┌────┐   [+] │
│ │▌LOG│ │▌FA │ │▌PIX│   [−] │  mapa nocturno a pantalla completa:
│ │▆█▇█│ │▅▇▆ │ │▃▅▄ │   [◎] │  - la altura de la skyline = tier del clan
│ └────┘ └────┘ └────┘       │  - banderín = color del estandarte
│ ┌────┐ ┌────┐ ┌────┐       │  - tu clan con borde encendido; ◎ centra en tu clan
│ │ …  │ │ …  │ │ …  │       │  - arrastrar y pellizcar (gesture-handler + Reanimated)
│ ~~~~~~~~~~ río ~~~~~~~~~~  │
│┌──────────────────────────┐│
││ ▌Pixelados [PIX]         ││  hoja inferior al tocar una parcela:
││ Ciudad · Nv 7 · 17/20    ││  descripción, guerras ganadas,
││ [VER CIUDAD][PEDIR UNIRME]││  entrar a su ciudad o pedir unirse
│└──────────────────────────┘│
└────────────────────────────┘
```
- Rendimiento: dibujar el mapa en Skia (un solo canvas) y cargar parcelas por zona visible; con
  cientos de clanes, lejos se ven solo banderines y de cerca aparecen las ciudades.
- La lección del bug web "tocar una parcela no abre la ciudad" (arrastre vs toque,
  `MundoClanesMapa.tsx`) se resuelve de base con los gestos nativos: `Tap` y `Pan` como gestos
  separados con umbral de movimiento.
- NUEVO para evaluar: ubicar las parcelas por afinidad (clanes rivales de guerra cerca, clanes del
  mismo mundo favorito juntos) en vez de solo por antigüedad.

Menores de 13 (NUEVO, ver PROD-02): mensajes y chat de clan se reemplazan por reacciones y frases
predefinidas.

### 4.11 Perfil (pestaña 5) — la Placa es la pantalla

La pestaña Perfil abre con la **Placa de jugador Completa** ocupando la primera pantalla. Todo lo
demás va debajo. Especificación de la Placa en `02-SISTEMA-VISUAL.md` §10.
```
┌────────────────────────────┐
│                      ✎  ⤴ │  editar placa · compartir placa
│┌──────────────────────────┐│
││ [FONDO ANIMADO: GIF,     ││  fondo elegido por el jugador, a sangre dentro de la tarjeta,
││  galería o color]        ││  borde del color del marco / rango
││  (avatar GIF + marco)    ││
││                          ││
││  Neutron                 ││  fuente + color + animación del nombre comprados
││  «Mano Firme»            ││  título elegido
││░░░░░░░░░░░░░░░░░░░░░░░░░░││  ← velo degradado: el texto se lee sobre cualquier GIF
││ ☆ Platino · 1304 ELO     ││
││ ✦ 5.564 Chispas          ││
││ ┌──────────────────────┐ ││
││ │ Nivel 27  ▓░░ 10/1900│ ││  caja de vidrio (EXISTE en la web)
││ │ 28.660 XP histórica  │ ││
││ └──────────────────────┘ ││
││ #1 de 15 · ranking hist. ││
││ [▮ FamiliaAtomica  FA]   ││  clan con estandarte
│└──────────────────────────┘│
│ Ciudades favoritas ▸       │  banner con nivel real (EXISTE)
│ Logros y títulos ▸         │
│ Estadísticas avanzadas ▸ PRO│
│ Tienda ▸   Prodigia Pro ▸  │
│ Ajustes ▸                  │
└────────────────────────────┘
```
- **Sin controles de edición dentro de la Placa**: se ve exactamente como la ven los demás.
- El **perfil público** de otro jugador es la misma pantalla sin ✎, con **Retar** y
  **Agregar amigo** debajo de la Placa.

### 4.11b Editor de placa (NUEVO)
```
┌────────────────────────────┐
│ ←  Tu placa        GUARDAR │
│┌──────────────────────────┐│
││   Placa en vivo (60 %)   ││  cada cambio se ve al instante
│└──────────────────────────┘│
│ [Fondo][Avatar][Marco][Nombre][Título] │
│ ┌──────┐┌──────┐┌──────┐   │
│ │ tuyo ││ tuyo ││🔒1800│   │  lo que no tienes: candado + precio; tocarlo lo prueba
│ └──────┘└──────┘└──────┘   │  sobre tu Placa antes de comprar
│  + Subir imagen o GIF      │  con recorte y punto de interés
└────────────────────────────┘
```
Nombre: fuente · color · animación. Fondo: colores, galería animada, subir propio. Es también la
vidriera más fuerte de la tienda de cosméticos: se compra lo que ya viste puesto.

### 4.12 Tienda (pantalla completa desde ✦ o Perfil)
- Secciones: **Destacado de la semana** (rota) · Marcos · Fuentes · Animaciones de nombre · Fondos ·
  Consumibles (escudo, congelamiento, boost, hielo, tiempo extra — EXISTEN) · Comprar Chispas
  (Play Billing).
- Cada ítem: vista previa **sobre tu propia Placa** antes de comprar (la mejor palanca de venta de
  cosméticos). Tienda y Editor de placa comparten el mismo componente de vista previa. Confirmación de 2 pasos en todos los ítems (arregla la inconsistencia de `UX-AUDIT.md`).
- Rareza visual (NUEVO, `DIRECCION-ARTISTICA.md` §2.3 ya la propone): común / raro / épico /
  legendario, con el color del borde.
- Sin Trastienda en Android v1.

### 4.13 Prodigia Pro (paywall)
- Se abre desde contexto (Clase Pro, estadísticas, mundo bloqueado), nunca al abrir la app.
- Muestra qué desbloquea **en el mundo desde el que llegó** ("Las 8 Clases de Numeria").
- Precio de Play Billing con prueba gratis si el PO la aprueba. Botón "Restaurar compras".

### 4.14 Ajustes
- **Cuenta** (NUEVO, resuelve UX-04): correo, cambiar contraseña, vincular Google, cerrar sesión
  (con confirmación), **eliminar cuenta** (EXISTE `perfil/eliminar-cuenta`; Play lo exige dentro
  de la app).
- Juego: sonido, háptica, envío automático, meta diaria.
- Notificaciones: por tipo (racha, duelos, clan, mensajes) + horario silencioso.
- Idioma (EXISTE `perfil/idioma`), tema claro/oscuro (v1.1), privacidad, términos.

### 4.15 Estados globales
- **Toast/snackbar global** (NUEVO, resuelve UX-04): todos los errores de red dicen qué pasó y
  ofrecen "Reintentar".
- **Sin conexión**: banner fijo arriba; Hoy muestra "Práctica libre" (§5.3 de `01-`); lo que exige
  red se ve atenuado con el motivo.
- **Vacíos**: cada lista vacía tiene ilustración pequeña + una acción ("Aún no tienes amigos →
  Invitar").
- **Novedades**: bandeja en 🔔 con badge; nunca un carrusel de modales al abrir (UX-05).
