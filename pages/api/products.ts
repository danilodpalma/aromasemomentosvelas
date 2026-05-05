import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../lib/prisma";
import { withApiErrorHandling } from "../../lib/api";

export default withApiErrorHandling(async function handler(req: NextApiRequest, res: NextApiResponse) {
  const idParam = Array.isArray(req.query.id) ? req.query.id[0] : req.query.id;
  const id = idParam ? Number(idParam) : null;

  if (req.method === "GET") {
    const insumos = await prisma.insumo.findMany({ orderBy: { createdAt: "desc" } });
    return res.status(200).json(insumos);
  }

  if (req.method === "POST") {
    const { name, unit, purchaseCost, purchasedQuantity, unitCost, description, active } = req.body;
    if (!name || purchaseCost == null || purchasedQuantity == null) {
      return res.status(400).json({ error: "Nome, custo da compra e quantidade comprada são obrigatórios." });
    }

    const parsedPurchaseCost = Number(purchaseCost);
    const parsedPurchasedQuantity = Number(purchasedQuantity);
    const computedUnitCost = parsedPurchasedQuantity > 0 ? parsedPurchaseCost / parsedPurchasedQuantity : 0;

    const insumo = await prisma.insumo.create({
      data: {
        name,
        unit: unit ?? "",
        purchaseCost: parsedPurchaseCost,
        purchasedQuantity: parsedPurchasedQuantity,
        unitCost: unitCost != null ? Number(unitCost) : computedUnitCost,
        description: description ?? "",
        active: active != null ? Boolean(active) : true,
      },
    });

    return res.status(201).json(insumo);
  }

  if ((req.method === "PUT" || req.method === "PATCH") && id) {
    const { name, unit, purchaseCost, purchasedQuantity, unitCost, description, active } = req.body;

    const existing = await prisma.insumo.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: "Insumo não encontrado." });
    }

    const parsedPurchaseCost = purchaseCost != null ? Number(purchaseCost) : existing.purchaseCost;
    const parsedPurchasedQuantity = purchasedQuantity != null ? Number(purchasedQuantity) : existing.purchasedQuantity;
    const computedUnitCost = parsedPurchasedQuantity > 0 ? parsedPurchaseCost / parsedPurchasedQuantity : 0;

    const updated = await prisma.insumo.update({
      where: { id },
      data: {
        name: name ?? existing.name,
        unit: unit ?? existing.unit,
        purchaseCost: parsedPurchaseCost,
        purchasedQuantity: parsedPurchasedQuantity,
        unitCost: unitCost != null ? Number(unitCost) : computedUnitCost,
        description: description ?? existing.description,
        active: active != null ? Boolean(active) : existing.active,
      },
    });

    return res.status(200).json(updated);
  }

  return res.status(405).json({ error: "Method not allowed" });
});
