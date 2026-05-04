import { useEffect, useRef, useState } from "react";
import {
  formatCurrencyInput,
  parseCurrencyInput,
  sanitizeCurrencyInput,
} from "../lib/currency";

type Venda = {
  id: number;
  dataVenda: string;
  cliente: string;
  modeloVela: string;
  quantidade: number;
  precoUnitario: number;
  total: number;
  formaPagamento: string;
  status: string;
  observacao?: string;
};

type Modelo = {
  id: number;
  nome: string;
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
  embalagem: number;
  maoDeObra: number;
  margemLucro: number;
  tampa?: string;
};

const statusOptions = [
  "Entregue",
  "Pronto",
  "Consignação",
  "Produção",
  "Vendido",
  "Enviado",
];
const formaPagamentoOptions = [
  "Pix - PG",
  "Pix",
  "Presente",
  "Consignação",
  "Dinheiro",
  "Dinheiro - PG",
];

export default function Vendas() {
  const [vendas, setVendas] = useState<Venda[]>([]);
  const [modelos, setModelos] = useState<Modelo[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formMode, setFormMode] = useState<"idle" | "new" | "edit">("idle");
  const [filters, setFilters] = useState({
    dataInicio: "",
    dataFim: "",
    cliente: "",
    modeloVela: "",
    status: "",
    formaPagamento: "",
  });
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());
  const [form, setForm] = useState({
    dataVenda: "",
    cliente: "",
    modeloVela: "",
    quantidade: "",
    precoUnitario: "",
    formaPagamento: "",
    status: "",
    observacao: "",
  });
  const [message, setMessage] = useState<string>("");
  const dataVendaInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function load() {
      const [vendasRes, modelosRes] = await Promise.all([
        fetch("/api/vendas"),
        fetch("/api/modelos"),
      ]);
      setVendas(await vendasRes.json());
      setModelos(await modelosRes.json());
    }

    load();
  }, []);

  useEffect(() => {
    if (formMode === "new" || formMode === "edit") {
      requestAnimationFrame(() => {
        dataVendaInputRef.current?.focus();
      });
    }
  }, [formMode, editingId]);

  function resetForm() {
    setEditingId(null);
    setFormMode("idle");
    setSelectedItems(new Set());
    setForm({
      dataVenda: "",
      cliente: "",
      modeloVela: "",
      quantidade: "",
      precoUnitario: "",
      formaPagamento: "",
      status: "",
      observacao: "",
    });
    setMessage("");
  }

  function startNew() {
    setEditingId(null);
    setFormMode("new");
    setSelectedItems(new Set());
    setForm({
      dataVenda: "",
      cliente: "",
      modeloVela: "",
      quantidade: "",
      precoUnitario: "",
      formaPagamento: "",
      status: "",
      observacao: "",
    });
    setMessage("");
  }

  function startEdit(venda: Venda) {
    setEditingId(venda.id);
    setFormMode("edit");
    setForm({
      dataVenda: venda.dataVenda.split("T")[0],
      cliente: venda.cliente,
      modeloVela: venda.modeloVela,
      quantidade: venda.quantidade.toString(),
      precoUnitario: formatCurrencyInput(venda.precoUnitario, 2),
      formaPagamento: venda.formaPagamento,
      status: venda.status,
      observacao: venda.observacao ?? "",
    });
    setMessage("Edição de venda ativa. Faça as alterações e salve.");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function toggleSelect(id: number) {
    if (selectedItems.has(id)) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set([id]));
    }
  }

  function editSelected() {
    if (selectedItems.size === 1) {
      const selectedId = Array.from(selectedItems)[0];
      const venda = vendas.find((v) => v.id === selectedId);
      if (venda) {
        startEdit(venda);
      }
    }
  }

  function deleteSelected() {
    if (selectedItems.size === 1) {
      const selectedId = Array.from(selectedItems)[0];
      deleteVenda(selectedId);
    }
  }

  async function deleteVenda(id: number) {
    if (!confirm("Tem certeza que deseja excluir esta venda?")) return;

    const response = await fetch(`/api/vendas?id=${id}`, { method: "DELETE" });
    if (response.ok) {
      setVendas((prev) => prev.filter((v) => v.id !== id));
      setSelectedItems(new Set());
      setMessage("Venda excluída com sucesso.");
    } else {
      const error = await response.json();
      setMessage(error.error || "Erro ao excluir venda.");
    }
  }

  async function suggestPrice() {
    if (!form.modeloVela) {
      setMessage("Selecione um modelo primeiro.");
      return;
    }

    const [insumosRes, modelosRes] = await Promise.all([
      fetch("/api/products"),
      fetch("/api/modelos"),
    ]);
    const insumos = await insumosRes.json();
    const modelosData = await modelosRes.json();
    const modelo = modelosData.find((m: Modelo) => m.nome === form.modeloVela);

    if (!modelo) {
      setMessage("Modelo não encontrado.");
      return;
    }

    function findUnitCost(insumos: any[], name?: string) {
      if (!name) return 0;
      const normalized = name.trim().toLowerCase();
      const item = insumos.find(
        (insumo: any) => insumo.name.trim().toLowerCase() === normalized,
      );
      return item ? item.unitCost : 0;
    }

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
    const priceSuggested = Math.ceil(
      totalCost * (1 + modelo.margemLucro / 100),
    );

    setForm({ ...form, precoUnitario: formatCurrencyInput(priceSuggested, 2) });
    setMessage(`Preço sugerido calculado: R$ ${priceSuggested.toFixed(2)}`);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (formMode === "idle") return;

    const method = editingId ? "PATCH" : "POST";
    const url = editingId ? `/api/vendas?id=${editingId}` : "/api/vendas";

    const payload = {
      ...form,
      precoUnitario: parseCurrencyInput(form.precoUnitario),
    };

    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      const saved = await response.json();
      if (editingId) {
        setVendas((prev) =>
          prev.map((item) => (item.id === saved.id ? saved : item)),
        );
        setMessage("Venda atualizada com sucesso.");
      } else {
        setVendas((prev) => [saved, ...prev]);
        setMessage("Venda registrada com sucesso.");
      }
      resetForm();
    } else {
      const error = await response.json();
      setMessage(error.error || "Erro ao salvar venda.");
    }
  }

  function calculateResumo() {
    const totalVendido = vendas.reduce((sum, v) => sum + v.total, 0);
    const totalRecebidoPix = vendas
      .filter((v) => v.formaPagamento === "Pix - PG")
      .reduce((sum, v) => sum + v.total, 0);
    const totalRecebidoDinheiro = vendas
      .filter((v) => v.formaPagamento === "Dinheiro - PG")
      .reduce((sum, v) => sum + v.total, 0);
    const totalAReceber = vendas
      .filter(
        (v) => v.formaPagamento === "Pix" || v.formaPagamento === "Consignação",
      )
      .reduce((sum, v) => sum + v.total, 0);
    const totalAReceberPix = vendas
      .filter((v) => v.formaPagamento === "Pix")
      .reduce((sum, v) => sum + v.total, 0);
    const totalAReceberConsignacao = vendas
      .filter((v) => v.formaPagamento === "Consignação")
      .reduce((sum, v) => sum + v.total, 0);

    const pedidosPagos = vendas.filter(
      (v) => v.formaPagamento === "Pix - PG",
    ).length;
    const pedidosEntregues = vendas.filter(
      (v) => v.status === "Entregue",
    ).length;
    const pedidosProducao = vendas.filter(
      (v) => v.status === "Produção",
    ).length;
    const pedidosProntos = vendas.filter((v) => v.status === "Pronto").length;
    const pedidosConsignacao = vendas.filter(
      (v) => v.status === "Consignação",
    ).length;
    const pedidosEnviado = vendas.filter((v) => v.status === "Enviado").length;
    const pedidosVendido = vendas.filter((v) => v.status === "Vendido").length;
    const totalVelasVendidas = vendas.reduce((sum, v) => sum + v.quantidade, 0);

    const presentesCount = vendas.filter(
      (v) => v.formaPagamento === "Presente",
    ).length;
    const presentesValue = vendas
      .filter((v) => v.formaPagamento === "Presente")
      .reduce((sum, v) => sum + v.total, 0);

    return {
      totalVendido,
      totalRecebidoPix,
      totalRecebidoDinheiro,
      totalAReceber,
      totalAReceberPix,
      totalAReceberConsignacao,
      pedidosPagos,
      pedidosEntregues,
      pedidosProducao,
      pedidosProntos,
      pedidosConsignacao,
      pedidosEnviado,
      pedidosVendido,
      totalVelasVendidas,
      presentesCount,
      presentesValue,
    };
  }

  const resumo = calculateResumo();
  const filteredVendas = getFilteredVendas();

  function getFilteredVendas() {
    return vendas.filter((venda) => {
      const vendaDate = new Date(venda.dataVenda);
      const inicio = filters.dataInicio ? new Date(filters.dataInicio) : null;
      const fim = filters.dataFim ? new Date(filters.dataFim) : null;

      if (inicio && vendaDate < inicio) return false;
      if (fim && vendaDate > fim) return false;
      if (
        filters.cliente &&
        !venda.cliente.toLowerCase().includes(filters.cliente.toLowerCase())
      )
        return false;
      if (filters.modeloVela && venda.modeloVela !== filters.modeloVela)
        return false;
      if (filters.status && venda.status !== filters.status) return false;
      if (
        filters.formaPagamento &&
        venda.formaPagamento !== filters.formaPagamento
      )
        return false;

      return true;
    });
  }

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <h2>Vendas</h2>
          <p>Registre vendas de velas e acompanhe o resumo das vendas.</p>
        </div>
      </div>
      {message && (
        <div
          style={{
            margin: "16px 0",
            padding: 14,
            background: "rgb(239, 221, 201)",
            border: "1px solid #a7f3d0",
          }}
        >
          {message}
        </div>
      )}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr",
          gap: 24,
          marginTop: 24,
        }}
      >
        <div
          style={{
            background: "rgb(239, 221, 201)",
            padding: 15,
            borderRadius: 12,
            boxShadow: "0 1px 3px rgba(15, 23, 42, 0.08)",
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
                  onChange={(e) =>
                    setForm({ ...form, dataVenda: e.target.value })
                  }
                  style={{
                    width: "100%",
                    marginTop: 6,
                    padding: 8,
                    background:
                      formMode === "idle" ? "#f3f4f6" : "rgb(255, 255, 255)",
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
                    setForm({ ...form, cliente: e.target.value })
                  }
                  style={{
                    width: "100%",
                    marginTop: 6,
                    padding: 8,
                    background:
                      formMode === "idle" ? "#f3f4f6" : "rgb(255, 255, 255)",
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
                  onChange={(e) =>
                    setForm({ ...form, modeloVela: e.target.value })
                  }
                  style={{
                    width: "100%",
                    marginTop: 6,
                    padding: 8,
                    background:
                      formMode === "idle" ? "#f3f4f6" : "rgb(255, 255, 255)",
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
                  onChange={(e) =>
                    setForm({ ...form, quantidade: e.target.value })
                  }
                  style={{
                    width: "100%",
                    marginTop: 6,
                    padding: 8,
                    background:
                      formMode === "idle" ? "#f3f4f6" : "rgb(255, 255, 255)",
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
                    background:
                      formMode === "idle" ? "#f3f4f6" : "rgb(255, 255, 255)",
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
                    background:
                      formMode === "idle" ? "#f3f4f6" : "rgb(255, 255, 255)",
                    border: "1px solid rgb(167, 117, 75)",
                    borderRadius: 6,
                    textAlign: "left",
                  }}
                >
                  <option value="">Escolha</option>
                  {formaPagamentoOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
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
                    background:
                      formMode === "idle" ? "#f3f4f6" : "rgb(255, 255, 255)",
                    border: "1px solid rgb(167, 117, 75)",
                    borderRadius: 6,
                    textAlign: "left",
                  }}
                >
                  <option value="">Escolha</option>
                  {statusOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
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
                    setForm({ ...form, observacao: e.target.value })
                  }
                  style={{
                    width: "100%",
                    marginTop: 6,
                    padding: 8,
                    background:
                      formMode === "idle" ? "#f3f4f6" : "rgb(255, 255, 255)",
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
                  background:
                    formMode === "idle" ? "#a78b58" : "rgb(167, 117, 75)",
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
                  onClick={resetForm}
                  style={{
                    padding: "10px 16px",
                    background: "#ef4444",
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
              gap: 10,
              flexWrap: "wrap",
            }}
          >
            <h3>Vendas Registradas</h3>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button
                type="button"
                onClick={editSelected}
                disabled={selectedItems.size !== 1}
                style={{
                  padding: "8px 16px",
                  background:
                    selectedItems.size === 1
                      ? "rgb(167, 117, 75)"
                      : "rgb(200, 200, 200)",
                  color: "white",
                  border: "none",
                  borderRadius: 6,
                  cursor: selectedItems.size === 1 ? "pointer" : "not-allowed",
                }}
              >
                Editar
              </button>
              <button
                type="button"
                onClick={deleteSelected}
                disabled={selectedItems.size !== 1}
                style={{
                  padding: "8px 16px",
                  background:
                    selectedItems.size === 1 ? "#ef4444" : "rgb(200, 200, 200)",
                  color: "white",
                  border: "none",
                  borderRadius: 6,
                  cursor: selectedItems.size === 1 ? "pointer" : "not-allowed",
                }}
              >
                Excluir
              </button>
            </div>
          </div>
          <div style={{ color: "#6b7280", fontSize: 14, marginTop: 8 }}>
            Exibindo {filteredVendas.length} venda
            {filteredVendas.length === 1 ? "" : "s"}
          </div>

          <div
            style={{
              marginBottom: 20,
              padding: 16,
              background: "rgb(250, 245, 238)",
              borderRadius: 8,
            }}
          >
            <h4>Filtros</h4>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                gap: 12,
              }}
            >
              <label style={{ display: "block" }}>
                Data Início
                <input
                  type="date"
                  value={filters.dataInicio}
                  onChange={(e) =>
                    setFilters({ ...filters, dataInicio: e.target.value })
                  }
                  style={{
                    width: "100%",
                    marginTop: 6,
                    padding: 8,
                    background: "rgb(255, 255, 255)",
                    border: "1px solid rgb(167, 117, 75)",
                    borderRadius: 6,
                    textAlign: "left",
                  }}
                />
              </label>
              <label style={{ display: "block" }}>
                Data Fim
                <input
                  type="date"
                  value={filters.dataFim}
                  onChange={(e) =>
                    setFilters({ ...filters, dataFim: e.target.value })
                  }
                  style={{
                    width: "100%",
                    marginTop: 6,
                    padding: 8,
                    background: "rgb(255, 255, 255)",
                    border: "1px solid rgb(167, 117, 75)",
                    borderRadius: 6,
                    textAlign: "left",
                  }}
                />
              </label>
              <label style={{ display: "block" }}>
                Cliente
                <input
                  value={filters.cliente}
                  onChange={(e) =>
                    setFilters({ ...filters, cliente: e.target.value })
                  }
                  style={{
                    width: "100%",
                    marginTop: 6,
                    padding: 8,
                    background: "rgb(255, 255, 255)",
                    border: "1px solid rgb(167, 117, 75)",
                    borderRadius: 6,
                    textAlign: "left",
                  }}
                />
              </label>
              <label style={{ display: "block" }}>
                Modelo
                <select
                  value={filters.modeloVela}
                  onChange={(e) =>
                    setFilters({ ...filters, modeloVela: e.target.value })
                  }
                  style={{
                    width: "100%",
                    marginTop: 6,
                    padding: 8,
                    textAlign: "left",
                    background: "rgb(255, 255, 255)",
                    border: "1px solid rgb(167, 117, 75)",
                    borderRadius: 6,
                  }}
                >
                  <option value="">Todos</option>
                  {modelos.map((modelo) => (
                    <option key={modelo.id} value={modelo.nome}>
                      {modelo.nome}
                    </option>
                  ))}
                </select>
              </label>
              <label style={{ display: "block" }}>
                Status
                <select
                  value={filters.status}
                  onChange={(e) =>
                    setFilters({ ...filters, status: e.target.value })
                  }
                  style={{
                    width: "100%",
                    marginTop: 6,
                    padding: 8,
                    textAlign: "left",
                    background: "rgb(255, 255, 255)",
                    border: "1px solid rgb(167, 117, 75)",
                    borderRadius: 6,
                  }}
                >
                  <option value="">Todos</option>
                  {statusOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </label>
              <label style={{ display: "block" }}>
                Forma Pagamento
                <select
                  value={filters.formaPagamento}
                  onChange={(e) =>
                    setFilters({ ...filters, formaPagamento: e.target.value })
                  }
                  style={{
                    width: "100%",
                    marginTop: 6,
                    padding: 8,
                    textAlign: "left",
                    background: "rgb(255, 255, 255)",
                    border: "1px solid rgb(167, 117, 75)",
                    borderRadius: 6,
                  }}
                >
                  <option value="">Todos</option>
                  {formaPagamentoOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                  <option value="Outros">Outros</option>
                </select>
              </label>
            </div>
            <button
              onClick={() =>
                setFilters({
                  dataInicio: "",
                  dataFim: "",
                  cliente: "",
                  modeloVela: "",
                  status: "",
                  formaPagamento: "",
                })
              }
              style={{
                marginTop: 12,
                padding: "10px 16px",
                background: "rgb(167, 117, 75)",
                color: "white",
                border: "none",
                borderRadius: 6,
              }}
            >
              Limpar Filtros
            </button>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                minWidth: 1000,
              }}
            >
              <thead style={{ background: "rgb(239, 221, 201)" }}>
                <tr>
                  <th style={{ padding: 12, textAlign: "center" }}>
                    Selecionar
                  </th>
                  <th style={{ padding: 12, textAlign: "center" }}>
                    Data Venda
                  </th>
                  <th style={{ padding: 12, textAlign: "center" }}>Cliente</th>
                  <th style={{ padding: 12, textAlign: "center" }}>Modelo</th>
                  <th style={{ padding: 12, textAlign: "center" }}>Qtd</th>
                  <th style={{ padding: 12, textAlign: "center" }}>
                    Preço Unit. (R$)
                  </th>
                  <th style={{ padding: 12, textAlign: "center" }}>
                    Total (R$)
                  </th>
                  <th style={{ padding: 12, textAlign: "center" }}>
                    Pagamento
                  </th>
                  <th style={{ padding: 12, textAlign: "center" }}>Status</th>
                  <th style={{ padding: 12, textAlign: "center" }}>
                    Observação
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredVendas.map((venda, index) => (
                  <tr
                    key={venda.id}
                    style={{
                      background:
                        index % 2 === 0
                          ? "rgba(255, 255, 255, 0.92)"
                          : "transparent",
                    }}
                  >
                    <td
                      style={{
                        padding: 12,
                        borderTop: "1px solid rgb(167, 117, 75)",
                        textAlign: "center",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={selectedItems.has(venda.id)}
                        onChange={() => toggleSelect(venda.id)}
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
                      {new Date(venda.dataVenda).toLocaleDateString()}
                    </td>
                    <td
                      style={{
                        padding: 12,
                        borderTop: "1px solid rgb(167, 117, 75)",
                        textAlign: "center",
                      }}
                    >
                      {venda.cliente}
                    </td>
                    <td
                      style={{
                        padding: 12,
                        borderTop: "1px solid rgb(167, 117, 75)",
                        textAlign: "center",
                      }}
                    >
                      {venda.modeloVela}
                    </td>
                    <td
                      style={{
                        padding: 12,
                        borderTop: "1px solid rgb(167, 117, 75)",
                        textAlign: "center",
                      }}
                    >
                      {venda.quantidade}
                    </td>
                    <td
                      style={{
                        padding: 12,
                        borderTop: "1px solid rgb(167, 117, 75)",
                        textAlign: "center",
                      }}
                    >
                      R$ {venda.precoUnitario.toFixed(2)}
                    </td>
                    <td
                      style={{
                        padding: 12,
                        borderTop: "1px solid rgb(167, 117, 75)",
                        textAlign: "center",
                      }}
                    >
                      R$ {venda.total.toFixed(2)}
                    </td>
                    <td
                      style={{
                        padding: 12,
                        borderTop: "1px solid rgb(167, 117, 75)",
                        textAlign: "center",
                      }}
                    >
                      {venda.formaPagamento}
                    </td>
                    <td
                      style={{
                        padding: 12,
                        borderTop: "1px solid rgb(167, 117, 75)",
                        textAlign: "center",
                      }}
                    >
                      {venda.status}
                    </td>
                    <td
                      style={{
                        padding: 12,
                        borderTop: "1px solid rgb(167, 117, 75)",
                        textAlign: "center",
                      }}
                    >
                      {venda.observacao}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <div
        style={{
          background: "rgb(239, 221, 201)",
          padding: 20,
          borderRadius: 12,
          boxShadow: "0 1px 3px rgba(15, 23, 42, 0.08)",
        }}
      >
        <h3>Resumo de Pagamentos</h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 16,
          }}
        >
          <div
            style={{
              background: "white",
              padding: 16,
              borderRadius: 10,
              boxShadow: "0 1px 2px rgba(15, 23, 42, 0.08)",
            }}
          >
            <strong>Total Vendido</strong>
            <div style={{ marginTop: 8 }}>
              R$ {resumo.totalVendido.toFixed(2)}
            </div>
          </div>
          <div
            style={{
              background: "white",
              padding: 16,
              borderRadius: 10,
              boxShadow: "0 1px 2px rgba(15, 23, 42, 0.08)",
            }}
          >
            <strong>Total Recebido PIX</strong>
            <div style={{ marginTop: 8 }}>
              R$ {resumo.totalRecebidoPix.toFixed(2)}
            </div>
          </div>
          <div
            style={{
              background: "white",
              padding: 16,
              borderRadius: 10,
              boxShadow: "0 1px 2px rgba(15, 23, 42, 0.08)",
            }}
          >
            <strong>Total Recebido Dinheiro</strong>
            <div style={{ marginTop: 8 }}>
              R$ {resumo.totalRecebidoDinheiro.toFixed(2)}
            </div>
          </div>
          <div
            style={{
              background: "white",
              padding: 16,
              borderRadius: 10,
              boxShadow: "0 1px 2px rgba(15, 23, 42, 0.08)",
            }}
          >
            <strong>Total a Receber</strong>
            <div style={{ marginTop: 8 }}>
              R$ {resumo.totalAReceber.toFixed(2)}
            </div>
          </div>
          <div
            style={{
              background: "white",
              padding: 16,
              borderRadius: 10,
              boxShadow: "0 1px 2px rgba(15, 23, 42, 0.08)",
            }}
          >
            <strong>Total a Receber PIX</strong>
            <div style={{ marginTop: 8 }}>
              R$ {resumo.totalAReceberPix.toFixed(2)}
            </div>
          </div>
          <div
            style={{
              background: "white",
              padding: 16,
              borderRadius: 10,
              boxShadow: "0 1px 2px rgba(15, 23, 42, 0.08)",
            }}
          >
            <strong>Total a Receber Consignação</strong>
            <div style={{ marginTop: 8 }}>
              R$ {resumo.totalAReceberConsignacao.toFixed(2)}
            </div>
          </div>
          <div
            style={{
              background: "white",
              padding: 16,
              borderRadius: 10,
              boxShadow: "0 1px 2px rgba(15, 23, 42, 0.08)",
            }}
          >
            <strong>Pedidos Pagos</strong>
            <div style={{ marginTop: 8 }}>{resumo.pedidosPagos}</div>
          </div>
          <div
            style={{
              background: "white",
              padding: 16,
              borderRadius: 10,
              boxShadow: "0 1px 2px rgba(15, 23, 42, 0.08)",
            }}
          >
            <strong>Pedidos Entregues</strong>
            <div style={{ marginTop: 8 }}>{resumo.pedidosEntregues}</div>
          </div>
          <div
            style={{
              background: "white",
              padding: 16,
              borderRadius: 10,
              boxShadow: "0 1px 2px rgba(15, 23, 42, 0.08)",
            }}
          >
            <strong>Pedidos em Produção</strong>
            <div style={{ marginTop: 8 }}>{resumo.pedidosProducao}</div>
          </div>
          <div
            style={{
              background: "white",
              padding: 16,
              borderRadius: 10,
              boxShadow: "0 1px 2px rgba(15, 23, 42, 0.08)",
            }}
          >
            <strong>Pedidos Prontos</strong>
            <div style={{ marginTop: 8 }}>{resumo.pedidosProntos}</div>
          </div>
          <div
            style={{
              background: "white",
              padding: 16,
              borderRadius: 10,
              boxShadow: "0 1px 2px rgba(15, 23, 42, 0.08)",
            }}
          >
            <strong>Pedidos Consignação</strong>
            <div style={{ marginTop: 8 }}>{resumo.pedidosConsignacao}</div>
          </div>
          <div
            style={{
              background: "white",
              padding: 16,
              borderRadius: 10,
              boxShadow: "0 1px 2px rgba(15, 23, 42, 0.08)",
            }}
          >
            <strong>Pedidos Enviado</strong>
            <div style={{ marginTop: 8 }}>{resumo.pedidosEnviado}</div>
          </div>
          <div
            style={{
              background: "white",
              padding: 16,
              borderRadius: 10,
              boxShadow: "0 1px 2px rgba(15, 23, 42, 0.08)",
            }}
          >
            <strong>Presentes</strong>
            <div style={{ marginTop: 8 }}>
              {resumo.presentesCount} itens — R${" "}
              {resumo.presentesValue.toFixed(2)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
