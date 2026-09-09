// pages/api/auth/request-code.ts
import { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcryptjs";
import { prisma } from "../../../lib/prisma";
import { withApiErrorHandling } from "../../../lib/api";
import { sendLoginCodeEmail } from "../../../lib/email";

function generateCode() {
  return String(Math.floor(100000 + Math.random() * 900000)); // 6 dígitos
}

export default withApiErrorHandling(async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Método não permitido" });
  }

  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: "Informe o e-mail." });
  }

  const normalizedEmail = String(email).toLowerCase().trim();

  const user = await (prisma as any).user.findUnique({
    where: { email: normalizedEmail },
  });

  // Resposta genérica sempre, pra não revelar se o e-mail está cadastrado.
  const genericResponse = {
    message: "Se o e-mail estiver cadastrado, um código foi enviado.",
  };

  if (!user) {
    return res.status(200).json(genericResponse);
  }

  const code = generateCode();
  const codeHash = await bcrypt.hash(code, 10);
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutos

  // Invalida códigos anteriores ainda não usados desse e-mail.
  await (prisma as any).loginCode.updateMany({
    where: { email: normalizedEmail, used: false },
    data: { used: true },
  });

  await (prisma as any).loginCode.create({
    data: { email: normalizedEmail, codeHash, expiresAt },
  });

  await sendLoginCodeEmail(normalizedEmail, code);

  return res.status(200).json(genericResponse);
});
