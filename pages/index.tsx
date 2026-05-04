import Link from "next/link";

export default function Home() {
  return (
    <div>
      {/* <h2>
        <center>
          Bem-vindo a Aromas e Momentos escolha uma opção abaixo para começar.
        </center>
      </h2> */}

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 16,
          marginTop: 24,
        }}
      >
        <Link
          href="/dashboard"
          style={{
            padding: 15,
            borderRadius: 15,
            background: "rgb(166, 116, 71)",
            boxShadow: "0 1px 3px rgba(15, 23, 42, 0.08)",
            textAlign: "center",
            textDecoration: "none",
            color: "#ffffff",
          }}
        >
          <h3>Resumo</h3>
          <p>Veja o dashboard com indicadores e vendas recentes.</p>
        </Link>
        <Link
          href="/insumos"
          style={{
            padding: 15,
            borderRadius: 15,
            background: "rgb(167, 117, 75)",
            boxShadow: "0 1px 3px rgba(15, 23, 42, 0.08)",
            textAlign: "center",
            textDecoration: "none",
            color: "#ffffff",
          }}
        >
          <h3>Insumos</h3>
          <p>Cadastre seus materiais e custos.</p>
        </Link>
        <Link
          href="/modelos"
          style={{
            padding: 15,
            borderRadius: 15,
            background: "rgb(167, 117, 75)",
            boxShadow: "0 1px 3px rgba(15, 23, 42, 0.08)",
            textAlign: "center",
            textDecoration: "none",
            color: "#ffffff",
          }}
        >
          <h3>Modelos</h3>
          <p>Planeje os modelos e insumos usados.</p>
        </Link>
        <Link
          href="/calculo"
          style={{
            padding: 15,
            borderRadius: 15,
            background: "rgb(167, 117, 75)",
            boxShadow: "0 1px 3px rgba(15, 23, 42, 0.08)",
            textAlign: "center",
            textDecoration: "none",
            color: "#ffffff",
          }}
        >
          <h3>Cálculo</h3>
          <p>Calcule custos e preços finais dos modelos.</p>
        </Link>
        <Link
          href="/compras"
          style={{
            padding: 15,
            borderRadius: 15,
            background: "rgb(167, 117, 75)",
            boxShadow: "0 1px 3px rgba(15, 23, 42, 0.08)",
            textAlign: "center",
            textDecoration: "none",
            color: "#ffffff",
          }}
        >
          <h3>Compras</h3>
          <p>Registre as compras e despesas.</p>
        </Link>
        <Link
          href="/producao"
          style={{
            padding: 15,
            borderRadius: 15,
            background: "rgb(167, 117, 75)",
            boxShadow: "0 1px 3px rgba(15, 23, 42, 0.08)",
            textAlign: "center",
            textDecoration: "none",
            color: "#ffffff",
          }}
        >
          <h3>Produção</h3>
          <p>Acompanhe a produção diária e semanal.</p>
        </Link>
        <Link
          href="/vendas"
          style={{
            padding: 15,
            borderRadius: 15,
            background: "rgb(167, 117, 75)",
            boxShadow: "0 1px 3px rgba(15, 23, 42, 0.08)",
            textAlign: "center",
            textDecoration: "none",
            color: "#ffffff",
          }}
        >
          <h3>Vendas</h3>
          <p>Registre vendas e veja o histórico.</p>
        </Link>
      </section>
    </div>
  );
}
