import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../lib/prisma";
import { withApiErrorHandling } from "../../lib/api";
import { requireDataAccess } from "../../lib/auth";

export default withApiErrorHandling(async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const idParam = Array.isArray(req.query.id) ? req.query.id[0] : req.query.id;
  const id = idParam ? Number(idParam) : null;

  requireDataAccess(req);

  if (req.method === "GET") {
    const vendas = await prisma.venda.findMany({
      orderBy: { createdAt: "desc" },
      include: { itens: true },
    });
    return res.status(200).json(vendas);
  }

  if (req.method === "POST") {
    const {
      dataVenda,
      cliente,
      modeloVela,
      quantidade,
      precoUnitario,
      desconto,
      obsDesconto,
      frete,
      obsCliente,
      formaPagamento,
      status,
      observacao,
      itens,
    } = req.body;

    const itemRows =
      Array.isArray(itens) && itens.length > 0
        ? itens
        : [{ modeloVela, quantidade, precoUnitario, observacao }];

    if (!cliente || !formaPagamento || !status || !itemRows.length) {
      return res.status(400).json({
        error:
          "Campos obrigatórios: cliente, formaPagamento, status e ao menos um item.",
      });
    }

    const normalizedItems = itemRows
      .filter(
        (item: any) =>
          item && item.modeloVela && Number(item.quantidade || 0) > 0,
      )
      .map((item: any) => ({
        modeloVela: item.modeloVela,
        quantidade: Number(item.quantidade || 0),
        precoUnitario: Number(item.precoUnitario || 0),
        observacao: item.observacao ?? "",
      }));

    if (normalizedItems.length === 0) {
      return res.status(400).json({
        error: "Adicione pelo menos um item com quantidade e valor válidos.",
      });
    }

    const subtotal = normalizedItems.reduce(
      (sum, item) => sum + item.quantidade * item.precoUnitario,
      0,
    );
    const descontoValor = Number(desconto || 0);
    const freteValor = Number(frete || 0);
    const total = Math.max(subtotal - descontoValor, 0) + freteValor;
    const firstItem = normalizedItems[0];

    const venda = await prisma.venda.create({
      data: {
        dataVenda: new Date(dataVenda || new Date()),
        cliente,
        modeloVela: firstItem.modeloVela,
        quantidade: normalizedItems.reduce(
          (sum, item) => sum + item.quantidade,
          0,
        ),
        precoUnitario: firstItem.precoUnitario,
        total,
        desconto: descontoValor,
        obsDesconto: obsDesconto ?? "",
        frete: freteValor,
        obsCliente: obsCliente ?? "",
        formaPagamento,
        status,
        observacao: observacao ?? firstItem.observacao ?? "",
        itens: {
          create: normalizedItems.map((item) => ({
            modeloVela: item.modeloVela,
            quantidade: item.quantidade,
            precoUnitario: item.precoUnitario,
            total: item.quantidade * item.precoUnitario,
            observacao: item.observacao ?? "",
          })),
        },
      },
      include: { itens: true },
    });

    return res.status(201).json(venda);
  }

  if ((req.method === "PUT" || req.method === "PATCH") && id) {
    const {
      dataVenda,
      cliente,
      modeloVela,
      quantidade,
      precoUnitario,
      desconto,
      obsDesconto,
      frete,
      obsCliente,
      formaPagamento,
      status,
      observacao,
      itens,
    } = req.body;

    const existing = await prisma.venda.findUnique({
      where: { id },
      include: { itens: true },
    });
    if (!existing) {
      return res.status(404).json({ error: "Venda não encontrada." });
    }

    const itemRows =
      Array.isArray(itens) && itens.length > 0
        ? itens
        : [{ modeloVela, quantidade, precoUnitario, observacao }];
    const normalizedItems = itemRows
      .filter(
        (item: any) =>
          item && item.modeloVela && Number(item.quantidade || 0) > 0,
      )
      .map((item: any) => ({
        modeloVela: item.modeloVela,
        quantidade: Number(item.quantidade || 0),
        precoUnitario: Number(item.precoUnitario || 0),
        observacao: item.observacao ?? "",
      }));

    const subtotal =
      normalizedItems.length > 0
        ? normalizedItems.reduce(
            (sum, item) => sum + item.quantidade * item.precoUnitario,
            0,
          )
        : Number(existing.total || 0);
    const descontoValor = Number(desconto ?? existing.desconto ?? 0);
    const freteValor = Number(frete ?? existing.frete ?? 0);
    const total = Math.max(subtotal - descontoValor, 0) + freteValor;

    const firstItem = normalizedItems[0] ?? {
      modeloVela: existing.modeloVela,
      quantidade: existing.quantidade,
      precoUnitario: existing.precoUnitario,
      observacao: existing.observacao ?? "",
    };

    // Escrita aninhada: apagar e recriar os itens roda numa única transação.
    const updated = await prisma.venda.update({
      where: { id },
      data: {
        dataVenda: dataVenda ? new Date(dataVenda) : existing.dataVenda,
        cliente: cliente ?? existing.cliente,
        modeloVela: firstItem.modeloVela,
        quantidade:
          normalizedItems.reduce((sum, item) => sum + item.quantidade, 0) ||
          existing.quantidade,
        precoUnitario: firstItem.precoUnitario || existing.precoUnitario,
        total,
        desconto: descontoValor,
        obsDesconto: obsDesconto ?? existing.obsDesconto ?? "",
        frete: freteValor,
        obsCliente: obsCliente ?? existing.obsCliente ?? "",
        formaPagamento: formaPagamento ?? existing.formaPagamento,
        status: status ?? existing.status,
        observacao: observacao ?? firstItem.observacao ?? existing.observacao,
        itens: {
          deleteMany: {},
          create: normalizedItems.map((item) => ({
            modeloVela: item.modeloVela,
            quantidade: item.quantidade,
            precoUnitario: item.precoUnitario,
            total: item.quantidade * item.precoUnitario,
            observacao: item.observacao ?? "",
          })),
        },
      },
      include: { itens: true },
    });

    return res.status(200).json(updated);
  }

  if (req.method === "DELETE" && id) {
    const existing = await prisma.venda.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: "Venda não encontrada." });
    }

    await prisma.$transaction(async (transaction) => {
      await transaction.vendaItem.deleteMany({ where: { vendaId: id } });
      await transaction.venda.delete({ where: { id } });
    });
    return res.status(200).json({ message: "Venda excluída com sucesso." });
  }

  return res.status(405).json({ error: "Method not allowed" });
});
