import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

const TOKEN_KEY = "vm-token";
const USER_KEY = "vm-user";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(TOKEN_KEY);
    if (!stored) { setLoading(false); return; }
    setToken(stored);
    // Verify token
    fetch("/api/auth/me", { headers: { Authorization: `Bearer ${stored}` } })
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then(u => { setUser(u); setToken(stored); })
      .catch(() => { localStorage.removeItem(TOKEN_KEY); localStorage.removeItem(USER_KEY); setToken(null); })
      .finally(() => setLoading(false));
  }, []);

  const login = (tok, usr) => {
    localStorage.setItem(TOKEN_KEY, tok);
    localStorage.setItem(USER_KEY, JSON.stringify(usr));
    setToken(tok);
    setUser(usr);
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

export async function authFetch(url, options = {}) {
  const token = localStorage.getItem(TOKEN_KEY);
  const headers = { ...options.headers };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  if (options.body && typeof options.body === "object" && !(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
    options.body = JSON.stringify(options.body);
  }
  const resp = await fetch(url, { ...options, headers });
  if (resp.status === 401) {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    window.location.href = "/app/login";
    throw new Error("Session expirée");
  }
  return resp;
}
