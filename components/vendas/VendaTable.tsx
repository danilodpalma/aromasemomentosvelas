// components/vendas/VendaTable.tsx
import { COLORS } from "../../styles/theme";

type Venda = {
  id: number;
  dataVenda: string;
  cliente: string;
  modeloVela: string;
  quantidade: number;
  precoUnitario: number;
  total: number;
  formaPagamento: string;
  status: string;
  observacao?: string;
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
  selectedItems: Set<number>;
  onToggleSelect: (id: number) => void;
  onEdit: () => void;
  onDelete: () => void;
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
  selectedItems,
  onToggleSelect,
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
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {isAuthenticated && (
            <button
              type="button"
              onClick={onEdit}
              disabled={selectedItems.size !== 1}
              style={{
                padding: "8px 16px",
                background: selectedItems.size === 1 ? COLORS.primary : COLORS.gray,
                color: "white",
                border: "none",
                borderRadius: 6,
                cursor: selectedItems.size === 1 ? "pointer" : "not-allowed",
              }}
            >
              Editar
            </button>
          )}
          {canDelete && (
            <button
              type="button"
              onClick={onDelete}
              disabled={selectedItems.size !== 1}
              style={{
                padding: "8px 16px",
                background:
                  selectedItems.size === 1 ? COLORS.dangerLight : COLORS.gray,
                color: "white",
                border: "none",
                borderRadius: 6,
                cursor: selectedItems.size === 1 ? "pointer" : "not-allowed",
              }}
            >
              Excluir
            </button>
          )}
        </div>
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
              onChange={(e) => setFilters({ ...filters, dataFim: e.target.value })}
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
              onChange={(e) => setFilters({ ...filters, cliente: e.target.value })}
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
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
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
              <option value="Outros">Outros</option>
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

      <div style={{ overflowX: "auto" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            minWidth: 1000,
          }}
        >
          <thead style={{ background: "rgba(255,255,255,0.35)" }}>
            <tr>
              <th style={{ padding: 12, textAlign: "center" }}>Selecionar</th>
              <th style={{ padding: 12, textAlign: "center" }}>Data Venda</th>
              <th style={{ padding: 12, textAlign: "center" }}>Cliente</th>
              <th style={{ padding: 12, textAlign: "center" }}>Modelo</th>
              <th style={{ padding: 12, textAlign: "center" }}>Qtd</th>
              <th style={{ padding: 12, textAlign: "center" }}>
                Preço Unit. (R$)
              </th>
              <th style={{ padding: 12, textAlign: "center" }}>Total (R$)</th>
              <th style={{ padding: 12, textAlign: "center" }}>Pagamento</th>
              <th style={{ padding: 12, textAlign: "center" }}>Status</th>
              <th style={{ padding: 12, textAlign: "center" }}>Observação</th>
            </tr>
          </thead>
          <tbody>
            {vendas.map((venda, index) => (
              <tr
                key={venda.id}
                style={{
                  background:
                    index % 2 === 0 ? "rgba(255, 255, 255, 0.92)" : "transparent",
                }}
              >
                <td
                  style={{
                    padding: 12,
                    borderTop: "1px solid rgb(167, 117, 75)",
                    textAlign: "center",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selectedItems.has(venda.id)}
                    onChange={() => onToggleSelect(venda.id)}
                    style={{ width: 18, height: 18 }}
                  />
                </td>
                <td
                  style={{
                    padding: 12,
                    borderTop: "1px solid rgb(167, 117, 75)",
                    textAlign: "center",
                  }}
                >
                  {new Date(venda.dataVenda).toLocaleDateString()}
                </td>
                <td
                  style={{
                    padding: 12,
                    borderTop: "1px solid rgb(167, 117, 75)",
                    textAlign: "center",
                  }}
                >
                  {venda.cliente}
                </td>
                <td
                  style={{
                    padding: 12,
                    borderTop: "1px solid rgb(167, 117, 75)",
                    textAlign: "center",
                  }}
                >
                  {venda.modeloVela}
                </td>
                <td
                  style={{
                    padding: 12,
                    borderTop: "1px solid rgb(167, 117, 75)",
                    textAlign: "center",
                  }}
                >
                  {venda.quantidade}
                </td>
                <td
                  style={{
                    padding: 12,
                    borderTop: "1px solid rgb(167, 117, 75)",
                    textAlign: "center",
                  }}
                >
                  R$ {venda.precoUnitario.toFixed(2)}
                </td>
                <td
                  style={{
                    padding: 12,
                    borderTop: "1px solid rgb(167, 117, 75)",
                    textAlign: "center",
                  }}
                >
                  R$ {venda.total.toFixed(2)}
                </td>
                <td
                  style={{
                    padding: 12,
                    borderTop: "1px solid rgb(167, 117, 75)",
                    textAlign: "center",
                  }}
                >
                  {venda.formaPagamento}
                </td>
                <td
                  style={{
                    padding: 12,
                    borderTop: "1px solid rgb(167, 117, 75)",
                    textAlign: "center",
                  }}
                >
                  {venda.status}
                </td>
                <td
                  style={{
                    padding: 12,
                    borderTop: "1px solid rgb(167, 117, 75)",
                    textAlign: "center",
                  }}
                >
                  {venda.observacao}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
