# Plan: tutorial guiado en cada sección (web y app)

Pedido del 2026-11-23: «un tutorial guiado en cada sección, bonito, para que entiendan de qué va Prodigia». Estado: **PLAN, esperando aprobación** (3 decisiones al final).

## Qué existe hoy

| Dónde | Pieza | Qué hace | Se reutiliza |
|---|---|---|---|
| App | `mobile/src/ui/RecorridoPestanas.tsx` | 7 pasos la primera vez: Chispas, racha y las 5 pestañas, con un foco que late sobre cada una | Sí: su foco y su tarjeta son la base visual |
| App | `mobile/src/ui/GloboAyuda.tsx` + `GLOBOS` en `lib/ayudas.ts` | Un globo de texto por sección (mundos, ciudad, competir, social, tienda, recompensas, resultado, perfil), una vez por teléfono | Su texto pasa a ser el primer paso de cada recorrido; el globo se retira |
| App | `lib/ayudas.ts` (`medirHud`) | Mide dónde está un elemento en pantalla para enfocarlo | Sí: se generaliza a cualquier ancla |
| App | Ajustes → «Ver el tutorial otra vez» | Repite el recorrido de pestañas | Pasa a repetir todos |
| Web | `Header` `mostrarTour` | Tour viejo, **desactivado** (quedaba un globo pegado) | No; se reemplaza |
| Web | `PrimeraVezTip`, `AvisoPrimeraVez` | Avisos sueltos de primera vez en inicio y ciudades | Se dejan; el recorrido nuevo no los duplica |
| Web | Anclas `data-tour="…"` | Ya puestas en el panel docente, Mi curso, el estudio y el inicio | Sí |

## Cómo se ve

- Todo se oscurece menos el elemento que se explica, que queda con un borde del color de la sección (neón de la ciudad dentro de una ciudad; violeta fuera) y un latido suave, como el foco que ya tiene la app.
- Al lado, una tarjeta corta: «2 de 5», título, una o dos frases, y los botones **Siguiente**, **Atrás** y **Saltar**. Nunca más de 5 pasos por sección ni más de 2 frases por paso.
- Si el elemento está fuera de la pantalla, se desplaza hasta él antes de enfocarlo.
- Cada sección tiene un botón «?» para volver a verlo, y Ajustes tiene «Ver los tutoriales otra vez».
- No aparece nunca en medio de una partida, encima de una celebración (constelación, cápsula, Pro) ni durante el flujo de primera vez.

## Secciones y pasos (borrador del contenido)

1. **Inicio**: tu racha y tus Chispas · continuar donde quedaste · retos del día, la semana y el fin de semana · recompensas y constelaciones · tareas de tu curso (si estás en uno).
2. **Mundos / mapa de ciudades**: las 15 ciudades · cuáles son tuyas y cómo abrir otras · la ciudad con doble experiencia (paracaídas) · día y noche de cada ciudad.
3. **Una ciudad**: Practicar (60 s, se adapta a ti) · Aprender (lecciones y clases) · tu nivel en la ciudad · su constelación · elegir un modo.
4. **Antes de la primera partida** (solo una vez): el reloj · la racha que da segundos · las ayudas · fallar no resta.
5. **Competir**: Rankeds y tu ELO · duelos con amigos · la liga de la semana.
6. **Social**: amigos · chat · clanes.
7. **Tienda**: Chispas y Cometas · categorías · probarte algo antes de comprarlo · cápsulas.
8. **Recompensas**: cápsulas para abrir · constelaciones · misiones y calendario.
9. **Perfil**: tu placa (la ven todos) · editarla · logros · estadísticas.
10. **Mi curso**: unirte con el código · tus tareas · Practicar desde la tarea.
11. **Panel docente** (web): licencia del colegio · crear curso y compartir el código · asignar una tarea · la pestaña Estudio del curso y sus recomendaciones.

## Cómo se construye

- **Un solo motor por plataforma**, con la misma definición de pasos compartida en `calibra/src/lib/tutorial/recorridos.ts` (lógica pura: id de sección, ancla, título, texto en es/en, condición). La app la importa con `@/`, igual que el resto de la lógica.
- **Web**: componente `RecorridoGuiado` (cliente). Encuentra el ancla por `data-tour`, mide con `getBoundingClientRect`, sigue los cambios de tamaño y el scroll, y es accesible: foco atrapado en la tarjeta, Esc para saltar, el texto también se lee con lector de pantalla.
- **App**: `RecorridoSeccion` que generaliza el foco de `RecorridoPestanas`: cada ancla se registra con una ref y se mide con `measureInWindow` (como `medirHud`). Respeta `useTaparFondo` y `useAnimacionActiva`.
- **Visto / no visto**: se guarda en la cuenta, para que lo que viste en la web no se repita en la app (ver decisión 1). Sin conexión se recuerda en el teléfono y se sincroniza después.
- **Pruebas**: tests de la definición de pasos (cada paso tiene texto en los dos idiomas, ninguna sección pasa de 5 pasos, todas las anclas existen en el código), y capturas en el navegador de cada sección con el recorrido abierto.

## Fases

1. Motor web + motor app + guardado + **Inicio, Mundos y Ciudad** (lo que ve todo jugador nuevo).
2. Partida, Competir, Social, Tienda, Recompensas y Perfil.
3. Mi curso y Panel docente.

## Decisiones (tuyas)

1. **¿Dónde se recuerda lo que ya viste?** Recomiendo **en la cuenta** (una migración chica: una columna en `profiles`), así quien lo vio en la web no lo vuelve a ver en la app. La otra opción es por teléfono o navegador, sin migración, pero se repite al cambiar de aparato.
2. **¿Reemplaza los globos de una frase que hoy tiene la app?** Recomiendo **sí**: el primer paso de cada recorrido dice lo mismo que el globo, y tener las dos cosas sería repetir.
3. **¿Sale solo la primera vez o solo con el botón «?»?** Recomiendo **solo la primera vez que entras a cada sección, más el botón «?» siempre**. Si molesta, se puede cambiar a que solo salga con el botón.
