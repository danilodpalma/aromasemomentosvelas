import Link from "next/link";
import { useRouter } from "next/router";

const menuItems = [
  { href: "/dashboard", label: "Resumo" },
  { href: "/insumos", label: "Insumos" },
  { href: "/modelos", label: "Modelos" },
  { href: "/calculo", label: "Cálculo" },
  { href: "/compras", label: "Compras" },
  { href: "/producao", label: "Produção" },
  { href: "/vendas", label: "Vendas" },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "rgb(255, 246, 235)",
        color: "rgb(166, 116, 71)",
      }}
    >
      <header
        style={{
          borderBottom: "1px solid rgb(166, 116, 71)",
          background: "rgb(239, 221, 201)",
          padding: "16px 24px",
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 24,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <Link href="/">
              <img
                src="/Logo.png"
                alt="Aromase Momentos"
                style={{
                  height: 60,
                  width: "auto",
                  maxWidth: 270,
                  cursor: "pointer",
                  transition: "transform 0.2s ease",
                }}
                onMouseOver={(e) =>
                  (e.currentTarget.style.transform = "scale(1.05)")
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.transform = "scale(1)")
                }
              />
            </Link>
            {/* <div>
              <p
                style={{ margin: 20, color: "rgb(167, 117, 75)", fontSize: 18 }}
              >
                <center>Sistema de Gestão Aromas e Momentos</center>
              </p>
            </div> */}
          </div>
          <nav style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  textDecoration: "none",
                  color:
                    router.pathname === item.href
                      ? "rgb(255, 255, 255)"
                      : "rgb(166, 116, 71)",
                  fontWeight: router.pathname === item.href ? 700 : 500,
                }}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <main style={{ maxWidth: 1200, margin: "24px auto", padding: "0 24px" }}>
        {children}
      </main>
    </div>
  );
}
