// lib/auth.ts
import { NextApiRequest } from "next";
import jwt from "jsonwebtoken";

const SECRET_KEY = process.env.JWT_SECRET || "aromas-emomentos-secret-2026";

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: string;
}

class HttpError extends Error {
  statusCode: number;
  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
  }
}

/** Lê e valida o token JWT do header Authorization. Retorna null se ausente/inválido. */
export function getAuthUser(req: NextApiRequest): AuthUser | null {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) return null;

  const token = header.slice("Bearer ".length);
  try {
    return jwt.verify(token, SECRET_KEY) as AuthUser;
  } catch {
    return null;
  }
}

/** Garante que a requisição está autenticada. Lança erro 401 caso não esteja. */
export function requireAuth(req: NextApiRequest): AuthUser {
  const user = getAuthUser(req);
  if (!user) {
    throw new HttpError(401, "Faça login para realizar esta ação.");
  }
  return user;
}

/** Garante que a requisição está autenticada E é de um admin. Lança 401/403. */
export function requireAdmin(req: NextApiRequest): AuthUser {
  const user = requireAuth(req);
  if (user.role !== "ADMIN") {
    throw new HttpError(403, "Apenas administradores podem realizar esta ação.");
  }
  return user;
}

/** Garante que a requisição está autenticada e o perfil pode excluir (todos menos Visualizador). */
export function requireCanDelete(req: NextApiRequest): AuthUser {
  const user = requireAuth(req);
  if (user.role === "VIEWER") {
    throw new HttpError(403, "Visualizadores não podem excluir registros.");
  }
  return user;
}
