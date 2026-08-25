// pages/api/auth/login.ts
import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

const SECRET_KEY = process.env.JWT_SECRET || "aromas-emomentos-secret-2026";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Método não permitido" });
  }

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email e senha são obrigatórios" });
  }

  try {
    const user = await (prisma as any).user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return res.status(401).json({ message: "Email ou senha incorretos" });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ message: "Email ou senha incorretos" });
    }

    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email },
      SECRET_KEY,
      { expiresIn: "7d" },
    );

    return res.status(200).json({
      message: "Login realizado!",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erro interno no servidor" });
  }
}
