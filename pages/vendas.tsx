import { useEffect, useRef, useState } from "react";
import { formatCurrencyInput, parseCurrencyInput } from "../lib/currency";
import { useAuth } from "../context";
import { authFetch } from "../lib/apiClient";
import { COLORS } from "../styles/theme";
import VendaForm, { VendaFormState } from "../components/vendas/VendaForm";
import VendaTable, { VendaFilters } from "../components/vendas/VendaTable";
import VendaResumo from "../components/vendas/VendaResumo";

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
  baseNome?: string;
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

type Parameter = {
  id: number;
  name: string;
  category: string;
};

export default function Vendas() {
  const { isAuthenticated, canDelete } = useAuth();
  const [vendas, setVendas] = useState<Venda[]>([]);
  const [modelos, setModelos] = useState<Modelo[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formMode, setFormMode] = useState<"idle" | "new" | "edit">("idle");
  const [filters, setFilters] = useState<VendaFilters>({
    dataInicio: "",
    dataFim: "",
    cliente: "",
    modeloVela: "",
    status: "",
    formaPagamento: "",
  });
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());
  const [form, setForm] = useState<VendaFormState>({
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
  const [paymentMethods, setPaymentMethods] = useState<Parameter[]>([]);
  const [saleStatuses, setSaleStatuses] = useState<Parameter[]>([]);
  const dataVendaInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function load() {
      const [vendasRes, modelosRes, paymentRes, statusRes] = await Promise.all([
        fetch("/api/vendas"),
        fetch("/api/modelos"),
        fetch("/api/productTypes?category=paymentMethod"),
        fetch("/api/productTypes?category=saleStatus"),
      ]);
      setVendas(await vendasRes.json());
      setModelos(await modelosRes.json());
      setPaymentMethods(await paymentRes.json());
      setSaleStatuses(await statusRes.json());
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
      precoUnitario: formatCurrencyInput(venda.precoUnitario, 3),
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

    const response = await authFetch(`/api/vendas?id=${id}`, { method: "DELETE" });
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

    const baseName = modelo.baseNome || "Cera de Coco";
    const ceraCost = modelo.ceraGr * findUnitCost(insumos, baseName);
    const esenciaCost =
      modelo.esenciaMl * findUnitCost(insumos, modelo.essenciaNome);
    const pavioCost = 1 * findUnitCost(insumos, modelo.pavio);
    const coranteCost =
      modelo.coranteGr * findUnitCost(insumos, modelo.coranteNome);
    const recipienteCost = 1 * findUnitCost(insumos, modelo.recipiente);
    const pedraCost = 1 * findUnitCost(insumos, modelo.pedra);
    const extratoCost =
      modelo.extratoGr * findUnitCost(insumos, modelo.extrato);
    const laurilCost = modelo.laurilGr * findUnitCost(insumos, modelo.lauril);

    const insumoCost =
      ceraCost +
      esenciaCost +
      pavioCost +
      coranteCost +
      recipienteCost +
      pedraCost +
      extratoCost +
      laurilCost;
    const fixedCost = modelo.embalagem + modelo.maoDeObra;
    const totalCost = insumoCost + fixedCost;
    const priceSuggested = Math.ceil(
      totalCost * (1 + modelo.margemLucro / 100),
    );

    setForm({ ...form, precoUnitario: formatCurrencyInput(priceSuggested, 3) });
    setMessage(`Preço sugerido calculado: R$ ${priceSuggested.toFixed(3)}`);
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

    const response = await authFetch(url, {
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
    const totalVelasVendidas = vendas.reduce((sum, v) => sum + v.quantidade, 0);
    const receita = totalVendido;

    const paymentSummary = paymentMethods.map((method) => {
      const value = vendas
        .filter((v) => v.formaPagamento === method.name)
        .reduce((sum, v) => sum + v.total, 0);
      const count = vendas.filter(
        (v) => v.formaPagamento === method.name,
      ).length;
      return { name: method.name, value, count };
    });

    const statusSummary = saleStatuses.map((status) => {
      const count = vendas.filter((v) => v.status === status.name).length;
      return { name: status.name, count };
    });

    const paymentTotals = paymentSummary.reduce(
      (acc, item) => {
        acc[item.name] = item.value;
        return acc;
      },
      {} as Record<string, number>,
    );

    const statusCounts = statusSummary.reduce(
      (acc, item) => {
        acc[item.name] = item.count;
        return acc;
      },
      {} as Record<string, number>,
    );

    return {
      totalVendido,
      receita,
      totalVelasVendidas,
      paymentSummary,
      statusSummary,
      paymentTotals,
      statusCounts,
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
            background: `linear-gradient(135deg, ${COLORS.cardGradientFrom} 0%, ${COLORS.cardGradientTo} 100%)`,
            border: COLORS.cardBorder,
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
        {isAuthenticated && (
          <VendaForm
            formMode={formMode}
            editingId={editingId}
            form={form}
            setForm={setForm}
            modelos={modelos}
            paymentMethods={paymentMethods}
            saleStatuses={saleStatuses}
            dataVendaInputRef={dataVendaInputRef}
            onSubmit={handleSubmit}
            onStartNew={startNew}
            onCancel={resetForm}
          />
        )}

        <VendaTable
          vendas={filteredVendas}
          isAuthenticated={isAuthenticated}
          canDelete={canDelete}
          selectedItems={selectedItems}
          onToggleSelect={toggleSelect}
          onEdit={editSelected}
          onDelete={deleteSelected}
          filters={filters}
          setFilters={setFilters}
          modelos={modelos}
          saleStatuses={saleStatuses}
          paymentMethods={paymentMethods}
          onClearFilters={() =>
            setFilters({
              dataInicio: "",
              dataFim: "",
              cliente: "",
              modeloVela: "",
              status: "",
              formaPagamento: "",
            })
          }
        />
      </div>
      <VendaResumo resumo={resumo} />
    </div>
  );
}
