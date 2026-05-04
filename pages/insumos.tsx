import { useEffect, useRef, useState } from "react";
import {
  formatCurrencyInput,
  parseCurrencyInput,
  sanitizeCurrencyInput,
} from "../lib/currency";

type Insumo = {
  id: number;
  name: string;
  active?: boolean;
  unit?: string;
  purchaseCost: number;
  purchasedQuantity: number;
  unitCost: number;
  description?: string;
};

export default function Insumos() {
  const nameInputRef = useRef<HTMLInputElement>(null);
  const [insumos, setInsumos] = useState<Insumo[]>([]);
  const [form, setForm] = useState({
    name: "",
    unit: "",
    purchaseCost: "",
    purchasedQuantity: "",
    description: "",
    active: true,
  });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formMode, setFormMode] = useState<"idle" | "new" | "edit">("idle");
  const [message, setMessage] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());
  const [showActiveOnly, setShowActiveOnly] = useState(true);

  function normalizeInsumoName(value: string) {
    return value.trim().toLowerCase().replace(/\s+/g, " ");
  }

  // Filtrar e ordenar insumos por ordem alfabetica
  const filteredInsumos = insumos
    .filter((item) => (item.active ?? true) === showActiveOnly)
    .filter((item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    .sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));

  // Alternar seleção de item
  function toggleSelect(id: number) {
    if (selectedItems.has(id)) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set([id]));
    }
  }

  // Editar itens selecionados
  function editSelected() {
    if (selectedItems.size === 1) {
      const item = insumos.find((i) => i.id === Array.from(selectedItems)[0]);
      if (item) startEdit(item);
    }
  }

  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then(setInsumos);
  }, []);

  useEffect(() => {
    if (formMode === "new" || formMode === "edit") {
      requestAnimationFrame(() => {
        nameInputRef.current?.focus();
      });
    }
  }, [formMode, editingId]);

  function resetForm(shouldClearMessage = false) {
    setEditingId(null);
    setFormMode("idle");
    setForm({
      name: "",
      unit: "",
      purchaseCost: "",
      purchasedQuantity: "",
      description: "",
      active: true,
    });
    if (shouldClearMessage) {
      setMessage("");
    }
    setSelectedItems(new Set());
  }

  function startNew() {
    setEditingId(null);
    setFormMode("new");
    setForm({
      name: "",
      unit: "",
      purchaseCost: "",
      purchasedQuantity: "",
      description: "",
      active: true,
    });
    setSelectedItems(new Set());
    setMessage("");
  }

  function startEdit(item: Insumo) {
    setEditingId(item.id);
    setFormMode("edit");
    setForm({
      name: item.name,
      unit: item.unit ?? "",
      purchaseCost: formatCurrencyInput(item.purchaseCost, 2),
      purchasedQuantity: item.purchasedQuantity.toString(),
      description: item.description ?? "",
      active: item.active ?? true,
    });
    setMessage("Edição de insumo ativa. Faça as alterações e salve.");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (formMode === "idle") return;

    // Verificar se já existe insumo com o mesmo nome
    const nomeNormalizado = normalizeInsumoName(form.name);
    const existe = insumos.some(
      (i) =>
        normalizeInsumoName(i.name) === nomeNormalizado &&
        (editingId ? i.id !== editingId : true),
    );

    if (existe) {
      setMessage("Já existe um insumo cadastrado com este nome.");
      return;
    }

    const method = editingId ? "PATCH" : "POST";
    const url = editingId ? `/api/products?id=${editingId}` : "/api/products";

    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          unit: form.unit,
          purchaseCost: parseCurrencyInput(form.purchaseCost),
          purchasedQuantity: Number(form.purchasedQuantity),
          description: form.description,
          active: form.active,
        }),
      });

      const raw = await response.text();
      const parsed = raw ? JSON.parse(raw) : null;

      if (response.ok) {
        const saved = parsed;
        if (editingId) {
          setInsumos((prev) =>
            prev.map((item) => (item.id === saved.id ? saved : item)),
          );
          resetForm();
          setMessage("Insumo atualizado com sucesso.");
        } else {
          setInsumos((prev) => [saved, ...prev]);
          resetForm();
          setMessage("Insumo cadastrado com sucesso.");
        }
      } else {
        setMessage(parsed?.error || "Erro ao salvar insumo.");
      }
    } catch {
      setMessage("Erro inesperado ao salvar insumo. Tente novamente.");
    }
  }

  return (
    <div>
      <h2>Insumos</h2>
      <p>Cadastre seus insumos como na planilha.</p>

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
          display: "flex",
          flexDirection: "column",
          gap: 20,
          marginTop: 24,
        }}
      >
        <div
          style={{
            background: "rgb(239, 221, 201)",
            padding: 20,
            borderRadius: 12,
            boxShadow: "0 1px 3px rgba(15, 23, 42, 0.08)",
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
            <h3 style={{ margin: 0 }}>
              {editingId ? "Editar insumo" : "Novo insumo"}
            </h3>
            <button
              type="button"
              onClick={startNew}
              style={{
                padding: "8px 16px",
                background: "rgb(34, 197, 94)",
                color: "white",
                border: "none",
                borderRadius: 6,
                cursor: "pointer",
              }}
            >
              + Novo
            </button>
          </div>
          <form onSubmit={handleSubmit}>
            <label style={{ display: "block", marginBottom: 12 }}>
              Base Principal
              <input
                ref={nameInputRef}
                required
                disabled={formMode === "idle"}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                style={{
                  width: "100%",
                  marginTop: 6,
                  padding: 8,
                  background: "rgb(255, 255, 255)",
                  borderColor: "rgb(167, 117, 75)",
                  borderWidth: 1,
                  borderStyle: "solid",
                  borderRadius: 6,
                }}
              />
            </label>
            <label style={{ display: "block", marginBottom: 12 }}>
              Unidade
              <input
                disabled={formMode === "idle"}
                value={form.unit}
                onChange={(e) => setForm({ ...form, unit: e.target.value })}
                style={{
                  width: "100%",
                  marginTop: 6,
                  padding: 8,
                  background: "rgb(255, 255, 255)",
                  borderColor: "rgb(167, 117, 75)",
                  borderWidth: 1,
                  borderStyle: "solid",
                  borderRadius: 6,
                }}
              />
            </label>
            <label style={{ display: "block", marginBottom: 12 }}>
              Custo da compra (R$)
              <input
                type="text"
                required
                disabled={formMode === "idle"}
                value={form.purchaseCost}
                onChange={(e) =>
                  setForm({
                    ...form,
                    purchaseCost: sanitizeCurrencyInput(e.target.value),
                  })
                }
                onBlur={() =>
                  setForm((prev) => ({
                    ...prev,
                    purchaseCost: prev.purchaseCost
                      ? formatCurrencyInput(prev.purchaseCost, 2)
                      : "",
                  }))
                }
                style={{
                  width: "100%",
                  marginTop: 5,
                  padding: 8,
                  background: "rgb(255, 255, 255)",
                  borderColor: "rgb(167, 117, 75)",
                  borderWidth: 1,
                  borderStyle: "solid",
                  borderRadius: 6,
                }}
              />
            </label>
            <label style={{ display: "block", marginBottom: 12 }}>
              Quantidade comprada
              <input
                type="number"
                required
                disabled={formMode === "idle"}
                value={form.purchasedQuantity}
                onChange={(e) =>
                  setForm({ ...form, purchasedQuantity: e.target.value })
                }
                style={{
                  width: "100%",
                  marginTop: 6,
                  padding: 8,
                  background: "rgb(255, 255, 255)",
                  borderColor: "rgb(167, 117, 75)",
                  borderWidth: 1,
                  borderStyle: "solid",
                  borderRadius: 6,
                }}
              />
            </label>
            <label style={{ display: "block", marginBottom: 12 }}>
              Descrição
              <input
                disabled={formMode === "idle"}
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                style={{
                  width: "100%",
                  marginTop: 6,
                  padding: 8,
                  background: "rgb(255, 255, 255)",
                  borderColor: "rgb(167, 117, 75)",
                  borderWidth: 1,
                  borderStyle: "solid",
                  borderRadius: 6,
                }}
              />
            </label>
            {formMode === "edit" && (
              <label style={{ display: "block", marginBottom: 12 }}>
                Status do insumo
                <div
                  style={{
                    marginTop: 8,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, active: !form.active })}
                    aria-label={form.active ? "Insumo ativo" : "Insumo inativo"}
                    style={{
                      width: 46,
                      height: 26,
                      borderRadius: 13,
                      border: "none",
                      cursor: "pointer",
                      background: form.active
                        ? "rgb(34, 197, 94)"
                        : "rgb(156, 163, 175)",
                      position: "relative",
                      padding: 0,
                    }}
                  >
                    <span
                      style={{
                        position: "absolute",
                        top: 3,
                        left: form.active ? 23 : 3,
                        width: 20,
                        height: 20,
                        borderRadius: "50%",
                        background: "white",
                        transition: "left 0.2s ease",
                      }}
                    />
                  </button>
                  <span>{form.active ? "Ativo" : "Inativo"}</span>
                </div>
              </label>
            )}
            <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
              <button
                type="submit"
                disabled={formMode === "idle"}
                style={{
                  padding: "10px 16px",
                  background:
                    formMode === "idle"
                      ? "rgb(200, 200, 200)"
                      : "rgb(167, 117, 75)",
                  color: "white",
                  border: "none",
                  borderRadius: 6,
                  cursor: formMode === "idle" ? "not-allowed" : "pointer",
                }}
              >
                {editingId ? "Atualizar insumo" : "Salvar insumo"}
              </button>
              {(formMode === "new" || formMode === "edit") && (
                <button
                  type="button"
                  onClick={() => resetForm(true)}
                  style={{
                    padding: "10px 16px",
                    background: "rgb(239, 68, 68)",
                    color: "white",
                    border: "none",
                    borderRadius: 6,
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
            background: "rgb(239, 221, 201)",
            padding: 20,
            borderRadius: 12,
            boxShadow: "0 1px 3px rgba(15, 23, 42, 0.08)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <h3>Lista de insumos</h3>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  color: "rgb(120, 53, 15)",
                }}
              >
                <span>{showActiveOnly ? "Ativos" : "Inativos"}</span>
                <button
                  type="button"
                  onClick={() => {
                    setShowActiveOnly((prev) => !prev);
                    setSelectedItems(new Set());
                  }}
                  aria-label={
                    showActiveOnly ? "Filtro em ativos" : "Filtro em inativos"
                  }
                  style={{
                    width: 46,
                    height: 26,
                    borderRadius: 13,
                    border: "none",
                    cursor: "pointer",
                    background: showActiveOnly
                      ? "rgb(34, 197, 94)"
                      : "rgb(156, 163, 175)",
                    position: "relative",
                    padding: 0,
                  }}
                >
                  <span
                    style={{
                      position: "absolute",
                      top: 3,
                      left: showActiveOnly ? 23 : 3,
                      width: 20,
                      height: 20,
                      borderRadius: "50%",
                      background: "white",
                      transition: "left 0.2s ease",
                    }}
                  />
                </button>
              </label>
              <button
                type="button"
                onClick={editSelected}
                disabled={selectedItems.size !== 1}
                style={{
                  padding: "8px 16px",
                  background: selectedItems.size === 1 ? "rgb(167, 117, 75)" : "rgb(200, 200, 200)",
                  color: "white",
                  border: "none",
                  borderRadius: 6,
                  cursor: selectedItems.size === 1 ? "pointer" : "not-allowed",
                }}
              >
                Editar
              </button>
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <input
              type="text"
              placeholder="Buscar insumo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: "100%",
                padding: 10,
                border: "1px solid rgb(167, 117, 75)",
                borderRadius: 6,
                background: "rgb(255, 255, 255)",
              }}
            />
          </div>

          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th
                  style={{
                    padding: 12,
                    textAlign: "center",
                    color: "rgb(167, 117, 75)",
                  }}
                >
                  Status
                </th>
                <th
                  style={{
                    padding: 12,
                    textAlign: "center",
                    color: "rgb(167, 117, 75)",
                  }}
                >
                  Selecionar
                </th>
                <th
                  style={{
                    padding: 12,
                    textAlign: "center",
                    color: "rgb(167, 117, 75)",
                  }}
                >
                  Insumo
                </th>
                <th
                  style={{
                    padding: 12,
                    textAlign: "center",
                    color: "rgb(167, 117, 75)",
                  }}
                >
                  Unidade
                </th>
                <th
                  style={{
                    padding: 12,
                    textAlign: "center",
                    color: "rgb(167, 117, 75)",
                  }}
                >
                  Custo compra
                </th>
                <th
                  style={{
                    padding: 12,
                    textAlign: "center",
                    color: "rgb(167, 117, 75)",
                  }}
                >
                  Qtd comprada
                </th>
                <th
                  style={{
                    padding: 12,
                    textAlign: "center",
                    color: "rgb(167, 117, 75)",
                  }}
                >
                  Custo unitário
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredInsumos.map((item) => (
                <tr key={item.id}>
                  <td
                    style={{
                      padding: 12,
                      borderTop: "1px solid rgb(167, 117, 75)",
                      textAlign: "center",
                    }}
                  >
                    {(item.active ?? true) ? "Ativo" : "Inativo"}
                  </td>
                  <td
                    style={{
                      padding: 15,
                      borderTop: "1px solid rgb(167, 117, 75)",
                      textAlign: "center",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={selectedItems.has(item.id)}
                      onChange={() => toggleSelect(item.id)}
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
                    {item.name}
                  </td>
                  <td
                    style={{
                      padding: 12,
                      borderTop: "1px solid rgb(167, 117, 75)",
                      textAlign: "center",
                    }}
                  >
                    {item.unit || "-"}
                  </td>
                  <td
                    style={{
                      padding: 12,
                      borderTop: "1px solid rgb(167, 117, 75)",
                      textAlign: "center",
                    }}
                  >
                    R$ {item.purchaseCost.toFixed(2)}
                  </td>
                  <td
                    style={{
                      padding: 12,
                      borderTop: "1px solid rgb(167, 117, 75)",
                      textAlign: "center",
                    }}
                  >
                    {item.purchasedQuantity}
                  </td>
                  <td
                    style={{
                      padding: 12,
                      borderTop: "1px solid rgb(167, 117, 75)",
                      textAlign: "center",
                    }}
                  >
                    R$ {item.unitCost.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
