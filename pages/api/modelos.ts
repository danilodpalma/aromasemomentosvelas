import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const idParam = Array.isArray(req.query.id) ? req.query.id[0] : req.query.id;
  const id = idParam ? Number(idParam) : null;

  if (req.method === "GET") {
    const modelos = await prisma.modelo.findMany({
      orderBy: { createdAt: "desc" },
    });
    return res.status(200).json(modelos);
  }

  if (req.method === "POST") {
    const {
      nome,
      ativo,
      tipoProduto,
      ceraGr,
      esenciaMl,
      essenciaNome,
      pavio,
      coranteNome,
      coranteGr,
      recipiente,
      pedra,
      extrato,
      extratoGr,
      lauril,
      laurilGr,
      tampa,
      embalagem,
      maoDeObra,
      margemLucro,
      valorVendido,
    } = req.body;

    if (!nome) {
      return res.status(400).json({ error: "O nome do modelo é obrigatório." });
    }

    const modelo = await prisma.modelo.create({
      data: {
        nome,
        ativo: ativo !== undefined ? Boolean(ativo) : true,
        tipoProduto: tipoProduto ?? null,
        ceraGr: Number(ceraGr) || 0,
        esenciaMl: Number(esenciaMl) || 0,
        essenciaNome: essenciaNome ?? "",
        pavio: pavio ?? "",
        coranteNome: coranteNome ?? "",
        coranteGr: Number(coranteGr) || 0,
        recipiente: recipiente ?? "",
        pedra: pedra ?? "",
        extrato: extrato ?? "",
        extratoGr: Number(extratoGr) || 0,
        lauril: lauril ?? "",
        laurilGr: Number(laurilGr) || 0,
        tampa: tampa ?? "",
        embalagem: Number(embalagem) || 0,
        maoDeObra: Number(maoDeObra) || 0,
        margemLucro: Number(margemLucro) || 0,
        valorVendido: Number(valorVendido) || 0,
      },
    });

    return res.status(201).json(modelo);
  }

  if ((req.method === "PUT" || req.method === "PATCH") && id) {
    const {
      nome,
      ativo,
      tipoProduto,
      ceraGr,
      esenciaMl,
      essenciaNome,
      pavio,
      coranteNome,
      coranteGr,
      recipiente,
      pedra,
      extrato,
      extratoGr,
      lauril,
      laurilGr,
      tampa,
      embalagem,
      maoDeObra,
      margemLucro,
      valorVendido,
    } = req.body;

    const existing = await prisma.modelo.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: "Modelo não encontrado." });
    }

    const updated = await prisma.modelo.update({
      where: { id },
      data: {
        nome: nome ?? existing.nome,
        ativo: ativo !== undefined ? Boolean(ativo) : existing.ativo,
        tipoProduto: tipoProduto ?? existing.tipoProduto,
        ceraGr: ceraGr != null ? Number(ceraGr) : existing.ceraGr,
        esenciaMl: esenciaMl != null ? Number(esenciaMl) : existing.esenciaMl,
        essenciaNome: essenciaNome ?? existing.essenciaNome,
        pavio: pavio ?? existing.pavio,
        coranteNome: coranteNome ?? existing.coranteNome,
        coranteGr: coranteGr != null ? Number(coranteGr) : existing.coranteGr,
        recipiente: recipiente ?? existing.recipiente,
        pedra: pedra ?? existing.pedra,
        extrato: extrato ?? existing.extrato,
        extratoGr: extratoGr != null ? Number(extratoGr) : existing.extratoGr,
        lauril: lauril ?? existing.lauril,
        laurilGr: laurilGr != null ? Number(laurilGr) : existing.laurilGr,
        tampa: tampa ?? existing.tampa,
        embalagem: embalagem != null ? Number(embalagem) : existing.embalagem,
        maoDeObra: maoDeObra != null ? Number(maoDeObra) : existing.maoDeObra,
        margemLucro:
          margemLucro != null ? Number(margemLucro) : existing.margemLucro,
        valorVendido:
          valorVendido != null ? Number(valorVendido) : existing.valorVendido,
      },
    });

    return res.status(200).json(updated);
  }

  return res.status(405).json({ error: "Method not allowed" });
}
