# Animaciones de apertura de los eventos

Pedido del usuario (2026-10-18): cada evento abre con una **animación cinematográfica de
alta gama**: un **video ya renderizado** (no dibujado en el momento), profesional, que dé
emoción. El texto no puede verse «de IA»: nada de degradés violeta-azul en las letras ni de
neón genérico. Debe tener buena tipografía y color sobrio (marfil, dorado o el color de la fecha).

Estado: **la de la Gran Alineación se hace primero y el usuario la aprueba**. El resto queda
anotado y planeado aquí; no se hace hasta que el usuario lo pida.

## Cómo se muestra (igual para todos los eventos)

- **Si el evento empieza mientras la app está abierta:** el video entra con un fundido a
  pantalla completa sobre lo que estés viendo, salvo dentro de una partida, donde espera a
  que termine.
- **Si abres la app durante el evento y todavía no lo viste:** en lugar del menú se abre el
  video. Al terminar, hace fundido desde el último cuadro a la interfaz.
- **Una sola vez por evento y por dispositivo:** se guarda «visto». Se puede volver a ver
  desde el cartel del evento.
- **Se puede saltar con un toque** (a partir de 1 s, para que no se salte sin querer).
- **Sonido:** respeta el ajuste de sonido. Sin sonido, el video funciona igual.
- **Archivos:**
  - app: vertical 1080×1920 en `mobile/assets/videos/<evento>.mp4`;
  - web: horizontal 1920×1080 en `calibra/public/videos/<evento>.mp4`;
  - un póster `.jpg` del último cuadro junto a cada video.
- **Cómo se hacen:** con HyperFrames (skills `hyperframes:*`). El proyecto de cada video
  queda en `D:\Repositorios\prodigia-marketing\videos\<evento>\`.
- **Peso:** objetivo ≤ 4 MB por video en la app (van dentro del APK). Si se suman muchos,
  pasarlos a descarga bajo demanda.

## Gran Alineación (se hace ahora)

Cada 28 días, sábado 24/10/2026 18:00 (Colombia) la primera, durante 3 h.

1. Espacio profundo con polvo de estrellas en parallax.
2. Aparecen 15 soles, del color de cada ciudad, a distintas alturas de sus arcos.
3. Se deslizan y se alinean en una línea. Al encajar el último, un pulso de luz la recorre.
4. Amanecer dorado que barre la pantalla, con las siluetas de los skylines.
5. «LA GRAN ALINEACIÓN» / «Las 15 ciudades amanecen juntas» /
   «Exp ×2 · Chispas ×2 · Constelaciones ×2 · 3 horas».
6. El logo pequeño y un cuadro final quieto, desde donde la app hace el fundido.

## Planeadas (no hacer hasta que el usuario lo pida)

| Evento | Idea del video (8–10 s) |
| --- | --- |
| Halloween · Noche de los esqueletos | Luna llena tras nubes; murciélagos cruzan; las calabazas de los techos se encienden una a una en cadena; la bruja pasa frente a la luna; título con tipografía de cartel antiguo en naranja cálido; las Fichas (Caramelos) caen al final. |
| Día de Muertos · La ofrenda | Velas que se encienden en fila; pétalos de cempasúchil que caen formando un camino; papel picado que se despliega; título en blanco hueso con acento naranja. |
| Diwali · Fiesta de las luces | Ciudad a oscuras; se encienden diyas en los balcones de abajo hacia arriba; fuegos artificiales dorados; título en dorado sobre fondo índigo. |
| Viernes Estelar | Lluvia de estrellas fugaces que se convierten en etiquetas de oferta; destello cian y dorado; título con contador. |
| Navidad en las ciudades | Nevada lenta; las luces de los techos se encienden en cadena por toda la ciudad; el trineo cruza la luna dejando una estela; título en blanco con rojo profundo. |
| Año Nuevo · Cuenta regresiva | Cuenta 3‑2‑1 sobre el skyline; fuegos artificiales sincronizados; confeti; año nuevo en grande. |
| Año Nuevo Lunar | Faroles rojos que suben; el dragón serpentea entre los edificios; título en dorado sobre rojo. |
| Amor y Amistad | Globos de corazón que suben; dos constelaciones que se unen en un corazón; título en rosa sobrio. |
| Carnaval | Serpentinas y confeti en ráfagas de color; máscaras que giran; ritmo rápido. |
| Día de Pi | Los dígitos de π dibujan un círculo perfecto que se cierra; título en tiza. |
| Holi | Nubes de polvo de colores que estallan en cámara lenta y tiñen la ciudad. |
| Pascua | Huevos que ruedan y se abren dejando salir luz; conejo que cruza; colores pastel. |
| Noches de linternas | Linternas que suben lentas sobre un cielo índigo; luna creciente. |
| Día de la Tierra | La ciudad se cubre de verde: enredaderas y árboles que crecen sobre los techos. |
| Día de la Música | Las ventanas de la ciudad se encienden al ritmo de una melodía (ecualizador). |
| Vuelta a clases | Útiles que vuelan y se ordenan formando el logo; pizarra con el título en tiza. |
