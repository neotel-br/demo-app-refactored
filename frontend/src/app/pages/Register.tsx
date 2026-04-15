import { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import { apiClient } from "../../lib/api";
import { toast } from "sonner";

const styles = `
  * { box-sizing: border-box; }

  .hr-reg-root {
    min-height: 100vh;
    display: flex;
    font-family: 'Plus Jakarta Sans', sans-serif;
    background: #F0FDF4;
    overflow: hidden;
  }

  /* ── Left panel ── */
  .hr-reg-left {
    flex: 0 0 55%;
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 2.5rem 3.5rem;
    background: linear-gradient(145deg, #ECFDF5 0%, #F0FDF4 40%, #EFF6FF 100%);
    overflow: hidden;
  }

  .hr-reg-left::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E");
    pointer-events: none;
    z-index: 0;
  }

  .hr-reg-left::after {
    content: '';
    position: absolute;
    width: 420px;
    height: 420px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(5,150,105,0.08) 0%, transparent 70%);
    bottom: -100px;
    left: -60px;
    pointer-events: none;
    z-index: 0;
  }

  .hr-reg-left-content {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    height: 100%;
  }

  .hr-reg-logo-wrap {
    display: flex;
    align-items: center;
    gap: 0.625rem;
  }

  .hr-reg-logo-img {
    height: 52px;
    width: auto;
  }

  /* Onboarding illustration – step/progress feel */
  .hr-reg-illustration {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem 0;
  }

  .hr-reg-steps-visual {
    position: relative;
    width: 320px;
    height: 180px;
  }

  .hr-reg-step-card {
    position: absolute;
    background: #fff;
    border: 1px solid #E5E7EB;
    border-radius: 12px;
    padding: 0.875rem 1rem;
    box-shadow: 0 4px 20px rgba(0,0,0,0.06);
    display: flex;
    align-items: center;
    gap: 0.75rem;
    min-width: 200px;
  }

  .hr-reg-step-card:nth-child(1) {
    top: 0;
    left: 0;
    animation: hrRegFloat1 5.5s ease-in-out infinite;
  }
  .hr-reg-step-card:nth-child(2) {
    top: 56px;
    left: 60px;
    animation: hrRegFloat2 6.2s ease-in-out 0.8s infinite;
  }
  .hr-reg-step-card:nth-child(3) {
    top: 112px;
    left: 20px;
    animation: hrRegFloat1 5s ease-in-out 1.4s infinite;
  }

  @keyframes hrRegFloat1 {
    0%, 100% { transform: translateY(0); }
    50%       { transform: translateY(-8px); }
  }
  @keyframes hrRegFloat2 {
    0%, 100% { transform: translateY(-4px) translateX(2px); }
    50%       { transform: translateY(4px) translateX(-2px); }
  }

  .hr-reg-step-dot {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.6875rem;
    font-weight: 700;
  }

  .hr-reg-step-dot.green { background: #D1FAE5; color: #065F46; }
  .hr-reg-step-dot.blue  { background: #DBEAFE; color: #1D4ED8; }
  .hr-reg-step-dot.amber { background: #FEF3C7; color: #92400E; }

  .hr-reg-step-text {
    font-size: 0.8125rem;
    font-weight: 600;
    color: #374151;
    letter-spacing: -0.01em;
  }

  .hr-reg-step-sub {
    font-size: 0.6875rem;
    color: #9CA3AF;
    font-weight: 400;
    margin-top: 1px;
  }

  /* Headline */
  .hr-reg-headline-block {
    padding: 1rem 0 1.5rem;
  }

  .hr-reg-eyebrow {
    font-size: 0.6875rem;
    font-weight: 600;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: #059669;
    margin-bottom: 0.875rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .hr-reg-eyebrow-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #059669;
    flex-shrink: 0;
  }

  .hr-reg-headline {
    font-size: clamp(2rem, 3vw, 2.75rem);
    font-weight: 800;
    line-height: 1.1;
    letter-spacing: -0.04em;
    color: #111827;
    margin-bottom: 1rem;
  }

  .hr-reg-headline em {
    font-style: normal;
    color: #059669;
  }

  .hr-reg-tagline {
    font-size: 0.9375rem;
    font-weight: 400;
    line-height: 1.7;
    color: #6B7280;
    max-width: 360px;
  }

  /* Trust row */
  .hr-reg-trust-row {
    display: flex;
    flex-direction: column;
    gap: 0.625rem;
    padding-top: 1.25rem;
    border-top: 1px solid rgba(5,150,105,0.12);
  }

  .hr-reg-trust-item {
    display: flex;
    align-items: center;
    gap: 0.625rem;
    font-size: 0.8125rem;
    color: #6B7280;
    font-weight: 400;
  }

  .hr-reg-trust-check {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: #D1FAE5;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    color: #059669;
    font-size: 0.625rem;
    font-weight: 700;
  }

  /* ── Right panel ── */
  .hr-reg-right {
    flex: 0 0 45%;
    background: #ffffff;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 2.5rem 3.5rem;
    position: relative;
    border-left: 1px solid #E5E7EB;
    overflow-y: auto;
  }

  .hr-reg-right::-webkit-scrollbar { width: 4px; }
  .hr-reg-right::-webkit-scrollbar-track { background: transparent; }
  .hr-reg-right::-webkit-scrollbar-thumb { background: #E5E7EB; border-radius: 2px; }

  .hr-reg-right::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 3px;
    background: linear-gradient(90deg, #059669 0%, #34D399 50%, transparent 100%);
  }

  .hr-reg-greeting {
    font-size: 1.625rem;
    font-weight: 700;
    letter-spacing: -0.03em;
    color: #111827;
    margin-bottom: 0.375rem;
  }

  .hr-reg-subgreeting {
    font-size: 0.875rem;
    color: #6B7280;
    font-weight: 400;
    margin-bottom: 2rem;
    line-height: 1.5;
  }

  /* Field */
  .hr-reg-field {
    margin-bottom: 1.125rem;
  }

  .hr-reg-label {
    display: block;
    font-size: 0.8125rem;
    font-weight: 500;
    color: #374151;
    margin-bottom: 0.5rem;
    letter-spacing: -0.01em;
  }

  .hr-reg-input-wrap {
    position: relative;
  }

  .hr-reg-input {
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

  .hr-reg-input.has-toggle {
    padding-right: 2.75rem;
  }

  .hr-reg-input::placeholder {
    color: #9CA3AF;
    font-weight: 400;
  }

  .hr-reg-input:hover {
    border-color: #D1D5DB;
    background: #fff;
  }

  .hr-reg-input:focus {
    border-color: #059669;
    background: #fff;
    box-shadow: 0 0 0 3px rgba(5,150,105,0.1);
  }

  .hr-reg-input.error {
    border-color: #F87171;
    background: #fff;
  }

  .hr-reg-input.error:focus {
    box-shadow: 0 0 0 3px rgba(248,113,113,0.1);
  }

  .hr-reg-toggle-btn {
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

  .hr-reg-toggle-btn:hover { color: #6B7280; }

  .hr-reg-error-text {
    display: block;
    margin-top: 0.375rem;
    font-size: 0.75rem;
    color: #EF4444;
    font-weight: 400;
  }

  /* Submit */
  .hr-reg-submit-btn {
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

  .hr-reg-submit-btn:hover:not(:disabled) {
    background: #047857;
    box-shadow: 0 4px 20px rgba(5,150,105,0.3);
    transform: translateY(-1px);
  }

  .hr-reg-submit-btn:active:not(:disabled) {
    transform: translateY(0);
    box-shadow: none;
  }

  .hr-reg-submit-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  /* Submit error */
  .hr-reg-form-error {
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
  .hr-reg-footer {
    margin-top: 1.5rem;
    padding-top: 1.5rem;
    border-top: 1px solid #F3F4F6;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .hr-reg-footer-text {
    font-size: 0.8125rem;
    color: #9CA3AF;
    font-weight: 400;
  }

  .hr-reg-footer-link {
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

  .hr-reg-footer-link:hover { color: #047857; }

  .hr-reg-copyright {
    margin-top: 1.5rem;
    font-size: 0.6875rem;
    color: #D1D5DB;
    letter-spacing: 0.02em;
    text-align: center;
  }

  /* Animations */
  @keyframes hrRegFadeUp {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes hrRegFadeRight {
    from { opacity: 0; transform: translateX(-20px); }
    to   { opacity: 1; transform: translateX(0); }
  }

  .hr-reg-r1 { animation: hrRegFadeUp 0.45s cubic-bezier(0.22,1,0.36,1) 0.05s both; }
  .hr-reg-r2 { animation: hrRegFadeUp 0.45s cubic-bezier(0.22,1,0.36,1) 0.11s both; }
  .hr-reg-r3 { animation: hrRegFadeUp 0.45s cubic-bezier(0.22,1,0.36,1) 0.17s both; }
  .hr-reg-r4 { animation: hrRegFadeUp 0.45s cubic-bezier(0.22,1,0.36,1) 0.23s both; }
  .hr-reg-r5 { animation: hrRegFadeUp 0.45s cubic-bezier(0.22,1,0.36,1) 0.29s both; }
  .hr-reg-r6 { animation: hrRegFadeUp 0.45s cubic-bezier(0.22,1,0.36,1) 0.35s both; }
  .hr-reg-r7 { animation: hrRegFadeUp 0.45s cubic-bezier(0.22,1,0.36,1) 0.41s both; }
  .hr-reg-r8 { animation: hrRegFadeUp 0.45s cubic-bezier(0.22,1,0.36,1) 0.47s both; }

  .hr-reg-l1 { animation: hrRegFadeRight 0.6s cubic-bezier(0.22,1,0.36,1) 0.1s  both; }
  .hr-reg-l2 { animation: hrRegFadeRight 0.6s cubic-bezier(0.22,1,0.36,1) 0.22s both; }
  .hr-reg-l3 { animation: hrRegFadeRight 0.6s cubic-bezier(0.22,1,0.36,1) 0.34s both; }

  @media (max-width: 820px) {
    .hr-reg-left  { display: none; }
    .hr-reg-right { flex: 1; padding: 2.5rem 1.75rem; }
  }
`;

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: "" });
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = "Obrigatório";
    if (!formData.email.trim()) newErrors.email = "Obrigatório";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "E-mail inválido";
    if (!formData.username.trim()) newErrors.username = "Obrigatório";
    else if (formData.username.length < 3) newErrors.username = "Mínimo 3 caracteres";
    if (!formData.password) newErrors.password = "Obrigatório";
    else if (formData.password.length < 6) newErrors.password = "Mínimo 6 caracteres";
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "As senhas não coincidem";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) return;
    setSubmitting(true);
    try {
      await apiClient.register(formData.name, formData.email, formData.username, formData.password);
      toast.success("Conta criada com sucesso!");
      navigate("/login");
    } catch (error) {
      let errorMessage = "Erro ao criar usuário. Tente novamente.";
      if (error instanceof Error) {
        if (error.message.includes("usuário já está em uso")) errorMessage = "Nome de usuário já está em uso";
        else if (error.message.includes("E-mail já está em uso")) errorMessage = "E-mail já está em uso";
        else if (error.message !== "API Error: undefined") errorMessage = error.message;
      }
      setErrors({ submit: errorMessage });
      setSubmitting(false);
    }
  };

  return (
    <>
      <style>{styles}</style>

      <div className="hr-reg-root">
        {/* ── Left panel ── */}
        <div className="hr-reg-left">
          <div className="hr-reg-left-content">
            {/* Logo */}
            <div className="hr-reg-logo-wrap hr-reg-l1">
              <img src="/images/logo_demoapp.svg" alt="DemoApp" className="hr-reg-logo-img" />
            </div>

            {/* Illustration */}
            <div className="hr-reg-illustration hr-reg-l2">
              <div className="hr-reg-steps-visual">
                <div className="hr-reg-step-card">
                  <div className="hr-reg-step-dot green">1</div>
                  <div>
                    <div className="hr-reg-step-text">Criar sua conta</div>
                    <div className="hr-reg-step-sub">Dados básicos de acesso</div>
                  </div>
                </div>
                <div className="hr-reg-step-card">
                  <div className="hr-reg-step-dot blue">2</div>
                  <div>
                    <div className="hr-reg-step-text">Configurar equipe</div>
                    <div className="hr-reg-step-sub">Departamentos e cargos</div>
                  </div>
                </div>
                <div className="hr-reg-step-card">
                  <div className="hr-reg-step-dot amber">3</div>
                  <div>
                    <div className="hr-reg-step-text">Adicionar colaboradores</div>
                    <div className="hr-reg-step-sub">Gestão de pessoas</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Headline */}
            <div className="hr-reg-headline-block hr-reg-l2">
              <div className="hr-reg-eyebrow">
                <span className="hr-reg-eyebrow-dot" />
                Plataforma de RH
              </div>
              <h1 className="hr-reg-headline">
                Comece a gerir<br />
                sua equipe <em>hoje</em>.
              </h1>
              <p className="hr-reg-tagline">
                Crie sua conta em segundos e tenha acesso à plataforma completa de gestão de pessoas.
              </p>
            </div>

            {/* Trust */}
            <div className="hr-reg-trust-row hr-reg-l3">
              <div className="hr-reg-trust-item">
                <div className="hr-reg-trust-check">✓</div>
                Configuração em menos de 5 minutos
              </div>
              <div className="hr-reg-trust-item">
                <div className="hr-reg-trust-check">✓</div>
                Dados protegidos e em conformidade com a LGPD
              </div>
              <div className="hr-reg-trust-item">
                <div className="hr-reg-trust-check">✓</div>
                Suporte dedicado para sua empresa
              </div>
            </div>
          </div>
        </div>

        {/* ── Right panel ── */}
        <div className="hr-reg-right">
          <div className="hr-reg-r1">
            <h2 className="hr-reg-greeting">Criar conta</h2>
            <p className="hr-reg-subgreeting">
              Preencha seus dados para acessar a plataforma.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="hr-reg-field hr-reg-r2">
              <label className="hr-reg-label">Nome Completo</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Seu nome completo"
                className={`hr-reg-input ${errors.name ? "error" : ""}`}
                autoComplete="name"
              />
              {errors.name && <span className="hr-reg-error-text">{errors.name}</span>}
            </div>

            <div className="hr-reg-field hr-reg-r3">
              <label className="hr-reg-label">E-mail</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="seu@email.com"
                className={`hr-reg-input ${errors.email ? "error" : ""}`}
                autoComplete="email"
              />
              {errors.email && <span className="hr-reg-error-text">{errors.email}</span>}
            </div>

            <div className="hr-reg-field hr-reg-r4">
              <label className="hr-reg-label">Usuário</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="seu.usuario"
                className={`hr-reg-input ${errors.username ? "error" : ""}`}
                autoComplete="username"
              />
              {errors.username && <span className="hr-reg-error-text">{errors.username}</span>}
            </div>

            <div className="hr-reg-field hr-reg-r5">
              <label className="hr-reg-label">Senha</label>
              <div className="hr-reg-input-wrap">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className={`hr-reg-input has-toggle ${errors.password ? "error" : ""}`}
                  autoComplete="new-password"
                />
                <button type="button" className="hr-reg-toggle-btn" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <span className="hr-reg-error-text">{errors.password}</span>}
            </div>

            <div className="hr-reg-field hr-reg-r6">
              <label className="hr-reg-label">Confirmar Senha</label>
              <div className="hr-reg-input-wrap">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className={`hr-reg-input has-toggle ${errors.confirmPassword ? "error" : ""}`}
                  autoComplete="new-password"
                />
                <button type="button" className="hr-reg-toggle-btn" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.confirmPassword && <span className="hr-reg-error-text">{errors.confirmPassword}</span>}
            </div>

            <div className="hr-reg-r7">
              <button type="submit" disabled={submitting} className="hr-reg-submit-btn">
                {submitting ? "Criando conta..." : "Criar Conta"}
                {!submitting && <ArrowRight size={16} />}
              </button>
            </div>
          </form>

          {errors.submit && (
            <div className="hr-reg-form-error">{errors.submit}</div>
          )}

          <div className="hr-reg-footer hr-reg-r8">
            <span className="hr-reg-footer-text">Já tem uma conta?</span>
            <button onClick={() => navigate("/login")} className="hr-reg-footer-link">
              Entrar →
            </button>
          </div>

          <p className="hr-reg-copyright hr-reg-r8">
            Powered by Neotel © 2026
          </p>
        </div>
      </div>
    </>
  );
}
