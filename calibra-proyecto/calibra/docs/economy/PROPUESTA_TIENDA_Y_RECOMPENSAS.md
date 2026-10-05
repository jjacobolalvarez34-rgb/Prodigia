# Propuesta: más cosas en la tienda y recompensas que enganchen (sin pase de batalla)

Estado: **aprobada e implementada (2026-10-05)** en la web y en la app (`docs/PARIDAD_APP_WEB.md`).
Los precios, las probabilidades y lo que toca cada recompensa los decide la base, nunca el cliente.

| Pieza | Base | Lógica compartida | Web | App |
|---|---|---|---|---|
| Catálogo de cosméticos, compra, paquetes, temporada, utilidades | `0248_catalogo_cosmeticos_y_tienda.sql` | `src/lib/recompensas/catalogo.ts` (+ test de precios) | `tienda/TiendaAmpliada.tsx` | `app/tienda.tsx` (pestañas nuevas) |
| Cápsulas, misiones, calendario, colecciones, regalos | `0249_capsulas_misiones_calendario.sql` | `src/lib/recompensas/api.ts` | `/recompensas`, `TarjetaRecompensas` | `app/recompensas.tsx`, tarjeta en Hoy |
| Estela, efecto y sonido de acierto | columnas de `profiles` (0248) | `ESTELAS`, `EFECTOS`, `particulasDe`, `SONIDOS` | `RachaFuego`, `EfectoAciertoGlobal`, `lib/sonido.ts` | `Sprint.tsx`, `EfectoAcierto`, `efectos.ts` + `.wav` |
| Pista y segunda oportunidad | `usar_ayuda_partida` (0248) | — | `useAyudasPartida` + `ConsumiblesPartida` en los 15 modos | `useConsumibles` en los 3 sprints |
| Emotes de duelo | — (canal en vivo `duelo:<id>:vivo`, evento `emote`) | `EMOTES` | `EmotesDuelo` | `EmotesDuelo` |
| Ciudad de la Placa | `ciudad_placa_de` (0248) | `CIUDADES` | `CiudadSkyline` en el perfil | `Placa.tsx` |
| Anuncio | `0250_anuncio_recompensas.sql` | | | |

Ajustes respecto del texto de abajo: el "título" de cada colección es «Habitante de <ciudad>»; los
marcos de temporada son 4 (Aurora, Brasas, Escarcha, Cosmos) y rotan mes a mes; la cápsula de nivel
es aparte de las Chispas de regalo que ya da subir de nivel.

## La idea en una frase

Que cada sesión termine con **algo que abrir** y que siempre haya **algo cerca de conseguir**: una
cápsula diaria gratis, colecciones que se completan por partes y misiones cortas. Todo se gana
jugando; lo que se compra con Chispas son cosméticos y ayudas, nunca ventaja en duelos.

## 1. Cápsulas de Chispas (las "cajas")

Una cápsula se abre con la misma animación que ya tiene la de subir de nivel: cae, se toca, se
abre. Adentro trae **una** recompensa.

| Cápsula | Cómo se consigue | Qué puede traer |
|---|---|---|
| **Diaria** | Gratis, una por día, al terminar la primera partida | 20–80 Chispas, o 1 escudo / hielo / +3 s |
| **De racha** | Cada 7 días de racha seguidos | 150–400 Chispas, o un cosmético común/raro |
| **De nivel** | Al subir de nivel de cuenta (ya existe, hoy solo da Chispas) | Chispas + 20 % de chance de un cosmético raro |
| **De ciudad** | Al llegar a los niveles 10, 20, 30… de una ciudad | Cosmético temático de esa ciudad (ver §2) |
| **De liga** | Al cerrar la semana, según tu puesto en la liga | Chispas y un cosmético épico/legendario para el podio |

Reglas para que sea sano (y para cumplir con Google Play y las tiendas de apps con menores):
- **Las cápsulas no se compran con dinero real, ni directa ni indirectamente.** No se venden en la
  tienda, ni siquiera por Chispas: solo se ganan jugando. Así no es una "caja de botín" pagada.
- **Probabilidades a la vista**: cada cápsula muestra antes de abrirla qué puede traer y con qué
  chance (botón "¿Qué puede salir?").
- **Sin repetidos**: si sale un cosmético que ya tienes, se convierte en Chispas (su precio ÷ 3).
- **Garantía**: cada 10 cápsulas sin nada raro, la siguiente trae uno seguro.
- En la base: tabla `capsulas_usuario` (pendientes) + RPC `abrir_capsula(id)` que sortea con el
  azar del servidor y acredita en la misma transacción.

## 2. Más cosas para vender (con Chispas)

| Categoría | Ítems nuevos | Precio sugerido |
|---|---|---|
| **Estelas de racha** | La llama del sprint cambia de color/forma: azul, verde esmeralda, violeta, dorada, arcoíris | 1.200 – 3.500 |
| **Efectos de acierto** | Lo que estalla al acertar: chispas (actual), confeti, burbujas, notas musicales, píxeles | 900 – 2.400 |
| **Sonidos de acierto** | Paquetes de tonos: campanitas, 8-bit, marimba | 800 – 1.500 |
| **Ciudades de la Placa** | Un skyline chico detrás del avatar, el de tu ciudad favorita | 2.000 |
| **Emotes para duelos** | Reacciones que se mandan al rival en la sala (👏 ¡Bien jugado!, 🔥, 😅) | 400 – 900 |
| **Títulos comprables** | Títulos cosméticos sin mérito (los de logros siguen sin venderse) | 1.500 |
| **Marcos de temporada** | Marcos que solo se venden un mes (escasez sin pase de batalla) | 3.000 – 6.000 |
| **Paquetes** | Juegos temáticos más baratos que sueltos: "Pack Noche" (fondo + marco + estela) | −25 % sobre la suma |
| **Utilidades nuevas** | "Segunda oportunidad" (repite la última pregunta fallada), "Pista" (descarta 2 opciones), cofre de 3 hielos | 300 – 800 |

Las utilidades nunca se pueden usar en duelos ni en Rankeds (igual que hielo y +3 s hoy).

## 3. Recompensas que hacen volver (sin pase de batalla)

- **Calendario de 7 días**: entrar y jugar una partida cada día da un premio creciente (día 7 =
  cápsula de racha). Si se corta, vuelve al día 1, pero el congelamiento de racha también lo cubre.
- **3 misiones diarias** cortas y variadas ("acierta 15 en Quimia", "gana un duelo", "completa una
  lección"). Cada una da Chispas; las tres juntas dan la cápsula diaria extra.
- **Colecciones**: cada ciudad tiene una colección de 6 cosméticos (marco, fondo, estela, efecto,
  emote, título). Algunos se compran, otros salen en cápsulas de ciudad o de liga. Completar la
  colección da un marco animado exclusivo de esa ciudad.
- **Hitos de dominio**: completar todas las Técnicas de una ciudad da su cápsula de ciudad;
  completar las Clases (Pro), un cosmético exclusivo.
- **Doble experiencia diaria** (ya hecho): el paquete en paracaídas marca la ciudad del día.
- **Regalos entre amigos**: mandar 1 hielo o 1 escudo por día a un amigo (no se pueden mandar
  Chispas, para evitar granjas de cuentas).

## 4. Cómo se ve la economía

Hoy una persona activa gana ~300–600 Chispas por día (partidas + retos). Con esta propuesta suma
unas 80–150 por día entre cápsula diaria y misiones, y algo más por semana con racha y liga. Para
que las Chispas no pierdan valor, los precios de §2 están pensados para que un cosmético épico
cueste ~1 semana de juego y un legendario ~3 semanas.

## 5. Orden sugerido para hacerlo

1. Cápsula diaria + misiones diarias (lo que más engancha, poco trabajo).
2. Estelas de racha y efectos de acierto (se ven en cada partida).
3. Calendario de 7 días y cápsula de racha.
4. Colecciones por ciudad y cápsulas de ciudad.
5. Emotes de duelo, marcos de temporada y paquetes.

Cada paso es un trabajo con su migración, su pantalla en la web y en la app, y su anuncio
(sistema `anuncios`, igual que los mundos nuevos).
