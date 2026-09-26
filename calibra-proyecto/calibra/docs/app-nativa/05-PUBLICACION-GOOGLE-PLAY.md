# 05 — Publicación en Google Play (y APK directo)

> Estado: PROPUESTA / checklist. Las reglas de Play cambian seguido: **verificar cada punto contra
> la Play Console y el Centro de políticas en el momento de publicar**. Lo escrito acá refleja las
> reglas conocidas a la fecha de la sesión.

## 1. Cómo se distribuye

| Canal | Para quién | Nota |
|---|---|---|
| **Google Play** (principal) | Todos | Actualizaciones automáticas, pagos, confianza. Formato AAB. |
| APK directo (opcional) | Testers, colegios con equipos sin Play | Desde GitHub Releases o una página de la web. El usuario tiene que permitir "orígenes desconocidos" y **no recibe actualizaciones automáticas**; no usar como canal masivo. Pagos no disponibles en esta variante (flag de build). |

## 2. Antes de subir nada

- [ ] **Cuenta de desarrollador**: decidir personal u organización. Organización requiere D-U-N-S
      pero evita el requisito de testing cerrado de cuentas personales nuevas y da más confianza
      a colegios.
- [ ] Si la cuenta es **personal y nueva**: Play exige una prueba cerrada con un mínimo de testers
      durante un período (a la fecha: 12 testers, 14 días seguidos) antes de pedir producción.
      Reclutar el grupo cerrado actual de la web como testers.
- [ ] **Package name**: `com.prodigia.app` (ya está en `capacitor.config.ts`). No se puede cambiar
      después de publicar.
- [ ] **Firma**: Play App Signing activado; clave de subida gestionada por EAS, con copia de
      seguridad fuera del repo.
- [ ] **targetSdk** el que exija Play en ese momento (el proyecto Capacitor ya usa 36).
- [ ] Cerrar los bloqueantes de `docs/audits/REVISION-GENERAL-2026-09-26.md`: SEG-01..04, PROD-01.

## 3. Público objetivo y política de Familias (lo más delicado)

El público real incluye menores de 13 años. Aunque se declare "13+", Google también evalúa si la
app **atrae** a niños (colores, mundos escolares, mascota), así que conviene diseñar para cumplir
la política de Familias desde el día uno:

- [ ] Declarar grupos de edad honestamente en "Público objetivo y contenido".
- [ ] **Sin azar simulado** (Trastienda fuera de la app).
- [ ] Sin anuncios en v1. Si luego hay anuncios, solo de redes certificadas para Familias y sin
      anuncios personalizados para menores.
- [ ] Todos los SDK de la app deben estar permitidos para apps con niños (revisar cada librería
      nativa que se agregue; los de analytics/crash son los que suelen fallar).
- [ ] Sin ubicación precisa, sin contactos, sin identificadores de publicidad para menores.
- [ ] Chat y mensajes: controles por edad (PROD-02) y forma de reportar y bloquear.
- [ ] Política de privacidad (EXISTE `/privacidad`) actualizada: menciona la app, datos de menores,
      push tokens, compras, cómo borrar la cuenta. Revisar con asesoría legal para COPPA (EE. UU.)
      y leyes de datos de menores de los países donde se publique.

## 4. Formulario de Data safety (borrador)

| Dato | ¿Se recoge? | Para qué | ¿Opcional? |
|---|---|---|---|
| Correo | Sí | Cuenta | No (salvo invitado) |
| Nombre visible | Sí | Perfil, rankings | No |
| Edad | Sí | Controles por edad | No |
| Mensajes (clan, directos) | Sí | Funcionalidad social | Sí |
| Actividad en la app (respuestas, tiempos, progreso) | Sí | Funcionalidad, adaptación | No |
| Historial de compras | Sí | Pro y Chispas | Sí |
| Identificadores del dispositivo (token FCM) | Sí | Notificaciones | Sí |
| Ubicación, contactos, fotos, audio | No | — | — |

- Datos cifrados en tránsito: sí (HTTPS / Supabase).
- El usuario puede pedir el borrado: sí.

## 5. Borrado de cuenta (obligatorio)

- [ ] Dentro de la app: Ajustes → Cuenta → Eliminar cuenta (EXISTE la ruta
      `/api/perfil/eliminar-cuenta`, usa `admin.ts` del lado servidor).
- [ ] **Además** una página web pública para pedir el borrado sin tener la app instalada (Play pide
      la URL). Puede ser `/<locale>/eliminar-cuenta` con login.
- [ ] Definir qué pasa con suscripciones activas al borrar (avisar que se cancelan en Play aparte).

## 6. Pagos con Google Play Billing

- [ ] Productos: suscripción **Prodigia Pro** (planes mensual/anual) + consumibles **Chispas**
      (mismos 4 paquetes que Paddle: 1000 / 2500 / 6000 / 15000, `src/lib/pagos/paddle.ts:29-32`).
- [ ] Precios localizados por país desde la Play Console.
- [ ] Verificación en servidor: Real-time Developer Notifications → Pub/Sub → endpoint
      `/api/webhooks/google-play` → RPC existentes (`aplicar_suscripcion`,
      `acreditar_chispas_compradas`). Idempotencia con `payment_events` (EXISTE, agregar provider).
- [ ] **Reembolsos**: consultar la API de compras anuladas y descontar Chispas (hoy no existe este
      flujo en Paddle tampoco; definir la regla con el PO).
- [ ] "Restaurar compras" en el paywall.
- [ ] Una compra en web se ve en la app y viceversa (fuente única: tabla `subscriptions`).
- [ ] Revisar si aplica algún programa de facturación alternativa en los países de lanzamiento;
      por defecto, todo con Play Billing.
- [ ] En la app **no** aparecen links a pagar en la web (Play lo prohíbe salvo programas
      específicos).

## 7. Clasificación de contenido (IARC)

Responder el cuestionario con: interacción entre usuarios (chat/mensajes), compras dentro de la app,
sin violencia, sin azar (si la Trastienda está fuera). Con Trastienda adentro, la clasificación sube
y choca con el público.

## 8. Ficha de la tienda

| Elemento | Especificación | De dónde sale |
|---|---|---|
| Título | ≤ 30 caracteres. Ej.: "Prodigia: aprende jugando" | PO |
| Descripción corta | ≤ 80 caracteres | `docs/marketing/SLOGANS.md` |
| Descripción completa | ≤ 4000 caracteres, sin prometer lo que no existe | `docs/audits/FUNCION-VS-MARKETING.md` (evitar los claims marcados falsos) |
| Ícono | 512 × 512 PNG | `assets/icon-only.png` (revisar que se lea a 48 dp) |
| Gráfico destacado | 1024 × 500 | Nuevo, con la estética "Noche de Prodigia" |
| Capturas de teléfono | 4-8, vertical 9:16, con texto grande arriba | Tomadas de la app real (no maquetas) |
| Video | Opcional, 30 s | `docs/marketing/STORYBOARD-TRAILER-PRINCIPAL.md` |

Capturas sugeridas en orden: 1) sprint con combo, 2) mapa de mundos encendidos, 3) duelo VS,
4) cascada de recompensas / level-up, 5) camino de Aprender, 6) liga semanal, 7) perfil con
cosméticos, 8) clan.

## 9. Calidad antes de producción

- [ ] Informe previo al lanzamiento de Play sin errores críticos.
- [ ] Android vitals: tasa de fallos y ANR por debajo de los umbrales de Play.
- [ ] Probado en: un gama baja (2-3 GB RAM), un gama media, una tablet, Android mínimo soportado
      (proponer Android 8/API 26 como mínimo; el proyecto Capacitor usa 24).
- [ ] Modo avión: la app abre, muestra Práctica libre y no se rompe.
- [ ] Rotación bloqueada en vertical (salvo tablet, a decidir).
- [ ] Tamaño de fuente del sistema al 130 %: nada se corta.
- [ ] TalkBack: pantallas principales navegables.

## 10. Lanzamiento por etapas

```
Interno (equipo) → Prueba cerrada (grupo actual, 14+ días) → Prueba abierta (opcional)
   → Producción al 10 % → 50 % → 100 %   (frenar si suben fallos o reseñas negativas)
```
- API de actualizaciones dentro de la app (flexible) para avisar versiones nuevas.
- API de reseñas dentro de la app: pedir la reseña **después** de un momento bueno (subir de nivel,
  ganar un duelo), nunca antes del día 3 ni más de una vez por trimestre.
