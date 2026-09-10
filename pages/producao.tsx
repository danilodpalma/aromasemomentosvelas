import { COLORS } from "../styles/theme";

export default function Producao() {
  return (
    <div>
      <h2 style={{ marginBottom: 6, color: COLORS.primaryDark }}>Produção</h2>
      <p style={{ marginTop: 0, color: COLORS.primaryDarkAlt }}>
        Controle a produção diária, semanal e os modelos em andamento.
      </p>

      <section
        style={{
          background: "linear-gradient(135deg, #f7e8d7 0%, #efd9c2 100%)",
          padding: 20,
          borderRadius: 14,
          boxShadow: COLORS.cardShadow,
          border: COLORS.cardBorder,
        }}
      >
        <p>Em breve, você poderá adicionar:</p>
        <ul style={{ color: "#4b5563" }}>
          <li>Modelo em produção</li>
          <li>Quantidade produzida</li>
          <li>Status</li>
          <li>Data de início e conclusão</li>
          <li>Produção diária e semanal</li>
        </ul>
      </section>
    </div>
  );
}
