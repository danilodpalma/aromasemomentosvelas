import { useEffect, useState } from "react";
import {
  formatCurrencyInput,
  parseCurrencyInput,
  sanitizeCurrencyInput,
} from "../lib/currency";

type Insumo = {
  id: number;
  name: string;
  unit?: string | null;
  stock?: number;
  unitCost?: number;
};

type ItemRow = {
  insumoId: string;
  quantidade: string;
  unidade: string;
  custoUnitario: string;
  custoTotal: string;
};

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

export default function Compras() {
  const [insumos, setInsumos] = useState<Insumo[]>([]);
  const [form, setForm] = useState({
    data: "",
    tipoLancamento: "Despesa",
    categoria: "",
    descricao: "",
    valor: "",
    status: "Aprovado",
  });
  const [itens, setItens] = useState<ItemRow[]>([
    {
      insumoId: "",
      quantidade: "",
      unidade: "",
      custoUnitario: "",
      custoTotal: "",
    },
  ]);
  const [compras, setCompras] = useState<Compra[]>([]);
  const [purchaseTypes, setPurchaseTypes] = useState<Parameter[]>([]);
  const [purchaseStatuses, setPurchaseStatuses] = useState<Parameter[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [message, setMessage] = useState("");
  const isFormEditable = isCreating || editingId !== null;
  const expenseTypeName =
    purchaseTypes.find((opt) => opt.name === "Despesa")?.name || "Despesa";
  const inventoryTypeName =
    purchaseTypes.find((opt) => opt.name === "Compra de Insumo")?.name ||
    "Compra de Insumo";
  const defaultStatusName =
    purchaseStatuses.find((opt) => opt.name === "Aprovado")?.name ||
    purchaseStatuses[0]?.name ||
    "Aprovado";
  const isInventoryPurchase = form.tipoLancamento === inventoryTypeName;

  useEffect(() => {
    async function load() {
      const [insumosRes, comprasRes, purchaseTypesRes, purchaseStatusesRes] =
        await Promise.all([
          fetch("/api/products"),
          fetch("/api/compras"),
          fetch("/api/productTypes?category=purchaseType"),
          fetch("/api/productTypes?category=purchaseStatus"),
        ]);

      const insumosData = await insumosRes.json();
      const comprasData = await comprasRes.json();
      const purchaseTypesData = await purchaseTypesRes.json();
      const purchaseStatusesData = await purchaseStatusesRes.json();

      setInsumos(Array.isArray(insumosData) ? insumosData : []);
      setCompras(Array.isArray(comprasData) ? comprasData : []);
      setPurchaseTypes(
        Array.isArray(purchaseTypesData) ? purchaseTypesData : [],
      );
      setPurchaseStatuses(
        Array.isArray(purchaseStatusesData) ? purchaseStatusesData : [],
      );

      setForm((previous) => ({
        ...previous,
        tipoLancamento:
          previous.tipoLancamento ||
          purchaseTypesData.find((opt: Parameter) => opt.name === "Despesa")
            ?.name ||
          "Despesa",
        status:
          previous.status ||
          purchaseStatusesData.find((opt: Parameter) => opt.name === "Aprovado")
            ?.name ||
          "Aprovado",
      }));
    }
    load();
  }, []);

  function updateItem(index: number, field: keyof ItemRow, value: string) {
    const next = [...itens];
    next[index] = { ...next[index], [field]: value } as ItemRow;
    if (field === "insumoId") {
      const insumo = insumos.find((item) => String(item.id) === value);
      next[index].unidade = insumo?.unit || "";
      if (insumo) {
        next[index].custoUnitario = formatCurrencyInput(
          insumo.unitCost || 0,
          3,
        );
      }
    }
    if (field === "quantidade" || field === "custoUnitario") {
      const quantidade = Number(next[index].quantidade || 0);
      const custoUnitario = Number(
        parseCurrencyInput(next[index].custoUnitario || "0"),
      );
      next[index].custoTotal = formatCurrencyInput(
        quantidade * custoUnitario,
        3,
      );
    }
    setItens(next);
  }

  function addItemRow() {
    setItens([
      ...itens,
      {
        insumoId: "",
        quantidade: "",
        unidade: "",
        custoUnitario: "",
        custoTotal: "",
      },
    ]);
  }

  function removeItemRow(index: number) {
    setItens(itens.filter((_, itemIndex) => itemIndex !== index));
  }

  function resetForm() {
    setEditingId(null);
    setIsCreating(false);
    setForm({
      data: "",
      tipoLancamento: expenseTypeName,
      categoria: "",
      descricao: "",
      valor: "",
      status: defaultStatusName,
    });
    setItens([
      {
        insumoId: "",
        quantidade: "",
        unidade: "",
        custoUnitario: "",
        custoTotal: "",
      },
    ]);
  }

  function startNew() {
    setIsCreating(true);
    setEditingId(null);
    setForm({
      data: "",
      tipoLancamento: expenseTypeName,
      categoria: "",
      descricao: "",
      valor: "",
      status: defaultStatusName,
    });
    setItens([
      {
        insumoId: "",
        quantidade: "",
        unidade: "",
        custoUnitario: "",
        custoTotal: "",
      },
    ]);
    setMessage("");
  }

  function startEdit(compra: Compra) {
    setIsCreating(true);
    setEditingId(compra.id);
    setForm({
      data: compra.data.split("T")[0],
      tipoLancamento: compra.tipoLancamento,
      categoria: compra.categoria || "",
      descricao: compra.descricao || "",
      valor: formatCurrencyInput(compra.valor, 3),
      status: compra.status,
    });
    setItens(
      (compra.itens || []).length > 0
        ? (compra.itens || []).map((item) => ({
            insumoId: item.insumoId ? String(item.insumoId) : "",
            quantidade: item.quantidade.toString(),
            unidade: item.unidade || "",
            custoUnitario: formatCurrencyInput(item.custoUnitario, 3),
            custoTotal: formatCurrencyInput(item.custoTotal, 3),
          }))
        : [
            {
              insumoId: "",
              quantidade: "",
              unidade: "",
              custoUnitario: "",
              custoTotal: "",
            },
          ],
    );
    setMessage("Edição ativa. Faça as alterações e salve.");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      ...form,
      valor: parseCurrencyInput(form.valor),
      itens: itens
        .filter((item) => item.insumoId)
        .map((item) => ({
          insumoId: Number(item.insumoId),
          quantidade: Number(item.quantidade || 0),
          unidade: item.unidade || undefined,
          custoUnitario: parseCurrencyInput(item.custoUnitario),
          custoTotal: parseCurrencyInput(item.custoTotal),
        })),
    };

    const url = editingId ? `/api/compras?id=${editingId}` : "/api/compras";
    const method = editingId ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) {
      setMessage(data.error || "Erro ao salvar compra.");
      return;
    }

    setMessage(
      editingId
        ? "Compra atualizada com sucesso."
        : "Compra registrada com sucesso.",
    );
    resetForm();
    const refreshed = await fetch("/api/compras");
    setCompras(await refreshed.json());
  }

  async function deleteCompra(id: number) {
    if (!confirm("Tem certeza que deseja excluir este lançamento?")) return;
    const res = await fetch(`/api/compras?id=${id}`, { method: "DELETE" });
    if (!res.ok) {
      setMessage("Erro ao excluir lançamento.");
      return;
    }
    setCompras((prev) => prev.filter((item) => item.id !== id));
    setMessage("Lançamento excluído com sucesso.");
  }

  return (
    <div>
      <h2 style={{ marginBottom: 6, color: "#6b3b12" }}>Compras e despesas</h2>
      <p style={{ marginTop: 0, color: "#8a5a2b" }}>
        Registre compras de insumos e despesas financeiras, com atualização
        automática do estoque quando a compra for aprovada.
      </p>

      {message ? (
        <div
          style={{
            marginBottom: 16,
            padding: 12,
            background: "#ecfdf5",
            border: "1px solid #a7f3d0",
          }}
        >
          {message}
        </div>
      ) : null}

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 20,
          marginTop: 20,
          maxWidth: 1120,
          marginLeft: "auto",
          marginRight: "auto",
        }}
      >
        <section
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
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 12,
            }}
          >
            <h3 style={{ margin: 0, color: "#6b3b12" }}>
              {isCreating ? "Novo lançamento" : "Lançamentos"}
            </h3>
            <button
              type="button"
              onClick={startNew}
              style={{
                padding: "8px 16px",
                background: "linear-gradient(135deg, #16a34a 0%, #15803d 100%)",
                color: "white",
                border: "none",
                borderRadius: 999,
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              + Novo
            </button>
          </div>

          <form onSubmit={handleSubmit} style={{ display: "grid", gap: 16 }}>
            <section
              style={{
                background: "linear-gradient(135deg, #f7e8d7 0%, #efd9c2 100%)",
                padding: 20,
                borderRadius: 14,
                boxShadow: "0 10px 24px rgba(92, 54, 24, 0.1)",
                border: "1px solid rgba(166, 116, 71, 0.2)",
              }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                  gap: 16,
                }}
              >
                <label style={{ display: "grid", gap: 6 }}>
                  <span>Data</span>
                  <input
                    type="date"
                    value={form.data}
                    onChange={(e) => setForm({ ...form, data: e.target.value })}
                    required
                    disabled={!isFormEditable}
                    style={{
                      padding: 8,
                      borderRadius: 8,
                      border: "1px solid rgb(167, 117, 75)",
                    }}
                  />
                </label>
                <label style={{ display: "grid", gap: 6 }}>
                  <span>Tipo de Lançamento</span>
                  <select
                    value={form.tipoLancamento}
                    onChange={(e) =>
                      setForm({ ...form, tipoLancamento: e.target.value })
                    }
                    disabled={!isFormEditable}
                    style={{
                      padding: 8,
                      borderRadius: 8,
                      border: "1px solid rgb(167, 117, 75)",
                    }}
                  >
                    {purchaseTypes.map((option) => (
                      <option key={option.id} value={option.name}>
                        {option.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label style={{ display: "grid", gap: 6 }}>
                  <span>Categoria</span>
                  <input
                    value={form.categoria}
                    onChange={(e) =>
                      setForm({ ...form, categoria: e.target.value })
                    }
                    placeholder="Ex.: Embalagem, Energia, Essência"
                    disabled={!isFormEditable}
                    style={{
                      padding: 8,
                      borderRadius: 8,
                      border: "1px solid rgb(167, 117, 75)",
                    }}
                  />
                </label>
                <label style={{ display: "grid", gap: 6 }}>
                  <span>Status</span>
                  <select
                    value={form.status}
                    onChange={(e) =>
                      setForm({ ...form, status: e.target.value })
                    }
                    disabled={!isFormEditable}
                    style={{
                      padding: 8,
                      borderRadius: 8,
                      border: "1px solid rgb(167, 117, 75)",
                    }}
                  >
                    {purchaseStatuses.map((option) => (
                      <option key={option.id} value={option.name}>
                        {option.name}
                      </option>
                    ))}
                  </select>
                </label>
                {form.tipoLancamento === expenseTypeName ? (
                  <label style={{ display: "grid", gap: 6 }}>
                    <span>Valor</span>
                    <input
                      value={form.valor}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          valor: sanitizeCurrencyInput(e.target.value),
                        })
                      }
                      placeholder="0,00"
                      disabled={!isFormEditable}
                      style={{
                        padding: 8,
                        borderRadius: 8,
                        border: "1px solid rgb(167, 117, 75)",
                      }}
                    />
                  </label>
                ) : null}
                <label
                  style={{ display: "grid", gap: 6, gridColumn: "1 / -1" }}
                >
                  <span>Descrição</span>
                  <textarea
                    value={form.descricao}
                    onChange={(e) =>
                      setForm({ ...form, descricao: e.target.value })
                    }
                    rows={3}
                    disabled={!isFormEditable}
                    style={{
                      padding: 8,
                      borderRadius: 8,
                      border: "1px solid rgb(167, 117, 75)",
                    }}
                  />
                </label>
              </div>
            </section>

            {isInventoryPurchase ? (
              <section
                style={{
                  background: "white",
                  padding: 20,
                  borderRadius: 14,
                  border: "1px solid rgba(166, 116, 71, 0.2)",
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
                  <h3 style={{ margin: 0, color: "#6b3b12" }}>
                    Itens da compra
                  </h3>
                  <button
                    type="button"
                    onClick={addItemRow}
                    disabled={!isFormEditable}
                    style={{
                      padding: "8px 12px",
                      background: "rgb(167, 117, 75)",
                      color: "white",
                      border: "none",
                      borderRadius: 8,
                      cursor: "pointer",
                    }}
                  >
                    + Adicionar item
                  </button>
                </div>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ background: "rgba(167, 117, 75, 0.08)" }}>
                        <th style={{ padding: 8, textAlign: "left" }}>
                          Insumo
                        </th>
                        <th style={{ padding: 8, textAlign: "left" }}>
                          Quantidade
                        </th>
                        <th style={{ padding: 8, textAlign: "left" }}>
                          Unidade
                        </th>
                        <th style={{ padding: 8, textAlign: "left" }}>
                          Custo Unitário
                        </th>
                        <th style={{ padding: 8, textAlign: "left" }}>
                          Custo Total
                        </th>
                        <th style={{ padding: 8, textAlign: "left" }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {itens.map((item, index) => (
                        <tr key={index}>
                          <td style={{ padding: 8 }}>
                            <select
                              value={item.insumoId}
                              onChange={(e) =>
                                updateItem(index, "insumoId", e.target.value)
                              }
                              disabled={!isFormEditable}
                              style={{
                                width: "100%",
                                padding: 8,
                                borderRadius: 8,
                                border: "1px solid rgb(167, 117, 75)",
                              }}
                            >
                              <option value="">Selecione</option>
                              {insumos.map((insumo) => (
                                <option key={insumo.id} value={insumo.id}>
                                  {insumo.name}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td style={{ padding: 8 }}>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={item.quantidade}
                              onChange={(e) =>
                                updateItem(index, "quantidade", e.target.value)
                              }
                              disabled={!isFormEditable}
                              style={{
                                width: "100%",
                                padding: 8,
                                borderRadius: 8,
                                border: "1px solid rgb(167, 117, 75)",
                              }}
                            />
                          </td>
                          <td style={{ padding: 8 }}>
                            <input
                              value={item.unidade}
                              onChange={(e) =>
                                updateItem(index, "unidade", e.target.value)
                              }
                              placeholder="kg/ml/un"
                              disabled={!isFormEditable}
                              style={{
                                width: "100%",
                                padding: 8,
                                borderRadius: 8,
                                border: "1px solid rgb(167, 117, 75)",
                              }}
                            />
                          </td>
                          <td style={{ padding: 8 }}>
                            <input
                              value={item.custoUnitario}
                              onChange={(e) =>
                                updateItem(
                                  index,
                                  "custoUnitario",
                                  e.target.value,
                                )
                              }
                              placeholder="0,00"
                              disabled={!isFormEditable}
                              style={{
                                width: "100%",
                                padding: 8,
                                borderRadius: 8,
                                border: "1px solid rgb(167, 117, 75)",
                              }}
                            />
                          </td>
                          <td style={{ padding: 8 }}>
                            <input
                              value={item.custoTotal}
                              readOnly
                              style={{
                                width: "100%",
                                padding: 8,
                                borderRadius: 8,
                                border: "1px solid rgb(167, 117, 75)",
                                background: "#f9fafb",
                              }}
                            />
                          </td>
                          <td style={{ padding: 8 }}>
                            <button
                              type="button"
                              onClick={() => removeItemRow(index)}
                              disabled={!isFormEditable}
                              style={{
                                padding: "8px 10px",
                                background: "#ef4444",
                                color: "white",
                                border: "none",
                                borderRadius: 8,
                                cursor: "pointer",
                              }}
                            >
                              Remover
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            ) : null}

            <div
              style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}
            >
              <button
                type="button"
                onClick={resetForm}
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
              <button
                type="submit"
                disabled={!isFormEditable}
                style={{
                  padding: "10px 18px",
                  background: "rgb(167, 117, 75)",
                  color: "white",
                  border: "none",
                  borderRadius: 8,
                  cursor: "pointer",
                }}
              >
                {editingId ? "Salvar alterações" : "Salvar lançamento"}
              </button>
            </div>
          </form>
        </section>
      </div>

      <section
        style={{
          marginTop: 24,
          background: "white",
          padding: 20,
          borderRadius: 14,
          border: "1px solid rgba(166, 116, 71, 0.2)",
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
          <h3 style={{ margin: 0, color: "#6b3b12" }}>
            Lançamentos cadastrados
          </h3>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead style={{ background: "rgba(167, 117, 75, 0.08)" }}>
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
                        borderTop: "1px solid rgba(167, 117, 75, 0.12)",
                      }}
                    >
                      {new Date(compra.data).toLocaleDateString("pt-BR")}
                    </td>
                    <td
                      style={{
                        padding: 8,
                        borderTop: "1px solid rgba(167, 117, 75, 0.12)",
                      }}
                    >
                      {compra.tipoLancamento}
                    </td>
                    <td
                      style={{
                        padding: 8,
                        borderTop: "1px solid rgba(167, 117, 75, 0.12)",
                      }}
                    >
                      {compra.categoria || "-"}
                    </td>
                    <td
                      style={{
                        padding: 8,
                        borderTop: "1px solid rgba(167, 117, 75, 0.12)",
                      }}
                    >
                      {compra.status}
                    </td>
                    <td
                      style={{
                        padding: 8,
                        borderTop: "1px solid rgba(167, 117, 75, 0.12)",
                      }}
                    >
                      R$ {compra.valor.toFixed(2)}
                    </td>
                    <td
                      style={{
                        padding: 8,
                        borderTop: "1px solid rgba(167, 117, 75, 0.12)",
                      }}
                    >
                      {compra.itens
                        ?.map((item) => item.insumo?.name || "Item")
                        .join(", ") || "-"}
                    </td>
                    <td
                      style={{
                        padding: 8,
                        borderTop: "1px solid rgba(167, 117, 75, 0.12)",
                      }}
                    >
                      <div style={{ display: "flex", gap: 8 }}>
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
                        <button
                          type="button"
                          onClick={() => deleteCompra(compra.id)}
                          style={{
                            padding: "6px 10px",
                            background: "#dc2626",
                            color: "white",
                            border: "none",
                            borderRadius: 6,
                            cursor: "pointer",
                          }}
                        >
                          Excluir
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
