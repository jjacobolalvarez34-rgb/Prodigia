# MASTER-AUDIT — Auditoría maestra

> Historia central de auditorías por dominio. Estado de cada sección al día; el detalle completo por dominios (RLS, economía, marketing, paridad, performance, mobile) vive en los sub-carpeta/informes.
> Método: verificado contra CÓDIGO real, con estados de `docs/AGENT-RULES.md` §1. NUNCA documentos-vs-código inventando.

## Matriz de auditorías

| Dominio | Estado | Última auditoría | Resultado | Dueño |
|---|---|---|---|---|
| Mapa/arquitectura (rutas, RPC, migraciones) | VERIFICADO | 2026-09-07 | Ver AUDIT-MAPA-2026-09-07.md. 111 páginas, 32 route handlers, 122 RPC únicos (250 defs), 115 migraciones. F-M1 (elegir_mundo_inicial legacy), F-M2 (docs 70→111), F-M4 (cierre semanal por tráfico) | repo-architect |
| RLS y seguridad (permisos, grants, riesgo) | VERIFICADO (parcial) | 2026-09-07 | Ver AUDIT-RLS-SEGURIDAD-2026-09-07.md. S0-S4/S8 CORREGIDAS en 0120 (queda S5/S9); S6/S7/S10 CORREGIDAS en 0115 | auth-security |
| Usuarios / ranking público | VERIFICADO | 2026-09-08 | Ver USER-RANKING-AUDIT.md. Cuentas incompletas en ranking ELO (5/14) + anon key legible → fix 0119 (PENDIENTE aplicar en prod). 0042 confirmado APLICADO en prod (desmentido) | auth-security+matchmaking |
| Economía y tienda | PENDIENTE (diseño) | 2026-09-08 | S0/S1 CORREGIDOS en 0120 (queda S5 de la misma familia). Trastienda: DISEÑO listo (TRASTIENDA-ECONOMIA.md + TRASTIENDA-DESIGN.md) | store-economy |
| Marketing (copy, CTA, embudos) | VERIFICADO (browser) | 2026-09-08 | 30 capturas reales de la app en docs/marketing/assets/pantallas-reales/ + REAL-APP-2026-09-08.md (5 claims REAL) + 16 docs de marketing | marketing |
| Paridad de mundos | VERIFICADO (2026-08-27, PARIDAD_MUNDOS.md) | — | Numeria de referencia; hallazgos en doc | qa-e2e |
| Retos diarios/semanales | VERIFICADO | 2026-09-07 | Fix de conteo doble en src/lib/progresoReto.ts + RetoClient.tsx; 110/110 tests | daily-weekly-challenges |
| Matchmaking casual vs ranked | VERIFICADO | 2026-09-08 | Ver CASUAL-AUDIT-2026-09-08.md. E2E real (2 anon): casual no toca ELO ni cola ranked. BUG#1/#3/#4 FIX en cliente; BUG#2/#5 → migración pendiente | matchmaking |
| Reto directo a amigo | VERIFICADO | 2026-09-08 | Ver RETO-DIRECTO-AMIGO-2026-09-08.md. 2 bugs reales reproducidos + corregidos (NotificacionesDuelo: onAuthStateChange + hrefDuelo). E2E 2 cuentas QA | social/frontend/qa |
| Invitación por link | VERIFICADO | 2026-09-08 | Ver INVITACION-LINK-AUDIT-2026-09-08.md. Fix Quimia aplicado. Hallazgos sin fix: clasificatorio=true en link + sin expiración de duel_invites | social/frontend/qa |
| Niveles de mundos | VERIFICADO (código) | 2026-09-08 | Ver NIVELES-MUNDOS-2026-09-08.md. Curva exigía dominio nivel 10 (inalcanzable) → fix 0117 (registrar_progreso_mundo). PENDIENTE aplicar a prod | gameplay |
| Niveles personales + recompensa | VERIFICADO (código) | 2026-09-08 | Ver NIVELES-PERSONALES-2026-09-08.md. Curva ~816 constante confirmada → escalera por tramos 0118. 1000 flat RECHAZADO → **50·n+250 APROBADO por PO (2026-09-08)** | gameplay+store-economy |
| Animación level up | SPEC (P2) | 2026-09-08 | Ver LEVEL-UP-ANIMACION-2026-09-08.md. Trigger identificado (finish no expone nivelCuenta); implementación pendiente | gameplay/visual-design |
| Performance/bundle | PENDIENTE | — | — | performance |
| Mobile/Capacitor | PENDIENTE | — | — | mobile-capacitor |
| Accesibilidad | PENDIENTE | — | — | accessibility-a11y |
| Observabilidad/logs | PENDIENTE | — | — | observability |

## Hallazgos abiertos (backlog global)

- [x] CRÍTICO — acreditar_chispas sin validar p_user_id = auth.uid() (S10) → CORREGIDO en 0115 (guard + revoke)
- [x] CRÍTICO — registrar_xp_diario acepta p_xp arbitrario (Chispas/XP infinitas) → CORREGIDO en 0120 (deriva XP real del día)
- [x] CRÍTICO — registrar_puntos_mundo p_puntos verbatim → nivel_mundo/marcos/títulos fabricables → CORREGIDO en 0120 (deriva de attempts reales; registrar_puntos_mundo delega)
- [x] ALTO — policies amplias de skill_levels / attempts / daily_progress / logic_attempts (S2/S3/S4/S8); migrar a funciones security definer → CORREGIDO en 0120 (dropeadas; alta vía insertar_intento/insertar_intento_logica; daily_progress solo vía registrar_xp_diario)
- [ ] ALTO — resolver_apuesta_si_activa con p_precision del cliente → apuesta siempre ganada (S5)
- [ ] BAJO — edge functions públicas sin verificación de JWT/firma (S9)
- [x] MEDIO — handle_new_user sin set search_path (S6) → CORREGIDO en 0115
- [x] MEDIO — friendships INSERT permitía estado='aceptada' (S7) → CORREGIDO en 0115
- [x] P0 selección de 2 mundos → CORREGIDO (0116 + guard/pickers); aplicar 0116 y verificar en vivo
- [x] Matchmaking casual: no usa ELO ni se mezcla con ranked → CONFIRMADO por E2E; BUG#2 (bots) y BUG#5 (doble resolución) pendientes de migración
- [ ] Casual BUG#2: fallback de bot no condicionado a p_ranked (0109:552-560) → migración
- [ ] Casual BUG#5: registrar_resultado_duelo sin guard de estado → feed duplicado / ELO duplicado → migración
- [ ] Easy casual: limpiar duelos fantasma pendientes en prod (filas señaladas en CASUAL-AUDIT)
- [ ] Invitación link: decidir clasificatorio=true vs casual (discrepancia producto/código) + expiración de duel_invites
- [ ] Ranking: aplicar 0119 a prod + re-verificar (9 filas en ranking_elo_global) + decisión datos cuentas QA
- [ ] Niveles mundo: aplicar 0117 a prod + re-observar niveles
- [x] Niveles personales: aprobar recompensa (50·n+250) + aplicar 0118 — **APROBADA (2026-09-08)**; 0118 aplicada por PO
- [ ] Trastienda: implementación (diseño listo; **moneda = mismas Chispas, confirmado por PO**) + aplicar 0120 (S0/S1 ya resuelto; prerequisito de seguridad cumplido)
- [ ] Level up: implementar finish route con nivelCuenta + overlay (spec lista)
- [ ] Migración 0116 pendiente de aplicar a prod (flujo 2 mundos)
- [ ] ESPECIFICACION.md (5 mundos) vs código (8)
- [ ] MECANICA.md desactualizada
- [ ] README.md desactualizado
- [ ] Mapa: F-M1 `elegir_mundo_inicial` legacy grantada (revoke/marcado en tanda futura) — ver AUDIT-MAPA
- [ ] Mapa: F-M4 cierre semanal de clanes depende del tráfico (scheduled job opcional) — ver AUDIT-MAPA
- [ ] Email/SMTP pendiente

---
*Los informes detallados se agregan como `docs/audits/AUDIT-<dominio>-<YYYY-MM-DD>.md`.*