// components/compras/CompraForm.tsx
import { sanitizeCurrencyInput } from "../../lib/currency";
import { COLORS } from "../../styles/theme";

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

export type CompraFormState = {
  data: string;
  tipoLancamento: string;
  categoria: string;
  descricao: string;
  valor: string;
  status: string;
};

type Props = {
  isCreating: boolean;
  form: CompraFormState;
  setForm: React.Dispatch<React.SetStateAction<CompraFormState>>;
  isFormEditable: boolean;
  purchaseTypes: Parameter[];
  purchaseStatuses: Parameter[];
  expenseTypeName: string;
  isInventoryPurchase: boolean;
  itens: ItemRow[];
  updateItem: (index: number, field: keyof ItemRow, value: string) => void;
  addItemRow: () => void;
  removeItemRow: (index: number) => void;
  insumos: Insumo[];
  handleSubmit: (event: React.FormEvent) => void;
  startNew: () => void;
  resetForm: () => void;
};

export default function CompraForm({
  isCreating,
  form,
  setForm,
  isFormEditable,
  purchaseTypes,
  purchaseStatuses,
  expenseTypeName,
  isInventoryPurchase,
  itens,
  updateItem,
  addItemRow,
  removeItemRow,
  insumos,
  handleSubmit,
  startNew,
  resetForm,
}: Props) {
  return (
    <section
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
            background: `linear-gradient(135deg, ${COLORS.cardGradientFrom} 0%, ${COLORS.cardGradientTo} 100%)`,
            padding: 20,
            borderRadius: 14,
            boxShadow: COLORS.cardShadow,
            border: COLORS.cardBorder,
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
                onChange={(e) => setForm({ ...form, status: e.target.value })}
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
            <label style={{ display: "grid", gap: 6, gridColumn: "1 / -1" }}>
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
                Itens da compra
              </h3>
              <button
                type="button"
                onClick={addItemRow}
                disabled={!isFormEditable}
                style={{
                  padding: "8px 12px",
                  background: COLORS.primary,
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
                  <tr style={{ background: COLORS.primarySoftAlt }}>
                    <th style={{ padding: 8, textAlign: "left" }}>Insumo</th>
                    <th style={{ padding: 8, textAlign: "left" }}>
                      Quantidade
                    </th>
                    <th style={{ padding: 8, textAlign: "left" }}>Unidade</th>
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
                            updateItem(index, "custoUnitario", e.target.value)
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
                            background: COLORS.dangerLight,
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

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <button
            type="button"
            onClick={resetForm}
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
          <button
            type="submit"
            disabled={!isFormEditable}
            style={{
              padding: "10px 18px",
              background: COLORS.primary,
              color: "white",
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
            }}
          >
            {!isCreating ? "Salvar alterações" : "Salvar lançamento"}
          </button>
        </div>
      </form>
    </section>
  );
}
