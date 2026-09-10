// pages/api/users.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../lib/prisma";
import { withApiErrorHandling } from "../../lib/api";
import { requireAdmin } from "../../lib/auth";

const VALID_ROLES = ["ADMIN", "EDITOR", "VIEWER"];

export default withApiErrorHandling(async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  // Toda a rota exige login de administrador, inclusive para listar.
  requireAdmin(req);

  if (req.method === "GET") {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "asc" },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });
    return res.status(200).json(users);
  }

  if (req.method === "POST") {
    const { name, email, role } = req.body;

    if (!name || !email) {
      return res.status(400).json({ error: "Nome e e-mail são obrigatórios." });
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    const finalRole = VALID_ROLES.includes(role) ? role : "VIEWER";

    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });
    if (existing) {
      return res.status(409).json({ error: "Já existe um usuário com esse e-mail." });
    }

    const user = await prisma.user.create({
      data: { name, email: normalizedEmail, role: finalRole },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });

    return res.status(201).json(user);
  }

  if (req.method === "DELETE") {
    const idParam = Array.isArray(req.query.id) ? req.query.id[0] : req.query.id;
    const id = idParam ? Number(idParam) : null;
    if (!id) {
      return res.status(400).json({ error: "Informe o id do usuário." });
    }

    await prisma.user.delete({ where: { id } });
    return res.status(204).end();
  }

  return res.status(405).json({ error: "Method not allowed" });
});
