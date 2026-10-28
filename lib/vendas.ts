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
  itens?: Array<{ quantidade: number; precoUnitario?: number }>;
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
    recebido: 0,
    aReceber: 0,
    frete: 0,
    pedidos: 0,
    unidades: 0,
    recebidoPorForma: [] as MethodTotal[],
    aReceberPorForma: [] as MethodTotal[],
    // Saídas sem receita (valor de venda dos produtos doados)
    doacoes: { pedidos: 0, unidades: 0, valor: 0 },
    doacoesPorForma: [] as (MethodTotal & { unidades: number })[],
    // Fora dos totais
    canceladas: { pedidos: 0, valor: 0 },
    semTipo: { pedidos: 0, valor: 0, formas: [] as string[] },
  };

  for (const venda of vendas) {
    const faturamento = getSaleRevenue(venda);
    const desconto = Number(venda.desconto ?? 0);
    const unidades = getSaleUnits(venda);

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
      const entry = resumo.doacoesPorForma.find(
        (item) => item.name === venda.formaPagamento,
      );
      if (entry) {
        entry.pedidos += 1;
        entry.unidades += unidades;
        entry.valor += faturamento;
      } else {
        resumo.doacoesPorForma.push({
          name: venda.formaPagamento,
          pedidos: 1,
          unidades,
          valor: faturamento,
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
    resumo.frete += Number(venda.frete ?? 0);

    if (group === "recebido") {
      resumo.recebido += faturamento;
      addToMethod(resumo.recebidoPorForma, venda.formaPagamento, faturamento);
    } else {
      resumo.aReceber += faturamento;
      addToMethod(resumo.aReceberPorForma, venda.formaPagamento, faturamento);
    }
  }

  return {
    ...resumo,
    ticketMedio: resumo.pedidos > 0 ? resumo.faturamento / resumo.pedidos : 0,
  };
}
