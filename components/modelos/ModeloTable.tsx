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
  totalCount: number;
  isAuthenticated: boolean;
  canDelete: boolean;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  showActiveOnly: boolean;
  setShowActiveOnly: React.Dispatch<React.SetStateAction<boolean>>;
};

const thStyle: React.CSSProperties = {
  padding: "10px 8px",
  textAlign: "center",
  whiteSpace: "nowrap",
};

const tdStyle: React.CSSProperties = {
  padding: "8px 10px",
  borderTop: "1px solid rgb(167, 117, 75)",
  textAlign: "center",
  verticalAlign: "middle",
};

const badgeStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 4,
  padding: "4px 8px",
  borderRadius: 999,
  fontWeight: 700,
  lineHeight: 1.2,
  whiteSpace: "nowrap",
};

const qtyBadgeStyle: React.CSSProperties = {
  ...badgeStyle,
  minWidth: 32,
  background: "rgba(167, 117, 75, 0.12)",
  color: "#5b3a22",
};

const priceBadgeStyle: React.CSSProperties = {
  ...badgeStyle,
  background: "rgba(59, 130, 246, 0.10)",
  color: "#1d4ed8",
};

export default function ModeloTable({
  filteredModelos,
  totalCount,
  isAuthenticated,
  canDelete,
  onEdit,
  onDelete,
  searchTerm,
  setSearchTerm,
  showActiveOnly,
  setShowActiveOnly,
}: Props) {
  return (
    <div
      style={{
        background: `linear-gradient(135deg, ${COLORS.cardGradientFrom} 0%, ${COLORS.cardGradientTo} 100%)`,
        padding: 20,
        borderRadius: 14,
        boxShadow: COLORS.cardShadow,
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
        <div>
          <h3 style={{ marginBottom: 4 }}>Modelos cadastrados</h3>
          <div style={{ color: COLORS.grayText, fontSize: 14 }}>
            Total de modelos: {totalCount}
          </div>
        </div>
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
        </div>
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
              fontSize: 11.5,
            }}
          >
            <thead style={{ background: "rgba(255,255,255,0.35)" }}>
              <tr>
                <th style={thStyle}>Ações</th>
                <th style={thStyle}>Nome</th>
                <th style={thStyle}>Base</th>
                <th style={thStyle}>Base (g)</th>
                <th style={thStyle}>Essência (ml)</th>
                <th style={thStyle}>Essência</th>
                <th style={thStyle}>Pavio</th>
                <th style={thStyle}>Corante</th>
                <th style={thStyle}>Corante (g)</th>
                <th style={thStyle}>Recipiente</th>
                <th style={thStyle}>Pedra</th>
                <th style={thStyle}>Óleo</th>
                <th style={thStyle}>Óleo (g)</th>
                <th style={thStyle}>Argila</th>
                <th style={thStyle}>Argila (g)</th>
                <th style={thStyle}>Dióxido</th>
                <th style={thStyle}>Dióxido (g)</th>
                <th style={thStyle}>Manteiga</th>
                <th style={thStyle}>Manteiga (g)</th>
                <th style={thStyle}>Extrato</th>
                <th style={thStyle}>Extrato (g)</th>
                <th style={thStyle}>Lauril</th>
                <th style={thStyle}>Lauril (g)</th>
                <th style={thStyle}>Emb.</th>
                <th style={thStyle}>M.Obra</th>
                <th style={thStyle}>Margem</th>
              </tr>
            </thead>
            <tbody>
              {filteredModelos.map((modelo, index) => (
                <tr
                  key={modelo.id}
                  style={{
                    background: modelo.ativo
                      ? index % 2 === 0
                        ? COLORS.tableRowEven
                        : COLORS.tableRowOdd
                      : index % 2 === 0
                        ? "#f3f4f6"
                        : "#e5e7eb",
                  }}
                >
                  <td style={{ ...tdStyle, padding: 8, whiteSpace: "nowrap" }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        gap: 6,
                      }}
                    >
                      {isAuthenticated && (
                        <button
                          type="button"
                          onClick={() => onEdit(modelo.id)}
                          aria-label={`Editar modelo ${modelo.nome}`}
                          style={{
                            padding: "5px 8px",
                            background: COLORS.primary,
                            color: "white",
                            border: "none",
                            borderRadius: 6,
                            cursor: "pointer",
                          }}
                        >
                          Editar
                        </button>
                      )}
                      {canDelete && (
                        <button
                          type="button"
                          onClick={() => onDelete(modelo.id)}
                          aria-label={`Excluir modelo ${modelo.nome}`}
                          style={{
                            padding: "5px 8px",
                            background: COLORS.dangerLight,
                            color: "white",
                            border: "none",
                            borderRadius: 6,
                            cursor: "pointer",
                          }}
                        >
                          Excluir
                        </button>
                      )}
                    </div>
                  </td>
                  <td style={{ ...tdStyle, fontWeight: 700 }}>{modelo.nome}</td>
                  <td style={tdStyle}>{modelo.tipoProduto || "-"}</td>
                  <td style={tdStyle}>
                    <span style={qtyBadgeStyle}>{modelo.ceraGr}g</span>
                  </td>
                  <td style={tdStyle}>
                    <span style={qtyBadgeStyle}>{modelo.esenciaMl}ml</span>
                  </td>
                  <td style={tdStyle}>{modelo.essenciaNome || "-"}</td>
                  <td style={tdStyle}>{modelo.pavio || "-"}</td>
                  <td style={tdStyle}>{modelo.coranteNome || "-"}</td>
                  <td style={tdStyle}>
                    <span style={qtyBadgeStyle}>{modelo.coranteGr}g</span>
                  </td>
                  <td style={tdStyle}>{modelo.recipiente || "-"}</td>
                  <td style={tdStyle}>{modelo.pedra || "-"}</td>
                  <td style={tdStyle}>{modelo.oleo || "-"}</td>
                  <td style={tdStyle}>
                    <span style={qtyBadgeStyle}>{modelo.oleoGr || 0}g</span>
                  </td>
                  <td style={tdStyle}>{modelo.argila || "-"}</td>
                  <td style={tdStyle}>
                    <span style={qtyBadgeStyle}>{modelo.argilaGr || 0}g</span>
                  </td>
                  <td style={tdStyle}>{modelo.dioxido || "-"}</td>
                  <td style={tdStyle}>
                    <span style={qtyBadgeStyle}>{modelo.dioxidoGr || 0}g</span>
                  </td>
                  <td style={tdStyle}>{modelo.manteiga || "-"}</td>
                  <td style={tdStyle}>
                    <span style={qtyBadgeStyle}>
                      {modelo.manteigaGr || 0}g
                    </span>
                  </td>
                  <td style={tdStyle}>{modelo.extrato || "-"}</td>
                  <td style={tdStyle}>
                    <span style={qtyBadgeStyle}>{modelo.extratoGr}g</span>
                  </td>
                  <td style={tdStyle}>{modelo.lauril || "-"}</td>
                  <td style={tdStyle}>
                    <span style={qtyBadgeStyle}>{modelo.laurilGr}g</span>
                  </td>
                  <td style={tdStyle}>
                    <span style={priceBadgeStyle}>
                      <span>R$</span>
                      <span>{modelo.embalagem.toFixed(3)}</span>
                    </span>
                  </td>
                  <td style={tdStyle}>
                    <span style={priceBadgeStyle}>
                      <span>R$</span>
                      <span>{modelo.maoDeObra.toFixed(3)}</span>
                    </span>
                  </td>
                  <td style={tdStyle}>
                    <span
                      style={{
                        ...badgeStyle,
                        padding: "4px 10px",
                        background: "rgba(34, 197, 94, 0.12)",
                        color: "#166534",
                        fontWeight: 800,
                      }}
                    >
                      {modelo.margemLucro}%
                    </span>
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
