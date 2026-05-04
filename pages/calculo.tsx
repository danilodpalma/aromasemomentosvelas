import { useEffect, useState } from "react";
import {
  formatCurrencyInput,
  parseCurrencyInput,
  sanitizeCurrencyInput,
} from "../lib/currency";

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
  ceraGr: number;
  esenciaMl: number;
  essenciaNome?: string;
  pavio?: string;
  coranteNome?: string;
  coranteGr: number;
  recipiente?: string;
  pedra?: string;
  extrato?: string;
  extratoGr: number;
  lauril?: string;
  laurilGr: number;
  tampa?: string;
  embalagem: number;
  maoDeObra: number;
  margemLucro: number;
};

function findUnitCost(insumos: Insumo[], name?: string) {
  if (!name || name === "") return 0;
  const normalized = name.trim().toLowerCase();

  // Busca exata primeiro, depois parcial
  let item = insumos.find(
    (insumo) => insumo.name.trim().toLowerCase() === normalized,
  );

  if (!item) {
    // Busca parcial: o nome do insumo contém o termo ou vice-versa
    item = insumos.find((insumo) => {
      const insumoName = insumo.name.trim().toLowerCase();
      return insumoName.includes(normalized) || normalized.includes(insumoName);
    });
  }

  return item ? item.unitCost : 0;
}

export default function Calculo() {
  const [insumos, setInsumos] = useState<Insumo[]>([]);
  const [modelos, setModelos] = useState<Modelo[]>([]);
  const [calculos, setCalculos] = useState<Record<number, string>>({});
  const [tempValues, setTempValues] = useState<Record<number, string>>({});
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const [message, setMessage] = useState<string>("");

  // Salvar valor vendido
  async function saveValorVendido(modeloId: number) {
    const typedValue = tempValues[modeloId] ?? "";
    const currentValue = calculos[modeloId];
    const rawValue = (typedValue || currentValue || "").trim();
    const valorNumber = parseCurrencyInput(rawValue);
    const valorFormatted = valorNumber.toFixed(2);

    const response = await fetch(`/api/modelos?id=${modeloId}`, {
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
  }

  // Limpar valor vendido
  async function clearValorVendido(modeloId: number) {
    const response = await fetch(`/api/modelos?id=${modeloId}`, {
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
        fetch("/api/products"),
        fetch("/api/modelos"),
      ]);
      setInsumos(await insumosRes.json());
      const modelosData = (await modelosRes.json()) as Modelo[];
      setModelos(modelosData);
      const persistedValues: Record<number, string> = {};
      modelosData.forEach((modelo) => {
        persistedValues[modelo.id] = (modelo.valorVendido ?? 0).toFixed(2);
      });
      setCalculos(persistedValues);
    }

    load();
  }, []);

  function calculateCosts(modelo: Modelo) {
    const ceraCost = modelo.ceraGr * findUnitCost(insumos, modelo.tipoProduto || "Cera de Coco");
    const esenciaCost =
      modelo.esenciaMl * findUnitCost(insumos, modelo.essenciaNome);
    const pavioCost = 1 * findUnitCost(insumos, modelo.pavio);
    const coranteCost =
      modelo.coranteGr * findUnitCost(insumos, modelo.coranteNome);
    const recipienteCost = 1 * findUnitCost(insumos, modelo.recipiente);
    const pedraCost = 1 * findUnitCost(insumos, modelo.pedra);
    const extratoCost = modelo.extratoGr * findUnitCost(insumos, modelo.extrato);
    const laurilCost = modelo.laurilGr * findUnitCost(insumos, modelo.lauril);
    const tampaCost = 1 * findUnitCost(insumos, modelo.tampa);

    const insumoCost =
      ceraCost +
      esenciaCost +
      pavioCost +
      coranteCost +
      recipienteCost +
      pedraCost +
      extratoCost +
      laurilCost +
      tampaCost;
    const fixedCost = modelo.embalagem + modelo.maoDeObra;
    const totalCost = insumoCost + fixedCost;
    const priceSuggested = totalCost * (1 + modelo.margemLucro / 100);
    const finalSalePrice =
      Math.ceil(totalCost * (1 + modelo.margemLucro / 100) * 100) / 100;
    const profit = priceSuggested - totalCost;
    const valorVendido = Number(calculos[modelo.id] || 0);
    const actualProfit = valorVendido - totalCost;

    const breakdown = [
      {
        label: "Cera de Coco",
        quantidade: modelo.ceraGr,
        unidade: "g",
        unitCost: findUnitCost(insumos, "Cera de Coco"),
        value: ceraCost,
      },
      {
        label: modelo.essenciaNome ? modelo.essenciaNome : "Essência",
        quantidade: modelo.esenciaMl,
        unidade: "ml",
        unitCost: findUnitCost(insumos, modelo.essenciaNome),
        value: esenciaCost,
      },
      {
        label: modelo.pavio ? modelo.pavio : "Pavio",
        quantidade: 1,
        unidade: "und",
        unitCost: findUnitCost(insumos, modelo.pavio),
        value: pavioCost,
      },
      {
        label: modelo.coranteNome ? modelo.coranteNome : "Corante",
        quantidade: modelo.coranteGr,
        unidade: "g",
        unitCost: findUnitCost(insumos, modelo.coranteNome),
        value: coranteCost,
      },
      {
        label: modelo.recipiente ? modelo.recipiente : "Recipiente",
        quantidade: 1,
        unidade: "und",
        unitCost: findUnitCost(insumos, modelo.recipiente),
        value: recipienteCost,
      },
      {
        label: modelo.pedra ? modelo.pedra : "Pedra",
        quantidade: 1,
        unidade: "und",
        unitCost: findUnitCost(insumos, modelo.pedra),
        value: pedraCost,
      },
      {
        label: modelo.extrato ? modelo.extrato : "Extrato",
        quantidade: modelo.extratoGr,
        unidade: "g",
        unitCost: findUnitCost(insumos, modelo.extrato),
        value: extratoCost,
      },
      {
        label: modelo.lauril ? modelo.lauril : "Lauril",
        quantidade: modelo.laurilGr,
        unidade: "g",
        unitCost: findUnitCost(insumos, modelo.lauril),
        value: laurilCost,
      },
      {
        label: modelo.tampa ? modelo.tampa : "Tampa",
        quantidade: 1,
        unidade: "und",
        unitCost: findUnitCost(insumos, modelo.tampa),
        value: tampaCost,
      },
    ].filter((item) => item.value > 0);

    return {
      insumoCost,
      fixedCost,
      totalCost,
      priceSuggested,
      profit,
      actualProfit,
      finalSalePrice,
      valorVendido,
      breakdown,
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
            background: "#ecfdf5",
            border: "1px solid #a7f3d0",
          }}
        >
          {message}
        </div>
      )}

      <div
        style={{
          background: "rgb(239, 221, 201)",
          borderRadius: 15,
          boxShadow: "0 1px 3px rgba(15, 23, 42, 0.08)",
          overflowX: "auto",
        }}
      >
        <table
          style={{ width: "100%", borderCollapse: "collapse", minWidth: 200 }}
        >
          <thead style={{ background: "rgb(239, 221, 201)" }}>
            <tr>
              <th style={{ padding: 10, textAlign: "center" }}>Nome da Vela</th>
              <th style={{ padding: 1, textAlign: "center" }}>
                Custo Insumos (R$)
              </th>
              <th style={{ padding: 1, textAlign: "center" }}>Detalhes</th>
              <th style={{ padding: 1, textAlign: "center" }}>
                Custos Fixos (R$)
              </th>
              <th style={{ padding: 1, textAlign: "center" }}>
                Custo Total (R$)
              </th>
              <th style={{ padding: 1, textAlign: "center" }}>Margem (%)</th>
              <th style={{ padding: 1, textAlign: "center" }}>
                Preço Sugerido (R$)
              </th>
              <th style={{ padding: 1, textAlign: "center" }}>Lucro (R$)</th>
              <th style={{ padding: 1, textAlign: "center" }}>
                Lucro sobre a venda
              </th>
              <th style={{ padding: 1, textAlign: "center" }}>Valor Vendido</th>
              <th style={{ padding: 1, textAlign: "center" }}>
                Preço Final P/ Venda
              </th>
            </tr>
          </thead>
          <tbody>
            {modelos.length === 0 ? (
              <tr>
                <td colSpan={10} style={{ padding: 16, textAlign: "center" }}>
                  Nenhum modelo cadastrado ainda.
                </td>
              </tr>
            ) : (
              modelos.map((modelo) => {
                const values = calculateCosts(modelo);
                return (
                  <>
                    <tr key={modelo.id}>
                      <td
                        style={{
                          padding: 12,
                          borderTop: "1px solid rgb(167, 117, 75)",
                        }}
                      >
                        {modelo.nome}
                      </td>
                      <td
                        style={{
                          padding: 12,
                          borderTop: "1px solid rgb(167, 117, 75)",
                          textAlign: "center",
                          color: "rgb(167, 117, 75)",
                        }}
                      >
                        R$ {values.insumoCost.toFixed(2)}
                      </td>
                      <td
                        style={{
                          padding: 12,
                          borderTop: "1px solid rgb(167, 117, 75)",
                          textAlign: "center",
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => toggleRowDetails(modelo.id)}
                          style={{
                            padding: "6px 10px",
                            background: "rgb(167, 117, 75)",
                            color: "white",
                            border: "none",
                            borderRadius: 6,
                            cursor: "pointer",
                          }}
                        >
                          {expandedRows.has(modelo.id) ? "Esconder" : "Ver"}
                        </button>
                      </td>
                      <td
                        style={{
                          padding: 12,
                          borderTop: "1px solid rgb(167, 117, 75)",
                          textAlign: "center",
                          color: "rgb(167, 117, 75)",
                        }}
                      >
                        R$ {values.fixedCost.toFixed(2)}
                      </td>
                      <td
                        style={{
                          padding: 12,
                          borderTop: "1px solid rgb(167, 117, 75)",
                          textAlign: "center",
                          color: "rgb(167, 117, 75)",
                        }}
                      >
                        R$ {values.totalCost.toFixed(2)}
                      </td>
                      <td
                        style={{
                          padding: 12,
                          borderTop: "1px solid rgb(167, 117, 75)",
                          textAlign: "center",
                          color: "rgb(167, 117, 75)",
                        }}
                      >
                        {modelo.margemLucro.toFixed(2)}%
                      </td>
                      <td
                        style={{
                          padding: 12,
                          borderTop: "1px solid rgb(167, 117, 75)",
                          textAlign: "center",
                          color: "rgb(167, 117, 75)",
                        }}
                      >
                        R$ {values.priceSuggested.toFixed(2)}
                      </td>
                      <td
                        style={{
                          padding: 12,
                          borderTop: "1px solid rgb(167, 117, 75)",
                          textAlign: "center",
                          color: "rgb(167, 117, 75)",
                        }}
                      >
                        R$ {values.profit.toFixed(2)}
                      </td>
                      <td
                        style={{
                          padding: 12,
                          borderTop: "1px solid rgb(167, 117, 75)",
                          textAlign: "center",
                          color: "rgb(167, 117, 75)",
                        }}
                      >
                        R$ {values.actualProfit.toFixed(2)}
                      </td>
                      <td
                        style={{
                          padding: 12,
                          borderTop: "1px solid rgb(167, 117, 75)",
                          textAlign: "center",
                          color: "rgb(167, 117, 75)",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 4,
                          }}
                        >
                          <span>R$</span>
                          <input
                            type="text"
                            value={
                              tempValues[modelo.id] ?? calculos[modelo.id] ?? ""
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
                                  [modelo.id]: formatCurrencyInput(current, 2),
                                };
                              })
                            }
                            placeholder={calculos[modelo.id] ? "" : "0.00"}
                            style={{
                              width: "80px",
                              padding: 6,
                              textAlign: "right",
                              background: "rgb(255, 255, 255)",
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
                              background: "rgb(34, 197, 94)",
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
                              background: "rgb(239, 68, 68)",
                              color: "white",
                              border: "none",
                              borderRadius: 4,
                              cursor: "pointer",
                              fontSize: 12,
                            }}
                          >
                            ✕
                          </button>
                        </div>
                      </td>
                      <td
                        style={{
                          padding: 12,
                          borderTop: "1px solid rgb(167, 117, 75)",
                          textAlign: "center",
                          color: "rgb(167, 117, 75)",
                        }}
                      >
                        R$ {values.finalSalePrice.toFixed(2)}
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
                                      {item.quantidade.toFixed(
                                        item.quantidade % 1 === 0 ? 0 : 3,
                                      )}{" "}
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
                                      R$ {item.unitCost.toFixed(4)}
                                    </td>
                                    <td
                                      style={{
                                        padding: 8,
                                        textAlign: "center",
                                        fontSize: 12,
                                        fontWeight: 600,
                                        color: "rgb(167, 117, 75)",
                                      }}
                                    >
                                      R$ {item.value.toFixed(4)}
                                    </td>
                                  </tr>
                                ))}
                                <tr
                                  style={{
                                    background: "rgba(167, 117, 75, 0.08)",
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
                                      color: "rgb(167, 117, 75)",
                                    }}
                                  >
                                    R$ {values.insumoCost.toFixed(4)}
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
                                    R$ {values.fixedCost.toFixed(4)}
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
                                      color: "rgb(34, 197, 94)",
                                    }}
                                  >
                                    R$ {values.totalCost.toFixed(4)}
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
