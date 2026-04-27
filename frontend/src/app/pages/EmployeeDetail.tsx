import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import {
  Users, LogOut, ChevronLeft, User, Mail,
  CreditCard, Building2, CheckCircle2, AlertCircle, Trash2,
} from "lucide-react";
import { apiClient } from "@/lib/api";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/app/components/ui/alert-dialog";

interface IPosition {
  id: number;
  position_name: string;
  department: number;
}

interface IDepartment {
  id: number;
  department_name: string;
  department_icon: string | null;
}

interface IEmployee {
  id: number;
  employee_id: string;
  employee_name: string;
  employee_titlejob: IPosition;
  department: IDepartment;
  employee_cpf: string;
  employee_rg: string;
  employee_birthdate: string;
  employee_startdate: string;
  employee_salary: string;
  employee_email: string;
  employee_phone: string;
  employee_bank: string;
  employee_agency: string;
  employee_cc: string;
  is_tokenized: boolean;
}

const AVATAR_PALETTES = [
  { bg: "#DBEAFE", color: "#1D4ED8" },
  { bg: "#D1FAE5", color: "#065F46" },
  { bg: "#FEF3C7", color: "#92400E" },
  { bg: "#EDE9FE", color: "#5B21B6" },
  { bg: "#FCE7F3", color: "#9D174D" },
  { bg: "#FFEDD5", color: "#9A3412" },
  { bg: "#E0F2FE", color: "#0369A1" },
  { bg: "#FEE2E2", color: "#991B1B" },
];

function getAvatarPalette(name: string) {
  const idx = name.charCodeAt(0) % AVATAR_PALETTES.length;
  return AVATAR_PALETTES[idx];
}

const styles = `
  * { box-sizing: border-box; }

  .hr-det-root {
    min-height: 100vh;
    display: flex;
    font-family: 'Plus Jakarta Sans', sans-serif;
    background: #F8FAFC;
  }

  /* ── Sidebar ── */
  .hr-det-sidebar {
    width: 64px;
    flex-shrink: 0;
    background: #FFFFFF;
    border-right: 1px solid #E5E7EB;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 1.25rem 0;
  }

  .hr-det-sidebar-logo {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    margin-bottom: 2rem;
  }

  .hr-det-sidebar-logo img {
    width: 40px;
    height: 40px;
    object-fit: contain;
  }

  .hr-det-sidebar-nav {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
  }

  .hr-det-nav-item {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    border: none;
    background: #ECFDF5;
    color: #059669;
    position: relative;
    transition: background 0.15s;
  }

  .hr-det-nav-item::before {
    content: '';
    position: absolute;
    left: -12px;
    top: 50%;
    transform: translateY(-50%);
    width: 3px;
    height: 20px;
    background: #059669;
    border-radius: 0 2px 2px 0;
  }

  .hr-det-sidebar-bottom {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.625rem;
  }

  .hr-det-logout-btn {
    width: 36px;
    height: 36px;
    border-radius: 9px;
    border: none;
    background: transparent;
    color: #9CA3AF;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: background 0.15s, color 0.15s;
  }

  .hr-det-logout-btn:hover {
    background: #FEF2F2;
    color: #EF4444;
  }

  /* ── Main ── */
  .hr-det-main {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  /* Topbar */
  .hr-det-topbar {
    height: 64px;
    flex-shrink: 0;
    border-bottom: 1px solid #E5E7EB;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 2rem;
    background: #FFFFFF;
  }

  .hr-det-topbar-left {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .hr-det-back-btn {
    width: 32px;
    height: 32px;
    border-radius: 7px;
    border: 1.5px solid #E5E7EB;
    background: #F9FAFB;
    color: #6B7280;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.15s;
    flex-shrink: 0;
  }

  .hr-det-back-btn:hover {
    background: #F3F4F6;
    color: #111827;
    border-color: #D1D5DB;
  }

  .hr-det-topbar-title {
    font-size: 1rem;
    font-weight: 700;
    color: #111827;
    letter-spacing: -0.025em;
  }

  .hr-det-topbar-sub {
    font-size: 0.75rem;
    color: #9CA3AF;
    font-weight: 400;
    margin-top: 1px;
  }

  /* Data protection badge */
  .hr-det-token-badge {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    padding: 0.3rem 0.75rem;
    border-radius: 100px;
    font-size: 0.6875rem;
    font-weight: 600;
    letter-spacing: 0.04em;
  }

  .hr-det-token-badge.protected {
    background: #ECFDF5;
    border: 1px solid #A7F3D0;
    color: #059669;
  }

  .hr-det-token-badge.unprotected {
    background: #FFFBEB;
    border: 1px solid #FDE68A;
    color: #D97706;
  }

  /* Content */
  .hr-det-content {
    flex: 1;
    overflow-y: auto;
    padding: 2rem;
  }

  .hr-det-content::-webkit-scrollbar { width: 4px; }
  .hr-det-content::-webkit-scrollbar-track { background: transparent; }
  .hr-det-content::-webkit-scrollbar-thumb { background: #E5E7EB; border-radius: 2px; }

  .hr-det-content-inner {
    max-width: 1100px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }

  /* Hero card */
  .hr-det-hero {
    background: #FFFFFF;
    border: 1.5px solid #E5E7EB;
    border-radius: 14px;
    padding: 1.75rem;
    display: flex;
    align-items: center;
    gap: 1.5rem;
    position: relative;
    overflow: hidden;
  }

  .hr-det-hero::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 3px;
    background: linear-gradient(90deg, #059669 0%, #34D399 60%, transparent 100%);
  }

  .hr-det-hero-avatar {
    width: 64px;
    height: 64px;
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    font-weight: 700;
    letter-spacing: -0.03em;
    flex-shrink: 0;
  }

  .hr-det-hero-info {
    flex: 1;
  }

  .hr-det-hero-name {
    font-size: 1.375rem;
    font-weight: 700;
    color: #111827;
    letter-spacing: -0.03em;
    margin-bottom: 0.25rem;
  }

  .hr-det-hero-role {
    font-size: 0.875rem;
    color: #6B7280;
    font-weight: 400;
    margin-bottom: 1rem;
  }

  .hr-det-hero-tags {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  .hr-det-tag {
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
    padding: 0.25rem 0.625rem;
    border-radius: 100px;
    font-size: 0.6875rem;
    font-weight: 500;
    border: 1px solid #E5E7EB;
    color: #6B7280;
    background: #F9FAFB;
  }

  .hr-det-tag.id {
    font-family: 'DM Mono', monospace;
    font-size: 0.6875rem;
    letter-spacing: 0.04em;
  }

  .hr-det-tag.dept {
    color: #059669;
    border-color: #A7F3D0;
    background: #ECFDF5;
  }

  /* Info grid */
  .hr-det-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.25rem;
  }

  .hr-det-col {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }

  /* Info card */
  .hr-det-card {
    background: #FFFFFF;
    border: 1.5px solid #E5E7EB;
    border-radius: 12px;
    padding: 1.375rem;
    transition: box-shadow 0.2s;
  }

  .hr-det-card:hover {
    box-shadow: 0 2px 12px rgba(0,0,0,0.05);
  }

  .hr-det-card-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 1.25rem;
    padding-bottom: 0.875rem;
    border-bottom: 1px solid #F3F4F6;
  }

  .hr-det-card-icon {
    width: 28px;
    height: 28px;
    border-radius: 7px;
    background: #ECFDF5;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #059669;
    flex-shrink: 0;
  }

  .hr-det-card-title {
    font-size: 0.8125rem;
    font-weight: 600;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    color: #9CA3AF;
  }

  /* Fields */
  .hr-det-fields {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .hr-det-field label {
    display: block;
    font-size: 0.625rem;
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: #9CA3AF;
    margin-bottom: 0.375rem;
  }

  .hr-det-field-value {
    background: #F9FAFB;
    border: 1.5px solid #E5E7EB;
    border-radius: 8px;
    padding: 0.5625rem 0.75rem;
    color: #374151;
    font-family: 'DM Mono', monospace;
    font-size: 0.8125rem;
    letter-spacing: 0.02em;
    word-break: break-all;
    min-height: 38px;
  }

  .hr-det-field-value.salary {
    color: #059669;
    border-color: #A7F3D0;
    background: #ECFDF5;
    font-weight: 600;
    font-size: 0.9375rem;
    letter-spacing: -0.01em;
  }

  /* Delete button */
  .hr-det-delete-btn {
    width: 34px;
    height: 34px;
    border-radius: 8px;
    border: 1.5px solid #FECACA;
    background: #FEF2F2;
    color: #EF4444;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: background 0.15s, border-color 0.15s;
    flex-shrink: 0;
  }

  .hr-det-delete-btn:hover:not(:disabled) {
    background: #FEE2E2;
    border-color: #FCA5A5;
  }

  .hr-det-delete-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  /* Loading / error states */
  .hr-det-state {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #F8FAFC;
    font-family: 'Plus Jakarta Sans', sans-serif;
  }

  .hr-det-spinner {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    border: 2px solid #E5E7EB;
    border-top-color: #059669;
    animation: hrDetSpin 0.7s linear infinite;
  }

  @keyframes hrDetSpin {
    to { transform: rotate(360deg); }
  }

  .hr-det-error-box {
    text-align: center;
  }

  .hr-det-error-msg {
    font-size: 0.875rem;
    color: #EF4444;
    margin-bottom: 1rem;
    font-weight: 500;
  }

  .hr-det-error-link {
    font-size: 0.8125rem;
    color: #059669;
    background: none;
    border: none;
    cursor: pointer;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-weight: 600;
    transition: color 0.15s;
  }

  .hr-det-error-link:hover { color: #047857; }

  @media (max-width: 768px) {
    .hr-det-grid { grid-template-columns: 1fr; }
  }
`;

function Field({ label, value, salary }: { label: string; value: string; salary?: boolean }) {
  return (
    <div className="hr-det-field">
      <label>{label}</label>
      <div className={`hr-det-field-value ${salary ? "salary" : ""}`}>
        {salary && value ? `R$ ${value}` : (value || "—")}
      </div>
    </div>
  );
}

export default function EmployeeDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState<IEmployee | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!id) return;
    apiClient
      .getEmployee(parseInt(id))
      .then((data) => apiClient.detokenize(data))
      .then((data) => setEmployee(data as IEmployee))
      .catch((err) => {
        const msg = err instanceof Error ? err.message : "Erro ao carregar colaborador";
        setError(msg);
        toast.error(msg);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleLogout = async () => {
    try { await apiClient.logout(); } finally { navigate("/login"); }
  };

  const handleDelete = async () => {
    if (!id) return;
    try {
      setDeleting(true);
      await apiClient.deleteEmployee(parseInt(id));
      toast.success("Colaborador removido com sucesso.");
      navigate("/employees");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro ao remover colaborador";
      toast.error(msg);
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <>
        <style>{styles}</style>
        <div className="hr-det-state"><div className="hr-det-spinner" /></div>
      </>
    );
  }

  if (error || !employee) {
    return (
      <>
        <style>{styles}</style>
        <div className="hr-det-state">
          <div className="hr-det-error-box">
            <p className="hr-det-error-msg">{error ?? "Colaborador não encontrado"}</p>
            <button className="hr-det-error-link" onClick={() => navigate("/employees")}>
              ← Voltar para a lista
            </button>
          </div>
        </div>
      </>
    );
  }

  const palette = getAvatarPalette(employee.employee_name);

  return (
    <>
      <style>{styles}</style>

      <div className="hr-det-root">
        {/* ── Sidebar ── */}
        <aside className="hr-det-sidebar">
          <div className="hr-det-sidebar-logo">
            <img src="/images/logo_da.svg" alt="DemoApp" />
          </div>
          <nav className="hr-det-sidebar-nav">
            <button className="hr-det-nav-item" title="Colaboradores" onClick={() => navigate("/employees")}>
              <Users size={17} />
            </button>
          </nav>
          <div className="hr-det-sidebar-bottom">
            <button className="hr-det-logout-btn" onClick={handleLogout} title="Sair">
              <LogOut size={15} />
            </button>
          </div>
        </aside>

        {/* ── Main ── */}
        <div className="hr-det-main">
          {/* Topbar */}
          <div className="hr-det-topbar">
            <div className="hr-det-topbar-left">
              <button className="hr-det-back-btn" onClick={() => navigate("/employees")}>
                <ChevronLeft size={15} />
              </button>
              <div>
                <div className="hr-det-topbar-title">{employee.employee_name}</div>
                <div className="hr-det-topbar-sub">{employee.employee_titlejob?.position_name ?? "Perfil do Colaborador"}</div>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              {employee.is_tokenized ? (
                <div className="hr-det-token-badge protected">
                  <CheckCircle2 size={12} />
                  Dados protegidos
                </div>
              ) : (
                <div className="hr-det-token-badge unprotected">
                  <AlertCircle size={12} />
                  Proteção pendente
                </div>
              )}

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <button className="hr-det-delete-btn" disabled={deleting} title="Remover colaborador">
                    <Trash2 size={14} />
                  </button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Remover colaborador?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta ação não pode ser desfeita. O colaborador <strong>{employee.employee_name}</strong> será removido permanentemente.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      style={{ background: "#EF4444" }}
                    >
                      Remover
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>

          {/* Content */}
          <div className="hr-det-content">
            <div className="hr-det-content-inner">

              {/* Hero */}
              <div className="hr-det-hero">
                <div
                  className="hr-det-hero-avatar"
                  style={{ background: palette.bg, color: palette.color }}
                >
                  {employee.employee_name.charAt(0).toUpperCase()}
                </div>
                <div className="hr-det-hero-info">
                  <div className="hr-det-hero-name">{employee.employee_name}</div>
                  <div className="hr-det-hero-role">{employee.employee_titlejob?.position_name ?? "—"}</div>
                  <div className="hr-det-hero-tags">
                    <span className="hr-det-tag id">ID · {employee.employee_id}</span>
                    <span className="hr-det-tag dept">
                      <Building2 size={10} />
                      {employee.department?.department_name ?? "—"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Info grid */}
              <div className="hr-det-grid">
                {/* Left: Dados Pessoais */}
                <div className="hr-det-col">
                  <div className="hr-det-card">
                    <div className="hr-det-card-header">
                      <div className="hr-det-card-icon"><User size={13} /></div>
                      <span className="hr-det-card-title">Dados Pessoais</span>
                    </div>
                    <div className="hr-det-fields">
                      <Field label="CPF" value={employee.employee_cpf} />
                      <Field label="RG" value={employee.employee_rg} />
                      <Field label="Data de Nascimento" value={employee.employee_birthdate} />
                      <Field label="Data de Admissão" value={employee.employee_startdate} />
                      <Field label="Salário" value={employee.employee_salary} salary />
                    </div>
                  </div>
                </div>

                {/* Right: Contato + Bancário */}
                <div className="hr-det-col">
                  <div className="hr-det-card">
                    <div className="hr-det-card-header">
                      <div className="hr-det-card-icon"><Mail size={13} /></div>
                      <span className="hr-det-card-title">Contato</span>
                    </div>
                    <div className="hr-det-fields">
                      <Field label="E-mail" value={employee.employee_email} />
                      <Field label="Telefone" value={employee.employee_phone} />
                    </div>
                  </div>

                  <div className="hr-det-card">
                    <div className="hr-det-card-header">
                      <div className="hr-det-card-icon"><CreditCard size={13} /></div>
                      <span className="hr-det-card-title">Dados Bancários</span>
                    </div>
                    <div className="hr-det-fields">
                      <Field label="Banco" value={employee.employee_bank} />
                      <Field label="Agência" value={employee.employee_agency} />
                      <Field label="Conta Corrente" value={employee.employee_cc} />
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </>
  );
}
