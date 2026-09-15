import { useEffect, useState } from "react";
import { formatCurrencyInput, parseCurrencyInput } from "../lib/currency";
import { useAuth } from "../context";
import { authFetch } from "../lib/apiClient";
import { COLORS } from "../styles/theme";
import CompraForm, { CompraFormState } from "../components/compras/CompraForm";
import CompraTable from "../components/compras/CompraTable";


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

type Compra = {
  id: number;
  data: string;
  tipoLancamento: string;
  categoria?: string | null;
  descricao?: string | null;
  valor: number;
  status: string;
  itens?: Array<{
    id: number;
    insumoId?: number | null;
    quantidade: number;
    unidade?: string | null;
    custoUnitario: number;
    custoTotal: number;
    insumo?: { name: string } | null;
  }>;
};

export default function Compras() {
  const { isAuthenticated, canDelete } = useAuth();
  const [insumos, setInsumos] = useState<Insumo[]>([]);
  const [form, setForm] = useState({
    data: "",
    tipoLancamento: "Despesa",
    categoria: "",
    descricao: "",
    valor: "",
    status: "Aprovado",
  });
  const [itens, setItens] = useState<ItemRow[]>([
    {
      insumoId: "",
      quantidade: "",
      unidade: "",
      custoUnitario: "",
      custoTotal: "",
    },
  ]);
  const [compras, setCompras] = useState<Compra[]>([]);
  const [purchaseTypes, setPurchaseTypes] = useState<Parameter[]>([]);
  const [purchaseStatuses, setPurchaseStatuses] = useState<Parameter[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [message, setMessage] = useState("");
  const isFormEditable = isCreating || editingId !== null;
  const expenseTypeName =
    purchaseTypes.find((opt) => opt.name === "Despesa")?.name || "Despesa";
  const inventoryTypeName =
    purchaseTypes.find((opt) => opt.name === "Compra de Insumo")?.name ||
    "Compra de Insumo";
  const defaultStatusName =
    purchaseStatuses.find((opt) => opt.name === "Aprovado")?.name ||
    purchaseStatuses[0]?.name ||
    "Aprovado";
  const isInventoryPurchase = form.tipoLancamento === inventoryTypeName;

  useEffect(() => {
    async function load() {
      const [insumosRes, comprasRes, purchaseTypesRes, purchaseStatusesRes] =
        await Promise.all([
          fetch("/api/products"),
          fetch("/api/compras"),
          fetch("/api/productTypes?category=purchaseType"),
          fetch("/api/productTypes?category=purchaseStatus"),
        ]);

      const insumosData = await insumosRes.json();
      const comprasData = await comprasRes.json();
      const purchaseTypesData = await purchaseTypesRes.json();
      const purchaseStatusesData = await purchaseStatusesRes.json();

      setInsumos(Array.isArray(insumosData) ? insumosData : []);
      setCompras(Array.isArray(comprasData) ? comprasData : []);
      setPurchaseTypes(
        Array.isArray(purchaseTypesData) ? purchaseTypesData : [],
      );
      setPurchaseStatuses(
        Array.isArray(purchaseStatusesData) ? purchaseStatusesData : [],
      );

      setForm((previous) => ({
        ...previous,
        tipoLancamento:
          previous.tipoLancamento ||
          purchaseTypesData.find((opt: Parameter) => opt.name === "Despesa")
            ?.name ||
          "Despesa",
        status:
          previous.status ||
          purchaseStatusesData.find((opt: Parameter) => opt.name === "Aprovado")
            ?.name ||
          "Aprovado",
      }));
    }
    load();
  }, []);

  function updateItem(index: number, field: keyof ItemRow, value: string) {
    const next = [...itens];
    next[index] = { ...next[index], [field]: value } as ItemRow;
    if (field === "insumoId") {
      const insumo = insumos.find((item) => String(item.id) === value);
      next[index].unidade = insumo?.unit || "";
      if (insumo) {
        next[index].custoUnitario = formatCurrencyInput(
          insumo.unitCost || 0,
          3,
        );
      }
    }
    if (field === "quantidade" || field === "custoUnitario") {
      const quantidade = Number(next[index].quantidade || 0);
      const custoUnitario = Number(
        parseCurrencyInput(next[index].custoUnitario || "0"),
      );
      next[index].custoTotal = formatCurrencyInput(
        quantidade * custoUnitario,
        3,
      );
    }
    setItens(next);
  }

  function addItemRow() {
    setItens([
      ...itens,
      {
        insumoId: "",
        quantidade: "",
        unidade: "",
        custoUnitario: "",
        custoTotal: "",
      },
    ]);
  }

  function removeItemRow(index: number) {
    setItens(itens.filter((_, itemIndex) => itemIndex !== index));
  }

  function resetForm() {
    setEditingId(null);
    setIsCreating(false);
    setForm({
      data: "",
      tipoLancamento: expenseTypeName,
      categoria: "",
      descricao: "",
      valor: "",
      status: defaultStatusName,
    });
    setItens([
      {
        insumoId: "",
        quantidade: "",
        unidade: "",
        custoUnitario: "",
        custoTotal: "",
      },
    ]);
  }

  function startNew() {
    setIsCreating(true);
    setEditingId(null);
    setForm({
      data: "",
      tipoLancamento: expenseTypeName,
      categoria: "",
      descricao: "",
      valor: "",
      status: defaultStatusName,
    });
    setItens([
      {
        insumoId: "",
        quantidade: "",
        unidade: "",
        custoUnitario: "",
        custoTotal: "",
      },
    ]);
    setMessage("");
  }

  function startEdit(compra: Compra) {
    setIsCreating(true);
    setEditingId(compra.id);
    setForm({
      data: compra.data.split("T")[0],
      tipoLancamento: compra.tipoLancamento,
      categoria: compra.categoria || "",
      descricao: compra.descricao || "",
      valor: formatCurrencyInput(compra.valor, 3),
      status: compra.status,
    });
    setItens(
      (compra.itens || []).length > 0
        ? (compra.itens || []).map((item) => ({
            insumoId: item.insumoId ? String(item.insumoId) : "",
            quantidade: item.quantidade.toString(),
            unidade: item.unidade || "",
            custoUnitario: formatCurrencyInput(item.custoUnitario, 3),
            custoTotal: formatCurrencyInput(item.custoTotal, 3),
          }))
        : [
            {
              insumoId: "",
              quantidade: "",
              unidade: "",
              custoUnitario: "",
              custoTotal: "",
            },
          ],
    );
    setMessage("Edição ativa. Faça as alterações e salve.");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      ...form,
      valor: parseCurrencyInput(form.valor),
      itens: itens
        .filter((item) => item.insumoId)
        .map((item) => ({
          insumoId: Number(item.insumoId),
          quantidade: Number(item.quantidade || 0),
          unidade: item.unidade || undefined,
          custoUnitario: parseCurrencyInput(item.custoUnitario),
          custoTotal: parseCurrencyInput(item.custoTotal),
        })),
    };

    const url = editingId ? `/api/compras?id=${editingId}` : "/api/compras";
    const method = editingId ? "PATCH" : "POST";

    const res = await authFetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) {
      setMessage(data.error || "Erro ao salvar compra.");
      return;
    }

    setMessage(
      editingId
        ? "Compra atualizada com sucesso."
        : "Compra registrada com sucesso.",
    );
    resetForm();
    const refreshed = await fetch("/api/compras");
    setCompras(await refreshed.json());
  }

  async function deleteCompra(id: number) {
    if (!confirm("Tem certeza que deseja excluir este lançamento?")) return;
    const res = await authFetch(`/api/compras?id=${id}`, { method: "DELETE" });
    if (!res.ok) {
      setMessage("Erro ao excluir lançamento.");
      return;
    }
    setCompras((prev) => prev.filter((item) => item.id !== id));
    setMessage("Lançamento excluído com sucesso.");
  }

  return (
    <div>
      <h2 style={{ marginBottom: 6, color: COLORS.primaryDark }}>Compras e despesas</h2>
      <p style={{ marginTop: 0, color: COLORS.primaryDarkAlt }}>
        Registre compras de insumos e despesas financeiras, com atualização
        automática do estoque quando a compra for aprovada.
      </p>

      {message ? (
        <div
          style={{
            marginBottom: 16,
            padding: 12,
            background: COLORS.successBg,
            border: "1px solid #a7f3d0",
          }}
        >
          {message}
        </div>
      ) : null}

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 20,
          marginTop: 20,
          maxWidth: 1120,
          marginLeft: "auto",
          marginRight: "auto",
        }}
      >
        {isAuthenticated && (
          <CompraForm
            isCreating={isCreating}
            form={form}
            setForm={setForm}
            isFormEditable={isFormEditable}
            purchaseTypes={purchaseTypes}
            purchaseStatuses={purchaseStatuses}
            expenseTypeName={expenseTypeName}
            isInventoryPurchase={isInventoryPurchase}
            itens={itens}
            updateItem={updateItem}
            addItemRow={addItemRow}
            removeItemRow={removeItemRow}
            insumos={insumos}
            handleSubmit={handleSubmit}
            startNew={startNew}
            resetForm={resetForm}
          />
        )}
      </div>

      <CompraTable
        compras={compras}
        isAuthenticated={isAuthenticated}
        canDelete={canDelete}
        startEdit={startEdit}
        deleteCompra={deleteCompra}
      />
    </div>
  );
}
