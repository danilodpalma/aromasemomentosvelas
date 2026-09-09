// lib/apiClient.ts
// Use este fetch no lugar do fetch nativo para chamadas que exigem login
// (POST, PUT, PATCH, DELETE). Ele anexa o token salvo no login automaticamente.

export function authFetch(url: string, options: RequestInit = {}) {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const headers = {
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  return fetch(url, { ...options, headers });
}
