import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    const sales = await prisma.sale.findMany({
      orderBy: { createdAt: "desc" },
      include: { insumo: true },
    });
    return res.status(200).json(sales);
  }

  if (req.method === "POST") {
    const { insumoId, quantity } = req.body;
    if (!insumoId || !quantity) {
      return res.status(400).json({ error: "insumoId and quantity are required." });
    }

    const insumo = await prisma.insumo.findUnique({ where: { id: Number(insumoId) } });
    if (!insumo) {
      return res.status(404).json({ error: "Insumo not found." });
    }

    const sale = await prisma.sale.create({
      data: {
        insumoId: insumo.id,
        quantity: Number(quantity),
        unitPrice: insumo.unitCost,
        total: Number(quantity) * insumo.unitCost,
      },
      include: { insumo: true },
    });

    return res.status(201).json(sale);
  }

  return res.status(405).json({ error: "Method not allowed" });
}
