import { Fragment, useEffect, useState } from "react";
import {
  formatCurrencyInput,
  parseCurrencyInput,
  sanitizeCurrencyInput,
} from "../lib/currency";
import { useAuth } from "../context";
import { authFetch } from "../lib/apiClient";
import { COLORS } from "../styles/theme";
import { calcularCustoModelo } from "../lib/custos";

type Insumo = {
  id: number;
  name: string;
  unitCost: number;
};

type Modelo = {
  id: number;
  nome: string;
  ativo: boolean;
  valorVendido?: number;
  tipoProduto?: string;
  baseNome?: string;
  base2Nome?: string;
  ceraGr: number;
  cera2Gr?: number;
  esenciaMl: number;
  essenciaNome?: string;
  pavio?: string;
  coranteNome?: string;
  coranteGr: number;
  recipiente?: string;
  pedra?: string;
  pedraGr?: number;
  extrato?: string;
  extratoGr: number;
  lauril?: string;
  laurilGr: number;
  oleo?: string;
  oleoGr: number;
  argila?: string;
  argilaGr: number;
  dioxido?: string;
  dioxidoGr: number;
  manteiga?: string;
  manteigaGr: number;
  embalagem: number;
  maoDeObra: number;
  margemLucro: number;
};

function sortModelosByNome(modelos: Modelo[]) {
  return [...modelos].sort((a, b) =>
    a.nome.localeCompare(b.nome, "pt-BR", { sensitivity: "base" }),
  );
}

const thStyle: React.CSSProperties = {
  padding: "10px 8px",
  textAlign: "center",
};

const tdStyle: React.CSSProperties = {
  padding: "8px 10px",
  borderTop: "1px solid rgb(167, 117, 75)",
  textAlign: "center",
  verticalAlign: "middle",
};

const badgeStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 4,
  padding: "4px 8px",
  borderRadius: 999,
  fontWeight: 700,
  lineHeight: 1.2,
  whiteSpace: "nowrap",
};

const qtyBadgeStyle: React.CSSProperties = {
  ...badgeStyle,
  minWidth: 32,
  background: "rgba(167, 117, 75, 0.12)",
  color: "#5b3a22",
};

const priceBadgeStyle: React.CSSProperties = {
  ...badgeStyle,
  background: "rgba(59, 130, 246, 0.10)",
  color: "#1d4ed8",
};

const totalBadgeStyle: React.CSSProperties = {
  ...badgeStyle,
  padding: "4px 10px",
  background: "rgba(34, 197, 94, 0.12)",
  color: "#166534",
  fontWeight: 800,
};

const actionButtonStyle: React.CSSProperties = {
  padding: "5px 8px",
  color: "white",
  border: "none",
  borderRadius: 6,
  cursor: "pointer",
};

export default function Calculo() {
  const { canEdit } = useAuth();
  const [insumos, setInsumos] = useState<Insumo[]>([]);
  const [modelos, setModelos] = useState<Modelo[]>([]);
  const [calculos, setCalculos] = useState<Record<number, string>>({});
  const [tempValues, setTempValues] = useState<Record<number, string>>({});
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const [message, setMessage] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");

  // Salvar valor vendido
  async function saveValorVendido(modeloId: number) {
    const typedValue = (tempValues[modeloId] ?? "").trim();
    // O valor digitado vem no formato brasileiro ("12,50"); o valor já salvo
    // fica em `calculos` com ponto ("12.50") e não pode passar pelo
    // parseCurrencyInput, que removeria o ponto e multiplicaria por 100.
    const valorNumber = typedValue
      ? parseCurrencyInput(typedValue)
      : Number(calculos[modeloId] || 0);
    const valorFormatted = valorNumber.toFixed(2);

    const response = await authFetch(`/api/modelos?id=${modeloId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ valorVendido: valorNumber }),
    });

    if (!response.ok) {
      setMessage("Erro ao salvar valor vendido.");
      return;
    }

    setCalculos((prev) => ({ ...prev, [modeloId]: valorFormatted }));
    setModelos((prev) =>
      prev.map((modelo) =>
        modelo.id === modeloId
          ? { ...modelo, valorVendido: valorNumber }
          : modelo,
      ),
    );
    setTempValues((prev) => {
      const newObj = { ...prev };
      delete newObj[modeloId];
      return newObj;
    });
    setMessage("Valor salvo com sucesso.");
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  // Limpar valor vendido
  async function clearValorVendido(modeloId: number) {
    const response = await authFetch(`/api/modelos?id=${modeloId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ valorVendido: 0 }),
    });

    if (!response.ok) {
      setMessage("Erro ao zerar valor vendido.");
      return;
    }

    setTempValues((prev) => {
      const newObj = { ...prev };
      delete newObj[modeloId];
      return newObj;
    });
    setCalculos((prev) => ({ ...prev, [modeloId]: "0.00" }));
    setModelos((prev) =>
      prev.map((modelo) =>
        modelo.id === modeloId ? { ...modelo, valorVendido: 0 } : modelo,
      ),
    );
    setMessage("Valor zerado.");
  }

  // Atualizar valor temporário
  function updateTempValue(modeloId: number, value: string) {
    setTempValues((prev) => ({
      ...prev,
      [modeloId]: sanitizeCurrencyInput(value),
    }));
  }

  function toggleRowDetails(modeloId: number) {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(modeloId)) next.delete(modeloId);
      else next.add(modeloId);
      return next;
    });
  }

  useEffect(() => {
    async function load() {
      const [insumosRes, modelosRes] = await Promise.all([
        authFetch("/api/products"),
        authFetch("/api/modelos"),
      ]);
      setInsumos(await insumosRes.json());
      const modelosData = (await modelosRes.json()) as Modelo[];
      const modelosOrdenados = sortModelosByNome(modelosData);
      setModelos(modelosOrdenados);
      const persistedValues: Record<number, string> = {};
      modelosOrdenados.forEach((modelo) => {
        persistedValues[modelo.id] = (modelo.valorVendido ?? 0).toFixed(2);
      });
      setCalculos(persistedValues);
    }

    load();
  }, []);

  const modelosOrdenados = sortModelosByNome(modelos);
  const filteredModelos = modelosOrdenados.filter(
    (modelo) => modelo.ativo !== false,
  );
  // A busca filtra só as linhas exibidas; o total continua sendo o de modelos ativos.
  const visibleModelos = filteredModelos.filter((modelo) =>
    modelo.nome.toLowerCase().includes(searchTerm.trim().toLowerCase()),
  );

  function calculateCosts(modelo: Modelo) {
    const custo = calcularCustoModelo(modelo, insumos);
    const finalSalePrice = Math.ceil(custo.priceSuggested * 100) / 100;
    const profit = custo.priceSuggested - custo.totalCost;
    const valorVendido = Number(calculos[modelo.id] || 0);
    const actualProfit = valorVendido - custo.totalCost;

    return {
      ...custo,
      profit,
      actualProfit,
      finalSalePrice,
      valorVendido,
    };
  }

  return (
    <div>
      <h2>Cálculo</h2>
      <p>
        Esta aba aplica a fórmula de cálculo dos modelos usando custos de
        insumos e margem de lucro.
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
          background: `linear-gradient(135deg, ${COLORS.cardGradientFrom} 0%, ${COLORS.cardGradientTo} 100%)`,
          borderRadius: 14,
          boxShadow: COLORS.cardShadow,
          overflowX: "auto",
          border: COLORS.cardBorder,
          padding: 20,
        }}
      >
        <div style={{ marginBottom: 16 }}>
          <h3 style={{ marginBottom: 4 }}>Modelos</h3>
          <div style={{ color: COLORS.grayText, fontSize: 14 }}>
            Total de modelos: {filteredModelos.length}
          </div>
        </div>
        <div style={{ marginBottom: 16 }}>
          <input
            type="text"
            placeholder="Buscar modelo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: "100%",
              padding: 10,
              border: "1px solid rgb(167, 117, 75)",
              borderRadius: 6,
              background: COLORS.white,
            }}
          />
        </div>
        <table
          style={{ width: "100%", borderCollapse: "collapse", fontSize: 11.5 }}
        >
          <thead style={{ background: "rgba(255,255,255,0.35)" }}>
            <tr>
              <th style={thStyle}>Nome da Vela</th>
              <th style={thStyle}>
                Custo Insumos (R$)
              </th>
              <th style={thStyle}>Detalhes</th>
              <th style={thStyle}>
                Custos Fixos (R$)
              </th>
              <th style={thStyle}>
                Custo Total (R$)
              </th>
              <th style={thStyle}>Margem (%)</th>
              <th style={thStyle}>
                Preço Sugerido (R$)
              </th>
              <th style={thStyle}>Lucro (R$)</th>
              <th style={thStyle}>
                Lucro sobre a venda
              </th>
              <th style={thStyle}>
                Valor Vendido
              </th>
              <th style={thStyle}>
                Preço Final P/ Venda
              </th>
            </tr>
          </thead>
          <tbody>
            {visibleModelos.length === 0 ? (
              <tr>
                <td colSpan={11} style={{ ...tdStyle, padding: 16 }}>
                  {searchTerm
                    ? "Nenhum modelo encontrado para essa busca."
                    : "Nenhum modelo cadastrado ainda."}
                </td>
              </tr>
            ) : (
              visibleModelos.map((modelo, index) => {
                const values = calculateCosts(modelo);
                return (
                  <Fragment key={modelo.id}>
                    <tr
                      style={{
                        background:
                          index % 2 === 0
                            ? COLORS.tableRowEven
                            : COLORS.tableRowOdd,
                      }}
                    >
                      <td
                        style={tdStyle}
                      >
                        {modelo.nome}
                        {values.missingInsumos.length > 0 && (
                          <div
                            title="O custo desses insumos está sendo considerado zero."
                            style={{
                              marginTop: 4,
                              color: "#b91c1c",
                              fontSize: 11,
                              fontWeight: 600,
                            }}
                          >
                            ⚠ Insumo não encontrado:{" "}
                            {values.missingInsumos.join(", ")}
                          </div>
                        )}
                      </td>
                      <td
                        style={tdStyle}
                      >
                        <span style={qtyBadgeStyle}><span>R$</span><span>{values.insumoCost.toFixed(2)}</span></span>
                      </td>
                      <td
                        style={tdStyle}
                      >
                        <button
                          type="button"
                          onClick={() => toggleRowDetails(modelo.id)}
                          style={{
                            ...actionButtonStyle,
                            background: COLORS.primary,
                          }}
                        >
                          {expandedRows.has(modelo.id) ? "Esconder" : "Ver"}
                        </button>
                      </td>
                      <td
                        style={tdStyle}
                      >
                        <span style={qtyBadgeStyle}><span>R$</span><span>{values.fixedCost.toFixed(2)}</span></span>
                      </td>
                      <td
                        style={tdStyle}
                      >
                        <span style={qtyBadgeStyle}><span>R$</span><span>{values.totalCost.toFixed(2)}</span></span>
                      </td>
                      <td
                        style={tdStyle}
                      >
                        <span style={qtyBadgeStyle}>{Math.round(modelo.margemLucro)}%</span>
                      </td>
                      <td
                        style={tdStyle}
                      >
                        <span style={priceBadgeStyle}><span>R$</span><span>{values.priceSuggested.toFixed(2)}</span></span>
                      </td>
                      <td
                        style={tdStyle}
                      >
                        <span style={totalBadgeStyle}><span>R$</span><span>{values.profit.toFixed(2)}</span></span>
                      </td>
                      <td
                        style={tdStyle}
                      >
                        <span style={totalBadgeStyle}><span>R$</span><span>{values.actualProfit.toFixed(2)}</span></span>
                      </td>
                      <td
                        style={tdStyle}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 4,
                          }}
                        >
                          {canEdit ? (
                            <>
                              <span>R$</span>
                              <input
                                type="text"
                                value={
                                  tempValues[modelo.id] ??
                                  calculos[modelo.id] ??
                                  ""
                                }
                                onChange={(e) =>
                                  updateTempValue(modelo.id, e.target.value)
                                }
                                onBlur={() =>
                                  setTempValues((prev) => {
                                    const current = prev[modelo.id];
                                    if (!current) return prev;
                                    return {
                                      ...prev,
                                      [modelo.id]: formatCurrencyInput(
                                        current,
                                        3,
                                      ),
                                    };
                                  })
                                }
                                placeholder={calculos[modelo.id] ? "" : "0.00"}
                                style={{
                                  width: "80px",
                                  padding: 6,
                                  textAlign: "right",
                                  background: COLORS.white,
                                  border: "1px solid rgb(167, 117, 75)",
                                  borderRadius: 6,
                                }}
                              />
                              <button
                                type="button"
                                onClick={() => saveValorVendido(modelo.id)}
                                title="Salvar"
                                style={{
                                  padding: "4px 8px",
                                  background: COLORS.success,
                                  color: "white",
                                  border: "none",
                                  borderRadius: 4,
                                  cursor: "pointer",
                                  fontSize: 12,
                                }}
                              >
                                ✓
                              </button>
                              <button
                                type="button"
                                onClick={() => clearValorVendido(modelo.id)}
                                title="Limpar"
                                style={{
                                  padding: "4px 8px",
                                  background: COLORS.dangerLight,
                                  color: "white",
                                  border: "none",
                                  borderRadius: 4,
                                  cursor: "pointer",
                                  fontSize: 12,
                                }}
                              >
                                ✕
                              </button>
                            </>
                          ) : (
                            <span>R$ {calculos[modelo.id] ?? "0.00"}</span>
                          )}
                        </div>
                      </td>
                      <td
                        style={tdStyle}
                      >
                        <span style={totalBadgeStyle}><span>R$</span><span>{values.finalSalePrice.toFixed(2)}</span></span>
                      </td>
                    </tr>
                    {expandedRows.has(modelo.id) && (
                      <tr>
                        <td
                          colSpan={11}
                          style={{
                            padding: 12,
                            background: "rgb(252, 250, 246)",
                            borderTop: "1px solid rgb(167, 117, 75)",
                          }}
                        >
                          <div style={{ display: "grid", gap: 8 }}>
                            <strong>Detalhamento do custo de insumos</strong>
                            <table
                              style={{
                                width: "100%",
                                borderCollapse: "collapse",
                              }}
                            >
                              <thead>
                                <tr
                                  style={{
                                    background: "rgba(167, 117, 75, 0.1)",
                                  }}
                                >
                                  <th
                                    style={{
                                      padding: 8,
                                      textAlign: "left",
                                      fontSize: 12,
                                      fontWeight: 600,
                                    }}
                                  >
                                    Insumo
                                  </th>
                                  <th
                                    style={{
                                      padding: 8,
                                      textAlign: "center",
                                      fontSize: 12,
                                      fontWeight: 600,
                                    }}
                                  >
                                    Qtd
                                  </th>
                                  <th
                                    style={{
                                      padding: 8,
                                      textAlign: "center",
                                      fontSize: 12,
                                      fontWeight: 600,
                                    }}
                                  >
                                    Unitário (R$)
                                  </th>
                                  <th
                                    style={{
                                      padding: 8,
                                      textAlign: "center",
                                      fontSize: 12,
                                      fontWeight: 600,
                                    }}
                                  >
                                    Total (R$)
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {values.breakdown.map((item) => (
                                  <tr
                                    key={item.label}
                                    style={{
                                      borderBottom:
                                        "1px solid rgba(167, 117, 75, 0.1)",
                                    }}
                                  >
                                    <td style={{ padding: 8, fontSize: 12 }}>
                                      {item.label}
                                    </td>
                                    <td
                                      style={{
                                        padding: 8,
                                        textAlign: "center",
                                        fontSize: 12,
                                      }}
                                    >
                                      {item.quantidade.toFixed(3)}{" "}
                                      {item.unidade}
                                    </td>
                                    <td
                                      style={{
                                        padding: 8,
                                        textAlign: "center",
                                        fontSize: 12,
                                        color: "#667eea",
                                      }}
                                    >
                                      R$ {item.unitCost.toFixed(2)}
                                    </td>
                                    <td
                                      style={{
                                        padding: 8,
                                        textAlign: "center",
                                        fontSize: 12,
                                        fontWeight: 600,
                                        color: COLORS.primary,
                                      }}
                                    >
                                      R$ {item.value.toFixed(2)}
                                    </td>
                                  </tr>
                                ))}
                                <tr
                                  style={{
                                    background: COLORS.primarySoftAlt,
                                    fontWeight: 600,
                                  }}
                                >
                                  <td
                                    colSpan={3}
                                    style={{
                                      padding: 8,
                                      fontSize: 12,
                                      textAlign: "right",
                                    }}
                                  >
                                    Subtotal Insumos:
                                  </td>
                                  <td
                                    style={{
                                      padding: 8,
                                      textAlign: "center",
                                      fontSize: 12,
                                      color: COLORS.primary,
                                    }}
                                  >
                                    R$ {values.insumoCost.toFixed(2)}
                                  </td>
                                </tr>
                                <tr>
                                  <td
                                    colSpan={3}
                                    style={{
                                      padding: 8,
                                      fontSize: 12,
                                      textAlign: "right",
                                    }}
                                  >
                                    Custos Fixos (Emb. + M.O.):
                                  </td>
                                  <td
                                    style={{
                                      padding: 8,
                                      textAlign: "center",
                                      fontSize: 12,
                                      color: "#667eea",
                                    }}
                                  >
                                    R$ {values.fixedCost.toFixed(2)}
                                  </td>
                                </tr>
                                <tr
                                  style={{
                                    background: "rgba(34, 197, 94, 0.1)",
                                    fontWeight: 600,
                                  }}
                                >
                                  <td
                                    colSpan={3}
                                    style={{
                                      padding: 8,
                                      fontSize: 12,
                                      textAlign: "right",
                                    }}
                                  >
                                    Custo Total:
                                  </td>
                                  <td
                                    style={{
                                      padding: 8,
                                      textAlign: "center",
                                      fontSize: 12,
                                      color: COLORS.success,
                                    }}
                                  >
                                    R$ {values.totalCost.toFixed(2)}
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
