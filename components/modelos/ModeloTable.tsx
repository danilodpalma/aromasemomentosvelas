// components/modelos/ModeloTable.tsx
import { COLORS } from "../../styles/theme";

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
  oleo?: string;
  oleoGr?: number;
  argila?: string;
  argilaGr?: number;
  dioxido?: string;
  dioxidoGr?: number;
  manteiga?: string;
  manteigaGr?: number;
  extrato?: string;
  extratoGr: number;
  lauril?: string;
  laurilGr: number;
  embalagem: number;
  maoDeObra: number;
  margemLucro: number;
};

type Props = {
  filteredModelos: Modelo[];
  isAuthenticated: boolean;
  canDelete: boolean;
  selectedItems: Set<number>;
  toggleSelect: (id: number) => void;
  editSelected: () => void;
  deleteSelected: () => void;
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  showActiveOnly: boolean;
  setShowActiveOnly: React.Dispatch<React.SetStateAction<boolean>>;
  setSelectedItems: React.Dispatch<React.SetStateAction<Set<number>>>;
};

export default function ModeloTable({
  filteredModelos,
  isAuthenticated,
  canDelete,
  selectedItems,
  toggleSelect,
  editSelected,
  deleteSelected,
  searchTerm,
  setSearchTerm,
  showActiveOnly,
  setShowActiveOnly,
  setSelectedItems,
}: Props) {
  return (
        <div
          style={{
            background: `linear-gradient(135deg, ${COLORS.cardGradientFrom} 0%, ${COLORS.cardGradientTo} 100%)`,
            padding: 22,
            borderRadius: 16,
            boxShadow: COLORS.cardShadowLarge,
            border: COLORS.cardBorder,
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
                      ? COLORS.success
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
              {isAuthenticated && (
                <button
                  type="button"
                  onClick={editSelected}
                  disabled={selectedItems.size !== 1}
                  style={{
                    padding: "8px 16px",
                    background:
                      selectedItems.size === 1
                        ? COLORS.primary
                        : COLORS.gray,
                    color: "white",
                    border: "none",
                    borderRadius: 6,
                    cursor: selectedItems.size === 1 ? "pointer" : "not-allowed",
                  }}
                >
                  Editar
                </button>
              )}
              {canDelete && (
                <button
                  type="button"
                  onClick={deleteSelected}
                  disabled={selectedItems.size !== 1}
                  style={{
                    padding: "8px 16px",
                    background:
                      selectedItems.size === 1
                        ? COLORS.dangerRgb
                        : COLORS.gray,
                    color: "white",
                    border: "none",
                    borderRadius: 6,
                    cursor: selectedItems.size === 1 ? "pointer" : "not-allowed",
                  }}
                >
                  Excluir
                </button>
              )}
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
  );
}
