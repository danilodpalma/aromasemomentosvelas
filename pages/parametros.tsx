import { useEffect, useState, type FormEvent } from "react";

type Parameter = {
  id: number;
  name: string;
  category:
    | "productType"
    | "unit"
    | "paymentMethod"
    | "saleStatus"
    | "purchaseStatus"
    | "purchaseType";
};

export default function Parametros() {
  const [types, setTypes] = useState<Parameter[]>([]);
  const [name, setName] = useState("");
  const [category, setCategory] =
    useState<Parameter["category"]>("productType");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadParameters() {
      try {
        const res = await fetch("/api/productTypes");
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data?.error || "Falha ao carregar parâmetros.");
        }
        if (!Array.isArray(data)) {
          throw new Error("Resposta inválida do servidor.");
        }

        const defaults = [
          { category: "purchaseStatus" as const, name: "Pendente" },
          { category: "purchaseStatus" as const, name: "Aprovado" },
          { category: "purchaseStatus" as const, name: "Recebido" },
          { category: "purchaseType" as const, name: "Despesa" },
          { category: "purchaseType" as const, name: "Compra de Insumo" },
        ];

        const missingDefaults = defaults.filter(
          (entry) =>
            !data.some(
              (item: Parameter) =>
                item.category === entry.category &&
                item.name.trim().toLowerCase() ===
                  entry.name.trim().toLowerCase(),
            ),
        );

        let merged = data as Parameter[];

        if (missingDefaults.length > 0) {
          const created = await Promise.all(
            missingDefaults.map((entry) =>
              fetch("/api/productTypes", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  name: entry.name,
                  category: entry.category,
                }),
              }).then(async (response) => {
                if (!response.ok) return null;
                return response.json();
              }),
            ),
          );
          merged = [...merged, ...(created.filter(Boolean) as Parameter[])];
        }

        setTypes(merged);
      } catch (error) {
        console.error("Falha ao carregar parâmetros:", error);
        setTypes([]);
        setMessage(
          error instanceof Error
            ? error.message
            : "Falha ao carregar parâmetros.",
        );
      }
    }

    void loadParameters();
  }, []);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!name.trim()) return setMessage("Nome obrigatório.");

    const url = editingId
      ? `/api/productTypes?id=${editingId}`
      : "/api/productTypes";
    const method = editingId ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), category }),
    });

    if (res.ok) {
      const saved = await res.json();
      setTypes((prev) =>
        editingId
          ? prev.map((t) => (t.id === saved.id ? saved : t))
          : [saved, ...prev],
      );
      setName("");
      setCategory("productType");
      setEditingId(null);
      setMessage("Salvo com sucesso.");
    } else {
      const err = await res.json();
      setMessage(err?.error || "Erro ao salvar.");
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Excluir esse parâmetro?")) return;
    const res = await fetch(`/api/productTypes?id=${id}`, { method: "DELETE" });
    if (res.ok || res.status === 204) {
      setTypes((prev) => prev.filter((t) => t.id !== id));
      setMessage("Excluído.");
    } else {
      setMessage("Erro ao excluir.");
    }
  }

  function startEdit(t: Parameter) {
    setEditingId(t.id);
    setName(t.name);
    setCategory(t.category);
    setMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const safeTypes = Array.isArray(types) ? types : [];
  const productTypes = safeTypes.filter((t) => t.category === "productType");
  const unitTypes = safeTypes.filter((t) => t.category === "unit");
  const paymentMethods = safeTypes.filter(
    (t) => t.category === "paymentMethod",
  );
  const saleStatuses = safeTypes.filter((t) => t.category === "saleStatus");
  const purchaseStatuses = safeTypes.filter(
    (t) => t.category === "purchaseStatus",
  );
  const purchaseTypes = safeTypes.filter((t) => t.category === "purchaseType");

  function renderParameterGroup(
    title: string,
    emptyText: string,
    items: Parameter[],
  ) {
    return (
      <div
        style={{
          background: "rgba(255,255,255,0.7)",
          border: "1px solid rgba(166, 116, 71, 0.16)",
          borderRadius: 12,
          padding: 14,
          boxShadow: "0 4px 12px rgba(92, 54, 24, 0.06)",
        }}
      >
        <h3 style={{ margin: "0 0 10px", color: "#6b3b12", fontSize: 15 }}>
          {title}
        </h3>
        {items.length === 0 ? (
          <p style={{ margin: 0, color: "#7c3d12" }}>{emptyText}</p>
        ) : (
          <div style={{ display: "grid", gap: 8 }}>
            {items.map((t) => (
              <div
                key={t.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 12,
                  padding: "10px 12px",
                  borderRadius: 10,
                  background: "rgba(247, 232, 215, 0.75)",
                  border: "1px solid rgba(166, 116, 71, 0.18)",
                }}
              >
                <span style={{ fontWeight: 600, color: "#6b3b12" }}>
                  {t.name}
                </span>
                <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                  <button
                    onClick={() => startEdit(t)}
                    style={{
                      padding: "7px 10px",
                      borderRadius: 999,
                      border: "1px solid rgba(166, 116, 71, 0.3)",
                      background: "#fff",
                      color: "#6b3b12",
                      cursor: "pointer",
                      fontSize: 12,
                      fontWeight: 600,
                    }}
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(t.id)}
                    style={{
                      padding: "7px 10px",
                      borderRadius: 999,
                      border: "none",
                      background: "#b45309",
                      color: "white",
                      cursor: "pointer",
                      fontSize: 12,
                      fontWeight: 600,
                    }}
                  >
                    Excluir
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <h2>Parâmetros</h2>
      <p>
        Gerencie os parâmetros usados no sistema: tipos de produto, unidades,
        formas de pagamento e status de venda.
      </p>

      {message && (
        <div
          style={{
            margin: "16px 0",
            padding: 14,
            background: "#ecfdf5",
            border: "1px solid #a7f3d0",
          }}
        >
          {message}
        </div>
      )}

      <div
        style={{
          display: "grid",
          gap: 20,
          marginTop: 20,
          maxWidth: 1120,
          marginLeft: "auto",
          marginRight: "auto",
        }}
      >
        <div
          style={{
            background: "linear-gradient(135deg, #f7e8d7 0%, #efd9c2 100%)",
            padding: 18,
            borderRadius: 14,
            boxShadow: "0 10px 24px rgba(92, 54, 24, 0.1)",
            border: "1px solid rgba(166, 116, 71, 0.2)",
          }}
        >
          <h3 style={{ margin: "0 0 12px", color: "#6b3b12" }}>
            {editingId ? "Editar parâmetro" : "Novo parâmetro"}
          </h3>
          <form onSubmit={handleSubmit}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: 12,
              }}
            >
              <label
                style={{ display: "block", fontWeight: 600, color: "#6b3b12" }}
              >
                Categoria do parâmetro
                <select
                  value={category}
                  onChange={(e) =>
                    setCategory(e.target.value as Parameter["category"])
                  }
                  style={{
                    width: "100%",
                    marginTop: 6,
                    padding: "8px 10px",
                    border: "1px solid rgb(166, 116, 71)",
                    borderRadius: 8,
                    background: "#fff",
                    fontSize: 13,
                  }}
                >
                  <option value="productType">Tipo de produto</option>
                  <option value="unit">Unidade</option>
                  <option value="paymentMethod">Forma de pagamento</option>
                  <option value="saleStatus">Status da venda</option>
                  <option value="purchaseStatus">Status da compra</option>
                  <option value="purchaseType">Tipo de lançamento</option>
                </select>
              </label>
              <label
                style={{ display: "block", fontWeight: 600, color: "#6b3b12" }}
              >
                Nome do parâmetro
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{
                    width: "100%",
                    marginTop: 6,
                    padding: "8px 10px",
                    border: "1px solid rgb(166, 116, 71)",
                    borderRadius: 8,
                    background: "#fff",
                    fontSize: 13,
                  }}
                />
              </label>
            </div>
            <div
              style={{
                display: "flex",
                gap: 10,
                marginTop: 14,
                flexWrap: "wrap",
              }}
            >
              <button
                type="submit"
                style={{
                  padding: "10px 16px",
                  background:
                    "linear-gradient(135deg, #a76f4b 0%, #8c5331 100%)",
                  color: "white",
                  border: "none",
                  borderRadius: 999,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                {editingId ? "Atualizar" : "Criar"}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(null);
                    setName("");
                    setCategory("productType");
                  }}
                  style={{
                    padding: "10px 16px",
                    background: "rgb(107, 114, 128)",
                    color: "white",
                    border: "none",
                    borderRadius: 999,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </div>

        <div
          style={{
            background: "linear-gradient(135deg, #f7e8d7 0%, #efd9c2 100%)",
            padding: 18,
            borderRadius: 14,
            boxShadow: "0 10px 24px rgba(92, 54, 24, 0.1)",
            border: "1px solid rgba(166, 116, 71, 0.2)",
          }}
        >
          <div
            style={{
              display: "grid",
              gap: 14,
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            }}
          >
            {renderParameterGroup(
              "Tipos de produto cadastrados",
              "Nenhum tipo cadastrado.",
              productTypes,
            )}
            {renderParameterGroup(
              "Unidades cadastradas",
              "Nenhuma unidade cadastrada.",
              unitTypes,
            )}
            {renderParameterGroup(
              "Formas de pagamento cadastradas",
              "Nenhuma forma de pagamento cadastrada.",
              paymentMethods,
            )}
            {renderParameterGroup(
              "Status de venda cadastrados",
              "Nenhum status cadastrado.",
              saleStatuses,
            )}
            {renderParameterGroup(
              "Status de compra cadastrados",
              "Nenhum status de compra cadastrado.",
              purchaseStatuses,
            )}
            {renderParameterGroup(
              "Tipos de lançamento cadastrados",
              "Nenhum tipo de lançamento cadastrado.",
              purchaseTypes,
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
