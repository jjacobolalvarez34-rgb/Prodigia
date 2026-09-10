# Calibra — Informe Final del Mega-Sprint (2026-09-09)

> Documento accionable para aplicar las migraciones pendientes y retestear por tunnel.
> Estado del código: verificado (tsc 0 · eslint 0 · vitest 147/147 · build OK).

---

## 1) Índice de auditorías

| Audit | Cierra / Es sobre | Estado |
|---|---|---|
| `docs/FINAL-AUDIT-STATUS.md` | Vetado del proyecto, documentación, inventario | Completado (F0) |
| `docs/audits/REQUIREMENTS-CHECKLIST.md` | 65+ requisitos funcionales vs código | Revisado F1/F7/F14/15 |
| `docs/audits/SECURITY-BASIC-AUDIT.md` | RLS/economía: familia S0-S4/S8 cerrada en 0120; **S5/S9 abiertos** | PENDIENTE-DB |
| `docs/audits/I18N-AUDIT.md` | Español neutro LA + i18n 555/555 | Completado (F3) |
| `docs/audits/MARKETING-AUDIT.md` | Marketing + eje oscuro | Completado (F4) |
| `docs/audits/STORE-ECONOMY-AUDIT.md` | Tienda/trastienda economía | Completado (F5) |
| `docs/audits/TRASTIENDA-ECONOMIA.md` | Economía trastienda | Header IMPLEMENTADO |
| `docs/audits/PROGRESION-AUDIT.md` | Niveles mundo/cuenta, recompensas, bonus invisible al cliente | Completado (F6) |
| `docs/audits/RANKEDS-AUDIT.md` | Rankeds/clanes, ELO, matchmaking | Completado (F7) |
| `docs/audits/DUELOS-AUDIT.md` | Duelo casual/ranked + feed social (plan PROPUESTA) | Completado (F8) |
| `docs/audits/BROWSER-TESTING-PLAN.md` | Plan de verificación en navegador (55 ítems/9 flujos) | Completado (F9) → Paso 2 |
| `docs/audits/UX-AUDIT.md` | UX final (18 hallazgos, requieren decisión PO) | Completado (F10) |
| `docs/audits/VISUAL-CONSISTENCY-AUDIT.md` | Consistencia visual (tokens/dark) | Completado (F11) |
| `docs/audits/FUNCION-VS-MARKETING.md` | Promesa vs realidad (24 claims; 2 falsos) | Completado (F12) |

---

## 2) PASO 1 — APLICAR MIGRACIONES (orden estricto)

> Requisito previo: backup / export del esquema actual antes de empezar.
> Aplicar en el orden exacto, uno por uno; no saltear ninguno.

**Bloque A — progreso/economía/seguridad:**
1. `0116_fix_elegir_dos_mundos.sql` — corrige la selección de 2 mundos en bienvenida.
2. `0117_curva_nivel_mundo.sql` — curva de niveles de mundo.
3. `0118_niveles_cuenta_recompensas.sql` — niveles de cuenta + recompensa 50n+250.
4. `0119_filtro_ranking_usuarios_permanentes.sql` — ranking anti-anónimos.
5. `0120_cerrar_s0_s1.sql` — **CRÍTICO: crea los RPC `insertar_intento`/`insertar_intento_logica`** a los que llaman `src/app/api/attempts/route.ts` y `src/app/api/logic-attempts/route.ts`. **Sin esta migración, práctica y duelo/rankeds devuelven 0 XP y 0 aciertos guardados.** Además cierra la familia S0-S4/S8.
6. `0121_trastienda_economia.sql` — economía de trastienda.
7. `0122_arreglo_pizarra.sql` — fix de pizarra.

**Bloque B — trastienda/casino/minijuegos:**
8. `0123_trastienda_mecanicas_123.sql` — mecánicas 1/2/3.
9. `0124_trastienda_minijuegos.sql` — minijuegos.
10. `0125_recalcular_niveles_mundo_y_saneo.sql` — recalcula niveles + saneo XP/Chispas negativas + consistencia de nivel_cuenta.
11. `0126_trastienda_limpieza.sql` — elimina Acertijos/Reloj (queda solo "La Calcu") + límites.
12. `0127_trastienda_ruleta_casino.sql` — ruleta/casino (fichas 100/250/500/1000, payouts x0.88, premio raro ~5%, límite 20/día).
13. `0128_espanol_neutro.sql` — recrea 9 funciones RPC con mensajes de error en español neutro LA.

**Después de aplicar todo, en el SQL editor:**

```sql
NOTIFY pgrst, 'reload schema';
```

---

## 3) PASO 2 — RETEST POR TUNNEL (solo ítems que dependen de DB/browser)

> Extraído de `docs/audits/BROWSER-TESTING-PLAN.md` (55 ítems / 9 flujos).
> Marcá (v) el verificado y el resultado esperado de cada uno.

**Cuentas QA:** crear ambos slots con `scripts/crear-usuario-qa.mjs` (campos `es_cuenta_prueba` en 0126). Son necesarias para casino y rankeds.

### Flujo A — Onboarding + práctica (nums/secuencial)
- [ ] A1 Invitado → crear cuenta: onboarding 2 mundos, diagnóstico, mundo bloqueado.
- [ ] A2 Práctica en Numeria: responder 10 → resumen con **aciertos/precisión/XP > 0**. Si da 0, ver Riesgos (causa raíz: 0120 no aplicada).
- [ ] A3 Terminar sprint → badge "subiste de nivel de mundo" (curva 34/45/21).
- [ ] A4 Enigmia: partida → resumen con XP > 0 (`insertar_intento_logica`).
- [ ] A5 Práctica en otro mundo (Geografía/Quimia/Anatomía/Melodía/Trigonometría/Historia) → resumen XP > 0.

### Flujo B — Tienda/Trastienda + Casino
- [ ] B1 Comprar ítem en tienda con Chispas reales (catálogo 24 ítems / 47.900 Chispas).
- [ ] B2 Trastienda → casino: apostar fichas (100/250/500/1000), girar, payout x0.88.
- [ ] B3 Premio raro (~5% de las jugadas) se otorga y aparece.
- [ ] B4 Límite de 20 jugadas/día se cumple (error claro si se excede).
- [ ] B5 Historial de casino muestra las partidas de hoy.
- [ ] B6 Doble-o-nada: apostar 200 + resolver → se acredita/deduce bien (sin deuda).

### Flujo C — Minijuegos (La Calcu)
- [ ] C1 "La Calcu" jugable desde la Trastienda y suma Chispas.
- [ ] C2 Verificar que Acertijos y Reloj NO estén (eliminados en 0126).

### Flujo D — Rankeds
- [ ] D1 Casual: buscar partida casual → juego contra real o bot (sin ELO).
- [ ] D2 Clasificatoria: mejor-de-3 (PantallaVS, 3 rondas, ELO se aplica al final de la serie).
- [ ] D3 Rankeds bloqueado sin nivel 5: aviso claro (`guard.ts:184`).
- [ ] D4 Resultado → desglose de aciertos/precisión/tiempo por rival.

### Flujo E — Duelos/Amigos/Feed
- [ ] E1 Reto directo a amigo (invitación por link) → duelo.
- [ ] E2 Duelo por matchmaking contra bot si no hay oponente en 30s.
- [ ] E3 Feed social: **NO aparece** (desactivado en `SocialClient.tsx:16-19`). Decisión PO: activarlo o quitarlo de la promesa (F12).

### Flujo F — Clanes
- [ ] F1 Crear clan (costo 5000), invitar, chat (realtime), estandarte (2600px).
- [ ] F2 Mapa de parcelas/ciudad del clan.

### Flujo G — Perfil/Ranking
- [ ] G1 Ajustes con sección "Cuenta" (email/password/vincular) — PENDIENTE PO (UX-AUDIT).
- [ ] G2 Leaderboard muestra cuentas permanentes (no anónimas, 0119).

### Flujo H — Dark mode / PWA
- [ ] H1 Toggle oscuro: navegar 3 pantallas y ver contraste/correcto.
- [ ] H2 PWA instalable en Android (sin offline declarado — "instalable" es cierto, "offline" no).

### Flujo I — Español neutro
- [ ] I1 No hay voseo visible (tuteo LA). Excepciones válidas: "más"/"estás".
- [ ] I2 Mensajes de error de las 9 funciones 0128 (clanes, reportes, mundos, apuestas) en neutro.

---

## 4) PASO 3 — REPORTAR

Volcá hacia atrás en el canal del PO cuando algo falle:

```
Flujo (A-I) · Paso (A3/B2/...) · Falla: <qué pasó> · Esperado: <resultado> · Consola/Network: <error exacto>
```

---

## 5) RIESGOS CRÍTICOS

| # | Riesgo | Motivo | Estado |
|---|---|---|---|
| S5 | Apuesta doble-o-nada exploitable | `resolver_apuesta_si_activa` con argumento en `0121:605-649` re-granted al cliente; permite apostar 200 y resolver por 2 → deuda | **BLOQUEADO-POR-DB** (requiere migración + repro en DB). No parcheado |
| S9 | Edge case de seguridad | Documentado en SECURITY-BASIC-AUDIT | BLOQUEADO-POR-DB |
| — | "0 XP / 0 aciertos" en práctica y rankeds | **Causa raíz: RPC `insertar_intento`/`insertar_intento_logica` (0120) NO aplicado a la base.** El código de `src/app/api/attempts/route.ts` y `logic-attempts/route.ts` está verificado y correcto; devuelve 0 cuando el RPC falta o falla la red. Aplicar `0116→0128` en orden + `NOTIFY pgrst` y retestear. | PENDIENTE-USUARIO |

---

## 6) PROGRESIÓN — NOTA SOBRE EL BADGE DE NIVEL (ROLLBACK)

En la fase F6 se implementó un badge "Subiste a nivel de cuenta" (`NivelCuentaSubio` + campo `nivelCuenta` en los finish routes + 13 resúmenes). Se reportó un bug de "0 XP/aciertos" y se decidió REVERTIRLO al 100%: se eliminaron el componente, los bloques de lectura de `nivel_cuenta` antes/después, el campo del response y la key i18n `subisteDeNivel`. El código quedó limpio y verificado. **No reintroducir**; el único entregable de progresión que permanece es `docs/audits/PROGRESION-AUDIT.md` (la recompensa de nivel de cuenta 50n+250 sigue existiendo en SQL pero es invisible al cliente — ver AUDIT, tema para una futura decisión PO).

---

## 7) MENSAJE DE CIERRE

Mega-sprint consolidación cerrado:

- **Código**: verificado (tsc 0 · eslint 0 · vitest 147/147 · build OK); 13 rutas de API tocan RPC security definer (0120+).
- **Pendiente usuario**: aplicar migraciones `0116→0128` + `NOTIFY pgrst` y recorrer el Paso 2.
- **Pendiente PO**: ítems de UX (Confirmar salir, tienda 2-step, sección Cuenta), activar feed social o quitarlo de la promesa, corregir "50% dominio", matizar "tutorial guiado 2 min".
- **Bloqueos DB**: S5 (doble-o-nada), S9.