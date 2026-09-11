// components/vendas/VendaForm.tsx
import { RefObject } from "react";
import {
  formatCurrencyInput,
  sanitizeCurrencyInput,
} from "../../lib/currency";
import { COLORS } from "../../styles/theme";

export type VendaFormState = {
  dataVenda: string;
  cliente: string;
  modeloVela: string;
  quantidade: string;
  precoUnitario: string;
  formaPagamento: string;
  status: string;
  observacao: string;
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
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: 12,
          }}
        >
          <label style={{ display: "block" }}>
            Data Venda
            <input
              ref={dataVendaInputRef}
              type="date"
              required
              disabled={formMode === "idle"}
              value={form.dataVenda}
              onChange={(e) => setForm({ ...form, dataVenda: e.target.value })}
              style={{
                width: "100%",
                marginTop: 6,
                padding: 8,
                background: formMode === "idle" ? COLORS.grayLight : COLORS.white,
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
              onChange={(e) => setForm({ ...form, cliente: e.target.value })}
              style={{
                width: "100%",
                marginTop: 6,
                padding: 8,
                background: formMode === "idle" ? COLORS.grayLight : COLORS.white,
                border: "1px solid rgb(167, 117, 75)",
                borderRadius: 6,
                textAlign: "left",
              }}
            />
          </label>
          <label style={{ display: "block" }}>
            Modelo da Vela
            <select
              required
              disabled={formMode === "idle"}
              value={form.modeloVela}
              onChange={(e) => setForm({ ...form, modeloVela: e.target.value })}
              style={{
                width: "100%",
                marginTop: 6,
                padding: 8,
                background: formMode === "idle" ? COLORS.grayLight : COLORS.white,
                border: "1px solid rgb(167, 117, 75)",
                borderRadius: 6,
                textAlign: "left",
              }}
            >
              <option value="">Escolha um modelo</option>
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
              required
              disabled={formMode === "idle"}
              value={form.quantidade}
              onChange={(e) => setForm({ ...form, quantidade: e.target.value })}
              style={{
                width: "100%",
                marginTop: 6,
                padding: 8,
                background: formMode === "idle" ? COLORS.grayLight : COLORS.white,
                border: "1px solid rgb(167, 117, 75)",
                borderRadius: 6,
                textAlign: "left",
              }}
            />
          </label>
          <label style={{ display: "block" }}>
            Preço Unitário (R$)
            <input
              type="text"
              required
              disabled={formMode === "idle"}
              value={form.precoUnitario}
              onChange={(e) =>
                setForm({
                  ...form,
                  precoUnitario: sanitizeCurrencyInput(e.target.value),
                })
              }
              onBlur={() =>
                setForm((prev) => ({
                  ...prev,
                  precoUnitario: prev.precoUnitario
                    ? formatCurrencyInput(prev.precoUnitario, 2)
                    : "",
                }))
              }
              style={{
                width: "100%",
                marginTop: 6,
                padding: 8,
                background: formMode === "idle" ? COLORS.grayLight : COLORS.white,
                border: "1px solid rgb(167, 117, 75)",
                borderRadius: 6,
                textAlign: "left",
              }}
            />
          </label>
          <label style={{ display: "block" }}>
            Forma de Pagamento
            <select
              required
              disabled={formMode === "idle"}
              value={form.formaPagamento}
              onChange={(e) =>
                setForm({ ...form, formaPagamento: e.target.value })
              }
              style={{
                width: "100%",
                marginTop: 6,
                padding: 8,
                background: formMode === "idle" ? COLORS.grayLight : COLORS.white,
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
              <option value="Outros">Outros</option>
            </select>
          </label>
          <label style={{ display: "block" }}>
            Status
            <select
              required
              disabled={formMode === "idle"}
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              style={{
                width: "100%",
                marginTop: 6,
                padding: 8,
                background: formMode === "idle" ? COLORS.grayLight : COLORS.white,
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
              onChange={(e) => setForm({ ...form, observacao: e.target.value })}
              style={{
                width: "100%",
                marginTop: 6,
                padding: 8,
                background: formMode === "idle" ? COLORS.grayLight : COLORS.white,
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
            disabled={formMode === "idle"}
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
                background: COLORS.dangerLight,
                color: "white",
                border: "none",
                borderRadius: 6,
                cursor: "pointer",
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
