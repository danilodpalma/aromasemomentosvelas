import { useEffect, useState, type FormEvent } from "react";
import { useAuth } from "../context";
import { authFetch } from "../lib/apiClient";
import { COLORS } from "../styles/theme";
import {
  PAYMENT_GROUPS,
  inferPaymentGroup,
  paymentGroupLabel,
  type PaymentGroup,
} from "../lib/vendas";

type Parameter = {
  id: number;
  name: string;
  category:
    | "productType"
    | "unit"
    | "paymentMethod"
    | "saleStatus"
    | "purchaseStatus"
    | "purchaseType"
    | "netWithdrawalPercent"
    | "marginGreenPercent"
    | "marginYellowPercent";
  paymentGroup?: PaymentGroup | null;
};

/** Botões de ação no mesmo padrão da tabela de Vendas (Editar / Excluir). */
const actionButtonStyle: React.CSSProperties = {
  padding: "5px 8px",
  color: "white",
  border: "none",
  borderRadius: 6,
  cursor: "pointer",
};

const SINGLE_VALUE_CATEGORIES: Parameter["category"][] = [
  "netWithdrawalPercent",
  "marginGreenPercent",
  "marginYellowPercent",
];

export default function Parametros() {
  const { canEdit, canDelete } = useAuth();
  const [types, setTypes] = useState<Parameter[]>([]);
  const [name, setName] = useState("");
  const [category, setCategory] =
    useState<Parameter["category"]>("productType");
  const [paymentGroup, setPaymentGroup] = useState<PaymentGroup | "">("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [message, setMessage] = useState("");
  const isFormActive = isCreating || editingId !== null;
  // Valores em edição no quadro de faixas (null = mostrando os salvos).
  const [marginDraft, setMarginDraft] = useState<{
    green: string;
    yellow: string;
  } | null>(null);

  useEffect(() => {
    async function loadParameters() {
      try {
        const res = await authFetch("/api/productTypes");
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
          {
            category: "paymentMethod" as const,
            name: "A Receber",
            paymentGroup: "a_receber",
          },
          {
            category: "paymentMethod" as const,
            name: "Consignação",
            paymentGroup: "a_receber",
          },
          {
            category: "paymentMethod" as const,
            name: "Troca de Serviços",
            paymentGroup: "doacao",
          },
          { category: "netWithdrawalPercent" as const, name: "35" },
          { category: "marginGreenPercent" as const, name: "50" },
          { category: "marginYellowPercent" as const, name: "30" },
        ];

        // Categorias de valor único (percentuais): o padrão só é criado se a
        // categoria estiver vazia. Comparar pelo valor recriava o padrão depois
        // de uma edição (ex.: 50 → 60 fazia surgir outro "50").
        const missingDefaults = defaults.filter((entry) =>
          SINGLE_VALUE_CATEGORIES.includes(entry.category)
            ? !data.some((item: Parameter) => item.category === entry.category)
            : !data.some(
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
              authFetch("/api/productTypes", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  name: entry.name,
                  category: entry.category,
                  paymentGroup:
                    "paymentGroup" in entry ? entry.paymentGroup : undefined,
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
    if (!isFormActive) return;
    if (!name.trim()) return setMessage("Nome obrigatório.");
    if (category === "paymentMethod" && !paymentGroup) {
      return setMessage("Escolha o tipo da forma de pagamento.");
    }

    const url = editingId
      ? `/api/productTypes?id=${editingId}`
      : "/api/productTypes";
    const method = editingId ? "PATCH" : "POST";

    const res = await authFetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name.trim(),
        category,
        paymentGroup: category === "paymentMethod" ? paymentGroup : null,
      }),
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
      setPaymentGroup("");
      setEditingId(null);
      setIsCreating(false);
      setMessage("Salvo com sucesso.");
      requestAnimationFrame(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    } else {
      const err = await res.json();
      setMessage(err?.error || "Erro ao salvar.");
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Excluir esse parâmetro?")) return;
    const res = await authFetch(`/api/productTypes?id=${id}`, {
      method: "DELETE",
    });
    if (res.ok || res.status === 204) {
      setTypes((prev) => prev.filter((t) => t.id !== id));
      setMessage("Excluído.");
    } else {
      const data = await res.json().catch(() => ({}));
      setMessage(data.error || "Erro ao excluir.");
    }
  }

  function startEdit(t: Parameter) {
    setIsCreating(false);
    setEditingId(t.id);
    setName(t.name);
    setCategory(t.category);
    // Sem tipo salvo ainda: já sugere o tipo deduzido pelo nome.
    setPaymentGroup(t.paymentGroup ?? inferPaymentGroup(t.name) ?? "");
    setMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function startNew() {
    setEditingId(null);
    setName("");
    setCategory("productType");
    setPaymentGroup("");
    setIsCreating(true);
    setMessage("");
  }

  function cancelForm() {
    setEditingId(null);
    setName("");
    setCategory("productType");
    setPaymentGroup("");
    setIsCreating(false);
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
  const netWithdrawalPercent = safeTypes.filter(
    (t) => t.category === "netWithdrawalPercent",
  );
  const marginGreenPercent = safeTypes.filter(
    (t) => t.category === "marginGreenPercent",
  );
  const marginYellowPercent = safeTypes.filter(
    (t) => t.category === "marginYellowPercent",
  );

  const greenParam = marginGreenPercent[0];
  const yellowParam = marginYellowPercent[0];
  const greenValue = marginDraft?.green ?? greenParam?.name ?? "50";
  const yellowValue = marginDraft?.yellow ?? yellowParam?.name ?? "30";

  async function saveMarginBands() {
    const green = Number(greenValue.replace(",", "."));
    const yellow = Number(yellowValue.replace(",", "."));
    if (![green, yellow].every((v) => Number.isFinite(v) && v >= 0 && v <= 100)) {
      return setMessage("As faixas devem ser percentuais entre 0 e 100.");
    }
    if (yellow >= green) {
      return setMessage("O verde precisa ser maior que o amarelo.");
    }

    const entries = [
      { category: "marginGreenPercent" as const, param: greenParam, value: green },
      { category: "marginYellowPercent" as const, param: yellowParam, value: yellow },
    ];
    const saved: Parameter[] = [];
    for (const entry of entries) {
      const res = await authFetch(
        entry.param
          ? `/api/productTypes?id=${entry.param.id}`
          : "/api/productTypes",
        {
          method: entry.param ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: String(entry.value),
            category: entry.category,
          }),
        },
      );
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        return setMessage(err?.error || "Erro ao salvar as faixas.");
      }
      saved.push(await res.json());
    }

    setTypes((prev) => [
      ...prev.filter((t) => !saved.some((item) => item.id === t.id)),
      ...saved,
    ]);
    setMarginDraft(null);
    setMessage("Faixas da margem salvas.");
  }

  function renderMarginBands() {
    const rows = [
      { key: "green" as const, label: "🟢 Verde a partir de", value: greenValue },
      { key: "yellow" as const, label: "🟡 Amarelo a partir de", value: yellowValue },
    ];
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
        <h3
          style={{
            margin: "0 0 4px",
            color: COLORS.primaryDark,
            fontSize: 15,
          }}
        >
          Faixas da margem % (Dashboard)
        </h3>
        <p style={{ margin: "0 0 10px", color: COLORS.grayText, fontSize: 12 }}>
          Cores da Margem por produto. Abaixo do amarelo fica 🔴 vermelho.
        </p>
        <div style={{ display: "grid", gap: 8 }}>
          {rows.map((row) => (
            <div
              key={row.key}
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
              <span style={{ fontWeight: 600, color: COLORS.primaryDark }}>
                {row.label}
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <input
                  type="number"
                  min={0}
                  max={100}
                  disabled={!canEdit}
                  value={row.value}
                  onChange={(e) =>
                    setMarginDraft((prev) => ({
                      green: prev?.green ?? greenValue,
                      yellow: prev?.yellow ?? yellowValue,
                      [row.key]: e.target.value,
                    }))
                  }
                  style={{
                    width: 70,
                    padding: "6px 8px",
                    border: "1px solid rgb(166, 116, 71)",
                    borderRadius: 8,
                    textAlign: "right",
                    background: canEdit ? "#fff" : COLORS.grayLight,
                  }}
                />
                <strong>%</strong>
              </span>
            </div>
          ))}
        </div>
        {canEdit && (
          <button
            type="button"
            onClick={saveMarginBands}
            style={{
              ...actionButtonStyle,
              marginTop: 10,
              background: COLORS.primary,
            }}
          >
            Salvar faixas
          </button>
        )}
      </div>
    );
  }

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
        <h3
          style={{
            margin: "0 0 10px",
            color: COLORS.primaryDark,
            fontSize: 15,
          }}
        >
          {title}
        </h3>
        {items.length === 0 ? (
          <p style={{ margin: 0, color: COLORS.primaryDarkText }}>
            {emptyText}
          </p>
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
                <span style={{ fontWeight: 600, color: COLORS.primaryDark }}>
                  {t.name}
                  {t.category === "paymentMethod" && (
                    <span
                      style={{
                        display: "block",
                        marginTop: 2,
                        fontSize: 11,
                        fontWeight: 600,
                        color: t.paymentGroup ? COLORS.grayText : "#b91c1c",
                      }}
                    >
                      {t.paymentGroup
                        ? `Tipo: ${paymentGroupLabel(t.paymentGroup)}`
                        : `Sem tipo definido${
                            inferPaymentGroup(t.name)
                              ? ` · usando "${paymentGroupLabel(
                                  inferPaymentGroup(t.name),
                                )}" pelo nome`
                              : ""
                          }`}
                    </span>
                  )}
                </span>
                <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                  {canEdit && (
                    <button
                      type="button"
                      onClick={() => startEdit(t)}
                      style={{
                        ...actionButtonStyle,
                        background: COLORS.primary,
                      }}
                    >
                      Editar
                    </button>
                  )}
                  {canDelete && (
                    <button
                      type="button"
                      onClick={() => handleDelete(t.id)}
                      style={{
                        ...actionButtonStyle,
                        background: COLORS.dangerLight,
                      }}
                    >
                      Excluir
                    </button>
                  )}
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
            background: COLORS.successBg,
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
        }}
      >
        {canEdit && (
          <div
            style={{
              background: `linear-gradient(135deg, ${COLORS.cardGradientFrom} 0%, ${COLORS.cardGradientTo} 100%)`,
              padding: 18,
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
                gap: 12,
                marginBottom: 12,
                flexWrap: "wrap",
              }}
            >
              <h3 style={{ margin: 0, color: COLORS.primaryDark }}>
                {editingId
                  ? "Editar parâmetro"
                  : isCreating
                    ? "Novo parâmetro"
                    : "Parâmetros"}
              </h3>
              {!isFormActive && (
                <button
                  type="button"
                  onClick={startNew}
                  style={{
                    padding: "8px 16px",
                    background: COLORS.newButtonGradient,
                    color: "white",
                    border: "none",
                    borderRadius: 999,
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                >
                  + Novo
                </button>
              )}
            </div>
            <form onSubmit={handleSubmit}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                  gap: 12,
                }}
              >
                <label
                  style={{
                    display: "block",
                    fontWeight: 600,
                    color: COLORS.primaryDark,
                  }}
                >
                  Categoria do parâmetro
                  <select
                    disabled={!isFormActive}
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
                      background: isFormActive ? "#fff" : COLORS.grayLight,
                      fontSize: 13,
                    }}
                  >
                    <option value="productType">Tipo de produto</option>
                    <option value="unit">Unidade</option>
                    <option value="paymentMethod">Forma de pagamento</option>
                    <option value="saleStatus">Status da venda</option>
                    <option value="purchaseStatus">Status da compra</option>
                    <option value="purchaseType">Tipo de lançamento</option>
                    <option value="netWithdrawalPercent">
                      Percentual líquido a retirar (%)
                    </option>

                  </select>
                </label>
                <label
                  style={{
                    display: "block",
                    fontWeight: 600,
                    color: COLORS.primaryDark,
                  }}
                >
                  Nome do parâmetro
                  <input
                    disabled={!isFormActive}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={{
                      width: "100%",
                      marginTop: 6,
                      padding: "8px 10px",
                      border: "1px solid rgb(166, 116, 71)",
                      borderRadius: 8,
                      background: isFormActive ? "#fff" : COLORS.grayLight,
                      fontSize: 13,
                    }}
                  />
                </label>
                {category === "paymentMethod" && (
                  <label
                    style={{
                      display: "block",
                      fontWeight: 600,
                      color: COLORS.primaryDark,
                    }}
                  >
                    Tipo (para o resumo financeiro)
                    <select
                      disabled={!isFormActive}
                      value={paymentGroup}
                      onChange={(e) =>
                        setPaymentGroup(e.target.value as PaymentGroup | "")
                      }
                      style={{
                        width: "100%",
                        marginTop: 6,
                        padding: "8px 10px",
                        border: "1px solid rgb(166, 116, 71)",
                        borderRadius: 8,
                        background: isFormActive ? "#fff" : COLORS.grayLight,
                        fontSize: 13,
                      }}
                    >
                      <option value="">Escolha</option>
                      {PAYMENT_GROUPS.map((group) => (
                        <option key={group.value} value={group.value}>
                          {group.label}
                        </option>
                      ))}
                    </select>
                  </label>
                )}
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
                  disabled={!isFormActive}
                  style={{
                    padding: "10px 16px",
                    background: isFormActive ? COLORS.primary : "#a78b58",
                    color: "white",
                    border: "none",
                    borderRadius: 6,
                    cursor: isFormActive ? "pointer" : "not-allowed",
                  }}
                >
                  {editingId ? "Atualizar" : "Criar"}
                </button>
                {isFormActive && (
                  <button
                    type="button"
                    onClick={cancelForm}
                    style={{
                      padding: "10px 16px",
                      background: COLORS.cancelButtonBackground,
                      color: "white",
                      border: "none",
                      borderRadius: 6,
                      fontWeight: 600,
                      cursor: "pointer",
                      height: 40,
                    }}
                  >
                    Cancelar
                  </button>
                )}
              </div>
            </form>
          </div>
        )}

        <div
          style={{
            background: `linear-gradient(135deg, ${COLORS.cardGradientFrom} 0%, ${COLORS.cardGradientTo} 100%)`,
            padding: 18,
            borderRadius: 14,
            boxShadow: COLORS.cardShadow,
            border: COLORS.cardBorder,
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
            {renderParameterGroup(
              "Percentual líquido a retirar",
              "35% (padrão)",
              netWithdrawalPercent,
            )}
            {renderMarginBands()}
          </div>
        </div>
      </div>
    </div>
  );
}
