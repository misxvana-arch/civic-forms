# Documento de Seguridad — SGI "Mi Barrio, Mi Patrimonio"

> Elaborado conforme al **artículo 29 de la Ley General de Protección de Datos
> Personales en Posesión de Sujetos Obligados** (LGPDPPSO, DOF 20/03/2025).
> Responsable: **Gerencia del Centro Histórico y Patrimonio Cultural del H.
> Ayuntamiento de Puebla**.
>
> Los campos marcados con `[…]` deben completarse con los datos oficiales del
> sujeto obligado antes de su validación formal.

---

## I. Inventario de datos personales y de los sistemas de tratamiento

**Sistema de tratamiento:** Sistema de Gestión de Inscripciones (SGI), aplicación
web propia (Node.js + Fastify + base de datos relacional). Aloja un único sistema
de datos personales: el **padrón de inscripciones** del programa.

| Categoría de titular | Datos personales tratados | ¿Sensibles? |
|---|---|---|
| Persona enlace de la institución | nombre, cargo, correo electrónico, teléfono | No |
| Institución educativa | nombre, CCT, sostenimiento, domicilio, sector | No (datos de la escuela) |
| Jornada | grados, número de niñas y niños (agregado), fecha | No |

**No se tratan datos personales sensibles.** No se recaban nombres ni datos de
identificación individual de menores; únicamente un conteo por grupo.

**Soportes:** electrónico (base de datos PostgreSQL en producción / SQLite en
desarrollo). No existen soportes físicos.

**Flujos:** captura pública vía formulario web → almacenamiento cifrado en
tránsito (HTTPS/TLS) → consulta y gestión restringida al personal gestor
autenticado → **remisión a la persona encargada** (tercero que opera el programa
por cuenta de la Gerencia, Art. 52-53 y 65) → supresión por el gestor o por
vencimiento del plazo de conservación.

> La operación del programa está a cargo de un **tercero contratado (encargada)**
> que trata los datos bajo instrucciones de la Gerencia. Es una **remisión**, no
> una transferencia (Art. 3.XXX). Las cláusulas contractuales obligatorias se
> detallan en `ENCARGADO-clausulas-contractuales.md`.

---

## II. Funciones y obligaciones del personal que trata datos personales

| Rol | Funciones | Obligaciones |
|---|---|---|
| **Gestor** (cuenta autenticada) | Consultar, dar seguimiento, avanzar estado y suprimir expedientes | Confidencialidad; usar credenciales personales; no extraer datos fuera del sistema |
| **Administrador técnico** | Despliegue, respaldos, gestión de secretos | Resguardar `JWT_SECRET` y credenciales; aplicar parches; no acceder a datos salvo necesidad operativa |
| **Encargada** (tercero que opera el programa) | Tratar los datos para ejecutar las jornadas, por cuenta de la Gerencia | Sin poder de decisión (Art. 52); ceñirse a instrucciones; confidencialidad; reportar vulneraciones; suprimir/devolver al término (Art. 53) |
| **Titular del dato** | Proporciona sus datos; ejerce derechos ARCO | — |

El acceso a datos del expediente está **restringido por autenticación y rol**:
el público sólo puede inscribir; toda consulta requiere sesión de gestor.

---

## III. Análisis de riesgos

| Activo | Amenaza | Probabilidad | Impacto | Riesgo |
|---|---|---|---|---|
| Padrón de inscripciones | Acceso no autorizado | Baja | Medio | **Medio** |
| Credenciales de gestor | Robo/reutilización | Baja | Alto | **Medio** |
| Datos en tránsito | Interceptación | Muy baja | Medio | **Bajo** |
| Registros (logs) | Filtrado de PII | Muy baja | Medio | **Bajo** (mitigado por ZDR) |
| Disponibilidad del servicio | Caída del hosting | Media | Bajo | **Bajo** |

Factores considerados (Art. 26): riesgo inherente, sensibilidad (no hay datos
sensibles), desarrollo tecnológico, consecuencias para titulares, transferencias
(no hay), número de titulares y valor potencial para terceros.

---

## IV. Análisis de brecha (medidas existentes vs. faltantes)

**Medidas técnicas ya implementadas:**
- Cifrado en tránsito (HTTPS/TLS terminado en el proxy del hosting).
- Autenticación por JWT en cookie `httpOnly`, `secure` y `sameSite=lax`.
- Control de acceso por rol (rutas de gestión sólo para sesión autenticada).
- Comparación de credenciales en tiempo constante (mitiga *timing attacks*).
- **ZDR**: los registros del servidor nunca incluyen el cuerpo de la petición ni PII.
- **Bitácora de auditoría** append-only de las acciones del gestor (quién, qué, cuándo).
- Validación estricta de entrada (Zod) en la frontera HTTP.
- Exposición mínima: el catálogo público sólo entrega datos abiertos del DENUE.

**Medidas faltantes / por formalizar:**
- [ ] Cifrado en reposo de la base de datos (depende del proveedor de hosting).
- [ ] Política de respaldos y prueba de restauración documentada.
- [ ] Procedimiento formal de notificación de vulneraciones (Art. 31).
- [ ] Rotación periódica del `JWT_SECRET` y de la contraseña del gestor.
- [ ] Bloqueo/supresión automática al vencer el plazo de conservación.

---

## V. Plan de trabajo

| Medida faltante | Responsable | Plazo |
|---|---|---|
| Documentar política de respaldos y restauración | Admin. técnico | `[fecha]` |
| Procedimiento de notificación de vulneraciones | Responsable + UT | `[fecha]` |
| Cifrado en reposo / verificar oferta del hosting | Admin. técnico | `[fecha]` |
| Rotación de secretos | Admin. técnico | `[periodicidad]` |
| Rutina de bloqueo y supresión por conservación | Admin. técnico | `[fecha]` |

---

## VI. Mecanismos de monitoreo y revisión

- Revisión de la **bitácora de auditoría** del sistema.
- Revisión periódica de este documento ante cambios sustanciales al tratamiento,
  mejoras del sistema de gestión o vulneraciones (Art. 30).
- Monitoreo de disponibilidad del servicio (*health check* `/salud`).

---

## VII. Programa general de capacitación

El personal con acceso al SGI recibirá capacitación sobre: principios y deberes de
la LGPDPPSO, manejo confidencial del padrón, uso correcto de credenciales,
identificación y reporte de vulneraciones, y atención de solicitudes ARCO.
Periodicidad sugerida: al alta del personal y de forma anual. `[calendarizar]`

---

*Este documento debe actualizarse conforme al artículo 30 de la LGPDPPSO.*
