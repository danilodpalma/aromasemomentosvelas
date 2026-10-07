// components/compras/CompraTable.tsx
import { COLORS } from "../../styles/theme";

type Compra = {
  id: number;
  data: string;
  tipoLancamento: string;
  categoria?: string | null;
  descricao?: string | null;
  valor: number;
  status: string;
  itens?: Array<{
    id: number;
    insumoId?: number | null;
    quantidade: number;
    unidade?: string | null;
    custoUnitario: number;
    custoTotal: number;
    insumo?: { name: string } | null;
  }>;
};

type Props = {
  compras: Compra[];
  isAuthenticated: boolean;
  canDelete: boolean;
  startEdit: (compra: Compra) => void;
  deleteCompra: (id: number) => void;
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

export default function CompraTable({
  compras,
  isAuthenticated,
  canDelete,
  startEdit,
  deleteCompra,
}: Props) {
  return (
    <section
      style={{
        marginTop: 24,
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
        <h3>Lançamentos cadastrados</h3>
      </div>
      <div
        style={{
          color: COLORS.grayText,
          fontSize: 14,
          marginTop: 8,
          marginBottom: 16,
        }}
      >
        Exibindo {compras.length} lançamento
        {compras.length === 1 ? "" : "s"}
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
              <th style={thStyle}>Tipo</th>
              <th style={thStyle}>Categoria</th>
              <th style={thStyle}>Status</th>
              <th style={thStyle}>Valor (R$)</th>
              <th style={thStyle}>Itens</th>
              <th style={thStyle}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {compras.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ ...tdStyle, padding: 16 }}>
                  Nenhum lançamento cadastrado ainda.
                </td>
              </tr>
            ) : (
              compras.map((compra, index) => (
                <tr
                  key={compra.id}
                  style={{
                    background:
                      index % 2 === 0
                        ? COLORS.tableRowEven
                        : COLORS.tableRowOdd,
                  }}
                >
                  <td style={{ ...tdStyle, width: 78 }}>
                    {new Date(compra.data).toLocaleDateString("pt-BR")}
                  </td>
                  <td style={tdStyle}>{compra.tipoLancamento}</td>
                  <td style={tdStyle}>{compra.categoria || "-"}</td>
                  <td style={tdStyle}>{compra.status}</td>
                  <td style={tdStyle}>
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
                      <span>{compra.valor.toFixed(2)}</span>
                    </span>
                  </td>
                  <td style={tdStyle}>
                    {compra.itens
                      ?.map((item) => item.insumo?.name || "Item")
                      .join(", ") || "-"}
                  </td>
                  <td style={{ ...tdStyle, padding: 8, whiteSpace: "nowrap" }}>
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
                          onClick={() => startEdit(compra)}
                          aria-label={`Editar lançamento ${compra.tipoLancamento}`}
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
                          onClick={() => deleteCompra(compra.id)}
                          aria-label={`Excluir lançamento ${compra.tipoLancamento}`}
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
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
