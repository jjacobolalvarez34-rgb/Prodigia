# Plan: pack de inicio (solo plan, sin construir)

2026-10-30. Sigue `PLAN_ECONOMIA.md` §2 y §4.3 («Paquete de inicio, una vez, US$2,99: 1 mundo
+ 200 Cometas + marco exclusivo; el primer pago tiene que sentirse regalado»). Prodigia no es
una app infantil: se vende a jugadores de todas las edades, sin trucos de urgencia falsa y
**sin nada que dé ventaja en partidas o rankings**.

## 1. Qué trae

| Pieza | Por qué |
|---|---|
| **1 mundo a elección** (de los que el jugador no tiene) | Contenido, no ventaja. Solo, valdría US$2,99 o 300 Cometas |
| **200 Cometas** | Le hace probar la moneda premium (alcanza para un cosmético legendario a medias o 4 reparaciones de racha) |
| **Marco «Primeros pasos»** (exclusivo, no sale en cápsulas ni en la tienda) | Estilo: se nota quién apoyó el juego desde el principio |
| **1 cápsula estelar** (la de 120 Cometas, probabilidades visibles) | Momento de abrir algo; solo cosméticos |

Valor de referencia: US$2,99 (mundo) + ~US$1,99 (Cometas) + ~US$1,20 (cápsula) + marco ≈
US$6–7. **Nada de consumibles** (hielo, +3 s, escudo, boost): esos se ganan jugando.

## 2. Precio

**US$2,99, una sola vez por cuenta**, con el precio regional de la tabla de §4.3 (en
Latinoamérica ~US$1,49–1,99). Es el mismo precio que el mundo suelto: el pack es «el mundo y
todo lo demás de regalo».

## 3. Cuándo se ofrece y por cuánto tiempo

- **Aparece** cuando el jugador ya demostró que le gusta: **nivel de cuenta 5** o **3 días
  distintos jugados**, lo que llegue primero. Nunca a invitados ni en la primera sesión.
- **Dura 7 días** desde que aparece, con la fecha de fin a la vista (fecha real, no un reloj
  que se reinicia). Pasados los 7 días desaparece **para siempre** (no vuelve a «última
  oportunidad»).
- No se ofrece a quien ya es Pro ni a quien ya hizo cualquier compra con dinero (el pack es
  para el primer pago).
- Una sola vez por cuenta (si se compra, no se vuelve a mostrar).

## 4. Cómo se muestra

- **Tarjeta en la Tienda** (arriba, primera posición) y **una sola vez** como aviso en el
  Inicio el día que aparece (se puede cerrar y no insiste). Sin ventanas emergentes al abrir
  una partida ni al perder.
- Lista clara de lo que trae, el precio local y «Termina el 6 de noviembre».
- El mundo se elige **después** de pagar (pantalla de elección, como `elegir-mundos`), para
  que no haya dudas en el checkout.
- Paridad: la misma tarjeta en web (`/tienda`) y app (`tienda.tsx`). En la app se cobra en la
  web (Paddle) hasta que llegue Google Play Billing, igual que Pro y las Cometas hoy.

## 5. Qué hace falta en Paddle

- Un producto «Pack de inicio» con un **precio único (one-time) de US$2,99** y precios por
  país (los mismos ajustes regionales que Pro y Cometas).
- La variable `PADDLE_PRICE_PACK_INICIO` y la entrada `pack_inicio` en
  `src/lib/pagos/productos.ts` (tipo nuevo `pack_inicio`) y en el mapa de `paddle.ts`.
- El webhook (`transaction.completed`) llama a la función de la base de abajo con el id de la
  transacción (idempotente).
- Mientras `PAGOS_REALES_HABILITADOS = false` la tarjeta no se muestra.

## 6. Qué hace falta en la base (migración nueva)

- `profiles.pack_inicio_desde timestamptz` (cuándo se le ofreció) y
  `profiles.pack_inicio_comprado timestamptz`.
- `oferta_pack_inicio()` (authenticated): decide si se muestra y hasta cuándo; si cumple las
  condiciones de §3 y todavía no tiene fecha, la fija ahora. El cliente nunca calcula la
  ventana.
- `otorgar_pack_inicio(p_user, p_transaccion)` (solo service_role, idempotente por
  transacción): 200 Cometas, la cápsula estelar en el inventario de cápsulas, el marco en
  cosméticos y un **crédito de 1 mundo** (`creditos_mundo`), que se gasta con
  `elegir_mundo_pack(p_mundo)` desde la pantalla de elección.
- El marco «Primeros pasos» en `catalogo_cosmeticos` con `exclusivo = true` (fuera de
  cápsulas y tienda).
- Los números (precio, Cometas, nivel, días) en `economia_precios` (§10 de PLAN_ECONOMIA).

## 7. Qué no se hace

Sin contadores que se reinician, sin «solo hoy» falso, sin precio tachado inventado, sin
ofrecerlo después de perder una partida, sin consumibles ni nada que suba ELO, Experiencia
o puestos.
