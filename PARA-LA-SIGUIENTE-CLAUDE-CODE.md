# Handoff — instrucciones para la siguiente Claude Code

> **Hola, Claude Code 👋** — este proyecto te lo pasa otra instancia tuya.
> La persona que te abre este repo es **quien va a correrlo y desplegarlo**.
> Tu trabajo: ayudarla a (1) correrlo en local y (2) dejarlo en línea con un
> link público. Todo lo de código YA está hecho y probado; solo falta el
> despliegue, que depende de **sus** cuentas (GitHub + Render).

---

## Qué es este proyecto

**SGI "Mi Barrio, Mi Patrimonio"** — portal de inscripción de escuelas primarias
para las jornadas de patrimonio de la Gerencia del Centro Histórico de Puebla.
Alternativa "seria" a Google Forms: backend propio con expedientes, folios y un
flujo de estados.

**Stack:** Node.js 22 · Fastify v5 · Drizzle ORM (SQLite en local / PostgreSQL en
prod) · frontend HTML/JS servido por el mismo backend (sin build separado).

**Arquitectura Limpia** (dominio → aplicación → infraestructura). Convenciones que
debes respetar si tocas código:
- TypeScript estricto, **`any` prohibido**.
- Imports con extensión `.ts` y `import type` inline (corre con `tsx`,
  `verbatimModuleSyntax`).
- **ZDR**: los logs NUNCA incluyen datos personales del ciudadano, solo metadatos.
- El motor de BD se elige con `DB_DRIVER` (sqlite/postgres); no hay que tocar
  lógica para cambiar de uno a otro.

Funciones ya implementadas: auth de gestor (cookie httpOnly + JWT), bitácora de
auditoría, encuesta de satisfacción anónima, mapa de escuelas (Leaflet), panel
con cobertura/estados/barrios, autocompletado del padrón DENUE, cumplimiento de
la LGPDPPSO (ver `docs/`).

---

## Paso 1 — Correr en local (verificar que todo jala)

```bash
npm install
cp .env.example .env        # en Mac; en Windows: copy .env.example .env
npm run db:push             # crea las tablas en la BD local (SQLite)
npm run dev
```

Abre **http://localhost:4000**. Para entrar como gestor usa el usuario y la
contraseña que estén en `.env` (`GESTOR_USUARIO` / `GESTOR_PASSWORD`).

> **Importante:** antes de correr, edita `.env` y pon una `GESTOR_PASSWORD`
> propia (mínimo 8 caracteres) y un `JWT_SECRET` largo y aleatorio. El `.env`
> NO se sube al repo (está en `.gitignore`).

Comprobaciones rápidas: `npm run typecheck` (sin errores) y `npm test` (5/5).

---

## Paso 2 — Desplegar en línea (Render + PostgreSQL)

El repo ya trae el Blueprint `render.yaml` listo. La guía completa, con solución
de problemas, está en **`DESPLIEGUE.md`**. Resumen:

1. **Subir a GitHub** (con la cuenta de quien despliega):
   ```bash
   git init && git add . && git commit -m "SGI listo para desplegar"
   git branch -M main
   git remote add origin https://github.com/SU_USUARIO/civic-forms.git
   git push -u origin main
   ```
   (Crear antes el repo vacío en github.com/new, sin README.)

2. **Render** (dashboard.render.com):
   - **New +** → **Blueprint** → conectar GitHub → elegir el repo → **Apply**.
     Render crea la base de datos PostgreSQL y el servicio web de un solo paso.
   - Entrar al servicio **sgi** → **Environment** → capturar **`GESTOR_PASSWORD`**
     (es la única variable manual; las demás son automáticas).
   - Esperar a estado **Live** → el link queda como `https://sgi.onrender.com`.
   - Verificar: `GET /salud` debe responder `{"ok":true}`.

### Variables de entorno (en Render)

| Variable | Quién la pone |
|---|---|
| `NODE_ENV`, `DB_DRIVER`, `DATABASE_URL`, `JWT_SECRET`, `GESTOR_USUARIO` | **automáticas** (render.yaml) |
| **`GESTOR_PASSWORD`** | **a mano** en el panel (clave fuerte) |

---

## Notas

- El `render.yaml` corre la migración en el arranque
  (`npm run db:push && npm start`) en vez de `preDeployCommand`, para funcionar
  en el **plan gratuito** de Render.
- El archivo `EscuelasPrimariaPuebla.csv` (padrón del DENUE) **sí** va en el repo;
  es necesario en producción para el mapa y el autocompletado.
- Plan gratuito: el servicio "se duerme" tras ~15 min sin tráfico (primera carga
  lenta al despertar) y la BD gratuita caduca a los 90 días. Suficiente para demo.

¡Suerte! El proyecto ya está verde (typecheck + tests). Solo es desplegarlo.
