import { type FastifyInstance } from "fastify";
import { z } from "zod";

import { env } from "../../../config/env.ts";
import { credencialesValidas } from "../auth.ts";

const COOKIE = "sgi_session";

// Esquema mínimo del login. No registramos el cuerpo (ZDR): la contraseña
// nunca debe aparecer en logs.
const loginSchema = z.object({
  usuario: z.string().min(1),
  password: z.string().min(1),
});

// Rutas de sesión del gestor. El token de sesión viaja en una cookie
// httpOnly (no accesible por JS → protección contra XSS), firmada con
// JWT_SECRET y con caducidad de 8 h.
export function registrarRutasAuth(app: FastifyInstance): void {
  app.post("/api/login", async (req, reply) => {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      reply
        .status(400)
        .send({ error: "DATOS_INVALIDOS", mensaje: "Usuario y contraseña requeridos." });
      return;
    }
    const { usuario, password } = parsed.data;
    if (!credencialesValidas(usuario, password)) {
      // Mensaje genérico: no revelamos si falló el usuario o la contraseña.
      reply
        .status(401)
        .send({ error: "CREDENCIALES_INVALIDAS", mensaje: "Usuario o contraseña incorrectos." });
      return;
    }
    const token = await reply.jwtSign(
      { rol: "gestor", usuario },
      { expiresIn: "8h" },
    );
    reply
      .setCookie(COOKIE, token, {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: env.NODE_ENV === "production",
        maxAge: 60 * 60 * 8,
      })
      .send({ ok: true, usuario, rol: "gestor" });
  });

  app.post("/api/logout", async (_req, reply) => {
    reply.clearCookie(COOKIE, { path: "/" }).send({ ok: true });
  });

  // Permite al frontend saber si hay sesión activa al cargar la página.
  app.get("/api/me", async (req, reply) => {
    try {
      await req.jwtVerify();
      reply.send({ autenticado: true, usuario: req.user.usuario, rol: req.user.rol });
    } catch {
      reply.send({ autenticado: false });
    }
  });
}
