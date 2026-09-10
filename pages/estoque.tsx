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

export default function Estoque() {
  const { isAuthenticated } = useAuth();
  const [insumos, setInsumos] = useState<Insumo[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [draftStock, setDraftStock] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/products");
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
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead style={{ background: "rgba(255,255,255,0.35)" }}>
            <tr>
              <th style={{ padding: 12, textAlign: "left" }}>Insumo</th>
              <th style={{ padding: 12, textAlign: "left" }}>Unidade</th>
              <th style={{ padding: 12, textAlign: "center" }}>Estoque</th>
              <th style={{ padding: 12, textAlign: "center" }}>Custo Médio</th>
              <th style={{ padding: 12, textAlign: "center" }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {sortedInsumos.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: 16, textAlign: "center" }}>
                  Nenhum insumo cadastrado ainda.
                </td>
              </tr>
            ) : (
              sortedInsumos.map((insumo) => (
                <tr key={insumo.id}>
                  <td
                    style={{
                      padding: 12,
                      borderTop: COLORS.cardBorder,
                    }}
                  >
                    {insumo.name}
                  </td>
                  <td
                    style={{
                      padding: 12,
                      borderTop: COLORS.cardBorder,
                    }}
                  >
                    {insumo.unit || "-"}
                  </td>
                  <td
                    style={{
                      padding: 12,
                      textAlign: "center",
                      borderTop: COLORS.cardBorder,
                    }}
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
                      insumo.stock
                    )}
                  </td>
                  <td
                    style={{
                      padding: 12,
                      textAlign: "center",
                      borderTop: COLORS.cardBorder,
                    }}
                  >
                    R$ {Number(insumo.unitCost || 0).toFixed(3)}
                  </td>
                  <td
                    style={{
                      padding: 12,
                      textAlign: "center",
                      borderTop: COLORS.cardBorder,
                    }}
                  >
                    {isAuthenticated ? (
                      editingId === insumo.id ? (
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "center",
                            gap: 8,
                          }}
                        >
                          <button
                            type="button"
                            onClick={() => saveStock(insumo.id)}
                            style={{
                              padding: "6px 10px",
                              background: COLORS.primary,
                              color: "white",
                              border: "none",
                              borderRadius: 6,
                              cursor: "pointer",
                            }}
                          >
                            Salvar
                          </button>
                          <button
                            type="button"
                            onClick={cancelEdit}
                            style={{
                              padding: "10px 16px",
                              background: COLORS.dangerLight,
                              color: "white",
                              border: "none",
                              borderRadius: 6,
                              cursor: "pointer",
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
                            padding: "8px 16px",
                            background: COLORS.primary,
                            color: "white",
                            border: "none",
                            borderRadius: 6,
                            cursor: "pointer",
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
