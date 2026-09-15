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
          background: "white",
          padding: 20,
          borderRadius: 14,
          border: COLORS.cardBorder,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 12,
          }}
        >
          <h3 style={{ margin: 0, color: COLORS.primaryDark }}>
            Lançamentos cadastrados
          </h3>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead style={{ background: COLORS.primarySoftAlt }}>
              <tr>
                <th style={{ padding: 8, textAlign: "left" }}>Data</th>
                <th style={{ padding: 8, textAlign: "left" }}>Tipo</th>
                <th style={{ padding: 8, textAlign: "left" }}>Categoria</th>
                <th style={{ padding: 8, textAlign: "left" }}>Status</th>
                <th style={{ padding: 8, textAlign: "left" }}>Valor</th>
                <th style={{ padding: 8, textAlign: "left" }}>Itens</th>
                <th style={{ padding: 8, textAlign: "left" }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {compras.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: 16, textAlign: "center" }}>
                    Nenhum lançamento cadastrado ainda.
                  </td>
                </tr>
              ) : (
                compras.map((compra) => (
                  <tr key={compra.id}>
                    <td
                      style={{
                        padding: 8,
                        borderTop: COLORS.primaryBorderSoft12,
                      }}
                    >
                      {new Date(compra.data).toLocaleDateString("pt-BR")}
                    </td>
                    <td
                      style={{
                        padding: 8,
                        borderTop: COLORS.primaryBorderSoft12,
                      }}
                    >
                      {compra.tipoLancamento}
                    </td>
                    <td
                      style={{
                        padding: 8,
                        borderTop: COLORS.primaryBorderSoft12,
                      }}
                    >
                      {compra.categoria || "-"}
                    </td>
                    <td
                      style={{
                        padding: 8,
                        borderTop: COLORS.primaryBorderSoft12,
                      }}
                    >
                      {compra.status}
                    </td>
                    <td
                      style={{
                        padding: 8,
                        borderTop: COLORS.primaryBorderSoft12,
                      }}
                    >
                      R$ {compra.valor.toFixed(2)}
                    </td>
                    <td
                      style={{
                        padding: 8,
                        borderTop: COLORS.primaryBorderSoft12,
                      }}
                    >
                      {compra.itens
                        ?.map((item) => item.insumo?.name || "Item")
                        .join(", ") || "-"}
                    </td>
                    <td
                      style={{
                        padding: 8,
                        borderTop: COLORS.primaryBorderSoft12,
                      }}
                    >
                      <div style={{ display: "flex", gap: 8 }}>
                        {isAuthenticated && (
                          <button
                            type="button"
                            onClick={() => startEdit(compra)}
                            style={{
                              padding: "6px 10px",
                              background: "#2563eb",
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
                            style={{
                              padding: "6px 10px",
                              background: COLORS.danger,
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
