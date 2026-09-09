# PROMPTS-VIDEO — Prompts de generación de video publicitario

> Para usar con generadores de video (Veo/Kling/Runway/Sora). Toda pieza debe respetar la identidad Prodigia: degradé 120° violeta→dorado, fondo crema `#fdfbf7`, Space Grotesk, JetBrains Mono para números, chispa de 4 puntas, glifos flotantes.
> Regla: el video NUNCA menciona features falsas. Ver PRODUCT-MESSAGING.md.

## Formato fórmula base (copy-paste para todos)

```
TÍTULO: Uso de tipografía display sans-serif geométrica (Space Grotesk), bold.
PALETA: violeta #6C4CF1 → dorado #FFC53D (degradé 120°), fondo crema #fdfbf7 o nocturno #090c14.
NÚMEROS: tipografía mono (JetBrains Mono), los números/XP/Chispas siempre en mono.
LOGO: aro violeta + chispa asimétrica de 4 puntas (degradé #A794FF→#E4CBA0→#FFC53D).
MOVIMIENTO: estelas suaves, brillos/destellos tipo specular, glifos matemáticos flotando en el fondo.
FORMATO: 9:16 vertical (TikTok/Reels/Shorts), 6-9s loop.
```

## Video 1 · "El fantasma" (VS + progreso rival)

```
[Texto inicial, mono, 3 palabras] "TU RIVAL / YA TERMINÓ"
[Escena] Sprint de cálculo mental: un número gigante 5xl en mono violeta con signo grande en degradé.
La barra de progreso rival (puntitos) AVANZA SOLA, punto a punto, sin contraparte.
Nadie responde, el progreso sigue. Overlay discreto: "👻 Fantasma".
[Texto final] "IGUAL LO VES JUGAR" — CTA "Entrá a Prodigia".
Paleta del mundo Numeria #6C4CF1; fondo crema; continuidad de los dots sin cortes; sin texto que tape el número.
```

## Video 2 · "Pentagrama" (Melodía)

```
[Texto inicial, display] "UNA APP DE MATEMÁTICA... / CON UN PENTAGRAMA"
[Escena] DSLR-like: plano cerrado de un pentagrama SVG dorado, clave de sol dibujada a mano,
cabezas de nota elipses doradas sobre fondo crema. Una nota se "ilumina" (efecto brillo dorado).
Alteraciones # y b aparecen.
[Texto final] "OÍDO ABSOLUTO. ESCALAS. ACORDES." — "Mundo Melodía".
Paleta Melodía #B8860B (dorado viejo) + dorado #FFC53D; sin fotografía stock, solo la UI del componente Pentagrama.
```

## Video 3 · "Reto del día" (ranking subiendo)

```
[Texto inicial, mono] "HOY LAS MISMAS 5 PREGUNTAS / PARA TODOS"
[Escena] Interfaz de reto diario: 5 preguntas pasando rápido, luego aparece el tablero de ranking (top 100, estilo Podio) 
y el nombre del usuario SUBE posiciones con destello dorado.
[Texto final] "EL RANKING DEL DÍA / ¿En qué puesto estás?"
Paleta violeta + dorado; el número/puesto del usuario en JetBrains Mono; subida con animación de brillo tipo GlareHover.
```

## Video 4 · "El mundo que te responde" (Geografía/Mapa)

```
[Texto inicial, display] "¿DÓNDE ESTÁ?"
[Escena] Mapa real topojson del mundo en azul océano #1E7A8C sobre fondo crema. 
Se ilumina un país. El usuario hace clic y el país se pinta verde (#3fb88b) con un "✓" en mono.
[Texto final] "8 MUNDOS. 1 CABEZA." — "Mapa real. Geografía."
Cámara hace zoom suave sobre el país correcto; los países correctos verdes, error coral #ff6b6b.
```

## Video 5 · "Adaptativa" (LevelDial subiendo)

```
[Texto inicial, mono] "FALLASTE? / TE LA REFLOTA"
[Escena] SprintRunner: la operación cambia, el LevelDial de dificultad SUBE (3 aciertos seguidos), 
un "¡NIVEL +1!" con destello dorado. Un error: sin color rojo dramático, solo "No pasa nada, así se aprende".
[Texto final] "TRES SEGUIDAS Y SUBÍS" — "Adaptativa pregunta a pregunta".
El dial usa el degradé violeta→dorado; el número de nivel en JetBrains Mono grande; confeti leve.
```

## Video 6 (variante 3 trailers de próxima campaña)

### Trailer A · "Así se aprende" (15s — narrative)
```
Estilo promo de videojuego: arrancamos en Numeria (violeta), transición con glifos flotantes + − × ÷,
corte a Melodía (pentagrama), corte a Anatomía (esqueleto), corte a Geografía (mapa), corte a pantalla VS de duelo.
Botón final: "Entrá gratis. Prodigia — Entrená tu cabeza jugando."
Regla: los 8 mundos en secuencia jamás; elegir 4 que contrasten (violeta, dorado, bordó, azul océano).
```

### Trailer B · "El mismo examen para todos" (15s)
```
Alterna: reto diario (5 preguntas) → ranking del día → reto semanal (45) → logro de constancia "4 semanas seguidas".
Cierre con medal 1-2-3 del Podio y chispa.
```

### Trailer C · "Peleás con gente real" (15s)
```
VT: duelo en vivo con progreso de dots → pantalla VS partida por rango → fantasma del rival terminado → Clan War + chat.
Cierre: "¿A quién vas a retar hoy?" CTA entrar.
```

## ANCLA REAL (2026-09-08) — beats que EXISTEN capturados en navegador

> Referencia visual real en `assets/pantallas-reales/`. "Pasable tal cual en el edit sin generar nada": usar el gameplay de las demos (23-30) como footage real de producto.

### Reel "El músculo" (equivalentes del Concepto A de REAL-APP)
```
[Beat 1 · 0-1s] Footage REAL 23-demo-numeria-sprint.png entrando en acción (contador corriendo), mono "5 + 6", "0 EXP".
[Beat 2 · 1-6s] Cortes reales de las 8 demos en loop rápido (24-30): figura musical → algoritmo x=3 → elemento K →
hueso/costillas → "¿Dónde está Venezuela?" → tan(A) en triángulo → Julio César → acertijo.
[Beat 3 · 6-9s] Frame de 04-landing-mecanismo-60s.png: "10 preguntas / 60 segundos / racha + tiempo / rapidez + XP".
[Texto final] "ENTRENÁ TU CABEZA COMO SI FUERA UN MÚSCULO" + CTA "Probalo sin cuenta".
Estado: TODOS los beats capturados (sin generación de AI necesaria para el footage).
```

### Prompts AI para piezas que NO tienen captura (duelo/fantasma) — sin simular lo falso
```
[Video fantasma] idem Video 1. NO GRABAR con cuentas truchas: la mecánica está reportada en código (0028) pero
BLOQUEADA para captura real; usar SOLO si antes se valida el flujo con 2 cuentas reales.
```

### Prompt AI "Sprint al límite" (loop 6s, derivado puro de captura real)
```
9:16 vertical. Pantalla de juego NUMERIA capturada (23): mientras el borde corre una línea de luz violeta→dorado,
el número "5 + 6" entra en foco con leve parallax; timer mono 30s→20s; fondo crema, glifos + − × ÷ flotando suaves.
Termina en logo (aro+chispa) + headline Space Grotesk "10 EN 60". Sin personas. Sin UI falsa: basarse solo en la pantalla real.
```