# F10: Auditoría UX de Producto Final

**Fecha**: 2026-09-09 | **Alcance**: ~100 páginas/60 componentes de UI — flujos, affordances, feedback (carga/vacío/error), onboarding, navegación, coherencia copy.
**Método**: revisión por código (`file:line`). Sin browser/DB/tunnel.
**Base previa**: `PRODUCT-UX-AUDIT.md` (2026-09-09, 42 hallazgos ALTA14/MEDIA17/BAJA11).

---

## 1. Resumen ejecutivo

| Severidad (F10) | Nuevo | Heredado abierto |
|---|---|---|
| P0 | 2 | 3 |
| P1 | 2 | 6 |
| P2 | 2 | 4 |
| P3 | 3 | 2 |

**Cierres aplicados este pase**: 0.
Razón: todas las correcciones identificadas requieren decisión de producto (comportamiento/afordance), pertenecen a otra fase (i18n/F3, visual/F11), o son mejoras menores que no justifican el riesgo de cambio sin validación visual. Se documentan como cierres recomendados (listos para aplicar cuando PO esté disponible). Patrón consistente con fases F8/F9 del repo.

---

## 2. Top 5 hallazgos (file:line)

| # | Hallazgo | Severidad | Evidencia |
|---|---|---|---|
| 1 | **ProfileMenu salir() sin confirmación**: cierra sesión a un toque accidental | P0 | `src/components/ProfileMenu.tsx:66-71` |
| 2 | **Tienda inconsistencia de confirmación**: fuentes/marcos/marco-mundo/paquete compran directo sin 2-step; items de utilidad sí confirman | P1 | `src/app/[locale]/tienda/TiendaClient.tsx:274,324,380,601` vs `:539-561` |
| 3 | **Sin Toast global**: errores de red/acción muestran inline `setError` sin feedback persistente | P0 | `TiendaClient.tsx:128,139`, `ClanesClient.tsx:178`, `AmigosClient.tsx:141` — 71+ catch silenciosos |
| 4 | **Sin opción "Cuenta" en Ajustes**: no hay cambio de email/password ni vinculación desde ajustes | P1 | `src/app/[locale]/ajustes/AjustesClient.tsx` (103 líneas, solo 4 toggles) |
| 5 | **Hardcoded Spanish en Leaderboard** (no i18n): "Cargando..." vs `RankingElo` que sí traduce | P3 | `src/app/[locale]/leaderboard/LeaderboardClient.tsx:143` |

---

## 3. Tabla completa de hallazgos

| FLUJO | HALLAZGO | SEV | EVIDENCIA file:line | RECOMENDACIÓN | PRODUCT-UX-AUDIT |
|---|---|---|---|---|---|
| **ProfileMenu (global)** | "Salir" cierra sesión sin confirmar; toque accidental cierra sesión | P0 | `src/components/ProfileMenu.tsx:66-71` | 2-step confirm (patrón `BotonRendirse.tsx:44-66`) | #25 (abierto) |
| **Tienda / cosmos** | Fuentes, marcos, marco-mundo y paquete compran directo sin 2-step; utilidad sí confirman | P1 | `TiendaClient.tsx:274,324,380,601` vs `:539-561` | Unificar affordance en todos los ítems | #9 (parcial) |
| **Ajustes (global)** | Sin opción para cambiar email/password ni vincular cuenta | P1 | `AjustesClient.tsx` (103 líneas, solo 4 toggles) | Agregar sección "Cuenta" | NUEVO |
| **ConvertirCuenta + Ajustes** | No hay revinculación ni gestión de credenciales desde ajustes | P1 | `ConvertirCuenta.tsx:59-62`, `AjustesClient.tsx` (sin sección) | Feature nueva; requiere decisión PO sobre OAuth | NUEVO |
| **Errors / feedback (global)** | 71+ `catch` silenciosos: usuario pulsa acción y no pasa nada sin toast ni retry | P0 | `TiendaClient.tsx:128,139`, `ClanesClient.tsx:178`, `AmigosClient.tsx:141` | Toast central + dialog acciones destructivas | #2/#8 (abierto) |
| **Leaderboard** | "Cargando..." hardcodeado español (no i18n), inconsistente con `RankingElo` | P3 | `LeaderboardClient.tsx:143` | Mover a `useTranslations` | NUEVO |
| **Perfil [userId]** | `nivel_mundo ?? 1` muestra nivel 1 falso sin hint "jugá para descubrir tu nivel" | P3 | `perfil/[userId]/page.tsx:151` | Hint copy cuando `fila` es undefined | #21 (abierto) |
| **Home Numeria/Enigmia** | `nivel ?? 1` con barra vacía sin copy para primerizos | P2 | `numeria/page.tsx:51`, `enigmia/page.tsx:37` | Hint "Jugá para ver tu nivel" | #21 (abierto) |
| **Navegación / CTA** | Numeria → `/practica/temas`, Enigmia → `/enigmia/practica` (jerarquía inconsistente) | P0 | `numeria/page.tsx:139` vs `enigmia/page.tsx:71` | Unificar ruta práctica (requiere decisión PO) | #20 (abierto) |
| **Onboarding** | Sin stepper/indicador de progreso visible entre pasos | P1 | `OnboardingForm.tsx` (flujo secuencial sin indicador) | Stepper con pasos numerados | #4 (abierto) |
| **ClanesClient** | "Tenés" voseo visible (inconsistencia con convención tuteo F3) | P2 | `ClanesClient.tsx:561` | "Tienes" | D-04 (abierto) |
| **Mundo-bloqueado** | "Tenés" voseo visible | P2 | `MundoBloqueadoClient.tsx:60` | "Tienes" | D-04 (abierto) |
| **clanes/mundo** | "Hacé click" voseo visible | P2 | `clanes/mundo/page.tsx:30` | "Haz clic" | D-04 (abierto) |
| **SubtemaPicker** | `text-white` sobre superficie coloreada — riesgo contraste | P1 | `SubtemaPicker.tsx:58,65` | Contraste calculado según luminancia | #23 (abierto) |
| **Header / tabs** | `aria-pressed` en tabs sin patrón `tablist`/`tab` | P1 | `LeaderboardClient.tsx:89-130`, `RankedsClient.tsx:79-83` | `role="tablist"` + `aria-selected` | #14/#18 (abierto) |
| **Perfil (editar)** | Logros/títulos vacíos sin empty state | P1 | `perfil/page.tsx` (secciones vacías) | "Aún no tenés logros — jugá para desbloquearlos" | #11 (abierto) |
| **SalaEsperaDuelo** | "Vos, listo" / "Esperando a..." hardcodeado español (no i18n) | P3 | `SalaEsperaDuelo.tsx:95-100` | Mover a i18n | NUEVO |
| **error.tsx (global)** | "Algo no cargó bien" / "Reintentar" hardcodeado español | P3 | `error.tsx:25-35` | Keys i18n globales | #33 (parcial) |

---

## 4. Por qué 0 cierres riesgo-cero este pase

| Candidato | Razón por la que NO es cierre riesgo-cero |
|---|---|
| Confirmar salir (ProfileMenu) | Cambio de comportamiento/UX — requiere decisión PO |
| 2-step fuentes/marcos (Tienda) | Cambio de comportamiento — requiere decisión PO sobre consistencia vs flujo rápido |
| "Tenés" → "Tienes" (3 archivos) | Fix de F3 incompleto — mejor encapsular en F3-clean-up, no difusión dispersa |
| Vinculación cuenta (Ajustes) | Feature nueva — requiere decisión PO (¿soporte OAuth?) |
| `nivel ?? 1` → hint | Copy adicional — requiere decisión de copy/tono |
| Hardcoded ES → i18n (leaderboard, sala, error.tsx) | Fix i18n — pertenece a F3/I18N-AUDIT, no F10 |

---

## 5. Reconciliación con PRODUCT-UX-AUDIT

### Cerrados / Verificados en código (F10)

| # | Hallazgo | Estado F10 | Evidencia |
|---|---|---|---|
| 17 | RankingElo empty state | **CERRADO** | `RankingElo.tsx:103-106`, `:184-187` |
| 26 | Rendirse sin confirmación | **CERRADO** | `BotonRendirse.tsx:44-66` |
| 27 | Sala espera sin timeout | **CERRADO** | `SalaEsperaDuelo.tsx:70-86` (estado agotado + CTA) |
| 33 | error.tsx sin retry | **CERRADO** (parcial) | `error.tsx:33-35` — Boton "Reintentar" |
| 34 | loading.tsx genérico | **CERRADO** | `loading.tsx:9-12` — LogoSpinner |
| 3 | Recuperar sin copy | **CERRADO** | `RecuperarForm.tsx:35-37` |
| 15 | Amigos empty state | **CERRADO** | `AmigosClient.tsx:109-112` |
| 9 | Tienda sin confirmación | **CERRADO** (parcial) | Utilidad 2-step ✓; Fuentes/Marcos sin confirm → nuevo hallazgo |

### Siguen abiertos (verificados F10)

| # | Hallazgo | Confirmado |
|---|---|---|
| 20 | CTA "Practicar" inconsistente | SÍ |
| 21 | `nivel ?? 1` sin copy | SÍ |
| 23 | SubtemaPicker contraste | PENDIENTE visual |
| 25 | ProfileMenu salir sin confirm | SÍ |
| 14/18 | Tabs aria-pressed | SÍ |

---

## 6. Pendientes que requieren decisión PO o browser

1. **Vincular/revincular cuenta** (requisito 4): NO hay opción en Ajustes. Verificar si se necesita feature nueva.
2. **Confirmar salir ProfileMenu**: decisión — siempre confirmar? ¿solo móvil?
3. **2-step fuentes/marcos de Tienda**: decisión — ¿consistencia total o flujo rápido?
4. **Unificar rutas de práctica** (numeria vs resto): decisión arquitectura.
5. **Toast central / dialog**: decisión infraestructura UX (componente compartido).
6. **Voseo residual F3**: 67+ instancias en 30+ archivos TSX (TERMINOLOGY.md:10-53 confirma convención tuteo). Requiere limpieza F3 dedicada, no este pase.

---

## 7. Cobertura de auditoría

| Flujo principal | Archivos leídos | Estado |
|---|---|---|
| Onboarding + diagnóstico | `onboarding/page.tsx`, `OnboardingForm.tsx`, `DiagnosticoClient.tsx`, `guard.ts` | ✓ |
| Login / Registro / Recuperar / Actualizar password | `LoginForm.tsx`, `page.tsx`, `RegistroForm.tsx`, `RecuperarForm.tsx`, `ActualizarPasswordForm.tsx` | ✓ |
| Home + Homes mundos (numeria/enigmia) | `[locale]/page.tsx`, `numeria/page.tsx`, `enigmia/page.tsx` | ✓ |
| Práctica + Sprint + Resultados | `PracticaClient.tsx`, `SprintSummary.tsx`, `SprintRunner.tsx`, `OperationPicker.tsx`, `SubtemaPicker.tsx` | ✓ |
| Duelos + Rankeds | `RankedsClient.tsx`, `RankingElo.tsx`, `SalaEsperaDuelo.tsx`, `BotonRendirse.tsx`, `ApostarPartida.tsx` | ✓ |
| Tienda + Trastienda | `TiendaClient.tsx`, `ApostarPartida.tsx` | ✓ |
| Clan + Mundo de clanes | `ClanesClient.tsx` | ✓ |
| Amigos | `AmigosClient.tsx` | ✓ |
| Leaderboard | `LeaderboardClient.tsx` | ✓ |
| Perfil (propio + público) | `[locale]/perfil/page.tsx`, `perfil/[userId]/page.tsx`, `BorrarCuenta.tsx`, `NombreEditable.tsx` | ✓ |
| Retos diario/semanal | `reto-diario/page.tsx`, `reto-semanal/page.tsx` | ✓ |
| Bloqueos (mundo/rankeds/invitado) | `MundoBloqueadoClient.tsx`, `rankeds-bloqueado/page.tsx`, `invitado-bloqueado/page.tsx` | ✓ |
| Ajustes | `AjustesClient.tsx` | ✓ |
| Header + Navegación global | `Header.tsx`, `ProfileMenu.tsx`, `MundoSelector.tsx` | ✓ |
| Global: loading/error | `loading.tsx`, `error.tsx` | ✓ |
| ConvertirCuenta | `ConvertirCuenta.tsx` | ✓ |
| No auditados (out of scope o deactivated) | Social/Feed (disabled), Admin, Profesor (nav-deactivated), per-world variants (same structure), Terminos/Privacidad (static), ChatDeClan | — |

---

*Auditoría completada por código. Sin cambios de código ni migraciones aplicadas. Sin acceso a DB/browser/tunnel.*
