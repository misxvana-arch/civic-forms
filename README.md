# Civic Forms — SGI · Mi Barrio, Mi Patrimonio

Portal de inscripción de instituciones educativas para las jornadas del
programa **Mi Barrio, Mi Patrimonio**. A diferencia de un Google Forms, los
datos viven en una **base de datos propia** del sistema (respaldo,
multiusuario, trazabilidad y control institucional del dato del ciudadano).

## Requisitos

- **Node.js 22 o superior** — descárgalo en https://nodejs.org (versión LTS).
  Verifica con: `node --version`

No necesitas instalar ninguna base de datos: en desarrollo usa SQLite, que
es solo un archivo local (`local.db`) que se crea solo.

## Puesta en marcha (primera vez)

Desde una terminal, dentro de la carpeta del proyecto:

```bash
# 1. Crea tu archivo de configuración a partir del ejemplo
cp .env.example .env        # En Windows (PowerShell): copy .env.example .env

# 2. Instala las dependencias (reconstruye los binarios para TU compu)
npm install

# 3. Crea las tablas en la base de datos local
npm run db:push

# 4. Arranca el servidor
npm run dev
```

Luego abre **http://localhost:4000** en el navegador.

> El puerto se configura en `.env` (`PORT`). Si el 4000 está ocupado,
> cámbialo a 3000 u otro y vuelve a `npm run dev`.

## Comandos

| Comando            | Qué hace                                         |
| ------------------ | ------------------------------------------------ |
| `npm run dev`      | Levanta el servidor (recarga el HTML al refrescar) |
| `npm test`         | Corre las pruebas del dominio                     |
| `npm run typecheck`| Revisa los tipos de TypeScript                    |
| `npm run db:push`  | Aplica el esquema a la base de datos              |
| `npm run db:studio`| Abre un explorador visual de la base de datos     |

## Estructura (Clean Architecture)

```
src/
  domain/          Reglas de negocio puras (Inscripcion, estados, folio)
  application/     Casos de uso + puertos (interfaces de repositorio)
  infrastructure/  Detalles: base de datos (Drizzle), API HTTP (Fastify)
  config/          Validación del entorno con Zod
public/
  index.html       El portal (frontend) que consume la API
tests/             Pruebas con Vitest
```

Las dependencias apuntan hacia adentro: el dominio no sabe que existe la
base de datos ni el servidor. Por eso migrar de SQLite a PostgreSQL en
producción solo cambia una línea del servidor.

## Notas

- `node_modules/`, `local.db` y `.env` **no** se comparten: cada quien los
  genera en su compu con los pasos de arriba.
- Privacidad (ZDR): los logs nunca registran datos personales del ciudadano,
  solo metadatos de la petición.
