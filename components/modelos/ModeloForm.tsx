// components/modelos/ModeloForm.tsx
import { RefObject } from "react";
import { formatCurrencyInput, sanitizeCurrencyInput } from "../../lib/currency";
import { COLORS } from "../../styles/theme";

type Insumo = {
  id: number;
  name: string;
  active?: boolean;
  productTypes?: string[];
  isBase?: boolean;
};

type Parameter = {
  id: number;
  name: string;
  category: string;
};

export type ModeloFormState = {
  nome: string;
  tipoProduto: string;
  baseNome: string;
  base2Nome: string;
  ceraGr: string;
  cera2Gr: string;
  esenciaMl: string;
  essenciaNome: string;
  pavio: string;
  coranteNome: string;
  coranteGr: string;
  recipiente: string;
  pedra: string;
  pedraGr: string;
  oleo: string;
  oleoGr: string;
  argila: string;
  argilaGr: string;
  dioxido: string;
  dioxidoGr: string;
  manteiga: string;
  manteigaGr: string;
  extrato: string;
  extratoGr: string;
  lauril: string;
  laurilGr: string;
  embalagem: string;
  maoDeObra: string;
  margemLucro: string;
  ativo: boolean;
};

type Props = {
  formMode: "create" | "edit" | "idle";
  editingId: number | null;
  form: ModeloFormState;
  setForm: React.Dispatch<React.SetStateAction<ModeloFormState>>;
  productTypes: Parameter[];
  bases: Insumo[];
  essencias: Insumo[];
  wicks: Insumo[];
  dyes: Insumo[];
  recipients: Insumo[];
  stones: Insumo[];
  extracts: Insumo[];
  surfactants: Insumo[];
  oils: Insumo[];
  clays: Insumo[];
  dioxides: Insumo[];
  butters: Insumo[];
  nomeInputRef: RefObject<HTMLInputElement>;
  handleSubmit: (event: React.FormEvent) => void;
  startNew: () => void;
  resetForm: (shouldClearMessage?: boolean) => void;
  handleProductTypeChange: (value: string) => void;
};

export default function ModeloForm({
  formMode,
  editingId,
  form,
  setForm,
  productTypes,
  bases,
  essencias,
  wicks,
  dyes,
  recipients,
  stones,
  extracts,
  surfactants,
  oils,
  clays,
  dioxides,
  butters,
  nomeInputRef,
  handleSubmit,
  startNew,
  resetForm,
  handleProductTypeChange,
}: Props) {
  const fieldLabelStyle = {
    display: "block" as const,
    marginBottom: 10,
    fontWeight: 600,
    color: COLORS.primaryDark,
    fontSize: 13,
  };

  const sectionCardStyle = {
    padding: 14,
    borderRadius: 12,
    border: "1px solid rgba(166, 116, 71, 0.24)",
    background: "rgba(255, 255, 255, 0.58)",
    boxShadow: "0 8px 24px rgba(120, 70, 31, 0.08)",
    overflow: "hidden",
  };

  // Função auxiliar com suporte a letras maiúsculas/minúsculas para validar a liberação dos campos
  const isFieldEnabled = (allowedTypes: string[]) => {
    if (formMode === "idle" || !form.tipoProduto) return false;
    const tipoAtual = form.tipoProduto.toLowerCase();
    return allowedTypes.map((t) => t.toLowerCase()).includes(tipoAtual);
  };

  return (
    <div
      style={{
        background: `linear-gradient(135deg, ${COLORS.cardGradientFrom} 0%, ${COLORS.cardGradientTo} 100%)`,
        padding: 22,
        borderRadius: 16,
        boxShadow: COLORS.cardShadowLarge,
        border: COLORS.cardBorder,
        minWidth: 0,
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
        <div>
          <h3 style={{ margin: 0, color: COLORS.primaryDark }}>
            {editingId ? "Editar modelo" : "Novo modelo"}
          </h3>
          <p
            style={{
              margin: "4px 0 0",
              color: COLORS.primaryDarkAlt,
              fontSize: 13,
            }}
          >
            Organize a receita, os itens e os custos em uma única tela.
          </p>
        </div>
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
      <form onSubmit={handleSubmit}>
        <div style={sectionCardStyle}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: 10,
            }}
          >
            <label style={fieldLabelStyle}>
              Nome do Produto
              <input
                ref={nomeInputRef}
                required
                placeholder="Ex.: Vala Eir, Sabonete Aconchego..."
                disabled={formMode === "idle"}
                value={form.nome}
                onChange={(e) => setForm({ ...form, nome: e.target.value })}
                style={{
                  width: "100%",
                  marginTop: 6,
                  padding: "8px 10px",
                  background: COLORS.white,
                  border: "1px solid rgb(166, 116, 71)",
                  borderRadius: 8,
                  fontSize: 13,
                  boxSizing: "border-box",
                }}
              />
            </label>
            <label style={fieldLabelStyle}>
              Tipo de Produto
              <select
                disabled={formMode === "idle"}
                value={form.tipoProduto}
                onChange={(e) => handleProductTypeChange(e.target.value)}
                style={{
                  width: "100%",
                  marginTop: 6,
                  padding: "8px 10px",
                  background: COLORS.white,
                  border: "1px solid rgb(166, 116, 71)",
                  borderRadius: 8,
                  fontSize: 13,
                  boxSizing: "border-box",
                }}
              >
                <option value="">Escolha o tipo de produto</option>
                {(Array.isArray(productTypes) ? productTypes : []).map(
                  (type) => (
                    <option key={type.id} value={type.name}>
                      {type.name}
                    </option>
                  ),
                )}
              </select>
              <div
                style={{
                  marginTop: 6,
                  fontSize: 13,
                  color: COLORS.primaryDarkText,
                }}
              ></div>
            </label>
            <label style={fieldLabelStyle}>
              Base
              <select
                disabled={formMode === "idle"}
                value={form.baseNome}
                onChange={(e) => setForm({ ...form, baseNome: e.target.value })}
                style={{
                  width: "100%",
                  marginTop: 6,
                  padding: "8px 10px",
                  background: COLORS.white,
                  border: "1px solid rgb(166, 116, 71)",
                  borderRadius: 8,
                  fontSize: 13,
                  boxSizing: "border-box",
                }}
              >
                <option value="">Escolha a Principal</option>
                {bases.map((insumo) => (
                  <option key={insumo.id} value={insumo.name}>
                    {insumo.name}
                  </option>
                ))}
              </select>
              <div style={{ marginTop: 8 }}>
                <label style={{ fontSize: 13, color: COLORS.primaryDarkText }}>
                  Base Secundária (opcional)
                </label>
                <select
                  disabled={formMode === "idle"}
                  value={form.base2Nome}
                  onChange={(e) =>
                    setForm({ ...form, base2Nome: e.target.value })
                  }
                  style={{
                    width: "100%",
                    marginTop: 6,
                    padding: "8px 10px",
                    background: COLORS.white,
                    border: "1px solid rgb(166, 116, 71)",
                    borderRadius: 8,
                    fontSize: 13,
                    boxSizing: "border-box",
                  }}
                >
                  <option value="">Opcional</option>
                  {bases.map((insumo) => (
                    <option key={insumo.id} value={insumo.name}>
                      {insumo.name}
                    </option>
                  ))}
                </select>
              </div>
            </label>
          </div>
        </div>
        <div style={{ marginTop: 16 }}>
          <h4 style={{ margin: "0 0 8px", color: COLORS.primaryDark }}>
            Insumos e Custos
          </h4>
          <p
            style={{
              margin: "0 0 12px",
              color: COLORS.primaryDarkText,
              fontSize: 16,
            }}
          >
            Insumos para Velas e Sabonetes.
          </p>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
            gap: 10,
          }}
        >
          <label style={{ display: "block" }}>
            Base (g)
            <input
              type="number"
              disabled={!isFieldEnabled(["Vela", "Sabonete"])}
              placeholder="Qtd de gramas que usa"
              value={form.ceraGr}
              onChange={(e) => setForm({ ...form, ceraGr: e.target.value })}
              style={{
                width: "100%",
                marginTop: 6,
                padding: 8,
                background: COLORS.white,
                border: "1px solid rgb(166, 116, 71)",
                borderRadius: 6,
              }}
            />
          </label>
          <label style={{ display: "block" }}>
            Base 2 (g) (opcional)
            <input
              type="number"
              placeholder="Qtd de gramas que usa"
              disabled={!isFieldEnabled(["Vela", "Sabonete"])}
              value={form.cera2Gr}
              onChange={(e) => setForm({ ...form, cera2Gr: e.target.value })}
              style={{
                width: "100%",
                marginTop: 6,
                padding: 8,
                background: COLORS.white,
                border: "1px solid rgb(166, 116, 71)",
                borderRadius: 6,
              }}
            />
          </label>
          <label style={{ display: "block" }}>
            Essência Nome
            <select
              disabled={!isFieldEnabled(["Vela", "Sabonete"])}
              value={form.essenciaNome}
              onChange={(e) =>
                setForm({ ...form, essenciaNome: e.target.value })
              }
              style={{
                width: "100%",
                marginTop: 6,
                padding: 8,
                background: COLORS.white,
                border: "1px solid rgb(166, 116, 71)",
                borderRadius: 6,
              }}
            >
              <option value="">Opcional</option>
              {essencias.map((e) => (
                <option key={e.id} value={e.name}>
                  {e.name}
                </option>
              ))}
            </select>
          </label>
          <label style={{ display: "block" }}>
            Essência (ml)
            <input
              type="number"
              placeholder="Qtd de ml que usa"
              disabled={!isFieldEnabled(["Vela", "Sabonete"])}
              value={form.esenciaMl}
              onChange={(e) => setForm({ ...form, esenciaMl: e.target.value })}
              style={{
                width: "100%",
                marginTop: 6,
                padding: 8,
                background: COLORS.white,
                border: "1px solid rgb(166, 116, 71)",
                borderRadius: 6,
              }}
            />
          </label>
          <label style={{ display: "block" }}>
            Pavio
            <select
              disabled={!isFieldEnabled(["Vela"])}
              value={form.pavio}
              onChange={(e) => setForm({ ...form, pavio: e.target.value })}
              style={{
                width: "100%",
                marginTop: 6,
                padding: 8,
                background: COLORS.white,
                border: "1px solid rgb(166, 116, 71)",
                borderRadius: 6,
              }}
            >
              <option value="">Opcional</option>
              {wicks.map((p) => (
                <option key={p.id} value={p.name}>
                  {p.name}
                </option>
              ))}
            </select>
          </label>
          <label style={{ display: "block" }}>
            Nome do Corante
            <select
              disabled={!isFieldEnabled(["Vela", "Sabonete"])}
              value={form.coranteNome}
              onChange={(e) =>
                setForm({ ...form, coranteNome: e.target.value })
              }
              style={{
                width: "100%",
                marginTop: 6,
                padding: 8,
                background: COLORS.white,
                border: "1px solid rgb(166, 116, 71)",
                borderRadius: 6,
              }}
            >
              <option value="">Opcional</option>
              {dyes.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <label style={{ display: "block" }}>
            Corante (g)
            <input
              type="number"
              placeholder="Qtd de gramas que usa"
              disabled={!isFieldEnabled(["Vela", "Sabonete"])}
              value={form.coranteGr}
              onChange={(e) => setForm({ ...form, coranteGr: e.target.value })}
              style={{
                width: "100%",
                marginTop: 6,
                padding: 8,
                background: COLORS.white,
                border: "1px solid rgb(166, 116, 71)",
                borderRadius: 6,
              }}
            />
          </label>
          <label style={{ display: "block" }}>
            Recipiente
            <select
              disabled={!isFieldEnabled(["Vela"])}
              value={form.recipiente}
              onChange={(e) => setForm({ ...form, recipiente: e.target.value })}
              style={{
                width: "100%",
                marginTop: 6,
                padding: 8,
                background: COLORS.white,
                border: "1px solid rgb(166, 116, 71)",
                borderRadius: 6,
              }}
            >
              <option value="">Opcional</option>
              {recipients.map((r) => (
                <option key={r.id} value={r.name}>
                  {r.name}
                </option>
              ))}
            </select>
          </label>
          <label style={{ display: "block" }}>
            Pedra
            <select
              disabled={!isFieldEnabled(["Vela"])}
              value={form.pedra}
              onChange={(e) => setForm({ ...form, pedra: e.target.value })}
              style={{
                width: "100%",
                marginTop: 6,
                padding: 8,
                background: COLORS.white,
                border: "1px solid rgb(166, 116, 71)",
                borderRadius: 6,
              }}
            >
              <option value="">Opcional</option>
              {stones.map((p) => (
                <option key={p.id} value={p.name}>
                  {p.name}
                </option>
              ))}
            </select>
          </label>
          <label style={{ display: "block" }}>
            Pedra (g)
            <input
              disabled={!isFieldEnabled(["Vela"])}
              type="number"
              step={0.01}
              min={0}
              placeholder="Qtd de gramas que usa"
              value={form.pedraGr}
              onChange={(e) => setForm({ ...form, pedraGr: e.target.value })}
              style={{
                width: "100%",
                marginTop: 6,
                padding: 8,
                background: COLORS.white,
                border: "1px solid rgb(166, 116, 71)",
                borderRadius: 6,
              }}
            />
          </label>
        </div>
        <div style={{ marginTop: 16 }}>
          <p
            style={{
              margin: "0 0 12px",
              color: COLORS.primaryDarkText,
              fontSize: 16,
            }}
          >
            Insumos usados somente para Sabonetes.
          </p>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
            gap: 10,
            marginBottom: 16,
          }}
        >
          <label style={{ display: "block" }}>
            Extrato
            <select
              disabled={!isFieldEnabled(["Sabonete"])}
              value={form.extrato}
              onChange={(e) => setForm({ ...form, extrato: e.target.value })}
              style={{
                width: "100%",
                marginTop: 6,
                padding: 8,
                background: COLORS.white,
                border: "1px solid rgb(166, 116, 71)",
                borderRadius: 6,
              }}
            >
              <option value="">Opcional</option>
              {extracts.map((e) => (
                <option key={e.id} value={e.name}>
                  {e.name}
                </option>
              ))}
            </select>
          </label>
          <label style={{ display: "block" }}>
            Extrato (ml)
            <input
              type="number"
              placeholder="Qtd de ml que usa"
              disabled={!isFieldEnabled(["Sabonete"])}
              value={form.extratoGr}
              onChange={(e) => setForm({ ...form, extratoGr: e.target.value })}
              style={{
                width: "100%",
                marginTop: 6,
                padding: 8,
                background: COLORS.white,
                border: "1px solid rgb(166, 116, 71)",
                borderRadius: 6,
              }}
            />
          </label>
          <label style={{ display: "block" }}>
            Lauril
            <select
              disabled={!isFieldEnabled(["Sabonete"])}
              value={form.lauril}
              onChange={(e) => setForm({ ...form, lauril: e.target.value })}
              style={{
                width: "100%",
                marginTop: 6,
                padding: 8,
                background: COLORS.white,
                border: "1px solid rgb(166, 116, 71)",
                borderRadius: 6,
              }}
            >
              <option value="">Opcional</option>
              {surfactants.map((l) => (
                <option key={l.id} value={l.name}>
                  {l.name}
                </option>
              ))}
            </select>
          </label>
          <label style={{ display: "block" }}>
            Lauril (ml)
            <input
              type="number"
              placeholder="Qtd de ml que usa"
              disabled={!isFieldEnabled(["Sabonete"])}
              value={form.laurilGr}
              onChange={(e) => setForm({ ...form, laurilGr: e.target.value })}
              style={{
                width: "100%",
                marginTop: 6,
                padding: 8,
                background: COLORS.white,
                border: "1px solid rgb(166, 116, 71)",
                borderRadius: 6,
              }}
            />
          </label>
          <label style={{ display: "block" }}>
            Óleo
            <select
              disabled={!isFieldEnabled(["Sabonete"])}
              value={form.oleo}
              onChange={(e) => setForm({ ...form, oleo: e.target.value })}
              style={{
                width: "100%",
                marginTop: 6,
                padding: 8,
                background: COLORS.white,
                border: "1px solid rgb(166, 116, 71)",
                borderRadius: 6,
              }}
            >
              <option value="">Opcional</option>
              {oils.map((item) => (
                <option key={item.id} value={item.name}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>
          <label style={{ display: "block" }}>
            Óleo (ml)
            <input
              type="number"
              placeholder="Qtd de ml que usa"
              disabled={!isFieldEnabled(["Sabonete"])}
              value={form.oleoGr}
              onChange={(e) => setForm({ ...form, oleoGr: e.target.value })}
              style={{
                width: "100%",
                marginTop: 6,
                padding: 8,
                background: COLORS.white,
                border: "1px solid rgb(166, 116, 71)",
                borderRadius: 6,
              }}
            />
          </label>
          <label style={{ display: "block" }}>
            Argila
            <select
              disabled={!isFieldEnabled(["Sabonete"])}
              value={form.argila}
              onChange={(e) => setForm({ ...form, argila: e.target.value })}
              style={{
                width: "100%",
                marginTop: 6,
                padding: 8,
                background: COLORS.white,
                border: "1px solid rgb(166, 116, 71)",
                borderRadius: 6,
              }}
            >
              <option value="">Opcional</option>
              {clays.map((item) => (
                <option key={item.id} value={item.name}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>
          <label style={{ display: "block" }}>
            Argila (g)
            <input
              type="number"
              placeholder="Qtd de gramas que usa"
              disabled={!isFieldEnabled(["Sabonete"])}
              value={form.argilaGr}
              onChange={(e) => setForm({ ...form, argilaGr: e.target.value })}
              style={{
                width: "100%",
                marginTop: 6,
                padding: 8,
                background: COLORS.white,
                border: "1px solid rgb(166, 116, 71)",
                borderRadius: 6,
              }}
            />
          </label>
          <label style={{ display: "block" }}>
            Dióxido
            <select
              disabled={!isFieldEnabled(["Sabonete"])}
              value={form.dioxido}
              onChange={(e) => setForm({ ...form, dioxido: e.target.value })}
              style={{
                width: "100%",
                marginTop: 6,
                padding: 8,
                background: COLORS.white,
                border: "1px solid rgb(166, 116, 71)",
                borderRadius: 6,
              }}
            >
              <option value="">Opcional</option>
              {dioxides.map((item) => (
                <option key={item.id} value={item.name}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>
          <label style={{ display: "block" }}>
            Dióxido (g)
            <input
              type="number"
              placeholder="Qtd de gramas que usa"
              disabled={!isFieldEnabled(["Sabonete"])}
              value={form.dioxidoGr}
              onChange={(e) => setForm({ ...form, dioxidoGr: e.target.value })}
              style={{
                width: "100%",
                marginTop: 6,
                padding: 8,
                background: COLORS.white,
                border: "1px solid rgb(166, 116, 71)",
                borderRadius: 6,
              }}
            />
          </label>
          <label style={{ display: "block" }}>
            Manteiga
            <select
              disabled={!isFieldEnabled(["Sabonete"])}
              value={form.manteiga}
              onChange={(e) => setForm({ ...form, manteiga: e.target.value })}
              style={{
                width: "100%",
                marginTop: 6,
                padding: 8,
                background: COLORS.white,
                border: "1px solid rgb(166, 116, 71)",
                borderRadius: 6,
              }}
            >
              <option value="">Opcional</option>
              {butters.map((item) => (
                <option key={item.id} value={item.name}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>
          <label style={{ display: "block" }}>
            Manteiga (g)
            <input
              type="number"
              placeholder="Qtd de gramas que usa"
              disabled={!isFieldEnabled(["Sabonete"])}
              value={form.manteigaGr}
              onChange={(e) => setForm({ ...form, manteigaGr: e.target.value })}
              style={{
                width: "100%",
                marginTop: 6,
                padding: 8,
                background: COLORS.white,
                border: "1px solid rgb(166, 116, 71)",
                borderRadius: 6,
              }}
            />
          </label>
        </div>
        <div style={{ marginTop: 16 }}>
          <p
            style={{
              margin: "0 0 12px",
              color: COLORS.primaryDarkText,
              fontSize: 16,
            }}
          >
            Custos Fixos e Margem %.
          </p>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
            gap: 10,
          }}
        >
          <label style={{ display: "block" }}>
            Embalagem (R$)
            <input
              type="text"
              inputMode="decimal"
              step="0.001"
              placeholder="Somar tudo o que usa Ex.:Etiqueta, Fita, Caixa, etc."
              disabled={!isFieldEnabled(["Vela", "Sabonete"])}
              value={form.embalagem}
              onChange={(e) =>
                setForm({
                  ...form,
                  embalagem: sanitizeCurrencyInput(e.target.value),
                })
              }
              onBlur={() =>
                setForm((prev) => ({
                  ...prev,
                  embalagem: prev.embalagem
                    ? formatCurrencyInput(prev.embalagem, 3)
                    : "",
                }))
              }
              style={{
                width: "100%",
                marginTop: 6,
                padding: 8,
                background: COLORS.white,
                border: "1px solid rgb(166, 116, 71)",
                borderRadius: 6,
              }}
            />
          </label>
          <label style={{ display: "block" }}>
            Mão de Obra (R$)
            <input
              type="text"
              inputMode="decimal"
              step="0.001"
              placeholder="Quanto você paga para produzir"
              disabled={!isFieldEnabled(["Vela", "Sabonete"])}
              value={form.maoDeObra}
              onChange={(e) =>
                setForm({
                  ...form,
                  maoDeObra: sanitizeCurrencyInput(e.target.value),
                })
              }
              onBlur={() =>
                setForm((prev) => ({
                  ...prev,
                  maoDeObra: prev.maoDeObra
                    ? formatCurrencyInput(prev.maoDeObra, 2)
                    : "",
                }))
              }
              style={{
                width: "100%",
                marginTop: 6,
                padding: 8,
                background: COLORS.white,
                border: "1px solid rgb(166, 116, 71)",
                borderRadius: 6,
              }}
            />
          </label>
          <label style={{ display: "block" }}>
            Margem Lucro (%)
            <input
              type="number"
              placeholder="Quanto será a Margem de Lucro que deseja aplicar"
              disabled={!isFieldEnabled(["Vela", "Sabonete"])}
              value={form.margemLucro}
              onChange={(e) =>
                setForm({ ...form, margemLucro: e.target.value })
              }
              style={{
                width: "100%",
                marginTop: 6,
                padding: 8,
                background: COLORS.white,
                border: "1px solid rgb(166, 116, 71)",
                borderRadius: 6,
              }}
            />
          </label>
        </div>
        {formMode === "edit" && (
          <label style={{ display: "block", marginTop: 16 }}>
            Status do modelo
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
                onClick={() => setForm({ ...form, ativo: !form.ativo })}
                aria-label={form.ativo ? "Modelo ativo" : "Modelo inativo"}
                style={{
                  width: 46,
                  height: 26,
                  borderRadius: 13,
                  border: "none",
                  cursor: "pointer",
                  background: form.ativo
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
                    left: form.ativo ? 23 : 3,
                    width: 20,
                    height: 20,
                    borderRadius: "50%",
                    background: "white",
                    transition: "left 0.2s ease",
                  }}
                />
              </button>
              <span>{form.ativo ? "Ativo" : "Inativo"}</span>
            </div>
          </label>
        )}
        <div
          style={{
            display: "flex",
            gap: 12,
            marginTop: 20,
            flexWrap: "wrap",
          }}
        >
          <button
            type="submit"
            disabled={formMode === "idle" || !form.tipoProduto}
            style={{
              padding: "10px 16px",
              background:
                formMode === "idle" || !form.tipoProduto
                  ? COLORS.gray
                  : "linear-gradient(135deg, #a76f4b 0%, #8c5331 100%)",
              color: "white",
              border: "none",
              borderRadius: 999,
              cursor:
                formMode === "idle" || !form.tipoProduto
                  ? "not-allowed"
                  : "pointer",
              fontWeight: 600,
            }}
          >
            {editingId ? "Atualizar modelo" : "Salvar modelo"}
          </button>
          {(formMode === "create" || formMode === "edit") && (
            <button
              type="button"
              onClick={() => resetForm(true)}
              style={{
                padding: "10px 16px",
                background: "rgb(107, 114, 128)",
                color: "white",
                border: "none",
                borderRadius: 999,
                fontWeight: 600,
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
