// pages/api/auth/verify-code.ts
import { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../../../lib/prisma";
import { withApiErrorHandling } from "../../../lib/api";

const SECRET_KEY = process.env.JWT_SECRET || "aromas-emomentos-secret-2026";

export default withApiErrorHandling(async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Método não permitido" });
  }

  const { email, code } = req.body;
  if (!email || !code) {
    return res.status(400).json({ message: "Informe o e-mail e o código." });
  }

  const normalizedEmail = String(email).toLowerCase().trim();

  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (!user) {
    return res.status(401).json({ message: "Código inválido ou expirado." });
  }

  const candidates = await prisma.loginCode.findMany({
    where: {
      email: normalizedEmail,
      used: false,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: "desc" },
  });

  let matched = null;
  for (const candidate of candidates) {
    if (await bcrypt.compare(String(code), candidate.codeHash)) {
      matched = candidate;
      break;
    }
  }

  if (!matched) {
    return res.status(401).json({ message: "Código inválido ou expirado." });
  }

  await prisma.loginCode.update({
    where: { id: matched.id },
    data: { used: true },
  });

  const token = jwt.sign(
    { id: user.id, name: user.name, email: user.email, role: user.role },
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
      role: user.role,
    },
  });
});
