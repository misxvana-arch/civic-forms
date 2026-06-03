# Matriz de cumplimiento — LGPDPPSO

Cómo el **SGI "Mi Barrio, Mi Patrimonio"** cumple la Ley General de Protección de
Datos Personales en Posesión de Sujetos Obligados (DOF 20/03/2025).

Leyenda: ✅ implementado · 🟡 implementado, requiere dato/validación oficial · ⬜ pendiente operativo

| Obligación | Artículo | Estado | Cómo se cumple en el SGI |
|---|---|:--:|---|
| **Principios** (licitud, finalidad, lealtad, consentimiento, calidad, proporcionalidad, información, responsabilidad) | 10 | ✅ | Tratamiento ligado a la finalidad del programa; datos provistos por el titular |
| **Finalidad concreta y lícita** | 12 | ✅ | Gestionar inscripción y ejecutar jornadas (finalidades primarias declaradas) |
| **Consentimiento** (expreso por medios electrónicos) | 14–15 | ✅ | Casilla de aceptación obligatoria + sello de tiempo `consentAt` en el expediente |
| **Consentimiento de menores** (vía tutor) | 14 | ✅ | Declaración de contar con el consentimiento de padres/tutores |
| **Calidad** (datos exactos, supresión cuando no se necesiten) | 17 | 🟡 | Datos directos del titular; supresión manual disponible; plazo por documentar |
| **Conservación y supresión documentada** | 18 | ⬜ | Por documentar en el catálogo de disposición documental |
| **Proporcionalidad** (datos estrictamente necesarios) | 19 | ✅ | Sólo campos necesarios; catálogo público expone únicamente datos abiertos del DENUE |
| **Aviso de privacidad integral** | 20–21 | 🟡 | Sección "Aviso de Privacidad Integral" en el portal con los 9 elementos del Art. 21 (faltan datos oficiales) |
| **Aviso de privacidad simplificado** | 22 | ✅ | En el formulario, en el punto de captura, con enlace al integral |
| **Derechos ARCO** (mecanismos y medios) | 21.V, 42–50 | 🟡 | Procedimiento ARCO descrito en el aviso; falta domicilio/correo de la Unidad de Transparencia |
| **Unidad de Transparencia** (domicilio) | 21.VI | 🟡 | Apartado en el aviso; por completar con datos oficiales |
| **Transferencias** | 21.VII | ✅ | No hay transferencias: el tercero que opera el programa es **encargada**, no destinatario de transferencia (Art. 3.XXX) |
| **Remisión a encargada** (sin informar ni consentir) | 65 | ✅ | La operación por el tercero es una remisión; no requiere mención en el aviso ni consentimiento |
| **Contrato con la encargada** (7 cláusulas mínimas) | 52–53 | 🟡 | Cláusulas listadas en `ENCARGADO-clausulas-contractuales.md`; verificar que el contrato vigente las contenga |
| **Negativa al tratamiento** | 21.VIII | ✅ | No otorgar el consentimiento; o solicitud a la Unidad de Transparencia |
| **Privacidad por defecto** | 24.VIII | ✅ | ZDR, control de acceso y mínima exposición integrados por diseño |
| **Medidas de seguridad** (administrativas, físicas, técnicas) | 25 | ✅ | TLS, JWT httpOnly, control de acceso por rol, validación estricta, ZDR |
| **Documento de seguridad** | 29 | 🟡 | `docs/DOCUMENTO-DE-SEGURIDAD.md` (inventario, roles, riesgo, brecha, plan) |
| **Actualización del documento de seguridad** | 30 | ⬜ | Disparadores definidos; calendarizar revisiones |
| **Notificación de vulneraciones** | 31 | ⬜ | Procedimiento por formalizar; la bitácora aporta la trazabilidad |
| **Rendición de cuentas / responsabilidad** | 23–24 | ✅ | Bitácora de auditoría append-only de las acciones del gestor |

## Pendientes para cierre formal

1. Completar en el aviso de privacidad: domicilio de la Gerencia, fundamento legal
   local, datos de la Unidad de Transparencia y fecha de última actualización.
2. **Verificar que el contrato con la encargada (operador del programa) contenga
   las 7 cláusulas del Art. 53** (ver `ENCARGADO-clausulas-contractuales.md`).
3. Definir plazos de conservación (catálogo de disposición documental).
4. Formalizar procedimiento de notificación de vulneraciones (Art. 31).
5. Calendarizar capacitación y revisión periódica del documento de seguridad.
