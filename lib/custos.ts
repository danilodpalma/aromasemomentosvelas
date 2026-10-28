// lib/custos.ts
// Custo de fabricação de um modelo, a partir da receita e do custo unitário dos
// insumos. Fórmula única, usada pela tela de Cálculo e (depois) pelas vendas e
// pelo Dashboard:
//   custo total    = insumos + embalagem + mão de obra
//   preço sugerido = custo total × (1 + margem%)

export type InsumoCusto = {
  name: string;
  unitCost: number;
};

/** Campos do Modelo usados no cálculo (aceita o objeto do banco ou da tela). */
export type ModeloCusto = {
  baseNome?: string | null;
  base2Nome?: string | null;
  ceraGr: number;
  cera2Gr?: number | null;
  esenciaMl: number;
  essenciaNome?: string | null;
  pavio?: string | null;
  coranteNome?: string | null;
  coranteGr: number;
  recipiente?: string | null;
  pedra?: string | null;
  pedraGr?: number | null;
  extrato?: string | null;
  extratoGr: number;
  lauril?: string | null;
  laurilGr: number;
  oleo?: string | null;
  oleoGr?: number | null;
  argila?: string | null;
  argilaGr?: number | null;
  dioxido?: string | null;
  dioxidoGr?: number | null;
  manteiga?: string | null;
  manteigaGr?: number | null;
  embalagem: number;
  maoDeObra: number;
  margemLucro: number;
};

/** Base usada quando o modelo não informa a base principal. */
const BASE_PADRAO = "Cera de Coco";

// Busca só pelo nome exato (ignorando maiúsculas/espaços nas pontas): a busca
// parcial podia trazer o insumo errado, como "Lavanda" casando com "Lavanda Francesa".
export function findInsumo<T extends InsumoCusto>(
  insumos: T[],
  name?: string | null,
) {
  if (!name) return undefined;
  const normalized = name.trim().toLowerCase();
  return insumos.find(
    (insumo) => insumo.name.trim().toLowerCase() === normalized,
  );
}

export function findUnitCost(insumos: InsumoCusto[], name?: string | null) {
  return findInsumo(insumos, name)?.unitCost ?? 0;
}

/** Insumos citados no modelo que não existem no cadastro (o custo deles sai zerado). */
export function findMissingInsumos(insumos: InsumoCusto[], modelo: ModeloCusto) {
  const names = [
    modelo.baseNome || BASE_PADRAO,
    modelo.base2Nome,
    modelo.essenciaNome,
    modelo.pavio,
    modelo.coranteNome,
    modelo.recipiente,
    modelo.pedra,
    modelo.extrato,
    modelo.lauril,
    modelo.oleo,
    modelo.argila,
    modelo.dioxido,
    modelo.manteiga,
  ];
  return names.filter(
    (name): name is string => !!name && !findInsumo(insumos, name),
  );
}

export function calcularCustoModelo(
  modelo: ModeloCusto,
  insumos: InsumoCusto[],
) {
  const baseName = modelo.baseNome || BASE_PADRAO;
  const base2Name = modelo.base2Nome || "";

  // [rótulo, quantidade, unidade, nome do insumo]
  const linhas: Array<[string, number, string, string | null | undefined]> = [
    [baseName, modelo.ceraGr, "g", baseName],
    [base2Name || "Base secundária", modelo.cera2Gr || 0, "g", base2Name],
    [modelo.essenciaNome || "Essência", modelo.esenciaMl, "ml", modelo.essenciaNome],
    [modelo.pavio || "Pavio", 1, "und", modelo.pavio],
    [modelo.coranteNome || "Corante", modelo.coranteGr, "g", modelo.coranteNome],
    [modelo.recipiente || "Recipiente", 1, "und", modelo.recipiente],
    [modelo.pedra || "Pedra", modelo.pedraGr || 0, "g", modelo.pedra],
    [modelo.extrato || "Extrato", modelo.extratoGr, "g", modelo.extrato],
    [modelo.lauril || "Lauril", modelo.laurilGr, "g", modelo.lauril],
    [modelo.oleo || "Óleo", modelo.oleoGr || 0, "g", modelo.oleo],
    [modelo.argila || "Argila", modelo.argilaGr || 0, "g", modelo.argila],
    [modelo.dioxido || "Dióxido", modelo.dioxidoGr || 0, "g", modelo.dioxido],
    [modelo.manteiga || "Manteiga", modelo.manteigaGr || 0, "g", modelo.manteiga],
  ];

  const breakdown = linhas
    .map(([label, quantidade, unidade, insumoName]) => {
      const unitCost = findUnitCost(insumos, insumoName);
      return { label, quantidade, unidade, unitCost, value: quantidade * unitCost };
    })
    .filter((item) => item.value > 0);

  const insumoCost = breakdown.reduce((sum, item) => sum + item.value, 0);
  const fixedCost = modelo.embalagem + modelo.maoDeObra;
  const totalCost = insumoCost + fixedCost;
  const priceSuggested = totalCost * (1 + modelo.margemLucro / 100);

  return {
    insumoCost,
    fixedCost,
    totalCost,
    priceSuggested,
    breakdown,
    missingInsumos: findMissingInsumos(insumos, modelo),
  };
}
