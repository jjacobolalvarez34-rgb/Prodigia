# THUMBNAILS-BANK — Banco de 20 thumbnails de Prodigia

> Banco de producción para video, YouTube y Shorts. Cada thumbnail es una pieza cerrada de alto contraste con **un solo** gancho visual: el número-faro en JetBrains Mono.
> Reglas globales: texto en pantalla de 3 a 5 palabras, cero texto redundante, un mundo protagonista por pieza, número gigante como hero.
> Referencias de captura reales: `assets/pantallas-oscuras/*` y `assets/pantallas-reales/*`. Cualquier pieza puede producirse en el eje oscuro (`#090c14`) o claro (`#fdfbf7`); se indica su base recomendada por eje.

## Tokens que aplican a todo el banco

| Uso | Claro | Oscuro |
|---|---|---|
| Fondo de pieza | `#fdfbf7` | `#090c14` |
| Superficie / tarjeta | `#ffffff` | `#12172a` |
| Texto principal | `#1f2430` | `#f4f6fb` |
| Texto secundario | `#1f2430` al 60% | `#8892b0` |
| Borde | `#e7e0d2` | `#232b47` |
| Primario (badges, glow) | `#6c4cf1` | `#7c5cff` |
| Dorado (logro, precio) | `#ffc53d` | `#ffb627` |
| Racha | `#ff8a3d` | `#ff8a3d` |
| Correcto | `#3fb88b` | `#3ddc97` |

- Títulos y CTAs: **Space Grotesk** bold, tracking-tight. Números: **JetBrains Mono**. Cuerpo: **Inter** (solo si es imprescindible).
- Logo `aro + chispa` siempre abajo en el eje que corresponda a la pieza.
- Zona segura: 8% en cada borde; no poner texto ni badges dentro de ella.

---

### THUMB TH-001 · Sprint de 60 segundos
- Formato: 1280×720 (youtube/16:9)
- Con qué se vende: tema velocidad + Numeria — la mecánica central "10 preguntas en 60 segundos".
- Texto EN pantalla: `10 PREGUNTAS. 60 SEGUNDOS.`
- Número-faro: `60` (JetBrains Mono, gigante a la derecha).
- Composición: a la izquierda, corte del sprint en vivo (número del problema + barra de tiempo con punta de cometa + LevelDial); a la derecha, `60` gigante con glow del mundo; badge CRONO arriba a la izquierda.
- Colores/badge: fondo `#090c14`, número en `#7c5cff` sobre glow violeta, acierto en `#3ddc97`; badge `CRONO` en píldora `#232b47` texto `#f4f6fb`.
- Base de captura: `assets/pantallas-oscuras/23-demo-numeria-sprint.png` (+ eje claro `assets/pantallas-reales/23-demo-numeria-sprint.png`).
- Simplicidad: se recortan solo la barra de tiempo, el LevelDial y el número grande; se ocultan teclado, contador de Chispas del usuario y tarjetas del home.

### THUMB TH-002 · El problema gigante 5+6
- Formato: 1080×1920 (shorts)
- Con qué se vende: tema curiosidad + Numeria — el problema hero "5 + 6" que abre la demo.
- Texto EN pantalla: `¿CUÁNTO ES?`
- Número-faro: `5+6` (JetBrains Mono, ocupa ~80% del alto vertical).
- Composición: vertical; el problema `5 + 6` centrado ocupando casi toda la altura; línea corta abajo "tienes 60 segundos"; logo aro+chispa arriba del pie.
- Colores/badge: eje claro `#1f2430` sobre `#fdfbf7` con `5+6` en `#6c4cf1`; eje oscuro `#f4f6fb` sobre `#090c14` con `5+6` en `#7c5cff`. Sin badge.
- Base de captura: eje claro `assets/pantallas-reales/08-diagnostico-numeria-sin-presion.png`; eje oscuro `assets/pantallas-oscuras/23-demo-numeria-sprint.png`.
- Simplicidad: queda solo el problema gigante; se elimina 100% de los controles y textos de la pantalla real.

### THUMB TH-003 · 8 mundos, 8 colores
- Formato: 1280×720 (youtube/16:9)
- Con qué se vende: tema mundo — la identidad completa "más que sumas".
- Texto EN pantalla: `8 MUNDOS. 1 CABEZA.`
- Número-faro: `8` (con pincelada de estela de cursor tintada por mundos).
- Composición: a la izquierda, grid de tarjetas de los 8 mundos (recorte del home); a la derecha, `8` gigante; arriba, sello de la colección de mundos.
- Colores/badge: degradé de los 8 colores de mundo `#6C4CF1 #0E9F6E #1E7A8C #C026D3 #8B2942 #B8860B #84CC16 #A0522D`; sello de mundos centrado arriba en `#ffc53d`.
- Base de captura: `assets/pantallas-oscuras/10-home-principal.png` (+ `assets/pantallas-reales/10-home-principal.png`).
- Simplicidad: se recorta solo el grid de tarjetas; se quitan barra de navegación, contador de Chispas y áreas de reto.

### THUMB TH-004 · 2 ciudades gratis
- Formato: 1280×720 (youtube/16:9)
- Con qué se vende: tema onboarding — "2 ciudades gratis. Para siempre".
- Texto EN pantalla: `2 GRATIS. PARA SIEMPRE.`
- Número-faro: `2` (gigante, con marca de correcto en verde).
- Composición: a la izquierda, el grid "elige 2 mundos" con dos checks verdes y candados en el resto; a la derecha, `2`; badge GRATIS arriba a la derecha.
- Colores/badge: correcto `#3fb88b` (claro) / `#3ddc97` (oscuro) en los checks; badge `GRATIS` píldora dorada `#ffc53d` con texto `#1f2430`.
- Base de captura: `assets/pantallas-reales/06-onboarding-elegir-2-mundos.png` + `assets/pantallas-reales/17-mundo-bloqueado-3000-chispas.png` (para los candados del resto). Eje oscuro `assets/pantallas-oscuras/06-onboarding-elegir-2-mundos.png`.
- Simplicidad: se recorta el grid y los checks; se quitan botón "continuar", título largo y explicaciones.

### THUMB TH-005 · Racha = segundos
- Formato: 1280×720 (youtube/16:9)
- Con qué se vende: tema racha — "la racha te da segundos" (mecánica en la partida de 60 s).
- Texto EN pantalla: `TU RACHA TE DA SEGUNDOS.`
- Número-faro: `+3` (JetBrains Mono, derecha, junto a llama de racha).
- Composición: a la izquierda, corte de la barra de tiempo del sprint con el plus de segundos marcado; a la derecha, `+3` gigante con ícono de racha.
- Colores/badge: racha `#ff8a3d` en el `+3` y la llama; fondo `#090c14`, superficie `#12172a`; badge `RACHA` en `#ff8a3d` al 90%.
- Base de captura: `assets/pantallas-oscuras/23-demo-numeria-sprint.png` (barra de tiempo y cronómetro).
- Simplicidad: se recorta la barra de tiempo y el cronómetro únicamente; nada de teclado ni número de pregunta.

### THUMB TH-006 · Reto diario, mismo examen
- Formato: 1280×720 (youtube/16:9)
- Con qué se vende: tema reto — reto diario de 5 preguntas iguales para todos + ranking público.
- Texto EN pantalla: `MISMO EXAMEN. MISMO DÍA.`
- Número-faro: `5` (gigante, derecha).
- Composición: a la izquierda, lista de las 5 preguntas del reto con su ranking; a la derecha, `5` en dorado; badge RETO DIARIO arriba.
- Colores/badge: badge `RETO DIARIO` primario `#6c4cf1`/`#7c5cff`; número `#ffc53d`/`#ffb627` sobre superficie de tarjeta.
- Base de captura: `assets/pantallas-reales/12-reto-diario.png` (+ `assets/pantallas-oscuras/12-reto-diario.png`).
- Simplicidad: se recorta la lista de 5 preguntas y el copete del ranking; se quitan avatar/nombre del usuario y barra inferior.

### THUMB TH-007 · Reto semanal, 45 preguntas
- Formato: 1280×720 (youtube/16:9)
- Con qué se vende: tema reto — reto semanal de 45 preguntas con ranking que se reinicia solo.
- Texto EN pantalla: `45 PREGUNTAS. 1 RANKING.`
- Número-faro: `45` (gigante, derecha).
- Composición: a la izquierda, tarjeta del reto semanal con su progreso; a la derecha, `45`; badge RETO SEMANAL arriba.
- Colores/badge: badge `RETO SEMANAL` en azul teal `#1E7A8C`; número en `#ffc53d`; borde de tarjeta `#232b47`.
- Base de captura: `assets/pantallas-oscuras/32-reto-semanal.png` (+ `assets/pantallas-reales/32-reto-semanal.png`).
- Simplicidad: se recorta solo la tarjeta del reto semanal con su barra de progreso; no entra el tablero ni el feed completo.

### THUMB TH-008 · Ranking justo
- Formato: 1280×720 (youtube/16:9)
- Con qué se vende: tema ranking — podio visible y "el ranking es justo: ni bots que suman".
- Texto EN pantalla: `NI BOTS QUE SUMAN.`
- Número-faro: `1` (gigante, derecha, con corona de medalla).
- Composición: a la izquierda, podio 2-1-3 con medallas y destello; a la derecha, `1`; badge RANKING PÚBLICO arriba.
- Colores/badge: podio con dorado `#ffc53d`, bronce `#B08D57`, plata `#B8C4D9`; badge `RANKING PÚBLICO` en `#5FA8A0`-teal; `1` en `#ffc53d`.
- Base de captura: `assets/pantallas-reales/11-ranking-semanal.png` (+ `assets/pantallas-oscuras/11-ranking-semanal.png`).
- Simplicidad: se recorta el podio con el 1º, 2º y 3º; se ocultan las filas 4 a 100 del tablero.

### THUMB TH-009 · De Bronce a Prodigio
- Formato: 1080×1920 (shorts)
- Con qué se vende: tema ranked — la escalera de 6 rangos ELO (Bronce → Prodigio).
- Texto EN pantalla: `BRONCE A PRODIGIO.`
- Número-faro: `ELO` (JetBrains Mono, abajo en vertical).
- Composición: vertical; escalera de 6 chips de rango con degradé ascendente; `ELO` gigante abajo; badge RANKED arriba.
- Colores/badge: `#B08D57 → #B8C4D9 → #E8B34D → #5FBFA8 → #5DC8F5 → #FFC53D`; badge `RANKED` en violeta `#6c4cf1`.
- Base de captura: `assets/pantallas-reales/11-ranking-semanal.png` (para los medallones) + `assets/pantallas-reales/18-rankeds-bloqueado-nivel5.png` (escala de progreso).
- Simplicidad: se construye a partir de chips de rango; se descarta toda la UI de la app salvo medallones e íconos.
- Nota: sin "temporada"/"peak": la pieza vende progreso permanente de rango.

### THUMB TH-010 · Duelo 1v1, fantasma del rival
- Formato: 1280×720 (youtube/16:9)
- Con qué se vende: tema duelo — duelo asíncrono 1v1 con el fantasma del rival.
- Texto EN pantalla: `TE LANZÓ UN DUELO.`
- Número-faro: `1v1` (JetBrains Mono, derecha).
- Composición: a la izquierda, silueta del fantasma del rival (semi transparente) persiguiendo tu progreso sobre el sprint; a la derecha, `1v1`; chip 1v1 arriba.
- Colores/badge: chip `1v1` en `#C026D3`; fantasma `#8892b0` a 40%; destellos `#7c5cff`; texto `#f4f6fb`.
- Base de captura: `assets/pantallas-oscuras/23-demo-numeria-sprint.png` (progreso visual) con asset de superposición del fantasma; el componente `PantallaVS` es base BLOQUEADA en captura real.
- Simplicidad: se corta el sprint a un carril de progreso y se superpone la silueta; se eliminan teclado y textos.

### THUMB TH-011 · La ruleta de la trastienda
- Formato: 1280×720 (youtube/16:9)
- Con qué se vende: tema trastienda — ruleta con 20 giros al día.
- Texto EN pantalla: `20 GIROS AL DÍA.`
- Número-faro: `20` (gigante, derecha, dorado).
- Composición: a la izquierda, la ruleta con su brillo y el marcador de giros; a la derecha, `20`; badge TRAS arriba.
- Colores/badge: dorado `#ffc53d`/`#ffb627` en la ruleta y el `20`; fondo `#090c14`, superficie `#12172a`; badge `TRAS` en neón violeta.
- Base de captura: `assets/pantallas-oscuras/31-trastienda-ruleta.png`.
- Simplicidad: se recorta solo la rueda + el botón de girar y el contador; se quitan apuestas y textos de la trastienda.

### THUMB TH-012 · Escudo a 350 Chispas
- Formato: 1280×720 (youtube/16:9)
- Con qué se vende: tema tienda — el escudo protector a 350 Chispas.
- Texto EN pantalla: `350. TE SALVA.`
- Número-faro: `350` (JetBrains Mono, derecha, dorado).
- Composición: a la izquierda, la tarjeta del escudo con su etiqueta de precio; a la derecha, `350`; badge TIENDA arriba.
- Colores/badge: dorado `#ffc53d`/`#ffb627`; badge `TIENDA` en `#6c4cf1`/`#7c5cff`; fondo bazar con brillos.
- Base de captura: `assets/pantallas-reales/13-tienda-bazar.png` (+ `assets/pantallas-oscuras/13-tienda-bazar.png`).
- Simplicidad: se recorta únicamente la tarjeta del escudo + precio; se quitan las otras 9 tarjetas del bazar.

### THUMB TH-013 · Mundo bloqueado a 3000 Chispas
- Formato: 1280×720 (youtube/16:9)
- Con qué se vende: tema desbloqueo — "te faltan Chispas" para abrir un mundo.
- Texto EN pantalla: `3000 CHISPAS. TU MAPA.`
- Número-faro: `3000` (gigante, derecha, dorado).
- Composición: a la izquierda, tarjeta de mundo con candado y el remanente de Chispas; a la derecha, `3000`; badge PROGRESO arriba.
- Colores/badge: candado `#8892b0` sobre superficie `#12172a`/`#ffffff`; `3000` en `#ffc53d`/`#ffb627` (la meta).
- Base de captura: `assets/pantallas-reales/17-mundo-bloqueado-3000-chispas.png`.
- Simplicidad: se recorta la tarjeta del mundo con candado; se quita la barra inferior y las demás tarjetas.

### THUMB TH-014 · Enigmia: qué sigue
- Formato: 1080×1920 (shorts)
- Con qué se vende: tema mundo Enigmia — lógica y patrones.
- Texto EN pantalla: `¿QUÉ SIGUE?`
- Número-faro: `7 → ?` (JetBrains Mono, vertical).
- Composición: tarjeta de patrón lógico centrada; flecha de continuación y `?` gigante abajo; sello ENIGMIA arriba.
- Colores/badge: Enigmia `#0E9F6E`; fondo `#090c14`; sello `ENIGMIA` en verde esmeralda.
- Base de captura: `assets/pantallas-oscuras/25-demo-enigmia-logica.png`.
- Simplicidad: se recorta la tarjeta de patrón y su secuencia; se eliminan controles y reloj.

### THUMB TH-015 · Geografía: el mapa
- Formato: 1280×720 (youtube/16:9)
- Con qué se vende: tema mundo Geografía — marcar el punto en el mapa.
- Texto EN pantalla: `¿DÓNDE ESTÁ?`
- Número-faro: `3` (segundos para marcar el punto, derecha).
- Composición: a la izquierda, el mapa topojson del demo con la región a localizar; a la derecha, `3`; sello GEOGRAFÍA arriba.
- Colores/badge: Geografía `#1E7A8C`; mapa con superficie clara `#fdfbf7` sobre fondo oscuro `#12172a`.
- Base de captura: `assets/pantallas-reales/29-demo-geografia-mapa.png` (+ `assets/pantallas-oscuras/29-demo-geografia-mapa.png`).
- Simplicidad: se recorta solo la masa de mapa con el punto objetivo; se quitan opciones A/B/C y el reloj.

### THUMB TH-016 · Quimia: el elemento
- Formato: 1280×720 (youtube/16:9)
- Con qué se vende: tema mundo Quimia — tabla y símbolos de elementos.
- Texto EN pantalla: `¿CUÁL ES EL SÍMBOLO?`
- Número-faro: `He` (Helio, número atómico 2; JetBrains Mono).
- Composición: a la izquierda, la tarjeta del elemento con opciones; a la derecha, `He` gigante; sello QUIMIA arriba.
- Colores/badge: Quimia `#C026D3`; superficie `#12172a`; `He` en magenta `#C026D3` con glow.
- Base de captura: `assets/pantallas-reales/26-demo-quimia-elementos.png` (+ `assets/pantallas-oscuras/26-demo-quimia-elementos.png`).
- Simplicidad: se recorta la pregunta de elementos y la opción marcada; se quitan opciones restantes y UI auxiliar.

### THUMB TH-017 · Anatomía: el hueso
- Formato: 1280×720 (youtube/16:9)
- Con qué se vende: tema mundo Anatomía — identificación de huesos.
- Texto EN pantalla: `¿QUÉ HUESO ES?`
- Número-faro: `206` (huesos del cuerpo humano; JetBrains Mono).
- Composición: a la izquierda, el esqueleto interactivo con el hueso marcado; a la derecha, `206` en bordeaux; sello ANATOMÍA arriba.
- Colores/badge: Anatomía `#8B2942`; `206` en `#8B2942` con superficie clara; sello `ANATOMÍA` en bordeaux.
- Base de captura: `assets/pantallas-reales/28-demo-anatomia-huesos.png` (+ `assets/pantallas-oscuras/28-demo-anatomia-huesos.png`).
- Simplicidad: se recorta el SVG del esqueleto y el hueso a identificar; se quitan opciones y textos.

### THUMB TH-018 · Melodía: la figura
- Formato: 1280×720 (youtube/16:9)
- Con qué se vende: tema mundo Melodía — figuras musicales y lectura rítmica.
- Texto EN pantalla: `¿CUÁNTO VALE?`
- Número-faro: `4/4` (compás; JetBrains Mono).
- Composición: a la izquierda, las figuras musicales del demo; a la derecha, `4/4`; sello MELODÍA arriba; pentagrama sutil de fondo.
- Colores/badge: Melodía `#B8860B`; fondo crema `#fdfbf7` con superficie blanca; `4/4` en `#B8860B`.
- Base de captura: `assets/pantallas-reales/24-demo-melodia-figuras.png` (+ `assets/pantallas-oscuras/24-demo-melodia-figuras.png`).
- Simplicidad: se recorta el grupo de figuras y su valor; se eliminan barra inferior y controles.

### THUMB TH-019 · Trigonometría: el ángulo
- Formato: 1080×1920 (shorts)
- Con qué se vende: tema mundo Trigonometría — cálculo de ángulos con triángulos.
- Texto EN pantalla: `ENCUENTRA EL ÁNGULO.`
- Número-faro: `90°` (JetBrains Mono).
- Composición: vertical; triángulo interactivo centrado con el ángulo a resolver; `90°` abajo; sello TRIGONOMETRÍA arriba.
- Colores/badge: Trigonometría `#84CC16`; fondo `#090c14`; `90°` en lima `#84CC16` con glow.
- Base de captura: `assets/pantallas-reales/30-demo-trigonometria-triangulo.png` (+ `assets/pantallas-oscuras/30-demo-trigonometria-triangulo.png`).
- Simplicidad: se recorta solo el triángulo con su ángulo; se quitan opciones y reloj.

### THUMB TH-020 · Historia: ordena los hechos
- Formato: 1080×1920 (shorts)
- Con qué se vende: tema mundo Historia — cronología y orden de acontecimientos.
- Texto EN pantalla: `¿CUÁL PRIMERO?`
- Número-faro: `1492` (año histórico a ordenar; JetBrains Mono).
- Composición: vertical; línea de tiempo con los hitos desordenados; `1492` gigante como pieza central; sello HISTORIA arriba.
- Colores/badge: Historia `#A0522D`; fondo con tinte pergamino; `1492` en `#A0522D` sobre `#fdfbf7`/`#12172a`.
- Base de captura: `assets/pantallas-reales/27-demo-historia-cronologia.png` (+ `assets/pantallas-oscuras/27-demo-historia-cronologia.png`).
- Simplicidad: se recorta la línea de tiempo y los hitos; se eliminan etiquetas y UI auxiliar.

---

## Notas de uso

- **Un gancho por pieza**: el número-faro siempre es el elemento dominante; el texto no repite lo que ya dice el número.
- **Eje por pieza**: piezas de "noche" (TH-001, TH-005, TH-009, TH-010, TH-011, TH-014, TH-019) rinden mejor en oscuro; piezas de "día" (TH-004, TH-018, TH-020) en claro. El resto tiene versión de ambos ejes.
- **Badges**: máx. 1 badge por thumbnail, en píldora `rounded-full`, Space Grotesk, 3 palabras máximo (`CRONO`, `RANKED`, `RETO DIARIO`, `RETO SEMANAL`, `TRAS`, `TIENDA`, `PROGRESO`, `GRATIS`).
- **Fuente de datos**: números de precio y mecánico provienen de la app real (`precios.ts`, `SprintRunner`); los datos de trivia (`206` huesos, `He`, `1492`, `4/4`, `90°`) son de referencia universal y se usan como gancho visual del mundo.