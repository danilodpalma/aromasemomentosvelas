import { useEffect, useState } from "react";

type Product = {
  id: number;
  name: string;
  cost: number;
  salePrice: number;
  stock: number;
};
type Venda = {
  id: number;
  total: number;
  createdAt: string;
  cliente: string;
  modeloVela: string;
  formaPagamento: string;
  status: string;
};

export default function Dashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [vendas, setVendas] = useState<Venda[]>([]);

  useEffect(() => {
    async function load() {
      const [productsRes, vendasRes] = await Promise.all([
        fetch("/api/products"),
        fetch("/api/vendas"),
      ]);
      setProducts(await productsRes.json());
      setVendas(await vendasRes.json());
    }

    load();
  }, []);

  const totalVendas = vendas.length;
  const receita = vendas.reduce((sum, item) => sum + item.total, 0);
  const vendasRecentes = vendas.slice(0, 5);

  return (
    <div>
      <h2 style={{ marginBottom: 6, color: "#6b3b12" }}>Resumo e dashboard</h2>
      <p style={{ marginTop: 0, color: "#8a5a2b" }}>
        Use este painel como ponto de partida para acompanhar seu negócio.
      </p>

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 16,
          marginTop: 24,
        }}
      >
        <div
          style={{
            background: "linear-gradient(135deg, #f7e8d7 0%, #efd9c2 100%)",
            padding: 20,
            borderRadius: 14,
            boxShadow: "0 10px 24px rgba(92, 54, 24, 0.1)",
            border: "1px solid rgba(166, 116, 71, 0.2)",
          }}
        >
          <p style={{ margin: 0, color: "#6b7280" }}>Total de insumos</p>
          <p style={{ marginTop: 8, fontSize: 28, fontWeight: 700 }}>
            {products.length}
          </p>
        </div>
        <div
          style={{
            background: "linear-gradient(135deg, #f7e8d7 0%, #efd9c2 100%)",
            padding: 20,
            borderRadius: 14,
            boxShadow: "0 10px 24px rgba(92, 54, 24, 0.1)",
            border: "1px solid rgba(166, 116, 71, 0.2)",
          }}
        >
          <p style={{ margin: 0, color: "#6b7280" }}>Total de vendas</p>
          <p style={{ marginTop: 8, fontSize: 28, fontWeight: 700 }}>
            {totalVendas}
          </p>
        </div>
        <div
          style={{
            background: "linear-gradient(135deg, #f7e8d7 0%, #efd9c2 100%)",
            padding: 20,
            borderRadius: 14,
            boxShadow: "0 10px 24px rgba(92, 54, 24, 0.1)",
            border: "1px solid rgba(166, 116, 71, 0.2)",
          }}
        >
          <p style={{ margin: 0, color: "#6b7280" }}>Receita</p>
          <p style={{ marginTop: 8, fontSize: 28, fontWeight: 700 }}>
            R$ {receita.toFixed(2)}
          </p>
        </div>
      </section>

      <section style={{ marginTop: 28 }}>
        <h3 style={{ marginBottom: 10, color: "#6b3b12" }}>Vendas recentes</h3>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            background: "linear-gradient(135deg, #f7e8d7 0%, #efd9c2 100%)",
            borderRadius: 14,
            overflow: "hidden",
            boxShadow: "0 10px 24px rgba(92, 54, 24, 0.08)",
          }}
        >
          <thead style={{ background: "rgba(255,255,255,0.35)" }}>
            <tr>
              <th style={{ padding: 12, textAlign: "left" }}>Cliente</th>
              <th style={{ padding: 12, textAlign: "left" }}>Produto</th>
              <th style={{ padding: 12, textAlign: "right" }}>Total</th>
              <th style={{ padding: 12, textAlign: "left" }}>Status</th>
              <th style={{ padding: 12, textAlign: "left" }}>Data</th>
            </tr>
          </thead>
          <tbody>
            {vendasRecentes.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: 16, textAlign: "center" }}>
                  Nenhuma venda registrada ainda.
                </td>
              </tr>
            ) : (
              vendasRecentes.map((venda) => (
                <tr key={venda.id}>
                  <td style={{ padding: 12, borderTop: "1px solid #e5e7eb" }}>
                    {venda.cliente}
                  </td>
                  <td style={{ padding: 12, borderTop: "1px solid #e5e7eb" }}>
                    {venda.modeloVela}
                  </td>
                  <td
                    style={{
                      padding: 12,
                      borderTop: "1px solid #e5e7eb",
                      textAlign: "right",
                    }}
                  >
                    R$ {venda.total.toFixed(2)}
                  </td>
                  <td style={{ padding: 12, borderTop: "1px solid #e5e7eb" }}>
                    {venda.status}
                  </td>
                  <td style={{ padding: 12, borderTop: "1px solid #e5e7eb" }}>
                    {new Date(venda.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>

      <section
        style={{
          marginTop: 28,
          background: "linear-gradient(135deg, #f7e8d7 0%, #efd9c2 100%)",
          padding: 20,
          borderRadius: 14,
          boxShadow: "0 10px 24px rgba(92, 54, 24, 0.1)",
          border: "1px solid rgba(166, 116, 71, 0.2)",
        }}
      >
        <h3>Próximo passo</h3>
        <p style={{ margin: 0, color: "#4b5563" }}>
          Comece cadastrando seus insumos e produtos. Depois crie os modelos e
          registre as compras, despesas e a produção.
        </p>
      </section>
    </div>
  );
}
