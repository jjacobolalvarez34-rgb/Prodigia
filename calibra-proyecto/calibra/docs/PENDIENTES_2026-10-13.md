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
9. [ ] Tienda nueva A + C (maqueta aprobada en docs/rediseno/tienda.html): construir.
10. [ ] Compilar APK nuevo con todo esto (avisar antes).

Migraciones pendientes de correr, en orden: 0244 → 0283.

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
