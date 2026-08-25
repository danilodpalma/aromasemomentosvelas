// pages/api/auth/register-test.ts
import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    const hashedPassword = await bcrypt.hash("123456", 10);

    const user = await (prisma as any).user.upsert({
      where: { email: "admin@aromasemomentos.com" },
      update: {},
      create: {
        name: "Administrador",
        email: "admin@aromasemomentos.com",
        password: hashedPassword,
      },
    });

    res.status(200).json({
      success: true,
      message: "Usuário de teste criado!",
      email: user.email,
      password: "123456",
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}
