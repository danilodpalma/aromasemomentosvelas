import { useEffect, useRef, useState } from "react";
import { formatCurrencyInput, parseCurrencyInput, sanitizeCurrencyInput } from "../lib/currency";

type Insumo = {
  id: number;
  name: string;
  unitCost: number;
};

type Modelo = {
  id: number;
  nome: string;
  ativo: boolean;
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

export default function Modelos() {
  const nomeInputRef = useRef<HTMLInputElement>(null);
  const [modelos, setModelos] = useState<Modelo[]>([]);
  const [insumos, setInsumos] = useState<Insumo[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formMode, setFormMode] = useState<"idle" | "new" | "edit">("idle");
  const [form, setForm] = useState({
    nome: "",
    ativo: true,
    tipoProduto: "",
    ceraGr: "",
    esenciaMl: "",
    essenciaNome: "",
    pavio: "",
    coranteNome: "",
    coranteGr: "",
    recipiente: "",
    pedra: "",
    extrato: "",
    extratoGr: "",
    lauril: "",
    laurilGr: "",
    tampa: "",
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

  useEffect(() => {
    Promise.all([
      fetch("/api/modelos").then((r) => r.json()),
      fetch("/api/products").then((r) => r.json()),
    ]).then(([modelosData, insumosData]) => {
      setModelos(modelosData);
      setInsumos(insumosData);
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
      ceraGr: "",
      esenciaMl: "",
      essenciaNome: "",
      pavio: "",
      coranteNome: "",
      coranteGr: "",
      recipiente: "",
      pedra: "",
      extrato: "",
      extratoGr: "",
      lauril: "",
      laurilGr: "",
      tampa: "",
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
      ceraGr: "",
      esenciaMl: "",
      essenciaNome: "",
      pavio: "",
      coranteNome: "",
      coranteGr: "",
      recipiente: "",
      pedra: "",
      extrato: "",
      extratoGr: "",
      lauril: "",
      laurilGr: "",
      tampa: "",
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
      ceraGr: modelo.ceraGr.toString(),
      esenciaMl: modelo.esenciaMl.toString(),
      essenciaNome: modelo.essenciaNome ?? "",
      pavio: modelo.pavio ?? "",
      coranteNome: modelo.coranteNome ?? "",
      coranteGr: modelo.coranteGr.toString(),
      recipiente: modelo.recipiente ?? "",
      pedra: modelo.pedra ?? "",
      extrato: modelo.extrato ?? "",
      extratoGr: modelo.extratoGr.toString(),
      lauril: modelo.lauril ?? "",
      laurilGr: modelo.laurilGr.toString(),
      tampa: modelo.tampa ?? "",
      embalagem: formatCurrencyInput(modelo.embalagem, 2),
      maoDeObra: formatCurrencyInput(modelo.maoDeObra, 2),
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
      (m) => normalizeModelName(m.nome) === nomeNormalizado &&
      (editingId ? m.id !== editingId : true)
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
          ceraGr: Number(form.ceraGr),
          esenciaMl: Number(form.esenciaMl),
          essenciaNome: form.essenciaNome,
          pavio: form.pavio,
          coranteNome: form.coranteNome,
          coranteGr: Number(form.coranteGr),
          recipiente: form.recipiente,
          pedra: form.pedra,
          extrato: form.extrato,
          lauril: form.lauril,
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

  const essencias = insumos
    .filter((i) =>
      i.name.toLowerCase().includes("essência") || i.name.toLowerCase().includes("oleo") || i.name.toLowerCase().includes("essencia")
    )
    .sort((a, b) => a.name.localeCompare(b.name));
  const recipients = insumos
    .filter((i) =>
      i.name.toLowerCase().includes("recipiente") || i.name.toLowerCase().includes("vaso") || i.name.toLowerCase().includes("vidro") || i.name.toLowerCase().includes("pot")
    )
    .sort((a, b) => a.name.localeCompare(b.name));
  const wicks = insumos
    .filter((i) => i.name.toLowerCase().includes("pavio"))
    .sort((a, b) => a.name.localeCompare(b.name));
  const dyes = insumos
    .filter((i) => i.name.toLowerCase().includes("corante"))
    .sort((a, b) => a.name.localeCompare(b.name));
  const bases = insumos
    .filter((i) => i.name.toLowerCase().includes("base"))
    .sort((a, b) => a.name.localeCompare(b.name));
  const stones = insumos
    .filter((i) =>
      i.name.toLowerCase().includes("pedra") || i.name.toLowerCase().includes("strass")
    )
    .sort((a, b) => a.name.localeCompare(b.name));
  const extracts = insumos
    .filter((i) => i.name.toLowerCase().includes("extrato"))
    .sort((a, b) => a.name.localeCompare(b.name));
  const surfactants = insumos
    .filter((i) => i.name.toLowerCase().includes("lauril"))
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
          gridTemplateColumns: "1fr",
          gap: 24,
          marginTop: 24,
        }}
      >
        <div
          style={{
            background: "rgb(239, 221, 201)",
            padding: 20,
            borderRadius: 12,
            boxShadow: "0 1px 3px rgba(15, 23, 42, 0.08)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <h3 style={{ margin: 0 }}>{editingId ? "Editar modelo" : "Novo modelo"}</h3>
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
            <label style={{ display: "block", marginBottom: 12 }}>
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
                  padding: 8,
                  background: "rgb(255, 255, 255)",
                  border: "1px solid rgb(166, 116, 71)",
                  borderRadius: 6,
                }}
              />
            </label>
            <label style={{ display: "block", marginBottom: 12 }}>
              Base
              <select
                disabled={formMode === "idle"}
                value={form.tipoProduto}
                onChange={(e) => setForm({ ...form, tipoProduto: e.target.value })}
                style={{
                  width: "100%",
                  marginTop: 6,
                  padding: 8,
                  background: "rgb(255, 255, 255)",
                  border: "1px solid rgb(166, 116, 71)",
                  borderRadius: 6,
                }}
              >
                <option value="">Escolha a base</option>
                {bases.map((insumo) => (
                  <option key={insumo.id} value={insumo.name}>
                    {insumo.name}
                  </option>
                ))}
              </select>
            </label>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                gap: 12,
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
                  <option value="">Não usar</option>
                  {essencias.map((e) => (
                    <option key={e.id} value={e.name}>{e.name}</option>
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
                  <option value="">Não usar</option>
                  {wicks.map((p) => (
                    <option key={p.id} value={p.name}>{p.name}</option>
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
                  <option value="">Não usar</option>
                  {dyes.map((c) => (
                    <option key={c.id} value={c.name}>{c.name}</option>
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
                  <option value="">Não usar</option>
                  {recipients.map((r) => (
                    <option key={r.id} value={r.name}>{r.name}</option>
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
                  <option value="">Não usar</option>
                  {stones.map((p) => (
                    <option key={p.id} value={p.name}>{p.name}</option>
                  ))}
                </select>
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
                  <option value="">Não usar</option>
                  {extracts.map((e) => (
                    <option key={e.id} value={e.name}>{e.name}</option>
                  ))}
                </select>
              </label>
              <label style={{ display: "block" }}>
                Extrato (g)
                <input
                  type="number"
                  disabled={formMode === "idle"}
                  value={form.extratoGr}
                  onChange={(e) => setForm({ ...form, extratoGr: e.target.value })}
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
                  <option value="">Não usar</option>
                  {surfactants.map((l) => (
                    <option key={l.id} value={l.name}>{l.name}</option>
                  ))}
                </select>
              </label>
              <label style={{ display: "block" }}>
                Lauril (g)
                <input
                  type="number"
                  disabled={formMode === "idle"}
                  value={form.laurilGr}
                  onChange={(e) => setForm({ ...form, laurilGr: e.target.value })}
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
                Tampa
                <select
                  disabled={formMode === "idle"}
                  value={form.tampa}
                  onChange={(e) => setForm({ ...form, tampa: e.target.value })}
                  style={{
                    width: "100%",
                    marginTop: 6,
                    padding: 8,
                    background: "rgb(255, 255, 255)",
                    border: "1px solid rgb(166, 116, 71)",
                    borderRadius: 6,
                  }}
                >
                  <option value="">Não usar</option>
                  {recipients.map((c) => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </label>
              <label style={{ display: "block" }}>
                Embalagem (R$)
                <input
                  type="text"
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
                        ? formatCurrencyInput(prev.embalagem, 2)
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
                <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 8 }}>
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
                      background: form.ativo ? "rgb(34, 197, 94)" : "rgb(156, 163, 175)",
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
            <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
              <button
                type="submit"
                disabled={formMode === "idle"}
                style={{
                  padding: "10px 16px",
                  background: formMode === "idle" ? "rgb(200, 200, 200)" : "rgb(167, 117, 75)",
                  color: "white",
                  border: "none",
                  borderRadius: 6,
                  cursor: formMode === "idle" ? "not-allowed" : "pointer",
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
                    background: "rgb(100, 100, 100)",
                    color: "white",
                    border: "none",
                    borderRadius: 6,
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
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h3>Modelos cadastrados</h3>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 6, color: "rgb(120, 53, 15)" }}>
                <span>{showActiveOnly ? "Ativos" : "Inativos"}</span>
                <button
                  type="button"
                  onClick={() => {
                    setShowActiveOnly((prev) => !prev);
                    setSelectedItems(new Set());
                  }}
                  aria-label={showActiveOnly ? "Filtro em ativos" : "Filtro em inativos"}
                  style={{
                    width: 46,
                    height: 26,
                    borderRadius: 13,
                    border: "none",
                    cursor: "pointer",
                    background: showActiveOnly ? "rgb(34, 197, 94)" : "rgb(156, 163, 175)",
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
                  background: selectedItems.size === 1 ? "rgb(167, 117, 75)" : "rgb(200, 200, 200)",
                  color: "white",
                  border: "none",
                  borderRadius: 6,
                  cursor: selectedItems.size === 1 ? "pointer" : "not-allowed",
                }}
              >
                Editar
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
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 800 }}>
                <thead>
                  <tr>
                    <th style={{ padding: 8, textAlign: "center" }}>
                      Selecionar
                    </th>
                    <th style={{ padding: 8, textAlign: "left" }}>Nome</th>
                    <th style={{ padding: 8, textAlign: "left" }}>Base</th>
                    <th style={{ padding: 8, textAlign: "right" }}>Base (g)</th>
                    <th style={{ padding: 8, textAlign: "right" }}>Essência (ml)</th>
                    <th style={{ padding: 8, textAlign: "left" }}>Essência</th>
                    <th style={{ padding: 8, textAlign: "left" }}>Pavio</th>
                    <th style={{ padding: 8, textAlign: "left" }}>Corante</th>
                    <th style={{ padding: 8, textAlign: "right" }}>Corante (g)</th>
                    <th style={{ padding: 8, textAlign: "left" }}>Recipiente</th>
                    <th style={{ padding: 8, textAlign: "left" }}>Pedra</th>
                    <th style={{ padding: 8, textAlign: "left" }}>Tampa</th>
                    <th style={{ padding: 8, textAlign: "left" }}>Extrato</th>
                    <th style={{ padding: 8, textAlign: "right" }}>Extrato (g)</th>
                    <th style={{ padding: 8, textAlign: "left" }}>Lauril</th>
                    <th style={{ padding: 8, textAlign: "right" }}>Lauril (g)</th>
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
                        background: modelo.ativo ? "transparent" : "rgb(243, 244, 246)"
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
                      <td style={{ padding: 8 }}>{modelo.tipoProduto || "-"}</td>
                      <td style={{ padding: 8, textAlign: "right" }}>{modelo.ceraGr}g</td>
                      <td style={{ padding: 8, textAlign: "right" }}>{modelo.esenciaMl}ml</td>
                      <td style={{ padding: 8 }}>{modelo.essenciaNome || "-"}</td>
                      <td style={{ padding: 8 }}>{modelo.pavio || "-"}</td>
                      <td style={{ padding: 8 }}>{modelo.coranteNome || "-"}</td>
                      <td style={{ padding: 8, textAlign: "right" }}>{modelo.coranteGr}g</td>
                      <td style={{ padding: 8 }}>{modelo.recipiente || "-"}</td>
                      <td style={{ padding: 8 }}>{modelo.pedra || "-"}</td>
                      <td style={{ padding: 8 }}>{modelo.tampa || "-"}</td>
                      <td style={{ padding: 8 }}>{modelo.extrato || "-"}</td>
                      <td style={{ padding: 8, textAlign: "right" }}>{modelo.extratoGr}g</td>
                      <td style={{ padding: 8 }}>{modelo.lauril || "-"}</td>
                      <td style={{ padding: 8, textAlign: "right" }}>{modelo.laurilGr}g</td>
                      <td style={{ padding: 8, textAlign: "right" }}>R$ {modelo.embalagem.toFixed(2)}</td>
                      <td style={{ padding: 8, textAlign: "right" }}>R$ {modelo.maoDeObra.toFixed(2)}</td>
                      <td style={{ padding: 8, textAlign: "right" }}>{modelo.margemLucro}%</td>
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