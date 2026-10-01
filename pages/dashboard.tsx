import { useEffect, useState } from "react";
import { COLORS } from "../styles/theme";

type Venda = {
  id: number;
  total: number;
  createdAt: string;
  dataVenda: string;
  cliente: string;
  modeloVela: string;
  quantidade: number;
  formaPagamento: string;
  status: string;
  itens?: Array<{ id: number; modeloVela: string; quantidade: number }>;
};

type Parameter = {
  id: number;
  name: string;
  category: string;
};

const MONTHS = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

function formatOrderStatusLabel(status: string) {
  const normalized = status.trim().toLowerCase();
  if (normalized.includes("entreg")) return "Pedidos entregues";
  if (normalized.includes("produç") || normalized.includes("produc")) {
    return "Pedidos em produção";
  }
  if (normalized.includes("pronto")) return "Pedidos prontos";
  if (normalized.includes("consigna")) return "Pedidos em consignação";
  if (normalized.includes("envi")) return "Pedidos enviados";
  return `Pedidos ${status}`;
}

function normalizePaymentMethod(paymentMethod: string) {
  return paymentMethod
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export default function Dashboard() {
  const [vendas, setVendas] = useState<Venda[]>([]);
  const [netWithdrawalPercent, setNetWithdrawalPercent] = useState(35);
  const [paymentMethods, setPaymentMethods] = useState<Parameter[]>([]);
  const [saleStatuses, setSaleStatuses] = useState<Parameter[]>([]);

  useEffect(() => {
    async function load() {
      try {
        const [vendasRes, percentRes, paymentMethodsRes, saleStatusesRes] =
          await Promise.all([
            fetch("/api/vendas"),
            fetch("/api/productTypes?category=netWithdrawalPercent"),
            fetch("/api/productTypes?category=paymentMethod"),
            fetch("/api/productTypes?category=saleStatus"),
          ]);
        const [vendasData, percentData, paymentMethodsData, saleStatusesData] =
          await Promise.all([
            vendasRes.json(),
            percentRes.json(),
            paymentMethodsRes.json(),
            saleStatusesRes.json(),
          ]);
        setVendas(vendasRes.ok && Array.isArray(vendasData) ? vendasData : []);
        if (percentRes.ok && Array.isArray(percentData)) {
          const percent = Number(
            (percentData[0] as Parameter | undefined)?.name,
          );
          if (Number.isFinite(percent) && percent >= 0 && percent <= 100) {
            setNetWithdrawalPercent(percent);
          }
        }
        setPaymentMethods(
          paymentMethodsRes.ok && Array.isArray(paymentMethodsData)
            ? paymentMethodsData
            : [],
        );
        setSaleStatuses(
          saleStatusesRes.ok && Array.isArray(saleStatusesData)
            ? saleStatusesData
            : [],
        );
      } catch {
        setVendas([]);
      }
    }

    load();
  }, []);

  const hoje = new Date();
  const mesAtivo = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, "0")}`;
  const vendasDoMes = vendas.filter(
    (venda) => venda.dataVenda?.slice(0, 7) === mesAtivo,
  );
  const totalVendas = vendasDoMes.length;
  const receita = vendasDoMes.reduce((sum, item) => sum + item.total, 0);
  const vendasRecentes = vendas.slice(0, 5);
  const anoAtual = hoje.getFullYear();
  const monthlySales = MONTHS.map((month, index) => {
    const monthKey = `${anoAtual}-${String(index + 1).padStart(2, "0")}`;
    const sales = vendas.filter(
      (venda) => venda.dataVenda?.slice(0, 7) === monthKey,
    );
    const grossRevenue = sales.reduce((sum, sale) => sum + sale.total, 0);

    return {
      month,
      grossRevenue,
      netRevenue: grossRevenue * (netWithdrawalPercent / 100),
      orderCount: sales.length,
    };
  });
  const isReceivablePaymentMethod = (paymentMethod: string) => {
    const normalized = normalizePaymentMethod(paymentMethod);
    return normalized === "a receber" || normalized === "consignacao";
  };
  const isPresentPaymentMethod = (paymentMethod: string) =>
    normalizePaymentMethod(paymentMethod) === "presente";
  const isServiceExchangePaymentMethod = (paymentMethod: string) => {
    const normalized = normalizePaymentMethod(paymentMethod);
    return (
      normalized === "troca de servicos" || normalized === "troca por servicos"
    );
  };
  const receivableSales = vendas.filter((sale) =>
    isReceivablePaymentMethod(sale.formaPagamento),
  );
  const receivedSales = vendas.filter(
    (sale) =>
      !isReceivablePaymentMethod(sale.formaPagamento) &&
      !isPresentPaymentMethod(sale.formaPagamento) &&
      !isServiceExchangePaymentMethod(sale.formaPagamento),
  );
  const presentSales = vendas.filter((sale) =>
    isPresentPaymentMethod(sale.formaPagamento),
  );
  const serviceExchangeSales = vendas.filter((sale) =>
    isServiceExchangePaymentMethod(sale.formaPagamento),
  );
  const totalVendido = vendas.reduce((sum, sale) => sum + sale.total, 0);
  const totalAReceber = receivableSales.reduce(
    (sum, sale) => sum + sale.total,
    0,
  );
  const totalUnidadesVendidas = vendas.reduce(
    (sum, sale) =>
      sum +
      (sale.itens?.length
        ? sale.itens.reduce((itemSum, item) => itemSum + item.quantidade, 0)
        : sale.quantidade),
    0,
  );
  const totalPresentes = presentSales.reduce(
    (sum, sale) => sum + sale.total,
    0,
  );
  const totalTrocasServicos = serviceExchangeSales.reduce(
    (sum, sale) => sum + sale.total,
    0,
  );
  const paymentMethodNames = Array.from(
    new Set([
      ...paymentMethods.map((method) => method.name),
      ...vendas.map((sale) => sale.formaPagamento).filter(Boolean),
    ]),
  );
  const receivedByMethod = paymentMethodNames
    .filter(
      (name) =>
        !isReceivablePaymentMethod(name) &&
        !isPresentPaymentMethod(name) &&
        !isServiceExchangePaymentMethod(name),
    )
    .map((name) => {
      const methodSales = receivedSales.filter(
        (sale) => sale.formaPagamento === name,
      );
      return {
        name,
        total: methodSales.reduce((sum, sale) => sum + sale.total, 0),
        orderCount: methodSales.length,
      };
    });
  const saleStatusNames = Array.from(
    new Set([
      ...saleStatuses.map((status) => status.name),
      ...vendas.map((sale) => sale.status).filter(Boolean),
    ]),
  );
  const ordersByStatus = saleStatusNames.map((name) => ({
    name,
    count: vendas.filter((sale) => sale.status === name).length,
  }));
  const formatCurrency = (amount: number) =>
    amount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  return (
    <div>
      <h2 style={{ marginBottom: 6, color: COLORS.primaryDark }}>Dashboard</h2>
      <p style={{ marginTop: 0, color: COLORS.primaryDarkAlt }}>
        Use este painel como ponto de partida para acompanhar seu negócio.
      </p>

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 16,
          marginTop: 24,
        }}
      >
        <div
          style={{
            background: "linear-gradient(135deg, #f7e8d7 0%, #efd9c2 100%)",
            padding: 20,
            borderRadius: 14,
            boxShadow: COLORS.cardShadow,
            border: COLORS.cardBorder,
          }}
        >
          <p style={{ margin: 0, color: "#6b7280" }}>Vendas no mês</p>
          <p style={{ marginTop: 8, fontSize: 28, fontWeight: 700 }}>
            {totalVendas}
          </p>
        </div>
        <div
          style={{
            background: "linear-gradient(135deg, #f7e8d7 0%, #efd9c2 100%)",
            padding: 20,
            borderRadius: 14,
            boxShadow: COLORS.cardShadow,
            border: COLORS.cardBorder,
          }}
        >
          <p style={{ margin: 0, color: "#6b7280" }}>Receita no mês</p>
          <p style={{ marginTop: 8, fontSize: 28, fontWeight: 700 }}>
            R$ {receita.toFixed(2)}
          </p>
        </div>
      </section>

      <section style={{ marginTop: 28 }}>
        <h3 style={{ marginBottom: 10, color: COLORS.primaryDark }}>
          Vendas recentes
        </h3>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            background: "linear-gradient(135deg, #f7e8d7 0%, #efd9c2 100%)",
            borderRadius: 14,
            overflow: "hidden",
            boxShadow: "0 10px 24px rgba(92, 54, 24, 0.08)",
          }}
        >
          <thead style={{ background: "rgba(255,255,255,0.35)" }}>
            <tr>
              <th style={{ padding: 12, textAlign: "left" }}>Cliente</th>
              <th style={{ padding: 12, textAlign: "left" }}>Produto</th>
              <th style={{ padding: 12, textAlign: "right" }}>Total</th>
              <th style={{ padding: 12, textAlign: "left" }}>Status</th>
              <th style={{ padding: 12, textAlign: "left" }}>Data</th>
            </tr>
          </thead>
          <tbody>
            {vendasRecentes.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: 16, textAlign: "center" }}>
                  Nenhuma venda registrada ainda.
                </td>
              </tr>
            ) : (
              vendasRecentes.map((venda, index) => (
                <tr
                  key={venda.id}
                  style={{
                    background:
                      index % 2 === 0
                        ? COLORS.tableRowEven
                        : COLORS.tableRowOdd,
                  }}
                >
                  <td style={{ padding: 12, borderTop: "1px solid #e5e7eb" }}>
                    {venda.cliente}
                  </td>
                  <td style={{ padding: 12, borderTop: "1px solid #e5e7eb" }}>
                    {venda.itens?.length
                      ? venda.itens
                          .map(
                            (item) => `${item.quantidade}x ${item.modeloVela}`,
                          )
                          .join(", ")
                      : `${venda.quantidade}x ${venda.modeloVela}`}
                  </td>
                  <td
                    style={{
                      padding: 12,
                      borderTop: "1px solid #e5e7eb",
                      textAlign: "right",
                    }}
                  >
                    R$ {venda.total.toFixed(2)}
                  </td>
                  <td style={{ padding: 12, borderTop: "1px solid #e5e7eb" }}>
                    {venda.status}
                  </td>
                  <td style={{ padding: 12, borderTop: "1px solid #e5e7eb" }}>
                    {new Date(venda.dataVenda).toLocaleDateString("pt-BR")}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>

      <section style={{ marginTop: 28 }}>
        <h3 style={{ marginBottom: 10, color: COLORS.primaryDark }}>
          Resumo geral de vendas · {anoAtual}
        </h3>
        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              minWidth: 620,
              borderCollapse: "collapse",
              background: `linear-gradient(135deg, ${COLORS.cardGradientFrom} 0%, ${COLORS.cardGradientTo} 100%)`,
              borderRadius: 14,
              overflow: "hidden",
              boxShadow: COLORS.cardShadow,
            }}
          >
            <thead style={{ background: "rgba(255,255,255,0.35)" }}>
              <tr>
                <th style={{ padding: 12, textAlign: "left" }}>Mês</th>
                <th style={{ padding: 12, textAlign: "right" }}>
                  Faturamento bruto
                </th>
                <th style={{ padding: 12, textAlign: "right" }}>
                  Líquido ({netWithdrawalPercent}%)
                </th>
                <th style={{ padding: 12, textAlign: "right" }}>
                  Quantidade de pedidos
                </th>
              </tr>
            </thead>
            <tbody>
              {monthlySales.map((month, index) => (
                <tr
                  key={month.month}
                  style={{
                    background:
                      index % 2 === 0
                        ? COLORS.tableRowEven
                        : COLORS.tableRowOdd,
                  }}
                >
                  <td style={{ padding: 12, borderTop: "1px solid #e5e7eb" }}>
                    {month.month}
                  </td>
                  <td
                    style={{
                      padding: 12,
                      borderTop: "1px solid #e5e7eb",
                      textAlign: "right",
                    }}
                  >
                    {month.grossRevenue.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </td>
                  <td
                    style={{
                      padding: 12,
                      borderTop: "1px solid #e5e7eb",
                      textAlign: "right",
                    }}
                  >
                    {month.netRevenue.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </td>
                  <td
                    style={{
                      padding: 12,
                      borderTop: "1px solid #e5e7eb",
                      textAlign: "right",
                    }}
                  >
                    {month.orderCount}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section style={{ marginTop: 28 }}>
        <h3 style={{ marginBottom: 10, color: COLORS.primaryDark }}>
          Resumo geral · Todos os meses
        </h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: 16,
          }}
        >
          <div
            style={{
              background: `linear-gradient(135deg, ${COLORS.cardGradientFrom} 0%, ${COLORS.cardGradientTo} 100%)`,
              padding: 18,
              borderRadius: 14,
              border: COLORS.cardBorder,
              boxShadow: COLORS.cardShadow,
            }}
          >
            <h4 style={{ margin: "0 0 10px", color: COLORS.primaryDark }}>
              Financeiro
            </h4>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <tbody>
                <tr>
                  <th
                    style={{
                      padding: 8,
                      textAlign: "left",
                      borderTop: "1px solid #e5e7eb",
                    }}
                  >
                    Total vendido
                  </th>
                  <td
                    style={{
                      padding: 8,
                      textAlign: "right",
                      borderTop: "1px solid #e5e7eb",
                    }}
                  >
                    {formatCurrency(totalVendido)}
                  </td>
                </tr>
                {receivedByMethod.map((method) => (
                  <tr key={method.name}>
                    <th
                      style={{
                        padding: 8,
                        textAlign: "left",
                        borderTop: "1px solid #e5e7eb",
                        fontWeight: 500,
                      }}
                    >
                      Total recebido {method.name}
                      <div style={{ color: COLORS.grayText, fontSize: 12 }}>
                        {method.orderCount}{" "}
                        {method.orderCount === 1 ? "pedido" : "pedidos"}
                      </div>
                    </th>
                    <td
                      style={{
                        padding: 8,
                        textAlign: "right",
                        borderTop: "1px solid #e5e7eb",
                      }}
                    >
                      {formatCurrency(method.total)}
                    </td>
                  </tr>
                ))}
                <tr>
                  <th
                    style={{
                      padding: 8,
                      textAlign: "left",
                      borderTop: "1px solid #e5e7eb",
                    }}
                  >
                    Total a receber (A Receber e Consignação)
                  </th>
                  <td
                    style={{
                      padding: 8,
                      textAlign: "right",
                      borderTop: "1px solid #e5e7eb",
                    }}
                  >
                    {formatCurrency(totalAReceber)}
                  </td>
                </tr>
                <tr>
                  <th
                    style={{
                      padding: 8,
                      textAlign: "left",
                      borderTop: "1px solid #e5e7eb",
                    }}
                  >
                    Total de presentes
                    <div style={{ color: COLORS.grayText, fontSize: 12 }}>
                      {presentSales.length}{" "}
                      {presentSales.length === 1 ? "pedido" : "pedidos"}
                    </div>
                  </th>
                  <td
                    style={{
                      padding: 8,
                      textAlign: "right",
                      borderTop: "1px solid #e5e7eb",
                    }}
                  >
                    {formatCurrency(totalPresentes)}
                  </td>
                </tr>
                <tr>
                  <th
                    style={{
                      padding: 8,
                      textAlign: "left",
                      borderTop: "1px solid #e5e7eb",
                    }}
                  >
                    Trocas por serviços
                    <div style={{ color: COLORS.grayText, fontSize: 12 }}>
                      {serviceExchangeSales.length}{" "}
                      {serviceExchangeSales.length === 1 ? "pedido" : "pedidos"}
                    </div>
                  </th>
                  <td
                    style={{
                      padding: 8,
                      textAlign: "right",
                      borderTop: "1px solid #e5e7eb",
                    }}
                  >
                    {formatCurrency(totalTrocasServicos)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div
            style={{
              background: `linear-gradient(135deg, ${COLORS.cardGradientFrom} 0%, ${COLORS.cardGradientTo} 100%)`,
              padding: 18,
              borderRadius: 14,
              border: COLORS.cardBorder,
              boxShadow: COLORS.cardShadow,
            }}
          >
            <h4 style={{ margin: "0 0 10px", color: COLORS.primaryDark }}>
              Pedidos e unidades
            </h4>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <tbody>
                <tr>
                  <th
                    style={{
                      padding: 8,
                      textAlign: "left",
                      borderTop: "1px solid #e5e7eb",
                    }}
                  >
                    Total de pedidos
                  </th>
                  <td
                    style={{
                      padding: 8,
                      textAlign: "right",
                      borderTop: "1px solid #e5e7eb",
                    }}
                  >
                    {vendas.length}
                  </td>
                </tr>
                <tr>
                  <th
                    style={{
                      padding: 8,
                      textAlign: "left",
                      borderTop: "1px solid #e5e7eb",
                    }}
                  >
                    Total de unidades vendidas
                  </th>
                  <td
                    style={{
                      padding: 8,
                      textAlign: "right",
                      borderTop: "1px solid #e5e7eb",
                    }}
                  >
                    {totalUnidadesVendidas}
                  </td>
                </tr>
                <tr>
                  <th
                    style={{
                      padding: 8,
                      textAlign: "left",
                      borderTop: "1px solid #e5e7eb",
                    }}
                  >
                    Presentes
                  </th>
                  <td
                    style={{
                      padding: 8,
                      textAlign: "right",
                      borderTop: "1px solid #e5e7eb",
                    }}
                  >
                    {presentSales.length}
                  </td>
                </tr>
                <tr>
                  <th
                    style={{
                      padding: 8,
                      textAlign: "left",
                      borderTop: "1px solid #e5e7eb",
                    }}
                  >
                    Trocas por serviços
                  </th>
                  <td
                    style={{
                      padding: 8,
                      textAlign: "right",
                      borderTop: "1px solid #e5e7eb",
                    }}
                  >
                    {serviceExchangeSales.length}
                  </td>
                </tr>
                {ordersByStatus.map((status) => (
                  <tr key={status.name}>
                    <th
                      style={{
                        padding: 8,
                        textAlign: "left",
                        borderTop: "1px solid #e5e7eb",
                        fontWeight: 500,
                      }}
                    >
                      {formatOrderStatusLabel(status.name)}
                    </th>
                    <td
                      style={{
                        padding: 8,
                        textAlign: "right",
                        borderTop: "1px solid #e5e7eb",
                      }}
                    >
                      {status.count}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
