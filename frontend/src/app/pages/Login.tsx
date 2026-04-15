import { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { apiClient } from "@/lib/api";

const styles = `
  * { box-sizing: border-box; }

  .hr-login-root {
    min-height: 100vh;
    display: flex;
    font-family: 'Plus Jakarta Sans', sans-serif;
    background: #F0FDF4;
    overflow: hidden;
  }

  /* ── Left panel ── */
  .hr-login-left {
    flex: 0 0 55%;
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 2.5rem 3.5rem;
    background: linear-gradient(145deg, #ECFDF5 0%, #F0FDF4 40%, #EFF6FF 100%);
    overflow: hidden;
  }

  /* Noise texture overlay */
  .hr-login-left::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E");
    pointer-events: none;
    z-index: 0;
  }

  /* Decorative large soft circles */
  .hr-login-left::after {
    content: '';
    position: absolute;
    width: 480px;
    height: 480px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(5,150,105,0.07) 0%, transparent 70%);
    top: -120px;
    right: -80px;
    pointer-events: none;
    z-index: 0;
  }

  .hr-login-left-content {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    height: 100%;
  }

  /* Logo */
  .hr-logo-wrap {
    display: flex;
    align-items: center;
    gap: 0.625rem;
  }

  .hr-logo-img {
    height: 100px;
    width: auto;
  }

  /* Team avatars illustration */
  .hr-illustration {
    position: relative;
    height: 220px;
    flex-shrink: 0;
  }

  .hr-avatar-bubble {
    position: absolute;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    letter-spacing: -0.02em;
    box-shadow: 0 4px 20px rgba(0,0,0,0.08);
    border: 3px solid #fff;
  }

  .hr-avatar-lg {
    width: 64px;
    height: 64px;
    font-size: 1.125rem;
  }

  .hr-avatar-md {
    width: 50px;
    height: 50px;
    font-size: 0.875rem;
  }

  .hr-avatar-sm {
    width: 38px;
    height: 38px;
    font-size: 0.75rem;
  }

  .hr-av-1 { background: #DBEAFE; color: #1D4ED8; top: 20px; left: 40px; animation: hrFloat1 5.5s ease-in-out infinite; }
  .hr-av-2 { background: #D1FAE5; color: #065F46; top: 10px; left: 160px; animation: hrFloat2 6s ease-in-out infinite; }
  .hr-av-3 { background: #FEF3C7; color: #92400E; top: 70px; left: 270px; animation: hrFloat3 5s ease-in-out infinite; }
  .hr-av-4 { background: #EDE9FE; color: #5B21B6; top: 120px; left: 80px; animation: hrFloat1 6.5s ease-in-out 0.5s infinite; }
  .hr-av-5 { background: #FCE7F3; color: #9D174D; top: 130px; left: 200px; animation: hrFloat2 5.2s ease-in-out 1s infinite; }
  .hr-av-6 { background: #FFEDD5; color: #9A3412; top: 160px; left: 340px; animation: hrFloat3 7s ease-in-out 0.3s infinite; }

  /* Connection lines SVG between some avatars */
  .hr-connection-lines {
    position: absolute;
    inset: 0;
    pointer-events: none;
  }

  @keyframes hrFloat1 {
    0%, 100% { transform: translateY(0px); }
    50%       { transform: translateY(-10px); }
  }
  @keyframes hrFloat2 {
    0%, 100% { transform: translateY(-5px) translateX(3px); }
    50%       { transform: translateY(5px) translateX(-3px); }
  }
  @keyframes hrFloat3 {
    0%, 100% { transform: translateY(3px) rotate(-2deg); }
    50%       { transform: translateY(-7px) rotate(2deg); }
  }

  /* Headline */
  .hr-headline-block {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 1.5rem 0;
  }

  .hr-eyebrow {
    font-size: 0.6875rem;
    font-weight: 600;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: #059669;
    margin-bottom: 1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .hr-eyebrow-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #059669;
  }

  .hr-headline {
    font-size: clamp(2.25rem, 3.2vw, 3rem);
    font-weight: 800;
    line-height: 1.1;
    letter-spacing: -0.04em;
    color: #111827;
    margin-bottom: 1.25rem;
  }

  .hr-headline em {
    font-style: normal;
    color: #059669;
  }

  .hr-tagline {
    font-size: 0.9375rem;
    font-weight: 400;
    line-height: 1.7;
    color: #6B7280;
    max-width: 380px;
  }

  /* Stats row */
  .hr-stats-row {
    display: flex;
    align-items: center;
    gap: 2rem;
    padding-top: 1.5rem;
    border-top: 1px solid rgba(5,150,105,0.12);
  }

  .hr-stat {
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
  }

  .hr-stat-number {
    font-size: 1.25rem;
    font-weight: 700;
    letter-spacing: -0.03em;
    color: #111827;
  }

  .hr-stat-label {
    font-size: 0.6875rem;
    font-weight: 400;
    color: #9CA3AF;
    letter-spacing: 0.02em;
  }

  .hr-stat-divider {
    width: 1px;
    height: 28px;
    background: rgba(5,150,105,0.12);
  }

  /* ── Right panel ── */
  .hr-login-right {
    flex: 0 0 45%;
    background: #ffffff;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 3rem 3.5rem;
    position: relative;
    border-left: 1px solid #E5E7EB;
    overflow-y: auto;
  }

  .hr-login-right::-webkit-scrollbar { width: 4px; }
  .hr-login-right::-webkit-scrollbar-track { background: transparent; }
  .hr-login-right::-webkit-scrollbar-thumb { background: #E5E7EB; border-radius: 2px; }

  /* Subtle top accent */
  .hr-login-right::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 3px;
    background: linear-gradient(90deg, #059669 0%, #34D399 50%, transparent 100%);
  }

  .hr-form-greeting {
    font-size: 1.625rem;
    font-weight: 700;
    letter-spacing: -0.03em;
    color: #111827;
    margin-bottom: 0.375rem;
  }

  .hr-form-sub {
    font-size: 0.875rem;
    color: #6B7280;
    font-weight: 400;
    margin-bottom: 2.25rem;
    line-height: 1.5;
  }

  /* Field */
  .hr-field {
    margin-bottom: 1.25rem;
  }

  .hr-label {
    display: block;
    font-size: 0.8125rem;
    font-weight: 500;
    color: #374151;
    margin-bottom: 0.5rem;
    letter-spacing: -0.01em;
  }

  .hr-input-wrap {
    position: relative;
  }

  .hr-input {
    width: 100%;
    background: #F9FAFB;
    border: 1.5px solid #E5E7EB;
    border-radius: 9px;
    padding: 0.6875rem 0.875rem;
    color: #111827;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 0.9375rem;
    font-weight: 400;
    outline: none;
    transition: border-color 0.18s, box-shadow 0.18s, background 0.18s;
    caret-color: #059669;
  }

  .hr-input.has-toggle {
    padding-right: 2.75rem;
  }

  .hr-input::placeholder {
    color: #9CA3AF;
    font-weight: 400;
  }

  .hr-input:hover {
    border-color: #D1D5DB;
    background: #fff;
  }

  .hr-input:focus {
    border-color: #059669;
    background: #fff;
    box-shadow: 0 0 0 3px rgba(5,150,105,0.1);
  }

  .hr-input.error {
    border-color: #F87171;
    background: #FFF;
  }

  .hr-input.error:focus {
    box-shadow: 0 0 0 3px rgba(248,113,113,0.1);
  }

  .hr-toggle-btn {
    position: absolute;
    right: 0.875rem;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    cursor: pointer;
    color: #9CA3AF;
    display: flex;
    align-items: center;
    padding: 0;
    transition: color 0.15s;
  }

  .hr-toggle-btn:hover { color: #6B7280; }

  .hr-error-text {
    display: block;
    margin-top: 0.375rem;
    font-size: 0.75rem;
    color: #EF4444;
    font-weight: 400;
  }

  /* Submit button */
  .hr-submit-btn {
    width: 100%;
    margin-top: 0.5rem;
    padding: 0.8125rem 1.5rem;
    background: #059669;
    color: #fff;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 0.9375rem;
    font-weight: 600;
    border: none;
    border-radius: 9px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    letter-spacing: -0.01em;
    transition: background 0.18s, box-shadow 0.18s, transform 0.15s;
  }

  .hr-submit-btn:hover:not(:disabled) {
    background: #047857;
    box-shadow: 0 4px 20px rgba(5,150,105,0.3);
    transform: translateY(-1px);
  }

  .hr-submit-btn:active:not(:disabled) {
    transform: translateY(0);
    box-shadow: none;
  }

  .hr-submit-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  /* Error block */
  .hr-form-error {
    margin-top: 1rem;
    padding: 0.75rem 1rem;
    background: #FEF2F2;
    border: 1px solid #FECACA;
    border-radius: 8px;
    font-size: 0.8125rem;
    color: #B91C1C;
    line-height: 1.5;
  }

  /* Footer */
  .hr-form-footer {
    margin-top: 1.75rem;
    padding-top: 1.5rem;
    border-top: 1px solid #F3F4F6;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .hr-footer-text {
    font-size: 0.8125rem;
    color: #9CA3AF;
    font-weight: 400;
  }

  .hr-footer-link {
    font-size: 0.8125rem;
    color: #059669;
    font-weight: 600;
    background: none;
    border: none;
    cursor: pointer;
    font-family: 'Plus Jakarta Sans', sans-serif;
    padding: 0;
    transition: color 0.15s;
    letter-spacing: -0.01em;
  }

  .hr-footer-link:hover { color: #047857; }

  .hr-copyright {
    margin-top: 2rem;
    font-size: 0.6875rem;
    color: #D1D5DB;
    letter-spacing: 0.02em;
    text-align: center;
  }

  /* ── Animations ── */
  @keyframes hrFadeUp {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes hrFadeRight {
    from { opacity: 0; transform: translateX(-20px); }
    to   { opacity: 1; transform: translateX(0); }
  }

  .hr-anim-r1 { animation: hrFadeUp 0.45s cubic-bezier(0.22,1,0.36,1) 0.05s both; }
  .hr-anim-r2 { animation: hrFadeUp 0.45s cubic-bezier(0.22,1,0.36,1) 0.12s both; }
  .hr-anim-r3 { animation: hrFadeUp 0.45s cubic-bezier(0.22,1,0.36,1) 0.19s both; }
  .hr-anim-r4 { animation: hrFadeUp 0.45s cubic-bezier(0.22,1,0.36,1) 0.26s both; }
  .hr-anim-r5 { animation: hrFadeUp 0.45s cubic-bezier(0.22,1,0.36,1) 0.33s both; }
  .hr-anim-r6 { animation: hrFadeUp 0.45s cubic-bezier(0.22,1,0.36,1) 0.40s both; }

  .hr-anim-l1 { animation: hrFadeRight 0.6s cubic-bezier(0.22,1,0.36,1) 0.1s  both; }
  .hr-anim-l2 { animation: hrFadeRight 0.6s cubic-bezier(0.22,1,0.36,1) 0.22s both; }
  .hr-anim-l3 { animation: hrFadeRight 0.6s cubic-bezier(0.22,1,0.36,1) 0.34s both; }

  @media (max-width: 820px) {
    .hr-login-left  { display: none; }
    .hr-login-right { flex: 1; padding: 2.5rem 1.75rem; }
  }
`;

export default function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const handleSubmit = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    setSubmitError("");

    if (!username.trim() || !password) {
      setSubmitError("Usuário e senha são obrigatórios.");
      return;
    }

    try {
      setIsSubmitting(true);
      await apiClient.login(username.trim(), password);
      toast.success("Login realizado com sucesso.");
      navigate("/employees");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro ao fazer login.";
      setSubmitError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <style>{styles}</style>

      <div className="hr-login-root">
        {/* ── Left panel ── */}
        <div className="hr-login-left">
          <div className="hr-login-left-content">
            

            {/* Team illustration */}
            <div className="hr-illustration hr-anim-l2">
              <svg className="hr-connection-lines" viewBox="0 0 420 220" fill="none">
                <line x1="72" y1="52" x2="185" y2="35" stroke="#D1FAE5" strokeWidth="1.5" strokeDasharray="4 3"/>
                <line x1="185" y1="35" x2="298" y2="87" stroke="#BFDBFE" strokeWidth="1.5" strokeDasharray="4 3"/>
                <line x1="109" y1="145" x2="225" y2="155" stroke="#DDD6FE" strokeWidth="1.5" strokeDasharray="4 3"/>
                <line x1="72" y1="52" x2="109" y2="145" stroke="#D1FAE5" strokeWidth="1" strokeDasharray="3 4" opacity="0.5"/>
              </svg>
              <div className="hr-avatar-bubble hr-avatar-lg hr-av-1">VC</div>
              <div className="hr-avatar-bubble hr-avatar-md hr-av-2">GD</div>
              <div className="hr-avatar-bubble hr-avatar-sm hr-av-3">MF</div>
              <div className="hr-avatar-bubble hr-avatar-md hr-av-4">MC</div>
              <div className="hr-avatar-bubble hr-avatar-lg hr-av-5">EJ</div>
              <div className="hr-avatar-bubble hr-avatar-sm hr-av-6">NG</div>
            </div>

            {/* Headline */}
            <div className="hr-headline-block hr-anim-l2">
              <div className="hr-eyebrow">
                <span className="hr-eyebrow-dot" />
                Plataforma da neotel
              </div>
              <h1 className="hr-headline">
                DemoApp<br />
               Gerencie  de forma <em>inteligente</em>.
              </h1>
              <p className="hr-tagline">
               Centralize pessoas, simplifique processos e tome decisões com dados confiáveis.
              </p>
            </div>

          </div>
        </div>

        {/* ── Right panel ── */}
        <div className="hr-login-right">
          <div className="hr-anim-r1">
            <h2 className="hr-form-greeting">Bem-vindo</h2>
            <p className="hr-form-sub">
              Entre com suas credenciais para acessar a plataforma.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="hr-field hr-anim-r2">
              <label className="hr-label">Usuário</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="seu.usuario"
                className={`hr-input ${submitError ? "error" : ""}`}
                autoComplete="username"
              />
            </div>

            <div className="hr-field hr-anim-r3">
              <label className="hr-label">Senha</label>
              <div className="hr-input-wrap">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`hr-input has-toggle ${submitError ? "error" : ""}`}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="hr-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {submitError && (
              <div className="hr-form-error hr-anim-r4">
                {submitError}
              </div>
            )}

            <div className="hr-anim-r4">
              <button type="submit" disabled={isSubmitting} className="hr-submit-btn">
                {isSubmitting ? "Entrando..." : "Entrar"}
                {!isSubmitting && <ArrowRight size={16} />}
              </button>
            </div>
          </form>

          <div className="hr-form-footer hr-anim-r5">
            <span className="hr-footer-text">Ainda sem conta?</span>
            <button onClick={() => navigate("/register")} className="hr-footer-link">
              Criar conta
            </button>
          </div>

          <p className="hr-copyright hr-anim-r6">
            Powered by Neotel © 2026
          </p>
        </div>
      </div>
    </>
  );
}
