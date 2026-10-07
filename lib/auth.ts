// lib/auth.ts
import { NextApiRequest } from "next";
import jwt from "jsonwebtoken";

/** Segredo do JWT. Sem valor padrão: se a variável faltar, nenhum token é emitido nem aceito. */
export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET não configurado no ambiente.");
  }
  return secret;
}

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: string;
}

export class HttpError extends Error {
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
  const secret = getJwtSecret();
  try {
    return jwt.verify(token, secret) as AuthUser;
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

/** Garante que a requisição está autenticada e o perfil pode criar/editar (todos menos Visualizador). */
export function requireCanEdit(req: NextApiRequest): AuthUser {
  const user = requireAuth(req);
  if (user.role === "VIEWER") {
    throw new HttpError(403, "Visualizadores não podem alterar registros.");
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

/**
 * Regra padrão das rotas de dados: ler exige login; criar/editar/excluir
 * exige um perfil diferente de Visualizador.
 */
export function requireDataAccess(req: NextApiRequest): AuthUser {
  if (req.method === "GET") return requireAuth(req);
  if (req.method === "DELETE") return requireCanDelete(req);
  return requireCanEdit(req);
}
