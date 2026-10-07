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
  const currentUser = requireAdmin(req);

  if (req.method === "GET") {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
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
      return res
        .status(409)
        .json({ error: "Já existe um usuário com esse e-mail." });
    }

    const user = await prisma.user.create({
      data: { name, email: normalizedEmail, role: finalRole },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    return res.status(201).json(user);
  }

  if (req.method === "PATCH" || req.method === "PUT") {
    const idParam = Array.isArray(req.query.id)
      ? req.query.id[0]
      : req.query.id;
    const id = idParam ? Number(idParam) : null;
    const { name, email, role } = req.body;

    if (!id || !Number.isInteger(id)) {
      return res
        .status(400)
        .json({ error: "Informe um id de usuário válido." });
    }
    if (!name || !email) {
      return res.status(400).json({ error: "Nome e e-mail são obrigatórios." });
    }

    const existingUser = await prisma.user.findUnique({ where: { id } });
    if (!existingUser) {
      return res.status(404).json({ error: "Usuário não encontrado." });
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    const duplicateEmail = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });
    if (duplicateEmail && duplicateEmail.id !== id) {
      return res
        .status(409)
        .json({ error: "Já existe um usuário com esse e-mail." });
    }

    const finalRole = VALID_ROLES.includes(role) ? role : "VIEWER";
    // O sistema nunca pode ficar sem administrador.
    if (existingUser.role === "ADMIN" && finalRole !== "ADMIN") {
      const admins = await prisma.user.count({ where: { role: "ADMIN" } });
      if (admins <= 1) {
        return res.status(409).json({
          error: "Este é o único administrador. Defina outro admin antes.",
        });
      }
    }

    const user = await prisma.user.update({
      where: { id },
      data: {
        name: String(name).trim(),
        email: normalizedEmail,
        role: finalRole,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    return res.status(200).json(user);
  }

  if (req.method === "DELETE") {
    const idParam = Array.isArray(req.query.id)
      ? req.query.id[0]
      : req.query.id;
    const id = idParam ? Number(idParam) : null;
    if (!id) {
      return res.status(400).json({ error: "Informe o id do usuário." });
    }
    if (id === currentUser.id) {
      return res
        .status(409)
        .json({ error: "Você não pode excluir o seu próprio usuário." });
    }

    const target = await prisma.user.findUnique({ where: { id } });
    if (!target) {
      return res.status(404).json({ error: "Usuário não encontrado." });
    }
    if (target.role === "ADMIN") {
      const admins = await prisma.user.count({ where: { role: "ADMIN" } });
      if (admins <= 1) {
        return res
          .status(409)
          .json({ error: "Não é possível excluir o único administrador." });
      }
    }

    await prisma.user.delete({ where: { id } });
    return res.status(204).end();
  }

  return res.status(405).json({ error: "Method not allowed" });
});
