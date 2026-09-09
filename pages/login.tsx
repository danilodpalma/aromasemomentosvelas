// pages/login.tsx
import { useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../context";
import Head from "next/head";

export default function Login() {
  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  const { login } = useAuth();
  const router = useRouter();

  async function handleRequestCode(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setInfo("");

    try {
      const res = await fetch("/api/auth/request-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (res.ok) {
        setStep("code");
        setInfo(
          data.message || "Se o e-mail estiver cadastrado, um código foi enviado.",
        );
      } else {
        setError(data.error || data.message || "Erro ao solicitar o código.");
      }
    } catch {
      setError("Erro ao conectar com o servidor.");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyCode(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });
      const data = await res.json();

      if (res.ok) {
        login(data.token, data.user);
        router.push("/dashboard");
      } else {
        setError(data.error || data.message || "Código inválido ou expirado.");
      }
    } catch {
      setError("Erro ao conectar com o servidor.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Head>
        <title>Login - Aromas e Momentos</title>
      </Head>

      <div
        style={{
          minHeight: "80vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 16,
        }}
      >
        <div
          style={{
            background: "white",
            borderRadius: 16,
            boxShadow: "0 10px 30px rgba(92, 54, 24, 0.15)",
            maxWidth: 420,
            width: "100%",
            padding: 32,
          }}
        >
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <h1 style={{ color: "#6b3b12", margin: 0, fontSize: 26 }}>
              Aromas e Momentos
            </h1>
            <p style={{ color: "#6b7280", marginTop: 8 }}>
              {step === "email"
                ? "Acesso administrativo"
                : `Digite o código enviado para ${email}`}
            </p>
          </div>

          {step === "email" ? (
            <form
              onSubmit={handleRequestCode}
              style={{ display: "grid", gap: 16 }}
            >
              <label style={{ fontWeight: 600, color: "#374151" }}>
                E-mail
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  required
                  style={{
                    width: "100%",
                    marginTop: 6,
                    padding: "10px 12px",
                    border: "1px solid #d1d5db",
                    borderRadius: 8,
                  }}
                />
              </label>

              {error && (
                <p
                  style={{
                    color: "#b91c1c",
                    background: "#fef2f2",
                    padding: 10,
                    borderRadius: 8,
                    fontSize: 14,
                    margin: 0,
                  }}
                >
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                style={{
                  padding: "12px 16px",
                  background: "rgb(167, 117, 75)",
                  color: "white",
                  border: "none",
                  borderRadius: 999,
                  fontWeight: 600,
                  cursor: loading ? "default" : "pointer",
                  opacity: loading ? 0.7 : 1,
                }}
              >
                {loading ? "Enviando..." : "Enviar código"}
              </button>
            </form>
          ) : (
            <form
              onSubmit={handleVerifyCode}
              style={{ display: "grid", gap: 16 }}
            >
              {info && (
                <p
                  style={{
                    color: "#166534",
                    background: "#ecfdf5",
                    padding: 10,
                    borderRadius: 8,
                    fontSize: 14,
                    margin: 0,
                  }}
                >
                  {info}
                </p>
              )}

              <label style={{ fontWeight: 600, color: "#374151" }}>
                Código de 6 dígitos
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                  placeholder="000000"
                  required
                  style={{
                    width: "100%",
                    marginTop: 6,
                    padding: "10px 12px",
                    border: "1px solid #d1d5db",
                    borderRadius: 8,
                    letterSpacing: 6,
                    fontSize: 20,
                    textAlign: "center",
                  }}
                />
              </label>

              {error && (
                <p
                  style={{
                    color: "#b91c1c",
                    background: "#fef2f2",
                    padding: 10,
                    borderRadius: 8,
                    fontSize: 14,
                    margin: 0,
                  }}
                >
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                style={{
                  padding: "12px 16px",
                  background: "rgb(167, 117, 75)",
                  color: "white",
                  border: "none",
                  borderRadius: 999,
                  fontWeight: 600,
                  cursor: loading ? "default" : "pointer",
                  opacity: loading ? 0.7 : 1,
                }}
              >
                {loading ? "Verificando..." : "Entrar"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setStep("email");
                  setCode("");
                  setError("");
                  setInfo("");
                }}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#6b7280",
                  cursor: "pointer",
                  fontSize: 13,
                }}
              >
                Usar outro e-mail
              </button>
            </form>
          )}
        </div>
      </div>
    </>
  );
}
