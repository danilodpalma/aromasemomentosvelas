import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../lib/prisma";
import { withApiErrorHandling } from "../../lib/api";

const validCategories = [
  "productType",
  "unit",
  "paymentMethod",
  "saleStatus",
  "purchaseStatus",
  "purchaseType",
];

export default withApiErrorHandling(async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const idParam = Array.isArray(req.query.id) ? req.query.id[0] : req.query.id;
  const categoryParam = Array.isArray(req.query.category)
    ? req.query.category[0]
    : req.query.category;
  const id = idParam ? Number(idParam) : null;
  const category = validCategories.includes(categoryParam || "")
    ? categoryParam
    : undefined;

  if (req.method === "GET") {
    if (categoryParam && !category) {
      return res.status(400).json({ error: "Categoria inválida." });
    }

    const where = category ? ({ category } as any) : undefined;
    const types = await prisma.productType.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });
    res.status(200).json(types);
    return;
  }

  if (req.method === "POST") {
    const { name, category: bodyCategory } = req.body;
    if (!name) return res.status(400).json({ error: "Nome é obrigatório." });

    const created = await prisma.productType.create({
      data: {
        name,
        category: validCategories.includes(bodyCategory)
          ? bodyCategory
          : "productType",
      } as any,
    });
    res.status(201).json(created);
    return;
  }

  if ((req.method === "PUT" || req.method === "PATCH") && id) {
    const { name, category: bodyCategory } = req.body;
    const existing = (await prisma.productType.findUnique({
      where: { id },
    })) as any;
    if (!existing)
      return res.status(404).json({ error: "Tipo não encontrado." });

    const updated = await prisma.productType.update({
      where: { id },
      data: {
        name: name ?? existing.name,
        category: validCategories.includes(bodyCategory)
          ? bodyCategory
          : existing.category,
      } as any,
    });
    res.status(200).json(updated);
    return;
  }

  if (req.method === "DELETE" && id) {
    await prisma.productType.delete({ where: { id } });
    res.status(204).end();
    return;
  }

  return res.status(405).json({ error: "Method not allowed" });
});
