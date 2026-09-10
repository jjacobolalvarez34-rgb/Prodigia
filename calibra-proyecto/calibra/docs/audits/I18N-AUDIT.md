# I18N-AUDIT — Auditoría completa español/inglés (2026-09-09)

## Resumen ejecutivo

| Severidad | Cantidad |
|-----------|----------|
| CRÍTICA   | 12       |
| ALTA      | 28       |
| MEDIA     | 35       |
| BAJA      | 14       |
| **Total** | **89**   |

**Top problemas:**
1. **~75 archivos** usan `next/navigation` o `next/link` en vez de `@/i18n/navigation` → rutas sin prefijo de locale en idioma no-default.
2. **Login, registro, ajustes, retos, clanes** — pantallas completas 100% en español sin clave i18n.
3. **Títulos del SEO** (metadata.title/description) hardcodeados en español en ~15 páginas.
4. **40 títulos de logros** + nombres de modos/mundos en `src/lib/` sin i18n.
5. **Edge functions** envían pushes en español ("🔥 Tu racha está en riesgo", "⚔️ Te retaron a un duelo").

**Severidad por área (top 5):**
1. **Auth (login/registro/recuperar/convertir cuenta)** — 18 hallazgos, 100% hardcodeados.
2. **Mundos (Trigonometría/Melodía/Geografía/Enigmia/Quimia/Anatomía/Historia)** — 15 hallazgos: hardcoded titles, descriptions, topic names, SEO metadata.
3. **Retos** — 8 hallazgos: labels, pluralización, frases, timestamps.
4. **Clanes** — 8 hallazgos: toda la UI sin i18n.
5. **Leaderboard** — 6 hallazgos: filtros, empty states, loading states.

**Estado de `en.json`:** ✅ **100% paridad** con `es.json`. Ambos archivos tienen exactamente 499 líneas, misma estructura, mismas claves, sin placeholders rotos. Las traducciones son de alta calidad y naturales en ambos idiomas.

**Top bugs de cambio de idioma:**
1. `router.push("/login")` sin locale prefix → redirige a `/login` sin `/en/` ni `/es/`.
2. LoginForm, RegistroForm, ClanesClient, Feed, RetoClient y ~60 archivos más usan `next/navigation` o `next/link` en vez de `@/i18n/navigation`.
3. Las páginas de法律条款 (términos/privacidad) están 100% hardcodeadas en español sin posibilidad de traducción.

---

## Estado de `en.json` vs `es.json`

| Namespace   | Claves totales (es) | Traducidas (en) | Faltantes | %   | Notas |
|-------------|--------------------:|----------------:|----------:|----:|-------|
| Rankeds     | 43 | 43 | 0 | 100% | OK |
| Social      | 29 | 29 | 0 | 100% | OK |
| Perfil      | 23 | 23 | 0 | 100% | OK |
| Tienda      | 52 | 52 | 0 | 100% | OK |
| Common      | 12 | 12 | 0 | 100% | OK |
| Geografia   | 4 | 4 | 0 | 100% | OK |
| Nav         | 14 | 14 | 0 | 100% | OK |
| Landing     | 29 | 29 | 0 | 100% | OK |
| Home        | 18 | 18 | 0 | 100% | OK |
| Numeria     | 16 | 16 | 0 | 100% | OK |
| Practica    | 36 | 36 | 0 | 100% | OK |
| Aprender    | 24 | 24 | 0 | 100% | OK |
| **Total**   | **300** | **300** | **0** | **100%** | Paridad perfecta |

**Traducciones rotas/literales:** Ninguna detectada. Todos los placeholders `{x}` están correctamente replicados. Las claves de plural (`{n, plural, one {...} other {...}}`) están bien adaptadas al inglés.

**Claves huérfanas (en en.json):** Ninguna detectada — ambos archivos tienen la misma estructura exacta.

**Namespace FALTANTE en ambos archivos:** No existen claves para los namespaces `Clanes`, `Ajustes`, `Retos`, `Leaderboard`, `Onboarding`, `Auth`, `Terminos`, `Privacidad`, `Error`, `Feed`, `MundoBloqueado`, `InvitadoBloqueado`, ni para los mundos Trigonometría/Melodía/Geografía/Enigmia/Quimia/Anatomía/Historia (solo Numeria tiene namespace propio).

---

## Textos hardcodeados

### Auth (Login / Registro / Recuperar / Convertir Cuenta)

| Pantalla | Texto | Origen | Idioma | Problema | Severidad | Solución |
|----------|-------|--------|--------|----------|-----------|----------|
| Login | `"Entrando..."` | `src/app/[locale]/login/LoginForm.tsx:73` | ES | Sin clave i18n | CRÍTICA | Crear `Auth.login.entrando` |
| Login | `"Iniciar sesión"` | `src/app/[locale]/login/LoginForm.tsx:73` | ES | Sin clave i18n | CRÍTICA | Crear `Auth.login.iniciarSesion` |
| Login | `"o"` | `src/app/[locale]/login/LoginForm.tsx:79` | ES | Sin clave i18n | MEDIA | Crear `Auth.login.o` |
| Login | `"Entrar como invitado"` | `src/app/[locale]/login/LoginForm.tsx:84` | ES | Sin clave i18n | CRÍTICA | Crear `Auth.login.comoInvitado` |
| Login | `"Practicá sin crear cuenta. Podés guardar tu progreso después."` | `src/app/[locale]/login/LoginForm.tsx:87` | ES | Sin clave i18n | ALTA | Crear `Auth.login.sinCuenta` |
| Login | `"Contraseña"` | `src/app/[locale]/login/LoginForm.tsx:69` | ES | Placeholder hardcodeado | ALTA | Crear `Common.contrasena` (reutilizable) |
| Login | `"No pudimos crear una sesión de invitado. Probá de nuevo."` | `src/app/[locale]/login/LoginForm.tsx:28` | ES | Sin clave i18n | ALTA | Crear `Auth.login.errorInvitado` |
| Login | `"No pudimos iniciar sesión. Probá de nuevo."` | `src/app/[locale]/login/LoginForm.tsx:45` | ES | Sin clave i18n | ALTA | Crear `Auth.login.errorSesion` |
| Login | `"Entrá a Prodigia"` (h1) | `src/app/[locale]/login/page.tsx:24` | ES | Sin clave i18n | CRÍTICA | Crear `Auth.login.titulo` |
| Login | `"Con tu email y contraseña."` | `src/app/[locale]/login/page.tsx:26` | ES | Sin clave i18n | ALTA | Crear `Auth.login.subtitulo` |
| Login | `"¿Olvidaste tu contraseña?"` | `src/app/[locale]/login/page.tsx:40` | ES | Sin clave i18n | ALTA | Crear `Auth.login.olvidaste` |
| Login | `"¿No tenés cuenta? Creá una"` | `src/app/[locale]/login/page.tsx:42-46` | ES | Sin clave i18n | ALTA | Crear `Auth.login.noTenesCuenta` |
| Login | `"No pudimos confirmar el enlace..."` | `src/app/[locale]/login/page.tsx:31-35` | ES | Sin clave i18n | ALTA | Crear `Auth.login.errorEnlace` |
| Login | `"Entrar"` (metadata.title) | `src/app/[locale]/login/page.tsx:11` | ES | Metadata hardcodeada | MEDIA | Usar `getTranslations` |
| Registro | `"Las contraseñas no coinciden."` | `src/app/[locale]/registro/RegistroForm.tsx:39` | ES | Sin clave i18n | ALTA | Crear `Auth.registro.contrasenasNoCoinciden` |
| Registro | `"No pudimos crear la cuenta. Probá de nuevo."` | `src/app/[locale]/registro/RegistroForm.tsx:53` | ES | Sin clave i18n | ALTA | Crear `Auth.registro.errorCrear` |
| Registro | `"Ya existe una cuenta con ese email."` | `src/app/[locale]/registro/RegistroForm.tsx:60` | ES | Sin clave i18n | ALTA | Crear `Auth.registro.emailExistente` |
| Registro | `"Contraseña (mínimo 6 caracteres)"` | `src/app/[locale]/registro/RegistroForm.tsx:109` | ES | Placeholder hardcodeado | ALTA | Crear `Common.contrasenaPlaceholder` |
| Registro | `"Repetí la contraseña"` | `src/app/[locale]/registro/RegistroForm.tsx:115` | ES | Placeholder hardcodeado | ALTA | Crear `Auth.registro.repetirContrasena` |
| Registro | `"Creando cuenta..."` | `src/app/[locale]/registro/RegistroForm.tsx:119` | ES | Sin clave i18n | ALTA | Crear `Auth.registro.creando` |
| Registro | `"Crear cuenta"` | `src/app/[locale]/registro/RegistroForm.tsx:119` | ES | Sin clave i18n | CRÍTICA | Crear `Auth.registro.crearCuenta` |
| Registro | `"Te mandamos un email a..."` | `src/app/[locale]/registro/RegistroForm.tsx:88-90` | ES | Sin clave i18n | ALTA | Crear `Auth.registro.confirmacionPendiente` |
| Recuperar | `"Recuperar contraseña"` (h1) | `src/app/[locale]/recuperar/page.tsx:12` | ES | Sin clave i18n | ALTA | Crear `Auth.recuperar.titulo` |
| Recuperar | `"Te mandamos un enlace por email para elegir una nueva."` | `src/app/[locale]/recuperar/page.tsx:15` | ES | Sin clave i18n | ALTA | Crear `Auth.recuperar.subtitulo` |
| Recuperar | `"Volver a iniciar sesión"` | `src/app/[locale]/recuperar/page.tsx:22` | ES | Sin clave i18n | ALTA | Crear `Auth.recuperar.volver` |
| Convertir | `"Las contraseñas no coinciden."` | `src/components/ConvertirCuenta.tsx:49` | ES | Duplicado sin i18n | ALTA | Reusar `Auth.registro.contrasenasNoCoinciden` |
| Convertir | `"¿Cómo te llamamos?"` | `src/components/ConvertirCuenta.tsx:95` | ES | Sin clave i18n | ALTA | Crear `Auth.convertir.preguntaNombre` |
| Convertir | `"Tu cuenta ya está guardada..."` | `src/components/ConvertirCuenta.tsx:96-98` | ES | Sin clave i18n | ALTA | Crear `Auth.convertir.cuentaGuardada` |
| Convertir | `"Tu nombre"` (placeholder) | `src/components/ConvertirCuenta.tsx:107` | ES | Placeholder hardcodeado | MEDIA | Crear `Auth.convertir.placeholderNombre` |
| Convertir | `"Guardar"` | `src/components/ConvertirCuenta.tsx:113` | ES | Sin clave i18n | ALTA | Crear `Common.guardar` |
| Convertir | `"Seguir con mi nombre actual"` | `src/components/ConvertirCuenta.tsx:120` | ES | Sin clave i18n | MEDIA | Crear `Auth.convertir.seguirConActual` |
| Convertir | `"Listo, tu cuenta ya tiene email y contraseña..."` | `src/components/ConvertirCuenta.tsx:132` | ES | Sin clave i18n | ALTA | Crear `Auth.convertir.listo` |
| Convertir | `"Te mandamos un email a... confirmalo para terminar..."` | `src/components/ConvertirCuenta.tsx:140-142` | ES | Sin clave i18n | ALTA | Crear `Auth.convertir.confirmarEmail` |
| Convertir | `"Estás como invitado"` | `src/components/ConvertirCuenta.tsx:149` | ES | Sin clave i18n | ALTA | Crear `Auth.convertir.esInvitado` |
| Convertir | `"Tu progreso ya se está guardando..."` | `src/components/ConvertirCuenta.tsx:151-152` | ES | Sin clave i18n | ALTA | Crear `Auth.convertir.progresoGuardado` |
| Convertir | `"Guardar mi cuenta"` | `src/components/ConvertirCuenta.tsx:155,163` | ES | Sin clave i18n | ALTA | Crear `Auth.convertir.guardarCuenta` |
| Convertir | `"Contraseña (mínimo 6 caracteres)"` | `src/components/ConvertirCuenta.tsx:177` | ES | Placeholder hardcodeado | ALTA | Reusar `Common.contrasenaPlaceholder` |
| Convertir | `"Repetí la contraseña"` | `src/components/ConvertirCuenta.tsx:183` | ES | Placeholder hardcodeado | ALTA | Reusar `Auth.registro.repetirContrasena` |
| Convertir | `"Confirmar"` | `src/components/ConvertirCuenta.tsx:188` | ES | Sin clave i18n | MEDIA | Crear `Common.confirmar` |
| Convertir | `"Cancelar"` | `src/components/ConvertirCuenta.tsx:191` | ES | Sin clave i18n | MEDIA | Crear `Common.cancelar` |
| Convertir | `"No pudimos guardar la cuenta. Probá de nuevo."` | `src/components/ConvertirCuenta.tsx:66` | ES | Sin clave i18n | ALTA | Crear `Auth.convertir.errorGuardar` |
| Convertir | `"No se pudo guardar. Probá de nuevo."` | `src/components/ConvertirCuenta.tsx:86` | ES | Sin clave i18n | MEDIA | Crear `Auth.convertir.errorNombre` |

### Ajustes

| Pantalla | Texto | Origen | Idioma | Problema | Severidad | Solución |
|----------|-------|--------|--------|----------|-----------|----------|
| Ajustes | `"Ajustes"` (h1) | `src/app/[locale]/ajustes/page.tsx:27` | ES | Sin clave i18n | ALTA | Crear `Settings.titulo` |
| Ajustes | `"Sonido"` | `src/app/[locale]/ajustes/AjustesClient.tsx:41` | ES | Sin clave i18n | ALTA | Crear `Settings.sonido` |
| Ajustes | `"Tonos cortos al acertar o fallar en las partidas."` | `src/app/[locale]/ajustes/AjustesClient.tsx:42` | ES | Sin clave i18n | ALTA | Crear `Settings.sonidoDesc` |
| Ajustes | `"Efectos visuales"` | `src/app/[locale]/ajustes/AjustesClient.tsx:57` | ES | Sin clave i18n | ALTA | Crear `Settings.efectos` |
| Ajustes | `"Fondos animados, partículas y el gesto del logo..."` | `src/app/[locale]/ajustes/AjustesClient.tsx:58-60` | ES | Sin clave i18n | ALTA | Crear `Settings.efectosDesc` |
| Ajustes | `"Ocultar \"Doble o nada\""` | `src/app/[locale]/ajustes/AjustesClient.tsx:76` | ES | Sin clave i18n | ALTA | Crear `Settings.ocultarDobleONada` |
| Ajustes | `"Saca la trastienda de apuestas de la Tienda..."` | `src/app/[locale]/ajustes/AjustesClient.tsx:77-79` | ES | Sin clave i18n | ALTA | Crear `Settings.ocultarDobleONadaDesc` |
| Ajustes | `"Tema"` | `src/app/[locale]/ajustes/AjustesClient.tsx:96` | ES | Sin clave i18n | ALTA | Crear `Settings.tema` |
| Ajustes | `"Claro u oscuro."` | `src/app/[locale]/ajustes/AjustesClient.tsx:97` | ES | Sin clave i18n | MEDIA | Crear `Settings.temaDesc` |
| Ajustes | `"Términos de uso"` (link) | `src/app/[locale]/ajustes/page.tsx:34` | ES | Sin clave i18n | MEDIA | Crear `Common.terminosDeUso` |
| Ajustes | `"Privacidad"` (link) | `src/app/[locale]/ajustes/page.tsx:37` | ES | Sin clave i18n | MEDIA | Crear `Common.privacidad` |
| Ajustes | `"Sonido, efectos y tema de Prodigia."` (metadata) | `src/app/[locale]/ajustes/page.tsx:10` | ES | Metadata hardcodeada | MEDIA | Usar `getTranslations` |

### Retos (diario/semanal)

| Pantalla | Texto | Origen | Idioma | Problema | Severidad | Solución |
|----------|-------|--------|--------|----------|-----------|----------|
| Reto | `"Reto diario"` / `"Reto semanal"` | `src/components/reto/RetoClient.tsx:62` | ES | Sin clave i18n | CRÍTICA | Crear `Retos.diario` y `Retos.semanal` |
| Reto | `"hoy"` / `"esta semana"` | `src/components/reto/RetoClient.tsx:62-63` | ES | Sin clave i18n | ALTA | Crear `Retos.periodoHoy`, `Retos.periodoSemana` |
| Reto | `"mañana"` / `"la semana que viene"` | `src/components/reto/RetoClient.tsx:62-63` | ES | Sin clave i18n | ALTA | Crear `Retos.volverManana`, `Retos.volverSemana` |
| Reto | `"Empezar"` | `src/components/reto/RetoClient.tsx:205` | ES | Sin clave i18n | ALTA | Crear `Common.empezar` |
| Reto | `"Repartidas entre tus ciudades desbloqueadas..."` | `src/components/reto/RetoClient.tsx:195-196` | ES | Sin clave i18n | ALTA | Crear `Retos.repartidas` |
| Reto | `"🔥 {racha} {día/días} seguidas"` (pluralización manual) | `src/components/reto/RetoClient.tsx:200,295` | ES | Sin i18n plural | ALTA | Crear `Retos.racha` con ICU plural |
| Reto | `"Ahí quedó."` | `src/components/reto/RetoClient.tsx:285` | ES | Sin clave i18n | ALTA | Crear `Retos.ahiQuedo` (o reusar Practica.resumen.ahiQuedo) |
| Reto | `"Ya completaste el reto de hoy/de esta semana"` | `src/components/reto/RetoClient.tsx:284` | ES | Sin clave i18n | ALTA | Crear `Retos.yaCompletaste` |
| Reto | `"+{n} Chispas de bonus"` | `src/components/reto/RetoClient.tsx:291` | ES | Sin clave i18n | MEDIA | Crear `Retos.chispasBonus` |
| Reto | `"Quién más completó"` | `src/components/reto/RetoClient.tsx:302` | ES | Sin clave i18n | MEDIA | Crear `Retos.quienMasCompletó` |
| Reto | `"Volvé {volver} por el próximo."` | `src/components/reto/RetoClient.tsx:322` | ES | Sin clave i18n | MEDIA | Crear `Retos.volvePorElProximo` |
| Reto | `"Volver a Inicio"` | `src/components/reto/RetoClient.tsx:328` | ES | Sin clave i18n | MEDIA | Crear `Retos.volverInicio` |
| Reto | `"Guardando..."` | `src/components/reto/RetoClient.tsx:333` | ES | Sin clave i18n | MEDIA | Crear `Common.guardando` |
| Reto | `NOMBRE_MUNDO` con nombres hardcodeados (Geografía, Anatomía, etc.) | `src/components/reto/RetoClient.tsx:50-59` | ES | Sin clave i18n | ALTA | Crear namespace `Mundos.nombres` o reusar existente |

### Clan

| Pantalla | Texto | Origen | Idioma | Problema | Severidad | Solución |
|----------|-------|--------|--------|----------|-----------|----------|
| Clan | `"Clanes"` (h1) | `src/app/[locale]/clanes/ClanesClient.tsx:172` | ES | Sin clave i18n | ALTA | Crear `Clanes.titulo` |
| Clan | `"Sumate a un grupo, cumplan misiones semanales..."` | `src/app/[locale]/clanes/ClanesClient.tsx:174` | ES | Sin clave i18n | ALTA | Crear `Clanes.subtitulo` |
| Clan | `"Guerra de clanes — esta semana"` | `src/app/[locale]/clanes/ClanesClient.tsx:198` | ES | Sin clave i18n | ALTA | Crear `Clanes.guerraSemanal` |
| Clan | `"Todavía ningún clan sumó Experiencia esta semana..."` | `src/app/[locale]/clanes/ClanesClient.tsx:203` | ES | Sin clave i18n | MEDIA | Crear `Clanes.sinExperiencia` |
| Clan | `{c.cantidad_miembros} miembros` | `src/app/[locale]/clanes/ClanesClient.tsx:215` | ES | Sin i18n plural | MEDIA | Crear `Clanes.nMiembros` con ICU plural |
| Clan | `"Miembros"` (h3) | `src/app/[locale]/clanes/ClanesClient.tsx:367` | ES | Sin clave i18n | MEDIA | Crear `Clanes.miembros` |
| Clan | `"Misión de la semana"` | `src/app/[locale]/clanes/ClanesClient.tsx:348` | ES | Sin clave i18n | MEDIA | Crear `Clanes.misionSemanal` |
| Clan | `"+{n} Chispas para todos"` | `src/app/[locale]/clanes/ClanesClient.tsx:349` | ES | Sin clave i18n | MEDIA | Crear `Clanes.chispasParaTodos` |
| Clan | `"Resolver {n} problemas entre todo el clan..."` | `src/app/[locale]/clanes/ClanesClient.tsx:352` | ES | Sin clave i18n | MEDIA | Crear `Clanes.resolverProblemas` |
| Clan | `"¡Misión cumplida! Chispas repartidas."` | `src/app/[locale]/clanes/ClanesClient.tsx:360` | ES | Sin clave i18n | MEDIA | Crear `Clanes.misionCumplida` |
| Clan | `"Nivel {n} · {n} miembro(s) · Sos {rol}"` | `src/app/[locale]/clanes/ClanesClient.tsx:298` | ES | Sin clave i18n | MEDIA | Crear `Clanes.infoClan` |
| Clan | `"{n} Chispas para nivel {n+1}"` | `src/app/[locale]/clanes/ClanesClient.tsx:313` | ES | Sin clave i18n | MEDIA | Crear `Clanes.chispasParaNivel` |
| Clan | `"Ver el Mundo de Clanes"` | `src/app/[locale]/clanes/ClanesClient.tsx:326,479` | ES | Sin clave i18n | MEDIA | Crear `Clanes.verMundo` |
| Clan | `"Tu clan"` / `"vs"` | `src/app/[locale]/clanes/ClanesClient.tsx:332,335` | ES | Sin clave i18n | MEDIA | Crear `Clanes.tuClan`, `Clanes.vs` |
| Clan | `"Bajar a Miembro"` / `"Nombrar Guía"` | `src/app/[locale]/clanes/ClanesClient.tsx:389` | ES | Sin clave i18n | MEDIA | Crear `Clanes.bajarMiembro`, `Clanes.nombrarGuia` |
| Clan | `"Salir del clan"` | `src/app/[locale]/clanes/ClanesClient.tsx:401` | ES | Sin clave i18n | MEDIA | Crear `Clanes.salirDelClan` |
| Clan | `"Buscar un clan"` | `src/app/[locale]/clanes/ClanesClient.tsx:483` | ES | Sin clave i18n | ALTA | Crear `Clanes.buscarClan` |
| Clan | `"Buscar clan por nombre..."` (placeholder) | `src/app/[locale]/clanes/ClanesClient.tsx:487` | ES | Sin clave i18n | MEDIA | Crear `Clanes.buscarPlaceholder` |
| Clan | `"No encontramos ningún clan con ese nombre."` | `src/app/[locale]/clanes/ClanesClient.tsx:493` | ES | Sin clave i18n | MEDIA | Crear `Clanes.noEncontramos` |
| Clan | `"Unirme"` | `src/app/[locale]/clanes/ClanesClient.tsx:507` | ES | Sin clave i18n | MEDIA | Crear `Clanes.unirme` |
| Clan | `"Crear un clan — 5000 Chispas"` | `src/app/[locale]/clanes/ClanesClient.tsx:519` | ES | Sin clave i18n | ALTA | Crear `Clanes.crearClan` |
| Clan | `"Nombre del clan"` (placeholder) | `src/app/[locale]/clanes/ClanesClient.tsx:528` | ES | Sin clave i18n | MEDIA | Crear `Clanes.nombrePlaceholder` |
| Clan | `"Tag corto (opcional, ej. PRD)"` (placeholder) | `src/app/[locale]/clanes/ClanesClient.tsx:534` | ES | Sin clave i18n | MEDIA | Crear `Clanes.tagPlaceholder` |
| Clan | `"Descripción (opcional)"` (placeholder) | `src/app/[locale]/clanes/ClanesClient.tsx:540` | ES | Sin clave i18n | MEDIA | Crear `Clanes.descripcionPlaceholder` |
| Clan | `"Tenés {n} Chispas..."` | `src/app/[locale]/clanes/ClanesClient.tsx:561` | ES | Sin clave i18n | MEDIA | Crear `Clanes.tenesChispas` |
| Clan | `"Crear clan"` (botón) | `src/app/[locale]/clanes/ClanesClient.tsx:564` | ES | Sin clave i18n | MEDIA | Crear `Clanes.crearClanBoton` |
| Clan | `"Subiendo..."` / `"Cambiar imagen del clan"` | `src/components/clanes/SubirImagenClan.tsx:82` | ES | Sin clave i18n | MEDIA | Crear `Clanes.subiendoImagen`, `Clanes.cambiarImagen` |
| Clan | `"La imagen no puede pesar más de 2MB."` | `src/components/clanes/SubirImagenClan.tsx:39` | ES | Sin clave i18n | MEDIA | Crear `Clanes.errorTamano` |
| Clan | `"No pudimos subir la imagen. Probá de nuevo."` | `src/components/clanes/SubirImagenClan.tsx:54` | ES | Sin clave i18n | MEDIA | Crear `Clanes.errorSubir` |
| Clan | `"La imagen se subió pero no pudimos guardarla..."` | `src/components/clanes/SubirImagenClan.tsx:67` | ES | Sin clave i18n | MEDIA | Crear `Clanes.errorGuardarImagen` |
| Clan | `"Tiene que ser una imagen (PNG, JPG, WEBP o GIF)."` | `src/components/clanes/SubirImagenClan.tsx:35` | ES | Sin clave i18n | MEDIA | Crear `Clanes.errorTipo` |
| Clan | `"Escribí algo para tu clan..."` (chat placeholder) | `src/components/clanes/ChatDeClan.tsx:159` | ES | Sin clave i18n | MEDIA | Crear `Clanes.chatPlaceholder` |
| Clan | `"¿Seguro que querés salir de tu clan?"` (confirm) | `src/app/[locale]/clanes/ClanesClient.tsx:138` | ES | Sin clave i18n | MEDIA | Crear `Clanes.confirmarSalir` |
| Clan | `"Fundador"` / `"Guía"` / `"Miembro"` (roles) | `src/app/[locale]/clanes/ClanesClient.tsx:16` | ES | Sin clave i18n | MEDIA | Crear `Clanes.rolFundador`, `Clanes.rolGuia`, `Clanes.rolMiembro` |
| Clan | `"{n} guerra(s) ganada(s)"` | `src/app/[locale]/clanes/ClanesClient.tsx:301` | ES | Sin i18n plural | BAJA | Crear `Clanes.guerrasGanadas` con ICU plural |
| Clan | `"{n} Exp aportada"` | `src/app/[locale]/clanes/ClanesClient.tsx:382` | ES | Sin clave i18n | BAJA | Crear `Clanes.expAportada` |
| Clan | `"El nombre necesita al menos 3 caracteres."` | `src/app/[locale]/clanes/ClanesClient.tsx:453` | ES | Sin clave i18n | MEDIA | Crear `Clanes.errorNombreLargo` |
| Clan | `"Te faltan Chispas..."` | `src/app/[locale]/clanes/ClanesClient.tsx:457` | ES | Sin clave i18n | MEDIA | Crear `Clanes.errorChispas` |
| Clan | `"Jugador"` (fallback display name) | `src/app/[locale]/clanes/ClanesClient.tsx:373` | ES | Sin clave i18n | BAJA | Crear `Common.jugador` |

### Leaderboard

| Pantalla | Texto | Origen | Idioma | Problema | Severidad | Solución |
|----------|-------|--------|--------|----------|-----------|----------|
| Leaderboard | `"Global"` / `"Amigos"` | `src/app/[locale]/leaderboard/LeaderboardClient.tsx:92,100` | ES | Sin clave i18n | ALTA | Crear `Leaderboard.global`, `Leaderboard.amigos` |
| Leaderboard | `"Experiencia total"` / `"Por mundo"` | `src/app/[locale]/leaderboard/LeaderboardClient.tsx:110,118` | ES | Sin clave i18n | ALTA | Crear `Leaderboard.expTotal`, `Leaderboard.porMundo` |
| Leaderboard | `"Cargando..."` | `src/app/[locale]/leaderboard/LeaderboardClient.tsx:143` | ES | Sin clave i18n | MEDIA | Crear `Common.cargando` |
| Leaderboard | `"Ninguno de tus amigos sumó experiencia esta semana todavía."` | `src/app/[locale]/leaderboard/LeaderboardClient.tsx:147` | ES | Sin clave i18n | MEDIA | Crear `Leaderboard.sinAmigosExperiencia` |
| Leaderboard | `"Todavía nadie sumó experiencia esta semana — ¡arrancá vos!"` | `src/app/[locale]/leaderboard/LeaderboardClient.tsx:148` | ES | Sin clave i18n | MEDIA | Crear `Leaderboard.sinExperiencia` |
| Leaderboard | `"Todavía no sumaste experiencia esta semana..."` | `src/app/[locale]/leaderboard/LeaderboardClient.tsx:161` | ES | Sin clave i18n | MEDIA | Crear `Leaderboard.noSumaste` |
| Leaderboard | `"Cerrar búsqueda"` / `"Buscar por nombre"` (aria-label) | `src/app/[locale]/leaderboard/ListaRanking.tsx:83` | ES | Sin clave i18n | ALTA | Crear `Leaderboard.cerrarBusqueda`, `Leaderboard.buscarPorNombre` |

### MundoSelector (nombres de mundos hardcodeados)

| Pantalla | Texto | Origen | Idioma | Problema | Severidad | Solución |
|----------|-------|--------|--------|----------|-----------|----------|
| Nav | `"Geografía"`, `"Anatomía"`, `"Melodía"`, `"Trigonometría"` | `src/components/MundoSelector.tsx:10-14` | ES | Sin clave i18n | ALTA | Crear `Mundos.nombres` o reusar existente |
| Nav | `← {t("inicioDeProdigia")}` — el `←` hardcodeado | `src/components/MundoSelector.tsx:84` | ES | Hardcodeado | BAJA | Crear `Nav.mundoSelector.volverConFlecha` |

### Perfil (nombres de mundos en afinidad)

| Pantalla | Texto | Origen | Idioma | Problema | Severidad | Solución |
|----------|-------|--------|--------|----------|-----------|----------|
| Perfil | `NOMBRE_MUNDO_AFINIDAD` con "Numeria", "Geografía", etc. | `src/app/[locale]/perfil/page.tsx:39-53` | ES | Sin clave i18n | ALTA | Crear `Mundos.nombres` compartido |

### MundoSelector (NivelMundoSubio)

| Pantalla | Texto | Origen | Idioma | Problema | Severidad | Solución |
|----------|-------|--------|--------|----------|-----------|----------|
| MundoSubio | `"Numeria"`, `"Enigmia"`, `"Geografía"`, `"Quimia"` | `src/components/NivelMundoSubio.tsx:13-18` | ES | Sin clave i18n | MEDIA | Crear `Mundos.nombres` |
| MundoSubio | `"{nombre} subió a nivel {n}"` | `src/components/NivelMundoSubio.tsx:51` | ES | Sin clave i18n | MEDIA | Crear `Mundos.subioNivel` |

### Mundos (Hardcoded titles, descriptions, SEO, topics)

| Pantalla | Texto | Origen | Idioma | Problema | Severidad | Solución |
|----------|-------|--------|--------|----------|-----------|----------|
| Trigonometría | `"Trigonometría"` (metadata.title) | `src/app/[locale]/trigonometria/page.tsx:15` | ES | Metadata hardcodeada | MEDIA | Crear namespace `Trigonometria.metadata` |
| Trigonometría | `"Razones, círculo unitario, identidades y leyes de seno/coseno..."` (metadata.description) | `src/app/[locale]/trigonometria/page.tsx:16` | ES | Metadata hardcodeada | MEDIA | Usar `getTranslations` |
| Trigonometría | `"Ángulos, razones y triángulos"` (h1) | `src/app/[locale]/trigonometria/page.tsx:52` | ES | Sin clave i18n | ALTA | Crear `Trigonometria.titulo` |
| Trigonometría | `"Practicar"` / `"Aprender"` (botones) | `src/app/[locale]/trigonometria/page.tsx:79,97` | ES | Sin clave i18n | ALTA | Reusar `Common.practicar` / `Common.aprender` |
| Trigonometría | TopicCard nombres: "Razones básicas", "Círculo unitario", etc. | `src/app/[locale]/trigonometria/page.tsx:105-108` | ES | Sin clave i18n | ALTA | Crear `Trigonometria.modos` |
| Trigonometría | `"Modos"` (h2) | `src/app/[locale]/trigonometria/page.tsx:103` | ES | Sin clave i18n | MEDIA | Crear `Trigonometria.modosTitulo` |
| Melodía | Similar a Trigonometría: metadata + h1 + TopicCard | `src/app/[locale]/melodia/page.tsx:15-110` | ES | Sin clave i18n | ALTA | Crear namespace `Melodia` |
| Geografía | metadata + h1 + TopicCard (América, Europa, etc.) | `src/app/[locale]/geografia/page.tsx:14-108` | ES | Sin clave i18n | ALTA | Crear namespace `Geografia.page` |
| Enigmia | metadata + h1 + "Categorías" + categorías de `NOMBRE_CATEGORIA_ENIGMIA` | `src/app/[locale]/enigmia/page.tsx:19-92` | ES | Sin clave i18n | ALTA | Crear namespace `Enigmia` |
| Quimia | metadata + h1 + TopicCard (Símbolos, Fórmulas, Tabla, etc.) | `src/app/[locale]/quimia/page.tsx:15-136` | ES | Sin clave i18n | ALTA | Crear namespace `Quimia` |
| Anatomía | metadata + h1 + TopicCard (Óseo, Muscular, etc.) | `src/app/[locale]/anatomia/page.tsx:16-111` | ES | Sin clave i18n | ALTA | Crear namespace `Anatomia` |
| Historia | metadata + h1 + TopicCard (Cronología, Personajes, etc.) | `src/app/[locale]/historia/page.tsx:15-108` | ES | Sin clave i18n | ALTA | Crear namespace `Historia` |
| Geografía/Elegir | `"¿Qué región practicamos?"`, descs de regiones, `"Necesitás una cuenta..."` | `src/app/[locale]/geografia/elegir/page.tsx:46-68` | ES | Sin clave i18n | ALTA | Crear `Geografia.elegir` |
| Historia/Elegir | `"¿Qué modo practicamos?"`, descs de modos | `src/app/[locale]/historia/elegir/page.tsx:40-41` | ES | Sin clave i18n | ALTA | Crear `Historia.elegir` |
| Trigonometría/Elegir | TopicCards con nombres/descs | `src/app/[locale]/trigonometria/elegir/page.tsx:29-32` | ES | Sin clave i18n | ALTA | Crear `Trigonometria.elegir` |
| Melodía/Elegir | TopicCards con nombres/descs | `src/app/[locale]/melodia/elegir/page.tsx:29-34` | ES | Sin clave i18n | ALTA | Crear `Melodia.elegir` |
| Todas las prácticas | `"No pudimos conectar con el servidor. Probá de nuevo."` | `src/app/[locale]/trigonometria/TrigonometriaPracticaClient.tsx:115` (y variantes en melodía, historia, etc.) | ES | Sin clave i18n | ALTA | Crear `Common.errorRed` (reutilizable) |
| Todas las prácticas | `"Ya cumpliste tu meta de hoy."` | `src/app/[locale]/trigonometria/page.tsx:63` (y melodía, geografía, etc.) | ES | Sin clave i18n | ALTA | Reusar `Numeria.metaCumplida` |
| Todas las prácticas | `"Practicar"` / `"Aprender"` (h2 de cards en todas las home de mundos) | Cada `src/app/[locale]/*/{page.tsx}:79,97` | ES | Sin clave i18n | ALTA | Crear `Common.practicar` / `Common.aprender` |

### Términos y Privacidad

| Pantalla | Texto | Origen | Idioma | Problema | Severidad | Solución |
|----------|-------|--------|--------|----------|-----------|----------|
| Términos | Todo el contenido legal (~200 palabras) | `src/app/[locale]/terminos/page.tsx:14-71` | ES | Página 100% hardcodeada en español | ALTA | Crear namespace `Terminos` o mover a CMS/JSON |
| Privacidad | Todo el contenido legal (~200 palabras) | `src/app/[locale]/privacidad/page.tsx:14-63` | ES | Página 100% hardcodeada en español | ALTA | Crear namespace `Privacidad` o mover a CMS/JSON |
| Términos | `"Términos de uso — Prodigia"` (metadata.title) | `src/app/[locale]/terminos/page.tsx:5` | ES | Metadata hardcodeada | MEDIA | Usar `getTranslations` |
| Privacidad | `"Privacidad — Prodigia"` (metadata.title) | `src/app/[locale]/privacidad/page.tsx:5` | ES | Metadata hardcodeada | MEDIA | Usar `getTranslations` |

### Error Boundary Global

| Pantalla | Texto | Origen | Idioma | Problema | Severidad | Solución |
|----------|-------|--------|--------|----------|-----------|----------|
| Error | `"Algo no cargó bien"` (h1) | `src/app/[locale]/error.tsx:26` | ES | Sin clave i18n | ALTA | Crear `Error.titulo` |
| Error | `"Puede ser un problema de conexión con el servidor..."` | `src/app/[locale]/error.tsx:28-31` | ES | Sin clave i18n | ALTA | Crear `Error.descripcion` |
| Error | `"Reintentar"` | `src/app/[locale]/error.tsx:34` | ES | Sin clave i18n | MEDIA | Crear `Common.reintentar` |

### Mundo Bloqueado

| Pantalla | Texto | Origen | Idioma | Problema | Severidad | Solución |
|----------|-------|--------|--------|----------|-----------|----------|
| MundoBloqueado | `"¡Desbloqueado! Entrando…"` | `src/app/[locale]/mundo-bloqueado/MundoBloqueadoClient.tsx:66` | ES | Sin clave i18n | MEDIA | Crear `MundoBloqueado.desbloqueado` |
| MundoBloqueado | `"No se pudo desbloquear. Probá de nuevo."` | `src/app/[locale]/mundo-bloqueado/MundoBloqueadoClient.tsx:36` | ES | Sin clave i18n | MEDIA | Crear `MundoBloqueado.errorDesbloquear` |
| MundoBloqueado | `"No se pudo conectar. Probá de nuevo."` | `src/app/[locale]/mundo-bloqueado/MundoBloqueadoClient.tsx:43` | ES | Sin clave i18n | MEDIA | Crear `MundoBloqueado.errorConexion` |
| MundoBloqueado | `"Te faltan Chispas"` | `src/app/[locale]/mundo-bloqueado/MundoBloqueadoClient.tsx:70` | ES | Sin clave i18n | MEDIA | Crear `MundoBloqueado.faltanChispas` |
| MundoBloqueado | `"Seguí jugando para ganar más Chispas, o mirá la tienda."` | `src/app/[locale]/mundo-bloqueado/MundoBloqueadoClient.tsx:74` | ES | Sin clave i18n | MEDIA | Crear `MundoBloqueado.seguiJugando` |
| MundoBloqueado | `"{nombreMundo} está bloqueado"` | `src/app/[locale]/mundo-bloqueado/MundoBloqueadoClient.tsx:56` | ES | Sin clave i18n | MEDIA | Crear `MundoBloqueado.estaBloqueado` |
| MundoBloqueado | `"Desbloqueá {nombre} para siempre por {n} Chispas..."` | `src/app/[locale]/mundo-bloqueado/MundoBloqueadoClient.tsx:59-61` | ES | Sin clave i18n | MEDIA | Crear `MundoBloqueado.desbloquearPor` |
| MundoBloqueado | `"Desbloquear por {n} Chispas"` | `src/app/[locale]/mundo-bloqueado/MundoBloqueadoClient.tsx:70` | ES | Sin clave i18n | MEDIA | Crear `MundoBloqueado.botonDesbloquear` |

### Invitado Bloqueado

| Pantalla | Texto | Origen | Idioma | Problema | Severidad | Solución |
|----------|-------|--------|--------|----------|-----------|----------|
| Invitado | `"Creá tu cuenta para desbloquear esto"` | `src/app/[locale]/invitado-bloqueado/page.tsx:47` | ES | Sin clave i18n | ALTA | Crear `Invitado.titulo` |
| Invitado | `"necesita una cuenta real — es gratis..."` | `src/app/[locale]/invitado-bloqueado/page.tsx:50-51` | ES | Sin clave i18n | MEDIA | Crear `Invitado.necesitaCuenta` |
| Invitado | `"Volver a jugar como invitado"` | `src/app/[locale]/invitado-bloqueado/page.tsx:60` | ES | Sin clave i18n | MEDIA | Crear `Invitado.volverInvitado` |

### Resumen prácticas (Sprint)

| Pantalla | Texto | Origen | Idioma | Problema | Severidad | Solución |
|----------|-------|--------|--------|----------|-----------|----------|
| Práctica | `"Ronda {n}/{total} · {Mundo}"` (subtitulo en prácticas con duelo) | `src/app/[locale]/trigonometria/TrigonometriaPracticaClient.tsx:154` (y variantes) | ES | Template literal hardcodeado | ALTA | Crear `Common.rondaDeMundo` |

### Continentes y regiones

| Pantalla | Texto | Origen | Idioma | Problema | Severidad | Solución |
|----------|-------|--------|--------|----------|-----------|----------|
| Geografía | `"América"`, `"Europa"`, `"África"`, `"Asia y Oceanía"` (TopicCard en home) | `src/app/[locale]/geografia/page.tsx:105-108` | ES | Sin clave i18n (aunque existen en `Geografia.continentes`) | MEDIA | Reusar `Geografia.continentes` en page.tsx |
| Geografía | `"¿Qué región practicamos?"` + descs de regiones | `src/app/[locale]/geografia/elegir/page.tsx:46-47` | ES | Sin clave i18n | ALTA | Crear `Geografia.elegir` |

---

## Contenido dinámico y DB

### Edge Functions — Push notifications

| Origen | Texto | Tipo | ¿Traducir? | Estrategia |
|--------|-------|------|-------------|------------|
| `supabase/functions/notify-duelo/index.ts:85` | `"⚔️ Te retaron a un duelo"` | Push notification | Sí — push es device-local, se puede localizar con un campo `idioma` del perfil | Tabla `profiles.idioma` ya existe (migración 0085). La función debería leer el idioma del destinatario y elegir el texto accordingly |
| `supabase/functions/notify-duelo/index.ts:86` | `"${nombreRival} te desafió. ¿Aceptás?"` | Push notification | Sí | Misma estrategia: tabular por locale |
| `supabase/functions/racha-en-riesgo/index.ts:63-64` | `"🔥 Tu racha está en riesgo"` | Push notification | Sí | Leer `profiles.idioma` del destinatario |
| `supabase/functions/racha-en-riesgo/index.ts:65-66` | `"Llevás {n} día(s) seguidos. ¡Jugá hoy para no perderla!"` | Push notification | Sí | Tabular por locale |
| `supabase/functions/racha-en-riesgo/index.ts:67` | `"Todavía no cumpliste tu meta de hoy..."` | Push notification | Sí | Tabular por locale |

### SQL — `raise exception` con textos en español

| Migración | Texto | Tipo | ¿Traducir? | Estrategia |
|-----------|-------|------|-------------|------------|
| 0003–0025+ (múltiples) | `'no autenticado'` | Error de auth | Parcialmente — llega al cliente via `respuestaError()` | En `respuestaError.ts:26`, si `error.code === "P0001"` (raise exception), el mensaje se pasa crudo. Se podría mapear a un diccionario en el cliente, o traducir en el proxy antes de mostrar. **Recomendado:** agregar campo `code` al JSON de error y traducir en el cliente. |
| 0011, 0017, 0025, 0036 | `'item invalido'`, `'puntos insuficientes'`, `'monto invalido'` | Errores de negocio | Sí — se muestran al usuario | Mapear a claves i18n en el cliente |
| 0025 | `'ya tenes una apuesta activa'`, `'jugá al menos 20 problemas antes de poder apostar'` | Errores de negocio | Sí | Mapear a claves i18n |
| 0029 | `'mundo desconocido: %'` | Error interno | No — debugging | Mantener en español |
| 0038 | `'invitacion no encontrada'`, `'invitacion ya usada'`, `'no podes unirte a tu propia invitacion'` | Errores de negocio | Sí | Mapear a claves i18n |
| 0043 | `'titulo no desbloqueado'`, `'mundo invalido'`, `'falta operation_type para numeria'` | Errores de negocio | Sí (los 2 primeros); No (el tercero es interno) | Mapear a clades i18n los visibles |
| 0047 | `'el duelo ya no esta pendiente'` | Error de negocio | Sí | Mapear a clave i18n |
| 0050 | `'casual no admite todas las ciudades...'` | Error de negocio | Sí | Mapear a clave i18n |
| 0040 | `'no podes reportarte a vos mismo'`, `'motivo invalido'` | Errores de negocio | Sí | Mapear a claves i18n |

**Estrategia recomendada para errores SQL→cliente:** En `respuestaError.ts`, cambiar para enviar `{ error: message, code: errorCode }` al cliente. En el cliente, mapear códigos conocidos (ej. `"no autenticado"`, `"puntos insuficientes"`) a claves i18n. Esto evita traducir en SQL y centraliza la lógica.

### Contenido educativo (Mantenidos como español — nombre propio/científico)

| Origen | Texto | Tipo | ¿Traducir? | Estrategia |
|--------|-------|------|-------------|------------|
| `src/lib/practica/anatomia.ts` — huesos, músculos, nervios, órganos | "Fémur", "Húmero", "Bíceps", "Cerebro", "Olfatorio", etc. | Términos anatómicos | **No** — son nombres científicos universales, se mantienen en latín/español en todos los idiomas | Mantener como está |
| `src/lib/practica/anatomia.ts:11-16` — `NOMBRE_MODO_ANATOMIA` | "Sistema óseo", "Sistema muscular", etc. | Modos de juego | Sí — el jugador necesita entender qué es cada modo | Crear `Mundos.anatomia.modos` |
| `src/lib/practica/anatomia.ts:45-55` — `ETIQUETA_BAJO/ALTO` | "un hueso", "un músculo", etc. | Enunciados de pregunta | Sí | Crear `Mundos.anatomia.etiquetas` |
| `src/lib/practica/anatomia.ts:176-218` — `enunciado` | "Clickeá dónde está: {X}", "¿Cuál de estas opciones es {X}?" | Enunciados de pregunta | Sí | Crear `Mundos.anatomia.enunciados.clickOpcion` |
| `src/lib/practica/anatomia.ts:185` | "un hueso del cráneo, la mano o el pie" | Etiqueta de nivel alto | Sí | Crear `Mundos.anatomia.etiquetaAlta` |
| `src/types/database.ts:345-350` — `NOMBRE_CATEGORIA_ENIGMIA` | "Memoria", "Patrones", "Acertijos de deducción", "Pensamiento computacional" | Categorías de juego | Sí — el jugador necesita entender qué es cada categoría | Crear `Mundos.enigmia.categorias` |
| `src/lib/mundos/precios.ts:21-30` — `NOMBRE_MUNDO_PAGO` | "Numeria", "Geografía", "Enigmia", etc. | Nombres de mundos | **Parcialmente** — "Numeria" y "Enigmia" son nombres propios inventados (se mantienen), pero "Geografía", "Quimia", etc. son palabras comunes | Evaluar caso por caso: nombres inventados se mantienen, palabras comunes se traducen |
| `src/lib/titulos/catalogo.ts` — `CATALOGO_TITULOS` | "Maestro de Numeria", "Recién Empezás", "Vas Agarrando la Onda", "Puntería Fina", "Bautismo de Fuego", etc. (~40 títulos) | Títulos logrados | **Sí** — los títulos son una parte importante de la experiencia | Crear `Titulos.catalogo` o tabla de traducción por slug. **Nota:** el slug es la clave, el nombre se traduce. Actualmente el slug + nombre están en el mismo archivo TS y se guardan en DB vía `desbloquear_titulo()`. Alternativa: agregar tabla `titles_i18n(slug, locale, nombre)` o mover a JSON. |
| `src/lib/titulos/catalogo.ts:26` — categorías | "mundo", "volumen", "precision", "duelos", "constancia", "curiosidad" | Categoría de título | Sí — se muestran como filtros | Crear `Titulos.categorias` |
| `supabase/migrations/` — contenido educativo insertado (migraciones 0007, 0018, 0020, 0022, 0027, 0067, 0082, 0096, 0101) | Técnicas de cálculo, lecciones de anatomía, preguntas de geografía, etc. | Contenido educativo | **Estrategia propia** — este contenido ya existe como JSON estático en `/data/` y se sirve vía fetch. La traducción debería hacerse vía una columna `locale` en la tabla de contenido, o un sistema de claves con traducciones | Tabla nueva `content_i18n(key, locale, content_json)` o archivos por locale en `/data/{locale}/` |

### Feed

| Origen | Texto | Tipo | ¿Traducir? | Estrategia |
|--------|-------|------|-------------|------------|
| `src/app/[locale]/social/Feed.tsx:39` — `NOMBRE_MUNDO` | "Numeria", "Geografía", etc. | Nombres de mundos en posts | Sí | Reusar `Mundos.nombres` |
| `src/app/[locale]/social/Feed.tsx:46-51` — `NOMBRES_OPERACION` | "Suma", "Resta", "Multiplicación", "División" | Nombres de operaciones | Sí — ya existen en `Practica.operationPicker.operaciones` | Reusar `tOperaciones` |
| `src/app/[locale]/social/Feed.tsx` — strings como "desafío a duelo", "subió de rango", etc. | (posts auto-generados) | Texto de feed | Sí | Crear namespace `Social.feed` |

### Onboarding

| Pantalla | Texto | Origen | Idioma | Problema | Severidad | Solución |
|----------|-------|--------|--------|----------|-----------|----------|
| Onboarding | `"¿Cómo te llamamos?"` | `src/app/[locale]/onboarding/OnboardingForm.tsx:113` | ES | Sin clave i18n | ALTA | Crear `Onboarding.preguntaNombre` |
| Onboarding | `"Un nombre corto alcanza..."` | `src/app/[locale]/onboarding/OnboardingForm.tsx:116` | ES | Sin clave i18n | ALTA | Crear `Onboarding.nombreDesc` |
| Onboarding | `"Tu nombre"` (placeholder) | `src/app/[locale]/onboarding/OnboardingForm.tsx:126` | ES | Sin clave i18n | MEDIA | Crear `Onboarding.placeholderNombre` |
| Onboarding | `"Guardando..."` / `"Siguiente"` | `src/app/[locale]/onboarding/OnboardingForm.tsx:131` | ES | Sin clave i18n | ALTA | Crear `Onboarding.guardando` / `Onboarding.siguiente` |
| Onboarding | `"Elegí tus 2 mundos"` | `src/app/[locale]/onboarding/OnboardingForm.tsx:139` | ES | Sin clave i18n | CRÍTICA | Crear `Onboarding.elegiMundos` |
| Onboarding | `"Todos empiezan bloqueados — los 2 que elijas acá son gratis..."` | `src/app/[locale]/onboarding/OnboardingForm.tsx:142-143` | ES | Sin clave i18n | ALTA | Crear `Onboarding.mundosDesc` |
| Onboarding | `"Elegido"` / `"Bloqueado"` | `src/app/[locale]/onboarding/OnboardingForm.tsx:171,175` | ES | Sin clave i18n | MEDIA | Crear `Onboarding.elegido` / `Onboarding.bloqueado` |
| Onboarding | `"Empezar a jugar"` | `src/app/[locale]/onboarding/OnboardingForm.tsx:190` | ES | Sin clave i18n | ALTA | Crear `Onboarding.empezarAJugar` |
| Onboarding | `"Elegí {n} más"` | `src/app/[locale]/onboarding/OnboardingForm.tsx:190` | ES | Sin clave i18n | MEDIA | Crear `Onboarding.elegiNMas` |

### API responses (error genérico)

| Origen | Texto | Tipo | ¿Traducir? | Estrategia |
|--------|-------|------|-------------|------------|
| `src/lib/api/respuestaError.ts:26` | `"Algo salió mal. Probá de nuevo."` | Error genérico | Sí — se muestra al usuario | Crear `Common.algoSalioMal` (ya existe en `es.json`/`en.json` como `Common.algoSalioMal`) — falta usar `useTranslations` para mostrarlo |

### CampoPassword

| Origen | Texto | Tipo | ¿Traducir? | Estrategia |
|--------|-------|------|-------------|------------|
| `src/components/CampoPassword.tsx:40` | `"Ocultar contraseña"` / `"Mostrar contraseña"` (aria-label) | Accessibility | Sí | Crear `Common.ocultarContrasena`, `Common.mostrarContrasena` |

---

## Cambio de idioma

### Persistencia del idioma

| Hallazgo | Archivo:Línea | Severidad | Detalle |
|----------|---------------|-----------|---------|
| ✅ Cookie `NEXT_LOCALE` se setea en proxy.ts | `src/proxy.ts:120` | OK | Cookie con 1 año de expiración |
| ✅ Perfil `idioma` se lee en la primera visita | `src/proxy.ts:100-115` | OK | Redirige al idioma del perfil si no hay cookie |
| ✅ Selector de idioma en ProfileMenu | `src/components/ProfileMenu.tsx:73-81` | OK | Usa `router.replace(pathname, { locale })` + POST a `/api/perfil/idioma` |
| ✅ El API `/api/perfil/idioma` guarda en DB | Migración 0085 | OK | Campo `profiles.idioma` existe |

### Navegación — uso de `next/link` y `next/navigation` en vez de `@/i18n/navigation`

**ARCHIVOS que SÍ usan `@/i18n/navigation` (15 archivos):**
- `src/components/Header.tsx`
- `src/components/ProfileMenu.tsx`
- `src/components/MundoSelector.tsx`
- `src/components/NotificacionesDuelo.tsx`
- `src/components/NativePush.tsx`
- `src/components/landing/VisitanteLanding.tsx`
- `src/app/[locale]/page.tsx`
- `src/app/[locale]/numeria/page.tsx`
- `src/app/[locale]/perfil/page.tsx`
- `src/app/[locale]/aprender/[slug]/LeccionClient.tsx`
- `src/app/[locale]/rankeds/RankedsClient.tsx`
- `src/app/[locale]/rankeds/RankingElo.tsx`
- `src/app/[locale]/practica/PracticaClient.tsx`
- `src/app/[locale]/practica/temas/page.tsx`
- `src/app/[locale]/amigos/AmigosClient.tsx`

**ARCHIVOS que usan `next/link` o `next/navigation` (estos necesitan migración):**

| Archivo | Import incorrecta | Línea | Severidad | Nota |
|---------|-------------------|-------|-----------|------|
| `src/app/[locale]/login/LoginForm.tsx` | `useRouter` de `next/navigation` | 4 | CRÍTICA | `router.push("/login")` → pierde locale prefix |
| `src/app/[locale]/registro/RegistroForm.tsx` | `useRouter` de `next/navigation` | 4 | CRÍTICA | `router.push("/")` → pierde locale prefix |
| `src/app/[locale]/login/page.tsx` | `Link` de `next/link` | 1 | ALTA | Links a `/recuperar` y `/registro` sin locale |
| `src/app/[locale]/registro/page.tsx` | `Link` de `next/link` | 1 | ALTA | Links sin locale |
| `src/app/[locale]/recuperar/page.tsx` | `Link` de `next/link` | 1 | ALTA | Link a `/login` sin locale |
| `src/components/reto/RetoClient.tsx` | `Link` de `next/link` | 4 | ALTA | Link a `/` sin locale |
| `src/app/[locale]/clanes/ClanesClient.tsx` | `Link` de `next/link` | 4 | ALTA | Links a `/clanes/mundo` y `/perfil/` sin locale |
| `src/app/[locale]/social/Feed.tsx` | `useRouter` de `next/navigation` + `Link` de `next/link` | 4-5 | ALTA | `router.push()` a rutas sin locale |
| `src/app/[locale]/social/FeedSidebar.tsx` | `Link` de `next/link` | 4 | ALTA | Links sin locale |
| `src/app/[locale]/ajustes/page.tsx` | `Link` de `next/link` | 1 | ALTA | Links a `/terminos` y `/privacidad` sin locale |
| `src/app/[locale]/trigonometria/page.tsx` | `Link` de `next/link` | 2 | ALTA | Links sin locale |
| `src/app/[locale]/trigonometria/elegir/page.tsx` | `Link` de `next/link` | 2 | ALTA | Links sin locale |
| `src/app/[locale]/trigonometria/TrigonometriaPracticaClient.tsx` | `useRouter` de `next/navigation` | 4 | CRÍTICA | `router.push()` pierde locale |
| `src/app/[locale]/melodia/page.tsx` | `Link` de `next/link` | 2 | ALTA | Links sin locale |
| `src/app/[locale]/melodia/elegir/page.tsx` | `Link` de `next/link` | 2 | ALTA | Links sin locale |
| `src/app/[locale]/melodia/MelodiaPracticaClient.tsx` | `useRouter` de `next/navigation` | 4 | CRÍTICA | `router.push()` pierde locale |
| `src/app/[locale]/melodia/diagnostico/DiagnosticoMelodiaClient.tsx` | `useRouter` de `next/navigation` | 4 | CRÍTICA | `router.push()` pierde locale |
| `src/app/[locale]/melodia/aprender/[slug]/page.tsx` | `notFound` de `next/navigation` | 1 | BAJA | Solo `notFound()`, no afecta navegación |
| `src/app/[locale]/melodia/aprender/[slug]/LeccionMelodiaClient.tsx` | `useRouter` de `next/navigation` + `Link` de `next/link` | 4-5 | CRÍTICA | Ambos pierden locale |
| `src/app/[locale]/geografia/page.tsx` | `Link` de `next/link` | 2 | ALTA | Links sin locale |
| `src/app/[locale]/geografia/elegir/page.tsx` | `Link` de `next/link` | 2 | ALTA | Links sin locale |
| `src/app/[locale]/geografia/GeografiaPracticaClient.tsx` | `useRouter` de `next/navigation` | 4 | CRÍTICA | `router.push()` pierde locale |
| `src/app/[locale]/geografia/aprender/[slug]/page.tsx` | `notFound` de `next/navigation` | 1 | BAJA | Solo notFound |
| `src/app/[locale]/geografia/aprender/[slug]/LeccionGeografiaClient.tsx` | `useRouter` de `next/navigation` + `Link` de `next/link` | 4-5 | CRÍTICA | Ambos pierden locale |
| `src/app/[locale]/enigmia/practica/EnigmiaPracticaClient.tsx` | `useRouter` de `next/navigation` | 4 | CRÍTICA | `router.push()` pierde locale |
| `src/app/[locale]/enigmia/diagnostico/DiagnosticoEnigmiaClient.tsx` | `useRouter` de `next/navigation` | 4 | CRÍTICA | `router.push()` pierde locale |
| `src/app/[locale]/enigmia/aprender/[slug]/page.tsx` | `notFound` de `next/navigation` | 1 | BAJA | Solo notFound |
| `src/app/[locale]/enigmia/aprender/[slug]/LeccionEnigmiaClient.tsx` | `useRouter` de `next/navigation` | 4 | CRÍTICA | `router.push()` pierde locale |
| `src/app/[locale]/quimia/page.tsx` | `Link` de `next/link` | 2 | ALTA | Links sin locale |
| `src/app/[locale]/quimia/elegir/page.tsx` | `Link` de `next/link` | 2 | ALTA | Links sin locale |
| `src/app/[locale]/quimia/QuimiaPracticaClient.tsx` | `useRouter` de `next/navigation` | 4 | CRÍTICA | `router.push()` pierde locale |
| `src/app/[locale]/quimia/diagnostico/DiagnosticoQuimiaClient.tsx` | `useRouter` de `next/navigation` | 4 | CRÍTICA | `router.push()` pierde locale |
| `src/app/[locale]/quimia/aprender/[slug]/page.tsx` | `notFound` de `next/navigation` | 1 | BAJA | Solo notFound |
| `src/app/[locale]/quimia/aprender/[slug]/LeccionQuimiaClient.tsx` | `useRouter` de `next/navigation` + `Link` de `next/link` | 4-5 | CRÍTICA | Ambos pierden locale |
| `src/app/[locale]/anatomia/page.tsx` | `Link` de `next/link` | 2 | ALTA | Links sin locale |
| `src/app/[locale]/anatomia/elegir/page.tsx` | `Link` de `next/link` | 2 | ALTA | Links sin locale |
| `src/app/[locale]/anatomia/AnatomiaPracticaClient.tsx` | `useRouter` de `next/navigation` | 4 | CRÍTICA | `router.push()` pierde locale |
| `src/app/[locale]/anatomia/diagnostico/DiagnosticoAnatomiaClient.tsx` | `useRouter` de `next/navigation` | 4 | CRÍTICA | `router.push()` pierde locale |
| `src/app/[locale]/anatomia/aprender/[slug]/page.tsx` | `notFound` de `next/navigation` | 1 | BAJA | Solo notFound |
| `src/app/[locale]/anatomia/aprender/[slug]/LeccionAnatomiaClient.tsx` | `useRouter` de `next/navigation` + `Link` de `next/link` | 4-5 | CRÍTICA | Ambos pierden locale |
| `src/app/[locale]/historia/page.tsx` | `Link` de `next/link` | 2 | ALTA | Links sin locale |
| `src/app/[locale]/historia/elegir/page.tsx` | `Link` de `next/link` | 2 | ALTA | Links sin locale |
| `src/app/[locale]/historia/HistoriaPracticaClient.tsx` | `useRouter` de `next/navigation` | 4 | CRÍTICA | `router.push()` pierde locale |
| `src/app/[locale]/historia/diagnostico/DiagnosticoHistoriaClient.tsx` | `useRouter` de `next/navigation` | 4 | CRÍTICA | `router.push()` pierde locale |
| `src/app/[locale]/historia/aprender/[slug]/page.tsx` | `notFound` de `next/navigation` | 1 | BAJA | Solo notFound |
| `src/app/[locale]/historia/aprender/[slug]/LeccionHistoriaClient.tsx` | `useRouter` de `next/navigation` + `Link` de `next/link` | 4-5 | CRÍTICA | Ambos pierden locale |
| `src/app/[locale]/onboarding/OnboardingForm.tsx` | `useRouter` de `next/navigation` | 4 | CRÍTICA | `router.push(next)` — pierde locale |
| `src/app/[locale]/onboarding/diagnostico/DiagnosticoClient.tsx` | `useRouter` de `next/navigation` | 4 | CRÍTICA | `router.push()` pierde locale |
| `src/app/[locale]/mundo-bloqueado/MundoBloqueadoClient.tsx` | `useRouter` de `next/navigation` | 4 | CRÍTICA | `router.push(destino)` pierde locale |
| `src/app/[locale]/practica/SprintRunner.tsx` | (usa `@/i18n/navigation` via props) | — | OK | — |
| `src/app/[locale]/rankeds/serie/[serieId]/SerieDueloClient.tsx` | `useRouter` de `next/navigation` + `Link` de `next/link` | 4-6 | CRÍTICA | `router.push()` pierde locale |
| `src/app/[locale]/profesor/[groupId]/BorrarGrupo.tsx` | `useRouter` de `next/navigation` | — | CRÍTICA | `router.push("/profesor")` pierde locale |
| `src/app/[locale]/profesor/ProfesorClient.tsx` | `useRouter` de `next/navigation` | — | CRÍTICA | `router.push("/")` pierde locale |
| `src/components/landing/FlujoElegirMundos.tsx` | `useRouter` de `next/navigation` | 4 | CRÍTICA | `router.push("/")` pierde locale |
| `src/components/duelos/SalaEsperaDuelo.tsx` | `useRouter` de `next/navigation` | 1 | CRÍTICA | `router.push(volverA)` pierde locale |
| `src/components/duelos/ResultadoDueloBlock.tsx` | `Link` de `next/link` | 3 | ALTA | Links sin locale |
| `src/components/BotonesFinPartida.tsx` | `Link` de `next/link` | 1 | ALTA | Links sin locale |
| `src/components/TopicCard.tsx` | `Link` de `next/link` | 1 | ALTA | Links sin locale |
| `src/components/WorldCard.tsx` | `Link` de `next/link` | 1 | ALTA | Links sin locale |
| `src/components/CaminoContinuo.tsx` | `Link` de `next/link` | 3 | ALTA | Links sin locale |
| `src/components/PageFade.tsx` | `usePathname` de `next/navigation` | 5 | MEDIA | `usePathname()` sin locale-aware |
| `src/app/[locale]/terminos/page.tsx` | `Link` de `next/link` | 1 | ALTA | Link a `/privacidad` sin locale |
| `src/app/[locale]/perfil/BorrarCuenta.tsx` | `useRouter` de `next/navigation` | — | CRÍTICA | `router.push("/login")` pierde locale |
| `src/app/[locale]/invitado-bloqueado/page.tsx` | `Link` de `next/link` + `redirect` de `next/navigation` | 2-3 | ALTA | Link a `/` y redirect sin locale |
| `src/app/[locale]/rankeds-bloqueado/page.tsx` | `Link` de `next/link` | 2 | ALTA | Links sin locale |

**Resumen de navegación:** ~60 archivos usan `next/link` o `next/navigation` en vez de `@/i18n/navigation`. Esto significa que ~60 rutas/redirecciones/pushes pierden el prefijo de idioma cuando el idioma NO es el default (`es`). En español (idioma default) no se nota porque `localePrefix: "always"` aún agrega `/es/` — pero en inglés, cualquier `router.push("/login")` va a `/login` en vez de `/en/login`, causando una redirección del proxy a `/en/login` con un flash visible.

### Deep links y refresh

| Hallazgo | Severidad | Detalle |
|----------|-----------|---------|
| Deep links con `/en/...` | OK | El proxy detecta el locale del pathname correctamente (`localeDePathname` en `src/proxy.ts:19-24`) |
| Refresh mantiene locale | OK | El locale vive en la URL, no se pierde con refresh |
| Logout → `/login` | BUG | `ProfileMenu.tsx:69` usa `router.push("/login")` desde `@/i18n/navigation` → **correcto** (usa el router locale-aware). Pero luego hace `router.refresh()` — esto es correcto. |
| Cierre de sesión va a `/login` | OK | Usa `router.push("/login")` desde `@/i18n/navigation` |
| Formularios post-login/registro → `router.push("/")` | BUG | LoginForm.tsx:32,50 y RegistroForm.tsx:81 usan `useRouter` de `next/navigation` → `router.push("/")` va a `/` sin locale prefix. El proxy redirige, pero hay un flash. **Solución:** migrar a `@/i18n/navigation`. |

---

## Recomendaciones priorizadas

### Prioridad 1 — CRÍTICA (hacer primero)

1. **Migrar todos los `useRouter` de `next/navigation` a `@/i18n/navigation`** (~40 archivos de componentes client). Es el cambio con mayor impacto: sin esto, cada navegación en inglés pierde el prefix. Estimación: 2-3 horas.

2. **Migrar todos los `Link` de `next/link` a `@/i18n/navigation`** (~30 archivos). Mismo impacto que el punto anterior. Estimación: 1-2 horas.

3. **Crear namespace `Auth`** con todas las claves para login, registro, recuperar contraseña y convertir cuenta. Son ~25 claves que cubren 4 pantallas enteras. Estimación: 1 hora.

4. **Crear namespace `Settings`/`Ajustes`** con las ~10 claves de ajustes. Estimación: 30 min.

5. **Crear namespace `Retos`** con las ~15 claves de reto diario/semanal. Estimación: 30 min.

### Prioridad 2 — ALTA

6. **Crear namespaces para mundos** (`Trigonometria`, `Melodia`, `Geografia.page`, `Enigmia`, `Quimia`, `Anatomia`, `Historia`) — cada uno con ~10-15 claves para títulos, descripciones, modos, y SEO metadata. Estimación: 3-4 horas total.

7. **Crear namespace `Clanes`** con las ~30 claves de toda la UI de clanes. Estimación: 1.5 horas.

8. **Crear namespace `Leaderboard`** con ~7 claves. Estimación: 30 min.

9. **Crear namespace `Onboarding`** con ~9 claves. Estimación: 30 min.

10. **Traducir Términos y Privacidad** — mover contenido legal a JSON namespaces o a archivos MD por locale. Estimación: 1-2 horas.

11. **Mapear errores SQL→cliente** — cambiar `respuestaError.ts` para enviar `{ error, code }` y traducir en el cliente. Estimación: 1 hora.

12. **Traducir edge functions** — tabular pushes por `profiles.idioma`. Estimación: 1 hora.

### Prioridad 3 — MEDIA

13. **Crear namespace `Mundos.nombres`** compartido por todas las pantallas (MundoSelector, Perfil, Feed, NivelMundoSubio, RetoClient). Estimación: 30 min.

14. **Crear namespace `Error`** para el error boundary global. Estimación: 15 min.

15. **Crear namespace `Invitado`** para la pantalla de invitado bloqueado. Estimación: 15 min.

16. **Crear namespace `MundoBloqueado`** para la pantalla de mundos bloqueados. Estimación: 30 min.

17. **Crear `Common.practicar` / `Common.aprender`** reutilizables por todas las home de mundos. Estimación: 15 min.

18. **Traducir títulos de `CATALOGO_TITULOS`** — agregar un sistema de traducción para los ~40 títulos de logro. Estimación: 1-2 horas.

### Prioridad 4 — BAJA

19. **Traducir contenido educativo** — anatomía (etiquetas, enunciados), enigmia (categorías), geografía (regiones). Estimación: 2-3 horas.

20. **Traducir `NOMBRE_MODO_ANATOMIA`**, `ETIQUETA_BAJO/ALTO`, enunciados de anatomía. Estimación: 1 hora.

---

## Estado por área

| Área | Estado | Notas |
|------|--------|-------|
| **Infraestructura i18n** | ✅ Bien configurada | routing.ts, request.ts, navigation.ts, proxy.ts — todo correcto |
| **es.json vs en.json** | ✅ 100% paridad | Sin claves faltantes, sin traducciones rotas |
| **Nav/Header** | ✅ Bien internationalizado | Usa `useTranslations`, usa `@/i18n/navigation` |
| **Landing** | ✅ Bien internationalizado | Usa `useTranslations` |
| **Home** | ✅ Bien internationalizado | Usa `getTranslations` |
| **Numeria** | ✅ Bien internationalizado | Usa `getTranslations` |
| **Práctica** | ✅ Mayormente bien | Usa `useTranslations`, pero prácticas de mundos nuevos no |
| **Aprender** | ✅ Bien internationalizado | Usa `useTranslations` |
| **Tienda** | ✅ Bien internationalizado | Usa `useTranslations` |
| **Social/Amigos** | ⚠️ Mayormente bien | Feed.tsx tiene strings hardcodeados |
| **Perfil** | ⚠️ Mayormente bien | Nombres de mundos en afinidad hardcodeados |
| **Rankeds** | ✅ Bien internationalizado | Usa `useTranslations` |
| **Auth** | ❌ 100% hardcodeado | Login, registro, recuperar, convertir — sin i18n |
| **Ajustes** | ❌ 100% hardcodeado | Sin i18n |
| **Retos** | ❌ 100% hardcodeado | Sin i18n |
| **Clanes** | ❌ 100% hardcodeado | Sin i18n |
| **Leaderboard** | ❌ 100% hardcodeado | Sin i18n |
| **Onboarding** | ❌ 100% hardcodeado | Sin i18n |
| **Trigonometría** | ❌ 100% hardcodeado | Home, elegir, prácticas, aprender |
| **Melodía** | ❌ 100% hardcodeado | Home, elegir, prácticas, aprender |
| **Geografía** | ❌ 100% hardcodeado | Home, elegir, prácticas, aprender |
| **Enigmia** | ❌ 100% hardcodeado | Home, prácticas, aprender |
| **Quimia** | ❌ 100% hardcodeado | Home, elegir, prácticas, aprender |
| **Anatomía** | ❌ 100% hardcodeado | Home, elegir, prácticas, aprender |
| **Historia** | ❌ 100% hardcodeado | Home, elegir, prácticas, aprender |
| **Términos** | ❌ 100% hardcodeado | Todo el contenido legal |
| **Privacidad** | ❌ 100% hardcodeado | Todo el contenido legal |
| **Error boundary** | ❌ 100% hardcodeado | Sin i18n |
| **Mundo bloqueado** | ❌ 100% hardcodeado | Sin i18n |
| **Invitado bloqueado** | ❌ 100% hardcodeado | Sin i18n |
| **Edge functions** | ❌ Pushes hardcodeados en español | notify-duelo, racha-en-riesgo |
| **SQL errors** | ⚠️ Parcialmente problematico | `raise exception` en español llega crudo al cliente |
| **Contenido educativo** | ⚠️ Contenido en español | Anatomía, Enigmia, Geografía — contenido generado |
| **Títulos/Logros** | ❌ 40+ títulos hardcodeados | Catálogo completo en español |
| **Navegación (Link/router)** | ❌ ~60 archivos usan next/navigation en vez de @/i18n/navigation | Bug de prefix perdido en idioma no-default |

---

## Actualización F3 (2026-09-09) — Español neutro latinoamericano + voseo estructurado

### Hecho en esta tanda
- **Voseo en messages/es.json**: ~53 strings normalizadas a tuteo (tenés→tienes, podés→puedes,
  querés→quieres, necesitás→necesitas, elegí→elige, probá→prueba, mirá→mira, intentá→intenta,
  completá→completa, jugá→juega, andá→anda, buscá→busca, sumate→súmate, probalo→pruébalo,
  retalos→rétalos, apretés→aprietes, revisá→revisa, multiplicá→multiplica, redondeá→redondea,
  etc.). **Paridad es/en confirmada 555/555 claves** (antes del
  audit figuraban 300; el archivo tiene más claves hoy). Voseo residual: solo «más»/«estás»
  (neutrales, NO voseo) tras 3 pasadas del mapa.
- **Voseo hardcodeado en 13 archivos** de clientes/páginas/API corregido (SalaEsperaDuelo,
  ConvertirCuenta, mensajeErrorAuth, feed/retar, profesor/crear-grupo, 5× Diagnóstico de mundos,
  ClanesClient, login, registro, FeedSidebar, privacidad, terminos, Onboarding DiagnosticoClient,
  MundoBloqueado).
- **Backend/RPC**: nueva migración 0128_espanol_neutro.sql recrea 9 funciones únicamente con
  raise exception en neutro (reportar_usuario, crear_problema_personalizado, reportar_post,
  unirse_invitacion_duelo, crear_clan, reportar_mensaje_clan, mensajes_de_clan, desbloquear_mundo,
  elegir_mundos_iniciales). Verificada por script: solo difieren los literales de mensaje.
- **docs/TERMINOLOGY.md** creado: tabla voseo→neutro, excepciones (estás/más/pretéritos), criterios.

### Hallazgos que SIGUEN abiertos del audit (sin cambios en esta tanda)
1. ~75 archivos usan next/navigation o next/link en vez de @/i18n/navigation; 12 críticos en
   Auth/Clanes/Retos/SEO.
2. Pantallas completas hardcodeadas en español: login, registro, ajustes, retos, clanes, términos
   y privacidad, feed, mundo-bloqueado, onboarding (sin claves i18n).
3. SEO metadata (~15 páginas) y ~40 títulos de logros + nombres de modos/mundos en src/lib sin i18n.
4. Edge functions mandan pushes en español.

### PENDIENTE (contenido didáctico, requiere decisión + DB)
Tips/hints/lecciones seed con rioplatense en migraciones ya aplicadas:
- 0005:71 (pasos JSON, Mirá/Sumá×2), 0015:123/152/166, 0026:48/51, 0027:31, 0032:25/49,
- 0056:449, 0089:312, 0101:51/58/103, 0108:389, 0109:358/380/389/395.
Corregir implica UPDATEs sobre filas/columnas varias sin DB; se documenta para un pase de contenido.
