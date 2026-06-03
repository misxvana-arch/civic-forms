# Despliegue en línea — SGI "Mi Barrio, Mi Patrimonio"

Guía paso a paso para publicar el SGI en internet usando **Render** y
**PostgreSQL**. Todo el proceso es gratuito y no requiere tarjeta.

El repositorio ya incluye un **Blueprint** (`render.yaml`) que crea de un
solo paso la base de datos y el servicio web. Solo tienes que conectar tu
repo y capturar una contraseña.

---

## Antes de empezar

Necesitas dos cuentas gratuitas:

1. **GitHub** — para alojar el código → https://github.com
2. **Render** — para ejecutarlo en línea → https://render.com
   (entra con tu cuenta de GitHub; es lo más rápido)

> El código corre en **Node 22** (fijado en `.nvmrc`) y, en producción,
> sobre **PostgreSQL**. En tu computadora sigue usando **SQLite** sin
> cambiar nada: el motor se elige con la variable `DB_DRIVER`.

---

## Paso 1 — Subir el código a GitHub

Desde la carpeta del proyecto:

```bash
git init                # si aún no es un repositorio
git add .
git commit -m "SGI listo para desplegar"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/civic-forms.git
git push -u origin main
```

> **Importante:** el archivo `.env` NO se sube (está en `.gitignore`).
> Ahí viven tus secretos locales y nunca deben llegar al repositorio.

---

## Paso 2 — Crear el Blueprint en Render

1. En el panel de Render pulsa **New +** → **Blueprint**.
2. Elige tu repositorio **civic-forms**.
3. Render lee `render.yaml` y te muestra lo que va a crear:
   - **sgi-db** — base de datos PostgreSQL (plan free)
   - **sgi** — servicio web (plan free)
4. Pulsa **Apply**.

Render hace el resto automáticamente:

| Acción              | Comando (definido en `render.yaml`)        |
| ------------------- | ------------------------------------------ |
| Instalar dependencias | `npm install --include=dev`              |
| Crear/actualizar tablas y arrancar | `npm run db:push && npm start` |
| Verificar que vive  | revisa `GET /salud`                        |

La cadena de conexión (`DATABASE_URL`) y el `JWT_SECRET` se generan e
inyectan solos. No tienes que copiar nada de la base de datos a mano.

---

## Paso 3 — Capturar la contraseña del gestor

Por seguridad, la contraseña del gestor **no** viaja en el repositorio
(en `render.yaml` está marcada como `sync: false`). Hay que escribirla
una vez en el panel:

1. Entra al servicio **sgi** → pestaña **Environment**.
2. Busca la variable **`GESTOR_PASSWORD`**.
3. Escribe una contraseña fuerte (mínimo 8 caracteres) y guarda.

Render volverá a desplegar automáticamente con la contraseña ya puesta.

> El usuario por defecto es `gestor` (variable `GESTOR_USUARIO`). Puedes
> cambiarlo en la misma pantalla si lo prefieres.

---

## Paso 4 — Comprobar que funciona

Cuando el deploy termine (estado **Live**), Render te da una URL del
estilo `https://sgi.onrender.com`.

1. **Salud del servicio:**
   ```bash
   curl https://sgi.onrender.com/salud
   # → {"ok":true}
   ```
2. **Portal público:** abre la URL en el navegador. Cualquier persona
   puede inscribir una escuela y responder la encuesta de satisfacción.
3. **Acceso del gestor:** pulsa **Acceder**, entra con `gestor` y la
   contraseña del Paso 3. Verás las pestañas de Registros, Panel y
   Bitácora.

---

## Qué quedó activo en producción

- **Auth y roles** — el público inscribe y responde encuestas; solo el
  gestor (sesión por cookie httpOnly + JWT) ve registros, panel y bitácora.
- **Bitácora de auditoría** — registro append-only de cada avance de
  estado y eliminación, con actor, folio y fecha.
- **Encuesta de satisfacción** — calificación 1–5, recomendación y
  comentario; el panel muestra promedio, % de recomendación y distribución.
- **PostgreSQL** — persistencia real en la nube; las migraciones corren
  solas en cada despliegue con `db:push`.

---

## Notas del plan gratuito de Render

- **El servicio web se duerme** tras ~15 min sin tráfico. La primera
  petición tras dormir tarda unos segundos en despertar (es normal en el
  plan free).
- **La base de datos free expira a los 90 días.** Para una demo de clase
  es más que suficiente; si el proyecto continúa, conviene subir de plan o
  exportar los datos antes de que caduque.
- Cada `git push` a `main` dispara un nuevo despliegue automático.

---

## Solución de problemas

| Síntoma                                   | Causa probable / arreglo                                   |
| ----------------------------------------- | ---------------------------------------------------------- |
| Deploy falla en `db:push`                 | `DATABASE_URL` aún no disponible; reintenta el deploy.     |
| Login siempre responde 401                | Falta capturar `GESTOR_PASSWORD` en Environment (Paso 3).  |
| La app no arranca (`GESTOR_PASSWORD`...)  | La validación de entorno exige mínimo 8 caracteres.        |
| Primera carga muy lenta                   | El servicio estaba dormido (plan free); espera unos segundos. |
