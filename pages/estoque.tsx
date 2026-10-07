import { useEffect, useState } from "react";
import { useAuth } from "../context";
import { authFetch } from "../lib/apiClient";
import { COLORS } from "../styles/theme";

type Insumo = {
  id: number;
  name: string;
  unit?: string | null;
  stock: number;
  unitCost: number;
  purchaseCost: number;
  purchasedQuantity: number;
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

const actionButtonStyle: React.CSSProperties = {
  padding: "5px 8px",
  color: "white",
  border: "none",
  borderRadius: 6,
  cursor: "pointer",
};

export default function Estoque() {
  const { canEdit } = useAuth();
  const [insumos, setInsumos] = useState<Insumo[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [draftStock, setDraftStock] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const res = await authFetch("/api/products");
        const data = await res.json();
        setInsumos(Array.isArray(data) ? data : []);
      } catch (error) {
        setMessage("Erro ao carregar o estoque.");
      }
    }
    load();
  }, []);

  const sortedInsumos = [...insumos].sort((a, b) =>
    a.name.localeCompare(b.name, "pt-BR", { sensitivity: "base" }),
  );

  function startEdit(insumo: Insumo) {
    setEditingId(insumo.id);
    setDraftStock(String(insumo.stock ?? 0));
    setMessage("");
  }

  function cancelEdit() {
    setEditingId(null);
    setDraftStock("");
    setMessage("");
  }

  async function saveStock(id: number) {
    const parsedStock = Number(draftStock);

    if (!Number.isFinite(parsedStock) || parsedStock < 0) {
      setMessage("Informe uma quantidade válida para o estoque.");
      return;
    }

    try {
      const res = await authFetch(`/api/products?id=${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stock: Math.round(parsedStock) }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Erro ao atualizar o estoque.");
      }

      const updated = await res.json();
      setInsumos((prev) =>
        prev.map((item) => (item.id === id ? updated : item)),
      );
      setEditingId(null);
      setDraftStock("");
      setMessage("Estoque atualizado com sucesso.");
      requestAnimationFrame(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Erro ao atualizar o estoque.",
      );
    }
  }

  return (
    <div>
      <h2 style={{ marginBottom: 6, color: COLORS.primaryDark }}>Estoque</h2>
      <p style={{ marginTop: 0, color: COLORS.primaryDarkAlt }}>
        Acompanhe o saldo atual, a unidade e o custo médio dos insumos.
      </p>

      {message ? (
        <p
          style={{
            marginBottom: 12,
            color: message.includes("sucesso") ? "#166534" : "#b91c1c",
            fontWeight: 600,
          }}
        >
          {message}
        </p>
      ) : null}

      <section
        style={{
          background: `linear-gradient(135deg, ${COLORS.cardGradientFrom} 0%, ${COLORS.cardGradientTo} 100%)`,
          padding: 20,
          borderRadius: 14,
          boxShadow: COLORS.cardShadow,
          border: COLORS.cardBorder,
          overflowX: "auto",
        }}
      >
        <table
          style={{ width: "100%", borderCollapse: "collapse", fontSize: 11.5 }}
        >
          <thead style={{ background: "rgba(255,255,255,0.35)" }}>
            <tr>
              <th style={thStyle}>Insumo</th>
              <th style={thStyle}>Unidade</th>
              <th style={thStyle}>Estoque</th>
              <th style={thStyle}>Custo Médio</th>
              <th style={thStyle}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {sortedInsumos.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ ...tdStyle, padding: 16 }}>
                  Nenhum insumo cadastrado ainda.
                </td>
              </tr>
            ) : (
              sortedInsumos.map((insumo, index) => (
                <tr
                  key={insumo.id}
                  style={{
                    background:
                      index % 2 === 0
                        ? COLORS.tableRowEven
                        : COLORS.tableRowOdd,
                  }}
                >
                  <td
                    style={tdStyle}
                  >
                    {insumo.name}
                  </td>
                  <td
                    style={tdStyle}
                  >
                    {insumo.unit || "-"}
                  </td>
                  <td
                    style={tdStyle}
                  >
                    {editingId === insumo.id ? (
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={draftStock}
                        onChange={(e) => setDraftStock(e.target.value)}
                        style={{
                          width: 90,
                          padding: "8px 10px",
                          borderRadius: 8,
                          border: "1px solid rgb(167, 117, 75)",
                          textAlign: "center",
                        }}
                      />
                    ) : (
                      <span style={qtyBadgeStyle}>{insumo.stock}</span>
                    )}
                  </td>
                  <td
                    style={tdStyle}
                  >
                    <span style={priceBadgeStyle}><span>R$</span><span>{Number(insumo.unitCost || 0).toFixed(3)}</span></span>
                  </td>
                  <td
                    style={tdStyle}
                  >
                    {canEdit ? (
                      editingId === insumo.id ? (
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "center",
                            gap: 6,
                          }}
                        >
                          <button
                            type="button"
                            onClick={() => saveStock(insumo.id)}
                            style={{
                              ...actionButtonStyle,
                              background: COLORS.primary,
                            }}
                          >
                            Salvar
                          </button>
                          <button
                            type="button"
                            onClick={cancelEdit}
                            style={{
                              ...actionButtonStyle,
                              background: COLORS.dangerLight,
                            }}
                          >
                            Cancelar
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => startEdit(insumo)}
                          style={{
                            ...actionButtonStyle,
                            background: COLORS.primary,
                          }}
                        >
                          Editar
                        </button>
                      )
                    ) : (
                      "-"
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
}
