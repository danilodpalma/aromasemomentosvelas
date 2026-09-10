// pages/usuarios.tsx
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../context";
import { authFetch } from "../lib/apiClient";
import { COLORS } from "../styles/theme";

type UserRow = {
  id: number;
  name: string;
  email: string;
  role: string;
  createdAt: string;
};

const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Administrador",
  EDITOR: "Editor",
  VIEWER: "Visualizador",
};

export default function Usuarios() {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();
  const router = useRouter();

  const [users, setUsers] = useState<UserRow[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("VIEWER");
  const [message, setMessage] = useState("");
  const [loadingList, setLoadingList] = useState(true);

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !isAdmin)) {
      router.push("/dashboard");
    }
  }, [isLoading, isAuthenticated, isAdmin, router]);

  useEffect(() => {
    if (!isAuthenticated || !isAdmin) return;
    loadUsers();
  }, [isAuthenticated, isAdmin]);

  async function loadUsers() {
    setLoadingList(true);
    try {
      const res = await authFetch("/api/users");
      const data = await res.json();
      if (res.ok) {
        setUsers(Array.isArray(data) ? data : []);
      } else {
        setMessage(data.error || "Erro ao carregar usuários.");
      }
    } catch {
      setMessage("Erro ao carregar usuários.");
    } finally {
      setLoadingList(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");

    try {
      const res = await authFetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, role }),
      });
      const data = await res.json();

      if (res.ok) {
        setUsers((prev) => [...prev, data]);
        setName("");
        setEmail("");
        setRole("VIEWER");
        setMessage("Usuário cadastrado com sucesso.");
      } else {
        setMessage(data.error || "Erro ao cadastrar usuário.");
      }
    } catch {
      setMessage("Erro inesperado ao cadastrar usuário.");
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Remover o acesso deste usuário?")) return;
    try {
      const res = await authFetch(`/api/users?id=${id}`, { method: "DELETE" });
      if (res.ok || res.status === 204) {
        setUsers((prev) => prev.filter((u) => u.id !== id));
        setMessage("Usuário removido.");
      } else {
        const data = await res.json().catch(() => ({}));
        setMessage(data.error || "Erro ao remover usuário.");
      }
    } catch {
      setMessage("Erro inesperado ao remover usuário.");
    }
  }

  if (isLoading || !isAuthenticated || !isAdmin) {
    return null;
  }

  return (
    <div>
      <h2 style={{ marginBottom: 6, color: COLORS.primaryDark }}>Usuários</h2>
      <p style={{ marginTop: 0, color: COLORS.primaryDarkAlt }}>
        Cadastre quem pode acessar o sistema. O acesso é feito por e-mail e
        código, sem senha — basta a pessoa estar cadastrada aqui.
      </p>

      {message && (
        <div
          style={{
            margin: "16px 0",
            padding: 14,
            background: message.includes("sucesso") || message.includes("removido")
              ? COLORS.successBg
              : "#fef2f2",
            border: COLORS.cardBorder,
            borderRadius: 8,
          }}
        >
          {message}
        </div>
      )}

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 20,
          marginTop: 20,
          maxWidth: 900,
          marginLeft: "auto",
          marginRight: "auto",
        }}
      >
        <section
          style={{
            background: `linear-gradient(135deg, ${COLORS.cardGradientFrom} 0%, ${COLORS.cardGradientTo} 100%)`,
            padding: 18,
            borderRadius: 14,
            boxShadow: COLORS.cardShadow,
            border: COLORS.cardBorder,
          }}
        >
          <h3 style={{ margin: "0 0 12px", color: COLORS.primaryDark }}>
            Novo usuário
          </h3>
          <form
            onSubmit={handleSubmit}
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: 12,
              alignItems: "end",
            }}
          >
            <label style={{ fontWeight: 600, color: COLORS.primaryDark }}>
              Nome
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                style={{
                  width: "100%",
                  marginTop: 6,
                  padding: "8px 10px",
                  border: "1px solid rgb(166, 116, 71)",
                  borderRadius: 8,
                  background: "#fff",
                }}
              />
            </label>
            <label style={{ fontWeight: 600, color: COLORS.primaryDark }}>
              E-mail
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  width: "100%",
                  marginTop: 6,
                  padding: "8px 10px",
                  border: "1px solid rgb(166, 116, 71)",
                  borderRadius: 8,
                  background: "#fff",
                }}
              />
            </label>
            <label style={{ fontWeight: 600, color: COLORS.primaryDark }}>
              Perfil
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                style={{
                  width: "100%",
                  marginTop: 6,
                  padding: "8px 10px",
                  border: "1px solid rgb(166, 116, 71)",
                  borderRadius: 8,
                  background: "#fff",
                }}
              >
                <option value="VIEWER">Visualizador</option>
                <option value="EDITOR">Editor</option>
                <option value="ADMIN">Administrador</option>
              </select>
            </label>
            <button
              type="submit"
              style={{
                padding: "10px 16px",
                background: `linear-gradient(135deg, ${COLORS.buttonGradientFrom} 0%, ${COLORS.buttonGradientTo} 100%)`,
                color: "white",
                border: "none",
                borderRadius: 999,
                fontWeight: 600,
                cursor: "pointer",
                height: 40,
              }}
            >
              Cadastrar
            </button>
          </form>
        </section>

        <section
          style={{
            background: `linear-gradient(135deg, ${COLORS.cardGradientFrom} 0%, ${COLORS.cardGradientTo} 100%)`,
            padding: 20,
            borderRadius: 14,
            boxShadow: COLORS.cardShadow,
            border: COLORS.cardBorder,
          }}
        >
          <h3 style={{ margin: "0 0 12px", color: COLORS.primaryDark }}>
            Usuários cadastrados
          </h3>
          {loadingList ? (
            <p>Carregando...</p>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={{ padding: 10, textAlign: "left" }}>Nome</th>
                  <th style={{ padding: 10, textAlign: "left" }}>E-mail</th>
                  <th style={{ padding: 10, textAlign: "left" }}>Perfil</th>
                  <th style={{ padding: 10, textAlign: "center" }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ padding: 16, textAlign: "center" }}>
                      Nenhum usuário cadastrado ainda.
                    </td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr key={u.id}>
                      <td
                        style={{
                          padding: 10,
                          borderTop: COLORS.cardBorder,
                        }}
                      >
                        {u.name}
                      </td>
                      <td
                        style={{
                          padding: 10,
                          borderTop: COLORS.cardBorder,
                        }}
                      >
                        {u.email}
                      </td>
                      <td
                        style={{
                          padding: 10,
                          borderTop: COLORS.cardBorder,
                        }}
                      >
                        {ROLE_LABELS[u.role] || u.role}
                      </td>
                      <td
                        style={{
                          padding: 10,
                          borderTop: COLORS.cardBorder,
                          textAlign: "center",
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => handleDelete(u.id)}
                          style={{
                            padding: "6px 10px",
                            background: COLORS.danger,
                            color: "white",
                            border: "none",
                            borderRadius: 6,
                            cursor: "pointer",
                          }}
                        >
                          Remover
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </section>
      </div>
    </div>
  );
}
