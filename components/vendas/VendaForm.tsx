// components/vendas/VendaForm.tsx
import { RefObject } from "react";
import {
  formatCurrencyInput,
  parseCurrencyInput,
  sanitizeCurrencyInput,
} from "../../lib/currency";
import { COLORS } from "../../styles/theme";

export type VendaItemForm = {
  modeloVela: string;
  quantidade: string;
  precoUnitario: string;
  observacao: string;
};

export type VendaFormState = {
  dataVenda: string;
  cliente: string;
  formaPagamento: string;
  status: string;
  observacao: string;
  desconto: string;
  observacaoDesconto: string;
  itens: VendaItemForm[];
};

type Modelo = { id: number; nome: string };
type Parameter = { id: number; name: string; category: string };

type Props = {
  formMode: "idle" | "new" | "edit";
  editingId: number | null;
  form: VendaFormState;
  setForm: React.Dispatch<React.SetStateAction<VendaFormState>>;
  modelos: Modelo[];
  paymentMethods: Parameter[];
  saleStatuses: Parameter[];
  dataVendaInputRef: RefObject<HTMLInputElement>;
  onSubmit: (event: React.FormEvent) => void;
  onStartNew: () => void;
  onCancel: () => void;
};

export default function VendaForm({
  formMode,
  editingId,
  form,
  setForm,
  modelos,
  paymentMethods,
  saleStatuses,
  dataVendaInputRef,
  onSubmit,
  onStartNew,
  onCancel,
}: Props) {
  const subtotalPedido = form.itens.reduce((sum, item) => {
    const quantidade = Number(item.quantidade || 0);
    const precoUnitario = Number(parseCurrencyInput(item.precoUnitario || "0"));
    return sum + quantidade * precoUnitario;
  }, 0);
  const descontoPedido = Number(parseCurrencyInput(form.desconto || "0"));
  const totalPedido = Math.max(subtotalPedido - descontoPedido, 0);

  return (
    <div
      style={{
        background: `linear-gradient(135deg, ${COLORS.cardGradientFrom} 0%, ${COLORS.cardGradientTo} 100%)`,
        padding: 15,
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
          flexWrap: "wrap",
        }}
      >
        <h3 style={{ margin: 0 }}>
          {formMode === "edit" ? "Editar venda" : "Nova venda"}
        </h3>
        <button
          type="button"
          onClick={onStartNew}
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
      </div>

      <form onSubmit={onSubmit}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(110px, 1fr) minmax(0, 6fr)",
            gap: 12,
            marginTop: 16,
          }}
        >
          <label style={{ display: "block" }}>
            Data da Venda
            <input
              ref={dataVendaInputRef}
              type="date"
              required
              disabled={formMode === "idle"}
              value={form.dataVenda}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, dataVenda: e.target.value }))
              }
              style={{
                width: "100%",
                marginTop: 6,
                padding: 8,
                background:
                  formMode === "idle" ? COLORS.grayLight : COLORS.white,
                border: "1px solid rgb(167, 117, 75)",
                borderRadius: 6,
                textAlign: "left",
              }}
            />
          </label>

          <label style={{ display: "block" }}>
            Cliente
            <input
              required
              disabled={formMode === "idle"}
              value={form.cliente}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, cliente: e.target.value }))
              }
              style={{
                width: "100%",
                marginTop: 6,
                padding: 8,
                background:
                  formMode === "idle" ? COLORS.grayLight : COLORS.white,
                border: "1px solid rgb(167, 117, 75)",
                borderRadius: 6,
                textAlign: "left",
              }}
            />
          </label>
        </div>

        <div
          style={{
            marginTop: 18,
            padding: 14,
            border: "1px solid rgba(167, 117, 75, 0.35)",
            borderRadius: 12,
            background: "rgba(255,255,255,0.35)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 8,
              marginBottom: 12,
              flexWrap: "wrap",
            }}
          >
            <h4 style={{ margin: 0 }}>Itens da venda</h4>
            <button
              type="button"
              disabled={formMode === "idle"}
              onClick={() =>
                setForm((prev) => ({
                  ...prev,
                  itens: [
                    ...prev.itens,
                    {
                      modeloVela: "",
                      quantidade: "",
                      precoUnitario: "",
                      observacao: "",
                    },
                  ],
                }))
              }
              style={{
                padding: "8px 12px",
                background: formMode === "idle" ? COLORS.gray : "#16a34a",
                color: "white",
                border: "none",
                borderRadius: 8,
                cursor: formMode === "idle" ? "not-allowed" : "pointer",
              }}
            >
              + Adicionar item
            </button>
          </div>

          {form.itens.map((item, index) => (
            <div
              key={`${item.modeloVela}-${index}`}
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
                gap: 10,
                padding: 10,
                marginBottom: 10,
                border: "1px solid rgba(167, 117, 75, 0.25)",
                borderRadius: 10,
                background: "rgba(255,255,255,0.55)",
              }}
            >
              <label style={{ display: "block" }}>
                Produto
                <select
                  required={formMode !== "idle"}
                  disabled={formMode === "idle"}
                  value={item.modeloVela}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      itens: prev.itens.map((row, rowIndex) =>
                        rowIndex === index
                          ? { ...row, modeloVela: e.target.value }
                          : row,
                      ),
                    }))
                  }
                  style={{
                    width: "100%",
                    marginTop: 6,
                    padding: 8,
                    border: "1px solid rgb(167, 117, 75)",
                    borderRadius: 6,
                    background:
                      formMode === "idle" ? COLORS.grayLight : COLORS.white,
                  }}
                >
                  <option value="">Escolha</option>
                  {modelos.map((modelo) => (
                    <option key={modelo.id} value={modelo.nome}>
                      {modelo.nome}
                    </option>
                  ))}
                </select>
              </label>

              <label style={{ display: "block" }}>
                Quantidade
                <input
                  type="number"
                  min="1"
                  required={formMode !== "idle"}
                  disabled={formMode === "idle"}
                  value={item.quantidade}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      itens: prev.itens.map((row, rowIndex) =>
                        rowIndex === index
                          ? { ...row, quantidade: e.target.value }
                          : row,
                      ),
                    }))
                  }
                  style={{
                    width: "100%",
                    marginTop: 6,
                    padding: 8,
                    border: "1px solid rgb(167, 117, 75)",
                    borderRadius: 6,
                    background:
                      formMode === "idle" ? COLORS.grayLight : COLORS.white,
                  }}
                />
              </label>

              <label style={{ display: "block" }}>
                Valor unitário
                <input
                  type="text"
                  required={formMode !== "idle"}
                  disabled={formMode === "idle"}
                  value={item.precoUnitario}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      itens: prev.itens.map((row, rowIndex) =>
                        rowIndex === index
                          ? {
                              ...row,
                              precoUnitario: sanitizeCurrencyInput(
                                e.target.value,
                              ),
                            }
                          : row,
                      ),
                    }))
                  }
                  onBlur={() =>
                    setForm((prev) => ({
                      ...prev,
                      itens: prev.itens.map((row, rowIndex) =>
                        rowIndex === index
                          ? {
                              ...row,
                              precoUnitario: row.precoUnitario
                                ? formatCurrencyInput(row.precoUnitario, 2)
                                : "",
                            }
                          : row,
                      ),
                    }))
                  }
                  style={{
                    width: "100%",
                    marginTop: 6,
                    padding: 8,
                    border: "1px solid rgb(167, 117, 75)",
                    borderRadius: 6,
                    background:
                      formMode === "idle" ? COLORS.grayLight : COLORS.white,
                  }}
                />
              </label>

              <label style={{ display: "block" }}>
                Observação
                <input
                  disabled={formMode === "idle"}
                  value={item.observacao}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      itens: prev.itens.map((row, rowIndex) =>
                        rowIndex === index
                          ? { ...row, observacao: e.target.value }
                          : row,
                      ),
                    }))
                  }
                  style={{
                    width: "100%",
                    marginTop: 6,
                    padding: 8,
                    border: "1px solid rgb(167, 117, 75)",
                    borderRadius: 6,
                    background:
                      formMode === "idle" ? COLORS.grayLight : COLORS.white,
                  }}
                />
              </label>

              {form.itens.length > 1 && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "end",
                    justifyContent: "center",
                  }}
                >
                  <button
                    type="button"
                    disabled={formMode === "idle"}
                    onClick={() =>
                      setForm((prev) => ({
                        ...prev,
                        itens: prev.itens.filter(
                          (_, rowIndex) => rowIndex !== index,
                        ),
                      }))
                    }
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      background:
                        formMode === "idle" ? COLORS.gray : COLORS.dangerLight,
                      color: "white",
                      border: "none",
                      borderRadius: 8,
                      cursor: formMode === "idle" ? "not-allowed" : "pointer",
                    }}
                  >
                    Remover
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: 12,
            marginTop: 12,
            alignItems: "end",
          }}
        >
          <label style={{ display: "block" }}>
            Desconto
            <input
              type="text"
              disabled={formMode === "idle"}
              value={form.desconto}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  desconto: sanitizeCurrencyInput(e.target.value),
                }))
              }
              onBlur={() =>
                setForm((prev) => ({
                  ...prev,
                  desconto: prev.desconto
                    ? formatCurrencyInput(prev.desconto, 2)
                    : "0.00",
                }))
              }
              style={{
                width: "100%",
                marginTop: 6,
                padding: 8,
                background:
                  formMode === "idle" ? COLORS.grayLight : COLORS.white,
                border: "1px solid rgb(167, 117, 75)",
                borderRadius: 6,
                textAlign: "left",
              }}
            />
          </label>

          <label style={{ display: "block" }}>
            Obs. do desconto
            <input
              disabled={formMode === "idle"}
              value={form.observacaoDesconto}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  observacaoDesconto: e.target.value,
                }))
              }
              style={{
                width: "100%",
                marginTop: 6,
                padding: 8,
                background:
                  formMode === "idle" ? COLORS.grayLight : COLORS.white,
                border: "1px solid rgb(167, 117, 75)",
                borderRadius: 6,
                textAlign: "left",
              }}
            />
          </label>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              minHeight: 48,
              padding: "8px 16px",
              border: "1px solid rgb(167, 117, 75)",
              borderRadius: 8,
              background: "rgba(255,255,255,0.7)",
              fontWeight: 700,
            }}
          >
            Total pedido: R$ {totalPedido.toFixed(2)}
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 12,
            marginTop: 16,
          }}
        >
          <label style={{ display: "block" }}>
            Forma de Pagamento
            <select
              required
              disabled={formMode === "idle"}
              value={form.formaPagamento}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, formaPagamento: e.target.value }))
              }
              style={{
                width: "100%",
                marginTop: 6,
                padding: 8,
                background:
                  formMode === "idle" ? COLORS.grayLight : COLORS.white,
                border: "1px solid rgb(167, 117, 75)",
                borderRadius: 6,
                textAlign: "left",
              }}
            >
              <option value="">Escolha</option>
              {paymentMethods.map((opt) => (
                <option key={opt.id} value={opt.name}>
                  {opt.name}
                </option>
              ))}
              {!paymentMethods.some(
                (method) => method.name.trim().toLowerCase() === "consignação",
              ) && <option value="Consignação">Consignação</option>}
            </select>
          </label>

          <label style={{ display: "block" }}>
            Status
            <select
              required
              disabled={formMode === "idle"}
              value={form.status}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, status: e.target.value }))
              }
              style={{
                width: "100%",
                marginTop: 6,
                padding: 8,
                background:
                  formMode === "idle" ? COLORS.grayLight : COLORS.white,
                border: "1px solid rgb(167, 117, 75)",
                borderRadius: 6,
                textAlign: "left",
              }}
            >
              <option value="">Escolha</option>
              {saleStatuses.map((opt) => (
                <option key={opt.id} value={opt.name}>
                  {opt.name}
                </option>
              ))}
            </select>
          </label>

          <label style={{ display: "block" }}>
            Observação
            <input
              disabled={formMode === "idle"}
              value={form.observacao}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, observacao: e.target.value }))
              }
              style={{
                width: "100%",
                marginTop: 6,
                padding: 8,
                background:
                  formMode === "idle" ? COLORS.grayLight : COLORS.white,
                border: "1px solid rgb(167, 117, 75)",
                borderRadius: 6,
                textAlign: "left",
              }}
            />
          </label>
        </div>

        <div
          style={{
            display: "flex",
            gap: 12,
            marginTop: 16,
            flexWrap: "wrap",
          }}
        >
          <button
            type="submit"
            disabled={formMode === "idle" || form.itens.length === 0}
            style={{
              padding: "10px 16px",
              background: formMode === "idle" ? "#a78b58" : COLORS.primary,
              color: "white",
              border: "none",
              borderRadius: 6,
              cursor: formMode === "idle" ? "not-allowed" : "pointer",
            }}
          >
            {editingId ? "Atualizar venda" : "Registrar venda"}
          </button>
          {formMode !== "idle" && (
            <button
              type="button"
              onClick={onCancel}
              style={{
                padding: "10px 16px",
                background: COLORS.cancelButtonBackground,
                color: "white",
                border: "none",
                borderRadius: 6,
                cursor: "pointer",
                fontWeight: 600,
                height: 40,
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
