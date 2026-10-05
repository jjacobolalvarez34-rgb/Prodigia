# Paridad web ↔ app Android

**Regla vinculante.** Prodigia es UN producto con dos pantallas: la web (`calibra/`) y la app
Android (`mobile/`). Todo lo que el jugador ve, juega, aprende o gana existe en las dos, con el
mismo contenido, las mismas reglas y los mismos números. Un cambio que toque una sola de las dos
está **incompleto**: no se cierra, no se commitea como terminado y no se anuncia hasta que la otra
también lo tenga (o hasta que esté anotado acá como excepción, con su motivo).

Esto vale para agentes y personas, sin pedir permiso cada vez: es la forma de trabajar.

## Qué se comparte y qué se duplica

La app importa la lógica pura de la web con el alias `@/` (→ `calibra/src`). Lo que se importa
**no se copia nunca**: un cambio ahí llega a las dos de una vez.

| Se comparte (una sola fuente, `calibra/src`) | Se hace dos veces (web y app) |
|---|---|
| Generadores de problemas de los 13 mundos (`lib/practica/*`) | Pantallas y componentes visuales (DOM/Tailwind vs. React Native) |
| Niveles, XP, rangos, ELO, retos, descuentos, logros, títulos | Visuales animados de las lecciones (`components/<mundo>/visuales` ↔ `mobile/src/ui/aprender/<mundo>`) |
| Caminos de Aprender (`lib/<mundo>/path.ts`, `lib/aprender/*`) | Runners de partida (web: un runner por mundo; app: sprint genérico + adaptador) |
| Contenido de las lecciones (tablas `techniques` / `logic_techniques`) | Textos de interfaz (web: `messages/*.json`; app: en el código, español neutro) |
| Base de datos, RLS y RPC (`supabase/migrations`) | |

Si algo de la columna derecha cambia en un lado, se cambia en el otro en el mismo trabajo.

## Checklist por tipo de cambio

**Mundo nuevo o modo nuevo de un mundo**
- Web: generador en `lib/practica/<mundo>.ts` + runner + rutas (ver `PARIDAD_MUNDOS.md`).
- App: adaptador en `mobile/src/lib/mundosJugables/<mundo>.ts` (modo con `NOMBRE_MODO_*` de la
  web), `enApp: true` en `mobile/src/tema.ts`, visual nuevo en `mobile/src/ui/visuales` si la
  pregunta dibuja algo que no existía, diagnóstico en `mobile/src/lib/diagnostico.ts`.

**Lección nueva o editada (Técnicas o Clases)**
- El texto y el quiz viven en la base: una migración los carga para las dos.
- Si la lección usa un visual (`contenido.visuales[].tipo`), ese `tipo` tiene que existir en el
  registro de la web **y** en el de la app (`mobile/src/ui/aprender/registro.ts`). Un tipo que
  falta en un lado se omite en silencio: por eso lo vigila el script de paridad.

**Visual de lección nuevo o cambiado**
- Web: `components/<mundo>/visuales/<Nombre>.tsx` + su `registro.ts`.
- App: `mobile/src/ui/aprender/<mundo>/<Nombre>.tsx` + `mobile/src/ui/aprender/registro.ts`,
  dibujando lo mismo (mismos datos, mismos pasos de animación).

**Economía, tienda, logros, retos, duelos, clanes, social**
- La regla y los números van en `calibra/src/lib` o en la base: las dos los leen de ahí.
- La pantalla se hace en las dos. Excepción documentada abajo: la Trastienda (PROD-01).

**Migraciones**
- Si la app necesita algo que la web hace en una ruta `/api/*` (la app habla directo con Supabase),
  se pasa a una RPC `security definer` para que la base decida, nunca el cliente (ej.
  `0245` intentos sin conexión, `0246` completar_leccion).

## Verificación automática

`cd mobile && npm run paridad` revisa:
1. Que cada modo de cada mundo de la web (`NOMBRE_MODO_*`) tenga su modo en la app.
2. Que cada mundo tenga `enApp: true` y adaptador (o pantalla propia: Numeria y Geografía).
3. Que cada `tipo` de visual de lección registrado en la web esté registrado en la app (y viceversa).

Sale con error si algo falta. Se corre antes de cerrar cualquier cambio que toque mundos,
lecciones o visuales, junto con `tsc` y `eslint` de los dos proyectos.

## Excepciones vigentes (lo único que puede estar en un solo lado)

| Qué | Dónde | Motivo |
|---|---|---|
| Trastienda y apuestas | Solo web | PROD-01: política de Google Play para apps con menores |
| Comprar Pro o Chispas con dinero | Solo web por ahora | Llega a la app con Google Play Billing |
| Widgets de la pantalla de inicio, intro de Mamut | Solo app | Son del sistema Android |
| Práctica sin conexión | Solo app | La web no funciona sin conexión |
| Borrar la cuenta | Web (la app abre la web) | Pendiente dentro de la app |
