import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../lib/prisma";
import { withApiErrorHandling } from "../../lib/api";
import { requireDataAccess } from "../../lib/auth";
import {
  describeParameterUsage,
  renameParameterReferences,
} from "../../lib/references";

const validCategories = [
  "productType",
  "unit",
  "paymentMethod",
  "saleStatus",
  "purchaseStatus",
  "purchaseType",
  "netWithdrawalPercent",
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

  requireDataAccess(req);

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

    const finalCategory = validCategories.includes(bodyCategory)
      ? bodyCategory
      : "productType";
    const finalName = String(name).trim();
    if (finalCategory === "netWithdrawalPercent") {
      const percentage = Number(finalName);
      if (!Number.isFinite(percentage) || percentage < 0 || percentage > 100) {
        return res
          .status(400)
          .json({ error: "Informe um percentual entre 0 e 100." });
      }
    }
    const duplicate = await prisma.productType.findFirst({
      where: { name: finalName, category: finalCategory },
    });
    if (duplicate) {
      return res.status(409).json({
        error: "Já existe um parâmetro com esse nome nesta categoria.",
      });
    }

    const created = await prisma.productType.create({
      data: {
        name: finalName,
        category: finalCategory,
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

    const finalCategory = validCategories.includes(bodyCategory)
      ? bodyCategory
      : existing.category;
    const finalName = String(name ?? existing.name).trim();
    if (finalCategory === "netWithdrawalPercent") {
      const percentage = Number(finalName);
      if (!Number.isFinite(percentage) || percentage < 0 || percentage > 100) {
        return res
          .status(400)
          .json({ error: "Informe um percentual entre 0 e 100." });
      }
    }
    const duplicate = await prisma.productType.findFirst({
      where: { name: finalName, category: finalCategory, id: { not: id } },
    });
    if (duplicate) {
      return res.status(409).json({
        error: "Já existe um parâmetro com esse nome nesta categoria.",
      });
    }

    // Atualiza o parâmetro e, se o nome mudou, os registros que o usam, tudo junto.
    const updated = await prisma.$transaction(async (tx) => {
      if (finalCategory === existing.category) {
        await renameParameterReferences(
          tx,
          existing.category,
          existing.name,
          finalName,
        );
      }
      return tx.productType.update({
        where: { id },
        data: {
          name: finalName,
          category: finalCategory,
        } as any,
      });
    });
    res.status(200).json(updated);
    return;
  }

  if (req.method === "DELETE" && id) {
    const existing = await prisma.productType.findUnique({ where: { id } });
    if (!existing)
      return res.status(404).json({ error: "Parâmetro não encontrado." });

    const usage = await describeParameterUsage(existing.category, existing.name);
    if (usage) {
      return res.status(409).json({
        error: `Este parâmetro é usado em ${usage} e não pode ser excluído.`,
      });
    }

    await prisma.productType.delete({ where: { id } });
    res.status(204).end();
    return;
  }

  return res.status(405).json({ error: "Method not allowed" });
});
