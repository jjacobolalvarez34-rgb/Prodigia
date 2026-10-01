# Prodigia — app móvil (Expo)

La app nativa de Prodigia para Android (diseño y plan en `../calibra/docs/app-nativa/`). Misma
cuenta, mismo progreso y mismas Chispas que la web: habla directo con el mismo Supabase, y la lógica
de los problemas, los retos, los logros y los títulos es **el mismo código de la web**, importado.

Estado al 2026-10-01: todo lo social y competitivo está en la app; de los 13 mundos se juegan
**Numeria** (sus 6 secciones) y **Geografía**. Los otros 11 aparecen en Mundos y abren la web.

## Qué tiene

| Área | Qué hay | Pantallas |
|---|---|---|
| Entrada | Login con correo o usuario, invitado, elegir los 2 mundos iniciales, pantalla de carga con progreso real y pro tips | `login`, `elegir-mundos`, `ui/PantallaCarga` |
| **Hoy** | Saludo, racha en riesgo, retos de amigos, meta diaria (anillo), Continuar (último mundo jugado), retos diario y semanal, misión del clan con Reclamar, liga semanal, Destacados | `(tabs)/index` |
| **Mundos** | 13 ciudades nocturnas: encendidas las tuyas, apagadas con precio las demás; encender un mundo con Chispas | `(tabs)/mundos` |
| **Numeria** | 6 secciones y 20 temas: Aritmética (4), Geometría (4), Fracciones (3), Decimales (3), Potencias (3), Álgebra (3). Cada tema calibra su nivel | `numeria/index`, `numeria/sprint` |
| **Geografía** | 4 continentes en el mapa real con zoom y arrastre, preguntas avanzadas desde el nivel 8 | `geografia/index`, `geografia/sprint` |
| Partida | "¿Preparado? 3, 2, 1, ¡Ya!", anillo de tiempo, llama de racha, borde que gira con combo ≥ 5, +XP flotante, sacudida al fallar, salida suave y cascada de recompensas | `ui/Sprint`, `resultado` |
| **Competir** | Rankeds (insignia, divisiones, buscar rival, VS, sala sincronizada con la web, fantasma, series mejor de 3), casual (rival al azar), liga semanal con podio, reto semanal | `(tabs)/competir`, `duelo/*`, `reto/[tipo]` |
| **Social** | En línea, solicitudes, amigos (Placas), retar, mensajes directos y chat del clan en vivo | `(tabs)/social`, `chat/[id]`, `amigos/buscar` |
| Clanes | Ciudad del clan, nivel, guerra semanal, misión de 3000 Exp con Reclamar, miembros y roles, buscar/crear/unirse, invitaciones, Mundo de clanes (mapa con zoom) | `ui/clan/VistaClan`, `clan/*` |
| **Perfil** | La Placa completa (fondo, avatar con marco, nombre con fuente y animación, título, rango, nivel, clan), editor de placa, logros y títulos, Pro, ajustes | `(tabs)/perfil`, `editar-placa`, `logros`, `pro`, `ajustes` |
| Tienda | Mismo catálogo y precios que la web, oferta del día, vista previa sobre tu Placa, rarezas, compra en 2 pasos, subir avatar y fondo propios | `tienda` |
| Avisos | Push por categoría (mensajes, duelos, racha, novedades), centro de avisos, recordatorio diario, widgets de Android | `avisos`, `ajustes-avisos`, `widgets/` |

No están en la app: la Trastienda y las apuestas (PROD-01, política de Google Play para apps con
menores), comprar Pro o Chispas con dinero (llega con Google Play Billing), Aprender (abre la web) y
borrar la cuenta (abre la web).

## Cómo probarla

Necesita `mobile/.env.local` con `EXPO_PUBLIC_SUPABASE_URL` y `EXPO_PUBLIC_SUPABASE_ANON_KEY` (los
mismos valores que `NEXT_PUBLIC_*` de `../calibra/.env.local`). No se commitea.

- **Expo Go** (rápido, sin compilar): `npx expo start` y escanear el QR. Ahí no funcionan los
  widgets, el push remoto ni los módulos nativos agregados después (paginador de pestañas, selector
  de imágenes): para probar todo hay que instalar el APK.
- **APK local** (sin la nube de Expo): en esta máquina está armado `D:\android-build` (JDK 17 y SDK
  de Android). Correr
  `powershell -NoProfile -ExecutionPolicy Bypass -File D:\android-build\compilar.ps1 *> D:\android-build\compilarN.log`
  (un nombre de log nuevo cada vez). Hace `expo prebuild --clean`, compila en release solo para
  `arm64-v8a` y deja el APK en `D:\Prodigia-APK\Prodigia.apk`. La primera vez tarda ~1 h; después,
  bastante menos. Seguir el avance: `Get-Content D:\android-build\compilarN.log -Tail 20 -Wait`.
- **APK en la nube (EAS)**: `npx eas-cli@latest build -p android --profile preview` (las claves
  públicas de Supabase van en `eas.json`).

El APK se firma con la clave de depuración y usa el paquete `com.prodigia.app` (el mismo que la app
Capacitor vieja: hay que desinstalar esa antes).

Para que todo funcione en la base, tienen que estar aplicadas las migraciones hasta la
**0244** (`0243_app_notificaciones` para los avisos, `0244_duelos_amistosos_sin_elo` para que los
retos entre amigos no muevan el ELO y el casual sea contra cualquiera).

## Cómo está armada

```
src/
  app/                 pantallas (Expo Router, una por archivo)
    (tabs)/            las 5 pestañas (paginador deslizable con la barra abajo)
    numeria/ geografia/ los mundos jugables (hub + sprint)
    duelo/ reto/ clan/ chat/ jugador/ amigos/   pantallas apiladas
  lib/                 datos y lógica (sin React salvo hooks chicos)
  ui/                  componentes visuales
    placa/             la Placa del jugador en sus variantes
    clan/              vista del clan y estandarte
  widgets/             widgets de Android
  tema.ts              tokens de color, fuentes y los 13 mundos (base + neón + glifos)
```

### Lógica compartida con la web

`@/` apunta a `../calibra/src` (`tsconfig.json` + `metro.config.js`): generadores de problemas de
todos los mundos, reto diario/semanal, rangos y ELO, catálogo y precios de la tienda, descuento del
día, logros y títulos (`verificarLogros`, `verificarTitulos`), niveles de mundo y de clan. **Nunca se
copia un generador a la app: se importa.** Solo lógica pura (nada de React DOM ni Next). Los tipos de
`@supabase/supabase-js` de la web son otra copia del paquete: al pasarle el cliente de la app a una
función de la web se castea (`supabase as unknown as ClienteWeb`, ver `lib/partida.ts`).

### Datos (`src/lib/`)

Todo pasa por las mismas tablas, RPC security definer y canales en vivo que la web; la app nunca
decide XP, ELO, precios ni recompensas.

| Archivo | Para qué | RPC / tablas principales |
|---|---|---|
| `supabase.ts`, `sesion.tsx` | Cliente y sesión | auth |
| `jugador.ts` | Estado global del HUD: Placa, racha, Chispas, avisos, plan, mundos | `profiles`, `mi_clan`, `resumen.ts` |
| `partida.ts` | Guardar intentos y cerrar partida (XP del día, nivel de mundo, hito en el feed, logros, títulos) | `insertar_intento`, `registrar_xp_diario`, `registrar_progreso_mundo` |
| `numeria.ts`, `geografia.ts` | Secciones, temas, niveles y problemas unificados | `skill_levels` |
| `mundos.ts` | Nivel de mundo con avance y "Continuar" | `detalle_nivel_mundo`, `world_progress` |
| `competir.ts` | Historial, matchmaking, duelos, series, rankings, retar | `buscar_rival_duelo`, `obtener_duelo`, `registrar_resultado_duelo`, `estado_serie_duelo`, `ranking_*` |
| `duelos.ts` | Sala sincronizada y progreso en vivo | canales `duelo:<id>:sala`, `duelo:<id>:vivo` |
| `social.ts` | Amigos, solicitudes, mensajes, presencia | `mis_amigos`, `mi_conversacion`, `enviar_mensaje_directo`, canales `dm:<a>:<b>`, `presencia:global` |
| `clanes.ts` | Mi clan, misión, guerra, chat, mapa | `mi_clan`, `mision_actual_de_clan`, `reclamar_mision_clan`, `mapa_clanes`, canal `clan-chat:<id>` |
| `tienda.ts` | Catálogo, comprar, equipar, subir imágenes | `comprar_item_tienda`, `elegir_*`, buckets `avatares` y `fondos-perfil` |
| `retos.ts`, `logros.ts`, `placa.ts` | Retos, logros/títulos y la Placa | `completar_reto_*`, `mis_titulos`, `obtener_perfil_publico` |
| `efectos.ts`, `ajustes.ts`, `rendimiento.ts` | Sonido, vibración, preferencias del teléfono y reglas de rendimiento | — |

### Sistema visual (`src/ui/`)

Dirección "Noche de Prodigia" (`../calibra/docs/app-nativa/02-SISTEMA-VISUAL.md` y
`maquetas-android.html`).

- `Texto` — escala tipográfica (Space Grotesk, Inter, JetBrains Mono). Si un estilo agranda la
  letra sin interlineado, lo calcula solo (antes el texto grande se encimaba).
- `Boton3D` — botón con el estilo de `components/Boton.tsx` de la web: píldora, color de marca o del
  mundo con contraste AA, sombra de color; con `brillo`, borde con el degradé cálido que late y la
  plaquita ▶. Variantes `primario`, `logro`, `secundario`, `peligro`, `pro`.
- `Tarjeta`, `Barra`, `Anillo`, `NumeroAnimado`, `Segmentos`, `Hoja` (hoja inferior), `Aviso`
  (avisos emergentes), `Pantalla` (pantalla de pestaña con HUD o apilada con flecha atrás).
- `Ciudad` — skyline nocturno por mundo: SVG estático + ventanas que parpadean y aviones encima.
- `Glifos`, `Confeti`, `Iconos`, `Logo` (el mismo logo vectorial de la web).
- `Sprint` — reloj nativo (`useReloj`), cabecera, llama de racha, cuenta 3-2-1, tarjeta del
  problema, teclado, barra del rival y salida suave (`useSalida`).
- `placa/` — `PlacaCompleta`, `PlacaTarjeta`, `PlacaFila`, `PlacaVS`, `PlacaMini`, más
  `AvatarMarco`, `FondoPlaca`, `NombreEstilizado` (las 10 animaciones de nombre) e `InsigniaRango`.

### Reglas de rendimiento

Pedido del 2026-10-01: en un teléfono de 4 GB las animaciones iban a pocos fps.

1. **Lo que no se ve no se anima.** Las pestañas quedan montadas: toda animación en bucle usa
   `useAnimacionActiva()` y se cancela si su pantalla no tiene el foco o la app está en segundo
   plano. Los GIF de fondo tampoco se reproducen fuera de pantalla.
2. **Modo liviano** (`useLiviano()`): automático en teléfonos de menos de 6 GB de RAM, o elegido en
   Ajustes → Animaciones. Menos glifos, ventanas y partículas; entradas de tarjetas sin
   desplazamiento.
3. **Nada que redibuje la pantalla por cuadro.** El reloj del sprint y el anillo corren en el hilo
   nativo (Reanimated); los segundos se actualizan 4 veces por segundo solo en la cabecera; el
   fantasma del rival se calcula dentro de su barra. Las barras se llenan con `transform`, no
   cambiando el ancho.
4. Entradas con tiempo fijo (`.duration()`), no resortes, en listas.

### Sonido

`efectos.ts` reproduce los mismos tonos que la web (`../calibra/src/lib/sonido.ts`), sintetizados a
archivo en `assets/sonidos` (44,1 kHz). El acierto es el "tick" de 880 Hz de la web subiendo por la
escala mayor con el combo (8 alturas). Suenan por el volumen **multimedia**, aunque el teléfono esté
en silencio (`playsInSilentMode: true`); se apagan desde Ajustes. Para regenerarlos:
`python scripts/generar-sonidos.py` (numpy), que reproduce los parámetros de la web: onda,
frecuencia, duración y caída exponencial.

## Verificación antes de cerrar un cambio

```sh
npx tsc --noEmit
npx eslint src
npx expo export --platform android --output-dir D:/tmp-claude/export-prueba
```

- Si se agregan pantallas, las rutas tipadas (`.expo/types/router.d.ts`) se regeneran levantando
  el servidor un rato: `CI=1 npx expo start --offline --port 8099` (cortarlo cuando diga "Waiting on
  http://localhost:8099").
- React Compiler está activo y su linter es estricto: `useState(() => valor)` en vez de leer refs
  durante el render, `.get()/.set()` para valores compartidos de Reanimated fuera de worklets, nada
  de `Math.random()` ni `Date.now()` en el render (pseudoaleatorio puro por índice), y estado
  derivado en el render en vez de `setState` dentro de un efecto.
- Archivos temporales y cachés en `D:` (en `C:` queda poco espacio).
