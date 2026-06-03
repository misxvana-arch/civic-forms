import { createHash, timingSafeEqual } from "node:crypto";
import { type FastifyReply, type FastifyRequest } from "fastify";
import { env } from "../../config/env.ts";

// Comparación en tiempo constante: aplicar sha256 primero iguala las
// longitudes (timingSafeEqual exige buffers del mismo tamaño) y evita
// filtrar por el tiempo de comparación si la contraseña es correcta o no.
function igualConstante(a: string, b: string): boolean {
  const ha = createHash("sha256").update(a).digest();
  const hb = createHash("sha256").update(b).digest();
  return timingSafeEqual(ha, hb);
}

export function credencialesValidas(usuario: string, password: string): boolean {
  const okUsuario = igualConstante(usuario, env.GESTOR_USUARIO);
  const okPassword = igualConstante(password, env.GESTOR_PASSWORD);
  // Se evalúan ambas siempre (sin cortocircuito) para no filtrar cuál falló.
  return okUsuario && okPassword;
}

export interface SesionGestor {
  readonly rol: "gestor";
  readonly usuario: string;
}

// Declaration merging: tipamos el payload del JWT para que `req.user`
// sea SesionGestor en toda la app (sin `any`). @fastify/jwt expone
// `user` como el contenido verificado del token.
declare module "@fastify/jwt" {
  interface FastifyJWT {
    payload: SesionGestor;
    user: SesionGestor;
  }
}

// preHandler que protege rutas de gestor. Verifica el JWT que viaja en la
// cookie httpOnly; si no es válido, corta con 401 antes del controlador.
export async function autenticar(
  req: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  try {
    await req.jwtVerify();
  } catch {
    reply
      .status(401)
      .send({ error: "NO_AUTORIZADO", mensaje: "Inicia sesión como gestor." });
  }
}
