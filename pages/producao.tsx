export default function Producao() {
  return (
    <div>
      <h2>Produção</h2>
      <p>Controle a produção diária, semanal e os modelos em andamento.</p>

      <section
        style={{
          background: "rgb(239, 221, 201)",
          padding: 20,
          borderRadius: 12,
          boxShadow: "0 1px 3px rgba(15, 23, 42, 0.08)",
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
