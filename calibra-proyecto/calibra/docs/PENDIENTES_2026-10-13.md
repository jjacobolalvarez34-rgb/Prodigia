# Pendientes pedidos el 2026-10-13 (tarde)

Lista completa para no perder nada. Se marca cada punto al terminarlo.

1. [~] **Duelo casual leído como reto** (web + app): el que espera recibía el aviso de «te retaron»,
   lo aceptaba y se trababa. Arreglado en 87f8a9f: la búsqueda encuentra el duelo sin depender del
   reloj del dispositivo y el aviso no sale mientras buscas. **Falta probarlo con dos dispositivos**
   (no se puede desde el entorno de desarrollo). La app necesita APK nuevo.
2. [x] **«Olvidé mi contraseña».** Código: ruta nueva `/auth/confirmar` (token_hash, sirve desde
   cualquier dispositivo) y la app ya manda a dónde volver. **Falta configurar Supabase** (abajo).
3. [x] **Compra de Pro no dio Pro.** Lo más probable: claves de precios cruzadas en Vercel (Pro
   apuntando a un pago único). Diagnóstico nuevo: `/api/pagos/estado?precios=1`. **Pasos abajo.**
4. [x] **Bienvenida a Pro** (web): `/pro/bienvenida` espera a que el webhook active Pro, cinemática
   (el logo cruza el espacio, recibe poderes y explota en «PRODIGIA PRO»), lista de todo lo nuevo y
   aviso del contador en la sección Pro. Al pagar, el checkout lleva ahí.
5. [x] **Cápsulas Pro:** 0283, cápsula «pro» (55 % épico, 30 % legendario, 15 % 150–300 Chispas),
   2 por semana mientras dure Pro. Web y app.
6. [~] **Cometas a la venta:** el código ya los vende; **faltan los productos en Paddle** (abajo).
7. [x] **Google en la web:** botón «Continuar con Google» en iniciar sesión y en registro (si eras
   invitado, se suma a tu cuenta). **Falta activar Google en Supabase** si no estaba (abajo).
8. [x] **Contraseña de respaldo** para cuentas de Google: tarjeta en Ajustes, web y app.
9. [x] Tienda nueva A + C (maqueta aprobada en docs/rediseno/tienda.html): construir.
10. [x] Compilar APK nuevo con todo esto (avisar antes).

Migraciones: el 14/10 se aplicaron hasta la 0284. Falta repetir 0281 y 0283 (versión nueva) y correr 0285 y 0286.

---

## Lo que hay que hacer en los paneles

### Supabase · Auth → URL Configuration
- **Site URL:** `https://prodigia-sandy.vercel.app` (con https://).
- **Redirect URLs:** agregar `https://prodigia-sandy.vercel.app/**` y `prodigia://**` (la app).

### Supabase · Auth → Emails → Templates → «Reset Password»
Cambiar el enlace del botón por este (funciona en cualquier dispositivo):

```
{{ .SiteURL }}/auth/confirmar?token_hash={{ .TokenHash }}&type=recovery&next=/auth/actualizar-password
```

Opcional, en «Confirm signup»:
`{{ .SiteURL }}/auth/confirmar?token_hash={{ .TokenHash }}&type=email&next=/`

### El correo de Supabase sin proveedor propio
El servidor de correo incluido en Supabase **solo manda a los correos del equipo del proyecto**
(Organization → Team) y unos pocos por hora. Para probar: agregar al equipo los correos de quienes
prueban. Para abrirlo a todos sin pagar: Auth → SMTP Settings con una cuenta gratis (Brevo da 300
correos al día gratis; Resend, 100). Se cargan host, puerto, usuario y clave que te dan ellos.

### Supabase · Auth → Providers → Google
Activarlo con el Client ID y Client Secret de Google Cloud (OAuth, tipo «Web application», con
`https://<tu-proyecto>.supabase.co/auth/v1/callback` como Authorized redirect URI). Si ya funciona
en la app, ya está activado. Para que un invitado sume Google sin perder lo jugado: Auth → Sign In /
Providers → «Allow manual linking» encendido.

### Paddle · claves de precios (Vercel → Settings → Environment Variables, Production)
Deben quedar así (son las de `.env.local`, ya corregidas):

| Variable | price_id |
|---|---|
| PADDLE_PRICE_PRO_MENSUAL | pri_01m3ch1dzfah2wfzevz18zr557 |
| PADDLE_PRICE_PRO_ANUAL | pri_01m4s8rb51k5wwfkxhnwnh8cwp |
| PADDLE_PRICE_CHISPAS_1000 | pri_01m4s8vp2k4hkpmmcyzb0q0y7q |
| PADDLE_PRICE_CHISPAS_2500 | pri_01m4s8we8vf6wzm834tew3j09b |
| PADDLE_PRICE_CHISPAS_6000 | pri_01m4s8x16s0grwfy4pct6n4354 |
| PADDLE_PRICE_CHISPAS_15000 | pri_01m4s8xprc6jwh4jh4y9wdz2fj |

Después de cambiarlas: Redeploy y abrir `https://prodigia-sandy.vercel.app/api/pagos/estado?precios=1`.
Cada producto tiene que decir `"ok": true`; si no, dice qué está mal (pago único vs suscripción,
precio distinto, etc.).

### Paddle · webhook (por qué Pro no llega)
Developer Tools → Notifications → destino `https://prodigia-sandy.vercel.app/api/webhooks/paddle`,
con los eventos `transaction.completed`, `subscription.created`, `subscription.updated` y
`subscription.canceled`. Su «secret key» tiene que ser igual a `PADDLE_WEBHOOK_SECRET` en Vercel.
En el mismo lugar, «Logs» muestra si cada aviso respondió 200 (bien), 401 (secret distinto) o 500.

### Paddle · Cometas (5 productos de pago único)
Catalog → Products → New product «Cometas» (tipo: Standard digital goods). Dentro, 5 precios
**One-time**, en USD:

| Precio | Variable en Vercel |
|---|---|
| 100 Cometas · 0,99 | PADDLE_PRICE_COMETAS_100 |
| 550 Cometas · 4,99 | PADDLE_PRICE_COMETAS_550 |
| 1200 Cometas · 9,99 | PADDLE_PRICE_COMETAS_1200 |
| 2600 Cometas · 19,99 | PADDLE_PRICE_COMETAS_2600 |
| 7000 Cometas · 49,99 | PADDLE_PRICE_COMETAS_7000 |

Copiar cada `pri_…` a su variable, Redeploy y revisar con `?precios=1`. Los paquetes aparecen solos
en la tienda en cuanto su variable existe.

---

## Pedidos del 2026-10-14

11. [x] **Tabla completa de claves** (todas las variables, también las que todavía no existen) y cómo
    cargarlas en Vercel y en la app.
12. [x] **Recuperar contraseña con preguntas** en vez del correo: ¿entraste con Google?, ¿cuáles fueron
    tus dos primeros mundos? (elegir), ¿cuál es tu correo y nombre de usuario? (opciones con la
    correcta). Si acierta, cambia la contraseña. 3 intentos; al tercero la cuenta se bloquea y hay
    que escribirnos por correo.
13. [x] **¿Dónde se ve la bienvenida de Pro?** Darle una forma de verla, y exportar la cinemática como
    video para mirarla.
14. [x] **Pro da más:** las cápsulas Pro no aparecen en la lista de beneficios; Pro también da Cometas
    gratis.
15. [x] **No se ve la venta de Cometas en la tienda** (solo el canje por Chispas).
16. [x] **Revisión general de web y app** (paridad y todo): pasar el informe primero y después arreglar.
17. [x] **Compilar el APK** mientras tanto (pedido explícito).
18. [x] **Motion para redes:** tutorial de cómo se personaliza el perfil y todo lo que se puede
    cambiar. Envolvente y bien hecho.
19. [x] **La animación de abrir cápsula no se ve en la web.**
20. [x] **Mejorar la animación de constelación completa** (más gráfica).
21. [x] **Cambio de idioma roto en la web:** al tocar «es» se agrega /es a la URL pero no cambia el
    idioma; al tocarlo otra vez queda /es/es y da 404. Revisar también la app.
22. [x] **Constelación en medio de una serie ranked:** la animación salta de una e interrumpe el
    cambio de ciudad entre la ronda 2 y 3. Que no aparezca en medio de una serie (mostrarla al final).
23. [x] **Atrás en medio de una ronda de la serie:** no pregunta si quieres salir; vuelve al resumen
    de la ronda anterior y otro atrás saca de la página. El rival no se entera de que te fuiste.
24. [x] **Reconexión a duelos:** si sales de la app en un duelo y vuelves al instante, no te vuelve a
    meter al duelo. Debería haber reconexión.

---

## Tabla completa de claves (2026-10-14)

### Web · Vercel → Settings → Environment Variables (entorno **Production**)
Para cada fila: **Add New** → **Key** = la variable, **Value** = el valor, Environment = Production
(y Preview si quieres). Las marcadas «secreta» van con **Sensitive** encendido; las `NEXT_PUBLIC_…`
nunca son secretas (se ven en el navegador). Al terminar: **Deployments → Redeploy**.

| Variable | Valor | ¿Secreta? | Estado |
|---|---|---|---|
| NEXT_PUBLIC_SUPABASE_URL | Supabase → Settings → API → Project URL | No | Ya existe |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | Supabase → Settings → API → anon public | No | Ya existe |
| SUPABASE_SERVICE_ROLE_KEY | Supabase → Settings → API → service_role | **Sí** | Ya existe (la usan pagos, recuperar contraseña y reto del finde) |
| PADDLE_API_KEY | Paddle → Developer tools → Authentication → API key (`pdl_sdbx_…`) | **Sí** | Ya existe |
| PADDLE_WEBHOOK_SECRET | Paddle → Developer tools → Notifications → tu destino → Secret key | **Sí** | Ya existe |
| NEXT_PUBLIC_PADDLE_CLIENT_TOKEN | Paddle → Developer tools → Authentication → Client-side token (`test_…`) | No | Ya existe |
| NEXT_PUBLIC_PAGOS_HABILITADOS | `1` | No | Ya existe |
| PADDLE_PRICE_PRO_MENSUAL | `pri_01m3ch1dzfah2wfzevz18zr557` | No | Revisar que tenga este valor |
| PADDLE_PRICE_PRO_ANUAL | `pri_01m4s8rb51k5wwfkxhnwnh8cwp` | No | Revisar |
| PADDLE_PRICE_CHISPAS_1000 | `pri_01m4s8vp2k4hkpmmcyzb0q0y7q` | No | Revisar |
| PADDLE_PRICE_CHISPAS_2500 | `pri_01m4s8we8vf6wzm834tew3j09b` | No | Revisar |
| PADDLE_PRICE_CHISPAS_6000 | `pri_01m4s8x16s0grwfy4pct6n4354` | No | Revisar |
| PADDLE_PRICE_CHISPAS_15000 | `pri_01m4s8xprc6jwh4jh4y9wdz2fj` | No | Revisar |
| PADDLE_PRICE_COMETAS_100 | el `pri_…` del precio «100 Cometas · 0,99» | No | **Nueva** (crear en Paddle) |
| PADDLE_PRICE_COMETAS_550 | el `pri_…` de «550 Cometas · 4,99» | No | **Nueva** |
| PADDLE_PRICE_COMETAS_1200 | el `pri_…` de «1200 Cometas · 9,99» | No | **Nueva** |
| PADDLE_PRICE_COMETAS_2600 | el `pri_…` de «2600 Cometas · 19,99» | No | **Nueva** |
| PADDLE_PRICE_COMETAS_7000 | el `pri_…` de «7000 Cometas · 49,99» | No | **Nueva** |
| PADDLE_PRODUCT_CONTENIDO | el `pro_…` de un producto «Contenido de Prodigia» (Catalog → Products → New product, **sin precio**; tax category Standard). Sirve para el mundo suelto (US$2,99) y los paquetes de cosméticos con dinero: el precio lo pone la web en cada compra | No | **Nueva (0287)** |
| DIAGNOSTICO_CLAVE | una palabra larga que inventes (ej. 20 letras al azar) | **Sí** | **Nueva** (para `/api/pagos/estado?precios=1&clave=…`) |
| NEXT_PUBLIC_ADSENSE_CLIENT | `ca-pub-5931991300168591` | No | Cuando AdSense apruebe el sitio |
| NEXT_PUBLIC_SITE_URL | `https://prodigia-sandy.vercel.app` | No | Opcional |

### App · archivo `mobile/.env.local` (se lee al compilar; después de cambiarlo hay que recompilar el APK)
| Variable | Valor | Estado |
|---|---|---|
| EXPO_PUBLIC_SUPABASE_URL | la misma Project URL | Ya existe |
| EXPO_PUBLIC_SUPABASE_ANON_KEY | la misma anon public | Ya existe |
| EXPO_PUBLIC_ADMOB_RECOMPENSA | `ca-app-pub-5931991300168591/2058822089` | Opcional: ya está escrito en el código |
| EXPO_PUBLIC_ADMOB_ENTRE_PARTIDAS | `ca-app-pub-5931991300168591/3131310734` | Opcional: ya está escrito en el código |

### Comprobar
Después del Redeploy abre
`https://prodigia-sandy.vercel.app/api/pagos/estado?precios=1&clave=<tu DIAGNOSTICO_CLAVE>`.
Cada producto tiene que decir `"ok": true`; si no, dice qué está mal (por ejemplo «es un pago único y
debería ser una suscripción»).

25. [x] Pro: quitar las 10 000 Chispas por pago y dar +25 % de Chispas al jugar (decidido 14/10).
26. [x] Construir la tienda A + C (web y app) y después compilar el APK.
27. [x] Perfil: que todo lo que se tiene se pueda poner desde la personalización de la Placa (web y app). Ej.: no deja poner el fondo de ciudad.

## Pedidos del 2026-10-14 (noche)

28. [x] ¿Dónde se compran las Cometas en la web? Hacerlo visible (la portada de la tienda no tenía acceso).
29. [x] Lista de lo que quedó planeado y no se hizo.
30. [x] Web: que la parte de compras extra y paquetes se vea mejor; paquetes con imágenes propias (no emojis).
31. [x] App: que no haya emojis sueltos en la interfaz.
32. [x] Pagos con aspecto profesional (tarjetas de planes como el componente de referencia), sin tener que bajar tanto. Web y app.
33. [x] Al pagar en Paddle: el overlay queda en «pago hecho» y hay que tocar la flecha; no salió la cinemática ni el «ya eres Pro», hubo que recargar. Que se cierre solo y lleve a la bienvenida.
34. [x] App: en el encabezado de Mundos dice «15 de 13 mundos».
35. [x] La mejora gráfica de pagos también en Pro, Chispas y Cometas: que comprar con dinero dé ganas.
36. [x] Modo Zen: se puede usar en mundos que no tienes; tiene que estar bloqueado.

Hecho (2026-10-14 noche): 28 cartel «Recarga: Cometas y Chispas» en la portada del Bazar → Mercado; 29 respondido en el chat;
30 cada paquete con ilustración propia (src/lib/tienda/ilustracionesPaquetes.ts), lo que trae y cuánto ahorras; 31 la app sin
emojis en la interfaz (quedan los del chat, los emotes y las notificaciones del sistema); 32 y 35 tarjetas de planes y Vitrina
de Cometas y Chispas en web (components/pagos/Vitrina.tsx) y app (ui/pagos/Vitrina.tsx); 33 el overlay de Paddle se cierra solo
y lleva a /pro/bienvenida; 34 «de 15 encendidos»; 36 Zen bloqueado en mundos que no tienes.
Falta: recompilar el APK con todo esto.

## Pedidos del 2026-10-14 (noche, 2)

37. [x] Reparar la racha con Cometas (PLAN_ECONOMIA: 50 Cometas, 1 vez por semana).
38. [x] Abrir cápsulas con Cometas.
39. [x] Mundo suelto con dinero (US$2.99).
40. [x] Paquetes de cosméticos con dinero.
41. [x] Paquetes cuando ya tienes parte: no cobrar lo que ya tienes (precio solo de lo que falta).
42. [x] Paridad: el fondo de ciudad en la pantalla de carga de la web.
43. [x] Después: compilar el APK (0.3.0, 2026-10-14 20:27).

Hecho (2026-10-14 noche, 2): migración **0287_cometas_y_dinero.sql** (hay que correrla). 37 reparar racha (Hoy en la app, inicio en la web);
38 cápsulas estelar (120) y supernova (300) en Mercado (web) y en la pestaña Cometas (app); 39 mundo suelto US$2,99 (pantalla de mundo
bloqueado en la web; en la app abre la web); 40 paquetes con dinero (ficha del paquete); 41 si ya tienes parte pagas solo lo que falta
(Chispas y dinero, lo calcula la base); 42 la pantalla de carga de la web con la ciudad de noche. Para vender mundo y paquetes con
dinero falta crear PADDLE_PRODUCT_CONTENIDO (tabla de claves).

## Pedidos del 2026-10-14 (noche, 3)

44. [x] Aviso «Hay una nueva versión de Prodigia» en la app: al abrirla pregunta a la web (/api/app/version = último release de GitHub)
    y, si hay una más nueva, la baja dentro de la app con su barra y abre el instalador (permiso REQUEST_INSTALL_PACKAGES).
    **Regla al publicar:** el tag del release tiene que ser la versión del APK (app.json → `version`), con «v» adelante:
    el APK 0.5.0 se publica como **v0.5.0**. Si el tag es mayor que la versión de adentro, el aviso sale siempre.
    El aviso funciona desde el APK 0.5.0 en adelante (el 0.3.0/«v0.4.0» no lo tiene).
45. [ ] La descarga del APK en el navegador se queda trabada al final (80 MB), con v0.3 y v0.4. Desde 0.5.0 la actualización se
    baja dentro de la app y no pasa por el navegador.


## Pedidos del 2026-10-15

46. [x] Cinemática de Prodigia Pro más limpia y con más calidad (web y app).
47. [x] Abrir cápsulas se traba un poco: que sea fluido y gráficamente increíble (cómo lo hacen Clash Royale / Brawl Stars).

Hecho (2026-10-15): 46 cinemática nueva de Pro (hiperespacio → el logo llega → anillos de energía → estallido → «PRODIGIA PRO»),
una sola línea de tiempo para web y app (src/lib/fx/cinematicaPro.ts), revisada con capturas en escritorio y teléfono; se salta con
un toque. 47 cápsulas sin trabas (premio pedido al aparecer, sonidos precargados, brillos horneados en vez de desenfoques en vivo,
recargas al cerrar) y la rareza sube por colores al tocarla. Cápsulas premium (solo Cometas) con «Abrir ya» o «Guardar».


## Qué falta (revisión del 2026-10-16)

48. [x] Retroalimentación de cada pregunta (paso a paso / por qué): hoy solo la tienen los modos de Numeria (operaciones,
    fracciones, decimales, potencias, álgebra, geometría). Faltan: Enigmia, Geografía, Quimia, Anatomía, Melodía, Trigonometría,
    Historia, Calculia, Circuitia, Estadística, Naipia, Codia, Dinamia y Vitalia (los runners mandan `pasos: []`).
    → Hecho (2026-10-18): los 14 mundos explican cada pregunta en el repaso de errores, en web y app (ver 72).
49. [ ] Cobros en la app con Google Play Billing (o RevenueCat) + verificación en el servidor y la versión de Play sin botones
    «pagar en la web» ni el permiso REQUEST_INSTALL_PACKAGES / aviso de APK (Play actualiza solo y no lo permite).
50. [ ] Publicación en Play: AAB firmado, ficha, Data safety, clasificación de contenido, consentimiento de anuncios (UMP).
51. [x] Evento de Halloween (31/10) con su colección y su paquete (PLAN_CAPSULAS_Y_EVENTOS.md).
52. [ ] Resto del plan de economía: pack de inicio, fusión de cápsulas, prueba gratis de Pro, etiqueta «NUEVO», panel de economía.
    → Hechas la fusión y «NUEVO» (2026-10-18). Faltan: pack de inicio, prueba gratis de Pro (7 días) y panel de economía.
53. [ ] Pruebas: duelo en vivo con dos teléfonos; compra de un mundo suelto (falta PADDLE_PRODUCT_CONTENIDO).

## Pedidos del 2026-10-16

54. [ ] Play Store: para después (no ahora).
55. [x] Hacer 48 (explicaciones), 51 (Halloween) y 52 (resto de la economía).
56. [ ] Plan de TODAS las festividades famosas internacionales, cada una como «tema» que no cambia la base de la app pero
    comparte la dinámica de la fecha. Ejemplo Navidad: ciudades nevadas, copos cayendo, Santa o renos pasando, más regalos,
    eventos especiales semanales con premios especiales; estética de la app (gorritos, bordes de caramelo en botones);
    constelaciones y cápsulas con diseños y animaciones de la fecha. Planear y HACER cada una, prehechas y programadas
    para activarse solas desde antes.
57. [x] Anuncios: alguien nuevo ve de golpe los ~12 anuncios que hay; no es la idea. Arreglarlo y mejorar su diseño.
58. [x] Ícono de la app: fondo negro y logo más centrado, como el del APK viejo (el que solo envolvía la web): ese era más bonito. → Hecho (fondo #07080D, logo centrado; scripts/generar-iconos.mjs).
59. [x] En festividades también cambian el ícono y los widgets. → Widgets hechos (2026-10-17): la app manda los tramos de festividades de los próximos 60 días y el widget elige la de hoy (acento, adornos de la ciudad, partículas). Ícono (2026-10-17): los 16 hechos en mobile/assets/iconos-temporada; por decisión del usuario solo cambia en Halloween y Navidad (alias del launcher, plugins/iconos-temporada.js; para sumar otra fiesta, agregarla ahí y en src/lib/iconoTemporada.ts y en ALIAS de WidgetsProdigiaModule.kt).
60. [x] Widgets: más profundidad (y animación si se puede); hoy se ven feos. → Hecho (2026-10-17): fondo ilustrado nativo (cielo con resplandor y estrellas, ciudad en dos planos con ventanas), llama con brillo que respira y cajas de vidrio; 3 cuadros con fundido (ViewFlipper). Sin emojis. Ver modules/widgets-prodigia/android (Lienzo.kt).
61. [x] La llamita (racha) se ve muy sencilla: mejorarla gráficamente, con todas sus skins (estelas de racha). → Hecho (2026-10-17): llama en capas (exterior, media, núcleo, brillo, brasas) en src/lib/fx/llama.ts, la misma en web (LlamaDibujo, titila), app (IconoLlama) y widgets; todas las estelas salen de sus dos colores.
62. [x] Las partículas al acertar se ven rústicas: mejorarlas. → Hecho (2026-10-17, app): estallido en Skia con destello, onda y partículas con física (motor de las cápsulas) según el efecto equipado.
63. [x] App: la suma de puntos al acertar como en la web (animación en una esquina de la pregunta que va creciendo). → Hecho (2026-10-17): «+N» dorado en la esquina que salta y crece según lo ganado, con chispitas (como PuntajeCorner).
64. [x] App: más presencia para la racha de preguntas: desde 3 seguidas, la racha aparece grande en toda la pantalla, animada,
    como fuego, con el número que cambia, transparente de fondo (que se note pero no tape). O una idea mejor. → Hecho (2026-10-17): RachaDeFondo: desde 3 seguidas, llama enorme translúcida con el número; salta en cada acierto y se desvanece; más fuerte en 5, 10, 15…
65. [x] Web: el sonido en PC nunca se ha reproducido.

## Pedidos del 2026-10-18

66. [x] PRIMERO: definir de una vez la Gran Alineación (qué pasa, cómo se ve Prodigia, qué se gana). La primera es el sábado 24/10/2026 a las 18:00 de Colombia (23:00 UTC), 3 horas, y se repite cada 28 días.
67. [x] Fusión de cápsulas. → 3 iguales suben de rango: bronce→plata (50 Chispas), plata→oro (150), oro→prisma (400); RPC fusionar_capsulas (0290).
68. [x] Mejorar el apartado donde están las cápsulas. → Agrupadas por tipo con su rango y ×N, tarjeta de fusión y animación (web y app).
69. [x] Bajar un poco el brillo del fondo cuando se abre una cápsula.
70. [x] Las cápsulas nunca dan menos de 100 Chispas. → En contenido_capsula y al convertir un repetido (0290).
71. [x] Etiqueta «NUEVO». → 21 días desde que sale cada cosa, hasta que la ves (src/lib/recompensas/novedades.ts); tienda y cápsulas.
72. [x] Explicaciones de cada pregunta (= 48). → Cada mundo tiene su src/lib/<mundo>/pasos.ts (o los arma su generador); test en src/lib/practica/pasos.test.ts. Enigmia: los 40 acertijos de deducción del banco llevan su explicación escrita en src/lib/enigmia/pasos.ts (si se agregan más al banco, sumarla ahí; el test avisa).

### Decisiones del 2026-10-18 (Gran Alineación)
- Se mantiene: Exp ×2, Chispas ×2 al jugar, constelaciones ×2, logro «Testigo», avisos del día antes y de 10 min antes, sol dorado.
- Nuevo: cartel con cuenta regresiva en Inicio desde 3 días antes; anuncio programado; capa dorada y banda con el tiempo que queda; insignia «×2» en la partida; widgets dorados; resumen al terminar.
- Premios: **sello numerado** (por jugar al menos 1 partida) **y Cápsula de la Alineación** (por 3 partidas), además de una **meta de comunidad** (barra en vivo; si se llena, 300 Chispas a todos los que jugaron).
- La hora se queda: 18:00 de Colombia (23:00 UTC), cada 28 días.
- **Halloween empieza justo cuando termina la Alineación** (sábado 24/10, 21:00 Colombia).
- Animación de apertura: **video renderizado de alta gama**. Con la app abierta entra con fundido; al abrir la app durante el evento, se ve el video en vez del menú. Primero la de la Alineación, para que el usuario la apruebe; las de los demás eventos quedan planeadas en docs/eventos/ANIMACIONES_EVENTOS.md.
- Video de la Alineación aprobado (2026-10-18) y conectado: app ui/alineacion/VideoAlineacion.tsx, web components/alineacion/VideoAlineacion.tsx (16:9 y 9:16 en public/videos). Una vez por alineación en cada dispositivo, se salta desde el primer segundo y se repite desde el cartel («Ver el video»).
- **Antes del sábado 24/10 a las 18:00 de Colombia: correr las migraciones 0288, 0289 y 0290.**

## Pedidos del 2026-10-19

73. [x] La app 0.6 no avisaba de la 0.6.1: pedía /es/api/app/version (HTML). El servidor reescribe /es/api/* → /api/* (proxy.ts) y la app usa la ruta sin idioma. Lo mismo arregló el reto del finde.
74. [x] La tienda de la web caía en «Algo no cargó bien» (portada sin puesto → DE_PESTANA[undefined]).
75. [x] Un GIF pesado de fondo trababa la web: se achica en un Web Worker y en menos intentos (la app cede el turno entre cuadros).
76. [x] Web: «Editar perfil» en su propia página (/perfil/editar).
77. [x] Sin destellos (✨ / IconoDestello): el aviso de actualización lleva el logo.
78. [x] Paquetes de cápsulas SOLO con Cometas (microtransacciones), también de temporada: migración 0291 (Lote Estelar 5×500, Lote Supernova 3×750, Cápsula de Halloween 150 y 5×600 mientras dura el evento; trae piezas de la colección). **Correr 0291 en Supabase.**
79. [~] Video de Halloween: cuadros aprobados; la calabaza grande entra con su animación; todos los videos de evento llevan ~5 s finales animados (regla nueva). Reproductor genérico (VideoApertura) en web y app. Falta: integrar el render y compilar la 0.6.2.
80. [x] Planeación de los videos de las demás festividades en docs/eventos/ANIMACIONES_EVENTOS.md (Muertos es el próximo: 1/11).

81. [x] (hecho 2026-10-19, entra en el próximo APK) Cola de 5 s animada para el video de la Gran Alineación (pendiente: el usuario lo aprobará después; proyecto a medias en prodigia-marketing/videos/gran-alineacion, respaldo en D:/tmp-claude/respaldo-alineacion). RECORDÁRSELO. → HECHO (2026-10-20).
82. [x] (plan hecho en PLAN_FESTIVIDADES.md §6; falta construirlo) Planear la estética de CADA evento (grande o chico) para que TODO en la app celebre la fecha: botones, tarjetas, cápsulas, constelaciones, ciudad, carga, widgets, íconos, sonidos, textos. Escribirlo por evento en docs/eventos/PLAN_FESTIVIDADES.md y revisar qué falta de lo ya hecho (temas.ts). Pedido 2026-10-19.

## Pedidos del 2026-10-19 (tarde)

83. [~] DISEÑAR TODO lo de los eventos antes de construir (sin videos todavía): carpetas con una imagen por cosa y un HTML que se vea exactamente como en la app, para que el usuario lo revise y apruebe. Cubre §6 de PLAN_FESTIVIDADES.md para los 16 eventos. → DISEÑADO (2026-10-19), esperando aprobación: D:/Repositorios/prodigia-marketing/diseno/index.html.
84. [x] «Paridad de eventos» (docs/eventos/PARIDAD_EVENTOS.md): la lista que TODO evento debe cumplir, como PARIDAD_MUNDOS.
85. [x] El evento se nota en las Rankeds y en el resto de secciones; minieventos dentro de cada evento. → DISEÑADO (2026-10-19), esperando aprobación: D:/Repositorios/prodigia-marketing/diseno/index.html. → HECHO (2026-10-20). Rankeds: minievento de la fecha (Halloween: 3 Caramelos por ranked ganada).
86. [x] Notificaciones con la piel y el tono del evento. → DISEÑADO (2026-10-19), esperando aprobación: D:/Repositorios/prodigia-marketing/diseno/index.html. → HECHO (2026-10-20). App: 3 avisos locales por evento.
87. [x] El apartado de Amigos también celebra el evento. → DISEÑADO (2026-10-19), esperando aprobación: D:/Repositorios/prodigia-marketing/diseno/index.html. → HECHO (2026-10-20). «Dar un dulce» (0292), web y app.
88. [x] Estadísticas (Pro): hoy se sienten inútiles. Rediseño «wow» que haga que Pro valga la pena. → DISEÑADO (2026-10-19), esperando aprobación: D:/Repositorios/prodigia-marketing/diseno/index.html. → HECHO (2026-10-20). Panel nuevo en web y app (0293).
89. [x] (app hecho) El tono de la racha subía solo 8 veces: ahora 15 alturas (dos octavas) y luego alterna (app). La web tiene un solo tono: igualar. → HECHO (2026-10-20). Web y app suben 15 notas.
90. [x] La fuente del «+N» al acertar: que se pueda cambiar con FUENTES DE PUNTOS en la tienda (cosmético nuevo). → DISEÑADO (2026-10-19), esperando aprobación: D:/Repositorios/prodigia-marketing/diseno/index.html. → HECHO (2026-10-20). Fuentes de puntos (0294), web y app.
91. [x] Más fuentes en la tienda (hay muy pocas), para el nombre y para los puntos. → DISEÑADO (2026-10-19), esperando aprobación: D:/Repositorios/prodigia-marketing/diseno/index.html. → HECHO (2026-10-20). 16 fuentes de nombre (0294), web y app.
92. [x] (8°, web y app) Inclinación leve a la derecha de los puntos «+N» (decisión de Claude).
93. [x] Landing de la web y tutorial (primera vez) de la app: explicar las cápsulas y las constelaciones. → DISEÑADO (2026-10-19), esperando aprobación: D:/Repositorios/prodigia-marketing/diseno/index.html. → HECHO (2026-10-20). Landing y presentación de la app.
94. [x] Constelaciones: mejorar CÓMO SE VEN (no la pantalla donde están): calidad alta, «wow», pero ya hechas de antemano (imágenes o dibujos pre-renderizados) para que no pongan lenta la app. → DISEÑADO (2026-10-19), esperando aprobación: D:/Repositorios/prodigia-marketing/diseno/index.html. → HECHO (2026-10-20). Cielos y estrellas pintados de antemano, web y app.

## Aprobación del 2026-10-19 (galería de diseño)

95. [ ] El usuario APROBÓ todo el diseño de la galería (eventos, estadísticas Pro, fuentes, constelaciones, tutorial y landing). Construirlo en web y app.
96. [x] Halloween: en el resultado (y donde salga la escena), en vez de la bruja, 3 esqueletos bailando como el meme, animados. Y un EMOTE EXCLUSIVO «Baile de esqueletos» que se pueda usar en las Rankeds. → HECHO (2026-10-20). Baile de esqueletos (meme) en resultado y emote exclusivo (0292).
97. [ ] Día de Pi: minievento «quien escriba más dígitos de π en 1 minuto gana» (título «Irracional», tabla del día).
98. [ ] (IDEA, no segura todavía) Rankeds con TABLERO EN VIVO en vez de solo el fantasma: los dos jugadores a cada lado; al responder ves cuánto te demoraste tú y cuánto el rival; en las opciones aparece la que eligió el rival; la Exp de cada uno y quién va ganando. Más emoción y presión. Consultar antes de hacer.
99. [ ] PLANEACIÓN pendiente: los CLANES (están abandonados).
100. [ ] PLANEACIÓN pendiente: el FEED social.
101. [ ] PLANEACIÓN pendiente: DOCENTES (el usuario ya tiene una solución en mente: preguntarle).

## DÓNDE QUEDÓ (2026-10-19, tarde) — leer primero para seguir

**Migraciones por correr en Supabase (en orden):** 0291 (paquetes de cápsulas con Cometas), 0292 (Halloween en todo: noche del esqueleto, 3 Caramelos por ranked ganada, «Dar un dulce», emote «Baile de esqueletos»), 0293 (estadísticas Pro nuevas) y 0294 (fuentes nuevas: 16 de nombre y fuentes de puntos). La base tiene hasta la 0290.

**Hecho y subido (web publicada en Vercel):** explicaciones de los 14 mundos; videos de la Alineación (15 s con cola) y Halloween en web y app (reproductor genérico VideoApertura); paquetes de cápsulas; editar perfil; arreglos de tienda, GIF y aviso de actualización; racha de 15 tonos; «+N» inclinado; paridad de eventos; celebracion.ts (datos de las 16 fechas); emote animado «Baile de esqueletos» (estilo del meme: en cuclillas, guantes blancos y zapatos negros) en duelos de web y app.

**APK — REGLA DEL USUARIO (2026-10-19): NO compilar hasta terminar TODO lo de la lista (se le acaba el plan mensual: compilar una sola vez al final, todo perfecto).** El app.json ya está en 0.6.3 / versionCode 9 (la compilación compilar44 se detuvo a propósito). **APK:** el último compilado es 0.6.2 (versionCode 8). Desde entonces hay cambios de app sin compilar (cola de la Alineación, aviso cada 30 min, racha de 15 tonos, «+N» inclinado, emote animado). Próximo: subir mobile/app.json a 0.6.3 / versionCode 9 y compilar: `powershell -NoProfile -ExecutionPolicy Bypass -File 'D:\android-build\compilar.ps1' > 'D:\android-build\compilar44.log'` (el APK sale en D:\Prodigia-APK\Prodigia.apk; luego crear el release v0.6.3 en GitHub). Tiene que salir ANTES del sábado 24/10 (Halloween).

**Pedido del usuario:** justo antes de compilar, si quedan tokens, arrancar los videos de las DEMÁS festividades (Muertos, Diwali, Viernes Estelar, Año Nuevo, Año Nuevo Lunar, Amor y Amistad, Carnaval, Pi, Holi, Pascua, Linternas, Tierra, Música, Vuelta a clases) con agentes en segundo plano, con el mismo encargo que el de Navidad (guiones en ANIMACIONES_EVENTOS.md).

**Video de Navidad:** un agente lo está haciendo en D:\Repositorios\prodigia-marketing\videos\navidad\ (ver ENTREGA.md ahí cuando termine). Para integrarlo: copiar entregables a mobile/assets/videos/navidad.mp4 y calibra/public/videos/navidad(.mp4|-vertical.mp4|-poster.jpg|-vertical-poster.jpg), agregar `navidad: "navidad"` en VIDEO_DE_TEMA (src/lib/temas/videosApertura.ts) y su require en VIDEOS (mobile/src/ui/VideoApertura.tsx).

**Lo que sigue, en orden (todo aprobado en la galería D:/Repositorios/prodigia-marketing/diseno/index.html):**
1. Halloween (antes del 24/10), web y app, leyendo CELEBRACIONES (src/lib/temas/celebracion.ts) cuando el tema está en fase «evento»:
   - Inicio: saludo («Truco o trato, {nombre}») en vez de «Hola, …» (app: mobile/src/app/(tabs)/index.tsx línea ~114; web: src/app/[locale]/page.tsx) y la palabra del botón principal.
   - Esquinas con la partícula de la fecha en tarjetas de mundos y en la tarjeta de la pregunta.
   - «+N» y estallido de acierto con C.acierto.colores (web PuntajeCorner/EfectoAciertoGlobal; app Flotante en ui/Sprint.tsx y el estallido Skia).
   - Resultado de la partida: en Halloween, el «Baile de esqueletos» grande (public/emotes/baile-esqueletos-grande.webp / mobile/assets/emotes/…) y la frase de partida perfecta.
   - Rankeds: cartel del minievento (C.ranked). Amigos: botón «Dar un dulce» (RPC dar_dulce, 0292).
   - Avisos del evento (inicio, mitad, último día) con C.avisos.
2. Estadísticas Pro rediseñadas (galería: estadisticas-pro) con RPCs nuevas (mejor hora, constancia 12 semanas, percentiles, temas débiles).
3. Fuentes: 16 de nombre nuevas + cosmético nuevo «fuentes de puntos» (10 estilos; galería: fuentes).
4. Constelaciones nuevas pre-pintadas (galería: constelaciones; el pintor está en calibra/zz-galeria/diseno.tsx → pintarConstelacion: exportar un PNG de fondo por ciudad + sprite de estrella).
5. Tutorial de la app y landing: pasos de cápsulas y constelaciones (galería: tutorial-y-landing).
6. El resto de eventos (Muertos 1/11 primero) y el minievento de π.
7. Planeaciones pendientes: tablero en vivo de rankeds (idea, consultar), clanes, feed social, docentes.

**Herramientas:** la galería se arma con `npx vite build --config zz-galeria/vite.config.mjs`, se sirve con `npx vite preview --config zz-galeria/vite.config.mjs --port 3458` y se captura con `node zz-galeria/diseno-captura.mjs <carpeta> <evento…>` (TEMP en D:). El baile: zz-galeria/esqueletos.html + esqueletos-render.mjs.
