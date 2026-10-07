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
  desconto?: number;
  obsDesconto?: string;
  frete?: number;
  obsCliente?: string;
  formaPagamento: string;
  status: string;
  observacao?: string;
  itens?: Array<{
    id: number;
    modeloVela: string;
    quantidade: number;
    precoUnitario: number;
    total: number;
    observacao?: string;
  }>;
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

type MessageKind = "success" | "error" | "info";

export default function Vendas() {
  const { canEdit, canDelete } = useAuth();
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
  const [form, setForm] = useState<VendaFormState>({
    dataVenda: "",
    cliente: "",
    formaPagamento: "",
    status: "",
    observacao: "",
    desconto: "0.00",
    observacaoDesconto: "",
    frete: "0.00",
    obsCliente: "",
    itens: [
      { modeloVela: "", quantidade: "", precoUnitario: "", observacao: "" },
    ],
  });
  const [message, setMessage] = useState<string>("");
  const [messageKind, setMessageKind] = useState<MessageKind>("info");
  const [paymentMethods, setPaymentMethods] = useState<Parameter[]>([]);
  const [saleStatuses, setSaleStatuses] = useState<Parameter[]>([]);
  const dataVendaInputRef = useRef<HTMLInputElement>(null);
  const vendasLista = Array.isArray(vendas) ? vendas : [];

  function showMessage(text: string, kind: MessageKind = "success") {
    setMessage(text);
    setMessageKind(kind);
  }

  useEffect(() => {
    async function load() {
      try {
        const [vendasRes, modelosRes, paymentRes, statusRes] =
          await Promise.all([
            authFetch("/api/vendas"),
            authFetch("/api/modelos"),
            authFetch("/api/productTypes?category=paymentMethod"),
            authFetch("/api/productTypes?category=saleStatus"),
          ]);
        const [vendasData, modelosData, paymentData, statusData]: unknown[] =
          await Promise.all([
            vendasRes.json(),
            modelosRes.json(),
            paymentRes.json(),
            statusRes.json(),
          ]);

        const responses = [
          { name: "vendas", response: vendasRes, data: vendasData },
          { name: "modelos", response: modelosRes, data: modelosData },
          {
            name: "formas de pagamento",
            response: paymentRes,
            data: paymentData,
          },
          { name: "status", response: statusRes, data: statusData },
        ];
        const failedResponse = responses.find(
          ({ response, data }) => !response.ok || !Array.isArray(data),
        );

        setVendas(Array.isArray(vendasData) ? (vendasData as Venda[]) : []);
        setModelos(Array.isArray(modelosData) ? (modelosData as Modelo[]) : []);
        setPaymentMethods(
          Array.isArray(paymentData) ? (paymentData as Parameter[]) : [],
        );
        setSaleStatuses(
          Array.isArray(statusData) ? (statusData as Parameter[]) : [],
        );

        if (failedResponse) {
          const errorData = failedResponse.data;
          const detail =
            typeof errorData === "object" &&
            errorData !== null &&
            "error" in errorData &&
            typeof errorData.error === "string"
              ? errorData.error
              : "resposta inválida da API";
          showMessage(
            `Erro ao carregar ${failedResponse.name}: ${detail}`,
            "error",
          );
        }
      } catch {
        setVendas([]);
        showMessage(
          "Não foi possível carregar as vendas. Verifique a conexão e tente novamente.",
          "error",
        );
      }
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
    setForm({
      dataVenda: "",
      cliente: "",
      formaPagamento: "",
      status: "",
      observacao: "",
      desconto: "0.00",
      observacaoDesconto: "",
      frete: "0.00",
      obsCliente: "",
      itens: [
        { modeloVela: "", quantidade: "", precoUnitario: "", observacao: "" },
      ],
    });
    setMessage("");
  }

  function startNew() {
    setEditingId(null);
    setFormMode("new");
    setForm({
      dataVenda: "",
      cliente: "",
      formaPagamento: "",
      status: "",
      observacao: "",
      desconto: "0.00",
      observacaoDesconto: "",
      frete: "0.00",
      obsCliente: "",
      itens: [
        { modeloVela: "", quantidade: "", precoUnitario: "", observacao: "" },
      ],
    });
    setMessage("");
  }

  function startEdit(venda: Venda) {
    setEditingId(venda.id);
    setFormMode("edit");
    const itemRows =
      venda.itens && venda.itens.length > 0
        ? venda.itens.map((item) => ({
            modeloVela: item.modeloVela,
            quantidade: item.quantidade.toString(),
            precoUnitario: formatCurrencyInput(item.precoUnitario, 2),
            observacao: item.observacao ?? "",
          }))
        : [
            {
              modeloVela: venda.modeloVela,
              quantidade: venda.quantidade.toString(),
              precoUnitario: formatCurrencyInput(venda.precoUnitario, 2),
              observacao: venda.observacao ?? "",
            },
          ];

    setForm({
      dataVenda: venda.dataVenda.split("T")[0],
      cliente: venda.cliente,
      formaPagamento: venda.formaPagamento,
      status: venda.status,
      observacao: venda.observacao ?? "",
      desconto: formatCurrencyInput(venda.desconto ?? 0, 2),
      observacaoDesconto: venda.obsDesconto ?? "",
      frete: formatCurrencyInput(venda.frete ?? 0, 2),
      obsCliente: venda.obsCliente ?? "",
      itens: itemRows,
    });
    showMessage("Edição de venda ativa. Faça as alterações e salve.", "info");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function editVenda(id: number) {
    const venda = vendasLista.find((item) => item.id === id);
    if (venda) startEdit(venda);
  }

  async function deleteVenda(id: number) {
    if (!confirm("Tem certeza que deseja excluir esta venda?")) return;

    const response = await authFetch(`/api/vendas?id=${id}`, {
      method: "DELETE",
    });
    if (response.ok) {
      setVendas((prev) =>
        Array.isArray(prev) ? prev.filter((v) => v.id !== id) : [],
      );
      showMessage("Venda excluída com sucesso.");
    } else {
      const error = await response.json();
      showMessage(error.error || "Erro ao excluir venda.", "error");
    }
  }

  async function suggestPrice() {
    const selectedItemIndex = form.itens.findIndex((item) => item.modeloVela);

    if (selectedItemIndex === -1) {
      showMessage("Selecione um modelo primeiro.", "error");
      return;
    }

    const selectedModel = form.itens[selectedItemIndex].modeloVela;

    const [insumosRes, modelosRes] = await Promise.all([
      authFetch("/api/products"),
      authFetch("/api/modelos"),
    ]);
    const insumos = await insumosRes.json();
    const modelosData = await modelosRes.json();
    const modelo = modelosData.find((m: Modelo) => m.nome === selectedModel);

    if (!modelo) {
      showMessage("Modelo não encontrado.", "error");
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

    setForm((prev) => ({
      ...prev,
      itens: prev.itens.map((item, index) =>
        index === selectedItemIndex
          ? { ...item, precoUnitario: formatCurrencyInput(priceSuggested, 3) }
          : item,
      ),
    }));
    showMessage(`Preço sugerido calculado: R$ ${priceSuggested.toFixed(3)}`);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (formMode === "idle") return;

    const itemRows = form.itens.filter(
      (item) => item.modeloVela && Number(item.quantidade || 0) > 0,
    );

    if (itemRows.length === 0) {
      showMessage(
        "Adicione pelo menos um item com quantidade válida.",
        "error",
      );
      return;
    }

    const method = editingId ? "PATCH" : "POST";
    const url = editingId ? `/api/vendas?id=${editingId}` : "/api/vendas";

    const normalizedItens = itemRows.map((item) => ({
      modeloVela: item.modeloVela,
      quantidade: Number(item.quantidade || 0),
      precoUnitario: parseCurrencyInput(item.precoUnitario || "0"),
      observacao: item.observacao || "",
    }));

    const firstItem = normalizedItens[0];
    const subtotalPedido = normalizedItens.reduce(
      (sum, item) => sum + item.quantidade * item.precoUnitario,
      0,
    );
    const descontoValor = Number(parseCurrencyInput(form.desconto || "0"));
    const freteValor = Number(parseCurrencyInput(form.frete || "0"));
    const totalPedido = Math.max(subtotalPedido - descontoValor, 0) + freteValor;

    const payload = {
      dataVenda: form.dataVenda,
      cliente: form.cliente,
      modeloVela: firstItem.modeloVela,
      quantidade: normalizedItens.reduce(
        (sum, item) => sum + item.quantidade,
        0,
      ),
      precoUnitario: firstItem.precoUnitario,
      total: totalPedido,
      desconto: descontoValor,
      obsDesconto: form.observacaoDesconto,
      frete: freteValor,
      obsCliente: form.obsCliente,
      formaPagamento: form.formaPagamento,
      status: form.status,
      observacao: form.observacao,
      itens: normalizedItens,
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
          Array.isArray(prev)
            ? prev.map((item) => (item.id === saved.id ? saved : item))
            : [saved],
        );
      } else {
        setVendas((prev) => [saved, ...(Array.isArray(prev) ? prev : [])]);
      }
      resetForm();
      showMessage(
        editingId
          ? "Venda atualizada com sucesso."
          : "Venda registrada com sucesso.",
      );
      requestAnimationFrame(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    } else {
      const error = await response.json();
      showMessage(error.error || "Erro ao salvar venda.", "error");
    }
  }

  function calculateResumo() {
    // Total vendido e receita não incluem o frete (é repasse); o frete tem card próprio.
    const totalVendido = vendasLista.reduce(
      (sum, v) => sum + Math.max(v.total - Number(v.frete ?? 0), 0),
      0,
    );
    const totalVelasVendidas = vendasLista.reduce(
      (sum, v) => sum + v.quantidade,
      0,
    );
    const receita = totalVendido;
    const vendasComFrete = vendasLista.filter((v) => Number(v.frete ?? 0) > 0);
    const freteSummary = {
      value: vendasComFrete.reduce((sum, v) => sum + Number(v.frete ?? 0), 0),
      count: vendasComFrete.length,
    };

    const paymentSummary = paymentMethods.map((method) => {
      const value = vendasLista
        .filter((v) => v.formaPagamento === method.name)
        .reduce((sum, v) => sum + v.total, 0);
      const count = vendasLista.filter(
        (v) => v.formaPagamento === method.name,
      ).length;
      return { name: method.name, value, count };
    });

    const statusSummary = saleStatuses.map((status) => {
      const count = vendasLista.filter((v) => v.status === status.name).length;
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
      freteSummary,
      statusSummary,
      paymentTotals,
      statusCounts,
    };
  }

  const resumo = calculateResumo();
  const filteredVendas = getFilteredVendas();

  function getFilteredVendas() {
    return vendasLista.filter((venda) => {
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
      if (filters.modeloVela) {
        const modelosDaVenda =
          venda.itens && venda.itens.length > 0
            ? venda.itens.map((item) => item.modeloVela)
            : [venda.modeloVela];
        if (!modelosDaVenda.includes(filters.modeloVela)) return false;
      }
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
            background: messageKind === "error" ? "#fef2f2" : COLORS.successBg,
            border:
              messageKind === "error"
                ? "1px solid #fecaca"
                : "1px solid #a7f3d0",
            color: messageKind === "error" ? "#b91c1c" : "#166534",
            borderRadius: 8,
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
        {canEdit ? (
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
        ) : (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 16,
              flexWrap: "wrap",
              padding: 16,
              background: `linear-gradient(135deg, ${COLORS.cardGradientFrom} 0%, ${COLORS.cardGradientTo} 100%)`,
              border: COLORS.cardBorder,
              borderRadius: 10,
            }}
          >
            <span>
              Seu perfil é de visualização: você pode consultar as vendas, mas
              não lançar ou editar.
            </span>
          </div>
        )}

        <VendaTable
          vendas={filteredVendas}
          isAuthenticated={canEdit}
          canDelete={canDelete}
          onEdit={editVenda}
          onDelete={deleteVenda}
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
