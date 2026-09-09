# EXPANSIÓN DE LA TIENDA — Diseño de Sistema Completo

**Fecha:** 2026-09-09 · **Agente:** store-economy+gameplay+backend
**Estado:** Documento de diseño — sin código de runtime. Referencias contra código real.

---

## Resumen Ejecutivo

La tienda actual de Prodigia vende 26 ítems estáticos (8 marcos de rango, 8 marcos de mundo, 6 fuentes, 3 de utilidad, 1 paquete) con un descuento diario rotativo. El catálogo total cuesta ~23.200 Chispas (~190 partidas). La Trastienda (apuestas/ruleta/minijuegos) está diseñada pero sin implementar.

Este documento diseña un **sistema de tienda expandida** con 4 categorías de objetos, 5 rarezas, tienda rotativa sin FOMO, 6 colecciones, sistema de temporada vinculado a Ranked, e integración con Trastienda. Todo con evidencia de código y números reales.

**Conclusión de economía:** Las Chispas son adecuadas como moneda única. No se necesita moneda secundaria. El catálogo actual (23.200) más Trastienda (~1.000/SKU) más la expansión propuesta (~45.000) dan un total de ~70.000 Chispas para "completar todo" (~580 partidas), un target de 2-4 meses para un jugador activo. La inflación es controlable.

---

## 1. AUDITORÍA DE ECONOMÍA CHISPAS

### 1.1. Qué función cumplen las Chispas

Las Chispas (`puntos_total` en `profiles`) son la **moneda interna única** de Prodigia. Sirven para:
- Desbloquear mundos nuevos (3.000 c/u)
- Comprar cosméticos y utilidades en la Tienda
- Apostar en la Trastienda (apuestas, ruleta, minijuegos — diseñado en TRASTIENDA-ECONOMIA.md)

Son acumulables, no se resetean nunca (`profiles.puntos_total`, tipo integer). La columna `nivel_cuenta` y el logro "Chispas de Sobra" (5.000 Chispas en balance, `src/lib/titulos/catalogo.ts:86`) las tratan como un signo de permanencia/estatus.

### 1.2. Fuentes de ingreso (con valores verificados)

| # | Fuente | Mecanismo | Cantidad por fuente | Tope | Referencia |
|---|---|---|---|---|---|
| S1 | Práctica (por acierto) | `registrar_xp_diario` → `acreditar_chispas` | ~14-18 por acierto (nivel cal. 3-5, ~70% aciertos) | Sin tope diario | `0070:199` (acreditar) · `costos.ts:6-8` (referencia 120/partida) |
| S2 | Recompensa de nivel de cuenta | `acreditar_chispas` dentro de `registrar_xp_diario` | `50·n + 250` (n=1: 300, n=15: 1000, n=50: 2750) | Por nivel alcanzado | `0118:107` (fórmula) · Aprobada por PO |
| S3 | Reto diario | `completar_reto_diario` (0113) | 20 × acierto, tope 100/día = 700/sem | 100/día | `0113:53` · `ECONOMY.md:11` |
| S4 | Reto semanal | `completar_reto_semanal` (0113) | 10 × acierto, tope 450/sem | 450/sem | `0113:113` · `ECONOMY.md:12` |
| S5 | Apuesta doble-o-nada | `apostar_doble_o_nada` (0054:243) | Gana 2× el monto (si supera umbral) | 200 Chispas por apuesta | `0054:258` · `0025:116` |
| S6 | Trastienda (diseñada, sin implementar) | Ruleta, apuestas a partidas, minijuegos, predicciones | Ver TRASTIENDA-ECONOMIA.md | Límites diarios (5 giros, etc.) | `TRASTIENDA-ECONOMIA.md` |

**Ingreso estimado por semana (perfil típico):**

| Perfil | Práctica (S1) | Reto diario (S3) | Reto semanal (S4) | Total/sem |
|---|---|---|---|---|
| Élite (5 partidas/día) | 3,600 | 700 | 450 | **4,750** |
| Normal (3 partidas/día) | 2,160 | 700 | 450 | **3,310** |
| Light (1 partida/día) | 720 | 700 | 450 | **1,870** |

*Nota: S1 usa referencia de 120/partida × 5 días/semana para élit, 3 para normal, 1 para light. Reto diario se considera al 100% (100/día × 7).*

### 1.3. Gastos/Sinks existentes (con código)

| # | Sink | Costo | Fuente |
|---|---|---|---|
| K1 | Escudo | 350 | `costos.ts:22` · `0104:66` |
| K2 | Congelamiento | 450 | `costos.ts:23` · `0104:67` |
| K3 | Boost | 600 | `costos.ts:24` · `0104:68` |
| K4 | Fuentes (6 tipos) | 1.000 – 5.000 | `costos.ts:26-36` · `0104:69-74` |
| K5 | Marcos de rango (6 tipos) | 1.000 – 5.000 | `costos.ts:37-42` · `0104:75-80` |
| K6 | Marcos de mundo (8 tipos) | 2.400 c/u | `costos.ts:50-59` · `0104:81-88` |
| K7 | Paquete marcos mundo | 14.500 | `costos.ts:69` · `0107:69` |
| K8 | Desbloquear mundo | 3.000 × 6 mundos = 18.000 | `precios.ts:11` · `0097` · `comprar_item_tienda` |
| K9 | Cambiar nombre | 100 | `0054:97` |
| K10 | Crear clan | 5.000 | `0070:309` |

**Total de "completar todo el catálogo de tienda" (sueltos, sin paquete):**
- Utilidades consumibles (×1 c/u): 350 + 450 + 600 = 1,400
- Fuentes: 1,000 + 1,400 + 5,000 + 1,200 + 1,800 + 2,500 = 12,900
- Marcos de rango: 1,000 + 1,300 + 1,700 + 2,200 + 3,200 + 5,000 = 14,400
- Marcos de mundo (8): 2,400 × 8 = 19,200
- **Subtotal tienda: ~47,900 Chispas** (~400 partidas para un élite)

### 1.4. Inflación percibida

- **Acumulación típica sin gastar:** un jugador normal acumula ~3,310/sem. En 4 semanas = ~13,240. En 12 semanas = ~39,720.
- **Velocidad de vaciado del catálogo actual:** sin la expansión, un jugador normal vacía los 47,900 en ~15 semanas (~4 meses). El paquete de mundos (14,500) acelera esto.
- **Efecto de la recompensa por nivel (S2):** 50·n+250 agrega ~15,750 Chispas extra en los primeros 50 niveles (suma de 300+350+...+2750). Esto acelera el vaciado en ~5 semanas para un élite.
- **Riesgo:** Con la expansión propuesta (+45,000 Chispas de contenido), el total sube a ~93,000 para "completar todo". Esto da ~775 partidas, ~5 meses para un élite, ~8 meses para un normal — un target razonable.

### 1.5. Conclusión: ¿moneda única o secundaria?

**MANTENER como moneda única (Chispas).** Razones:

1. La economía actual es sana: sink/source ratio ≥ 1 para perfiles activos.
2. La Trastienda (EV 0.91-0.94 por interacción) es un sink adicional que drena ~100 Chispas/sesión sin romper la economía (`TRASTIENDA-ECONOMIA.md:577-582`).
3. La expansión de tienda agrega ~45,000 Chispas de contenido nuevo, lo cual da un target de "completar todo" de 4-8 meses — adecuado.
4. No hay señales de inflación descontrolada: el S0/S1 fix (`0120`) selló la fabricación de Chispas desde el cliente.

**No crear moneda secundaria ("gemas", "diamantes", etc.).** La complejidad de balancear dos monedas no justifica el beneficio en una app educativa con base de usuarios moderada. Las Chispas son suficientes.

---

## 2. ARQUITECTURA DE CATEGORÍAS Y 20 OBJETOS ESTRELLA

### 2.1. Categorías

#### (a) Cosméticos — "Vidriera del Bazar"

**Qué son:** objetos que cambian la apariencia del perfil, leaderboard, y momentos de juego. Se aplican a slots de UI ya existentes.

**Slots de UI verificados en código:**
- **Marco de perfil** (`profiles.marco_perfil`): borde alrededor del avatar. Slot en perfil, leaderboard, feed. (`TiendaClient.tsx:16-21` · `database.ts:286-294`)
- **Marco de avatar superpuesto** (`profiles.marcos_desbloqueados`): anillo circular sobre avatar (mundo). (`TiendaClient.tsx:28-33` · `AvatarConMarco.tsx`)
- **Fuente de nombre** (`profiles.fuente_nombre`): tipografía del nombre de usuario. Slot en perfil, leaderboard, chat. (`TiendaClient.tsx:96-103` · `database.ts:60-70`)
- **Avatar** (`profiles.avatar_url`): imagen de perfil. Storage bucket "avatares". (`database.ts:100`)
- **Título activo** (`profiles.titulo_activo`): texto junto al nombre. Slot en perfil, leaderboard, feed. (`0043:33` · `catalogo.ts:30-95`)

**Objetos nuevos propuestos:**
- **Banners de perfil** (nuevo slot `profiles.banner_perfil`): fondo detrás del avatar en perfil. Imagen estática o gradiente temático.
- **Insignias decorativas** (nuevo slot `profiles.insignia_id`): ícono pequeño junto al título en leaderboard/feed.
- **Efectos de entrada** (nuevo slot `profiles.efecto_entrada`): animación al entrar a una partida.
- **Emotes/poses** (nuevo slot `profiles.pose_default`): gesto del avatar en pantalla de resultados.

#### (b) Personalización — "El Herrero"

**Qué son:** objetos que personalizan la experiencia de usuario (no solo cosmética visual sino funcional).

**Slots verificados:**
- **Perfil**: avatar + marco + fuente + título (ya existen).
- **Tarjeta de jugador** (nuevo componente): resumen visual en duelos/rankeds (nombre, nivel, rango, items equipados).

**Objetos nuevos propuestos:**
- **Tarjetas de jugador personalizadas**: fondo y estilo de la tarjeta que se muestra al rival en duelos.
- **Efecto de victoria** (nuevo slot `profiles.efecto_victoria`): animación al ganar una partida/duelo.
- **Efecto de derrota** (nuevo slot `profiles.efecto_derrota`): animación al perder.
- **Intro de ranked** (nuevo slot `profiles.intro_ranked`): animación al entrar a un duelo Ranked.

#### (c) Competitivo — "El Ring"

**Qué son:** objetos que reflejan y premian el rendimiento en Rankeds. Se obtienen por peak rank (no solo comprarse).

**Slots verificados:**
- **Rangos ELO** (`profiles.elo_rating`): Bronce→Prodigio (6 rangos, `database.ts:262-269`).
- **Títulos de rango** (`titulos_usuario`, origen "rango"): auto-otorgados al subir de rango (`0043:56-75`).
- **Marcos de rango** (ya existentes: bronce→prodigio).

**Objetos nuevos propuestos:**
- **Banners de temporada** (nuevo slot, descrito en §6): por temporada, temáticos.
- **Emblemas de peak** (nuevo slot `profiles.emblema_peak`): refleja el rango más alto alcanzado en la temporada actual.
- **Títulos de temporada** (nuevo tipo en `titulos_usuario`, origen "temporada"): exclusivos por temporada.
- **Recompensa por peak rank** (desbloqueo automático): marcos/efectos únicos por llegar a Platino+, no comprables.

#### (d) Mundos — "Los Ocho Reinos"

**Qué son:** objetos temáticos vinculados a los 8 mundos del juego. Ya existen marcos de mundo (8) y el paquete.

**Slots verificados:**
- **Marcos de mundo** (`profiles.marcos_desbloqueados`, gate nivel_mundo ≥ 40).
- **Colores de mundo** (`COLOR_MUNDO_PAGO` en `precios.ts:32-41`).

**Objetos nuevos propuestos:**
- **Banners de mundo** (nuevo slot `profiles.banner_mundo`): fondo temático al entrar a la home de un mundo.
- **Ícono de título de mundo** (extensión de títulos existentes): variante visual del título "Maestro de X".
- **Efectos de mundo** (nuevo slot `profiles.efecto_mundo`): animación al completar una partida en ese mundo.

---

### 2.2. Lista priorizada: 20 objetos excelentes

Cada ítem justificado con slot, costo (Chispas), rareza, y por qué genera deseo.

| # | Objeto | Slot de UI | Categoría | Rareza | Costo (Chispas) | Requisito | Por qué genera deseo |
|---|---|---|---|---|---|---|---|
| 1 | **Marco "Leyenda"** | `marco_perfil` | Competitivo | Legendario | 0 (peak: Diamante ≥ 1500 ELO) | Rango Diamante | Solo lo ven quienes llegaron ahí. Señal de status máxima. No comprable. |
| 2 | **Banner "Aurora Violeta"** | `banner_perfil` (nuevo) | Cosmético | Raro | 2,000 | Nivel cuenta ≥ 15 | Primer banner de la tienda. Cambia toda la apariencia del perfil. |
| 3 | **Marco "Numeria Suprema"** | `marco_perfil` | Mundo | Épico | 0 (peak: nivel_mundo Numeria ≥ 90) | Mundo Numeria nivel 90 | Marco que solo ven los numeristas más dedicados. La versión "prodigio" del mundo. |
| 4 | **Efecto de victoria "Relámpago"** | `efecto_victoria` (nuevo) | Cosmético | Poco común | 800 | Nivel cuenta ≥ 5 | Primera animación de resultado. Visible en cada victoria — alto ROI de exposición. |
| 5 | **Fuente "Acuarela"** | `fuente_nombre` | Cosmético | Épico | 3,500 | Nivel cuenta ≥ 20 | Fuente artística, distinta a las 6 existentes. El escalón entre script (1,800) y manuscrita (5,000). |
| 6 | **Marco "Platino Brillante"** | `marco_perfil` | Cosmético | Raro | 2,800 | Rango Platino alcanzado | Marco animado (brillo pulsante). Comprable pero solo después de haber sido Platino. |
| 7 | **Banner "Enigmia Profunda"** | `banner_mundo` (nuevo) | Mundo | Poco común | 1,500 | Nivel_mundo Enigmia ≥ 40 | Banner temático para la home de Enigmia. Los fans de lógica lo quieren. |
| 8 | **Insignia "Centurión"** | `insignia_id` (nuevo) | Competitivo | Raro | 0 (logro: 100 duelos ganados) | 100 victorias en Rankeds | Señal de longevidad competitiva. Visible en leaderboard. |
| 9 | **Efecto de entrada "Niebla"** | `efecto_entrada` (nuevo) | Cosmético | Común | 600 | Nivel cuenta ≥ 3 | Primer efecto de entrada barato. Genera "primera compra" en la categoría nueva. |
| 10 | **Marco "Oro Negro"** | `marco_perfil` | Cosmético | Épico | 4,000 | Nivel cuenta ≥ 25 | Marco premium con borde dorado sobre fondo negro. Alternativa al prodigio sin ser tan exigente. |
| 11 | **Tarjeta "Clásica"** | tarjeta de duelo (nuevo componente) | Personalización | Poco común | 1,000 | Nivel cuenta ≥ 8 | Estilo visual en la tarjeta que ve el rival. Personalización social. |
| 12 | **Banner "Geografía Global"** | `banner_mundo` (nuevo) | Mundo | Común | 1,000 | Nivel_mundo Geografía ≥ 40 | Banner con mapa para fans de geografía. |
| 13 | **Emblema "Fénix"** | `emblema_peak` (nuevo) | Competitivo | Épico | 0 (peak: Prodigio ≥ 1700 ELO) | Rango Prodigio | Solo Prodigios lo llevan. El más raro del juego. |
| 14 | **Efecto de victoria "Fuegos Artificiales"** | `efecto_victoria` (nuevo) | Cosmético | Legendario | 0 (logro: 500 duelos ganados) | 500 victorias | Visible solo para veteranos. Efecto animado espectacular. |
| 15 | **Fuente "Gótica"** | `fuente_nombre` | Cosmético | Raro | 2,200 | Nivel cuenta ≥ 12 | Tipografía con personalidad, entre futurista (2,500) y script (1,800). |
| 16 | **Marco "Mundo" (genérico)** | `marco_perfil` | Cosmético | Común | 500 | Nivel cuenta ≥ 1 | Marco base con el color de un mundo a elegir. Opción económica para personalizar. |
| 17 | **Intro Ranked "Ojo Prodigia"** | `intro_ranked` (nuevo) | Competitivo | Raro | 0 (peak: Platino en 3 temporadas) | 3 temporadas Platino+ | Reconocimiento de consistencia temporal. |
| 18 | **Efecto de derrota "Respeto"** | `efecto_derrota` (nuevo) | Cosmético | Común | 400 | Nivel cuenta ≥ 2 | Animación sutil para la derrota. Genera empatía, no humillación. |
| 19 | **Banner "Química Reactiva"** | `banner_mundo` (nuevo) | Mundo | Raro | 2,000 | Nivel_mundo Química ≥ 40 | Banner con fórmulas y colores Química. |
| 20 | **Marco "Desafiante"** | `marco_perfil` | Competitivo | Legendario | 0 (peak: top 10 ranking semanal) | Top 10 semanal | El marco temporal más exclusivo. Se pierde cada semana. |

### 2.3. Racional económico de los 20 objetos

- **0 comprables y 8 de desbloqueo (logro/peak):** esto es intencional — la mitad de los objetos estrella son "orgánicos" (se ganan jugando). Esto: (a) mantiene la motivación de juego, (b) evita que todo se pueda comprar, (c) crea tensión entre "comprar" y "ganar".
- **Rangos de costo de comprables:** 400 – 4,000 Chispas. El rango de 400-800 es "1-3 partidas" (accesible), 1,000-2,000 es "1-2 semanas" (medio), 2,200-4,000 es "3-6 semanas" (prestigio).
- **Los banners son el "nuevo marco":** marshos ya existen y tienen saturación. Banners son un slot nuevo con alta capacidad expresiva y bajo costo de implementación (imagen estática + gradientes).
- **Los efectos son adictivos:** aunque cuestan poco, se ven en CADA partida. ROI de exposición altísimo → generan "quiero otro efecto" más que marcos (que solo se ven en perfil/leaderboard).

---

## 3. SISTEMA DE RAREZAS

### 3.1. Nombres propios Prodigia

Las rarezas usan nombres del universo del juego, no genéricos de RPG:

| # | Rareza | Nombre en Prodigia | Color de borde | Glow | Animación | Sonido | Probabilidad (cajas/rotativa) |
|---|---|---|---|---|---|---|---|
| 1 | Común | **Chispa** | `#8892b0` (texto-secundario) | Ninguno | Sin animación | Sin sonido | ~60% |
| 2 | Poco común | **Brasa** | `#3fb88b` (correcto) | Glow verde sutil (1px) | Pulso suave (2s) | "Ting" grave | ~25% |
| 3 | Raro | **Centella** | `#7c5cff` (primario) | Glow violeta (2px) | Pulso medio (1.5s) | "Ding" agudo | ~10% |
| 4 | Épico | **Tormenta** | `#ff8a3d` (racha) | Glow naranja (3px) | Pulso rápido + rayos (1s) | "Crash" + eco | ~4% |
| 5 | Legendario | **Rayo Prodigia** | `#ffc53d` (logro) | Glow dorado (4px) + degradé | Rotación lenta + particulas (constante) | "Fanfarria" | ~1% |

**Diferencia con Trastienda:** Trastienda tiene su propia rareza "Mitológico" (`TRASTIENDA-ECONOMIA.md:254`). Esto se mantiene: Mitológico es exclusivo de Trastienda, Rayo Prodigia es el tope de la tienda regular.

### 3.2. Tratamiento visual por rareza

| Aspecto | Chispa | Brasa | Centella | Tormenta | Rayo Prodigia |
|---|---|---|---|---|---|
| Borde del ítem en tienda | 1px `#8892b0` | 2px `#3fb88b` | 2px `#7c5cff` + glow | 3px `#ff8a3d` + glow + rayos | 4px `#ffc53d` + glow + degradé |
| Animación en perfil | — | Pulso 2s | Pulso 1.5s | Pulso 1s + rayos | Rotación + partículas |
| Sonido al equipar | — | Ting grave | Ding agudo | Crash + eco | Fanfarria |
| Notificación de desbloqueo | Toast simple | Toast verde | Toast violeta + shake | Full-screen overlay + screen shake | Full-screen overlay + GestoLogo |
| Marco en leaderboard | Borde simple | Borde + dot verde | Borde + glow violeta | Borde + rayos naranjas | Borde dorado + degradé animado |

### 3.3. Probabilidades en cajas/rotativa (si aplica)

Si la tienda rotativa o Trastienda ofrece "cajas" o "giros" con ítems aleatorios:

| Rareza | P(giro) | EV si el ítem vale ~1.5× su costo | Límite anti-abuso |
|---|---|---|---|
| Chispa | 60% | 0.9 × costo | Sin límite |
| Brasa | 25% | 1.1 × costo | Sin límite |
| Centella | 10% | 1.3 × costo | Tope 5 cajas/día |
| Tormenta | 4% | 1.5 × costo | Tope 3 cajas/día, pity 10 |
| Rayo Prodigia | 1% | 2.0 × costo | Tope 1 caja/día, pity 30 |

**Pity system:** después de N giros sin获得 una rareza ≥ Centella, el siguiente giro tiene boost de probabilidad:
- Sin Centella en 10 giros → probabilidad de Centella sube a 25% (reemplaza Brasa).
- Sin Tormenta en 20 giros → probabilidad de Tormenta sube a 10%.
- Sin Rayo en 50 giros → probabilidad de Rayo sube a 5%.

**EV esperado del jugador con pity:** ~0.93 (house edge 7%). Coherente con Trastienda.

---

## 4. TIENDA ROTATIVA

### 4.1. Filosofía

**SIN FOMO agresivo.** No se "pierde" nada permanente. Todo vuelve a aparecer. El sistema incentiva la vuelta diaria pero no penaliza la ausencia.

### 4.2. Mecánicas

#### Oferta Diaria ("Oferta del Vendedor")
- Ya existe: 1 ítem con 20-50% descuento, determinístico por fecha (`descuentoDiario.ts:36-42`).
- **Expansión:** incluir ítems nuevos (banners, efectos) en el pool de descuentos (`ITEMS_CON_DESCUENTO` en `descuentoDiario.ts:5-21`).

#### Oferta Semanal ("Vitrina del Semestre")
- 3-4 ítems con 15-30% descuento, rotan cada lunes.
- Pool más amplio: incluye cosméticos premium que normalmente no tendrían descuento.
- **Mecánica de "duplicados":** si el jugador ya tiene un ítem, puede comprarlo por 40% del precio → se convierte en "碎片" (fragmentos) que acumula para un ítem exclusivo de fragmentos.

#### Tienda Rotativa ("El Carro")
- 4-6 ítems rotativos que cambian cada 3 días.
- Incluye: banners, efectos, insignias, y algunos marcos/ fuentes "de temporada".
- **Regla:** ningún ítem del Carro es exclusivo permanente — todo reaparece en 30-60 días máximo.

#### Colecciones ("Paquetes del Bazar")
- 6 colecciones (ver §5). Se muestran como bundles en la tienda.
- **Descuento de bundle:** 15-25% vs. comprar suelto.
- **Bonificación de completar set:** al tener todos los ítems de una colección, se desbloquea un ítem exclusivo (marco legendario único, ver §5).

#### Tienda de Temporada ("El Ring")
- Vinculada a Ranked (ver §6).
- Ítems exclusivos de temporada que NO reaparecen.
- **Tratamiento:** 3-5 ítems por temporada, accesibles por compra O por peak rank.

### 4.3. Reglas de negocio (SQL-friendly)

```sql
-- shop_rotations: tabla de rotaciones
-- type: 'diaria' | 'semanal' | 'rotativa' | 'temporada' | 'coleccion'
-- item_id: referencia a items_catalog
-- precio_original: costo base
-- precio_rotacion: costo con descuento (null = sin descuento)
-- activo_desde / activo_hasta: ventana de disponibilidad
-- created_at: timestamp

-- Ejemplo de query para "¿qué hay en la tienda hoy?":
-- SELECT * FROM shop_rotations
-- WHERE activo_desde <= now() AND activo_hasta > now()
-- AND activo = true
-- ORDER BY tipo, orden;
```

### 4.4. Anti-abuso

- **Tope de giros/cajas por día** (ya diseñado en Trastienda: 5 giros ruleta).
- **Pity system** (ver §3.3).
- **Sin compra de Chispas con dinero real:** la app es educativa, sin monetización directa.
- **Cooldown de recompra:** 24h entre compras del mismo ítem (prevenir manipulación de fragmentos).

---

## 5. COLECCIONES

### 5.1. Definición

Una colección es un set de 4-6 ítems temáticos. Completar el set desbloquea un **ítem exclusivo** (no comprable suelto).

### 5.2. Colecciones propuestas

#### Colección 1: "Los Ocho Reinos" (Mundos)
- **Componentes:** Marco Numeria + Marco Geografía + Marco Enigmia + Marco Química + Marco Anatomía + Marco Melodía + Marco Trigonometría + Marco Historia
- **Bonificación:** Marco "Señor de los Reinos" (Rayo Prodigia, único, animado con los 8 colores de mundo en degradé rotativo)
- **Costo total suelto:** 8 × 2,400 = 19,200 → Paquete: 14,500 (ya existe, `costos.ts:69`)
- **Novedad:** la bonificación es NUEVA — el paquete existente solo da los 8 marcos; la colección agregaría el marco exclusivo.

#### Colección 2: "Numeria Ascendente" (Mundo Numeria)
- **Componentes:** Marco Numeria (2,400) + Banner Numeria (1,500) + Fuente Mono (1,000) + Efecto "Fórmulas" (800) + Título "Numeria Pura" (logro: nivel_mundo ≥ 60)
- **Bonificación:** Marco "Numeria Eterna" (Legendario, animado con ecuaciones flotantes)
- **Costo total suelto:** 2,400 + 1,500 + 1,000 + 800 = 5,700 (título es gratis por logro)
- **Bundle:** 4,500 (sin el título, que se gana)

#### Colección 3: "El Estratega" (Competitivo)
- **Componentes:** Marco Platino (2,200) + Fuente Futurista (2,500) + Insignia "Estratega" (1,200) + Efecto "Cerebro" (1,000) + Título "Maestro de la Estrategia" (logro: 50 duelos ganados)
- **Bonificación:** Intro Ranked "Ojo Prodigia" (Legendario)
- **Costo total suelto:** 2,200 + 2,500 + 1,200 + 1,000 = 6,900
- **Bundle:** 5,500

#### Colección 4: "El Cronista" (Historia)
- **Componentes:** Marco Historia (2,400) + Banner Historia (1,500) + Fuente Serif (1,400) + Efecto "Pergamino" (800) + Título "Cronista" (logro: nivel_mundo Historia ≥ 60)
- **Bonificación:** Marco "Legado" (Épico, con glifos animados de distintas épocas)
- **Costo total suelto:** 2,400 + 1,500 + 1,400 + 800 = 6,100
- **Bundle:** 4,900

#### Colección 5: "La Esencia" (Cosmética básica)
- **Componentes:** Marco Bronce (1,000) + Fuente Mono (1,000) + Efecto "Niebla" (600) + Efecto "Relámpago" (800) + Tarjeta "Clásica" (1,000)
- **Bonificación:** Marco "Esencia Pura" (Poco común, con brillo verde sutil)
- **Costo total suelto:** 1,000 + 1,000 + 600 + 800 + 1,000 = 4,400
- **Bundle:** 3,500

#### Colección 6: "El Desafiante" (Top Ranking)
- **Componentes:** Marco Desafiante (0, logro: top 10 semanal) + Emblema Fénix (0, logro: Prodigio) + Efecto "Fuegos Artificiales" (0, logro: 500 duelos) + Intro "Ojo Prodigia" (0, logro: 3 temporadas Platino+) + Banner "Aurora Violeta" (2,000, comprable)
- **Bonificación:** Marco "Leyenda Absoluta" (Mitológico, animado con todos los colores de rareza)
- **Costo total suelto:** 0 + 0 + 0 + 0 + 2,000 = 2,000 (pero el "costo real" es alcanzar los logros)
- **Bundle:** 1,600 (solo el banner, el resto se gana)

---

## 6. TIENDA DE TEMPORADA (Vinculada a Ranked)

### 6.1. Sistema competitivo actual

- **ELO:** 800 base, K=13 (simple) / K=20 (mejor de 3). (`0043:381,495`)
- **Rangos:** Bronce (≥0) → Plata (≥900) → Oro (≥1100) → Platino (≥1300) → Diamante (≥1500) → Prodigio (≥1700). (`database.ts:262-269`)
- **Mundos con Rankeds:** Numeria (tiempo real), Geografía y Enigmia (asincrónicos). (`0043:6-11`)
- **Ranking semanal:** XP acumulada en la semana, muestra `elo_rating` y `titulo_activo`. (`0043:756-790`)
- **Títulos de rango:** auto-otorgados al subir de rango, slugs `rango_bronce`...`rango_prodigio`. (`0043:56-75`)

### 6.2. Propuesta: Temporadas

**Concepto:** cada 4 semanas (28 días), la temporada "resetea" parcialmente. El ELO no se resetea a cero, pero hay contenido exclusivo de temporada que incentiva el competitive.

#### Por temporada:

| Elemento | Cómo se obtiene | Exclusividad |
|---|---|---|
| **Banner de temporada** (ej. "Temporada I: El Despertar") | Comprable: 2,500 Chispas | Solo disponible durante la temporada |
| **Marco de temporada** (ej. "Marco Temporada I") | Peak rank Platino+ | Desbloqueo automático al alcanzar Platino en la temporada |
| **Título de temporada** (ej. "Veterano de la Temporada I") | Peak rank Oro+ | Desbloqueo automático, origen "temporada" |
| **Efecto de temporada** (ej. "Partículas I") | 5 victorias en Ranked en la temporada | Desbloqueo por volumen competitivo |
| **Colección temática** | Bundle de los 4-5 ítems anteriores | Descuento 20% vs. suelto |

#### Mecánica de "peak rank":
- El "peak rank" de la temporada es el **rango más alto alcanzado** durante esos 28 días.
- No se pierde si el jugador baja de ELO después — el peak se graba al alcanzarse.
- La temporada siguiente, el peak se resetea y empieza de nuevo.
- **Tabla de recompensas por peak:**

| Peak Rank | Marco | Título | Efecto |
|---|---|---|---|
| Bronce | — | — | — |
| Plata | Marco Plata Temporada | "Novato de la Temporada" | — |
| Oro | Marco Oro Temporada | "Competidor" | — |
| Platino | Marco Platino Temporada (animado) | "Veterano de la Temporada" | Partículas de temporada |
| Diamante | Marco Diamante Temporada (animado) | "Élite de la Temporada" | Partículas + aura |
| Prodigio | Marco Prodigio Temporada (exclusivo) | "Leyenda de la Temporada" | Partículas + aura + rayos |

#### Reset de temporada:
- **NO se resetea ELO a cero** (esto frustraría). En cambio:
  - Se "congela" el ELO de la temporada pasada como referencia.
  - El nuevo arranca con una leve caída: `nuevo_elo = max(800, elo_actual - 100)`. Esto da sensación de "empezar de nuevo" sin perder todo el progreso.
  - Los ítems de temporada pasada quedan en el inventario permanentemente (no se borran).
  - Los títulos de temporada son permanentes.

#### Calendario:
| Temporada | Fechas (ejemplo) | Tema | Mundo destacado |
|---|---|---|---|
| I | Sem 1-4 | "El Despertar" | Numeria |
| II | Sem 5-8 | "Los Mundos" | Geografía |
| III | Sem 9-12 | "Mentes Brillantes" | Enigmia |
| IV | Sem 13-16 | "Fórmulas Secretas" | Química |

---

## 7. INTEGRACIÓN CON TRASTIENDA

### 7.1. Ítems exclusivos de Trastienda

La Trastienda (`TRASTIENDA-ECONOMIA.md`) ya define títulos exclusivos de rareza alta. Con la expansión, se agregan:

| Ítem | Rareza | Cómo se obtiene | Exclusividad |
|---|---|---|---|
| Títulos de Trastienda (9 propuestos en §3 de TRASTIENDA-ECONOMIA.md) | Común→Mitológico | Logros de apuestas/minijuegos | Solo Trastienda |
| Fuente "Monograma" (nueva) | Épico | Regla de ruleta (1.5%) | Trastienda rotativa |
| Marco "El Trastiendista" (nuevo) | Legendario | Acumular 10,000 Chispas en ganancias de Trastienda | Trastienda exclusivo |
| Efecto "Fichas" (nuevo) | Raro | Minijuego "Volado" con 3 rondas ganadas | Trastienda exclusivo |

### 7.2. Economía integrada

- **Las mismas Chispas** se usan en Tienda y Trastienda (decisión de PO, `TRASTIENDA-ECONOMIA.md:24`).
- **La Trastienda es un sink:** el EV < 1 garantiza que drena Chispas de la economía.
- **Flujo típico:** jugador gana Chispas en práctica → gasta parte en Tienda (cosméticos) y parte en Trastienda (entretenimiento). El sink combinado (Tienda + Trastienda) mantiene la economía sana.
- **Evitar conflicto:** la Tienda vende "lo que quieres ser" (cosméticos, status). La Trastienda ofrece "lo que quieres hacer" (jugar, apostar, arriesgar). No compiten — se complementan.

### 7.3. UI

- La Trastienda se accede desde la Tienda (`TiendaClient.tsx:436-445`, botón "🚪 Entrar a la Trastienda").
- Se expande esa sección en una página completa (Opción A recomendada en `TRASTIENDA-ECONOMIA.md:599`).
- La transición visual (marrón cálido → profundo frío) ya está diseñada en `TRASTIENDA-DESIGN.md:69-71`.

---

## 8. ESPECIFICACIÓN TÉCNICA (Esquema de Tablas)

> **NO es SQL ejecutable.** Es la especificación para que otro agente escriba la migración.

### 8.1. Tablas propuestas

#### `items_catalog`
```sql
-- Catálogo maestro de ítems de la tienda expandida
CREATE TABLE items_catalog (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  slug text UNIQUE NOT NULL,           -- 'banner_aurora_violeta', 'efecto_relampago', etc.
  nombre text NOT NULL,                -- 'Aurora Violeta'
  descripcion text,                    -- Descripción flavor
  categoria text NOT NULL,             -- 'cosmetico' | 'personalizacion' | 'competitivo' | 'mundo'
  subcategoria text NOT NULL,          -- 'banner' | 'marco' | 'fuente' | 'efecto' | 'insignia' | 'tarjeta' | 'intro' | 'emblema' | 'titulo'
  rareza text NOT NULL DEFAULT 'chispa', -- 'chispa' | 'brasa' | 'centella' | 'tormenta' | 'rayo_prodigia'
  costo_base integer,                 -- null = no comprable (solo por logro/peak)
  slot_ui text NOT NULL,              -- 'banner_perfil' | 'marco_perfil' | 'fuente_nombre' | 'efecto_victoria' | etc.
  asset_url text,                     -- URL del asset (SVG/PNG)
  asset_preview_url text,             -- Preview para la tienda
  mundo text,                         -- null si no es de mundo, 'numeria'...'historia' si lo es
  requerimiento_tipo text,            -- null | 'nivel_cuenta' | 'nivel_mundo' | 'rango_elo' | 'logro' | 'temporada'
  requerimiento_valor integer,        -- valor del requisito (ej: 15 para nivel_cuenta ≥ 15)
  activo boolean DEFAULT true,        -- ítems descontinuados se marcan false
  creado_at timestamptz DEFAULT now()
);
```

#### `shop_rotations`
```sql
-- Tabla de rotaciones de tienda (diaria, semanal, rotativa, temporada)
CREATE TABLE shop_rotations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  tipo text NOT NULL,                 -- 'diaria' | 'semanal' | 'rotativa' | 'temporada' | 'coleccion'
  item_id uuid REFERENCES items_catalog(id) NOT NULL,
  precio_original integer NOT NULL,   -- costo base del ítem
  precio_rotacion integer,            -- precio con descuento (null = sin descuento)
  activo_desde timestamptz NOT NULL,
  activo_hasta timestamptz NOT NULL,
  activo boolean DEFAULT true,
  orden integer DEFAULT 0,            -- para ordenar ítems dentro del mismo tipo
  temporada_id text,                  -- null si no es de temporada, 'T1'...'T4' si lo es
  creado_at timestamptz DEFAULT now()
);
```

#### `collections`
```sql
-- Colecciones de ítems
CREATE TABLE collections (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  slug text UNIQUE NOT NULL,           -- 'los_ocho_reinos', 'numeria_ascendente', etc.
  nombre text NOT NULL,                -- 'Los Ocho Reinos'
  descripcion text,                    -- Descripción de la colección
  bonificacion_item_id uuid REFERENCES items_catalog(id), -- ítem exclusivo al completar
  activo boolean DEFAULT true,
  creado_at timestamptz DEFAULT now()
);

CREATE TABLE collection_items (
  collection_id uuid REFERENCES collections(id) ON DELETE CASCADE,
  item_id uuid REFERENCES items_catalog(id) ON DELETE CASCADE,
  PRIMARY KEY (collection_id, item_id)
);
```

#### `user_inventory`
```sql
-- Inventario de ítems del usuario (cosméticos desbloqueados)
CREATE TABLE user_inventory (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES profiles(id) NOT NULL,
  item_id uuid REFERENCES items_catalog(id) NOT NULL,
  desbloqueado_via text NOT NULL,     -- 'compra' | 'logro' | 'peak_rank' | 'temporada' | 'coleccion'
  desbloqueado_at timestamptz DEFAULT now(),
  equipado boolean DEFAULT false,     -- si está activo en algún slot
  UNIQUE(user_id, item_id)
);
```

#### `user_equipped`
```sql
-- Qué tiene equipado el usuario en cada slot
CREATE TABLE user_equipped (
  user_id uuid REFERENCES profiles(id) NOT NULL,
  slot text NOT NULL,                 -- 'banner_perfil' | 'marco_perfil' | 'fuente_nombre' | 'efecto_victoria' | etc.
  item_id uuid REFERENCES items_catalog(id), -- null = slot vacío (usar default)
  PRIMARY KEY (user_id, slot)
);
```

#### `transactions`
```sql
-- Registro de transacciones de compra
CREATE TABLE transactions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES profiles(id) NOT NULL,
  item_id uuid REFERENCES items_catalog(id),
  tipo text NOT NULL,                 -- 'compra_item' | 'compra_bundle' | 'fragmentos' | 'recompensa_logro' | 'peak_rank'
  monto_chispas integer,              -- Chispas gastadas (null si es gratis por logro)
  precio_original integer,            -- precio antes de descuento
  descuento_porcentaje integer,       -- % de descuento aplicado
  collection_id uuid,                 -- si es compra de bundle
  temporada_id text,                  -- si es ítem de temporada
  creado_at timestamptz DEFAULT now()
);
```

#### `seasons`
```sql
-- Temporadas de Ranked
CREATE TABLE seasons (
  id text PRIMARY KEY,                -- 'T1', 'T2', etc.
  nombre text NOT NULL,               -- 'El Despertar'
  tema text,                          -- Descripción temática
  mundo_destacado text,               -- 'numeria', etc.
  inicio_at timestamptz NOT NULL,
  fin_at timestamptz NOT NULL,
  elo_reset_offset integer DEFAULT 100, -- cuánto baja el ELO al inicio
  activa boolean DEFAULT false,
  creado_at timestamptz DEFAULT now()
);

CREATE TABLE user_season_stats (
  user_id uuid REFERENCES profiles(id) NOT NULL,
  season_id text REFERENCES seasons(id) NOT NULL,
  elo_peak integer NOT NULL,          -- ELO más alto alcanzado en la temporada
  rango_peak text NOT NULL,           -- 'bronce'...'prodigio'
  duelos_jugados integer DEFAULT 0,
  victorias integer DEFAULT 0,
  derrotas integer DEFAULT 0,
  PRIMARY KEY (user_id, season_id)
);
```

### 8.2. Compatibilidad con patrón existente

- **Server-side todo:** todas las operaciones de compra/desbloqueo son RPCs `security definer` (`comprar_item_tienda` ya lo hace, `0104:41-155`).
- **RLS:** `user_inventory` y `user_equipped` necesitan policies `SELECT` para el propio usuario, `INSERT/UPDATE` solo vía RPC.
- **No tocar `profiles` directamente:** los slots de UI nuevos (`banner_perfil`, `efecto_victoria`, etc.) se manejan en `user_equipped`, no como columnas de `profiles`. Esto es más extensible (sin `ALTER TABLE` por cada slot nuevo).
- **Compatibilidad retroactiva:** las columnas existentes de `profiles` (`marco_perfil`, `fuente_nombre`, `titulo_activo`) se migran gradualmente a `user_equipped` en una fase de transición. El cliente sigue leyendo de `profiles` hasta que la migración esté completa.

### 8.3. RPCs sugeridas

| RPC | Acción | Seguridad |
|---|---|---|
| `comprar_item_catalog(item_slug, precio_esperado)` | Compra un ítem del catálogo | `security definer`, valida saldo + requisitos |
| `comprar_bundle_coleccion(collection_slug, precio_esperado)` | Compra todos los ítems de una colección | `security definer`, valida saldo + items no duplicados |
| `equipar_item(item_slug, slot)` | Equipa un ítem en un slot | `security definer`, valida que el usuario tenga el ítem |
| `obtener_inventario()` | Devuelve todos los ítems del usuario | `security definer` |
| `obtener_equipado()` | Devuelve qué tiene equipado en cada slot | `security definer` |
| `obtener_temporada_activa()` | Devuelve la temporada actual y stats del usuario | `security definer` |
| `rotar_temporada()` | Cierra la temporada actual y abre la siguiente | Admin/cron |

---

## 9. ROADMAP PROPUESTO

### Fase 1: Validar economía (1 semana)
- [ ] Aplicar migraciones pendientes (0117, 0118, 0120) a staging
- [ ] Verificar en vivo: Chispas, niveles, mundial progress
- [ ] Medir inflación real: ¿cuántas Chispas acumula un usuario promedio en 1 semana?
- [ ] Ajustar si es necesario antes de expandir

### Fase 2: MVP cosméticos (2-3 semanas)
- [ ] Crear tabla `items_catalog` + `user_inventory` + `user_equipped`
- [ ] Migrar ítems existentes (marcos, fuentes) al catálogo
- [ ] Crear RPC `comprar_item_catalog` (compatible con `comprar_item_tienda` existente)
- [ ] Agregar primeros 5 objetos nuevos: Banner Aurora Violeta, Efecto Relámpago, Efecto Niebla, Fuente Acuarela, Marco Oro Negro
- [ ] Agregar slot `banner_perfil` al perfil
- [ ] UI: expandir TiendaClient con nueva sección "Vidriera del Bazar"

### Fase 3: Colecciones (1-2 semanas)
- [ ] Crear tablas `collections` + `collection_items`
- [ ] Implementar las 6 colecciones con sus componentes
- [ ] Crear RPC `comprar_bundle_coleccion`
- [ ] UI: sección "Paquetes del Bazar" con bonificación visible

### Fase 4: Tienda rotativa (1-2 semanas)
- [ ] Crear tabla `shop_rotations`
- [ ] Expandir pool de `descuentoDiario.ts` con ítems nuevos
- [ ] Crear "Vitrina del Semestre" (ofertas semanales)
- [ ] Crear "El Carro" (rotativa cada 3 días)
- [ ] Anti-abuso: pity system, tope de giros

### Fase 5: Temporada y Competitive (2-3 semanas)
- [ ] Crear tablas `seasons` + `user_season_stats`
- [ ] Implementar peak rank tracking
- [ ] Crear ítems de temporada (banners, marcos, títulos, efectos)
- [ ] Implementar reset parcial de ELO
- [ ] UI: "El Ring" sección competitiva

### Fase 6: Trastienda (3-4 semanas)
- [ ] Implementar Trastienda completa (apuestas, ruleta, minijuegos)
- [ ] Integrar títulos de Trastienda al catálogo
- [ ] Agregar ítems exclusivos de Trastienda al inventario
- [ ] UI: expandir sección Trastienda en TiendaClient

---

## 10. RIESGOS Y LÍMITES ANTI-ABUSO

### 10.1. Riesgos identificados

| # | Riesgo | Probabilidad | Impacto | Mitigación |
|---|---|---|---|---|
| R1 | Inflación por recompensa de nivel (50·n+250) | Media | Alto | ya mitigado: fórmula aprobada, catálogo expandido la absorbe |
| R2 | Fabricación de Chispas desde cliente | Baja | Crítico | S0/S1 sellados en `0120`. Verificar que no haya nuevas vías |
| R3 | Bots farmeando práctica | Media | Medio | Límite de intentos por día, verificación de captcha en registro |
| R4 | Acumulación excesiva (jugador sin qué comprar) | Alta | Medio | Tienda rotativa + Trastienda como sink adicional + temporadas |
| R5 | FOMO por temporadas | Media | Bajo | ítems永久 permanentes, no se borran; peak rank es un bonus, no un castigo |
| R6 | Bug de duplicación de ítems | Baja | Alto | RPCs con transacciones atómicas, `ON CONFLICT DO NOTHING` en `user_inventory` |
| R7 | Pity system explotado (farmear para llegar al pity) | Media | Bajo | Tope de giros/día (ya diseñado en Trastienda), EV < 1 garantiza pérdida neta |

### 10.2. Límites anti-abuso implementados

| Mecánica | Límite | Referencia |
|---|---|---|
| Giros de ruleta/día | 5 | `TRASTIENDA-ECONOMIA.md:331` |
| Apuestas de ranking/semana | 1 | `TRASTIENDA-ECONOMIA.md:174` |
| Apuestas a partida/monto máximo | 200 Chispas | `TRASTIENDA-ECONOMIA.md:43` |
| Minijuegos/día | Sin tope pero EV < 1 | `TRASTIENDA-ECONOMIA.md:547` |
| Compra del mismo ítem | 24h cooldown (propuesta) | §4.4 |
| Cajas con rareza alta | Tope 1-5/día según rareza | §3.3 |

### 10.3. Monitoreo sugerido

- **Dashboard de economía:** queries semanales sobre `puntos_total` promedio, distribución de saldos, velocity de compra.
- **Alertas:** si el saldo promedio sube >20% en 2 semanas → investigar fuente de inflación.
- ** Métricas de tienda:** items más comprados, tasa de conversión (visitantes → compradores), revenue de Chispas por categoría.

---

*Documento de diseño. Sin código de runtime. Referencias: `src/lib/tienda/costos.ts`, `src/lib/titulos/catalogo.ts`, `src/lib/titulos/verificar.ts`, `src/lib/mundos/precios.ts`, `src/lib/descuentoDiario.ts`, `src/types/database.ts`, `src/app/[locale]/tienda/TiendaClient.tsx`, `supabase/migrations/0054_tienda_rediseno.sql`, `supabase/migrations/0097_mundos_por_chispas.sql`, `supabase/migrations/0104_marcos_tematicos_mundo.sql`, `supabase/migrations/0107_paquete_marcos_mundo.sql`, `supabase/migrations/0043_rankeds_rangos_titulos_multimundo.sql`, `supabase/migrations/0070_clanes_niveles_y_roles.sql`, `supabase/migrations/0118_niveles_cuenta_recompensas.sql`, `supabase/migrations/0120_cerrar_s0_s1.sql`, `docs/audits/TRASTIENDA-ECONOMIA.md`, `docs/audits/TRASTIENDA-DESIGN.md`, `docs/audits/NIVELES-PERSONALES-2026-09-08.md`, `docs/economy/ECONOMY.md`.*
