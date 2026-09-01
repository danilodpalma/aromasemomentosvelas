import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../lib/prisma";
import { withApiErrorHandling } from "../../lib/api";

function toNumber(value: unknown, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function mapCompra(compra: any) {
  return {
    ...compra,
    valor: Number(compra.valor || 0),
    itens: (compra.itens || []).map((item: any) => ({
      ...item,
      insumoId: item.insumoId ?? item.insumo?.id ?? null,
      quantidade: Number(item.quantidade || 0),
      custoUnitario: Number(item.custoUnitario || 0),
      custoTotal: Number(item.custoTotal || 0),
      insumo: item.insumo
        ? {
            ...item.insumo,
            purchaseCost: Number(item.insumo.purchaseCost || 0),
            purchasedQuantity: Number(item.insumo.purchasedQuantity || 0),
            unitCost: Number(item.insumo.unitCost || 0),
            stock: Number(item.insumo.stock || 0),
          }
        : null,
    })),
  };
}

async function applyInventoryEffect(
  insumoId: number,
  quantityDelta: number,
  costDelta: number,
  status: string,
) {
  const insumo = await prisma.insumo.findUnique({ where: { id: insumoId } });
  if (!insumo) return;

  const newStock = Math.max(0, Number(insumo.stock || 0) + quantityDelta);
  const newQuantity = Math.max(
    0,
    Number(insumo.purchasedQuantity || 0) + quantityDelta,
  );
  const newCost = Math.max(0, Number(insumo.purchaseCost || 0) + costDelta);

  const newUnitCost =
    newQuantity > 0 ? newCost / newQuantity : Number(insumo.unitCost || 0);

  await prisma.insumo.update({
    where: { id: insumoId },
    data: {
      stock: newStock,
      purchasedQuantity: newQuantity,
      purchaseCost: newCost,
      unitCost: newUnitCost,
    },
  });
}

export default withApiErrorHandling(async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === "GET") {
    const compras = await prisma.compra.findMany({
      orderBy: { data: "desc" },
      include: { itens: { include: { insumo: true } } },
    });

    return res.status(200).json(compras.map(mapCompra));
  }

  if (req.method === "POST") {
    const { data, tipoLancamento, categoria, descricao, valor, status, itens } =
      req.body ?? {};

    if (!data || !tipoLancamento) {
      return res
        .status(400)
        .json({ error: "Data e tipo de lançamento são obrigatórios." });
    }

    const parsedStatus = String(status || "Pendente").trim();
    const compra = await prisma.compra.create({
      data: {
        data: new Date(data),
        tipoLancamento: String(tipoLancamento),
        categoria: categoria ? String(categoria) : null,
        descricao: descricao ? String(descricao) : null,
        valor: toNumber(valor, 0),
        status: parsedStatus,
      },
    });

    if (String(tipoLancamento) === "Compra de Insumo") {
      const rows = Array.isArray(itens) ? itens : [];

      for (const row of rows) {
        const insumoId = Number(row?.insumoId);
        if (!insumoId) continue;

        const insumo = await prisma.insumo.findUnique({
          where: { id: insumoId },
        });
        if (!insumo) continue;

        const quantidade = toNumber(row?.quantidade, 0);
        const custoUnitario = toNumber(row?.custoUnitario, 0);
        const custoTotal = toNumber(
          row?.custoTotal,
          quantidade * custoUnitario,
        );

        await prisma.compraItem.create({
          data: {
            compraId: compra.id,
            insumoId,
            quantidade,
            unidade: row?.unidade ? String(row.unidade) : (insumo.unit ?? null),
            custoUnitario,
            custoTotal,
          },
        });

        if (["Aprovado", "Recebido"].includes(parsedStatus)) {
          const currentStock = Number(insumo.stock || 0);
          const currentPurchaseCost = Number(insumo.purchaseCost || 0);
          const currentPurchasedQuantity = Number(
            insumo.purchasedQuantity || 0,
          );
          const nextStock = currentStock + quantidade;
          const nextPurchaseCost = currentPurchaseCost + custoTotal;
          const nextPurchasedQuantity = currentPurchasedQuantity + quantidade;
          const nextUnitCost =
            nextPurchasedQuantity > 0
              ? nextPurchaseCost / nextPurchasedQuantity
              : 0;

          await prisma.insumo.update({
            where: { id: insumoId },
            data: {
              stock: nextStock,
              purchaseCost: nextPurchaseCost,
              purchasedQuantity: nextPurchasedQuantity,
              unitCost: nextUnitCost,
            },
          });
        }
      }
    }

    const created = await prisma.compra.findUnique({
      where: { id: compra.id },
      include: { itens: { include: { insumo: true } } },
    });

    return res.status(201).json(mapCompra(created));
  }

  if (req.method === "PATCH") {
    const idParam = Array.isArray(req.query.id)
      ? req.query.id[0]
      : req.query.id;
    const id = idParam ? Number(idParam) : null;

    if (!id) {
      return res.status(400).json({ error: "ID da compra é obrigatório." });
    }

    const { data, tipoLancamento, categoria, descricao, valor, status, itens } =
      req.body ?? {};

    const existing = await prisma.compra.findUnique({
      where: { id },
      include: { itens: true },
    });

    if (!existing) {
      return res.status(404).json({ error: "Compra não encontrada." });
    }

    const parsedStatus = String(status || existing.status || "Pendente").trim();
    const shouldAffectInventory = ["Aprovado", "Recebido"].includes(
      parsedStatus,
    );

    if (existing.itens.length > 0 && shouldAffectInventory) {
      for (const item of existing.itens) {
        await applyInventoryEffect(
          item.insumoId,
          -Number(item.quantidade || 0),
          -Number(item.custoTotal || 0),
          existing.status,
        );
      }
    }

    await prisma.compraItem.deleteMany({ where: { compraId: id } });

    await prisma.compra.update({
      where: { id },
      data: {
        data: data ? new Date(data) : existing.data,
        tipoLancamento: tipoLancamento
          ? String(tipoLancamento)
          : existing.tipoLancamento,
        categoria: categoria != null ? String(categoria) : existing.categoria,
        descricao: descricao != null ? String(descricao) : existing.descricao,
        valor: toNumber(valor, existing.valor),
        status: parsedStatus,
      },
    });

    if (
      String(tipoLancamento || existing.tipoLancamento) === "Compra de Insumo"
    ) {
      const rows = Array.isArray(itens) ? itens : [];
      for (const row of rows) {
        const insumoId = Number(row?.insumoId);
        if (!insumoId) continue;

        const quantidade = toNumber(row?.quantidade, 0);
        const custoUnitario = toNumber(row?.custoUnitario, 0);
        const custoTotal = toNumber(
          row?.custoTotal,
          quantidade * custoUnitario,
        );

        await prisma.compraItem.create({
          data: {
            compraId: id,
            insumoId,
            quantidade,
            unidade: row?.unidade ? String(row.unidade) : null,
            custoUnitario,
            custoTotal,
          },
        });

        if (shouldAffectInventory) {
          await applyInventoryEffect(
            insumoId,
            quantidade,
            custoTotal,
            parsedStatus,
          );
        }
      }
    }

    const updated = await prisma.compra.findUnique({
      where: { id },
      include: { itens: { include: { insumo: true } } },
    });

    return res.status(200).json(mapCompra(updated));
  }

  if (req.method === "DELETE") {
    const idParam = Array.isArray(req.query.id)
      ? req.query.id[0]
      : req.query.id;
    const id = idParam ? Number(idParam) : null;

    if (!id) {
      return res.status(400).json({ error: "ID da compra é obrigatório." });
    }

    const compra = await prisma.compra.findUnique({
      where: { id },
      include: { itens: true },
    });
    if (!compra) {
      return res.status(404).json({ error: "Compra não encontrada." });
    }

    await prisma.compraItem.deleteMany({ where: { compraId: id } });
    await prisma.compra.delete({ where: { id } });
    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: "Method not allowed" });
});
