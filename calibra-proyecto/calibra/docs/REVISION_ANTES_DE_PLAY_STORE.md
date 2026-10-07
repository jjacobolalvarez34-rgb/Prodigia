# Revisión antes de publicar en Google Play

> Fecha: 6 de octubre de 2026. Revisé el código de la app (`mobile/`), la web (`calibra/`) y las migraciones.
> Tres partes: **(A) descargables de logros**, **(B) legal y políticas de Google Play**, **(C) seguridad**.
> Cada hallazgo tiene una prioridad: 🔴 bloquea la publicación o es un riesgo serio · 🟠 importante · 🟡 mejora.
> No soy abogado: la parte legal es una revisión técnica de lo que piden la ley colombiana y Google Play. Conviene que un abogado revise los textos finales.

---

## Ya resuelto hoy

- **Aceptación de Términos y Privacidad** (0257):
  - La app la pide al abrirla por primera vez, con casilla obligatoria.
  - La web la pide al registrarse.
  - A las cuentas que ya existían se les pide una vez.
  - Queda guardado qué versión se aceptó y cuándo.
- **Borrar mensajes sin perder el respaldo** (0256), útil ante denuncias.
- **Las estadísticas también están en la app.**

---

## A. Descargables de logros

Hoy solo la **web** tiene «Compartir logro» (`CompartirLogroBoton.tsx`). **La app no tiene ninguno.**

### Lo que está mal en el diseño actual

| | Problema | Por qué importa |
|---|---|---|
| 🟠 | Usa la letra genérica del sistema (`sans-serif`), no la de la marca (Space Grotesk / JetBrains Mono) | No parece Prodigia; en cada computador se ve distinto |
| 🟠 | La medalla es el emoji 🏅 sobre un círculo | En Windows, Android y iPhone el emoji se dibuja distinto y se ve poco cuidado |
| 🟠 | Mide 1200 × 630 (horizontal) | Es el formato de una vista previa de enlace, no de Instagram ni WhatsApp: en historias queda chiquito con franjas |
| 🟠 | Toma los colores del tema de la página (claro u oscuro) | El mismo logro sale distinto según la configuración del que lo descarga |
| 🟡 | No tiene logo, ni enlace, ni código QR | Quien lo ve no sabe dónde conseguir Prodigia: se pierde el efecto publicidad |
| 🟡 | No muestra la placa del jugador (avatar, marco, título) ni la ciudad del logro | Es poco personal y no da ganas de presumirlo |
| 🟡 | El texto largo se corta en 2 líneas sin aviso | Algunos logros quedan cortados |

### Propuesta de diseño (web y app iguales)

- **Dos formatos**: 1080 × 1350 (publicación) y 1080 × 1920 (historia). Se elige al compartir.
- **Fondo**: siempre la noche de Prodigia (`#090C14`) con el skyline de la ciudad del logro, su color neón y sus glifos flotando. Para logros generales, el violeta→dorado de la marca.
- **Medalla dibujada** (no emoji): un hexágono con borde metálico según la dificultad (bronce, plata, oro, prisma), con el ícono del logro adentro y un brillo diagonal.
- **Textos**:
  - «¡LOGRO DESBLOQUEADO!» en mono pequeño;
  - el nombre del logro en Space Grotesk grande;
  - la descripción en 2 líneas como máximo, ajustando el tamaño para que entre.
- **La placa del jugador** abajo: avatar con su marco, nombre con su fuente y su título, y la fecha.
- **Pie**: logo (aro y chispa), «prodigia.app» y un código QR a la descarga.
- **En la app**: botón «Compartir» en cada logro desbloqueado. Arma la imagen y abre el menú de compartir del teléfono (WhatsApp, Instagram, guardar en la galería).
- **Bonus**: el mismo sistema sirve para compartir el resultado de un duelo, un rango nuevo («¡Llegué a Diamante!») y la racha (es el «sistema viral» del plan de negocio).

---

## B. Legal y políticas de Google Play

### B1. Textos legales (Términos y Privacidad)

| | Hallazgo | Qué hacer |
|---|---|---|
| 🔴 | **No dice quién es el responsable**: no aparece Mamut S.A.S., su NIT, dirección ni un correo de contacto. La Ley 1581 de 2012 (protección de datos en Colombia) exige identificar al responsable y un canal para ejercer derechos. Google Play exige también un contacto del desarrollador. | Agregar razón social, NIT, domicilio y un correo (por ejemplo, privacidad@…) en Privacidad y Términos |
| 🔴 | **La Privacidad no habla de lo que agregó la app**: el token de notificaciones (Firebase / Google), los datos del dispositivo para avisos, y que **los mensajes borrados se guardan como respaldo** (0256). Hoy dice que al borrar la cuenta se borran los mensajes, pero no dice cuánto se guardan los borrados mientras la cuenta existe. | Agregar: avisos push (proveedor Firebase), respaldo de mensajes borrados y **plazo** (sugerencia: 6 meses), y finalidad (atender denuncias) |
| 🔴 | **La edad se usa para más de lo que dice**: el texto dice que la edad solo sirve para la Trastienda, pero hoy también limita el chat de los menores de 13 (solo frases rápidas). | Corregir el texto |
| 🟠 | Faltan derechos del titular según la Ley 1581: conocer, actualizar, rectificar y suprimir, cómo pedirlo y en qué plazo se responde (15 días hábiles). | Sección «Tus derechos» |
| 🟠 | Menores: la ley colombiana pide que los datos de menores se traten con autorización de su representante legal. | Decir que los menores usan Prodigia con autorización de su familia (la app ya lo dice al instalar) y cómo puede un padre o madre pedir el borrado |
| 🟠 | Los Términos dicen «no es un contrato legal complejo». No tienen ley aplicable (Colombia), limitación de responsabilidad, propiedad intelectual, suspensión de cuentas por mal uso ni cómo se avisan los cambios. | Agregar esas secciones (pueden seguir en lenguaje simple) |
| 🟡 | Los Términos mencionan un «feed social», que está desactivado. | Quitarlo |

### B2. Requisitos de Google Play

| | Requisito | Estado | Qué hacer |
|---|---|---|---|
| 🔴 | **Contenido generado por usuarios (chat)**: Google exige poder **denunciar** contenido y usuarios **desde la app**. | La app permite bloquear jugadores, pero **no denunciar** mensajes ni perfiles (la web sí puede). | Agregar «Denunciar» al mantener apretado un mensaje y en el perfil de un jugador, con las mismas funciones que la web |
| 🔴 | **Público objetivo y familias**: si en la ficha se declara que la app es para menores de 13, aplica la política de Familias (consentimiento de los padres, sin chat libre con desconocidos, restricciones de anuncios y de inicio de sesión). | Prodigia está pensada para estudiantes y tiene chat. | **Para el lanzamiento, declarar público de 13 años en adelante** (la app igual cuida a los menores que entren). Más adelante se evalúa el programa de Familias |
| 🔴 | **Borrar la cuenta**: Google exige poder pedirlo desde la app **y** desde una dirección web pública. | La app manda a `/ajustes` de la web, que pide iniciar sesión. | Crear una página pública `/eliminar-cuenta` que explique cómo hacerlo, y poner esa dirección en la Play Console |
| 🟠 | **Pagos**: los bienes digitales (Pro, Chispas) **dentro de la app** se cobran con Google Play Billing. | Bien: la app no tiene enlaces a Paddle ni a Mercado Pago (Pro dice «llega con Play Billing»). | Mantenerlo así: ningún botón ni enlace de la app puede llevar a pagar en la web |
| 🟠 | **Cajas de botín**: si una recompensa al azar se compra con dinero o con una moneda que se compra, hay que mostrar las probabilidades. | Bien: las cápsulas no se compran y ya muestran «¿Qué puede salir?». | Mantener las probabilidades a la vista (también en Constelaciones, si se aprueban) |
| 🟠 | **Apuestas y simulación de casino**: Google es muy estricto. | Bien: la Trastienda **no está en la app** (PROD-01). | Que siga fuera de la app. En la ficha y en los textos, no mencionarla |
| 🟠 | **Formulario de seguridad de datos** (Data safety) en la Play Console. | Pendiente. | Declarar: correo, nombre de usuario, fecha de nacimiento, foto, mensajes, actividad en la app, token de avisos; cifrado en tránsito; borrado a pedido. Ninguno se vende ni se comparte para publicidad |
| 🟡 | **Calificación de contenido** (cuestionario IARC). | Pendiente. | Responder: sí hay interacción entre usuarios (chat), no hay compras dentro de la app (por ahora), no hay apuestas |
| 🟡 | Política de privacidad en la ficha. | Existe en la web. | Poner el enlace público en la ficha de Play |

---

## C. Seguridad de la app

| | Hallazgo | Riesgo | Qué hacer |
|---|---|---|---|
| 🔴 | **Los canales en vivo son públicos.** El chat (`dm:<id>:<id>`, `clan-chat:<id>`), los duelos (`duelo:<id>:sala` / `:vivo`) y los avisos usan canales de Supabase Realtime **sin autorización**. Cualquiera con la clave pública de la app (que va dentro de la APK) y los identificadores puede **escuchar los mensajes que se mandan en vivo** o **mandar mensajes falsos** (un mensaje que nadie escribió, un «borrado» falso, un «empezar» falso en un duelo, un progreso falso del rival). | Privacidad del chat, suplantación, trampas en duelos | Activar la **autorización de Realtime** (canales privados con reglas en `realtime.messages`): solo los dos participantes de un chat o de un duelo, o los miembros de un clan, pueden unirse a su canal. Además, que el cliente valide que el mensaje que llega es de quien dice ser |
| 🔴 | **Cualquiera puede retar a cualquiera.** La regla de `duels` solo exige que quien reta sea uno mismo; no exige que sean amigos. | Spam de retos y acoso, también a menores | Que la base rechace un reto directo si no son amigos (el emparejamiento de Rankeds usa otro camino) |
| 🟠 | **La foto de perfil acepta cualquier dirección.** La app y la web guardan `avatar_url` con una actualización directa, así que se podría poner un enlace a una imagen externa (inapropiada o que rastrea a quien la ve). | Contenido inapropiado en rankings y perfiles | Guardar la foto con una función que solo acepte direcciones del propio almacenamiento de Prodigia (como ya se hace con el fondo personalizado) |
| 🟠 | **La sesión se guarda sin cifrar** (AsyncStorage). | Con el teléfono comprometido, se puede robar la sesión | Guardar el token en `expo-secure-store` (almacenamiento cifrado de Android) |
| 🟠 | **Los avisos push aceptan cualquier llamada si falta la clave**: `webhookAutorizado` deja pasar todo si `WEBHOOK_SECRET` no está configurado. | Alguien podría disparar avisos falsos | Configurar `WEBHOOK_SECRET` en Supabase y cambiar la función para que, sin clave, **rechace** |
| 🟠 | **Falta límite de velocidad** en las funciones de economía y social (SEG-07, sigue abierto). | Abuso con scripts (spam de solicitudes, regalos) | Límites por usuario y minuto en las funciones sensibles |
| 🟡 | `google-services.json` está en el repositorio (la clave de Firebase de Android). | Bajo: es una clave de cliente, pero puede usarse para mandar spam a Firebase si no está restringida | En Google Cloud, restringir esa clave al paquete `com.prodigia.app` y su huella SHA-1 |
| 🟡 | Las imágenes subidas se validan por el tipo que declara el teléfono. | Bajo | Está bien para el lanzamiento; más adelante, revisar en el servidor |
| 🟡 | No hay registro de qué migraciones están aplicadas (SEG-09). | Errores difíciles de rastrear | Usar la CLI de Supabase o una tabla de control |

### Lo que está bien
- La clave de administrador (service role) **no** está en la app.
- Las Chispas, la Experiencia y el ELO se calculan en el servidor.
- Las respuestas imposiblemente rápidas no cuentan (antitrampas).
- Los pagos de Pro no pasan por la app.
- Las columnas sensibles del perfil no se pueden escribir desde el teléfono (GRANT por columna).
- Ya existen el bloqueo de jugadores y el filtro de palabras en el chat.

---

## Orden sugerido antes de subir a la Play Store

1. 🔴 Canales en vivo privados (seguridad).
2. 🔴 Retos solo entre amigos.
3. 🔴 Denunciar desde la app (chat y perfiles).
4. 🔴 Textos legales: responsable, contacto, respaldo de mensajes, uso de la edad, push.
5. 🔴 Página pública `/eliminar-cuenta`.
6. 🔴 Público objetivo 13+ en la Play Console, más los formularios de seguridad de datos y de calificación de contenido.
7. 🟠 Foto de perfil validada, sesión cifrada, `WEBHOOK_SECRET`.
8. 🟡 Descargables nuevos (sirven también como publicidad).

Si me das el visto bueno, empiezo por los puntos 1, 2, 3 y 5, que son de código. Los textos legales (punto 4) los redacto, pero los datos de la empresa (NIT, dirección, correo) me los tienes que pasar tú.
