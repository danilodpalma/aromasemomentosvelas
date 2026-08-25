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
      baseNome,
      base2Nome,
      ceraGr,
      cera2Gr,
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
      oleo,
      oleoGr,
      argila,
      argilaGr,
      dioxido,
      dioxidoGr,
      manteiga,
      manteigaGr,
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
        baseNome: baseNome ?? null,
        base2Nome: base2Nome ?? null,
        ceraGr: Number(ceraGr) || 0,
        cera2Gr: Number(cera2Gr) || 0,
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
        oleo: oleo ?? "",
        oleoGr: Number(oleoGr) || 0,
        argila: argila ?? "",
        argilaGr: Number(argilaGr) || 0,
        dioxido: dioxido ?? "",
        dioxidoGr: Number(dioxidoGr) || 0,
        manteiga: manteiga ?? "",
        manteigaGr: Number(manteigaGr) || 0,
        embalagem: Number(embalagem) || 0,
        maoDeObra: Number(maoDeObra) || 0,
        margemLucro: Number(margemLucro) || 0,
        valorVendido: Number(valorVendido) || 0,
      } as any,
    });

    return res.status(201).json(modelo);
  }

  if ((req.method === "PUT" || req.method === "PATCH") && id) {
    const {
      nome,
      ativo,
      tipoProduto,
      baseNome,
      base2Nome,
      ceraGr,
      cera2Gr,
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
      oleo,
      oleoGr,
      argila,
      argilaGr,
      dioxido,
      dioxidoGr,
      manteiga,
      manteigaGr,
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
        baseNome: baseNome ?? existing.baseNome,
        base2Nome: base2Nome ?? existing.base2Nome,
        ceraGr: ceraGr != null ? Number(ceraGr) : existing.ceraGr,
        cera2Gr: cera2Gr != null ? Number(cera2Gr) : existing.cera2Gr,
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
        oleo: oleo ?? existing.oleo,
        oleoGr: oleoGr != null ? Number(oleoGr) : existing.oleoGr,
        argila: argila ?? existing.argila,
        argilaGr: argilaGr != null ? Number(argilaGr) : existing.argilaGr,
        dioxido: dioxido ?? existing.dioxido,
        dioxidoGr: dioxidoGr != null ? Number(dioxidoGr) : existing.dioxidoGr,
        manteiga: manteiga ?? existing.manteiga,
        manteigaGr:
          manteigaGr != null ? Number(manteigaGr) : existing.manteigaGr,
        embalagem: embalagem != null ? Number(embalagem) : existing.embalagem,
        maoDeObra: maoDeObra != null ? Number(maoDeObra) : existing.maoDeObra,
        margemLucro:
          margemLucro != null ? Number(margemLucro) : existing.margemLucro,
        valorVendido:
          valorVendido != null ? Number(valorVendido) : existing.valorVendido,
      } as any,
    });

    return res.status(200).json(updated);
  }

  if (req.method === "DELETE" && id) {
    const existing = await prisma.modelo.findUnique({ where: { id } });
    if (!existing)
      return res.status(404).json({ error: "Modelo não encontrado." });

    await prisma.modelo.delete({ where: { id } });
    return res.status(204).end();
  }

  return res.status(405).json({ error: "Method not allowed" });
});
