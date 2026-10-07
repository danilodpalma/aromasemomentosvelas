// components/vendas/VendaTable.tsx
import { COLORS } from "../../styles/theme";
import { formatDateOnly } from "../../lib/date";

type Venda = {
  id: number;
  dataVenda: string;
  cliente: string;
  modeloVela: string;
  quantidade: number;
  precoUnitario: number;
  total: number;
  desconto?: number;
  obsDesconto?: string;
  frete?: number;
  formaPagamento: string;
  status: string;
  observacao?: string;
  itens?: Array<{
    id: number;
    modeloVela: string;
    quantidade: number;
    precoUnitario: number;
    total: number;
    observacao?: string;
  }>;
};

type Modelo = { id: number; nome: string };
type Parameter = { id: number; name: string; category: string };

export type VendaFilters = {
  dataInicio: string;
  dataFim: string;
  cliente: string;
  modeloVela: string;
  status: string;
  formaPagamento: string;
};

type Props = {
  vendas: Venda[];
  isAuthenticated: boolean;
  canDelete: boolean;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  filters: VendaFilters;
  setFilters: React.Dispatch<React.SetStateAction<VendaFilters>>;
  modelos: Modelo[];
  saleStatuses: Parameter[];
  paymentMethods: Parameter[];
  onClearFilters: () => void;
};

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

export default function VendaTable({
  vendas,
  isAuthenticated,
  canDelete,
  onEdit,
  onDelete,
  filters,
  setFilters,
  modelos,
  saleStatuses,
  paymentMethods,
  onClearFilters,
}: Props) {
  return (
    <div
      style={{
        background: `linear-gradient(135deg, ${COLORS.cardGradientFrom} 0%, ${COLORS.cardGradientTo} 100%)`,
        padding: 20,
        borderRadius: 14,
        boxShadow: COLORS.cardShadow,
        border: COLORS.cardBorder,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 10,
          flexWrap: "wrap",
        }}
      >
        <h3>Vendas Registradas</h3>
      </div>
      <div style={{ color: COLORS.grayText, fontSize: 14, marginTop: 8 }}>
        Exibindo {vendas.length} venda
        {vendas.length === 1 ? "" : "s"}
      </div>

      <div
        style={{
          marginBottom: 20,
          padding: 16,
          background: "rgb(250, 245, 238)",
          borderRadius: 8,
        }}
      >
        <h4>Filtros</h4>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
            gap: 12,
          }}
        >
          <label style={{ display: "block" }}>
            Data Início
            <input
              type="date"
              value={filters.dataInicio}
              onChange={(e) =>
                setFilters({ ...filters, dataInicio: e.target.value })
              }
              style={{
                width: "100%",
                marginTop: 6,
                padding: 8,
                background: COLORS.white,
                border: "1px solid rgb(167, 117, 75)",
                borderRadius: 6,
                textAlign: "left",
              }}
            />
          </label>
          <label style={{ display: "block" }}>
            Data Fim
            <input
              type="date"
              value={filters.dataFim}
              onChange={(e) =>
                setFilters({ ...filters, dataFim: e.target.value })
              }
              style={{
                width: "100%",
                marginTop: 6,
                padding: 8,
                background: COLORS.white,
                border: "1px solid rgb(167, 117, 75)",
                borderRadius: 6,
                textAlign: "left",
              }}
            />
          </label>
          <label style={{ display: "block" }}>
            Cliente
            <input
              value={filters.cliente}
              onChange={(e) =>
                setFilters({ ...filters, cliente: e.target.value })
              }
              style={{
                width: "100%",
                marginTop: 6,
                padding: 8,
                background: COLORS.white,
                border: "1px solid rgb(167, 117, 75)",
                borderRadius: 6,
                textAlign: "left",
              }}
            />
          </label>
          <label style={{ display: "block" }}>
            Modelo
            <select
              value={filters.modeloVela}
              onChange={(e) =>
                setFilters({ ...filters, modeloVela: e.target.value })
              }
              style={{
                width: "100%",
                marginTop: 6,
                padding: 8,
                textAlign: "left",
                background: COLORS.white,
                border: "1px solid rgb(167, 117, 75)",
                borderRadius: 6,
              }}
            >
              <option value="">Todos</option>
              {modelos.map((modelo) => (
                <option key={modelo.id} value={modelo.nome}>
                  {modelo.nome}
                </option>
              ))}
            </select>
          </label>
          <label style={{ display: "block" }}>
            Status
            <select
              value={filters.status}
              onChange={(e) =>
                setFilters({ ...filters, status: e.target.value })
              }
              style={{
                width: "100%",
                marginTop: 6,
                padding: 8,
                textAlign: "left",
                background: COLORS.white,
                border: "1px solid rgb(167, 117, 75)",
                borderRadius: 6,
              }}
            >
              <option value="">Todos</option>
              {saleStatuses.map((opt) => (
                <option key={opt.id} value={opt.name}>
                  {opt.name}
                </option>
              ))}
            </select>
          </label>
          <label style={{ display: "block" }}>
            Forma Pagamento
            <select
              value={filters.formaPagamento}
              onChange={(e) =>
                setFilters({ ...filters, formaPagamento: e.target.value })
              }
              style={{
                width: "100%",
                marginTop: 6,
                padding: 8,
                textAlign: "left",
                background: COLORS.white,
                border: "1px solid rgb(167, 117, 75)",
                borderRadius: 6,
              }}
            >
              <option value="">Todos</option>
              {paymentMethods.map((opt) => (
                <option key={opt.id} value={opt.name}>
                  {opt.name}
                </option>
              ))}
              {!paymentMethods.some(
                (method) => method.name.trim().toLowerCase() === "consignação",
              ) && <option value="Consignação">Consignação</option>}
            </select>
          </label>
        </div>
        <button
          onClick={onClearFilters}
          style={{
            marginTop: 12,
            padding: "10px 16px",
            background: COLORS.primary,
            color: "white",
            border: "none",
            borderRadius: 6,
          }}
        >
          Limpar Filtros
        </button>
      </div>

      <div style={{ overflowX: "hidden" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: 11.5,
            tableLayout: "fixed",
          }}
        >
          <thead style={{ background: "rgba(255,255,255,0.35)" }}>
            <tr>
              <th style={{ ...thStyle, width: 78 }}>Data</th>
              <th style={thStyle}>Cliente</th>
              <th style={thStyle}>Produto</th>
              <th style={{ ...thStyle, width: 44 }}>Qtd</th>
              <th style={thStyle}>Valor Unit.</th>
              <th style={thStyle}>Subtotal</th>
              <th style={thStyle}>Desconto</th>
              <th style={thStyle}>Frete</th>
              <th style={thStyle}>Total (R$)</th>
              <th style={thStyle}>Pagamento</th>
              <th style={thStyle}>Status</th>
              <th style={thStyle}>Obs. desconto/frete</th>
              <th style={thStyle}>Obs. pedido</th>
              <th style={thStyle}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {vendas.map((venda, index) => {
              const itens =
                venda.itens && venda.itens.length > 0
                  ? venda.itens
                  : [
                      {
                        id: venda.id,
                        modeloVela: venda.modeloVela,
                        quantidade: venda.quantidade,
                        precoUnitario: venda.precoUnitario,
                      },
                    ];
              const rowSpan = itens.length;
              const descontoValor = Number(venda.desconto ?? 0);
              const temDesconto = descontoValor > 0;
              const freteValor = Number(venda.frete ?? 0);
              const temFrete = freteValor > 0;
              const rowBackground =
                index % 2 === 0 ? COLORS.tableRowEven : COLORS.tableRowOdd;

              return itens.map((item, itemIndex) => {
                const isFirst = itemIndex === 0;
                const itemCellStyle: React.CSSProperties = {
                  ...tdStyle,
                  borderTop: isFirst
                    ? tdStyle.borderTop
                    : "1px dashed rgba(167, 117, 75, 0.35)",
                };

                return (
                  <tr
                    key={`${venda.id}-${item.id}`}
                    style={{ background: rowBackground }}
                  >
                    {isFirst && (
                      <>
                        <td rowSpan={rowSpan} style={{ ...tdStyle, width: 78 }}>
                          {formatDateOnly(venda.dataVenda)}
                        </td>
                        <td rowSpan={rowSpan} style={tdStyle}>
                          {venda.cliente}
                        </td>
                      </>
                    )}
                    <td style={itemCellStyle}>{item.modeloVela}</td>
                    <td style={{ ...itemCellStyle, width: 44 }}>
                      <span
                        style={{
                          ...badgeStyle,
                          minWidth: 32,
                          background: "rgba(167, 117, 75, 0.12)",
                          color: "#5b3a22",
                        }}
                      >
                        {item.quantidade}
                      </span>
                    </td>
                    <td style={itemCellStyle}>
                      <span
                        style={{
                          ...badgeStyle,
                          background: "rgba(59, 130, 246, 0.10)",
                          color: "#1d4ed8",
                        }}
                      >
                        <span>R$</span>
                        <span>{item.precoUnitario.toFixed(2)}</span>
                      </span>
                    </td>
                    <td style={itemCellStyle}>
                      <span
                        style={{
                          ...badgeStyle,
                          background: "rgba(148, 163, 184, 0.12)",
                          color: "#334155",
                        }}
                      >
                        <span>R$</span>
                        <span>
                          {(item.quantidade * item.precoUnitario).toFixed(2)}
                        </span>
                      </span>
                    </td>
                    {isFirst && (
                      <>
                        <td rowSpan={rowSpan} style={tdStyle}>
                          <span
                            style={{
                              ...badgeStyle,
                              background: temDesconto
                                ? "rgba(220, 38, 38, 0.12)"
                                : "rgba(148, 163, 184, 0.12)",
                              color: temDesconto ? "#b91c1c" : "#64748b",
                              fontSize: 12,
                            }}
                          >
                            <span>R$</span>
                            <span>
                              {temDesconto
                                ? `${(-descontoValor).toFixed(2)}`
                                : "0,00"}
                            </span>
                          </span>
                        </td>
                        <td rowSpan={rowSpan} style={tdStyle}>
                          <span
                            style={{
                              ...badgeStyle,
                              background: temFrete
                                ? "rgba(234, 88, 12, 0.12)"
                                : "rgba(148, 163, 184, 0.12)",
                              color: temFrete ? "#c2410c" : "#64748b",
                              fontSize: 12,
                            }}
                          >
                            <span>R$</span>
                            <span>
                              {temFrete ? freteValor.toFixed(2) : "0,00"}
                            </span>
                          </span>
                        </td>
                        <td rowSpan={rowSpan} style={tdStyle}>
                          <span
                            style={{
                              ...badgeStyle,
                              padding: "4px 10px",
                              background: "rgba(34, 197, 94, 0.12)",
                              color: "#166534",
                              fontWeight: 800,
                            }}
                          >
                            <span>R$</span>
                            <span>{venda.total.toFixed(2)}</span>
                          </span>
                        </td>
                        <td rowSpan={rowSpan} style={tdStyle}>
                          {venda.formaPagamento}
                        </td>
                        <td rowSpan={rowSpan} style={tdStyle}>
                          {venda.status}
                        </td>
                        <td rowSpan={rowSpan} style={tdStyle}>
                          <span
                            style={{
                              display: "inline-block",
                              maxWidth: 160,
                              padding: "4px 8px",
                              borderRadius: 8,
                              background: venda.obsDesconto
                                ? "rgba(255, 255, 255, 0.4)"
                                : "transparent",
                              color: venda.obsDesconto ? "#334155" : "#64748b",
                              fontSize: 12,
                              whiteSpace: "normal",
                            }}
                          >
                            {venda.obsDesconto || "-"}
                          </span>
                        </td>
                        <td rowSpan={rowSpan} style={tdStyle}>
                          {venda.observacao}
                        </td>
                        <td
                          rowSpan={rowSpan}
                          style={{ ...tdStyle, padding: 8, whiteSpace: "nowrap" }}
                        >
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "center",
                              gap: 6,
                            }}
                          >
                            {isAuthenticated && (
                              <button
                                type="button"
                                onClick={() => onEdit(venda.id)}
                                aria-label={`Editar venda de ${venda.cliente}`}
                                style={{
                                  padding: "5px 8px",
                                  background: COLORS.primary,
                                  color: "white",
                                  border: "none",
                                  borderRadius: 6,
                                  cursor: "pointer",
                                }}
                              >
                                Editar
                              </button>
                            )}
                            {canDelete && (
                              <button
                                type="button"
                                onClick={() => onDelete(venda.id)}
                                aria-label={`Excluir venda de ${venda.cliente}`}
                                style={{
                                  padding: "5px 8px",
                                  background: COLORS.dangerLight,
                                  color: "white",
                                  border: "none",
                                  borderRadius: 6,
                                  cursor: "pointer",
                                }}
                              >
                                Excluir
                              </button>
                            )}
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                );
              });
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
