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
  exclusivos, el paquete del evento y comodidades (reparar una racha). **Sin pase de batalla**
  (decidido el 2026-10-10, ver §7).
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
| Para qué sirve | Mundos, consumibles, cosméticos comunes a épicos, fusión de cápsulas, tienda de eventos | Cosméticos legendarios y de temporada, mundos al instante, reparar racha, paquete del evento |
| Se convierte | No | 1 Cometa → 10 Chispas (un solo sentido) |

---

## 4. Números nuevos

> **Hecho el 2026-10-13 (0279 y 0280), web y app.** Cambios respecto de lo de abajo, decididos
> ese día: **sin tope diario** de Chispas y **sin convertir los saldos** (§9). La partida paga
> 1 Chispa por respuesta (hasta 10) + 1 por acierto (hasta 20), ×2 en doble experiencia y ×1,5
> con boost. Los logros dan Cometas solo si la base puede comprobarlos (racha, problemas,
> nivel de mundo, duelos, ELO, retos, técnicas), porque cualquiera puede insertar un logro desde
> su sesión. Liga: Oro = top 3, Plata = top 10, Bronce = top 50 de la semana. Pendiente: fusión
> de cápsulas y reparar racha con Cometas, Pro nuevo (§5) y la tabla `economia_precios` (§10).

### 4.1 Lo que se gana (jugador gratis que hace ~5 partidas al día)

| Fuente | Ahora | Propuesta |
|---|---|---|
| Partida terminada | ~130 (hasta 700) | **10 + 1 por acierto** → 12–20. Doble experiencia: las Chispas también ×2 |
| Tope diario | Ninguno | ~~Después de 10 partidas al día, la mitad~~ **Descartado el 2026-10-13: sin tope** |
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

### 4.3 Lo que se vende con dinero (precios en US$; con precio regional, decidido el 2026-10-10)

| Producto | Precio | Notas |
|---|---|---|
| **Pro mensual** | US$4,99 | Ver §5 |
| **Pro anual** | US$39,99 | ~33 % de descuento |
| Cometas | 100 por 0,99 · 550 por 4,99 · 1200 por 9,99 · 2600 por 19,99 · 7000 por 49,99 | Más volumen, más bonus |
| **Paquete de inicio** (una vez) | US$2,99 | 1 mundo + 200 Cometas + marco exclusivo: el primer pago tiene que sentirse regalado |
| Mundo suelto | US$2,99 | O 300 Cometas |
| **Paquete del evento** (opcional) | US$2,99–4,99 por evento | Las piezas del evento de una vez, más la versión animada del marco (ver §7) |
| Paquetes de cosméticos | US$1,99–6,99 | Temáticos por ciudad o temporada, siempre visibles antes de pagar |

**Precio regional (decidido).** Se fija por país en Google Play y en Paddle, no con un
descuento a mano: Google Play sugiere el precio local a partir del de EE. UU. y se ajusta en
Latinoamérica a ~40–60 % (p. ej. Pro mensual ≈ US$1,99–2,99 en Argentina, Colombia o
Perú; ≈ US$2,99 en México y Brasil). Mercado Pago cobra en moneda local con la misma tabla.
Las Cometas siguen la misma tabla, así que 550 Cometas cuestan lo mismo en esfuerzo en todos
lados.

---

## 5. Pro, rediseñado

Hoy Pro regala 10 000 Chispas y por eso se canibaliza. Propuesta (decidida el 2026-10-10):

- **Todos los mundos abiertos** mientras dure la suscripción (lo que compraste con Chispas se queda).
  **Hecho** en web y app (`tieneMundo` en `src/lib/mundos/precios.ts`; la app ya lo hacía).
- **Todas las Clases** (hoy ya es de Pro: se mantiene, la primera de cada mundo gratis).
- **Sin anuncios.**
- **+25 % de Chispas** al jugar (la Experiencia no cambia: no da ventaja en ligas). **Hecho el 2026-10-14 (0286)**: y Pro deja de dar 10 000 Chispas por pago.
- **300 Cometas al mes.** **Hecho (0283).**
- **El regalo de cada evento**: la pieza Pro de la colección del evento, sin gastar (ver §7).
- Estadísticas avanzadas y cosméticos de Pro (como hoy).
- **Prueba gratis de 7 días.**

### 5.1 Cuando Pro termina (hecho, 0276)

Pedido: «cuando se acabe la suscripción se deben apagar y debe aparecer un letrero».

- Pro vence solo: cuenta si la suscripción está activa **y** su período no terminó hace más
  de 2 días (margen para la renovación). Antes solo bajaba si llegaba el aviso del proveedor.
- Se revisa al entrar (la web en cada página si eres Pro; la app al cargar tu perfil) y,
  con pg_cron activo, cada hora para todas las cuentas (`vencer_pro_vencidos`).
- Se apaga lo que da Pro: mundos no comprados con candado otra vez, Clases después de la
  primera, estadísticas y partidas sin anuncios. Lo comprado con Chispas y el progreso quedan.
- Aparece una vez «Tu Pro terminó», con la lista de lo que se apagó y «Renovar Pro».
- Pro dado a mano (sin suscripción, p. ej. cuentas de prueba) no vence.

---

## 6. Anuncios (solo cuentas gratis) — decidido y programado el 2026-10-10

- **Con premio, siempre opcionales** (en Recompensas, uno por día cada uno):
  - duplicar el premio del calendario que reclamaste hoy;
  - una cápsula extra.
  Pro recibe los dos sin anuncio. La base pone el tope (`premio_por_anuncio`, 0277).
  Más adelante: recuperar la racha una vez por mes y un tiro extra en eventos.
- **Entre partidas**: uno cada 3 partidas de práctica, al salir del resultado (app) o al
  pedir otra partida (web). Si no hay uno listo, no se espera.
- **Nada** en duelos, diagnóstico ni lecciones. Ni Pro, ni colegio, ni invitados.
- App: AdMob (`react-native-google-mobile-ads`, `mobile/src/lib/publicidad.ts`), con el
  formulario de consentimiento de Google donde la ley lo pide y contenido apto para
  adolescentes (`T`). Web: AdSense con la Ad Placement API (`src/lib/publicidad/web.ts`);
  no carga dentro de la app nativa.

**Para encenderlos de verdad** (hoy usan los anuncios de prueba de Google):
1. Crear la cuenta de AdMob, la app y dos bloques (con premio y entre partidas). Poner el
   App ID en `mobile/app.json` (plugin `react-native-google-mobile-ads`) y los bloques en
   `EXPO_PUBLIC_ADMOB_RECOMPENSA` y `EXPO_PUBLIC_ADMOB_ENTRE_PARTIDAS`; recompilar.
2. En Play Console: declarar que la app tiene anuncios y usa el ID de publicidad.
3. Web: cuenta de AdSense aprobada para el dominio y `NEXT_PUBLIC_ADSENSE_CLIENT=ca-pub-…`.
4. Cuando haya tráfico real, sumar la verificación del lado del servidor de AdMob (SSV).

---

## 7. Eventos sin pase de batalla (decidido el 2026-10-10)

No va pase de batalla (sigue la decisión de 0249). En su lugar, **colección del evento**:

- Cada evento (Halloween, Navidad, findes temáticos) trae una colección de ~8 piezas:
  marco, fondo, estela, efecto, emote, título y un marco animado.
- **Jugando**: las misiones del evento dan **Fichas del evento**, y con ellas **eliges** qué
  pieza llevarte en la tienda del evento. No hay escalones en orden ni progreso que se pierde:
  si te faltó una pieza, la compras con Fichas o Cometas.
- **Pagando** (opcional): cada pieza con Cometas, o el **paquete del evento** (US$2,99–4,99)
  con todas las piezas y la versión animada del marco.
- **Pro**: la pieza Pro de cada colección de regalo.
- Las colecciones vuelven en la edición del año siguiente, así que no hay apuro por perder
  algo para siempre.
- Nada de la colección da ventaja en partidas, duelos ni ligas.

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

**Cambiado el 2026-10-13: los saldos NO se convierten** («no conviertas los saldos»). Lo de
abajo queda como historia.

~~Decidido (2026-10-10):~~ convertir los saldos a la escala nueva (dividir entre 6, que es la
relación entre lo que daba una partida antes y lo que da ahora) y dar a cada cuenta existente
el marco «Pionero de la economía» y 100 Cometas de regalo. Se hace en la Fase 1, junto con
los precios nuevos, y con un aviso que lo explica.

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
| **1. Separar Experiencia y Chispas** — hecho (0280, sin conversión ni tope) | `insertar_intento` y `acreditar_chispas` dejan de sumar Chispas por Experiencia; nueva fórmula por partida con tope diario; nuevos premios de nivel, misiones, calendario, constelaciones y retos; precios nuevos; conversión de saldos; tabla `economia_precios`; simulador. Web y app a la vez |
| **2. Cometas** — hecho (0279 y 0280) | Columna y movimientos en la base, tienda con las dos monedas, Cometas gratis (logros, ligas, niveles) |
| **3. Cobros reales** | RevenueCat + Google Play Billing en la app; Paddle y Mercado Pago encendidos en la web; productos de §4.3; paquete de inicio |
| **4. Pro nuevo** | Beneficios de §5 y prueba gratis de 7 días. Ya hecho: todos los mundos y el apagado con aviso (§5.1) |
| **5. Anuncios** | **Programado** (§6); falta crear las cuentas y poner los IDs reales |
| **6. Cápsulas por niveles** | `PLAN_CAPSULAS_Y_EVENTOS.md` §2, con los números de este plan |
| **7. Eventos** | `PLAN_CAPSULAS_Y_EVENTOS.md` §3 y la colección del evento de §7; Halloween primero |

---

## 12. Decisiones (todas tomadas el 2026-10-10)

1. Dos monedas, Chispas y **Cometas**; las cápsulas también se abren con Cometas.
2. Saldos: se convierten dividiendo entre 6, con regalo (§9).
3. Sin pase de batalla: colección del evento (§7).
4. Anuncios con premio más uno entre partidas cada 3: programado (§6).
5. Precio regional: sí (§4.3).
6. Pro con todos los mundos, y se apaga con aviso al terminar: hecho (§5 y §5.1).
