# Encargo para Claude Code: minievento «Gánale al modelo»

Pégale este archivo a Claude Code dentro del repo de Prodigia (carpeta `calibra-proyecto/calibra`), junto con `politica_blackjack.json`.

---

## Contexto

Mañana (24 de noviembre) presento en la jornada de proyectos de la Konrad Lorenz un proyecto de Computación Científica: un blackjack simplificado modelado como proceso de decisión de Markov, cuya política óptima π* se calculó en Python con iteración de políticas. Durante la presentación, el público va a escanear un QR y jugar contra ese modelo desde el celular. Además quiero dejarlo como un minievento de temporada de Prodigia, conectado con Naipia.

**El QR de las diapositivas ya apunta a `https://prodigia-sandy.vercel.app/es/ganale-al-modelo`.** No cambies esa ruta.

Hay que tenerlo desplegado en Vercel esta noche. Prioridad: que funcione bien y no rompa nada. Sin migraciones, sin dependencias nuevas y sin tocar la base de datos.

Sigue AGENTS.md (claim en `docs/agent-work/ACTIVE.md`, verificación y registro en `docs/PROGRESO.md`). Lee la guía de Next en `node_modules/next/dist/docs/` antes de escribir rutas. Sobre la paridad web ↔ app: haz solo la web esta noche, regístralo como excepción PENDIENTE en `docs/PARIDAD_APP_WEB.md` y en el claim. Si no estás de acuerdo con eso, dime por qué antes de empezar.

## Qué construir

### 1. Ruta pública `src/app/[locale]/ganale-al-modelo/`

- **Debe abrir sin iniciar sesión** (el público entra desde el QR). No llames a `requireUsuario` ni redirijas a `/login`. Verifica que `src/proxy.ts` y `src/lib/auth/rutasInvitado.ts` no la bloqueen.
- Pensada para celular primero; en pantalla grande también se ve bien.
- Estética de Naipia (rojo `#B91C1C`, `COLOR_NAIPIA` en `src/app/[locale]/naipia/colores.ts`) sobre un paño verde de casino. Reutiliza `CartaSVG` y `DorsoSVG` de `src/components/naipia/CartaSVG.tsx` para dibujar las cartas.
- Textos en español neutro con «tú» y traducción al inglés por next-intl, como el resto de la app.

### 2. Mecánica del juego (modo público, el principal)

- Una partida son **3 manos** (deja el número en una constante: la presentación dura 20 minutos y el público tiene solo un minuto para jugar). El jugador y el modelo juegan **cada mano con exactamente las mismas cartas**: la misma carta visible del crupier, la misma carta oculta, el mismo orden de cartas para pedir y las mismas cartas del crupier. Esta es la técnica de «números aleatorios comunes» del proyecto, y es lo que hace justa la comparación. Implementación sugerida: por mano, genera una secuencia de cartas para el jugador y otra para el crupier; el jugador y el modelo toman cartas de la misma secuencia del jugador, cada uno desde el principio.
- Reglas (iguales al modelo, no las cambies):
  - Baraja infinita: cada carta sale con probabilidad 1/13, y el 10 con 4/13 porque incluye J, Q y K.
  - El jugador solo puede **pedir** o **plantarse**. Si pasa de 21, pierde aunque el crupier también se pase.
  - El As vale 11 si no te pasas y si no, 1. Una mano con un As que vale 11 es **suave**.
  - El crupier pide hasta 17 y **se planta con todo 17, incluido el 17 suave (S17)**. No revisa su carta oculta.
  - Pagos: ganar +1, empatar 0, perder −1. El blackjack natural cuenta como un 21 cualquiera.
- Flujo de una mano: se reparten las dos cartas del jugador y la carta visible del crupier. El jugador elige Pedir o Plantarse hasta que se planta o se pasa. Luego el crupier juega. Después se muestra, lado a lado, **qué hizo el jugador y qué hizo el modelo** con esas mismas cartas, y el resultado de cada uno.
- Cuando el jugador tomó una decisión distinta de π*, se explica en una línea con los valores de `politica_blackjack.json`. Ejemplo: «Con duro 16 contra un 7 el modelo pide: plantarse pierde 48 por cada 100 manos así; pedir pierde 41». Los valores son `q_plantarse` y `q_pedir` × 100, redondeados.
- Al final de las 3 manos: fichas del jugador contra fichas del modelo, «¿Le ganaste al modelo?», en cuántas decisiones coincidiste con π* y una frase honesta: en 3 manos manda la suerte; en promedio el modelo pierde unas 4.7 fichas por cada 100 manos y nadie le gana a la casa. Botón para jugar otra partida.
- Guarda solo en `localStorage` (con try/catch) la mejor marca de coincidencias. Nada en el servidor.
- Un panel plegable «¿Cómo decide el modelo?» con 3 o 4 líneas: 280 situaciones (total, si tiene As suave, carta del crupier), iteración de políticas, valores exactos resolviendo un sistema lineal. Y un enlace a Naipia: «¿Quieres aprender a contar cartas? Naipia».

### 3. Modo presentador: `?modo=mesa`

Es para proyectar durante la presentación con **cartas reales**:

- Un teclado de cartas (2–9, 10, A) para registrar las cartas reales en orden de reparto: primera del jugador, visible del crupier, segunda del jugador. Después, las que pida el jugador y las del crupier.
- Botones «El jugador pide» y «El jugador se planta» para registrar lo que hizo el voluntario.
- Un recuadro grande con la decisión de π* («PEDIR» o «PLANTARSE») y los dos valores por cada 100 manos. Un interruptor «Ocultar hasta que el público vote», con botón «Revelar».
- El conteo Hi-Lo corriente y el verdadero de todas las cartas registradas (+1 del 2 al 6, 0 del 7 al 9, −1 para 10 y As; reutiliza `TABLA_SISTEMAS.hilo` de `src/lib/practica/naipia.ts`), con selector de barajas y botón «Barajar».
- «Deshacer», «Nueva mano», y atajos de teclado (2–9, 0 = 10, A = As, P = pedir, L = plantarse, N = nueva mano, Retroceso = deshacer).
- Letra grande: se tiene que leer desde el fondo de un salón.

### 4. Datos y lógica pura

- Copia `politica_blackjack.json` como datos tipados en `src/lib/ganaleModelo/politica.ts` (o impórtalo como JSON si el proyecto ya lo hace en otro lado).
- Lógica pura y testeable en `src/lib/ganaleModelo/`: valor de la mano (total, suave, pasado), decisión de π* para (mano, carta visible), juego del crupier S17, resultado, generación de manos con un RNG inyectable y conteo Hi-Lo.
- Los totales duros de 4 a 11 siempre piden (vienen en el JSON como D4–D11). Duro 21 y suave 21 se plantan solos.

### 5. Entrada desde la página principal

Una tarjeta o banner de temporada «Gánale al modelo» en la página principal, la pública y la de usuario con sesión. Que lleve a `/ganale-al-modelo`, siga el estilo de los minieventos existentes (`src/lib/temas/`) y no desordene nada más.

## Pruebas (vitest)

En `src/lib/ganaleModelo/*.test.ts`:

- A + A = suave 12; suave 20 + 5 = duro 15; duro 16 + 10 = pasado; duro 10 + A = suave 21.
- π*: duro 16 contra 7 → pedir; duro 16 contra 6 → plantarse; duro 12 contra 4 → plantarse; duro 12 contra 3 → pedir; suave 18 contra A → pedir; suave 18 contra 8 → plantarse; suave 17 contra cualquier carta → pedir.
- Crupier S17: A + 6 se planta (suave 17); 10 + 6 pide.
- Con la misma secuencia de cartas, el jugador y el modelo reciben las mismas cartas.
- Hi-Lo: 2,3,4,5,6 suman +5; 10,J,Q,K,A suman −5.

## Verificación antes de subir

`npx tsc --noEmit`, `npm run lint`, `npm test`, `npm run build`. Prueba en el navegador `/es/ganale-al-modelo` **sin sesión iniciada** y `/es/ganale-al-modelo?modo=mesa`. Luego haz commit y push a la rama que despliega Vercel, y confirma que la URL pública abre en el celular.

Si algo no da para esta noche, prioriza en este orden: (1) ruta pública + modo público, (2) modo mesa, (3) banner en la principal, (4) inglés.
