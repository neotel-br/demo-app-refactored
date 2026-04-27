import { useState, useEffect } from "react";

/* ─────────────────────────────────────────────
   STYLES
───────────────────────────────────────────── */
const styles = `
@import url('https://fonts.googleapis.com/css2?family=Lexend:wght@400;600;700;800&family=Source+Sans+3:wght@300;400;600;700&family=DM+Mono:wght@400;500&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

.pa-root {
  min-height: 100vh;
  background: #F0F2F5;
  font-family: 'Source Sans 3', sans-serif;
  color: #1A1A2E;
}

.pa-govbar { height: 6px; background: linear-gradient(90deg, #FFCD07 0%, #FFCD07 25%, #1351B4 25%); }

.pa-header {
  background: #071D41;
  border-bottom: 3px solid #1351B4;
  padding: 0 2rem;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.pa-header-left { display: flex; align-items: center; gap: 1rem; }

.pa-govbr-badge {
  display: flex; align-items: center; gap: 0.5rem;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 8px; padding: 0.375rem 0.875rem;
}

.pa-govbr-star {
  width: 24px; height: 24px; background: #FFCD07;
  border-radius: 50%; display: flex; align-items: center;
  justify-content: center; font-size: 0.7rem; font-weight: 800; color: #071D41;
}

.pa-govbr-label { font-family: 'Lexend', sans-serif; font-size: 0.875rem; font-weight: 700; color: #fff; }

.pa-header-divider { width: 1px; height: 28px; background: rgba(255,255,255,0.15); }

.pa-portal-title { font-family: 'Lexend', sans-serif; font-size: 0.9375rem; font-weight: 700; color: #fff; }
.pa-portal-sub   { font-size: 0.6875rem; color: rgba(255,255,255,0.5); margin-top: 1px; }

.pa-back-btn {
  display: flex; align-items: center; gap: 0.375rem;
  padding: 0.375rem 0.875rem; background: rgba(255,255,255,0.08);
  border: 1px solid rgba(255,255,255,0.15); border-radius: 7px;
  color: rgba(255,255,255,0.8); font-size: 0.8125rem; font-weight: 600;
  cursor: pointer; transition: all 0.15s; text-decoration: none;
  font-family: 'Source Sans 3', sans-serif;
}
.pa-back-btn:hover { background: rgba(255,255,255,0.14); color: #fff; }

.pa-main { max-width: 1100px; margin: 0 auto; padding: 2rem 2rem 4rem; }

.pa-page-title {
  font-family: 'Lexend', sans-serif; font-size: 1.5rem; font-weight: 700;
  color: #071D41; letter-spacing: -0.03em; margin-bottom: 0.25rem;
}
.pa-page-sub { font-size: 0.9rem; color: #6B7280; margin-bottom: 2rem; }

.pa-tabs {
  display: flex; gap: 0.5rem; margin-bottom: 2rem;
  border-bottom: 2px solid #E0E4ED; padding-bottom: 0;
}
.pa-tab {
  padding: 0.625rem 1.25rem; border: none; background: transparent;
  font-family: 'Source Sans 3', sans-serif; font-size: 0.875rem;
  font-weight: 600; color: #6B7280; cursor: pointer;
  border-bottom: 3px solid transparent; margin-bottom: -2px;
  transition: color 0.15s;
}
.pa-tab:hover { color: #1351B4; }
.pa-tab.active { color: #1351B4; border-bottom-color: #1351B4; }

/* Card sections */
.pa-section {
  background: #fff; border: 1px solid #E0E4ED;
  border-radius: 14px; overflow: hidden; margin-bottom: 1.5rem;
}

.pa-section-header {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #F0F2F5;
  display: flex; align-items: center; justify-content: space-between;
}

.pa-section-title {
  font-family: 'Lexend', sans-serif; font-size: 1rem;
  font-weight: 700; color: #071D41;
}

.pa-add-btn {
  display: flex; align-items: center; gap: 0.375rem;
  padding: 0.5rem 1.125rem; background: #1351B4; border: none;
  border-radius: 8px; font-family: 'Source Sans 3', sans-serif;
  font-size: 0.8125rem; font-weight: 700; color: #fff;
  cursor: pointer; transition: background 0.15s;
}
.pa-add-btn:hover { background: #0A3A8E; }

/* Table */
.pa-table { width: 100%; border-collapse: collapse; }
.pa-table th {
  background: #F8F9FB; padding: 0.75rem 1.25rem;
  text-align: left; font-size: 0.6875rem; font-weight: 700;
  color: #6B7280; text-transform: uppercase; letter-spacing: 0.08em;
  border-bottom: 2px solid #E0E4ED;
}
.pa-table td {
  padding: 0.875rem 1.25rem; border-bottom: 1px solid #F0F2F5;
  font-size: 0.875rem; color: #374151; vertical-align: middle;
}
.pa-table tr:last-child td { border-bottom: none; }
.pa-table tr:hover td { background: #FAFBFF; }

.pa-token-badge {
  display: inline-flex; align-items: center; gap: 0.25rem;
  padding: 0.1875rem 0.5rem; border-radius: 100px;
  font-size: 0.625rem; font-weight: 700; letter-spacing: 0.04em;
}
.pa-token-badge.ok  { background: #E8F5E9; border: 1px solid #A5D6A7; color: #168821; }
.pa-token-badge.nok { background: #FFF8E6; border: 1px solid #F5C842; color: #7A5800; }

.pa-del-btn {
  padding: 0.3125rem 0.75rem; background: transparent;
  border: 1.5px solid #FECACA; border-radius: 6px;
  font-size: 0.75rem; font-weight: 700; color: #EF4444;
  cursor: pointer; transition: all 0.15s;
}
.pa-del-btn:hover { background: #FEE2E2; border-color: #FCA5A5; }
.pa-del-btn:disabled { opacity: 0.4; cursor: not-allowed; }

.pa-empty { padding: 2.5rem 1.5rem; text-align: center; color: #9CA3AF; font-size: 0.875rem; }

/* Modal */
@keyframes paOverlayIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes paModalIn {
  from { opacity: 0; transform: translateY(12px) scale(0.97); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}

.pa-overlay {
  position: fixed; inset: 0; background: rgba(7,29,65,0.55);
  backdrop-filter: blur(4px); z-index: 500;
  display: flex; align-items: center; justify-content: center; padding: 1.5rem;
  animation: paOverlayIn 0.2s ease both;
}
.pa-modal {
  background: #fff; border-radius: 16px; width: 100%; max-width: 600px;
  max-height: 90vh; overflow-y: auto;
  box-shadow: 0 32px 80px rgba(0,0,0,0.22);
  animation: paModalIn 0.25s cubic-bezier(0.22,1,0.36,1) both;
}
.pa-modal-header {
  background: linear-gradient(135deg, #071D41 0%, #1351B4 100%);
  padding: 1.25rem 1.5rem;
  display: flex; align-items: center; justify-content: space-between;
  position: sticky; top: 0; z-index: 1;
}
.pa-modal-title { font-family: 'Lexend', sans-serif; font-size: 1rem; font-weight: 700; color: #fff; }
.pa-modal-close {
  width: 28px; height: 28px; border-radius: 7px;
  border: 1px solid rgba(255,255,255,0.2); background: transparent;
  color: rgba(255,255,255,0.7); cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  font-size: 1rem; transition: all 0.15s;
}
.pa-modal-close:hover { background: rgba(255,255,255,0.12); color: #fff; }

.pa-modal-body { padding: 1.5rem; }

.pa-form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
.pa-form-full { grid-column: 1 / -1; }

.pa-field { display: flex; flex-direction: column; gap: 0.375rem; }
.pa-label {
  font-size: 0.6875rem; font-weight: 700; color: #6B7280;
  text-transform: uppercase; letter-spacing: 0.08em;
}
.pa-input, .pa-select, .pa-textarea {
  background: #F8F9FB; border: 1.5px solid #E0E4ED; border-radius: 8px;
  padding: 0.5625rem 0.875rem; font-family: 'Source Sans 3', sans-serif;
  font-size: 0.875rem; color: #1A1A2E; outline: none;
  transition: border-color 0.15s; width: 100%;
}
.pa-input:focus, .pa-select:focus, .pa-textarea:focus { border-color: #1351B4; }
.pa-textarea { resize: vertical; min-height: 80px; }

.pa-hint {
  font-size: 0.6875rem; color: #9CA3AF;
  display: flex; align-items: center; gap: 0.25rem; margin-top: 0.25rem;
}

.pa-modal-footer {
  padding: 1rem 1.5rem 1.5rem; display: flex; gap: 0.75rem;
  justify-content: flex-end; border-top: 1px solid #F0F2F5;
}
.pa-cancel-btn {
  padding: 0.625rem 1.25rem; background: transparent;
  border: 1.5px solid #E0E4ED; border-radius: 9px;
  font-family: 'Source Sans 3', sans-serif; font-size: 0.875rem;
  font-weight: 600; color: #6B7280; cursor: pointer; transition: all 0.15s;
}
.pa-cancel-btn:hover { border-color: #9CA3AF; color: #374151; }
.pa-submit-btn {
  padding: 0.625rem 1.5rem; background: #168821; border: none;
  border-radius: 9px; font-family: 'Source Sans 3', sans-serif;
  font-size: 0.875rem; font-weight: 700; color: #fff;
  cursor: pointer; transition: background 0.15s;
}
.pa-submit-btn:hover { background: #0D6318; }
.pa-submit-btn:disabled { background: #9CA3AF; cursor: not-allowed; }

.pa-toast {
  position: fixed; bottom: 1.5rem; right: 1.5rem; z-index: 999;
  padding: 0.875rem 1.25rem; border-radius: 10px;
  font-size: 0.875rem; font-weight: 600; color: #fff;
  box-shadow: 0 8px 24px rgba(0,0,0,0.2);
  animation: paOverlayIn 0.2s ease both;
}
.pa-toast.success { background: #168821; }
.pa-toast.error   { background: #EF4444; }

@media (max-width: 600px) { .pa-form-grid { grid-template-columns: 1fr; } }
`;

/* ─────────────────────────────────────────────
   TOAST
───────────────────────────────────────────── */
function Toast({ message, type, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3000);
    return () => clearTimeout(t);
  }, [onDone]);
  return <div className={`pa-toast ${type}`}>{message}</div>;
}

/* ─────────────────────────────────────────────
   SERVIDOR FORM MODAL
───────────────────────────────────────────── */
const SERVIDOR_DEFAULTS = {
  nome: "", orgao: "", sigla_orgao: "", cargo: "", siape: "",
  vinculo: "Servidor Efetivo", admissao: "", situacao: "Ativo", salario: "",
  servidor_cpf: "", servidor_beneficios: "", servidor_endereco: "", servidor_nascimento: "",
};

function ServidorModal({ onClose, onSaved }) {
  const [form, setForm] = useState(SERVIDOR_DEFAULTS);
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async () => {
    setSaving(true);
    try {
      const resp = await fetch("/api/portal/servidores/create/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || "Erro ao salvar");
      onSaved(data, "Servidor criado e tokenizado com sucesso!");
    } catch (err) {
      onSaved(null, err.message, true);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="pa-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="pa-modal">
        <div className="pa-modal-header">
          <span className="pa-modal-title">Novo Servidor Público</span>
          <button className="pa-modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="pa-modal-body">
          <div className="pa-hint" style={{ marginBottom: "1rem", fontSize: "0.75rem", color: "#1351B4" }}>
            ⚠ Os campos sensíveis serão tokenizados automaticamente ao salvar.
          </div>
          <div className="pa-form-grid">
            <div className="pa-field pa-form-full">
              <label className="pa-label">Nome Completo *</label>
              <input className="pa-input" value={form.nome} onChange={(e) => set("nome", e.target.value)} placeholder="Ex: João da Silva" />
            </div>
            <div className="pa-field">
              <label className="pa-label">Órgão *</label>
              <input className="pa-input" value={form.orgao} onChange={(e) => set("orgao", e.target.value)} placeholder="Ex: Ministério da Educação" />
            </div>
            <div className="pa-field">
              <label className="pa-label">Sigla *</label>
              <input className="pa-input" value={form.sigla_orgao} onChange={(e) => set("sigla_orgao", e.target.value)} placeholder="Ex: MEC" maxLength={20} />
            </div>
            <div className="pa-field pa-form-full">
              <label className="pa-label">Cargo *</label>
              <input className="pa-input" value={form.cargo} onChange={(e) => set("cargo", e.target.value)} placeholder="Ex: Analista em Tecnologia da Informação" />
            </div>
            <div className="pa-field">
              <label className="pa-label">SIAPE *</label>
              <input className="pa-input" value={form.siape} onChange={(e) => set("siape", e.target.value)} placeholder="Ex: 1234567" />
            </div>
            <div className="pa-field">
              <label className="pa-label">Vínculo *</label>
              <select className="pa-select" value={form.vinculo} onChange={(e) => set("vinculo", e.target.value)}>
                <option>Servidor Efetivo</option>
                <option>Servidor Comissionado</option>
                <option>Pensionista</option>
                <option>Contratado Temporário</option>
              </select>
            </div>
            <div className="pa-field">
              <label className="pa-label">Data de Admissão *</label>
              <input className="pa-input" value={form.admissao} onChange={(e) => set("admissao", e.target.value)} placeholder="DD/MM/AAAA" />
            </div>
            <div className="pa-field">
              <label className="pa-label">Situação *</label>
              <select className="pa-select" value={form.situacao} onChange={(e) => set("situacao", e.target.value)}>
                <option>Ativo</option>
                <option>Inativo</option>
                <option>Aposentado</option>
                <option>Cedido</option>
              </select>
            </div>
            <div className="pa-field pa-form-full">
              <label className="pa-label">Salário Bruto *</label>
              <input className="pa-input" value={form.salario} onChange={(e) => set("salario", e.target.value)} placeholder="Ex: R$ 8.479,22" />
            </div>

            <div style={{ gridColumn: "1 / -1", borderTop: "1px solid #F0F2F5", paddingTop: "1rem", marginTop: "0.25rem" }}>
              <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "#EF4444", marginBottom: "0.875rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                🔒 Dados Sensíveis — serão tokenizados
              </p>
            </div>

            <div className="pa-field">
              <label className="pa-label">CPF *</label>
              <input className="pa-input" value={form.servidor_cpf} onChange={(e) => set("servidor_cpf", e.target.value)} placeholder="Ex: 123.456.789-00" style={{ fontFamily: "'DM Mono', monospace" }} />
            </div>
            <div className="pa-field">
              <label className="pa-label">Data de Nascimento *</label>
              <input className="pa-input" value={form.servidor_nascimento} onChange={(e) => set("servidor_nascimento", e.target.value)} placeholder="Ex: 22/04/1981" style={{ fontFamily: "'DM Mono', monospace" }} />
            </div>
            <div className="pa-field">
              <label className="pa-label">Benefícios Mensais *</label>
              <input className="pa-input" value={form.servidor_beneficios} onChange={(e) => set("servidor_beneficios", e.target.value)} placeholder="Ex: R$ 1.840,00 / mês" style={{ fontFamily: "'DM Mono', monospace" }} />
            </div>
            <div className="pa-field pa-form-full">
              <label className="pa-label">Endereço Residencial *</label>
              <input className="pa-input" value={form.servidor_endereco} onChange={(e) => set("servidor_endereco", e.target.value)} placeholder="Ex: SQN 312, Bl. C Ap. 402 – Brasília/DF" />
            </div>
          </div>
        </div>
        <div className="pa-modal-footer">
          <button className="pa-cancel-btn" onClick={onClose}>Cancelar</button>
          <button className="pa-submit-btn" onClick={handleSubmit} disabled={saving}>
            {saving ? "Salvando e tokenizando..." : "Salvar Servidor"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   CONTRATO FORM MODAL
───────────────────────────────────────────── */
const CONTRATO_DEFAULTS = {
  numero: "", objeto: "", orgao: "", sigla_orgao: "", fornecedor: "",
  valor: "", data_assinatura: "", vigencia: "", situacao: "Vigente",
  modalidade: "Pregão Eletrônico",
  contrato_cnpj: "", contrato_responsavel: "", contrato_banco: "",
};

function ContratoModal({ onClose, onSaved }) {
  const [form, setForm] = useState(CONTRATO_DEFAULTS);
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async () => {
    setSaving(true);
    try {
      const resp = await fetch("/api/portal/contratos/create/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || "Erro ao salvar");
      onSaved(data, "Contrato criado e tokenizado com sucesso!");
    } catch (err) {
      onSaved(null, err.message, true);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="pa-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="pa-modal">
        <div className="pa-modal-header">
          <span className="pa-modal-title">Novo Contrato Público</span>
          <button className="pa-modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="pa-modal-body">
          <div className="pa-hint" style={{ marginBottom: "1rem", fontSize: "0.75rem", color: "#1351B4" }}>
            ⚠ CNPJ, responsável e dados bancários serão tokenizados automaticamente ao salvar.
          </div>
          <div className="pa-form-grid">
            <div className="pa-field">
              <label className="pa-label">Nº Contrato *</label>
              <input className="pa-input" value={form.numero} onChange={(e) => set("numero", e.target.value)} placeholder="Ex: CT-2024-00142" style={{ fontFamily: "'DM Mono', monospace" }} />
            </div>
            <div className="pa-field">
              <label className="pa-label">Situação *</label>
              <select className="pa-select" value={form.situacao} onChange={(e) => set("situacao", e.target.value)}>
                <option>Vigente</option>
                <option>Em execução</option>
                <option>Encerrado</option>
                <option>Rescindido</option>
              </select>
            </div>
            <div className="pa-field pa-form-full">
              <label className="pa-label">Objeto do Contrato *</label>
              <textarea className="pa-textarea" value={form.objeto} onChange={(e) => set("objeto", e.target.value)} placeholder="Descrição do objeto contratual..." />
            </div>
            <div className="pa-field">
              <label className="pa-label">Órgão Contratante *</label>
              <input className="pa-input" value={form.orgao} onChange={(e) => set("orgao", e.target.value)} placeholder="Ex: Ministério da Educação" />
            </div>
            <div className="pa-field">
              <label className="pa-label">Sigla *</label>
              <input className="pa-input" value={form.sigla_orgao} onChange={(e) => set("sigla_orgao", e.target.value)} placeholder="Ex: MEC" maxLength={20} />
            </div>
            <div className="pa-field pa-form-full">
              <label className="pa-label">Fornecedor / Contratada *</label>
              <input className="pa-input" value={form.fornecedor} onChange={(e) => set("fornecedor", e.target.value)} placeholder="Ex: Tecnodata Sistemas Ltda." />
            </div>
            <div className="pa-field">
              <label className="pa-label">Valor Total *</label>
              <input className="pa-input" value={form.valor} onChange={(e) => set("valor", e.target.value)} placeholder="Ex: R$ 4.872.000,00" style={{ fontFamily: "'DM Mono', monospace" }} />
            </div>
            <div className="pa-field">
              <label className="pa-label">Modalidade *</label>
              <select className="pa-select" value={form.modalidade} onChange={(e) => set("modalidade", e.target.value)}>
                <option>Pregão Eletrônico</option>
                <option>Concorrência Pública</option>
                <option>Dispensa de Licitação</option>
                <option>Inexigibilidade</option>
                <option>Credenciamento</option>
              </select>
            </div>
            <div className="pa-field">
              <label className="pa-label">Data de Assinatura *</label>
              <input className="pa-input" value={form.data_assinatura} onChange={(e) => set("data_assinatura", e.target.value)} placeholder="DD/MM/AAAA" />
            </div>
            <div className="pa-field">
              <label className="pa-label">Vigência *</label>
              <input className="pa-input" value={form.vigencia} onChange={(e) => set("vigencia", e.target.value)} placeholder="Ex: 15/03/2024 – 14/03/2026" />
            </div>

            <div style={{ gridColumn: "1 / -1", borderTop: "1px solid #F0F2F5", paddingTop: "1rem", marginTop: "0.25rem" }}>
              <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "#EF4444", marginBottom: "0.875rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                🔒 Dados Sensíveis — serão tokenizados
              </p>
            </div>

            <div className="pa-field">
              <label className="pa-label">CNPJ *</label>
              <input className="pa-input" value={form.contrato_cnpj} onChange={(e) => set("contrato_cnpj", e.target.value)} placeholder="Ex: 12.345.678/0001-90" style={{ fontFamily: "'DM Mono', monospace" }} />
            </div>
            <div className="pa-field">
              <label className="pa-label">Responsável pelo Contrato *</label>
              <input className="pa-input" value={form.contrato_responsavel} onChange={(e) => set("contrato_responsavel", e.target.value)} placeholder="Ex: Ana Lúcia de Faria" />
            </div>
            <div className="pa-field pa-form-full">
              <label className="pa-label">Dados Bancários *</label>
              <input className="pa-input" value={form.contrato_banco} onChange={(e) => set("contrato_banco", e.target.value)} placeholder="Ex: Banco do Brasil Ag. 0234 C/C 12345.67-8" style={{ fontFamily: "'DM Mono', monospace" }} />
            </div>
          </div>
        </div>
        <div className="pa-modal-footer">
          <button className="pa-cancel-btn" onClick={onClose}>Cancelar</button>
          <button className="pa-submit-btn" onClick={handleSubmit} disabled={saving}>
            {saving ? "Salvando e tokenizando..." : "Salvar Contrato"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   CONFIRM DELETE MODAL
───────────────────────────────────────────── */
function ConfirmModal({ message, onConfirm, onCancel }) {
  return (
    <div className="pa-overlay" onClick={(e) => e.target === e.currentTarget && onCancel()}>
      <div className="pa-modal" style={{ maxWidth: 400 }}>
        <div className="pa-modal-header">
          <span className="pa-modal-title">Confirmar remoção</span>
          <button className="pa-modal-close" onClick={onCancel}>✕</button>
        </div>
        <div className="pa-modal-body">
          <p style={{ fontSize: "0.9375rem", color: "#374151", lineHeight: 1.6 }}>{message}</p>
        </div>
        <div className="pa-modal-footer">
          <button className="pa-cancel-btn" onClick={onCancel}>Cancelar</button>
          <button style={{ padding: "0.625rem 1.5rem", background: "#EF4444", border: "none", borderRadius: 9, color: "#fff", fontSize: "0.875rem", fontWeight: 700, cursor: "pointer" }} onClick={onConfirm}>
            Remover
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   SERVIDORES TAB
───────────────────────────────────────────── */
function ServidoresAdmin({ onMessage }) {
  const [servidores, setServidores] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [showForm, setShowForm]     = useState(false);
  const [deleting, setDeleting]     = useState(null);
  const [confirmId, setConfirmId]   = useState(null);

  const load = () => {
    setLoading(true);
    fetch("/api/portal/servidores/")
      .then((r) => r.json())
      .then(setServidores)
      .catch(() => onMessage("Erro ao carregar servidores", true))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleSaved = (data, msg, isError = false) => {
    setShowForm(false);
    onMessage(msg, isError);
    if (!isError && data) load();
  };

  const handleDelete = async (id) => {
    setDeleting(id);
    setConfirmId(null);
    try {
      const resp = await fetch(`/api/portal/servidores/${id}/delete/`, { method: "DELETE" });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error);
      onMessage("Servidor removido com sucesso");
      load();
    } catch (err) {
      onMessage(err.message || "Erro ao remover servidor", true);
    } finally {
      setDeleting(null);
    }
  };

  return (
    <>
      <div className="pa-section">
        <div className="pa-section-header">
          <span className="pa-section-title">Servidores Públicos ({servidores.length})</span>
          <button className="pa-add-btn" onClick={() => setShowForm(true)}>+ Adicionar Servidor</button>
        </div>
        {loading ? (
          <div className="pa-empty">Carregando...</div>
        ) : servidores.length === 0 ? (
          <div className="pa-empty">Nenhum servidor cadastrado.</div>
        ) : (
          <table className="pa-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Órgão</th>
                <th>Cargo</th>
                <th>SIAPE</th>
                <th>Salário</th>
                <th>Situação</th>
                <th>Tokenizado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {servidores.map((s) => (
                <tr key={s.id}>
                  <td style={{ fontWeight: 600, color: "#071D41" }}>{s.nome}</td>
                  <td style={{ color: "#1351B4", fontWeight: 600, fontSize: "0.8125rem" }}>{s.sigla_orgao}</td>
                  <td style={{ maxWidth: 200, fontSize: "0.8125rem" }}>{s.cargo}</td>
                  <td style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.8125rem", color: "#6B7280" }}>{s.siape}</td>
                  <td style={{ fontFamily: "'DM Mono', monospace", color: "#168821", fontWeight: 600 }}>{s.salario}</td>
                  <td><span className={`pa-token-badge ${s.situacao === "Ativo" ? "ok" : "nok"}`}>{s.situacao}</span></td>
                  <td>
                    <span className={`pa-token-badge ${s.is_tokenized ? "ok" : "nok"}`}>
                      {s.is_tokenized ? "✓ Sim" : "⚠ Não"}
                    </span>
                  </td>
                  <td>
                    <button
                      className="pa-del-btn"
                      disabled={deleting === s.id}
                      onClick={() => setConfirmId(s.id)}
                    >
                      {deleting === s.id ? "..." : "Remover"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showForm && <ServidorModal onClose={() => setShowForm(false)} onSaved={handleSaved} />}
      {confirmId && (
        <ConfirmModal
          message={`Remover o servidor "${servidores.find((s) => s.id === confirmId)?.nome}"? Esta ação não pode ser desfeita.`}
          onConfirm={() => handleDelete(confirmId)}
          onCancel={() => setConfirmId(null)}
        />
      )}
    </>
  );
}

/* ─────────────────────────────────────────────
   CONTRATOS TAB
───────────────────────────────────────────── */
function ContratosAdmin({ onMessage }) {
  const [contratos, setContratos] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [showForm, setShowForm]   = useState(false);
  const [deleting, setDeleting]   = useState(null);
  const [confirmId, setConfirmId] = useState(null);

  const load = () => {
    setLoading(true);
    fetch("/api/portal/contratos/")
      .then((r) => r.json())
      .then(setContratos)
      .catch(() => onMessage("Erro ao carregar contratos", true))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleSaved = (data, msg, isError = false) => {
    setShowForm(false);
    onMessage(msg, isError);
    if (!isError && data) load();
  };

  const handleDelete = async (id) => {
    setDeleting(id);
    setConfirmId(null);
    try {
      const resp = await fetch(`/api/portal/contratos/${id}/delete/`, { method: "DELETE" });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error);
      onMessage("Contrato removido com sucesso");
      load();
    } catch (err) {
      onMessage(err.message || "Erro ao remover contrato", true);
    } finally {
      setDeleting(null);
    }
  };

  return (
    <>
      <div className="pa-section">
        <div className="pa-section-header">
          <span className="pa-section-title">Contratos Públicos ({contratos.length})</span>
          <button className="pa-add-btn" onClick={() => setShowForm(true)}>+ Adicionar Contrato</button>
        </div>
        {loading ? (
          <div className="pa-empty">Carregando...</div>
        ) : contratos.length === 0 ? (
          <div className="pa-empty">Nenhum contrato cadastrado.</div>
        ) : (
          <table className="pa-table">
            <thead>
              <tr>
                <th>Nº Contrato</th>
                <th>Órgão</th>
                <th>Fornecedor</th>
                <th>Valor</th>
                <th>Modalidade</th>
                <th>Situação</th>
                <th>Tokenizado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {contratos.map((c) => (
                <tr key={c.id}>
                  <td style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.8125rem", fontWeight: 600, color: "#071D41" }}>{c.numero}</td>
                  <td style={{ color: "#1351B4", fontWeight: 600, fontSize: "0.8125rem" }}>{c.sigla_orgao}</td>
                  <td style={{ maxWidth: 200, fontSize: "0.8125rem" }}>{c.fornecedor}</td>
                  <td style={{ fontFamily: "'DM Mono', monospace", color: "#0A3A8E", fontWeight: 600 }}>{c.valor}</td>
                  <td style={{ fontSize: "0.8125rem", color: "#6B7280" }}>{c.modalidade}</td>
                  <td><span className={`pa-token-badge ${c.situacao === "Vigente" ? "ok" : "nok"}`}>{c.situacao}</span></td>
                  <td>
                    <span className={`pa-token-badge ${c.is_tokenized ? "ok" : "nok"}`}>
                      {c.is_tokenized ? "✓ Sim" : "⚠ Não"}
                    </span>
                  </td>
                  <td>
                    <button
                      className="pa-del-btn"
                      disabled={deleting === c.id}
                      onClick={() => setConfirmId(c.id)}
                    >
                      {deleting === c.id ? "..." : "Remover"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showForm && <ContratoModal onClose={() => setShowForm(false)} onSaved={handleSaved} />}
      {confirmId && (
        <ConfirmModal
          message={`Remover o contrato "${contratos.find((c) => c.id === confirmId)?.numero}"? Esta ação não pode ser desfeita.`}
          onConfirm={() => handleDelete(confirmId)}
          onCancel={() => setConfirmId(null)}
        />
      )}
    </>
  );
}

/* ─────────────────────────────────────────────
   ROOT
───────────────────────────────────────────── */
export default function PortalAdmin() {
  const [tab, setTab]       = useState("servidores");
  const [toast, setToast]   = useState(null);

  const showMessage = (msg, isError = false) => {
    setToast({ msg, type: isError ? "error" : "success" });
  };

  return (
    <>
      <style>{styles}</style>
      <div className="pa-root">
        <div className="pa-govbar" />

        <header className="pa-header">
          <div className="pa-header-left">
            <div className="pa-govbr-badge">
              <div className="pa-govbr-star">★</div>
              <span className="pa-govbr-label">gov</span>
            </div>
            <div className="pa-header-divider" />
            <div>
              <div className="pa-portal-title">Administração — Portal da Transparência</div>
              <div className="pa-portal-sub">Gestão de Servidores e Contratos</div>
            </div>
          </div>
          <a href="/" className="pa-back-btn">← Voltar ao Portal</a>
        </header>

        <main className="pa-main">
          <h1 className="pa-page-title">Painel Administrativo</h1>
          <p className="pa-page-sub">
            Adicione ou remova servidores e contratos. Os dados sensíveis são tokenizados automaticamente pelo microtoken ao salvar.
          </p>

          <div className="pa-tabs">
            <button className={`pa-tab ${tab === "servidores" ? "active" : ""}`} onClick={() => setTab("servidores")}>
              Servidores Públicos
            </button>
            <button className={`pa-tab ${tab === "contratos" ? "active" : ""}`} onClick={() => setTab("contratos")}>
              Contratos Públicos
            </button>
            <a
              href="/arquitetura"
              className="pa-tab"
              style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem", textDecoration: "none" }}
            >
              Arquitetura MicroToken
            </a>
          </div>

          {tab === "servidores" && <ServidoresAdmin onMessage={showMessage} />}
          {tab === "contratos"  && <ContratosAdmin  onMessage={showMessage} />}
        </main>

        {toast && (
          <Toast
            message={toast.msg}
            type={toast.type}
            onDone={() => setToast(null)}
          />
        )}
      </div>
    </>
  );
}
