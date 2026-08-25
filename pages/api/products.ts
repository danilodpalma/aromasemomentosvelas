import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../lib/prisma";
import { withApiErrorHandling } from "../../lib/api";

export default withApiErrorHandling(async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const idParam = Array.isArray(req.query.id) ? req.query.id[0] : req.query.id;
  const id = idParam ? Number(idParam) : null;

  if (req.method === "GET") {
    const insumos = await prisma.insumo.findMany({
      orderBy: [{ name: "asc" }, { createdAt: "desc" }],
    });
    const parsed = insumos.map((item) => ({
      ...item,
      productTypes: item.productTypes ? JSON.parse(item.productTypes) : [],
    }));
    return res.status(200).json(parsed);
  }

  if (req.method === "POST") {
    const {
      name,
      unit,
      purchaseCost,
      purchasedQuantity,
      unitCost,
      description,
      active,
      productTypes,
      isBase,
    } = req.body;
    if (!name || purchaseCost == null || purchasedQuantity == null) {
      return res.status(400).json({
        error: "Nome, custo da compra e quantidade comprada são obrigatórios.",
      });
    }

    const parsedPurchaseCost = Number(purchaseCost);
    const parsedPurchasedQuantity = Number(purchasedQuantity);
    const baseUnitCost =
      parsedPurchasedQuantity > 0
        ? parsedPurchaseCost / parsedPurchasedQuantity
        : 0;
    const normalizedName = String(name).trim().toLowerCase();
    const computedUnitCost = normalizedName.includes("pavio")
      ? baseUnitCost / 10
      : baseUnitCost;

    const insumo = await prisma.insumo.create({
      data: {
        name,
        unit: unit ?? "",
        purchaseCost: parsedPurchaseCost,
        purchasedQuantity: parsedPurchasedQuantity,
        unitCost: unitCost != null ? Number(unitCost) : computedUnitCost,
        description: description ?? "",
        productTypes: Array.isArray(productTypes)
          ? JSON.stringify(productTypes)
          : null,
        isBase: isBase != null ? Boolean(isBase) : false,
        active: active != null ? Boolean(active) : true,
      } as any,
    });

    return res.status(201).json({
      ...insumo,
      productTypes: insumo.productTypes ? JSON.parse(insumo.productTypes) : [],
    });
  }

  if ((req.method === "PUT" || req.method === "PATCH") && id) {
    const {
      name,
      unit,
      purchaseCost,
      purchasedQuantity,
      unitCost,
      description,
      active,
      productTypes,
      isBase,
      stock,
    } = req.body;

    const existing = await prisma.insumo.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: "Insumo não encontrado." });
    }

    const parsedPurchaseCost =
      purchaseCost != null ? Number(purchaseCost) : existing.purchaseCost;
    const parsedPurchasedQuantity =
      purchasedQuantity != null
        ? Number(purchasedQuantity)
        : existing.purchasedQuantity;
    const baseUnitCost =
      parsedPurchasedQuantity > 0
        ? parsedPurchaseCost / parsedPurchasedQuantity
        : 0;
    const normalizedName = String(name ?? existing.name)
      .trim()
      .toLowerCase();
    const computedUnitCost = normalizedName.includes("pavio")
      ? baseUnitCost / 10
      : baseUnitCost;

    const parsedStock = stock != null ? Number(stock) : existing.stock;

    const updated = await prisma.insumo.update({
      where: { id },
      data: {
        name: name ?? existing.name,
        unit: unit ?? existing.unit,
        purchaseCost: parsedPurchaseCost,
        purchasedQuantity: parsedPurchasedQuantity,
        unitCost: unitCost != null ? Number(unitCost) : computedUnitCost,
        description: description ?? existing.description,
        productTypes: Array.isArray(productTypes)
          ? JSON.stringify(productTypes)
          : existing.productTypes,
        isBase: isBase != null ? Boolean(isBase) : false,
        active: active != null ? Boolean(active) : existing.active,
        stock: Number.isFinite(parsedStock)
          ? Math.round(parsedStock)
          : existing.stock,
      } as any,
    });

    return res.status(200).json({
      ...updated,
      productTypes: updated.productTypes
        ? JSON.parse(updated.productTypes)
        : [],
    });
  }

  if (req.method === "DELETE" && id) {
    const existing = await prisma.insumo.findUnique({ where: { id } });
    if (!existing)
      return res.status(404).json({ error: "Insumo não encontrado." });

    await prisma.insumo.delete({ where: { id } });
    return res.status(204).end();
  }

  return res.status(405).json({ error: "Method not allowed" });
});
