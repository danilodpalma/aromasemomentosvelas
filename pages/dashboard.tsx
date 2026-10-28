import { useEffect, useState } from "react";
import { formatDateOnly } from "../lib/date";
import { COLORS } from "../styles/theme";
import { authFetch } from "../lib/apiClient";
import {
  summarizeVendas,
  summarizeByProduct,
  isCanceledStatus,
} from "../lib/vendas";

type Venda = {
  id: number;
  total: number;
  desconto?: number;
  frete?: number;
  createdAt: string;
  dataVenda: string;
  cliente: string;
  modeloVela: string;
  quantidade: number;
  formaPagamento: string;
  status: string;
  itens?: Array<{
    id: number;
    modeloVela: string;
    quantidade: number;
    precoUnitario?: number;
    custoUnitario?: number | null;
  }>;
};

type Parameter = {
  id: number;
  name: string;
  category: string;
  paymentGroup?: string | null;
};

type PeriodMode = "mes" | "ano" | "tudo" | "personalizado";
type ProductSort = "margem" | "margemPercent" | "unidades" | "faturamento";

/** Cor da margem %: verde a partir de 50%, amarelo de 30% a 50%, vermelho abaixo. */
function marginColor(percent: number) {
  if (percent >= 50) return { background: "rgba(34, 197, 94, 0.12)", color: "#166534" };
  if (percent >= 30) return { background: "rgba(234, 179, 8, 0.15)", color: "#854d0e" };
  return { background: "rgba(220, 38, 38, 0.12)", color: "#b91c1c" };
}

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

const formatCurrency = (amount: number) =>
  amount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const formatPercent = (value: number) =>
  `${value.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%`;

const thStyle: React.CSSProperties = {
  padding: "10px 8px",
  textAlign: "center",
};

const tdStyle: React.CSSProperties = {
  padding: "8px 10px",
  borderTop: "1px solid rgb(167, 117, 75)",
  textAlign: "center",
  verticalAlign: "middle",
};

const badgeStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 4,
  padding: "4px 8px",
  borderRadius: 999,
  fontWeight: 700,
  lineHeight: 1.2,
  whiteSpace: "nowrap",
};

const qtyBadgeStyle: React.CSSProperties = {
  ...badgeStyle,
  minWidth: 32,
  background: "rgba(167, 117, 75, 0.12)",
  color: "#5b3a22",
};

const priceBadgeStyle: React.CSSProperties = {
  ...badgeStyle,
  background: "rgba(59, 130, 246, 0.10)",
  color: "#1d4ed8",
};

const totalBadgeStyle: React.CSSProperties = {
  ...badgeStyle,
  padding: "4px 10px",
  background: "rgba(34, 197, 94, 0.12)",
  color: "#166534",
  fontWeight: 800,
};

const cardStyle: React.CSSProperties = {
  background: `linear-gradient(135deg, ${COLORS.cardGradientFrom} 0%, ${COLORS.cardGradientTo} 100%)`,
  padding: 18,
  borderRadius: 14,
  border: COLORS.cardBorder,
  boxShadow: COLORS.cardShadow,
};

const inputStyle: React.CSSProperties = {
  padding: "8px 10px",
  border: "1px solid rgb(167, 117, 75)",
  borderRadius: 6,
  background: COLORS.white,
};

const hintStyle: React.CSSProperties = {
  color: COLORS.grayText,
  fontSize: 12,
  fontWeight: 400,
};

/** Linha "rótulo → valor" das tabelas de resumo. */
function SummaryRow({
  label,
  hint,
  value,
  strong,
  indent,
}: {
  label: React.ReactNode;
  hint?: React.ReactNode;
  value: React.ReactNode;
  strong?: boolean;
  indent?: boolean;
}) {
  return (
    <tr>
      <th
        style={{
          padding: 8,
          paddingLeft: indent ? 24 : 8,
          textAlign: "left",
          borderTop: "1px solid #e5e7eb",
          fontWeight: strong ? 800 : indent ? 500 : 600,
        }}
      >
        {label}
        {hint && <div style={hintStyle}>{hint}</div>}
      </th>
      <td
        style={{
          padding: 8,
          textAlign: "right",
          borderTop: "1px solid #e5e7eb",
          fontWeight: strong ? 800 : 500,
          whiteSpace: "nowrap",
        }}
      >
        {value}
      </td>
    </tr>
  );
}

function KpiCard({
  title,
  hint,
  value,
  color,
}: {
  title: string;
  hint: string;
  value: string;
  color: string;
}) {
  return (
    <div style={{ ...cardStyle, padding: 20 }}>
      <p style={{ margin: 0, color: "#6b7280" }}>{title}</p>
      <p style={{ margin: "2px 0 0", ...hintStyle }}>{hint}</p>
      <p style={{ marginTop: 8, marginBottom: 0, fontSize: 26, fontWeight: 700, color }}>
        {value}
      </p>
    </div>
  );
}

export default function Dashboard() {
  const hoje = new Date();
  const [vendas, setVendas] = useState<Venda[]>([]);
  const [netWithdrawalPercent, setNetWithdrawalPercent] = useState(35);
  const [paymentMethods, setPaymentMethods] = useState<Parameter[]>([]);
  const [saleStatuses, setSaleStatuses] = useState<Parameter[]>([]);
  const [periodMode, setPeriodMode] = useState<PeriodMode>("mes");
  const [periodMonth, setPeriodMonth] = useState(hoje.getMonth() + 1);
  const [periodYear, setPeriodYear] = useState(hoje.getFullYear());
  const [periodFrom, setPeriodFrom] = useState("");
  const [periodTo, setPeriodTo] = useState("");
  const [productSort, setProductSort] = useState<ProductSort>("margem");

  useEffect(() => {
    async function load() {
      try {
        const [vendasRes, percentRes, paymentMethodsRes, saleStatusesRes] =
          await Promise.all([
            authFetch("/api/vendas"),
            authFetch("/api/productTypes?category=netWithdrawalPercent"),
            authFetch("/api/productTypes?category=paymentMethod"),
            authFetch("/api/productTypes?category=saleStatus"),
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

  // ---------- Período ----------
  // As datas são comparadas como texto "AAAA-MM-DD" para não sofrer com fuso horário.
  const monthKey = `${periodYear}-${String(periodMonth).padStart(2, "0")}`;
  function isInPeriod(venda: Venda) {
    const day = venda.dataVenda?.slice(0, 10) ?? "";
    switch (periodMode) {
      case "mes":
        return day.slice(0, 7) === monthKey;
      case "ano":
        return day.slice(0, 4) === String(periodYear);
      case "personalizado":
        return (!periodFrom || day >= periodFrom) && (!periodTo || day <= periodTo);
      default:
        return true;
    }
  }
  const periodLabel =
    periodMode === "mes"
      ? `${MONTHS[periodMonth - 1]}/${periodYear}`
      : periodMode === "ano"
        ? String(periodYear)
        : periodMode === "personalizado"
          ? `${periodFrom ? formatDateOnly(periodFrom) : "início"} a ${
              periodTo ? formatDateOnly(periodTo) : "hoje"
            }`
          : "Todo o período";
  const availableYears = Array.from(
    new Set([
      hoje.getFullYear(),
      ...vendas
        .map((venda) => Number(venda.dataVenda?.slice(0, 4)))
        .filter((year) => Number.isFinite(year) && year > 2000),
    ]),
  ).sort((a, b) => b - a);

  const vendasNoPeriodo = vendas.filter(isInPeriod);
  const resumo = summarizeVendas(vendasNoPeriodo, paymentMethods);
  const margemPorProduto = summarizeByProduct(
    vendasNoPeriodo,
    paymentMethods,
  ).sort((a, b) => b[productSort] - a[productSort]);

  const saleStatusNames = Array.from(
    new Set([
      ...saleStatuses.map((status) => status.name),
      ...vendasNoPeriodo.map((sale) => sale.status).filter(Boolean),
    ]),
  ).filter((name) => !isCanceledStatus(name));
  const ordersByStatus = saleStatusNames.map((name) => ({
    name,
    count: vendasNoPeriodo.filter((sale) => sale.status === name).length,
  }));

  // ---------- Mês a mês ----------
  // Usa o ano do filtro (ou o ano atual, quando o filtro não é por mês/ano).
  const tableYear =
    periodMode === "mes" || periodMode === "ano" ? periodYear : hoje.getFullYear();
  const monthlySales = MONTHS.map((month, index) => {
    const key = `${tableYear}-${String(index + 1).padStart(2, "0")}`;
    const resumoMes = summarizeVendas(
      vendas.filter((venda) => venda.dataVenda?.slice(0, 7) === key),
      paymentMethods,
    );
    return {
      month,
      faturamento: resumoMes.faturamento,
      margem: resumoMes.margem,
      recebido: resumoMes.recebido,
      aReceber: resumoMes.aReceber,
      netRevenue: resumoMes.faturamento * (netWithdrawalPercent / 100),
      orderCount: resumoMes.pedidos,
    };
  });

  const vendasRecentes = vendas.slice(0, 5);

  return (
    <div>
      <h2 style={{ marginBottom: 6, color: COLORS.primaryDark }}>Dashboard</h2>
      <p style={{ marginTop: 0, color: COLORS.primaryDarkAlt }}>
        Use este painel como ponto de partida para acompanhar seu negócio.
      </p>

      {/* ---------- Filtro de período ---------- */}
      <section
        style={{
          ...cardStyle,
          display: "flex",
          alignItems: "end",
          gap: 12,
          flexWrap: "wrap",
          marginTop: 16,
        }}
      >
        <label style={{ display: "grid", gap: 6, fontWeight: 600 }}>
          Período
          <select
            value={periodMode}
            onChange={(e) => setPeriodMode(e.target.value as PeriodMode)}
            style={inputStyle}
          >
            <option value="mes">Mês</option>
            <option value="ano">Ano</option>
            <option value="tudo">Todo o período</option>
            <option value="personalizado">Personalizado</option>
          </select>
        </label>
        {periodMode === "mes" && (
          <label style={{ display: "grid", gap: 6, fontWeight: 600 }}>
            Mês
            <select
              value={periodMonth}
              onChange={(e) => setPeriodMonth(Number(e.target.value))}
              style={inputStyle}
            >
              {MONTHS.map((month, index) => (
                <option key={month} value={index + 1}>
                  {month}
                </option>
              ))}
            </select>
          </label>
        )}
        {(periodMode === "mes" || periodMode === "ano") && (
          <label style={{ display: "grid", gap: 6, fontWeight: 600 }}>
            Ano
            <select
              value={periodYear}
              onChange={(e) => setPeriodYear(Number(e.target.value))}
              style={inputStyle}
            >
              {availableYears.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </label>
        )}
        {periodMode === "personalizado" && (
          <>
            <label style={{ display: "grid", gap: 6, fontWeight: 600 }}>
              De
              <input
                type="date"
                value={periodFrom}
                onChange={(e) => setPeriodFrom(e.target.value)}
                style={inputStyle}
              />
            </label>
            <label style={{ display: "grid", gap: 6, fontWeight: 600 }}>
              Até
              <input
                type="date"
                value={periodTo}
                onChange={(e) => setPeriodTo(e.target.value)}
                style={inputStyle}
              />
            </label>
          </>
        )}
        <span style={{ marginLeft: "auto", color: COLORS.primaryDark, fontWeight: 700 }}>
          {periodLabel}
        </span>
      </section>

      {/* ---------- Indicadores ---------- */}
      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 16,
          marginTop: 16,
        }}
      >
        <KpiCard
          title="Faturamento líquido"
          hint={`${resumo.pedidos} pedidos · produtos − descontos, sem frete`}
          value={formatCurrency(resumo.faturamento)}
          color={COLORS.primaryDark}
        />
        <KpiCard
          title="Margem bruta"
          hint={`${formatPercent(resumo.margemPercent)} · faturamento − custo de fabricação`}
          value={formatCurrency(resumo.margem)}
          color="#166534"
        />
        <KpiCard
          title="Recebido"
          hint="Já pago (tipo Recebido)"
          value={formatCurrency(resumo.recebido)}
          color="#1d4ed8"
        />
        <KpiCard
          title="A receber"
          hint="Vendido, pagamento pendente"
          value={formatCurrency(resumo.aReceber)}
          color="#b45309"
        />
        <KpiCard
          title="Doações / cortesias"
          hint={`${resumo.doacoes.pedidos} pedidos · custo de fabricação`}
          value={formatCurrency(resumo.doacoes.custo)}
          color="#7c3aed"
        />
      </section>

      {resumo.semTipo.pedidos > 0 && (
        <div
          style={{
            marginTop: 16,
            padding: 14,
            background: "#fef2f2",
            border: "1px solid #fecaca",
            color: "#b91c1c",
            borderRadius: 8,
          }}
        >
          {resumo.semTipo.pedidos} venda(s) ({formatCurrency(resumo.semTipo.valor)})
          estão fora do resumo porque a forma de pagamento não tem tipo:{" "}
          <strong>{resumo.semTipo.formas.join(", ")}</strong>. Defina o tipo em
          Parâmetros → Formas de pagamento.
        </div>
      )}

      {resumo.semCusto.pedidos > 0 && (
        <div
          style={{
            marginTop: 16,
            padding: 14,
            background: "#fffbeb",
            border: "1px solid #fde68a",
            color: "#92400e",
            borderRadius: 8,
          }}
        >
          {resumo.semCusto.pedidos} pedido(s) do período têm produto sem custo
          registrado (modelo não encontrado). Eles ficam fora do custo e da
          margem.
        </div>
      )}

      {/* ---------- Resumo financeiro ---------- */}
      <section style={{ marginTop: 28 }}>
        <h3 style={{ marginBottom: 10, color: COLORS.primaryDark }}>
          Resumo financeiro · {periodLabel}
        </h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: 16,
          }}
        >
          <div style={cardStyle}>
            <h4 style={{ margin: "0 0 10px", color: COLORS.primaryDark }}>
              Vendas
            </h4>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <tbody>
                <SummaryRow
                  label="Produtos vendidos (bruto)"
                  value={formatCurrency(resumo.bruto)}
                />
                <SummaryRow
                  label="(−) Descontos"
                  value={formatCurrency(resumo.descontos)}
                />
                <SummaryRow
                  label="(=) Faturamento líquido"
                  value={formatCurrency(resumo.faturamento)}
                  strong
                />
                <SummaryRow
                  label="(−) Custo dos produtos"
                  hint="Insumos + embalagem + mão de obra, do dia da venda"
                  value={formatCurrency(resumo.custoProdutos)}
                />
                <SummaryRow
                  label="(=) Margem bruta"
                  hint={formatPercent(resumo.margemPercent)}
                  value={formatCurrency(resumo.margem)}
                  strong
                />
                <SummaryRow
                  label="Recebido"
                  value={formatCurrency(resumo.recebido)}
                />
                {resumo.recebidoPorForma.map((method) => (
                  <SummaryRow
                    key={method.name}
                    indent
                    label={method.name}
                    hint={`${method.pedidos} ${method.pedidos === 1 ? "pedido" : "pedidos"}`}
                    value={formatCurrency(method.valor)}
                  />
                ))}
                <SummaryRow
                  label="A receber"
                  value={formatCurrency(resumo.aReceber)}
                />
                {resumo.aReceberPorForma.map((method) => (
                  <SummaryRow
                    key={method.name}
                    indent
                    label={method.name}
                    hint={`${method.pedidos} ${method.pedidos === 1 ? "pedido" : "pedidos"}`}
                    value={formatCurrency(method.valor)}
                  />
                ))}
                <SummaryRow
                  label="Frete cobrado"
                  hint="Repasse, fora do faturamento"
                  value={formatCurrency(resumo.frete)}
                />
                <SummaryRow
                  label="Pedidos · unidades"
                  value={`${resumo.pedidos} · ${resumo.unidades}`}
                />
                <SummaryRow
                  label="Ticket médio"
                  value={formatCurrency(resumo.ticketMedio)}
                />
              </tbody>
            </table>
          </div>

          <div style={cardStyle}>
            <h4 style={{ margin: "0 0 4px", color: COLORS.primaryDark }}>
              Saídas sem receita
            </h4>
            <p style={{ margin: "0 0 10px", ...hintStyle }}>
              Produtos entregues sem pagamento (tipo Doação / cortesia). O valor
              é o custo de fabricação; o valor de venda aparece abaixo de cada linha.
            </p>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <tbody>
                {resumo.doacoesPorForma.length === 0 ? (
                  <SummaryRow label="Nenhuma no período" value="—" />
                ) : (
                  resumo.doacoesPorForma.map((method) => (
                    <SummaryRow
                      key={method.name}
                      label={method.name}
                      hint={`${method.pedidos} ${method.pedidos === 1 ? "pedido" : "pedidos"} · ${method.unidades} un. · valor de venda ${formatCurrency(method.valor)}`}
                      value={formatCurrency(method.custo)}
                    />
                  ))
                )}
                <SummaryRow
                  label="Custo total doado"
                  hint={`${resumo.doacoes.pedidos} pedidos · ${resumo.doacoes.unidades} un. · valor de venda ${formatCurrency(resumo.doacoes.valor)}`}
                  value={formatCurrency(resumo.doacoes.custo)}
                  strong
                />
              </tbody>
            </table>
          </div>

          <div style={cardStyle}>
            <h4 style={{ margin: "0 0 10px", color: COLORS.primaryDark }}>
              Pedidos
            </h4>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <tbody>
                {ordersByStatus.map((status) => (
                  <SummaryRow
                    key={status.name}
                    label={formatOrderStatusLabel(status.name)}
                    value={status.count}
                  />
                ))}
                <SummaryRow
                  label="Cancelados"
                  hint="Fora de todos os totais"
                  value={`${resumo.canceladas.pedidos} · ${formatCurrency(resumo.canceladas.valor)}`}
                />
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ---------- Margem por produto ---------- */}
      <section style={{ marginTop: 28 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "end",
            gap: 12,
            flexWrap: "wrap",
            marginBottom: 10,
          }}
        >
          <div>
            <h3 style={{ margin: 0, color: COLORS.primaryDark }}>
              Margem por produto · {periodLabel}
            </h3>
            <p style={{ margin: "4px 0 0", ...hintStyle }}>
              Vendas recebidas e a receber. Faturamento já com o desconto da
              venda dividido entre os itens; custo do dia de cada venda.
            </p>
          </div>
          <label style={{ display: "grid", gap: 6, fontWeight: 600 }}>
            Ordenar por
            <select
              value={productSort}
              onChange={(e) => setProductSort(e.target.value as ProductSort)}
              style={inputStyle}
            >
              <option value="margem">Margem (R$)</option>
              <option value="margemPercent">Margem (%)</option>
              <option value="faturamento">Faturamento</option>
              <option value="unidades">Unidades vendidas</option>
            </select>
          </label>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: 11.5,
              background: `linear-gradient(135deg, ${COLORS.cardGradientFrom} 0%, ${COLORS.cardGradientTo} 100%)`,
              borderRadius: 14,
              overflow: "hidden",
              boxShadow: COLORS.cardShadow,
            }}
          >
            <thead style={{ background: "rgba(255,255,255,0.35)" }}>
              <tr>
                <th style={thStyle}>Produto</th>
                <th style={thStyle}>Unidades</th>
                <th style={thStyle}>Faturamento</th>
                <th style={thStyle}>Custo</th>
                <th style={thStyle}>Margem</th>
                <th style={thStyle}>Margem %</th>
              </tr>
            </thead>
            <tbody>
              {margemPorProduto.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ ...tdStyle, padding: 16 }}>
                    Nenhuma venda no período.
                  </td>
                </tr>
              ) : (
                margemPorProduto.map((produto, index) => (
                  <tr
                    key={produto.produto}
                    style={{
                      background:
                        index % 2 === 0
                          ? COLORS.tableRowEven
                          : COLORS.tableRowOdd,
                    }}
                  >
                    <td style={{ ...tdStyle, fontWeight: 700 }}>
                      {produto.produto}
                      {produto.unidadesSemCusto > 0 && (
                        <div style={{ ...hintStyle, color: "#92400e" }}>
                          {produto.unidadesSemCusto} un. sem custo registrado
                          (fora da margem)
                        </div>
                      )}
                    </td>
                    <td style={tdStyle}>
                      <span style={qtyBadgeStyle}>{produto.unidades}</span>
                    </td>
                    <td style={tdStyle}>{formatCurrency(produto.faturamento)}</td>
                    <td style={tdStyle}>{formatCurrency(produto.custo)}</td>
                    <td style={tdStyle}>
                      <span style={totalBadgeStyle}>
                        {formatCurrency(produto.margem)}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      <span
                        style={{
                          ...badgeStyle,
                          ...marginColor(produto.margemPercent),
                        }}
                      >
                        {formatPercent(produto.margemPercent)}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* ---------- Mês a mês ---------- */}
      <section style={{ marginTop: 28 }}>
        <h3 style={{ marginBottom: 10, color: COLORS.primaryDark }}>
          Faturamento mês a mês · {tableYear}
        </h3>
        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: 11.5,
              background: `linear-gradient(135deg, ${COLORS.cardGradientFrom} 0%, ${COLORS.cardGradientTo} 100%)`,
              borderRadius: 14,
              overflow: "hidden",
              boxShadow: COLORS.cardShadow,
            }}
          >
            <thead style={{ background: "rgba(255,255,255,0.35)" }}>
              <tr>
                <th style={thStyle}>Mês</th>
                <th style={thStyle}>Faturamento líquido</th>
                <th style={thStyle}>Margem bruta</th>
                <th style={thStyle}>Recebido</th>
                <th style={thStyle}>A receber</th>
                <th style={thStyle}>Líquido ({netWithdrawalPercent}%)</th>
                <th style={thStyle}>Pedidos</th>
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
                  <td style={tdStyle}>{month.month}</td>
                  <td style={tdStyle}>
                    <span style={totalBadgeStyle}>
                      {formatCurrency(month.faturamento)}
                    </span>
                  </td>
                  <td style={tdStyle}>{formatCurrency(month.margem)}</td>
                  <td style={tdStyle}>{formatCurrency(month.recebido)}</td>
                  <td style={tdStyle}>{formatCurrency(month.aReceber)}</td>
                  <td style={tdStyle}>
                    <span style={priceBadgeStyle}>
                      {formatCurrency(month.netRevenue)}
                    </span>
                  </td>
                  <td style={tdStyle}>
                    <span style={qtyBadgeStyle}>{month.orderCount}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ---------- Vendas recentes ---------- */}
      <section style={{ marginTop: 28 }}>
        <h3 style={{ marginBottom: 10, color: COLORS.primaryDark }}>
          Vendas recentes
        </h3>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: 11.5,
            background: `linear-gradient(135deg, ${COLORS.cardGradientFrom} 0%, ${COLORS.cardGradientTo} 100%)`,
            borderRadius: 14,
            overflow: "hidden",
            boxShadow: COLORS.cardShadow,
          }}
        >
          <thead style={{ background: "rgba(255,255,255,0.35)" }}>
            <tr>
              <th style={thStyle}>Cliente</th>
              <th style={thStyle}>Produto</th>
              <th style={thStyle}>Total</th>
              <th style={thStyle}>Pagamento</th>
              <th style={thStyle}>Status</th>
              <th style={thStyle}>Data</th>
            </tr>
          </thead>
          <tbody>
            {vendasRecentes.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ ...tdStyle, padding: 16 }}>
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
                  <td style={tdStyle}>{venda.cliente}</td>
                  <td style={tdStyle}>
                    {venda.itens?.length ? (
                      venda.itens.map((item) => (
                        <div key={item.id}>
                          {item.quantidade}x {item.modeloVela}
                        </div>
                      ))
                    ) : (
                      <div>
                        {venda.quantidade}x {venda.modeloVela}
                      </div>
                    )}
                  </td>
                  <td style={tdStyle}>
                    <span style={totalBadgeStyle}>
                      {formatCurrency(venda.total)}
                    </span>
                  </td>
                  <td style={tdStyle}>{venda.formaPagamento}</td>
                  <td style={tdStyle}>{venda.status}</td>
                  <td style={tdStyle}>{formatDateOnly(venda.dataVenda)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
}
