import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../auth";
import { useColors } from "../shared";

export default function Login() {
  const c = useColors();
  const { login } = useAuth();
  const nav = useNavigate();
  const [mode, setMode] = useState("login"); // login | register
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [entreprise, setEntreprise] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const url = mode === "login" ? "/api/auth/login" : "/api/auth/register";
      const body = mode === "login"
        ? { email, password }
        : { email, password, nom, prenom, entreprise_nom: entreprise };
      const resp = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.detail || "Erreur");
      login(data.token, data.user);
      nav("/app/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: "100%", padding: "12px 14px", borderRadius: 10,
    border: `1px solid ${c.bd}`, background: c.bgE, color: c.tx,
    fontSize: 14, outline: "none", boxSizing: "border-box",
  };

  return (
    <div style={{ minHeight: "100vh", background: c.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24 }}>
      {/* Logo */}
      <Link to="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", color: c.tx, marginBottom: 32 }}>
        <div style={{ width: 36, height: 36, borderRadius: 9, background: `linear-gradient(135deg,${c.ac},${c.acL})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 800, color: "#fff" }}>V</div>
        <span style={{ fontSize: 20, fontWeight: 600 }}>Vend<span style={{ color: c.ac }}>Mieux</span></span>
      </Link>

      <div style={{ width: "100%", maxWidth: 400, background: c.bgC, border: `1px solid ${c.bd}`, borderRadius: 16, padding: 32 }}>
        <h2 style={{ margin: "0 0 6px", fontSize: 20, fontWeight: 700 }}>
          {mode === "login" ? "Connexion" : "Inscription"}
        </h2>
        <p style={{ margin: "0 0 24px", fontSize: 13, color: c.mt }}>
          {mode === "login" ? "Accédez à votre dashboard" : "Créez votre compte commercial"}
        </p>

        {error && (
          <div style={{ padding: "10px 14px", borderRadius: 8, background: c.dnD, color: c.dn, fontSize: 13, marginBottom: 16 }}>
            {error}
          </div>
        )}

        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {mode === "register" && (
            <>
              <div style={{ display: "flex", gap: 10 }}>
                <input placeholder="Prénom" value={prenom} onChange={e => setPrenom(e.target.value)} style={inputStyle} required />
                <input placeholder="Nom" value={nom} onChange={e => setNom(e.target.value)} style={inputStyle} required />
              </div>
              <input placeholder="Nom de l'entreprise" value={entreprise} onChange={e => setEntreprise(e.target.value)} style={inputStyle} />
            </>
          )}
          <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} style={inputStyle} required />
          <input type="password" placeholder="Mot de passe" value={password} onChange={e => setPassword(e.target.value)} style={inputStyle} required minLength={6} />
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: "12px 20px", borderRadius: 10, border: "none",
              background: loading ? c.dm : `linear-gradient(135deg,${c.ac},${c.acL})`,
              color: "#fff", fontSize: 14, fontWeight: 600, cursor: loading ? "wait" : "pointer",
              marginTop: 4,
            }}
          >
            {loading ? "..." : mode === "login" ? "Se connecter" : "Créer mon compte"}
          </button>
        </form>

        <div style={{ marginTop: 20, textAlign: "center", fontSize: 13, color: c.mt }}>
          {mode === "login" ? (
            <>Pas encore de compte ? <button onClick={() => { setMode("register"); setError(""); }} style={{ background: "none", border: "none", color: c.ac, cursor: "pointer", fontWeight: 600, fontSize: 13 }}>S'inscrire</button></>
          ) : (
            <>Déjà un compte ? <button onClick={() => { setMode("login"); setError(""); }} style={{ background: "none", border: "none", color: c.ac, cursor: "pointer", fontWeight: 600, fontSize: 13 }}>Se connecter</button></>
          )}
        </div>
      </div>

      <p style={{ marginTop: 24, fontSize: 12, color: c.dm }}>
        <Link to="/" style={{ color: c.dm, textDecoration: "none" }}>Retour au site</Link>
      </p>
    </div>
  );
}
