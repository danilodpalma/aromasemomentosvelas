import { RefObject } from "react";
import { formatCurrencyInput, sanitizeCurrencyInput } from "../../lib/currency";
import { COLORS } from "../../styles/theme";

export type InsumoFormState = {
  name: string;
  unit: string;
  productTypes: string[];
  purchaseCost: string;
  purchasedQuantity: string;
  description: string;
  active: boolean;
  isBase: boolean;
};

type Parameter = {
  id: number;
  name: string;
  category: string;
};

type Props = {
  formMode: "create" | "edit" | "idle";
  editingId: number | null;
  form: InsumoFormState;
  setForm: React.Dispatch<React.SetStateAction<InsumoFormState>>;
  unitOptions: Parameter[];
  productTypeOptions: Parameter[];
  nameInputRef: RefObject<HTMLInputElement>;
  onSubmit: (event: React.FormEvent) => void;
  onStartNew: () => void;
  onCancel: () => void;
};

export default function InsumoForm({
  formMode,
  editingId,
  form,
  setForm,
  unitOptions,
  productTypeOptions,
  nameInputRef,
  onSubmit,
  onStartNew,
  onCancel,
}: Props) {
  return (
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
          marginBottom: 12,
        }}
      >
        <h3 style={{ margin: 0, color: COLORS.primaryDark }}>
          {editingId ? "Editar insumo" : "Novo insumo"}
        </h3>
        <button
          type="button"
          onClick={onStartNew}
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
      <form onSubmit={onSubmit}>
        <label style={{ display: "block", marginBottom: 12 }}>
          Nome do Insumo
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
              background: COLORS.white,
              borderColor: COLORS.primary,
              borderWidth: 1,
              borderStyle: "solid",
              borderRadius: 6,
            }}
          />
        </label>
        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 12,
          }}
        >
          <input
            type="checkbox"
            disabled={formMode === "idle"}
            checked={Boolean(form.isBase)}
            onChange={(e) => setForm({ ...form, isBase: e.target.checked })}
          />
          <span>Base</span>
        </label>

        <label style={{ display: "block", marginBottom: 12 }}>
          Unidade
          <select
            disabled={formMode === "idle"}
            value={form.unit}
            onChange={(e) => setForm({ ...form, unit: e.target.value })}
            style={{
              width: "100%",
              marginTop: 6,
              padding: 8,
              background: COLORS.white,
              borderColor: COLORS.primary,
              borderWidth: 1,
              borderStyle: "solid",
              borderRadius: 6,
            }}
          >
            <option value="">Escolha a unidade</option>
            {(Array.isArray(unitOptions) ? unitOptions : []).map((option) => (
              <option key={option.id} value={option.name}>
                {option.name}
              </option>
            ))}
          </select>
        </label>
        <label style={{ display: "block", marginBottom: 12 }}>
          Tipo de produto aplicável
          <div
            style={{
              marginTop: 8,
              display: "grid",
              gap: 8,
              padding: 10,
              border: "1px solid rgba(167, 117, 75, 0.25)",
              borderRadius: 8,
              background: "rgba(255, 255, 255, 0.7)",
            }}
          >
            {(Array.isArray(productTypeOptions) ? productTypeOptions : [])
              .length === 0 && (
              <span style={{ color: "#889", fontSize: "0.95em" }}>
                Nenhum tipo de produto cadastrado.
              </span>
            )}

            {(Array.isArray(productTypeOptions) ? productTypeOptions : []).map(
              (option) => {
                const checked =
                  Array.isArray(form.productTypes) &&
                  form.productTypes.includes(option.name);

                return (
                  <label
                    key={option.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "8px 10px",
                      background: checked
                        ? COLORS.primarySoftAlt
                        : "transparent",
                      borderRadius: 6,
                      cursor: formMode === "idle" ? "not-allowed" : "pointer",
                      color: formMode === "idle" ? "#8a8a8a" : "inherit",
                    }}
                  >
                    <input
                      type="checkbox"
                      disabled={formMode === "idle"}
                      checked={checked}
                      onChange={() => {
                        const value = option.name;
                        setForm((prev) => {
                          const current = Array.isArray(prev.productTypes)
                            ? prev.productTypes
                            : [];
                          return {
                            ...prev,
                            productTypes: current.includes(value)
                              ? current.filter((t: string) => t !== value)
                              : [...current, value],
                          };
                        });
                      }}
                    />
                    <span style={{ fontSize: "0.95em" }}>{option.name}</span>
                  </label>
                );
              },
            )}
          </div>
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
                  ? formatCurrencyInput(prev.purchaseCost, 3)
                  : "",
              }))
            }
            style={{
              width: "100%",
              marginTop: 5,
              padding: 8,
              background: COLORS.white,
              borderColor: COLORS.primary,
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
              background: COLORS.white,
              borderColor: COLORS.primary,
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
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            style={{
              width: "100%",
              marginTop: 6,
              padding: 8,
              background: COLORS.white,
              borderColor: COLORS.primary,
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
                    ? COLORS.success
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
                  ? COLORS.gray
                  : "linear-gradient(135deg, #a76f4b 0%, #8c5331 100%)",
              color: "white",
              border: "none",
              borderRadius: 999,
              cursor: formMode === "idle" ? "not-allowed" : "pointer",
              fontWeight: 600,
            }}
          >
            {editingId ? "Atualizar insumo" : "Salvar insumo"}
          </button>
          {(formMode === "create" || formMode === "edit") && (
            <button
              type="button"
              onClick={onCancel}
              style={{
                padding: "10px 16px",
                background: COLORS.dangerLight,
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
  );
}
