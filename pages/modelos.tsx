import { useEffect, useRef, useState } from "react";
import {
  formatCurrencyInput,
  parseCurrencyInput,
  sanitizeCurrencyInput,
} from "../lib/currency";

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
      const response = await fetch(`/api/modelos?id=${id}`, {
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
      const response = await fetch(url, {
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

  const fieldLabelStyle = {
    display: "block" as const,
    marginBottom: 10,
    fontWeight: 600,
    color: "#6b3b12",
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
            background: "#ecfdf5",
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
        <div
          style={{
            background: "linear-gradient(135deg, #f7e8d7 0%, #efd9c2 100%)",
            padding: 22,
            borderRadius: 16,
            boxShadow: "0 12px 30px rgba(92, 54, 24, 0.12)",
            border: "1px solid rgba(166, 116, 71, 0.2)",
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
              <h3 style={{ margin: 0, color: "#6b3b12" }}>
                {editingId ? "Editar modelo" : "Novo modelo"}
              </h3>
              <p style={{ margin: "4px 0 0", color: "#8a5a2b", fontSize: 13 }}>
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
                  Nome da vela
                  <input
                    ref={nomeInputRef}
                    required
                    disabled={formMode === "idle"}
                    value={form.nome}
                    onChange={(e) => setForm({ ...form, nome: e.target.value })}
                    style={{
                      width: "100%",
                      marginTop: 6,
                      padding: "8px 10px",
                      background: "rgb(255, 255, 255)",
                      border: "1px solid rgb(166, 116, 71)",
                      borderRadius: 8,
                      fontSize: 13,
                      boxSizing: "border-box",
                    }}
                  />
                </label>
                <label style={fieldLabelStyle}>
                  Tipo de produto
                  <select
                    disabled={formMode === "idle"}
                    value={form.tipoProduto}
                    onChange={(e) => handleProductTypeChange(e.target.value)}
                    style={{
                      width: "100%",
                      marginTop: 6,
                      padding: "8px 10px",
                      background: "rgb(255, 255, 255)",
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
                    style={{ marginTop: 6, fontSize: 13, color: "#7c3d12" }}
                  ></div>
                </label>
                <label style={fieldLabelStyle}>
                  Base
                  <select
                    disabled={formMode === "idle"}
                    value={form.baseNome}
                    onChange={(e) =>
                      setForm({ ...form, baseNome: e.target.value })
                    }
                    style={{
                      width: "100%",
                      marginTop: 6,
                      padding: "8px 10px",
                      background: "rgb(255, 255, 255)",
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
                    <label style={{ fontSize: 13, color: "#7c3d12" }}>
                      Base secundária (opcional)
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
                        background: "rgb(255, 255, 255)",
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
              <h4 style={{ margin: "0 0 8px", color: "#6b3b12" }}>
                Ingredientes e custos
              </h4>
              <p style={{ margin: "0 0 12px", color: "#8a5a2b", fontSize: 13 }}>
                Ajuste os componentes da receita e os valores de produção.
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
                  disabled={formMode === "idle"}
                  value={form.ceraGr}
                  onChange={(e) => setForm({ ...form, ceraGr: e.target.value })}
                  style={{
                    width: "100%",
                    marginTop: 6,
                    padding: 8,
                    background: "rgb(255, 255, 255)",
                    border: "1px solid rgb(166, 116, 71)",
                    borderRadius: 6,
                  }}
                />
              </label>
              <label style={{ display: "block" }}>
                Base 2 (g) (opcional)
                <input
                  type="number"
                  disabled={formMode === "idle"}
                  value={form.cera2Gr}
                  onChange={(e) =>
                    setForm({ ...form, cera2Gr: e.target.value })
                  }
                  style={{
                    width: "100%",
                    marginTop: 6,
                    padding: 8,
                    background: "rgb(255, 255, 255)",
                    border: "1px solid rgb(166, 116, 71)",
                    borderRadius: 6,
                  }}
                />
              </label>
              <label style={{ display: "block" }}>
                Essência (ml)
                <input
                  type="number"
                  disabled={formMode === "idle"}
                  value={form.esenciaMl}
                  onChange={(e) =>
                    setForm({ ...form, esenciaMl: e.target.value })
                  }
                  style={{
                    width: "100%",
                    marginTop: 6,
                    padding: 8,
                    background: "rgb(255, 255, 255)",
                    border: "1px solid rgb(166, 116, 71)",
                    borderRadius: 6,
                  }}
                />
              </label>
              <label style={{ display: "block" }}>
                Essência Nome
                <select
                  disabled={formMode === "idle"}
                  value={form.essenciaNome}
                  onChange={(e) =>
                    setForm({ ...form, essenciaNome: e.target.value })
                  }
                  style={{
                    width: "100%",
                    marginTop: 6,
                    padding: 8,
                    background: "rgb(255, 255, 255)",
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
                Pavio
                <select
                  disabled={formMode === "idle"}
                  value={form.pavio}
                  onChange={(e) => setForm({ ...form, pavio: e.target.value })}
                  style={{
                    width: "100%",
                    marginTop: 6,
                    padding: 8,
                    background: "rgb(255, 255, 255)",
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
                  disabled={formMode === "idle"}
                  value={form.coranteNome}
                  onChange={(e) =>
                    setForm({ ...form, coranteNome: e.target.value })
                  }
                  style={{
                    width: "100%",
                    marginTop: 6,
                    padding: 8,
                    background: "rgb(255, 255, 255)",
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
                  disabled={formMode === "idle"}
                  value={form.coranteGr}
                  onChange={(e) =>
                    setForm({ ...form, coranteGr: e.target.value })
                  }
                  style={{
                    width: "100%",
                    marginTop: 6,
                    padding: 8,
                    background: "rgb(255, 255, 255)",
                    border: "1px solid rgb(166, 116, 71)",
                    borderRadius: 6,
                  }}
                />
              </label>
              <label style={{ display: "block" }}>
                Recipiente
                <select
                  disabled={formMode === "idle"}
                  value={form.recipiente}
                  onChange={(e) =>
                    setForm({ ...form, recipiente: e.target.value })
                  }
                  style={{
                    width: "100%",
                    marginTop: 6,
                    padding: 8,
                    background: "rgb(255, 255, 255)",
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
                  disabled={formMode === "idle"}
                  value={form.pedra}
                  onChange={(e) => setForm({ ...form, pedra: e.target.value })}
                  style={{
                    width: "100%",
                    marginTop: 6,
                    padding: 8,
                    background: "rgb(255, 255, 255)",
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
                  disabled={formMode === "idle"}
                  type="number"
                  step={0.01}
                  min={0}
                  value={form.pedraGr}
                  onChange={(e) =>
                    setForm({ ...form, pedraGr: e.target.value })
                  }
                  style={{
                    width: "100%",
                    marginTop: 6,
                    padding: 8,
                    background: "rgb(255, 255, 255)",
                    border: "1px solid rgb(166, 116, 71)",
                    borderRadius: 6,
                  }}
                />
              </label>
              <label style={{ display: "block" }}>
                Extrato
                <select
                  disabled={formMode === "idle"}
                  value={form.extrato}
                  onChange={(e) =>
                    setForm({ ...form, extrato: e.target.value })
                  }
                  style={{
                    width: "100%",
                    marginTop: 6,
                    padding: 8,
                    background: "rgb(255, 255, 255)",
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
                Extrato (g)
                <input
                  type="number"
                  disabled={formMode === "idle"}
                  value={form.extratoGr}
                  onChange={(e) =>
                    setForm({ ...form, extratoGr: e.target.value })
                  }
                  style={{
                    width: "100%",
                    marginTop: 6,
                    padding: 8,
                    background: "rgb(255, 255, 255)",
                    border: "1px solid rgb(166, 116, 71)",
                    borderRadius: 6,
                  }}
                />
              </label>
              <label style={{ display: "block" }}>
                Lauril
                <select
                  disabled={formMode === "idle"}
                  value={form.lauril}
                  onChange={(e) => setForm({ ...form, lauril: e.target.value })}
                  style={{
                    width: "100%",
                    marginTop: 6,
                    padding: 8,
                    background: "rgb(255, 255, 255)",
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
                Lauril (g)
                <input
                  type="number"
                  disabled={formMode === "idle"}
                  value={form.laurilGr}
                  onChange={(e) =>
                    setForm({ ...form, laurilGr: e.target.value })
                  }
                  style={{
                    width: "100%",
                    marginTop: 6,
                    padding: 8,
                    background: "rgb(255, 255, 255)",
                    border: "1px solid rgb(166, 116, 71)",
                    borderRadius: 6,
                  }}
                />
              </label>
              <label style={{ display: "block" }}>
                Óleo
                <select
                  disabled={formMode === "idle"}
                  value={form.oleo}
                  onChange={(e) => setForm({ ...form, oleo: e.target.value })}
                  style={{
                    width: "100%",
                    marginTop: 6,
                    padding: 8,
                    background: "rgb(255, 255, 255)",
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
                Óleo (g)
                <input
                  type="number"
                  disabled={formMode === "idle"}
                  value={form.oleoGr}
                  onChange={(e) => setForm({ ...form, oleoGr: e.target.value })}
                  style={{
                    width: "100%",
                    marginTop: 6,
                    padding: 8,
                    background: "rgb(255, 255, 255)",
                    border: "1px solid rgb(166, 116, 71)",
                    borderRadius: 6,
                  }}
                />
              </label>
              <label style={{ display: "block" }}>
                Argila
                <select
                  disabled={formMode === "idle"}
                  value={form.argila}
                  onChange={(e) => setForm({ ...form, argila: e.target.value })}
                  style={{
                    width: "100%",
                    marginTop: 6,
                    padding: 8,
                    background: "rgb(255, 255, 255)",
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
                  disabled={formMode === "idle"}
                  value={form.argilaGr}
                  onChange={(e) =>
                    setForm({ ...form, argilaGr: e.target.value })
                  }
                  style={{
                    width: "100%",
                    marginTop: 6,
                    padding: 8,
                    background: "rgb(255, 255, 255)",
                    border: "1px solid rgb(166, 116, 71)",
                    borderRadius: 6,
                  }}
                />
              </label>
              <label style={{ display: "block" }}>
                Dióxido
                <select
                  disabled={formMode === "idle"}
                  value={form.dioxido}
                  onChange={(e) =>
                    setForm({ ...form, dioxido: e.target.value })
                  }
                  style={{
                    width: "100%",
                    marginTop: 6,
                    padding: 8,
                    background: "rgb(255, 255, 255)",
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
                  disabled={formMode === "idle"}
                  value={form.dioxidoGr}
                  onChange={(e) =>
                    setForm({ ...form, dioxidoGr: e.target.value })
                  }
                  style={{
                    width: "100%",
                    marginTop: 6,
                    padding: 8,
                    background: "rgb(255, 255, 255)",
                    border: "1px solid rgb(166, 116, 71)",
                    borderRadius: 6,
                  }}
                />
              </label>
              <label style={{ display: "block" }}>
                Manteiga
                <select
                  disabled={formMode === "idle"}
                  value={form.manteiga}
                  onChange={(e) =>
                    setForm({ ...form, manteiga: e.target.value })
                  }
                  style={{
                    width: "100%",
                    marginTop: 6,
                    padding: 8,
                    background: "rgb(255, 255, 255)",
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
                  disabled={formMode === "idle"}
                  value={form.manteigaGr}
                  onChange={(e) =>
                    setForm({ ...form, manteigaGr: e.target.value })
                  }
                  style={{
                    width: "100%",
                    marginTop: 6,
                    padding: 8,
                    background: "rgb(255, 255, 255)",
                    border: "1px solid rgb(166, 116, 71)",
                    borderRadius: 6,
                  }}
                />
              </label>
              <label style={{ display: "block" }}>
                Embalagem (R$)
                <input
                  type="text"
                  inputMode="decimal"
                  step="0.001"
                  disabled={formMode === "idle"}
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
                    background: "rgb(255, 255, 255)",
                    border: "1px solid rgb(166, 116, 71)",
                    borderRadius: 6,
                  }}
                />
              </label>
              <label style={{ display: "block" }}>
                Mão de obra (R$)
                <input
                  type="text"
                  inputMode="decimal"
                  step="0.001"
                  disabled={formMode === "idle"}
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
                    background: "rgb(255, 255, 255)",
                    border: "1px solid rgb(166, 116, 71)",
                    borderRadius: 6,
                  }}
                />
              </label>
              <label style={{ display: "block" }}>
                Margem Lucro (%)
                <input
                  type="number"
                  disabled={formMode === "idle"}
                  value={form.margemLucro}
                  onChange={(e) =>
                    setForm({ ...form, margemLucro: e.target.value })
                  }
                  style={{
                    width: "100%",
                    marginTop: 6,
                    padding: 8,
                    background: "rgb(255, 255, 255)",
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
                        ? "rgb(34, 197, 94)"
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
                disabled={formMode === "idle"}
                style={{
                  padding: "10px 16px",
                  background:
                    formMode === "idle"
                      ? "rgb(200, 200, 200)"
                      : "linear-gradient(135deg, #a76f4b 0%, #8c5331 100%)",
                  color: "white",
                  border: "none",
                  borderRadius: 999,
                  cursor: formMode === "idle" ? "not-allowed" : "pointer",
                  fontWeight: 600,
                }}
              >
                {editingId ? "Atualizar modelo" : "Salvar modelo"}
              </button>
              {(formMode === "new" || formMode === "edit") && (
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

        <div
          style={{
            background: "linear-gradient(135deg, #f7e8d7 0%, #efd9c2 100%)",
            padding: 22,
            borderRadius: 16,
            boxShadow: "0 12px 30px rgba(92, 54, 24, 0.12)",
            border: "1px solid rgba(166, 116, 71, 0.2)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <h3>Modelos cadastrados</h3>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  color: "rgb(120, 53, 15)",
                }}
              >
                <span>{showActiveOnly ? "Ativos" : "Inativos"}</span>
                <button
                  type="button"
                  onClick={() => {
                    setShowActiveOnly((prev) => !prev);
                    setSelectedItems(new Set());
                  }}
                  aria-label={
                    showActiveOnly ? "Filtro em ativos" : "Filtro em inativos"
                  }
                  style={{
                    width: 46,
                    height: 26,
                    borderRadius: 13,
                    border: "none",
                    cursor: "pointer",
                    background: showActiveOnly
                      ? "rgb(34, 197, 94)"
                      : "rgb(156, 163, 175)",
                    position: "relative",
                    padding: 0,
                  }}
                >
                  <span
                    style={{
                      position: "absolute",
                      top: 3,
                      left: showActiveOnly ? 23 : 3,
                      width: 20,
                      height: 20,
                      borderRadius: "50%",
                      background: "white",
                      transition: "left 0.2s ease",
                    }}
                  />
                </button>
              </label>
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
                    selectedItems.size === 1
                      ? "rgb(220, 38, 38)"
                      : "rgb(200, 200, 200)",
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
                background: "rgb(255, 255, 255)",
              }}
            />
          </div>

          {filteredModelos.length === 0 ? (
            <p>Nenhum modelo cadastrado ainda.</p>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  minWidth: 800,
                }}
              >
                <thead>
                  <tr>
                    <th style={{ padding: 8, textAlign: "center" }}>
                      Selecionar
                    </th>
                    <th style={{ padding: 8, textAlign: "left" }}>Nome</th>
                    <th style={{ padding: 8, textAlign: "left" }}>Base</th>
                    <th style={{ padding: 8, textAlign: "right" }}>Base (g)</th>
                    <th style={{ padding: 8, textAlign: "right" }}>
                      Essência (ml)
                    </th>
                    <th style={{ padding: 8, textAlign: "left" }}>Essência</th>
                    <th style={{ padding: 8, textAlign: "left" }}>Pavio</th>
                    <th style={{ padding: 8, textAlign: "left" }}>Corante</th>
                    <th style={{ padding: 8, textAlign: "right" }}>
                      Corante (g)
                    </th>
                    <th style={{ padding: 8, textAlign: "left" }}>
                      Recipiente
                    </th>
                    <th style={{ padding: 8, textAlign: "left" }}>Pedra</th>
                    <th style={{ padding: 8, textAlign: "left" }}>Óleo</th>
                    <th style={{ padding: 8, textAlign: "right" }}>Óleo (g)</th>
                    <th style={{ padding: 8, textAlign: "left" }}>Argila</th>
                    <th style={{ padding: 8, textAlign: "right" }}>
                      Argila (g)
                    </th>
                    <th style={{ padding: 8, textAlign: "left" }}>Dióxido</th>
                    <th style={{ padding: 8, textAlign: "right" }}>
                      Dióxido (g)
                    </th>
                    <th style={{ padding: 8, textAlign: "left" }}>Manteiga</th>
                    <th style={{ padding: 8, textAlign: "right" }}>
                      Manteiga (g)
                    </th>
                    <th style={{ padding: 8, textAlign: "left" }}>Extrato</th>
                    <th style={{ padding: 8, textAlign: "right" }}>
                      Extrato (g)
                    </th>
                    <th style={{ padding: 8, textAlign: "left" }}>Lauril</th>
                    <th style={{ padding: 8, textAlign: "right" }}>
                      Lauril (g)
                    </th>
                    <th style={{ padding: 8, textAlign: "right" }}>Emb.</th>
                    <th style={{ padding: 8, textAlign: "right" }}>M.Obra</th>
                    <th style={{ padding: 8, textAlign: "right" }}>Margem</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredModelos.map((modelo) => (
                    <tr
                      key={modelo.id}
                      style={{
                        borderTop: "1px solid rgb(167, 117, 75)",
                        background: modelo.ativo
                          ? "transparent"
                          : "rgb(243, 244, 246)",
                      }}
                    >
                      <td style={{ padding: 8, textAlign: "center" }}>
                        <input
                          type="checkbox"
                          checked={selectedItems.has(modelo.id)}
                          onChange={() => toggleSelect(modelo.id)}
                          style={{ width: 18, height: 18 }}
                        />
                      </td>
                      <td style={{ padding: 8 }}>{modelo.nome}</td>
                      <td style={{ padding: 8 }}>
                        {modelo.tipoProduto || "-"}
                      </td>
                      <td style={{ padding: 8, textAlign: "right" }}>
                        {modelo.ceraGr}g
                      </td>
                      <td style={{ padding: 8, textAlign: "right" }}>
                        {modelo.esenciaMl}ml
                      </td>
                      <td style={{ padding: 8 }}>
                        {modelo.essenciaNome || "-"}
                      </td>
                      <td style={{ padding: 8 }}>{modelo.pavio || "-"}</td>
                      <td style={{ padding: 8 }}>
                        {modelo.coranteNome || "-"}
                      </td>
                      <td style={{ padding: 8, textAlign: "right" }}>
                        {modelo.coranteGr}g
                      </td>
                      <td style={{ padding: 8 }}>{modelo.recipiente || "-"}</td>
                      <td style={{ padding: 8 }}>{modelo.pedra || "-"}</td>
                      <td style={{ padding: 8 }}>{modelo.oleo || "-"}</td>
                      <td style={{ padding: 8, textAlign: "right" }}>
                        {modelo.oleoGr || 0}g
                      </td>
                      <td style={{ padding: 8 }}>{modelo.argila || "-"}</td>
                      <td style={{ padding: 8, textAlign: "right" }}>
                        {modelo.argilaGr || 0}g
                      </td>
                      <td style={{ padding: 8 }}>{modelo.dioxido || "-"}</td>
                      <td style={{ padding: 8, textAlign: "right" }}>
                        {modelo.dioxidoGr || 0}g
                      </td>
                      <td style={{ padding: 8 }}>{modelo.manteiga || "-"}</td>
                      <td style={{ padding: 8, textAlign: "right" }}>
                        {modelo.manteigaGr || 0}g
                      </td>
                      <td style={{ padding: 8 }}>{modelo.extrato || "-"}</td>
                      <td style={{ padding: 8, textAlign: "right" }}>
                        {modelo.extratoGr}g
                      </td>
                      <td style={{ padding: 8 }}>{modelo.lauril || "-"}</td>
                      <td style={{ padding: 8, textAlign: "right" }}>
                        {modelo.laurilGr}g
                      </td>
                      <td style={{ padding: 8, textAlign: "right" }}>
                        R$ {modelo.embalagem.toFixed(3)}
                      </td>
                      <td style={{ padding: 8, textAlign: "right" }}>
                        R$ {modelo.maoDeObra.toFixed(3)}
                      </td>
                      <td style={{ padding: 8, textAlign: "right" }}>
                        {modelo.margemLucro}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
