// lib/references.ts
// Vários cadastros são referenciados pelo NOME (e não pelo id) em outras tabelas.
// Este módulo concentra onde cada nome é usado, para:
//  - propagar renomeações (renomear um modelo atualiza as vendas que o citam);
//  - impedir a exclusão de cadastros que ainda estão em uso.
import { Prisma } from "@prisma/client";
import { prisma } from "./prisma";

type Db = Prisma.TransactionClient | typeof prisma;

/** Campos do Modelo que guardam o nome de um insumo. */
const MODELO_INSUMO_FIELDS = [
  "baseNome",
  "base2Nome",
  "essenciaNome",
  "pavio",
  "coranteNome",
  "recipiente",
  "pedra",
  "extrato",
  "lauril",
  "oleo",
  "argila",
  "dioxido",
  "manteiga",
] as const;

function modeloUsesInsumo(name: string): Prisma.ModeloWhereInput {
  return { OR: MODELO_INSUMO_FIELDS.map((field) => ({ [field]: name })) };
}

function parseNameList(value: string | null) {
  if (!value) return [] as string[];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? (parsed as string[]) : [];
  } catch {
    return [];
  }
}

// ---------------- Insumo ----------------

export async function renameInsumoReferences(
  db: Db,
  oldName: string,
  newName: string,
) {
  if (oldName === newName) return;
  for (const field of MODELO_INSUMO_FIELDS) {
    await db.modelo.updateMany({
      where: { [field]: oldName },
      data: { [field]: newName },
    });
  }
}

/** Descreve onde o insumo é usado, ou null se estiver livre para exclusão. */
export async function describeInsumoUsage(insumo: { id: number; name: string }) {
  const [modelos, compras, sales] = await Promise.all([
    prisma.modelo.count({ where: modeloUsesInsumo(insumo.name) }),
    prisma.compraItem.count({ where: { insumoId: insumo.id } }),
    prisma.sale.count({ where: { insumoId: insumo.id } }),
  ]);
  const parts = [
    modelos && `${modelos} modelo(s)`,
    compras && `${compras} item(ns) de compra`,
    sales && `${sales} venda(s) antiga(s)`,
  ].filter(Boolean);
  return parts.length ? parts.join(", ") : null;
}

// ---------------- Modelo ----------------

export async function renameModeloReferences(
  db: Db,
  oldName: string,
  newName: string,
) {
  if (oldName === newName) return;
  await db.vendaItem.updateMany({
    where: { modeloVela: oldName },
    data: { modeloVela: newName },
  });
  await db.venda.updateMany({
    where: { modeloVela: oldName },
    data: { modeloVela: newName },
  });
}

export async function describeModeloUsage(nome: string) {
  const [itens, vendas] = await Promise.all([
    prisma.vendaItem.count({ where: { modeloVela: nome } }),
    prisma.venda.count({ where: { modeloVela: nome } }),
  ]);
  const total = Math.max(itens, vendas);
  return total ? `${total} venda(s)` : null;
}

// ---------------- Parâmetros (ProductType) ----------------

export async function renameParameterReferences(
  db: Db,
  category: string,
  oldName: string,
  newName: string,
) {
  if (oldName === newName) return;
  switch (category) {
    case "paymentMethod":
      await db.venda.updateMany({
        where: { formaPagamento: oldName },
        data: { formaPagamento: newName },
      });
      break;
    case "saleStatus":
      await db.venda.updateMany({
        where: { status: oldName },
        data: { status: newName },
      });
      break;
    case "purchaseStatus":
      await db.compra.updateMany({
        where: { status: oldName },
        data: { status: newName },
      });
      break;
    case "purchaseType":
      await db.compra.updateMany({
        where: { tipoLancamento: oldName },
        data: { tipoLancamento: newName },
      });
      break;
    case "unit":
      await db.insumo.updateMany({
        where: { unit: oldName },
        data: { unit: newName },
      });
      await db.compraItem.updateMany({
        where: { unidade: oldName },
        data: { unidade: newName },
      });
      break;
    case "productType": {
      await db.modelo.updateMany({
        where: { tipoProduto: oldName },
        data: { tipoProduto: newName },
      });
      // Insumo.productTypes é uma lista em JSON: atualiza item a item.
      const insumos = await db.insumo.findMany({
        where: { productTypes: { contains: JSON.stringify(oldName) } },
      });
      for (const insumo of insumos) {
        const names = parseNameList(insumo.productTypes).map((name) =>
          name === oldName ? newName : name,
        );
        await db.insumo.update({
          where: { id: insumo.id },
          data: { productTypes: JSON.stringify(names) },
        });
      }
      break;
    }
  }
}

export async function describeParameterUsage(category: string, name: string) {
  const count = async () => {
    switch (category) {
      case "paymentMethod":
        return prisma.venda.count({ where: { formaPagamento: name } });
      case "saleStatus":
        return prisma.venda.count({ where: { status: name } });
      case "purchaseStatus":
        return prisma.compra.count({ where: { status: name } });
      case "purchaseType":
        return prisma.compra.count({ where: { tipoLancamento: name } });
      case "unit": {
        const [insumos, itens] = await Promise.all([
          prisma.insumo.count({ where: { unit: name } }),
          prisma.compraItem.count({ where: { unidade: name } }),
        ]);
        return insumos + itens;
      }
      case "productType": {
        const [modelos, insumos] = await Promise.all([
          prisma.modelo.count({ where: { tipoProduto: name } }),
          prisma.insumo.findMany({
            where: { productTypes: { contains: JSON.stringify(name) } },
            select: { productTypes: true },
          }),
        ]);
        return (
          modelos +
          insumos.filter((i) => parseNameList(i.productTypes).includes(name))
            .length
        );
      }
      default:
        return 0;
    }
  };
  const total = await count();
  return total ? `${total} registro(s)` : null;
}
