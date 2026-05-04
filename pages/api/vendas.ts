import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const idParam = Array.isArray(req.query.id) ? req.query.id[0] : req.query.id;
  const id = idParam ? Number(idParam) : null;

  if (req.method === "GET") {
    const vendas = await prisma.venda.findMany({ orderBy: { createdAt: "desc" } });
    return res.status(200).json(vendas);
  }

  if (req.method === "POST") {
    const {
      dataVenda,
      cliente,
      modeloVela,
      quantidade,
      precoUnitario,
      formaPagamento,
      status,
      observacao,
    } = req.body;

    if (!cliente || !modeloVela || !quantidade || !precoUnitario || !formaPagamento || !status) {
      return res.status(400).json({ error: "Campos obrigatórios: cliente, modeloVela, quantidade, precoUnitario, formaPagamento, status." });
    }

    const total = Number(quantidade) * Number(precoUnitario);

    const venda = await prisma.venda.create({
      data: {
        dataVenda: new Date(dataVenda),
        cliente,
        modeloVela,
        quantidade: Number(quantidade),
        precoUnitario: Number(precoUnitario),
        total,
        formaPagamento,
        status,
        observacao: observacao ?? "",
      },
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
      formaPagamento,
      status,
      observacao,
    } = req.body;

    const existing = await prisma.venda.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: "Venda não encontrada." });
    }

    const total = quantidade != null && precoUnitario != null ? Number(quantidade) * Number(precoUnitario) : existing.total;

    const updated = await prisma.venda.update({
      where: { id },
      data: {
        dataVenda: dataVenda ? new Date(dataVenda) : existing.dataVenda,
        cliente: cliente ?? existing.cliente,
        modeloVela: modeloVela ?? existing.modeloVela,
        quantidade: quantidade != null ? Number(quantidade) : existing.quantidade,
        precoUnitario: precoUnitario != null ? Number(precoUnitario) : existing.precoUnitario,
        total,
        formaPagamento: formaPagamento ?? existing.formaPagamento,
        status: status ?? existing.status,
        observacao: observacao ?? existing.observacao,
      },
    });

    return res.status(200).json(updated);
  }

  if (req.method === "DELETE" && id) {
    const existing = await prisma.venda.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: "Venda não encontrada." });
    }

    await prisma.venda.delete({ where: { id } });
    return res.status(200).json({ message: "Venda excluída com sucesso." });
  }

  return res.status(405).json({ error: "Method not allowed" });
}