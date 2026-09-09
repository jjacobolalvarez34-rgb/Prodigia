# PRODUCT-MESSAGING — Diferenciales reales y posicionamiento

> Regla: TODO diferencial acá está verificado en código. Cada afirmación cita su evidencia.
> Estado: VERIFICADO EN CÓDIGO (2026-09-07, subagent audit). Nada de esto es hipótesis salvo lo marcado.

## Posicionamiento

**Prodigia — Entrená tu cabeza jugando.** (frase marca, `messages/es.json`)
Hero: **"Entrená tu cabeza como si fuera un músculo."** (`es.json`)

Es una app de práctica de cálculo mental y materias escolares con dificultad ADAPTATIVA (no un trivio estático ni un curso de videos).

## Diferenciales verificados

### 1. Dificultad adaptativa por micro-tema, decidida en el servidor
- `calcularNuevoNivel` → +1 nivel tras 3 aciertos seguidos, −1 ante un error, rango 1–10, con "escudo" que evita bajar pero resetea racha (`src/lib/practica/skillLevels.ts:9-32`).
- Se calibra por sub-tema (~40 tipos: `quimia_organica`, `trigonometria_circulo`, `algebra_dos-pasos`...), no global (`src/app/api/attempts/route.ts:87-138`).
- El cliente NUNCA decide el nivel final; se recalcula en `POST /api/attempts` (`attempts/route.ts:130-138`).
- El error no resta XP: solo no suma (`src/lib/practica/formulas.ts:1-34`). Mensaje amable: "No pasa nada, así se aprende".
- **RECLAMO**: "La app se adapta a tu nivel pregunta a pregunta. Fallaste una? Te lo vuelve a plantear más fácil. Tres seguidas? Subís de nivel."

### 2. 8 mundos con contenido escolar real, disfrazado de juego
- Numeria (aritmética→álgebra→geometría), Geografía (países en mapa real), Enigmia (memoria, patrones, pensamiento computacional, deducción), Quimia (símbolos, fórmulas, tabla, nomenclatura, orgánica), Anatomía (huesos, músculos, órganos, nervios), Melodía (pentagrama, oído absoluto), Trigonometría (SOHCAHTOA, círculo unitario, identidades, leyes), Historia (cronología, personajes, causa-efecto, fechas).
- Fuente: `src/lib/mundos/precios.ts`, `src/lib/mundos.ts`, más las migraciones de cada mundo (0056, 0081, 0089, 0108, 0109).
- **RECLAMO**: "No es otra app de sumas. Hay pentagramas, una tabla periódica, el esqueleto humano y un mapa del mundo real."

### 3. Contenido procedural infinito (no se termina)
- Aritmética y geometría generadas al vuelo con 5 bandas de dificultad y deduplicación en partida (`src/lib/practica/problems.ts`, `SprintRunner.tsx:162,187`).
- Melodía 100% por fórmula musical (A4=440Hz): cualquier fundamental × cualquier escala (`src/lib/practica/melodia.ts:1-6,61-63`).
- Enigmia y Trigonometría con generadores sembrados (`src/lib/enigmia/generadores.ts`, `src/lib/practica/trigonometria.ts`).
- MATIZ (HIPÓTESIS para el claim total): Historia y Química orgánica son bancos curados (finitos). Decir "ejercicios infinitos" es válido para Numeria/Melodía/Enigmia/Trigonometría; no para Historia.
- **RECLAMO**: "Los ejercicios se generan al vuelo. Nunca se acaban, nunca se repiten de a pares."

### 4. Reto diario y semanal: la misma lista para todos + ranking público
- Reto diario 5 preguntas, reto semanal 45, con ranking público top 100 del día/semana (`0113_reto_diario_y_semanal.sql`, `RetoClient.tsx`).
- Mismas preguntas para todos el mismo día, por semilla de fecha (`src/lib/retoDiario.ts:204-208`; test `retoDiario.test.ts:17-21`).
- MATIZ honesto: es ranking de "quién completó la lista", no es simultáneo en vivo ni hay chat. No prometer "en vivo".
- **RECLAMO**: "Todos los días la misma lista para todo el mundo. Y un ranking real del día. ¿Averiguaste en qué puesto estás?"

### 5. Anticheat y ranking justo
- Respuestas en <12% del tiempo esperado se marcan sospechosas y no calibran ni dan XP (`attempts/route.ts:14-17`).
- Invitados fuera de todos los rankings (`0042`), anti-smurf desde Platino: se juega "todas las ciudades" (`0078_platino_solo_todas_las_ciudades.sql`).
- **RECLAMO**: "El ranking es justo: ni bots que suman, ni trampas que cuentan."

### 6. Duelos en tiempo real y fantasmas (lo más único)
- Realtime real vía Supabase broadcast, progreso del rival en vivo con dots (`src/lib/duelos/useProgresoEnVivo.ts`, `0038`, `src/components/duelos/ProgresoRivalEnVivo.tsx`).
- **Fantasma del rival**: si tu rival ya terminó, sus respuestas se reproducen a su ritmo exacto — ves al rival "jugar" (0028).
- MATIZ: en algunos mundos los problemas del duelo son "mismos por semilla" (Numeria/Quimia), en otros al azar a la misma dificultad (0090). Publicitar "duelo en vivo" es correcto; "mismas preguntas calcadas en todos los mundos" NO.
- **RECLAMO**: "Tu rival ya termino? Igual lo ves jugar. El fantasma de su partida sigue ahí enfrente tuyo."

### 7. Progresión visible y honesta
- Nivel de mundo = 50% dominio real de subtemas + 30% volumen + 20% lecciones, techo 100 (`0080_nivel_mundo_dominio_real.sql`).
- 6 rangos (Bronce→Prodigio) con ELO estándar, K-factor por rango, ELO simétrico en series (`0072`, `0073`, `0045`).
- Logros de constancia (racha 7/30/100), retos, dominio y por mundo (`0010`, `0113`).
- **RECLAMO**: "Tu número sube porque de verdad mejoraste: 50% del nivel de mundo es tu dominio real de cada tema."

## Qué NO prometer (verificado como falso o inexistente)

| Claim tentador | Realidad |
|---|---|
| "Comprá Pro" | Pro está "próximamente", sin flujo de pago (`src/app/[locale]/pro/page.tsx:12-16`) |
| "Diagnóstico inicial mide tu nivel" | El onboarding actual NO mide nivel: es nombre + 2 mundos gratis (`onboarding/page.tsx:30-33`); el diagnóstico por mundo SÍ existe (7 pantallas) |
| "Casual no usa tu ranking" | Casual no toca tu ELO (0050) pero SÍ usa ELO internamente como nivel oculto de matchmaking/dificultad (0078/0090). Decir "casual sin puntos en juego" es cierto; "casual ignora tu ranking" sería engañoso |
| "Lecciones = cursos" | Son técnicas/procedimientos breves con camino de nodos, no cursos ni videos (`src/lib/aprender/path.ts`) |
| "Contenido infinito en todo" | Historia/Química orgánica son bancos curados (finitos) |

## Actualización 2026-09-08 — revalidado EN NAVEGADOR (Playwright, sesión anónima real)

El claim de arriba era VERIFICADO EN CÓDIGO. Con browser real se confirmó en pantalla lo más vendible:

| Diferencial | Estado navegador | Captura (assets/pantallas-reales/) |
|---|---|---|
| "Entrená tu cabeza como si fuera un músculo" + partidas de 10 en 60s | VERIFICADO EN NAVEGADOR | `02-landing-asi-es-prodigia.png`, `04-landing-mecanismo-60s.png` |
| 8 mundos con demo jugable SIN cuenta | VERIFICADO EN NAVEGADOR (8 demos con pregunta real c/u) | `03-landing-hero-8-ciudades.png`, `23`-`30` demos |
| 2 mundos gratis para siempre / resto con Chispas | VERIFICADO EN NAVEGADOR (onboarding completo anónimo) | `06-onboarding-elegir-2-mundos.png`, `17-mundo-bloqueado-3000-chispas.png` |
| Reto diario 5 / semanal 45, mismas para todos | VERIFICADO EN NAVEGADOR | `12-reto-diario.png`, `10-home-principal.png` |
| Chispas nunca bajan / ranking semanal se reinicia | VERIFICADO EN NAVEGADOR | `11-ranking-semanal.png`, `14-perfil-invitado.png` |
| Calibración "sin presión" + "arrancar en nivel 1" | VERIFICADO EN NAVEGADOR | `08-diagnostico-numeria-sin-presion.png`, `09-diagnostico-melodia-notas.png` |
| Guest honesto ("no perdés nada, tu progreso se guarda") | VERIFICADO EN NAVEGADOR | `15-invitado-bloqueado-rankeds.png`, `16-invitado-bloqueado-generico.png` |

**Nuevo claim publicitario #1 (nunca antes registrado, fuerza máxima):** el funnel REAL es "2 mundos gratis para siempre + demos de los 8 mundos sin crear cuenta". Es la promesa más grande que la app puede sostener palabra por palabra y ya está en la UI. Anclar todo lo demás a esto.

Ver análisis completo y los 3 conceptos nuevos en `REAL-APP-2026-09-08.md`.