import { useState, useEffect } from "react";

/* ─────────────────────────────────────────────
   CREDENTIALS  (demo only — frontend auth)
───────────────────────────────────────────── */
const USERS = {
  cidadao:  { password: "demoapp123", role: "citizen",  label: "Cidadão",       color: "#4A6FA5", icon: "👤" },
  auditor:  { password: "demoapp123", role: "auditor",  label: "Auditor",       color: "#168821", icon: "🔍" },
  admin:    { password: "demoapp123", role: "admin",    label: "Administrador", color: "#C97B00", icon: "⚙" },
};

/* ─────────────────────────────────────────────
   STYLES
───────────────────────────────────────────── */
const styles = `
@import url('https://fonts.googleapis.com/css2?family=Lexend:wght@300;400;600;700;800&family=Source+Sans+3:wght@300;400;600;700&family=DM+Mono:wght@400;500&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

.lp-root {
  min-height: 100vh;
  background: linear-gradient(160deg, #0D2B5E 0%, #071D41 50%, #0A2A5A 100%);
  display: flex;
  flex-direction: column;
  font-family: 'Source Sans 3', sans-serif;
  overflow: hidden;
  position: relative;
}

/* Subtle dot pattern */
.lp-bg {
  position: fixed; inset: 0; z-index: 0;
  background-image: radial-gradient(rgba(255,255,255,0.04) 1px, transparent 1px);
  background-size: 28px 28px;
}

/* Radial glow */
.lp-glow {
  position: fixed; z-index: 0;
  border-radius: 50%; filter: blur(90px); pointer-events: none;
}
.lp-glow-1 {
  width: 700px; height: 700px;
  background: radial-gradient(circle, rgba(19,81,180,0.3) 0%, transparent 70%);
  top: -250px; left: -200px;
  animation: lp-float1 14s ease-in-out infinite;
}
.lp-glow-2 {
  width: 500px; height: 500px;
  background: radial-gradient(circle, rgba(255,205,7,0.1) 0%, transparent 70%);
  bottom: -80px; right: -80px;
  animation: lp-float2 18s ease-in-out infinite;
}
@keyframes lp-float1 {
  0%, 100% { transform: translate(0, 0); }
  50% { transform: translate(40px, 30px); }
}
@keyframes lp-float2 {
  0%, 100% { transform: translate(0, 0); }
  50% { transform: translate(-30px, -20px); }
}

/* Govbar */
.lp-govbar {
  height: 6px;
  background: linear-gradient(90deg, #FFCD07 0%, #FFCD07 25%, #1351B4 25%);
  position: relative; z-index: 10; flex-shrink: 0;
}

/* Center content */
.lp-body {
  flex: 1; display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  padding: 3rem 1.5rem;
  position: relative; z-index: 1;
}

/* Top badge row */
.lp-badge-row {
  display: flex; align-items: center; gap: 1rem; margin-bottom: 2.5rem;
  animation: lp-fade-down 0.5s ease both;
}
@keyframes lp-fade-down {
  from { opacity: 0; transform: translateY(-16px); }
  to   { opacity: 1; transform: translateY(0); }
}

.lp-gov-badge {
  display: flex; align-items: center; gap: 0.5rem;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 8px; padding: 0.375rem 0.875rem;
}
.lp-gov-star {
  width: 26px; height: 26px; background: #FFCD07;
  border-radius: 50%; display: flex; align-items: center;
  justify-content: center; font-size: 0.7rem;
  font-weight: 800; color: #071D41;
}
.lp-gov-label {
  font-family: 'Lexend', sans-serif; font-size: 0.9375rem;
  font-weight: 700; color: #fff; letter-spacing: -0.01em;
}
.lp-badge-divider { width: 1px; height: 28px; background: rgba(255,255,255,0.12); }
.lp-portal-name {
  font-family: 'Lexend', sans-serif; font-size: 0.9375rem;
  font-weight: 600; color: rgba(255,255,255,0.7);
}

/* Card */
.lp-card {
  width: 100%; max-width: 440px;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.15);
  border-radius: 20px;
  backdrop-filter: blur(32px);
  -webkit-backdrop-filter: blur(32px);
  box-shadow: 0 24px 60px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.06) inset;
  padding: 2.5rem;
  animation: lp-fade-up 0.5s 0.1s ease both;
}
@keyframes lp-fade-up {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* Shield icon */
.lp-shield {
  width: 56px; height: 56px; margin: 0 auto 1.5rem;
  background: linear-gradient(135deg, #1351B4 0%, #0A3D8F 100%);
  border-radius: 14px;
  display: flex; align-items: center; justify-content: center;
  font-size: 1.5rem;
  box-shadow: 0 8px 24px rgba(19,81,180,0.4);
  border: 1px solid rgba(255,255,255,0.1);
}

.lp-card-title {
  font-family: 'Lexend', sans-serif; font-size: 1.375rem;
  font-weight: 700; color: #fff; text-align: center;
  letter-spacing: -0.03em; line-height: 1.2; margin-bottom: 0.375rem;
}
.lp-card-sub {
  font-size: 0.8125rem; color: rgba(255,255,255,0.4);
  text-align: center; margin-bottom: 2rem;
}

/* Form */
.lp-field { margin-bottom: 1rem; }
.lp-label {
  display: block; font-size: 0.75rem; font-weight: 600;
  color: rgba(255,255,255,0.5); letter-spacing: 0.06em;
  text-transform: uppercase; margin-bottom: 0.375rem;
}
.lp-input {
  width: 100%; padding: 0.75rem 1rem;
  background: rgba(255,255,255,0.09);
  border: 1px solid rgba(255,255,255,0.18);
  border-radius: 10px; outline: none;
  font-family: 'Source Sans 3', sans-serif;
  font-size: 0.9375rem; color: #fff;
  transition: border-color 0.18s, box-shadow 0.18s, background 0.18s;
}
.lp-input::placeholder { color: rgba(255,255,255,0.2); }
.lp-input:focus {
  border-color: #1351B4;
  background: rgba(19,81,180,0.1);
  box-shadow: 0 0 0 3px rgba(19,81,180,0.2);
}
.lp-input.lp-input-error {
  border-color: #E52207;
  box-shadow: 0 0 0 3px rgba(229,34,7,0.15);
}

.lp-error {
  margin-top: 0.5rem; padding: 0.625rem 0.875rem;
  background: rgba(229,34,7,0.12); border: 1px solid rgba(229,34,7,0.25);
  border-radius: 8px; font-size: 0.8125rem; color: #FF8F80;
  display: flex; align-items: center; gap: 0.5rem;
}

/* Submit */
.lp-submit {
  width: 100%; padding: 0.875rem;
  background: #1351B4; border: none; border-radius: 10px;
  font-family: 'Lexend', sans-serif; font-size: 0.9375rem;
  font-weight: 700; color: #fff; cursor: pointer;
  transition: background 0.18s, transform 0.1s, box-shadow 0.18s;
  box-shadow: 0 4px 16px rgba(19,81,180,0.4);
  margin-top: 0.5rem; letter-spacing: -0.01em;
  display: flex; align-items: center; justify-content: center; gap: 0.5rem;
}
.lp-submit:hover { background: #0A3D8F; box-shadow: 0 6px 24px rgba(19,81,180,0.5); }
.lp-submit:active { transform: scale(0.98); }
.lp-submit:disabled { opacity: 0.5; cursor: not-allowed; }

/* Divider */
.lp-divider {
  display: flex; align-items: center; gap: 0.75rem;
  margin: 1.5rem 0 1.25rem;
}
.lp-divider-line { flex: 1; height: 1px; background: rgba(255,255,255,0.08); }
.lp-divider-text { font-size: 0.6875rem; color: rgba(255,255,255,0.25); letter-spacing: 0.06em; text-transform: uppercase; }

/* Demo hint cards */
.lp-hints { display: flex; flex-direction: column; gap: 0.5rem; }
.lp-hint {
  display: flex; align-items: center; gap: 0.75rem;
  padding: 0.625rem 0.875rem;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 9px; cursor: pointer;
  transition: background 0.15s, border-color 0.15s;
}
.lp-hint:hover { background: rgba(255,255,255,0.06); border-color: rgba(255,255,255,0.14); }
.lp-hint-icon {
  width: 30px; height: 30px; border-radius: 7px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center; font-size: 0.875rem;
}
.lp-hint-info { flex: 1; }
.lp-hint-label {
  font-size: 0.8rem; font-weight: 700; color: rgba(255,255,255,0.8);
  font-family: 'Lexend', sans-serif; letter-spacing: -0.01em;
}
.lp-hint-creds {
  font-family: 'DM Mono', monospace; font-size: 0.7rem;
  color: rgba(255,255,255,0.3); margin-top: 1px;
}
.lp-hint-arrow { font-size: 0.75rem; color: rgba(255,255,255,0.2); }

/* Footer note */
.lp-security-note {
  margin-top: 2rem;
  display: flex; align-items: center; justify-content: center; gap: 0.5rem;
  font-size: 0.6875rem; color: rgba(255,255,255,0.2);
  letter-spacing: 0.04em;
  animation: lp-fade-up 0.5s 0.25s ease both;
}
`;

/* ─────────────────────────────────────────────
   COMPONENT
───────────────────────────────────────────── */
export default function LoginPortal({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    const user = USERS[username.trim().toLowerCase()];
    if (!user || password !== user.password) {
      setError("Usuário ou senha incorretos. Verifique as credenciais e tente novamente.");
      return;
    }
    setLoading(true);
    setTimeout(() => onLogin({ username: username.trim().toLowerCase(), role: user.role, label: user.label }), 500);
  };

  return (
    <>
      <style>{styles}</style>
      <div className="lp-root">
        <div className="lp-bg" />
        <div className="lp-glow lp-glow-1" />
        <div className="lp-glow lp-glow-2" />
        <div className="lp-govbar" />

        <div className="lp-body">
          <div className="lp-badge-row">
            <div className="lp-gov-badge">
              <div className="lp-gov-star">★</div>
              <span className="lp-gov-label">gov</span>
            </div>
            <div className="lp-badge-divider" />
            <span className="lp-portal-name">Portal da Transparência</span>
          </div>

          <div className="lp-card">
            <div className="lp-shield">🛡</div>
            <div className="lp-card-title">Acesso Seguro</div>
            <div className="lp-card-sub">Controladoria-Geral da Neotel — Autenticação LGPD</div>

            <form onSubmit={handleSubmit} noValidate>
              <div className="lp-field">
                <label className="lp-label" htmlFor="lp-user">Usuário</label>
                <input
                  id="lp-user"
                  className={`lp-input${error ? " lp-input-error" : ""}`}
                  type="text"
                  placeholder="ex: cidadao"
                  autoComplete="username"
                  value={username}
                  onChange={(e) => { setUsername(e.target.value); setError(""); }}
                />
              </div>
              <div className="lp-field">
                <label className="lp-label" htmlFor="lp-pass">Senha</label>
                <input
                  id="lp-pass"
                  className={`lp-input${error ? " lp-input-error" : ""}`}
                  type="password"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(""); }}
                />
              </div>
              {error && (
                <div className="lp-error">
                  <span>⚠</span> {error}
                </div>
              )}
              <button type="submit" className="lp-submit" disabled={loading}>
                {loading ? "Autenticando…" : "Entrar no Portal"}
              </button>
            </form>

          </div>

          <div className="lp-security-note">
            🔒 Acesso monitorado · Dados protegidos pela LGPD — Lei nº 13.709/2018
          </div>
        </div>
      </div>
    </>
  );
}
