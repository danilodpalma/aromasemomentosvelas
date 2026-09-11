// components/vendas/VendaResumo.tsx
import { COLORS } from "../../styles/theme";

export type ResumoVendas = {
  totalVendido: number;
  receita: number;
  totalVelasVendidas: number;
  paymentSummary: { name: string; value: number; count: number }[];
  statusSummary: { name: string; count: number }[];
};

type Props = {
  resumo: ResumoVendas;
};

export default function VendaResumo({ resumo }: Props) {
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
      <h3>Resumo de Pagamentos</h3>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: 16,
        }}
      >
        <div
          style={{
            background: "white",
            padding: 16,
            borderRadius: 10,
            boxShadow: COLORS.subtleShadowSmall,
          }}
        >
          <strong>Total Vendido</strong>
          <div style={{ marginTop: 8 }}>R$ {resumo.totalVendido.toFixed(2)}</div>
        </div>
        <div
          style={{
            background: "white",
            padding: 16,
            borderRadius: 10,
            boxShadow: COLORS.subtleShadowSmall,
          }}
        >
          <strong>Receita</strong>
          <div style={{ marginTop: 8 }}>R$ {resumo.receita.toFixed(2)}</div>
        </div>
        <div
          style={{
            background: "white",
            padding: 16,
            borderRadius: 10,
            boxShadow: COLORS.subtleShadowSmall,
          }}
        >
          <strong>Velas Vendidas</strong>
          <div style={{ marginTop: 8 }}>{resumo.totalVelasVendidas}</div>
        </div>
        {resumo.paymentSummary.map((item) => (
          <div
            key={item.name}
            style={{
              background: "white",
              padding: 16,
              borderRadius: 10,
              boxShadow: COLORS.subtleShadowSmall,
            }}
          >
            <strong>{item.name}</strong>
            <div style={{ marginTop: 8 }}>
              {item.count} itens — R$ {item.value.toFixed(2)}
            </div>
          </div>
        ))}
        {resumo.statusSummary.map((item) => (
          <div
            key={item.name}
            style={{
              background: "white",
              padding: 16,
              borderRadius: 10,
              boxShadow: COLORS.subtleShadowSmall,
            }}
          >
            <strong>{item.name}</strong>
            <div style={{ marginTop: 8 }}>{item.count} pedidos</div>
          </div>
        ))}
      </div>
    </div>
  );
}
