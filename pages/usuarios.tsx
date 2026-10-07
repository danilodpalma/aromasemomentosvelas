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

const thStyle: React.CSSProperties = {
  padding: "10px 8px",
  textAlign: "center",
};

const tdStyle: React.CSSProperties = {
  padding: "8px 10px",
  borderTop: "1px solid rgb(167, 117, 75)",
  textAlign: "center",
  verticalAlign: "middle",
};

const badgeStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 4,
  padding: "4px 8px",
  borderRadius: 999,
  fontWeight: 700,
  lineHeight: 1.2,
  whiteSpace: "nowrap",
};

const qtyBadgeStyle: React.CSSProperties = {
  ...badgeStyle,
  minWidth: 32,
  background: "rgba(167, 117, 75, 0.12)",
  color: "#5b3a22",
};

const actionButtonStyle: React.CSSProperties = {
  padding: "5px 8px",
  color: "white",
  border: "none",
  borderRadius: 6,
  cursor: "pointer",
};

export default function Usuarios() {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();
  const router = useRouter();

  const [users, setUsers] = useState<UserRow[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("VIEWER");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [message, setMessage] = useState("");
  const [loadingList, setLoadingList] = useState(true);
  const isFormActive = isCreating || editingId !== null;

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
    if (!isFormActive) return;
    setMessage("");

    try {
      const res = await authFetch(
        editingId ? `/api/users?id=${editingId}` : "/api/users",
        {
          method: editingId ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, role }),
        },
      );
      const data = await res.json();

      if (res.ok) {
        setUsers((prev) =>
          editingId
            ? prev.map((user) => (user.id === data.id ? data : user))
            : [...prev, data],
        );
        setName("");
        setEmail("");
        setRole("VIEWER");
        setEditingId(null);
        setIsCreating(false);
        setMessage(
          editingId
            ? "Usuário atualizado com sucesso."
            : "Usuário cadastrado com sucesso.",
        );
        requestAnimationFrame(() => {
          window.scrollTo({ top: 0, behavior: "smooth" });
        });
      } else {
        setMessage(data.error || "Erro ao cadastrar usuário.");
      }
    } catch {
      setMessage("Erro inesperado ao cadastrar usuário.");
    }
  }

  function startNew() {
    setEditingId(null);
    setName("");
    setEmail("");
    setRole("VIEWER");
    setIsCreating(true);
    setMessage("");
  }

  function startEdit(user: UserRow) {
    setEditingId(user.id);
    setIsCreating(false);
    setName(user.name);
    setEmail(user.email);
    setRole(user.role);
    setMessage("Edição de usuário ativa. Faça as alterações e salve.");
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  function cancelForm() {
    setEditingId(null);
    setIsCreating(false);
    setName("");
    setEmail("");
    setRole("VIEWER");
    setMessage("");
  }

  async function handleDelete(id: number) {
    if (!confirm("Remover o acesso deste usuário?")) return;
    try {
      const res = await authFetch(`/api/users?id=${id}`, { method: "DELETE" });
      if (res.ok || res.status === 204) {
        setUsers((prev) => prev.filter((u) => u.id !== id));
        if (editingId === id) cancelForm();
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
            background:
              message.includes("sucesso") || message.includes("removido")
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
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 12,
              marginBottom: 12,
              flexWrap: "wrap",
            }}
          >
            <h3 style={{ margin: 0, color: COLORS.primaryDark }}>
              {editingId
                ? "Editar usuário"
                : isCreating
                  ? "Novo usuário"
                  : "Usuários"}
            </h3>
            {!isFormActive && (
              <button
                type="button"
                onClick={startNew}
                style={{
                  padding: "8px 14px",
                  background: COLORS.newButtonGradient,
                  color: "white",
                  border: "none",
                  borderRadius: 6,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                + Novo
              </button>
            )}
          </div>
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
                disabled={!isFormActive}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                style={{
                  width: "100%",
                  marginTop: 6,
                  padding: "8px 10px",
                  border: "1px solid rgb(166, 116, 71)",
                  borderRadius: 8,
                  background: isFormActive ? "#fff" : COLORS.grayLight,
                }}
              />
            </label>
            <label style={{ fontWeight: 600, color: COLORS.primaryDark }}>
              E-mail
              <input
                disabled={!isFormActive}
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
                  background: isFormActive ? "#fff" : COLORS.grayLight,
                }}
              />
            </label>
            <label style={{ fontWeight: 600, color: COLORS.primaryDark }}>
              Perfil
              <select
                disabled={!isFormActive}
                value={role}
                onChange={(e) => setRole(e.target.value)}
                style={{
                  width: "100%",
                  marginTop: 6,
                  padding: "8px 10px",
                  border: "1px solid rgb(166, 116, 71)",
                  borderRadius: 8,
                  background: isFormActive ? "#fff" : COLORS.grayLight,
                }}
              >
                <option value="VIEWER">Visualizador</option>
                <option value="EDITOR">Editor</option>
                <option value="ADMIN">Administrador</option>
              </select>
            </label>
            <button
              type="submit"
              disabled={!isFormActive}
              style={{
                padding: "10px 16px",
                background: `linear-gradient(135deg, ${COLORS.buttonGradientFrom} 0%, ${COLORS.buttonGradientTo} 100%)`,
                color: "white",
                border: "none",
                borderRadius: 999,
                fontWeight: 600,
                cursor: isFormActive ? "pointer" : "not-allowed",
                height: 40,
                opacity: isFormActive ? 1 : 0.6,
              }}
            >
              {editingId ? "Atualizar" : "Cadastrar"}
            </button>
            {isFormActive && (
              <button
                type="button"
                onClick={cancelForm}
                style={{
                  padding: "10px 16px",
                  background: COLORS.cancelButtonBackground,
                  color: "white",
                  border: "none",
                  borderRadius: 6,
                  fontWeight: 600,
                  cursor: "pointer",
                  height: 40,
                }}
              >
                Cancelar
              </button>
            )}
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
            <table
              style={{ width: "100%", borderCollapse: "collapse", fontSize: 11.5 }}
            >
              <thead style={{ background: "rgba(255,255,255,0.35)" }}>
                <tr>
                  <th style={thStyle}>Nome</th>
                  <th style={thStyle}>E-mail</th>
                  <th style={thStyle}>Perfil</th>
                  <th style={thStyle}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      style={{ ...tdStyle, padding: 16 }}
                    >
                      Nenhum usuário cadastrado ainda.
                    </td>
                  </tr>
                ) : (
                  users.map((u, index) => (
                    <tr
                      key={u.id}
                      style={{
                        background:
                          index % 2 === 0
                            ? COLORS.tableRowEven
                            : COLORS.tableRowOdd,
                      }}
                    >
                      <td
                        style={tdStyle}
                      >
                        {u.name}
                      </td>
                      <td
                        style={tdStyle}
                      >
                        {u.email}
                      </td>
                      <td
                        style={tdStyle}
                      >
                        <span style={qtyBadgeStyle}>
                          {ROLE_LABELS[u.role] || u.role}
                        </span>
                      </td>
                      <td style={{ ...tdStyle, padding: 8, whiteSpace: "nowrap" }}>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "center",
                            gap: 6,
                          }}
                        >
                          <button
                            type="button"
                            onClick={() => startEdit(u)}
                            style={{
                              ...actionButtonStyle,
                              background: COLORS.primary,
                            }}
                          >
                            Editar
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(u.id)}
                            style={{
                              ...actionButtonStyle,
                              background: COLORS.dangerLight,
                            }}
                          >
                            Remover
                          </button>
                        </div>
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
