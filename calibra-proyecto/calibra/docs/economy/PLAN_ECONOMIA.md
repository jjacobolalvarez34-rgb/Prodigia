# Plan: economía de Prodigia y compras integradas

Pedido del 2026-10-10: ordenar la economía **antes** de cambiar las recompensas (cápsulas
y eventos, `docs/PLAN_CAPSULAS_Y_EVENTOS.md`), y que Prodigia genere ingresos con compras
integradas que funcionen, sin ser *pay to win* y sin que todo sea gratis. El público es
general (cualquier persona que estudia); el plan para colegios es un producto aparte.

---

## 1. Cómo está hoy (medido en el código)

| Qué | Cuánto | Dónde |
|---|---|---|
| Chispas por acierto | **Igual a la Experiencia**: 10 × (1 + 0,15 × (nivel − 1)) × rapidez (1 a 1,5). De **10 a 35** por acierto | `insertar_intento` (0259) → `acreditar_chispas` |
| Una partida de 10 | ~130 típica; **hasta 350** en nivel alto; **hasta 700** con doble experiencia | — |
| Subir de nivel de cuenta | 50 × nivel + 250 (nivel 40 = **2250**) | `recompensa_nivel_cuenta` (0118) |
| Cápsula diaria y de misiones | 20–80 Chispas el 70 % de las veces | `contenido_capsula` (0249) |
| Misiones del día | 40, 50 y 60 | 0249 |
| Calendario de 7 días | 50, 75, hielo, 100, +3 s, 150, 3 estrellas | 0259 |
| Constelación | 300 (+150 si ya tienes la colección; ×1,2 de noche; ×2 en la Gran Alineación) | 0259 |
| Kit del Pionero y Primeros pasos | 1000 y ~1150 | 0258, 0260 |
| Mundo nuevo | 3000 (2 mundos gratis al empezar) | `desbloquear_mundo` (0097) |
| Tienda | consumibles 250–600; cosméticos 1000–6000; paquete de marcos 27 000 | `tienda/costos.ts`, 0248 |
| Pro | US$4,99/mes o US$39,99/año; da **10 000 Chispas al mes**, Clases, sin anuncios, estadísticas, 2 cosméticos | `pagos/productos.ts`, `pro/beneficios.ts` |
| Chispas con dinero | 1000 por US$1,99 … 15 000 por US$14,99 | `pagos/productos.ts` |
| **Cobros reales** | **Apagados** (`PAGOS_REALES_HABILITADOS = false`); Paddle sin precios; Mercado Pago sin conectar; **la app no tiene cobro** | `pagos/flags.ts` |
| Anuncios | **No hay** (Pro promete «sin anuncios», pero no existen) | — |

### Los problemas

1. **Jugar paga demasiado.** Una sola partida buena (300 Chispas) vale más que 4 cápsulas
   diarias, que las 3 misiones juntas o que una constelación. Por eso las recompensas no
   emocionan: comparadas con jugar, son migajas.
2. **Experiencia y Chispas son lo mismo.** Si se baja lo que da jugar en Chispas, se baja
   también el progreso de nivel, y al revés. Hoy no se pueden ajustar por separado.
3. **La inflación crece con el nivel.** Quien juega en nivel 10 gana 3,5 veces más Chispas
   por partida que quien empieza, y el bonus de nivel crece sin tope (50 × nivel + 250).
   Para un jugador avanzado, todo es barato.
4. **Comprar no tiene sentido.** 1000 Chispas por US$1,99 son 3 partidas buenas. Un mundo
   (3000) se gana en un día de juego. Nadie paga por algo que consigue en una tarde.
5. **Pro regala la economía.** 10 000 Chispas al mes compran 3 mundos o media tienda: Pro
   compite contra sus propias compras.
6. **No hay forma de cobrar.** Cobros apagados en la web, sin cobro en la app y sin anuncios:
   hoy el ingreso es cero.

---

## 2. Principios

- **La Experiencia mide cuánto estudias; las Chispas son la moneda.** Se separan.
- **Todo lo que da ventaja en una partida o en un ranking se gana jugando, nunca con
  dinero.** Los consumibles (hielo, +3 s, escudo, boost) solo se compran con Chispas y siguen
  prohibidos en duelos.
- **Con dinero se compra tiempo, contenido y estilo**: mundos antes de tiempo, Clases, cosméticos
  exclusivos, el pase de evento y comodidades (reparar una racha).
- **Las cápsulas se ganan gratis y también se pueden abrir con Cometas, nunca con dinero
  directo** (como los cofres de Clash Royale): probabilidades visibles antes de abrir, garantía
  por nivel, solo cosméticos o comodidades, nada intercambiable y **todo lo que sale también se
  consigue sin azar** (tienda, fragmentos, eventos). Compra de cápsulas desactivada en Bélgica y
  Países Bajos; revisar Brasil (ley de 2025 sobre cajas al azar en juegos para menores). La
  clasificación de la tienda queda para todo público con el aviso «elementos al azar»; Prodigia
  no entra al programa infantil de Google Play.
- **Un jugador gratis constante consigue casi todo**, pero tarda; quien paga llega antes o
  luce distinto.
- **La base decide todos los números** (regla del proyecto); una tabla única de precios.

---

## 3. Dos monedas

| | **Chispas** (moneda blanda) | **Cometas** (moneda premium; decidido el 2026-10-10) |
|---|---|---|
| Cómo se gana | Jugando, misiones, cápsulas, constelaciones, retos, eventos | **Comprándolas**; y pocas gratis: logros, ligas, hitos de racha, eventos |
| Para qué sirve | Mundos, consumibles, cosméticos comunes a épicos, fusión de cápsulas, tienda de eventos | Cosméticos legendarios y de temporada, mundos al instante, reparar racha, pase de evento |
| Se convierte | No | 1 Cometa → 10 Chispas (un solo sentido) |

---

## 4. Números nuevos

### 4.1 Lo que se gana (jugador gratis que hace ~5 partidas al día)

| Fuente | Ahora | Propuesta |
|---|---|---|
| Partida terminada | ~130 (hasta 700) | **10 + 1 por acierto** → 12–20. Doble experiencia: las Chispas también ×2 |
| Tope diario | Ninguno | Después de 10 partidas al día, la mitad (la Experiencia sigue completa) |
| Experiencia | = Chispas | **Sin cambios**: sigue la fórmula de hoy (niveles, ligas y meta diaria intactos) |
| Subir de nivel | 50 × nivel + 250 | **100 Chispas fijas**; cada 10 niveles, **25 Cometas** |
| Misiones del día | 40 / 50 / 60 | 20 / 25 / 30; las 3 → cápsula de bronce |
| Cápsula bronce (antes diaria) | 20–80 | 15–40 Chispas o un consumible |
| Calendario de 7 días | 50 … 150 | 20, 30, hielo, 40, +3 s, 60, **10 Cometas** + estrellas |
| Constelación | 300 | **120 Chispas** + pieza (o 60 más si la colección está completa) |
| Reto diario / semanal | hasta 100 / 450 | hasta 40 / 150 |
| Liga semanal | cápsulas | igual, y **Oro: 30 Cometas**, Plata: 15, Bronce: 5 |
| Logros | — | 10–50 Cometas según dificultad |
| **Total aproximado** | 1000–2500 al día | **~170 Chispas al día ≈ 5000 al mes, más ~60 Cometas al mes** |

### 4.2 Lo que cuesta

| Qué | Ahora | Propuesta | Jugador gratis tarda |
|---|---|---|---|
| Mundo nuevo | 3000 | **2500 Chispas** o **300 Cometas** | ~2 semanas |
| Hielo / +3 s | 300 / 250 | 60 / 50 | 2–3 partidas |
| Escudo / boost | 350 / 600 | 120 / 150 | ~1 día |
| Cosmético común | 1000–1200 | 400 | 2–3 días |
| Cosmético raro | 1300–2200 | 1200 | ~1 semana |
| Cosmético épico | 2400–6000 | 3000 | ~3 semanas |
| Cosmético legendario | — | **solo Cometas (600)**, cápsulas oro/prisma o eventos | — |
| Fusionar 3 cápsulas | — | 50 Chispas (bronce → plata) · 150 (plata → oro) · 400 (oro → prisma) | — |
| Reparar una racha perdida | — | 50 Cometas (1 vez por semana) | — |

### 4.3 Lo que se vende con dinero (precios en US$; con precio regional en Latinoamérica)

| Producto | Precio | Notas |
|---|---|---|
| **Pro mensual** | US$4,99 | Ver §5 |
| **Pro anual** | US$39,99 | ~33 % de descuento |
| Cometas | 100 por 0,99 · 550 por 4,99 · 1200 por 9,99 · 2600 por 19,99 · 7000 por 49,99 | Más volumen, más bonus |
| **Paquete de inicio** (una vez) | US$2,99 | 1 mundo + 200 Cometas + marco exclusivo: el primer pago tiene que sentirse regalado |
| Mundo suelto | US$2,99 | O 300 Cometas |
| **Pase de evento** (opcional) | US$4,99 por evento | Carril gratis para todos; carril premium solo con cosméticos (ver §7) |
| Paquetes de cosméticos | US$1,99–6,99 | Temáticos por ciudad o temporada, siempre visibles antes de pagar |

---

## 5. Pro, rediseñado

Hoy Pro regala 10 000 Chispas y por eso se canibaliza. Propuesta:

- **Todos los mundos abiertos** mientras dure la suscripción (lo que compraste con Chispas se queda).
- **Todas las Clases** (hoy ya es de Pro: se mantiene, la primera de cada mundo gratis).
- **Sin anuncios.**
- **+25 % de Chispas** al jugar (la Experiencia no cambia: no da ventaja en ligas).
- **300 Cometas al mes.**
- **Carril premium del pase de evento incluido.**
- Estadísticas avanzadas y cosméticos de Pro (como hoy).
- **Prueba gratis de 7 días.**

---

## 6. Anuncios (solo cuentas gratis)

- **Con premio, siempre opcionales**: ver un anuncio para duplicar la cápsula del día, recuperar
  la racha una vez por mes o sumar un tiro extra en un evento. Es lo que más rinde y no
  molesta, porque lo elige la persona.
- **Intersticial suave**: uno cada 3 partidas, nunca durante una partida ni en una lección.
- **Nada** en duelos, diagnóstico ni lecciones.
- App: AdMob. Web: AdSense en pantallas de menú. Pro los quita todos.

---

## 7. Pase de evento (cambia una decisión anterior)

En 0249 se decidió «recompensas que hacen volver, **sin pase de batalla**». Con este plan
propongo un pase **solo cosmético** por evento (Halloween, Navidad, findes temáticos):

- 20 escalones que se suben jugando (Experiencia del evento).
- **Carril gratis**: Chispas, consumibles, 1 cosmético raro y cápsulas.
- **Carril premium** (US$4,99 o incluido en Pro): cosméticos épicos y legendarios del
  evento, Cometas de vuelta (~40 % del precio) y un marco animado.
- Nada del carril premium da ventaja en partidas, duelos ni ligas.

---

## 8. Cómo cobrar de verdad

| Dónde | Cómo | Estado |
|---|---|---|
| App en Google Play | **Google Play Billing** (es obligatorio para bienes digitales en Play). Recomiendo **RevenueCat** para manejarlo y unificar las compras de web y app | No existe |
| Web | Paddle (internacional) y Mercado Pago (Latinoamérica), ya programados | Apagados: faltan los precios en Paddle y conectar Mercado Pago |
| Base | `acreditar_chispas_compradas` ya existe; se suma `acreditar_Cometas` con el mismo cuidado (idempotente por id de pago) | Parcial |

Comisiones aproximadas: Google Play 15 %, Paddle ~5 % + US$0,50, Mercado Pago ~4–6 %.

---

## 9. Qué pasa con las Chispas que ya tiene la gente

Si se baja lo que da jugar, los saldos actuales quedan inflados. Opciones:

1. **Recomendada:** convertir los saldos a la escala nueva (dividir entre 6, que es la
   relación entre lo que daba una partida antes y lo que da ahora) y dar a cada cuenta
   existente el marco «Pionero de la economía» y 100 Cometas de regalo.
2. No tocar los saldos: quien juega desde antes queda con ventaja de compra por meses.

Lo ya comprado (mundos, cosméticos) no se toca nunca.

---

## 10. Cómo se cuida que la economía no se rompa otra vez

- **Una tabla `economia_precios` en la base** con cada precio y cada premio, y un espejo en
  TypeScript para la UI, con una prueba que exige que coincidan.
- **Simulador en las pruebas**: simula 90 días de un jugador gratis (5 partidas al día), uno
  intenso (15 al día) y uno que paga Pro, y exige:
  - el gratis consigue su 3.er mundo entre el día 10 y el 20;
  - el intenso no supera 2× al gratis (el tope diario funciona);
  - ninguna recompensa diaria vale menos que una partida, ni más que 10;
  - con Pro, un mundo no se compra solo con lo que da Pro en Chispas.
- **Panel de economía para ti**: Chispas y Cometas creadas y gastadas por día, compras y
  conversión a Pro.

---

## 11. Orden de trabajo

| Fase | Qué |
|---|---|
| **1. Separar Experiencia y Chispas** | `insertar_intento` y `acreditar_chispas` dejan de sumar Chispas por Experiencia; nueva fórmula por partida con tope diario; nuevos premios de nivel, misiones, calendario, constelaciones y retos; precios nuevos; conversión de saldos; tabla `economia_precios`; simulador. Web y app a la vez |
| **2. Cometas** | Columna y movimientos en la base, tienda con las dos monedas, Cometas gratis (logros, ligas, niveles) |
| **3. Cobros reales** | RevenueCat + Google Play Billing en la app; Paddle y Mercado Pago encendidos en la web; productos de §4.3; paquete de inicio |
| **4. Pro nuevo** | Beneficios de §5 y prueba gratis de 7 días |
| **5. Anuncios** | AdMob con premio en la app; AdSense en la web; nunca para Pro |
| **6. Cápsulas por niveles** | `PLAN_CAPSULAS_Y_EVENTOS.md` §2, con los números de este plan |
| **7. Eventos y pase** | `PLAN_CAPSULAS_Y_EVENTOS.md` §3 y el pase de §7; Halloween primero |

---

## 12. Decisiones que te tocan

1. **Decidido:** dos monedas, Chispas y **Cometas**; las cápsulas también se abren con Cometas.
2. Saldos actuales: ¿convertir dividiendo entre 6 con regalo (recomendado) o dejarlos?
3. ¿Pase de evento con carril premium cosmético? (Cambia la decisión de 0249.)
4. Anuncios: ¿con premio más un intersticial cada 3 partidas (recomendado), o solo con premio?
5. ¿Precio regional (más barato en Latinoamérica)? Recomendado.
6. ¿Pro con todos los mundos abiertos? Recomendado: es lo que más vende la suscripción.
