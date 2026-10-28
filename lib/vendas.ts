// lib/vendas.ts
// Regras financeiras das vendas, usadas pelo Dashboard.
//
// Cada forma de pagamento pertence a um TIPO (cadastrado em Parâmetros):
//  - recebido:  dinheiro que já entrou (crédito, débito, dinheiro, pix...)
//  - a_receber: venda feita, pagamento pendente (a receber, consignação...)
//  - doacao:    saída sem receita (presente, patrocínio, troca de serviços...)
// Vendas com status de cancelamento ficam fora de todos os totais.

export type PaymentGroup = "recebido" | "a_receber" | "doacao";

export const PAYMENT_GROUPS: { value: PaymentGroup; label: string }[] = [
  { value: "recebido", label: "Recebido" },
  { value: "a_receber", label: "A receber" },
  { value: "doacao", label: "Doação / cortesia" },
];

export function isPaymentGroup(value: unknown): value is PaymentGroup {
  return PAYMENT_GROUPS.some((group) => group.value === value);
}

export function paymentGroupLabel(group: PaymentGroup | null | undefined) {
  return PAYMENT_GROUPS.find((item) => item.value === group)?.label ?? "Sem tipo";
}

type PaymentMethodParam = { name: string; paymentGroup?: string | null };

type VendaResumoInput = {
  total: number;
  frete?: number | null;
  desconto?: number | null;
  quantidade: number;
  formaPagamento: string;
  status: string;
  itens?: Array<{
    modeloVela?: string;
    quantidade: number;
    precoUnitario?: number;
    custoUnitario?: number | null;
  }>;
};

/** Minúsculas e sem acentos, para comparar nomes digitados de formas diferentes. */
export function normalizeText(value: string) {
  return (value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

/** Tipo deduzido pelo nome, usado enquanto a forma de pagamento não tem tipo cadastrado. */
export function inferPaymentGroup(formaPagamento: string): PaymentGroup | null {
  const name = normalizeText(formaPagamento);
  if (["credito", "debito", "dinheiro", "pix"].some((k) => name.includes(k))) {
    return "recebido";
  }
  if (["receber", "consigna"].some((k) => name.includes(k))) {
    return "a_receber";
  }
  if (
    ["presente", "patrocin", "troca", "brinde", "cortesia", "doacao"].some((k) =>
      name.includes(k),
    )
  ) {
    return "doacao";
  }
  return null;
}

export function getPaymentGroup(
  formaPagamento: string,
  paymentMethods: PaymentMethodParam[] = [],
): PaymentGroup | null {
  const param = paymentMethods.find(
    (method) => normalizeText(method.name) === normalizeText(formaPagamento),
  );
  if (param && isPaymentGroup(param.paymentGroup)) return param.paymentGroup;
  return inferPaymentGroup(formaPagamento);
}

export function isCanceledStatus(status: string) {
  return normalizeText(status).includes("cancel");
}

/** Faturamento da venda: itens − desconto, sem o frete (que é repasse). */
export function getSaleRevenue(venda: Pick<VendaResumoInput, "total" | "frete">) {
  const total = Number.isFinite(venda.total) ? Number(venda.total) : 0;
  return Math.max(total - Number(venda.frete ?? 0), 0);
}

/**
 * Custo de fabricação da venda (soma de custo congelado × quantidade dos itens).
 * Null quando algum item não tem custo registrado.
 */
function getSaleCost(venda: VendaResumoInput): number | null {
  if (!venda.itens?.length) return null;
  let custo = 0;
  for (const item of venda.itens) {
    if (item.custoUnitario == null) return null;
    custo += item.custoUnitario * item.quantidade;
  }
  return custo;
}

function getSaleUnits(venda: VendaResumoInput) {
  return venda.itens?.length
    ? venda.itens.reduce((sum, item) => sum + item.quantidade, 0)
    : venda.quantidade;
}

type MethodTotal = { name: string; pedidos: number; valor: number };

function addToMethod(list: MethodTotal[], name: string, valor: number) {
  const entry = list.find((item) => item.name === name);
  if (entry) {
    entry.pedidos += 1;
    entry.valor += valor;
  } else {
    list.push({ name, pedidos: 1, valor });
  }
}

export type ResumoFinanceiro = ReturnType<typeof summarizeVendas>;

/** Resumo financeiro de um conjunto de vendas (já filtrado pelo período). */
export function summarizeVendas(
  vendas: VendaResumoInput[],
  paymentMethods: PaymentMethodParam[] = [],
) {
  const resumo = {
    // Vendas efetivas (recebido + a receber)
    bruto: 0,
    descontos: 0,
    faturamento: 0,
    custoProdutos: 0,
    recebido: 0,
    aReceber: 0,
    frete: 0,
    pedidos: 0,
    unidades: 0,
    recebidoPorForma: [] as MethodTotal[],
    aReceberPorForma: [] as MethodTotal[],
    // Saídas sem receita (valor de venda dos produtos doados)
    doacoes: { pedidos: 0, unidades: 0, valor: 0, custo: 0 },
    doacoesPorForma: [] as (MethodTotal & { unidades: number; custo: number })[],
    // Vendas/doações cujo custo não está registrado (ficam fora do custo e da margem)
    semCusto: { pedidos: 0 },
    // Fora dos totais
    canceladas: { pedidos: 0, valor: 0 },
    semTipo: { pedidos: 0, valor: 0, formas: [] as string[] },
  };

  for (const venda of vendas) {
    const faturamento = getSaleRevenue(venda);
    const desconto = Number(venda.desconto ?? 0);
    const unidades = getSaleUnits(venda);
    const custo = getSaleCost(venda);

    if (isCanceledStatus(venda.status)) {
      resumo.canceladas.pedidos += 1;
      resumo.canceladas.valor += faturamento;
      continue;
    }

    const group = getPaymentGroup(venda.formaPagamento, paymentMethods);

    if (group === "doacao") {
      resumo.doacoes.pedidos += 1;
      resumo.doacoes.unidades += unidades;
      resumo.doacoes.valor += faturamento;
      resumo.doacoes.custo += custo ?? 0;
      if (custo === null) resumo.semCusto.pedidos += 1;
      const entry = resumo.doacoesPorForma.find(
        (item) => item.name === venda.formaPagamento,
      );
      if (entry) {
        entry.pedidos += 1;
        entry.unidades += unidades;
        entry.valor += faturamento;
        entry.custo += custo ?? 0;
      } else {
        resumo.doacoesPorForma.push({
          name: venda.formaPagamento,
          pedidos: 1,
          unidades,
          valor: faturamento,
          custo: custo ?? 0,
        });
      }
      continue;
    }

    if (group === null) {
      resumo.semTipo.pedidos += 1;
      resumo.semTipo.valor += faturamento;
      if (!resumo.semTipo.formas.includes(venda.formaPagamento)) {
        resumo.semTipo.formas.push(venda.formaPagamento);
      }
      continue;
    }

    resumo.pedidos += 1;
    resumo.unidades += unidades;
    resumo.bruto += faturamento + desconto;
    resumo.descontos += desconto;
    resumo.faturamento += faturamento;
    resumo.custoProdutos += custo ?? 0;
    if (custo === null) resumo.semCusto.pedidos += 1;
    resumo.frete += Number(venda.frete ?? 0);

    if (group === "recebido") {
      resumo.recebido += faturamento;
      addToMethod(resumo.recebidoPorForma, venda.formaPagamento, faturamento);
    } else {
      resumo.aReceber += faturamento;
      addToMethod(resumo.aReceberPorForma, venda.formaPagamento, faturamento);
    }
  }

  const margem = resumo.faturamento - resumo.custoProdutos;
  return {
    ...resumo,
    ticketMedio: resumo.pedidos > 0 ? resumo.faturamento / resumo.pedidos : 0,
    // Margem bruta: faturamento líquido − custo de fabricação (insumos +
    // embalagem + mão de obra) dos produtos vendidos.
    margem,
    margemPercent: resumo.faturamento > 0 ? (margem / resumo.faturamento) * 100 : 0,
  };
}

export type MargemProduto = {
  produto: string;
  unidades: number;
  faturamento: number;
  custo: number;
  margem: number;
  margemPercent: number;
  /** Unidades sem custo registrado (ficam fora do custo e da margem). */
  unidadesSemCusto: number;
};

/**
 * Margem por produto das vendas efetivas (Recebido + A receber, sem canceladas).
 * O desconto da venda é dividido entre os itens na proporção do subtotal de
 * cada um, para a soma por produto bater com o faturamento líquido.
 */
export function summarizeByProduct(
  vendas: VendaResumoInput[],
  paymentMethods: PaymentMethodParam[] = [],
): MargemProduto[] {
  const porProduto = new Map<string, MargemProduto>();

  for (const venda of vendas) {
    if (isCanceledStatus(venda.status)) continue;
    const group = getPaymentGroup(venda.formaPagamento, paymentMethods);
    if (group !== "recebido" && group !== "a_receber") continue;

    const itens = venda.itens ?? [];
    const subtotalVenda = itens.reduce(
      (sum, item) => sum + item.quantidade * Number(item.precoUnitario ?? 0),
      0,
    );
    const desconto = Number(venda.desconto ?? 0);

    for (const item of itens) {
      const produto = item.modeloVela || "Sem nome";
      const subtotal = item.quantidade * Number(item.precoUnitario ?? 0);
      const descontoRateado =
        subtotalVenda > 0 ? desconto * (subtotal / subtotalVenda) : 0;
      const entry =
        porProduto.get(produto) ??
        ({
          produto,
          unidades: 0,
          faturamento: 0,
          custo: 0,
          margem: 0,
          margemPercent: 0,
          unidadesSemCusto: 0,
        } as MargemProduto);

      entry.unidades += item.quantidade;
      if (item.custoUnitario == null) {
        // Sem custo: não entra no faturamento usado na margem, para não inflá-la.
        entry.unidadesSemCusto += item.quantidade;
      } else {
        entry.faturamento += subtotal - descontoRateado;
        entry.custo += item.custoUnitario * item.quantidade;
      }
      porProduto.set(produto, entry);
    }
  }

  return [...porProduto.values()]
    .map((entry) => {
      const margem = entry.faturamento - entry.custo;
      return {
        ...entry,
        margem,
        margemPercent:
          entry.faturamento > 0 ? (margem / entry.faturamento) * 100 : 0,
      };
    })
    .sort((a, b) => b.margem - a.margem);
}
