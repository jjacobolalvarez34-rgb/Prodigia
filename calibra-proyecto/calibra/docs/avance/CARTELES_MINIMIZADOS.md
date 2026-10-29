# Carteles de evento minimizados en el Inicio (2026-10-28)

Pedido: los carteles de eventos del Inicio ocupaban mucho y alejaban el «jugar a un clic».
Ahora empiezan minimizados en una franja compacta (dibujo del evento, nombre, contador) y al
tocarla se abre el cartel completo, con un botón redondo (chevron) arriba a la derecha para
volver a minimizar. Si se deja abierto, se recuerda por evento.

## Web (calibra)
- [x] `src/components/temas/CartelPlegable.tsx` (nuevo): envoltorio con franja/cartel,
      animación de alto + opacidad (framer-motion), preferencia en localStorage
      `prodigia:cartel-abierto:<id>` (solo se guarda «abierto»; por defecto, minimizado).
- [x] `src/components/temas/IconoEvento.tsx` (nuevo): dibujo chico del evento (pasante,
      partícula o punto del color).
- [x] `CartelTemporada`: id `tema-<id>-<desde>`; franja con el contador (empieza/termina en).
- [x] `CartelAlineacion`: id `alineacion-<n>`; franja con los 15 soles en miniatura (en fila
      cuando están alineados), «Quedan …» / «En …» / «Terminó»; durante, borde y brillo dorado.
      Si el regalo de comunidad está por reclamar: punto dorado sobre el dibujo y etiqueta «Premio».
- [x] `MinieventoInicio`: id `mini-<id>-<desde>`.
- [x] Mensajes: namespace `Carteles` en es/en.
- [x] tsc, eslint, verificar-claves-i18n.

## App (mobile)
- [x] `src/ui/temas/CartelPlegable.tsx` (nuevo): misma franja; preferencia en AsyncStorage
      (misma clave), memoria en módulo para no parpadear; FadeIn + LinearTransition
      (sin animación con «animaciones livianas»); vibración ligera al tocar.
- [x] `src/ui/temas/IconoEvento.tsx` (nuevo).
- [x] CartelTemporada, CartelAlineacion (con punto y «Premio») y la tarjeta de minievento
      de `(tabs)/index.tsx`.
- [x] El enganche a `relojEventos` que puso el agente de eventos en vivo en los dos
      CartelAlineacion se conserva.
- [x] tsc y eslint.

## Detalles
- Contador corto en la franja (`faltaCorto`: dos unidades, «6 d 23 h»); el cartel abierto
  conserva el contador completo.
- Revisión en imagen con `zz-galeria/carteles.html` (vite, puerto 3462) y
  `carteles-captura.mjs` / `carteles-anim.mjs`: abrir tarda ~450 ms (salida 200 + entrada 280).

## No incluido
- EsquinaFecha no es un cartel del Inicio (es el adorno de esquina de tarjetas y mundos).
- La franja del evento de temporada no avisa de fichas por cambiar (habría que cargar las
  fichas en el Inicio; la página del evento ya lo muestra).
