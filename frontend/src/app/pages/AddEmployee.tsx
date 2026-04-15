import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Users, LogOut, ChevronLeft, User, Mail, Briefcase, CreditCard } from "lucide-react";
import { apiClient } from "../../lib/api";
import { toast } from "sonner";

interface Department {
  id: number;
  department_name: string;
  department_icon: string;
}

interface Position {
  id: number;
  position_name: string;
  department: number;
}

const styles = `
  * { box-sizing: border-box; }

  .hr-add-root {
    min-height: 100vh;
    display: flex;
    font-family: 'Plus Jakarta Sans', sans-serif;
    background: #F8FAFC;
  }

  /* ── Sidebar ── */
  .hr-add-sidebar {
    width: 64px;
    flex-shrink: 0;
    background: #FFFFFF;
    border-right: 1px solid #E5E7EB;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 1.25rem 0;
  }

  .hr-add-sidebar-logo {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    margin-bottom: 2rem;
  }

  .hr-add-sidebar-logo img {
    width: 40px;
    height: 40px;
    object-fit: contain;
  }

  .hr-add-sidebar-nav {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
  }

  .hr-add-nav-item {
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

  .hr-add-nav-item::before {
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

  .hr-add-sidebar-bottom {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.625rem;
  }

  .hr-add-logout-btn {
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

  .hr-add-logout-btn:hover {
    background: #FEF2F2;
    color: #EF4444;
  }

  /* ── Main ── */
  .hr-add-main {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  /* Topbar */
  .hr-add-topbar {
    height: 64px;
    flex-shrink: 0;
    border-bottom: 1px solid #E5E7EB;
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 0 2rem;
    background: #FFFFFF;
  }

  .hr-add-back-btn {
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

  .hr-add-back-btn:hover {
    background: #F3F4F6;
    color: #111827;
    border-color: #D1D5DB;
  }

  .hr-add-topbar-title {
    font-size: 1rem;
    font-weight: 700;
    color: #111827;
    letter-spacing: -0.025em;
  }

  .hr-add-topbar-sub {
    font-size: 0.75rem;
    color: #9CA3AF;
    font-weight: 400;
    margin-top: 1px;
  }

  /* Content */
  .hr-add-content {
    flex: 1;
    overflow-y: auto;
    padding: 2rem;
  }

  .hr-add-content::-webkit-scrollbar { width: 4px; }
  .hr-add-content::-webkit-scrollbar-track { background: transparent; }
  .hr-add-content::-webkit-scrollbar-thumb { background: #E5E7EB; border-radius: 2px; }
  .hr-add-content::-webkit-scrollbar-thumb:hover { background: #D1D5DB; }

  .hr-add-form-wrap {
    max-width: 860px;
    margin: 0 auto;
  }

  /* Section */
  .hr-add-section {
    background: #FFFFFF;
    border: 1.5px solid #E5E7EB;
    border-radius: 12px;
    padding: 1.5rem;
    margin-bottom: 1.25rem;
    transition: box-shadow 0.2s;
  }

  .hr-add-section:hover {
    box-shadow: 0 2px 12px rgba(0,0,0,0.04);
  }

  .hr-add-section-header {
    display: flex;
    align-items: center;
    gap: 0.625rem;
    margin-bottom: 1.375rem;
    padding-bottom: 0.875rem;
    border-bottom: 1px solid #F3F4F6;
  }

  .hr-add-section-icon {
    width: 30px;
    height: 30px;
    border-radius: 8px;
    background: #ECFDF5;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #059669;
    flex-shrink: 0;
  }

  .hr-add-section-title {
    font-size: 0.8125rem;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: #9CA3AF;
  }

  /* Grid */
  .hr-add-grid-2 {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1.25rem;
  }

  .hr-add-grid-3 {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1.25rem;
  }

  .hr-add-col-full {
    grid-column: 1 / -1;
  }

  /* Field */
  .hr-add-field {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .hr-add-label {
    font-size: 0.8125rem;
    font-weight: 500;
    color: #374151;
    letter-spacing: -0.01em;
  }

  .hr-add-input,
  .hr-add-select {
    background: #F9FAFB;
    border: 1.5px solid #E5E7EB;
    border-radius: 8px;
    padding: 0.625rem 0.875rem;
    color: #111827;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 0.875rem;
    font-weight: 400;
    outline: none;
    transition: border-color 0.18s, box-shadow 0.18s, background 0.18s;
    caret-color: #059669;
    width: 100%;
  }

  .hr-add-input.mono,
  .hr-add-select.mono {
    font-family: 'DM Mono', monospace;
    font-size: 0.8125rem;
    letter-spacing: 0.02em;
  }

  .hr-add-input::placeholder {
    color: #9CA3AF;
    font-weight: 400;
  }

  .hr-add-input:hover,
  .hr-add-select:hover {
    border-color: #D1D5DB;
    background: #fff;
  }

  .hr-add-input:focus,
  .hr-add-select:focus {
    border-color: #059669;
    background: #fff;
    box-shadow: 0 0 0 3px rgba(5,150,105,0.1);
  }

  .hr-add-input.error,
  .hr-add-select.error {
    border-color: #F87171;
    background: #fff;
  }

  .hr-add-input.error:focus,
  .hr-add-select.error:focus {
    box-shadow: 0 0 0 3px rgba(248,113,113,0.1);
  }

  /* Date input light calendar */
  input[type="date"].hr-add-input {
    color-scheme: light;
  }

  /* Select */
  .hr-add-select {
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12' fill='none'%3E%3Cpath d='M2.5 4.5L6 8L9.5 4.5' stroke='%236B7280' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 0.75rem center;
    background-color: #F9FAFB;
    padding-right: 2.25rem;
    cursor: pointer;
  }

  .hr-add-select option {
    background: #fff;
    color: #111827;
  }

  .hr-add-select:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .hr-add-error-text {
    font-size: 0.75rem;
    color: #EF4444;
    font-weight: 400;
  }

  /* Number input */
  input[type="number"].hr-add-input::-webkit-outer-spin-button,
  input[type="number"].hr-add-input::-webkit-inner-spin-button {
    -webkit-appearance: none;
  }

  /* Submit error */
  .hr-add-submit-error {
    padding: 0.75rem 1rem;
    background: #FEF2F2;
    border: 1px solid #FECACA;
    border-radius: 8px;
    font-size: 0.8125rem;
    color: #B91C1C;
    margin-bottom: 1.25rem;
    line-height: 1.5;
  }

  /* Action bar */
  .hr-add-actions {
    display: flex;
    gap: 0.75rem;
    padding-top: 1.5rem;
    border-top: 1px solid #E5E7EB;
    margin-top: 0.5rem;
  }

  .hr-add-cancel-btn {
    flex: 0 0 auto;
    padding: 0.75rem 1.5rem;
    background: #FFFFFF;
    border: 1.5px solid #E5E7EB;
    border-radius: 8px;
    color: #6B7280;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.15s;
  }

  .hr-add-cancel-btn:hover {
    background: #F9FAFB;
    color: #374151;
    border-color: #D1D5DB;
  }

  .hr-add-submit-btn {
    flex: 1;
    padding: 0.75rem 1.5rem;
    background: #059669;
    border: none;
    border-radius: 8px;
    color: #fff;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 0.875rem;
    font-weight: 600;
    letter-spacing: -0.01em;
    cursor: pointer;
    transition: background 0.18s, box-shadow 0.18s, transform 0.15s;
  }

  .hr-add-submit-btn:hover:not(:disabled) {
    background: #047857;
    box-shadow: 0 4px 16px rgba(5,150,105,0.25);
    transform: translateY(-1px);
  }

  .hr-add-submit-btn:active:not(:disabled) {
    transform: translateY(0);
    box-shadow: none;
  }

  .hr-add-submit-btn:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }

  /* Loading screen */
  .hr-add-loading {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #F8FAFC;
    font-family: 'Plus Jakarta Sans', sans-serif;
  }

  .hr-add-spinner {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    border: 2px solid #E5E7EB;
    border-top-color: #059669;
    animation: hrAddSpin 0.7s linear infinite;
  }

  @keyframes hrAddSpin {
    to { transform: rotate(360deg); }
  }

  @media (max-width: 640px) {
    .hr-add-grid-2,
    .hr-add-grid-3 { grid-template-columns: 1fr; }
    .hr-add-col-full { grid-column: auto; }
  }
`;

export default function AddEmployee() {
  const navigate = useNavigate();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [filteredPositions, setFilteredPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    employee_name: "",
    department_id: "",
    position_id: "",
    employee_cpf: "",
    employee_rg: "",
    employee_birthdate: "",
    employee_startdate: "",
    employee_salary: "",
    employee_email: "",
    employee_phone: "",
    employee_bank: "",
    employee_agency: "",
    employee_cc: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    Promise.all([apiClient.getDepartments(), apiClient.getPositions()])
      .then(([depts, poss]) => {
        setDepartments(depts as Department[]);
        setPositions(poss as Position[]);
      })
      .catch(() => setErrors({ submit: "Erro ao carregar departamentos e cargos" }))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === "department_id") {
      setFilteredPositions(positions.filter((p) => p.department === parseInt(value)));
      setFormData({ ...formData, department_id: value, position_id: "" });
    } else {
      setFormData({ ...formData, [name]: value });
    }
    if (errors[name]) setErrors({ ...errors, [name]: "" });
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.employee_name.trim()) newErrors.employee_name = "Obrigatório";
    if (!formData.department_id) newErrors.department_id = "Obrigatório";
    if (!formData.position_id) newErrors.position_id = "Obrigatório";
    if (!formData.employee_cpf.trim()) newErrors.employee_cpf = "Obrigatório";
    if (!formData.employee_rg.trim()) newErrors.employee_rg = "Obrigatório";
    if (!formData.employee_birthdate) newErrors.employee_birthdate = "Obrigatório";
    if (!formData.employee_startdate) newErrors.employee_startdate = "Obrigatório";
    if (!formData.employee_salary) newErrors.employee_salary = "Obrigatório";
    if (!formData.employee_email.trim()) newErrors.employee_email = "Obrigatório";
    if (!formData.employee_phone.trim()) newErrors.employee_phone = "Obrigatório";
    if (!formData.employee_bank.trim()) newErrors.employee_bank = "Obrigatório";
    if (!formData.employee_agency.trim()) newErrors.employee_agency = "Obrigatório";
    if (!formData.employee_cc.trim()) newErrors.employee_cc = "Obrigatório";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (!validateForm()) return;
    setSubmitting(true);
    try {
      await apiClient.createEmployee({
        ...formData,
        department_id: parseInt(formData.department_id),
        position_id: parseInt(formData.position_id),
      });
      toast.success("Colaborador criado com sucesso!");
      navigate("/employees");
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Erro ao criar colaborador. Tente novamente.";
      setErrors({ submit: msg });
      setSubmitting(false);
    }
  };

  const handleLogout = async () => {
    try { await apiClient.logout(); } finally { navigate("/login"); }
  };

  if (loading) {
    return (
      <>
        <style>{styles}</style>
        <div className="hr-add-loading">
          <div className="hr-add-spinner" />
        </div>
      </>
    );
  }

  return (
    <>
      <style>{styles}</style>

      <div className="hr-add-root">
        {/* ── Sidebar ── */}
        <aside className="hr-add-sidebar">
          <div className="hr-add-sidebar-logo">
            <img src="/images/logo_da.svg" alt="DemoApp" />
          </div>
          <nav className="hr-add-sidebar-nav">
            <button className="hr-add-nav-item" title="Colaboradores" onClick={() => navigate("/employees")}>
              <Users size={17} />
            </button>
          </nav>
          <div className="hr-add-sidebar-bottom">
            <button className="hr-add-logout-btn" onClick={handleLogout} title="Sair">
              <LogOut size={15} />
            </button>
          </div>
        </aside>

        {/* ── Main ── */}
        <div className="hr-add-main">
          {/* Topbar */}
          <div className="hr-add-topbar">
            <button className="hr-add-back-btn" onClick={() => navigate("/employees")}>
              <ChevronLeft size={15} />
            </button>
            <div>
              <div className="hr-add-topbar-title">Novo Colaborador</div>
              <div className="hr-add-topbar-sub">Preencha os dados do novo membro da equipe</div>
            </div>
          </div>

          {/* Form */}
          <div className="hr-add-content">
            <div className="hr-add-form-wrap">
              <form onSubmit={handleSubmit}>

                {/* ── Dados Pessoais ── */}
                <div className="hr-add-section">
                  <div className="hr-add-section-header">
                    <div className="hr-add-section-icon"><User size={14} /></div>
                    <span className="hr-add-section-title">Dados Pessoais</span>
                  </div>
                  <div className="hr-add-grid-2">
                    <div className="hr-add-field hr-add-col-full">
                      <label className="hr-add-label">Nome Completo *</label>
                      <input
                        type="text"
                        name="employee_name"
                        value={formData.employee_name}
                        onChange={handleChange}
                        placeholder="Nome completo do colaborador"
                        className={`hr-add-input ${errors.employee_name ? "error" : ""}`}
                      />
                      {errors.employee_name && <span className="hr-add-error-text">{errors.employee_name}</span>}
                    </div>

                    <div className="hr-add-field">
                      <label className="hr-add-label">CPF *</label>
                      <input
                        type="text"
                        name="employee_cpf"
                        value={formData.employee_cpf}
                        onChange={handleChange}
                        placeholder="000.000.000-00"
                        className={`hr-add-input mono ${errors.employee_cpf ? "error" : ""}`}
                      />
                      {errors.employee_cpf && <span className="hr-add-error-text">{errors.employee_cpf}</span>}
                    </div>

                    <div className="hr-add-field">
                      <label className="hr-add-label">RG *</label>
                      <input
                        type="text"
                        name="employee_rg"
                        value={formData.employee_rg}
                        onChange={handleChange}
                        placeholder="00.000.000-0"
                        className={`hr-add-input mono ${errors.employee_rg ? "error" : ""}`}
                      />
                      {errors.employee_rg && <span className="hr-add-error-text">{errors.employee_rg}</span>}
                    </div>

                    <div className="hr-add-field">
                      <label className="hr-add-label">Data de Nascimento *</label>
                      <input
                        type="date"
                        name="employee_birthdate"
                        value={formData.employee_birthdate}
                        onChange={handleChange}
                        className={`hr-add-input mono ${errors.employee_birthdate ? "error" : ""}`}
                      />
                      {errors.employee_birthdate && <span className="hr-add-error-text">{errors.employee_birthdate}</span>}
                    </div>

                    <div className="hr-add-field">
                      <label className="hr-add-label">Data de Admissão *</label>
                      <input
                        type="date"
                        name="employee_startdate"
                        value={formData.employee_startdate}
                        onChange={handleChange}
                        className={`hr-add-input mono ${errors.employee_startdate ? "error" : ""}`}
                      />
                      {errors.employee_startdate && <span className="hr-add-error-text">{errors.employee_startdate}</span>}
                    </div>
                  </div>
                </div>

                {/* ── Dados Profissionais ── */}
                <div className="hr-add-section">
                  <div className="hr-add-section-header">
                    <div className="hr-add-section-icon"><Briefcase size={14} /></div>
                    <span className="hr-add-section-title">Dados Profissionais</span>
                  </div>
                  <div className="hr-add-grid-2">
                    <div className="hr-add-field">
                      <label className="hr-add-label">Departamento *</label>
                      <select
                        name="department_id"
                        value={formData.department_id}
                        onChange={handleChange}
                        className={`hr-add-select ${errors.department_id ? "error" : ""}`}
                      >
                        <option value="">Selecione o departamento</option>
                        {departments.map((dept) => (
                          <option key={dept.id} value={dept.id}>{dept.department_name}</option>
                        ))}
                      </select>
                      {errors.department_id && <span className="hr-add-error-text">{errors.department_id}</span>}
                    </div>

                    <div className="hr-add-field">
                      <label className="hr-add-label">Cargo *</label>
                      <select
                        name="position_id"
                        value={formData.position_id}
                        onChange={handleChange}
                        disabled={!formData.department_id}
                        className={`hr-add-select ${errors.position_id ? "error" : ""}`}
                      >
                        <option value="">
                          {formData.department_id ? "Selecione o cargo" : "Selecione o departamento primeiro"}
                        </option>
                        {filteredPositions.map((pos) => (
                          <option key={pos.id} value={pos.id}>{pos.position_name}</option>
                        ))}
                      </select>
                      {errors.position_id && <span className="hr-add-error-text">{errors.position_id}</span>}
                    </div>

                    <div className="hr-add-field">
                      <label className="hr-add-label">Salário *</label>
                      <input
                        type="number"
                        name="employee_salary"
                        value={formData.employee_salary}
                        onChange={handleChange}
                        placeholder="5000.00"
                        className={`hr-add-input mono ${errors.employee_salary ? "error" : ""}`}
                      />
                      {errors.employee_salary && <span className="hr-add-error-text">{errors.employee_salary}</span>}
                    </div>
                  </div>
                </div>

                {/* ── Contato ── */}
                <div className="hr-add-section">
                  <div className="hr-add-section-header">
                    <div className="hr-add-section-icon"><Mail size={14} /></div>
                    <span className="hr-add-section-title">Contato</span>
                  </div>
                  <div className="hr-add-grid-2">
                    <div className="hr-add-field">
                      <label className="hr-add-label">E-mail *</label>
                      <input
                        type="email"
                        name="employee_email"
                        value={formData.employee_email}
                        onChange={handleChange}
                        placeholder="email@empresa.com"
                        className={`hr-add-input ${errors.employee_email ? "error" : ""}`}
                      />
                      {errors.employee_email && <span className="hr-add-error-text">{errors.employee_email}</span>}
                    </div>

                    <div className="hr-add-field">
                      <label className="hr-add-label">Telefone *</label>
                      <input
                        type="text"
                        name="employee_phone"
                        value={formData.employee_phone}
                        onChange={handleChange}
                        placeholder="(11) 99999-9999"
                        className={`hr-add-input mono ${errors.employee_phone ? "error" : ""}`}
                      />
                      {errors.employee_phone && <span className="hr-add-error-text">{errors.employee_phone}</span>}
                    </div>
                  </div>
                </div>

                {/* ── Dados Bancários ── */}
                <div className="hr-add-section">
                  <div className="hr-add-section-header">
                    <div className="hr-add-section-icon"><CreditCard size={14} /></div>
                    <span className="hr-add-section-title">Dados Bancários</span>
                  </div>
                  <div className="hr-add-grid-3">
                    <div className="hr-add-field">
                      <label className="hr-add-label">Banco *</label>
                      <input
                        type="text"
                        name="employee_bank"
                        value={formData.employee_bank}
                        onChange={handleChange}
                        placeholder="Banco do Brasil"
                        className={`hr-add-input ${errors.employee_bank ? "error" : ""}`}
                      />
                      {errors.employee_bank && <span className="hr-add-error-text">{errors.employee_bank}</span>}
                    </div>

                    <div className="hr-add-field">
                      <label className="hr-add-label">Agência *</label>
                      <input
                        type="text"
                        name="employee_agency"
                        value={formData.employee_agency}
                        onChange={handleChange}
                        placeholder="0001"
                        className={`hr-add-input mono ${errors.employee_agency ? "error" : ""}`}
                      />
                      {errors.employee_agency && <span className="hr-add-error-text">{errors.employee_agency}</span>}
                    </div>

                    <div className="hr-add-field">
                      <label className="hr-add-label">Conta Corrente *</label>
                      <input
                        type="text"
                        name="employee_cc"
                        value={formData.employee_cc}
                        onChange={handleChange}
                        placeholder="12345-6"
                        className={`hr-add-input mono ${errors.employee_cc ? "error" : ""}`}
                      />
                      {errors.employee_cc && <span className="hr-add-error-text">{errors.employee_cc}</span>}
                    </div>
                  </div>
                </div>

                {/* Submit error */}
                {errors.submit && (
                  <div className="hr-add-submit-error">{errors.submit}</div>
                )}

                {/* Actions */}
                <div className="hr-add-actions">
                  <button type="button" className="hr-add-cancel-btn" onClick={() => navigate("/employees")}>
                    Cancelar
                  </button>
                  <button type="submit" disabled={submitting} className="hr-add-submit-btn">
                    {submitting ? "Criando colaborador..." : "Criar Colaborador"}
                  </button>
                </div>

              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
