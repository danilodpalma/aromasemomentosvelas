import { COLORS } from "../../styles/theme";

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

type Props = {
  items: Insumo[];
  totalCount: number;
  isAuthenticated: boolean;
  canDelete: boolean;
  showActiveOnly: boolean;
  onToggleActiveFilter: () => void;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onEdit: (item: Insumo) => void;
  onDelete: (id: number) => void;
};

export default function InsumoTable({
  items,
  totalCount,
  isAuthenticated,
  canDelete,
  showActiveOnly,
  onToggleActiveFilter,
  searchTerm,
  onSearchChange,
  onEdit,
  onDelete,
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
          <h3 style={{ marginBottom: 4 }}>Lista de insumos</h3>
          <div style={{ color: COLORS.grayText, fontSize: 14 }}>
            Total de insumos: {totalCount}
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
              onClick={onToggleActiveFilter}
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

      <div style={{ marginBottom: 16 }}>
        <input
          type="text"
          placeholder="Buscar insumo..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          style={{
            width: "100%",
            padding: 10,
            border: "1px solid rgb(167, 117, 75)",
            borderRadius: 6,
            background: COLORS.white,
          }}
        />
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th
              style={{
                padding: 12,
                textAlign: "center",
                color: COLORS.primary,
              }}
            >
              Status
            </th>
            <th
              style={{
                padding: 12,
                textAlign: "center",
                color: COLORS.primary,
              }}
            >
              Insumo
            </th>
            <th
              style={{
                padding: 12,
                textAlign: "center",
                color: COLORS.primary,
              }}
            >
              Unidade
            </th>
            <th
              style={{
                padding: 12,
                textAlign: "center",
                color: COLORS.primary,
              }}
            >
              Tipos de produto
            </th>
            <th
              style={{
                padding: 12,
                textAlign: "center",
                color: COLORS.primary,
              }}
            >
              Custo compra
            </th>
            <th
              style={{
                padding: 12,
                textAlign: "center",
                color: COLORS.primary,
              }}
            >
              Qtd comprada
            </th>
            <th
              style={{
                padding: 12,
                textAlign: "center",
                color: COLORS.primary,
              }}
            >
              Custo unitário
            </th>
            <th
              style={{
                padding: 12,
                textAlign: "center",
                color: COLORS.primary,
              }}
            >
              Ações
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr
              key={item.id}
              style={{
                background:
                  (item.active ?? true)
                    ? index % 2 === 0
                      ? COLORS.tableRowEven
                      : COLORS.tableRowOdd
                    : index % 2 === 0
                      ? "#f3f4f6"
                      : "#e5e7eb",
              }}
            >
              <td
                style={{
                  padding: 12,
                  borderTop: "1px solid rgb(167, 117, 75)",
                  textAlign: "center",
                }}
              >
                {(item.active ?? true) ? "Ativo" : "Inativo"}
              </td>
              <td
                style={{
                  padding: 12,
                  borderTop: "1px solid rgb(167, 117, 75)",
                  textAlign: "center",
                }}
              >
                {item.name}
              </td>
              <td
                style={{
                  padding: 12,
                  borderTop: "1px solid rgb(167, 117, 75)",
                  textAlign: "center",
                }}
              >
                {item.unit || "-"}
              </td>
              <td
                style={{
                  padding: 12,
                  borderTop: "1px solid rgb(167, 117, 75)",
                  textAlign: "center",
                }}
              >
                {item.productTypes && item.productTypes.length > 0
                  ? item.productTypes.join(", ")
                  : "-"}
              </td>
              <td
                style={{
                  padding: 12,
                  borderTop: "1px solid rgb(167, 117, 75)",
                  textAlign: "center",
                }}
              >
                R$ {item.purchaseCost.toFixed(2)}
              </td>
              <td
                style={{
                  padding: 12,
                  borderTop: "1px solid rgb(167, 117, 75)",
                  textAlign: "center",
                }}
              >
                {item.purchasedQuantity}
              </td>
              <td
                style={{
                  padding: 12,
                  borderTop: "1px solid rgb(167, 117, 75)",
                  textAlign: "center",
                }}
              >
                R$ {item.unitCost.toFixed(3)}
              </td>
              <td
                style={{
                  padding: 8,
                  borderTop: "1px solid rgb(167, 117, 75)",
                  textAlign: "center",
                  whiteSpace: "nowrap",
                }}
              >
                <div
                  style={{ display: "flex", justifyContent: "center", gap: 6 }}
                >
                  {isAuthenticated && (
                    <button
                      type="button"
                      onClick={() => onEdit(item)}
                      aria-label={`Editar insumo ${item.name}`}
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
                      onClick={() => onDelete(item.id)}
                      aria-label={`Excluir insumo ${item.name}`}
                      style={{
                        padding: "5px 8px",
                        background: COLORS.dangerRgb,
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
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
