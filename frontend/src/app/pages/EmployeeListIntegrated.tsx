import { useNavigate } from "react-router";
import { Users, LogOut, Search, Building2, ChevronRight, Plus } from "lucide-react";
import { useState, useEffect } from "react";
import { apiClient } from "@/lib/api";
import { toast } from "sonner";

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
}

interface ICurrentUser {
  id: number;
  username: string;
  email: string;
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

  .hr-emp-root {
    min-height: 100vh;
    display: flex;
    font-family: 'Plus Jakarta Sans', sans-serif;
    background: #F8FAFC;
  }

  /* ── Sidebar ── */
  .hr-emp-sidebar {
    width: 64px;
    flex-shrink: 0;
    background: #FFFFFF;
    border-right: 1px solid #E5E7EB;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 1.25rem 0;
    position: relative;
  }

  .hr-emp-sidebar-logo {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    margin-bottom: 2rem;
  }

  .hr-emp-sidebar-logo img {
    width: 40px;
    height: 40px;
    object-fit: contain;
  }

  .hr-emp-sidebar-nav {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
  }

  .hr-emp-nav-item {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: background 0.15s, color 0.15s;
    color: #9CA3AF;
    border: none;
    background: transparent;
    position: relative;
  }

  .hr-emp-nav-item:hover {
    background: #F3F4F6;
    color: #374151;
  }

  .hr-emp-nav-item.active {
    background: #ECFDF5;
    color: #059669;
  }

  .hr-emp-nav-item.active::before {
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

  .hr-emp-sidebar-bottom {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.625rem;
  }

  .hr-emp-sidebar-avatar {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    background: #D1FAE5;
    color: #065F46;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.75rem;
    font-weight: 700;
    letter-spacing: -0.02em;
    cursor: pointer;
    border: none;
    transition: box-shadow 0.15s, transform 0.15s;
  }

  .hr-emp-sidebar-avatar:hover {
    box-shadow: 0 0 0 2px rgba(5,150,105,0.3);
    transform: scale(1.05);
  }

  .hr-emp-logout-btn {
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

  .hr-emp-logout-btn:hover {
    background: #FEF2F2;
    color: #EF4444;
  }

  /* ── Profile panel ── */
  .hr-emp-profile-panel {
    position: fixed;
    left: 72px;
    bottom: 12px;
    width: 236px;
    background: #FFFFFF;
    border: 1px solid #E5E7EB;
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.1), 0 2px 8px rgba(0,0,0,0.06);
    z-index: 200;
    overflow: hidden;
    animation: hrProfileSlide 0.18s cubic-bezier(0.22,1,0.36,1) both;
  }

  @keyframes hrProfileSlide {
    from { opacity: 0; transform: translateX(-10px) scale(0.97); }
    to   { opacity: 1; transform: translateX(0) scale(1); }
  }

  .hr-emp-profile-panel::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 3px;
    background: linear-gradient(90deg, #059669 0%, #34D399 60%, transparent 100%);
  }

  .hr-emp-profile-header {
    padding: 1.25rem 1.25rem 1rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
  }

  .hr-emp-profile-avatar-large {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    background: #D1FAE5;
    color: #065F46;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.25rem;
    font-weight: 700;
    letter-spacing: -0.03em;
  }

  .hr-emp-profile-name {
    font-size: 0.9375rem;
    font-weight: 600;
    color: #111827;
    letter-spacing: -0.02em;
    text-align: center;
  }

  .hr-emp-profile-email {
    font-size: 0.75rem;
    color: #9CA3AF;
    font-weight: 400;
    text-align: center;
    word-break: break-all;
  }

  .hr-emp-profile-divider {
    height: 1px;
    background: #F3F4F6;
    margin: 0 1.25rem;
  }

  .hr-emp-profile-actions {
    padding: 0.625rem;
  }

  .hr-emp-profile-action-btn {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 0.625rem;
    padding: 0.5rem 0.75rem;
    border-radius: 7px;
    border: none;
    background: transparent;
    color: #6B7280;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 0.8125rem;
    font-weight: 400;
    cursor: pointer;
    transition: background 0.15s, color 0.15s;
    text-align: left;
  }

  .hr-emp-profile-action-btn:hover {
    background: #F3F4F6;
    color: #111827;
  }

  .hr-emp-profile-action-btn.danger { color: #EF4444; }
  .hr-emp-profile-action-btn.danger:hover {
    background: #FEF2F2;
    color: #DC2626;
  }

  .hr-emp-profile-overlay {
    position: fixed;
    inset: 0;
    z-index: 199;
  }

  /* ── Main ── */
  .hr-emp-main {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  /* Topbar */
  .hr-emp-topbar {
    height: 64px;
    flex-shrink: 0;
    border-bottom: 1px solid #E5E7EB;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 2rem;
    background: #FFFFFF;
  }

  .hr-emp-topbar-title {
    font-size: 1rem;
    font-weight: 700;
    color: #111827;
    letter-spacing: -0.025em;
  }

  .hr-emp-topbar-sub {
    font-size: 0.75rem;
    color: #9CA3AF;
    font-weight: 400;
    margin-top: 1px;
  }

  .hr-emp-add-btn {
    display: flex;
    align-items: center;
    gap: 0.4375rem;
    padding: 0.5rem 1rem;
    background: #059669;
    color: #fff;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 0.8125rem;
    font-weight: 600;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    letter-spacing: -0.01em;
    transition: background 0.18s, box-shadow 0.18s, transform 0.15s;
  }

  .hr-emp-add-btn:hover {
    background: #047857;
    box-shadow: 0 4px 16px rgba(5,150,105,0.25);
    transform: translateY(-1px);
  }

  .hr-emp-add-btn:active {
    transform: translateY(0);
    box-shadow: none;
  }

  /* Content */
  .hr-emp-content {
    flex: 1;
    overflow-y: auto;
    padding: 2rem;
  }

  .hr-emp-content::-webkit-scrollbar { width: 4px; }
  .hr-emp-content::-webkit-scrollbar-track { background: transparent; }
  .hr-emp-content::-webkit-scrollbar-thumb { background: #E5E7EB; border-radius: 2px; }
  .hr-emp-content::-webkit-scrollbar-thumb:hover { background: #D1D5DB; }

  .hr-emp-content-inner {
    max-width: 1280px;
    margin: 0 auto;
  }

  /* ── Stats ── */
  .hr-emp-stats {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
    margin-bottom: 2rem;
  }

  .hr-emp-stat-card {
    background: #FFFFFF;
    border: 1px solid #E5E7EB;
    border-radius: 12px;
    padding: 1.375rem 1.5rem;
    transition: box-shadow 0.2s, border-color 0.2s;
  }

  .hr-emp-stat-card:hover {
    box-shadow: 0 4px 16px rgba(0,0,0,0.06);
    border-color: #D1D5DB;
  }

  .hr-emp-stat-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1rem;
  }

  .hr-emp-stat-icon {
    width: 36px;
    height: 36px;
    border-radius: 9px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .hr-emp-stat-icon.green { background: #ECFDF5; color: #059669; }
  .hr-emp-stat-icon.blue  { background: #EFF6FF; color: #3B82F6; }

  .hr-emp-stat-badge {
    font-size: 0.625rem;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    padding: 0.2rem 0.5rem;
    border-radius: 100px;
  }

  .hr-emp-stat-badge.green {
    background: #ECFDF5;
    color: #059669;
    border: 1px solid #A7F3D0;
  }

  .hr-emp-stat-badge.blue {
    background: #EFF6FF;
    color: #3B82F6;
    border: 1px solid #BFDBFE;
  }

  .hr-emp-stat-number {
    font-size: 2.25rem;
    font-weight: 800;
    letter-spacing: -0.04em;
    color: #111827;
    margin-bottom: 0.25rem;
    line-height: 1;
  }

  .hr-emp-stat-label {
    font-size: 0.8125rem;
    color: #6B7280;
    font-weight: 400;
  }

  /* ── Toolbar ── */
  .hr-emp-toolbar {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1.5rem;
    flex-wrap: wrap;
  }

  .hr-emp-search-wrap {
    flex: 1;
    min-width: 220px;
    position: relative;
  }

  .hr-emp-search-icon {
    position: absolute;
    left: 0.875rem;
    top: 50%;
    transform: translateY(-50%);
    color: #9CA3AF;
    pointer-events: none;
  }

  .hr-emp-search {
    width: 100%;
    background: #FFFFFF;
    border: 1.5px solid #E5E7EB;
    border-radius: 9px;
    padding: 0.625rem 1rem 0.625rem 2.5rem;
    color: #111827;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 0.875rem;
    font-weight: 400;
    outline: none;
    transition: border-color 0.18s, box-shadow 0.18s;
    caret-color: #059669;
  }

  .hr-emp-search::placeholder { color: #9CA3AF; }
  .hr-emp-search:focus {
    border-color: #059669;
    box-shadow: 0 0 0 3px rgba(5,150,105,0.1);
  }

  /* Filter pills */
  .hr-emp-filter-pills {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    flex-wrap: wrap;
  }

  .hr-emp-pill {
    padding: 0.375rem 0.875rem;
    border-radius: 100px;
    border: 1.5px solid #E5E7EB;
    background: #FFFFFF;
    color: #6B7280;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 0.75rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.15s;
    white-space: nowrap;
  }

  .hr-emp-pill:hover {
    border-color: #D1D5DB;
    color: #374151;
    background: #F9FAFB;
  }

  .hr-emp-pill.active {
    background: #ECFDF5;
    border-color: #A7F3D0;
    color: #059669;
  }

  /* ── Employee grid ── */
  .hr-emp-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1rem;
  }

  .hr-emp-card {
    background: #FFFFFF;
    border: 1.5px solid #E5E7EB;
    border-radius: 12px;
    padding: 1.25rem 1.375rem;
    cursor: pointer;
    transition: border-color 0.18s, box-shadow 0.18s, transform 0.15s;
    position: relative;
    overflow: hidden;
  }

  .hr-emp-card:hover {
    border-color: #A7F3D0;
    box-shadow: 0 4px 20px rgba(5,150,105,0.08);
    transform: translateY(-1px);
  }

  .hr-emp-card::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 2px;
    background: linear-gradient(90deg, #059669, #34D399);
    opacity: 0;
    transition: opacity 0.18s;
  }

  .hr-emp-card:hover::before { opacity: 1; }

  .hr-emp-card-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 1rem;
  }

  .hr-emp-card-identity {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .hr-emp-card-avatar {
    width: 42px;
    height: 42px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1rem;
    font-weight: 700;
    letter-spacing: -0.02em;
    flex-shrink: 0;
  }

  .hr-emp-card-name {
    font-size: 0.9375rem;
    font-weight: 600;
    color: #111827;
    letter-spacing: -0.02em;
    margin-bottom: 0.125rem;
    transition: color 0.15s;
    line-height: 1.3;
  }

  .hr-emp-card:hover .hr-emp-card-name { color: #059669; }

  .hr-emp-card-role {
    font-size: 0.75rem;
    color: #9CA3AF;
    font-weight: 400;
  }

  .hr-emp-card-chevron {
    color: #D1D5DB;
    transition: color 0.15s, transform 0.15s;
    margin-top: 2px;
    flex-shrink: 0;
  }

  .hr-emp-card:hover .hr-emp-card-chevron {
    color: #059669;
    transform: translateX(2px);
  }

  .hr-emp-card-meta {
    display: flex;
    flex-direction: column;
    gap: 0.4375rem;
  }

  .hr-emp-card-dept {
    display: inline-flex;
    align-items: center;
    gap: 0.375rem;
    font-size: 0.75rem;
    color: #6B7280;
    font-weight: 400;
  }

  .hr-emp-card-id {
    font-family: 'DM Mono', monospace;
    font-size: 0.6875rem;
    color: #9CA3AF;
    letter-spacing: 0.04em;
  }

  /* ── Skeleton ── */
  @keyframes hrShimmer {
    0%   { background-position: -600px 0; }
    100% { background-position: 600px 0; }
  }

  .hr-emp-skeleton {
    background: #FFFFFF;
    border: 1.5px solid #E5E7EB;
    border-radius: 12px;
    padding: 1.25rem 1.375rem;
  }

  .hr-emp-skel-line {
    border-radius: 6px;
    animation: hrShimmer 1.6s linear infinite;
    background: linear-gradient(
      90deg,
      #F3F4F6 0%,
      #E5E7EB 50%,
      #F3F4F6 100%
    );
    background-size: 600px 100%;
  }

  .hr-emp-skel-avatar { width: 42px; height: 42px; border-radius: 10px; }
  .hr-emp-skel-name   { height: 14px; width: 65%; margin-bottom: 8px; }
  .hr-emp-skel-role   { height: 11px; width: 45%; }
  .hr-emp-skel-dept   { height: 11px; width: 55%; margin-top: 12px; }
  .hr-emp-skel-id     { height: 10px; width: 35%; margin-top: 6px; }

  /* ── Empty state ── */
  .hr-emp-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 4rem 2rem;
    text-align: center;
    background: #FFFFFF;
    border: 1.5px dashed #E5E7EB;
    border-radius: 12px;
  }

  .hr-emp-empty-icon {
    width: 52px;
    height: 52px;
    border-radius: 13px;
    background: #F3F4F6;
    border: 1px solid #E5E7EB;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #9CA3AF;
    margin-bottom: 1.25rem;
  }

  .hr-emp-empty-title {
    font-size: 0.9375rem;
    font-weight: 600;
    color: #374151;
    margin-bottom: 0.375rem;
    letter-spacing: -0.02em;
  }

  .hr-emp-empty-sub {
    font-size: 0.8125rem;
    color: #9CA3AF;
    font-weight: 400;
  }

  /* Section label */
  .hr-emp-section-label {
    font-size: 0.6875rem;
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: #9CA3AF;
    margin-bottom: 0.875rem;
  }
`;

function SkeletonCard() {
  return (
    <div className="hr-emp-skeleton">
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
        <div className="hr-emp-skel-line hr-emp-skel-avatar" />
        <div style={{ flex: 1 }}>
          <div className="hr-emp-skel-line hr-emp-skel-name" />
          <div className="hr-emp-skel-line hr-emp-skel-role" />
        </div>
      </div>
      <div className="hr-emp-skel-line hr-emp-skel-dept" />
      <div className="hr-emp-skel-line hr-emp-skel-id" />
    </div>
  );
}

export default function EmployeeList() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [employees, setEmployees] = useState<IEmployee[]>([]);
  const [loading, setLoading] = useState(true);
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");
  const [showProfile, setShowProfile] = useState(false);
  const [currentUser, setCurrentUser] = useState<ICurrentUser | null>(null);

  useEffect(() => {
    loadEmployees();
    apiClient.getCurrentUser().then((u) => setCurrentUser(u as ICurrentUser)).catch(() => {});
  }, []);

  const loadEmployees = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getEmployees() as IEmployee[];
      setEmployees(data);
    } catch {
      toast.error("Erro ao carregar funcionários");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await apiClient.logout();
      navigate("/login");
    } catch {
      navigate("/login");
    }
  };

  const filteredEmployees = employees.filter((emp) => {
    const role = emp.employee_titlejob?.position_name ?? "";
    const matchesSearch =
      !searchTerm ||
      emp.employee_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      role.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment =
      departmentFilter === "all" || emp.department?.department_name === departmentFilter;
    return matchesSearch && matchesDepartment;
  });

  const departments = [...new Set(employees.map((e) => e.department?.department_name).filter(Boolean))];
  const userInitial = currentUser?.username?.charAt(0).toUpperCase() ?? "?";

  return (
    <>
      <style>{styles}</style>

      <div className="hr-emp-root">
        {/* ── Sidebar ── */}
        <aside className="hr-emp-sidebar">
          <div className="hr-emp-sidebar-logo">
            <img src="/images/logo_da.svg" alt="DemoApp" />
          </div>

          <nav className="hr-emp-sidebar-nav">
            <button className="hr-emp-nav-item active" title="Funcionários">
              <Users size={17} />
            </button>
          </nav>

          <div className="hr-emp-sidebar-bottom">
            <button
              className="hr-emp-sidebar-avatar"
              title="Meu perfil"
              onClick={() => setShowProfile(p => !p)}
            >
              {userInitial}
            </button>
            <button className="hr-emp-logout-btn" onClick={handleLogout} title="Sair">
              <LogOut size={15} />
            </button>
          </div>
        </aside>

        {/* Profile panel */}
        {showProfile && (
          <>
            <div className="hr-emp-profile-overlay" onClick={() => setShowProfile(false)} />
            <div className="hr-emp-profile-panel">
              <div className="hr-emp-profile-header">
                <div className="hr-emp-profile-avatar-large">{userInitial}</div>
                <div className="hr-emp-profile-name">{currentUser?.username ?? "—"}</div>
                <div className="hr-emp-profile-email">{currentUser?.email ?? "—"}</div>
              </div>
              <div className="hr-emp-profile-divider" />
              <div className="hr-emp-profile-actions">
                <button
                  className="hr-emp-profile-action-btn danger"
                  onClick={() => { setShowProfile(false); handleLogout(); }}
                >
                  <LogOut size={13} />
                  Sair da conta
                </button>
              </div>
            </div>
          </>
        )}

        {/* ── Main ── */}
        <div className="hr-emp-main">
          {/* Topbar */}
          <div className="hr-emp-topbar">
            <div>
              <div className="hr-emp-topbar-title">Colaboradores</div>
              <div className="hr-emp-topbar-sub">
                {loading ? "Carregando..." : `${employees.length} colaborador${employees.length !== 1 ? "es" : ""} cadastrado${employees.length !== 1 ? "s" : ""}`}
              </div>
            </div>
            <button className="hr-emp-add-btn" onClick={() => navigate("/employees/add")}>
              <Plus size={14} />
              Novo Colaborador
            </button>
          </div>

          {/* Content */}
          <div className="hr-emp-content">
            <div className="hr-emp-content-inner">

              {/* Stats */}
              <div className="hr-emp-stats">
                <div className="hr-emp-stat-card">
                  <div className="hr-emp-stat-header">
                    <div className="hr-emp-stat-icon green">
                      <Users size={16} />
                    </div>
                    <span className="hr-emp-stat-badge green">Ativo</span>
                  </div>
                  <div className="hr-emp-stat-number">{employees.length}</div>
                  <div className="hr-emp-stat-label">Total de Colaboradores</div>
                </div>

                <div className="hr-emp-stat-card">
                  <div className="hr-emp-stat-header">
                    <div className="hr-emp-stat-icon blue">
                      <Building2 size={16} />
                    </div>
                    <span className="hr-emp-stat-badge blue">Ativo</span>
                  </div>
                  <div className="hr-emp-stat-number">{departments.length}</div>
                  <div className="hr-emp-stat-label">Departamentos</div>
                </div>
              </div>

              {/* Search + Pills */}
              <div className="hr-emp-toolbar">
                <div className="hr-emp-search-wrap">
                  <Search size={15} className="hr-emp-search-icon" />
                  <input
                    type="text"
                    placeholder="Buscar por nome ou cargo..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="hr-emp-search"
                  />
                </div>

                {departments.length > 0 && (
                  <div className="hr-emp-filter-pills">
                    <button
                      className={`hr-emp-pill ${departmentFilter === "all" ? "active" : ""}`}
                      onClick={() => setDepartmentFilter("all")}
                    >
                      Todos
                    </button>
                    {departments.map((dept) => (
                      <button
                        key={dept}
                        className={`hr-emp-pill ${departmentFilter === dept ? "active" : ""}`}
                        onClick={() => setDepartmentFilter(dept)}
                      >
                        {dept}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Section label */}
              {!loading && filteredEmployees.length > 0 && (
                <div className="hr-emp-section-label">
                  {filteredEmployees.length} resultado{filteredEmployees.length !== 1 ? "s" : ""}
                  {departmentFilter !== "all" ? ` · ${departmentFilter}` : ""}
                </div>
              )}

              {/* Grid */}
              {loading ? (
                <div className="hr-emp-grid">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <SkeletonCard key={i} />
                  ))}
                </div>
              ) : filteredEmployees.length === 0 ? (
                <div className="hr-emp-empty">
                  <div className="hr-emp-empty-icon">
                    <Users size={22} />
                  </div>
                  <div className="hr-emp-empty-title">Nenhum colaborador encontrado</div>
                  <div className="hr-emp-empty-sub">
                    {searchTerm
                      ? "Tente ajustar o termo de busca"
                      : departmentFilter !== "all"
                        ? "Nenhum colaborador neste departamento"
                        : "Adicione o primeiro colaborador"}
                  </div>
                </div>
              ) : (
                <div className="hr-emp-grid">
                  {filteredEmployees.map((employee) => {
                    const palette = getAvatarPalette(employee.employee_name);
                    return (
                      <div
                        key={employee.id}
                        className="hr-emp-card"
                        onClick={() => navigate(`/employees/${employee.id}`)}
                      >
                        <div className="hr-emp-card-header">
                          <div className="hr-emp-card-identity">
                            <div
                              className="hr-emp-card-avatar"
                              style={{ background: palette.bg, color: palette.color }}
                            >
                              {employee.employee_name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="hr-emp-card-name">{employee.employee_name}</div>
                              <div className="hr-emp-card-role">
                                {employee.employee_titlejob?.position_name ?? "—"}
                              </div>
                            </div>
                          </div>
                          <ChevronRight size={15} className="hr-emp-card-chevron" />
                        </div>

                        <div className="hr-emp-card-meta">
                          <div className="hr-emp-card-dept">
                            <Building2 size={12} />
                            {employee.department?.department_name ?? "—"}
                          </div>
                          <div className="hr-emp-card-id">ID · {employee.employee_id}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </>
  );
}
