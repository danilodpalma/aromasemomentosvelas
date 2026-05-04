export default function Compras() {
  return (
    <div>
      <h2>Compras e despesas</h2>
      <p>
        Registre aqui as compras de insumos e outras despesas do seu negócio.
      </p>

      <section
        style={{
          background: "rgb(239, 221, 201)",
          padding: 20,
          borderRadius: 12,
          boxShadow: "0 1px 3px rgba(15, 23, 42, 0.08)",
        }}
      >
        <p>Em uma versão inicial, você pode usar os campos:</p>
        <ul style={{ color: "#4b5563" }}>
          <li>Data</li>
          <li>Tipo: compra ou despesa</li>
          <li>Categoria</li>
          <li>Valor</li>
          <li>Descrição</li>
        </ul>
      </section>
    </div>
  );
}
