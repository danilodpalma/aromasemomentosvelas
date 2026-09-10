import Link from "next/link";
import { useRouter } from "next/router";
import Head from "next/head";
import { useAuth } from "../context";
import { COLORS } from "../styles/theme";

const menuItems = [
  { href: "/dashboard", label: "Resumo" },
  { href: "/insumos", label: "Insumos" },
  { href: "/modelos", label: "Modelos" },
  { href: "/calculo", label: "Cálculo" },
  { href: "/compras", label: "Compras" },
  { href: "/estoque", label: "Estoque" },
  { href: "/producao", label: "Produção" },
  { href: "/vendas", label: "Vendas" },
  { href: "/parametros", label: "Parâmetros" },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();

  function handleLogout() {
    logout();
    router.push("/login");
  }

  // Descobre qual item do menu corresponde à página aberta no momento
  const currentMenu = menuItems.find((item) => item.href === router.pathname);

  // Se encontrar o menu, monta "Aromas e Momentos | Nome". Se não encontrar (ex: home), deixa apenas "Aromas e Momentos"
  const pageTitle = currentMenu
    ? `Aromas e Momentos | ${currentMenu.label}`
    : "Aromas e Momentos";

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "rgb(255, 246, 235)",
        color: COLORS.primaryBorder,
      }}
    >
      {/* O componente Head agora utiliza a variável pageTitle para atualizar o título automaticamente */}
      <Head>
        <title>{pageTitle}</title>
        <link rel="icon" href="/favicon.png" type="image/png" />
      </Head>

      <header
        style={{
          borderBottom: COLORS.cardBorder,
          background: `linear-gradient(135deg, ${COLORS.cardGradientFrom} 0%, ${COLORS.cardGradientTo} 100%)`,
          padding: "16px 24px",
          boxShadow: "0 6px 18px rgba(92, 54, 24, 0.08)",
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
          </div>
          <nav
            style={{
              display: "flex",
              gap: 12,
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  textDecoration: "none",
                  color:
                    router.pathname === item.href
                      ? COLORS.white
                      : COLORS.primaryBorder,
                  fontWeight: router.pathname === item.href ? 700 : 500,
                  padding: "7px 12px",
                  borderRadius: 999,
                  background:
                    router.pathname === item.href
                      ? `linear-gradient(135deg, ${COLORS.buttonGradientFrom} 0%, ${COLORS.buttonGradientTo} 100%)`
                      : "transparent",
                }}
              >
                {item.label}
              </Link>
            ))}
            {isAdmin && (
              <Link
                href="/usuarios"
                style={{
                  textDecoration: "none",
                  color:
                    router.pathname === "/usuarios"
                      ? COLORS.white
                      : COLORS.primaryBorder,
                  fontWeight: router.pathname === "/usuarios" ? 700 : 500,
                  padding: "7px 12px",
                  borderRadius: 999,
                  background:
                    router.pathname === "/usuarios"
                      ? `linear-gradient(135deg, ${COLORS.buttonGradientFrom} 0%, ${COLORS.buttonGradientTo} 100%)`
                      : "transparent",
                }}
              >
                Usuários
              </Link>
            )}
            {isAuthenticated ? (
              <button
                type="button"
                onClick={handleLogout}
                style={{
                  padding: "7px 14px",
                  borderRadius: 999,
                  border: "1px solid rgb(167, 117, 75)",
                  background: "transparent",
                  color: COLORS.primaryBorder,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
                title={user?.email}
              >
                Sair
              </button>
            ) : (
              <Link
                href="/login"
                style={{
                  textDecoration: "none",
                  padding: "7px 14px",
                  borderRadius: 999,
                  border: "1px solid rgb(167, 117, 75)",
                  color: COLORS.primaryBorder,
                  fontWeight: 600,
                }}
              >
                Entrar
              </Link>
            )}
          </nav>
        </div>
      </header>
      <main
        style={{
          maxWidth: 1240,
          margin: "24px auto",
          padding: "0 24px 40px",
        }}
      >
        {children}
      </main>
    </div>
  );
}
