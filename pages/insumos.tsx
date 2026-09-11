import { useState, useEffect, useRef } from "react";
import { formatCurrencyInput, parseCurrencyInput } from "../lib/currency";
import { useAuth } from "../context";
import { authFetch } from "../lib/apiClient";
import { COLORS } from "../styles/theme";
import InsumoForm, { InsumoFormState } from "../components/insumos/InsumoForm";
import InsumoTable from "../components/insumos/InsumoTable";

type Insumo = {
  id: number;
  name: string;
  active?: boolean;
  unit?: string;
  purchaseCost: number;
  purchasedQuantity: number;
  unitCost: number;
  description?: string;
  productTypes?: string[];
  isBase?: boolean;
};

type Parameter = {
  id: number;
  name: string;
  category: string;
};

export default function Insumos() {
  const { isAuthenticated, canDelete } = useAuth();
  const nameInputRef = useRef<HTMLInputElement>(null);
  const [insumos, setInsumos] = useState<Insumo[]>([]);
  const [unitOptions, setUnitOptions] = useState<Parameter[]>([]);
  const [productTypeOptions, setProductTypeOptions] = useState<Parameter[]>([]);
  const [formMode, setFormMode] = useState<"create" | "edit" | "idle">("idle");
  const [form, setForm] = useState<InsumoFormState>({
    name: "",
    unit: "",
    productTypes: [] as string[],
    purchaseCost: "",
    purchasedQuantity: "",
    description: "",
    active: true,
    isBase: false,
  });

  // ← Coloque este useEffect logo abaixo do useState
  useEffect(() => {
    if (formMode === "create") {
      setForm({
        name: "",
        unit: "",
        productTypes: [],
        purchaseCost: "",
        purchasedQuantity: "",
        description: "",
        active: true,
        isBase: false,
      });
    }
  }, [formMode]);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [message, setMessage] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());
  const [showActiveOnly, setShowActiveOnly] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  function normalizeInsumoName(value: string) {
    return value.trim().toLowerCase().replace(/\s+/g, " ");
  }

  function getComputedUnitCost(
    name: string,
    purchaseCost: number,
    purchasedQuantity: number,
  ) {
    const normalizedName = normalizeInsumoName(name);
    const baseUnitCost =
      purchasedQuantity > 0 ? purchaseCost / purchasedQuantity : 0;
    return normalizedName.includes("pavio natural")
      ? baseUnitCost / 10
      : baseUnitCost;
  }
  // Filtrar e ordenar insumos por ordem alfabetica
  const filteredInsumos = insumos
    .filter((item) => (item.active ?? true) === showActiveOnly)
    .filter((item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    .sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
  // Alternar seleção de item
  function toggleSelect(id: number) {
    if (selectedItems.has(id)) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set([id]));
    }
  }
  // Editar itens selecionados
  function editSelected() {
    if (selectedItems.size === 1) {
      const item = insumos.find((i) => i.id === Array.from(selectedItems)[0]);
      if (item) startEdit(item);
    }
  }

  async function deleteSelected() {
    if (selectedItems.size !== 1) return;

    const id = Array.from(selectedItems)[0];
    const item = insumos.find((i) => i.id === id);
    if (!item) return;

    const confirmed = window.confirm(`Excluir o insumo "${item.name}"?`);
    if (!confirmed) return;

    try {
      const response = await authFetch(`/api/products?id=${id}`, {
        method: "DELETE",
      });
      if (response.ok || response.status === 204) {
        setInsumos((prev) => prev.filter((i) => i.id !== id));
        setSelectedItems(new Set());
        if (editingId === id) {
          resetForm(true);
        }
        setMessage("Insumo excluído com sucesso.");
      } else {
        setMessage("Erro ao excluir insumo.");
      }
    } catch {
      setMessage("Erro inesperado ao excluir insumo.");
    }
  }

  useEffect(() => {
    fetch("/api/products")
      .then(async (res) => {
        const body = await res.text();
        const parsed = body ? JSON.parse(body) : null;

        if (!res.ok) {
          const message = parsed?.error || "Falha ao carregar insumos.";
          throw new Error(message);
        }

        if (!Array.isArray(parsed)) {
          throw new Error("Resposta inválida do servidor.");
        }

        return parsed;
      })
      .then(setInsumos)
      .catch((error) => {
        console.error("Falha ao buscar insumos:", error);
        setMessage(error.message || "Erro ao carregar insumos.");
      });

    fetch("/api/productTypes?category=unit")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setUnitOptions(data);
        } else {
          console.warn("Resposta inválida para unidades de parâmetros.", data);
          setUnitOptions([]);
        }
      })
      .catch((error) => {
        console.warn("Falha ao carregar unidades de parâmetros.", error);
        setUnitOptions([]);
      });

    fetch("/api/productTypes?category=productType")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setProductTypeOptions(data);
        } else {
          console.warn("Resposta inválida para tipos de produto.", data);
          setProductTypeOptions([]);
        }
      })
      .catch((error) => {
        console.warn("Falha ao carregar tipos de produto.", error);
        setProductTypeOptions([]);
      });
  }, []);

  useEffect(() => {
    if (formMode === "create" || formMode === "edit") {
      requestAnimationFrame(() => {
        nameInputRef.current?.focus();
      });
    }
  }, [formMode, editingId]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function resetForm(shouldClearMessage = false) {
    setEditingId(null);
    setFormMode("idle");
    setForm({
      name: "",
      unit: "",
      productTypes: [],
      purchaseCost: "",
      purchasedQuantity: "",
      description: "",
      active: true,
      isBase: false,
    });
    if (shouldClearMessage) {
      setMessage("");
    }
    setSelectedItems(new Set());
  }

  function startNew() {
    setEditingId(null);
    setFormMode("create");
    setForm({
      name: "",
      unit: "",
      productTypes: [],
      purchaseCost: "",
      purchasedQuantity: "",
      description: "",
      active: true,
      isBase: false,
    });
    setSelectedItems(new Set());
    setMessage("");
  }

  function startEdit(item: Insumo) {
    setEditingId(item.id);
    setFormMode("edit");
    setForm({
      name: item.name,
      unit: item.unit ?? "",
      productTypes: item.productTypes ?? [],
      purchaseCost: formatCurrencyInput(item.purchaseCost, 3),
      purchasedQuantity: item.purchasedQuantity.toString(),
      description: item.description ?? "",
      active: item.active ?? true,
      isBase: item.isBase ?? false,
    });
    setMessage("Edição de insumo ativa. Faça as alterações e salve.");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (formMode === "idle") return;

    // Verificar se já existe insumo com o mesmo nome
    const nomeNormalizado = normalizeInsumoName(form.name);
    const existe = insumos.some(
      (i) =>
        normalizeInsumoName(i.name) === nomeNormalizado &&
        (editingId ? i.id !== editingId : true),
    );

    if (existe) {
      setMessage("Já existe um insumo cadastrado com este nome.");
      return;
    }

    const method = editingId ? "PATCH" : "POST";
    const url = editingId ? `/api/products?id=${editingId}` : "/api/products";
    const purchaseCostNumber = parseCurrencyInput(form.purchaseCost);
    const purchasedQuantityNumber = Number(form.purchasedQuantity);
    const computedUnitCost = getComputedUnitCost(
      form.name,
      purchaseCostNumber,
      purchasedQuantityNumber,
    );

    try {
      const response = await authFetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          unit: form.unit,
          productTypes: form.productTypes,
          purchaseCost: purchaseCostNumber,
          purchasedQuantity: purchasedQuantityNumber,
          unitCost: computedUnitCost,
          description: form.description,
          active: form.active,
          isBase: form.isBase,
        }),
      });

      const raw = await response.text();
      const parsed = raw ? JSON.parse(raw) : null;

      if (response.ok) {
        const saved = parsed;
        if (editingId) {
          setInsumos((prev) =>
            prev.map((item) => (item.id === saved.id ? saved : item)),
          );
          resetForm();
          setMessage("Insumo atualizado com sucesso.");
        } else {
          setInsumos((prev) => [saved, ...prev]);
          resetForm();
          setMessage("Insumo cadastrado com sucesso.");
        }
      } else {
        setMessage(parsed?.error || "Erro ao salvar insumo.");
      }
    } catch {
      setMessage("Erro inesperado ao salvar insumo. Tente novamente.");
    }
  }

  return (
    <div>
      <h2>Insumos</h2>
      <p>Cadastre seus insumos como na planilha.</p>

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
          <InsumoForm
            formMode={formMode}
            editingId={editingId}
            form={form}
            setForm={setForm}
            unitOptions={unitOptions}
            productTypeOptions={productTypeOptions}
            nameInputRef={nameInputRef}
            onSubmit={handleSubmit}
            onStartNew={startNew}
            onCancel={() => resetForm(true)}
          />
        )}

        <InsumoTable
          items={filteredInsumos}
          isAuthenticated={isAuthenticated}
          canDelete={canDelete}
          selectedItems={selectedItems}
          onToggleSelect={toggleSelect}
          showActiveOnly={showActiveOnly}
          onToggleActiveFilter={() => {
            setShowActiveOnly((prev) => !prev);
            setSelectedItems(new Set());
          }}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onEdit={editSelected}
          onDelete={deleteSelected}
        />
      </div>
    </div>
  );
}
