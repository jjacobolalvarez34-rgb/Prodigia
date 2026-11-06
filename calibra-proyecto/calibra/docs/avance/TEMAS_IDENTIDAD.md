# Temas con identidad y Letra libre (2026-11-06)

Pedido: «refina los temas de la app: me he comprado varios y el cambio casi no se nota
en algunos» y «poder cambiar la fuente de TODA la app, como un token que vendemos».

## Qué se hizo

### A. Cada tema cambia más que los colores (web y app iguales)

Los datos viven en `src/lib/recompensas/temas.ts` (lo leen la web y la app):

- `letra` en cada tema y el catálogo `LETRAS_APP` (letra de títulos: display/h1/h2/h3,
  botones, títulos de tarjetas; el cuerpo y los números no cambian). Cada letra trae
  `escala` (las anchas van más chicas: Arcade 0,62, Cartel y Píxel 0,85, Consola 0,88…)
  e `interlineado` mínimo (las de trazo alto se cortaban arriba en Android).
- `formaTema(slug)`: radio de tarjetas (radio×2,5), de botones (radio×2; 0 = esquinas
  rectas), chips y hojas, grosor del borde y sombra (dura / suave / ninguna).
  `FORMA_CLASICA` = la de siempre (botones píldora). `letraEfectiva(tema, elegida)`:
  la elegida con la Letra libre gana sobre la del tema.

| Tema | Letra de títulos | Forma |
|---|---|---|
| Mesa de cartas | Cartel (Bungee) | radio 12,5, borde 2, sombra dura negra |
| Reino | Aventura (Luckiest Guy) | radio 17,5, borde 2, sombra suave |
| Huerto | Redonda (Fredoka) | esquinas rectas, borde 2 |
| Portátil | Píxel (Silkscreen) | esquinas rectas, borde 2 |
| Biblioteca | Máquina de escribir (Special Elite) | radio 5, borde 1, sombra suave |
| Olimpo | Romana (Cinzel) | esquinas rectas, borde 1 |
| Imprenta | Imprenta (Inter negrita) | esquinas rectas, borde 2, sombra dura negra |
| Cuaderno | Marcador (Permanent Marker) | radio 15, borde 1, sombra dura de tinta |
| Misión | Consola (Audiowide) | radio 17,5, borde 1 |
| Atardecer | Retro (Righteous) | radio 7,5, sin borde, sombra dura pastel |
| Recreativa | Arcade (Press Start 2P) | esquinas rectas, borde 1 |
| Atlas | Cursiva (Lobster) | radio 5, borde 1 |

Sin tema (clásico) no cambia nada: `formaTema`/`variablesCssTema` devuelven null, la
app usa exactamente los radios, bordes y fuentes de antes (probado en temas.test.ts).

**Web**
- `variablesCssTema` agrega `--fuente-titulos`, `--escala-letra`, los radios de
  Tailwind (`--radius-lg/xl/2xl/3xl`), `--radio-boton` y `--borde-tema`.
- `globals.css`: `--font-display: var(--fuente-titulos, var(--font-space-grotesk))`;
  reglas bajo `html[data-tema-app]` (píldoras con relleno lateral → `--radio-boton`;
  avatares e interruptores redondos no se tocan), grosor de borde de tarjetas, sombra
  dura/suave (`data-tema-sombra`), y bajo `html[data-letra]` sin negrita falsa y con
  los tamaños de Tailwind escalados adentro de `font-display`.
- `temaAppWeb.ts` y el script de arranque (`temaAppScript.ts`) ponen todo antes del
  primer pintado; la letra elegida se guarda aparte (`prodigia-letra-app`) y pisa la
  del tema.

**App** (`mobile/src/tema.ts`, decidido al arrancar)
- `fuente.display/displaySemi` = la letra efectiva; `radio` según el tema; `forma`
  (borde, sombra, radio de píldora y de hoja, escala e interlineado de títulos).
- `Texto`: todo texto en la letra de títulos (variantes o `fuente.display` en el
  estilo) se escala y lleva su interlineado; sin letra propia no se toca nada.
- `Tarjeta`, `Boton3D` (radio, contorno y sombra dura), `Segmentos`, `Hoja` y el botón
  atrás de `Pantalla` usan la forma del tema.

### B. Letra libre (token que se vende)

- Desbloqueo único, épico, 400 Cometas, puesto Caligrafía. Sale también en las
  cápsulas que traen temas (prisma, supernova, Alineación y Pro). Solo cosmético.
- Con ella se elige la letra de títulos de toda la app entre las 12 de los temas +
  «La de siempre» + «La del tema».
- Base: `supabase/migrations/0314_letra_libre.sql` (categoría `letra_app`, columnas
  `profiles.letra_libre` y `profiles.letra_app`, `comprar_letra_libre()`,
  `elegir_letra_app(p_letra)`, `_tiene_cosmetico`/`_dar_cosmetico`/`abrir_capsula`
  redefinidas desde 0297).
- API: `estadoLetraApp`, `comprarLetraLibre`, `elegirLetraApp` (`src/lib/recompensas/api.ts`).
- Web: `components/temas/LetraLibre.tsx` (Bazar › Caligrafía, Inventario › Nombre y
  Ajustes), `MuestraLetraLibre.tsx` (emblema; también en cápsulas). En caliente.
  `AplicarTemaApp` sincroniza la letra de la cuenta.
- App: `lib/letraApp.ts` (archivo `letra-app.json`, como el tema),
  `ui/temas/LetraLibreApp.tsx` (Ajustes › Aspecto y Bazar › Caligrafía),
  `ui/temas/MuestraLetraLibre.tsx`; `AvisoTemaApp` ofrece «Aplicar ahora» (reinicio)
  también para la letra. El Bazar acepta `?pestana=caligrafia`.
- Textos de la web: `LetraLibre.*` en `messages/es.json` y `en.json`.

### Correcciones tras mirar las capturas

- Títulos `font-display` sin clase de tamaño (heredan): también se escalan (Recreativa
  dejaba «¡Doble experiencia…» enorme en el teléfono).
- Piso de tamaño para la letra chica escalada (10-11 px en la web, 10 en la app): con
  Arcade los botones quedaban en 8 px.
- `titulo-flexible` (CartelPlegable): con letra ancha el título del evento pasa a dos
  líneas en vez de cortarse en «Fiesta de …».
- Botones dorados `bg-logro text-foreground`: con tema, texto oscuro #2A1A00 (en los
  temas oscuros quedaba blanco sobre amarillo).

## Pendiente

- **Correr la migración 0314** (`0314_letra_libre.sql`). Sin ella la Letra libre no se
  muestra (ni en la web ni en la app); los temas con identidad funcionan igual.
- Pantallas con estilos propios (no los componentes base) siguen con sus radios fijos;
  si alguna desentona con un tema, ajustarla a `forma`/`radio`.
- Revisar en el teléfono (APK) los títulos con Arcade y Cursiva en pantallas angostas.

Capturas de verificación: `D:\Repositorios\Prodigia\temporales\capturas-temas\`.
