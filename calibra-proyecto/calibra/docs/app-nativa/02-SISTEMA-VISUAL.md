# 02 — Sistema visual: "Noche de Prodigia"

> Estado: PROPUESTA. Parte de la identidad que **ya existe** (`globals.css`, `Logo.tsx`,
> `src/lib/mundos.ts`, `docs/marketing/BRAND.md`) y la lleva a un lenguaje de juego móvil.
> Maquetas: `maquetas-android.html`.

## 1. Idea en una frase

**Cada mundo es una ciudad que se enciende de noche cuando juegas.** La app es oscura por defecto,
y el color de cada mundo es la luz: aparece con fuerza cuando aciertas, subes de nivel o desbloqueas
algo. La interfaz se siente física (botones con volumen que se hunden, números que "sellan", monedas
que vuelan al contador), responde con vibración y sonido a cada acción, y siempre deja claro qué hacer
ahora y qué ganaste.

### Principio intocable: la Placa de jugador (decisión del PO, 2026-09-26)

La tarjeta de perfil personalizable — la **Placa** — es parte de la esencia de Prodigia: es la
identidad de cada jugador. Pasa a la app **completa**, con todo lo que se puede personalizar hoy, y
se ve igual en la web y en la app. El estilo oscuro de la app es el escenario; la Placa es lo que
brilla encima. Detalle en §10.

### Qué se conserva de la marca (EXISTE)
- Violeta `#7C5CFF` (primario en oscuro) → dorado `#FFB627` (logro), gradiente a 120°.
- Logo: aro violeta + chispa de 4 puntas con degradé `#A794FF → #E4CBA0 → #FFC53D` (`Logo.tsx`).
- Space Grotesk (títulos), Inter (texto), JetBrains Mono (números, XP, Chispas, tiempo).
- Colores de los 13 mundos (`src/lib/mundos.ts:20-32`) y los glifos flotantes de cada mundo
  (`FondoMundo.tsx`).
- Metáforas: Chispas, ciudades, racha, fantasma, Rankeds, clanes.

### Qué cambia
| Web actual | App nativa |
|---|---|
| Claro (crema) por defecto | **Oscuro por defecto**; claro como opción en Ajustes (v1.1) |
| Botones planos con gradiente | **Botones con volumen** (cara + borde inferior) que se hunden al tocarlos |
| Celebración breve en el resultado | **Cascada de recompensas** de 3-6 s, que se puede saltar |
| Emojis como íconos funcionales | Set propio de íconos SVG; emoji solo en texto de usuarios |
| Input numérico del navegador | Teclado numérico propio con háptica |
| Header con 6 links | Barra inferior de 5 pestañas + HUD superior |

## 2. Tokens de color

### 2.1 Base (reutiliza los valores oscuros de `globals.css`)
| Token | Valor | Uso |
|---|---|---|
| `bg` | `#090C14` | Fondo de la app |
| `bg-hondo` | `#05070D` | Detrás de modales, pantalla del sprint |
| `surface-1` | `#12172A` | Tarjetas |
| `surface-2` | `#171D34` | Tarjetas elevadas, teclado |
| `surface-3` | `#1E2542` | Estados presionados, chips activos |
| `border` | `#232B47` | Bordes de 1 dp |
| `texto` | `#F4F6FB` | Texto principal |
| `texto-2` | `#8892B0` | Texto secundario |
| `primario` | `#7C5CFF` | Acción principal fuera de un mundo |
| `logro` | `#FFB627` | Chispas, recompensas, oro |
| `correcto` | `#3DDC97` | Acierto |
| `error` | `#FF5D5D` | Error |
| `racha` | `#FF8A3D` | Racha, fuego |
| `pro` | gradiente `#7C5CFF → #FFB627` | Todo lo que sea Prodigia Pro |

### 2.2 Color por mundo: base + neón
El color base de cada mundo (EXISTE) se ve apagado sobre fondo oscuro en varios casos (Anatomía,
Calculia, Naipia). Se agrega una variante **neón** para texto, bordes encendidos y brillos.
Los valores neón son PROPUESTA: validar contraste AA contra `surface-1` con un script antes de fijarlos.

| Mundo | Base (EXISTE) | Neón (NUEVO) | Glifos del fondo |
|---|---|---|---|
| Numeria | `#6C4CF1` | `#9B85FF` | + − × ÷ |
| Enigmia | `#0E9F6E` | `#2FD89B` | ? ◆ ▲ |
| Geografía | `#1E7A8C` | `#3FC1D6` | ◎ ⌖ meridianos |
| Quimia | `#C026D3` | `#E36BF2` | ⚛ ⬡ |
| Anatomía | `#8B2942` | `#E0607E` | ♥ huesos |
| Melodía | `#B8860B` | `#F2C14E` | ♪ ♫ 𝄞 |
| Trigonometría | `#84CC16` | `#A8E84A` | △ θ π |
| Historia | `#A0522D` | `#E08A5C` | ⌛ columnas |
| Calculia | `#4338CA` | `#8A83FF` | ∫ ∂ Σ |
| Circuitia | `#F59E0B` | `#FFC247` | Ω ⏚ |
| Estadística | `#0D9488` | `#2DD4BF` | σ x̄ barras |
| Naipia | `#B91C1C` | `#F25C5C` | ♠ ♥ ♦ ♣ |
| Codia | `#06B6D4` | `#4FE0F5` | { } < / > |

Regla: **dentro de un mundo, el token `acento` pasa a ser el neón de ese mundo** (botones, barra de
progreso, anillo del temporizador, brillos). Fuera de los mundos, `acento = primario`.

Todos los colores viven en `packages/tokens` (un JSON que genera variables CSS para la web y un
objeto TS para la app). Resuelve de paso el hallazgo P-01 de `VISUAL-CONSISTENCY-AUDIT.md`.

### 2.3 Rangos (EXISTE en `src/types/database.ts`)
Bronce, Plata, Oro, Platino, Diamante, Prodigio. Faltan los PNG de **Platino** y **Prodigio** en
`public/rangos/` (UX-08). En la app cada rango tiene además un color de brillo para el marco del
avatar y la tarjeta de liga.

## 3. Tipografía

| Estilo | Fuente | Tamaño / interlínea (sp) | Uso |
|---|---|---|---|
| `numero-juego` | JetBrains Mono Bold | 56 / 60 | El problema en el sprint |
| `display` | Space Grotesk Bold | 32 / 36 | Títulos de celebración, nivel nuevo |
| `h1` | Space Grotesk Bold | 26 / 30 | Título de pantalla |
| `h2` | Space Grotesk SemiBold | 20 / 26 | Título de sección |
| `h3` | Space Grotesk SemiBold | 17 / 22 | Título de tarjeta |
| `cuerpo` | Inter Regular | 15 / 22 | Texto general |
| `cuerpo-fuerte` | Inter SemiBold | 15 / 22 | Énfasis |
| `nota` | Inter Medium | 13 / 18 | Secundario |
| `micro` | Inter SemiBold, mayúsculas, +6 % tracking | 11 / 14 | Etiquetas sobre métricas |
| `contador` | JetBrains Mono Bold | 15-20 | Chispas, XP, racha, tiempo en el HUD |

- Respetar el tamaño de fuente del sistema hasta 130 %; el sprint limita a 115 % para que el
  problema quepa.
- Las fuentes de nombre compradas en la tienda (EXISTE: mono, serif, manuscrita, impacto, script,
  futurista, urbana, elegante) se empaquetan solo si el usuario las tiene (descarga bajo demanda).

## 4. Forma, espacio y volumen

- Grilla de 4 dp. Espacios: 4 · 8 · 12 · 16 · 20 · 24 · 32 · 40.
- Radios: chip 12 · botón 16 · tarjeta 20 · tarjeta del sprint 28 · píldora completa.
- Zona táctil mínima 48 × 48 dp (el teclado del sprint usa 64 dp de alto).
- Márgenes laterales de pantalla: 20 dp.

### 4.1 Botón con volumen (`Boton3D`) — el componente más importante
```
 reposo                     presionado
 ┌──────────────────┐
 │     JUGAR        │  cara      ┌──────────────────┐
 ├──────────────────┤            │     JUGAR        │  la cara baja 4 dp,
 └──────────────────┘ labio 4dp  └──────────────────┘  el labio desaparece
```
- Cara: color **base** del mundo (o `primario` fuera de los mundos), **no el neón**: el texto va en
  blanco y el neón no le da contraste suficiente. Labio: el mismo color 35 % más oscuro. El neón
  queda para texto, bordes encendidos y brillos.
- Al tocar: la cara baja 4 dp en 60 ms, háptica ligera; al soltar vuelve con resorte.
- Variantes: `primario` (acento), `logro` (dorado, para reclamar recompensas), `secundario`
  (surface-2 con borde), `peligro` (error), `pro` (gradiente).
- El botón de la acción principal de cada pantalla es siempre `Boton3D` ancho completo, fijo
  abajo, sobre la barra de navegación.

### 4.2 Tarjetas
- `surface-1`, borde 1 dp `border`, brillo superior interno (gradiente de blanco 6 % → 0 en los
  primeros 24 dp) que da sensación de vidrio sin abusar del desenfoque.
- Tarjeta "activa" (mundo seleccionado, misión lista para reclamar): borde en `acento` + sombra de
  color (glow) del acento al 35 %.

## 5. Íconos e ilustración

- Portar los 28 íconos SVG de `src/components/icons.tsx` a `react-native-svg` (trazo 2 dp).
- Íconos de moneda y estado, dibujados como piezas de la marca:
  - **Chispa**: la chispa de 4 puntas del logo, en dorado.
  - **Racha**: llama con 3 estados (apagada gris, encendida naranja, "en llamas" con brillo
    cuando la racha es ≥ 7 días).
  - **Escudo**, **Congelamiento**, **Boost**, **Tiempo extra** (consumibles EXISTEN en
    `src/lib/tienda/costos.ts`).
  - **Nivel**: hexágono con el número en mono.
- **Ilustración de mundos (NUEVO, encargo)**: 13 "ciudades" isométricas nocturnas, una por mundo,
  con las luces en su color neón. Se usan en el mapa de mundos, en el encabezado del hub de cada
  mundo y en la celebración de desbloqueo. Estilo consistente: misma cámara, misma luz de luna,
  siluetas simples (tienen que leerse a 96 dp). Se pueden producir con el MCP de fal que ya usan,
  con un prompt base fijo (agregar a `docs/marketing/PROMPTS-IMAGES.md`).
- **Mascota (NUEVO, opcional, decisión de PO)**: "Chispi", la chispa del logo con cara. Aparece en
  notificaciones, estados vacíos y celebraciones. Una mascota multiplica el apego (Duolingo), pero
  es un compromiso de producción; si no se aprueba, todo el sistema funciona sin ella.

## 6. Fondo vivo de cada mundo

Evolución de `FondoMundo.tsx` (EXISTE en web):
- Glifos del mundo flotando muy lento (opacidad 6-10 %) en capas con parallax al inclinar el
  teléfono (giroscopio, opcional y apagado si "reducir movimiento" está activo).
- Cuando aciertas, los glifos cercanos brillan un instante en neón.
- Con combo alto, la velocidad de los glifos sube un poco: el fondo "acelera" contigo.
- Implementación: Skia, un solo canvas, ≤ 40 glifos, sin re-render de React.

## 7. Movimiento

### 7.1 Tiempos
| Tipo | Duración | Curva |
|---|---|---|
| Micro (toque, cambio de estado) | 90-140 ms | ease-out |
| Estándar (entrar/salir de elementos) | 200-260 ms | ease-in-out |
| Énfasis (tarjeta que aparece, modal) | 320-420 ms | resorte (amortiguación 15, rigidez 180) |
| Celebración | 1,2-2 s por paso, siempre saltable con un toque | resortes + partículas |

### 7.2 Momentos firma
| Momento | Qué pasa en pantalla |
|---|---|
| **Acierto** | El número "sella" (escala 1 → 1,08 → 1), borde de la tarjeta destella en `correcto`, "+12" sale flotando hacia el contador de XP del HUD, 6-10 chispas pequeñas saltan del botón. Tono ascendente. |
| **Racha de aciertos (combo)** | Contador "×3, ×4…" junto al temporizador. En ×5 el borde de la tarjeta se enciende con un gradiente del mundo que gira; en ×10, además, el fondo acelera y el tono sube medio tono por acierto. |
| **Error** | Sacudida horizontal (6 dp, 3 ciclos, 240 ms), háptica de advertencia, se muestra la respuesta correcta 700 ms en `correcto`. Sin sonido estridente; se corta el combo con un "crack" suave. |
| **Fin de sprint** | Cascada de recompensas (§7.3). |
| **Subir de nivel** | Pantalla completa: rayos del color del mundo, el hexágono de nivel se rompe y aparece el nuevo con conteo, Lottie de confeti, háptica fuerte doble. |
| **Racha diaria +1** | La llama crece y el número gira como un cuentakilómetros. A los 7, 30, 100 días: animación especial y marco temporal. |
| **Chispas ganadas** | Las monedas vuelan en curva hasta el contador del HUD, que hace "tic" por cada una (con tope de 12 monedas visibles). |
| **Desbloquear mundo** | La ilustración de la ciudad pasa de gris a encendida con un barrido de luz de izquierda a derecha; los glifos del mundo emergen. |
| **Duelo: VS** | Las dos placas de jugador entran desde los lados, chocan en el centro, destello, cuenta 3-2-1. |

### 7.3 Cascada de recompensas (final de cualquier partida)
Orden fijo, cada paso espera el anterior, un toque adelanta al final:
1. Resultado (aciertos / total, precisión, tiempo) con conteo.
2. XP ganada → barra del nivel de mundo se llena (si se completa, se inserta "Subir de nivel").
3. Chispas → vuelan al HUD.
4. Racha del día (si es la primera partida del día).
5. Progreso de misión del clan / meta diaria (anillo que se cierra).
6. Logro desbloqueado (si hubo), con medalla que gira.
7. Botones: **Otra partida** (`Boton3D` acento) · Volver.

Regla: los datos vienen del servidor (`practica/finish`, `NivelCuentaSubio`, `NivelMundoSubio`,
logros y títulos ya EXISTEN). La app **no calcula recompensas**; solo las anima.

### 7.4 Accesibilidad del movimiento
- Si el sistema tiene "quitar animaciones", se reemplaza todo por fundidos de 150 ms, sin partículas,
  sin parallax, sin sacudidas.
- Nunca depender solo de verde/rojo: acierto y error llevan ícono (✓ / ✗) además del color.

## 8. Háptica y sonido

| Evento | Háptica (`expo-haptics`) | Sonido (sample NUEVO) |
|---|---|---|
| Tocar tecla del teclado | selección | clic suave (opcional, apagado por defecto) |
| Tocar `Boton3D` | impacto ligero | — |
| Acierto | impacto medio | "ding" con tono según combo (8 alturas) |
| Error | notificación advertencia | "tuc" grave corto |
| Combo ×5 / ×10 | impacto fuerte | acorde breve |
| Chispa llega al HUD | selección (máx. 1 cada 60 ms) | "tic" metálico |
| Subir de nivel | éxito + impacto fuerte | fanfarria de 1,5 s |
| Duelo ganado / perdido | éxito / advertencia | jingle corto / descendente |
| Racha +1 | éxito | "fuuush" de llama |

- Sonido y háptica con interruptores separados en Ajustes (EXISTE `SonidoToggle` en web).
- Volumen de efectos nunca por encima de la música del sistema; respetar modo silencio.
- Set total: ~16 samples, OGG, < 400 KB entre todos.

## 9. Pantalla del sprint (la más importante)

Ver wireframe en `03-PANTALLAS-Y-NAVEGACION.md` §4.5. Reglas visuales:
- Fondo `bg-hondo` + fondo vivo del mundo. Nada de navegación visible: solo la X para salir
  (con confirmación, como ya hace la web desde 2026-09-24).
- Arriba: anillo de tiempo (acento), 5 puntos de progreso, combo, escudos disponibles.
- Centro: tarjeta del problema (radio 28) con el enunciado en `numero-juego`.
- Abajo: teclado numérico propio 3×4 + fila de acciones (borrar, signo, coma decimal según el tipo
  de problema), teclas de 64 dp, respuesta visible arriba del teclado.
- Mundos de opción múltiple (Enigmia, Anatomía, Historia…): 2×2 tarjetas grandes en vez del
  teclado, con la misma respuesta física.

## 10. La Placa de jugador

> Decisión del PO (2026-09-26): la personalización del perfil es parte de la esencia de Prodigia y
> **no se pierde ni se simplifica** en la app. Inventario comercial detallado en
> `docs/marketing/PERFIL-PERSONALIZACION.md`.

### 10.1 Qué tiene una Placa (EXISTE, verificado en código)

| Capa | Opciones | Dónde vive hoy |
|---|---|---|
| **Fondo** | 5 colores lisos (océano, bosque, aurora, dorado, nebulosa), Prodigio (Pro), **imagen o GIF propio** (≤ 3 MB), **galería de fondos animados** que se amplía sin deploy (0152) | `FondoPerfilCapa.tsx`, `SubirFondoPerfil.tsx`, bucket `fondos-perfil` |
| **Avatar** | imagen propia **PNG/JPG/WEBP/GIF** (≤ 2 MB) | `SubirAvatar.tsx`, bucket `avatares` |
| **Marco** | 6 de rango, 3 neón, 13 de ciudad (nivel 40 en esa ciudad) | `AvatarConMarco.tsx`, `public/marcos/` |
| **Nombre** | 8 fuentes, color libre, 10 animaciones (ondulante, brillo, arcoíris, glitch, neón, deconstrucción, glitch intenso, shuffle, decrypted, prisma) | `NombreConFuente.tsx`, `reactbits/Shuffle`, `reactbits/DecryptedText` |
| **Título** | el que elija entre los ganados | `TitulosSection.tsx` |
| **Datos** | rango + ELO, nivel de cuenta y XP histórica, Chispas, puesto en el ranking histórico, clan con estandarte, ciudades favoritas con nivel real, fecha de alta | `perfil/page.tsx`, `perfil/[userId]/page.tsx` |

### 10.2 Una Placa, cinco tamaños

Los mismos datos se ven en toda la app; lo que cambia es cuánto se muestra y cuánto se anima.

| Variante | Dónde | Qué muestra | Movimiento |
|---|---|---|---|
| **Completa** | Perfil propio y perfil público | Todo | Todo animado |
| **VS** | Pantalla de duelo, antes de empezar | Fondo, avatar + marco, nombre con estilo, título, rango | Todo animado: es el momento de lucirse ante el rival |
| **Tarjeta** | Amigos (cuadrícula de 2), podio del ranking, miembros del clan | Fondo, avatar + marco, nombre con estilo, título, rango, nivel | GIF solo si está en pantalla; animaciones de nombre livianas |
| **Fila** | Ranking, liga, resultados de duelo | Avatar + marco chico, nombre con fuente y color, título corto | Primer cuadro fijo |
| **Mini** | HUD, chat de clan, mensajes | Avatar + marco, nombre con color | Fijo |

Regla ya vigente en la web que se mantiene: shuffle y decrypted solo se animan en la variante
Completa.

Tocar la Placa de otro jugador, en cualquier variante, abre su Placa Completa.

### 10.3 Mejoras propuestas (sin quitar nada)

Observadas en el perfil real (captura del PO, 2026-09-26):

1. **Legibilidad sobre fondos animados.** Sobre un GIF con mucho detalle se pierden textos como
   "1304 ELO" o "Color de tu nombre". Propuesta: velo oscuro en degradado detrás del bloque de
   texto (de 0 % arriba a ~55 % abajo) y los datos dentro de una tarjeta de vidrio, como ya se hace
   con la caja de nivel. El fondo sigue siendo protagonista arriba.
2. **Separar ver de editar.** Hoy los controles ("Cambiar foto", "Cambiar imagen de fondo",
   "Editar", el selector de color) están dentro de la Placa. En la app, la Placa se ve limpia,
   igual a como la ven los demás, y un botón de lápiz abre el **Editor de placa**: pantalla con la
   Placa en vivo arriba y abajo pestañas Fondo · Avatar · Marco · Nombre · Título. Lo que no se
   tiene aparece con candado y precio, con vista previa sobre tu propia Placa (NUEVO).
3. **Encuadre del fondo** (NUEVO): al subir una imagen, elegir el punto de interés para que se vea
   bien tanto en la variante Completa (vertical) como en la Tarjeta (más cuadrada). Requiere dos
   columnas nuevas en `profiles` (`fondo_foco_x`, `fondo_foco_y`).
4. **Compartir la Placa** (NUEVO): exportarla como imagen, o como clip corto si el fondo está
   animado, con la hoja de compartir de Android. La identidad del jugador es la mejor publicidad.

### 10.4 Implementación en la app

- **GIF y WebP animados**: `expo-image` los reproduce. En listas, pausar lo que no está en pantalla
  y tener como máximo ~6 animaciones a la vez; en equipos de gama baja, las variantes Tarjeta y
  Fila usan el primer cuadro.
- **Peso** (NUEVO): convertir en el servidor cada GIF subido a WebP animado (pesa varias veces
  menos) y guardar el original. La app descarga la versión liviana.
- **Animaciones de nombre**: portar las 10 con Reanimated/Skia. Criterio de terminado: video de la
  misma animación en web y app, lado a lado, sin diferencias visibles.
- **Fuentes compradas**: descarga bajo demanda y caché (ver §3).
- **Un solo contrato de datos**: tipo `PlacaDatos` en `packages/core` y la RPC que ya existe para el
  perfil público como fuente. Web y app pintan desde lo mismo, así no se separan con el tiempo.
- **Reducir movimiento**: si el sistema lo pide, la Placa se muestra con el primer cuadro.

### 10.5 Moderación de imágenes

Avatares y fondos son contenido subido por usuarios, visible para otros jugadores, muchos menores.
Los buckets ya limitan tamaño y tipo en el servidor (0039, 0143) y existe reportar usuario (0040).
Falta: "Reportar imagen" específico, cola de revisión, y ocultar automáticamente una imagen cuando
acumula varios reportes hasta que alguien la revise. Google Play exige moderación del contenido de
usuarios. Ver PROD-05 en `docs/audits/REVISION-GENERAL-2026-09-26.md`.
