import { useEffect, useState } from "react";

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
      const res = await fetch(`/api/products/${id}`, {
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
      <h2 style={{ marginBottom: 6, color: "#6b3b12" }}>Estoque</h2>
      <p style={{ marginTop: 0, color: "#8a5a2b" }}>
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
          background: "linear-gradient(135deg, #f7e8d7 0%, #efd9c2 100%)",
          padding: 20,
          borderRadius: 14,
          boxShadow: "0 10px 24px rgba(92, 54, 24, 0.1)",
          border: "1px solid rgba(166, 116, 71, 0.2)",
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
                      borderTop: "1px solid rgba(166, 116, 71, 0.2)",
                    }}
                  >
                    {insumo.name}
                  </td>
                  <td
                    style={{
                      padding: 12,
                      borderTop: "1px solid rgba(166, 116, 71, 0.2)",
                    }}
                  >
                    {insumo.unit || "-"}
                  </td>
                  <td
                    style={{
                      padding: 12,
                      textAlign: "center",
                      borderTop: "1px solid rgba(166, 116, 71, 0.2)",
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
                      borderTop: "1px solid rgba(166, 116, 71, 0.2)",
                    }}
                  >
                    R$ {Number(insumo.unitCost || 0).toFixed(3)}
                  </td>
                  <td
                    style={{
                      padding: 12,
                      textAlign: "center",
                      borderTop: "1px solid rgba(166, 116, 71, 0.2)",
                    }}
                  >
                    {editingId === insumo.id ? (
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
                            background: "rgb(167, 117, 75)",
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
                            background: "rgb(239, 68, 68)",
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
                          background: "rgb(167, 117, 75)",
                          color: "white",
                          border: "none",
                          borderRadius: 6,
                          cursor: "pointer",
                        }}
                      >
                        Editar
                      </button>
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
