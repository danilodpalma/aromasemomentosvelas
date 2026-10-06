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
            minWidth: 820,
            fontSize: 11.5,
            tableLayout: "fixed",
          }}
        >
          <thead style={{ background: "rgba(255,255,255,0.35)" }}>
            <tr>
              <th
                style={{
                  padding: "10px 8px",
                  textAlign: "center",
                  width: 78,
                }}
              >
                Data
              </th>
              <th style={{ padding: "10px 8px", textAlign: "center" }}>
                Cliente
              </th>
              <th style={{ padding: "10px 8px", textAlign: "center" }}>
                Modelo
              </th>
              <th
                style={{ padding: "10px 8px", textAlign: "center", width: 44 }}
              >
                Qtd
              </th>
              <th style={{ padding: "10px 8px", textAlign: "center" }}>
                Preço Unit. (R$)
              </th>
              <th style={{ padding: "10px 8px", textAlign: "center" }}>
                Desconto
              </th>
              <th style={{ padding: "10px 8px", textAlign: "center" }}>
                Total (R$)
              </th>
              <th style={{ padding: "10px 8px", textAlign: "center" }}>
                Pagamento
              </th>
              <th style={{ padding: "10px 8px", textAlign: "center" }}>
                Status
              </th>
              <th style={{ padding: "10px 8px", textAlign: "center" }}>
                Obs. desconto
              </th>
              <th style={{ padding: "10px 8px", textAlign: "center" }}>
                Observação
              </th>
              <th style={{ padding: "10px 8px", textAlign: "center" }}>
                Ações
              </th>
            </tr>
          </thead>
          <tbody>
            {vendas.map((venda, index) => {
              const modeloResumo =
                venda.itens && venda.itens.length > 0
                  ? venda.itens.map((item) => item.modeloVela).join(" / ")
                  : venda.modeloVela;
              const quantidadeTotal =
                venda.itens && venda.itens.length > 0
                  ? venda.itens.reduce((sum, item) => sum + item.quantidade, 0)
                  : venda.quantidade;
              const precoMedio =
                venda.total > 0 && quantidadeTotal > 0
                  ? venda.total / quantidadeTotal
                  : venda.precoUnitario;
              const descontoValor = Number(venda.desconto ?? 0);
              const temDesconto = descontoValor > 0;

              return (
                <tr
                  key={venda.id}
                  style={{
                    background:
                      index % 2 === 0
                        ? COLORS.tableRowEven
                        : COLORS.tableRowOdd,
                  }}
                >
                  <td
                    style={{
                      padding: "8px 10px",
                      borderTop: "1px solid rgb(167, 117, 75)",
                      textAlign: "center",
                      verticalAlign: "middle",
                      width: 78,
                    }}
                  >
                    {formatDateOnly(venda.dataVenda)}
                  </td>
                  <td
                    style={{
                      padding: "8px 10px",
                      borderTop: "1px solid rgb(167, 117, 75)",
                      textAlign: "center",
                      verticalAlign: "middle",
                    }}
                  >
                    {venda.cliente}
                  </td>
                  <td
                    style={{
                      padding: "8px 10px",
                      borderTop: "1px solid rgb(167, 117, 75)",
                      textAlign: "center",
                      verticalAlign: "middle",
                    }}
                  >
                    {modeloResumo}
                  </td>
                  <td
                    style={{
                      padding: "8px 10px",
                      borderTop: "1px solid rgb(167, 117, 75)",
                      textAlign: "center",
                      verticalAlign: "middle",
                    }}
                  >
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        minWidth: 32,
                        padding: "4px 8px",
                        borderRadius: 999,
                        background: "rgba(167, 117, 75, 0.12)",
                        color: "#5b3a22",
                        fontWeight: 700,
                        lineHeight: 1.2,
                      }}
                    >
                      {quantidadeTotal}
                    </span>
                  </td>
                  <td
                    style={{
                      padding: "8px 10px",
                      borderTop: "1px solid rgb(167, 117, 75)",
                      textAlign: "center",
                      verticalAlign: "middle",
                    }}
                  >
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 4,
                        padding: "4px 8px",
                        borderRadius: 999,
                        background: "rgba(59, 130, 246, 0.10)",
                        color: "#1d4ed8",
                        fontWeight: 700,
                        lineHeight: 1.2,
                        whiteSpace: "nowrap",
                      }}
                    >
                      <span>R$</span>
                      <span>{precoMedio.toFixed(2)}</span>
                    </span>
                  </td>
                  <td
                    style={{
                      padding: "8px 10px",
                      borderTop: "1px solid rgb(167, 117, 75)",
                      textAlign: "center",
                      verticalAlign: "middle",
                    }}
                  >
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 4,
                        padding: "4px 8px",
                        borderRadius: 999,
                        background: temDesconto
                          ? "rgba(220, 38, 38, 0.12)"
                          : "rgba(148, 163, 184, 0.12)",
                        color: temDesconto ? "#b91c1c" : "#64748b",
                        fontWeight: 700,
                        fontSize: 12,
                        lineHeight: 1.2,
                        whiteSpace: "nowrap",
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
                  <td
                    style={{
                      padding: "8px 10px",
                      borderTop: "1px solid rgb(167, 117, 75)",
                      textAlign: "center",
                      verticalAlign: "middle",
                    }}
                  >
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 4,
                        padding: "4px 10px",
                        borderRadius: 999,
                        background: "rgba(34, 197, 94, 0.12)",
                        color: "#166534",
                        fontWeight: 800,
                        lineHeight: 1.2,
                        whiteSpace: "nowrap",
                      }}
                    >
                      <span>R$</span>
                      <span>{venda.total.toFixed(2)}</span>
                    </span>
                  </td>
                  <td
                    style={{
                      padding: "8px 10px",
                      borderTop: "1px solid rgb(167, 117, 75)",
                      textAlign: "center",
                      verticalAlign: "middle",
                    }}
                  >
                    {venda.formaPagamento}
                  </td>
                  <td
                    style={{
                      padding: "8px 10px",
                      borderTop: "1px solid rgb(167, 117, 75)",
                      textAlign: "center",
                      verticalAlign: "middle",
                    }}
                  >
                    {venda.status}
                  </td>
                  <td
                    style={{
                      padding: "8px 10px",
                      borderTop: "1px solid rgb(167, 117, 75)",
                      textAlign: "center",
                      verticalAlign: "middle",
                    }}
                  >
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
                  <td
                    style={{
                      padding: "8px 10px",
                      borderTop: "1px solid rgb(167, 117, 75)",
                      textAlign: "center",
                      verticalAlign: "middle",
                    }}
                  >
                    {venda.observacao}
                  </td>
                  <td
                    style={{
                      padding: 8,
                      borderTop: "1px solid rgb(167, 117, 75)",
                      textAlign: "center",
                      whiteSpace: "nowrap",
                      verticalAlign: "middle",
                    }}
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
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
