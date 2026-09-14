import { useEffect, useRef, useState } from "react";
import { formatCurrencyInput, parseCurrencyInput } from "../lib/currency";
import { useAuth } from "../context";
import { authFetch } from "../lib/apiClient";
import { COLORS } from "../styles/theme";
import ModeloForm, { ModeloFormState } from "../components/modelos/ModeloForm";
import ModeloTable from "../components/modelos/ModeloTable";


type Insumo = {
  id: number;
  name: string;
  unitCost: number;
  unit?: string;
  productTypes?: string[];
  isBase?: boolean;
};

type Parameter = {
  id: number;
  name: string;
  category: string;
};

type Modelo = {
  id: number;
  nome: string;
  ativo: boolean;
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

export default function Modelos() {
  const { isAuthenticated, canDelete } = useAuth();
  const nomeInputRef = useRef<HTMLInputElement>(null);
  const [modelos, setModelos] = useState<Modelo[]>([]);
  const [insumos, setInsumos] = useState<Insumo[]>([]);
  const [productTypes, setProductTypes] = useState<Parameter[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formMode, setFormMode] = useState<"idle" | "new" | "edit">("idle");
  const [form, setForm] = useState({
    nome: "",
    ativo: true,
    tipoProduto: "",
    baseNome: "",
    base2Nome: "",
    ceraGr: "",
    cera2Gr: "",
    esenciaMl: "",
    essenciaNome: "",
    pavio: "",
    coranteNome: "",
    coranteGr: "",
    recipiente: "",
    pedra: "",
    pedraGr: "",
    extrato: "",
    extratoGr: "",
    lauril: "",
    laurilGr: "",
    oleo: "",
    oleoGr: "",
    argila: "",
    argilaGr: "",
    dioxido: "",
    dioxidoGr: "",
    manteiga: "",
    manteigaGr: "",
    embalagem: "",
    maoDeObra: "",
    margemLucro: "",
  });
  const [message, setMessage] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());
  const [showActiveOnly, setShowActiveOnly] = useState(true);

  function normalizeModelName(value: string) {
    return value.trim().toLowerCase().replace(/\s+/g, " ");
  }

  function updateFormField<K extends keyof typeof form>(
    field: K,
    value: (typeof form)[K],
  ) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleProductTypeChange(value: string) {
    setForm((prev) => ({
      ...prev,
      tipoProduto: value,
      baseNome: "",
      essenciaNome: "",
      pavio: "",
      coranteNome: "",
      recipiente: "",
      pedra: "",
      pedraGr: "",
      extrato: "",
      lauril: "",
      oleo: "",
      argila: "",
      dioxido: "",
      manteiga: "",
    }));
  }

  // Filtrar modelos por status e termo, ordenando alfabeticamente
  const filteredModelos = modelos
    .filter((m) => (m.ativo ?? true) === showActiveOnly)
    .filter((m) => m.nome.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));

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
      const item = modelos.find((m) => m.id === Array.from(selectedItems)[0]);
      if (item) startEdit(item);
    }
  }

  async function deleteSelected() {
    if (selectedItems.size !== 1) return;

    const id = Array.from(selectedItems)[0];
    const item = modelos.find((m) => m.id === id);
    if (!item) return;

    const confirmed = window.confirm(`Excluir o modelo "${item.nome}"?`);
    if (!confirmed) return;

    try {
      const response = await authFetch(`/api/modelos?id=${id}`, {
        method: "DELETE",
      });
      if (response.ok || response.status === 204) {
        setModelos((prev) => prev.filter((m) => m.id !== id));
        setSelectedItems(new Set());
        if (editingId === id) {
          resetForm(true);
        }
        setMessage("Modelo excluído com sucesso.");
      } else {
        setMessage("Erro ao excluir modelo.");
      }
    } catch {
      setMessage("Erro inesperado ao excluir modelo.");
    }
  }

  useEffect(() => {
    fetch("/api/modelos")
      .then((res) => res.json())
      .then((data) => setModelos(Array.isArray(data) ? data : []))
      .catch((error) => {
        console.warn("Falha ao carregar modelos.", error);
        setModelos([]);
      });

    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => setInsumos(Array.isArray(data) ? data : []))
      .catch((error) => {
        console.warn("Falha ao carregar insumos.", error);
        setInsumos([]);
      });

    fetch("/api/productTypes?category=productType")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setProductTypes(data);
        } else {
          console.warn("Resposta inválida para tipos de produto.", data);
          setProductTypes([]);
        }
      })
      .catch((error) => {
        console.warn("Falha ao carregar tipos de produto.", error);
        setProductTypes([]);
      });
  }, []);

  useEffect(() => {
    if (formMode === "new" || formMode === "edit") {
      requestAnimationFrame(() => {
        nomeInputRef.current?.focus();
      });
    }
  }, [formMode, editingId]);

  function resetForm(shouldClearMessage = false) {
    setEditingId(null);
    setFormMode("idle");
    setForm({
      nome: "",
      ativo: true,
      tipoProduto: "",
      baseNome: "",
      base2Nome: "",
      ceraGr: "",
      cera2Gr: "",
      esenciaMl: "",
      essenciaNome: "",
      pavio: "",
      coranteNome: "",
      coranteGr: "",
      recipiente: "",
      pedra: "",
      pedraGr: "",
      extrato: "",
      extratoGr: "",
      lauril: "",
      laurilGr: "",
      oleo: "",
      oleoGr: "",
      argila: "",
      argilaGr: "",
      dioxido: "",
      dioxidoGr: "",
      manteiga: "",
      manteigaGr: "",
      embalagem: "",
      maoDeObra: "",
      margemLucro: "",
    });
    if (shouldClearMessage) {
      setMessage("");
    }
    setSelectedItems(new Set());
  }

  function startNew() {
    setEditingId(null);
    setFormMode("new");
    setForm({
      nome: "",
      ativo: true,
      tipoProduto: "",
      baseNome: "",
      base2Nome: "",
      ceraGr: "",
      cera2Gr: "",
      esenciaMl: "",
      essenciaNome: "",
      pavio: "",
      coranteNome: "",
      coranteGr: "",
      recipiente: "",
      pedra: "",
      pedraGr: "",
      extrato: "",
      extratoGr: "",
      lauril: "",
      laurilGr: "",
      oleo: "",
      oleoGr: "",
      argila: "",
      argilaGr: "",
      dioxido: "",
      dioxidoGr: "",
      manteiga: "",
      manteigaGr: "",
      embalagem: "",
      maoDeObra: "",
      margemLucro: "",
    });
    setSelectedItems(new Set());
    setMessage("");
  }

  function startEdit(modelo: Modelo) {
    setEditingId(modelo.id);
    setFormMode("edit");
    setForm({
      nome: modelo.nome,
      ativo: modelo.ativo !== false, // Treat undefined as true
      tipoProduto: modelo.tipoProduto ?? "",
      baseNome: modelo.baseNome ?? "",
      base2Nome: modelo.base2Nome ?? "",
      ceraGr: modelo.ceraGr.toString(),
      cera2Gr: (modelo.cera2Gr ?? 0).toString(),
      esenciaMl: modelo.esenciaMl.toString(),
      essenciaNome: modelo.essenciaNome ?? "",
      pavio: modelo.pavio ?? "",
      coranteNome: modelo.coranteNome ?? "",
      coranteGr: modelo.coranteGr.toString(),
      recipiente: modelo.recipiente ?? "",
      pedra: modelo.pedra ?? "",
      pedraGr: (modelo.pedraGr ?? 0).toString(),
      extrato: modelo.extrato ?? "",
      extratoGr: modelo.extratoGr.toString(),
      lauril: modelo.lauril ?? "",
      laurilGr: modelo.laurilGr.toString(),
      oleo: modelo.oleo ?? "",
      oleoGr: modelo.oleoGr.toString(),
      argila: modelo.argila ?? "",
      argilaGr: modelo.argilaGr.toString(),
      dioxido: modelo.dioxido ?? "",
      dioxidoGr: modelo.dioxidoGr.toString(),
      manteiga: modelo.manteiga ?? "",
      manteigaGr: modelo.manteigaGr.toString(),
      embalagem: formatCurrencyInput(modelo.embalagem, 3),
      maoDeObra: formatCurrencyInput(modelo.maoDeObra, 3),
      margemLucro: modelo.margemLucro.toString(),
    });
    setMessage("Edição de modelo ativa. Faça as alterações e salve.");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (formMode === "idle") return;

    // Verificar se já existe modelo com o mesmo nome
    const nomeNormalizado = normalizeModelName(form.nome);
    const existe = modelos.some(
      (m) =>
        normalizeModelName(m.nome) === nomeNormalizado &&
        (editingId ? m.id !== editingId : true),
    );

    if (existe) {
      setMessage("Já existe um modelo cadastrado com este nome.");
      return;
    }

    const method = editingId ? "PATCH" : "POST";
    const url = editingId ? `/api/modelos?id=${editingId}` : "/api/modelos";

    try {
      const response = await authFetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: form.nome,
          ativo: editingId ? Boolean(form.ativo) : true,
          tipoProduto: form.tipoProduto,
          baseNome: form.baseNome,
          base2Nome: form.base2Nome,
          ceraGr: Number(form.ceraGr),
          cera2Gr: Number(form.cera2Gr),
          esenciaMl: Number(form.esenciaMl),
          essenciaNome: form.essenciaNome,
          pavio: form.pavio,
          coranteNome: form.coranteNome,
          coranteGr: Number(form.coranteGr),
          recipiente: form.recipiente,
          pedra: form.pedra,
          pedraGr: Number(form.pedraGr),
          extrato: form.extrato,
          extratoGr: Number(form.extratoGr),
          lauril: form.lauril,
          laurilGr: Number(form.laurilGr),
          oleo: form.oleo,
          oleoGr: Number(form.oleoGr),
          argila: form.argila,
          argilaGr: Number(form.argilaGr),
          dioxido: form.dioxido,
          dioxidoGr: Number(form.dioxidoGr),
          manteiga: form.manteiga,
          manteigaGr: Number(form.manteigaGr),
          embalagem: parseCurrencyInput(form.embalagem),
          maoDeObra: parseCurrencyInput(form.maoDeObra),
          margemLucro: Number(form.margemLucro),
        }),
      });

      const raw = await response.text();
      const parsed = raw ? JSON.parse(raw) : null;

      if (response.ok) {
        const saved = parsed;
        if (editingId) {
          setModelos((prev) =>
            prev.map((item) => (item.id === saved.id ? saved : item)),
          );
          resetForm();
          setMessage("Modelo atualizado com sucesso.");
        } else {
          setModelos((prev) => [saved, ...prev]);
          resetForm();
          setMessage("Modelo cadastrado com sucesso.");
        }
      } else {
        setMessage(parsed?.error || "Erro ao salvar modelo.");
      }
    } catch {
      setMessage("Erro inesperado ao salvar modelo. Tente novamente.");
    }
  }

  const isValidProductType = (item: Insumo) =>
    !form.tipoProduto ||
    !item.productTypes ||
    item.productTypes.length === 0 ||
    item.productTypes.includes(form.tipoProduto);

  const essencias = insumos
    .filter(isValidProductType)
    .filter(
      (i) =>
        i.name.toLowerCase().includes("essência") ||
        i.name.toLowerCase().includes("oleo") ||
        i.name.toLowerCase().includes("essencia"),
    )
    .sort((a, b) => a.name.localeCompare(b.name));
  const recipients = insumos
    .filter(isValidProductType)
    .filter(
      (i) =>
        i.name.toLowerCase().includes("recipiente") ||
        i.name.toLowerCase().includes("vaso") ||
        i.name.toLowerCase().includes("vidro") ||
        i.name.toLowerCase().includes("pot"),
    )
    .sort((a, b) => a.name.localeCompare(b.name));
  const wicks = insumos
    .filter(isValidProductType)
    .filter((i) => i.name.toLowerCase().includes("pavio"))
    .sort((a, b) => a.name.localeCompare(b.name));
  const dyes = insumos
    .filter(isValidProductType)
    .filter((i) => i.name.toLowerCase().includes("corante"))
    .sort((a, b) => a.name.localeCompare(b.name));
  const bases = insumos
    .filter(isValidProductType)
    .filter((i) => i.isBase)
    .sort((a, b) => a.name.localeCompare(b.name));
  const stones = insumos
    .filter(isValidProductType)
    .filter(
      (i) =>
        i.name.toLowerCase().includes("pedra") ||
        i.name.toLowerCase().includes("strass"),
    )
    .sort((a, b) => a.name.localeCompare(b.name));
  const extracts = insumos
    .filter(isValidProductType)
    .filter((i) => i.name.toLowerCase().includes("extrato"))
    .sort((a, b) => a.name.localeCompare(b.name));
  const surfactants = insumos
    .filter(isValidProductType)
    .filter((i) => i.name.toLowerCase().includes("lauril"))
    .sort((a, b) => a.name.localeCompare(b.name));
  const oils = insumos
    .filter(isValidProductType)
    .filter(
      (i) =>
        i.name.toLowerCase().includes("óleo") ||
        i.name.toLowerCase().includes("oleo"),
    )
    .sort((a, b) => a.name.localeCompare(b.name));
  const clays = insumos
    .filter(isValidProductType)
    .filter((i) => i.name.toLowerCase().includes("argila"))
    .sort((a, b) => a.name.localeCompare(b.name));
  const dioxides = insumos
    .filter(isValidProductType)
    .filter(
      (i) =>
        i.name.toLowerCase().includes("dióxido") ||
        i.name.toLowerCase().includes("dioxido"),
    )
    .sort((a, b) => a.name.localeCompare(b.name));
  const butters = insumos
    .filter(isValidProductType)
    .filter((i) => i.name.toLowerCase().includes("manteiga"))
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div>
      <h2>Modelos</h2>
      <p>
        Cadastre os modelos usados para produção. Esses dados serão base para o
        cálculo de preço final.
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
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr)",
          gap: 20,
          marginTop: 20,
          width: "100%",
          maxWidth: 1120,
          marginLeft: "auto",
          marginRight: "auto",
        }}
      >
        {isAuthenticated && (
          <ModeloForm
            formMode={formMode}
            editingId={editingId}
            form={form}
            setForm={setForm}
            productTypes={productTypes}
            bases={bases}
            essencias={essencias}
            wicks={wicks}
            dyes={dyes}
            recipients={recipients}
            stones={stones}
            extracts={extracts}
            surfactants={surfactants}
            oils={oils}
            clays={clays}
            dioxides={dioxides}
            butters={butters}
            nomeInputRef={nomeInputRef}
            handleSubmit={handleSubmit}
            startNew={startNew}
            resetForm={resetForm}
          />
        )}

        <ModeloTable
          filteredModelos={filteredModelos}
          isAuthenticated={isAuthenticated}
          canDelete={canDelete}
          selectedItems={selectedItems}
          toggleSelect={toggleSelect}
          editSelected={editSelected}
          deleteSelected={deleteSelected}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          showActiveOnly={showActiveOnly}
          setShowActiveOnly={setShowActiveOnly}
          setSelectedItems={setSelectedItems}
        />
      </div>
    </div>
  );
}
